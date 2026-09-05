import { test, expect } from '@playwright/test';

// TC-WISH E2E
test.describe('Birthday Wish Generator — TC-WISH E2E', () => {
  test('E2E-P-01: /wish loads with inputs visible', async ({ page }) => {
    await page.goto('/wish');
    await expect(page.locator('[data-testid="wish-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="wish-dob-input"]')).toBeVisible();
  });
  test('E2E-P-02: name + DOB → card appears', async ({ page }) => {
    await page.goto('/wish');
    await page.fill('[data-testid="wish-name-input"]', 'Priya');
    await page.fill('[data-testid="wish-dob-input"]', '1990-11-05');
    await page.click('[data-testid="wish-generate-btn"]');
    await expect(page.locator('[data-testid="wish-card"]')).toBeVisible({ timeout: 5000 });
  });
  test('E2E-P-04: WhatsApp href decodes to contain friend name + domain', async ({ page }) => {
    await page.goto('/wish');
    await page.fill('[data-testid="wish-name-input"]', 'Priya');
    await page.fill('[data-testid="wish-dob-input"]', '1990-11-05');
    await page.click('[data-testid="wish-generate-btn"]');
    const waHref = await page.locator('[data-testid="wish-whatsapp-share"]').getAttribute('href');
    const decoded = decodeURIComponent(waHref || '');
    expect(decoded).toContain('Priya');
    expect(decoded).toContain('bornclock.com');
  });
  test('E2E-N-01: empty name → generate button disabled', async ({ page }) => {
    await page.goto('/wish');
    await page.fill('[data-testid="wish-dob-input"]', '1990-11-05');
    await expect(page.locator('[data-testid="wish-generate-btn"]')).toBeDisabled();
  });
  test('E2E-EDGE-01: leap year Feb 29 → no crash, no broken markers', async ({ page }) => {
    await page.goto('/wish');
    await page.fill('[data-testid="wish-name-input"]', 'Leap');
    await page.fill('[data-testid="wish-dob-input"]', '1992-02-29');
    await page.click('[data-testid="wish-generate-btn"]');
    await expect(page.locator('[data-testid="wish-card"]')).toBeVisible({ timeout: 5000 });
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('undefined');
  });
});

// TC-GIFT E2E
test.describe('Gift Checkout — TC-GIFT E2E', () => {
  test('E2E-P-01: /birthday-report/gift loads', async ({ page }) => {
    await page.goto('/birthday-report/gift');
    await expect(page.locator('[data-testid="gift-recipient-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="gift-pay-btn"]')).toBeVisible();
  });
  test('E2E-P-02: fill all fields → pay button enabled', async ({ page }) => {
    await page.goto('/birthday-report/gift');
    await page.fill('[data-testid="gift-recipient-name"]', 'Priya');
    await page.fill('[data-testid="gift-recipient-dob"]', '1990-11-05');
    await page.fill('[data-testid="gift-giver-name"]', 'Rahul');
    await expect(page.locator('[data-testid="gift-pay-btn"]')).not.toBeDisabled({ timeout: 2000 });
  });
  test('E2E-N-01: empty form → pay button disabled', async ({ page }) => {
    await page.goto('/birthday-report/gift');
    await expect(page.locator('[data-testid="gift-pay-btn"]')).toBeDisabled();
  });
  test('E2E-EDGE-01: future DOB → pay stays disabled / validation shown', async ({ page }) => {
    await page.goto('/birthday-report/gift');
    await page.fill('[data-testid="gift-recipient-name"]', 'Future');
    await page.fill('[data-testid="gift-recipient-dob"]', '2099-01-01');
    await page.fill('[data-testid="gift-giver-name"]', 'Rahul');
    const disabled = await page.locator('[data-testid="gift-pay-btn"]').isDisabled();
    expect(disabled).toBe(true);
  });
});

// TC-COMPAT E2E
test.describe('Compatibility Calculator — TC-COMPAT E2E', () => {
  test('E2E-P-01: /compatibility loads with two DOB inputs', async ({ page }) => {
    await page.goto('/compatibility');
    await expect(page.locator('[data-testid="compat-dob-a"]')).toBeVisible();
    await expect(page.locator('[data-testid="compat-dob-b"]')).toBeVisible();
  });
  test('E2E-P-02: two DOBs → 4 dimensions appear', async ({ page }) => {
    await page.goto('/compatibility');
    await page.fill('[data-testid="compat-dob-a"]', '1988-11-05');
    await page.fill('[data-testid="compat-dob-b"]', '1965-08-06');
    await page.click('[data-testid="compat-calc-btn"]');
    await expect(page.locator('[data-testid="compat-zodiac"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="compat-rashi"]')).toBeVisible();
    await expect(page.locator('[data-testid="compat-lifepath"]')).toBeVisible();
    await expect(page.locator('[data-testid="compat-nakshatra"]')).toBeVisible();
  });
  test('E2E-P-03: Scorpio + Leo shows a challenging indicator', async ({ page }) => {
    await page.goto('/compatibility');
    await page.fill('[data-testid="compat-dob-a"]', '1988-11-05');
    await page.fill('[data-testid="compat-dob-b"]', '1965-08-06');
    await page.click('[data-testid="compat-calc-btn"]');
    await page.waitForSelector('[data-testid="compat-zodiac"]');
    const zodiacText = await page.textContent('[data-testid="compat-zodiac"]');
    expect(zodiacText?.toLowerCase()).toMatch(/challenging|difficult|caution/);
  });
  test('E2E-EDGE-01: both Feb 29 → no crash', async ({ page }) => {
    await page.goto('/compatibility');
    await page.fill('[data-testid="compat-dob-a"]', '1992-02-29');
    await page.fill('[data-testid="compat-dob-b"]', '1992-02-29');
    await page.click('[data-testid="compat-calc-btn"]');
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('undefined');
  });
});
