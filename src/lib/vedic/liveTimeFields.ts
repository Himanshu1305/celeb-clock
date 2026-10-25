/**
 * Time-dependent ("current") chart fields, recomputed at request time.
 *
 * The natal chart (Lagna, planets, Nakshatra, timeline, doshas from birth) never
 * changes, so /api/kundali and /api/vedic-profile cache it. But the CURRENT
 * Mahadasha/Antardasha/Pratyantardasha and Sade Sati status depend on "now" —
 * serving them from the cache showed whatever was current on the day the chart was
 * first saved. These helpers overlay fresh values on a cached natal chart.
 *
 * They reuse the same validated engine path (calculateBirthChart with refDate), so
 * a cache hit returns exactly what a fresh computation at `now` would.
 */
import { calculateBirthChart, type BirthChartInput } from './calculateBirthChart';

export interface LiveTimeFields {
  dasha: any;
  sadeSati: { active: boolean; phase: string | null; houseOfSaturnFromMoon: number };
}

export async function computeLiveTimeFields(input: BirthChartInput, now: Date = new Date()): Promise<LiveTimeFields | null> {
  try {
    const r = await calculateBirthChart(input, { refDate: now });
    return { dasha: r.currentDasha, sadeSati: r.doshas.sadeSati };
  } catch {
    return null;
  }
}

/** /api/kundali shape: replace `dasha` and `doshas.sadeSati` with values for `now`. */
export async function withLiveKundaliFields<T extends Record<string, any>>(cached: T, input: BirthChartInput, now: Date = new Date()): Promise<T> {
  const live = await computeLiveTimeFields(input, now);
  // If the engine cannot recompute (should not happen — the natal chart was computed
  // by it), drop the stale "current" values rather than serve an out-of-date period.
  return {
    ...cached,
    dasha: live ? live.dasha : null,
    doshas: cached.doshas ? { ...cached.doshas, sadeSati: live ? live.sadeSati : null } : cached.doshas,
  };
}

/** /api/vedic-profile shape: replace `dasha` (only present when the birth time is known). */
export async function withLiveProfileFields<T extends Record<string, any>>(cached: T, input: BirthChartInput, hasBirthTime: boolean, now: Date = new Date()): Promise<T> {
  if (!hasBirthTime) return { ...cached, dasha: null };
  const live = await computeLiveTimeFields(input, now);
  return { ...cached, dasha: live ? live.dasha : null };
}
