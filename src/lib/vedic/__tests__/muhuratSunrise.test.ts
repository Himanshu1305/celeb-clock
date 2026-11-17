/**
 * B14 F2 / F5 / F6 (accuracy audit, 17 Nov 2026).
 *
 * F2: the Muhurat finder must read each day at the place's REAL sunrise, with that day's
 * UTC offset (DST) and the same Rahu Kalam the Panchang page shows. The audit found the
 * old fixed 06:00 / 06:00–18:00 approximation off by a mean of 21 min (Delhi), 49 min
 * (London) and 104 min (Reykjavik), with the wrong Nakshatra on 10–23% of days.
 * Reference = the Panchang page's own computation (computeDayPanchang with the offset
 * usePanchangPlace resolves for the date), which matches Drik Panchang (panchangDrik.test.ts).
 *
 * F5: polar day / night returns a `polar` flag; pages show no invented clock times.
 * F6: a sunset after local midnight reads "(next day)".
 */
import { describe, it, expect } from 'vitest';
import { GET as muhuratGET } from '../../../../api/muhurat';
import { computeDayPanchang, sunriseSunset, dayWindowsLite } from '../panchangDay';
import { resolveForPlace } from '../../timezone/clientBirth';
import { computePanchangDayData, buildPanchangEntry, buildPanchangHiEntry } from '../../daily/kinds/panchangDaily';
import { computePanchangMonthData } from '../../daily/kinds/panchangMonth';

type Day = { date: string; weekday: string; tithiName: string; paksha: string; nakshatra: string; yoga: string; rahuKalam: { start: string; end: string }; polar?: string };
const call = async (q: Record<string, string>) => (await muhuratGET(new Request(`http://localhost/api/muhurat?${new URLSearchParams(q)}`))).json();

// [name, lat, lon, Panchang-page offset rule]: Delhi is a built-in city (fixed +5:30);
// London / New York are searched places (offset at local noon of each date, DST-aware).
const PLACES: Array<[string, number, number, boolean]> = [
  ['Delhi', 28.6139, 77.209, true],
  ['London', 51.5074, -0.1278, false],
  ['New York', 40.7128, -74.006, false],
];

describe('F2: Muhurat days match the Panchang page (real sunrise, Rahu Kalam, per-day DST)', () => {
  for (const [name, lat, lon, builtIn] of PLACES) {
    // 20 Oct → 18 Nov 2026 crosses the UK (25 Oct) and US (1 Nov) DST ends.
    it(`${name}: 30 days, every limb and Rahu Kalam equal to the Panchang page`, async () => {
      const r = await call({ purpose: 'general', from: '2026-10-20', days: '30', lat: String(lat), lon: String(lon) });
      const all = r.all as Day[];
      expect(all).toHaveLength(30);
      expect(r.polar).toBeUndefined();
      for (const d of all) {
        const tz = builtIn ? 5.5 : resolveForPlace(d.date, '12:00', { lat, lon }).utcOffsetHours;
        const p = computeDayPanchang(new Date(d.date + 'T12:00:00Z'), lat, lon, tz, name);
        expect([d.date, d.weekday, d.paksha, d.tithiName, d.nakshatra, d.yoga, d.rahuKalam.start, d.rahuKalam.end], `${name} ${d.date}`)
          .toEqual([p.date, p.weekday, p.paksha, p.tithiName, p.nakshatra, p.yoga, p.rahuKaal.start, p.rahuKaal.end]);
      }
      // The dates run consecutively from the start date (no skipped / doubled day at a DST change).
      expect(all.map(d => d.date)[0]).toBe('2026-10-20');
      expect(all.map(d => d.date)[29]).toBe('2026-11-18');
    }, 60_000);
  }

  it('London: Rahu Kalam follows the clock change (BST → GMT on 25 Oct 2026)', async () => {
    const r = await call({ purpose: 'general', from: '2026-10-23', days: '4', lat: '51.5074', lon: '-0.1278' });
    const byDate = Object.fromEntries((r.all as Day[]).map(d => [d.date, d.rahuKalam.start]));
    // Sunrise moves 1 h earlier on the clock across the change; the 25 Oct window uses GMT (+0).
    const before = sunriseSunset(new Date('2026-10-24T12:00:00Z'), 51.5074, -0.1278, 1).rise;
    const after = sunriseSunset(new Date('2026-10-25T12:00:00Z'), 51.5074, -0.1278, 0).rise;
    const clock = (t: Date, tz: number) => new Date(t.getTime() + tz * 3600e3).getUTCHours();
    expect(clock(before, 1) - clock(after, 0)).toBe(1);
    expect(byDate['2026-10-25']).toBe(dayWindowsLite(new Date('2026-10-25T12:00:00Z'), 51.5074, -0.1278, 0).rahuKaal.start);
  });

  it('the old fixed 06:00–18:00 Rahu Kalam is gone (Delhi 17 Nov 2026 = Panchang page window)', async () => {
    const r = await call({ purpose: 'general', from: '2026-11-17', days: '7', lat: '28.6139', lon: '77.209' });
    const tue = (r.all as Day[]).find(d => d.date === '2026-11-17')!;
    expect(tue.weekday).toBe('Tuesday');
    // Fixed-day Tuesday window would be 15:00–16:30; the real one (sunrise ~06:52) is later-starting and shorter.
    expect(tue.rahuKalam).not.toEqual({ start: '15:00', end: '16:30' });
    expect(tue.rahuKalam.start).toBe(computeDayPanchang(new Date('2026-11-17T12:00:00Z'), 28.6139, 77.209, 5.5, 'Delhi').rahuKaal.start);
  });
});

describe('F5: polar day / night', () => {
  const TROMSO = { name: 'Tromsø', lat: 69.6492, lon: 18.9553 };
  it('sunriseSunset flags polar day (21 Jun) and polar night (21 Dec)', () => {
    expect(sunriseSunset(new Date('2026-06-21T12:00:00Z'), TROMSO.lat, TROMSO.lon, 2).polar).toBe('day');
    expect(sunriseSunset(new Date('2026-12-21T12:00:00Z'), TROMSO.lat, TROMSO.lon, 1).polar).toBe('night');
    expect(sunriseSunset(new Date('2026-03-21T12:00:00Z'), TROMSO.lat, TROMSO.lon, 1).polar).toBeUndefined();
    expect(sunriseSunset(new Date('2026-06-21T12:00:00Z'), 28.6139, 77.209, 5.5).polar).toBeUndefined();
  });
  it('Panchang / Rahu Kaal / Choghadiya / Hindi pages show a polar note and no invented times', () => {
    const place = { ...TROMSO, tz: 1 };
    const data = computePanchangDayData(place, '2026-12-21');
    expect(data.pl).toBe('night');
    for (const kind of ['panchang', 'rahu-kaal', 'choghadiya'] as const) {
      const e = buildPanchangEntry(kind, place, '2026-12-21');
      const text = JSON.stringify(e);
      expect(e.sections[0].id).toBe('polar');
      expect(text).toMatch(/polar night/);
      expect(text).not.toMatch(/Rahu Kaal is \d|Sunrise \d|06:00–|–18:00|16:30/);
    }
    const hi = JSON.stringify(buildPanchangHiEntry(place, '2026-12-21', 'x', true));
    expect(hi).toMatch(/ध्रुवीय रात/);
    expect(hi).not.toMatch(/राहु काल \d/);
  });
  it('Muhurat API flags polar days and gives them no Rahu Kalam', async () => {
    const r = await call({ purpose: 'general', from: '2026-12-15', days: '7', lat: String(TROMSO.lat), lon: String(TROMSO.lon) });
    expect(r.polar).toBe(true);
    for (const d of r.all as Day[]) {
      expect(d.polar).toBe('night');
      expect(d.rahuKalam).toEqual({ start: '', end: '' });
    }
  });
  it('month calendar marks polar days instead of showing 06:00 / 18:00', () => {
    const m = computePanchangMonthData({ name: 'Tromsø', lat: TROMSO.lat, lon: TROMSO.lon, tz: 1 }, '2026-12');
    expect(m.d[20][6]).toBe(2);
    expect(m.d[0].length).toBe(7); // 1 Dec 2026 is already polar night in Tromsø
  });
});

describe('F6: sunset after local midnight', () => {
  it('Reykjavik 21 Jun 2026: sunset reads "00:0x (next day)" on the Panchang data and page', () => {
    const p = computeDayPanchang(new Date('2026-06-21T12:00:00Z'), 64.1466, -21.9426, 0, 'Reykjavik');
    expect(p.polar).toBeUndefined();
    expect(p.sunset).toMatch(/^00:0\d \(next day\)$/);
    expect(dayWindowsLite(new Date('2026-06-21T12:00:00Z'), 64.1466, -21.9426, 0).sunset).toBe(p.sunset);
    const place = { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, tz: 0 };
    const e = buildPanchangEntry('panchang', place, '2026-06-21');
    const sun = e.sections.find(s => s.id === 'sun')!;
    expect(sun.items!.find(i => i.label === 'Sunset')!.value).toBe(p.sunset);
  });
  it('an ordinary sunset has no marker', () => {
    expect(computeDayPanchang(new Date('2026-06-21T12:00:00Z'), 28.6139, 77.209, 5.5, 'Delhi').sunset).toMatch(/^\d\d:\d\d$/);
  });
});
