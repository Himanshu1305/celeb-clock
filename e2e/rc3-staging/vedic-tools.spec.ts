import { test, expect, type Page } from '@playwright/test';

// RC3 Rule-4: real birth details entered, real form submitted, real (unmocked) API
// responds, correct result renders — on the LIVE staging worker. These cover the
// tools on the shared /api/kundali engine path that the RC3 Item-2 fix touched
// (doshas, dashaTimeline, lagna crash) plus adjacent Vedic tools.

const FAIL_TEXT = /temporarily unavailable|couldn.t be loaded|went wrong|try again/i;

// Fill the shared BirthDetailsForm. Delhi/Mumbai resolve from the built-in city
// list (no Nominatim), per the pacing rule.
async function fillBirthForm(
  page: Page,
  prefix: string,
  opts: { dob: string; time: string; city?: string } = { dob: '1990-03-14', time: '10:30' },
) {
  const city = opts.city || 'Delhi';
  await page.getByTestId(`${prefix}-dob`).fill(opts.dob);
  await page.getByTestId(`${prefix}-time`).fill(opts.time);
  const cityInput = page.getByTestId(`${prefix}-city`);
  await cityInput.click();
  await cityInput.fill(city);
  // Wait for the offline-resolved dropdown and pick the first match.
  const firstOption = page.locator(`[data-testid="${prefix}-form"] ul li button`).first();
  await expect(firstOption).toBeVisible({ timeout: 15_000 });
  await firstOption.click();
  await page.getByTestId(`${prefix}-generate-btn`).click();
}

test('Manglik — real submission renders a Mangal Dosha result', async ({ page }) => {
  await page.goto('/manglik/');
  await fillBirthForm(page, 'manglik');
  await expect(page.getByTestId('manglik-result')).toBeVisible({ timeout: 40_000 });
  await expect(page.getByTestId('manglik-result')).toContainText(/Manglik|Mangal|Dosha/i);
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Kaal Sarp — real submission renders a Kaal Sarp result', async ({ page }) => {
  await page.goto('/kaal-sarp-dosha/');
  await fillBirthForm(page, 'kaalsarp');
  await expect(page.getByTestId('kaalsarp-result')).toBeVisible({ timeout: 40_000 });
  await expect(page.getByTestId('kaalsarp-result')).toContainText(/Kaal Sarp|Rahu|Ketu|Dosha/i);
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Kundali — chart + 5-level Dasha deep-dive + What\'s Ahead all render', async ({ page }) => {
  await page.goto('/kundali/');
  await fillBirthForm(page, 'kundali');
  // Chart itself
  await expect(page.getByTestId('kundali-lagna')).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId('planet-table')).toBeVisible();
  // The two sections that were silently hidden pre-fix (gated on dashaTimeline):
  await expect(page.getByTestId('dasha-deep-dive')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('dasha-deep-toggle').click(); // expand the 5-level tree
  await expect(page.locator('[data-testid^="dasha-toggle-"]').first()).toBeVisible({ timeout: 15_000 });
  // What's Ahead is collapsed by default — expand, then its life-area cards render.
  await expect(page.getByTestId('whats-ahead')).toBeVisible({ timeout: 15_000 });
  await page.getByTestId('whats-ahead-toggle').click();
  await expect(page.locator('[data-testid^="whatsahead-area-"]').first()).toBeVisible({ timeout: 15_000 });
});

test('Dasha calculator — real submission renders the Dasha tree', async ({ page }) => {
  await page.goto('/dasha-calculator/');
  await fillBirthForm(page, 'dasha');
  await expect(page.getByTestId('dasha-deep-dive')).toBeVisible({ timeout: 40_000 });
  await page.getByTestId('dasha-deep-toggle').click();
  await expect(page.locator('[data-testid^="dasha-toggle-"]').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Sade Sati — real submission renders a result', async ({ page }) => {
  await page.goto('/sade-sati/');
  await fillBirthForm(page, 'sadesati');
  await expect(page.locator('body')).toContainText(/Sade Sati|Saturn|Shani/i, { timeout: 40_000 });
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Gemstone — real submission renders a recommendation', async ({ page }) => {
  await page.goto('/gemstones/');
  await fillBirthForm(page, 'gemstone');
  await expect(page.locator('body')).toContainText(/gemstone|stone|ratna|wear/i, { timeout: 40_000 });
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Career report — real submission renders career guidance', async ({ page }) => {
  await page.goto('/career-report/');
  await fillBirthForm(page, 'career');
  await expect(page.locator('body')).toContainText(/career|10th house|profession|work/i, { timeout: 40_000 });
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Trust strip carries a "How we test" link to /how-it-works', async ({ page }) => {
  await page.goto('/manglik/');
  const link = page.getByTestId('trust-strip-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/how-it-works#vedic');
});
