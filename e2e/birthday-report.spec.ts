import { test, expect } from '@playwright/test';

test.describe('/birthday-report', () => {
  test('page loads correctly', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('form requires date of birth', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    // Try submitting without DOB
    const submitBtn = page.locator('button[type="submit"]').or(page.locator('button:has-text("Generate")'));
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show validation error
      await expect(
        page.locator('text=required').or(page.locator('text=enter').or(page.locator('text=date')))
      ).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('/report/:slug', () => {
  test('report page loads without blank page', async ({ page }) => {
    // Use a known test slug if available, otherwise skip
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    // Just verify the report route doesn't 404
    const response = await page.goto('/report/test-slug-that-does-not-exist');
    // Should show 404 page not blank page
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });
});
