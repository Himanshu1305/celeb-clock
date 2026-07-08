#!/usr/bin/env node
/**
 * HMAC unit test for the Razorpay webhook endpoint.
 * Validates the Web Crypto HMAC path introduced in Phase 1 migration.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-webhook-hmac.mjs
 *
 * Requires: vercel dev running on port 3001 (or wrangler pages dev after migration)
 */

import { createHmac } from 'node:crypto';

const BASE = 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error('ERROR: RAZORPAY_WEBHOOK_SECRET not set — run with --env-file=.env.local');
  process.exit(1);
}

// Use a unique event ID each run so the idempotency insert doesn't short-circuit.
const EVENT_ID = `test_hmac_${Date.now()}`;

const PAYLOAD = JSON.stringify({
  id: EVENT_ID,
  event: 'payment.failed',
  payload: {
    payment: {
      entity: {
        email: 'test@example.com',
        amount: 19900,
        error_description: 'HMAC unit test — not a real payment',
      },
    },
  },
});

function computeHmac(secret, body) {
  return createHmac('sha256', secret).update(body).digest('hex');
}

async function post(body, signatureHeaderValue) {
  const headers = { 'Content-Type': 'application/json' };
  if (signatureHeaderValue !== undefined) {
    headers['x-razorpay-signature'] = signatureHeaderValue;
  }
  try {
    const res = await fetch(`${BASE}/api/razorpay-webhook`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    return { status: res.status, body: text };
  } catch (e) {
    return { status: null, body: String(e) };
  }
}

let passed = 0;
let failed = 0;

function check(name, got, expected, responseBody = '') {
  if (got === expected) {
    console.log(`  ✓  ${name} → ${got}`);
    passed++;
  } else {
    console.error(`  ✗  ${name} → expected ${expected}, got ${got}  |  body: ${responseBody}`);
    failed++;
  }
}

console.log('\n── test-webhook-hmac ──\n');
console.log(`  WEBHOOK_SECRET: ${WEBHOOK_SECRET.slice(0, 6)}…  EVENT_ID: ${EVENT_ID}\n`);

const validSig = computeHmac(WEBHOOK_SECRET, PAYLOAD);

// 1. Valid HMAC signature → 200
const t1 = await post(PAYLOAD, validSig);
check('valid HMAC → 200', t1.status, 200, t1.body);

// 2. Forged signature (last char flipped) → 403
const forged = validSig.slice(0, -1) + (validSig.endsWith('a') ? 'b' : 'a');
const t2 = await post(PAYLOAD, forged);
check('forged HMAC → 403', t2.status, 403, t2.body);

// 3. Empty signature string → 403, not crash
const t3 = await post(PAYLOAD, '');
check('empty signature → 403', t3.status, 403, t3.body);

// 4. Odd-length hex (malformed) → 403, not crash
const t4 = await post(PAYLOAD, 'abc');
check('odd-length hex → 403', t4.status, 403, t4.body);

// 5. Missing signature header entirely → 403, not crash
const t5 = await post(PAYLOAD, undefined);
check('no signature header → 403', t5.status, 403, t5.body);

// 6. Valid sig but body tampered after signing → 403
const tamperedBody = PAYLOAD.replace('payment.failed', 'payment.captured');
const t6 = await post(tamperedBody, validSig);
check('tampered body → 403', t6.status, 403, t6.body);

// 7. Wrong method → 405
const getRes = await fetch(`${BASE}/api/razorpay-webhook`, { method: 'GET' });
check('GET method → 405', getRes.status, 405);

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
