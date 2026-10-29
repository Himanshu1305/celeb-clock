/**
 * Kua (Gua) number — Feng Shui "Eight Mansions" personal number (Batch 10) —
 * /kua-number-calculator.
 *
 * Sources (all opened 29 Oct 2026):
 *  • Year boundary — SCMP, "Head right direction" (scmp.com/article/709737): the Kua "is
 *    based on the year of birth calculated after the solar new year each year, i.e.
 *    February 4". The solar new year is Lichun, which "begins when the Sun reaches the
 *    celestial longitude of 315°" (Wikipedia "Lichun", kiwix mirror; herongyang.com
 *    "Solar Terms Used in Chinese Calendar": "the day when the Sun reaches longitude of
 *    315 degrees"). We compute that instant with astronomy-engine (apparent geocentric
 *    longitude) instead of assuming 4 Feb, and compare dates in China Standard Time
 *    (UTC+8), where the Chinese calendar is reckoned. Born ON the Lichun date → the
 *    result depends on the birth time, so both numbers are shown.
 *  • Formula — lovetoknow.com "How to Calculate Your Kua Number": add the last two digits
 *    of the (solar) birth year and reduce to one digit; women: + 5 (before 2000) or + 6
 *    (2000 and after); men: 10 − it (before 2000) or 9 − it (2000 and after); reduce.
 *    Worked examples there: 1981 → woman 5, man 1; 1985 → woman 9, man 6; 2005 →
 *    woman 2, man 4. (For men this equals SCMP's "subtract the number from 11" using the
 *    sum of all four year digits; a 0 — e.g. men born in solar year 2009 — reduces to 9,
 *    which is what SCMP's form gives.)  SCMP's women's rule ("add 5" to the four-digit
 *    sum) is one higher than lovetoknow's worked examples; we follow lovetoknow, which
 *    also matches roxyapi.com's documented example (woman, 15 Jul 1990 → raw 5 → 8).
 *  • Kua 5 — SCMP: "If your kua number is 5, men will need to use the number 2 and
 *    women, 8." (roxyapi.com/docs/guides/feng-shui.md says the same.)
 *  • Groups — SCMP and lovetoknow ("How to Find Your Lucky Feng Shui Directions"): East
 *    group 1, 3, 4, 9 (directions S, N, E, SE); West group 2, 5, 6, 7, 8 (W, SW, NW, NE).
 *  • The four lucky directions per Kua — lovetoknow's table (Wealth / Sheng Chi, Love /
 *    Nien Yen, Health / Tien Yi, Personal growth / Fu Wei). Lovetoknow notes "there are
 *    also four bad luck directions" but its table does not name them per Kua, so we only
 *    say the other four (the other group's) are the less supportive ones.
 * Valid for solar years 1900–2099 (the range the published formula covers).
 */
import * as Astronomy from 'astronomy-engine';

export type Gender = 'male' | 'female';
export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export const DIRECTION_NAMES: Record<Direction, string> = {
  N: 'North', NE: 'North-east', E: 'East', SE: 'South-east', S: 'South', SW: 'South-west', W: 'West', NW: 'North-west',
};

export interface LuckyDirections { wealth: Direction; health: Direction; love: Direction; growth: Direction }

/** lovetoknow.com lucky-direction table (Kua 5 resolved to 2 for men / 8 for women first). */
export const KUA_DIRECTIONS: Record<number, LuckyDirections> = {
  1: { wealth: 'SE', love: 'S', health: 'E', growth: 'N' },
  2: { wealth: 'NE', love: 'NW', health: 'W', growth: 'SW' },
  3: { wealth: 'S', love: 'SE', health: 'N', growth: 'E' },
  4: { wealth: 'N', love: 'E', health: 'S', growth: 'SE' },
  6: { wealth: 'W', love: 'SW', health: 'NE', growth: 'NW' },
  7: { wealth: 'NW', love: 'NE', health: 'SW', growth: 'W' },
  8: { wealth: 'SW', love: 'W', health: 'NW', growth: 'NE' },
  9: { wealth: 'E', love: 'N', health: 'SE', growth: 'S' },
};

export const EAST_GROUP = [1, 3, 4, 9];
const EAST_DIRS: Direction[] = ['S', 'N', 'E', 'SE'];
const WEST_DIRS: Direction[] = ['W', 'SW', 'NW', 'NE'];

const reduce = (n: number): number => { let v = n; while (v > 9) v = String(v).split('').reduce((s, d) => s + Number(d), 0); return v; };

/** Lichun instant (Sun at apparent longitude 315°) of a Gregorian year. */
export function lichunInstant(year: number): Date {
  const r = Astronomy.SearchSunLongitude(315, new Date(Date.UTC(year, 0, 25)), 20);
  if (!r) throw new Error(`no Lichun found for ${year}`);
  return r.date;
}

/** China Standard Time (UTC+8) calendar date of an instant. */
const cstDate = (d: Date) => new Date(d.getTime() + 8 * 3600000).toISOString().slice(0, 10);
/** India time (UTC+5:30) clock "HH:MM" of an instant. */
const istClock = (d: Date) => new Date(d.getTime() + 5.5 * 3600000).toISOString().slice(11, 16);
const cstClock = (d: Date) => new Date(d.getTime() + 8 * 3600000).toISOString().slice(11, 16);

/** Step 1: the last two digits of the solar year added and reduced to one digit (00 → 0). */
export function kuaStep1(solarYear: number): number {
  return reduce(Math.floor((solarYear % 100) / 10) + (solarYear % 10));
}

/** Raw Kua (before the 5 rule) for a solar year. */
export function rawKua(solarYear: number, gender: Gender): number {
  const step1 = kuaStep1(solarYear);
  if (gender === 'female') return reduce(step1 + (solarYear >= 2000 ? 6 : 5));
  const v = (solarYear >= 2000 ? 9 : 10) - step1;
  return v === 0 ? 9 : reduce(v);
}

export interface KuaReading {
  solarYear: number;
  raw: number;
  kua: number;
  reassigned: boolean;
  group: 'East' | 'West';
  lucky: LuckyDirections;
  /** The other group's four directions — less supportive for this Kua. */
  others: Direction[];
}

export function kuaForSolarYear(solarYear: number, gender: Gender): KuaReading {
  if (solarYear < 1900 || solarYear > 2099) throw new RangeError('Kua formula covers solar years 1900–2099');
  const raw = rawKua(solarYear, gender);
  const kua = raw === 5 ? (gender === 'male' ? 2 : 8) : raw;
  const east = EAST_GROUP.includes(kua);
  return { solarYear, raw, kua, reassigned: raw === 5, group: east ? 'East' : 'West', lucky: KUA_DIRECTIONS[kua], others: east ? WEST_DIRS : EAST_DIRS };
}

export interface KuaResult {
  dob: string;
  gender: Gender;
  lichunDateCST: string;
  lichunTimeIST: string;
  lichunTimeCST: string;
  /** 'before' → previous solar year; 'on' → depends on birth time (both shown). */
  boundary: 'before' | 'after' | 'on';
  main: KuaReading;
  /** When born on the Lichun date: the reading if born before the moment (previous solar year). */
  alternative?: KuaReading;
}

export function kuaNumber(dob: string, gender: Gender): KuaResult {
  const y = Number(dob.slice(0, 4));
  const li = lichunInstant(y);
  const liDate = cstDate(li);
  const boundary = dob < liDate ? 'before' : dob > liDate ? 'after' : 'on';
  const main = kuaForSolarYear(boundary === 'before' ? y - 1 : y, gender);
  return {
    dob, gender, lichunDateCST: liDate, lichunTimeIST: istClock(li), lichunTimeCST: cstClock(li), boundary, main,
    ...(boundary === 'on' ? { alternative: kuaForSolarYear(y - 1, gender) } : {}),
  };
}
