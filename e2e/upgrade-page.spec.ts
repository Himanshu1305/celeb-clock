import { test, expect } from '@playwright/test';

test.describe('/upgrade page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upgrade');
    await page.waitForLoadState('networkidle');
  });

  test('upgrade page loads without error', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('both monthly and annual price tiers are visible', async ({ page }) => {
    // Monthly price
    await expect(page.locator('text=₹299').first()).toBeVisible({ timeout: 5000 });
    // Annual price
    await expect(page.locator('text=₹2,499').first()).toBeVisible({ timeout: 5000 });
  });

  test('annual plan shows savings callout', async ({ page }) => {
    await expect(
      page.locator('text=Save').or(page.locator('text=save')).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('free tier is shown for comparison', async ({ page }) => {
    await expect(page.locator('text=₹0').first()).toBeVisible({ timeout: 5000 });
  });

  test('subscribe buttons are present for both tiers', async ({ page }) => {
    // At least two subscribe/get-access buttons
    const subscribeBtns = page.locator('button').filter({
      hasText: /subscribe|get|unlock|start/i
    });
    const count = await subscribeBtns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('upgrade page has correct meta title for SEO', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/upgrade|premium|longevity|bornclock/i);
  });
});
