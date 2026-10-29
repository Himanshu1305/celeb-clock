/**
 * Batch 10 — engine side of the monthly Panchang calendar: compact month data for a place
 * (./panchangMonthTemplate.ts turns it into the page). Used by the build precompute (data
 * kind 'panchang-month', New Delhi, one file per month) and by the browser for any other
 * month or place.
 */
import { dayLimbsLite, panchangCityBySlug } from '../../vedic/panchangDay';
import { computeFestivalCalendar, type FestivalCalendar } from '../../vedic/festivals';
import type { DailyEntry } from '../types';
import { renderPanchangMonth, type PanchangMonthData } from './panchangMonthTemplate';

export interface MonthPlace { name: string; lat: number; lon: number; tz: number }

const festCache = new Map<number, FestivalCalendar>();
function festivalsOf(year: number): FestivalCalendar {
  let c = festCache.get(year);
  if (!c) { c = computeFestivalCalendar(year); if (festCache.size > 4) festCache.clear(); festCache.set(year, c); }
  return c;
}

/**
 * Month data for a place. `tzFor(dateISO)` gives the UTC offset for each day (DST-aware
 * places); defaults to the place's fixed offset.
 */
export function computePanchangMonthData(place: MonthPlace, month: string, tzFor?: (date: string) => number): PanchangMonthData {
  const [y, m] = month.split('-').map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const d: number[][] = [];
  for (let day = 1; day <= days; day++) {
    const iso = `${month}-${String(day).padStart(2, '0')}`;
    const x = dayLimbsLite(new Date(Date.UTC(y, m - 1, day, 12)), place.lat, place.lon, tzFor ? tzFor(iso) : place.tz);
    d.push([x.rise, x.set, x.tithi, x.tithiEnd, x.nak, x.nakEnd]);
  }
  const f = festivalsOf(y).festivals
    .filter(x => x.dateISO.startsWith(month))
    .map(x => [Number(x.dateISO.slice(8, 10)), x.name, x.type] as [number, string, string]);
  return { m: month, d, f };
}

/** Data computer for the registered data kind 'panchang-month' (data slug = city slug). */
export function computePanchangMonthDataForCity(date: string, citySlug: string): PanchangMonthData {
  const c = panchangCityBySlug(citySlug);
  if (!c) throw new Error(`panchang month: unknown city "${citySlug}"`);
  return computePanchangMonthData({ name: c.name, lat: c.lat, lon: c.lon, tz: c.tz }, date.slice(0, 7));
}

/** Browser: the entry for any place and month. */
export function buildPanchangMonthEntry(place: MonthPlace, month: string, today: string, opts: { india?: boolean; tzFor?: (date: string) => number } = {}): DailyEntry {
  const data = computePanchangMonthData(place, month, opts.tzFor);
  const inMonth = today.startsWith(month);
  return renderPanchangMonth(inMonth ? today : `${month}-01`, place, data, { today: inMonth, india: opts.india });
}
