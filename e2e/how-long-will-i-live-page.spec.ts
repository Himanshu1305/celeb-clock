import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.bornclock.com';
const URL  = `${BASE}/how-long-will-i-live`;

test.describe('How Long Will I Live Page', () => {

  // ── ROUTING ──────────────────────────────────────────────────
  test('TC-E2E-01: loads with HTTP 200', async ({ page }) => {
    const res = await page.goto(URL);
    expect(res?.status()).toBe(200);
  });

  test('TC-E2E-02: trailing slash does not 404', async ({ page }) => {
    const res = await page.goto(`${URL}/`);
    expect(res?.status()).toBeLessThan(400);
  });

  test('TC-E2E-03: not blocked by robots.txt', async ({ page }) => {
    const robots = await (await page.request.get(`${BASE}/robots.txt`)).text();
    expect(robots).not.toMatch(/Disallow:.*how-long-will-i-live/);
  });

  test('TC-E2E-04: not tagged noindex', async ({ page }) => {
    await page.goto(URL);
    expect(
      await page.locator('meta[name="robots"][content*="noindex"]').count()
    ).toBe(0);
  });

  // ── SEO META ─────────────────────────────────────────────────
  test('TC-E2E-05: title ≤ 70 chars, contains keyword and BornClock', async ({ page }) => {
    await page.goto(URL);
    const title = await page.title();
    expect(title.toLowerCase()).toContain('how long will i live');
    expect(title).toContain('BornClock');
    expect(title.length).toBeLessThanOrEqual(70);
  });

  test('TC-E2E-06: meta description ≤ 160 chars', async ({ page }) => {
    await page.goto(URL);
    const meta = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect(meta?.length || 0).toBeLessThanOrEqual(160);
    expect(meta?.length || 0).toBeGreaterThan(50);
  });

  test('TC-E2E-07: canonical contains /how-long-will-i-live', async ({ page }) => {
    await page.goto(URL);
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href');
    expect(canonical).toContain('/how-long-will-i-live');
  });

  test('TC-E2E-08: og:title contains keyword', async ({ page }) => {
    await page.goto(URL);
    const og = await page.locator('meta[property="og:title"]').first().getAttribute('content');
    expect(og?.toLowerCase()).toContain('how long will');
  });

  // ── PAGE STRUCTURE ───────────────────────────────────────────
  test('TC-E2E-09: H1 contains "How Long Will I Live" — exactly one', async ({ page }) => {
    await page.goto(URL);
    expect(await page.locator('h1').count()).toBe(1);
    const h1 = await page.locator('h1').first().textContent();
    expect(h1?.toLowerCase()).toContain('how long will i live');
  });

  test('TC-E2E-10: CTA visible above fold on desktop without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(URL);
    await expect(page.locator('[data-testid="cta-to-calculator"]').first()).toBeInViewport();
  });

  test('TC-E2E-11: exactly 4 stat cards with Japan, India, global values', async ({ page }) => {
    await page.goto(URL);
    const cards = page.locator('[data-testid="stat-card"]');
    expect(await cards.count()).toBe(4);
    const text = (await cards.allTextContents()).join(' ');
    expect(text).toContain('Japan');
    expect(text).toContain('India');
    expect(text).toContain('73');
  });

  test('TC-E2E-12: all 8 factor cards render', async ({ page }) => {
    await page.goto(URL);
    for (let i = 1; i <= 8; i++) {
      await expect(page.locator(`[data-testid="factor-${i}"]`)).toBeVisible();
    }
  });

  test('TC-E2E-13: all 8 factors have direction badge with valid label', async ({ page }) => {
    await page.goto(URL);
    const badges = page.locator('[data-testid="factor-direction"]');
    expect(await badges.count()).toBe(8);
    const texts = await badges.allTextContents();
    const validLabels = ['Risk factor', 'Protective factor', 'Mixed impact'];
    texts.forEach(text => {
      expect(validLabels.some(v => text.includes(v))).toBe(true);
    });
  });

  test('TC-E2E-14: country table has ≥ 15 rows', async ({ page }) => {
    await page.goto(URL);
    expect(
      await page.locator('[data-testid="country-row"]').count()
    ).toBeGreaterThanOrEqual(15);
  });

  test('TC-E2E-15: Japan row found by data-country, shows 84+', async ({ page }) => {
    await page.goto(URL);
    const japanRow = page.locator('[data-country="Japan"]');
    await expect(japanRow).toBeVisible();
    expect(await japanRow.textContent()).toContain('84');
  });

  test('TC-E2E-16: India row highlighted with different background', async ({ page }) => {
    await page.goto(URL);
    const indiaRow = page.locator('[data-country="India"]');
    await expect(indiaRow).toBeVisible();
    expect(await indiaRow.getAttribute('class')).toContain('indigo');
  });

  test('TC-E2E-17: country table scroll wrapper prevents page overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    await expect(page.locator('[data-testid="country-table-wrapper"]')).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });

  test('TC-E2E-18: India note (Kerala) renders below country table', async ({ page }) => {
    await page.goto(URL);
    const section = page.locator('[data-testid="country-table-section"]');
    await expect(section).toContainText('Kerala');
  });

  test('TC-E2E-19: US vs Europe gap analysis section renders', async ({ page }) => {
    await page.goto(URL);
    const gap = page.locator('[data-testid="gap-analysis"]');
    await expect(gap).toBeVisible();
    await expect(gap).toContainText('United States');
    await expect(gap).toContainText('Europe');
  });

  test('TC-E2E-20: all 4 improvement steps render', async ({ page }) => {
    await page.goto(URL);
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(`[data-testid="step-${i}"]`)).toBeVisible();
    }
  });

  test('TC-E2E-21: honest limits section renders', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="honest-limits"]')).toBeVisible();
  });

  test('TC-E2E-22: FAQ section has ≥ 6 questions', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="faq-question"]').first()).toBeVisible();
    expect(
      await page.locator('[data-testid="faq-question"]').count()
    ).toBeGreaterThanOrEqual(6);
  });

  test('TC-E2E-23: ≥ 3 CTAs link to calculator', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="cta-to-calculator"]').first()).toBeVisible();
    expect(
      await page.locator('[data-testid="cta-to-calculator"]').count()
    ).toBeGreaterThanOrEqual(3);
  });

  test('TC-E2E-24: article word count > 2000', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
    const text = await page.locator('[data-testid="article-content"]').textContent();
    expect((text?.trim().split(/\s+/).length || 0)).toBeGreaterThan(2000);
  });

  test('TC-E2E-25: Harvard and Karolinska and Blue Zone cited in article', async ({ page }) => {
    await page.goto(URL);
    const article = await page.locator('[data-testid="article-content"]').textContent();
    expect(article).toContain('Harvard');
    expect(article).toContain('Karolinska');
    expect(article).toContain('Blue Zone');
  });

  // ── SCHEMA ───────────────────────────────────────────────────
  test('TC-E2E-26: SoftwareApplication schema valid and free', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let found = false;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'SoftwareApplication') {
          found = true;
          expect(d.offers.price).toBe('0');
        }
      } catch {}
    }
    expect(found).toBe(true);
  });

  test('TC-E2E-27: FAQPage schema has ≥ 6 questions', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let count = 0;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'FAQPage') count = Math.max(count, d.mainEntity?.length || 0);
      } catch {}
    }
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('TC-E2E-28: BreadcrumbList has exactly 3 items', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let items = 0;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'BreadcrumbList') items = Math.max(items, d.itemListElement?.length || 0);
      } catch {}
    }
    expect(items).toBe(3);
  });

  // ── NAVIGATION ───────────────────────────────────────────────
  test('TC-E2E-29: CTA click navigates to life expectancy page (no 404)', async ({ page }) => {
    await page.goto(URL);
    await page.locator('[data-testid="cta-to-calculator"]').first().click();
    await expect(page).toHaveURL(/life-expectancy|longevity/);
    expect((await page.title()).toLowerCase()).not.toContain('404');
  });

  test('TC-E2E-30: all 4 related tool links return HTTP < 400', async ({ page }) => {
    await page.goto(URL);
    const tools = page.locator('[data-testid="related-tool"]');
    expect(await tools.count()).toBe(4);
    for (let i = 0; i < 4; i++) {
      const href = await tools.nth(i).getAttribute('href');
      if (href?.startsWith('/')) {
        const res = await page.request.get(`${BASE}${href}`);
        expect(res.status()).toBeLessThan(400);
      }
    }
  });

  test('TC-E2E-31: breadcrumb has 3 items', async ({ page }) => {
    await page.goto(URL);
    expect(await page.locator('[data-testid="breadcrumb-item"]').count()).toBe(3);
  });

  test('TC-E2E-32: clicking breadcrumb "Longevity Calculator" navigates correctly', async ({ page }) => {
    await page.goto(URL);
    await page.locator('[data-testid="breadcrumb-item"]').nth(1).locator('a').click();
    await expect(page).toHaveURL(/longevity-calculator/);
    expect((await page.title()).toLowerCase()).not.toContain('404');
  });

  test('TC-E2E-33: clicking breadcrumb "Home" goes to homepage', async ({ page }) => {
    await page.goto(URL);
    await page.locator('[data-testid="breadcrumb-item"]').first().locator('a').click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/^https?:\/\/[^/]+(\/)?$/);
  });

  // ── PRERENDER & SITEMAP ──────────────────────────────────────
  test('TC-E2E-34: prerendered HTML contains key content for Google', async ({ page }) => {
    const html = await (await page.request.get(URL)).text();
    expect(html.toLowerCase()).toContain('how long will i live');
    expect(html).toContain('WHO');
    expect(html).toContain('Harvard');
    expect(html).toContain('Karolinska');
    expect(html).toContain('Japan');
    expect(html).toContain('India');
    expect(html).toContain('SoftwareApplication');
    expect(html).toContain('FAQPage');
  });

  test('TC-E2E-35: page appears in sitemap.xml', async ({ page }) => {
    const xml = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
    expect(xml).toContain('/how-long-will-i-live');
  });

  // ── MOBILE ───────────────────────────────────────────────────
  test('TC-E2E-36: no horizontal scroll on iPhone SE (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });

  test('TC-E2E-37: 4 stat cards visible on mobile (2-column grid)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    expect(await page.locator('[data-testid="stat-card"]').count()).toBe(4);
    await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible();
  });

  test('TC-E2E-38: factor cards readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    await expect(page.locator('[data-testid="factor-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="factor-8"]')).toBeVisible();
  });

  // ── ACCESSIBILITY ────────────────────────────────────────────
  test('TC-E2E-39: page has main landmark', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('main')).toBeVisible();
  });

  test('TC-E2E-40: country table has th[scope] attributes', async ({ page }) => {
    await page.goto(URL);
    const thWithScope = page.locator('[data-testid="country-table-wrapper"] th[scope]');
    expect(await thWithScope.count()).toBeGreaterThan(0);
  });

  test('TC-E2E-41: keyboard Tab reaches first CTA', async ({ page }) => {
    await page.goto(URL);
    for (let i = 0; i < 20; i++) {
      const testId = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid')
      );
      if (testId === 'cta-to-calculator') break;
      await page.keyboard.press('Tab');
    }
    expect(
      await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    ).toBe('cta-to-calculator');
  });

  // ── PERFORMANCE ──────────────────────────────────────────────
  test('TC-E2E-42: loads in under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('TC-E2E-43: no critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const critical = errors.filter(e =>
      !e.includes('favicon') && !e.includes('gtag') && !e.includes('analytics')
    );
    expect(critical).toHaveLength(0);
  });

  // ── INTERNAL LINKING ─────────────────────────────────────────
  test('TC-E2E-44: /longevity-calculator links to this page', async ({ page }) => {
    await page.goto(`${BASE}/longevity-calculator`);
    expect(await page.locator('a[href*="how-long-will-i-live"]').count()).toBeGreaterThanOrEqual(1);
  });

  test('TC-E2E-45: /biological-age-calculator links to this page', async ({ page }) => {
    await page.goto(`${BASE}/biological-age-calculator`);
    expect(await page.locator('a[href*="how-long-will-i-live"]').count()).toBeGreaterThanOrEqual(1);
  });

  test('TC-E2E-46: no undefined or [object Object] in page', async ({ page }) => {
    await page.goto(URL);
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('[object Object]');
    expect(bodyText).not.toContain('[object object]');
  });

});
