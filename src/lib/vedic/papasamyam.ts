/**
 * B19 — Papasamyam (Papa Samyam / Dosha Samyam): the Kerala balance-of-malefics check
 * used in jathaka porutham alongside the ten poruthams.
 *
 * Convention (the one most Kerala matching software uses, disclosed on the page):
 *  - Malefics: Mars, Saturn, Sun, Rahu (Ketu is not counted).
 *  - A malefic counts when it sits in the 1st, 2nd, 4th, 7th, 8th or 12th sign
 *    counted from each of three references: Lagna, Moon, Venus.
 *  - Weight by reference: from Lagna 1 point, from the Moon ½, from Venus ¼.
 *  - Balance: the bride's total should not exceed the groom's (equal, or the groom
 *    higher, is "samyam" — balanced).
 * Sources (fetched 2026-11-23): roxyapi.com/blogs/porutham-vs-gun-milan-rajju-vedha-papasamyam
 * (same planets, houses, weights 1 / 0.5 / 0.25 and the one-way rule);
 * astrologyapi.com papasamyam_details (Sun, Mars, Saturn, Rahu from Ascendant, Moon,
 * Venus; Moon total = ½ and Venus total = ¼ of the raw units); astrologymag.com (same
 * planets and houses; girl higher = not recommended). Schools differ on finer weights
 * (per-house and dignity multipliers); those are NOT applied and the page says so.
 * Signs are whole-sign houses from the sidereal (Lahiri) positions.
 */
export const PAPA_PLANETS = ['Mars', 'Saturn', 'Sun', 'Rahu'] as const;
export type PapaPlanet = typeof PAPA_PLANETS[number];
export const PAPA_HOUSES = [1, 2, 4, 7, 8, 12] as const;
export const PAPA_REFS = ['lagna', 'moon', 'venus'] as const;
export type PapaRef = typeof PAPA_REFS[number];
export const PAPA_WEIGHT: Record<PapaRef, number> = { lagna: 1, moon: 0.5, venus: 0.25 };

export interface PapaChartInput {
  lagnaSign: number;  // 0 = Mesha
  moonSign: number;
  venusSign: number;
  signs: Record<PapaPlanet, number>;
}

export interface PapaHit { planet: PapaPlanet; ref: PapaRef; house: number; points: number }
export interface PapaPerson { total: number; byRef: Record<PapaRef, number>; hits: PapaHit[] }
export interface PapasamyamResult {
  bride: PapaPerson;
  groom: PapaPerson;
  /** bride ≤ groom */
  balanced: boolean;
  /** groom − bride (positive = groom carries more) */
  difference: number;
}

/** 1-based sign distance from `ref` to `sign` (same sign = 1). */
export const houseFrom = (ref: number, sign: number) => ((((sign - ref) % 12) + 12) % 12) + 1;

export function papaPoints(c: PapaChartInput): PapaPerson {
  const refSign: Record<PapaRef, number> = { lagna: c.lagnaSign, moon: c.moonSign, venus: c.venusSign };
  const hits: PapaHit[] = [];
  const byRef: Record<PapaRef, number> = { lagna: 0, moon: 0, venus: 0 };
  for (const ref of PAPA_REFS) {
    for (const planet of PAPA_PLANETS) {
      const house = houseFrom(refSign[ref], c.signs[planet]);
      if ((PAPA_HOUSES as readonly number[]).includes(house)) {
        const points = PAPA_WEIGHT[ref];
        hits.push({ planet, ref, house, points });
        byRef[ref] += points;
      }
    }
  }
  const total = byRef.lagna + byRef.moon + byRef.venus;
  return { total, byRef, hits };
}

export function calculatePapasamyam(bride: PapaChartInput, groom: PapaChartInput): PapasamyamResult {
  const b = papaPoints(bride), g = papaPoints(groom);
  return { bride: b, groom: g, balanced: b.total <= g.total, difference: g.total - b.total };
}

/** Build the input from a calculateBirthChart() result (sidereal planets + lagna). */
export function papaInputFromChart(chart: { lagna: { rashiIndex: number }; planets?: Array<{ name: string; longitude: number }> }): PapaChartInput {
  const sign = (n: string) => Math.floor(((((chart.planets || []).find(p => p.name === n)?.longitude ?? 0) % 360) + 360) % 360 / 30);
  return {
    lagnaSign: chart.lagna.rashiIndex,
    moonSign: sign('Moon'),
    venusSign: sign('Venus'),
    signs: { Mars: sign('Mars'), Saturn: sign('Saturn'), Sun: sign('Sun'), Rahu: sign('Rahu') },
  };
}
