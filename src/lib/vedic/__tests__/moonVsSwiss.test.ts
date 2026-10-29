/**
 * Batch 10 — Moon accuracy vs Swiss Ephemeris, 1950–2050 (51 instants, one every 2 years).
 *
 * Reference: moonSwiss1950_2050.json, generated 29 Oct 2026 with pyswisseph 2.10.03
 * (scratchpad engine-audit venv, SE files semo_18/sepl_18): swe.calc_ut(MOON, FLG_SWIEPH),
 * i.e. the APPARENT geocentric longitude on the true equinox of date, plus swe.deltat.
 *
 * Findings this test pins down (see the Batch 10 report):
 *  - Our Moon (astronomy-engine GeoMoon → Ecliptic of date) agrees with Swiss to within
 *    ~2.5″ for 1950–2025. The lunar series, nutation and light-time/aberration are fine.
 *  - The only systematic residual is ΔT (TT−UT). astronomy-engine's built-in ΔT model is
 *    ~6 s above Swiss/IERS in 2026, growing to ~18 s by 2050 (future ΔT is a forecast in
 *    both libraries). That puts our Moon up to ~3.5″ AHEAD in 2026 and ~10″ by 2050.
 *    Removing the ΔT difference leaves ≤ ~3.5″ everywhere.
 *  - The "20–40″ behind Swiss" seen when comparing SIDEREAL Moons is not a Moon error: it is
 *    our deliberate ayanamsa convention (mean Lahiri + 24.4″ subtracted from the apparent,
 *    nutated longitude — calibrated to Drik Panchang, see ayanamsaDrik.test.ts) versus Swiss
 *    sidereal mode (mean-equinox longitude minus mean Lahiri). Difference = Δψ − 24.4″.
 */
import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { getSiderealLongitude, getLahiriAyanamsa } from '../engine/vedicEngine';
import ref from './moonSwiss1950_2050.json';

const arcsec = (a: number, b: number) => {
  let d = (a - b) * 3600;
  while (d > 648000) d -= 1296000;
  while (d < -648000) d += 1296000;
  return d;
};

const rows = ref.rows.map(r => {
  const date = new Date(r.utc);
  const ours = getSiderealLongitude('Moon', date) + getLahiriAyanamsa(date); // back to apparent tropical
  const t = Astronomy.MakeTime(date);
  const ourDeltaT = (t.tt - t.ut) * 86400;
  const t2 = Astronomy.MakeTime(new Date(date.getTime() + 3600e3));
  const speedArcsecPerSec = arcsec(Astronomy.Ecliptic(Astronomy.GeoMoon(t2)).elon, Astronomy.Ecliptic(Astronomy.GeoMoon(t)).elon) / 3600;
  const raw = arcsec(ours, r.moonApparentTropical);
  return { year: date.getUTCFullYear(), raw, deltaTMatched: raw - (ourDeltaT - r.deltaTSec) * speedArcsecPerSec };
});

describe('Moon vs Swiss Ephemeris (apparent tropical longitude), 1950–2050', () => {
  it('has 51 reference instants', () => expect(rows).toHaveLength(51));

  it('1950–2025: within 3″ of Swiss', () => {
    for (const r of rows.filter(r => r.year <= 2025)) expect(Math.abs(r.raw), `${r.year}`).toBeLessThanOrEqual(3);
  });

  it('1950–2050: within 4″ once the ΔT-model difference is removed (lunar theory itself is fine)', () => {
    for (const r of rows) expect(Math.abs(r.deltaTMatched), `${r.year}`).toBeLessThanOrEqual(4);
  });

  it('2026–2050: raw drift stays under 12″ and is ahead of Swiss (ΔT forecast), never behind', () => {
    for (const r of rows.filter(r => r.year > 2025)) {
      expect(Math.abs(r.raw), `${r.year}`).toBeLessThanOrEqual(12);
      expect(r.raw, `${r.year}`).toBeGreaterThan(-3);
    }
  });
});
