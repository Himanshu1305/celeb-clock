/**
 * 01-public-pages — Every public route loads without console errors or crashes.
 */
import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  { path: '/', titleContains: 'BornClock' },
  { path: '/birthday-report', titleContains: 'Birthday' },
  { path: '/upgrade', titleContains: 'Upgrade' },
  { path: '/life-expectancy', titleContains: 'Life Expectancy' },
  { path: '/tarot-card-by-birthday', titleContains: 'Tarot' },
  { path: '/biorhythm', titleContains: 'Biorhythm' },
  { path: '/name-numerology', titleContains: 'Numerology' },
];

for (const route of PUBLIC_ROUTES) {
  test(`${route.path} — loads without crash`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(route.path);
    await page.waitForLoadState('networkidle');

    // Page rendered (not blank)
    const body = await page.locator('body').textContent();
    expect(body?.trim().length).toBeGreaterThan(50);

    // Title contains expected keyword
    await expect(page).toHaveTitle(new RegExp(route.titleContains, 'i'));

    // No React error boundaries triggered
    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    // No uncaught JS errors (filter out known third-party noise)
    const criticalErrors = consoleErrors.filter(
      e => !e.includes('favicon') && !e.includes('Razorpay') && !e.includes('gtag')
    );
    expect(criticalErrors, `console errors on ${route.path}: ${criticalErrors.join(' | ')}`).toHaveLength(0);
  });
}

test('navigation bar visible on home page', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const nav = page.locator('nav').first();
  await expect(nav).toBeVisible();
});

test('/report/nonexistent-slug shows expiry/not-found page', async ({ page }) => {
  await page.goto('/report/this-slug-does-not-exist-gauntlet-test');
  await page.waitForLoadState('networkidle');
  // Should show expiry or not-found message, not a blank page
  const body = await page.locator('body').textContent();
  expect(body?.trim().length).toBeGreaterThan(20);
  // Should NOT show report content
  const reportTitle = page.locator('[id="birthday-report-print"]');
  await expect(reportTitle).not.toBeVisible();
});
