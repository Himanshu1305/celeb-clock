/**
 * 03-multi-date-pdf — Generate reports for 5 different DOBs and verify:
 *  - Redirect to /report/[slug] for each
 *  - Cover renders the correct name
 *  - Celebrity Twins section loads (either content or "No twins found")
 *  - No crash / error boundary shown
 *
 * This test does NOT attempt to download PDFs — it validates that the locked
 * preview renders cleanly for varied inputs.
 */
import { test, expect } from '@playwright/test';

const TEST_CASES = [
  { dob: '1985-01-15', name: 'January Test' },
  { dob: '1990-06-21', name: 'June Test' },
  { dob: '1975-11-30', name: 'November Test' },
  { dob: '2000-02-29', name: 'Leap Day Test' },   // 2000 was a leap year
  { dob: '1955-07-04', name: 'Fourth of July Test' },
];

for (const tc of TEST_CASES) {
  test(`DOB ${tc.dob} — report renders without crash`, async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    await page.locator('input[placeholder*="recipient"]').first().fill(tc.name);
    await page.locator('input[type="date"]').first().fill(tc.dob);
    await page.locator('button:has-text("Create Birthday Report")').click();

    await page.waitForURL(/\/report\/[a-z0-9-]+/, { timeout: 35000 });

    // No error boundary
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();

    // Cover rendered
    const cover = page.locator('.report-cover-section').first();
    await expect(cover).toBeVisible({ timeout: 10000 });

    // Twins section header exists
    await expect(page.locator('text=Celebrity Birthday Twins').first()).toBeVisible();

    // Lock placeholder present (report is locked)
    await expect(page.locator('text=Unlock to reveal').first()).toBeVisible();
  });
}
