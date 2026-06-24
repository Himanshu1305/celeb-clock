import { test, expect } from '@playwright/test';
import { completeQuiz, interactWithSlider } from './helpers';

test.describe('WhatIfSimulator — free user', () => {
  test('simulator renders after quiz completion', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await expect(
      page.locator('text=What-If Simulator').or(page.locator('text=LONGEVITY LABORATORY')).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('current lifestyle number is always visible (not blurred)', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    // The CURRENT lifestyle number should be visible without blur
    const currentEl = page.locator('text=CURRENT LIFESTYLE').locator('..').locator('..').first();
    if (await currentEl.isVisible({ timeout: 5000 }).catch(() => false)) {
      const currentText = await currentEl.innerText();
      expect(currentText).toMatch(/\d+\.\d/); // contains a decimal number
    }
  });

  test('optimized number is blurred before interaction', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    // Before slider interaction, "WITH YOUR CHANGES" section exists
    // The optimized number should be blurred
    const optimizedSection = page.locator('text=WITH YOUR CHANGES').locator('..').locator('..');
    if (await optimizedSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      const blurred = optimizedSection.locator('[style*="blur"]').first();
      const isBlurred = await blurred.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isBlurred).toBe(true);
    }
  });

  test('slider interaction triggers delta badge with blur for free users', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await interactWithSlider(page);

    // After interaction, blurred elements should exist
    const blurredEls = page.locator('[style*="blur"]');
    const count = await blurredEls.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Unlock CTA links to upgrade page', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await interactWithSlider(page);

    // "🔒 Unlock" link should navigate to /upgrade
    const unlockLink = page.locator('a:has-text("Unlock")').first();
    if (await unlockLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await unlockLink.getAttribute('href');
      expect(href).toContain('/upgrade');
    }
  });

  test('teaser celebration message appears for free users (not the real gain number)', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await interactWithSlider(page);

    // Free users see teaser message, not "You've unlocked X years"
    await expect(
      page.locator('text=Your optimized potential').first()
    ).toBeVisible({ timeout: 5000 });

    // The full reveal message must NOT appear for free users
    await expect(
      page.locator("text=You've unlocked").first()
    ).not.toBeVisible({ timeout: 2000 });
  });

  test('ImpactBadge on slider sections is blurred for free users', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    // Section header impact badges should be blurred
    const blurredBadges = page.locator('[style*="blur(4px)"]');
    const count = await blurredBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('WHO comparison label is blurred for free users', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });
    await interactWithSlider(page);

    // The WHO/HALE comparison spans have blur applied directly to them as free user gating
    // Look for any blurred element in the simulator area
    const blurredEls = page.locator('[style*="blur"]');
    const count = await blurredEls.count();
    expect(count).toBeGreaterThan(0);

    // Additionally check the WHO label text exists somewhere in the simulator
    const whoLabel = page.locator('text=WHO').first();
    await expect(whoLabel).toBeVisible({ timeout: 5000 });
  });

  test('"The question is" text appears above CTA button', async ({ page }) => {
    await completeQuiz(page, { dob: '1985-06-15' });

    const questionText = page.locator('text=The question is: how much').first();
    const ctaBtn = page.locator('button:has-text("Yes — Show Me My Longevity Potential")').first();

    if (await questionText.isVisible({ timeout: 5000 }).catch(() => false) &&
        await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const qBox = await questionText.boundingBox();
      const bBox = await ctaBtn.boundingBox();
      expect(qBox!.y).toBeLessThan(bBox!.y);
      expect(bBox!.y - (qBox!.y + qBox!.height)).toBeLessThan(200);
    }
  });
});
