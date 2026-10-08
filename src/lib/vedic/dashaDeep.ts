/**
 * Deep Vimshottari Dasha subdivision (Backlog-1 Item F).
 *
 * Extends the timeline from 3 levels (Maha / Antar / Pratyantar) to 5 by adding
 * Sookshma (level 4) and Prana (level 5). Subdividing a Dasha period is PURE date
 * arithmetic — the Vimshottari proportions — once the parent period's start/end are
 * known. No ephemeris is needed, so this runs CLIENT-SIDE and ON DEMAND: deeper
 * levels are computed only for the period the user actually expands, never the whole
 * tree up front (five full levels over a lifetime is tens of thousands of periods).
 *
 * The lord sequence and year weights are the canonical Vimshottari values, identical
 * to the validated server engine (src/lib/vedic/engine/vedicEngine.ts). A unit test
 * cross-checks this module's Antardasha output against that engine for real charts,
 * so the two can never silently diverge. Defined here (not imported from the engine)
 * so the client bundle does not pull in astronomy-engine.
 */

export const VIMSHOTTARI_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'] as const;
export const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
export const VIMSHOTTARI_TOTAL = 120;

/** Human-readable level names, index 0 = Mahadasha … index 4 = Prana. */
export const DASHA_LEVEL_NAMES = ['Mahadasha', 'Antardasha', 'Pratyantardasha', 'Sookshma', 'Prana'] as const;
export type DashaLevel = 0 | 1 | 2 | 3 | 4;

export interface DashaSubPeriod {
  lord: string;
  start: string; // ISO
  end: string;   // ISO
}

/**
 * The nine sub-periods of a parent Dasha period.
 *
 * The sub-period sequence starts at the PARENT'S lord and proceeds through the
 * Vimshottari order; each child's share of the parent's duration is
 * `VIMSHOTTARI_YEARS[childLord] / 120`. To guarantee the children sum EXACTLY to
 * the parent (no floating-point drift), each child begins where the previous ended
 * and the final child is pinned to the parent's end.
 */
export function subPeriods(parentLord: string, startISO: string, endISO: string): DashaSubPeriod[] {
  const startMs = Date.parse(startISO);
  const endMs = Date.parse(endISO);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return [];
  const parentIdx = VIMSHOTTARI_LORDS.indexOf(parentLord as typeof VIMSHOTTARI_LORDS[number]);
  if (parentIdx < 0) return [];
  const totalMs = endMs - startMs;

  const out: DashaSubPeriod[] = [];
  let cursor = startMs;
  for (let i = 0; i < 9; i++) {
    const lord = VIMSHOTTARI_LORDS[(parentIdx + i) % 9];
    const share = VIMSHOTTARI_YEARS[lord] / VIMSHOTTARI_TOTAL;
    // Last child pinned to the parent end so the segments sum exactly.
    const next = i === 8 ? endMs : cursor + totalMs * share;
    out.push({ lord, start: new Date(cursor).toISOString(), end: new Date(next).toISOString() });
    cursor = next;
  }
  return out;
}

/** Duration of a period in days. */
export function periodDays(start: string, end: string): number {
  return (Date.parse(end) - Date.parse(start)) / 86_400_000;
}

/**
 * A compact, human label for how long a period lasts — used to warn that the deeper
 * levels are so short (days → hours) they are highly sensitive to birth-time accuracy.
 */
export function describeDuration(start: string, end: string): string {
  const days = periodDays(start, end);
  if (days >= 365) return `${(days / 365.25).toFixed(1)} years`;
  if (days >= 60) return `${(days / 30.44).toFixed(1)} months`;
  if (days >= 2) return `${days.toFixed(1)} days`;
  const hours = days * 24;
  return `${hours.toFixed(1)} hours`;
}
