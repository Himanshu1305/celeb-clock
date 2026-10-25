/**
 * W7 — engine side of the Panchang daily pages: compute the compact per-day DATA for a
 * place (./panchangTemplate.ts turns it into text). Used by the build precompute
 * (scripts/gen-daily.mts, data kind 'panchang-day', one file per city) and by the
 * browser for other dates and searched places.
 */
import type { DailyEntry } from '../types';
import { addDaysISO } from '../dates';
import { computeDayPanchang, dayWindowsLite, panchangCityBySlug, sunriseSunset, type DayPanchang, type TimeWindow } from '../../vedic/panchangDay';
import { PANCHANG_TABLES } from '../../vedic/panchang';
import type { PanchangPageKind } from '../../vedic/panchangText';
import { renderPanchangEntry, PANCHANG_INDEX_SLUG, type PanchangDayData } from './panchangTemplate';

export { PANCHANG_INDEX_SLUG };
export interface PanchangPlaceInput { name: string; lat: number; lon: number; tz: number; slug?: string }

const toMin = (s: string) => { const [h, m] = s.slice(0, 5).split(':').map(Number); return h * 60 + m; };
const endMin = (s: string) => toMin(s) + (s.includes('(next day)') ? 1440 : 0);
function winMin(w: TimeWindow): [number, number] {
  let a = toMin(w.start) + (w.startNextDay ? 1440 : 0);
  const b = toMin(w.end) + (w.endNextDay ? 1440 : 0);
  if (a > b) a -= 1440; // started before this midnight (e.g. a Varjyam that spans sunrise)
  return [a, b];
}
const flat = (ws: TimeWindow[]) => ws.flatMap(winMin);
/** Clock strings in time order → monotonic minutes (adding a day at each wrap). */
function monotonic(list: string[]): number[] {
  let add = 0, prev = -1;
  return list.map(s => { let m = toMin(s) + add; if (m < prev) { add += 1440; m += 1440; } prev = m; return m; });
}
const clockIST = (x: Date) => new Date(Math.round((x.getTime() + 5.5 * 3600e3) / 60000) * 60000).toISOString().slice(11, 16);

/** Encode one computed day (+ the 7-day window table and Delhi's sun) as compact data. */
export function encodePanchangDay(p: DayPanchang, week: number[], delhi: [number, number] | null): PanchangDayData {
  const d: PanchangDayData = {
    r: toMin(p.sunrise), s: toMin(p.sunset), dl: p.dayLengthMin,
    t: [(p.paksha === 'Shukla' ? 0 : 15) + p.tithi - 1, endMin(p.tithiEnd)],
    n: [p.nakshatraIndex, endMin(p.nakshatraEnd)],
    y: [PANCHANG_TABLES.YOGAS.indexOf(p.yoga), endMin(p.yogaEnd)],
    k: [p.karana, endMin(p.karanaEnd)],
    w: [...winMin(p.rahuKaal), ...winMin(p.gulikaKaal), ...winMin(p.yamaganda), ...winMin(p.abhijit), ...winMin(p.brahmaMuhurta)],
    du: flat(p.durMuhurtam), v: flat(p.varjyam), a: flat(p.amritKalam),
    c: monotonic([...p.dayChoghadiya.map(c => c.start), p.sunset, ...p.nightChoghadiya.slice(1).map(c => c.start), p.nightChoghadiya[7].end]),
    wk: week,
  };
  if (delhi) d.dz = delhi;
  return d;
}

const memo = new Map<string, PanchangDayData>();
/** Compact data for a place and India date (memoised: all page kinds share it). */
export function computePanchangDayData(place: PanchangPlaceInput, date: string): PanchangDayData {
  const key = `${place.lat},${place.lon},${place.tz},${place.slug ?? ''},${date}`;
  const hit = memo.get(key);
  if (hit) return hit;
  const p = computeDayPanchang(new Date(date + 'T12:00:00Z'), place.lat, place.lon, place.tz, place.name);
  const week = Array.from({ length: 7 }, (_, i) => {
    const x = dayWindowsLite(new Date(addDaysISO(date, i) + 'T12:00:00Z'), place.lat, place.lon, place.tz);
    return [x.rahuKaal, x.gulikaKaal, x.yamaganda].flatMap(w => [toMin(w.start), toMin(w.end)]);
  }).flat();
  let delhi: [number, number] | null = null;
  if (place.slug && place.slug !== 'delhi') {
    const dc = panchangCityBySlug('delhi')!;
    const r = sunriseSunset(new Date(date + 'T12:00:00Z'), dc.lat, dc.lon, 5.5);
    delhi = [toMin(clockIST(r.rise)), toMin(clockIST(r.set))];
  }
  const d = encodePanchangDay(p, week, delhi);
  if (memo.size > 400) memo.clear();
  memo.set(key, d);
  return d;
}

/** Data computer for the registered data kind 'panchang-day' (data slug = city slug). */
export function computePanchangDayDataForCity(date: string, citySlug: string): PanchangDayData {
  const c = panchangCityBySlug(citySlug);
  if (!c) throw new Error(`panchang daily: unknown city "${citySlug}"`);
  return computePanchangDayData({ name: c.name, lat: c.lat, lon: c.lon, tz: c.tz, slug: c.slug }, date);
}

/** Browser: the entry for any place and date (searched places, other dates). */
export function buildPanchangEntry(kind: PanchangPageKind, place: PanchangPlaceInput, date: string, index = false): DailyEntry {
  return renderPanchangEntry(kind, { name: place.name, slug: place.slug }, date, computePanchangDayData(place, date), index);
}
