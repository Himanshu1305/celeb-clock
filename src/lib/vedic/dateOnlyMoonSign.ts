/**
 * Date-only Moon sign (Rashi) and Nakshatra — Batch 6 (25 Oct 2026).
 *
 * In Indian astrology a person's "Rashi" is the sidereal sign of the MOON at birth,
 * not the Sun. The old celebrity/article code renamed the Western Sun sign
 * (Libra → "Tula"), which is wrong for most dates. This module uses the SAME
 * Moon-longitude path the Kundali uses (`getSiderealLongitude('Moon', …)` from the
 * chart engine: astronomy-engine Moon + the engine's Lahiri ayanamsa, validated
 * against Swiss Ephemeris).
 *
 * With only a birth DATE we look at the Moon at 00:00 and at 23:59 local time of that
 * day. The Moon only moves forward (~12–15° a day), so every sign / Nakshatra between
 * those two points is possible:
 *   • one sign all day  → that sign is certain;
 *   • the sign changed  → "Tula or Vrischika (depends on birth time)".
 * Same rule for the Nakshatra (rarely three are possible on one day).
 *
 * Local time: India Standard Time (UTC+05:30) unless a time-zone window is given.
 * A window may span several UTC offsets (a country with many zones / summer time);
 * the day then starts at 00:00 in the most-eastern offset and ends at 23:59 in the
 * most-western one, so a sign is only called "certain" when it is certain for all.
 *
 * If a tool has the birth TIME, it must use the full chart engine instead of this.
 */
import { getSiderealLongitude, NAKSHATRA_NAMES, RASHI_NAMES } from '@/lib/vedic/engine/vedicEngine';

/** UTC offsets (minutes east of UTC) covering the person's local clock on that day. */
export interface LocalDayWindow {
  minOffsetMin: number;
  maxOffsetMin: number;
  /** Short human label, e.g. "Indian Standard Time". */
  label: string;
}

export const IST_WINDOW: LocalDayWindow = { minOffsetMin: 330, maxOffsetMin: 330, label: 'Indian Standard Time' };

export interface DateOnlyMoonSigns {
  /** Sidereal sign indices 0–11 (0 = Mesha) possible on that day, in order. Length 1 = certain. */
  signIndices: number[];
  /** Rashi names (engine spelling: Mesha … Vrischika … Meena). */
  signNames: string[];
  /** Nakshatra numbers 1–27 possible on that day, in order. Length 1 = certain. */
  nakshatraNumbers: number[];
  nakshatraNames: string[];
  /** Moon sidereal longitude (deg) at 00:00 and 23:59 local. */
  startLongitude: number;
  endLongitude: number;
  window: LocalDayWindow;
}

const NK_SPAN = 360 / 27;
const cache = new Map<string, DateOnlyMoonSigns>();

/** Indices from a to b moving forward round a circle of n parts. */
function forwardRange(a: number, b: number, n: number): number[] {
  const out = [a];
  let i = a;
  while (i !== b && out.length <= n) { i = (i + 1) % n; out.push(i); }
  return out;
}

/**
 * Moon sign(s) and Nakshatra(s) for a birth DATE (YYYY-MM-DD), from 00:00 to 23:59
 * local time. Cached per date + window (the celebrity prerender calls this ~3,100 times).
 */
export function moonSignsForDate(dobIso: string, window: LocalDayWindow = IST_WINDOW): DateOnlyMoonSigns | null {
  const m = /^(\d{1,4})-(\d{2})-(\d{2})/.exec(dobIso || '');
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const key = `${y}-${mo}-${d}|${window.minOffsetMin}|${window.maxOffsetMin}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const midnightUtc = Date.UTC(2000, mo - 1, d, 0, 0);
  // Date.UTC maps years 0–99 to 1900s; set the year explicitly.
  const base = new Date(midnightUtc); base.setUTCFullYear(y);
  const startUtc = new Date(base.getTime() - window.maxOffsetMin * 60_000);
  const endUtc = new Date(base.getTime() + (23 * 60 + 59) * 60_000 - window.minOffsetMin * 60_000);
  const a = getSiderealLongitude('Moon', startUtc);
  const b = getSiderealLongitude('Moon', endUtc);

  const signIndices = forwardRange(Math.floor(a / 30) % 12, Math.floor(b / 30) % 12, 12);
  const nakshatraIdx = forwardRange(Math.floor(a / NK_SPAN) % 27, Math.floor(b / NK_SPAN) % 27, 27);
  const res: DateOnlyMoonSigns = {
    signIndices,
    signNames: signIndices.map(i => RASHI_NAMES[i]),
    nakshatraNumbers: nakshatraIdx.map(i => i + 1),
    nakshatraNames: nakshatraIdx.map(i => NAKSHATRA_NAMES[i]),
    startLongitude: a,
    endLongitude: b,
    window,
  };
  cache.set(key, res);
  return res;
}

/** "Tula" · "Tula or Vrischika" · "Hasta, Chitra or Swati". */
export function joinAlternatives(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}

/** Display text with the birth-time caveat when more than one is possible. */
export function describeAlternatives(names: string[]): string {
  return names.length > 1 ? `${joinAlternatives(names)} (depends on birth time)` : (names[0] ?? '');
}

/**
 * Range of clock offsets (minutes east of UTC, summer time included) for the
 * countries in the celebrity data. The data has no birth place, only nationality,
 * so this is a stand-in for the birth country; the window covers every clock time
 * used there, so a sign is only called certain when it is certain country-wide.
 * India (and anyone without a nationality) uses IST, as the founder specified.
 * Unlisted countries use the whole-Earth window (UTC−12 … UTC+14).
 */
const COUNTRY_OFFSETS_H: Record<string, [number, number]> = {
  AL: [1, 2], AR: [-4, -2], AT: [1, 2], AU: [8, 11], BE: [0, 2], BR: [-5, -2], BY: [2, 3],
  CA: [-8, -2.5], CH: [1, 2], CL: [-6, -3], CN: [8, 9], CO: [-5, -4], CU: [-5, -4], CZ: [1, 2],
  DE: [1, 2], EC: [-6, -5], EE: [2, 3], EG: [2, 3], ES: [0, 2], FI: [2, 3], FR: [0, 2], GB: [0, 2],
  GH: [0, 0], HU: [1, 2], ID: [7, 9], IE: [0, 1], IL: [2, 3], IQ: [3, 4], IR: [3.5, 4.5], IS: [-1, 0],
  IT: [1, 2], JO: [2, 3], JP: [9, 10], KR: [8.5, 10], MM: [6.5, 6.5], MX: [-8, -5], MY: [7, 8],
  NG: [1, 1], NO: [1, 2], NZ: [11.5, 13.75], PH: [8, 9], PK: [5, 6], PL: [1, 2], PT: [-1, 1],
  RS: [1, 2], RU: [2, 13], SE: [1, 2], SI: [1, 2], TH: [7, 7], TR: [2, 4], UA: [2, 4],
  US: [-10, -4], VE: [-4.5, -4], ZA: [2, 2], ZW: [2, 2],
};

export function birthDayWindowForNationality(code: string | null | undefined): LocalDayWindow {
  const c = String(code || '').toUpperCase();
  if (!c || c === 'IN') return IST_WINDOW;
  const r = COUNTRY_OFFSETS_H[c];
  if (!r) return { minOffsetMin: -12 * 60, maxOffsetMin: 14 * 60, label: 'any time zone' };
  return { minOffsetMin: Math.round(r[0] * 60), maxOffsetMin: Math.round(r[1] * 60), label: `local time in ${c}` };
}
