import { describe, it, expect } from 'vitest';
import { duplicateRedirect } from '../duplicateRedirects';
import { INDIA_BORNON_SLUGS } from '../indiaBornOnSlugs';
import indiaDates from '../../../data/indiaBornOnDates.json';

// Batch 6 (SEO): the prerender list is also the sitemap source and the denominator of
// the >=98% prerender coverage gate (scripts/prerender-merge.mjs). Retired duplicate
// URLs must be OUT of it (so coverage is computed on the smaller set), and no listed
// route may itself be a redirect source (that would put a 301 in the sitemap).
const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
const routes: string[] = await getAllRoutes();

describe('prerender / sitemap route list after duplicate retirement', () => {
  it('no listed route is a redirect source', () => {
    const redirecting = routes.filter(r => duplicateRedirect(r, { indiaSlugs: INDIA_BORNON_SLUGS }) !== null);
    expect(redirecting).toEqual([]);
  });

  it('retired families are gone', () => {
    expect(routes.filter(r => /^\/born-on\/[a-z]+\/\d+(\/personality)?$/.test(r))).toEqual([]);
    expect(routes.filter(r => /^\/birthday\/[a-z]+-\d+$/.test(r))).toEqual([]);
    for (const r of ['/biological-age-calculator', '/articles/biological-age-vs-chronological-age',
      '/life-expectancy-calculator-usa', '/life-expectancy-calculator-uk',
      '/life-expectancy-calculator-australia', '/life-expectancy-calculator-canada',
      '/answers/who-shares-my-birthday']) {
      expect(routes).not.toContain(r);
    }
  });

  it('every redirect target date page is listed (366 /birthday/:m/:d incl. 2/29, 366 /born-on/:month-:day)', () => {
    expect(routes.filter(r => /^\/birthday\/\d+\/\d+$/.test(r))).toHaveLength(366);
    expect(routes).toContain('/birthday/2/29');
    expect(routes).toContain('/birthday/12/31');
    expect(routes.filter(r => /^\/born-on\/[a-z]+-\d+$/.test(r))).toHaveLength(366);
    expect(routes.filter(r => /^\/born-on\/[a-z]+-\d+\/india$/.test(r))).toHaveLength((indiaDates as unknown[]).length);
  });

  it('kept pages for the other families stay listed', () => {
    for (const r of ['/biological-age', '/biological-age-vs-chronological-age', '/biological-age-hindi',
      '/answers/what-is-my-biological-age', '/life-expectancy-usa', '/life-expectancy-uk',
      '/life-expectancy-australia', '/life-expectancy-canada', '/life-expectancy-calculator-singapore-uae',
      '/chinese-zodiac/rat', '/chinese-horoscope/rat', '/articles/chinese-zodiac-by-year', '/on-this-day']) {
      expect(routes).toContain(r);
    }
  });

  it('no duplicate entries', () => {
    expect(new Set(routes).size).toBe(routes.length);
  });
});

describe('Batch 11: the "who shares my birthday" article is retired onto the finder', () => {
  it('the Worker answers it with one 301 to /celebrity-birthday/', async () => {
    const worker = (await import('../../../../functions/_worker')).default;
    const env = { ASSETS: { fetch: async () => new Response('<!doctype html><title>x</title>', { headers: { 'content-type': 'text/html' } }) } };
    for (const u of ['https://bornclock.com/answers/who-shares-my-birthday/', 'https://bornclock.com/answers/who-shares-my-birthday']) {
      const res = await worker.fetch(new Request(u), env as never, {});
      expect(res.status, u).toBe(301);
      expect(res.headers.get('Location'), u).toBe('https://bornclock.com/celebrity-birthday/');
    }
  });
});
