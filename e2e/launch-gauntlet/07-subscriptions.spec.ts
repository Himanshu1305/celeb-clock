/**
 * 07-subscriptions — Upgrade page structure + create-subscription API validation.
 * Does NOT create real subscriptions — tests input validation and method guards only.
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';
const FAKE_USER = '00000000-0000-0000-0000-000000000000';

// ── Upgrade page ──────────────────────────────────────────────────────────────

test('upgrade page renders 3 plan tiers', async ({ page }) => {
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Free', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Premium Monthly', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Premium Annual', { exact: false }).first()).toBeVisible();
});

test('upgrade page loads without crash or error boundary', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').textContent();
  expect(body?.trim().length).toBeGreaterThan(50);

  await expect(page.locator('text=Something went wrong')).not.toBeVisible();

  const critical = consoleErrors.filter(
    e => !e.includes('favicon') && !e.includes('Razorpay') && !e.includes('gtag')
      && !e.includes('ipapi.co') && !e.includes('net::ERR_FAILED'),
  );
  expect(critical, `console errors on /upgrade: ${critical.join(' | ')}`).toHaveLength(0);
});

// ── create-subscription API ───────────────────────────────────────────────────

test('create-subscription: GET → 405', async ({ request }) => {
  const res = await request.get(`${API}/api/create-subscription`);
  expect(res.status()).toBe(405);
});

test('create-subscription: missing planId → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/create-subscription`, {
    data: { userId: FAKE_USER },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('create-subscription: missing userId → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/create-subscription`, {
    data: { planId: 'plan_GAUNTLET_FAKE' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('create-subscription: unknown planId → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/create-subscription`, {
    data: { planId: 'plan_GAUNTLET_UNKNOWN', userId: FAKE_USER },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/plan/i);
});
