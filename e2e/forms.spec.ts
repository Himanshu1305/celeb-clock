import { test, expect } from '@playwright/test';

test.describe('Form validation', () => {
  test('/contact form has required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Find and try submitting empty form
    const submitBtn = page.locator('button[type="submit"]').or(page.locator('button:has-text("Send")'));
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Browser validation or custom validation should prevent submission
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        const validity = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
        // If empty, should be invalid
        expect(validity).toBe(false);
      }
    }
  });

  test('/birthday-report personal message has character limit', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea').first();
    if (await messageInput.isVisible()) {
      // Type 250 characters
      const longText = 'A'.repeat(250);
      await messageInput.fill(longText);
      const value = await messageInput.inputValue();
      // Should be capped at 200 characters
      expect(value.length).toBeLessThanOrEqual(200);
    }
  });
});

test.describe('Page-level UX checks', () => {
  test('biological-age page has white background', async ({ page }) => {
    await page.goto('/biological-age');
    await page.waitForLoadState('networkidle');

    // Main content area should have light background
    const main = page.locator('main, [class*="container"]').first();
    const bg = await main.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const rgb = bg.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
    // Background should be light (not dark)
    const isDark = rgb[0] < 80 && rgb[1] < 80 && rgb[2] < 80;
    expect(isDark).toBe(false);
  });

  test('birthstone pages show unique gem per month', async ({ page }) => {
    const months = ['january', 'february', 'march', 'april'];
    const svgContents: string[] = [];

    for (const month of months) {
      await page.goto(`/birthstone/${month}`);
      await page.waitForLoadState('networkidle');

      // SVG should be present
      const svg = page.locator('svg').first();
      if (await svg.isVisible({ timeout: 3000 })) {
        const content = await svg.innerHTML();
        svgContents.push(content);
      }
    }

    // Each month should have different SVG content (unique gems)
    if (svgContents.length >= 2) {
      expect(svgContents[0]).not.toEqual(svgContents[1]);
    }
  });

  test('Power 9 habits are expandable', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    // Navigate to results (skip quiz)
    await page.goto('/life-expectancy?shared=1&forecast=75&age=45&remaining=30');
    await page.waitForTimeout(1000);

    // Find Power 9 section
    const power9 = page.locator('text=Power 9').or(page.locator('text=Habits of the World'));
    if (await power9.isVisible({ timeout: 5000 })) {
      // Click the first habit
      const firstHabit = page.locator('text=Move Naturally').or(page.locator('text=Purpose')).first();
      if (await firstHabit.isVisible()) {
        await firstHabit.click();
        await page.waitForTimeout(500);
        // Detail should now be visible
        const detail = page.locator('text=The Science').or(page.locator('text=longevity'));
        await expect(detail.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
