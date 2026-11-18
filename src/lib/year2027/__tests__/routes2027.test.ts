/**
 * B14 — the 2027 route list (src/lib/year2027/meta.js) stays in sync across App.tsx, the
 * Worker's 404 validation, the prerender list, the prerender titles and the sitemap.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  year2027Routes, year2027Meta, RASHI_SLUGS_2027, RASHI_SLUGS_HI_2027, SIGN_SLUGS_2027,
  FESTIVAL_SLUGS_2027, HI_FESTIVAL_SLUGS_2027, FESTIVALS_2027,
} from '../meta.js';
import { RASHI_SLUGS_HI } from '@/lib/daily/registry';
import { RASHIS } from '@/lib/vedic/rashifal';

const ROOT = path.resolve(__dirname, '../../../..');
const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');
const { sectionOf } = await import('../../../../scripts/lib/sitemap.mjs');
const routes = year2027Routes();

/** Route patterns declared in App.tsx, as regexes. */
const appSrc = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
const appPatterns = [...appSrc.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*');
const toRe = (p: string) => new RegExp('^' + p.replace(/:[a-zA-Z]+/g, '[^/]+') + '$');
/** The first App route a path matches, with react-router's static-segment preference. */
function appRouteFor(url: string): string | undefined {
  const hits = appPatterns.filter(p => toRe(p).test(url));
  const score = (p: string) => p.split('/').filter(s => s && !s.startsWith(':')).length;
  return hits.sort((a, b) => score(b) - score(a))[0];
}

/** The Worker's B14 block, evaluated as a function of the path (same code the Worker runs). */
const workerSrc = readFileSync(path.join(ROOT, 'functions/_worker.ts'), 'utf8');
const block = workerSrc.slice(workerSrc.indexOf('// B14: 2027 pages exist only'), workerSrc.indexOf('// Batch 9b: year muhurat lists'));
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const worker404 = new Function('pathname', 'RASHI_SLUGS_2027', 'RASHI_SLUGS_HI_2027', 'SIGN_SLUGS_2027', 'FESTIVAL_SLUGS_2027', 'HI_FESTIVAL_SLUGS_2027',
  `let m; ${block}\nreturn false;`) as (p: string, ...lists: string[][]) => boolean;
const is404 = (p: string) => worker404(p, RASHI_SLUGS_2027, RASHI_SLUGS_HI_2027, SIGN_SLUGS_2027, FESTIVAL_SLUGS_2027, HI_FESTIVAL_SLUGS_2027);

describe('B14 — 2027 routes in sync', () => {
  it('has the expected pages (13 + 13 + 13 hubs/signs, 26 festivals, 10 Hindi festivals, 4 calendar pages, 2 more)', () => {
    expect(routes.length).toBe(13 + 13 + 13 + 26 + 10 + 4 + 2);
    expect(new Set(routes).size).toBe(routes.length);
    expect(FESTIVALS_2027.length).toBe(26);
    expect(HI_FESTIVAL_SLUGS_2027.sort()).toEqual(['chhath-puja', 'dhanteras', 'diwali', 'holi', 'janmashtami', 'karwa-chauth', 'mahashivratri', 'makar-sankranti', 'navratri', 'raksha-bandhan']);
  });

  it('slug lists match the existing rashi / Hindi rashi sets', () => {
    expect(RASHI_SLUGS_2027).toEqual(RASHIS.map(r => r.slug));
    expect(RASHI_SLUGS_HI_2027).toEqual([...RASHI_SLUGS_HI]);
  });

  it.each(routes)('%s — App route, worker allows, prerendered, titled, in a sitemap section', async (r) => {
    const route = appRouteFor(r);
    expect(route, `no App.tsx route for ${r}`).toBeTruthy();
    // the static "2027" route must win over the older /rashifal/:rashi/:period etc.
    expect(route).not.toBe('/rashifal/:rashi/:period');
    expect(route).not.toBe('/festivals/:year');
    expect(is404(r)).toBe(false);
    expect(is404(r + '/')).toBe(false);
    const all = await getAllRoutes();
    expect(all).toContain(r);
    const meta = year2027Meta(r)!;
    expect(getTitleForRoute(r)).toEqual({ title: meta.title, description: meta.description });
    expect([...meta.title].length).toBeLessThanOrEqual(60);
    expect(meta.title).toMatch(/2027/);
    expect(sectionOf(r)).toBe(r.startsWith('/hi/') ? 'hindi' : ['/numerology-2027', '/chinese-horoscope-2027'].includes(r) ? 'core' : 'vedic');
  });

  it('titles lead with the search phrase', () => {
    expect(year2027Meta('/rashifal-2027')!.title).toMatch(/^Rashifal 2027:/);
    expect(year2027Meta('/horoscope-2027')!.title).toMatch(/^Horoscope 2027:/);
    expect(year2027Meta('/rashifal/mesh/2027')!.title).toMatch(/^Mesh Rashifal 2027/);
    expect(year2027Meta('/hi/rashifal/mesha/2027')!.title).toBe('मेष राशिफल 2027 — वार्षिक भविष्यफल | BornClock');
    expect(year2027Meta('/festivals/2027/holi')!.title).toMatch(/^Holi 2027/);
    expect(year2027Meta('/horoscope/sagittarius/2027')!.title).toMatch(/^Sagittarius Horoscope 2027/);
  });

  it('the Worker 404s the addresses that are not pages', () => {
    for (const p of ['/rashifal/mesh/2028', '/rashifal/aries/2027', '/hi/rashifal/mesh/2027', '/hi/rashifal/mesha/2026',
      '/horoscope/mesh/2027', '/horoscope/aries/2026', '/horoscope', '/horoscope/aries',
      '/festivals/2027/christmas', '/festivals/2026/holi', '/hi/festivals/2027/lohri', '/hi/festivals/2027/xyz']) {
      expect(is404(p), p).toBe(true);
    }
  });

  it('no 2027 title collides with any other sitemap title', async () => {
    const all: string[] = await getAllRoutes();
    const mine = new Set(routes.map(r => year2027Meta(r)!.title.toLowerCase()));
    const clash = all.filter(r => !routes.includes(r)).filter(r => {
      const t = getTitleForRoute(r) as { title: string } | null;
      return t && mine.has(t.title.toLowerCase());
    });
    expect(clash).toEqual([]);
  });
});
