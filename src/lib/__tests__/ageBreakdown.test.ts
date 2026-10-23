import { describe, it, expect } from 'vitest';
import { calendarAge } from '../ageBreakdown';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);

// Audit round2 S10: born 31 Jan 2000, viewed 1 Mar 2026 showed "26y 1m -2d".
// Expected values follow the "add months, clamp to month end" convention
// (31 Jan + 1 month = 28 Feb), documented in src/lib/ageBreakdown.ts.
describe('calendarAge (S10)', () => {
  it('audit case: 31 Jan 2000 -> 1 Mar 2026 has no negative days', () => {
    expect(calendarAge(d(2000, 1, 31), d(2026, 3, 1))).toEqual({ years: 26, months: 1, days: 1 });
  });
  it('leap-year Feb: 31 Jan 2000 -> 1 Mar 2024', () => {
    expect(calendarAge(d(2000, 1, 31), d(2024, 3, 1))).toEqual({ years: 24, months: 1, days: 1 });
  });
  it('exact birthday', () => {
    expect(calendarAge(d(1990, 6, 15), d(2026, 6, 15))).toEqual({ years: 36, months: 0, days: 0 });
  });
  it('day before birthday', () => {
    expect(calendarAge(d(1990, 6, 15), d(2026, 6, 14))).toEqual({ years: 35, months: 11, days: 30 });
  });
  it('29 Feb birth: 28 Feb non-leap, 1 Mar, and 29 Feb leap', () => {
    expect(calendarAge(d(2000, 2, 29), d(2025, 2, 28))).toEqual({ years: 25, months: 0, days: 0 });
    expect(calendarAge(d(2000, 2, 29), d(2025, 3, 1))).toEqual({ years: 25, months: 0, days: 1 });
    expect(calendarAge(d(2000, 2, 29), d(2028, 2, 29))).toEqual({ years: 28, months: 0, days: 0 });
    expect(calendarAge(d(2000, 2, 29), d(2028, 2, 28))).toEqual({ years: 27, months: 11, days: 30 });
  });
  it('31st birth across 30-day months', () => {
    expect(calendarAge(d(2000, 3, 31), d(2026, 4, 30))).toEqual({ years: 26, months: 1, days: 0 });
    expect(calendarAge(d(2000, 3, 31), d(2026, 5, 1))).toEqual({ years: 26, months: 1, days: 1 });
    expect(calendarAge(d(2000, 3, 31), d(2026, 5, 31))).toEqual({ years: 26, months: 2, days: 0 });
  });
  it('year boundary', () => {
    expect(calendarAge(d(2000, 12, 31), d(2026, 1, 1))).toEqual({ years: 25, months: 0, days: 1 });
  });
  it('same day as birth and future birth give zeros', () => {
    expect(calendarAge(d(2026, 3, 1), d(2026, 3, 1))).toEqual({ years: 0, months: 0, days: 0 });
    expect(calendarAge(d(2027, 3, 1), d(2026, 3, 1))).toEqual({ years: 0, months: 0, days: 0 });
  });
  it('invariants over every birth day of 2000 x every view day of 2026', () => {
    const bad: string[] = [];
    for (let b = new Date(2000, 0, 1, 12); b.getFullYear() === 2000; b.setDate(b.getDate() + 1)) {
      let prevTotal = -1;
      for (let n = new Date(2026, 0, 1, 12); n.getFullYear() === 2026; n.setDate(n.getDate() + 1)) {
        const a = calendarAge(b, n);
        const total = a.years * 12 + a.months;
        // whole months never go backwards as the view date advances
        if (a.days < 0 || a.days > 30 || a.months < 0 || a.months > 11 || total < prevTotal) {
          bad.push(`${b.toDateString()} -> ${n.toDateString()}: ${JSON.stringify(a)}`);
        }
        prevTotal = total;
      }
    }
    expect(bad).toEqual([]);
  });
});
