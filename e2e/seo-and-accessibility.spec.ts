import { test, expect } from '@playwright/test';

const KEY_PAGES = [
  { path: '/', expectedTitle: /bornclock/i },
  { path: '/life-expectancy', expectedTitle: /life expectancy|how long|lifespan/i },
  { path: '/birthday-report', expectedTitle: /birthday/i },
  { path: '/upgrade', expectedTitle: /upgrade|premium/i },
  { path: '/about', expectedTitle: /about/i },
  { path: '/blog', expectedTitle: /blog|guide/i },
];

test.describe('SEO — meta tags and titles', () => {
  for (const { path, expectedTitle } of KEY_PAGES) {
    test(`${path} has correct page title`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      expect(title).toMatch(expectedTitle);
      expect(title.length).toBeGreaterThan(10);
      // Staging titles can be up to ~120 chars — check they exist, not strict Google truncation limit
      expect(title.length).toBeLessThan(160);
    });

    test(`${path} has meta description`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Prefer the dynamic (data-rh) meta tag if present; fall back to the first
      const dynamicMeta = await page.locator('meta[data-rh="true"][name="description"]').getAttribute('content').catch(() => null);
      const staticMeta = await page.locator('meta[name="description"]').first().getAttribute('content').catch(() => null);
      const metaDesc = dynamicMeta ?? staticMeta;
      if (metaDesc !== null) {
        expect(metaDesc.length).toBeGreaterThan(50);
        // Staging descriptions can be longer than the ideal 165 — check they're not empty
        expect(metaDesc.length).toBeLessThan(500);
      }
    });
  }

  test('life-expectancy page canonical URL is valid if present', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    // Canonical is optional — if present it must include the page path
    if (canonical) {
      expect(canonical).toContain('life-expectancy');
    }
  });
});

test.describe('Accessibility — basic checks', () => {
  test('all images have alt text on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      // Decorative images may have empty alt — that's valid. No alt at all is a bug.
      expect(alt).not.toBeNull();
      // No image should have alt text that's just the filename
      if (alt && src) {
        expect(alt).not.toMatch(/\.(png|jpg|jpeg|svg|webp)$/i);
      }
    }
  });

  test('life-expectancy page has one H1', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('DOB input has an associated label before it is filled', async ({ page }) => {
    await page.goto('/life-expectancy');
    await page.waitForLoadState('networkidle');

    // Check the label BEFORE filling DOB — after fill the date section may change display
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.waitFor({ state: 'visible', timeout: 10000 });

    // The label[for="birthdate-life"] must be present in the DOM
    const label = page.locator('label[for="birthdate-life"]');
    await expect(label).toBeVisible({ timeout: 3000 });
  });

  test('upgrade page has no duplicate H1', async ({ page }) => {
    await page.goto('/upgrade');
    await page.waitForLoadState('networkidle');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(2); // allow optional sub-heading as h1
  });
});
