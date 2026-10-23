/**
 * N10 regression: biorhythm day count must be whole calendar days, independent of
 * time of day and daylight saving. Expected day counts come from Python's
 * datetime.date subtraction (e.g. (date(2026,3,9) - date(1990,5,13)).days == 13084).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { biorhythmDays, biorhythmValues } from '../biorhythm';
import { calculateBiorhythm } from '@/data/biorhythmData';

const ORIG_TZ = process.env.TZ;
afterEach(() => { process.env.TZ = ORIG_TZ; });

const BIRTH = '1990-05-13';
const CASES: [string, number][] = [
  ['2026-03-07', 13082], ['2026-03-08', 13083], ['2026-03-09', 13084], // US DST start 8 Mar 2026
  ['2026-03-29', 13104], // EU DST start 29 Mar 2026
  ['2026-10-25', 13314], // EU DST end 25 Oct 2026
  ['2026-10-31', 13320], ['2026-11-01', 13321], ['2026-11-02', 13322], // US DST end 1 Nov 2026
];

const at = (iso: string, hh: number, mm = 0) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

for (const tz of ['America/New_York', 'Europe/London', 'Asia/Kolkata', 'Australia/Sydney', 'UTC']) {
  describe(`biorhythmDays in ${tz}`, () => {
    for (const [day, expected] of CASES) {
      it(`${day} = ${expected} days at any time of day`, () => {
        process.env.TZ = tz;
        const birthNoon = new Date(1990, 4, 13, 12, 0, 0, 0); // how the pages build the DOB
        for (const [hh, mm] of [[0, 5], [1, 30], [3, 0], [9, 0], [12, 0], [23, 59]]) {
          expect(biorhythmDays(birthNoon, at(day, hh, mm))).toBe(expected);
          expect(biorhythmDays(BIRTH, at(day, hh, mm))).toBe(expected);
        }
      });
    }
  });
}

describe('dashboard and /biorhythm agree', () => {
  it('morning "now" vs noon give identical values (US DST week)', () => {
    process.env.TZ = 'America/New_York';
    const dob = new Date(BIRTH + 'T12:00:00');
    const morning = at('2026-03-09', 7, 15);
    const noon = at('2026-03-09', 12);
    const page = calculateBiorhythm(dob, noon);
    const dash = biorhythmValues(dob, morning);
    expect(dash.days).toBe(13084);
    expect([dash.physical, dash.emotional, dash.intellectual]).toEqual([page.physical, page.emotional, page.intellectual]);
  });
});
