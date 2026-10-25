// Batch 7 (W7): routes, titles and city data for the Panchang / Rahu Kaal / Choghadiya pages.
import { describe, it, expect } from 'vitest';
import { pageMeta, indexMeta, pageAnswer } from '../panchangText';
import { PANCHANG_CITIES, computeDayPanchang } from '../panchangDay';
import cityData from '../../../data/panchangCities.json';
import { matchDailyRoute } from '../../daily/registry';
import { PANCHANG_CITY_SLUGS } from '../../seo/panchangSlugs';

const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');
const routes: string[] = await getAllRoutes();
const KINDS = ['panchang', 'rahu-kaal', 'choghadiya'] as const;

describe('50 Panchang cities', () => {
  it('are the 50 ranked cities of the sourced list, unique, all in India, on IST', () => {
    const c = (cityData as { cities: Array<{ rank: number; slug: string; lat: number; lon: number }> }).cities;
    expect(c.map(x => x.rank)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
    expect(new Set(c.map(x => x.slug)).size).toBe(50);
    for (const x of c) { expect(x.lat).toBeGreaterThan(6); expect(x.lat).toBeLessThan(37); expect(x.lon).toBeGreaterThan(68); expect(x.lon).toBeLessThan(98); }
    expect(PANCHANG_CITIES.every(x => x.tz === 5.5)).toBe(true);
    expect(PANCHANG_CITIES[0].slug).toBe('delhi');
  });
});

describe('prerender list / sitemap', () => {
  it('lists the index + 50 city pages for each kind, and no dated URLs', () => {
    for (const k of KINDS) {
      expect(routes).toContain(`/${k}`);
      expect(routes.filter(r => r.startsWith(`/${k}/`))).toHaveLength(50);
    }
    expect(routes.some(r => r.includes('?'))).toBe(false);
    expect(routes.filter(r => /^\/(panchang|rahu-kaal|choghadiya)\//.test(r)).every(r => /^\/[a-z-]+\/[a-z-]+$/.test(r))).toBe(true);
    expect(routes.filter(r => r.startsWith('/hi/panchang/'))).toHaveLength(10);
  });

  it('every Panchang route is a registered daily page (Worker injects today)', () => {
    for (const k of KINDS) {
      expect(matchDailyRoute(`/${k}`)?.def.kind).toBe(k);
      for (const s of PANCHANG_CITY_SLUGS) expect(matchDailyRoute(`/${k}/${s}/`)?.def.kind, `${k}/${s}`).toBe(k);
    }
  });

  it('static titles match the page components, and are unique across the whole sitemap family', () => {
    const titles = new Map<string, string[]>();
    for (const k of KINDS) {
      expect(getTitleForRoute(`/${k}`).title).toBe(indexMeta(k).title);
      for (const c of PANCHANG_CITIES) {
        const t = getTitleForRoute(`/${k}/${c.slug}`);
        expect(t.title, `${k}/${c.slug}`).toBe(pageMeta(k, c.name).title);
        expect(t.description).toBe(pageMeta(k, c.name).description);
      }
    }
    // Batch 7 rule: no two sitemap URLs share a title. Checked here for every Panchang-family
    // URL against the WHOLE sitemap (21 older duplicate pairs elsewhere — mostly celebrity
    // "-<year>" twins — are outside W7 and listed in the batch report).
    const PF = /^\/(hi\/)?(panchang|rahu-kaal|choghadiya)(\/|$)/;
    for (const r of routes) {
      const t = getTitleForRoute(r)?.title;
      if (t) titles.set(t, [...(titles.get(t) ?? []), r]);
    }
    for (const [t, rs] of titles) if (rs.some(r => PF.test(r))) expect(rs, t).toHaveLength(1);
  });
});

describe('city pages are genuinely different', () => {
  it('on the same date, every city has its own sunrise/sunset-based answer text', () => {
    const answers = new Set(PANCHANG_CITIES.map(c =>
      pageAnswer('rahu-kaal', computeDayPanchang(new Date('2026-11-01T12:00:00Z'), c.lat, c.lon, c.tz, c.name), c.name).replace(c.name, '').replace(c.name, '')));
    // Satellite cities 15–40 km apart (e.g. Kolkata/Howrah) can share every minute; most differ.
    expect(answers.size).toBeGreaterThan(40);
  });
});
