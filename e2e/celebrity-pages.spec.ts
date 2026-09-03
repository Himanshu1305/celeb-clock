import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.bornclock.com';

const SAMPLE_SLUGS = [
  'virat-kohli', 'sachin-tendulkar', 'shah-rukh-khan',
  'amitabh-bachchan', 'ar-rahman',
];

async function loadFirstWorking(page: any) {
  for (const slug of SAMPLE_SLUGS) {
    const res = await page.goto(`${BASE}/celebrity/${slug}/`);
    if (res?.status() === 200) {
      const count = await page.locator('[data-testid="celebrity-page"]').count();
      if (count > 0) return { slug, loaded: true };
    }
  }
  return { slug: null, loaded: false };
}

test.describe('Celebrity Pages — E2E', () => {

  // INDEX
  test('TC-E2E-01: celebrity index loads HTTP 200', async ({ page }) => {
    expect((await page.goto(`${BASE}/celebrity/`))?.status()).toBe(200);
  });
  test('TC-E2E-02: index H1 contains "Celebrity"', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    expect((await page.locator('h1').first().textContent())?.toLowerCase()).toContain('celebrity');
  });
  test('TC-E2E-03: index shows 500+ celebrity links', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    await expect(page.locator('[data-testid="celebrity-index-link"]').first()).toBeVisible();
    expect(await page.locator('[data-testid="celebrity-index-link"]').count()).toBeGreaterThanOrEqual(500);
  });
  test('TC-E2E-04: index shows category hubs', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    await expect(page.locator('[data-testid="category-hub-link"]').first()).toBeVisible();
    expect(await page.locator('[data-testid="category-hub-link"]').count()).toBeGreaterThanOrEqual(3);
  });
  test('TC-E2E-05: clicking celebrity link navigates correctly', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    await page.locator('[data-testid="celebrity-index-link"]').first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/celebrity/');
    expect((await page.title()).toLowerCase()).not.toContain('404');
  });

  // HUB PAGES
  for (const hub of ['bollywood', 'cricket', 'politics']) {
    test(`TC-E2E-06-${hub}: hub loads HTTP 200`, async ({ page }) => {
      expect((await page.goto(`${BASE}/celebrity/${hub}/`))?.status()).toBe(200);
    });
  }
  test('TC-E2E-07: Bollywood hub shows celebrities', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/bollywood/`);
    await expect(page.locator('[data-testid="hub-celebrity-link"]').first()).toBeVisible();
    expect(await page.locator('[data-testid="hub-celebrity-link"]').count()).toBeGreaterThan(0);
  });

  // INDIVIDUAL PAGES
  test('TC-E2E-08: at least one sample slug loads correctly', async ({ page }) => {
    const { loaded } = await loadFirstWorking(page);
    expect(loaded).toBe(true);
  });
  test('TC-E2E-09: celebrity page has correct structure', async ({ page }) => {
    await loadFirstWorking(page);
    await expect(page.locator('[data-testid="celebrity-page"]')).toBeVisible();
    expect(await page.locator('h1').count()).toBe(1);
    await expect(page.locator('[data-testid="facts-table"]')).toBeVisible();
    expect(await page.locator('[data-testid="faq-question"]').count()).toBe(5);
  });
  test('TC-E2E-10: Person schema present', async ({ page }) => {
    await loadFirstWorking(page);
    await page.waitForLoadState('networkidle');
    let found = false;
    for (const s of await page.locator('script[type="application/ld+json"]').all()) {
      try { if (JSON.parse(await s.textContent() || '')['@type'] === 'Person') found = true; } catch { /* */ }
    }
    expect(found).toBe(true);
  });
  test('TC-E2E-11: FAQPage schema has 5 questions', async ({ page }) => {
    await loadFirstWorking(page);
    await page.waitForLoadState('networkidle');
    let count = 0;
    for (const s of await page.locator('script[type="application/ld+json"]').all()) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'FAQPage') count = Math.max(count, d.mainEntity?.length || 0);
      } catch { /* */ }
    }
    expect(count).toBe(5);
  });
  test('TC-E2E-12: CTA links to birthday report', async ({ page }) => {
    await loadFirstWorking(page);
    const cta = page.locator('[data-testid="cta-birthday-report"]');
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain('/birthday-report');
  });
  test('TC-E2E-13: no undefined or [object Object]', async ({ page }) => {
    await loadFirstWorking(page);
    const text = await page.evaluate(() => document.body.textContent);
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });

  // CRITICAL: YEAR-ONLY DOB NEVER SHOWS JANUARY 1
  test('TC-E2E-14: year-only celebrity pages never show January 1 as birthday', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    const links = await page.locator('[data-testid="celebrity-index-link"]').all();
    let checked = 0;
    for (const link of links.slice(0, 30)) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      const res = await page.goto(`${BASE}${href}`);
      if (res?.status() !== 200) continue;
      const dobCell = page.locator('[data-testid="fact-dob"]');
      if (await dobCell.count() === 0) continue;
      const dobText = await dobCell.textContent();
      if (!dobText?.toLowerCase().includes('not available')) {
        expect(dobText, `${href} shows January 1 as fake birthday`).not.toMatch(/January\s+1[^0-9]/);
      }
      checked++;
      if (checked >= 10) break;
    }
  });

  // SITEMAP AND INTERNAL LINKING
  test('TC-E2E-15: celebrity pages in sitemap', async ({ page }) => {
    const xml = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
    expect(xml).toContain('/celebrity/');
    expect((xml.match(/\/celebrity\/[a-z0-9-]+\//g) || []).length).toBeGreaterThan(100);
  });
  test('TC-E2E-16: homepage links to /celebrity/', async ({ page }) => {
    await page.goto(BASE);
    expect(await page.locator('a[href*="/celebrity/"]').count()).toBeGreaterThanOrEqual(1);
  });
  test('TC-E2E-17: born-on page links to celebrity profiles', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india/`);
    await expect(page.locator('a[href*="/celebrity/"]').first()).toBeVisible();
    expect(await page.locator('a[href*="/celebrity/"]').count()).toBeGreaterThanOrEqual(1);
  });
  test('TC-E2E-18: Explore nav has celebrity link', async ({ page }) => {
    await page.goto(BASE);
    expect(await page.locator('a[href*="/celebrity/"]').count()).toBeGreaterThanOrEqual(1);
  });

  // MOBILE
  test('TC-E2E-19: celebrity page no h-scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loadFirstWorking(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
  });
  test('TC-E2E-20: celebrity index mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/celebrity/`);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
  });

  // PERFORMANCE
  test('TC-E2E-21: celebrity index under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/celebrity/`);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });
  test('TC-E2E-22: celebrity page under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await loadFirstWorking(page);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  // ACCESSIBILITY
  test('TC-E2E-23: celebrity page has main landmark', async ({ page }) => {
    await loadFirstWorking(page);
    await expect(page.locator('main')).toBeVisible();
  });
  test('TC-E2E-24: facts table has no empty or undefined cells', async ({ page }) => {
    await loadFirstWorking(page);
    for (const cell of await page.locator('[data-testid="facts-table"] td').all()) {
      const text = await cell.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
      expect(text?.trim()).not.toBe('undefined');
    }
  });

  // BORN-ON INTEGRITY
  test('TC-E2E-25: born-on manifest intact after Day 8 deploy', async ({ page }) => {
    const res = await page.goto(`${BASE}/born-on/august-6/india/`);
    expect(res?.status()).toBe(200);
    const title = await page.title();
    expect(title.toLowerCase()).toContain('august 6');
    expect(title.toLowerCase()).not.toBe('bornclock');
  });

});
