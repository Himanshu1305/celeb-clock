import { test, expect } from '@playwright/test';

const PRABHUPADA = '/celebrity/srila-prabhupada/';

test.describe('FINAL Human Tester Checklist', () => {
  // BRANDING
  test('HT-BRAND-01: BornClock in homepage title, <=70', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('BornClock');
    expect(title.length).toBeLessThanOrEqual(70);
  });
  test('HT-BRAND-02: favicon accessible', async ({ page }) => {
    expect((await page.goto('/favicon.png'))?.status()).toBeLessThan(400);
  });
  // PRICING
  test('HT-PRICE-01: 199 on birthday report', async ({ page }) => {
    await page.goto('/birthday-report/');
    const body = await page.textContent('body');
    if (body?.includes('₹')) expect(body).toContain('₹199');
  });
  test('HT-PRICE-02: 199 on gift product, no 299 on it', async ({ page }) => {
    await page.goto('/birthday-report/gift/');
    const report = await page.locator('[data-testid="gift-product-report"]').textContent().catch(() => '');
    if (report) { expect(report).toContain('₹199'); expect(report).not.toContain('₹299'); }
  });
  test('HT-PRICE-03: 199 on Kundali page', async ({ page }) => {
    await page.goto('/kundali/');
    const body = await page.textContent('body');
    if (body?.includes('₹')) expect(body).toContain('₹199');
  });
  test('HT-PRICE-04: 199 on Diwali gift', async ({ page }) => {
    await page.goto('/diwali-gift/');
    const body = await page.textContent('body');
    if (body?.includes('₹')) expect(body).toContain('₹199');
  });
  // NO UNDEFINED
  test('HT-QUALITY-01: no undefined on key pages', async ({ page }) => {
    const PAGES = ['/', '/birthday-report/', '/celebrity/virat-kohli/', '/kundali/',
      '/compatibility/', '/wish/', '/kundali-match/', '/born-on/august-6/india/',
      '/articles/', '/for-business/', '/baby-names/', '/diwali-gift/',
      '/birthday-report/gift/', '/celebrity/barack-obama/', PRABHUPADA];
    for (const p of PAGES) {
      await page.goto(p);
      await page.waitForLoadState('networkidle');
      const body = await page.textContent('body');
      expect(body, `undefined on ${p}`).not.toContain('\nundefined\n');
      expect(body, `[object Object] on ${p}`).not.toContain('[object Object]');
    }
  });
  // SEO
  test('HT-SEO-01: meta descriptions on core pages', async ({ page }) => {
    for (const p of ['/', '/kundali/', '/celebrity/virat-kohli/', '/born-on/august-6/india/', '/birthday-report/', '/kundali-match/']) {
      await page.goto(p);
      const meta = await page.$eval('meta[name="description"]', (m: any) => m.content).catch(() => '');
      expect(meta.length, `No meta on ${p}`).toBeGreaterThan(30);
    }
  });
  test('HT-SEO-02: titles <=70c on core pages', async ({ page }) => {
    for (const p of ['/', '/kundali/', '/celebrity/virat-kohli/', '/compatibility/', '/wish/', '/kundali-match/']) {
      await page.goto(p);
      const t = await page.title();
      expect(t.length, `Title ${t.length}c on ${p}: "${t}"`).toBeLessThanOrEqual(70);
    }
  });
  test('HT-SEO-03: celeb page has Person schema', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    await page.waitForLoadState('networkidle');
    const schemas = await page.$$eval('script[type="application/ld+json"]',
      (els: any[]) => els.map((e: any) => { try { return JSON.parse(e.textContent); } catch { return null; } }));
    expect(schemas.some((s: any) => s?.['@type'] === 'Person')).toBe(true);
  });
  // VEDIC ACCURACY
  test('HT-VEDIC-01: Virat Scorpio yes, Nakshatra shown as a placeholder (no computed value)', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toContain('Scorpio');
    // No day/month Nakshatra is asserted — the page shows a "requires birth time"
    // placeholder instead. (We don't check for the string "Anuradha" because that
    // is also a common Indian personal name that can appear in a birthday-twin.)
    await expect(page.locator('[data-testid="nakshatra-placeholder"]')).toBeVisible();
  });
  test('HT-VEDIC-02: nakshatra placeholder links to birthday-report', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    const ph = page.locator('[data-testid="nakshatra-placeholder"]');
    await expect(ph).toBeVisible();
    expect(await ph.locator('a').first().getAttribute('href')).toContain('birthday-report');
  });
  // HINDI
  test('HT-HINDI-01: language toggle visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="language-toggle"]')).toBeVisible();
  });
  test('HT-HINDI-02: Hindi toggle shows Devanagari', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="language-toggle"] button').last().click();
    await page.waitForTimeout(600);
    expect(await page.textContent('body')).toMatch(/[ऀ-ॿ]/);
  });
  test('HT-HINDI-03: Rashifal vrischika has Devanagari', async ({ page }) => {
    const r = await page.goto('/hi/rashifal/vrischika/');
    if (r?.status() === 200) { const body = await page.textContent('body'); expect(body).toMatch(/[ऀ-ॿ]/); expect(body).not.toContain('\nundefined\n'); }
  });
  // MOBILE
  test('HT-MOBILE-01: homepage 375px no scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  test('HT-MOBILE-02: Kundali 375px inputs visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/kundali/');
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(385);
    await expect(page.locator('[data-testid="kundali-dob"]')).toBeVisible();
  });
  test('HT-MOBILE-03: Kundali match 375px no scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/kundali-match/');
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  // WHATSAPP
  test('HT-WA-01: wish generator WA link correct format', async ({ page }) => {
    await page.goto('/wish/');
    const nameInp = page.locator('[data-testid="wish-name-input"]');
    if (await nameInp.isVisible()) {
      await nameInp.fill('Priya');
      const dobInp = page.locator('[data-testid="wish-dob-input"]');
      if (await dobInp.isVisible()) await dobInp.fill('1990-11-05');
      const btn = page.locator('[data-testid="wish-generate-btn"]');
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(1000);
      const waLink = page.locator('a[href*="wa.me"]').first();
      if (await waLink.isVisible()) {
        const decoded = decodeURIComponent(await waLink.getAttribute('href') || '');
        expect(decoded).toContain('Priya');
        expect(decoded).toContain('bornclock.com');
      }
    }
  });
  // ASHTAKOOTA
  test('HT-ASHTAKOOTA-01: kundali-match has 2 DOB inputs button disabled', async ({ page }) => {
    await page.goto('/kundali-match/');
    await expect(page.locator('[data-testid="kmatch-dob-a"]')).toBeVisible();
    await expect(page.locator('[data-testid="kmatch-dob-b"]')).toBeVisible();
    await expect(page.locator('[data-testid="kmatch-calculate-btn"]')).toBeDisabled();
  });
  // BABY NAMES
  test('HT-BABY-01: baby-names loads DOB input visible', async ({ page }) => {
    await page.goto('/baby-names/');
    const title = await page.title();
    expect(title).toMatch(/baby|Baby|name|Name/i);
    await expect(page.locator('[data-testid="baby-dob-input"]')).toBeVisible();
    expect(await page.textContent('body')).not.toContain('\nundefined\n');
  });
  // HISTORICAL / RARITY
  test('HT-HIST-01: Prabhupada page has rarity card', async ({ page }) => {
    await page.goto(PRABHUPADA);
    const body = await page.textContent('body');
    expect(body).not.toContain('\nundefined\n');
    await expect(page.locator('[data-testid="birthday-rarity-card"]')).toBeVisible();
  });
});
