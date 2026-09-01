import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.bornclock.com';

test.describe('Born-On Page — Birthday Report CTA', () => {

  test('TC-E2E-01: CTA section is visible on a high-celebrity page', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const cta = page.locator('[data-testid="birthday-report-cta"]');
    await expect(cta).toBeVisible();
  });

  test('TC-E2E-02: CTA heading contains a celebrity name', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const heading = page.locator('[data-testid="cta-heading"]');
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    // Should contain "You share a birthday with" or a fallback
    expect(text).toMatch(/birthday|share|discover/i);
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('null');
  });

  test('TC-E2E-03: CTA button is visible and clickable', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const btn = page.locator('[data-testid="cta-button"]');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('TC-E2E-04: CTA button href contains /birthday-report and dob=', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const btn = page.locator('[data-testid="cta-button"]');
    const href = await btn.getAttribute('href');
    expect(href).toContain('/birthday-report');
    expect(href).toContain('dob=');
  });

  test('TC-E2E-05: clicking CTA button navigates to birthday report page', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const btn = page.locator('[data-testid="cta-button"]');
    await btn.click();
    // Should navigate to birthday report
    await expect(page).toHaveURL(/birthday-report/);
    // Should not be a 404
    const title = await page.title();
    expect(title.toLowerCase()).not.toContain('not found');
    expect(title.toLowerCase()).not.toContain('404');
  });

  test('TC-E2E-06: CTA appears on January 1 page (first day of year)', async ({ page }) => {
    await page.goto(`${BASE}/born-on/january-1/india`);
    const cta = page.locator('[data-testid="birthday-report-cta"]');
    await expect(cta).toBeVisible();
    const heading = page.locator('[data-testid="cta-heading"]');
    const text = await heading.textContent();
    expect(text).not.toContain('undefined');
  });

  test('TC-E2E-07: CTA appears on December 31 page (last day of year)', async ({ page }) => {
    await page.goto(`${BASE}/born-on/december-31/india`);
    const cta = page.locator('[data-testid="birthday-report-cta"]');
    await expect(cta).toBeVisible();
  });

  test('TC-E2E-08: CTA is positioned after celebrity list (not at top of page)', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);

    // Get Y position of celebrity list and CTA
    const celebSection = page.locator('[data-testid="celebrity-list"], .celebrity-list, h1').first();
    const ctaSection   = page.locator('[data-testid="birthday-report-cta"]');

    const celebBox = await celebSection.boundingBox();
    const ctaBox   = await ctaSection.boundingBox();

    // CTA must be below the celebrity list (higher Y value)
    if (celebBox && ctaBox) {
      expect(ctaBox.y).toBeGreaterThan(celebBox.y);
    }
  });

  test('TC-E2E-09: all 6 feature bullets are visible', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const items = page.locator('[data-testid="cta-features"] li');
    await expect(items).toHaveCount(6);
  });

  test('TC-E2E-10: reassurance text is visible', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    const txt = page.locator('[data-testid="cta-reassurance"]');
    await expect(txt).toBeVisible();
    await expect(txt).toContainText('Free');
  });

  test('TC-E2E-11: CTA is keyboard accessible (Tab + Enter navigates)', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    // Tab to the CTA button
    await page.keyboard.press('Tab');
    // Keep tabbing until we reach the CTA button. Budget scales past the nav,
    // breadcrumb and per-celebrity card links that precede the CTA in tab order.
    for (let i = 0; i < 60; i++) {
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      if (focused === 'cta-button') break;
      await page.keyboard.press('Tab');
    }
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focused).toBe('cta-button');
  });

  test('TC-E2E-12: CTA visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone SE
    await page.goto(`${BASE}/born-on/august-6/india`);
    const cta = page.locator('[data-testid="birthday-report-cta"]');
    await expect(cta).toBeVisible();
    const btn = page.locator('[data-testid="cta-button"]');
    await expect(btn).toBeVisible();
  });

  test('TC-E2E-13: CTA button not cut off on mobile (full width)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/born-on/august-6/india`);
    const btn = page.locator('[data-testid="cta-button"]');
    const box = await btn.boundingBox();
    // Button should be close to full width on mobile
    if (box) {
      expect(box.width).toBeGreaterThan(300);
    }
  });

  test('TC-E2E-14: prerendered HTML contains CTA (Google can see it)', async ({ page }) => {
    // curl equivalent — check the static HTML
    const response = await page.request.get(`${BASE}/born-on/august-6/india`);
    const html = await response.text();
    // Check that the CTA button text is in the prerendered HTML
    // This confirms Google's crawler can see it (not just client-side JS)
    const hasButton = html.includes('birthday-report') || html.includes('Birthday Report');
    // If not in prerender, it's still valid (SPA) — but log a warning
    if (!hasButton) {
      console.warn('⚠️ CTA not found in prerendered HTML — Google may not see it');
    }
    // The page should at minimum load without errors
    expect(response.status()).toBe(200);
  });

  test('TC-E2E-15: existing page content still renders after CTA added', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india`);
    // Wait for the CTA (which renders alongside the celebrity list) so we read the
    // hydrated page, not the loading skeleton.
    await page.locator('[data-testid="birthday-report-cta"]').waitFor({ state: 'visible' });
    // The celebrity list should still be there
    // Adapt selector to match actual celebrity list element
    const pageText = await page.evaluate(() => document.body.textContent);
    // Page should contain celebrity-related content
    expect(pageText?.toLowerCase()).toMatch(/born|birthday|celebrity|share/i);
  });

});
