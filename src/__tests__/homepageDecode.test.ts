import { describe, it, expect } from 'vitest';
import { zodiacSign, lifePath, birthstoneForMonth, marsAge, marsWeightKg, bornOnWeekday, daysOld, nextMilestone } from '@/utils/homepageDecode';

// Part AN Step 1/4: verify the SITE's own functions against the spec's verified expected values.
// If any of these fail, a site function disagrees with the spec and must be investigated, not patched here.
describe('homepage decode — verified expected values (Part AN)', () => {
  it('1869-10-02 → Libra, Life Path 9', () => {
    expect(zodiacSign(2, 10)).toBe('Libra');
    expect(lifePath(2, 10, 1869)).toBe(9);
  });
  it('1973-04-24 → Taurus, Life Path 3', () => {
    expect(zodiacSign(24, 4)).toBe('Taurus');
    expect(lifePath(24, 4, 1973)).toBe(3);
  });
  it('1998-01-01 → Capricorn, Life Path 11 (master number preserved)', () => {
    expect(zodiacSign(1, 1)).toBe('Capricorn');
    expect(lifePath(1, 1, 1998)).toBe(11);
  });
  it('1998-03-14 → Pisces, Life Path 8', () => {
    expect(zodiacSign(14, 3)).toBe('Pisces');
    expect(lifePath(14, 3, 1998)).toBe(8);
  });

  it('zodiac boundary dates', () => {
    expect(zodiacSign(19, 1)).toBe('Capricorn');
    expect(zodiacSign(20, 1)).toBe('Aquarius');
    expect(zodiacSign(21, 12)).toBe('Sagittarius');
    expect(zodiacSign(22, 12)).toBe('Capricorn');
    expect(zodiacSign(20, 3)).toBe('Pisces');
    expect(zodiacSign(21, 3)).toBe('Aries');
  });

  it('birthstones match the site birthstone data (Jan→Garnet, Apr→Diamond, Jul→Ruby, Dec→Turquoise/Tanzanite)', () => {
    expect(birthstoneForMonth(1)).toBe('Garnet');
    expect(birthstoneForMonth(4)).toBe('Diamond');
    expect(birthstoneForMonth(7)).toBe('Ruby');
    expect(birthstoneForMonth(12)).toBeTruthy(); // whatever the site lists for December
  });

  it('Mars age uses 1.8808 Earth-year Mars year; Mars weight is 0.38× (26.6 kg per 70 kg)', () => {
    const birth = new Date(2000, 0, 1, 0, 0, 0);
    const now = new Date(2018, 9, 25, 0, 0, 0); // ~18.81 Earth years ≈ 10 Mars years
    expect(Math.round(marsAge(birth, now))).toBe(10);
    expect(marsWeightKg(70)).toBeCloseTo(26.6, 1);
  });

  it('edge cases: leap day + invalid month behave', () => {
    expect(zodiacSign(29, 2)).toBe('Pisces'); // Feb 29 → Pisces
    expect(birthstoneForMonth(13)).toBe('');    // out-of-range month → empty, no crash
  });
});

// Part AO — born-on weekday + next 1,000-day milestone (UTC maths, DST-safe).
describe('born-on weekday (Part AO)', () => {
  it('matches the spec reference weekdays', () => {
    expect(bornOnWeekday(1869, 10, 2)).toBe('Saturday');
    expect(bornOnWeekday(1973, 4, 24)).toBe('Tuesday');
    expect(bornOnWeekday(1998, 3, 14)).toBe('Saturday');
  });
});

describe('next 1,000-day milestone (Part AO)', () => {
  it('counts whole days in UTC (midnight-to-midnight)', () => {
    // born 2000-01-01, "now" 2000-01-11 → 10 days old
    expect(daysOld(2000, 1, 1, new Date(Date.UTC(2000, 0, 11, 23, 0, 0)), 'UTC')).toBe(10);
  });

  it('spans leap years correctly (milestone date = birth + exact days)', () => {
    // 2000-01-01 + 1000 days. 2000 is a leap year (366 days) → 2000 uses 366 incl Feb 29.
    const ms = nextMilestone(2000, 1, 1, new Date(Date.UTC(2000, 5, 1)), 'UTC');
    expect(ms.milestone).toBe(1000);
    // 1000 days after 2000-01-01 = 2002-09-27 (verified against day arithmetic)
    expect(ms.date.getUTCFullYear()).toBe(2002);
    expect(ms.date.getUTCMonth() + 1).toBe(9);
    expect(ms.date.getUTCDate()).toBe(27);
  });

  it('on the exact milestone day: isMilestoneToday, zero to go, full progress', () => {
    // find the day that is exactly 10000 days after 1990-06-15
    const birth = Date.UTC(1990, 5, 15);
    const dayMs = birth + 10000 * 86400000;
    const now = new Date(dayMs + 3600_000); // a few hours into that UTC day
    const ms = nextMilestone(1990, 6, 15, now, 'UTC');
    expect(ms.daysOld).toBe(10000);
    expect(ms.isMilestoneToday).toBe(true);
    expect(ms.milestone).toBe(10000);
    expect(ms.daysToGo).toBe(0);
    expect(ms.blockProgress).toBe(1);
  });

  it('the day before a milestone: one day to go, 999/1000 progress', () => {
    const birth = Date.UTC(1990, 5, 15);
    const dayBeforeMs = birth + 9999 * 86400000;
    const now = new Date(dayBeforeMs + 3600_000);
    const ms = nextMilestone(1990, 6, 15, now, 'UTC');
    expect(ms.daysOld).toBe(9999);
    expect(ms.isMilestoneToday).toBe(false);
    expect(ms.milestone).toBe(10000);
    expect(ms.daysToGo).toBe(1);
    expect(ms.blockProgress).toBeCloseTo(0.999, 3);
  });
});

// Batch 8 (bug 2): days lived are counted on the user's LOCAL calendar date. Fixed clocks.
// Expected values are plain calendar arithmetic: 2000-01-01 → 2026-10-26 is 9,795 days
// (26 years × 365 + 7 leap days [2000,04,08,12,16,20,24] + 298 days from 1 Jan to 26 Oct 2026).
describe('daysOld uses the local calendar date (batch 8)', () => {
  // 26 Oct 2026 00:10 IST = 25 Oct 2026 18:40 UTC
  const at0010 = new Date(Date.UTC(2026, 9, 25, 18, 40));
  // 26 Oct 2026 05:29 IST = 25 Oct 23:59 UTC; 05:31 IST = 26 Oct 00:01 UTC
  const at0529 = new Date(Date.UTC(2026, 9, 25, 23, 59));
  const at0531 = new Date(Date.UTC(2026, 9, 26, 0, 1));
  it('India: same count at 00:10, 05:29 and 05:31 IST', () => {
    for (const t of [at0010, at0529, at0531]) expect(daysOld(2000, 1, 1, t, 'Asia/Kolkata')).toBe(9795);
  });
  it('UTC reading would have been one short before 05:30 IST (the old bug)', () => {
    expect(daysOld(2000, 1, 1, at0529, 'UTC')).toBe(9794);
    expect(daysOld(2000, 1, 1, at0531, 'UTC')).toBe(9795);
  });
  it('New York: 25 Oct 2026 21:00 EDT (= 26 Oct 01:00 UTC) is still 25 Oct locally', () => {
    expect(daysOld(2000, 1, 1, new Date(Date.UTC(2026, 9, 26, 1, 0)), 'America/New_York')).toBe(9794);
  });
  it('default (no zone) uses the runtime local date', () => {
    const local = new Date(2026, 9, 26, 0, 10); // 00:10 local, whatever the runtime zone is
    expect(daysOld(2000, 1, 1, local)).toBe(9795);
    expect(nextMilestone(2000, 1, 1, local).daysOld).toBe(9795);
  });
});

