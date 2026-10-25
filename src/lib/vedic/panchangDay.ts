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
import panchangCitiesData from '@/data/panchangCities.json';

export interface TimeWindow {
  name: string; start: string; end: string; quality: 'good' | 'neutral' | 'bad';
  /** True when the start / end clock time falls after local midnight (the next civil day). */
  startNextDay?: boolean; endNextDay?: boolean;
}

export interface DayPanchang extends Panchang {
  city: string;
  sunrise: string;      // local HH:MM
  sunset: string;
  rahuKaal: TimeWindow;
  gulikaKaal: TimeWindow;
  yamaganda: TimeWindow;
  dayChoghadiya: TimeWindow[];
  nightChoghadiya: TimeWindow[];
  /** When the sunrise limb ends, local "HH:MM", with " (next day)" if after local midnight. */
  tithiEnd: string;
  nakshatraEnd: string;
  yogaEnd: string;
  karanaEnd: string;
  /** Abhijit muhurta — the 8th of the 15 daytime muhurtas (midday). */
  abhijit: TimeWindow;
  /** False on Wednesday: Abhijit is not used then (it coincides with Dur Muhurtam; Drik shows "None"). */
  abhijitApplies: boolean;
  /** Brahma Muhurta — the 14th of the 15 muhurtas of the night that ends at this sunrise. */
  brahmaMuhurta: TimeWindow;
  /** Dur Muhurtam — one or two inauspicious muhurtas, fixed by weekday. */
  durMuhurtam: TimeWindow[];
  /** Varjyam (Tyajyam) — 4-ghati windows inside each Nakshatra, between sunrise and next sunrise. */
  varjyam: TimeWindow[];
  /** Amrit Kalam — 4-ghati auspicious windows inside each Nakshatra, between sunrise and next sunrise. */
  amritKalam: TimeWindow[];
  /** Length of daylight in minutes (sunrise → sunset), rounded. */
  dayLengthMin: number;
}

const sunMoon = (d: Date) => ({ sun: getSiderealLongitude('Sun', d), moon: getSiderealLongitude('Moon', d) });
const elong = (d: Date) => { const x = sunMoon(d); return x.moon - x.sun; };

/** Round an instant to the nearest whole minute (Drik-style HH:MM, not truncated seconds). */
const roundMin = (utc: Date) => new Date(Math.round(utc.getTime() / 60000) * 60000);
/** Local civil date (YYYY-MM-DD) of an instant, after rounding to the minute. */
const localDay = (utc: Date, tz: number) => new Date(roundMin(utc).getTime() + tz * 3600000).toISOString().slice(0, 10);

function fmtLocal(utc: Date, tzOffsetHours: number): string {
  const local = new Date(roundMin(utc).getTime() + tzOffsetHours * 3600 * 1000);
  return `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
}

/** Real sunrise/sunset (UTC Date objects) for a date + location. */
export function sunriseSunset(date: Date, lat: number, lon: number, tzOffsetHours: number): { rise: Date; set: Date; nextRise: Date; prevSet: Date } {
  const observer = new Astronomy.Observer(lat, lon, 0);
  // Start searching from local midnight expressed in UTC.
  const localMidnightUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) - tzOffsetHours * 3600 * 1000);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, localMidnightUTC, 2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, rise ? rise.date : localMidnightUTC, 2);
  const nextRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, set ? set.date : localMidnightUTC, 2);
  // The sunset before this sunrise (start of the night that this sunrise ends).
  const prevSet = rise ? Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, new Date(rise.date.getTime() - 86400000), 1) : null;
  // Fallbacks (polar day/night): approximate 06:00/18:00 local.
  const approxRise = new Date(localMidnightUTC.getTime() + 6 * 3600 * 1000);
  const approxSet = new Date(localMidnightUTC.getTime() + 18 * 3600 * 1000);
  const approxNext = new Date(localMidnightUTC.getTime() + 30 * 3600 * 1000);
  return {
    rise: rise ? rise.date : approxRise,
    set: set ? set.date : approxSet,
    nextRise: nextRise ? nextRise.date : approxNext,
    prevSet: prevSet && rise && prevSet.date.getTime() < rise.date.getTime() ? prevSet.date : new Date(approxSet.getTime() - 86400000),
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
/** Which 1-based eighth of daylight each window takes, by weekday (0=Sun..6=Sat). */
export const WINDOW_PARTS = { rahu: RAHU_PART, gulika: GULIKA_PART, yama: YAMA_PART } as const;

function windowFromPart(part: number, rise: Date, dayMs: number, tz: number, name: string, quality: 'good' | 'neutral' | 'bad'): TimeWindow {
  const seg = dayMs / 8;
  const start = new Date(rise.getTime() + (part - 1) * seg);
  const end = new Date(start.getTime() + seg);
  return { name, start: fmtLocal(start, tz), end: fmtLocal(end, tz), quality };
}

// Day Choghadiyas follow CHOGH_CYCLE one step at a time; night Choghadiyas step
// FIVE places through it each slot (Shubh → Amrit → Char → Rog → Kaal → Labh →
// Udveg), the standard order used by Drik Panchang (round-2 audit T6).
function choghadiyaSet(startIdx: number, from: Date, totalMs: number, tz: number, step = 1): TimeWindow[] {
  const seg = totalMs / 8;
  const out: TimeWindow[] = [];
  for (let i = 0; i < 8; i++) {
    const name = CHOGH_CYCLE[(startIdx + i * step) % 7];
    const start = new Date(from.getTime() + i * seg);
    const end = new Date(start.getTime() + seg);
    out.push({ name, start: fmtLocal(start, tz), end: fmtLocal(end, tz), quality: CHOGH_QUALITY[name] });
  }
  return out;
}

/**
 * First instant after `from` at which floor(f / unit) changes, for a quantity
 * f (degrees, mod 360) that increases with time — i.e. when the current
 * tithi / nakshatra / yoga / karana ends. Hourly scan, then bisection (~1 s).
 */
function limbEnd(from: Date, f: (d: Date) => number, unit: number): Date {
  const idx = (d: Date) => Math.floor((((f(d) % 360) + 360) % 360) / unit);
  const cur = idx(from);
  const lo = from.getTime();
  let hi = lo;
  for (let h = 1; h <= 36; h++) { hi = lo + h * 3600000; if (idx(new Date(hi)) !== cur) break; }
  let a = hi - 3600000 < lo ? lo : hi - 3600000;
  for (let i = 0; i < 25; i++) { const mid = (a + hi) / 2; if (idx(new Date(mid)) === cur) a = mid; else hi = mid; }
  return new Date(hi);
}
function fmtEnd(end: Date, rise: Date, tz: number): string {
  return fmtLocal(end, tz) + (localDay(end, tz) !== localDay(rise, tz) ? ' (next day)' : '');
}

/** A named window between two instants, flagged when either end is past local midnight. */
function windowAt(name: string, start: Date, end: Date, rise: Date, tz: number, quality: TimeWindow['quality']): TimeWindow {
  const day0 = localDay(rise, tz);
  const w: TimeWindow = { name, start: fmtLocal(start, tz), end: fmtLocal(end, tz), quality };
  if (localDay(start, tz) !== day0) w.startNextDay = true;
  if (localDay(end, tz) !== day0) w.endNextDay = true;
  return w;
}

/** Last instant before `from` at which floor(f / unit) changed — when the current limb began. */
function limbStart(from: Date, f: (d: Date) => number, unit: number): Date {
  const idx = (d: Date) => Math.floor((((f(d) % 360) + 360) % 360) / unit);
  const cur = idx(from);
  const hi0 = from.getTime();
  let lo = hi0;
  for (let h = 1; h <= 36; h++) { lo = hi0 - h * 3600000; if (idx(new Date(lo)) !== cur) break; }
  let b = lo + 3600000 > hi0 ? hi0 : lo + 3600000;
  for (let i = 0; i < 25; i++) { const mid = (lo + b) / 2; if (idx(new Date(mid)) === cur) b = mid; else lo = mid; }
  return new Date(b);
}

/*
 * Amrit Kalam and Varjyam (Tyajyam) start ghatis per Nakshatra (Ashwini → Revati),
 * out of the Nakshatra's 60 ghatis; each lasts 4 ghatis, scaled to that Nakshatra's
 * real length. Classical table as given in Karanam Ramakumar, "Panchangam
 * Calculations", transcribed in PyJHora src/jhora/const.py
 * (amrita_gadiya_varjyam_star_map, stored there as hours-of-24: ghati = h × 60/24) —
 * https://raw.githubusercontent.com/naturalstupid/PyJHora/main/src/jhora/const.py
 * (opened 25 Oct 2026). Mula has two Varjyam periods (20 and 56 ghatis).
 * Checked against Drik Panchang: Revati, 25 Oct 2026 → Varjyam 07:57–09:28 and
 * Amrit Kalam 17:05–18:36 IST (see panchangDrik.test.ts).
 */
const AMRIT_GHATI = [42, 48, 54, 52, 38, 35, 54, 44, 56, 54, 44, 42, 45, 44, 38, 38, 34, 38, 44, 48, 44, 34, 34, 42, 40, 48, 54];
const VARJYAM_GHATI: number[][] = [[50], [24], [30], [40], [14], [21], [30], [20], [32], [30], [20], [18], [21], [20], [14], [14], [10], [14], [20, 56], [24], [20], [10], [10], [18], [16], [24], [30]];

/*
 * Dur Muhurtam by weekday (Sun..Sat), as 0-based indexes into the 15 muhurtas of the
 * day (sunrise→sunset); Tuesday's second one is the 7th muhurta of the NIGHT (after
 * sunset, one night-muhurta long). Table as published by Drik Panchang, read off its
 * Delhi day pages for every weekday (25–31 Oct 2026, 14 Jan & 21 Jun 2027 — see
 * panchangDrik.test.ts): Sun 14th; Mon 9th+12th; Tue 4th + night 7th; Wed 8th;
 * Thu 6th+12th; Fri 4th+9th; Sat 1st+2nd. (Karanam Ramakumar's table, transcribed in
 * PyJHora drik.py, agrees except for Saturday, where it gives the 3rd; we follow Drik.)
 */
const DUR_DAY: number[][] = [[13], [8, 11], [3], [7], [5, 11], [3, 8], [0, 1]];
const DUR_TUESDAY_NIGHT = 6;

export interface DayWindowsLite {
  date: string; weekday: string; sunrise: string; sunset: string;
  rahuKaal: TimeWindow; gulikaKaal: TimeWindow; yamaganda: TimeWindow;
}
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/**
 * Sunrise/sunset and the three weekday windows only (no Moon work) — cheap enough
 * for a 7-day Rahu Kaal table. Same formulas as computeDayPanchang.
 */
export function dayWindowsLite(date: Date, lat: number, lon: number, tzOffsetHours: number): DayWindowsLite {
  const { rise, set } = sunriseSunset(date, lat, lon, tzOffsetHours);
  const local = new Date(rise.getTime() + tzOffsetHours * 3600 * 1000);
  const weekday = local.getUTCDay();
  const dayMs = set.getTime() - rise.getTime();
  return {
    date: local.toISOString().slice(0, 10), weekday: WEEKDAY_EN[weekday],
    sunrise: fmtLocal(rise, tzOffsetHours), sunset: fmtLocal(set, tzOffsetHours),
    rahuKaal: windowFromPart(RAHU_PART[weekday], rise, dayMs, tzOffsetHours, 'Rahu Kaal', 'bad'),
    gulikaKaal: windowFromPart(GULIKA_PART[weekday], rise, dayMs, tzOffsetHours, 'Gulika Kaal', 'bad'),
    yamaganda: windowFromPart(YAMA_PART[weekday], rise, dayMs, tzOffsetHours, 'Yamaganda', 'bad'),
  };
}

/** Full daily Panchang for a city. `date` is the local calendar day (any time). */
export function computeDayPanchang(date: Date, lat: number, lon: number, tzOffsetHours: number, city: string): DayPanchang {
  // Evaluate the five limbs at local sunrise (the classical convention).
  const { rise, set, nextRise, prevSet } = sunriseSunset(date, lat, lon, tzOffsetHours);
  const base = computePanchang(rise, sunMoon, tzOffsetHours);

  // Local weekday of this sunrise (base.weekday is computed the same way).
  const weekday = new Date(rise.getTime() + tzOffsetHours * 3600 * 1000).getUTCDay();
  const dayMs = set.getTime() - rise.getTime();
  const nightMs = nextRise.getTime() - set.getTime();

  const rahuKaal = windowFromPart(RAHU_PART[weekday], rise, dayMs, tzOffsetHours, 'Rahu Kaal', 'bad');
  const gulikaKaal = windowFromPart(GULIKA_PART[weekday], rise, dayMs, tzOffsetHours, 'Gulika Kaal', 'bad');
  const yamaganda = windowFromPart(YAMA_PART[weekday], rise, dayMs, tzOffsetHours, 'Yamaganda', 'bad');

  const dayStart = DAY_START_IDX[weekday];
  const nightStart = (dayStart + 5) % 7;
  const tz = tzOffsetHours;
  const dayMuh = dayMs / 15;
  const nightMuh = nightMs / 15;

  // Brahma Muhurta: the 14th of the 15 muhurtas of the night that ends at this sunrise
  // (previous sunset → this sunrise), i.e. two night-muhurtas to one before sunrise.
  const prevNightMuh = (rise.getTime() - prevSet.getTime()) / 15;
  const brahmaMuhurta = windowAt('Brahma Muhurta', new Date(rise.getTime() - 2 * prevNightMuh), new Date(rise.getTime() - prevNightMuh), rise, tz, 'good');

  const durMuhurtam = DUR_DAY[weekday].map(i =>
    windowAt('Dur Muhurtam', new Date(rise.getTime() + i * dayMuh), new Date(rise.getTime() + (i + 1) * dayMuh), rise, tz, 'bad'));
  if (weekday === 2) {
    const s0 = set.getTime() + DUR_TUESDAY_NIGHT * nightMuh;
    durMuhurtam.push(windowAt('Dur Muhurtam', new Date(s0), new Date(s0 + nightMuh), rise, tz, 'bad'));
  }

  // Amrit Kalam / Varjyam for every Nakshatra that overlaps sunrise → next sunrise.
  const moonF = (d: Date) => sunMoon(d).moon;
  const NAK_UNIT = 360 / 27;
  const varjyam: TimeWindow[] = [];
  const amritKalam: TimeWindow[] = [];
  let nStart = limbStart(rise, moonF, NAK_UNIT);
  for (let guard = 0; guard < 4 && nStart.getTime() < nextRise.getTime(); guard++) {
    const nEnd = limbEnd(new Date(nStart.getTime() + 60000), moonF, NAK_UNIT);
    const nIdx = Math.floor((((moonF(new Date((nStart.getTime() + nEnd.getTime()) / 2)) % 360) + 360) % 360) / NAK_UNIT);
    const len = nEnd.getTime() - nStart.getTime();
    const add = (list: TimeWindow[], ghati: number, name: string, q: TimeWindow['quality']) => {
      const a = nStart.getTime() + (ghati / 60) * len;
      const b = a + (4 / 60) * len;
      if (b > rise.getTime() && a < nextRise.getTime()) list.push(windowAt(name, new Date(a), new Date(b), rise, tz, q));
    };
    for (const g of VARJYAM_GHATI[nIdx]) add(varjyam, g, 'Varjyam', 'bad');
    add(amritKalam, AMRIT_GHATI[nIdx], 'Amrit Kalam', 'good');
    nStart = nEnd;
  }

  return {
    ...base,
    city,
    sunrise: fmtLocal(rise, tzOffsetHours),
    sunset: fmtLocal(set, tzOffsetHours),
    rahuKaal,
    gulikaKaal,
    yamaganda,
    dayChoghadiya: choghadiyaSet(dayStart, rise, dayMs, tzOffsetHours),
    nightChoghadiya: choghadiyaSet(nightStart, set, nightMs, tzOffsetHours, 5),
    tithiEnd: fmtEnd(limbEnd(rise, elong, 12), rise, tzOffsetHours),
    nakshatraEnd: fmtEnd(limbEnd(rise, d => sunMoon(d).moon, 360 / 27), rise, tzOffsetHours),
    yogaEnd: fmtEnd(limbEnd(rise, d => { const x = sunMoon(d); return x.sun + x.moon; }, 360 / 27), rise, tzOffsetHours),
    karanaEnd: fmtEnd(limbEnd(rise, elong, 6), rise, tzOffsetHours),
    abhijit: {
      name: 'Abhijit Muhurta',
      start: fmtLocal(new Date(rise.getTime() + dayMs * 7 / 15), tzOffsetHours),
      end: fmtLocal(new Date(rise.getTime() + dayMs * 8 / 15), tzOffsetHours),
      quality: 'good',
    },
    abhijitApplies: weekday !== 3,
    brahmaMuhurta,
    durMuhurtam,
    varjyam: varjyam.sort((a, b) => Number(!!a.startNextDay) - Number(!!b.startNextDay) || a.start.localeCompare(b.start)),
    amritKalam: amritKalam.sort((a, b) => Number(!!a.startNextDay) - Number(!!b.startNextDay) || a.start.localeCompare(b.start)),
    dayLengthMin: Math.round(dayMs / 60000),
  };
}

/**
 * Built-in Panchang cities: the 50 most-populated Indian cities (Census of India 2011,
 * via Wikipedia "List of cities in India by population") — see the `_source` note in
 * src/data/panchangCities.json. Delhi stays first (the default city). All are on IST.
 */
export interface PanchangCity { slug: string; name: string; state: string; rank: number; population2011: number; lat: number; lon: number; tz: number }
const RAW_CITIES = (panchangCitiesData as { cities: Array<Omit<PanchangCity, 'tz'>> }).cities;
export const PANCHANG_CITIES: PanchangCity[] = [
  ...RAW_CITIES.filter(c => c.slug === 'delhi'),
  ...RAW_CITIES.filter(c => c.slug !== 'delhi'),
].map(c => ({ ...c, tz: 5.5 }));

export const panchangCityBySlug = (slug: string | undefined): PanchangCity | undefined =>
  slug ? PANCHANG_CITIES.find(c => c.slug === slug) : undefined;

/** Today's local calendar date (YYYY-MM-DD) for a fixed UTC offset in hours. */
export function localDateKey(tzOffsetHours: number, now: number = Date.now()): string {
  return new Date(now + tzOffsetHours * 3600000).toISOString().slice(0, 10);
}
/** Shift a YYYY-MM-DD key by whole days. */
export function addDaysKey(key: string, n: number): string {
  const d = new Date(key + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** A valid YYYY-MM-DD between 1900 and 2100 (the engine's comfortable range). */
export function isValidDateKey(key: string | null | undefined): key is string {
  if (!key || !DATE_KEY_RE.test(key)) return false;
  const d = new Date(key + 'T12:00:00Z');
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== key) return false;
  const y = d.getUTCFullYear();
  return y >= 1900 && y <= 2100;
}

/** Great-circle distance in km (for "nearby cities" links). */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function nearestCities(c: { slug?: string; lat: number; lon: number }, n = 4): PanchangCity[] {
  return PANCHANG_CITIES.filter(x => x.slug !== c.slug)
    .map(x => ({ x, d: distanceKm(c, x) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map(o => o.x);
}
