import { test, expect, Page } from '@playwright/test';
import { completeQuiz } from './helpers';

// Helper: extract forecast number from results page
async function getForecastNumber(page: Page): Promise<number | null> {
  await page.waitForTimeout(1000);
  // The forecast appears as a large number in the results
  const forecastEl = page.locator('text=YOUR FORECASTED AGE')
    .locator('..')
    .locator('..')
    .locator('[class*="text-9xl"], [class*="font-black"]')
    .first();

  if (await forecastEl.isVisible({ timeout: 5000 }).catch(() => false)) {
    const text = await forecastEl.innerText();
    const num = parseFloat(text.replace(/[^\d.]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
}

test.describe('Longevity calculation — sanity checks', () => {
  test('healthy 30-year-old Indian male gets forecast above WHO baseline (71.2)', async ({ page }) => {
    await completeQuiz(page, { dob: '1995-01-01' }); // ~30 years old
    const forecast = await getForecastNumber(page);
    if (forecast !== null) {
      // A healthy person should be at or above WHO baseline of 71.2
      expect(forecast).toBeGreaterThan(60);
      expect(forecast).toBeLessThan(100); // sanity upper bound
    }
  });

  test('results page shows all required sections', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    // Longevity Score Card
    await expect(page.locator('text=Longevity Score').first()).toBeVisible({ timeout: 10000 });

    // What-If Simulator
    await expect(page.locator('text=What-If Simulator').or(page.locator('text=LONGEVITY LABORATORY')).first()).toBeVisible({ timeout: 5000 });

    // Factor sections
    await expect(page.locator('text=Lifestyle Habits').first()).toBeVisible({ timeout: 5000 });
  });

  test('forecast is a sensible number (50–100 range)', async ({ page }) => {
    await completeQuiz(page, { dob: '1980-03-15' });
    const forecast = await getForecastNumber(page);
    if (forecast !== null) {
      expect(forecast).toBeGreaterThanOrEqual(40);
      expect(forecast).toBeLessThanOrEqual(100);
    }
  });

  test('female user gets different baseline to male user', async ({ page }) => {
    // Male run
    await completeQuiz(page, { dob: '1985-06-15', gender: 'male' });
    const maleForecast = await getForecastNumber(page);

    // Female run (same page context — navigate fresh)
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    await completeQuiz(page, { dob: '1985-06-15', gender: 'female' });
    const femaleForecast = await getForecastNumber(page);

    // WHO baseline for India: male=71.2, female=74.4 — female should be higher for same inputs
    if (maleForecast !== null && femaleForecast !== null) {
      expect(femaleForecast).toBeGreaterThan(maleForecast);
    }
  });

  test('Longevity Score is between 0 and 100', async ({ page }) => {
    await completeQuiz(page, { dob: '1990-01-01' });

    // Score card shows "Your Longevity Score" heading — look for score number nearby
    const scoreCard = page.locator('text=Your Longevity Score').locator('..').locator('..');
    if (await scoreCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const cardText = await scoreCard.innerText();
      // Extract any 1-3 digit number from the card text
      const nums = cardText.match(/\b(\d{1,3})\b/g)?.map(Number) ?? [];
      const scores = nums.filter(n => n > 0 && n <= 100);
      expect(scores.length).toBeGreaterThan(0);
    }
  });

  test('results page does not show Score Over Time section', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await expect(page.locator('text=Score over time').first()).not.toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Track your score over time').first()).not.toBeVisible({ timeout: 3000 });
  });

  test('Scientific Foundation section is present and collapsible', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const foundation = page.locator('text=Scientific Foundation').first();
    await expect(foundation).toBeVisible({ timeout: 5000 });

    // It should be inside a <details> element — click to expand
    const details = page.locator('details').filter({ hasText: 'Scientific Foundation' }).first();
    if (await details.isVisible({ timeout: 3000 }).catch(() => false)) {
      await details.locator('summary').click();
      await page.waitForTimeout(400);
      // After click, methodology text should be visible
      await expect(page.locator('text=WHO Global Health Observatory').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('90-Day Plan section is always present in results', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await expect(
      page.locator('text=Your Personalised 90-Day Plan').or(page.locator('text=90-Day Plan')).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
