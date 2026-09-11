import { test, expect, type Page } from '@playwright/test';

// Part J.3 — progressive profile across tools. Opt-in + device-only unchanged; this
// only extends WHAT can be reused (a partial date-only profile is pre-filled and only
// the missing pieces are asked; a full profile is reused across Vedic tools).
const KEY = 'bornclock-birth-profile';
const seed = (page: Page, profile: any) => page.addInitScript(([k, p]) => localStorage.setItem(k, p), [KEY, JSON.stringify(profile)]);
const FULL = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }, savedAt: '2026-01-01T00:00:00Z' };

test('PARTIAL profile → Kundali pre-fills the date and asks only for time + place', async ({ page }) => {
  await seed(page, { dob: '1988-11-05' }); // date-only (what a date tool would save)
  await page.goto('/kundali');
  // partial banner shown (not the full "using saved" banner)
  await expect(page.locator('[data-testid="partial-profile-banner"]')).toBeVisible();
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toHaveCount(0);
  // date pre-filled; time + city empty (only the missing pieces to enter)
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('1988-11-05');
  await expect(page.locator('[data-testid="kundali-time"]')).toHaveValue('');
  await expect(page.locator('[data-testid="kundali-city"]')).toHaveValue('');
  await page.screenshot({ path: 'e2e-reading/__screens__/pj-02-partial-kundali.png', fullPage: true });
});

test('FULL profile is reused across tools without re-asking (Kundali → Sade Sati)', async ({ page }) => {
  await seed(page, FULL);
  // Kundali shows the full saved banner
  await page.goto('/kundali');
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toBeVisible();
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('1988-11-05');

  // A different Vedic tool (Sade Sati) pre-fills the SAME details — no re-entry
  await page.goto('/sade-sati');
  await expect(page.locator('[data-testid="sadesati-dob"]')).toHaveValue('1988-11-05');
  await expect(page.locator('[data-testid="sadesati-time"]')).toHaveValue('12:30');
  await expect(page.locator('[data-testid="sadesati-city"]')).toHaveValue('Delhi');
  await page.screenshot({ path: 'e2e-reading/__screens__/pj-03-full-reuse-sadesati.png', fullPage: true });
});

test('PARTIAL profile → Astrologer asks to complete (needs the full chart), not re-enter everything', async ({ page }) => {
  await seed(page, { dob: '1988-11-05', time: '12:30' }); // date+time, no place → still not full
  await page.goto('/astrologer');
  await expect(page.locator('[data-testid="astrologer-no-profile"]')).toBeVisible();
  await expect(page.locator('[data-testid="astrologer-no-profile"]')).toContainText(/add your birth time and place|Complete my birth details/i);
  // it acknowledges what's already saved (the date) rather than acting like nothing exists
  await expect(page.locator('[data-testid="astrologer-no-profile"]')).toContainText('1988-11-05');
});

test('EDGE: check a friend without overwriting your own saved profile ("use different details")', async ({ page }) => {
  await seed(page, FULL);
  await page.goto('/kundali');
  await page.click('[data-testid="use-different-details"]');
  // now the form is empty for a fresh (friend's) entry, and the save box is offered (opt-in)
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('');
  await expect(page.locator('[data-testid="kundali-save-optin"]')).toBeVisible();
  // the saved profile in storage is untouched
  const stored = await page.evaluate((k) => localStorage.getItem(k), KEY);
  expect(stored).toContain('1988-11-05');
});

test('NEGATIVE: corrupted saved profile → graceful fallback to a normal empty form, no crash', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, '{not valid json'), KEY);
  await page.goto('/kundali');
  await expect(page.locator('[data-testid="kundali-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="partial-profile-banner"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue(''); // clean empty form
});
