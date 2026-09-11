import { test, expect, type Page } from '@playwright/test';

// Part K Item 1 — the Age Calculator progressive-profile BRIDGE (page-level, additive;
// BirthDateContext untouched). Three cases: existing behaviour unchanged with no
// profile; offered (not forced) reuse of a saved date; offered to contribute a date.
const KEY = 'bornclock-birth-profile';
const seed = (page: Page, p: any) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(p)]);
const enterDob = async (page: Page, d: string, m: string, y: string) => {
  await page.fill('#dob-day', d); await page.fill('#dob-month', m); await page.fill('#dob-year', y);
};

test('REGRESSION: no saved profile → page works exactly as before (no reuse banner)', async ({ page }) => {
  await page.goto('/age-calculator');
  await expect(page.locator('#calculator')).toBeVisible();
  await expect(page.locator('[data-testid="agecalc-use-saved"]')).toHaveCount(0); // no reuse offer
  await enterDob(page, '15', '05', '1990');
  await expect(page.getByText('Total Days Lived')).toBeVisible(); // calculator still computes
});

test('REUSE: a saved date is OFFERED (not forced); clicking Use it fills the calculator', async ({ page }) => {
  await seed(page, { dob: '1990-05-15' }); // a date-only profile (e.g. saved from a Vedic tool)
  await page.goto('/age-calculator');
  const banner = page.locator('[data-testid="agecalc-use-saved"]');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('1990-05-15');
  // not forced: the calculator has NOT auto-filled until the user opts in
  await expect(page.getByText('Total Days Lived')).toHaveCount(0);
  await page.click('[data-testid="agecalc-use-saved-btn"]');
  await expect(page.getByText('Total Days Lived')).toBeVisible(); // now computed from the saved date
  await page.screenshot({ path: 'e2e-reading/__screens__/pk-01-agecalc-reuse.png', fullPage: true });
});

test('CONTRIBUTE: entering a date with no saved profile OFFERS to save it (opt-in)', async ({ page }) => {
  await page.goto('/age-calculator');
  await enterDob(page, '20', '04', '1990');
  const offer = page.locator('[data-testid="agecalc-save-offer"]');
  await expect(offer).toBeVisible();
  await page.click('[data-testid="agecalc-save-btn"]');
  await expect(page.locator('[data-testid="agecalc-saved-confirm"]')).toBeVisible();
  // a date-only profile is now in storage (progressive: no time/place forced)
  const stored = await page.evaluate(k => localStorage.getItem(k), KEY);
  expect(stored).toContain('1990-04-20');
});

test('EDGE: with a FULL saved profile, the reuse offer still uses just the date (no crash)', async ({ page }) => {
  await seed(page, { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.61, lon: 77.21, tz: 5.5 } });
  await page.goto('/age-calculator');
  await expect(page.locator('[data-testid="agecalc-use-saved"]')).toContainText('1988-11-05');
  await page.click('[data-testid="agecalc-use-saved-btn"]');
  await expect(page.getByText('Total Days Lived')).toBeVisible();
});
