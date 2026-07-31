/**
 * subscribe.spec.ts — /blog newsletter + /api/subscribe (SEO-MAGNET Phase 1).
 * The blog form was inert (no handler); this covers the wired behaviour:
 * positive (+ DB row), duplicate (idempotent), invalid, missing-consent, and the
 * blog UI success + inline-validation states. Uses the .invalid test domain so no
 * real email is ever sent; rows are cleaned up in afterAll.
 */
import { test, expect } from '@playwright/test';
import { db, testEmail } from '../helpers/db';

const API = 'http://localhost:3001';
const emails: string[] = [];

test.afterAll(async () => {
  for (const e of emails) await db().from('email_subscribers').delete().ilike('email', e);
});

test('API positive: valid email → ok:true and a row in email_subscribers', async ({ request }) => {
  const email = testEmail('subA'); emails.push(email);
  const res = await request.post(`${API}/api/subscribe`, { data: { email, consent: true, source: 'blog', weeklyDigest: true } });
  expect(res.status()).toBe(200);
  expect((await res.json()).ok).toBe(true);

  const { data } = await db().from('email_subscribers').select('email, source, weekly_digest').ilike('email', email).single();
  expect(data?.email?.toLowerCase()).toBe(email.toLowerCase());
  expect(data?.source).toBe('blog');
});

test('API duplicate: same email again → idempotent ok:true (no error)', async ({ request }) => {
  const email = testEmail('subDup'); emails.push(email);
  const first = await request.post(`${API}/api/subscribe`, { data: { email, consent: true, source: 'blog' } });
  expect((await first.json()).ok).toBe(true);
  const second = await request.post(`${API}/api/subscribe`, { data: { email, consent: true, source: 'blog' } });
  expect(second.status()).toBe(200);
  expect((await second.json()).ok).toBe(true);
  // Still exactly one row.
  const { count } = await db().from('email_subscribers').select('*', { count: 'exact', head: true }).ilike('email', email);
  expect(count).toBe(1);
});

test('API invalid email → 400 with a message', async ({ request }) => {
  const res = await request.post(`${API}/api/subscribe`, { data: { email: 'not-an-email', consent: true } });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/valid email/i);
});

test('API missing consent → 400', async ({ request }) => {
  const res = await request.post(`${API}/api/subscribe`, { data: { email: testEmail('subNoConsent'), consent: false } });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/consent/i);
});

test('blog UI: valid email → "subscribed" success state', async ({ page }) => {
  const email = testEmail('subUI'); emails.push(email);
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  const box = page.getByPlaceholder('Enter your email');
  await box.scrollIntoViewIfNeeded();
  await box.fill(email);
  await page.getByRole('button', { name: /subscribe/i }).click();
  await expect(page.getByText(/You're subscribed/i)).toBeVisible({ timeout: 10000 });
});

test('blog UI: invalid email → inline validation message, no dead button', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  const box = page.getByPlaceholder('Enter your email');
  await box.scrollIntoViewIfNeeded();
  await box.fill('nope');
  await page.getByRole('button', { name: /subscribe/i }).click();
  await expect(page.locator('[role="alert"]')).toContainText(/valid email/i);
});
