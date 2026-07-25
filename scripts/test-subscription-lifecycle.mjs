#!/usr/bin/env node
/**
 * test-subscription-lifecycle — Subscription webhook routing + HMAC validation.
 *
 * Extends test-webhook-hmac.mjs with subscription event routing tests:
 * - Verifies that subscription.cancelled and subscription.halted events are
 *   routed correctly (200) when HMAC is valid.
 * - DB-state checks (confirm premium_status was cleared in the profiles table)
 *   are marked TODO below — they require an authenticated subscriber row that
 *   is too fragile to seed reliably in this environment.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-subscription-lifecycle.mjs
 *
 * Requires: vercel dev running on :3001 with .env.local loaded.
 */

import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const BASE = 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!WEBHOOK_SECRET) {
  console.error('ERROR: RAZORPAY_WEBHOOK_SECRET not set — run with --env-file=.env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — run with --env-file=.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

let passed = 0;
let failed = 0;

function computeHmac(secret, body) {
  return createHmac('sha256', secret).update(body).digest('hex');
}

function check(name, got, expected, responseBody = '') {
  if (got === expected) {
    console.log(`  ✓  ${name} → ${got}`);
    passed++;
  } else {
    console.error(`  ✗  ${name} → expected ${expected}, got ${got}  |  body: ${responseBody.slice(0, 200)}`);
    failed++;
  }
}

async function postWebhook(payload, sig) {
  const headers = { 'Content-Type': 'application/json' };
  if (sig !== undefined) headers['x-razorpay-signature'] = sig;
  try {
    const res = await fetch(`${BASE}/api/razorpay-webhook`, {
      method: 'POST',
      headers,
      body: payload,
    });
    const text = await res.text();
    return { status: res.status, body: text };
  } catch (e) {
    return { status: null, body: String(e) };
  }
}

// ── HMAC integrity tests ──────────────────────────────────────────────────────

console.log('\n── test-subscription-lifecycle ──\n');
console.log(`  BASE: ${BASE}`);
console.log(`  WEBHOOK_SECRET: ${WEBHOOK_SECRET.slice(0, 6)}…\n`);

const RUN_ID = `lifecycle_${Date.now()}`;

// 1. Valid HMAC on payment.failed → 200 (baseline)
const payloadFailed = JSON.stringify({
  id: `${RUN_ID}_failed`,
  event: 'payment.failed',
  payload: {
    payment: { entity: { email: 'test@example.com', amount: 0 } },
  },
});
const t1 = await postWebhook(payloadFailed, computeHmac(WEBHOOK_SECRET, payloadFailed));
check('valid HMAC (payment.failed) → 200', t1.status, 200, t1.body);

// 2. Forged HMAC → 403
const forged = computeHmac(WEBHOOK_SECRET, payloadFailed).slice(0, -1) + 'z';
const t2 = await postWebhook(payloadFailed, forged);
check('forged HMAC → 403', t2.status, 403, t2.body);

// 3. No signature header → 403
const t3 = await postWebhook(payloadFailed, undefined);
check('no signature header → 403', t3.status, 403, t3.body);

// ── subscription.cancelled routing ───────────────────────────────────────────

const payloadCancelled = JSON.stringify({
  id: `${RUN_ID}_cancelled`,
  event: 'subscription.cancelled',
  payload: {
    subscription: {
      entity: {
        id: 'sub_GAUNTLET_FAKE',
        status: 'cancelled',
        notes: { userId: '00000000-0000-0000-0000-000000000000' },
      },
    },
  },
});
const t4 = await postWebhook(payloadCancelled, computeHmac(WEBHOOK_SECRET, payloadCancelled));
check('subscription.cancelled + valid HMAC → 200', t4.status, 200, t4.body);

// Forged on subscription.cancelled → 403
const t5 = await postWebhook(payloadCancelled, 'badsig');
check('subscription.cancelled + forged HMAC → 403', t5.status, 403, t5.body);

// ── subscription.halted routing ───────────────────────────────────────────────

const payloadHalted = JSON.stringify({
  id: `${RUN_ID}_halted`,
  event: 'subscription.halted',
  payload: {
    subscription: {
      entity: {
        id: 'sub_GAUNTLET_FAKE',
        status: 'halted',
        notes: { userId: '00000000-0000-0000-0000-000000000000' },
      },
    },
  },
});
const t6 = await postWebhook(payloadHalted, computeHmac(WEBHOOK_SECRET, payloadHalted));
check('subscription.halted + valid HMAC → 200', t6.status, 200, t6.body);

// ── GET method guard ──────────────────────────────────────────────────────────

const getRes = await fetch(`${BASE}/api/razorpay-webhook`, { method: 'GET' });
check('GET /api/razorpay-webhook → 405', getRes.status, 405);

// ── DB-state lifecycle assertions (real Supabase, real webhook fire) ──────────
//
// Seeds one throwaway subscriber, fires the two lifecycle webhooks against the
// running endpoint, and asserts the exact profiles-table state each produces.
// Cleaned up (auth user + profile row deleted) in the finally block.

function dbAssert(label, ok, detail) {
  if (ok) { console.log(`  ✓  ${label} — ${detail}`); passed++; }
  else { console.error(`  ✗  ${label} — ${detail}`); failed++; }
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, premium_status, subscription_status, premium_until, subscription_id')
    .eq('user_id', userId).single();
  if (error) throw new Error(`profile query failed: ${error.message}`);
  return data;
}

const TEST_SUB_ID = `sub_LIFECYCLE_${Date.now()}`;
const TEST_EMAIL  = `subs-lifecycle-${Date.now()}@bornclock.com`;
// Active period end = 40 days out (set by subscription.activated seed).
const ACTIVE_END_EPOCH = Math.floor(Date.now() / 1000) + 40 * 24 * 3600;
// Period end = 20 days out. The cancelled webhook derives premium_until from this.
const PERIOD_END_EPOCH = Math.floor(Date.now() / 1000) + 20 * 24 * 3600;
const EXPECTED_PREMIUM_UNTIL = new Date(PERIOD_END_EPOCH * 1000).toISOString();

let testUserId = null;
try {
  console.log('\n── DB-state lifecycle (seeded subscriber) ──\n');

  // Create a throwaway auth user. Its profiles row is auto-created by a DB
  // trigger (profiles.id is a fresh PK, NOT the auth user id).
  const { data: created, error: cErr } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL, email_confirm: true, user_metadata: { first_name: 'Lifecycle' },
  });
  if (cErr) throw new Error(`createUser failed: ${cErr.message}`);
  testUserId = created.user.id;

  // Premium/subscription columns are guarded (guard_premium_columns trigger) —
  // direct client writes are rejected, only the server-side webhook may set them.
  // So seed the active subscriber the sanctioned way: fire subscription.activated.
  const seedProfile = await fetchProfile(testUserId);
  const profilePk = seedProfile.id;
  console.log(`  auth user id:  ${testUserId}`);
  console.log(`  profile PK id: ${profilePk}`);
  console.log(`  BEFORE activation: ${JSON.stringify(seedProfile)}`);

  const activatePayload = JSON.stringify({
    id: `${RUN_ID}_activate_db`,
    event: 'subscription.activated',
    payload: { subscription: { entity: {
      id: TEST_SUB_ID, plan_id: 'plan_lifecycle_test', status: 'active',
      current_end: ACTIVE_END_EPOCH, notes: { userId: profilePk },
    } } },
  });
  const aRes = await postWebhook(activatePayload, computeHmac(WEBHOOK_SECRET, activatePayload));
  check('subscription.activated (seed) → 200', aRes.status, 200, aRes.body);

  const afterActivate = await fetchProfile(testUserId);
  console.log(`  AFTER activation: ${JSON.stringify(afterActivate)}`);
  // seed precondition: activation must actually persist premium_status=true
  dbAssert('activated: premium_status = true (subscriber active)',
    afterActivate.premium_status === true, `actual=${afterActivate.premium_status}`);
  // links the profile to the Razorpay subscription — cancelled/halted resolve by it
  dbAssert('activated: subscription_id persisted',
    afterActivate.subscription_id === TEST_SUB_ID,
    `expected="${TEST_SUB_ID}" actual="${afterActivate.subscription_id}"`);

  // ── subscription.cancelled → voluntary cancel, grace until period end ──────
  const cancelPayload = JSON.stringify({
    id: `${RUN_ID}_cancel_db`,
    event: 'subscription.cancelled',
    payload: { subscription: { entity: {
      id: TEST_SUB_ID, status: 'cancelled', current_end: PERIOD_END_EPOCH,
      notes: { userId: testUserId },
    } } },
  });
  const cRes = await postWebhook(cancelPayload, computeHmac(WEBHOOK_SECRET, cancelPayload));
  check('subscription.cancelled (seeded) → 200', cRes.status, 200, cRes.body);

  const afterCancel = await fetchProfile(testUserId);
  console.log(`  AFTER cancelled: ${JSON.stringify(afterCancel)}`);
  // proves the cancel event was routed to this subscriber and flagged cancelled
  dbAssert('cancelled: subscription_status = "cancelled"',
    afterCancel.subscription_status === 'cancelled',
    `actual="${afterCancel.subscription_status}"`);
  // grace preserved: premium_until must equal period-end, NOT null and NOT now
  // (compare as instants — Postgres returns "…+00:00", JS toISOString "…Z")
  dbAssert('cancelled: premium_until = period-end (grace preserved)',
    afterCancel.premium_until != null &&
      new Date(afterCancel.premium_until).getTime() === PERIOD_END_EPOCH * 1000,
    `expected="${EXPECTED_PREMIUM_UNTIL}" actual="${afterCancel.premium_until}"`);
  // grace preserved: premium_status stays true so access continues until expiry
  dbAssert('cancelled: premium_status still true (access continues)',
    afterCancel.premium_status === true,
    `actual=${afterCancel.premium_status}`);

  // ── subscription.halted → payment failed, immediate revoke ─────────────────
  const haltPayload = JSON.stringify({
    id: `${RUN_ID}_halt_db`,
    event: 'subscription.halted',
    payload: { subscription: { entity: {
      id: TEST_SUB_ID, status: 'halted', notes: { userId: testUserId },
    } } },
  });
  const hRes = await postWebhook(haltPayload, computeHmac(WEBHOOK_SECRET, haltPayload));
  check('subscription.halted (seeded) → 200', hRes.status, 200, hRes.body);

  const afterHalt = await fetchProfile(testUserId);
  console.log(`  AFTER halted: ${JSON.stringify(afterHalt)}`);
  // proves the halt event flipped the subscription state to halted
  dbAssert('halted: subscription_status = "halted"',
    afterHalt.subscription_status === 'halted',
    `actual="${afterHalt.subscription_status}"`);
  // immediate revoke: premium_status=false is the revoke signal useAuth.ts:247
  // gates on (isPremium=false the instant premium_status flips), so this — NOT
  // premium_until — is what cuts a halted user's access. The halted handler
  // intentionally leaves premium_until untouched (it only matters for the
  // 'cancelled' grace path), so we assert the real contract, not an expiry date.
  dbAssert('halted: premium_status = false (access cut immediately)',
    afterHalt.premium_status === false,
    `actual=${afterHalt.premium_status}`);

} catch (err) {
  console.error('  ✗  lifecycle DB test threw:', err.message);
  failed++;
} finally {
  // Cleanup — remove the throwaway subscriber (profile row + auth user)
  if (testUserId) {
    await supabase.from('profiles').delete().eq('user_id', testUserId);
    await supabase.auth.admin.deleteUser(testUserId);
    console.log(`\n  cleaned up test user ${testUserId}`);
  }
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
