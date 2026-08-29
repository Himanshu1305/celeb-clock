/**
 * Suite — batch-10-smoke.spec.ts  (SEO Batch 2: country longevity, Hindi, widget/embed).
 * One smoke test per new route: h1 present + non-empty, unique page-specific title,
 * and no uncaught page errors. Runs against the vite dev server.
 */
import { test, expect } from '@playwright/test';

const ROUTES: { path: string; title: RegExp }[] = [
  { path: '/life-expectancy-india',      title: /Life Expectancy in India/i },
  { path: '/life-expectancy-usa',        title: /Life Expectancy in the USA/i },
  { path: '/life-expectancy-japan',      title: /Life Expectancy in Japan/i },
  { path: '/life-expectancy-uk',         title: /Life Expectancy in the UK/i },
  { path: '/life-expectancy-australia',  title: /Life Expectancy in Australia/i },
  { path: '/life-expectancy-canada',     title: /Life Expectancy in Canada/i },
  { path: '/life-expectancy-germany',    title: /Life Expectancy in Germany/i },
  { path: '/life-expectancy-china',      title: /Life Expectancy in China/i },
  { path: '/life-expectancy-singapore',  title: /Singapore/i },
  { path: '/life-expectancy-brazil',     title: /Life Expectancy in Brazil/i },
  { path: '/meri-umar-kitni-hai',        title: /Age Calculator in Hindi/i },
  { path: '/jivan-kal-calculator',       title: /Life Expectancy in Hindi/i },
  { path: '/numerology-hindi',           title: /Numerology in Hindi/i },
  { path: '/rashifal-by-date-of-birth',  title: /Zodiac Sign in Hindi/i },
  { path: '/biological-age-hindi',       title: /Biological Age in Hindi/i },
  { path: '/embed',                      title: /Widget for Your Website/i },
  { path: '/widget/age-calculator',      title: /Age Calculator Widget/i },
];

for (const { path, title } of ROUTES) {
  test(`${path} — renders h1, unique title, no page errors`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    expect((await h1.textContent())?.trim().length ?? 0).toBeGreaterThan(0);

    await expect(page).toHaveTitle(title);
    expect(await page.title()).not.toBe('BornClock');

    expect(pageErrors, `console pageerror(s) on ${path}: ${pageErrors.join(' | ')}`).toEqual([]);
  });
}
