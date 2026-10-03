/**
 * Homepage "decode" helpers (Part AN). Thin wrappers so the homepage uses the SITE's own
 * computation — never the mockup's copies — and therefore can never disagree with /numerology,
 * /zodiac or /birthstone.
 *
 * Zodiac + Life Path come from the shared celebrityCalculations functions. Birthstone comes from
 * the same BIRTHSTONE_DATA the /birthstone feature displays. Mars age/weight use the constants the
 * spec fixes (Mars year = 1.8808 Earth years; Mars gravity = 0.38× Earth).
 */
import { calculateWesternZodiac, calculateLifePathNumber } from '@/utils/celebrityCalculations';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';

export const MARS_YEAR_IN_EARTH_YEARS = 1.8808;
export const MARS_GRAVITY_FACTOR = 0.38;

/** Western sun sign for a day/month — the site's own function. */
export function zodiacSign(day: number, month: number): string {
  return calculateWesternZodiac(day, month).sign;
}

/** Life Path number for a d/m/y — the site's own function (keeps master numbers 11/22/33). */
export function lifePath(day: number, month: number, year: number): number {
  return calculateLifePathNumber(day, month, year);
}

/** Birthstone for a 1–12 month, from the site's own BIRTHSTONE_DATA (so it can't disagree with /birthstone). */
export function birthstoneForMonth(month: number): string {
  const entry = BIRTHSTONE_DATA[month - 1];
  return entry ? entry.primaryStone : '';
}

/** Age on Mars in Mars years, from a birth Date to `now`. */
export function marsAge(birth: Date, now: Date = new Date()): number {
  const earthYears = (now.getTime() - birth.getTime()) / (365.25 * 86400000);
  return earthYears / MARS_YEAR_IN_EARTH_YEARS;
}

/** Fraction (0–1) through the current Mars year. */
export function marsYearProgress(birth: Date, now: Date = new Date()): number {
  const a = marsAge(birth, now);
  return a - Math.floor(a);
}

/** Weight on Mars for an Earth weight in kg (stated per 70 kg on Earth by default). */
export function marsWeightKg(earthKg = 70): number {
  return earthKg * MARS_GRAVITY_FACTOR;
}

// ── Part AO: born-on weekday + next 1,000-day milestone ──────────────────────
// All date maths is done on calendar dates in UTC so daylight-saving transitions
// can never shift a day boundary and produce an off-by-one weekday or day count.

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const MS_PER_DAY = 86400000;

/** The weekday a person was born on, computed in UTC (DST-safe). */
export function bornOnWeekday(year: number, month: number, day: number): string {
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

/** Whole days lived from the birth date to `now`, counted midnight-to-midnight in UTC. */
export function daysOld(year: number, month: number, day: number, now: Date = new Date()): number {
  const birthUTC = Date.UTC(year, month - 1, day);
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((nowUTC - birthUTC) / MS_PER_DAY);
}

export interface MilestoneInfo {
  daysOld: number;
  /** true when today is exactly a 1,000-day multiple. */
  isMilestoneToday: boolean;
  /** the upcoming (or today's) 1,000-day mark, e.g. 11000. */
  milestone: number;
  /** calendar date (UTC) on which that mark is/was reached. */
  date: Date;
  daysToGo: number;
  /** 0–1 progress through the current 1,000-day block. */
  blockProgress: number;
  prevMilestone: number;
}

/**
 * The next 1,000-day milestone. Leap years are handled automatically because the
 * milestone date is the birth date plus an exact number of days in UTC.
 */
export function nextMilestone(year: number, month: number, day: number, now: Date = new Date()): MilestoneInfo {
  const d = daysOld(year, month, day, now);
  const isMilestoneToday = d > 0 && d % 1000 === 0;
  const prev = Math.floor(d / 1000) * 1000;
  const milestone = isMilestoneToday ? d : prev + 1000;
  const daysToGo = milestone - d;
  const date = new Date(Date.UTC(year, month - 1, day) + milestone * MS_PER_DAY);
  const blockProgress = isMilestoneToday ? 1 : (d - prev) / 1000;
  return { daysOld: d, isMilestoneToday, milestone, date, daysToGo, blockProgress, prevMilestone: prev };
}
