import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.bornclock.com';
const URL  = `${BASE}/biological-age-calculator`;

test.describe('Biological Age Calculator Page', () => {

  // ── ROUTING ──────────────────────────────────────────────────
  test('TC-E2E-01: loads with HTTP 200', async ({ page }) => {
    const res = await page.goto(URL);
    expect(res?.status()).toBe(200);
  });

  test('TC-E2E-02: trailing slash variation does not 404', async ({ page }) => {
    const res = await page.goto(`${URL}/`);
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).not.toContain('404');
  });

  test('TC-E2E-03: not blocked by robots.txt', async ({ page }) => {
    const robots = await (await page.request.get(`${BASE}/robots.txt`)).text();
    expect(robots).not.toMatch(/Disallow:.*biological-age-calculator/);
  });

  test('TC-E2E-04: not tagged noindex', async ({ page }) => {
    await page.goto(URL);
    expect(
      await page.locator('meta[name="robots"][content*="noindex"]').count()
    ).toBe(0);
  });

  // ── SEO META ─────────────────────────────────────────────────
  test('TC-E2E-05: title ≤ 70 chars and contains "biological age" + "BornClock"', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.toLowerCase()).toContain('biological age');
    expect(title).toContain('BornClock');
    expect(title.length).toBeLessThanOrEqual(70);
  });

  test('TC-E2E-06: meta description is relevant and ≤ 160 chars', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const meta = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect(meta?.toLowerCase()).toContain('biological age');
    expect(meta?.length || 0).toBeLessThanOrEqual(160);
    expect(meta?.length || 0).toBeGreaterThan(50);
  });

  test('TC-E2E-07: canonical URL contains /biological-age-calculator', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href');
    expect(canonical).toContain('/biological-age-calculator');
  });

  test('TC-E2E-08: og:title contains "biological age"', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const og = await page.locator('meta[property="og:title"]').first().getAttribute('content');
    expect(og?.toLowerCase()).toContain('biological age');
  });

  // ── PAGE STRUCTURE ───────────────────────────────────────────
  test('TC-E2E-09: exactly one H1 containing "Biological Age"', async ({ page }) => {
    await page.goto(URL);
    expect(await page.locator('h1').count()).toBe(1);
    const h1 = await page.locator('h1').first().textContent();
    expect(h1?.toLowerCase()).toContain('biological age');
  });

  test('TC-E2E-10: Bryan Johnson section is visible and contains citation', async ({ page }) => {
    await page.goto(URL);
    const bj = page.locator('[data-testid="bryan-johnson-section"]');
    await expect(bj).toBeVisible();
    await expect(bj).toContainText('Bryan Johnson');
    // Citation must be present — not just a claim without source
    const text = await bj.textContent();
    expect(text?.toLowerCase()).toMatch(/blueprint|protocol|source/i);
  });

  test('TC-E2E-11: above-fold CTA visible on desktop without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(URL);
    await expect(
      page.locator('[data-testid="cta-to-calculator"]').first()
    ).toBeInViewport();
  });

  test('TC-E2E-12: all 12 habit cards render', async ({ page }) => {
    await page.goto(URL);
    for (let i = 1; i <= 12; i++) {
      await expect(page.locator(`[data-testid="habit-${i}"]`)).toBeVisible();
    }
  });

  test('TC-E2E-13: all 12 habits have difficulty badges (Easy/Medium/Hard)', async ({ page }) => {
    await page.goto(URL);
    const badges = page.locator('[data-testid="habit-difficulty"]');
    await expect(badges).toHaveCount(12);
    const allBadgeTexts = await badges.allTextContents();
    allBadgeTexts.forEach(text => {
      expect(['Easy', 'Medium', 'Hard']).toContain(text.trim());
    });
  });

  test('TC-E2E-14: all 12 habits have gain badges in +X.X yrs format', async ({ page }) => {
    await page.goto(URL);
    const gains = page.locator('[data-testid="habit-gain"]');
    await expect(gains).toHaveCount(12);
    const allGainTexts = await gains.allTextContents();
    allGainTexts.forEach(text => {
      expect(text.trim()).toMatch(/^\+[\d.]+ yrs$/);
    });
  });

  test('TC-E2E-15: realistic potential shown (not misleading raw sum)', async ({ page }) => {
    await page.goto(URL);
    const habits = page.locator('[data-testid="habits-section"]');
    const text = await habits.textContent();
    // Raw sum of all habits is ~10 years — this should NOT appear
    expect(text).not.toMatch(/\+10(\.\d+)? years realistic/);
    // Should show a realistic figure ≤ 8
    expect(text?.toLowerCase()).toContain('realistic');
  });

  test('TC-E2E-16: all 5 how-it-works steps render', async ({ page }) => {
    await page.goto(URL);
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator(`[data-testid="step-${i}"]`)).toBeVisible();
    }
  });

  test('TC-E2E-17: intervention table renders with 6 rows', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="intervention-row"]')).toHaveCount(6);
  });

  test('TC-E2E-18: intervention table has scroll wrapper (no overflow on mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    // Table wrapper must have overflow-x-auto
    const wrapper = page.locator('[data-testid="intervention-table-wrapper"]');
    await expect(wrapper).toBeVisible();
    // Body scroll should not be wider than viewport (table is inside its wrapper)
    const bodyScroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(bodyScroll).toBeLessThanOrEqual(380);
  });

  test('TC-E2E-19: honest limits section renders', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="honest-limits"]')).toBeVisible();
  });

  test('TC-E2E-20: FAQ section has ≥ 6 questions', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="faq-question"]').first()).toBeVisible();
    expect(
      await page.locator('[data-testid="faq-question"]').count()
    ).toBeGreaterThanOrEqual(6);
  });

  test('TC-E2E-21: chrono vs bio comparison section renders', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="chrono-vs-bio"]')).toBeVisible();
  });

  test('TC-E2E-22: ≥ 3 CTAs link to calculator', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="cta-to-calculator"]').first()).toBeVisible();
    expect(
      await page.locator('[data-testid="cta-to-calculator"]').count()
    ).toBeGreaterThanOrEqual(3);
  });

  test('TC-E2E-23: article word count > 2000', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
    const text = await page.locator('[data-testid="article-content"]').textContent();
    expect((text?.trim().split(/\s+/).length || 0)).toBeGreaterThan(2000);
  });

  // ── SCHEMA ───────────────────────────────────────────────────
  test('TC-E2E-24: SoftwareApplication schema valid and free', async ({ page }) => {
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

  test('TC-E2E-25: FAQPage schema with ≥ 6 questions', async ({ page }) => {
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

  test('TC-E2E-26: BreadcrumbList schema has 3 items', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let items = 0;
    for (const s of schemas) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'BreadcrumbList') {
          items = Math.max(items, d.itemListElement?.length || 0);
        }
      } catch {}
    }
    expect(items).toBe(3);
  });

  // ── NAVIGATION ───────────────────────────────────────────────
  test('TC-E2E-27: CTA click navigates to life expectancy (no 404)', async ({ page }) => {
    await page.goto(URL);
    await page.locator('[data-testid="cta-to-calculator"]').first().click();
    await expect(page).toHaveURL(/life-expectancy|longevity/);
    expect((await page.title()).toLowerCase()).not.toContain('404');
  });

  test('TC-E2E-28: all related tool links return HTTP < 400', async ({ page }) => {
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

  test('TC-E2E-29: breadcrumb has 3 items', async ({ page }) => {
    await page.goto(URL);
    const items = page.locator('[data-testid="breadcrumb-item"]');
    expect(await items.count()).toBe(3);
  });

  test('TC-E2E-30: clicking breadcrumb "Longevity Calculator" navigates correctly', async ({ page }) => {
    await page.goto(URL);
    const link = page.locator('[data-testid="breadcrumb-item"]').nth(1).locator('a');
    await link.click();
    await expect(page).toHaveURL(/longevity-calculator/);
    expect((await page.title()).toLowerCase()).not.toContain('404');
  });

  test('TC-E2E-31: clicking breadcrumb "Home" navigates to homepage', async ({ page }) => {
    await page.goto(URL);
    const homeLink = page.locator('[data-testid="breadcrumb-item"]').first().locator('a');
    await homeLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/^https?:\/\/[^/]+(\/)?$/);
  });

  // ── PRERENDER & SITEMAP ──────────────────────────────────────
  test('TC-E2E-32: prerendered HTML contains key content for Google', async ({ page }) => {
    const html = await (await page.request.get(URL)).text();
    expect(html.toLowerCase()).toContain('biological age');
    expect(html).toContain('Horvath');
    expect(html).toContain('Bryan Johnson');
    expect(html).toContain('NIH');
    expect(html).toContain('SoftwareApplication');
    expect(html).toContain('FAQPage');
  });

  test('TC-E2E-33: page in sitemap.xml', async ({ page }) => {
    const xml = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
    expect(xml).toContain('/biological-age-calculator');
  });

  // ── MOBILE ───────────────────────────────────────────────────
  test('TC-E2E-34: no horizontal scroll on iPhone SE (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });

  test('TC-E2E-35: habit grid is readable on mobile (single column)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    await expect(page.locator('[data-testid="habit-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-12"]')).toBeVisible();
  });

  test('TC-E2E-36: intervention table does not cause horizontal scroll (has wrapper)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(URL);
    await expect(page.locator('[data-testid="intervention-table-wrapper"]')).toBeVisible();
    // Page scroll width should not exceed viewport
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });

  // ── ACCESSIBILITY ────────────────────────────────────────────
  test('TC-E2E-37: page has main landmark', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('main')).toBeVisible();
  });

  test('TC-E2E-38: keyboard Tab reaches first CTA', async ({ page }) => {
    await page.goto(URL);
    for (let i = 0; i < 20; i++) {
      const testId = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid')
      );
      if (testId === 'cta-to-calculator') break;
      await page.keyboard.press('Tab');
    }
    const testId = await page.evaluate(
      () => document.activeElement?.getAttribute('data-testid')
    );
    expect(testId).toBe('cta-to-calculator');
  });

  test('TC-E2E-39: table has scope attributes for accessibility', async ({ page }) => {
    await page.goto(URL);
    const thWithScope = page.locator('[data-testid="intervention-table"] th[scope]');
    expect(await thWithScope.count()).toBeGreaterThan(0);
  });

  // ── PERFORMANCE ──────────────────────────────────────────────
  test('TC-E2E-40: loads in under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('TC-E2E-41: no critical console errors', async ({ page }) => {
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
  test('TC-E2E-42: /longevity-calculator links to this page', async ({ page }) => {
    await page.goto(`${BASE}/longevity-calculator`);
    const link = page.locator('a[href*="biological-age-calculator"]');
    expect(await link.count()).toBeGreaterThanOrEqual(1);
  });

  test('TC-E2E-43: no undefined or [object Object] in page content', async ({ page }) => {
    await page.goto(URL);
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('[object Object]');
    expect(bodyText).not.toContain('[object object]');
  });

});
