/**
 * Suite D — generation-flow.spec.ts  (founder inventory 27,28,29,34,35)  [real]
 * Fresh in-trial user: report #1 unlocks free (DB: is_paid=true, unlock_source='trial');
 * success phase shows the result block ONLY; "Generate another" updates the card off
 * "1 free report"; report #2 is genuinely locked (DB: is_paid=false).
 */
import { test, expect, type Page } from '@playwright/test';
import { createTestUser, deleteTestUser, loginViaForm, db, type TestUser } from '../helpers/db';

let user: TestUser;
test.beforeAll(async () => { user = await createTestUser('genD', { firstName: 'Gen' }); });
test.afterAll(async () => { if (user) await deleteTestUser(user.userId, user.email); });

async function fillDob(page: Page, dob: string) {
  const [y, m, d] = dob.split('-');
  await page.locator('input[placeholder="DD"]').first().fill(String(parseInt(d)));
  await page.locator('input[placeholder="MM"]').first().fill(String(parseInt(m)));
  await page.locator('input[placeholder="YYYY"]').first().fill(y);
}

async function generate(page: Page, name: string, dob: string): Promise<string> {
  await page.locator('input[placeholder*="Priya"]').first().fill(name);
  await fillDob(page, dob);
  await page.locator('button:has-text("Create Birthday Report")').click();
  await page.waitForSelector('text=Report Ready!', { timeout: 35000 });
  const href = await page.locator('a:has-text("Open Report")').getAttribute('href');
  return href!.split('/report/')[1];
}

async function reportRow(slug: string) {
  const { data } = await db().from('birthday_reports').select('slug, is_paid, unlock_source').eq('slug', slug).single();
  return data;
}

test('trial report #1 free + clean success phase; #2 locked; card updates', async ({ page }) => {
  await loginViaForm(page, user.email, user.password);
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');

  // Card starts on the trial-free state.
  await expect(page.locator('.max-w-sm').filter({ hasText: 'Birthday Report' }).first()).toContainText('1 free report');

  // ── Report #1 ──
  const slug1 = await generate(page, 'Gen One', '1990-06-15');

  // Success phase shows the result block ONLY.
  await expect(page.getByText('Report Ready!')).toBeVisible();
  await expect(page.locator('a:has-text("Open Report")')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('A peek inside');
  await expect(page.locator('body')).not.toContainText("A birthday gift they'll actually keep");
  await expect(page.locator('button:has-text("Create Now"), button:has-text("Create & unlock")')).toHaveCount(0);

  // DB: report #1 unlocked via trial.
  await expect.poll(async () => await reportRow(slug1), { timeout: 15000 })
    .toMatchObject({ is_paid: true, unlock_source: 'trial' });

  // ── Generate another → card must NOT still say "1 free report" (trial consumed) ──
  await page.locator('button:has-text("Generate another report")').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.max-w-sm').filter({ hasText: 'Birthday Report' }).first()).not.toContainText('1 free report');

  // ── Report #2 ── must be locked (trial already used).
  const slug2 = await generate(page, 'Gen Two', '1985-03-20');
  await expect.poll(async () => (await reportRow(slug2))?.is_paid, { timeout: 15000 }).toBe(false);
});
