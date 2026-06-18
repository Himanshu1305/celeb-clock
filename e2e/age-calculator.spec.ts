import { test, expect } from '@playwright/test';

test.describe('/age-calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/age-calculator');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with date input', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    // Date input exists
    const input = page.locator('input[type="date"], input[type="text"]').first();
    await expect(input).toBeVisible();
  });

  test('entering DOB shows age results', async ({ page }) => {
    // Enter a known date of birth
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill('1980-06-17');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Should show years old
    await expect(page.locator('text=Years Old').or(page.locator('text=years old'))).toBeVisible();

    // Should show total seconds — and they must be a large number
    const secondsEl = page.locator('text=Total Seconds').locator('..').locator('..').first();
    const text = await secondsEl.innerText();
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    expect(number).toBeGreaterThan(1_000_000_000);
  });

  test('total seconds counter updates every second', async ({ page }) => {
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill('1980-01-01');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Read total seconds value twice, 2 seconds apart
    const getSeconds = async () => {
      const cells = page.locator('text=Total Seconds');
      const parent = cells.locator('../../..').first();
      const text = await parent.innerText();
      return parseInt(text.replace(/[^0-9]/g, ''));
    };

    const before = await getSeconds();
    await page.waitForTimeout(2100);
    const after = await getSeconds();

    // Should have increased by approximately 2
    expect(after - before).toBeGreaterThanOrEqual(1);
    expect(after - before).toBeLessThanOrEqual(4);
  });

  test('shows generation for 1980 birth year', async ({ page }) => {
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill('1980-06-17');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // 1980 is Gen X (1965-1980)
    await expect(page.locator('text=Gen X')).toBeVisible();
  });

  test('shows celebrity birthday matches', async ({ page }) => {
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill('1980-06-17');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Celebrity section should appear
    await expect(
      page.locator('text=Celebrity Birthday').or(page.locator('text=Celebrity Match'))
    ).toBeVisible();
  });

  test('generation matches homepage results for same DOB', async ({ page }) => {
    // Get generation from age calculator
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill('1990-03-15');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const genEl = page.locator('text=Millennial').or(page.locator('text=Gen Z')).or(page.locator('text=Gen X')).first();
    const ageCalcGeneration = await genEl.innerText();

    // Now check homepage results
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter same DOB on homepage
    const dayInput = page.locator('input[placeholder="DD"]').or(page.locator('[name="day"]')).first();
    if (await dayInput.isVisible()) {
      await dayInput.fill('15');
      const monthInput = page.locator('input[placeholder="MM"]').or(page.locator('[name="month"]')).first();
      await monthInput.fill('03');
      const yearInput = page.locator('input[placeholder="YYYY"]').or(page.locator('[name="year"]')).first();
      await yearInput.fill('1990');
      await page.locator('button:has-text("Reveal")').click();
      await page.waitForTimeout(2000);

      // Generation should match
      const resultsGen = page.locator(`text=${ageCalcGeneration}`).first();
      await expect(resultsGen).toBeVisible();
    }
  });
});
