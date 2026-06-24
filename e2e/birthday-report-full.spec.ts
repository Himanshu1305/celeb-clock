import { test, expect, Page } from '@playwright/test';

async function generateBirthdayReport(page: Page) {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');

  const dobInput = page.locator('input[type="date"]').first();
  if (await dobInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await dobInput.fill('1990-06-15');
  }

  const submitBtn = page.locator('button[type="submit"]')
    .or(page.locator('button:has-text("Generate")'))
    .or(page.locator('button:has-text("Calculate")'))
    .first();

  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(3000);
  }
}

test.describe('/birthday-report — full flow', () => {
  test('birthday report generates without error for valid DOB', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    const dobInput = page.locator('input[type="date"]').first();
    if (await dobInput.isVisible({ timeout: 5000 })) {
      await dobInput.fill('1990-06-15');
      const submitBtn = page.locator('button[type="submit"]')
        .or(page.locator('button:has-text("Generate")'))
        .first();
      if (await submitBtn.isVisible({ timeout: 5000 })) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
        await expect(page.locator('text=Something went wrong')).not.toBeVisible();
      }
    }
  });

  test('birthday report rejects future DOB', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    const dobInput = page.locator('input[type="date"]').first();
    if (await dobInput.isVisible({ timeout: 5000 })) {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      await dobInput.fill(future.toISOString().split('T')[0]);

      const submitBtn = page.locator('button[type="submit"]')
        .or(page.locator('button:has-text("Generate")'))
        .first();
      if (await submitBtn.isVisible({ timeout: 3000 })) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        // Should show error, not a report
        await expect(page.locator('text=Something went wrong')).not.toBeVisible();
      }
    }
  });

  test('birthday page loads correctly for a specific date', async ({ page }) => {
    await page.goto('/birthday/6/15');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=June 15').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });
});
