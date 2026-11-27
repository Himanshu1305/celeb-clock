/**
 * B18 — Varshphal (Tajik annual chart) validation.
 *
 * 1. Independent Swiss Ephemeris reference (fixtures/varshphal_ref.py → varshphalSwiss.json):
 *    14 charts × 2026 and 2027 (incl. 1978-05-13 19:30 Jammu and 1981-07-09 04:30 Patna, and
 *    one chart cast for a residence city). Tolerances: Varsha Pravesh ≤ 2 min, annual Lagna
 *    sign exact, Muntha exact, Mudda dasha dates ≤ 1 day, Sahams ≤ 0.1°.
 * 2. Published worked examples — Dr. S.P. Gour, "Varshaphal", AIFAS
 *    (https://ia800104.us.archive.org/22/items/AIFASBooks/Varshphal%20Eng%20AIFAS.pdf).
 */
import { describe, it, expect } from 'vitest';
import { COUNTS } from '../../accuracy/evidence';
import ref from './fixtures/varshphalSwiss.json';
import {
  computeVarshphal, saham, muddaStartIndex, MUDDA_ORDER, MUDDA_DAYS, haddaLord, decanLord, tajikAspect, pairYoga,
} from '../varshphal';

type Row = {
  id: string; year: number; birthUTC: string; birthLat: number; birthLon: number; lat: number; lon: number;
  completedYears: number; varshaPravesh: string; nextVarshaPravesh: string; isDay: boolean; lagna: number; lagnaSign: number;
  munthaSign: number; planets: Record<string, number>; sahams: Record<string, number>; mudda: [string, string, string][];
};
const ROWS = (ref as unknown as { rows: Row[] }).rows;
const angDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe('Varshphal vs Swiss Ephemeris (independent reference)', () => {
  it('A3 — the counts on /accuracy: every chart × 2026 and 2027, year start within the stated seconds, same Lagna and Muntha', () => {
    expect(ROWS).toHaveLength(COUNTS.varshphalRows);
    expect(new Set(ROWS.map(r => r.id)).size).toBe(COUNTS.varshphalCharts);
    let worst = 0, same = 0;
    for (const r of ROWS) {
      const v = computeVarshphal({ birthUTC: new Date(r.birthUTC), birthLat: r.birthLat, birthLon: r.birthLon, lat: r.lat, lon: r.lon, timezone: 'UTC', year: r.year });
      worst = Math.max(worst, Math.abs(Date.parse(v.varshaPravesh.utc) - Date.parse(r.varshaPravesh)) / 1000);
      if (v.lagna.sign === r.lagnaSign && v.muntha.sign === r.munthaSign) same++;
    }
    expect(worst).toBeLessThanOrEqual(COUNTS.varshphalMaxSeconds);
    expect(same).toBe(COUNTS.varshphalRows);
  }, 300_000);

  it('covers ≥ 12 charts × 2 years', () => {
    expect(new Set(ROWS.map(r => r.id)).size).toBeGreaterThanOrEqual(12);
    expect(new Set(ROWS.map(r => r.year))).toEqual(new Set([2026, 2027]));
    expect(ROWS.some(r => r.id === 'JAMMU')).toBe(true);
    expect(ROWS.some(r => r.id === 'PATNA')).toBe(true);
  });

  for (const r of ROWS) {
    it(`${r.id} ${r.year}`, () => {
      const v = computeVarshphal({
        birthUTC: new Date(r.birthUTC), birthLat: r.birthLat, birthLon: r.birthLon,
        lat: r.lat, lon: r.lon, timezone: 'UTC', year: r.year,
      });
      expect(v.completedYears).toBe(r.completedYears);
      // Varsha Pravesh within 2 minutes (in practice a few seconds).
      expect(Math.abs(Date.parse(v.varshaPravesh.utc) - Date.parse(r.varshaPravesh))).toBeLessThan(120_000);
      expect(Math.abs(Date.parse(v.nextVarshaPravesh) - Date.parse(r.nextVarshaPravesh))).toBeLessThan(120_000);
      expect(v.varshaPravesh.isDay).toBe(r.isDay);
      expect(v.lagna.sign).toBe(r.lagnaSign);
      expect(angDiff(v.lagna.longitude, r.lagna)).toBeLessThan(0.1);
      expect(v.muntha.sign).toBe(r.munthaSign);
      for (const [p, lon] of Object.entries(r.planets)) {
        expect(angDiff(v.planets.find(x => x.name === p)!.longitude, lon), p).toBeLessThan(0.01);
      }
      for (const [k, lon] of Object.entries(r.sahams)) {
        expect(angDiff(v.sahams.find(s => s.key === k)!.longitude, lon), k).toBeLessThan(0.1);
      }
      expect(v.mudda.map(m => m.lord)).toEqual(r.mudda.map(m => m[0]));
      v.mudda.forEach((m, i) => {
        expect(Math.abs(Date.parse(m.start) - Date.parse(r.mudda[i][1]))).toBeLessThan(86_400_000);
        expect(Math.abs(Date.parse(m.end) - Date.parse(r.mudda[i][2]))).toBeLessThan(86_400_000);
      });
    });
  }
});

/** AIFAS worked examples (birth times in IST, +5:30). */
const IST = (s: string) => new Date(Date.parse(s + ':00Z') - 5.5 * 3600_000);
const ALLAHABAD = { lat: 25.45, lon: 81.85 };
const DELHI = { lat: 28.65, lon: 77.22 };
function aifas(birth: string, place: { lat: number; lon: number }, year: number) {
  return computeVarshphal({ birthUTC: IST(birth), birthLat: place.lat, birthLon: place.lon, ...place, timezone: 'Asia/Kolkata', year });
}

describe('Varshphal vs published AIFAS examples', () => {
  it('Indira Gandhi, 1983: VP 20.11.1983 21:22:37, Varsha Lagna Cancer 3°45′, Muntha 7th, Mudda Rahu from 14.10.1984', () => {
    const v = aifas('1917-11-19T23:11', ALLAHABAD, 1983);
    expect(v.varshaPravesh.localDate).toBe('1983-11-20');
    expect(Math.abs(Date.parse(v.varshaPravesh.utc) - Date.parse('1983-11-20T15:52:37Z'))).toBeLessThan(60_000);
    expect(v.lagna.sign).toBe(3);
    expect(Math.abs(v.lagna.degree - 3.75)).toBeLessThan(0.25);
    expect(v.muntha.house).toBe(7);
    const last = v.mudda[v.mudda.length - 1];
    expect(last.lord).toBe('Rahu');
    expect(last.start.slice(0, 10)).toBe('1984-10-14');
  });

  it('Girl b. 20.10.1982 18:05 Delhi, 2007: VP 21.10.2007 03:55:06, Lagna Leo 29°25′, Muntha 10th in Taurus, Varshesh Saturn, Vivaha Saham Libra 4°49′', () => {
    const v = aifas('1982-10-20T18:05', DELHI, 2007);
    expect(Math.abs(Date.parse(v.varshaPravesh.utc) - Date.parse('2007-10-20T22:25:06Z'))).toBeLessThan(60_000);
    expect(v.lagna.sign).toBe(4);
    expect(v.muntha.house).toBe(10);
    expect(v.muntha.sign).toBe(1);
    expect(v.varshesh.planet).toBe('Saturn');
    const vivaha = v.sahams.find(s => s.key === 'vivaha')!;
    expect(angDiff(vivaha.longitude, 180 + 4 + 48 / 60 + 46 / 3600)).toBeLessThan(0.1);
  });

  it('Native b. 31.07.1973 20:15 Delhi, 2000: VP 31.07.2000 18:18:30, Lagna Capricorn 0°46′, Muntha 5th, Varshesh Moon', () => {
    const v = aifas('1973-07-31T20:15', DELHI, 2000);
    expect(Math.abs(Date.parse(v.varshaPravesh.utc) - Date.parse('2000-07-31T12:48:30Z'))).toBeLessThan(60_000);
    expect(v.lagna.sign).toBe(9);
    expect(v.muntha.house).toBe(5);
    expect(v.varshesh.planet).toBe('Moon');
  });

  it('Same native, 2006: Karya-siddhi Saham Scorpio 5°39′ (exercises the add-one-sign rule; independent of the Lagna)', () => {
    const v = aifas('1973-07-31T20:15', DELHI, 2006);
    const ks = v.sahams.find(s => s.key === 'karyasiddhi')!;
    expect(angDiff(ks.longitude, 210 + 5 + 39 / 60)).toBeLessThan(0.1);
  });

  it('Amitabh Bachchan, 2008: VP 11.10.2008 ~14:10, Muntha 8th, Varshesh Mercury', () => {
    const v = aifas('1942-10-11T16:00', ALLAHABAD, 2008);
    expect(Math.abs(Date.parse(v.varshaPravesh.utc) - Date.parse('2008-10-11T08:39:56Z'))).toBeLessThan(60_000);
    expect(v.muntha.house).toBe(8);
    expect(v.varshesh.planet).toBe('Mercury');
  });
});

describe('Varshphal building blocks', () => {
  it('saham adds one sign when the added point is not between B and A', () => {
    expect(saham(100, 50, 70)).toBeCloseTo(120, 6);     // 70 lies between 50 and 100
    expect(saham(100, 50, 200)).toBeCloseTo(280, 6);    // 250 + 30
  });
  it('Mudda start: remainder counted from the Sun (Krittika, 0 years → Sun; Ashwini → Ketu)', () => {
    expect(MUDDA_ORDER[muddaStartIndex(0, 3)]).toBe('Sun');
    expect(MUDDA_ORDER[muddaStartIndex(0, 1)]).toBe('Ketu');
    expect(MUDDA_ORDER[muddaStartIndex(33, 10)]).toBe('Jupiter'); // (33+10−2)=41, 41 mod 9 = 5 → Jupiter
    expect(Object.values(MUDDA_DAYS).reduce((a, b) => a + b, 0)).toBe(360);
  });
  it('terms and decans', () => {
    expect(haddaLord(0)).toBe('Jupiter');
    expect(haddaLord(29.9)).toBe('Saturn');
    expect(haddaLord(30 * 11 + 1)).toBe('Venus');
    expect(decanLord(5)).toBe('Mars');
    expect(decanLord(15)).toBe('Sun');
    expect(decanLord(355)).toBe('Mars');
  });
  it('Tajik aspects and Ithasala/Ishrafa', () => {
    expect(tajikAspect(5)).toBe('open-friendly');
    expect(tajikAspect(2)).toBe('none');
    // Moon (faster) at 10° Aries, Jupiter at 14° Leo: trine, faster behind → Ithasala.
    expect(pairYoga('Moon', 'Jupiter', { Moon: 10, Jupiter: 134 })?.kind).toBe('ithasala');
    // Moon ahead → Ishrafa.
    expect(pairYoga('Moon', 'Jupiter', { Moon: 18, Jupiter: 134 })?.kind).toBe('ishrafa');
    // 2nd/12th: no aspect.
    expect(pairYoga('Moon', 'Jupiter', { Moon: 10, Jupiter: 41 })).toBeNull();
  });
  it('rejects years outside 1–120 years of age', () => {
    expect(() => computeVarshphal({ birthUTC: new Date('2000-01-01T00:00:00Z'), birthLat: 28, birthLon: 77, lat: 28, lon: 77, timezone: 'UTC', year: 2000 })).toThrow();
  });
});
