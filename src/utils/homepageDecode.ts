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
