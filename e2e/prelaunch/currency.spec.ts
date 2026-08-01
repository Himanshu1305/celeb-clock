/**
 * Suite F — currency.spec.ts  (founder inventory 46-52)
 * Priced surfaces show ONE currency: default (geo India) → ₹; ?currency=USD → $.
 * The 5 calculator CTA pages reveal their priced "Generate My Report" CTA only
 * after a calculation, so each is triggered first, then the CTA's currency asserted.
 * /pricing and /upgrade agree on subscription prices in both currencies.
 * Geo is mocked (ipapi) for determinism.
 */
import { test, expect, type Page } from '@playwright/test';

async function mockGeo(page: Page, code: 'IN' | 'US') {
  const name = code === 'IN' ? 'India' : 'United States';
  await page.route('https://ipapi.co/**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: code, country_name: name }) }));
}

// ── Dedicated priced pages: whole-body single-currency invariant ───────────────
const DEDICATED = ['/birthday-report', '/pricing', '/upgrade'];

for (const path of DEDICATED) {
  test(`${path}: default (geo IN) shows ₹ only`, async ({ page }) => {
    await mockGeo(page, 'IN');
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('₹');
    await expect(page.locator('body')).not.toContainText('$');
  });

  test(`${path}: ?currency=USD shows $ only`, async ({ page }) => {
    await mockGeo(page, 'IN');   // override must win even when geo says India
    await page.goto(`${path}?currency=USD`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('$');
    await expect(page.locator('body')).not.toContainText('₹');
  });
}

// ── Calculator CTA pages: trigger, then assert the CTA link's currency ─────────
// BATCH-8 P3: these calculators now use the shared DobInput (DD/MM/YYYY fields), not a
// native date picker — fill the three fields to trigger the result + priced CTA.
const fillDob = async (p: Page) => {
  await p.locator('#dob-day').first().fill('01');
  await p.locator('#dob-month').first().fill('01');
  await p.locator('#dob-year').first().fill('1990');
};
const CTA_PAGES: Array<{ path: string; trigger: (p: Page) => Promise<void> }> = [
  { path: '/biorhythm', trigger: async p => { await fillDob(p); await p.getByRole('button', { name: /Calculate/i }).first().click(); } },
  { path: '/moon-sign', trigger: async p => { await fillDob(p); await p.getByRole('button', { name: /Find My Sign/i }).first().click(); } },
  { path: '/name-numerology', trigger: async p => { await p.locator('input[type="text"]').first().fill('Ravi Kumar'); await p.getByRole('button', { name: /Calculate/i }).first().click(); } },
  { path: '/tarot-card-by-birthday', trigger: async p => { await fillDob(p); await p.getByRole('button', { name: /Find My Card/i }).first().click(); } },
  // BATCH-8 P6: the compatibility calculator now NAVIGATES to the canonical pair page,
  // where the priced "Generate My Report" CTA renders.
  { path: '/compatibility', trigger: async p => { await p.locator('select').nth(0).selectOption({ index: 1 }); await p.locator('select').nth(1).selectOption({ index: 2 }); await p.getByRole('button', { name: /compatib|calculate|check/i }).first().click(); await p.waitForURL(/\/compatibility\/[a-z]+\/[a-z]+/); } },
];

for (const { path, trigger } of CTA_PAGES) {
  test(`${path}: CTA shows ₹ by default`, async ({ page }) => {
    await mockGeo(page, 'IN');
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await trigger(page);
    const cta = page.locator('a:has-text("Generate My Report")').first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toContainText('₹');
    await expect(cta).not.toContainText('$');
  });

  test(`${path}: CTA shows $ with ?currency=USD`, async ({ page }) => {
    await mockGeo(page, 'IN');
    await page.goto(`${path}?currency=USD`);
    await page.waitForLoadState('networkidle');
    await trigger(page);
    const cta = page.locator('a:has-text("Generate My Report")').first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toContainText('$');
    await expect(cta).not.toContainText('₹');
  });
}

// ── /upgrade completeness + monthly consistency with /pricing ─────────────────
// /pricing shows only the monthly price and links to /upgrade for the full plan
// set (by design), so parity = /upgrade lists monthly+annual+saving AND the
// monthly price matches on /pricing.
test('/upgrade lists monthly+annual+saving; /pricing monthly matches (INR)', async ({ page }) => {
  await mockGeo(page, 'IN');
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('₹299');     // monthly
  await expect(page.locator('body')).toContainText('₹2,499');   // annual
  await expect(page.locator('body')).toContainText(/Annual/i);
  await expect(page.locator('body')).toContainText(/save/i);    // saving line

  await page.goto('/pricing');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('₹299');     // consistent monthly
});

test('/upgrade lists monthly+annual+saving; /pricing monthly matches (USD)', async ({ page }) => {
  await mockGeo(page, 'US');
  await page.goto('/upgrade?currency=USD');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('$4.99');
  await expect(page.locator('body')).toContainText('$39.99');
  await expect(page.locator('body')).toContainText(/Annual/i);

  await page.goto('/pricing?currency=USD');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('$4.99');
});
