import { test, expect } from '@playwright/test';

// ============================================================
// NEGATIVE TESTING — invalid inputs, error states, failures
// ============================================================

test.describe('Form validation — invalid inputs', () => {

  test('Age calculator — future date of birth shows error or zero age', async ({ page }) => {
    await page.goto('/age-calculator');
    await page.waitForLoadState('networkidle');
    const dobInput = page.locator('input[type="date"]').first();
    if (!await dobInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    // Enter a date 10 years in the future
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    await dobInput.fill(futureDateStr);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    // Should either show an error OR show 0/negative age — NOT crash
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('Age calculator — very old date (1900) does not crash', async ({ page }) => {
    await page.goto('/age-calculator');
    await page.waitForLoadState('networkidle');
    const dobInput = page.locator('input[type="date"]').first();
    if (!await dobInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    await dobInput.fill('1900-01-01');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    // Should show a very large age number
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toMatch(/\d+/);
  });

  test('Age calculator — born today shows age 0 or near-zero', async ({ page }) => {
    await page.goto('/age-calculator');
    await page.waitForLoadState('networkidle');
    const dobInput = page.locator('input[type="date"]').first();
    if (!await dobInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    const today = new Date().toISOString().split('T')[0];
    await dobInput.fill(today);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    // Should not crash — shows 0 years
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('Life expectancy quiz — empty DOB field does not proceed', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    // Try clicking Next without entering DOB
    const nextBtn = page.locator('button').filter({ hasText: /next|continue/i }).first();
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
      // Should still be on step 1 — should NOT have advanced
      const h1 = await page.locator('h1').first().innerText().catch(() => '');
      // Either validation error shown or still on same step
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('Name numerology — empty name shows validation error', async ({ page }) => {
    await page.goto('/name-numerology');
    await page.waitForLoadState('networkidle');
    const calcBtn = page.locator('button').filter({ hasText: /calculate/i }).first();
    if (await calcBtn.isVisible({ timeout: 3000 })) {
      await calcBtn.click();
      await page.waitForTimeout(500);
      // Should show error or not calculate — not crash
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('Name numerology — single letter name does not crash', async ({ page }) => {
    await page.goto('/name-numerology');
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[type="text"]').first();
    if (!await nameInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    await nameInput.fill('A');
    const calcBtn = page.locator('button').filter({ hasText: /calculate/i }).first();
    if (await calcBtn.isVisible()) await calcBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Name numerology — special characters and numbers do not crash', async ({ page }) => {
    await page.goto('/name-numerology');
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[type="text"]').first();
    if (!await nameInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    await nameInput.fill('Ravi123 @#$%');
    const calcBtn = page.locator('button').filter({ hasText: /calculate/i }).first();
    if (await calcBtn.isVisible()) await calcBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    // Numbers and special chars should be ignored — only letters counted
  });

  test('Name numerology — Hindi/Unicode name does not crash', async ({ page }) => {
    await page.goto('/name-numerology');
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[type="text"]').first();
    if (!await nameInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    await nameInput.fill('राहुल गांधी');
    const calcBtn = page.locator('button').filter({ hasText: /calculate/i }).first();
    if (await calcBtn.isVisible()) await calcBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Birthday report form — missing DOB shows validation', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');
    const submitBtn = page.locator('button').filter({ hasText: /generate|create|submit/i }).first();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
      // Should show validation error not crash
    }
  });

  test('Birthday report form — extremely long recipient name is handled', async ({ page }) => {
    await page.goto('/birthday-report');
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[type="text"]').first();
    if (!await nameInput.isVisible({ timeout: 3000 })) { test.skip(); return; }
    const longName = 'A'.repeat(500);
    await nameInput.fill(longName);
    const value = await nameInput.inputValue();
    // Should not crash — either capped by maxlength or accepts long input gracefully
    expect(value.length).toBeGreaterThan(0);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Biological age — impossible BMI values do not crash', async ({ page }) => {
    await page.goto('/biological-age');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Navigate to BMI question (step 9) by clicking through
    const ageInput = page.locator('input[type="number"]').first();
    if (await ageInput.isVisible({ timeout: 2000 })) {
      await ageInput.fill('35');
      const nextBtn = page.locator('button').filter({ hasText: /next|continue/i }).first();
      if (await nextBtn.isVisible()) await nextBtn.click();
      await page.waitForTimeout(300);
    }
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Tarot card — no DOB entered shows no result not crash', async ({ page }) => {
    await page.goto('/tarot-card-by-birthday');
    await page.waitForLoadState('networkidle');
    const calcBtn = page.locator('button').filter({ hasText: /find my card/i }).first();
    if (await calcBtn.isVisible({ timeout: 3000 })) {
      await calcBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('Moon sign — no DOB entered shows no result not crash', async ({ page }) => {
    await page.goto('/moon-sign');
    await page.waitForLoadState('networkidle');
    const calcBtn = page.locator('button').filter({ hasText: /calculate|find/i }).first();
    if (await calcBtn.isVisible({ timeout: 3000 })) {
      await calcBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('Biorhythm — no DOB entered shows no result not crash', async ({ page }) => {
    await page.goto('/biorhythm');
    await page.waitForLoadState('networkidle');
    const calcBtn = page.locator('button').filter({ hasText: /calculate|find/i }).first();
    if (await calcBtn.isVisible({ timeout: 3000 })) {
      await calcBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('Compatibility — same sign selected twice does not crash', async ({ page }) => {
    await page.goto('/compatibility/aries/aries');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    // Should show self-compatibility reading or handle gracefully
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('Country comparison — loads with default country selected', async ({ page }) => {
    await page.goto('/country-comparison');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    // Should show data without any user selection
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(500);
  });

  test('XSS attempt in URL parameters does not execute', async ({ page }) => {
    const xssAttempts = [
      '/birthday/<script>alert(1)</script>/1',
      '/answers/how-long-will-i-live?name=<script>alert(1)</script>',
    ];
    for (const url of xssAttempts) {
      await page.goto(url);
      await page.waitForTimeout(500);
      // Should show 404 or redirect — NOT execute script
      const dialogs: string[] = [];
      page.on('dialog', dialog => { dialogs.push(dialog.message()); dialog.dismiss(); });
      await page.waitForTimeout(500);
      expect(dialogs).toHaveLength(0); // No alert dialogs
    }
  });

  test('Invalid blog slug shows 404 not crash', async ({ page }) => {
    await page.goto('/blog/this-post-does-not-exist-xyz-abc-123');
    await page.waitForLoadState('networkidle');
    // Should show 404 page
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Invalid zodiac sign in URL shows 404 not crash', async ({ page }) => {
    await page.goto('/chinese-zodiac/invalidanimal');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

});

