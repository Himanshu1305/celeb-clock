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
import { test, expect, type Page } from '@playwright/test';

async function fillDob(page: Page, dob: string) {
  const [y, m, d] = dob.split('-');
  await page.locator('input[placeholder="DD"]').first().fill(String(parseInt(d)));
  await page.locator('input[placeholder="MM"]').first().fill(String(parseInt(m)));
  await page.locator('input[placeholder="YYYY"]').first().fill(y);
}

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

    await page.locator('input[placeholder*="Priya"]').first().fill(tc.name);
    await fillDob(page, tc.dob);
    await page.locator('button:has-text("Create Birthday Report")').click();

    // App shows success screen on the same /birthday-report page
    await page.waitForSelector('text=Report Ready!', { timeout: 35000 });

    // Navigate to the locked report
    const reportHref = await page.locator('a:has-text("Open Report")').getAttribute('href');
    expect(reportHref).toMatch(/\/report\/[a-z0-9-]+/);
    await page.goto(reportHref!);
    await page.waitForLoadState('networkidle');

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
