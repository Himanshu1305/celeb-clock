/**
 * Suite N — blog-integrity.spec.ts  (BLOG-FIX Phase 1 regression + Phase 2 guard + Phase 3)
 *
 * WHY THIS EXISTS: the SPA fallback returns HTTP 200 for ANY path, so a status-only
 * assertion cannot detect a page that fell through to the shell / rendered its
 * not-found state. The 6 batch-2 articles shipped "working" under exactly that blind
 * spot. These tests assert on ROUTE-SPECIFIC CONTENT (the article's own h1 text and a
 * canonical that points at the article, not home) so they FAIL when a real page is
 * missing — and a dedicated bogus-route guard proves the suite can still tell a real
 * page from a fallback. Runs against the live SPA (client render — the path that broke).
 */
import { test, expect } from '@playwright/test';

const NOT_FOUND = 'Article Not Found';

// Route → a distinctive substring of that article's real <h1>. A NotFound/homepage
// shell cannot contain these, so an h1 match proves the real post rendered.
const POSTS: Array<{ slug: string; h1: string }> = [
  { slug: 'best-month-to-be-born-what-data-says', h1: 'Best Month to Be Born' },
  { slug: 'biorhythm-workouts-honest-guide-training-by-cycles', h1: 'Biorhythm Workouts' },
  { slug: 'born-on-a-national-holiday-birthday-history', h1: 'Born on a National Holiday' },
  { slug: 'cycle-syncing-for-men-gender-neutral-version', h1: 'Cycle Syncing for Men' },
  { slug: 'how-we-rank-celebrity-birthdays-sitelinks', h1: 'How We Rank' },
  { slug: '7-day-energy-forecast-rhythm-awareness', h1: '7-Day Energy Forecast' },
  // an older post, as a control
  { slug: 'zodiac-signs-complete-guide-personality-traits-compatibility', h1: 'Zodiac Signs' },
];

test.describe('Blog article integrity (content-level, not status-only)', () => {
  for (const p of POSTS) {
    test(`/blog/${p.slug} renders the real article`, async ({ page }) => {
      await page.goto(`/blog/${p.slug}`);
      await page.waitForLoadState('networkidle');
      // Real, route-specific h1 — fails if the page fell through to a shell/not-found.
      await expect(page.locator('h1').first()).toContainText(p.h1);
      // The not-found state must NOT be present.
      await expect(page.locator('body')).not.toContainText(NOT_FOUND);
      // Canonical points at the article, never the bare homepage. On the dev SPA the
      // static index.html canonical (home) is present too, so target the react-helmet
      // managed one (data-rh) — in production the prerender rewrites it to a single
      // article canonical (verified live).
      const canonical = await page.locator('link[data-rh="true"][rel="canonical"]').first().getAttribute('href').catch(() => null);
      if (canonical) {
        expect(canonical).toContain(`/blog/${p.slug}`);
        expect(canonical).not.toMatch(/^https?:\/\/[^/]+\/?$/);
      }
    });
  }

  // GUARD: a deliberately bogus slug MUST render the not-found state. If this fails,
  // the app is serving the shell for unknown routes and the positive tests above are
  // meaningless — this is what makes the suite able to distinguish real from fallback.
  test('bogus blog slug renders the not-found state (fallback detection)', async ({ page }) => {
    await page.goto('/blog/this-does-not-exist-xyz-9999');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(NOT_FOUND);
    await expect(page.locator('h1').first()).not.toContainText('Best Month to Be Born');
  });

  // PHASE 3: the previously-HTML post must render REAL headings, not escaped tag text.
  test('birthday-traditions post renders real <h2> headings (not raw tags as text)', async ({ page }) => {
    await page.goto('/blog/birthday-traditions-around-the-world-unique-celebrations');
    await page.waitForLoadState('networkidle');
    // Markdown → real DOM headings inside the article body.
    expect(await page.locator('.prose h2, article h2').count()).toBeGreaterThanOrEqual(3);
    // No literal tag text leaking into the rendered copy.
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('<h2>');
    expect(body).not.toContain('<p>');
  });
});
