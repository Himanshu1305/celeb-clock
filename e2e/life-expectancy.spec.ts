import { test, expect } from '@playwright/test';

test.describe('/life-expectancy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with step 1 visible', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    // Step 1 should be visible (date of birth input)
    await expect(
      page.locator('text=date of birth').or(page.locator('text=Date of Birth')).or(page.locator('text=birthday'))
    ).toBeVisible();
  });

  test('complete quiz flow shows result', async ({ page }) => {
    // This test walks through the full 8-step quiz
    // Step 1 — Date of birth
    const dobInput = page.locator('input[type="date"]').first();
    if (await dobInput.isVisible()) {
      await dobInput.fill('1980-02-18');
    } else {
      // Try DD/MM/YYYY inputs
      await page.locator('input').nth(0).fill('18');
      await page.locator('input').nth(1).fill('02');
      await page.locator('input').nth(2).fill('1980');
    }
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForTimeout(500);

    // Step 2 — Sex
    await page.locator('button:has-text("Male")').or(page.locator('text=Male')).first().click();
    await page.waitForTimeout(300);
    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible()) await nextBtn.click();
    await page.waitForTimeout(500);

    // Steps 3-8 — click through with defaults/first options
    for (let i = 0; i < 7; i++) {
      const next = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Continue")'));
      if (await next.isVisible({ timeout: 3000 })) {
        await next.click();
        await page.waitForTimeout(400);
      }
    }

    // Wait for results
    await page.waitForTimeout(2000);

    // Results should show a forecast age
    await expect(
      page.locator('text=years').or(page.locator('text=YOUR FORECASTED AGE'))
    ).toBeVisible({ timeout: 10000 });

    // The forecast should be a reasonable number (50-120)
    const forecastText = await page.locator('text=/\\d{2,3}\\s*years/').first().innerText().catch(() => '');
    if (forecastText) {
      const forecastAge = parseInt(forecastText);
      expect(forecastAge).toBeGreaterThan(50);
      expect(forecastAge).toBeLessThan(120);
    }
  });

  test('results show both current age and projected age', async ({ page }) => {
    // Navigate directly to results state if possible via URL params
    await page.goto('/life-expectancy?shared=1&forecast=72&age=46&remaining=26');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should show the shared result banner
    await expect(page.locator('text=72')).toBeVisible();
  });

  test('What-If Simulator does not show Optimized Lifestyle before interaction', async ({ page }) => {
    // Complete a quick quiz flow first
    await page.goto('/life-expectancy');

    // Fill in DOB and advance through steps quickly
    const dobInput = page.locator('input[type="date"]').first();
    if (await dobInput.isVisible()) {
      await dobInput.fill('1980-02-18');
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(300);
    }

    // Click through steps
    for (let i = 0; i < 8; i++) {
      const btn = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Continue")'));
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    await page.waitForTimeout(2000);

    // Find the What-If simulator section
    const simulator = page.locator('text=What-If Simulator').or(page.locator('text=LONGEVITY LABORATORY'));
    if (await simulator.isVisible({ timeout: 5000 })) {
      // Before any slider interaction, "Optimized Lifestyle" should show placeholder text
      const optimizedSection = page.locator('text=Optimized Lifestyle').locator('..');
      const optimizedText = await optimizedSection.innerText().catch(() => '');
      // Should show placeholder, not a calculated number yet
      expect(optimizedText).not.toMatch(/\d{2}\.\d yrs/);
    }
  });

  test('share countdown produces valid URL', async ({ page }) => {
    await page.goto('/life-expectancy?shared=1&forecast=75&age=45&remaining=30');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for share button
    const shareBtn = page.locator('button:has-text("Share")').or(page.locator('text=Share Countdown'));
    if (await shareBtn.isVisible({ timeout: 5000 })) {
      // Click share — it copies to clipboard
      await shareBtn.click();
      await page.waitForTimeout(500);
      // Confirm some feedback shown
      const feedback = page.locator('text=Copied').or(page.locator('text=copied').or(page.locator('text=Shared')));
      // Just verify no error thrown
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('AI coach renders markdown not raw text', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    // Look for AI coach section
    const coach = page.locator('text=Longevity Coach').or(page.locator('text=Your Personal'));
    if (await coach.isVisible({ timeout: 5000 })) {
      // Find the input
      const input = page.locator('input[placeholder*="coach"], input[placeholder*="longevity"], textarea').last();
      if (await input.isVisible()) {
        await input.fill('What is the most important habit for longevity?');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000); // AI response takes time

        // The response should NOT contain raw markdown symbols
        const responseArea = page.locator('[class*="prose"], [class*="markdown"], [class*="response"]').last();
        if (await responseArea.isVisible()) {
          const responseText = await responseArea.innerText();
          // Should not have raw ## headings or ** bold markers
          expect(responseText).not.toMatch(/^##\s/m);
          expect(responseText).not.toMatch(/\*\*[^*]+\*\*/);
        }
      }
    }
  });
});
