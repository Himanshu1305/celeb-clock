import { describe, it, expect } from 'vitest';
import { birthRangeError } from '../_birthParams';

const ok = { m: 11, d: 5, h: 12, min: 30, lat: 28.6, lon: 77.2, tz: 5.5 };

describe('birthRangeError (Part T input validation)', () => {
  it('accepts valid in-range birth params', () => {
    expect(birthRangeError(ok)).toBeNull();
  });
  it('accepts boundary values', () => {
    expect(birthRangeError({ m: 1, d: 1, h: 0, min: 0, lat: -90, lon: -180, tz: -14 })).toBeNull();
    expect(birthRangeError({ m: 12, d: 31, h: 23, min: 59, lat: 90, lon: 180, tz: 14 })).toBeNull();
  });
  it('rejects out-of-range month/day', () => {
    expect(birthRangeError({ ...ok, m: 13 })).toMatch(/month\/day/);
    expect(birthRangeError({ ...ok, d: 45 })).toMatch(/month\/day/);
    expect(birthRangeError({ ...ok, m: 0 })).toMatch(/month\/day/);
  });
  it('M12: with a year, rejects impossible calendar days (30 Feb, 29 Feb in a non-leap year, 31 Apr)', () => {
    expect(birthRangeError({ ...ok, y: 1990, m: 2, d: 30 })).toMatch(/February 1990 has only 28 days/);
    expect(birthRangeError({ ...ok, y: 2023, m: 2, d: 29 })).toMatch(/28 days/);
    expect(birthRangeError({ ...ok, y: 2024, m: 2, d: 29 })).toBeNull();   // leap year
    expect(birthRangeError({ ...ok, y: 2000, m: 2, d: 29 })).toBeNull();   // 2000 is a leap year
    expect(birthRangeError({ ...ok, y: 1900, m: 2, d: 29 })).toMatch(/28 days/); // 1900 is not
    expect(birthRangeError({ ...ok, y: 1995, m: 4, d: 31 })).toMatch(/April 1995 has only 30 days/);
  });
  it('rejects out-of-range time', () => {
    expect(birthRangeError({ ...ok, h: 99 })).toMatch(/time/);
    expect(birthRangeError({ ...ok, min: 60 })).toMatch(/time/);
  });
  it('rejects impossible location', () => {
    expect(birthRangeError({ ...ok, lat: 200 })).toMatch(/location/);
    expect(birthRangeError({ ...ok, lon: 999 })).toMatch(/location/);
  });
  it('rejects out-of-range timezone', () => {
    expect(birthRangeError({ ...ok, tz: 50 })).toMatch(/timezone/);
  });
  it('rejects non-numeric (NaN from an injection string parsed to Number)', () => {
    expect(birthRangeError({ ...ok, tz: NaN })).toMatch(/non-numeric/);
    expect(birthRangeError({ ...ok, lat: NaN })).toMatch(/non-numeric/);
  });
});
