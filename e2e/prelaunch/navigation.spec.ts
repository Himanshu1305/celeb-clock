/**
 * Suite H — navigation.spec.ts
 *
 * Part U REWRITE: the nav was intentionally restructured from the old
 * navItems/exploreItems/astrologyItems (visible-bar + Explore + Astrology + More)
 * into FOUR category dropdowns (Science & Longevity, Vedic Astrology, Birthday Fun,
 * Mystic Corner) + a small fifth "More" (Resources). These tests verify the NEW
 * intentional structure: each category's items are present and correctly grouped,
 * "Compatibility" is de-duplicated (Vedic only), no route is duplicated across
 * categories, mobile parity holds, and the Admin tab stays guest-invisible.
 */
import { test, expect, type Page } from '@playwright/test';

const desktopNav = (page: Page) => page.locator('nav.hidden.md\\:flex').first();

// Open a category dropdown by its stable testid; return the hrefs inside it.
async function openCategory(page: Page, key: string): Promise<string[]> {
  await desktopNav(page).locator(`[data-testid="nav-cat-${key}"]`).click();
  const menu = page.locator('[role="menu"]').last();
  await menu.waitFor({ state: 'visible' });
  const hrefs = await menu.locator('a[href^="/"]').evaluateAll(els =>
    els.map(e => (e as HTMLAnchorElement).getAttribute('href')!).filter(Boolean));
  // Close and WAIT for the Radix dismissible layer to fully detach — otherwise its
  // lingering overlay intercepts the click on the next category trigger (flake fix).
  await page.keyboard.press('Escape');
  await page.locator('[role="menu"]').waitFor({ state: 'detached' }).catch(() => {});
  return hrefs;
}

// Exact expected grouping (routes unchanged from Part U — only regrouped/reordered).
// Part V: object key order = the on-page category order (Vedic first, Science last of
// the four, then Resources/More) per the serial-position effect.
const EXPECTED: Record<string, string[]> = {
  vedic: ['/kundali', '/kundali-match', '/astrologer', '/sade-sati', '/muhurat', '/career-report', '/gemstones', '/zodiac', '/chinese-zodiac', '/vedic-zodiac', '/moon-sign', '/compatibility', '/rashi-ratna', '/sun-vs-moon-sign'],
  birthday: ['/age-calculator', '/todays-birthdays', '/celebrity-birthday', '/birthday-report', '/planetary-age', '/age-in-days', '/age-in-seconds', '/birthday-countdown', '/celebrity', '/born-in', '/born-on/india', '/weight-on-planets', '/gift', '/birthstone', '/birthday'],
  mystic: ['/numerology', '/name-numerology', '/tarot-card-by-birthday'],
  science: ['/life-expectancy', '/biological-age', '/biological-age-vs-chronological-age', '/coach', '/country-comparison', '/biorhythm', '/biorhythm-workout-calculator', '/energy-forecast'],
  more: ['/articles', '/answers', '/blog', '/leaderboard', '/pricing', '/embed'],
};

// Part V — the four category triggers must appear in this exact order (primacy/recency).
const CATEGORY_ORDER = ['vedic', 'birthday', 'mystic', 'science', 'more'];

test('desktop bar shows the five category dropdown triggers', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  for (const key of Object.keys(EXPECTED)) {
    await expect(desktopNav(page).locator(`[data-testid="nav-cat-${key}"]`)).toBeVisible();
  }
});

test('Part V: nav triggers are in the exact serial-position order (Vedic first, Science last of four)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const domOrder = await desktopNav(page).locator('[data-testid^="nav-cat-"]')
    .evaluateAll(els => els.map(e => (e as HTMLElement).getAttribute('data-testid')!.replace('nav-cat-', '')));
  expect(domOrder).toEqual(CATEGORY_ORDER);
});

test('Part V: "choose your path" homepage cards are in the same order (Vedic → Birthday → Mystic → Science)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const cardOrder = await page.locator('[data-testid="choose-your-path"] [data-testid^="path-card-"]')
    .evaluateAll(els => els.map(e => (e as HTMLElement).getAttribute('data-testid')!.replace('path-card-', '')));
  expect(cardOrder).toEqual(['vedic', 'birthday', 'mystic', 'science']);
});

for (const [key, expected] of Object.entries(EXPECTED)) {
  test(`"${key}" dropdown contains exactly its intended items`, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const got = new Set(await openCategory(page, key));
    for (const href of expected) {
      expect(got.has(href), `${key} dropdown should contain ${href}`).toBe(true);
    }
    // and nothing extra crept in
    expect(got).toEqual(new Set(expected));
  });
}

test('Compatibility is de-duplicated — present in Vedic Astrology only', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const perCat: Record<string, Set<string>> = {};
  for (const key of Object.keys(EXPECTED)) perCat[key] = new Set(await openCategory(page, key));
  expect(perCat.vedic.has('/compatibility')).toBe(true);
  for (const key of ['science', 'birthday', 'mystic', 'more']) {
    expect(perCat[key].has('/compatibility'), `${key} must NOT contain /compatibility`).toBe(false);
  }
});

test('no route is duplicated across the category dropdowns', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const all: string[] = [];
  for (const key of Object.keys(EXPECTED)) all.push(...await openCategory(page, key));
  const dups = [...new Set(all.filter((h, i) => all.indexOf(h) !== i))];
  expect(dups, `routes duplicated across categories: ${dups.join(', ')}`).toHaveLength(0);
});

test('390px mobile parity: key tools from every category are reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Toggle navigation menu/i }).click();
  // one flagship per category — proves nothing became unreachable on mobile
  for (const h of ['/birthday-report', '/planetary-age', '/kundali', '/life-expectancy', '/numerology', '/pricing']) {
    await expect(page.locator(`a[href="${h}"]:visible`).first()).toBeVisible();
  }
});

test('Admin tab absent for a normal (guest) user', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
});
