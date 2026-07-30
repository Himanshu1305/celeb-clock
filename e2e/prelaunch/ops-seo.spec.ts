/**
 * Suite K — ops-seo.spec.ts  (founder inventory 82,86,88-94 sample)
 * Admin guard, create-order sentinel, renamed-route 301, sitemap size,
 * per-page title/canonical uniqueness, hub pages 200 + h1.
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';   // worker directly (301s + api live here)

test('/admin redirects a normal (guest) user away', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/\/admin/);
});

test('create-order sentinel → {"error":"Report not found"}', async ({ request }) => {
  const res = await request.post(`${API}/api/create-order`, {
    data: { product: 'birthday_report', report_slug: 'zzzzzzzz', userId: '00000000-0000-0000-0000-000000000000', currency: 'INR', userEmail: 't@t.com' },
  });
  expect(res.status()).toBe(404);
  expect((await res.json()).error).toBe('Report not found');
});

test('/methodology → 301 → /how-it-works', async ({ request }) => {
  const res = await request.get(`${API}/methodology`, { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers()['location']).toContain('/how-it-works');
});

test('/sitemap.xml has ≥ 1313 URLs', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const count = (await res.text()).split('<loc>').length - 1;
  expect(count).toBeGreaterThanOrEqual(1313);
});

test('sample pages: unique <title>, canonical not the homepage', async ({ page }) => {
  const paths = ['/pricing', '/upgrade', '/birthday-report', '/zodiac', '/numerology',
    '/moon-sign', '/answers', '/born-on/india', '/todays-birthdays', '/life-expectancy'];
  const titles: string[] = [];
  for (const p of paths) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    titles.push(title);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    if (canonical) {
      // Canonical, if present, must point at this page family — never bare home.
      expect(canonical).not.toMatch(/^https?:\/\/[^/]+\/?$/);
    }
  }
  expect(new Set(titles).size).toBe(titles.length);   // all unique
});

test('/born-on/india and /answers → 200 with an h1', async ({ page }) => {
  for (const p of ['/born-on/india', '/answers']) {
    const resp = await page.goto(p);
    expect(resp?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
});
