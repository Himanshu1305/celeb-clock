/**
 * Batch 10 — Bhava Chalit (house-based) chart, Sripati method.
 *
 * Convention used (stated on the page):
 *  - Bhava madhya (house middle) = Porphyry cusps: the Lagna is the middle of the 1st
 *    house, the MC the middle of the 10th, and each quarter between Lagna, IC, Descendant
 *    and MC is split into three equal parts. Source: Wikipedia "Bhāva" (opened 29 Oct 2026,
 *    https://en.wikipedia.org/wiki/Bh%C4%81va): "In the Sripathi system the 1st house cusp is
 *    the Lagna … The four quarters divided thus should be divided into three equal parts
 *    each", and the Bhava Sandhis are found by dividing the distance between cusps "into halves".
 *  - Bhava sandhi (junction) = the midpoint between two consecutive madhyas. A bhava runs
 *    from its own sandhi to the next one, so the madhya sits in its middle.
 *  - A planet's Chalit house is the bhava (sandhi-to-sandhi span) its longitude falls in.
 *    Reading rule (AstroSage blog, Punit Pandey, "Difference Between Lagna & Chalit Chart",
 *    https://itzhoroscope.astrosage.com/2008/03/diference-between-lagna-chalit-chart.html,
 *    opened 29 Oct 2026): a planet that changes house in the Chalit chart gives the results
 *    of the house it occupies in the Chalit chart.
 *  - AstroSage's own Chalit calculation page could not be opened (redirect loop), so we do
 *    NOT claim to match AstroSage's numbers; we state Sripati as the system used.
 *
 * Verified (src/lib/vedic/advanced/__tests__/bhavaChalit.test.ts) against Swiss Ephemeris
 * swe.houses_ex(…, 'O' Porphyry) and (…, 'S' Sripati = sandhis), sidereal Lahiri.
 */
import { getSiderealLongitude, normalize360 } from '../engine/vedicEngine';
import { PLANETS_9, arc, inArc, siderealAngles, type PlanetName } from './angles';

export interface ChalitBhava { house: number; madhya: number; start: number; end: number }
export interface ChalitPlanet {
  name: PlanetName;
  longitude: number;
  /** Whole-sign house in the Rashi (D1) chart, counted from the Lagna sign. */
  rashiHouse: number;
  /** House in the Bhava Chalit chart. */
  bhava: number;
  shifted: boolean;
  /** True when the Chalit house would differ if the birth time were 5 minutes earlier or later. */
  timeSensitive: boolean;
}
export interface BhavaChalit { system: 'Sripati'; lagnaSignIndex: number; bhavas: ChalitBhava[]; planets: ChalitPlanet[] }

/** Porphyry cusps (bhava madhya), index 0 = 1st house. */
export function sripatiMadhya(asc: number, mc: number): number[] {
  const ic = normalize360(mc + 180), dsc = normalize360(asc + 180);
  const quarters: Array<[number, number, number]> = [[0, asc, ic], [3, ic, dsc], [6, dsc, mc], [9, mc, asc]];
  const m = new Array<number>(12);
  for (const [i, a, b] of quarters) {
    const q = arc(a, b) / 3;
    m[i] = a; m[i + 1] = normalize360(a + q); m[i + 2] = normalize360(a + 2 * q);
  }
  return m;
}

/** Sandhi that STARTS each bhava: midpoint of the previous madhya and this one. */
export function sripatiSandhi(madhya: number[]): number[] {
  return madhya.map((m, i) => { const prev = madhya[(i + 11) % 12]; return normalize360(prev + arc(prev, m) / 2); });
}

function bhavaOf(lon: number, start: number[]): number {
  for (let i = 0; i < 12; i++) if (inArc(lon, start[i], start[(i + 1) % 12])) return i + 1;
  return 1;
}

function chalitAt(birthUTC: Date, lat: number, lon: number) {
  const { asc, mc } = siderealAngles(birthUTC, lat, lon);
  const madhya = sripatiMadhya(asc, mc);
  const start = sripatiSandhi(madhya);
  const pos = Object.fromEntries(PLANETS_9.map(p => [p, getSiderealLongitude(p, birthUTC)])) as Record<PlanetName, number>;
  return { asc, madhya, start, pos };
}

export function computeBhavaChalit(birthUTC: Date, latitude: number, longitude: number): BhavaChalit {
  const c = chalitAt(birthUTC, latitude, longitude);
  const lagnaSign = Math.floor(c.asc / 30);
  const FIVE_MIN = 5 * 60 * 1000;
  const early = chalitAt(new Date(birthUTC.getTime() - FIVE_MIN), latitude, longitude);
  const late = chalitAt(new Date(birthUTC.getTime() + FIVE_MIN), latitude, longitude);
  const planets: ChalitPlanet[] = PLANETS_9.map(name => {
    const L = c.pos[name];
    const rashiHouse = ((Math.floor(L / 30) - lagnaSign + 12) % 12) + 1;
    const bhava = bhavaOf(L, c.start);
    const timeSensitive = bhavaOf(early.pos[name], early.start) !== bhava || bhavaOf(late.pos[name], late.start) !== bhava;
    return { name, longitude: L, rashiHouse, bhava, shifted: bhava !== rashiHouse, timeSensitive };
  });
  const bhavas = c.madhya.map((m, i) => ({ house: i + 1, madhya: m, start: c.start[i], end: c.start[(i + 1) % 12] }));
  return { system: 'Sripati', lagnaSignIndex: lagnaSign, bhavas, planets };
}
