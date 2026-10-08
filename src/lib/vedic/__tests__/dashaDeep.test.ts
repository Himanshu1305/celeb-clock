import { describe, it, expect } from 'vitest';
import { subPeriods, VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS, periodDays } from '../dashaDeep';
import { calculateBirthChart } from '../calculateBirthChart';

const DAY = 86_400_000;
const parse = (s: string) => Date.parse(s);

describe('dashaDeep — subPeriods mathematical consistency', () => {
  const PARENT_START = '2020-01-01T00:00:00.000Z';
  const PARENT_END = '2039-01-01T00:00:00.000Z'; // 19-year Saturn mahadasha span

  it('returns 9 sub-periods starting at the parent lord in Vimshottari order', () => {
    const subs = subPeriods('Saturn', PARENT_START, PARENT_END);
    expect(subs).toHaveLength(9);
    expect(subs[0].lord).toBe('Saturn');
    const startIdx = VIMSHOTTARI_LORDS.indexOf('Saturn');
    for (let i = 0; i < 9; i++) {
      expect(subs[i].lord).toBe(VIMSHOTTARI_LORDS[(startIdx + i) % 9]);
    }
  });

  it('sub-periods are contiguous and sum EXACTLY to the parent', () => {
    const subs = subPeriods('Saturn', PARENT_START, PARENT_END);
    expect(subs[0].start).toBe(PARENT_START);
    expect(subs[8].end).toBe(PARENT_END); // last child pinned to parent end
    for (let i = 1; i < 9; i++) {
      expect(subs[i].start).toBe(subs[i - 1].end); // contiguous, no gaps/overlaps
    }
    const total = parse(subs[8].end) - parse(subs[0].start);
    const summed = subs.reduce((s, p) => s + (parse(p.end) - parse(p.start)), 0);
    expect(summed).toBe(total); // exact
  });

  it('each sub-period duration follows the Vimshottari proportion (child_years/120)', () => {
    const subs = subPeriods('Saturn', PARENT_START, PARENT_END);
    const totalMs = parse(PARENT_END) - parse(PARENT_START);
    for (const p of subs) {
      const expectedFraction = VIMSHOTTARI_YEARS[p.lord] / 120;
      const actualFraction = (parse(p.end) - parse(p.start)) / totalMs;
      expect(Math.abs(actualFraction - expectedFraction)).toBeLessThan(1e-6);
    }
  });

  it('nests correctly: Sookshma sums to its Pratyantar, Prana sums to its Sookshma', () => {
    const maha = subPeriods('Ketu', PARENT_START, PARENT_END); // any parent
    const antar = subPeriods(maha[0].lord, maha[0].start, maha[0].end);
    const prat = subPeriods(antar[0].lord, antar[0].start, antar[0].end);
    const sookshma = subPeriods(prat[0].lord, prat[0].start, prat[0].end);
    const prana = subPeriods(sookshma[0].lord, sookshma[0].start, sookshma[0].end);
    expect(sookshma[8].end).toBe(prat[0].end);
    expect(prana[8].end).toBe(sookshma[0].end);
    // deeper levels are short
    expect(periodDays(prana[0].start, prana[0].end)).toBeLessThan(periodDays(sookshma[0].start, sookshma[0].end));
  });

  it('is robust to bad input', () => {
    expect(subPeriods('NotALord', PARENT_START, PARENT_END)).toEqual([]);
    expect(subPeriods('Saturn', PARENT_END, PARENT_START)).toEqual([]); // end<=start
  });
});

describe('dashaDeep — cross-check vs the validated engine (real charts)', () => {
  const CHARTS = [
    { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 },
    { year: 1992, month: 1, day: 15, hour: 6, minute: 0, latitude: 13.08, longitude: 80.27, timezoneOffset: 5.5 },
  ];

  it('reproduces the engine Antardashas (lords exact, dates within ~1 day) for each Mahadasha', async () => {
    for (const input of CHARTS) {
      const chart: any = await calculateBirthChart(input, { refDate: new Date(Date.UTC(2026, 0, 1)) });
      const timeline = chart.dashaTimeline;
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
      for (const maha of timeline) {
        const mine = subPeriods(maha.lord, maha.start, maha.end);
        expect(mine).toHaveLength(maha.antardashas.length);
        for (let i = 0; i < mine.length; i++) {
          expect(mine[i].lord).toBe(maha.antardashas[i].lord); // lord order exact
          const dStart = Math.abs(parse(mine[i].start) - parse(maha.antardashas[i].start));
          const dEnd = Math.abs(parse(mine[i].end) - parse(maha.antardashas[i].end));
          expect(dStart).toBeLessThan(DAY); // same arithmetic -> within a day
          expect(dEnd).toBeLessThan(DAY);
        }
      }
    }
  });
});
