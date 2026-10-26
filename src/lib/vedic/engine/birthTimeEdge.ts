/**
 * Batch 8 (bug 3): birth-time edge check for the Lagna and the Moon.
 *
 * Same approach as the divisional charts (engine/shodashvarga.ts): recompute the chart's
 * points at nearby birth times with the SAME engine path and see whether the sign changes.
 *  - Lagna (rising sign): checked minute by minute up to ±15 minutes. Within ±5 minutes
 *    → "close to the edge"; within ±15 minutes → a softer "fairly near" note.
 *  - Moon sign (Rashi) and birth star (Nakshatra): checked up to ±5 minutes only (the Moon
 *    moves about 0.5° an hour, so only a birth right at the edge is affected).
 * The minute found is the first whole minute (1-minute steps) at which the result differs.
 * This is a nicety: callers wrap it so it can never fail a chart.
 */
import { calculateLagna, getSiderealLongitude, NAKSHATRA_NAMES } from './vedicEngine';
import type { BirthTimeEdge } from '../birthTimeEdgeNote';

export type { BirthTimeEdge, EdgePoint } from '../birthTimeEdgeNote';
export { birthTimeEdgeNote } from '../birthTimeEdgeNote';

/** The names the Kundali page shows (legacy short Sanskrit) with the English sign. */
const SIGN_LABELS = [
  'Mesha (Aries)', 'Vrisha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

const MIN_MS = 60_000;
const NAK_SPAN = 360 / 27;
const norm = (x: number) => ((x % 360) + 360) % 360;
const signOf = (lon: number) => Math.floor(norm(lon) / 30);
const nakOf = (lon: number) => Math.floor(norm(lon) / NAK_SPAN) % 27;

/** Nearest whole-minute offset (1..maxMin, either side) where `idxAt` differs from `now`. */
function nearestChange(idxAt: (offsetMin: number) => number, now: number, maxMin: number): { minutes: number; idx: number } | null {
  for (let k = 1; k <= maxMin; k++) {
    const later = idxAt(k);
    if (later !== now) return { minutes: k, idx: later };
    const earlier = idxAt(-k);
    if (earlier !== now) return { minutes: -k, idx: earlier };
  }
  return null;
}

export function buildBirthTimeEdges(
  birthDateUTC: Date, latitude: number, longitude: number,
  lons: { Lagna: number; Moon: number },
): BirthTimeEdge[] {
  const t0 = birthDateUTC.getTime();
  const at = (k: number) => new Date(t0 + k * MIN_MS);
  const edges: BirthTimeEdge[] = [];

  // Lagna — quick exit when the sign is the same 15 minutes either side (the Ascendant
  // moves far less than a sign in 15 minutes, so it cannot leave and come back).
  const lagNow = signOf(lons.Lagna);
  const lagAt = (k: number) => signOf(calculateLagna(at(k), latitude, longitude).ascSidereal);
  if (lagAt(15) !== lagNow || lagAt(-15) !== lagNow) {
    const c = nearestChange(lagAt, lagNow, 15);
    if (c) edges.push({ point: 'Lagna', current: SIGN_LABELS[lagNow], alternative: SIGN_LABELS[c.idx], minutes: c.minutes, window: Math.abs(c.minutes) <= 5 ? 5 : 15 });
  }

  // Moon — ±5 minutes only.
  const moonAt = new Map<number, number>();
  const moonLon = (k: number) => {
    if (!moonAt.has(k)) moonAt.set(k, getSiderealLongitude('Moon', at(k)));
    return moonAt.get(k)!;
  };
  const rNow = signOf(lons.Moon);
  if (signOf(moonLon(5)) !== rNow || signOf(moonLon(-5)) !== rNow) {
    const c = nearestChange(k => signOf(moonLon(k)), rNow, 5);
    if (c) edges.push({ point: 'MoonRashi', current: SIGN_LABELS[rNow], alternative: SIGN_LABELS[c.idx], minutes: c.minutes, window: 5 });
  }
  const nNow = nakOf(lons.Moon);
  if (nakOf(moonLon(5)) !== nNow || nakOf(moonLon(-5)) !== nNow) {
    const c = nearestChange(k => nakOf(moonLon(k)), nNow, 5);
    if (c) edges.push({ point: 'MoonNakshatra', current: NAKSHATRA_NAMES[nNow], alternative: NAKSHATRA_NAMES[c.idx], minutes: c.minutes, window: 5 });
  }
  return edges;
}
