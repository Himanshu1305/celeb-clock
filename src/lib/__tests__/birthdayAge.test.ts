import { describe, it, expect } from 'vitest';
import { completedYears, completedYearsAtOffset, parseYmdLocal, liveAgeBreakdown as calculateAge } from '../ageBreakdown';
import { ageInYears } from '../vedic/yogaTiming';

// Batch 8 (bug 1). Expected ages are plain calendar facts (whole years completed on the
// birthday), the convention every age calculator uses — no external reference needed.
describe('birthday-aware age (batch 8)', () => {
  it('born 25 Oct 2001: 25 on 25 Oct 2026, 24 the day before (days ÷ 365.25 said 24)', () => {
    const birth = new Date(2001, 9, 25);
    expect(completedYears(birth, new Date(2026, 9, 25, 0, 5))).toBe(25);
    expect(completedYears(birth, new Date(2026, 9, 24, 23, 59))).toBe(24);
    // the old formula, for the record
    const days = Math.floor((new Date(2026, 9, 25, 0, 5).getTime() - birth.getTime()) / 864e5);
    expect(Math.floor(days / 365.25)).toBe(24);
  });

  it('is right on the birthday for every birth year 1930–2025', () => {
    const bad: number[] = [];
    for (let y = 1930; y <= 2025; y++) {
      const b = new Date(y, 9, 25);
      if (completedYears(b, new Date(2026, 9, 25, 0, 1)) !== 2026 - y) bad.push(y);
      if (completedYears(b, new Date(2026, 9, 24, 23, 59)) !== 2026 - y - 1) bad.push(-y);
    }
    expect(bad).toEqual([]);
  });

  it('BirthdayResults page age uses it (years/months/days, total days)', () => {
    const a = calculateAge(new Date(2001, 9, 25), new Date(2026, 9, 25, 10, 0));
    expect([a.years, a.months, a.days]).toEqual([25, 0, 0]);
    expect(a.totalDays).toBe(9131); // 25 × 365 + 6 leap days (2004..2024)
    const b = calculateAge(new Date(2001, 9, 25), new Date(2026, 9, 24, 10, 0));
    expect([b.years, b.months]).toEqual([24, 11]);
  });

  it('parses a YYYY-MM-DD DOB as a local date', () => {
    const d = parseYmdLocal('1990-03-15');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([1990, 2, 15]);
  });

  it('server age reads both instants in the birthplace offset (18th birthday counts on the day)', () => {
    // Born 1 Jan 2008 01:00 IST = 31 Dec 2007 19:30 UTC; "now" = 1 Jan 2026 00:30 IST.
    const birth = new Date(Date.UTC(2007, 11, 31, 19, 30));
    const now = new Date(Date.UTC(2025, 11, 31, 19, 0));
    expect(completedYearsAtOffset(birth, now, 5.5)).toBe(18);
    expect(ageInYears(birth, now, 5.5)).toBe(18);
    // 31 Dec 2025 23:59 IST: still 17
    expect(ageInYears(birth, new Date(Date.UTC(2025, 11, 31, 18, 29)), 5.5)).toBe(17);
  });
});

// Review (batch 8): one 29 Feb convention sitewide — in a non-leap year the birthday (and the
// new age) is 28 Feb, as in calendarAge and nextBirthday. Calendar facts, no external reference.
import { yearsBetween } from '../celebrityFacts';
import { calculateAge as celebAge, calculateDaysUntilBirthday } from '../../utils/celebrityCalculations';
import { vi } from 'vitest';
describe('29 February births: same age on 28 Feb / 1 Mar everywhere', () => {
  const leapling = new Date(2000, 1, 29);
  it('calendar helper: 27 on 28 Feb 2027, still 27 on 1 Mar; 26 on 27 Feb', () => {
    expect(completedYears(leapling, new Date(2027, 1, 27, 12))).toBe(26);
    expect(completedYears(leapling, new Date(2027, 1, 28, 0, 1))).toBe(27);
    expect(completedYears(leapling, new Date(2027, 2, 1, 12))).toBe(27);
    expect(completedYears(leapling, new Date(2028, 1, 28, 12))).toBe(27); // leap year: 29 Feb is the day
    expect(completedYears(leapling, new Date(2028, 1, 29, 0, 1))).toBe(28);
  });
  it('celebrity pages (yearsBetween) agree', () => {
    expect(yearsBetween('2000-02-29', '2027-02-27')).toBe(26);
    expect(yearsBetween('2000-02-29', '2027-02-28')).toBe(27);
    expect(yearsBetween('2000-02-29', '2027-03-01')).toBe(27);
    expect(yearsBetween('2000-02-29', '2028-02-28')).toBe(27);
    expect(yearsBetween('2000-02-29', '2028-02-29')).toBe(28);
  });
  it('celebrityCalculations agree; countdown on 27 Feb 2027 is 1 day', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(new Date(2027, 1, 28, 9));
      expect(celebAge(29, 2, 2000)).toBe(27);
      vi.setSystemTime(new Date(2027, 1, 27, 9));
      expect(celebAge(29, 2, 2000)).toBe(26);
      expect(calculateDaysUntilBirthday(29, 2)).toBe(1);
    } finally { vi.useRealTimers(); }
  });
});
