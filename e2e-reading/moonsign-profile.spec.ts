import { test, expect, type Page } from '@playwright/test';

// Part K Item 6 — the reusable SavedDateOffer bridge on a date-only tool (Moon Sign).
const KEY = 'bornclock-birth-profile';
const seed = (page: Page, p: any) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(p)]);

test('Moon Sign: no profile → works as before (no reuse banner); date entry offers to save', async ({ page }) => {
  await page.goto('/moon-sign');
  await expect(page.locator('[data-testid="moonsign-use-saved"]')).toHaveCount(0);
  await page.fill('#dob-day', '15'); await page.fill('#dob-month', '05'); await page.fill('#dob-year', '1990');
  await expect(page.locator('[data-testid="moonsign-save-offer"]')).toBeVisible();
  await page.click('[data-testid="moonsign-save-btn"]');
  await expect(page.locator('[data-testid="moonsign-saved-confirm"]')).toBeVisible();
  expect(await page.evaluate(k => localStorage.getItem(k), KEY)).toContain('1990-05-15');
});

test('Moon Sign: a saved date is OFFERED (not forced) and fills the input on opt-in', async ({ page }) => {
  await seed(page, { dob: '1988-11-05' });
  await page.goto('/moon-sign');
  const banner = page.locator('[data-testid="moonsign-use-saved"]');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('1988-11-05');
  await page.click('[data-testid="moonsign-use-saved-btn"]');
  await expect(page.locator('#dob-year')).toHaveValue('1988'); // date pre-filled
  await page.click('button:has-text("Find My Sign")');
  await expect(page.getByText(/Moon Sign|Nakshatra/).first()).toBeVisible();
  await page.screenshot({ path: 'e2e-reading/__screens__/pk-02-moonsign-reuse.png', fullPage: true });
});
