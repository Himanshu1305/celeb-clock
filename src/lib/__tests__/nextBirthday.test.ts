import { describe, it, expect } from 'vitest';
import { nextBirthday } from '../nextBirthday';

// S11. Expected day counts are plain calendar arithmetic (2026 is not a leap year; 2028 is).
const d = (y: number, m: number, day: number, h = 10) => new Date(y, m - 1, day, h);

describe('nextBirthday (S11)', () => {
  it('counts days to a birthday later this year', () => {
    const r = nextBirthday(d(1990, 12, 25), d(2026, 10, 23));
    expect(r.days).toBe(63); // 8 (rest of Oct) + 30 (Nov) + 25
    expect(r.weekday).toBe('Friday'); // 25 Dec 2026
    expect(r.turningAge).toBe(36);
    expect(r.isToday).toBe(false);
  });
  it('rolls to next year when passed; tomorrow = 1', () => {
    expect(nextBirthday(d(1990, 1, 1), d(2026, 10, 23)).days).toBe(70);
    expect(nextBirthday(d(1990, 10, 24), d(2026, 10, 23)).days).toBe(1);
  });
  it('on the birthday: isToday and counts to next year (365)', () => {
    const r = nextBirthday(d(1990, 10, 23), d(2026, 10, 23, 23));
    expect(r.isToday).toBe(true);
    expect(r.days).toBe(365);
    expect(r.turningAge).toBe(37);
  });
  it('29 Feb births use 28 Feb in non-leap years and report the next leap day', () => {
    const r = nextBirthday(d(2000, 2, 29), d(2026, 10, 23));
    expect(r.next.getMonth()).toBe(1);
    expect(r.next.getDate()).toBe(28);
    expect(r.next.getFullYear()).toBe(2027);
    expect(r.nextLeapDay!.getFullYear()).toBe(2028);
    const leap = nextBirthday(d(2000, 2, 29), d(2028, 1, 10));
    expect(leap.next.getDate()).toBe(29);
    expect(leap.days).toBe(50); // 21 (rest of Jan) + 29
  });
});
