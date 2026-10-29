/**
 * Ashtakavarga (Batch 10) — Bhinnashtakavarga (BAV) for the seven planets and the
 * Sarvashtakavarga (SAV), from the sign each contributor occupies.
 *
 * Rule: for a planet's BAV, each of the 8 contributors (Sun … Saturn and the Lagna) gives one
 * benefic point (bindu) to the signs counted 1–12 from its own sign listed in the table below.
 * SAV per sign = sum of the 7 planets' BAV in that sign (the Lagna contributes to every BAV but
 * has no BAV of its own in the SAV). Totals are fixed: Sun 48, Moon 49, Mars 39, Mercury 54,
 * Jupiter 56, Venus 52, Saturn 39 → SAV 337, whatever the chart.
 *
 * Table source — Brihat Parashara Hora Shastra ch. 66 (Ashtakavarga), as tabulated on the pages
 * opened 29 Oct 2026:
 *   tempora.ltd/findings/{sun,moon,mars,mercury,jupiter,venus,saturn}-ashtakavarga
 *     (BPHS 66.16–23 Sun, 66.24–31 Moon, 66.32–39 Mars, 66.40–47 Mercury, 66.48–55 Jupiter,
 *      66.56–63 Venus, 66.64–71 Saturn)
 *   astrobix.com/learn/361-rules-of-ashtakavarga-for-auspicious-planet-bindus-part-2.html
 *     (independent listing; agrees on the Moon's table incl. Moon 1,3,6,7,10,11 and Mars 2,3,5,6,9,10,11).
 * Known variant ("Parashara–Varahamihira discrepancy", PyJHora const.py p_v_* switches, on by default in
 * JHora/PyJHora and used in P.V.R. Narasimha Rao's "Vedic Astrology: An Integrated Approach" ch. 12):
 * Moon's points from the Moon 1,3,6,7,9,10,11, from Mars 2,3,5,6,10,11, from Jupiter 1,2,4,7,8,10,11,
 * and Venus's points from Mars 3,4,6,9,11,12. Totals are unchanged (49 and 52), so only the Moon's and
 * Venus's rows can differ from JHora's default. We follow the BPHS listing above (= PyJHora with those
 * switches off); the tests prove the same code reproduces the book's published tables exactly when
 * given the variant (see __tests__/ashtakavarga.test.ts).
 */

export const AV_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type AvPlanet = typeof AV_PLANETS[number];
export const AV_CONTRIBUTORS = [...AV_PLANETS, 'Lagna'] as const;
export type AvContributor = typeof AV_CONTRIBUTORS[number];

export type AvTable = Record<AvPlanet, Record<AvContributor, readonly number[]>>;

export const BPHS_ASHTAKAVARGA: AvTable = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11], Moon: [3, 6, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12], Jupiter: [5, 6, 9, 11], Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11], Jupiter: [1, 4, 7, 8, 10, 11, 12], Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11], Lagna: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11], Moon: [3, 6, 11], Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11], Jupiter: [6, 10, 11, 12], Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11], Lagna: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12], Moon: [2, 4, 6, 8, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12], Jupiter: [6, 8, 11, 12], Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11], Moon: [2, 5, 7, 9, 11], Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11], Jupiter: [1, 2, 3, 4, 7, 8, 10, 11], Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12], Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12], Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11], Jupiter: [5, 8, 9, 10, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11], Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11], Moon: [3, 6, 11], Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12], Jupiter: [5, 6, 11, 12], Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11], Lagna: [1, 3, 4, 6, 10, 11],
  },
};

/** Fixed BAV totals (BPHS); every chart must reproduce them. */
export const BAV_TOTALS: Record<AvPlanet, number> = { Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39 };
export const SAV_TOTAL = 337;

export interface AshtakavargaResult {
  /** BAV per planet, indexed by SIGN (0 = Mesha/Aries … 11 = Meena/Pisces). */
  bav: Record<AvPlanet, number[]>;
  /** SAV per sign (0 = Aries … 11 = Pisces). */
  sav: number[];
  /** 0-based Lagna sign, so a UI can read any sign as a house (house = sign − Lagna + 1). */
  lagnaSignIndex: number;
}

/**
 * @param signs 0-based sidereal sign (0 = Aries) of Sun … Saturn and the Lagna.
 */
export function computeAshtakavarga(signs: Record<AvContributor, number>, table: AvTable = BPHS_ASHTAKAVARGA): AshtakavargaResult {
  const bav = {} as Record<AvPlanet, number[]>;
  const sav = new Array(12).fill(0);
  for (const planet of AV_PLANETS) {
    const row = new Array(12).fill(0);
    for (const c of AV_CONTRIBUTORS) {
      const from = signs[c];
      for (const h of table[planet][c]) row[(from + h - 1) % 12] += 1;
    }
    bav[planet] = row;
    for (let s = 0; s < 12; s++) sav[s] += row[s];
  }
  return { bav, sav, lagnaSignIndex: signs.Lagna };
}

/** Value for house h (1–12, counted from the Lagna) out of a per-sign array. */
export function byHouse(perSign: number[], lagnaSignIndex: number, house: number): number {
  return perSign[(lagnaSignIndex + house - 1) % 12];
}
