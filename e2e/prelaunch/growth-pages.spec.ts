/**
 * Suite — growth-pages.spec.ts  (Overnight Batch 2: Phases A/B/C)
 * Covers the 12 "Born in {Month}" hubs, the 6 fitness/rhythm pages, national-days
 * enrichment on the 366 date pages, the rhythm widget's validation, and the new
 * Explore nav entries. Positive / negative / edge per the batch spec.
 *
 * Some checks are unit-style (validateDob, getNationalDays) and import the source
 * modules directly (Playwright transpiles TS). The rest drive the dev server.
 */
import { test, expect, type Page } from '@playwright/test';
import { validateDob } from '../../src/data/rhythmFraming';
import { getNationalDays } from '../../src/data/nationalDays';
import { MONTH_HUB_DATA } from '../../src/data/monthHubData';
import { FITNESS_PAGES } from '../../src/data/fitnessPages';

const MONTH_PATHS = MONTH_HUB_DATA.map(m => `/born-in-${m.slug}`);
const FITNESS_PATHS = FITNESS_PAGES.map(p => `/${p.slug}`);
const ALL = [...MONTH_PATHS, ...FITNESS_PATHS];

async function mockGeo(page: Page, code: 'IN' | 'US' = 'IN') {
  const name = code === 'IN' ? 'India' : 'United States';
  await page.route('https://ipapi.co/**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: code, country_name: name }) }));
}

// ── POSITIVE: every new page 200 + unique title + canonical≠home + FAQPage JSON-LD
test('all 18 growth pages: 200, h1, unique title, canonical not home, FAQPage JSON-LD', async ({ page }) => {
  const titles: string[] = [];
  for (const path of ALL) {
    const resp = await page.goto(path);
    expect(resp?.status(), `${path} status`).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first(), `${path} h1`).toBeVisible();
    // The SPA fallback returns 200 for any path, so also assert the page did NOT fall
    // through to a not-found / error shell — status + h1-exists alone cannot catch that.
    await expect(page.locator('body'), `${path} not a not-found shell`).not.toContainText(/Article Not Found|Page Not Found|Sign Not Found/);

    const title = await page.title();
    expect(title.length, `${path} title length`).toBeGreaterThan(10);
    titles.push(title);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    if (canonical) expect(canonical, `${path} canonical`).not.toMatch(/^https?:\/\/[^/]+\/?$/);

    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some(s => s.includes('"FAQPage"')), `${path} FAQPage JSON-LD`).toBeTruthy();
  }
  expect(new Set(titles).size, 'all titles unique').toBe(titles.length);
});

// ── POSITIVE: month hubs are single-currency (₹ under geo IN), and link Feb 29 ──
test('month hub: single currency under geo IN + links every date incl. Feb 29', async ({ page }) => {
  await mockGeo(page, 'IN');
  await page.goto('/born-in-january?currency=INR');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('₹');
  await expect(page.locator('body')).not.toContainText('$');

  await page.goto('/born-in-february');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('a[href="/born-on/february-29"]')).toHaveCount(1);
});

// ── POSITIVE: fitness widget renders a result for a valid DOB ───────────────────
test('fitness widget renders a rhythm result for a valid DOB', async ({ page }) => {
  await page.goto('/biorhythm-workout-calculator');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="date"]').first().fill('1990-06-15');
  await page.getByRole('button', { name: /rhythm|show|calculate|check|outline|week/i }).first().click();
  await expect(page.locator('body')).toContainText('Physical');
  await expect(page.locator('body')).toContainText('%');
});

// ── POSITIVE: honesty framing present on every fitness page ─────────────────────
test('every fitness page carries the science note + disclaimer', async ({ page }) => {
  for (const path of FITNESS_PATHS) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/controlled research has not found it predictive/i);
    await expect(page.locator('body')).toContainText(/not.*(medical|predictive science)/i);
  }
});

// ── POSITIVE: national-days block shows on Aug 15, absent (no empty shell) elsewhere
test('national days: Aug 15 shows the block with India; a dateless day shows none', async ({ page }) => {
  await page.goto('/born-on/august-15');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('National days on August 15');
  await expect(page.locator('body')).toContainText('India');
  await expect(page.locator('body')).toContainText(/Independence Day/i);

  // Pick a date with no national-day entries and confirm no empty block renders.
  const dateless = findDatelessDate();
  await page.goto(`/born-on/${dateless.slug}`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).not.toContainText('National days on');
});

// ── POSITIVE: new Explore nav entries exist ────────────────────────────────────
test('nav/footer expose the new growth entries', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('a[href="/born-in"]').first()).toBeVisible();
  await expect(page.locator('a[href="/biorhythm-workout-calculator"]').first()).toBeVisible();
});

// ── NEGATIVE + EDGE (unit): validateDob ────────────────────────────────────────
test('validateDob: rejects future + impossible dates, accepts valid + edges', () => {
  const future = new Date(); future.setFullYear(future.getFullYear() + 1);
  const futureStr = future.toISOString().slice(0, 10);
  expect('error' in validateDob(futureStr)).toBeTruthy();          // future DOB rejected
  expect('error' in validateDob('2021-02-30')).toBeTruthy();       // Feb 30 impossible
  expect('error' in validateDob('2021-13-01')).toBeTruthy();       // month 13
  expect('error' in validateDob('not-a-date')).toBeTruthy();       // garbage
  expect('error' in validateDob('1850-01-01')).toBeTruthy();       // before 1900

  expect('date' in validateDob('1990-06-15')).toBeTruthy();        // normal valid
  expect('date' in validateDob('2000-02-29')).toBeTruthy();        // leap day valid
  expect('error' in validateDob('2001-02-29')).toBeTruthy();       // non-leap Feb 29 invalid
  const today = new Date(); today.setHours(12, 0, 0, 0);
  expect('date' in validateDob(today.toISOString().slice(0, 10))).toBeTruthy(); // DOB = today ok
  expect('date' in validateDob('1915-03-10')).toBeTruthy();        // DOB > 100 years ago ok
});

// ── NEGATIVE (unit): getNationalDays for a dateless day returns nothing ─────────
test('getNationalDays: known day populated, dateless day empty', () => {
  expect(getNationalDays(8, 15).some(d => d.country === 'India')).toBeTruthy();
  expect(getNationalDays(1, 26).some(d => d.dayName.includes('Republic'))).toBeTruthy();
  const dateless = findDatelessDate();
  expect(getNationalDays(dateless.month, dateless.day)).toEqual([]);
});

// ── EDGE: widget shows a clean error for a future DOB, no crash ─────────────────
test('fitness widget shows a clean message for a future DOB (no crash)', async ({ page }) => {
  await page.goto('/energy-forecast');
  await page.waitForLoadState('networkidle');
  const future = new Date(); future.setFullYear(future.getFullYear() + 2);
  await page.locator('input[type="date"]').first().fill(future.toISOString().slice(0, 10));
  await page.getByRole('button', { name: /outline|week|rhythm|calculate|check/i }).first().click();
  await expect(page.locator('[role="alert"]')).toContainText(/future/i);
  // page still alive
  await expect(page.locator('h1').first()).toBeVisible();
});

// ── EDGE: Feb 29 date page builds ──────────────────────────────────────────────
test('/born-on/february-29 loads with an h1', async ({ page }) => {
  const resp = await page.goto('/born-on/february-29');
  expect(resp?.status()).toBe(200);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1').first()).toBeVisible();
});

// ── India celebrity coverage (INDIA-CELEBS batch) ──────────────────────────────
async function mockGeoIN(page: Page) {
  await page.route('https://ipapi.co/**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: 'IN', country_name: 'India' }) }));
  await page.addInitScript(() => {
    try { localStorage.setItem('bc_country_code_v2', JSON.stringify({ code: 'IN', ts: Date.now() })); } catch { /* noop */ }
  });
}
const indiaSection = (page: Page) =>
  page.locator('div', { has: page.locator('h3', { hasText: /from India/i }) }).last();

test('[real] India section: /born-on/january-1 (geo IN) shows several ranked Indian cards', async ({ page }) => {
  await mockGeoIN(page);
  await page.goto('/born-on/january-1');
  await page.waitForLoadState('networkidle');
  const heading = page.locator('h3', { hasText: /from India/i });
  await expect(heading).toBeVisible({ timeout: 15000 });
  // Cards render with the person's name even with NO image (initials fallback).
  await expect(page.locator('body')).toContainText('Vidya Balan');
  // At least 6 distinct India cards (ranked). Cards carry a Wikipedia link each.
  const cardLinks = indiaSection(page).locator('a[href*="wikipedia.org"]');
  expect(await cardLinks.count()).toBeGreaterThanOrEqual(6);
});

test('[real] India section: no empty shell — heading only renders alongside cards', async ({ page }) => {
  await mockGeoIN(page);
  await page.goto('/born-on/january-1');
  await page.waitForLoadState('networkidle');
  // Wherever the "from India" heading appears, it must have >=1 celebrity card —
  // CountryExtrasSection returns null when there are no extras (no empty shell).
  const headings = page.locator('h3', { hasText: /from India/i });
  const n = await headings.count();
  if (n > 0) {
    await expect(indiaSection(page).locator('a[href*="wikipedia.org"]').first()).toBeVisible();
  }
});

test('India section is absent for a non-India visitor (gating, no empty shell)', async ({ page }) => {
  await page.route('https://ipapi.co/**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: 'US', country_name: 'United States' }) }));
  await page.goto('/born-on/january-1');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h3', { hasText: /from India/i })).toHaveCount(0);
});

// Helper: find a MM-DD with no national-day entry (scan the year).
function findDatelessDate(): { month: number; day: number; slug: string } {
  const MONTHS = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= DAYS[m]; d++) {
      if (getNationalDays(m, d).length === 0) return { month: m, day: d, slug: `${MONTHS[m]}-${d}` };
    }
  }
  return { month: 4, day: 11, slug: 'april-11' }; // fallback (should never hit)
}
