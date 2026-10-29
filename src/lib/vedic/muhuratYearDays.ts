/**
 * Year muhurat lists — the LOCATION step (pure; runs in the browser for the city picker).
 *
 * The build (src/lib/vedic/muhuratYear.ts) does all the astronomy that is the same
 * everywhere: it finds the instants at which the Panchang limbs (Tithi, Nakshatra,
 * Yoga, Karana) qualify for an occasion and the periods that rule a whole day out
 * (Kharmas, Adhik month, Chaturmas, Guru/Shukra Asta …). Those instants are shipped as
 * a small static JSON per occasion and year.
 *
 * What depends on the city is only the Hindu day — sunrise to next sunrise — and the
 * clock: which weekday a window falls on, whether a prohibited period touches that
 * day, and how the window reads in local time. This file does that step, given a
 * sunrise function, exactly the way Drik Panchang describes its lists: "Panchang day
 * starts and ends with sunrise", "Muhurats are calculated from Sunrise to Sunrise",
 * windows shorter than 5 minutes are discarded, and days that only partly overlap a
 * prohibited period are dropped ("Day partially overlaps with Prohibited …")
 * (drikpanchang.com/shubh-dates/griha-pravesh-dates-with-muhurat.html and
 * …/shubh-marriage-dates-with-muhurat.html, opened 29 Oct 2026).
 */

export type YearMuhuratType = 'marriage' | 'griha-pravesh' | 'vehicle' | 'mundan' | 'naamkaran';

/** One qualifying stretch of time: [startMs, endMs, nakshatraIndex 0..26, tithiIndex 0..29]. */
export type Piece = [number, number, number, number];
/** A period that rules out any Hindu day it touches: [startMs, endMs, reason]. */
export type Block = [number, number, string];

export interface YearMuhuratData {
  type: YearMuhuratType;
  year: number;
  pieces: Piece[];
  blocks: Block[];
  /** Day-level rules applied after the city's sunrises are known. */
  rules: DayRules;
}

export interface DayRules {
  /** Weekdays (0 = Sunday) on which the occasion is not done. */
  avoidWeekdays: number[];
  /** Minimum window length in minutes (Drik: 5). */
  minMinutes: number;
  /**
   * Only the daytime part counts, as a fraction of daylight from sunrise
   * (1 = up to sunset; 0.5 = forenoon only). Omitted = the whole sunrise-to-sunrise day.
   */
  dayFraction?: number;
  /**
   * Windows must START before sunset + this fraction of the night (vehicle: Drik's
   * "Available Muhurat … is too late in the night"; 0.2 = the first three of the
   * night's fifteen muhurtas, i.e. Pradosh).
   */
  latestStartNightFraction?: number;
}

export interface SunTimes { rise: number; set: number; nextRise: number }
export type SunFn = (isoDate: string) => SunTimes;

export interface MuhuratWindow {
  /** Hindu (sunrise-to-sunrise) day, local civil date of its sunrise. */
  date: string;
  weekday: number;
  start: number;
  end: number;
  nakshatras: number[];
  tithis: number[];
}

const DAY = 86400000;
const addDays = (iso: string, n: number) => new Date(new Date(iso + 'T00:00:00Z').getTime() + n * DAY).toISOString().slice(0, 10);

/** Weekday of the local civil date of an instant. */
function localWeekday(t: number, tzHours: number): number {
  return new Date(t + tzHours * 3600000).getUTCDay();
}

/**
 * Turn the precomputed pieces into dated windows for one place.
 * `sun(iso)` gives that place's sunrise, sunset and next sunrise for the local date.
 */
export function windowsForPlace(data: YearMuhuratData, sun: SunFn, tz: number | ((isoDate: string) => number)): MuhuratWindow[] {
  const tzOf = typeof tz === 'number' ? () => tz : tz;
  const { pieces, blocks, rules, year } = data;
  const out: MuhuratWindow[] = [];
  // Walk every local date of the year (plus the previous evening's day, whose
  // night can hold a window that ends after 1 January sunrise — not listed).
  for (let iso = `${year}-01-01`; iso <= `${year}-12-31`; iso = addDays(iso, 1)) {
    const st = sun(iso);
    const dayStart = st.rise, dayEnd = st.nextRise;
    const weekday = localWeekday(st.rise, tzOf(iso));
    if (rules.avoidWeekdays.includes(weekday)) continue;
    // A prohibited period touching any part of the Hindu day rules the whole day out.
    if (blocks.some(b => b[0] < dayEnd && b[1] > dayStart)) continue;
    let lo = dayStart, hi = dayEnd;
    if (rules.dayFraction !== undefined) hi = st.rise + (st.set - st.rise) * rules.dayFraction;
    // Clip and merge the qualifying pieces inside this day.
    let cur: MuhuratWindow | null = null;
    const flush = () => {
      if (!cur) return;
      const len = (cur.end - cur.start) / 60000;
      const lateOk = rules.latestStartNightFraction === undefined || cur.start < st.set + (st.nextRise - st.set) * rules.latestStartNightFraction;
      if (len >= rules.minMinutes && lateOk) out.push(cur);
      cur = null;
    };
    for (const p of pieces) {
      if (p[1] <= lo || p[0] >= hi) continue;
      const s = Math.max(p[0], lo), e = Math.min(p[1], hi);
      if (e - s < 1000) continue;
      if (cur && Math.abs(cur.end - s) < 1000) {
        cur.end = e;
        if (!cur.nakshatras.includes(p[2])) cur.nakshatras.push(p[2]);
        if (!cur.tithis.includes(p[3])) cur.tithis.push(p[3]);
      } else {
        flush();
        cur = { date: iso, weekday, start: s, end: e, nakshatras: [p[2]], tithis: [p[3]] };
      }
    }
    flush();
  }
  return out;
}

/** Local "HH:MM" and whether it is past local midnight of the window's Hindu day. */
export function clock(t: number, dayIso: string, tzHours: number): { hhmm: string; nextDay: boolean } {
  const local = new Date(Math.round(t / 60000) * 60000 + tzHours * 3600000);
  const hhmm = `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
  return { hhmm, nextDay: local.toISOString().slice(0, 10) > dayIso };
}
