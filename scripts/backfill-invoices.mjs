// scripts/backfill-invoices.mjs
// Issue GST invoices for past REAL payments that have none.
//
//   node --env-file=.env.local scripts/backfill-invoices.mjs           # dry-run (default)
//   node --env-file=.env.local scripts/backfill-invoices.mjs --apply   # actually issue
//
// SAFETY / CORRECTNESS
//  - Idempotent: skips payment_ids that already have an invoice, and issue_invoice()
//    itself dedupes on payment_id — running twice issues at most one invoice/payment.
//  - Uses the atomic counter RPC issue_invoice() — never reimplements numbering.
//  - VERIFIES each payment exists in the LIVE Razorpay account before issuing. The
//    shared Supabase project also holds TEST-mode transactions written by staging
//    (rzp_test_ keys); those are invisible to the live account and MUST NOT get a
//    real GST invoice. A payment the live account doesn't recognise is SKIPPED.
//  - Reconstructs place-of-supply from the authoritative Razorpay notes (order for
//    one-time reports, subscription/payment for subscriptions). If no region can be
//    determined, it SKIPS and logs rather than guessing a tax split (same discipline
//    as api/invoice-sweep.ts).
import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const rzpAuth = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
async function rzpGet(path) {
  const r = await fetch(`https://api.razorpay.com/v1${path}`, { headers: { Authorization: rzpAuth } });
  return { ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) };
}

// Identical GST-inclusive back-calc to verify-payment.ts / invoice-sweep.ts.
function computeTax(grossAmount, taxMode) {
  const taxable = Math.round((grossAmount / 1.18) * 100) / 100;
  const totalTax = Math.round((grossAmount - taxable) * 100) / 100;
  let cgst = 0, sgst = 0, igst = 0;
  if (taxMode === 'CGST_SGST') { cgst = Math.round(taxable * 0.09 * 100) / 100; sgst = Math.round((totalTax - cgst) * 100) / 100; }
  else if (taxMode === 'IGST') { igst = totalTax; }
  return { taxable, cgst, sgst, igst };
}

console.log(`\n=== Invoice backfill — ${APPLY ? 'APPLY (issuing real invoices)' : 'DRY-RUN (no writes)'} ===`);
console.log(`Razorpay key: ${(keyId || '').split('_').slice(0, 2).join('_')}\n`);

const { data: pays } = await db.from('payments')
  .select('razorpay_payment_id, razorpay_order_id, razorpay_subscription_id, user_id, product, currency, amount, status, created_at')
  .in('product', ['subscription', 'birthday_report'])
  .order('created_at');
const { data: invRows } = await db.from('invoices').select('payment_id');
const invoiced = new Set((invRows ?? []).map(r => r.payment_id));

const pending = (pays ?? []).filter(p => p.status !== 'failed' && p.razorpay_payment_id && !invoiced.has(p.razorpay_payment_id));

const result = { candidates: pending.length, issued: 0, skipped: [], errors: [] };

for (const p of pending) {
  const pid = p.razorpay_payment_id;
  try {
    // 1. VERIFY the payment exists in the LIVE Razorpay account (test-data guard).
    const pay = await rzpGet(`/payments/${pid}`);
    if (!pay.ok) {
      result.skipped.push(`${pid}: not found in live Razorpay account (${pay.j.error?.description ?? pay.status}) — TEST/foreign, not invoiced`);
      continue;
    }
    const grossAmount = (pay.j.amount ?? p.amount ?? 0) / 100;
    const currency = (pay.j.currency ?? p.currency) === 'USD' ? 'USD' : 'INR';
    if (!grossAmount || grossAmount <= 0) { result.skipped.push(`${pid}: non-positive amount`); continue; }

    // 2. Authoritative place-of-supply from notes: order (report) or sub/payment.
    let notes = pay.j.notes ?? {};
    if (p.product === 'birthday_report' && p.razorpay_order_id) {
      const ord = await rzpGet(`/orders/${p.razorpay_order_id}`);
      if (ord.ok) notes = { ...ord.j.notes, ...notes };
    } else if (p.product === 'subscription' && p.razorpay_subscription_id) {
      const sub = await rzpGet(`/subscriptions/${p.razorpay_subscription_id}`);
      if (sub.ok) notes = { ...sub.j.notes, ...notes };
    }
    const buyerState = notes.buyer_state || null;
    const buyerStateCode = notes.buyer_state_code || null;
    const buyerCountry = notes.buyer_country || null;

    // 3. Tax mode — same derivation as verify-payment; never mislabel INR as EXPORT.
    const taxMode = notes.tax_mode
      || (buyerStateCode === '36' ? 'CGST_SGST'
        : buyerStateCode ? 'IGST'
        : (currency === 'USD' ? 'EXPORT' : null));   // INR with no state → unknown split
    if (!taxMode) {
      result.skipped.push(`${pid}: no determinable place-of-supply (no notes.buyer_state_code/tax_mode) — needs manual region, not guessed`);
      continue;
    }

    const { taxable, cgst, sgst, igst } = computeTax(grossAmount, taxMode);
    const fxRate = taxMode === 'EXPORT' ? 87.20 : null;
    const fxRateDate = fxRate ? new Date().toISOString().slice(0, 10) : null;
    const fxRateSource = fxRate ? 'Fixed fallback rate (₹87.20; no live FX feed yet)' : null;

    // 4. Buyer identity — auth is authoritative.
    let buyerEmail = pay.j.email ?? '';
    let buyerName = 'BornClock Customer';
    if (p.user_id) {
      const { data: u } = await db.auth.admin.getUserById(p.user_id);
      buyerEmail = u?.user?.email ?? buyerEmail;
      buyerName = u?.user?.user_metadata?.full_name || u?.user?.user_metadata?.first_name || buyerName;
    }

    const invBuyerCountry = buyerCountry || 'India';
    const payload = {
      order_id: p.razorpay_order_id ?? p.razorpay_subscription_id ?? pid,
      payment_id: pid,
      user_id: p.user_id ?? null,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_gstin: null,
      buyer_country: invBuyerCountry,
      buyer_state: buyerState,
      buyer_state_code: buyerStateCode,
      place_of_supply: buyerState ? `${buyerState} (${buyerStateCode})` : invBuyerCountry,
      tax_mode: taxMode,
      currency,
      fx_rate: fxRate,
      fx_rate_date: fxRateDate,
      fx_rate_source: fxRateSource,
      gross_amount: grossAmount,
      taxable_value: taxMode === 'EXPORT' ? grossAmount : taxable,
      cgst, sgst, igst,
      line_items: [{
        desc: p.product === 'birthday_report' ? 'BornClock — Birthday Blueprint Report' : 'BornClock Premium — Subscription',
        note: 'Backfilled GST invoice for a prior payment. Delivered electronically.',
        qty: 1, gross: grossAmount,
      }],
    };

    if (!APPLY) {
      console.log(`WOULD ISSUE  ${pid}  ${p.product}  ${currency} ${grossAmount}  ${taxMode}  → cgst=${cgst} sgst=${sgst} igst=${igst}`);
      result.issued++;   // count of would-issue in dry-run
      continue;
    }
    const { data: row, error } = await db.rpc('issue_invoice', { p: payload });
    if (error) { result.errors.push(`${pid}: issue_invoice ${error.message}`); continue; }
    console.log(`ISSUED       ${row.invoice_no}  ${pid}  ${currency} ${grossAmount}  ${taxMode}`);
    result.issued++;
  } catch (e) {
    result.errors.push(`${pid}: ${e?.message ?? e}`);
  }
}

console.log(`\n--- summary (${APPLY ? 'APPLY' : 'DRY-RUN'}) ---`);
console.log(`candidates (uninvoiced non-failed): ${result.candidates}`);
console.log(`${APPLY ? 'issued' : 'would issue'}: ${result.issued}`);
console.log(`skipped: ${result.skipped.length}`);
for (const s of result.skipped) console.log('   skip:', s);
if (result.errors.length) { console.log(`errors: ${result.errors.length}`); for (const e of result.errors) console.log('   err:', e); }
console.log('');
