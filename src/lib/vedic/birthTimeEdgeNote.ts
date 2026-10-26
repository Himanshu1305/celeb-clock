/**
 * Batch 8 (bug 3): the birth-time edge type and its user-facing sentence. Kept free of
 * engine imports so pages can show the note without loading the ephemeris code.
 * Computed by src/lib/vedic/engine/birthTimeEdge.ts.
 */
export type EdgePoint = 'Lagna' | 'MoonRashi' | 'MoonNakshatra';

export interface BirthTimeEdge {
  point: EdgePoint;
  /** Name now (e.g. "Simha (Leo)" or "Magha"). */
  current: string;
  /** Name it would become. */
  alternative: string;
  /** Signed whole minutes from the given birth time to the first minute where it changes
   *  (negative = an earlier birth time). */
  minutes: number;
  /** 5 = within ±5 minutes; 15 = within ±15 minutes (Lagna only). */
  window: 5 | 15;
}

const whichWay = (m: number) => `${Math.abs(m)} minute${Math.abs(m) === 1 ? '' : 's'} ${m < 0 ? 'earlier' : 'later'}`;

/** Calm, plain sentence for one edge (founder wording for the ±5-minute case). */
export function birthTimeEdgeNote(e: BirthTimeEdge): string {
  if (e.point === 'Lagna' && e.window === 15) {
    return `Your rising sign (Lagna) is fairly near the edge between ${e.current} and ${e.alternative} — a birth time about ${whichWay(e.minutes)} would make it ${e.alternative}. If your birth time is only approximate, check your birth certificate time.`;
  }
  const what = e.point === 'Lagna' ? 'Your rising sign (Lagna)'
    : e.point === 'MoonRashi' ? 'Your Moon sign (Rashi)' : 'Your birth star (Nakshatra)';
  return `${what} is close to the edge between ${e.current} and ${e.alternative} — if your birth time is off by a few minutes, it could be ${e.alternative}. Check your birth certificate time. (It changes at a birth time about ${whichWay(e.minutes)}.)`;
}
