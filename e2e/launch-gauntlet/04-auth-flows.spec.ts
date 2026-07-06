/**
 * 04-auth-flows — Authentication UI checks (no real sign-in).
 * Verifies that auth pages render, nav shows correct state for guests,
 * and report generation works for unauthenticated users.
 */
import { test, expect } from '@playwright/test';

test('upgrade page renders pricing and CTA', async ({ page }) => {
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');

  // Should show some pricing
  await expect(page.locator('body')).toContainText(/₹|INR|\$|USD|month/i);

  // CTA button visible
  const cta = page.locator('button, a').filter({ hasText: /subscribe|start|upgrade|get/i }).first();
  await expect(cta).toBeVisible();
});

test('guest can reach /birthday-report and see the form', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');

  // Form fields visible
  await expect(page.locator('input[placeholder*="recipient"]').first()).toBeVisible();
  await expect(page.locator('input[type="date"]').first()).toBeVisible();

  // No quota info shown for guests
  const quotaInfo = page.locator('text=Reports used:');
  await expect(quotaInfo).not.toBeVisible();

  // Generate button enabled (no quota gate)
  const btn = page.locator('button:has-text("Create Birthday Report")');
  await expect(btn).not.toBeDisabled();
});

test('guest can generate a report (no sign-in required)', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');

  await page.locator('input[placeholder*="recipient"]').first().fill('Auth Flow Test');
  await page.locator('input[type="date"]').first().fill('1988-03-20');
  await page.locator('button:has-text("Create Birthday Report")').click();

  // Should succeed and redirect to /report/
  await page.waitForURL(/\/report\/[a-z0-9-]+/, { timeout: 35000 });
  expect(page.url()).toContain('/report/');
});

test('nav shows Sign In when not authenticated', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const signInLink = page.locator('a, button').filter({ hasText: /sign in|log in/i }).first();
  await expect(signInLink).toBeVisible();
});

test('report page shows Sign in to Unlock CTA for unauthenticated users', async ({ page }) => {
  // Create a report first
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  await page.locator('input[placeholder*="recipient"]').first().fill('Auth CTA Test');
  await page.locator('input[type="date"]').first().fill('1992-09-10');
  await page.locator('button:has-text("Create Birthday Report")').click();
  await page.waitForURL(/\/report\/[a-z0-9-]+/, { timeout: 35000 });

  // Unauthenticated → should see "Sign in to Unlock" not "Unlock —"
  const signInCta = page.locator('a:has-text("Sign in to Unlock")').first();
  await expect(signInCta).toBeVisible();
});
