import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  { path: '/', title: 'BornClock', h1Contains: 'Know your time' },
  { path: '/age-calculator', title: 'Age Calculator', h1Contains: 'Age' },
  { path: '/life-expectancy', title: 'Life Expectancy', h1Contains: 'Life Expectancy' },
  { path: '/biological-age', title: 'Biological Age', h1Contains: 'Biological Age' },
  { path: '/planetary-age', title: 'Planetary Age', h1Contains: 'Planetary' },
  { path: '/country-comparison', title: 'Country', h1Contains: 'Country' },
  { path: '/zodiac', title: 'Zodiac', h1Contains: 'Zodiac' },
  { path: '/chinese-zodiac', title: 'Chinese Zodiac', h1Contains: 'Chinese' },
  { path: '/vedic-zodiac', title: 'Vedic', h1Contains: 'Vedic' },
  { path: '/numerology', title: 'Numerology', h1Contains: 'Numerology' },
  { path: '/birthstone', title: 'Birthstone', h1Contains: 'Birthstone' },
  { path: '/generation', title: 'Generation', h1Contains: 'Generation' },
  { path: '/celebrity-birthday', title: 'Celebrity', h1Contains: 'Celebrity' },
  { path: '/todays-birthdays', title: "Today's Birthdays", h1Contains: 'Birthday' },
  { path: '/birthday-report', title: 'Birthday Report', h1Contains: 'Birthday' },
  { path: '/upgrade', title: 'Upgrade', h1Contains: 'Upgrade' },
  { path: '/blog', title: 'Blog', h1Contains: 'Blog' },
  { path: '/about', title: 'About', h1Contains: 'About' },
  { path: '/methodology', title: 'Methodology', h1Contains: 'Methodology' },
  { path: '/contact', title: 'Contact', h1Contains: 'Contact' },
  { path: '/privacy', title: 'Privacy', h1Contains: 'Privacy' },
  { path: '/terms', title: 'Terms', h1Contains: 'Terms' },
  { path: '/faq', title: 'FAQ', h1Contains: 'FAQ' },
  { path: '/answers/how-long-will-i-live', title: 'How Long', h1Contains: 'How Long' },
  { path: '/answers/what-is-my-biological-age', title: 'Biological Age', h1Contains: 'Biological Age' },
  { path: '/answers/who-shares-my-birthday', title: 'Birthday', h1Contains: 'Birthday' },
  { path: '/answers/how-old-am-i-on-mars', title: 'Mars', h1Contains: 'Mars' },
  { path: '/answers/what-is-my-zodiac-sign', title: 'Zodiac', h1Contains: 'Zodiac' },
  { path: '/answers/what-is-my-life-path-number', title: 'Life Path', h1Contains: 'Life Path' },
  { path: '/answers/how-to-calculate-age', title: 'Calculate', h1Contains: 'Age' },
  { path: '/answers/what-generation-am-i', title: 'Generation', h1Contains: 'Generation' },
  { path: '/answers/how-to-live-longer', title: 'Live Longer', h1Contains: 'Live Longer' },
  { path: '/answers/what-is-bmi', title: 'BMI', h1Contains: 'BMI' },
  { path: '/answers/what-is-life-expectancy', title: 'Life Expectancy', h1Contains: 'Life Expectancy' },
  { path: '/answers/how-does-stress-affect-life-expectancy', title: 'Stress', h1Contains: 'Stress' },
];

test.describe('All public routes load without errors', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} loads correctly`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // No blank page
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(100);

      // No error boundary shown
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
      await expect(page.locator('text=Cannot read')).not.toBeVisible();
      await expect(page.locator('text=undefined is not')).not.toBeVisible();

      // H1 exists and contains expected text
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      const h1Text = await h1.innerText();
      expect(h1Text.toLowerCase()).toContain(route.h1Contains.toLowerCase());

      // No JS console errors (filter out known third-party noise)
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('analytics') &&
        !e.includes('gtag') &&
        !e.includes('clarity')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Navigation bar', () => {
  test('nav is visible and white on dark-bg pages', async ({ page }) => {
    for (const path of ['/biological-age', '/country-comparison']) {
      await page.goto(path);
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();
      // Nav must have light background
      const bg = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
      // Should not be a dark color (rgb values all low)
      const rgb = bg.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
      const isDark = rgb[0] < 80 && rgb[1] < 80 && rgb[2] < 80;
      expect(isDark).toBe(false);
    }
  });

  test('404 page renders for unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(page.locator('text=Page Not Found')).toBeVisible();
    await expect(page.locator('text=BornClock')).toBeVisible();
  });

  test('no Upgrade button flash on authenticated pages', async ({ page }) => {
    // Visit page and immediately check — Upgrade should not flash
    await page.goto('/life-expectancy');
    // Check within first 500ms
    await page.waitForTimeout(500);
    // If user is not logged in, upgrade can show — but it should not flicker
    // This test verifies the page doesn't show/hide the upgrade button rapidly
    const upgradeVisible = await page.locator('text=Upgrade').first().isVisible();
    // Just confirm the state is stable (not that it's hidden — user may not be premium)
    await page.waitForTimeout(1000);
    const upgradeVisibleAfter = await page.locator('text=Upgrade').first().isVisible();
    expect(upgradeVisible).toBe(upgradeVisibleAfter);
  });
});
