/**
 * Batch 10 — Gowri Panchangam (Tamil "Nalla Neram"), Tarabalam and Chandrabalam.
 * Pure tables + arithmetic, no engine imports (Worker-safe: the daily Panchang template
 * uses this file).
 *
 * GOWRI PANCHANGAM. Day (sunrise → sunset) and night (sunset → next sunrise) are each
 * cut into eight equal parts — the same boundaries as the Choghadiya — and each part gets
 * one of eight names in a fixed order for the weekday. Five are good (Amirdha, Dhanam,
 * Uthi, Laabam, Sugam) and three are avoided (Rogam, Soram, Visham). Drik Panchang
 * (https://www.drikpanchang.com/tamil/tamil-gowri-panchangam.html, opened 29 Oct 2026):
 * "All Gowri Panchangam timings, including Nalla Neram, are based on Gowri Panchangam
 * table published in respected Pambu Panchangam"; "In Panchang day starts and ends with
 * sunrise"; good = Amirdha, Dhanam, Uthi, Laabam, Sugam; bad = Rogam, Soram, Visham.
 * So "Gowri Nalla Neram" = the good Gowri parts. (Some Tamil sheet calendars also print a
 * fixed-clock "Nalla Neram"; we do not show that list — we could not source its table.)
 *
 * The weekday order (day and night) is read off pages opened on 29 Oct 2026:
 *  - Drik Panchang Gowri page: Thursday 29 Oct 2026 New Delhi (day + night), Sunday
 *    25 Oct 2026 New Delhi (day + night), Thursday 26 Feb 2026 Lancaster CA (day + night).
 *  - kundligpt.com/gowri-panchangam: all seven weekdays, day + night (29 Oct – 4 Nov 2026).
 *  - shubhpanchang.com/gowri-panchang weekly table: all seven weekdays (day); its
 *    performance.shubhpanchang.com copy: Tuesday 1 Sep 2026 day + night.
 *  - muhuratam.in/gowri-panchang: Delhi Sun 12 Jul 2026, Chennai + Kolkata Wed 19 Aug 2026,
 *    Rajkot Sat 9 May 2026 (day; its night list matches in 7 of 8 slots, one garbled);
 *    cosmicsquares.com Fri 30 Oct 2026 (day + night).
 * Every weekday's day order is confirmed by at least two of these; the night orders by at
 * least two except Monday night (kundligpt only; tamildot's chart agrees on its first
 * four slots). Note the night order is NOT simply another weekday's day order (Sunday).
 *
 * TARABALAM / CHANDRABALAM — the rule as Drik Panchang's day pages apply it (read off
 * New Delhi 6 Aug 2021 and 22 Aug 2021, Lancaster CA 14 Nov 2025; see
 * __tests__/gowriTara.test.ts). Tarabalam: count from your birth Nakshatra to the day's
 * Nakshatra (inclusive), take the remainder by 9 — the 2nd (Sampat), 4th (Kshema),
 * 6th (Sadhana), 8th (Mitra) and 9th (Parama Mitra) taras are good. Chandrabalam: the
 * Moon's sign counted from your Moon sign is good in the 1st, 3rd, 6th, 7th, 10th and
 * 11th houses; the 8th is "Ashtama Chandra". Both are listed per span: until the
 * Nakshatra / Moon sign changes, then until the next sunrise.
 */

export const GOWRI_NAMES = ['Amirdha', 'Dhanam', 'Uthi', 'Laabam', 'Sugam', 'Soram', 'Visham', 'Rogam'] as const;
export type GowriName = typeof GOWRI_NAMES[number];
export const GOWRI_GOOD: ReadonlySet<GowriName> = new Set(['Amirdha', 'Dhanam', 'Uthi', 'Laabam', 'Sugam']);
/** Plain note for each name (Drik's labels: Best, Wealth, Good, Gain, Good, Bad, Bad, Evil — the bad ones phrased calmly). */
export const GOWRI_MEANING: Record<GowriName, string> = {
  Amirdha: 'best', Dhanam: 'good — wealth', Uthi: 'good', Laabam: 'good — gain', Sugam: 'good — comfort',
  Soram: 'avoid for new starts', Visham: 'avoid for new starts', Rogam: 'avoid for new starts',
};
export const GOWRI_TAMIL: Record<GowriName, string> = {
  Amirdha: 'அமிர்தம்', Dhanam: 'தனம்', Uthi: 'உத்தி', Laabam: 'லாபம்', Sugam: 'சுகம்', Soram: 'சோரம்', Visham: 'விஷம்', Rogam: 'ரோகம்',
};

type G = GowriName;
/** weekday 0 = Sunday … 6 = Saturday → the eight day parts (sunrise → sunset). */
export const GOWRI_DAY: readonly (readonly G[])[] = [
  ['Uthi', 'Amirdha', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Visham'],
  ['Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi'],
  ['Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Visham', 'Amirdha'],
  ['Laabam', 'Dhanam', 'Sugam', 'Soram', 'Visham', 'Uthi', 'Amirdha', 'Rogam'],
  ['Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam'],
  ['Sugam', 'Soram', 'Uthi', 'Visham', 'Amirdha', 'Rogam', 'Laabam', 'Dhanam'],
  ['Soram', 'Uthi', 'Visham', 'Amirdha', 'Rogam', 'Laabam', 'Dhanam', 'Sugam'],
];
/** weekday → the eight night parts (sunset → next sunrise). */
export const GOWRI_NIGHT: readonly (readonly G[])[] = [
  ['Dhanam', 'Sugam', 'Soram', 'Visham', 'Uthi', 'Amirdha', 'Rogam', 'Laabam'],
  ['Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam'],
  ['Soram', 'Uthi', 'Visham', 'Amirdha', 'Rogam', 'Laabam', 'Dhanam', 'Sugam'],
  ['Uthi', 'Amirdha', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Visham'],
  ['Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi'],
  ['Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Visham', 'Amirdha'],
  ['Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Visham', 'Amirdha', 'Rogam'],
];

export interface GowriSlot { name: GowriName; good: boolean; start: number; end: number }

/**
 * The 16 Gowri slots of a Panchang day from its 17 boundaries in minutes since local
 * midnight (8 day-part starts, sunset, 7 night-part starts, next sunrise — exactly the
 * Choghadiya boundaries the daily Panchang data already stores).
 */
export function gowriSlots(weekday: number, bounds: readonly number[]): { day: GowriSlot[]; night: GowriSlot[] } {
  const mk = (names: readonly G[], from: number) => names.map((name, i) => ({ name, good: GOWRI_GOOD.has(name), start: bounds[from + i], end: bounds[from + i + 1] }));
  return { day: mk(GOWRI_DAY[weekday], 0), night: mk(GOWRI_NIGHT[weekday], 8) };
}

/** Rashi names as Drik Panchang prints them (Mesha … Meena). */
export const RASHI_NAMES = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'] as const;

export const TARA_NAMES = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhana', 'Naidhana', 'Mitra', 'Parama Mitra'] as const;
/** Good taras (1-based): Sampat, Kshema, Sadhana, Mitra, Parama Mitra. */
export const GOOD_TARAS = [2, 4, 6, 8, 9];
/** Tara (1..9) of the day's Nakshatra counted from a birth Nakshatra (both 0..26). */
export function taraOf(birthNak: number, dayNak: number): number {
  return (((dayNak - birthNak) % 27 + 27) % 27) % 9 + 1;
}
/** Birth Nakshatras (0..26) with good Tarabalam while the Moon is in `dayNak`, in order. */
export function goodTarabalam(dayNak: number): number[] {
  return Array.from({ length: 27 }, (_, b) => b).filter(b => GOOD_TARAS.includes(taraOf(b, dayNak)));
}

/** Houses (1-based) from the birth Moon sign that give good Chandrabalam. */
export const GOOD_CHANDRA_HOUSES = [1, 3, 6, 7, 10, 11];
/** House (1..12) of the day's Moon sign counted from a birth Moon sign. */
export function chandraHouse(birthSign: number, daySign: number): number {
  return (((daySign - birthSign) % 12) + 12) % 12 + 1;
}
/** Birth Moon signs (0..11) with good Chandrabalam while the Moon is in `daySign`. */
export function goodChandrabalam(daySign: number): number[] {
  return Array.from({ length: 12 }, (_, b) => b).filter(b => GOOD_CHANDRA_HOUSES.includes(chandraHouse(b, daySign)));
}
/** The birth Moon sign for which the day's Moon is in the 8th (Ashtama Chandra). */
export function ashtamaChandraSign(daySign: number): number {
  return ((daySign - 7) % 12 + 12) % 12;
}
