import { test, expect } from '@playwright/test';
test.describe('Batch A Human Tester', () => {
  test('HT-A-01: Virat Scorpio yes Dhanishtha no placeholder visible', async ({ page }) => {
    await page.goto('/celebrity/virat-kohli/');
    const body = await page.textContent('body');
    expect(body).toContain('Scorpio');
    expect(body).not.toContain('Dhanishtha');
    expect(body).not.toContain('undefined');
    await expect(page.locator('[data-testid="nakshatra-placeholder"]')).toBeVisible();
    const title = await page.title();
    expect(title).toContain('Virat');
    expect(title.length).toBeLessThanOrEqual(70);
  });
  test('HT-A-02: compatibility no gana score zodiac present', async ({ page }) => {
    await page.goto('/compatibility/');
    const body = await page.textContent('body');
    expect(body).not.toContain('Nakshatra score');
    expect(body).toMatch(/zodiac|compatibility/i);
  });
  test('HT-A-03: homepage BornClock title <=70 no undefined', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('BornClock');
    expect(title.length).toBeLessThanOrEqual(70);
    const body = await page.textContent('body');
    expect(body).not.toContain('[object Object]');
    if (body?.includes('₹')) expect(body).not.toMatch(/₹299.*report/i);
  });
  test('HT-A-04: celeb slugs lowercase kebab', async ({ page }) => {
    await page.goto('/');
    const links = await page.$$eval('a[href*="/celebrity/"]', (els: any[]) => els.map((e: any) => e.href));
    links.slice(0, 20).forEach((href: string) => {
      const slug = href.split('/celebrity/')[1]?.replace('/', '');
      if (slug) { expect(slug).toBe(slug.toLowerCase()); expect(slug).toMatch(/^[a-z0-9-]+$/); }
    });
  });
  test('HT-A-05: mobile 375px no horizontal scroll celeb page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/celebrity/virat-kohli/');
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(385);
  });
  test('HT-A-06: born-on page intact', async ({ page }) => {
    const r = await page.goto('/born-on/august-6/india/');
    expect(r?.status()).toBe(200);
    expect((await page.title()).toLowerCase()).toContain('august');
  });
  test('HT-A-07: SRK page no wrong Nakshatra (placeholder only)', async ({ page }) => {
    await page.goto('/celebrity/shah-rukh-khan/');
    await expect(page.locator('[data-testid="nakshatra-placeholder"]')).toBeVisible();
    expect(await page.textContent('body')).not.toContain('Vishakha');
  });
});
