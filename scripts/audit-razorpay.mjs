// scripts/audit-razorpay.mjs — READ-ONLY probe of Razorpay + DB for the audit.
// GET only — issues nothing, changes nothing.
//   node --env-file=.env.local scripts/audit-razorpay.mjs
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const auth = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
async function rzp(path) {
  const r = await fetch(`https://api.razorpay.com/v1${path}`, { headers: { Authorization: auth } });
  const j = await r.json();
  return { ok: r.ok, status: r.status, j };
}
const regionOf = notes => notes ? {
  state: notes.buyer_state || null, code: notes.buyer_state_code || null,
  country: notes.buyer_country || null, tax_mode: notes.tax_mode || null,
} : null;

const { data: invs } = await db.from('invoices').select('payment_id');
const invSet = new Set(invs.map(i => i.payment_id));
const { data: pays } = await db.from('payments').select('*').order('created_at');

console.log('\n=== Uninvoiced payments — recoverable place-of-supply from Razorpay notes ===');
for (const p of pays) {
  if (p.status === 'failed' || invSet.has(p.razorpay_payment_id)) continue;
  let notes = null, extra = '';
  if (p.razorpay_order_id) {
    const { ok, j } = await rzp(`/orders/${p.razorpay_order_id}`);
    if (ok) { notes = j.notes; extra = `order.amount=${j.amount} status=${j.status}`; } else extra = `order fetch ${j.error?.description ?? 'err'}`;
  } else if (p.razorpay_subscription_id) {
    const { ok, j } = await rzp(`/subscriptions/${p.razorpay_subscription_id}`);
    if (ok) { notes = j.notes; extra = `sub.status=${j.status} plan=${j.plan_id} charged=${j.paid_count}`; } else extra = `sub fetch ${j.error?.description ?? 'err'}`;
    // also the payment's own notes
    const pr = await rzp(`/payments/${p.razorpay_payment_id}`);
    if (pr.ok && (!notes || !notes.buyer_state_code)) notes = { ...(notes||{}), ...(pr.j.notes||{}) };
  }
  console.log(`\n  ${p.created_at?.slice(0,10)} ${p.product} amt=${p.amount} ${p.currency} pay=${p.razorpay_payment_id}`);
  console.log(`     ${extra}`);
  console.log(`     region:`, JSON.stringify(regionOf(notes)));
  console.log(`     raw notes:`, JSON.stringify(notes));
}

console.log('\n=== Subscription payers: DB profile vs Razorpay subscription status ===');
const subUsers = [...new Set(pays.filter(p => p.product === 'subscription' && p.user_id).map(p => p.user_id))];
for (const uid of subUsers) {
  const { data: prof } = await db.from('profiles').select('email, premium_status, subscription_status, subscription_id, premium_until').eq('user_id', uid).maybeSingle();
  const subIds = [...new Set(pays.filter(p => p.user_id === uid && p.razorpay_subscription_id).map(p => p.razorpay_subscription_id))];
  console.log(`\n  user=${uid}`);
  console.log(`     profile:`, JSON.stringify(prof));
  for (const sid of subIds) {
    const { ok, j } = await rzp(`/subscriptions/${sid}`);
    console.log(`     rzp ${sid}: ${ok ? `status=${j.status} charged=${j.paid_count} current_end=${j.current_end}` : 'fetch err'}`);
  }
}
console.log('\n=== done (read-only) ===\n');
