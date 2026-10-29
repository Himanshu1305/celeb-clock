/**
 * Batch 10 — monthly Panchang calendar (/panchang-calendar). Every box's values come from
 * the same sunrise + limb code as the daily Panchang; here they are checked against the
 * Drik Panchang New Delhi day pages already recorded in panchangDrik.test.ts (opened
 * 25 Oct 2026; Drik's own coordinates): sunrise / sunset within 1 min, Tithi and Nakshatra
 * at sunrise exactly, their end times within 2 min. Festival rows come from the festival
 * engine (festivals.test.ts holds its references).
 */
import { describe, it, expect } from 'vitest';
import { computePanchangMonthData, buildPanchangMonthEntry } from '../../daily/kinds/panchangMonth';
import { renderPanchangMonth, tithiLabel } from '../../daily/kinds/panchangMonthTemplate';
import { renderDailyBodyHtml } from '../../daily/render';
import { computeDaily } from '../../daily/compute';
import { computeFestivalCalendar } from '../festivals';
import { PANCHANG_TABLES } from '../panchang';

const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600;
const DELHI = { name: 'New Delhi', lat: dms(28, 39, 7), lon: dms(77, 13, 53), tz: 5.5 };
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

// [date, sunrise, sunset, paksha, tithi, tithi end, nakshatra, nakshatra end | null] — Drik
// (the paksha from the Swiss Ephemeris new / full Moons in golden/skySwiss.json: full Moon
// 26 Oct 2026 and 19 Jun 2027, new Moon 7 Jan 2027).
const REFS: Array<[string, string, string, 'Shukla' | 'Krishna', string, string, string, string | null]> = [
  ['2026-10-25', '06:28', '17:42', 'Shukla', 'Chaturdashi', '11:55', 'Revati', '19:22'],
  ['2026-10-27', '06:29', '17:40', 'Krishna', 'Pratipada', '07:01', 'Bharani', '15:39'],
  ['2027-01-14', '07:15', '17:45', 'Shukla', 'Shashthi', '13:58', 'Uttara Bhadrapada', '23:18'],
  ['2027-06-21', '05:24', '19:22', 'Krishna', 'Dwitiya', '10:35', 'Uttara Ashadha', null],
];

describe('month boxes vs Drik Panchang (New Delhi)', () => {
  const cache = new Map<string, ReturnType<typeof computePanchangMonthData>>();
  const month = (m: string) => { if (!cache.has(m)) cache.set(m, computePanchangMonthData(DELHI, m)); return cache.get(m)!; };
  for (const [date, rise, set, paksha, tithi, tEnd, nak, nEnd] of REFS) {
    it(date, () => {
      const v = month(date.slice(0, 7)).d[Number(date.slice(8)) - 1];
      expect(Math.abs(v[0] - toMin(rise)), 'sunrise').toBeLessThanOrEqual(1);
      expect(Math.abs(v[1] - toMin(set)), 'sunset').toBeLessThanOrEqual(1);
      expect(tithiLabel(v[2])).toEqual({ paksha, name: tithi });
      expect(Math.abs(v[3] - toMin(tEnd)), 'tithi end').toBeLessThanOrEqual(2);
      expect(PANCHANG_TABLES.NAKSHATRAS[v[4]]).toBe(nak);
      if (nEnd) expect(Math.abs(v[5] - toMin(nEnd)), 'nakshatra end').toBeLessThanOrEqual(2);
      else expect(v[5], 'Drik: "upto Full Night"').toBeGreaterThanOrEqual(1440);
    });
  }
}, 60_000);

describe('month page', () => {
  const data = computePanchangMonthData(DELHI, '2026-11');
  const e = renderPanchangMonth('2026-11-08', { name: 'New Delhi' }, data, { today: true });

  it('lists the festival engine’s November 2026 days, answer-first', () => {
    const fest = computeFestivalCalendar(2026).festivals.filter(f => f.dateISO.startsWith('2026-11'));
    expect(data.f).toHaveLength(fest.length);
    expect(e.answer).toMatch(/^In November 2026, Purnima \(full Moon\) falls on 24 Nov, Amavasya \(new Moon\) on 9 Nov/);
    expect(e.answer).toContain('Diwali (Lakshmi Puja) (8 Nov)');
  });

  it('grid: 30 boxes, 1 Nov 2026 (a Sunday) in the first column, today marked', () => {
    const cal = e.sections.find(s => s.id === 'calendar')!;
    expect(cal.layout).toBe('calendar');
    expect(cal.items).toHaveLength(30);
    expect(cal.startCol).toBe(1);
    expect(cal.items![7].tag).toBe('Today');
    expect(cal.items![23].tag).toBe('Purnima');
    const html = renderDailyBodyHtml(e);
    expect(html).not.toContain('<div');
    expect(html).toContain('sm:grid-cols-7');
    expect(html).toContain('sm:col-start-1');
  });

  it('October 2026 starts on Thursday (column 5); titles ≤ 70 characters; FAQ present', () => {
    const oct = computeDaily('panchang-calendar', '2026-10-29', 'index');
    expect(oct.sections.find(s => s.id === 'calendar')!.startCol).toBe(5);
    expect(oct.title).toBe('Panchang Calendar October 2026 — Tithi & Festivals | BornClock');
    expect(oct.title.length).toBeLessThanOrEqual(70);
    expect(oct.faq.length).toBeGreaterThanOrEqual(3);
  }, 30_000);

  it('another month / place is built in the browser with the same template', () => {
    const x = buildPanchangMonthEntry({ name: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 5.5 }, '2027-01', '2026-10-29');
    expect(x.h1).toBe('Panchang calendar — January 2027');
    expect(x.sections.find(s => s.id === 'calendar')!.items).toHaveLength(31);
    expect(x.sections.find(s => s.id === 'calendar')!.items!.some(i => i.tag === 'Today')).toBe(false);
  }, 30_000);
});
