import { test, expect, type Page } from '@playwright/test';

// Part L Item 2 — SavedDateOffer wired into the remaining single-date novelty tools.
// Same proven reuse/regression pattern as Moon Sign (Part K).
const KEY = 'bornclock-birth-profile';
const seed = (page: Page, p: any) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(p)]);

const TOOLS = [
  { route: '/chinese-zodiac', prefix: 'chinese-zodiac' },
  { route: '/vedic-zodiac', prefix: 'vedic-zodiac' },
  { route: '/biorhythm', prefix: 'biorhythm' },
  { route: '/tarot-card-by-birthday', prefix: 'tarot' },
  { route: '/planetary-age', prefix: 'planetary-age' },
  { route: '/life-expectancy', prefix: 'life-expectancy' },
];

for (const { route, prefix } of TOOLS) {
  test(`${prefix}: saved date is OFFERED (not forced) and applies on opt-in`, async ({ page }) => {
    await seed(page, { dob: '1988-11-05' });
    await page.goto(route);
    const banner = page.locator(`[data-testid="${prefix}-use-saved"]`);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('1988-11-05');
    await page.click(`[data-testid="${prefix}-use-saved-btn"]`);
    // once applied, the reuse offer is consumed (date is now set)
    await expect(banner).toHaveCount(0);
  });

  test(`${prefix}: REGRESSION — no saved profile → no reuse banner (page unchanged)`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(`[data-testid="${prefix}-use-saved"]`)).toHaveCount(0);
  });
}

test('novelty tool CONTRIBUTE: entering a date with no profile offers to save it', async ({ page }) => {
  await page.goto('/chinese-zodiac');
  await page.fill('#dob-day', '20'); await page.fill('#dob-month', '04'); await page.fill('#dob-year', '1990');
  await expect(page.locator('[data-testid="chinese-zodiac-save-offer"]')).toBeVisible();
  await page.click('[data-testid="chinese-zodiac-save-btn"]');
  await expect(page.locator('[data-testid="chinese-zodiac-saved-confirm"]')).toBeVisible();
  expect(await page.evaluate(k => localStorage.getItem(k), KEY)).toContain('1990-04-20');
  await page.screenshot({ path: 'e2e-reading/__screens__/pl-01-novelty-contribute.png', fullPage: true });
});
