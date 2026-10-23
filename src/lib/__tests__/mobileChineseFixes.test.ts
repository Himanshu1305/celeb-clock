/**
 * Audit N9 (mobile numerology) and N11 (Chinese zodiac by Lunar New Year).
 * References: N9 — plain arithmetic, 9+8+1+2+3+4+5+6+7+0 = 45 → 9 (round2.txt N9: "it's 45").
 * N11 — Lunar New Year dates from the audit's reference table (python lunardate /
 * lunar_python, scratchpad round2/N/cny_ref.json): 1990-01-27, 1809/1756 examples per
 * round2.txt ("Mozart Pig not Rat; Lincoln Dragon not Snake").
 */
import { describe, it, expect } from 'vitest';
import { sumMobileDigits, mobileSubscriberDigits } from '@/lib/numerologyTools';
import { calculateChineseZodiac } from '@/utils/celebrityCalculations';
import { getChineseZodiac } from '@/services/ChineseZodiacService';

describe('N9 — mobile number numerology', () => {
  it('98-1234-5670 adds to 45 → 9', () => {
    const r = sumMobileDigits('98-1234-5670');
    expect(r.sum).toBe(45);
    expect(r.root).toBe(9);
  });
  it('+91 / 0091 / 91-prefix / trunk 0 are not counted', () => {
    for (const v of ['+91 98123 45670', '0091 9812345670', '919812345670', '09812345670', '9812345670']) {
      expect(mobileSubscriberDigits(v)).toBe('9812345670');
      expect(sumMobileDigits(v).sum).toBe(45);
    }
  });
});

describe('N11 — Chinese zodiac changes at Lunar New Year', () => {
  it('15 Jan 1990 (before LNY 27 Jan 1990) is Earth Snake on every page; 27 Jan is Metal Horse', () => {
    expect(calculateChineseZodiac(1990, 1, 15)).toMatchObject({ animal: 'Snake', element: 'Earth' });
    expect(getChineseZodiac(new Date(1990, 0, 15, 12))).toMatchObject({ animal: 'Snake', element: 'Earth' });
    expect(calculateChineseZodiac(1990, 1, 27)).toMatchObject({ animal: 'Horse', element: 'Metal' });
  });
  it('the two functions agree for every day 1900–2049', () => {
    for (let t = Date.UTC(1900, 0, 1); t <= Date.UTC(2049, 11, 31); t += 86_400_000) {
      const d = new Date(t);
      const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
      const a = calculateChineseZodiac(y, m, day);
      const b = getChineseZodiac(new Date(y, m - 1, day, 12));
      if (a.animal !== b.animal || a.element !== b.element) throw new Error(`${y}-${m}-${day}: ${a.element} ${a.animal} vs ${b.element} ${b.animal}`);
    }
  });
  it('famous examples are filed under the right animal', () => {
    const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    // 1900 was a Rat year, so 1 July of 1900 + i falls in animal i
    const byAnimal = (a: string) => getChineseZodiac(new Date(1900 + ANIMALS.indexOf(a), 6, 1)).famous;
    expect(byAnimal('Pig')).toContain('Wolfgang Amadeus Mozart');
    expect(byAnimal('Rat')).not.toContain('Mozart');
    expect(byAnimal('Dragon')).toContain('Abraham Lincoln');
    expect(byAnimal('Snake')).not.toContain('Abraham Lincoln');
  });
});
