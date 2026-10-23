/**
 * THE Life Path number for BornClock — one shared function sitewide (audit N1).
 *
 * Founder decision (23 Oct 2026): use the method most public calculators use —
 * reduce the DAY, MONTH and YEAR separately (keeping the master numbers 11/22/33
 * at each step), add the three, then reduce the total, again keeping 11/22/33.
 *
 *   15 Aug 1990 → day 15 → 6 · month 8 · year 1990 → 19 → 10 → 1 · 6 + 8 + 1 = 15 → 6
 *
 * (Summing every digit of the date at once — the "full-string" method — gives 33
 * for that date, which is why the site used to show two different answers.)
 *
 * Every page, the paid report, the emails and the tests must call this module;
 * do not re-implement the reduction anywhere else.
 */

export const MASTER_NUMBERS: readonly number[] = [11, 22, 33];

/** Sum of the decimal digits of a non-negative integer. */
export function digitSum(n: number): number {
  return String(Math.abs(Math.trunc(n))).split('').reduce((s, d) => s + Number(d), 0);
}

/** Reduce to 1–9, but stop at a master number (11, 22, 33). */
export function reduceKeepingMaster(n: number): number {
  let x = Math.abs(Math.trunc(n));
  while (x > 9 && !MASTER_NUMBERS.includes(x)) x = digitSum(x);
  return x;
}

/** The chain of sums a value goes through while reducing, e.g. 1990 → [19, 10, 1]. */
function reductionChain(n: number): number[] {
  const chain: number[] = [];
  let x = Math.abs(Math.trunc(n));
  while (x > 9 && !MASTER_NUMBERS.includes(x)) { x = digitSum(x); chain.push(x); }
  return chain;
}

export interface LifePathWorking {
  day: number; month: number; year: number;
  dayReduced: number; monthReduced: number; yearReduced: number;
  /** dayReduced + monthReduced + yearReduced, before the final reduction. */
  total: number;
  /** The Life Path number (1–9, 11, 22 or 33). */
  number: number;
  isMaster: boolean;
  /** Human-readable working, e.g. "Day 15 → 6 · Month 8 → 8 · Year 1990 → 19 → 10 → 1 · 6 + 8 + 1 = 15 → 6". */
  steps: string;
}

function chainText(label: string, value: number): string {
  const chain = reductionChain(value);
  return `${label} ${value}${chain.length ? ' → ' + chain.join(' → ') : ''}`;
}

/** Full working for a day/month/year. */
export function lifePathWorking(day: number, month: number, year: number): LifePathWorking {
  const dayReduced = reduceKeepingMaster(day);
  const monthReduced = reduceKeepingMaster(month);
  const yearReduced = reduceKeepingMaster(year);
  const total = dayReduced + monthReduced + yearReduced;
  const number = reduceKeepingMaster(total);
  const totalChain = reductionChain(total);
  const steps = [
    chainText('Day', day),
    chainText('Month', month),
    chainText('Year', year),
    `${dayReduced} + ${monthReduced} + ${yearReduced} = ${total}${totalChain.length ? ' → ' + totalChain.join(' → ') : ''}`,
  ].join(' · ');
  return { day, month, year, dayReduced, monthReduced, yearReduced, total, number, isMaster: MASTER_NUMBERS.includes(number), steps };
}

/** Life Path number for a day (1–31), month (1–12) and full year. */
export function lifePathNumber(day: number, month: number, year: number): number {
  return lifePathWorking(day, month, year).number;
}

/** Life Path from a JS Date, using its LOCAL calendar date parts. */
export function lifePathFromDate(date: Date): number {
  return lifePathNumber(date.getDate(), date.getMonth() + 1, date.getFullYear());
}

/** Life Path from an ISO "YYYY-MM-DD" string (no time-zone involvement). */
export function lifePathFromIso(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return lifePathNumber(d, m, y);
}
