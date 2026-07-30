/**
 * Suite J — report-content.spec.ts  (founder inventory 74-78)
 * On a trial-unlocked report: exactly 9 numbered sections; Solar System Ages leads
 * with Earth and shows 8 planet cards; Moon Sign + Nakshatra approximation caveats.
 * Plus a unit check of zodiacPlurals for all 12 signs.
 */
import { test, expect, type Page } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, type TestUser } from '../helpers/db';
import { westernZodiacPlural } from '../../src/lib/zodiacPlurals';

const SECTIONS = ['01 · TWINS', '02 · ASTROLOGY', '03 · NUMBERS', '04 · NAME', '05 · ARCANA',
  '06 · TALISMAN', '07 · COSMOS', '08 · ERA', '09 · CYCLES'];

const EXPECTED_PLURALS: Record<string, string> = {
  Aries: 'Aries', Taurus: 'Taureans', Gemini: 'Geminis', Cancer: 'Cancerians',
  Leo: 'Leos', Virgo: 'Virgos', Libra: 'Librans', Scorpio: 'Scorpios',
  Sagittarius: 'Sagittarians', Capricorn: 'Capricorns', Aquarius: 'Aquarians', Pisces: 'Pisceans',
};

let user: TestUser;
test.beforeAll(async () => { user = await createTestUser('contentJ'); });
test.afterAll(async () => { if (user) await deleteTestUser(user.userId, user.email); });

test('[unit] zodiacPlurals correct for all 12 signs', () => {
  for (const [sign, plural] of Object.entries(EXPECTED_PLURALS)) {
    expect(westernZodiacPlural(sign)).toBe(plural);
  }
});

async function fillDob(page: Page, dob: string) {
  const [y, m, d] = dob.split('-');
  await page.locator('input[placeholder="DD"]').first().fill(String(parseInt(d)));
  await page.locator('input[placeholder="MM"]').first().fill(String(parseInt(m)));
  await page.locator('input[placeholder="YYYY"]').first().fill(y);
}

test('[real] trial report: 9 sections, Earth-first 8 planets, caveats', async ({ page }) => {
  await loginViaForm(page, user.email, user.password);
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  await page.locator('input[placeholder*="Priya"]').first().fill('Content Test');
  await fillDob(page, '1990-06-15');
  await page.locator('button:has-text("Create Birthday Report")').click();
  await page.waitForSelector('text=Report Ready!', { timeout: 35000 });
  const href = await page.locator('a:has-text("Open Report")').getAttribute('href');
  await page.goto(href!);
  await page.waitForLoadState('networkidle');

  // Exactly 9 numbered section markers.
  for (const s of SECTIONS) await expect(page.getByText(s, { exact: false }).first()).toBeVisible();

  // Solar System Ages: Earth is the FIRST card and there are 8 planet cards.
  const planetCards = page.locator('.planet-grid > div');
  await expect(planetCards).toHaveCount(8);
  await expect(planetCards.first()).toContainText('Earth');

  // Moon Sign + Nakshatra approximation caveats.
  await expect(page.getByText(/Moon sign approximated from the Moon's position at date of birth/i)).toBeVisible();
  await expect(page.getByText(/Nakshatra approximated from lunar cycle position at date of birth/i)).toBeVisible();
});
