/**
 * Suite A — auth.spec.ts  (founder inventory 3,4,5,7,8)
 * Login success / wrong-password error / unconfirmed-email message /
 * sign-out clears session / /profile redirects when logged out.
 * (1,2,6 = real-inbox items on the founder's manual list.)
 */
import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, TEST_PASSWORD, type TestUser } from '../helpers/db';

let confirmed: TestUser;
let unconfirmed: TestUser;

test.beforeAll(async () => {
  confirmed = await createTestUser('authA', { confirmed: true, firstName: 'Ada' });
  unconfirmed = await createTestUser('authA-unconf', { confirmed: false, firstName: 'Unc' });
});

test.afterAll(async () => {
  if (confirmed) await deleteTestUser(confirmed.userId, confirmed.email);
  if (unconfirmed) await deleteTestUser(unconfirmed.userId, unconfirmed.email);
});

test('login success → session established, nav shows account avatar', async ({ page }) => {
  await loginViaForm(page, confirmed.email, confirmed.password);
  // Guest CTAs gone; the account dropdown trigger (round avatar button) present.
  await expect(page.locator('a:has-text("Join Free")')).toHaveCount(0);
  await expect(page.locator('button.rounded-full').last()).toBeVisible();
});

test('wrong password → error surfaced, stays on /auth', async ({ page }) => {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  await page.locator('input#email').fill(confirmed.email);
  await page.locator('input#password').fill('definitely-the-wrong-password');
  await page.locator('button[type="submit"]:has-text("Sign In")').click();
  // The toast renders title+description as one concatenated status node, so match
  // the error text anywhere in the body (robust vs animation). Not redirected.
  await expect(page.locator('body')).toContainText(/invalid login credentials/i);
  await expect(page).toHaveURL(/\/auth/);
});

test('unconfirmed email → "not confirmed" message, no session', async ({ page }) => {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  await page.locator('input#email').fill(unconfirmed.email);
  await page.locator('input#password').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign In")').click();
  // Supabase returns "Email not confirmed" as the error description.
  await expect(page.locator('body')).toContainText(/not confirmed/i);
  await expect(page).toHaveURL(/\/auth/);
});

test('sign-out clears the session', async ({ page }) => {
  await loginViaForm(page, confirmed.email, confirmed.password);
  await page.locator('button.rounded-full').last().click();       // open account menu
  await page.getByText('Sign Out').click();
  // Guest state returns.
  await expect(page.locator('a:has-text("Join Free"), a:has-text("Sign In")').first()).toBeVisible();
});

test('/profile redirects to /auth when logged out', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/auth/);
});
