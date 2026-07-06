/**
 * Test suite for the Birthday Report order payment flow.
 * Runs against the local dev API (vercel dev --listen 3001).
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-order-flow.mjs
 *
 * Prerequisites:
 *   - vercel dev running on port 3001
 *   - A real report slug in the database (set TEST_REPORT_SLUG env var or edit below)
 *   - VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import crypto from 'crypto';

const BASE = 'http://localhost:3001';
const TEST_SLUG = process.env.TEST_REPORT_SLUG ?? '';
const TEST_USER_ID = process.env.TEST_USER_ID ?? 'test-user-uuid';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';

if (!TEST_SLUG) {
  console.error('ERROR: set TEST_REPORT_SLUG env var to a real slug in your birthday_reports table');
  process.exit(1);
}
if (!KEY_SECRET) {
  console.error('ERROR: RAZORPAY_KEY_SECRET not set');
  process.exit(1);
}

let passed = 0;
let failed = 0;

function ok(name, cond, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

// ── Test 1: bogus product → 400 ─────────────────────────────────────────────

console.log('\n[1] create-order: bogus product → 400');
{
  const { status, body } = await post('/api/create-order', {
    product: 'fake_product',
    report_slug: TEST_SLUG,
    userId: TEST_USER_ID,
    currency: 'INR',
  });
  ok('status 400', status === 400, `got ${status}`);
  ok('error message present', !!body?.error);
}

// ── Test 2: bogus currency → 400 ────────────────────────────────────────────

console.log('\n[2] create-order: bogus currency → 400');
{
  const { status, body } = await post('/api/create-order', {
    product: 'birthday_report',
    report_slug: TEST_SLUG,
    userId: TEST_USER_ID,
    currency: 'EUR',
  });
  ok('status 400', status === 400, `got ${status}`);
  ok('error message present', !!body?.error);
}

// ── Test 3: missing report_slug → 400 ───────────────────────────────────────

console.log('\n[3] create-order: missing report_slug → 400');
{
  const { status, body } = await post('/api/create-order', {
    product: 'birthday_report',
    userId: TEST_USER_ID,
    currency: 'INR',
  });
  ok('status 400', status === 400, `got ${status}`);
  ok('error message present', !!body?.error);
}

// ── Test 4: valid product on real slug → creates order ──────────────────────

console.log('\n[4] create-order: valid request → Razorpay order created');
let orderId = null;
{
  const { status, body } = await post('/api/create-order', {
    product: 'birthday_report',
    report_slug: TEST_SLUG,
    userId: TEST_USER_ID,
    currency: 'INR',
  });
  ok('status 200', status === 200, `got ${status} — ${JSON.stringify(body)}`);
  ok('order_id present', body?.order_id?.startsWith('order_'), `got ${body?.order_id}`);
  ok('amount = 19900', body?.amount === 19900, `got ${body?.amount}`);
  ok('currency = INR', body?.currency === 'INR', `got ${body?.currency}`);
  ok('report_slug echoed', body?.report_slug === TEST_SLUG);
  orderId = body?.order_id ?? null;
}

// ── Test 5: already-paid slug → 409 (skip if test 4 failed) ─────────────────
// This test only runs after manually setting is_paid=true in Studio, OR after
// a successful verify-payment call below. For now it's a manual step reminder.
console.log('\n[5] create-order: already-paid slug → 409  [manual — set is_paid=true in Studio first]');
console.log('    Run in Supabase Studio SQL editor:');
console.log(`      UPDATE public.birthday_reports SET is_paid = true WHERE slug = '${TEST_SLUG}';`);
console.log('    Then re-run this script; test 4 should return 409 and this line confirms it.');

// ── Test 6: forged signature → 403 ──────────────────────────────────────────

console.log('\n[6] verify-payment: forged signature → 403');
if (orderId) {
  const fakePaymentId = 'pay_FORGED000000';
  const { status } = await post('/api/verify-payment', {
    razorpay_payment_id: fakePaymentId,
    razorpay_order_id: orderId,
    razorpay_signature: 'badhash',
    user_id: TEST_USER_ID,
    product: 'birthday_report',
    report_slug: TEST_SLUG,
    amount: 19900,
    currency: 'INR',
  });
  ok('status 403', status === 403, `got ${status}`);
} else {
  console.log('  (skipped — order_id not available from test 4)');
}

// ── Test 7: correct signature → verify-payment flow ────────────────────────
// Can only run with a real payment_id from a completed Razorpay checkout.
// The HMAC is HMAC-SHA256(order_id|payment_id, key_secret).

console.log('\n[7] verify-payment: correct HMAC  [requires a real payment_id from checkout]');
console.log('    After completing a test-mode checkout, run:');
if (orderId) {
  console.log(`    export PAYMENT_ID=pay_XXXX`);
  console.log(`    export ORDER_ID=${orderId}`);
  console.log(`    SIG=$(node -e "const c=require('crypto'); console.log(c.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(process.env.ORDER_ID+'|'+process.env.PAYMENT_ID).digest('hex'))")`);
  console.log(`    curl -s -X POST http://localhost:3001/api/verify-payment \\`);
  console.log(`      -H 'Content-Type: application/json' \\`);
  console.log(`      -d '{"razorpay_payment_id":"'$PAYMENT_ID'","razorpay_order_id":"'$ORDER_ID'","razorpay_signature":"'$SIG'","user_id":"${TEST_USER_ID}","product":"birthday_report","report_slug":"${TEST_SLUG}","amount":19900,"currency":"INR"}'`);
  console.log('    Expected: {"success":true,"product":"birthday_report"}');
  console.log(`    Then verify: SELECT is_paid, expires_at FROM birthday_reports WHERE slug = '${TEST_SLUG}';`);
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\nAutomated: ${passed} passed, ${failed} failed`);
console.log('Manual tests remain for tests 5 and 7 above.');
if (failed > 0) process.exit(1);
