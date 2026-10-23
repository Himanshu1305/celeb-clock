/**
 * Biorhythm day count + cycle values — the ONE shared implementation (N10, Oct 2026).
 *
 * Days lived = whole calendar days from the birth DATE to today's LOCAL date, counted
 * on the UTC calendar (Date.UTC of both calendar dates). Subtracting raw timestamps
 * and dividing by 86 400 000 went one day short whenever a daylight-saving change
 * sat between the two instants (a 23-hour day), and the dashboard (which used "now")
 * disagreed with /biorhythm (which used noon) every morning. Time of day no longer
 * matters. Pure module — also imported by the Worker (api/weekly-digest.ts).
 */
const DAY_MS = 86_400_000;

function utcDayNumber(d: Date | string): number {
  if (typeof d === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
    if (!m) return NaN;
    return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY_MS;
  }
  // A Date is read as the calendar date it shows locally (how every page builds one).
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
}

/** Whole calendar days from the birth date to `target`'s local calendar date. */
export function biorhythmDays(birth: Date | string, target: Date = new Date()): number {
  return Math.round(utcDayNumber(target) - utcDayNumber(birth));
}

export const BIORHYTHM_PERIODS = { physical: 23, emotional: 28, intellectual: 33 } as const;

export function cycleValue(days: number, period: number): number {
  return Math.round(Math.sin((2 * Math.PI * days) / period) * 100);
}

export function biorhythmValues(birth: Date | string, target: Date = new Date()) {
  const days = biorhythmDays(birth, target);
  return {
    days,
    physical: cycleValue(days, BIORHYTHM_PERIODS.physical),
    emotional: cycleValue(days, BIORHYTHM_PERIODS.emotional),
    intellectual: cycleValue(days, BIORHYTHM_PERIODS.intellectual),
  };
}
