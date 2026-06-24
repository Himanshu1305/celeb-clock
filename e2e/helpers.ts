import { Page, expect } from '@playwright/test';

// ── Quiz completion ────────────────────────────────────────────────────────────

export async function fillDOB(page: Page, dob: string) {
  const dobInput = page.locator('input[type="date"]').first();
  await dobInput.waitFor({ state: 'visible', timeout: 10000 });
  await dobInput.fill(dob);
  await page.waitForTimeout(500);
}

export async function selectGender(page: Page, gender: 'male' | 'female') {
  const selector = gender === 'male'
    ? page.locator('label[for="male"]').or(page.locator('text=Male').first()).first()
    : page.locator('label[for="female"]').or(page.locator('text=Female').first()).first();
  await selector.click();
  await page.waitForTimeout(300);
}

export async function clickThroughSteps(page: Page, steps: number) {
  for (let i = 0; i < steps; i++) {
    const btn = page.locator('button:has-text("Next Step")').first();
    if (await btn.isVisible({ timeout: 3000 })) {
      await btn.click();
      await page.waitForTimeout(400);
    }
  }
}

export async function completeQuiz(page: Page, options: {
  dob?: string;
  gender?: 'male' | 'female';
} = {}) {
  await page.goto('/life-expectancy');
  await page.waitForLoadState('networkidle');

  await fillDOB(page, options.dob ?? '1985-06-15');

  await selectGender(page, options.gender ?? 'male');

  // Steps 1–7 via Next Step
  await clickThroughSteps(page, 7);

  // Step 8 — final CTA
  const cta = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();
  await cta.waitFor({ state: 'visible', timeout: 10000 });
  await cta.click();

  // Wait for results
  await expect(
    page.locator('text=What-If Simulator').or(page.locator('text=YOUR FORECASTED AGE')).first()
  ).toBeVisible({ timeout: 20000 });

  // Dismiss paywall modal if it appears
  await page.waitForTimeout(2000);
  const maybe = page.locator('button:has-text("Maybe later")').first();
  if (await maybe.isVisible({ timeout: 3000 }).catch(() => false)) {
    await maybe.click();
    await page.waitForTimeout(300);
  }
}

export async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
}

export async function interactWithSlider(page: Page) {
  const slider = page.locator('[role="slider"]').first();
  await slider.waitFor({ state: 'visible', timeout: 5000 });
  await slider.focus();
  await slider.press('ArrowRight');
  await slider.press('ArrowRight');
  await slider.press('ArrowRight');
  await page.waitForTimeout(600);
}
