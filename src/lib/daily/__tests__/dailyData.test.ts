// Batch 7: the compact "data + render" precompute. The stored data, rendered by the
// shared pure templates, must give exactly the text the engine-side builders give, and
// the Worker must serve it from the small data files.
import { describe, it, expect } from 'vitest';
import { DAILY_PAGES, dailyFilePath, matchDailyRoute } from '../registry';
import { DAILY_COMPUTERS, DAILY_DATA_COMPUTERS } from '../compute';
import { DAILY_TEMPLATES, entryFromMonthFile } from '../templates';
import { renderDailyBodyHtml } from '../render';
import { addDaysISO } from '../dates';
import { applyDailyContent } from '../../../../functions/daily';
import { composeRashifalEn, composeRashifalHi } from '../kinds/rashifalDaily';
import { composeWestern } from '../kinds/westernDaily';
import { expandPanchangDay } from '../kinds/panchangTemplate';
import { computePanchangDayData } from '../kinds/panchangDaily';
import { computeDayPanchang, PANCHANG_CITIES } from '../../vedic/panchangDay';
import type { DailyMonthFile } from '../types';

describe('every daily kind uses the compact data variant', () => {
  it('has a data computer and a template', () => {
    for (const d of DAILY_PAGES) {
      expect(d.data, d.kind).toBeTruthy();
      expect(DAILY_DATA_COMPUTERS[d.data!.kind], d.kind).toBeTypeOf('function');
      expect(DAILY_TEMPLATES[d.kind], d.kind).toBeTypeOf('function');
    }
  });
});

describe('rendering from stored data = the original compose (same text)', () => {
  const dates = ['2026-10-26', '2026-12-31', '2027-03-15'];
  it('rashifal EN + HI from the stored sky', () => {
    for (const date of dates) for (let i = 0; i < 12; i++) {
      expect(DAILY_COMPUTERS['rashifal'](date, ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'][i])).toEqual(composeRashifalEn(date, i));
      expect(DAILY_COMPUTERS['rashifal-hi'](date, ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'][i])).toEqual(composeRashifalHi(date, i));
    }
  });
  it('Western horoscope from the stored sky', () => {
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    for (const date of dates) signs.forEach((s, i) => expect(DAILY_COMPUTERS['horoscope'](date, s)).toEqual(composeWestern(date, i)));
  });
  it('Panchang: data → expand gives back the engine’s day (every field the pages show), 50 cities × 30 days', () => {
    for (const c of PANCHANG_CITIES) {
      for (let i = 0; i < 30; i += 1) {
        const date = addDaysISO('2026-11-01', i * 12); // spread over a year
        const p = computeDayPanchang(new Date(date + 'T12:00:00Z'), c.lat, c.lon, c.tz, c.name);
        const data = JSON.parse(JSON.stringify(computePanchangDayData({ name: c.name, lat: c.lat, lon: c.lon, tz: c.tz, slug: c.slug }, date)));
        const x = expandPanchangDay(date, data, c.name);
        const { rahuKalam: _a, ...pp } = p; const { rahuKalam: _b, ...xx } = x;
        expect(xx, `${c.slug} ${date}`).toEqual(pp);
      }
    }
  }, 120000);
});

describe('Worker serves data-variant pages from the compact files', () => {
  const files: Record<string, unknown> = {};
  const add = (kind: string, pageSlug: string) => {
    const def = DAILY_PAGES.find(d => d.kind === kind)!;
    const ds = def.data!.slug(pageSlug);
    const data: Record<string, unknown> = {};
    for (let d = '2026-11-01'; d.startsWith('2026-11'); d = addDaysISO(d, 1)) data[d] = DAILY_DATA_COMPUTERS[def.data!.kind](d, ds);
    const file: DailyMonthFile = { kind: def.data!.kind, slug: ds, month: '2026-11', data };
    files[dailyFilePath(def, pageSlug, '2026-11')] = file;
    return file;
  };
  const fRashi = add('rashifal', 'mesh');
  const fDelhi = add('panchang-hi', 'index');
  const assets = { fetch: async (req: Request) => {
    const p = new URL(req.url).pathname;
    return files[p] ? new Response(JSON.stringify(files[p]), { headers: { 'content-type': 'application/json' } }) : new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } });
  } };
  const shell = `<html><head><title>x</title></head><body><h1><span data-daily="h1">x</span></h1><span data-daily="date">x</span><div data-daily="body"><p>old</p></div><script type="application/ld+json" data-daily="jsonld">{}</script></body></html>`;

  it('the injected body equals the template rendered in the browser from the same file', async () => {
    for (const [path, file] of [['/rashifal/mesh/today/', fRashi], ['/hi/panchang/', fDelhi]] as const) {
      const r = await applyDailyContent(path, shell, assets, 'https://bornclock.com', new Date('2026-11-12T06:00:00Z'));
      const m = matchDailyRoute(path)!;
      const browser = entryFromMonthFile(m.def, m.slug, '2026-11-12', file as DailyMonthFile)!;
      expect(r!.html).toContain(renderDailyBodyHtml(browser));
      expect(r!.html).toContain(browser.title.replace(/&/g, '&amp;'));
    }
  });
  it('Hindi Panchang Delhi index: Hindi date and text', async () => {
    const r = await applyDailyContent('/hi/panchang', shell, assets, 'https://bornclock.com', new Date('2026-11-12T06:00:00Z'));
    expect(r!.html).toContain('गुरुवार, 12 नवंबर 2026');
    expect(r!.html).toContain('राहु काल');
    expect(r!.html).toContain('<span data-daily="h1">आज का पंचांग</span>');
  });
});
