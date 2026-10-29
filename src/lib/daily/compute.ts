/**
 * kind → compute(dateIST, slug) for every daily page kind in ./registry.ts.
 * Heavy (pulls in the astronomy engine): imported by the build script
 * (scripts/gen-daily.mts) and lazily by the browser fallback only — never by the Worker.
 */
import type { DailyEntry } from './types';
import { computeRashifalDaily, computeRashifalDailyHi } from './kinds/rashifalDaily';
import { computeWesternDaily } from './kinds/westernDaily';
import { computePanchangDayDataForCity } from './kinds/panchangDaily';
import { vedicSky } from './kinds/vedicSky';
import { westernSky } from './kinds/westernDaily';
import { DAILY_PAGES } from './registry';
import { DAILY_TEMPLATES } from './templates';
import { rashifalSky, type RashifalPeriod } from '../vedic/rashifal';
import { computePanchangMonthDataForCity } from './kinds/panchangMonth';
import { computePlanetDayData, computeMoonDayData } from './kinds/skyDaily';
import { computeVratNextData } from '../vedic/vrats/next';

export type DailyComputer = (dateIST: string, slug: string) => DailyEntry;
export type DailyDataComputer = (dateIST: string, dataSlug: string) => unknown;

/**
 * "Data + render" kinds: data kind → compute(dateIST, data slug) → small JSON-safe data
 * (written to /daily/<data kind>/<data slug>/<month>.json by scripts/gen-daily.mts).
 * JSON round-trip so the build, the browser fallback and the tests all render exactly
 * what the Worker reads from the file.
 */
const viaJson = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
export const DAILY_DATA_COMPUTERS: Record<string, DailyDataComputer> = {
  'vedic-sky': date => viaJson(vedicSky(date)),
  'western-sky': date => viaJson(westernSky(date)),
  'panchang-day': (date, city) => viaJson(computePanchangDayDataForCity(date, city)),
  // Batch 8: the sky for the week (Mon–Sun) / month / year containing the India date;
  // the data slug is the period. 06:00 UTC = 11:30 IST, so the UTC date is the India date.
  'rashifal-period': (date, period) => viaJson(rashifalSky(period as RashifalPeriod, new Date(`${date}T06:00:00Z`))),
  // Batch 10: monthly Panchang calendar (data slug = city; any date in the month), planets
  // at 12:00 IST, Moon phase at 12:00 IST.
  'panchang-month': (date, city) => viaJson(computePanchangMonthDataForCity(date, city)),
  'planet-day': date => viaJson(computePlanetDayData(date)),
  'moon-day': date => viaJson(computeMoonDayData(date)),
  // Batch 10: next date + New Delhi timings of every vrat (one shared file for all vrat pages).
  'vrat-next': date => viaJson(computeVratNextData(date)),
};

/** Original "finished entry" computers (kept for kinds without a data variant). */
const LEGACY: Record<string, DailyComputer> = {
  'rashifal': computeRashifalDaily,
  'rashifal-hi': computeRashifalDailyHi,
  'horoscope': computeWesternDaily,
};

function viaTemplate(kind: string): DailyComputer | undefined {
  const def = DAILY_PAGES.find(d => d.kind === kind);
  const tpl = DAILY_TEMPLATES[kind];
  if (!def?.data || !tpl) return undefined;
  const data = DAILY_DATA_COMPUTERS[def.data.kind];
  if (!data) return undefined;
  return (date, slug) => tpl(date, slug, data(date, def.data!.slug(slug)));
}

/** kind → (dateIST, page slug) → entry, for every registered kind (data kinds go
 *  data → template, exactly like the Worker). */
export const DAILY_COMPUTERS: Record<string, DailyComputer> = Object.fromEntries(
  DAILY_PAGES.map(d => [d.kind, viaTemplate(d.kind) ?? LEGACY[d.kind]]).filter(([, f]) => !!f),
) as Record<string, DailyComputer>;

export function computeDaily(kind: string, dateIST: string, slug: string): DailyEntry {
  const fn = DAILY_COMPUTERS[kind];
  if (!fn) throw new Error(`no daily computer registered for kind "${kind}"`);
  return fn(dateIST, slug);
}
