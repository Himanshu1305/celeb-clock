/**
 * P1 (batch-9) — DobInput realistic-typing regression (A1).
 *
 * Keystroke-granular assertions on CONTINUOUS typing (single focus, then page.keyboard.press
 * per key — no re-focus between keys, matching a real user). Batch-8's tests asserted only
 * focus-after-advance and never the field VALUE after two digits, so the stale-closure
 * pad-on-advance-blur ("31"→"03", "05"→"00") went uncaught. These assert the value per key.
 */
import { test, expect } from '@playwright/test';

test.describe('P1 — DobInput realistic typing (homepage hero)', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); await page.waitForLoadState('networkidle'); });

  test('type "1" then "4" in Day → 14, no premature pad/advance', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    const month = page.locator('#dob-month').first();
    await day.click();
    await page.keyboard.press('1'); await page.waitForTimeout(80);
    await expect(day).toHaveValue('1');   // NOT "01"
    await expect(day).toBeFocused();      // focus did NOT advance on an ambiguous 1
    await page.keyboard.press('4'); await page.waitForTimeout(80);
    await expect(day).toHaveValue('14');  // the second digit lands
    await expect(month).toBeFocused();    // advances only after 2 digits
  });

  test('type "1" then "2" in Month → 12, no premature pad/advance', async ({ page }) => {
    const month = page.locator('#dob-month').first();
    const year = page.locator('#dob-year').first();
    await month.click();
    await page.keyboard.press('1'); await page.waitForTimeout(80);
    await expect(month).toHaveValue('1');
    await expect(month).toBeFocused();
    await page.keyboard.press('2'); await page.waitForTimeout(80);
    await expect(month).toHaveValue('12');
    await expect(year).toBeFocused();
  });

  test('"1" alone + Tab → blur-pads to 01', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    await day.click();
    await page.keyboard.press('1'); await page.waitForTimeout(80);
    await expect(day).toHaveValue('1');
    await page.keyboard.press('Tab');
    await expect(day).toHaveValue('01');
  });

  test('"31" in Day types fully (continuous)', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    await day.click();
    await page.keyboard.press('3'); await page.waitForTimeout(80);
    await page.keyboard.press('1'); await page.waitForTimeout(80);
    await expect(day).toHaveValue('31');
  });

  test('smart-advance still works: "7" in Day advances (no valid 2-digit day starts 7)', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    const month = page.locator('#dob-month').first();
    await day.click();
    await page.keyboard.press('7'); await page.waitForTimeout(80);
    await expect(month).toBeFocused();
    // and the single 7 zero-pads (blur happened via advance)
    await expect(day).toHaveValue('07');
  });

  test('full valid date "14/12/1990" types end-to-end and validates', async ({ page }) => {
    await page.locator('#dob-day').first().click();
    for (const k of ['1', '4', '1', '2', '1', '9', '9', '0']) { await page.keyboard.press(k); await page.waitForTimeout(60); }
    await expect(page.locator('#dob-day').first()).toHaveValue('14');
    await expect(page.locator('#dob-month').first()).toHaveValue('12');
    await expect(page.locator('#dob-year').first()).toHaveValue('1990');
    // no validation error shown for a valid trio
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('calendar picker (year-first) fills the fields and validates', async ({ page }) => {
    await page.getByRole('button', { name: /Open calendar picker/i }).first().click();
    const cal = page.locator('.rdp'); // react-day-picker root
    await expect(cal).toBeVisible();
    // Year-first: dropdowns present (month + year); pick 1985.
    const selects = cal.locator('select');
    await expect(selects).toHaveCount(2);
    // FIX 1 (label duplication): dropdown-buttons renders, per dropdown, BOTH a native <select>
    // AND a redundant aria-hidden caption_label element that also prints the value → the founder
    // saw doubled "January January" / "1990 1990" (shadcn styles the select visibly instead of
    // overlaying it). The redundant month/year labels must be hidden (sr-only) so each renders
    // exactly once via the select. Assert both redundant labels carry sr-only.
    const redundant = cal.locator('.rdp-dropdown_month > [aria-hidden="true"], .rdp-dropdown_year > [aria-hidden="true"]');
    await expect(redundant).toHaveCount(2);
    await expect(redundant.nth(0)).toHaveClass(/sr-only/);
    await expect(redundant.nth(1)).toHaveClass(/sr-only/);
    await selects.filter({ has: page.locator('option[value="1985"]') }).selectOption('1985');
    await selects.first().selectOption('2'); // March (0-indexed month)
    await cal.getByText('15', { exact: true }).first().click();
    await expect(page.locator('#dob-year').first()).toHaveValue('1985');
    await expect(page.locator('#dob-month').first()).toHaveValue('03');
    await expect(page.locator('#dob-day').first()).toHaveValue('15');
    await expect(page.getByRole('alert')).toHaveCount(0); // valid trio
  });

  test('paste "02051985" distributes across the trio', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    await day.focus();
    await day.evaluate((el: HTMLInputElement) => {
      const dt = new DataTransfer(); dt.setData('text', '02051985');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    await expect(page.locator('#dob-day').first()).toHaveValue('02');
    await expect(page.locator('#dob-month').first()).toHaveValue('05');
    await expect(page.locator('#dob-year').first()).toHaveValue('1985');
  });
});
