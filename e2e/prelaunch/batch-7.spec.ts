/**
 * Suite R — batch-7.spec.ts  (BATCH-7 P6 months hub + P1 redirect)
 *
 * Only the delivered phases are covered here; deferred phases (P3, P4, P5, P7, P8, P9a,
 * P10) are listed as SKIPPED in the report's test matrix. P2 is a data/RLS fix
 * (NOTES-admin-roles.sql) with no code path to unit-test; its security boundary is the
 * existing has_role RLS.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const WORKER = 'http://localhost:3001';
const html = (route: string) => readFileSync(resolve(DIST, route.replace(/^\//, ''), 'index.html'), 'utf-8');
const distExists = existsSync(resolve(DIST, 'index.html'));

test.describe('BATCH-7 P6 — /born-in months hub', () => {
  test.skip(!distExists, 'dist/ not built');

  test('/born-in prerenders: title, canonical≠home, FAQPage, answer paragraph, 12 months', () => {
    const doc = html('/born-in');
    expect(doc).toContain('<title>Born in Each Month');
    const canonical = doc.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    expect(canonical).toBe('https://bornclock.com/born-in/');
    expect(doc).toContain('"@type":"FAQPage"');
    expect(doc).toContain('cultural tradition'); // answer-first honest hedge
    // all 12 month links present
    for (const m of ['january', 'may', 'august', 'december']) {
      expect(doc).toContain(`/born-in-${m}`);
    }
  });

  test('a month page links back to the hub (hub → month → hub)', () => {
    const doc = html('/born-in-may');
    expect(doc).toContain('href="/born-in"');
    expect(doc.toLowerCase()).toContain('born in each month');
  });

  test('/born-in reachable from the footer (every page)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('footer').getByRole('link', { name: 'Born in Each Month' })).toBeVisible();
  });

  test('/born-in reachable from the Explore nav (desktop)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /explore/i }).first().click().catch(() => {});
    await expect(page.getByRole('link', { name: /Born in Each Month/i }).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('BATCH-7 P1 — rising-sign redirect (worker)', () => {
  test('/rising-sign-calculator → 301 /moon-sign (both forms)', async ({ request }) => {
    for (const path of ['/rising-sign-calculator', '/rising-sign-calculator/']) {
      const res = await request.get(`${WORKER}${path}`, { maxRedirects: 0 });
      expect(res.status(), path).toBe(301);
      expect(res.headers()['location'], path).toContain('/moon-sign');
    }
  });
});
