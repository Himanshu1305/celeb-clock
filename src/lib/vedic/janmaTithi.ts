/**
 * Janma Tithi — the Hindu (lunar) birthday (Batch 10).
 *
 * Computed with the same sidereal (Lahiri) Sun/Moon engine as the Kundali, Panchang and
 * festival calendar (getSiderealLongitude), so a birthday here always agrees with the
 * Panchang pages.
 *
 *  1. Birth tithi — the tithi (each 12° the Moon gains on the Sun) running at the birth
 *     moment. Without a birth time we use the tithi at sunrise of the birth date at the
 *     birthplace (the tithi that names that day — "a day is named by the tithi running at
 *     sunrise", pranamdaily.in/en/janma-tithi/, opened 29 Oct 2026).
 *  2. Birth lunar month — the AMANTA month (new moon to new moon) holding the birth, named
 *     by the classical rule used in ./festivals.ts: a lunar month takes the name of the
 *     Sankranti (Sun entering a sidereal sign) inside it; a lunation with no Sankranti is
 *     Adhik (extra) and takes the next month's name ("lunar months which are devoid of
 *     Sankranti are marked as Adhik Maas", drikpanchang.com Adhik Maas page, opened
 *     29 Oct 2026). The PURNIMANTA (full-moon-ending, North Indian) name is the same in
 *     Shukla paksha and one month ahead in Krishna paksha (purnimantaMonthName).
 *  3. The birthday each year — the day in the lunar month of the same name on which the
 *     birth tithi is running at SUNRISE at the place where you celebrate (the sunrise rule
 *     that names a day in the Panchang; Drik Panchang lists Purnima the same way — see
 *     src/lib/vedic/__tests__/janmaTithi.test.ts, which checks Purnima births against
 *     Drik's New Delhi Purnima dates for 2027 and 2037, including the special cases below).
 *
 * Stated rules for the special cases:
 *  • Vriddhi (the tithi is running at two sunrises): the FIRST of the two days is listed,
 *    and the second day is shown too. Drik Panchang does the same for Purnima — e.g.
 *    Jyeshtha Purnima 2027 runs through the sunrises of 18 and 19 June and Drik lists
 *    18 June (the test above).
 *  • Kshaya (the tithi starts after one sunrise and ends before the next, so it names no
 *    day): the birthday is the day in which the tithi falls — the day whose sunrise tithi
 *    is the one just before it. Source: pranamdaily.in/en/janma-tithi/ (opened 29 Oct
 *    2026): "this calculator gives the day of the tithi just before it, so you always
 *    receive one settled date". Drik Panchang lists a skipped Purnima the same way (Magha
 *    Purnima 2027 → 20 Feb; Margashirsha Purnima 2026 → 23 Dec) and a skipped Ekadashi
 *    too (Kartika Shukla Ekadashi 2026 → 20 Nov).
 *  • Adhik Maas years: the birthday is listed in the regular (nija / shuddha) month of
 *    that name, because Adhik Maas is set aside from auspicious celebrations — Drik
 *    Panchang's Adhik Maas page (opened 29 Oct 2026) says it is "not good to perform any
 *    auspicious works" in it, and that delayed rites "should only be performed during a
 *    Shuddha Maas". The date the tithi also falls in the Adhik month is shown as a note,
 *    for families who mark both. Someone BORN in an Adhik month celebrates in the
 *    regular month of the same name (Adhik months recur only every ~2.7 years).
 *
 * Pure computation, no network: runs in the browser; nothing is stored.
 */
import { getSiderealLongitude } from './engine/vedicEngine';
import { sunriseSunset } from './panchangDay';
import { LUNAR_MONTHS, purnimantaMonthName, tithiSpan, type AmantaMonth } from './festivals';
import { PANCHANG_TABLES } from './panchang';
import { offsetSecondsAt } from '../timezone/birthTimezone';

const DAY = 86400000;
const MIN = 60000;

export type Paksha = 'Shukla' | 'Krishna';

export interface Place {
  lat: number;
  lon: number;
  /** IANA zone, e.g. "Asia/Kolkata". */
  timezone: string;
  name?: string;
}

const norm = (x: number) => ((x % 360) + 360) % 360;
const wrap180 = (x: number) => { const v = norm(x); return v > 180 ? v - 360 : v; };
/** Moon − Sun sidereal elongation (0–360°). */
export function elongationAt(t: number): number {
  const d = new Date(t);
  return norm(getSiderealLongitude('Moon', d) - getSiderealLongitude('Sun', d));
}
const sunSign = (t: number) => Math.floor(getSiderealLongitude('Sun', new Date(t)) / 30);

/** Instant (ms) where wrap180(elongation − target) crosses zero upward inside [lo, hi]. */
function solveElong(lo: number, hi: number, target = 0): number {
  const f = (t: number) => wrap180(elongationAt(t) - target);
  for (let i = 0; i < 45; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/** First new moon strictly after t. */
export function nextNewMoon(t: number): number {
  const e = elongationAt(t);
  const guess = t + ((360 - e) / 12.19) * DAY;
  let lo = Math.max(t, guess - 3 * DAY);
  let hi = guess + 3 * DAY;
  // Ensure the bracket really straddles the conjunction (moon speed varies 11.8–15°/day).
  const f = (x: number) => wrap180(elongationAt(x));
  while (f(lo) > 0 && lo > t) lo = Math.max(t, lo - DAY);
  while (f(hi) < 0) hi += DAY;
  return solveElong(lo, hi);
}

/** Last new moon at or before t. */
export function prevNewMoon(t: number): number {
  const e = elongationAt(t);
  const guess = t - (e / 12.19) * DAY;
  let lo = guess - 3 * DAY;
  let hi = Math.min(t, guess + 3 * DAY);
  const f = (x: number) => wrap180(elongationAt(x));
  while (f(hi) < 0 && hi < t) hi = Math.min(t, hi + DAY);
  while (f(lo) > 0) lo -= DAY;
  return solveElong(lo, hi);
}

/**
 * The amanta lunation starting at the new moon `start`, named by the Sankranti rule
 * (see the file header). Identical naming to amantaMonths() in ./festivals.ts.
 */
export function lunationFrom(start: number): AmantaMonth {
  const end = nextNewMoon(start + DAY);
  const s0 = sunSign(start + MIN), s1 = sunSign(end - MIN);
  const n = (s1 - s0 + 12) % 12;
  if (n === 0) return { name: `Adhik ${LUNAR_MONTHS[(s1 + 1) % 12]}`, adhik: true, start: new Date(start), end: new Date(end) };
  // n === 1 normally; n === 2 is a (very rare) kshaya month — named after its first Sankranti,
  // as amantaMonths() does.
  return { name: LUNAR_MONTHS[(s0 + 1) % 12], adhik: false, start: new Date(start), end: new Date(end) };
}

export function lunationAt(t: number): AmantaMonth {
  return lunationFrom(prevNewMoon(t));
}

/** Base month name ("Adhik Jyeshtha" → "Jyeshtha"). */
export const baseMonthName = (name: string) => name.replace(/^Adhik\s+/, '');

/** 0-based tithi index 0..29 (Shukla Pratipada = 0, Amavasya = 29). */
export function tithiIndexAt(t: number): number {
  return Math.min(29, Math.floor(elongationAt(t) / 12));
}

export interface TithiInfo {
  index: number;           // 0..29
  paksha: Paksha;
  number: number;          // 1..15 within the paksha
  name: string;            // Pratipada … Purnima / Amavasya
}
export function tithiInfo(index: number): TithiInfo {
  const paksha: Paksha = index < 15 ? 'Shukla' : 'Krishna';
  const within = index % 15;
  const name = within === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : PANCHANG_TABLES.TITHI_NAMES[within];
  return { index, paksha, number: within + 1, name };
}

// ── Local days and sunrise at a place ────────────────────────────────────────

/** Local calendar date (YYYY-MM-DD) of an instant in `tz`. */
export function localDateOf(t: number, tz: string): string {
  return new Date(t + offsetSecondsAt(tz, t) * 1000).toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
}
const riseCache = new Map<string, number>();
/** Sunrise (UTC ms) on local date `iso` at the place. */
export function sunriseOn(iso: string, place: Place): number {
  const key = `${iso}|${place.lat.toFixed(3)}|${place.lon.toFixed(3)}|${place.timezone}`;
  let v = riseCache.get(key);
  if (v === undefined) {
    const noonUtc = Date.parse(`${iso}T12:00:00Z`);
    const off = offsetSecondsAt(place.timezone, noonUtc - (place.lon / 15) * 3600000) / 3600;
    v = sunriseSunset(new Date(`${iso}T12:00:00Z`), place.lat, place.lon, off).rise.getTime();
    if (riseCache.size > 5000) riseCache.clear();
    riseCache.set(key, v);
  }
  return v;
}

export type ObservanceRule = 'sunrise' | 'vriddhi' | 'kshaya';
export interface Observance {
  date: string;            // local YYYY-MM-DD at the celebration place
  rule: ObservanceRule;
  /** Vriddhi: the second day the tithi is running at sunrise. */
  secondDate?: string;
  tithiStart: number;      // UTC ms
  tithiEnd: number;
}

/** Day a tithi span is observed at a place under the sunrise rule (see the file header). */
export function observeTithi(span: { start: number; end: number }, place: Place): Observance {
  const first = addDays(localDateOf(span.start, place.timezone), -1);
  const last = addDays(localDateOf(span.end, place.timezone), 1);
  const hits: string[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) {
    const r = sunriseOn(d, place);
    if (r >= span.start && r < span.end) hits.push(d);
  }
  if (hits.length >= 1) {
    return hits.length > 1
      ? { date: hits[0], rule: 'vriddhi', secondDate: hits[1], tithiStart: span.start, tithiEnd: span.end }
      : { date: hits[0], rule: 'sunrise', tithiStart: span.start, tithiEnd: span.end };
  }
  // Kshaya: the local day whose sunrise precedes the tithi's start.
  for (let d = first; d <= last; d = addDays(d, 1)) {
    if (sunriseOn(d, place) <= span.start && sunriseOn(addDays(d, 1), place) > span.start) {
      return { date: d, rule: 'kshaya', tithiStart: span.start, tithiEnd: span.end };
    }
  }
  return { date: localDateOf(span.start, place.timezone), rule: 'kshaya', tithiStart: span.start, tithiEnd: span.end };
}

// ── The calculator ──────────────────────────────────────────────────────────

export interface JanmaTithiInput {
  /** Birth date at the birthplace, YYYY-MM-DD. */
  dob: string;
  /** Birth instant (UTC ms) when the time is known; null → sunrise of the birth date. */
  birthUtcMs: number | null;
  birthPlace: Place;
  /** Where the birthday will be celebrated (sunrise there decides the day). Default: birthplace. */
  celebratePlace?: Place;
  /** List birthdays on or after this local date (YYYY-MM-DD). */
  from: string;
  /** How many birthdays to list (default 10). */
  count?: number;
}

export interface TithiBirthday {
  date: string;
  /** Gregorian year of `date`. */
  year: number;
  amantaMonth: string;
  purnimantaMonth: string;
  rule: ObservanceRule;
  secondDate?: string;
  /** In an Adhik Maas year: the date the tithi also falls in the Adhik month (not the listed birthday). */
  adhikDate?: string;
  adhikMonth?: string;
}

export interface JanmaTithiResult {
  tithi: TithiInfo;
  /** How the birth tithi was taken. */
  basis: 'birth-moment' | 'sunrise';
  /** Tithi at sunrise of the birth date (shown when it differs from the birth-moment tithi). */
  sunriseTithi: TithiInfo;
  /** Birth lunation as named (may be "Adhik X"). */
  birthMonth: string;
  bornInAdhik: boolean;
  /** Month name the birthday is kept in (Adhik removed). */
  amantaMonth: string;
  purnimantaMonth: string;
  birthdays: TithiBirthday[];
}

export function computeJanmaTithi(input: JanmaTithiInput): JanmaTithiResult {
  const place = input.birthPlace;
  const celebrate = input.celebratePlace ?? place;
  const count = input.count ?? 10;
  const birthSunrise = sunriseOn(input.dob, place);
  const sunriseTithi = tithiInfo(tithiIndexAt(birthSunrise + MIN));
  const basis = input.birthUtcMs != null ? 'birth-moment' : 'sunrise';
  const t0 = input.birthUtcMs ?? (birthSunrise + MIN);
  const tithi = tithiInfo(tithiIndexAt(t0));
  const birthLun = lunationAt(t0);
  const monthName = baseMonthName(birthLun.name);

  const birthdays: TithiBirthday[] = [];
  // Walk lunations from a little before `from` until enough birthdays are found.
  let start = prevNewMoon(Date.parse(`${input.from}T00:00:00Z`) - 40 * DAY);
  let prev: AmantaMonth | null = null;
  for (let guard = 0; guard < 14 * (count + 2) && birthdays.length < count; guard++) {
    const lun = lunationFrom(start);
    if (!lun.adhik && lun.name === monthName) {
      const obs = observeTithi(tithiSpan(lun, tithi.paksha, tithi.number), celebrate);
      if (obs.date >= input.from) {
        const b: TithiBirthday = {
          date: obs.date, year: Number(obs.date.slice(0, 4)),
          amantaMonth: monthName, purnimantaMonth: purnimantaMonthName(monthName, tithi.paksha),
          rule: obs.rule, ...(obs.secondDate ? { secondDate: obs.secondDate } : {}),
        };
        if (prev?.adhik && baseMonthName(prev.name) === monthName) {
          const a = observeTithi(tithiSpan(prev, tithi.paksha, tithi.number), celebrate);
          b.adhikDate = a.date;
          b.adhikMonth = prev.name;
        }
        birthdays.push(b);
      }
    }
    prev = lun;
    start = lun.end.getTime();
  }

  return {
    tithi, basis, sunriseTithi,
    birthMonth: birthLun.name, bornInAdhik: birthLun.adhik,
    amantaMonth: monthName, purnimantaMonth: purnimantaMonthName(monthName, tithi.paksha),
    birthdays,
  };
}

/** "Kartika Krishna Ashtami" style label in the chosen month system. */
export function tithiLabel(month: string, t: TithiInfo): string {
  if (t.name === 'Purnima' || t.name === 'Amavasya') return `${month} ${t.name}`;
  return `${month} ${t.paksha} ${t.name}`;
}
