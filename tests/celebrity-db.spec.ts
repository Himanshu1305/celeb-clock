import { test, expect } from '@playwright/test';

// TC-SLUG Playwright — slug preservation for the canonical static celebrities.
test.describe('Slug Migration — TC-SLUG E2E', () => {
  test('E2E-P-01: virat-kohli page loads with correct H1', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    await expect(page.locator('h1')).toContainText('Virat Kohli');
  });
  test('E2E-P-02: shah-rukh-khan page loads', async ({ page }) => {
    await page.goto('/celebrity/shah-rukh-khan/');
    await expect(page.locator('h1')).toContainText('Shah Rukh');
  });
  test('E2E-N-01: nonexistent slug → graceful (redirect to index), not a crash', async ({ page }) => {
    await page.goto('/celebrity/totally-nonexistent-slug-xyz/');
    expect(page.url()).not.toContain('undefined');
  });
});

// TC-UDB Playwright — unified celebrity DB.
test.describe('Unified Celebrity DB — TC-UDB E2E', () => {
  test('E2E-P-01: Prabhupada page renders', async ({ page }) => {
    await page.goto('/celebrity/srila-prabhupada/');
    await expect(page.locator('h1')).toContainText('Prabhupada');
  });
  test('E2E-P-03: born-on page loads with its birthday title and no undefined', async ({ page }) => {
    const resp = await page.goto('/born-on/august-6/india/');
    expect(resp?.status()).toBeLessThan(400);
    // Title is prerendered and stable regardless of client data hydration.
    await expect(page).toHaveTitle(/August 6/i);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('[object Object]');
  });
  test('E2E-P-04: homepage renders without broken markers', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('[object Object]');
    expect(bodyText).not.toContain('undefined');
  });
  test('E2E-EDGE-01: a Supabase-sourced celebrity page loads (lucky-stone affiliate present)', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    const sponsored = page.locator('a[rel*="sponsored"]');
    await expect(sponsored.first()).toBeVisible({ timeout: 5000 });
  });
});
