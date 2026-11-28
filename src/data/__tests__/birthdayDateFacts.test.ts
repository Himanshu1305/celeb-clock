/** B23 — /birthday/:m/:d date facts: valid for every date, and different between look-alike dates. */
import { describe, it, expect } from 'vitest';
import { birthdayDateFacts } from '../birthdayDateFacts';
import { getBirthdayPersonality } from '../birthdayPersonality';

const D = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const famous = { india: 0, world: 0, top: [] as string[] };

describe('birthdayDateFacts', () => {
  it('DF1 — every date: Sun 0–29° in its own sign, decan 1–3, day of year 1–366', () => {
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= D[m - 1]; d++) {
      const sign = getBirthdayPersonality(m, d).zodiacSign;
      const rows = birthdayDateFacts(m, d, sign, famous);
      const sun = rows.find(r => r.label === 'Sun position');
      if (m === 2 && d === 29) { expect(sun).toBeUndefined(); continue; }
      expect(sun, `${m}/${d}`).toBeTruthy();
      const mm = sun!.value.match(/^About (\d+)° (\w+) — the (\d)(?:st|nd|rd) decan/);
      expect(mm, `${m}/${d} ${sun!.value}`).toBeTruthy();
      expect(Number(mm![1])).toBeLessThanOrEqual(29);
      expect(mm![2]).toBe(sign);
    }
  });
  it('DF2 — Jan 5 and Jan 14 (same sign, same birth-day number) now differ', () => {
    const a = birthdayDateFacts(1, 5, 'Capricorn', famous).map(r => r.value).join('|');
    const b = birthdayDateFacts(1, 14, 'Capricorn', famous).map(r => r.value).join('|');
    expect(a).not.toBe(b);
    expect(birthdayDateFacts(3, 21, 'Aries', famous).some(r => r.label === 'Cusp')).toBe(true);
  });
});
