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
import { generateInvoiceHTML } from '../src/lib/invoice-generator.js';
import { sendInvoiceEmail } from './_invoice-email.js';

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

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const db = serviceClient();
  const result: Record<string, unknown> = { invoiced: 0, skipped: [] as string[], errors: [] as string[] };
  const skipped = result.skipped as string[];
  const errors = result.errors as string[];

  // 1. captured subscription payments (webhook + verify both write here).
  const { data: payments, error: payErr } = await db
    .from('payments')
    .select('razorpay_payment_id, razorpay_subscription_id, razorpay_order_id, user_id, amount, currency, product, status, created_at')
    .eq('product', 'subscription')
    .order('created_at', { ascending: true })
    .limit(1000);
  if (payErr) {
    return json({ error: 'Failed to read payments', detail: payErr.message }, 500);
  }

  // 2. already-invoiced payment_ids → Set for O(1) anti-join.
  const { data: invoiced, error: invErr } = await db
    .from('invoices')
    .select('payment_id')
    .limit(10000);
  if (invErr) {
    return json({ error: 'Failed to read invoices', detail: invErr.message }, 500);
  }
  const invoicedIds = new Set((invoiced ?? []).map((r: any) => r.payment_id));

  const pending = (payments ?? [])
    .filter((p: any) => p.status !== 'failed')
    .filter((p: any) => p.razorpay_payment_id && !invoicedIds.has(p.razorpay_payment_id))
    .slice(0, MAX_PER_RUN);

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
        continue;
      }
      const invBuyerCountry = buyerCountry || 'India';

      // Same derivation as verify-payment: never mislabel an INR domestic charge
      // as EXPORT — only USD-with-no-state defaults to EXPORT.
      const taxMode: 'CGST_SGST' | 'IGST' | 'EXPORT' =
        buyerStateCode === '36' ? 'CGST_SGST'
        : buyerStateCode ? 'IGST'
        : (paymentCurrency === 'USD' ? 'EXPORT' : 'IGST');

      // GST-inclusive back-calc, sgst PLUGGED (identical to verify-payment).
      const taxable = Math.round((grossAmount / 1.18) * 100) / 100;
      const totalTax = Math.round((grossAmount - taxable) * 100) / 100;
      let cgst = 0, sgst = 0, igst = 0;
      if (taxMode === 'CGST_SGST') {
        cgst = Math.round(taxable * 0.09 * 100) / 100;
        sgst = Math.round((totalTax - cgst) * 100) / 100;
      } else if (taxMode === 'IGST') {
        igst = totalTax;
      }
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

  return json({ ranAt: new Date().toISOString(), pending: pending.length, ...result });
}

export const POST = handler;
export const GET = handler;
