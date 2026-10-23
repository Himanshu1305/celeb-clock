/**
 * Kaal Sarp Dosha — full classification (full + 12 types + direction).
 *
 * Convention (founder decision, Oct 2026): Kaal Sarp is reported as PRESENT only
 * when it is FULL by degrees — all seven classical planets (Sun..Saturn) lie
 * strictly between Rahu and Ketu on one side of the nodal axis, by longitude.
 * "Partial" patterns (all seven inside by whole sign only, or six of seven by
 * degree) return present:false, isPartial:true so a page can show a soft,
 * clearly-labelled note — never "present".
 * Reference: Drik Panchang shows no Kaal Sarp for P3 (Delhi 1990-01-15 06:30).
 *
 * Type names are the standard 12, keyed by Rahu's whole-sign house from the Lagna:
 * 1 Anant, 2 Kulik, 3 Vasuki, 4 Shankhpal, 5 Padma, 6 Mahapadma, 7 Takshak,
 * 8 Karkotak, 9 Shankhachud, 10 Ghatak, 11 Vishdhar, 12 Sheshnag.
 * Direction: planets in the Ketu→Rahu arc = "Ascending", Rahu→Ketu arc = "Descending".
 */
import type { FullChart } from './vedicEngine';

function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }

export const KAAL_SARP_TYPES: Record<number, string> = {
  1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal', 5: 'Padma', 6: 'Mahapadma',
  7: 'Takshak', 8: 'Karkotak', 9: 'Shankhachud', 10: 'Ghatak', 11: 'Vishdhar', 12: 'Sheshnag',
};

export interface KaalSarpDetails {
  /** True ONLY for a full (degree-based) Kaal Sarp. */
  present: boolean;
  /** Near-pattern (not present): shown only as a soft note. */
  isPartial: boolean;
  type: string | null;
  direction: 'Ascending' | 'Descending' | null;
}

const CLASSICAL = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Pure core, by longitudes (sidereal degrees) and the Lagna's sign index. */
export function classifyKaalSarp(lons: Record<string, number>, rahuLon: number, lagnaSignIdx: number): KaalSarpDetails {
  const ketuLon = normalize360(rahuLon + 180);
  // Strictly inside the Rahu→Ketu half (0,180) measured forward from Rahu.
  const offs = CLASSICAL.map(n => normalize360(lons[n] - rahuLon));
  const inRahuArc = offs.filter(o => o > 0 && o < 180).length;
  const inKetuArc = offs.filter(o => o > 180 && o < 360).length;
  const rahuSign = Math.floor(normalize360(rahuLon) / 30);
  const ketuSign = Math.floor(ketuLon / 30);
  const type = KAAL_SARP_TYPES[((rahuSign - lagnaSignIdx + 12) % 12) + 1];

  if (inRahuArc === 7 || inKetuArc === 7) {
    return { present: true, isPartial: false, type, direction: inKetuArc === 7 ? 'Ascending' : 'Descending' };
  }
  // Near-patterns for the soft note: whole-sign containment (node signs inclusive) or 6 of 7 by degree.
  const signInArc = (sign: number, start: number, end: number) =>
    normalize360(sign * 30 - start * 30) / 30 <= normalize360(end * 30 - start * 30) / 30;
  const signs = CLASSICAL.map(n => Math.floor(normalize360(lons[n]) / 30));
  const wsRahu = signs.every(sg => signInArc(sg, rahuSign, ketuSign));
  const wsKetu = signs.every(sg => signInArc(sg, ketuSign, rahuSign));
  if (wsRahu || wsKetu || inRahuArc === 6 || inKetuArc === 6) {
    const ascending = wsKetu || inKetuArc === 6;
    return { present: false, isPartial: true, type, direction: ascending ? 'Ascending' : 'Descending' };
  }
  return { present: false, isPartial: false, type: null, direction: null };
}

export function getKaalSarpDetails(chart: FullChart): KaalSarpDetails {
  const lons: Record<string, number> = {};
  for (const n of CLASSICAL) lons[n] = chart.planets[n].siderealLongitude;
  return classifyKaalSarp(lons, chart.planets.Rahu.siderealLongitude, chart.lagna.rashiIndex);
}
