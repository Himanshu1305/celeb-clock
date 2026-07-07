/**
 * 02-report-lifecycle — Create a birthday report as a guest and verify the
 * locked-preview state: cover + twins visible, sections 3-7 show lock placeholder,
 * unlock CTA present, download button hidden.
 */
import { test, expect, type Page } from '@playwright/test';

const FORM_DOB = '1990-06-15';
const FORM_NAME = 'Gauntlet Test';

async function fillDob(page: Page, dob: string) {
  const [y, m, d] = dob.split('-');
  await page.locator('input[placeholder="DD"]').first().fill(String(parseInt(d)));
  await page.locator('input[placeholder="MM"]').first().fill(String(parseInt(m)));
  await page.locator('input[placeholder="YYYY"]').first().fill(y);
}

test.describe('Birthday report creation and locked preview', () => {
  let reportUrl = '';

  test('form submits and redirects to /report/[slug]', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    // Fill recipient name
    await page.locator('input[placeholder*="Priya"]').first().fill(FORM_NAME);

    // Fill DOB
    await fillDob(page, FORM_DOB);

    // Submit
    await page.locator('button:has-text("Create Birthday Report")').click();

    // Wait for success screen (app stays on /birthday-report, shows "Report Ready!")
    await page.waitForSelector('text=Report Ready!', { timeout: 30000 });

    // Get the report href from the "Open Report" link and navigate to it
    const reportHref = await page.locator('a:has-text("Open Report")').getAttribute('href');
    expect(reportHref).toMatch(/\/report\/[a-z0-9-]+/);
    await page.goto(reportHref!);
    await page.waitForLoadState('networkidle');
    reportUrl = page.url();
  });

  test('locked report: cover and twins section visible', async ({ page }) => {
    test.skip(!reportUrl, 'requires previous test to get reportUrl');
    await page.goto(reportUrl);
    await page.waitForLoadState('networkidle');

    // Cover section visible (section 1)
    const cover = page.locator('.report-cover-section').first();
    await expect(cover).toBeVisible();

    // Celebrity Twins section visible (section 2 — code "01 · TWINS")
    const twinsHeader = page.locator('text=Celebrity Birthday Twins').first();
    await expect(twinsHeader).toBeVisible();
  });

  test('locked report: sections 3-7 show lock placeholder, not real content', async ({ page }) => {
    test.skip(!reportUrl, 'requires previous test to get reportUrl');
    await page.goto(reportUrl);
    await page.waitForLoadState('networkidle');

    // Lock placeholder is visible — LockedSectionsBlock shows "Locked sections" label
    const lockPlaceholder = page.locator('text=Locked sections').first();
    await expect(lockPlaceholder).toBeVisible();

    // Real section body content should NOT be visible (LockedSection shows header/desc only)
    // "Moon Sign & Nakshatra" heading only renders in the real unlocked zodiac body
    const zodiacContent = page.locator('h2:has-text("Moon Sign")');
    await expect(zodiacContent).not.toBeVisible();

    const numerologyContent = page.locator('text=What Is Numerology');
    await expect(numerologyContent).not.toBeVisible();
  });

  test('locked report: unlock CTA visible with buy button', async ({ page }) => {
    test.skip(!reportUrl, 'requires previous test to get reportUrl');
    await page.goto(reportUrl);
    await page.waitForLoadState('networkidle');

    // Unlock CTA heading
    const ctaHeading = page.locator(`text=Unlock ${FORM_NAME}'s Full Blueprint`).first();
    await expect(ctaHeading).toBeVisible();

    // Sign-in-to-unlock or buy button visible
    const unlockBtn = page.locator('a:has-text("Sign in to Unlock"), button:has-text("Unlock —")').first();
    await expect(unlockBtn).toBeVisible();
  });

  test('locked report: download PDF button hidden', async ({ page }) => {
    test.skip(!reportUrl, 'requires previous test to get reportUrl');
    await page.goto(reportUrl);
    await page.waitForLoadState('networkidle');

    // Download PDF button should NOT be visible (hidden when locked)
    const downloadBtn = page.locator('button:has-text("Download PDF")');
    await expect(downloadBtn).not.toBeVisible();
  });

  test('locked report: copy link button still visible', async ({ page }) => {
    test.skip(!reportUrl, 'requires previous test to get reportUrl');
    await page.goto(reportUrl);
    await page.waitForLoadState('networkidle');

    // Copy link is always available (locked reports are shareable)
    const copyBtn = page.locator('button:has-text("Copy Link"), button:has-text("Copied")').first();
    await expect(copyBtn).toBeVisible();
  });
});
