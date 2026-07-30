/**
 * Suite G — profile.spec.ts  (founder inventory 54, 55[mocked], 56)
 * Free user: credits UPSELL present, "of 9" numeric row absent.
 * Subscriber [mocked]: "N of 9" balance present (profiles REST + get-credits mocked).
 * Invoices card shows the no-purchase empty-state line.
 */
import { test, expect, type Page } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, type TestUser } from '../helpers/db';

let freeUser: TestUser;
let subUser: TestUser;

test.beforeAll(async () => {
  freeUser = await createTestUser('profG-free');
  subUser = await createTestUser('profG-sub');
});
test.afterAll(async () => {
  if (freeUser) await deleteTestUser(freeUser.userId, freeUser.email);
  if (subUser) await deleteTestUser(subUser.userId, subUser.email);
});

test('[real] free user: credits upsell shown, "of 9" numeric row absent', async ({ page }) => {
  await loginViaForm(page, freeUser.email, freeUser.password);
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
  // F5: upsell copy states the mechanics + the standalone one-report price.
  await expect(page.getByText(/Premium: 3 report credits every month/i)).toBeVisible();
  await expect(page.getByText(/One report alone costs/i)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/\bof 9\b/);
});

test('[real] invoices card shows the no-purchase empty state', async ({ page }) => {
  await loginViaForm(page, freeUser.email, freeUser.password);
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/invoices will appear here after your first purchase/i)).toBeVisible();
});

test('[mocked] active subscriber: "N of 9" balance shown', async ({ page }) => {
  // Mock the profile row (subscription_status active) and the credit balance.
  await page.route('**/rest/v1/profiles**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      id: 'mock-pk', user_id: subUser.userId, name: 'Sub Test', first_name: 'Sub', last_name: 'Test',
      email: subUser.email, country: 'India', premium_status: true, subscription_status: 'active',
      email_notifications: true, blog_subscription: true, created_at: '2026-01-01T00:00:00Z',
      promo_premium_until: null, premium_until: '2030-01-01T00:00:00Z',
    }),
  }));
  await page.route('**/api/get-credits**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ credits: 4, subscriptionActive: true }),
  }));

  await loginViaForm(page, subUser.email, subUser.password);
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/Report credits:\s*4 of 9/i)).toBeVisible();
});
