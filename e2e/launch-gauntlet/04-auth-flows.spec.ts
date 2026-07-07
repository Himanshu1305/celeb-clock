/**
 * 04-auth-flows — Authentication UI checks (no real sign-in).
 * Verifies that auth pages render, nav shows correct state for guests,
 * and report generation works for unauthenticated users.
 */
import { test, expect, type Page } from '@playwright/test';

async function fillDob(page: Page, dob: string) {
  const [y, m, d] = dob.split('-');
  await page.locator('input[placeholder="DD"]').first().fill(String(parseInt(d)));
  await page.locator('input[placeholder="MM"]').first().fill(String(parseInt(m)));
  await page.locator('input[placeholder="YYYY"]').first().fill(y);
}

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

  // Form fields visible (placeholder is "e.g. Priya, James, Mum...")
  await expect(page.locator('input[placeholder*="Priya"]').first()).toBeVisible();
  await expect(page.locator('input[placeholder="DD"]').first()).toBeVisible();

  // No quota info shown for guests
  const quotaInfo = page.locator('text=Reports used:');
  await expect(quotaInfo).not.toBeVisible();

  // Button is disabled until name+dob filled (correct behaviour)
  const btn = page.locator('button:has-text("Create Birthday Report")');
  await page.locator('input[placeholder*="Priya"]').first().fill('Test');
  await fillDob(page, '1990-01-01');
  await expect(btn).not.toBeDisabled();
});

// Requires DDL: CREATE POLICY "Anon can insert reports with null user_id"
//   ON public.birthday_reports FOR INSERT TO anon WITH CHECK (user_id IS NULL);
// Until that policy exists, anon inserts are rejected by RLS and saveReport returns null.
test('guest can generate a report (no sign-in required)', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');

  await page.locator('input[placeholder*="Priya"]').first().fill('Auth Flow Test');
  await fillDob(page, '1988-03-20');
  await page.locator('button:has-text("Create Birthday Report")').click();

  // App stays on /birthday-report and shows success screen
  await page.waitForSelector('text=Report Ready!', { timeout: 35000 });
  const reportHref = await page.locator('a:has-text("Open Report")').getAttribute('href');
  expect(reportHref).toMatch(/\/report\/[a-z0-9-]+/);
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
  await page.locator('input[placeholder*="Priya"]').first().fill('Auth CTA Test');
  await fillDob(page, '1992-09-10');
  await page.locator('button:has-text("Create Birthday Report")').click();

  // Wait for success screen, then navigate to the report
  await page.waitForSelector('text=Report Ready!', { timeout: 35000 });
  const reportHref = await page.locator('a:has-text("Open Report")').getAttribute('href');
  await page.goto(reportHref!);
  await page.waitForLoadState('networkidle');

  // Unauthenticated → should see "Sign in to Unlock" not "Unlock —"
  const signInCta = page.locator('a:has-text("Sign in to Unlock")').first();
  await expect(signInCta).toBeVisible();
});
