import { test, expect } from '@playwright/test';

// Part W — /vedic-astrology landing page. Part Y refactor: the page now renders via the
// shared <CategoryLandingPage> template, so testids are the shared `landing-*` set.
// Runs against local preview (new page not on staging until deploy).

const ALL_14 = [
  '/kundali','/kundali-match','/astrologer','/sade-sati','/muhurat','/career-report',
  '/gemstones','/zodiac','/chinese-zodiac','/vedic-zodiac','/moon-sign','/compatibility',
  '/sun-vs-moon-sign','/rashi-ratna',
];

test('page loads with hero, direct-answer opening, and CTA to /kundali', async ({ page }) => {
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('landing-hero')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ours computes');
  await expect(page.getByTestId('landing-answer')).toContainText(/sidereal/i);
  await expect(page.getByTestId('landing-hero-cta')).toHaveAttribute('href', '/kundali');
});

test('all 14 tool links are present and point to their real routes', async ({ page }) => {
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  for (const href of ALL_14) {
    await expect(page.locator(`[data-testid^="landing-tool-"][href="${href}"]`).first()).toHaveCount(1);
  }
});

test('all 14 tool links RESOLVE (no 404) — sampled navigation', async ({ page }) => {
  for (const href of ALL_14) {
    await page.goto('/vedic-astrology');
    await page.waitForLoadState('networkidle');
    await page.locator(`[data-testid^="landing-tool-"][href="${href}"]`).first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator("text=/404|doesn't exist/i")).toHaveCount(0);
    expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(href);
  }
});

test('stats strip shows the REAL verified numbers (5 / 8 / 14) after count-up', async ({ page }) => {
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  const stats = page.getByTestId('landing-stat');
  await expect(stats).toHaveCount(3);
  await expect(stats.nth(0)).toContainText('5');
  await expect(stats.nth(0)).toContainText('Classical yogas detected');
  await expect(stats.nth(1)).toContainText('8');
  await expect(stats.nth(1)).toContainText('Divisional charts computed');
  await expect(stats.nth(2)).toContainText('14');
  await expect(stats.nth(2)).toContainText('Vedic tools');
});

test('a11y: each animated stat exposes a static final value to screen readers (sr-only)', async ({ page }) => {
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  const srTexts = await page.locator('[data-testid="landing-stat"] .sr-only').allInnerTexts();
  expect(srTexts.join(' | ')).toContain('5 Classical yogas detected');
  expect(srTexts.join(' | ')).toContain('8 Divisional charts computed');
});

test('language selector: Hindi shows an honest "coming soon" state, no silent fail', async ({ page }) => {
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('landing-hindi-notice')).toHaveCount(0);
  await page.getByTestId('landing-lang-hi').click();
  await expect(page.getByTestId('landing-hindi-notice')).toBeVisible();
  await expect(page.getByTestId('landing-hindi-notice')).toContainText(/coming soon/i);
  await page.getByTestId('landing-lang-en').click();
  await expect(page.getByTestId('landing-hindi-notice')).toHaveCount(0);
});

test('closing callout renders the honest "done right" framing', async ({ page }) => {
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('landing-closing')).toContainText("your actual birth chart, done right");
});

test('saved-profile reuse: hero shows a "reuse your saved details" hint when a full profile exists', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bornclock-birth-profile', JSON.stringify({
      dob: '1990-04-20', time: '09:15',
      city: { name: 'Mumbai', lat: 19.07, lon: 72.88, tz: 5.5 },
      savedAt: new Date().toISOString(),
    }));
  });
  await page.goto('/vedic-astrology');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('landing-saved-hint')).toBeVisible();
  await expect(page.getByTestId('landing-saved-hint')).toContainText('1990-04-20');
  await expect(page.getByTestId('landing-hero-cta')).toHaveAttribute('href', '/kundali');
});
