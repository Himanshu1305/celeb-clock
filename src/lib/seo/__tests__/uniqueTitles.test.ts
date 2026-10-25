import { describe, it, expect } from 'vitest';

// Batch 7 (SEO): two URLs with the same <title> are duplicates in Google's eyes (one
// of them gets dropped or the two compete). Every URL in the prerender list — which is
// also the sitemap source (scripts/generate-sitemap.mjs) — must have its own title.
// No allow-list: fix the page (merge + 301, or give it a distinct title) instead.
const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');
const routes: string[] = await getAllRoutes();

describe('sitewide: no two sitemap / prerender URLs share a title', () => {
  it('every titled route has a unique title (case- and space-insensitive)', () => {
    const byTitle = new Map<string, string[]>();
    for (const r of routes) {
      const meta = getTitleForRoute(r) as { title: string } | null;
      if (!meta) continue;
      const key = meta.title.trim().replace(/\s+/g, ' ').toLowerCase();
      byTitle.set(key, [...(byTitle.get(key) ?? []), r]);
    }
    const clashes = [...byTitle.entries()].filter(([, rs]) => rs.length > 1).map(([t, rs]) => `${t}: ${rs.join(', ')}`);
    expect(clashes).toEqual([]);
  });

  it('the Batch 7 pairs are now one URL each', () => {
    expect(routes).toContain('/planetary-age');
    expect(routes).not.toContain('/articles/planetary-age-calculator');
    expect(routes).toContain('/celebrity/virat-kohli');
    expect(routes).not.toContain('/celebrity/virat-kohli-1988');
    expect(routes).not.toContain('/celebrity/bhimrao-ramji-ambedkar');
  });
});
