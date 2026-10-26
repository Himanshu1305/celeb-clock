// Daily pages (src/lib/daily): every registered route is prerendered + in the sitemap,
// has a unique title, is marked daily in the sitemap, and the real Worker serves it with
// today's injected content (fixed date) and never noindex on production.
import { describe, it, expect, vi, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { allDailyRoutes, dailyJsonPath, matchDailyRoute, RASHI_SLUGS_HI } from '../../src/lib/daily/registry';
import { computeDaily } from '../../src/lib/daily/compute';
import { addDaysISO } from '../../src/lib/daily/dates';

describe('daily routes in the prerender list / sitemap', () => {
  it('every daily route is prerendered (so it is in the sitemap) with a unique static title', async () => {
    const { getAllRoutes } = await import('../prerender-routes.mjs');
    const { getTitleForRoute } = await import('../prerender-titles.mjs');
    const routes: string[] = await getAllRoutes();
    const set = new Set(routes);
    const titles = new Map<string, string[]>();
    for (const r of routes) {
      const t = getTitleForRoute(r)?.title;
      if (t) titles.set(t, [...(titles.get(t) ?? []), r]);
    }
    for (const r of allDailyRoutes()) {
      expect(set.has(r), r).toBe(true);
      const t = getTitleForRoute(r)?.title;
      expect(t, r).toBeTruthy();
      expect(titles.get(t!), `${r} shares its title`).toEqual([r]);
    }
  }, 60_000);

  it('the sitemap marks every daily route changefreq=daily', () => {
    const src = readFileSync('scripts/generate-sitemap.mjs', 'utf8');
    const m = src.match(/const DAILY_ROUTE = (\/.*\/);/);
    expect(m).toBeTruthy();
    // eslint-disable-next-line no-eval
    const re: RegExp = eval(m![1]);
    // Batch 8: the weekly / monthly / yearly rashifal views (period kinds) change at most
    // weekly, so they keep the default changefreq=weekly.
    for (const r of allDailyRoutes()) expect(re.test(r), r).toBe(!/^\/rashifal\/[a-z]+\/(?:week|month|year)$/.test(r));
    for (const r of ['/rashifal/mesh/week', '/zodiac/leo', '/hi/rashifal']) /* W7 made /panchang + /hi/panchang daily pages */ expect(re.test(r), r).toBe(false);
  });
});

describe('functions/_worker.ts serves daily pages with today’s text (fixed date)', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-26T03:00:00Z')); // 08:30 IST, 26 Oct 2026
  afterAll(() => vi.useRealTimers());

  const SHELL = (path: string) => `<!doctype html><html><head><title>static</title><meta name="description" content="static">` +
    `<link rel="canonical" href="https://bornclock.com${path}/"></head><body><div id="root"><h1><span data-daily="h1">static h1</span></h1>` +
    `<span data-daily="date"></span><div data-daily="body"><p>static body</p></div><script type="application/ld+json" data-daily="jsonld">{}</script></div></body></html>`;

  function env(day: string) {
    return {
      ASSETS: {
        fetch: async (req: Request) => {
          const p = new URL(req.url).pathname;
          if (p.startsWith('/daily/')) {
            const [, , kind, slug, file] = p.split('/');
            const month = file.replace('.json', '');
            if (p !== dailyJsonPath(kind, slug, month)) return new Response('nope', { status: 404 });
            const days: Record<string, unknown> = {};
            for (const d of [addDaysISO(day, -1), day, addDaysISO(day, 1)]) if (d.startsWith(month)) days[d] = computeDaily(kind, d, slug);
            return new Response(JSON.stringify({ kind, slug, month, days }), { headers: { 'content-type': 'application/json' } });
          }
          return new Response(SHELL(p.replace(/\/$/, '')), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', ETag: '"abc"' } });
        },
      },
    };
  }

  it('injects title, H1, date, body and JSON-LD for each page kind; next day differs', async () => {
    const worker = (await import('../../functions/_worker')).default;
    for (const path of ['/rashifal/mesh/today/', '/hi/rashifal/meena/', '/zodiac/leo/today/']) {
      const m = matchDailyRoute(path)!;
      const res = await worker.fetch(new Request(`https://bornclock.com${path}`, { headers: { 'If-None-Match': '"abc"' } }), env('2026-10-26') as never, {});
      expect(res.status, path).toBe(200);
      expect(res.headers.get('X-Daily-Date')).toBe('2026-10-26');
      expect(res.headers.get('X-Robots-Tag')).toBeNull();
      expect(res.headers.get('ETag')).toBeNull();
      const html = await res.text();
      const e = computeDaily(m.def.kind, '2026-10-26', m.slug);
      expect(html).toContain(`<title>${e.title.replace(/&/g, '&amp;')}</title>`);
      expect(html).toContain(e.h1);
      expect(html).toContain(e.dateLabel);
      expect(html).toContain('"dateModified":"2026-10-26"');
      expect(html).not.toContain('static body');
      expect(html).not.toMatch(/noindex/i);
      const next = computeDaily(m.def.kind, '2026-10-27', m.slug);
      expect(next.h1).not.toBe(e.h1);
      expect(html).not.toContain(next.h1);
    }
  }, 60_000);

  it('an invalid sign under /zodiac/:sign/today is a real 404', async () => {
    const worker = (await import('../../functions/_worker')).default;
    const res = await worker.fetch(new Request('https://bornclock.com/zodiac/notasign/today/'), env('2026-10-26') as never, {});
    expect(res.status).toBe(404);
  }, 60_000);

  it('an invalid Hindi rashi under /hi/rashifal/:rashi is a real 404; all 12 valid ones are not', async () => {
    const worker = (await import('../../functions/_worker')).default;
    const bad = await worker.fetch(new Request('https://bornclock.com/hi/rashifal/notarashi/'), env('2026-10-26') as never, {});
    expect(bad.status).toBe(404);
    for (const s of RASHI_SLUGS_HI) {
      const ok = await worker.fetch(new Request(`https://bornclock.com/hi/rashifal/${s}/`), env('2026-10-26') as never, {});
      expect(ok.status, s).toBe(200);
    }
  }, 60_000);
});
