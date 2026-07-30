/**
 * Suite B — delete-account.spec.ts  (founder inventory 9,10,11,12,20)
 * Modal gated on exact "DELETE"; wrong text stays disabled; Cancel leaves the
 * account intact; a full delete removes the profiles row (DB assert), blocks
 * re-login, and frees the email for re-signup.
 *
 * NOTE: the full-delete test drives the REAL deployed `delete-account` edge
 * function against the live Supabase project (throwaway user only). It fires the
 * function's internal notification email once per run — harmless.
 */
import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, fetchProfile, db, type TestUser } from '../helpers/db';

const created: TestUser[] = [];

test.afterAll(async () => {
  for (const u of created) await deleteTestUser(u.userId, u.email);
});

test('modal: Permanently Delete gated on exact "DELETE"', async ({ page }) => {
  const u = await createTestUser('delB-modal'); created.push(u);
  await loginViaForm(page, u.email, u.password);
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');

  await page.locator('button:has-text("Delete My Account")').click();
  const confirmBtn = page.locator('button:has-text("Permanently Delete")');
  const input = page.locator('input#deleteConfirm');

  await expect(confirmBtn).toBeDisabled();                 // empty → disabled
  await input.fill('delete');                              // wrong case → still disabled
  await expect(confirmBtn).toBeDisabled();
  await input.fill('DELETE');                              // exact → enabled
  await expect(confirmBtn).toBeEnabled();

  // Cancel leaves the account intact.
  await page.locator('button:has-text("Cancel")').click();
  const profile = await fetchProfile(u.userId);
  expect(profile).not.toBeNull();
});

test('full delete: profile row gone, re-login blocked, email reusable', async ({ page }) => {
  const u = await createTestUser('delB-full'); created.push(u);
  await loginViaForm(page, u.email, u.password);
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');

  await page.locator('button:has-text("Delete My Account")').click();
  await page.locator('input#deleteConfirm').fill('DELETE');
  await page.locator('button:has-text("Permanently Delete")').click();

  // handleDeleteAccount navigates to '/' on success.
  await page.waitForURL('**/', { timeout: 30000 });

  // DB assert: the profiles row is gone (deleted directly or via auth cascade).
  await expect.poll(async () => await fetchProfile(u.userId), { timeout: 15000, intervals: [1000, 2000, 3000] })
    .toBeNull();

  // Re-login with the old credentials now fails (auth user deleted).
  await page.goto('/auth');
  await page.locator('input#email').fill(u.email);
  await page.locator('input#password').fill(u.password);
  await page.locator('button[type="submit"]:has-text("Sign In")').click();
  // Toast text renders as one concatenated status node; assert the error appears
  // anywhere in the body (robust) + that we were NOT redirected in (blocked).
  await expect(page.locator('body')).toContainText(/invalid login credentials/i);
  await expect(page).toHaveURL(/\/auth/);

  // The email is freed — re-signup with the same address succeeds.
  const { data: recreated, error } = await db().auth.admin.createUser({
    email: u.email, password: u.password, email_confirm: true,
  });
  expect(error).toBeNull();
  expect(recreated?.user?.id).toBeTruthy();
  // Track the recreated user for cleanup (new id).
  if (recreated?.user?.id) created.push({ userId: recreated.user.id, email: u.email, password: u.password });
});
