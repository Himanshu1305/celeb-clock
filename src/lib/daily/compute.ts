/**
 * kind → compute(dateIST, slug) for every daily page kind in ./registry.ts.
 * Heavy (pulls in the astronomy engine): imported by the build script
 * (scripts/gen-daily.mts) and lazily by the browser fallback only — never by the Worker.
 */
import type { DailyEntry } from './types';
import { computeRashifalDaily, computeRashifalDailyHi } from './kinds/rashifalDaily';
import { computeWesternDaily } from './kinds/westernDaily';

export type DailyComputer = (dateIST: string, slug: string) => DailyEntry;

export const DAILY_COMPUTERS: Record<string, DailyComputer> = {
  'rashifal': computeRashifalDaily,
  'rashifal-hi': computeRashifalDailyHi,
  'horoscope': computeWesternDaily,
};

export function computeDaily(kind: string, dateIST: string, slug: string): DailyEntry {
  const fn = DAILY_COMPUTERS[kind];
  if (!fn) throw new Error(`no daily computer registered for kind "${kind}"`);
  return fn(dateIST, slug);
}
