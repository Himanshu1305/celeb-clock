/**
 * 09-mobile — Mobile viewport (390×844) layout and interaction tests.
 * Checks no horizontal scroll, hamburger open/close, touch target sizes.
 */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

// ── No horizontal overflow ────────────────────────────────────────────────────

async function noHorizontalScroll(page: any, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  const scrollWidth: number = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth: number = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth, `horizontal overflow on ${path}: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`).toBeLessThanOrEqual(clientWidth);
}

test('home page — no horizontal scroll at 390px', async ({ page }) => {
  await noHorizontalScroll(page, '/');
});

test('/born-on — no horizontal scroll at 390px', async ({ page }) => {
  await noHorizontalScroll(page, '/born-on');
});

test('/upgrade — no horizontal scroll at 390px', async ({ page }) => {
  await noHorizontalScroll(page, '/upgrade');
});

test('/born-on/july-15 — no horizontal scroll at 390px', async ({ page }) => {
  await noHorizontalScroll(page, '/born-on/july-15');
});

// ── Hamburger menu ────────────────────────────────────────────────────────────

test('hamburger button is visible on mobile', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('[aria-label="Toggle navigation menu"]');
  await expect(hamburger).toBeVisible();
});

test('hamburger opens mobile menu with section labels', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('[aria-label="Toggle navigation menu"]');
  // Mobile menu panel (only present when open)
  const menuPanel = page.locator('.fixed.inset-x-0.z-50');

  await expect(menuPanel).not.toBeAttached();

  await hamburger.click();
  await expect(menuPanel).toBeVisible();

  // All four section labels should appear inside the mobile menu panel
  await expect(menuPanel.getByText('Popular', { exact: true })).toBeVisible();
  await expect(menuPanel.getByText('Numerology', { exact: true })).toBeVisible();
  await expect(menuPanel.getByText('Astrology', { exact: true })).toBeVisible();
  await expect(menuPanel.getByText('More Tools', { exact: true })).toBeVisible();
});

test('hamburger closes mobile menu on second click', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('[aria-label="Toggle navigation menu"]');
  const menuPanel = page.locator('.fixed.inset-x-0.z-50');
  await hamburger.click();
  await expect(menuPanel).toBeVisible();

  await hamburger.click();
  await expect(menuPanel).not.toBeAttached();
});

test('backdrop click closes mobile menu', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('[aria-label="Toggle navigation menu"]');
  const menuPanel = page.locator('.fixed.inset-x-0.z-50');
  await hamburger.click();
  await expect(menuPanel).toBeVisible();

  // The backdrop is behind the menu at z-40; use dispatchEvent to bypass pointer
  // interception by the z-50 menu panel and trigger the onClick handler directly.
  await page.locator('.fixed.inset-0.z-40').dispatchEvent('click');
  await expect(menuPanel).not.toBeAttached();
});

// ── Touch targets ─────────────────────────────────────────────────────────────

test('hamburger touch target is ≥44px tall', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('[aria-label="Toggle navigation menu"]');
  const box = await hamburger.boundingBox();
  expect(box?.height, 'hamburger height < 44px').toBeGreaterThanOrEqual(44);
});

test('mobile menu links have ≥44px touch targets', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.locator('[aria-label="Toggle navigation menu"]').click();
  await page.waitForSelector('[class*="min-h-\\[44px\\]"]', { timeout: 5000 });

  const links = page.locator('[class*="min-h-\\[44px\\]"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  // Check first link height
  const box = await links.first().boundingBox();
  expect(box?.height, 'mobile nav link height < 44px').toBeGreaterThanOrEqual(44);
});
