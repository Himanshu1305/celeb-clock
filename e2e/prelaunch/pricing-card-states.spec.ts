/**
 * Suite C — pricing-card-states.spec.ts  (founder inventory 21-26)  [mocked]
 * Logs in a real trial user (so the card fetches entitlement), then mocks
 * /api/report-entitlement per state and asserts the exact card strings.
 * ?currency=INR forces a single currency so the ₹-XOR-$ invariant is deterministic.
 */
import { test, expect, type Page } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, type TestUser } from '../helpers/db';

let user: TestUser;

test.beforeAll(async () => { user = await createTestUser('cardC'); });
test.afterAll(async () => { if (user) await deleteTestUser(user.userId, user.email); });

type Ent = { isTrial: boolean; trialReportUsed: boolean; credits: number; subscriptionActive: boolean; trialDaysRemaining: number };

async function openCard(page: Page, ent: Ent) {
  await loginViaForm(page, user.email, user.password);
  await page.route('**/api/report-entitlement**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ent) }));
  await page.goto('/birthday-report?currency=INR');
  await page.waitForLoadState('networkidle');
}

// Every priced surface shows ONE currency: ₹ present, $ absent (INR forced).
async function assertSingleCurrency(page: Page) {
  const body = page.locator('body');
  await expect(body).toContainText('₹');
  await expect(body).not.toContainText('$');
}

const card = (page: Page) => page.locator('.max-w-sm').filter({ hasText: 'Birthday Report' }).first();

test('trial, free unused → "1 free report"', async ({ page }) => {
  await openCard(page, { isTrial: true, trialReportUsed: false, credits: 0, subscriptionActive: false, trialDaysRemaining: 5 });
  await expect(card(page)).toContainText('1 free report');
  await expect(card(page)).toContainText(/Included in your trial/i);
  await assertSingleCurrency(page);
});

test('trial, free used → price + "Launch price", no "free"', async ({ page }) => {
  await openCard(page, { isTrial: true, trialReportUsed: true, credits: 0, subscriptionActive: false, trialDaysRemaining: 5 });
  await expect(card(page)).toContainText('₹199');
  await expect(card(page)).toContainText(/Launch price/i);
  await expect(card(page)).toContainText(/free trial report has been used/i);
  await expect(card(page)).not.toContainText('1 free report');
  await assertSingleCurrency(page);
});

test('subscriber, credits=2 → "2 report credits available" + "1 remaining after"', async ({ page }) => {
  await openCard(page, { isTrial: false, trialReportUsed: true, credits: 2, subscriptionActive: true, trialDaysRemaining: 0 });
  await expect(card(page)).toContainText('2 report credits available');
  await expect(card(page)).toContainText(/1 remaining after/i);
  await assertSingleCurrency(page);
});

test('subscriber, credits=0 → price + "no credits left this month"', async ({ page }) => {
  await openCard(page, { isTrial: false, trialReportUsed: true, credits: 0, subscriptionActive: true, trialDaysRemaining: 0 });
  await expect(card(page)).toContainText('₹199');
  await expect(card(page)).toContainText(/no credits left this month/i);
  await assertSingleCurrency(page);
});

test('post-trial free → price + "Launch price"', async ({ page }) => {
  await openCard(page, { isTrial: false, trialReportUsed: false, credits: 0, subscriptionActive: false, trialDaysRemaining: 0 });
  await expect(card(page)).toContainText('₹199');
  await expect(card(page)).toContainText(/Launch price/i);
  await assertSingleCurrency(page);
});
