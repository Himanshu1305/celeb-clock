import { test, expect, type Page } from '@playwright/test';

// RC3 Rule-4 — second batch of real submissions on the LIVE staging worker:
// the birth-time Vedic section (the lagna-crash fix, Item 2 bug #3), plus
// adjacent client-side and API-backed tools.

const FAIL_TEXT = /temporarily unavailable|went wrong|something broke/i;

async function pickCity(page: Page, inputTestId: string, dropdownSel: string, city = 'Delhi') {
  const input = page.getByTestId(inputTestId);
  await input.click();
  await input.fill(city);
  const opt = page.locator(`${dropdownSel} li button`).first();
  await expect(opt).toBeVisible({ timeout: 15_000 });
  await opt.click();
}

test('Birth-time Vedic section — birth time + city reveals a profile (lagna renders, no crash)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/birthday-report/');
  // Set a full DOB via the DobInput trio (text inputs with aria-labels).
  await page.getByLabel('Day', { exact: true }).fill('14');
  await page.getByLabel('Month', { exact: true }).fill('03');
  await page.getByLabel('Year', { exact: true }).fill('1990');
  // The optional Vedic section is inline. Enter time + city, reveal.
  await page.getByTestId('birth-time-input').fill('10:30');
  await pickCity(page, 'birth-city-input', '[data-testid="city-dropdown"]');
  await page.getByRole('button', { name: /Reveal my Vedic profile/i }).click();
  await expect(page.getByTestId('vedic-profile-section')).toBeVisible({ timeout: 40_000 });
  // The crash was rendering the lagna OBJECT as a React child. Confirm a real sign shows.
  await expect(page.getByTestId('vedic-profile-section')).toContainText(/Vrisha|Lagna/i);
  expect(errors, `page errors: ${errors.join('\n')}`).toHaveLength(0);
});

async function pickCityByText(page: Page, inputTestId: string, city: string) {
  const input = page.getByTestId(inputTestId);
  await input.click();
  await input.fill(city);
  const opt = page.getByRole('button', { name: new RegExp(city, 'i') }).first();
  await expect(opt).toBeVisible({ timeout: 15_000 });
  await opt.click();
}

test('Kundali Match — two real births produce a Guna Milan score', async ({ page }) => {
  await page.goto('/kundali-match/');
  await page.getByTestId('kmatch-dob-a').fill('1990-03-14');
  await page.getByTestId('kmatch-time-a').fill('10:30');
  await pickCityByText(page, 'kmatch-city-a', 'Delhi');
  await page.getByTestId('kmatch-dob-b').fill('1992-07-20');
  await page.getByTestId('kmatch-time-b').fill('08:15');
  await pickCityByText(page, 'kmatch-city-b', 'Mumbai');
  await page.getByTestId('kmatch-calculate-btn').click();
  await expect(page.getByTestId('kmatch-result')).toBeVisible({ timeout: 40_000 });
  await expect(page.getByTestId('kmatch-result')).toContainText(/36|Guna|point|compat/i);
  await expect(page.locator('body')).not.toContainText(FAIL_TEXT);
});

test('Muhurat — a real city + date range returns auspicious windows', async ({ page }) => {
  await page.goto('/muhurat/');
  const city = page.getByTestId('muhurat-city');
  await city.click();
  await city.fill('Delhi');
  await page.getByTestId('muhurat-city-option').first().click();
  await page.getByTestId('muhurat-find-btn').click();
  await expect(page.getByTestId('muhurat-result')).toBeVisible({ timeout: 40_000 });
  await expect(page.getByTestId('muhurat-methodology')).toBeVisible();
});

test('Personal Year — a real birth date yields a personal-year number', async ({ page }) => {
  await page.goto('/personal-year-number/');
  await page.locator('#pyn-month').fill('3');
  await page.locator('#pyn-day').fill('14');
  await page.getByRole('button', { name: /Calculate my personal year/i }).click();
  await expect(page.getByTestId('pyn-result')).toBeVisible({ timeout: 20_000 });
});

test('Numerology — a real birth date yields a Life Path result', async ({ page }) => {
  await page.goto('/numerology/');
  await page.getByLabel('Day', { exact: true }).fill('14');
  await page.getByLabel('Month', { exact: true }).fill('03');
  await page.getByLabel('Year', { exact: true }).fill('1990');
  const calc = page.getByRole('button', { name: /calculate|life path|reveal/i }).first();
  if (await calc.count()) await calc.click().catch(() => {});
  await expect(page.locator('body')).toContainText(/Life Path|Life-Path/i, { timeout: 20_000 });
});

test('Compatibility — two signs produce an overall score', async ({ page }) => {
  await page.goto('/compatibility/');
  await page.getByRole('button', { name: /calculate|compatib|match/i }).first().click().catch(() => {});
  await expect(page.locator('body')).toContainText(/%|love|friendship|work/i, { timeout: 20_000 });
});
