// api/invoice-sweep.ts — DAILY RENEWAL INVOICE SWEEP.
//
// Renewal (recurring) subscription charges arrive via api/razorpay-webhook.ts,
// which is FROZEN — no invoicing can be added there. The webhook records each
// charge in `payments` (product='subscription', razorpay_payment_id, amount,
// currency, razorpay_subscription_id). This sweep finds subscription payments
// with NO matching row in `invoices` (anti-join on payment_id) and issues a GST
// invoice for each, using the buyer's place-of-supply persisted on the profile
// by verify-payment on the FIRST payment (NOTES-subscription-invoicing.sql).
//
// Idempotent by construction:
//   1. we skip payment_ids that already have an invoice, and
//   2. issue_invoice() itself dedupes on payment_id.
// So the first payment (already invoiced inline by verify-payment) is never
// double-invoiced, and a re-run of the sweep is a no-op.
//
// Wired into the daily ops cron (functions/_worker.ts scheduled(), '10 6 * * *').

import { createClient } from '@supabase/supabase-js';
import { generateInvoiceHTML, splitGstInclusive } from '../src/lib/invoice-generator.js';
import { sendInvoiceEmail } from './_invoice-email.js';
import { sendOpsAlert } from './_ops.js';
import { isCronAuthorized, unauthorized } from './_cronAuth.js';

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

const MAX_PER_RUN = 200; // safety cap; the tail rolls into the next daily run
export const PAGE_SIZE = 1000;  // PostgREST's default max rows per request

/**
 * Returns up to `limit` subscription payments (oldest first) that have no
 * invoice yet, paging through the whole payments table in PAGE_SIZE chunks.
 */
export async function findUninvoicedPayments(db: any, limit: number): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; out.length < limit; from += PAGE_SIZE) {
    const { data: page, error: payErr } = await db
      .from('payments')
      .select('razorpay_payment_id, razorpay_subscription_id, razorpay_order_id, user_id, amount, currency, product, status, created_at')
      .eq('product', 'subscription')
      .order('created_at', { ascending: true })
      .order('razorpay_payment_id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (payErr) throw payErr;
    const rows = (page ?? []).filter((p: any) => p.status !== 'failed' && p.razorpay_payment_id);
    if (rows.length) {
      const ids = rows.map((p: any) => p.razorpay_payment_id);
      const { data: inv, error: invErr } = await db
        .from('invoices')
        .select('payment_id')
        .in('payment_id', ids);
      if (invErr) throw invErr;
      const done = new Set((inv ?? []).map((r: any) => r.payment_id));
      for (const p of rows) {
        if (!done.has(p.razorpay_payment_id)) out.push(p);
        if (out.length >= limit) break;
      }
    }
    if (!page || page.length < PAGE_SIZE) break; // last page
  }
  return out;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!isCronAuthorized(request)) return unauthorized();

  const db = serviceClient();
  const result: Record<string, unknown> = { invoiced: 0, skipped: [] as string[], errors: [] as string[] };
  const skipped = result.skipped as string[];
  const errors = result.errors as string[];
  // Renewals we could not invoice because the payer has no GST place-of-supply on
  // file. Collected so an ops alert can surface the gap instead of it staying silent.
  const missingState: { user_id: string; email: string }[] = [];

  // 1+2. Page through ALL captured subscription payments (oldest first) and
  // anti-join each page against `invoices` by payment_id. The old version read
  // only the first 1,000 payments (and the first 10,000 invoices), so once the
  // table grew past that every newer renewal was silently never invoiced.
  let pending: any[];
  try {
    pending = await findUninvoicedPayments(db, MAX_PER_RUN);
  } catch (e: any) {
    return json({ error: 'Failed to read payments/invoices', detail: e?.message ?? String(e) }, 500);
  }
  const invoicedIds = new Set<string>();

  for (const p of pending as any[]) {
    const paymentId: string = p.razorpay_payment_id;
    try {
      // De-identified after account deletion → no profile/region to invoice with.
      if (!p.user_id) { skipped.push(`${paymentId}: no user_id (de-identified)`); continue; }

      const grossAmount = (p.amount ?? 0) / 100; // paise/cents → major units
      if (!grossAmount || grossAmount <= 0) { skipped.push(`${paymentId}: non-positive amount`); continue; }

      // Place-of-supply persisted on the FIRST payment (auth link = user_id).
      const { data: prof } = await db
        .from('profiles')
        .select('buyer_state, buyer_state_code, buyer_country, email, name, first_name')
        .eq('user_id', p.user_id)
        .single();

      const buyerState     = prof?.buyer_state || null;
      const buyerStateCode = prof?.buyer_state_code || null;
      const buyerCountry   = prof?.buyer_country || null;
      const paymentCurrency = p.currency === 'USD' ? 'USD' : 'INR';

      // Do NOT improvise. Renewals of subscriptions created after the F1b fix
      // always have a persisted place-of-supply (verify-payment wrote it on the
      // first payment). If there is NO persisted region (legacy payment, or the
      // DDL is not applied yet), we cannot determine the correct tax treatment —
      // SKIP and log rather than issue a wrong-split / wrong-country invoice.
      const hasRegion = !!(buyerStateCode || buyerCountry);
      if (!hasRegion) {
        skipped.push(`${paymentId}: no persisted place-of-supply (apply NOTES-subscription-invoicing.sql; invoices once a payment persists region)`);
        missingState.push({ user_id: p.user_id, email: prof?.email ?? '(unknown)' });
        continue;
      }
      const invBuyerCountry = buyerCountry || 'India';

      // Same derivation as verify-payment: never mislabel an INR domestic charge
      // as EXPORT — only USD-with-no-state defaults to EXPORT.
      const taxMode: 'CGST_SGST' | 'IGST' | 'EXPORT' =
        buyerStateCode === '36' ? 'CGST_SGST'
        : buyerStateCode ? 'IGST'
        : (paymentCurrency === 'USD' ? 'EXPORT' : 'IGST');
      // GST-inclusive split — shared rule (equal CGST/SGST heads that foot to the total).
      const { taxable, cgst, sgst, igst } = splitGstInclusive(grossAmount, taxMode);
      const fxRate = taxMode === 'EXPORT' ? 87.20 : null;
      // FX provenance — see verify-payment.ts / BORNCLOCK_AUDIT_FIXES.md open item.
      const fxRateDate = fxRate ? new Date().toISOString().slice(0, 10) : null;
      const fxRateSource = fxRate ? 'Fixed fallback rate (₹87.20; no live FX feed yet)' : null;

      // Buyer identity — auth is authoritative; profile is the fallback.
      const { data: buyerData } = await db.auth.admin.getUserById(p.user_id);
      const buyerEmail = buyerData?.user?.email ?? prof?.email ?? '';
      const buyerName = buyerData?.user?.user_metadata?.full_name
        || buyerData?.user?.user_metadata?.first_name
        || prof?.first_name || prof?.name || 'BornClock Customer';

      const { data: invoiceRow, error: issueErr } = await db.rpc('issue_invoice', {
        p: {
          order_id:         p.razorpay_order_id ?? p.razorpay_subscription_id ?? paymentId,
          payment_id:       paymentId,
          user_id:          p.user_id,
          buyer_name:       buyerName,
          buyer_email:      buyerEmail,
          buyer_gstin:      null,
          buyer_country:    invBuyerCountry,
          buyer_state:      buyerState,
          buyer_state_code: buyerStateCode,
          place_of_supply:  buyerState ? `${buyerState} (${buyerStateCode})` : invBuyerCountry,
          tax_mode:         taxMode,
          currency:         paymentCurrency,
          fx_rate:          fxRate,
          fx_rate_date:     fxRateDate,
          fx_rate_source:   fxRateSource,
          gross_amount:     grossAmount,
          taxable_value:    taxMode === 'EXPORT' ? grossAmount : taxable,
          cgst, sgst, igst,
          line_items: [{
            desc: 'BornClock Premium — Subscription renewal',
            note: 'Recurring premium subscription charge. Delivered electronically.',
            qty: 1, gross: grossAmount,
          }],
        },
      });
      if (issueErr) { errors.push(`${paymentId}: issue_invoice ${issueErr.message}`); continue; }

      if (invoiceRow) {
        const row = invoiceRow as any;
        // Only email if this run actually issued it (guard against re-send on a
        // dedup hit where verify-payment/a prior run already mailed it).
        if (!invoicedIds.has(paymentId)) {
          const html = generateInvoiceHTML(row);
          await sendInvoiceEmail(row.buyer_email, row.invoice_no, html);
        }
        invoicedIds.add(paymentId);
        result.invoiced = (result.invoiced as number) + 1;
      }
    } catch (e: any) {
      errors.push(`${paymentId}: ${e?.message ?? e}`);
    }
  }

  // Surface the invoicing gap: if any renewals were skipped for a missing
  // place-of-supply, alert ops (warning) with each affected user_id + email so it
  // can be chased (the user is prompted for their state by MissingStateModal on
  // next login). Best-effort — never fail the sweep on an alert error.
  if (missingState.length > 0) {
    const list = missingState.map((m) => `• ${m.user_id} — ${m.email}`).join('\n');
    try {
      await sendOpsAlert({
        severity: 'warning',
        title: `Invoice sweep: ${missingState.length} renewals skipped — missing state`,
        body: `These premium subscribers renewed but have no GST place-of-supply on file, so no tax `
          + `invoice could be issued. They will be prompted for their state on next login `
          + `(MissingStateModal). Affected:\n${list}`,
      });
    } catch (e) {
      console.error('[invoice-sweep] ops alert failed (non-fatal)', e);
    }
  }

  return json({ ranAt: new Date().toISOString(), pending: pending.length, missingState: missingState.length, ...result });
}

export const POST = handler;
export const GET = handler;
