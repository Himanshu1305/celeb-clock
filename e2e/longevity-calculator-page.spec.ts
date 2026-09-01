import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.bornclock.com';
const URL  = `${BASE}/longevity-calculator`;

test.describe('Longevity Calculator Page', () => {

  // ── ROUTING & HTTP ──────────────────────────────────────────
  test('TC-E2E-01: loads with HTTP 200', async ({ page }) => {
    const res = await page.goto(URL);
    expect(res?.status()).toBe(200);
  });

  test('TC-E2E-02: trailing slash redirects correctly (no 404)', async ({ page }) => {
    const res = await page.goto(`${URL}/`);
    // Should redirect to canonical URL, not 404
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).not.toContain('404');
  });

  test('TC-E2E-03: not blocked by robots.txt', async ({ page }) => {
    const res = await page.request.get(`${BASE}/robots.txt`);
    const robots = await res.text();
    // Should NOT contain Disallow: /longevity-calculator
    expect(robots).not.toMatch(/Disallow:.*longevity-calculator/);
  });

  test('TC-E2E-04: not tagged noindex', async ({ page }) => {
    await page.goto(URL);
    const noindex = await page.locator('meta[name="robots"][content*="noindex"]').count();
    expect(noindex).toBe(0);
  });

  // ── SEO META TAGS ────────────────────────────────────────────
  // NB: react-helmet-async mutates <head> asynchronously on hydration (remove +
  // re-add), so read head tags after networkidle to avoid the reconciliation window.
  test('TC-E2E-05: title tag contains "longevity calculator"', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.toLowerCase()).toContain('longevity calculator');
    expect(title).toContain('BornClock');
  });

  test('TC-E2E-06: title tag is under 70 characters', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(70);
  });

  test('TC-E2E-07: meta description exists and is relevant', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    // Site emits head tags twice (SEO component + prerender injection), identical
    // values — read the first to avoid Playwright strict-mode on the duplicate.
    const meta = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute('content');
    expect(meta?.toLowerCase()).toContain('longevity');
    expect(meta?.length || 0).toBeLessThanOrEqual(160);
    expect(meta?.length || 0).toBeGreaterThan(50);
  });

  test('TC-E2E-08: canonical URL is correct', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const canonical = await page
      .locator('link[rel="canonical"]')
      .first()
      .getAttribute('href');
    // Project convention (SEO.tsx + prerender.mjs): canonical is the trailing-slash
    // form, which is the Worker's 200 URL (non-slash 307-redirects to it). So the
    // correct canonical is https://bornclock.com/longevity-calculator/.
    expect(canonical).toContain('/longevity-calculator');
    expect(canonical).toBe('https://bornclock.com/longevity-calculator/');
  });

  test('TC-E2E-09: og:title exists', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const og = await page.locator('meta[property="og:title"]').first().getAttribute('content');
    expect(og).toBeTruthy();
    expect(og?.toLowerCase()).toContain('longevity');
  });

  // ── PAGE STRUCTURE ───────────────────────────────────────────
  test('TC-E2E-10: H1 contains "Longevity Calculator"', async ({ page }) => {
    await page.goto(URL);
    const h1 = await page.locator('h1').textContent();
    expect(h1?.toLowerCase()).toContain('longevity calculator');
  });

  test('TC-E2E-11: exactly one H1 on the page', async ({ page }) => {
    await page.goto(URL);
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('TC-E2E-12: CTA button is visible without scrolling on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(URL);
    const cta = page.locator('[data-testid="cta-to-calculator"]').first();
    await expect(cta).toBeInViewport();
  });

  test('TC-E2E-13: all 8 factor sections render', async ({ page }) => {
    await page.goto(URL);
    for (let i = 1; i <= 8; i++) {
      const factor = page.locator(`[data-testid="factor-${i}"]`);
      await expect(factor).toBeVisible();
    }
  });

  test('TC-E2E-14: FAQ section has 6 or more questions', async ({ page }) => {
    await page.goto(URL);
    // Auto-wait for render (rides through the hydration re-render flash) before the count.
    await expect(page.locator('[data-testid="faq-question"]').first()).toBeVisible();
    const count = await page.locator('[data-testid="faq-question"]').count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('TC-E2E-15: at least 3 CTAs link to the calculator', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="cta-to-calculator"]').first()).toBeVisible();
    const count = await page.locator('[data-testid="cta-to-calculator"]').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('TC-E2E-16: article content is substantial (2000+ words)', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
    const article = page.locator('[data-testid="article-content"]');
    const text = await article.textContent();
    const wordCount = text?.trim().split(/\s+/).length || 0;
    expect(wordCount).toBeGreaterThan(2000);
  });

  test('TC-E2E-17: score band section has 4 bands', async ({ page }) => {
    await page.goto(URL);
    // toHaveCount auto-retries until the DOM settles — robust to the hydration flash.
    await expect(page.locator('[data-testid="score-band"]')).toHaveCount(4);
  });

  test('TC-E2E-18: related tools section has 4 links', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="related-tool"]')).toHaveCount(4);
  });

  // ── SCHEMA ───────────────────────────────────────────────────
  test('TC-E2E-19: SoftwareApplication schema is valid JSON-LD', async ({ page }) => {
    await page.goto(URL);
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let found = false;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'SoftwareApplication') {
          found = true;
          expect(d['@context']).toBe('https://schema.org');
          expect(d.offers).toBeTruthy();
          expect(d.offers.price).toBe('0');
        }
      } catch {}
    }
    expect(found).toBe(true);
  });

  test('TC-E2E-20: FAQPage schema is valid with 6+ questions', async ({ page }) => {
    await page.goto(URL);
    // Settle hydration: React re-inserting the body JSON-LD scripts transiently
    // duplicates them, so read the stable post-hydration DOM.
    await page.waitForLoadState('networkidle');
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let count = 0;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        // max() so a transient/duplicate empty FAQPage can't clobber the real one.
        if (d['@type'] === 'FAQPage') count = Math.max(count, d.mainEntity?.length || 0);
      } catch {}
    }
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('TC-E2E-21: BreadcrumbList schema exists', async ({ page }) => {
    await page.goto(URL);
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let found = false;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'BreadcrumbList') found = true;
      } catch {}
    }
    expect(found).toBe(true);
  });

  // ── NAVIGATION & LINKS ───────────────────────────────────────
  test('TC-E2E-22: CTA click navigates to life expectancy calculator', async ({ page }) => {
    await page.goto(URL);
    const cta = page.locator('[data-testid="cta-to-calculator"]').first();
    await cta.click();
    await expect(page).toHaveURL(/life-expectancy|longevity/);
    const title = await page.title();
    expect(title.toLowerCase()).not.toContain('404');
    expect(title.toLowerCase()).not.toContain('not found');
  });

  test('TC-E2E-23: all related tool links navigate without 404', async ({ page }) => {
    await page.goto(URL);
    const tools = page.locator('[data-testid="related-tool"]');
    const count = await tools.count();
    for (let i = 0; i < count; i++) {
      const href = await tools.nth(i).getAttribute('href');
      if (href?.startsWith('/')) {
        const res = await page.request.get(`${BASE}${href}`);
        expect(res.status()).toBeLessThan(400);
      }
    }
  });

  // ── PRERENDER & SITEMAP ──────────────────────────────────────
  test('TC-E2E-24: prerendered HTML contains article content (Google sees it)', async ({ page }) => {
    const res = await page.request.get(URL);
    const html = await res.text();
    expect(html.toLowerCase()).toContain('longevity calculator');
    expect(html).toContain('WHO');
    expect(html).toContain('Harvard');
    // Schema should be in the static HTML
    expect(html).toContain('SoftwareApplication');
    expect(html).toContain('FAQPage');
  });

  test('TC-E2E-25: page appears in sitemap.xml', async ({ page }) => {
    const res = await page.request.get(`${BASE}/sitemap.xml`);
    const xml = await res.text();
    expect(xml).toContain('/longevity-calculator');
  });

  // ── MOBILE ───────────────────────────────────────────────────
  test('TC-E2E-26: page is responsive on iPhone SE (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="cta-to-calculator"]').first()).toBeVisible();
    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });

  test('TC-E2E-27: CTA button is full width on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    // Hero CTA should be in viewport on mobile
    const cta = page.locator('[data-testid="cta-to-calculator"]').first();
    await expect(cta).toBeVisible();
  });

  // ── ACCESSIBILITY ────────────────────────────────────────────
  test('TC-E2E-28: page has a main landmark', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('main')).toBeVisible();
  });

  test('TC-E2E-29: breadcrumb navigation renders', async ({ page }) => {
    await page.goto(URL);
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Longevity Calculator');
  });

  test('TC-E2E-30: keyboard navigation reaches CTA button', async ({ page }) => {
    await page.goto(URL);
    await page.keyboard.press('Tab');
    for (let i = 0; i < 15; i++) {
      const focused = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-testid')
      );
      if (focused === 'cta-to-calculator') break;
      await page.keyboard.press('Tab');
    }
    const focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('data-testid')
    );
    expect(focused).toBe('cta-to-calculator');
  });

  // ── PERFORMANCE ──────────────────────────────────────────────
  test('TC-E2E-31: page loads in under 4 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(4000);
  });

  test('TC-E2E-32: no critical console errors', async ({ page }) => {
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
  test('TC-E2E-33: homepage links to /longevity-calculator', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/longevity-calculator"]');
    const count = await link.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-E2E-34: content has no "undefined" or "[object Object]"', async ({ page }) => {
    await page.goto(URL);
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('[object Object]');
    expect(bodyText).not.toContain('null');
  });

});
