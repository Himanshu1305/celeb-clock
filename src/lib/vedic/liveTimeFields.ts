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
import { calculateBirthChart, type BirthChartInput, type BirthChartResult } from './calculateBirthChart';

export interface LiveTimeFields {
  dasha: any;
  sadeSati: { active: boolean; phase: string | null; houseOfSaturnFromMoon: number };
  /** Natal, but recomputed here so cached charts saved before batch 8 also carry it. */
  birthTimeEdges: BirthChartResult['birthTimeEdges'];
  /** Batch 10 — natal, recomputed here so charts cached before batch 10 carry them too. */
  yoginiDasha: BirthChartResult['yoginiDasha'] | null;
  ashtakavarga: BirthChartResult['ashtakavarga'] | null;
}

export async function computeLiveTimeFields(input: BirthChartInput, now: Date = new Date()): Promise<LiveTimeFields | null> {
  try {
    const r = await calculateBirthChart(input, { refDate: now });
    return { dasha: r.currentDasha, sadeSati: r.doshas.sadeSati, birthTimeEdges: r.birthTimeEdges ?? [], yoginiDasha: r.yoginiDasha ?? null, ashtakavarga: r.ashtakavarga ?? null };
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
    birthTimeEdges: live ? live.birthTimeEdges : (cached.birthTimeEdges ?? []),
    yoginiDasha: live ? live.yoginiDasha : (cached.yoginiDasha ?? null),
    ashtakavarga: live ? live.ashtakavarga : (cached.ashtakavarga ?? null),
    doshas: cached.doshas ? { ...cached.doshas, sadeSati: live ? live.sadeSati : null } : cached.doshas,
  };
}

/** /api/vedic-profile shape: replace `dasha` (only present when the birth time is known). */
export async function withLiveProfileFields<T extends Record<string, any>>(cached: T, input: BirthChartInput, hasBirthTime: boolean, now: Date = new Date()): Promise<T> {
  if (!hasBirthTime) return { ...cached, dasha: null };
  const live = await computeLiveTimeFields(input, now);
  return { ...cached, dasha: live ? live.dasha : null };
}
