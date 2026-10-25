// Batch 7 (W7): Panchang / Rahu Kaal / Choghadiya through the shared daily mechanism —
// for a fixed date the Worker HTML carries that date and that day's times; the next day
// differs; the browser renders the identical text.
import { describe, it, expect } from 'vitest';
import { applyDailyContent } from '../../../../functions/daily';
import { computeDaily } from '../compute';
import { dailyJsonPath } from '../registry';
import { renderDailyBodyHtml } from '../render';
import { addDaysISO } from '../dates';
import { buildPanchangEntry } from '../kinds/panchangDaily';
import { computeDayPanchang, panchangCityBySlug } from '../../vedic/panchangDay';
import type { DailyMonthFile } from '../types';

const shell = (title: string) =>
  `<!doctype html><html lang="en"><head><title>${title}</title><meta name="description" content="old">` +
  `<link rel="canonical" href="https://bornclock.com/x/"></head><body><div id="root">` +
  `<h1><span data-daily="h1">old h1</span></h1><p><span data-daily="date">old date</span></p>` +
  `<div data-daily="body"><section><p>old body</p></section></div>` +
  `<script type="application/ld+json" data-daily="jsonld">{}</script></div></body></html>`;

const month = (kind: string, slug: string): DailyMonthFile => {
  const days: DailyMonthFile['days'] = {};
  for (let d = '2026-11-01'; d.startsWith('2026-11'); d = addDaysISO(d, 1)) days[d] = computeDaily(kind, d, slug);
  return { kind, slug, month: '2026-11', days };
};
const files: Record<string, unknown> = {};
for (const [k, s] of [['panchang', 'kanpur'], ['rahu-kaal', 'chennai'], ['choghadiya', 'index']] as const) files[dailyJsonPath(k, s, '2026-11')] = month(k, s);
const assets = {
  fetch: async (req: Request) => {
    const p = new URL(req.url).pathname;
    if (files[p]) return new Response(JSON.stringify(files[p]), { headers: { 'content-type': 'application/json' } });
    return new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } });
  },
};
const at = (d: string) => new Date(`${d}T06:00:00Z`); // 11:30 IST

describe('W7 daily pages via the Worker', () => {
  it('Rahu Kaal Chennai: the injected page shows that date and that day’s Rahu Kaal; the next day differs', async () => {
    const c = panchangCityBySlug('chennai')!;
    const p1 = computeDayPanchang(new Date('2026-11-02T12:00:00Z'), c.lat, c.lon, 5.5, c.name);
    const r1 = await applyDailyContent('/rahu-kaal/chennai/', shell('Rahu Kaal Today in Chennai — Gulika & Yamaganda | BornClock'), assets, 'https://bornclock.com', at('2026-11-02'));
    expect(r1?.date).toBe('2026-11-02');
    expect(r1!.html).toContain('<title>Rahu Kaal Today in Chennai (2 November 2026) | BornClock</title>');
    expect(r1!.html).toContain('Monday, 2 November 2026');
    expect(r1!.html).toContain(`${p1.rahuKaal.start}–${p1.rahuKaal.end}`);
    expect(r1!.html).not.toContain('old body');
    const r2 = await applyDailyContent('/rahu-kaal/chennai', shell('x'), assets, 'https://bornclock.com', at('2026-11-03'));
    expect(r2!.html).toContain('Tuesday, 3 November 2026');
    expect(r2!.html).not.toBe(r1!.html);
  });

  it('Panchang Kanpur and the Choghadiya index page are injected too', async () => {
    const r = await applyDailyContent('/panchang/kanpur/', shell('x'), assets, 'https://bornclock.com', at('2026-11-05'));
    expect(r!.html).toContain('Panchang Today in Kanpur (5 November 2026) | BornClock');
    const i = await applyDailyContent('/choghadiya/', shell('x'), assets, 'https://bornclock.com', at('2026-11-05'));
    expect(i!.html).toContain('<span data-daily="h1">Choghadiya Today</span>');
    expect(i!.html).toContain('Delhi');
  });

  it('the browser builder gives the identical entry (same body HTML) as the precompute', () => {
    const c = panchangCityBySlug('kanpur')!;
    const fromBuild = computeDaily('panchang', '2026-11-07', 'kanpur');
    const inBrowser = buildPanchangEntry('panchang', { name: c.name, lat: c.lat, lon: c.lon, tz: c.tz, slug: c.slug }, '2026-11-07');
    expect(renderDailyBodyHtml(inBrowser)).toBe(renderDailyBodyHtml(fromBuild));
  });

  it('is deterministic and changes day to day', () => {
    const a = computeDaily('choghadiya', '2026-11-10', 'surat');
    expect(computeDaily('choghadiya', '2026-11-10', 'surat')).toEqual(a);
    expect(computeDaily('choghadiya', '2026-11-11', 'surat').answer).not.toBe(a.answer);
    expect(a.faq.length).toBeGreaterThan(0);
    expect(a.answer.split('. ').length).toBeLessThanOrEqual(3);
  });
});
