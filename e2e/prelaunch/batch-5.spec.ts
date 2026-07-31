/**
 * Suite P — batch-5.spec.ts  (BATCH-5 Phases 3, 4, 5)
 *
 * - Phase 3: the client document.title carries the brand EXACTLY once across route
 *   types (the doubling was a client-side helmet artifact, so this is a browser test).
 * - Phases 4/5: the new /gift and /coach landing pages prerender with a route-specific
 *   title, a canonical that is NOT the homepage, an in-body FAQPage schema, and an
 *   answer-first paragraph — asserted on CONTENT, never status alone.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const html = (route: string) => readFileSync(resolve(DIST, route.replace(/^\//, ''), 'index.html'), 'utf-8');
const distExists = existsSync(resolve(DIST, 'index.html'));

// Phase 3 — brand appears exactly once in the rendered client tab title.
const TITLE_ROUTES = [
  '/',
  '/born-on/january-1',
  '/born-in-august',
  '/energy-forecast',
  '/compatibility/aries/leo',
  '/blog/best-month-to-be-born-what-data-says',
];

test.describe('BATCH-5 — title brand appears exactly once', () => {
  for (const route of TITLE_ROUTES) {
    test(`client title brands "BornClock" once: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      expect(title.length, `${route} title`).toBeGreaterThan(10);
      const brandCount = (title.match(/BornClock/g) || []).length;
      expect(brandCount, `${route} → "${title}"`).toBe(1);
    });
  }
});

test.describe('BATCH-5 — /gift and /coach landing pages (prerendered content)', () => {
  test.skip(!distExists, 'dist/ not built — run `npm run build` first');

  const CASES = [
    { route: '/gift', titleHas: 'Gift a Birthday Blueprint', answerHas: 'personalised, 9-section keepsake' },
    { route: '/coach', titleHas: 'AI Longevity Coach', answerHas: 'AI advisor built into your life-expectancy results' },
  ];

  for (const c of CASES) {
    test(`${c.route}: title, canonical≠home, FAQPage schema, answer paragraph`, () => {
      const doc = html(c.route);
      expect(doc).toContain(`<title>${c.titleHas}`.slice(0, 20)); // route-specific title
      expect(doc.toLowerCase()).toContain(c.titleHas.toLowerCase());
      // canonical points at the page, never the bare homepage
      const canonical = doc.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
      expect(canonical, `${c.route} canonical`).toBe(`https://bornclock.com${c.route}/`);
      // in-body FAQPage schema
      expect(doc).toContain('"@type":"FAQPage"');
      // answer-first paragraph present
      expect(doc).toContain(c.answerHas);
    });
  }

  test('/gift shows the testimonial placeholder, never invented quotes', () => {
    const doc = html('/gift');
    expect(doc).toContain('Testimonials — placeholder');
  });
});
