import { test, expect } from '@playwright/test';

test.describe('New Pages — TC-MISC E2E', () => {
  test('E2E-P-01: /todays-birthdays loads with an H1', async ({ page }) => {
    await page.goto('/todays-birthdays/');
    await expect(page.locator('h1').first()).toBeVisible();
  });
  test('E2E-P-02: /for-business loads with API pricing', async ({ page }) => {
    await page.goto('/for-business/');
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/₹\d|API|pricing/i);
  });
  test('E2E-P-03: born-on page has a /wish link', async ({ page }) => {
    await page.goto('/born-on/august-6/india/');
    await expect(page.locator('a[href*="/wish"]').first()).toBeVisible({ timeout: 5000 });
  });
  test('E2E-N-01: /celebrity route unaffected by new routes', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    await expect(page.locator('h1')).toContainText('Virat Kohli');
  });
});
