import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';
import { INDIA_BORNON_SLUGS } from '../../src/lib/seo/indiaBornOnSlugs';

// Batch 6 (SEO): the Cloudflare Worker must answer retired duplicate URLs with a real
// 301 to the kept URL BEFORE the static-asset layer (which would otherwise serve the
// stale prerendered page or the SPA shell with a 200).
const assetsHit: string[] = [];
const env = {
  ASSETS: {
    fetch: async (req: Request) => {
      assetsHit.push(new URL(req.url).pathname);
      return new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } });
    },
  },
};
const get = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});

describe('Worker 301s for retired duplicate pages', () => {
  it.each([
    ['/born-on/may/13/', 'https://bornclock.com/born-on/may-13/india/'],
    ['/born-on/february/16/', 'https://bornclock.com/born-on/february-16/'], // no India page for this date → global
    ['/born-on/february/29', 'https://bornclock.com/born-on/february-29/'],
    ['/born-on/december/31/personality/', 'https://bornclock.com/birthday/12/31/'],
    ['/born-on/february/29/personality', 'https://bornclock.com/birthday/2/29/'],
    ['/birthday/june-13', 'https://bornclock.com/born-on/june-13/'],
    ['/birthday/09/04/', 'https://bornclock.com/birthday/9/4/'],
    ['/biological-age-calculator/', 'https://bornclock.com/biological-age/'],
    ['/articles/biological-age-vs-chronological-age/', 'https://bornclock.com/biological-age-vs-chronological-age/'],
    ['/life-expectancy-calculator-uk/', 'https://bornclock.com/life-expectancy-uk/'],
  ])('%s → 301 %s', async (from, to) => {
    const res = await get(from);
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe(to);
  });

  it('India URL for a date without an India page → 301 to the global date page', async () => {
    const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const DAYS = [31,29,31,30,31,30,31,31,30,31,30,31];
    const missing = MONTHS.flatMap((m, i) => Array.from({ length: DAYS[i] }, (_, d) => `${m}-${d + 1}`)).find(s => !INDIA_BORNON_SLUGS.has(s))!;
    const res = await get(`/born-on/${missing}/india/`);
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe(`https://bornclock.com/born-on/${missing}/`);
    const kept = [...INDIA_BORNON_SLUGS][0];
    expect((await get(`/born-on/${kept}/india/`)).status).toBe(200);
  });

  it('keeps the query string (e.g. utm tags) on the redirect', async () => {
    const res = await get('/born-on/may/13/?utm_source=x');
    expect(res.headers.get('Location')).toBe('https://bornclock.com/born-on/may-13/india/?utm_source=x');
  });

  it('kept pages are served normally (no redirect)', async () => {
    for (const p of ['/born-on/may-13/', '/birthday/5/13/', '/biological-age/', '/life-expectancy-uk/']) {
      const res = await get(p);
      expect(res.status, p).toBe(200);
    }
  });

  it.each(['/born-on/february/30/personality/', '/born-on/february/30/', '/born-on/april/31', '/birthday/february-30/'])(
    'impossible retired date %s gets the real 404, not a redirect', async (p) => {
      const res = await get(p);
      expect(res.status).toBe(404);
      expect(res.headers.get('Location')).toBeNull();
    });
});
