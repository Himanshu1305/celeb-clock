import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import {
  generateFullChart,
  getShastiamsaSign,
  getDasamsaSign,
  getNavamsaSign,
  getKPSubLord,
} from '../engine/vedicEngine';
import { getKaalSarpDetails } from '../engine/kaalSarp';
import { calculateBirthChart } from '../calculateBirthChart';

// Load the validated lab engine (the ground truth the port must reproduce).
const require = createRequire(import.meta.url);
const cjs = require('../../../../scripts/vedic-lab/vedicEngineStage1b.cjs');

const REF = new Date(Date.UTC(2026, 8, 9, 0, 0, 0));
const toUTC = (y: number, mo: number, d: number, h: number, mi: number, tz: number) =>
  new Date(Date.UTC(y, mo - 1, d, h, mi) - tz * 3600 * 1000);

describe('engine port — parity with the validated scripts/vedic-lab/*.cjs', () => {
  const charts: Array<[string, Date, number, number]> = [
    ['Delhi 1988', toUTC(1988, 11, 5, 12, 30, 5.5), 28.6139, 77.2090],
    ['Sydney 1975', toUTC(1975, 7, 20, 23, 45, 10), -33.8688, 151.2093],
    ['London 1901', toUTC(1901, 6, 10, 15, 30, 0), 51.5074, -0.1278],
  ];
  for (const [name, birthUTC, lat, lon] of charts) {
    it(`ported TS output equals lab .cjs output: ${name}`, () => {
      const ts = generateFullChart(birthUTC, REF, lat, lon);
      const ref = cjs.generateFullChart(birthUTC, REF, lat, lon);
      // The port adds currentAntardasha (nested Vimshottari) not present in the
      // lab engine; everything else must be byte-identical.
      const { currentAntardasha, ...tsShared } = ts as any;
      expect(tsShared).toEqual(ref);
    });
  }
});

describe('engine port — divisional charts & KP match lab .cjs (exact)', () => {
  const lons = [10.5, 47.8, 199.39, 265.2, 333.99, 0.0, 359.99];
  for (const lon of lons) {
    it(`D9/D10/D60/KP match at longitude ${lon}`, () => {
      expect(getNavamsaSign(lon)).toEqual(cjs.getNavamsaSign(lon));
      expect(getDasamsaSign(lon)).toEqual(cjs.getDasamsaSign(lon));
      expect(getShastiamsaSign(lon)).toEqual(cjs.getShastiamsaSign(lon));
      expect(getKPSubLord(lon)).toEqual(cjs.getKPSubLord(lon));
    });
  }
});

describe('Kaal Sarp classifier — full/partial/absent + direction', () => {
  const mkChart = (rahu: number, ketu: number, classicalSigns: number[]) => ({
    lagna: { rashiIndex: 0 },
    planets: {
      Rahu: { rashiIndex: rahu }, Ketu: { rashiIndex: ketu },
      Sun: { rashiIndex: classicalSigns[0] }, Moon: { rashiIndex: classicalSigns[1] },
      Mars: { rashiIndex: classicalSigns[2] }, Mercury: { rashiIndex: classicalSigns[3] },
      Jupiter: { rashiIndex: classicalSigns[4] }, Venus: { rashiIndex: classicalSigns[5] },
      Saturn: { rashiIndex: classicalSigns[6] },
    },
  }) as any;

  it('all 7 classical planets inside the Rahu→Ketu arc → full, present, Descending', () => {
    const r = getKaalSarpDetails(mkChart(0, 6, [1, 2, 3, 3, 4, 5, 5]));
    expect(r.present).toBe(true);
    expect(r.isPartial).toBe(false);
    expect(r.direction).toBe('Descending');
    expect(r.type).toBeTruthy();
  });

  it('planets split across both arcs → not present', () => {
    const r = getKaalSarpDetails(mkChart(0, 6, [1, 2, 3, 7, 8, 9, 10]));
    expect(r.present).toBe(false);
    expect(r.type).toBeNull();
  });

  it('matches the ported abstraction result for a real chart (reference: absent)', async () => {
    const res = await calculateBirthChart(
      { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
      { refDate: REF },
    );
    expect(res.doshas.kaalSarp.present).toBe(false);
  });
});

describe('Shadbala — confidence-table-aware assertions (exact where 100%, tolerance where not)', () => {
  it('is only present when includeShadbala is set', async () => {
    const without = await calculateBirthChart(
      { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
      { refDate: REF },
    );
    expect(without.shadbala).toBeUndefined();
  });

  it('Naisargika Bala is exact (100% component); Sthana/Chesta use tolerance', async () => {
    const r = await calculateBirthChart(
      { year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
      { refDate: REF, includeShadbala: true },
    );
    expect(r.shadbala).toBeDefined();
    const sun = r.shadbala!.Sun;
    const saturn = r.shadbala!.Saturn;

    // Naisargika — exact fixed constants.
    expect(sun.naisargika).toBe(60);
    expect(saturn.naisargika).toBe(8.57);

    // Dig Bala — exact-range (directional strength must be within 0..60).
    for (const p of Object.values(r.shadbala!)) {
      expect(p.dig).toBeGreaterThanOrEqual(0);
      expect(p.dig).toBeLessThanOrEqual(60);
    }

    // Sthana (~94%) and Chesta (~80%) are approximate — assert plausible
    // ranges, NOT exact values (per the confidence table).
    expect(sun.sthana).toBeGreaterThan(0);
    expect(sun.sthana).toBeLessThan(300);
    expect(sun.chesta).toBe(0); // Sun has no Chesta Bala (substituted by Ayana)

    // Totals must be finite positive numbers for all 7 planets.
    for (const p of Object.values(r.shadbala!)) {
      expect(Number.isFinite(p.total)).toBe(true);
      expect(p.total).toBeGreaterThan(0);
    }
  });
});
