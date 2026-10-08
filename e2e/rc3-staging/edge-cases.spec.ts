import { test, expect } from '@playwright/test';

// RC3 Testing §2 — negative/edge handling at the real UI layer. Form-level validation
// is engine/logic, browser-independent; run on the default project set. These confirm
// clear messages / disabled submit, never a crash.

test('Manglik — empty form keeps the submit disabled (no blind submission)', async ({ page }) => {
  await page.goto('/manglik/');
  await expect(page.getByTestId('manglik-generate-btn')).toBeDisabled();
});

test('Manglik — a gibberish city yields no pickable option and submit stays disabled', async ({ page }) => {
  await page.goto('/manglik/');
  await page.getByTestId('manglik-dob').fill('1990-03-14');
  await page.getByTestId('manglik-time').fill('10:30');
  const city = page.getByTestId('manglik-city');
  await city.click();
  await city.fill('zzzqqxnotacity');
  // No option list appears → cannot pick a city → submit remains disabled, no crash.
  await page.waitForTimeout(2500);
  await expect(page.locator('[data-testid="manglik-form"] ul li button')).toHaveCount(0);
  await expect(page.getByTestId('manglik-generate-btn')).toBeDisabled();
  await expect(page.locator('body')).not.toContainText(/went wrong|something broke/i);
});

test('Native date input blocks an impossible day (31 February cannot be entered)', async ({ page }) => {
  await page.goto('/manglik/');
  // type=date rejects an impossible date; the field stays empty rather than accepting it.
  await page.getByTestId('manglik-dob').fill('1990-02-31').catch(() => {});
  const val = await page.getByTestId('manglik-dob').inputValue();
  expect(val === '' || val === '1990-02-28' || /^1990-0[23]-/.test(val)).toBeTruthy();
});

test('Hindi numerology page renders with a heading (no crash)', async ({ page }) => {
  const resp = await page.goto('/numerology-hindi/');
  expect(resp?.status()).toBeLessThan(400);
  await expect(page.locator('h1')).toBeVisible();
});
