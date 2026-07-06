/**
 * 06-returnto-roundtrip — F-01 fix verification
 *
 * Verifies that the unlock CTA links carry ?returnTo=/report/[slug] so that
 * after login/signup the browser lands back on the locked report, not /.
 *
 * Does NOT perform a real auth round-trip (no test credentials here) — it
 * asserts the href values are wired correctly. A full round-trip test requires
 * a seeded test account and is tracked separately.
 *
 * Requires: Vite dev server on localhost:3000.
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('F-01 — returnTo links on locked report', () => {
  let reportUrl: string;
  let slug: string;

  test.beforeAll(async ({ browser }) => {
    // Create a report via the birthday report form so we have a real slug.
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/birthday-report`);
    await page.waitForSelector('input[placeholder*="Priya"]', { timeout: 10000 });

    const nameInput = page.locator('input[placeholder*="Priya"]').first();
    await nameInput.fill('Test Person');

    await page.locator('input[type="date"]').fill('1990-05-15');
    await page.locator('button:has-text("Create Birthday Report")').click();

    // App stays on /birthday-report and shows success screen
    await page.waitForSelector('text=Report Ready!', { timeout: 30000 });
    const reportHref = await page.locator('a:has-text("Open Report")').getAttribute('href');
    slug = reportHref!.split('/report/')[1].split('?')[0];
    reportUrl = `${BASE}/report/${slug}`;
    await ctx.close();
  });

  test('Sign-in CTA href includes returnTo with correct slug', async ({ page }) => {
    await page.goto(reportUrl);
    await page.waitForSelector('text=Sign in to Unlock', { timeout: 10000 });

    const signInLink = page.locator('a', { hasText: 'Sign in to Unlock' });
    const href = await signInLink.getAttribute('href');

    expect(href).toBeTruthy();
    expect(href).toContain('/auth');
    expect(href).toContain(`returnTo=/report/${slug}`);
    expect(href).not.toContain('signup=true');
  });

  test('Create Account CTA href includes signup=true and returnTo with correct slug', async ({ page }) => {
    await page.goto(reportUrl);
    await page.waitForSelector('text=New here? Create a free account', { timeout: 10000 });

    const signUpLink = page.locator('a', { hasText: 'New here? Create a free account' });
    const href = await signUpLink.getAttribute('href');

    expect(href).toBeTruthy();
    expect(href).toContain('/auth');
    expect(href).toContain('signup=true');
    expect(href).toContain(`returnTo=/report/${slug}`);
  });

  test('Auth page with returnTo param does not redirect to / (param preserved)', async ({ page }) => {
    // Navigate to the auth page with a returnTo param (unauthenticated).
    // Verify the returnTo is present in the URL (not stripped by routing).
    const authUrl = `${BASE}/auth?returnTo=/report/${slug}`;
    await page.goto(authUrl);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Page should be the auth form, returnTo intact in URL
    expect(page.url()).toContain(`returnTo=/report/${slug}`);
  });

  test('Auth page signup=true toggle preserves returnTo', async ({ page }) => {
    const authUrl = `${BASE}/auth?signup=true&returnTo=/report/${slug}`;
    await page.goto(authUrl);
    await page.waitForSelector('input[id="firstName"]', { timeout: 10000 });

    // Click the "Sign In" toggle link — should stay on /auth with returnTo intact
    await page.locator('button', { hasText: 'Sign In' }).click();
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    // returnTo must still be in the URL (toggle uses local state, not URL navigation)
    // The URL won't change because setIsSignUp is local state — but the page is /auth
    expect(page.url()).toContain('/auth');
    expect(page.url()).toContain(`returnTo=/report/${slug}`);
  });
});
