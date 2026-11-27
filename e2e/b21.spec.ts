/**
 * B21 — Kundli depth (Avkahada + Ghatak, Prastarashtakavarga, East Indian chart, ayanamsa choice) and /prashna.
 *   Local: npx tsx scripts/b20-local-serve.mts 4321 & BASE_URL=http://localhost:4321 npx playwright test -c playwright.b21.config.ts
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const SHOTS = process.env.SHOTS === '1';
test.use({ baseURL: BASE });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('cookie_consent', JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString(), version: '1.0' })); } catch { /* ignore */ } });
});
const CHART = '/kundali/?dob=1978-05-13&time=19:30&place=Jammu&lat=32.7266&lon=74.857&tz=5.5';

test('K1 — Avkahada + Ghatak, Prastara, East chart and ayanamsa on /kundali', async ({ page }) => {
  await page.goto(CHART);
  const avk = page.getByTestId('kundali-avakahada');
  await expect(avk).toBeVisible({ timeout: 30_000 });
  if (!(await page.getByTestId('avk-table').isVisible())) await avk.locator('summary, button').first().click();
  await expect(page.getByTestId('avk-answer')).toContainText('your Moon is in');
  await expect(page.getByTestId('avk-table')).toContainText('Nadi');
  await expect(page.getByTestId('ghatak-table')).toContainText('Weekday');

  await page.getByTestId('chart-style-east').click();
  await expect(page.getByTestId('kundali-chart-east').first()).toBeVisible();

  const av = page.getByTestId('kundali-ashtakavarga');
  if (!(await page.getByTestId('av-prastara-table').isVisible())) await av.locator('summary, button').first().click();
  await expect(page.getByTestId('av-prastara-table')).toBeVisible();
  await page.getByTestId('av-prastara-planet').selectOption('Jupiter');
  await expect(page.getByTestId('av-prastara-answer')).toContainText('Jupiter');
  if (SHOTS) await page.screenshot({ path: `docs/b21/kundali-${page.viewportSize()!.width}.jpg`, fullPage: true, type: 'jpeg', quality: 70, scale: 'css' });

  const lagnaBefore = await page.getByTestId('kundali-lagna').innerText();
  await page.getByTestId('kundali-ayanamsa').selectOption('tropical');
  await expect(page.getByTestId('kundali-ayanamsa-note')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('kundali-lagna')).not.toHaveText(lagnaBefore);
});

test('P1 — /prashna gives an answer with steps', async ({ page }) => {
  await page.goto('/prashna/');
  await expect(page.locator('h1')).toContainText('Prashna');
  await page.getByTestId('pr-topic').selectOption('career');
  await page.getByTestId('pr-number').fill('108');
  await page.getByTestId('pr-city').fill('Pune');
  await page.getByTestId('pr-city-option').first().click();
  await page.getByTestId('pr-go').click();
  await expect(page.getByTestId('pr-result')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('pr-steps')).toContainText('number 108');
  await expect(page.getByTestId('pr-faq')).toBeVisible();
  if (SHOTS) await page.screenshot({ path: `docs/b21/prashna-${page.viewportSize()!.width}.jpg`, fullPage: true, type: 'jpeg', quality: 70, scale: 'css' });
  await page.getByTestId('pr-number').fill('300');
  await expect(page.getByTestId('pr-number-error')).toBeVisible();
});

test('A1 — /accuracy shows the B21 rows; footer links every core tool', async ({ page }) => {
  await page.goto('/accuracy/');
  for (const id of ['avakahada', 'prastara', 'ayanamsa-choice', 'dasha-deep']) await expect(page.getByTestId(`accuracy-row-${id}`)).toBeVisible();
  await expect(page.getByTestId('footer-popular').first()).toContainText('Prashna');
});
