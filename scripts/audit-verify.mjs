// scripts/audit-verify.mjs — READ-ONLY live-DB verification for the payments/GST audit.
// Runs against the project in .env.local (service-role). Performs NO writes.
//   node --env-file=.env.local scripts/audit-verify.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1] ?? '(unknown)';
console.log(`\n=== Project ref: ${ref} (expect jwrpqiypvystivtqyhro / "Lifespan") ===\n`);

// Head-count a table; returns {exists, count} without pulling rows.
async function tableInfo(name) {
  const { count, error } = await db.from(name).select('*', { count: 'exact', head: true });
  if (error) return { exists: false, count: null, error: `${error.code ?? ''} ${error.message}`.trim() };
  return { exists: true, count: count ?? 0, error: null };
}

// 1.1 invoicing DDL --------------------------------------------------------
const invoices = await tableInfo('invoices');
const counters = await tableInfo('invoice_counters');
const creditNotes = await tableInfo('credit_notes');
console.log('1.1 INVOICING DDL');
console.log('  invoices table      :', JSON.stringify(invoices));
console.log('  invoice_counters    :', JSON.stringify(counters));
console.log('  credit_notes table  :', JSON.stringify(creditNotes));
if (counters.exists) {
  const { data: rows } = await db.from('invoice_counters').select('*').order('series');
  console.log('  invoice_counters rows:', JSON.stringify(rows));
}
// issue_invoice existence — SAFE probe. rpc with p:null: the function short-circuits
// (payment_id null → not found) then hits NOT NULL on insert and RAISES, rolling back
// the whole tx (incl. the counter bump). If the function is MISSING, PostgREST returns
// PGRST202 / 42883. Only probe when the table exists (otherwise pointless).
if (invoices.exists) {
  const { error } = await db.rpc('issue_invoice', { p: null });
  const code = error?.code ?? '';
  const missing = code === 'PGRST202' || code === '42883';
  console.log('  issue_invoice func  :', missing
    ? `MISSING (${code} ${error.message})`
    : `EXISTS (probe rolled back safely; code=${code || 'none'} msg=${error?.message ?? 'no error'})`);
} else {
  console.log('  issue_invoice func  : (skipped — invoices table absent)');
}

// introspect which columns profiles actually has
const { data: profSample } = await db.from('profiles').select('*').limit(1);
const profCols = profSample && profSample[0] ? Object.keys(profSample[0]) : [];
console.log('\n  profiles columns present:', profCols.join(', ') || '(no rows / none)');

// 1.2 profiles.id == user_id ----------------------------------------------
console.log('\n1.2 profiles.id vs user_id');
const { data: profs, error: profErr } = await db.from('profiles').select('id, user_id');
if (profErr) {
  console.log('  ERROR reading profiles:', profErr.message);
} else {
  const total = profs.length;
  const mismatched = profs.filter(p => p.id !== p.user_id);
  console.log(`  total profiles       : ${total}`);
  console.log(`  id != user_id        : ${mismatched.length}`);
  if (mismatched.length) console.log('  sample mismatches    :', JSON.stringify(mismatched.slice(0, 5)));
}

// 1.3 payments vs invoices -------------------------------------------------
console.log('\n1.3 payments vs invoices');
const payAll = await tableInfo('payments');
console.log('  payments total       :', payAll.count);
if (payAll.exists) {
  const { data: pays } = await db.from('payments')
    .select('razorpay_payment_id, status, product, currency, amount, user_id, created_at')
    .limit(10000);
  const byStatus = {}; const byProduct = {};
  for (const p of pays) {
    byStatus[p.status ?? 'null'] = (byStatus[p.status ?? 'null'] || 0) + 1;
    byProduct[p.product ?? 'null'] = (byProduct[p.product ?? 'null'] || 0) + 1;
  }
  console.log('  by status            :', JSON.stringify(byStatus));
  console.log('  by product           :', JSON.stringify(byProduct));
  const notFailed = pays.filter(p => p.status !== 'failed' && p.razorpay_payment_id);
  console.log('  non-failed w/ pay_id :', notFailed.length);

  if (invoices.exists) {
    const { data: invRows } = await db.from('invoices').select('payment_id').limit(10000);
    const invSet = new Set((invRows ?? []).map(r => r.payment_id));
    const missing = notFailed.filter(p => !invSet.has(p.razorpay_payment_id));
    console.log('  invoices count       :', invRows?.length ?? 0);
    console.log('  PAID w/ NO invoice   :', missing.length);
    console.log('  breakdown of missing :', JSON.stringify(
      missing.reduce((a, p) => { const k = `${p.product}/${p.currency}`; a[k] = (a[k]||0)+1; return a; }, {})));
  } else {
    console.log('  invoices count       : N/A (table missing) → ALL non-failed payments have no invoice');
  }
}

// 2.7 legacy subscribers missing place-of-supply --------------------------
console.log('\n2.7 subscribers missing place-of-supply on profile');
const hasBuyerCols = profCols.includes('buyer_state_code') || profCols.includes('buyer_country');
if (!hasBuyerCols) {
  console.log('  buyer_state_code/buyer_country columns: ABSENT on profiles (NOTES-subscription-invoicing not applied)');
  // every subscriber is therefore missing region
}
{
  const sel = 'user_id, premium_status, subscription_status, subscription_id'
    + (profCols.includes('buyer_state_code') ? ', buyer_state_code' : '')
    + (profCols.includes('buyer_country') ? ', buyer_country' : '');
  const { data: subs, error } = await db.from('profiles').select(sel).limit(10000);
  if (error) { console.log('  ERROR:', error.message); }
  else {
    const isSub = p => p.premium_status === true
      || ['active', 'cancelled'].includes(p.subscription_status)
      || !!p.subscription_id;
    const subscribers = subs.filter(isSub);
    const missingRegion = subscribers.filter(p =>
      !(p.buyer_state_code) && !(p.buyer_country));
    console.log('  subscriber-like rows :', subscribers.length);
    console.log('  missing region       :', missingRegion.length);
  }
}

console.log('\n=== done (read-only) ===\n');
