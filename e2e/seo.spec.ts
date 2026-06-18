import { test, expect } from '@playwright/test';

test.describe('SEO meta tags and schema', () => {
  const KEY_PAGES = [
    '/',
    '/life-expectancy',
    '/biological-age',
    '/age-calculator',
    '/birthday-report',
    '/answers/how-long-will-i-live',
    '/answers/what-is-my-biological-age',
  ];

  for (const path of KEY_PAGES) {
    test(`${path} has required meta tags`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Title tag exists and is not empty
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title).toContain('BornClock');

      // Meta description exists
      const metaDesc = page.locator('meta[name="description"]');
      const descContent = await metaDesc.getAttribute('content');
      expect(descContent).toBeTruthy();
      expect(descContent!.length).toBeGreaterThan(50);
      expect(descContent!.length).toBeLessThan(165);

      // OG title exists
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogTitleContent = await ogTitle.getAttribute('content');
      expect(ogTitleContent).toBeTruthy();
    });
  }

  test('sitemap.xml is accessible and valid', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('<urlset');
    expect(content).toContain('bornclock.com');
    // Should have more than 50 URLs
    const urlCount = (content.match(/<url>/g) || []).length;
    expect(urlCount).toBeGreaterThan(50);
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('Sitemap');
    expect(content).toContain('bornclock.com');
  });

  test('answer pages have FAQ schema', async ({ page }) => {
    await page.goto('/answers/how-long-will-i-live');
    await page.waitForLoadState('networkidle');

    // Check for JSON-LD schema script
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    expect(schemas.length).toBeGreaterThan(0);

    let hasFAQSchema = false;
    for (const schema of schemas) {
      const content = await schema.innerText();
      try {
        const parsed = JSON.parse(content);
        if (parsed['@type'] === 'FAQPage') hasFAQSchema = true;
      } catch {}
    }
    expect(hasFAQSchema).toBe(true);
  });

  test('homepage has WebApplication schema', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const schemas = await page.locator('script[type="application/ld+json"]').all();
    let hasAppSchema = false;
    for (const schema of schemas) {
      const content = await schema.innerText();
      try {
        const parsed = JSON.parse(content);
        if (parsed['@type'] === 'WebApplication' || parsed['@type'] === 'WebSite') hasAppSchema = true;
      } catch {}
    }
    expect(hasAppSchema).toBe(true);
  });
});
