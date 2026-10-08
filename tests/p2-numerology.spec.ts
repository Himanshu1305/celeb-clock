import { test, expect } from '@playwright/test';

const BASE = process.env.P2_BASE || 'http://localhost:4290';

test('name correction computes from a real name + DOB', async ({ page }) => {
  await page.goto(`${BASE}/name-correction/`);
  await page.getByTestId('nc-name').fill('Priya Sharma');
  await page.getByTestId('nc-dob').fill('1978-05-13');
  await page.getByTestId('nc-calc').click();
  const res = page.getByTestId('nc-result');
  await expect(res).toBeVisible();
  await expect(res).toContainText('Chaldean name number');
  await expect(res).toContainText('Life Path'); // harmony block when DOB given
});

test('business name computes a verdict', async ({ page }) => {
  await page.goto(`${BASE}/business-name-numerology/`);
  await page.getByTestId('bn-name').fill('Sunrise Traders');
  await page.getByTestId('bn-calc').click();
  await expect(page.getByTestId('bn-result')).toBeVisible();
  await expect(page.getByTestId('bn-result')).toContainText('number');
});

test('mobile number reduces to a vibration', async ({ page }) => {
  await page.goto(`${BASE}/mobile-number-numerology/`);
  await page.getByTestId('mn-input').fill('98123 45670');
  await page.getByTestId('mn-calc').click();
  await expect(page.getByTestId('mn-result')).toBeVisible();
  await expect(page.getByTestId('mn-result')).toContainText('vibration');
});

test('house number 221B reduces (letters ignored)', async ({ page }) => {
  await page.goto(`${BASE}/house-number-numerology/`);
  await page.getByTestId('hn-input').fill('221B');
  await page.getByTestId('hn-calc').click();
  const res = page.getByTestId('hn-result');
  await expect(res).toBeVisible();
  await expect(res).toContainText('reduced to 5'); // 2+2+1 = 5
});
