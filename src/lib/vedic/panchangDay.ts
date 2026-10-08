/**
 * Daily Panchang for a city — Growth P1-2 (+ P1-PANCHANG-CHOGHADIYA).
 *
 * Builds on the validated engine: the five limbs come from computePanchang
 * (reusing getSiderealLongitude for Sun/Moon); this module adds the parts a
 * visitor expects on a Panchang page — real sunrise/sunset for the city (via
 * astronomy-engine), Rahu Kaal / Gulika / Yamaganda windows from actual
 * daylight, and the day + night Choghadiya. All computed at request time.
 */
import * as Astronomy from 'astronomy-engine';
import { computePanchang, type Panchang } from './panchang';
import { getSiderealLongitude } from './engine/vedicEngine';

export interface TimeWindow { name: string; start: string; end: string; quality: 'good' | 'neutral' | 'bad' }

export interface DayPanchang extends Panchang {
  city: string;
  sunrise: string;      // local HH:MM
  sunset: string;
  rahuKaal: TimeWindow;
  gulikaKaal: TimeWindow;
  yamaganda: TimeWindow;
  dayChoghadiya: TimeWindow[];
  nightChoghadiya: TimeWindow[];
}

const sunMoon = (d: Date) => ({ sun: getSiderealLongitude('Sun', d), moon: getSiderealLongitude('Moon', d) });

function fmtLocal(utc: Date, tzOffsetHours: number): string {
  const local = new Date(utc.getTime() + tzOffsetHours * 3600 * 1000);
  return `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
}

/** Real sunrise/sunset (UTC Date objects) for a date + location. */
export function sunriseSunset(date: Date, lat: number, lon: number, tzOffsetHours: number): { rise: Date; set: Date; nextRise: Date } {
  const observer = new Astronomy.Observer(lat, lon, 0);
  // Start searching from local midnight expressed in UTC.
  const localMidnightUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) - tzOffsetHours * 3600 * 1000);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, localMidnightUTC, 2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, rise ? rise.date : localMidnightUTC, 2);
  const nextRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, set ? set.date : localMidnightUTC, 2);
  // Fallbacks (polar day/night): approximate 06:00/18:00 local.
  const approxRise = new Date(localMidnightUTC.getTime() + 6 * 3600 * 1000);
  const approxSet = new Date(localMidnightUTC.getTime() + 18 * 3600 * 1000);
  const approxNext = new Date(localMidnightUTC.getTime() + 30 * 3600 * 1000);
  return {
    rise: rise ? rise.date : approxRise,
    set: set ? set.date : approxSet,
    nextRise: nextRise ? nextRise.date : approxNext,
  };
}

// Choghadiya 7-name cycle (planetary order) and the day-start index by weekday.
const CHOGH_CYCLE = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
const CHOGH_QUALITY: Record<string, 'good' | 'neutral' | 'bad'> = {
  Amrit: 'good', Shubh: 'good', Labh: 'good', Char: 'neutral', Udveg: 'bad', Kaal: 'bad', Rog: 'bad',
};
// weekday (0=Sun..6=Sat) → index into CHOGH_CYCLE for the first day choghadiya.
const DAY_START_IDX = [0, 3, 6, 2, 5, 1, 4];

// Inauspicious day-part (1-based, of 8) by weekday for each window.
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];

function windowFromPart(part: number, rise: Date, dayMs: number, tz: number, name: string, quality: 'good' | 'neutral' | 'bad'): TimeWindow {
  const seg = dayMs / 8;
  const start = new Date(rise.getTime() + (part - 1) * seg);
  const end = new Date(start.getTime() + seg);
  return { name, start: fmtLocal(start, tz), end: fmtLocal(end, tz), quality };
}

function choghadiyaSet(startIdx: number, from: Date, totalMs: number, tz: number): TimeWindow[] {
  const seg = totalMs / 8;
  const out: TimeWindow[] = [];
  for (let i = 0; i < 8; i++) {
    const name = CHOGH_CYCLE[(startIdx + i) % 7];
    const start = new Date(from.getTime() + i * seg);
    const end = new Date(start.getTime() + seg);
    out.push({ name, start: fmtLocal(start, tz), end: fmtLocal(end, tz), quality: CHOGH_QUALITY[name] });
  }
  return out;
}

/** Full daily Panchang for a city. `date` is the local calendar day (any time). */
export function computeDayPanchang(date: Date, lat: number, lon: number, tzOffsetHours: number, city: string): DayPanchang {
  // Evaluate the five limbs at local sunrise (the classical convention).
  const { rise, set, nextRise } = sunriseSunset(date, lat, lon, tzOffsetHours);
  const base = computePanchang(rise, sunMoon, tzOffsetHours);

  const weekday = new Date(rise.getTime() + tzOffsetHours * 3600 * 1000).getUTCDay();
  const dayMs = set.getTime() - rise.getTime();
  const nightMs = nextRise.getTime() - set.getTime();

  const rahuKaal = windowFromPart(RAHU_PART[weekday], rise, dayMs, tzOffsetHours, 'Rahu Kaal', 'bad');
  const gulikaKaal = windowFromPart(GULIKA_PART[weekday], rise, dayMs, tzOffsetHours, 'Gulika Kaal', 'bad');
  const yamaganda = windowFromPart(YAMA_PART[weekday], rise, dayMs, tzOffsetHours, 'Yamaganda', 'bad');

  const dayStart = DAY_START_IDX[weekday];
  const nightStart = (dayStart + 5) % 7;

  return {
    ...base,
    city,
    sunrise: fmtLocal(rise, tzOffsetHours),
    sunset: fmtLocal(set, tzOffsetHours),
    rahuKaal,
    gulikaKaal,
    yamaganda,
    dayChoghadiya: choghadiyaSet(dayStart, rise, dayMs, tzOffsetHours),
    nightChoghadiya: choghadiyaSet(nightStart, set, nightMs, tzOffsetHours),
  };
}

/** A small built-in city list for the Panchang page (no Nominatim needed). */
export interface PanchangCity { slug: string; name: string; lat: number; lon: number; tz: number }
export const PANCHANG_CITIES: PanchangCity[] = [
  { slug: 'delhi', name: 'Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { slug: 'mumbai', name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { slug: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { slug: 'kolkata', name: 'Kolkata', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { slug: 'chennai', name: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { slug: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { slug: 'pune', name: 'Pune', lat: 18.5204, lon: 73.8567, tz: 5.5 },
  { slug: 'ahmedabad', name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, tz: 5.5 },
  { slug: 'jaipur', name: 'Jaipur', lat: 26.9124, lon: 75.7873, tz: 5.5 },
  { slug: 'lucknow', name: 'Lucknow', lat: 26.8467, lon: 80.9462, tz: 5.5 },
];
