import { test, expect } from '@playwright/test';

/**
 * Part H — adversarial / break-it testing against live staging. A real user
 * clicks twice, navigates away mid-load, and mashes back/forward. Confirm the
 * merged product degrades gracefully rather than crashing or duplicating UI.
 */
test.describe.configure({ mode: 'serial' });

async function fill(page: any, dob = '1990-04-20', time = '09:15') {
  await page.goto('/kundali');
  await page.fill('[data-testid="kundali-dob"]', dob);
  await page.fill('[data-testid="kundali-time"]', time);
  await page.fill('[data-testid="kundali-city"]', 'Delhi');
  await page.locator('li button', { hasText: 'Delhi' }).first().click();
}

test('rapid repeated submit does not crash or duplicate the reading', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(String(e)));
  await fill(page);
  const btn = page.locator('[data-testid="kundali-generate-btn"]');
  // Mash the button several times fast.
  for (let i = 0; i < 5; i++) await btn.click({ timeout: 5000 }).catch(() => {});
  await expect(page.locator('[data-testid="vedic-reading"]')).toBeVisible({ timeout: 90_000 });
  // Exactly ONE reading rendered, not five stacked.
  expect(await page.locator('[data-testid="vedic-reading"]').count()).toBe(1);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'e2e/__screens_h__/adv-01-rapid-submit.png', fullPage: true });
});

test('navigating away mid-generation does not break the next page', async ({ page }) => {
  await fill(page, '1975-07-07', '18:30');
  await page.click('[data-testid="kundali-generate-btn"]');
  // Immediately bail to the astrologer without waiting for the reading.
  await page.goto('/astrologer');
  // The astrologer page must still load cleanly (no stuck spinner / crash).
  await expect(page.locator('[data-testid="astrologer-page"]')).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: 'e2e/__screens_h__/adv-02-nav-away-midgen.png', fullPage: true });
});

test('browser back/forward through the whole flow renders every page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/kundali');
  await expect(page.locator('[data-testid="kundali-page"]')).toBeVisible();
  await page.goto('/kundali-match');
  await expect(page.locator('[data-testid="kmatch-page"]')).toBeVisible();
  await page.goto('/astrologer');
  await expect(page.locator('[data-testid="astrologer-page"]')).toBeVisible();
  // Back twice, forward once — each must re-render its page, not a blank.
  await page.goBack();  await expect(page.locator('[data-testid="kmatch-page"]')).toBeVisible();
  await page.goBack();  await expect(page.locator('[data-testid="kundali-page"]')).toBeVisible();
  await page.goForward(); await expect(page.locator('[data-testid="kmatch-page"]')).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'e2e/__screens_h__/adv-03-back-forward.png', fullPage: true });
});
