// scripts/audit-detail.mjs — READ-ONLY deep detail for the audit. No writes.
//   node --env-file=.env.local scripts/audit-detail.mjs
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const mask = s => !s ? s : (typeof s === 'string' && s.length > 10 ? s.slice(0, 8) + '…' + s.slice(-4) : s);

console.log('\n--- Razorpay key mode (from env) ---');
console.log('  VITE_RAZORPAY_KEY_ID prefix:', (process.env.VITE_RAZORPAY_KEY_ID || '').split('_').slice(0,2).join('_') || '(unset)');
console.log('  RAZORPAY_KEY_ID prefix     :', (process.env.RAZORPAY_KEY_ID || '').split('_').slice(0,2).join('_') || '(unset)');

console.log('\n--- profiles (8) ---');
const { data: profs } = await db.from('profiles')
  .select('id, user_id, email, premium_status, subscription_status, subscription_id, premium_until, buyer_state, buyer_state_code, buyer_country, created_at')
  .order('created_at');
for (const p of profs) {
  console.log(`  ${mask(p.email)?.padEnd(22)} prem=${p.premium_status} sub=${p.subscription_status ?? '-'} subId=${mask(p.subscription_id) ?? '-'} region=${p.buyer_state_code ?? '-'}/${p.buyer_country ?? '-'} id==uid:${p.id===p.user_id}`);
}

console.log('\n--- payments (all) ---');
const { data: pays } = await db.from('payments')
  .select('razorpay_payment_id, razorpay_order_id, razorpay_subscription_id, user_id, product, currency, amount, status, report_slug, created_at')
  .order('created_at');
for (const p of pays) {
  console.log(`  ${p.created_at?.slice(0,10)} ${p.product?.padEnd(15)} ${String(p.amount).padStart(6)} ${p.currency} ${mask(p.razorpay_payment_id)} ord=${mask(p.razorpay_order_id)??'-'} sub=${mask(p.razorpay_subscription_id)??'-'} user=${mask(p.user_id)??'-'}`);
}

console.log('\n--- invoices (all) ---');
const { data: invs } = await db.from('invoices')
  .select('invoice_no, payment_id, tax_mode, currency, gross_amount, taxable_value, cgst, sgst, igst, buyer_country, buyer_state_code, emailed_at, created_at')
  .order('created_at');
for (const i of invs) {
  console.log(`  ${i.invoice_no} pay=${mask(i.payment_id)} ${i.tax_mode} ${i.currency} gross=${i.gross_amount} taxable=${i.taxable_value} c/s/i=${i.cgst}/${i.sgst}/${i.igst} region=${i.buyer_state_code??'-'}/${i.buyer_country} created=${i.created_at?.slice(0,10)}`);
}

// which payments are uninvoiced
const invSet = new Set(invs.map(i => i.payment_id));
console.log('\n--- uninvoiced non-failed payments ---');
for (const p of pays.filter(p => p.status !== 'failed' && !invSet.has(p.razorpay_payment_id))) {
  console.log(`  ${p.created_at?.slice(0,10)} ${p.product} ${p.amount} ${p.currency} pay=${mask(p.razorpay_payment_id)}`);
}
console.log('\n=== done ===\n');
