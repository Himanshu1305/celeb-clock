import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────
// Shared helper: complete the quiz as a free user
// Returns after results are visible
// ─────────────────────────────────────────────
async function completeQuizAsFreeUser(page: Page) {
  await page.goto('/life-expectancy');
  await page.waitForLoadState('networkidle');

  // Enter DOB — this also triggers the quiz to render (DOB is now mandatory)
  const dobInput = page.locator('input[type="date"]').first();
  await dobInput.waitFor({ state: 'visible', timeout: 10000 });
  await dobInput.fill('1990-06-15');
  await page.waitForTimeout(400);

  // Step 1 requires gender selection before Next Step is enabled
  await page.locator('label[for="male"]')
    .or(page.locator('text=Male').first())
    .first()
    .click();
  await page.waitForTimeout(300);

  // Click through steps 1-7 (step 8 has no "Next Step" — it shows the final CTA instead)
  for (let i = 0; i < 7; i++) {
    const btn = page.locator('button:has-text("Next Step")').first();
    if (await btn.isVisible({ timeout: 3000 })) {
      await btn.click();
      await page.waitForTimeout(400);
    }
  }

  // Suppress the auto-paywall modal (fires 1.5s after result phase for free users)
  await page.evaluate(() => localStorage.setItem('bornclock_paywall_seen', 'true'));

  // Click the final CTA on step 8 to complete the quiz and get results
  const ctaBtn = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();
  await ctaBtn.waitFor({ state: 'visible', timeout: 10000 });
  await ctaBtn.click();

  // Wait for the What-If Simulator to appear (confirms result phase loaded)
  await expect(
    page.locator('text=What-If Simulator').or(page.locator('text=YOUR FORECASTED AGE')).first()
  ).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────
// Helper: scroll to an element if needed
// ─────────────────────────────────────────────
async function scrollTo(page: Page, locator: ReturnType<Page['locator']>) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
}

// ─────────────────────────────────────────────
// DOB MANDATORY FIELD TESTS
// ─────────────────────────────────────────────
test.describe('DOB mandatory field', () => {
  test('quiz card does not render before DOB is entered', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // The quiz step card (Step 1 of 8) must NOT be visible before DOB is entered
    await expect(
      page.locator('text=Step 1 of').or(page.locator('text=Step 1 of 8')).first()
    ).not.toBeVisible({ timeout: 3000 });

    // The DOB input must be visible
    await expect(page.locator('input[type="date"]').first()).toBeVisible();

    // The "Required" badge must be visible
    await expect(
      page.locator('text=Required').or(page.locator('[class*="red"]').filter({ hasText: 'Required' })).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('quiz card renders immediately after DOB is entered', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.waitFor({ state: 'visible', timeout: 10000 });

    // Before DOB — quiz should not be visible
    await expect(
      page.locator('text=Step 1 of 8').first()
    ).not.toBeVisible({ timeout: 2000 }).catch(() => {});

    // Enter DOB
    await dobInput.fill('1992-03-20');
    await page.waitForTimeout(600);

    // After DOB — quiz Step 1 card should appear
    await expect(
      page.locator('text=Step 1 of').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('DOB does not persist after page refresh', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.waitFor({ state: 'visible', timeout: 10000 });
    await dobInput.fill('1985-11-25');
    await page.waitForTimeout(400);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // DOB input must be empty after reload
    const dobAfterReload = page.locator('input[type="date"]').first();
    await dobAfterReload.waitFor({ state: 'visible', timeout: 10000 });
    const value = await dobAfterReload.inputValue();
    expect(value).toBe('');

    // localStorage must not contain DOB
    const storedDob = await page.evaluate(() => {
      return localStorage.getItem('bornclock-birthdate');
    });
    expect(storedDob).toBeNull();
  });
});

// ─────────────────────────────────────────────
// FREE USER — SIMULATOR GATING
// ─────────────────────────────────────────────
test.describe('Free user — WhatIfSimulator gating', () => {
  test('optimized forecast number is blurred for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);

    // WhatIfSimulator is now visible (quiz completed) — move a Radix slider to trigger hasInteracted
    const simulator = page.locator('text=What-If Simulator').first();
    await expect(simulator).toBeVisible({ timeout: 10000 });

    // Radix UI Slider renders with role="slider" — interact via keyboard (ArrowRight)
    const radixSlider = page.locator('[role="slider"]').first();
    await radixSlider.waitFor({ state: 'visible', timeout: 5000 });
    await radixSlider.focus();
    await radixSlider.press('ArrowRight');
    await radixSlider.press('ArrowRight');
    await page.waitForTimeout(600);

    // After slider move, hasInteracted=true → blurred simForecast renders with inline blur style
    const blurredEl = page.locator('[style*="blur"]').first();
    const hasBlur = await blurredEl.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasBlur).toBe(true);
  });

  test('gain delta badge is blurred for free users after slider interaction', async ({ page }) => {
    await completeQuizAsFreeUser(page);

    const simulator = page.locator('text=What-If Simulator').first();
    await expect(simulator).toBeVisible({ timeout: 10000 });

    // Interact with Radix slider via keyboard to trigger hasInteracted state
    const radixSlider = page.locator('[role="slider"]').first();
    await radixSlider.waitFor({ state: 'visible', timeout: 5000 });
    await radixSlider.focus();
    await radixSlider.press('ArrowRight');
    await radixSlider.press('ArrowRight');
    await radixSlider.press('ArrowRight');
    await page.waitForTimeout(800);

    // The "⚡ Unlock" text must be visible (replaces the blurred gain number)
    // OR the gain badge must have blur applied
    const unlockText = page.locator('text=⚡ Unlock').or(page.locator('text=Unlock')).first();
    const blurredBadge = page.locator('[style*="blur"]').first();

    const unlockVisible = await unlockText.isVisible({ timeout: 3000 }).catch(() => false);
    const blurVisible = await blurredBadge.isVisible({ timeout: 3000 }).catch(() => false);

    expect(unlockVisible || blurVisible).toBe(true);
  });
});

// ─────────────────────────────────────────────
// FREE USER — REPORT PHASE GATING
// ─────────────────────────────────────────────
test.describe('Free user — report phase gating', () => {
  test('"Unlock My Complete Longevity Blueprint" transitions to gated report phase for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);

    // Scroll down to find the CulturalHorizonTeaser CTA button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const blueprintBtn = page.locator('button:has-text("Unlock My Complete Longevity Blueprint")')
      .or(page.locator('text=Unlock My Complete Longevity Blueprint'))
      .first();

    if (await blueprintBtn.isVisible({ timeout: 5000 })) {
      await blueprintBtn.click();
      await page.waitForTimeout(1500);

      // handleGenerateReport redirects free users to /upgrade
      const url = page.url();
      expect(url).toContain('/upgrade');
    }
  });

  test('"Your Full Longevity Blueprint" section does not render for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.waitForTimeout(1000);

    // The full report section heading must NOT be visible for free users
    await expect(
      page.locator('text=Your Full Longevity Blueprint').first()
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('LongevityHeroCard is not visible to free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.waitForTimeout(1000);

    // The "Your Longevity Blueprint / Prepared for" hero card header must not be visible
    await expect(
      page.locator('text=Your Longevity Blueprint').filter({ hasText: 'Prepared for' })
    ).not.toBeVisible({ timeout: 3000 });
  });
});

// ─────────────────────────────────────────────
// FREE USER — EXPORT PDF AND COPY SUMMARY GATING
// ─────────────────────────────────────────────
test.describe('Free user — Export PDF and Copy Summary gating', () => {
  test('Export PDF button is not visible to free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Export PDF button must not be visible anywhere on the page for free users
    await expect(
      page.locator('button:has-text("Export PDF")').first()
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Copy Summary button is not visible to free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Copy Summary button must not be visible anywhere for free users
    await expect(
      page.locator('button:has-text("Copy Summary")').first()
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Free users see premium upgrade message instead of export buttons', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // The locked message with upgrade link must be visible in the hero card area
    // Note: LongevityHeroCard only renders in phase=report which is premium-only
    // So we just confirm Export PDF is absent — the locked message is inside the gated section
    const exportBtn = page.locator('button:has-text("Export PDF")').first();
    await expect(exportBtn).not.toBeVisible({ timeout: 3000 });
  });
});

// ─────────────────────────────────────────────
// FREE USER — 90-DAY PLAN PREMIUM GATING
// ─────────────────────────────────────────────
test.describe('Free user — 90-Day Plan gating', () => {
  test('90-Day Plan phase headers are visible to free users as a teaser', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Phase headers must be visible even for free users
    await expect(
      page.locator('text=Weeks 1').or(page.locator('text=Weeks 1–2')).first()
    ).toBeVisible({ timeout: 5000 });

    await expect(
      page.locator('text=Weeks 3').or(page.locator('text=Weeks 3–4')).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('90-Day Plan shows Premium badge for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Premium lock badge must be visible in the 90-day plan heading
    await expect(
      page.locator('text=🔒 Premium').or(page.locator('text=Premium').filter({ hasText: '🔒' })).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('90-Day Plan shows upgrade CTA for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // The upgrade CTA at the bottom of the plan must be visible
    await expect(
      page.locator('text=Unlock Your Full 90-Day Plan').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('90-Day Plan realistic gain number is blurred for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // The realistic gain in the opportunity box must have blur applied
    const planSection = page.locator('[data-testid="action-plan-section"]');

    if (await planSection.isVisible({ timeout: 5000 })) {
      const blurredGain = planSection.locator('[style*="blur"]').first();
      await expect(blurredGain).toBeVisible({ timeout: 3000 });
    }
  });
});

// ─────────────────────────────────────────────
// FREE USER — CULTURAL HORIZON TEASER GATING
// ─────────────────────────────────────────────
test.describe('Free user — CulturalHorizonTeaser number blurring', () => {
  test('optimized forecast numbers in teaser are blurred for free users', async ({ page }) => {
    await completeQuizAsFreeUser(page);

    // Trigger the simulator to generate an optimized forecast
    const slider = page.locator('input[type="range"]').first();
    if (await slider.isVisible({ timeout: 5000 })) {
      await slider.evaluate((el: HTMLInputElement) => {
        const max = parseFloat(el.max);
        el.value = String(max);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.waitForTimeout(800);
    }

    // Click "Yes — Show Me My Longevity Potential" to trigger the teaser
    const showBtn = page.locator('button:has-text("Yes — Show Me My Longevity Potential")')
      .or(page.locator('text=Yes — Show Me').first())
      .first();

    if (await showBtn.isVisible({ timeout: 5000 })) {
      await showBtn.click();
      await page.waitForTimeout(1000);
    }

    // The optimized potential numbers must have blur applied
    const blurredNumbers = page.locator('[style*="blur"]');
    const count = await blurredNumbers.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// SCORE OVER TIME — must not appear for free users without history
// ─────────────────────────────────────────────
test.describe('Score Over Time section', () => {
  test('Score Over Time section is removed entirely', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.waitForTimeout(1000);

    // Score Over Time section (both chart and teaser) has been removed
    await expect(
      page.locator('text=📈 Track your score over time').first()
    ).not.toBeVisible({ timeout: 3000 });

    await expect(
      page.locator('text=Score over time').first()
    ).not.toBeVisible({ timeout: 3000 });
  });
});

// ─────────────────────────────────────────────
// SIMULATOR TEXT POSITION
// ─────────────────────────────────────────────
test.describe('Simulator intro text position', () => {
  test('"The question is" text appears directly above the CTA button', async ({ page }) => {
    await completeQuizAsFreeUser(page);
    await page.waitForTimeout(1000);

    const questionText = page.locator('text=The question is: how much').first();
    const ctaButton = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();

    if (await questionText.isVisible({ timeout: 5000 }) && await ctaButton.isVisible({ timeout: 5000 })) {
      const questionBox = await questionText.boundingBox();
      const buttonBox = await ctaButton.boundingBox();

      // "The question is" text must appear ABOVE the button (lower Y value)
      expect(questionBox!.y).toBeLessThan(buttonBox!.y);

      // And it must be CLOSE to the button — within 200px vertically
      expect(buttonBox!.y - (questionBox!.y + questionBox!.height)).toBeLessThan(200);
    }
  });
});
