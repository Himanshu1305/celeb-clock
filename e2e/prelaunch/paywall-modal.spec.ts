/**
 * Suite E — paywall-modal.spec.ts  (founder inventory 33,36,40)  [real]
 * Locked report → Unlock → CheckoutRegionModal appears BEFORE any Razorpay iframe.
 * "Outside India" → $6.99 in the modal; India→Karnataka → ₹199. STOPS at the modal
 * — never completes a payment (invoice counters stay at 1001).
 */
import { test, expect, type Page } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, type TestUser } from '../helpers/db';

let user: TestUser;
test.beforeAll(async () => { user = await createTestUser('payE'); });
test.afterAll(async () => { if (user) await deleteTestUser(user.userId, user.email); });

async function fillDob(page: Page, dob: string) {
  const [y, m, d] = dob.split('-');
  await page.locator('input[placeholder="DD"]').first().fill(String(parseInt(d)));
  await page.locator('input[placeholder="MM"]').first().fill(String(parseInt(m)));
  await page.locator('input[placeholder="YYYY"]').first().fill(y);
}
async function generate(page: Page, name: string, dob: string): Promise<string> {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  await page.locator('input[placeholder*="Priya"]').first().fill(name);
  await fillDob(page, dob);
  await page.locator('button:has-text("Create Birthday Report")').click();
  await page.waitForSelector('text=Report Ready!', { timeout: 35000 });
  const href = await page.locator('a:has-text("Open Report")').getAttribute('href');
  await page.locator('button:has-text("Generate another report")').click().catch(() => {});
  return href!.split('/report/')[1];
}

test('locked report → region modal before Razorpay; currency follows region', async ({ page }) => {
  await loginViaForm(page, user.email, user.password);
  await generate(page, 'Pay One', '1990-06-15');       // #1 unlocks via trial
  const lockedSlug = await generate(page, 'Pay Two', '1985-03-20');  // #2 is locked

  await page.goto(`/report/${lockedSlug}`);
  await page.waitForLoadState('networkidle');

  // Owner sees the paywall unlock button; no Razorpay iframe yet.
  const unlock = page.locator('button:has-text("Unlock —")').first();
  await expect(unlock).toBeVisible();
  await expect(page.locator('iframe.razorpay-checkout-frame, iframe[src*="razorpay"]')).toHaveCount(0);

  await unlock.click();

  // CheckoutRegionModal is shown BEFORE any Razorpay iframe.
  await expect(page.getByText('Where are you based?')).toBeVisible();
  await expect(page.locator('iframe[src*="razorpay"]')).toHaveCount(0);

  // Outside India → USD price in the modal.
  await page.getByRole('button', { name: /Outside India/i }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'United States' }).click();
  await expect(page.getByRole('button', { name: /Continue to payment/i })).toContainText('$6.99');

  // Switch to India → Karnataka → INR price stays ₹199.
  await page.getByRole('button', { name: /🇮🇳 India/i }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: /Karnataka/i }).click();
  await expect(page.getByRole('button', { name: /Continue to payment/i })).toContainText('₹199');

  // STOP — do not click Continue; no payment is ever initiated.
});
