/**
 * Ayanamsa convention regression (Oct 2026 fix).
 *
 * BornClock follows Drik Panchang's convention: mean Lahiri ayanamsa (no nutation
 * term) subtracted from apparent tropical longitudes, Rahu/Ketu = mean node.
 * Calibrated value: Swiss Ephemeris SIDM_LAHIRI MEAN ayanamsa + 24.4″.
 *
 * Reference sources:
 *  - Swiss Ephemeris: pyswisseph 2.10.03, swe.get_ayanamsa_ex_ut with/without
 *    FLG_NONUT, SIDM_LAHIRI (scratchpad engine-audit venv), run 23 Oct 2026.
 *  - Drik Panchang ingress moments fetched 23 Oct 2026 (New Delhi unless noted;
 *    the site sometimes serves another city — those are converted to UTC below):
 *    https://www.drikpanchang.com/planet/transit/rahu-transit-date-time.html?year=2023|2025|2026|2028
 *    https://www.drikpanchang.com/planet/transit/nakshatra/rahu-nakshatra-transit-date-time.html?year=2026
 *    https://www.drikpanchang.com/planet/transit/nakshatra/guru-nakshatra-transit-date-time.html?year=2025|2026
 *    https://www.drikpanchang.com/planet/transit/nakshatra/shani-nakshatra-transit-date-time.html?year=2025|2027
 *    https://www.drikpanchang.com/sankranti/sankranti.html?year=2026
 *    https://www.drikpanchang.com/sankranti/makar-sankranti-date-time.html?year=1980 (Lancaster CA, PST)
 *    https://www.drikpanchang.com/sankranti/karka-sankranti-date-time.html?year=2001 (Durazno UY, UTC-3)
 */
import { describe, it, expect } from 'vitest';
import { getLahiriAyanamsa, getSiderealLongitude, generateFullChart } from '../engine/vedicEngine';
import { dueTransitIngresses } from '../../../../api/_notify';
import { computeSankrantis } from '../festivals';

describe('Lahiri ayanamsa = Swiss Ephemeris SIDM_LAHIRI mean + 24.4″ (Drik convention)', () => {
  // [UTC instant, Swiss mean (FLG_NONUT), Swiss true] — pyswisseph 2.10.03.
  const SWISS: Array<[string, number, number]> = [
    ['1900-01-01T00:00:00Z', 22.460531, 22.465373],
    ['1950-01-01T00:00:00Z', 23.158725, 23.157808],
    ['1990-03-14T05:00:00Z', 23.720168, 23.723590],
    ['2000-01-01T12:00:00Z', 23.857092, 23.853222],
    ['2026-12-05T14:00:00Z', 24.233255, 24.235725],
    ['2050-01-01T00:00:00Z', 24.555613, 24.559827],
  ];
  for (const [iso, mean] of SWISS) {
    it(`${iso.slice(0, 10)}: within 0.2″ of Swiss mean + 24.4″`, () => {
      const diffArcsec = (getLahiriAyanamsa(new Date(iso)) - mean) * 3600;
      expect(Math.abs(diffArcsec - 24.4)).toBeLessThan(0.2);
    });
  }
  it('the old J2000 constant 23.853222° was Swiss TRUE Lahiri at J2000 used as a mean value', () => {
    // documents the root cause: 23.853222 is the nutation-included value at 2000-01-01 12:00 TT/UT
    expect(SWISS[3][2]).toBeCloseTo(23.853222, 6);
    expect(getLahiriAyanamsa(new Date(SWISS[3][0]))).toBeGreaterThan(23.86);
  });
});

/** Time (ms) the engine's sidereal longitude crosses `boundary`, searched ±3 days around `nearMs`. */
function crossing(planet: string, boundary: number, nearMs: number): number {
  const f = (ms: number) => ((getSiderealLongitude(planet, new Date(ms)) - boundary + 540) % 360) - 180;
  const step = 3600_000;
  let prevT = nearMs - 3 * 86400_000, prev = f(prevT);
  for (let t = prevT + step; t <= nearMs + 3 * 86400_000; t += step) {
    const v = f(t);
    if (Math.sign(v) !== Math.sign(prev) && Math.abs(v - prev) < 10) {
      let a = prevT, b = t, fa = prev;
      for (let i = 0; i < 40; i++) { const m = (a + b) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m; }
      return (a + b) / 2;
    }
    prev = v; prevT = t;
  }
  return NaN;
}

// [planet, boundary longitude, Drik moment in UTC, tolerance minutes]
// Tolerances: Sun/Rahu use astronomy-engine positions that agree with Swiss to <1″
// (Rahu is the analytic mean node) → a few minutes. Jupiter/Saturn carry
// astronomy-engine's own ephemeris error (Jupiter ~2″, Saturn ~9-10″ in 2025-27 vs
// Swiss), which at their slow speeds is up to ~12 min (Jupiter) / ~50 min (Saturn).
const DRIK_EVENTS: Array<[string, number, string, number, string]> = [
  ['Rahu', 300, '2026-12-05T13:58Z', 3, 'Rahu → Makara 5 Dec 2026 07:28 PM IST'],
  ['Rahu', 330, '2025-05-18T11:00Z', 3, 'Rahu → Kumbha 18 May 2025 04:30 PM IST'],
  ['Rahu', 0, '2023-10-30T08:03Z', 3, 'Rahu → Meena 30 Oct 2023 01:03 AM PDT (Lancaster CA)'],
  ['Rahu', 270, '2028-06-23T16:55Z', 3, 'Rahu → Dhanu 23 Jun 2028 10:25 PM IST'],
  ['Rahu', 306 + 2 / 3, '2026-08-01T18:38Z', 3, 'Rahu → Dhanishtha 2 Aug 2026 12:08 AM IST'],
  ['Sun', 270, '2026-01-14T09:43Z', 3, 'Makara Sankranti 14 Jan 2026 03:13 PM IST'],
  ['Sun', 0, '2026-04-14T04:08Z', 3, 'Mesha Sankranti 14 Apr 2026 09:38 AM IST'],
  ['Sun', 90, '2026-07-16T18:15Z', 3, 'Karka Sankranti 16 Jul 2026 11:45 PM IST'],
  ['Sun', 180, '2026-10-17T14:27Z', 3, 'Tula Sankranti 17 Oct 2026 07:57 PM IST'],
  ['Sun', 240, '2026-12-16T04:59Z', 3, 'Dhanu Sankranti 16 Dec 2026 10:29 AM IST'],
  ['Sun', 270, '1980-01-14T14:40Z', 3, 'Makara Sankranti 14 Jan 1980 06:40 AM PST (Lancaster CA)'],
  ['Sun', 90, '2001-07-16T08:44Z', 3, 'Karka Sankranti 15 Jul 2001 29:44 (Durazno UY, UTC-3)'],
  ['Jupiter', 120, '2026-10-31T07:20Z', 15, 'Jupiter → Magha/Simha 31 Oct 2026 12:50 PM IST'],
  ['Jupiter', 93 + 1 / 3, '2026-06-18T16:02Z', 15, 'Jupiter → Pushya 18 Jun 2026 09:32 PM IST'],
  ['Jupiter', 53 + 1 / 3, '2025-04-10T14:21Z', 15, 'Jupiter → Mrigashira 10 Apr 2025 09:21 AM CDT (Houston)'],
  ['Saturn', 333 + 1 / 3, '2025-04-28T02:22Z', 50, 'Saturn → Uttara Bhadrapada 28 Apr 2025 07:52 AM IST'],
  ['Saturn', 333 + 1 / 3, '2025-10-03T16:19Z', 50, 'Saturn (retro) → Purva Bhadrapada 3 Oct 2025 09:49 PM IST'],
  ['Saturn', 0, '2027-06-03T00:53Z', 50, 'Saturn → Ashwini/Mesha 3 Jun 2027 06:23 AM IST'],
  ['Saturn', 0, '2027-10-20T00:35Z', 50, 'Saturn (retro) → Revati/Meena 20 Oct 2027 06:05 AM IST'],
];

describe('ingress moments match Drik Panchang', () => {
  for (const [planet, boundary, utc, tolMin, label] of DRIK_EVENTS) {
    it(`${label} (±${tolMin} min)`, () => {
      const drik = Date.parse(utc);
      const at = crossing(planet, boundary, drik);
      expect(Number.isFinite(at)).toBe(true);
      expect(Math.abs(at - drik) / 60_000).toBeLessThanOrEqual(tolMin);
    });
  }
});

describe('Sankranti day: midnight (ardha-ratri) rule, as Drik Panchang lists it', () => {
  it('Mithuna Sankranti 2020 (moment 00:10 IST 15 Jun) is listed on 14 Jun', () => {
    // https://www.drikpanchang.com/sankranti/mithuna-sankranti-date-time.html?year=2020
    // "Mithuna Sankranti on Sunday, June 14, 2020" / "Sankranti Moment: 12:10 AM, Jun 15"
    expect(computeSankrantis(2020).find(s => s.sign === 2)!.dateISO).toBe('2020-06-14');
  });
  it('Meena Sankranti 2026 (moment 01:08 IST 15 Mar, after mid-night) stays on 15 Mar', () => {
    // https://www.drikpanchang.com/sankranti/meena-sankranti-date-time.html?year=2026
    expect(computeSankrantis(2026).find(s => s.sign === 11)!.dateISO).toBe('2026-03-15');
  });
  it('Mithuna Sankranti 2020 moment within 3 min of Drik (00:10 IST)', () => {
    const at = crossing('Sun', 60, Date.parse('2020-06-14T18:40Z'));
    expect(Math.abs(at - Date.parse('2020-06-14T18:40Z')) / 60_000).toBeLessThanOrEqual(3);
  });
});

describe('transit alert uses the corrected ingress', () => {
  it('Rahu/Ketu Dec 2026 alert reads "5 December 2026 at 7:28 pm IST" (Drik: 07:28 PM)', () => {
    const hits = dueTransitIngresses(new Date('2026-12-03T06:30:00Z'), 2);
    const rahu = hits.find(h => h.planet === 'Rahu')!;
    expect(rahu.istDate).toBe('2026-12-05');
    expect(rahu.label).toBe('5 December 2026 at 7:28 pm IST');
    expect(hits.find(h => h.planet === 'Ketu')!.atISO).toBe(rahu.atISO);
  });
});

describe('10-person panel: signs, Moon nakshatra and pada unchanged by the fix', () => {
  // Values from the engine before AND after the fix (identical), each confirmed against
  // Swiss Ephemeris (SIDM_LAHIRI, mean node, whole-sign) on 23 Oct 2026.
  // Planet order: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu (first 3 letters).
  const PANEL: Array<[string, string, number, number, string, string, number, string]> = [
    ['P1', '1996-08-31T07:34:00.000Z', 26.8467, 80.9462, 'Vrischika', 'Revati', 1, 'Sim Mee Kar Kan Dha Mit Mee Kan Mee'],
    ['P2', '1999-12-03T16:03:00.000Z', 42.6389, -83.291, 'Makara', 'Chitra', 3, 'Vri Tul Mak Tul Mes Tul Mes Kar Mak'],
    ['P3', '1990-01-15T01:00:00.000Z', 28.6139, 77.209, 'Dhanu', 'Purva Phalguni', 2, 'Mak Sim Vri Dha Mit Mak Dha Mak Kar'],
    ['P4', '1985-07-20T18:15:00.000Z', 19.076, 72.8777, 'Meena', 'Magha', 3, 'Kar Sim Kar Kar Mak Vri Tul Mes Tul'],
    ['P5', '1992-06-10T13:20:00.000Z', 51.5074, -0.1278, 'Kanya', 'Chitra', 3, 'Vri Tul Mes Mit Sim Vri Mak Dha Mit'],
    ['P6', '2001-12-24T21:00:00.000Z', -33.8688, 151.2093, 'Makara', 'Ashwini', 1, 'Dha Mes Kum Dha Mit Dha Vri Mit Dha'],
    ['P7', '2002-05-14T20:45:00.000Z', 40.5187, -74.4121, 'Kanya', 'Mrigashira', 2, 'Mes Vri Vri Vri Mit Vri Vri Vri Vri'],
    ['P8', '1995-02-10T10:40:00.000Z', -37.8136, 144.9631, 'Simha', 'Mrigashira', 2, 'Mak Vri Kar Mak Vri Dha Kum Tul Mes'],
    ['P9', '1978-05-13T14:00:00.000Z', 32.7266, 74.857, 'Vrischika', 'Pushya', 2, 'Mes Kar Kar Mes Mit Vri Sim Kan Mee'],
    ['P10', '2024-03-10T03:45:00.000Z', 12.9716, 77.5946, 'Mesha', 'Purva Bhadrapada', 1, 'Kum Kum Mak Mee Mes Kum Kum Mee Kan'],
  ];
  const ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  for (const [id, utc, lat, lon, lagna, nak, pada, signs] of PANEL) {
    it(id, () => {
      const c = generateFullChart(new Date(utc), new Date('2026-10-23T00:00:00Z'), lat, lon);
      expect(c.lagna.rashi).toBe(lagna);
      expect(c.planets.Moon.nakshatra).toBe(nak);
      expect(c.planets.Moon.pada).toBe(pada);
      expect(ORDER.map(p => c.planets[p].rashi.slice(0, 3)).join(' ')).toBe(signs);
    });
  }
});
