/**
 * Suite H — navigation.spec.ts  (founder inventory 60-64)
 * Main bar has Birthday Report, not Planetary Age; Planetary Age under More;
 * Explore ∩ (main ∪ More) = ∅ as DOM sets; 390px mobile parity; Admin tab absent
 * for a normal (guest) user.
 */
import { test, expect, type Page } from '@playwright/test';

const desktopNav = (page: Page) => page.locator('nav.hidden.md\\:flex').first();

async function openMenu(page: Page, triggerText: string): Promise<string[]> {
  await page.locator('nav.hidden.md\\:flex button', { hasText: triggerText }).first().click();
  const menu = page.locator('[role="menu"]').last();
  await menu.waitFor({ state: 'visible' });
  const hrefs = await menu.locator('a[href^="/"]').evaluateAll(els =>
    els.map(e => (e as HTMLAnchorElement).getAttribute('href')!).filter(Boolean));
  await page.keyboard.press('Escape');   // close before opening the next
  return hrefs;
}

test('main bar has Birthday Report, not Planetary Age', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(desktopNav(page).locator('a[href="/birthday-report"]')).toBeVisible();
  // Planetary Age is not a top-level bar link (it lives in More, portaled away).
  await expect(desktopNav(page).locator('a[href="/planetary-age"]')).toHaveCount(0);
});

test('Planetary Age lives under More', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const moreHrefs = await openMenu(page, 'More');
  expect(moreHrefs).toContain('/planetary-age');
});

test('Explore ∩ (main ∪ More) = ∅', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const mainHrefs = await desktopNav(page).locator('a[href^="/"]').evaluateAll(els =>
    els.map(e => (e as HTMLAnchorElement).getAttribute('href')!));
  const moreHrefs = await openMenu(page, 'More');
  const exploreHrefs = await openMenu(page, 'Explore');

  // Explore = the discovery hubs. BATCH-8 P5 moved Numerology (both) and Gift a Report
  // into Explore; SEO Batch 1 added the age/longevity facet pages; SEO Batch 2 folded the
  // 10 country longevity pages behind the /country-comparison hub ("Life Expectancy by
  // Country") and added the widget-embed hub. Kept in sync with exploreItems.
  expect(new Set(exploreHrefs)).toEqual(new Set([
    '/born-in', '/born-on/india', '/numerology', '/name-numerology',
    '/biorhythm-workout-calculator', '/energy-forecast', '/answers',
    '/compatibility', '/weight-on-planets', '/gift',
    '/age-in-days', '/age-in-seconds', '/birthday-countdown',
    '/biological-age-vs-chronological-age', '/country-comparison', '/embed',
  ]));

  // No Explore destination is duplicated in the main bar or More.
  const mainPlusMore = new Set([...mainHrefs, ...moreHrefs]);
  for (const h of exploreHrefs) expect(mainPlusMore.has(h)).toBe(false);
});

test('390px mobile parity: Birthday Report + Planetary Age both reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Open the mobile hamburger (aria-labelled). Scope to :visible so we assert the
  // mobile-menu link, not the hidden desktop-nav copy (which is display:none at 390px).
  await page.getByRole('button', { name: /Toggle navigation menu/i }).click();
  await expect(page.locator('a[href="/birthday-report"]:visible').first()).toBeVisible();
  await expect(page.locator('a[href="/planetary-age"]:visible').first()).toBeVisible();
});

test('Admin tab absent for a normal (guest) user', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
});
