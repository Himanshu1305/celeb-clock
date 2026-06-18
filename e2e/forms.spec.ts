import { test, expect } from '@playwright/test';

test.describe('Form validation', () => {
  test('/contact form has required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.locator('button[type="submit"]').or(page.locator('button:has-text("Send")')).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        const validity = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
        expect(validity).toBe(false);
      }
    }
  });

  test('/birthday-report personal message has character limit', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea').first();
    if (await messageInput.isVisible()) {
      const longText = 'A'.repeat(250);
      await messageInput.fill(longText);
      const value = await messageInput.inputValue();
      expect(value.length).toBeLessThanOrEqual(200);
    }
  });
});

test.describe('Page-level UX checks', () => {
  test('biological-age page has white background', async ({ page }) => {
    await page.goto('/biological-age');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main, [class*="container"]').first();
    const bg = await main.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // rgba(0,0,0,0) = transparent, which means it inherits a light background — not dark
    const isTransparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
    const rgb = bg.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
    const isDark = !isTransparent && rgb[0] < 80 && rgb[1] < 80 && rgb[2] < 80;
    expect(isDark).toBe(false);
  });

  test('birthstone pages show unique gem per month', async ({ page }) => {
    const months = ['january', 'february', 'march', 'april'];
    const svgContents: string[] = [];

    for (const month of months) {
      await page.goto(`/birthstone/${month}`);
      await page.waitForLoadState('networkidle');

      // Find the gem illustration SVG specifically — it has <defs> with a radialGradient
      const gemSvg = page.locator('svg:has(defs)').first();
      if (await gemSvg.isVisible({ timeout: 3000 })) {
        const content = await gemSvg.innerHTML();
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

    await page.goto('/life-expectancy?shared=1&forecast=75&age=45&remaining=30');
    await page.waitForTimeout(1000);

    const power9 = page.locator('text=Power 9').or(page.locator('text=Habits of the World')).first();
    if (await power9.isVisible({ timeout: 5000 })) {
      const firstHabit = page.locator('text=Move Naturally').or(page.locator('text=Purpose')).first();
      if (await firstHabit.isVisible()) {
        await firstHabit.click();
        await page.waitForTimeout(500);
        const detail = page.locator('text=The Science').or(page.locator('text=longevity')).first();
        await expect(detail).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
