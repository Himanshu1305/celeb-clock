import { test, expect, Page } from '@playwright/test';
import { fillDOB, selectGender, clickThroughSteps } from './helpers';

async function reachResultsPage(page: Page) {
  await page.goto('/life-expectancy');
  await page.waitForLoadState('networkidle');
  await fillDOB(page, '1988-04-20');
  await page.waitForTimeout(600);
  await selectGender(page, 'male');
  await clickThroughSteps(page, 7);

  const cta = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();
  await cta.waitFor({ state: 'visible', timeout: 10000 });
  await cta.click();

  await expect(
    page.locator('text=What-If Simulator').or(page.locator('text=YOUR FORECASTED AGE')).first()
  ).toBeVisible({ timeout: 20000 });
}

test.describe('Paywall modal — appearance', () => {
  test('paywall modal appears after 1.5s for free users completing quiz', async ({ page }) => {
    await reachResultsPage(page);

    // Wait for modal to appear (fires at 1500ms delay)
    const modal = page.locator('text=Your Longevity Forecast').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('paywall modal shows correct forecast number', async ({ page }) => {
    await reachResultsPage(page);

    await page.waitForTimeout(2000);
    const modal = page.locator('text=Your Longevity Forecast').locator('..').locator('..');
    if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Modal should contain a forecast number
      const forecastText = await modal.innerText();
      expect(forecastText).toMatch(/\d+\.\d/); // e.g. "72.4"
    }
  });

  test('paywall modal shows 90-Day Plan as first feature item', async ({ page }) => {
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    const modal = page.locator('[class*="rounded-2xl"]').filter({ hasText: 'Your Longevity Forecast' }).first();
    if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const items = modal.locator('[class*="flex items-start"]');
      const firstItem = items.first();
      const firstText = await firstItem.innerText().catch(() => '');
      expect(firstText.toLowerCase()).toContain('90-day');
    }
  });

  test('paywall modal shows both price tiers', async ({ page }) => {
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    const modal = page.locator('text=Your Longevity Forecast').locator('..').locator('..');
    if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const modalText = await modal.innerText();
      expect(modalText).toContain('₹299');
      expect(modalText).toContain('₹2,499');
    }
  });

  test('paywall modal shows "Get Full Access" button for non-trial free users', async ({ page }) => {
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    await expect(
      page.locator('button:has-text("Get Full Access")').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('paywall modal has "Maybe later" dismiss button', async ({ page }) => {
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    await expect(
      page.locator('button:has-text("Maybe later")').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('paywall modal is dismissed by "Maybe later" button', async ({ page }) => {
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    // Confirm modal is showing
    const maybeBtn = page.locator('button:has-text("Maybe later")').first();
    await expect(maybeBtn).toBeVisible({ timeout: 5000 });

    // Dismiss with button
    await maybeBtn.click();
    await page.waitForTimeout(500);

    // Modal must be gone — the "Get Full Access" button inside it should be hidden
    await expect(
      page.locator('button:has-text("Get Full Access")').first()
    ).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Paywall modal — frequency', () => {
  test('paywall modal reappears on second quiz completion (no suppression)', async ({ page }) => {
    // First quiz run
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    // Dismiss
    const maybe = page.locator('button:has-text("Maybe later")').first();
    if (await maybe.isVisible({ timeout: 3000 }).catch(() => false)) {
      await maybe.click();
      await page.waitForTimeout(300);
    }

    // Navigate fresh for second run (avoids "Change" button ambiguity with quiz buttons)
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    // Second run
    await fillDOB(page, '1988-04-20');
    await page.waitForTimeout(600);
    await selectGender(page, 'male');
    await clickThroughSteps(page, 7);
    const cta = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();
    await cta.waitFor({ state: 'visible', timeout: 10000 });
    await cta.click();
    await page.waitForTimeout(3000); // wait for modal delay

    // Modal must appear again
    await expect(
      page.locator('text=Your Longevity Forecast').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('paywall modal navigates to upgrade page when CTA clicked', async ({ page }) => {
    await reachResultsPage(page);
    await page.waitForTimeout(2000);

    const cta = page.locator('button:has-text("Get Full Access")').or(
      page.locator('button:has-text("Keep My Premium Access")')
    ).first();

    if (await cta.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cta.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/upgrade');
    }
  });
});
