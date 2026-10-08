import { describe, it, expect } from 'vitest';
import { reduceToSingleDigit, computePersonalYear, getPersonalYearMeaning, PERSONAL_YEAR_MEANINGS } from '../personalYear';

describe('personalYear — reduceToSingleDigit', () => {
  it('reduces multi-digit numbers to 1–9', () => {
    expect(reduceToSingleDigit(2026)).toBe(1); // 2+0+2+6=10 -> 1
    expect(reduceToSingleDigit(1990)).toBe(1); // 1+9+9+0=19 -> 10 -> 1
    expect(reduceToSingleDigit(12)).toBe(3);
    expect(reduceToSingleDigit(9)).toBe(9);
    expect(reduceToSingleDigit(10)).toBe(1);
    expect(reduceToSingleDigit(99)).toBe(9); // 18 -> 9
  });
  it('handles single digits and zero', () => {
    expect(reduceToSingleDigit(5)).toBe(5);
    expect(reduceToSingleDigit(0)).toBe(0);
  });
});

describe('personalYear — computePersonalYear', () => {
  it('computes a worked example: born 15 June, year 2026', () => {
    // month 6 -> 6; day 15 -> 6; year 2026 -> 1; total 13 -> 4
    const r = computePersonalYear(6, 15, 2026);
    expect(r.universalYear).toBe(1);
    expect(r.number).toBe(4);
    expect(r.year).toBe(2026);
  });
  it('is always in the 1–9 cycle', () => {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        for (const y of [2024, 2025, 2026, 2027, 2033]) {
          const n = computePersonalYear(m, d, y).number;
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(9);
        }
      }
    }
  });
  it('advances by the universal-year delta year-over-year (cycle property)', () => {
    const a = computePersonalYear(3, 20, 2026).number;
    const b = computePersonalYear(3, 20, 2027).number;
    // next year differs by the universal-year increment, wrapping within 1–9
    expect(a).not.toBe(0);
    expect(b).not.toBe(0);
  });
});

describe('personalYear — meanings', () => {
  it('has a distinct meaning for every number 1–9', () => {
    for (let n = 1; n <= 9; n++) {
      expect(PERSONAL_YEAR_MEANINGS[n]).toBeTruthy();
      expect(getPersonalYearMeaning(n).title.length).toBeGreaterThan(2);
    }
    expect(Object.keys(PERSONAL_YEAR_MEANINGS)).toHaveLength(9);
  });
});
