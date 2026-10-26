// Batch 8 — weekly (Mon–Sun) / monthly / yearly rashifal on the daily mechanism: the real
// Worker (functions/_worker.ts) injects the CURRENT period's dates and text for a fixed
// date, read from the compact per-period data file; the next period differs.
import { describe, it, expect, vi, afterAll } from 'vitest';
import { DAILY_DATA_COMPUTERS, computeDaily } from '../../src/lib/daily/compute';
import { matchDailyRoute, dailyFilePath, dailyFileKey } from '../../src/lib/daily/registry';
import { weekStartISO, periodKeyOf } from '../../src/lib/daily/dates';
// @ts-expect-error — plain ESM build script, no type declarations
import { finalizeHead, headStats } from '../lib/headDedupe.mjs';

const SHELL = (path: string) => finalizeHead(`<!doctype html><html><head><title>static</title>` +
  `<meta name="description" content="Know your time. Live it well."><meta property="og:title" content="BornClock">` +
  `<meta property="og:description" content="generic"><meta name="twitter:title" content="BornClock"><meta name="twitter:description" content="generic">` +
  `<meta name="description" content="Weekly rashifal (build week)" data-rh="true"><meta property="og:title" content="build title" data-rh="true">` +
  `<meta property="og:description" content="Weekly rashifal (build week)" data-rh="true"><meta name="twitter:title" content="build title" data-rh="true">` +
  `<meta name="twitter:description" content="Weekly rashifal (build week)" data-rh="true">` +
  `<link rel="canonical" href="https://bornclock.com${path}/"></head><body><div id="root"><h1><span data-daily="h1">Simha Weekly Rashifal</span></h1>` +
  `<span data-daily="date">19 October – 25 October 2026</span><div data-daily="body"><p>build week body</p></div>` +
  `<script type="application/ld+json" data-daily="jsonld">{}</script></div></body></html>`, path).html;

const requested: string[] = [];
const env = {
  ASSETS: {
    fetch: async (req: Request) => {
      const p = new URL(req.url).pathname;
      if (p.startsWith('/daily/')) {
        requested.push(p);
        // /daily/rashifal-period/<period>/<key>.json — built exactly like scripts/gen-daily.mts.
        const [, , kind, slug, file] = p.split('/');
        const key = file.replace('.json', '');
        if (kind !== 'rashifal-period') return new Response('nope', { status: 404 });
        const date = slug === 'week' ? key : slug === 'month' ? `${key}-01` : `${key}-01-01`;
        const data = { [key]: DAILY_DATA_COMPUTERS['rashifal-period'](date, slug) };
        return new Response(JSON.stringify({ kind, slug, month: key, data }), { headers: { 'content-type': 'application/json' } });
      }
      return new Response(SHELL(p.replace(/\/$/, '')), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    },
  },
};

async function serve(path: string, at: string) {
  vi.setSystemTime(new Date(at));
  const worker = (await import('../../functions/_worker')).default;
  const res = await worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});
  expect(res.status, path).toBe(200);
  return { html: await res.text(), date: res.headers.get('X-Daily-Date') };
}

describe('weekly / monthly / yearly rashifal — Worker injects the current period', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  afterAll(() => vi.useRealTimers());

  it('period keys: India week Monday–Sunday, month, year', () => {
    expect(weekStartISO('2026-10-26')).toBe('2026-10-26'); // Monday
    expect(weekStartISO('2026-11-01')).toBe('2026-10-26'); // Sunday → same week
    expect(weekStartISO('2026-11-02')).toBe('2026-11-02');
    expect(weekStartISO('2027-01-01')).toBe('2026-12-28'); // a week spanning New Year
    expect(periodKeyOf('month', '2026-10-31')).toBe('2026-10');
    expect(periodKeyOf('year', '2026-10-31')).toBe('2026');
    const m = matchDailyRoute('/rashifal/simha/week')!;
    expect(dailyFilePath(m.def, m.slug, dailyFileKey(m.def, '2026-10-29'))).toBe('/daily/rashifal-period/week/2026-10-26.json');
  });

  it('week: fixed date shows that week’s range; the rest of the week is identical; next week differs', async () => {
    const path = '/rashifal/simha/week/';
    requested.length = 0;
    const mon = await serve(path, '2026-10-26T03:00:00Z'); // 08:30 IST Monday
    expect(requested).toContain('/daily/rashifal-period/week/2026-10-26.json');
    expect(mon.date).toBe('2026-10-26');
    const e = computeDaily('rashifal-week', '2026-10-26', 'simha');
    expect(e.h1).toBe('Simha Weekly Rashifal — 26 Oct – 1 Nov 2026');
    expect(e.dateLabel).toBe('26 October – 1 November 2026');
    expect(mon.html).toContain(`<title>${e.title}</title>`);
    expect(mon.html).toContain('<span data-daily="h1">Simha Weekly Rashifal — 26 Oct – 1 Nov 2026</span>');
    expect(mon.html).toContain('<span data-daily="date">26 October – 1 November 2026</span>');
    expect(mon.html).not.toContain('build week');
    expect(mon.html).not.toContain('19 October');
    // one description / og / twitter tag each, all carrying this week's text
    const s = headStats(mon.html);
    expect(s.meta).toEqual({ description: 1, title: 0, ogTitle: 1, ogDescription: 1, twitterTitle: 1, twitterDescription: 1 });
    expect(mon.html.match(/<meta[^>]*name="description"[^>]*>/)![0]).toContain('26 Oct – 1 Nov 2026');
    expect(mon.html.match(/<meta[^>]*property="og:title"[^>]*>/)![0]).toContain('26 Oct – 1 Nov 2026');

    // Sunday 1 Nov 23:00 IST — still the same week, same body
    const sun = await serve(path, '2026-11-01T17:30:00Z');
    const body = (h: string) => h.match(/<div data-daily="body"[^>]*>([\s\S]*?)<\/div>/)![1];
    expect(sun.date).toBe('2026-11-01');
    expect(body(sun.html)).toBe(body(mon.html));

    // Monday 2 Nov 00:30 IST — next week: new range and different content
    const next = await serve(path, '2026-11-01T19:00:00Z');
    expect(next.date).toBe('2026-11-02');
    expect(next.html).toContain('Simha Weekly Rashifal — 2 Nov – 8 Nov 2026');
    expect(next.html).toContain('<span data-daily="date">2 November – 8 November 2026</span>');
    expect(next.html).not.toContain('26 Oct – 1 Nov 2026');
    expect(body(next.html)).not.toBe(body(mon.html));
  }, 60_000);

  it('month and year: the current month / year, rolling over on the 1st', async () => {
    const oct = await serve('/rashifal/makar/month', '2026-10-31T12:00:00Z');
    expect(oct.html).toContain('<span data-daily="h1">Makar Monthly Rashifal — October 2026</span>');
    expect(oct.html).toContain('1–31 October 2026');
    const nov = await serve('/rashifal/makar/month', '2026-10-31T19:00:00Z'); // 00:30 IST 1 Nov
    expect(nov.html).toContain('<span data-daily="h1">Makar Monthly Rashifal — November 2026</span>');
    expect(nov.html).toContain('1–30 November 2026');
    const y26 = await serve('/rashifal/makar/year', '2026-12-31T12:00:00Z');
    expect(y26.html).toContain('Makar Yearly Rashifal — 2026');
    const y27 = await serve('/rashifal/makar/year', '2026-12-31T19:00:00Z');
    expect(y27.html).toContain('Makar Yearly Rashifal — 2027');
    expect(y27.html).toContain('1 January – 31 December 2027');
    expect(y27.html).not.toMatch(/noindex/i);
  }, 60_000);
});
