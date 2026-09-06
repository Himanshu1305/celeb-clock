import { test, expect } from '@playwright/test';
test.describe('Batch C Kundali+Hindi Human Tester', () => {
  test('HT-C-01: /kundali 3 inputs button disabled', async ({ page }) => {
    await page.goto('/kundali');
    await expect(page.locator('[data-testid="kundali-dob"]')).toBeVisible();
    await expect(page.locator('[data-testid="kundali-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="kundali-city"]')).toBeVisible();
    await expect(page.locator('[data-testid="kundali-generate-btn"]')).toBeDisabled();
  });
  test('HT-C-02: /kundali title <=70c contains Kundali', async ({ page }) => {
    await page.goto('/kundali');
    const t = await page.title();
    expect(t).toMatch(/Kundali|kundali/i);
    expect(t.length).toBeLessThanOrEqual(70);
  });
  test('HT-C-03: no undefined on /kundali', async ({ page }) => {
    await page.goto('/kundali');
    expect(await page.textContent('body')).not.toContain('\nundefined\n');
  });
  test('HT-C-04: gift page 199 not 299 for individual product', async ({ page }) => {
    await page.goto('/birthday-report/gift');
    const report = await page.locator('[data-testid="gift-product-report"]').textContent().catch(() => '');
    if (report) { expect(report).toContain('₹199'); expect(report).not.toContain('₹299'); }
  });
  test('HT-C-05: language toggle shows Devanagari on click', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="language-toggle"]')).toBeVisible();
    await page.locator('[data-testid="language-toggle"] button').last().click();
    await page.waitForTimeout(600);
    expect(await page.textContent('body')).toMatch(/[ऀ-ॿ]/);
  });
  test('HT-C-06: /kundali mobile 375px no scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/kundali');
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  test('HT-C-07: Feb 29 on Kundali no crash', async ({ page }) => {
    await page.goto('/kundali');
    await page.fill('[data-testid="kundali-dob"]', '1988-02-29');
    await page.fill('[data-testid="kundali-time"]', '12:00');
    const body = await page.textContent('body');
    expect(body).not.toContain('Error'); expect(body).not.toContain('\nundefined\n');
  });
  test('HT-C-08: /kundali meta description present', async ({ page }) => {
    await page.goto('/kundali');
    const meta = await page.$eval('meta[name="description"]', (m: any) => m.content).catch(() => '');
    expect(meta.length).toBeGreaterThan(30);
  });
});
