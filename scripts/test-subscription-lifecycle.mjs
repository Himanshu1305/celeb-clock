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

const BASE = 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error('ERROR: RAZORPAY_WEBHOOK_SECRET not set — run with --env-file=.env.local');
  process.exit(1);
}

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

// ── DB-state checks (TODO) ────────────────────────────────────────────────────
//
// TODO: After subscription.cancelled/halted webhook fires with a real subscriber's
// userId in the notes field, verify that profiles.premium_status = false in Supabase.
// Requires: an authenticated subscriber row created in a test environment.
// Skipped here because seeding a real subscription row reliably is too fragile
// for a CI-safe gauntlet run. Implement with a dedicated seeded test user once
// a staging DB is available.
//
// Example assertion (pseudocode):
//   const { data } = await supabase
//     .from('profiles')
//     .select('premium_status')
//     .eq('id', TEST_USER_ID)
//     .single();
//   assert(data.premium_status === false);

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.log('  TODO: Add DB-state verification once staging seeding is available.\n');
  process.exit(1);
}
