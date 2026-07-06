/**
 * Test suite for the subscriber credits + report-lock flow.
 * Runs against the local dev API (vercel dev --listen 3001).
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-credits-flow.mjs
 *
 * Prerequisites:
 *   - vercel dev running on port 3001
 *   - A real report slug in the database (set TEST_REPORT_SLUG env var)
 *   - A real user id in the database (set TEST_USER_ID env var)
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - DDL for report_credits / credits_granted_month must be applied in Studio
 */

const BASE = 'http://localhost:3001';
const TEST_SLUG = process.env.TEST_REPORT_SLUG ?? '';
const TEST_USER_ID = process.env.TEST_USER_ID ?? '';

if (!TEST_SLUG) {
  console.error('ERROR: set TEST_REPORT_SLUG env var to a real slug in birthday_reports');
  process.exit(1);
}
if (!TEST_USER_ID) {
  console.error('ERROR: set TEST_USER_ID env var to a real user id in profiles');
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

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
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

// ── Test 1: get-credits — missing userId → 400 ───────────────────────────────

console.log('\n[1] get-credits: missing userId → 400');
{
  const { status, body } = await get('/api/get-credits');
  ok('status 400', status === 400, `got ${status}`);
  ok('error present', !!body?.error);
}

// ── Test 2: get-credits — valid userId → 200 with credits ────────────────────

console.log('\n[2] get-credits: valid userId → 200');
let initialCredits = 0;
{
  const { status, body } = await get(`/api/get-credits?userId=${encodeURIComponent(TEST_USER_ID)}`);
  ok('status 200', status === 200, `got ${status} — ${JSON.stringify(body)}`);
  ok('credits field present', typeof body?.credits === 'number', `got ${JSON.stringify(body)}`);
  ok('subscriptionActive field present', typeof body?.subscriptionActive === 'boolean');
  initialCredits = body?.credits ?? 0;
  console.log(`  credits=${initialCredits} subscriptionActive=${body?.subscriptionActive}`);
}

// ── Test 3: get-credits — unknown userId → 200 with defaults ─────────────────

console.log('\n[3] get-credits: unknown userId → 200 credits=0 (not 404)');
{
  const { status, body } = await get('/api/get-credits?userId=00000000-0000-0000-0000-000000000000');
  ok('status 200', status === 200, `got ${status}`);
  ok('credits = 0', body?.credits === 0, `got ${body?.credits}`);
}

// ── Test 4: redeem-credit — missing fields → 400 ─────────────────────────────

console.log('\n[4] redeem-credit: missing fields → 400');
{
  const { status, body } = await post('/api/redeem-credit', { userId: TEST_USER_ID });
  ok('status 400', status === 400, `got ${status}`);
  ok('error present', !!body?.error);
}

// ── Test 5: redeem-credit — no credits → 402 ─────────────────────────────────
// Only runs if user has 0 credits initially.

if (initialCredits === 0) {
  console.log('\n[5] redeem-credit: 0 credits → 402 (Payment Required)');
  const { status, body } = await post('/api/redeem-credit', {
    userId: TEST_USER_ID,
    reportSlug: TEST_SLUG,
  });
  ok('status 402', status === 402, `got ${status} — ${JSON.stringify(body)}`);
} else {
  console.log(`\n[5] redeem-credit: skip (user has ${initialCredits} credits; test 5 only runs when credits=0)`);
}

// ── Test 6: create-order member pricing ──────────────────────────────────────
// Subscriber vs non-subscriber amounts differ server-side.
// We can't easily assert the exact amount without knowing the user's status,
// so we just verify the response shape and amount is a valid paise value.

console.log('\n[6] create-order: member pricing shape check');
{
  const { status, body } = await post('/api/create-order', {
    product: 'birthday_report',
    report_slug: TEST_SLUG,
    userId: TEST_USER_ID,
    currency: 'INR',
  });
  if (status === 409) {
    console.log('  (skipped — report already purchased; reset is_paid=false to test)');
  } else {
    ok('status 200', status === 200, `got ${status} — ${JSON.stringify(body)}`);
    ok('amount is INR paise', body?.amount === 19900 || body?.amount === 14900,
      `got ${body?.amount} — expected 19900 (non-member) or 14900 (member)`);
    ok('currency INR', body?.currency === 'INR', `got ${body?.currency}`);
    ok('order_id present', body?.order_id?.startsWith('order_'), `got ${body?.order_id}`);
    console.log(`  amount=${body?.amount} (${body?.amount === 14900 ? 'member price ₹149' : 'standard price ₹199'})`);
  }
}

// ── Test 7: redeem-credit — full flow (manual, requires credit grant first) ──

console.log('\n[7] redeem-credit: full unlock flow  [manual — requires credits > 0]');
console.log('    To test manually:');
console.log(`    1. In Supabase Studio: UPDATE public.profiles SET report_credits=1 WHERE id='${TEST_USER_ID}';`);
console.log(`    2. Also ensure is_paid=false: UPDATE public.birthday_reports SET is_paid=false WHERE slug='${TEST_SLUG}';`);
console.log(`    3. Then call: POST /api/redeem-credit {userId, reportSlug}`);
console.log('    Expected: { success: true, creditsRemaining: 0 }');
console.log(`    Verify: SELECT is_paid, expires_at, report_credits FROM birthday_reports JOIN profiles ... WHERE slug='${TEST_SLUG}';`);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\nAutomated: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
