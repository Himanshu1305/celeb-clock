import { test, expect, type Page } from '@playwright/test';

// FINAL Rule-4: real use of the NEW P1–P5 interactive tools on the LIVE staging
// worker (not mocked), across Chromium desktop / WebKit iPhone / Android Chrome.
// Complements the RC3 core-tool suite; focuses on what P1–P5 added.

const FAIL_TEXT = /temporarily unavailable|couldn.t be loaded|went wrong|try again/i;

// Shared BirthDetailsForm fill (same pattern as the RC3 suite). Delhi resolves
// from the built-in city list — no Nominatim call.
async function fillBirthForm(page: Page, prefix: string, dob = '1990-03-14', time = '10:30', city = 'Delhi') {
  await page.getByTestId(`${prefix}-dob`).fill(dob);
  await page.getByTestId(`${prefix}-time`).fill(time);
  const cityInput = page.getByTestId(`${prefix}-city`);
  await cityInput.click();
  await cityInput.fill(city);
  const firstOption = page.locator(`[data-testid="${prefix}-form"] ul li button`).first();
  await expect(firstOption).toBeVisible({ timeout: 15_000 });
  await firstOption.click();
  await page.getByTestId(`${prefix}-generate-btn`).click();
}

// ── P2: Western birth chart (global audience) ──────────────────────────────
test('Western birth chart — real birth details render Sun/Moon/Rising placements', async ({ page }) => {
  await page.goto('/western-birth-chart/');
  await fillBirthForm(page, 'western');
  await expect(page.getByTestId('western-chart-result')).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId('western-placements-table')).toContainText(/Sun|Moon|Rising|Ascendant/i);
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

// ── P2: Child (Bal) Kundli ─────────────────────────────────────────────────
test('Child Kundli — real birth details render a temperament/support reading', async ({ page }) => {
  await page.goto('/child-kundli/');
  await fillBirthForm(page, 'child-kundli');
  await expect(page.getByTestId('child-kundli-result')).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId('child-kundli-result')).toContainText(/temperament|learning|talent|support|nakshatra/i);
  // Guardrail: paediatrician framing, never "your child will be ill".
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

// ── P1: Daily Panchang for a city ──────────────────────────────────────────
test('Panchang — selecting a city renders the five limbs (tithi/nakshatra)', async ({ page }) => {
  await page.goto('/panchang/');
  await expect(page.getByTestId('panchang-cities')).toBeVisible({ timeout: 30_000 });
  await page.locator('[data-testid="panchang-cities"] button').first().click();
  await expect(page.getByTestId('panchang-limbs')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('panchang-limbs')).toContainText(/Tithi|Paksha|Nakshatra|Yoga|Karana/i);
  await expect(page.getByTestId('panchang-windows')).toContainText(/Rahu|Gulika|Yamaganda/i);
});

// ── P1: Rashifal computed per period ───────────────────────────────────────
test('Rashifal — a sign + period renders a computed, graded forecast', async ({ page }) => {
  await page.goto('/rashifal/mesh/today/');
  await expect(page.getByTestId('rashifal-overview')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('rashifal-periods')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
  // Switch to the weekly period and confirm it still renders.
  await page.goto('/rashifal/mesh/week/');
  await expect(page.getByTestId('rashifal-overview')).toBeVisible({ timeout: 30_000 });
});

// ── P4: Chinese zodiac yearly forecast ─────────────────────────────────────
test('Chinese horoscope — an animal renders a career/finance/love/health forecast', async ({ page }) => {
  await page.goto('/chinese-horoscope/dragon/');
  await expect(page.locator('[data-testid^="cz-forecast-"]').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('body')).toContainText(/career|finance|love|health/i);
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

// ── P4: Interactive tarot (user draws) ─────────────────────────────────────
test('Tarot — drawing a yes/no card reveals an orientation-aware verdict', async ({ page }) => {
  await page.goto('/tarot-reading/');
  await page.getByTestId('tarot-tab-yesno').click();
  await page.getByTestId('tarot-yesno-draw').click();
  await expect(page.getByTestId('tarot-yesno-result')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('tarot-yesno-result')).toContainText(/Yes|No|Maybe|Upright|Reversed/i);
});

// ── P2: Life report (wealth/education/foreign/health graded) ───────────────
test('Life report — real birth details render graded life-area indications', async ({ page }) => {
  await page.goto('/life-report/');
  await fillBirthForm(page, 'life-report');
  await expect(page.locator('body')).toContainText(/wealth|finance|education|foreign|health/i, { timeout: 45_000 });
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});
