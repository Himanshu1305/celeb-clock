/**
 * 10-emails-and-reports — send-email and save-report API validation tests.
 * Tests input validation only — does not send real emails or persist test rows.
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

// ── send-email ────────────────────────────────────────────────────────────────

test('send-email: GET → 405', async ({ request }) => {
  const res = await request.get(`${API}/api/send-email`);
  expect(res.status()).toBe(405);
});

test('send-email: missing type → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/send-email`, {
    data: { to: 'test@example.com', name: 'Test' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('send-email: missing to → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/send-email`, {
    data: { type: 'welcome', name: 'Test' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('send-email: missing name → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/send-email`, {
    data: { type: 'welcome', to: 'test@example.com' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('send-email: unknown type → 400 (not 500)', async ({ request }) => {
  const res = await request.post(`${API}/api/send-email`, {
    data: { type: 'totally_fake_type', to: 'test@example.com', name: 'Test' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/unknown email type/i);
});

// ── save-report ───────────────────────────────────────────────────────────────

test('save-report: GET → 405', async ({ request }) => {
  const res = await request.get(`${API}/api/save-report`);
  expect(res.status()).toBe(405);
});

test('save-report: missing reportData → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/save-report`, {
    data: { isPremium: false },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('save-report: future recipientDob → 400', async ({ request }) => {
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10); // YYYY-MM-DD one year from now

  const res = await request.post(`${API}/api/save-report`, {
    data: {
      reportData: {
        recipientName: 'Future Person',
        recipientDob: futureDate,
        country: 'IN',
      },
      isPremium: false,
    },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/future/i);
});

test('save-report: valid anon request → 200 + slug', async ({ request }) => {
  const res = await request.post(`${API}/api/save-report`, {
    data: {
      reportData: {
        recipientName: 'Gauntlet Test',
        recipientDob: '1990-07-15',
        country: 'IN',
      },
      isPremium: false,
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(typeof body.slug).toBe('string');
  expect(body.slug.length).toBe(8);
});
