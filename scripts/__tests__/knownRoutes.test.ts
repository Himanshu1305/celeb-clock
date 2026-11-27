/**
 * B21 (SEO) — the Worker's real-404 for unknown paths must never 404 a real page.
 * K1 functions/knownRoutes.ts is up to date with src/App.tsx.
 * K2 every URL in the generated sitemaps (and every prerender route) is a known route or a
 *    regional-language page.
 * K3 junk paths are not known.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { knownRoutePatterns, renderKnownRoutes } from '../gen-known-routes.mts';
import { isKnownRoute } from '../../functions/knownRoutes';
import { regionalLangOf } from '../../src/lib/lang/langs.js';
import { STATIC_ROUTES } from '../prerender-routes.mjs';

describe('Known routes (soft-404 fix)', () => {
  it('K1 — functions/knownRoutes.ts matches App.tsx (run: npx tsx scripts/gen-known-routes.mts)', () => {
    expect(readFileSync('functions/knownRoutes.ts', 'utf8')).toBe(renderKnownRoutes(knownRoutePatterns(readFileSync('src/App.tsx', 'utf8'))));
  });
  it('K2 — every prerender route and sitemap URL is known', () => {
    const urls = new Set<string>(STATIC_ROUTES as string[]);
    if (existsSync('dist')) {
      for (const f of readdirSync('dist').filter(f => /^sitemap-.*\.xml$/.test(f))) {
        for (const m of readFileSync(`dist/${f}`, 'utf8').matchAll(/<loc>https:\/\/bornclock\.com([^<]*)<\/loc>/g)) urls.add(m[1]);
      }
    }
    const unknown = [...urls].filter(p => !isKnownRoute(p) && !regionalLangOf(p));
    expect(unknown).toEqual([]);
    expect(urls.size).toBeGreaterThan(200);
  });
  it('K3 — junk is unknown', () => {
    for (const p of ['/this-page-does-not-exist-xyz/', '/wp-admin/', '/kundali/extra/deep/path/', '/xmlrpc.php']) expect(isKnownRoute(p), p).toBe(false);
    for (const p of ['/', '/kundali/', '/kundali', '/celebrity/virat-kohli/', '/born-on/march-14/india/']) expect(isKnownRoute(p), p).toBe(true);
  });
});
