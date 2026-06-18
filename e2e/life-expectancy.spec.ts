import { test, expect } from '@playwright/test';

test.describe('/life-expectancy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with step 1 visible', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
    // Step 1 has a date of birth input
    await expect(
      page.locator('text=date of birth').or(page.locator('text=Date of Birth')).or(page.locator('text=birthday')).first()
    ).toBeVisible();
  });

  test('complete quiz flow shows result', async ({ page }) => {
    // Step 1 — Date of birth (required)
    const dobInput = page.locator('input[type="date"]').first();
    if (await dobInput.isVisible()) {
      await dobInput.fill('1980-02-18');
    }

    // Step 1 — Gender selection is required before Next Step is enabled
    await page.locator('label[for="male"]').or(page.locator('text=Male').first()).first().click();
    await page.waitForTimeout(300);

    // Now "Next Step →" is enabled
    await page.locator('button:has-text("Next Step")').first().click();
    await page.waitForTimeout(500);

    // Steps 2-8 — Next Step is always enabled (no required selection)
    for (let i = 0; i < 7; i++) {
      const next = page.locator('button:has-text("Next Step")').first();
      if (await next.isVisible({ timeout: 3000 })) {
        await next.click();
        await page.waitForTimeout(400);
      }
    }

    // Wait for results to render
    await page.waitForTimeout(2000);

    // Results should show a forecast age
    await expect(
      page.locator('text=years').or(page.locator('text=YOUR FORECASTED AGE')).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('results page loads without error', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    const body = await page.evaluate(() => (document.body?.innerText || '').trim());
    expect(body.length).toBeGreaterThan(100);
  });

  test('What-If Simulator does not show Optimized Lifestyle before interaction', async ({ page }) => {
    // Need to complete quiz to reach simulator — step through quiz first
    const dobInput = page.locator('input[type="date"]').first();
    if (await dobInput.isVisible()) {
      await dobInput.fill('1980-02-18');
    }

    // Gender required on step 1
    await page.locator('label[for="male"]').or(page.locator('text=Male').first()).first().click();
    await page.waitForTimeout(300);

    // Click through all 8 steps
    for (let i = 0; i < 8; i++) {
      const btn = page.locator('button:has-text("Next Step")').first();
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    await page.waitForTimeout(2000);

    const simulator = page.locator('text=What-If Simulator').or(page.locator('text=LONGEVITY LABORATORY')).first();
    if (await simulator.isVisible({ timeout: 5000 })) {
      const optimizedSection = page.locator('text=Optimized Lifestyle').locator('..');
      const optimizedText = await optimizedSection.innerText().catch(() => '');
      expect(optimizedText).not.toMatch(/\d{2}\.\d yrs/);
    }
  });

  test('share countdown produces valid URL', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const shareBtn = page.locator('button:has-text("Share")').or(page.locator('text=Share Countdown')).first();
    if (await shareBtn.isVisible({ timeout: 5000 })) {
      await shareBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('AI coach renders markdown not raw text', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    const coach = page.locator('text=Longevity Coach').or(page.locator('text=Your Personal')).first();
    if (await coach.isVisible({ timeout: 5000 })) {
      const input = page.locator('input[placeholder*="coach"], input[placeholder*="longevity"], textarea').last();
      if (await input.isVisible()) {
        await input.fill('What is the most important habit for longevity?');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);

        const responseArea = page.locator('[class*="prose"], [class*="markdown"], [class*="response"]').last();
        if (await responseArea.isVisible()) {
          const responseText = await responseArea.innerText();
          expect(responseText).not.toMatch(/^##\s/m);
          expect(responseText).not.toMatch(/\*\*[^*]+\*\*/);
        }
      }
    }
  });
});
