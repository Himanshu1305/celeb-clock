/**
 * Pure templates for the "data + render" daily kinds (see DailyPageDef.data in
 * ./registry.ts): (date, page slug, stored data) → DailyEntry. The Worker
 * (functions/daily.ts), the browser (./useDailyEntry.ts) and the build all call these, so
 * the injected HTML and the client DOM always carry the same text. They never run the
 * engine: the data was computed at build time (./compute.ts DAILY_DATA_COMPUTERS).
 */
import type { DailyEntry, DailyMonthFile } from './types';
import { dailyDataKey, type DailyPageDef } from './registry';
import { rashifalPeriodTemplate } from './kinds/rashifalPeriod';
import { rashifalFromSky, rashifalHiFromSky } from './kinds/rashifalDaily';
import { horoscopeFromSky } from './kinds/westernDaily';
import { panchangTemplate, renderPanchangHiEntry, type PanchangDayData } from './kinds/panchangTemplate';
import { vratTemplate } from './kinds/vratTemplate';

export type DailyTemplate = (dateIST: string, slug: string, data: unknown) => DailyEntry;

export const DAILY_TEMPLATES: Record<string, DailyTemplate> = {
  'rashifal': rashifalFromSky,
  'rashifal-hi': rashifalHiFromSky,
  'rashifal-week': rashifalPeriodTemplate('week'),
  'rashifal-month': rashifalPeriodTemplate('month'),
  'rashifal-year': rashifalPeriodTemplate('year'),
  'horoscope': horoscopeFromSky,
  'panchang': panchangTemplate('panchang'),
  'rahu-kaal': panchangTemplate('rahu-kaal'),
  'choghadiya': panchangTemplate('choghadiya'),
  'panchang-hi': (date, slug, data) => renderPanchangHiEntry(slug, date, data as PanchangDayData),
  'vrat': vratTemplate('en'),
  'vrat-hi': vratTemplate('hi'),
};

/** The page's entry for `date` from a loaded month file (either format), else null. */
export function entryFromMonthFile(def: DailyPageDef, slug: string, date: string, file: DailyMonthFile | null | undefined): DailyEntry | null {
  if (!file) return null;
  const done = file.days?.[date];
  if (done) return done;
  const data = file.data?.[dailyDataKey(def, date)];
  const tpl = DAILY_TEMPLATES[def.kind];
  return data !== undefined && tpl ? tpl(date, slug, data) : null;
}
