/**
 * B14 (Nov 2026): natal charts use TRUE Lahiri (Swiss Ephemeris SIDM_LAHIRI with
 * nutation) — the convention AstroSage uses. Founder rule: users compare with
 * AstroSage and Kundali matching follows AstroSage exactly. Panchang / festival /
 * transit timing stays on the Drik convention (ayanamsaDrik.test.ts).
 *
 * Reference values: fixtures/swissTrueLahiri.json, produced by
 * fixtures/swissTrueLahiri_ref.py (pyswisseph 2.10.03, SIDM_LAHIRI,
 * swe.get_ayanamsa_ex_ut; "true" = default flags, "mean" = FLG_NONUT), run 17 Nov 2026.
 *
 * AstroSage evidence (fetched during the 17 Nov 2026 accuracy audit):
 *  - SRK Vimshottari: https://www.astrosage.com/celebrity-horoscope/shahrukh-khan-dashaphal.asp
 *    lists the Moon Mahadasha ending "Mar 6, 1967" (input 2 Nov 1965 02:30 IST, 28N39 77E13).
 */
import { describe, it, expect } from 'vitest';
import ref from './fixtures/swissTrueLahiri.json';
import { getNatalAyanamsa, getDrikAyanamsa, getSiderealLongitude, generateFullChart, getAyanamsa } from '../engine/vedicEngine';
import { calculateBirthChart } from '../calculateBirthChart';

describe('natal ayanamsa = Swiss TRUE Lahiri (SIDM_LAHIRI, nutation included)', () => {
  expect(ref.rows.length).toBeGreaterThanOrEqual(5);
  for (const r of ref.rows) {
    it(`${r.utc}: within 0.0001° of Swiss true Lahiri ${r.true}`, () => {
      expect(Math.abs(getNatalAyanamsa(new Date(r.utc)) - r.true)).toBeLessThan(0.0001);
    });
  }
  it('the Drik convention is unchanged: Swiss MEAN + 24.4″ on the same dates', () => {
    for (const r of ref.rows) {
      expect(Math.abs((getDrikAyanamsa(new Date(r.utc)) - r.mean) * 3600 - 24.4)).toBeLessThan(0.2);
    }
  });
  it('callers must choose: getAyanamsa / getSiderealLongitude route by kind', () => {
    const d = new Date('1981-07-08T23:00:00Z');
    expect(getAyanamsa(d, 'natal')).toBe(getNatalAyanamsa(d));
    expect(getAyanamsa(d, 'drik')).toBe(getDrikAyanamsa(d));
    const diff = getSiderealLongitude('Sun', d, 'drik') - getSiderealLongitude('Sun', d, 'natal');
    expect(diff).toBeCloseTo(getNatalAyanamsa(d) - getDrikAyanamsa(d), 9);
  });
});

describe('AstroSage parity on known charts', () => {
  it('SRK (2 Nov 1965 02:30 IST, Delhi): Moon Mahadasha ends 1967-03-06 (AstroSage)', () => {
    const c = generateFullChart(new Date('1965-11-01T21:00:00Z'), new Date('2026-11-17T06:00:00Z'), 28.65, 77.2166667);
    const moon = c.fullDashaTimeline.find(p => p.lord === 'Moon')!;
    // IST calendar date of the boundary
    const ist = new Date(Date.parse(moon.end) + 5.5 * 3600_000).toISOString().slice(0, 10);
    expect(ist).toBe('1967-03-06');
  });
  it('Patna 1981-07-09 04:30 IST: Mars in Gemini (Mithuna 0°00′), 1st house', async () => {
    const c = generateFullChart(new Date('1981-07-08T23:00:00Z'), new Date('2026-11-17T06:00:00Z'), 25.5941, 85.1376);
    expect(c.planets.Mars.rashi).toBe('Mithuna');
    expect(c.planets.Mars.house).toBe(1);
    const bc = await calculateBirthChart({ year: 1981, month: 7, day: 9, hour: 4, minute: 30, latitude: 25.5941, longitude: 85.1376, timezoneOffset: 5.5 }, { refDate: new Date('2026-11-17T06:00:00Z') });
    const mars = bc.planets.find((p: { name: string }) => p.name === 'Mars') as { sign?: string; house?: number } | undefined;
    expect(mars?.house).toBe(1);
  });
});
