/**
 * Audit K11 — Shadbala per BPHS ch. 27 (B.V. Raman's conventions where BPHS is terse).
 *
 * Reference sources (no invented numbers):
 *  [RAMAN]  B.V. Raman, "Graha and Bhava Balas" — worked example, 16 Oct 1918, 14:22:16 IST,
 *           13°N 77°35'E, Raman ayanamsa. Planet longitudes and every component value below
 *           are the book's figures as transcribed in PyJHora 4.8.7
 *           (jhora/tests/pvr_tests.py, shadbala_BVRamanBook_tests).
 *  [VPJAIN] V.P. Jain, "Shadbala & Bhavabala" — worked example, 13 Sep 1981, 01:30 IST,
 *           28°39'N 77°13'E, Lahiri (same PyJHora file, shadbala_VPJainBook_tests).
 *  [PYJHORA] PyJHora 4.8.7 (independent open-source implementation, AGPL — used only as an
 *           external reference, no code copied), run on the standard 10-person panel with
 *           Lahiri ayanamsa (script and full component comparison in the K11 fix report).
 *  [SWE]    Swiss Ephemeris (pyswisseph, engine-audit venv) sunrises: Delhi 14 Jan 1990 07:14:57 IST;
 *           13°N 77°35′E, 16 Oct 1918 06:09:49 IST.
 *
 * Tolerances (documented):
 *  - Sthana, Dig, Drik, Paksha, Nathonnata: ≤ 0.5 virupa vs the book (rounding / tables).
 *  - Ayana: ≤ 0.6 (Raman's kranti table is interpolated; we use the exact 24° sine form).
 *  - Chesta (Mars, Jupiter, Venus, Saturn): ≤ 1.2. Mercury: ≤ 4.5 — the books use Surya
 *    Siddhanta mean motions; we use modern mean elements (Meeus). The Mercury gap is a
 *    constant ~4.4 virupas in every chart compared (both books and all 10 panel charts).
 *  - Known convention difference: a planet in its Moolatrikona SIGN but outside the BPHS
 *    Moolatrikona DEGREES gets 30 (own sign) here, 45 in [VPJAIN]/[PYJHORA] → exactly 15.
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart, getVedicDay, digBala } from '../calculateBirthChart';
import {
  beneficMap, getPakshaBala, getAyanaBala, getNathonnataBala, getSunHourAngle,
  getTribhagaBala, getVaraBala, getHoraBala, getAbdaLord, getMasaLord,
} from '../engine/kalaBala';
import { getChestaBala } from '../engine/chestaBala';
import { getDrikBala } from '../engine/drikBala';
import { getUcchaBala, getSaptavargajaBalaPanchadha, getOjayugmaBala, getDrekkanaBala } from '../engine/sthanaBala';
import {
  getHoraSign, getDrekkanaSign, getSaptamsaSign, getNavamsaSign, getDwadasamsaSign,
  getTrimsamsaSign, RASHI_NAMES, getSiderealLongitude, getLahiriAyanamsa,
} from '../engine/vedicEngine';
import { REQUIRED_SHADBALA, shadbalaCategory, SHADBALA_COMPONENT_EXPLANATIONS } from '../strengthScale';

const SEVEN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
const REF = new Date('2026-10-17T00:00:00Z');

// [RAMAN] book longitudes (sidereal, Raman ayanamsa).
const RAMAN: Record<string, number> = {
  Sun: 180 + 53 / 60 + 55 / 3600, Moon: 311 + 17 / 60 + 19 / 3600, Mars: 229 + 30 / 60 + 34 / 3600,
  Mercury: 181 + 31 / 60 + 34 / 3600, Jupiter: 84 + 49 / 3600, Venus: 171 + 9 / 60 + 56 / 3600,
  Saturn: 124 + 22 / 60 + 41 / 3600,
};
// Raman ayanamsa = (year − 397) × 50.3333″ (Raman's definition) → 21.277° for Oct 1918.
const RAMAN_AYANAMSA = ((1918 + 289 / 365.25) - 397) * 50.3333 / 3600;
const RAMAN_UTC = new Date(Date.UTC(1918, 9, 16, 14, 22, 16) - 5.5 * 3600000);
const RAMAN_INPUT = { year: 1918, month: 10, day: 16, hour: 14, minute: 22, latitude: 13, longitude: 77 + 35 / 60, timezoneOffset: 5.5 };

function vargasOf(lons: Record<string, number>) {
  const v: Record<string, Record<string, number>> = {};
  for (const n of SEVEN) {
    const l = lons[n];
    v[n] = {
      rasi: Math.floor(l / 30), hora: getHoraSign(l).horaSignIndex, drekkana: getDrekkanaSign(l).drekkanaSignIndex,
      saptamsa: getSaptamsaSign(l).saptamsaSignIndex, navamsa: getNavamsaSign(l).navamsaSignIndex,
      dwadasamsa: getDwadasamsaSign(l).dwadasamsaSignIndex, trimsamsa: RASHI_NAMES.indexOf(getTrimsamsaSign(l).trimsamsaSign),
    };
  }
  return v;
}
const near = (actual: number, expected: number, tol: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);

describe('K11 Shadbala vs B.V. Raman worked example [RAMAN]', () => {
  const vargas = vargasOf(RAMAN);

  it('Sthana sub-components match the book', () => {
    const uccha = [3.0, 32.75, 37.06, 54.5, 56.33, 1.95, 34.08];
    const sapta = [90, 48.75, 90, 135, 71.25, 116.25, 97.5];
    const oja = [30, 15, 15, 30, 15, 30, 15];
    const drek = [15, 0, 0, 0, 0, 15, 0];
    SEVEN.forEach((n, i) => {
      near(getUcchaBala(n, RAMAN[n]), uccha[i], 0.75); // book rounds Saturn's arc
      near(getSaptavargajaBalaPanchadha(n, vargas, RAMAN[n]), sapta[i], 0.01);
      expect(getOjayugmaBala(n, vargas[n].rasi, vargas[n].navamsa)).toBe(oja[i]);
      expect(getDrekkanaBala(n, RAMAN[n] % 30)).toBe(drek[i]);
    });
  });

  it('Drik Bala = ¼(benefic − malefic) with special-aspect additions matches the book', () => {
    const drik = [15.86, -21.73, 0.95, 15.64, -16.04, 18.47, 7.21];
    SEVEN.forEach((n, i) => near(getDrikBala(n, RAMAN[n], RAMAN), drik[i], 0.05));
  });

  it('Paksha and Ayana Bala match the book (book doubles the Moon/Sun in Kala; we put that in Chesta)', () => {
    const ben = beneficMap(RAMAN);
    expect(ben.Mercury).toBe(false); // Mercury conjunct the Sun → malefic, as in the book
    const paksha = [16.54, 86.92 / 2, 16.54, 16.54, 43.46, 43.46, 16.54];
    SEVEN.forEach((n, i) => near(getPakshaBala(RAMAN.Moon, RAMAN.Sun, n === 'Moon' ? true : ben[n]), paksha[i], 0.05));
    const ayana = [38.12 / 2, 43.44, 1.84, 41.25, 59.4, 23.75, 13.75];
    SEVEN.forEach((n, i) => near(getAyanaBala(n, (RAMAN[n] + RAMAN_AYANAMSA) % 360), ayana[i], 0.6));
  });

  it('time-based parts use the real sunrise (Nathonnata, Tribhaga, Vara, Hora, Abda, Masa)', () => {
    const day = getVedicDay(RAMAN_UTC, RAMAN_INPUT);
    // [SWE] sunrise that day 06:09:49 IST.
    near((day.sunriseUTC.getTime() - Date.UTC(1918, 9, 16, 0, 39, 49)) / 60000, 0, 2);
    const ha = getSunHourAngle(RAMAN_UTC, 13, 77 + 35 / 60);
    const nath = [48.32, 11.68, 11.68, 60, 48.32, 48.32, 11.68];
    SEVEN.forEach((n, i) => near(getNathonnataBala(ha, n), nath[i], 0.5));
    const tri = [0, 0, 0, 0, 60, 0, 60];
    SEVEN.forEach((n, i) => expect(getTribhagaBala(n, RAMAN_UTC, day)).toBe(tri[i]));
    SEVEN.forEach(n => expect(getVaraBala(n, day)).toBe(n === 'Mercury' ? 45 : 0)); // Wednesday
    SEVEN.forEach(n => expect(getHoraBala(n, RAMAN_UTC, day)).toBe(n === 'Moon' ? 60 : 0));
    expect(getAbdaLord(1918, 10, 16)).toBe('Saturn');
    expect(getMasaLord(1918, 10, 16)).toBe('Mercury');
  });

  it('Chesta Kendra method is within the documented tolerance', () => {
    const exp: Record<string, [number, number]> = {
      Mars: [22.23, 1.2], Mercury: [2.3, 4.5], Jupiter: [35.26, 1.2], Venus: [5.95, 1.2], Saturn: [21.14, 1.2],
    };
    for (const [n, [v, tol]] of Object.entries(exp)) {
      const trop = (getSiderealLongitude(n, RAMAN_UTC) + getLahiriAyanamsa(RAMAN_UTC)) % 360;
      near(getChestaBala(n, trop, RAMAN_UTC)!, v, tol);
    }
  });
});

describe('K11 Shadbala vs V.P. Jain worked example [VPJAIN] (full engine, Lahiri)', () => {
  it('matches the book component by component', async () => {
    const c = await calculateBirthChart(
      { year: 1981, month: 9, day: 13, hour: 1, minute: 30, latitude: 28 + 39 / 60, longitude: 77 + 13 / 60, timezoneOffset: 5.5 },
      { refDate: REF, includeShadbala: true },
    );
    const sb = c.shadbala!;
    const book = {
      sthana: [172.04, 77.17, 184.94, 238.16, 152.98, 198.08, 206.31],
      dig: [6.59, 12.22, 20.99, 31.97, 31.99, 53.29, 26.67],
      // The book's Kala includes the Sun's doubled Ayana and the Moon's doubled Paksha with
      // Chesta 0 for both; BPHS 27.18 puts that half in Chesta — so compare Kala + Chesta.
      kalaPlusChesta: [81.80, 205.85, 158.08 + 20.93, 210.68 + 28.76, 144.22 + 8.43, 135.89 + 28.18, 139.56 + 5.05],
      drik: [11.24, -0.32, -5.10, 4.29, 4.32, -2.86, 5.82],
    };
    SEVEN.forEach((n, i) => {
      // Sun (Leo 26°) and Mercury (Virgo 20.5°) are in their Moolatrikona SIGN but outside
      // the BPHS Moolatrikona degrees → 30 not 45 here (documented convention, exactly 15).
      const mtGap = n === 'Sun' || n === 'Mercury' ? 15 : 0;
      near(sb[n].sthana, book.sthana[i] - mtGap, 0.1);
      near(sb[n].dig, book.dig[i], 0.1);
      near(sb[n].drik, book.drik[i], 0.05);
      near(sb[n].kala + sb[n].chesta, book.kalaPlusChesta[i], n === 'Mercury' ? 4.6 : 1.3);
    });
  });
});

// [PYJHORA] Sthana, Dig and Drik for the 10-person panel (Lahiri). PyJHora's Dig Bala does
// not fold arcs > 180°; its values were folded (120 − x) where they exceeded 60.
const PYJHORA: Record<string, number[][]> = {
  P1: [[252.92, 54.83, 12.68], [191.76, 53.45, 13.49], [95.52, 40.10, -4.84], [247.37, 36.41, -10.96], [196.37, 51.90, -15.52], [213.09, 20.30, -4.83], [132.64, 37.45, 13.69]],
  P2: [[154.90, 53.62, -2.42], [127.16, 9.26, 2.88], [242.10, 35.42, 2.77], [250.39, 37.92, -3.88], [276.38, 30.51, -11.00], [234.67, 8.18, 2.12], [122.61, 34.87, -3.73]],
  P3: [[118.85, 31.28, 7.44], [152.49, 15.57, -13.79], [226.79, 42.95, -2.18], [190.26, 59.87, 6.46], [210.95, 2.88, -36.42], [172.16, 30.83, 7.44], [171.94, 1.73, 7.15]],
  P4: [[234.40, 4.69, 1.87], [177.97, 43.72, 5.74], [180.67, 4.42, 1.26], [138.60, 18.66, 4.66], [91.33, 38.23, -43.55], [184.12, 50.63, 3.75], [214.89, 49.23, -16.99]],
  P5: [[185.24, 53.87, 0.22], [70.80, 35.36, -10.08], [315.76, 36.23, 6.85], [250.74, 28.42, -1.82], [215.99, 50.22, -12.34], [171.82, 6.41, 0.32], [155.97, 44.00, 21.89]],
  P6: [[139.75, 36.05, 4.12], [206.96, 58.67, -10.16], [173.40, 13.20, -1.95], [146.29, 54.31, 9.09], [187.37, 6.60, -17.89], [121.82, 22.31, 1.04], [130.52, 42.79, -7.64]],
  P7: [[240.84, 42.04, 0.00], [201.62, 8.58, 0.00], [123.42, 51.07, 0.00], [140.36, 18.22, 0.00], [227.30, 29.34, -2.85], [189.24, 8.20, 0.00], [147.31, 40.04, 0.00]],
  P8: [[118.31, 18.60, 1.84], [265.12, 0.91, 0.87], [114.97, 40.62, -6.85], [179.73, 14.69, 5.71], [225.69, 33.36, -8.20], [165.80, 56.36, -2.99], [268.04, 56.78, 8.24]],
  P9: [[226.20, 26.17, -5.24], [247.74, 10.20, -15.19], [137.60, 53.28, -14.14], [156.03, 9.56, -7.38], [209.78, 13.36, -7.55], [257.77, 24.73, -14.66], [147.84, 30.46, -11.78]],
  P10: [[157.79, 43.30, -0.01], [201.58, 15.65, 0.00], [276.78, 53.32, 2.87], [168.07, 47.38, -0.98], [237.09, 58.30, -21.93], [156.60, 9.29, 1.89], [189.80, 18.94, 0.24]],
};
const PANEL: Record<string, [number, number, number, number, number, number, number, number]> = {
  P1: [1996, 8, 31, 13, 4, 26.8467, 80.9462, 5.5], P2: [1999, 12, 3, 11, 3, 42.6389, -83.2910, -5],
  P3: [1990, 1, 15, 6, 30, 28.6139, 77.2090, 5.5], P4: [1985, 7, 20, 23, 45, 19.0760, 72.8777, 5.5],
  P5: [1992, 6, 10, 14, 20, 51.5074, -0.1278, 1], P6: [2001, 12, 25, 8, 0, -33.8688, 151.2093, 11],
  P7: [2002, 5, 14, 16, 45, 40.5187, -74.4121, -4], P8: [1995, 2, 10, 21, 40, -37.8136, 144.9631, 11],
  P9: [1978, 5, 13, 19, 30, 32.7266, 74.8570, 5.5], P10: [2024, 3, 10, 9, 15, 12.9716, 77.5946, 5.5],
};
const chartOf = (id: string) => {
  const [year, month, day, hour, minute, latitude, longitude, timezoneOffset] = PANEL[id];
  return calculateBirthChart({ year, month, day, hour, minute, latitude, longitude, timezoneOffset }, { refDate: REF, includeShadbala: true });
};

describe('K11 Shadbala vs PyJHora on the 10-person panel [PYJHORA]', () => {
  it('Sthana, Dig and Drik agree for all 70 planets', async () => {
    for (const id of Object.keys(PANEL)) {
      const sb = (await chartOf(id)).shadbala!;
      SEVEN.forEach((n, i) => {
        const [st, dg, dk] = PYJHORA[id][i];
        // P1 Mercury (Virgo, outside 16–20°) and Jupiter (Sagittarius, past 10°): the
        // Moolatrikona-degrees convention (see header) → exactly 15 lower here.
        const mtGap = id === 'P1' && (n === 'Mercury' || n === 'Jupiter') ? 15 : 0;
        near(sb[n].sthana, st - mtGap, 0.1);
        near(sb[n].dig, dg, 0.1);
        near(sb[n].drik, dk, 0.05);
      });
    }
  }, 30000);
});

describe('K11 real sunrise, and the audit P3 example', () => {
  it('P3 (Delhi 15 Jan 1990, 06:30) is born before sunrise → previous Vedic day (Sunday)', async () => {
    const [year, month, day, hour, minute, latitude, longitude, timezoneOffset] = PANEL.P3;
    const input = { year, month, day, hour, minute, latitude, longitude, timezoneOffset };
    const utc = new Date(Date.UTC(1990, 0, 15, 1, 0));
    const d = getVedicDay(utc, input);
    // [SWE] the Vedic day began at the 14 Jan 1990 Delhi sunrise, 07:14:57 IST.
    near((d.sunriseUTC.getTime() - Date.UTC(1990, 0, 14, 1, 44, 57)) / 60000, 0, 2);
    expect(d.weekday).toBe(0); // Sunday
    expect(getVaraBala('Sun', d)).toBe(45);
    expect(getVaraBala('Moon', d)).toBe(0); // the old fixed-06:00 code gave Monday → Moon 45
    expect(getHoraBala('Moon', utc, d)).toBe(0); // old code: first hora of Monday → Moon 60
    expect(getTribhagaBala('Mars', utc, d)).toBe(60); // last third of the night
  });

  it('P3 Moon is no longer "strong" (audit: 421 strong → should be moderate)', async () => {
    const sb = (await chartOf('P3')).shadbala!;
    expect(shadbalaCategory('Moon', sb.Moon.total)).toBe('moderate');
    expect(sb.Moon.total).toBeLessThan(REQUIRED_SHADBALA.Moon * 1.25);
  });

  it('every component stays in its classical range on the panel', async () => {
    for (const id of Object.keys(PANEL)) {
      const sb = (await chartOf(id)).shadbala!;
      for (const n of SEVEN) {
        expect(sb[n].dig).toBeGreaterThanOrEqual(0); expect(sb[n].dig).toBeLessThanOrEqual(60);
        expect(sb[n].chesta).toBeGreaterThanOrEqual(0); expect(sb[n].chesta).toBeLessThanOrEqual(60);
        expect(Math.abs(sb[n].drik)).toBeLessThanOrEqual(60);
      }
    }
  }, 30000);

  it('Dig Bala uses real angles: 60 at the strongest point, 0 at the powerless point', () => {
    expect(digBala('Sun', 100, 10, 100)).toBeCloseTo(60);   // Sun on the MC
    expect(digBala('Sun', 280, 10, 100)).toBeCloseTo(0);    // Sun on the IC
    expect(digBala('Saturn', 190, 10, 100)).toBeCloseTo(60); // Saturn on the Descendant
    expect(digBala('Jupiter', 55, 10, 100)).toBeCloseTo(45); // 135° from the Descendant
  });
});

describe('K11 strength scale', () => {
  it('uses the BPHS 27.34–36 minimums (Sun 6.5 rupas)', () => {
    expect(REQUIRED_SHADBALA).toEqual({ Sun: 390, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 390, Venus: 330, Saturn: 300 });
  });
  it('has a one-line plain explanation for each of the six parts', () => {
    expect(SHADBALA_COMPONENT_EXPLANATIONS.map(c => c.key)).toEqual(['sthana', 'dig', 'kala', 'chesta', 'naisargika', 'drik']);
    for (const c of SHADBALA_COMPONENT_EXPLANATIONS) {
      expect(c.line.length).toBeLessThan(170);
      expect(c.line).not.toMatch(/\n/);
    }
  });
});
