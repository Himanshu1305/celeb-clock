/**
 * 05-payment-endpoints — API endpoint smoke tests via Playwright request context.
 * Tests against localhost:3001 (Vercel dev) directly.
 * Does NOT perform real payments — tests input validation, auth guards, and
 * schema correctness only.
 *
 * Requires: vercel dev running on :3001 with .env.local loaded.
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';
const FAKE_SLUG = 'gauntlet-nonexistent-slug-xyz';
const FAKE_USER = '00000000-0000-0000-0000-000000000000';

// ── create-order ──────────────────────────────────────────────────────────────

test('create-order: bogus product → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/create-order`, {
    data: { product: 'not_a_product', report_slug: FAKE_SLUG, userId: FAKE_USER, currency: 'INR' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('create-order: invalid currency → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/create-order`, {
    data: { product: 'birthday_report', report_slug: FAKE_SLUG, userId: FAKE_USER, currency: 'EUR' },
  });
  expect(res.status()).toBe(400);
});

test('create-order: missing report_slug → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/create-order`, {
    data: { product: 'birthday_report', userId: FAKE_USER, currency: 'INR' },
  });
  expect(res.status()).toBe(400);
});

test('create-order: nonexistent slug → 404', async ({ request }) => {
  const res = await request.post(`${API}/api/create-order`, {
    data: { product: 'birthday_report', report_slug: FAKE_SLUG, userId: FAKE_USER, currency: 'INR' },
  });
  expect(res.status()).toBe(404);
});

// ── verify-payment ────────────────────────────────────────────────────────────

test('verify-payment: forged signature → 403', async ({ request }) => {
  const res = await request.post(`${API}/api/verify-payment`, {
    data: {
      razorpay_payment_id: 'pay_FORGED000000',
      razorpay_order_id: 'order_FAKE000000',
      razorpay_signature: 'badhash',
      user_id: FAKE_USER,
      product: 'birthday_report',
      report_slug: FAKE_SLUG,
      amount: 19900,
      currency: 'INR',
    },
  });
  expect(res.status()).toBe(403);
  const body = await res.json();
  expect(body.error).toContain('signature');
});

test('verify-payment: missing payment_id → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/verify-payment`, {
    data: {
      razorpay_order_id: 'order_FAKE000000',
      razorpay_signature: 'sig',
      user_id: FAKE_USER,
      product: 'birthday_report',
    },
  });
  expect(res.status()).toBe(400);
});

test('verify-payment: invalid product → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/verify-payment`, {
    data: {
      razorpay_payment_id: 'pay_TEST',
      razorpay_order_id: 'order_TEST',
      razorpay_signature: 'sig',
      user_id: FAKE_USER,
      product: 'invalid_product',
    },
  });
  expect(res.status()).toBe(400);
});

// ── get-credits ───────────────────────────────────────────────────────────────

test('get-credits: missing userId → 400', async ({ request }) => {
  const res = await request.get(`${API}/api/get-credits`);
  expect(res.status()).toBe(400);
});

test('get-credits: unknown userId → 200 credits=0 (graceful)', async ({ request }) => {
  const res = await request.get(`${API}/api/get-credits?userId=${FAKE_USER}`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.credits).toBe(0);
  expect(typeof body.subscriptionActive).toBe('boolean');
});

// ── redeem-credit ─────────────────────────────────────────────────────────────

test('redeem-credit: missing reportSlug → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/redeem-credit`, {
    data: { userId: FAKE_USER },
  });
  expect(res.status()).toBe(400);
});

test('redeem-credit: unknown user → 404 or 402', async ({ request }) => {
  const res = await request.post(`${API}/api/redeem-credit`, {
    data: { userId: FAKE_USER, reportSlug: FAKE_SLUG },
  });
  // 404 (user not found) or 402 (no credits) are both valid defensive responses
  expect([402, 404]).toContain(res.status());
});

test('verify-payment: GET method → 405', async ({ request }) => {
  const res = await request.get(`${API}/api/verify-payment`);
  expect(res.status()).toBe(405);
});

test('create-order: GET method → 405', async ({ request }) => {
  const res = await request.get(`${API}/api/create-order`);
  expect(res.status()).toBe(405);
});

test('redeem-credit: GET method → 405', async ({ request }) => {
  const res = await request.get(`${API}/api/redeem-credit`);
  expect(res.status()).toBe(405);
});
