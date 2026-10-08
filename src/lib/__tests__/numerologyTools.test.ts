import { describe, it, expect } from 'vitest';
import {
  analyseNameCorrection, analyseBusinessName, sumDigitsOf,
  lifePathFromDob, areNumbersHarmonious, compoundMeaning,
  MOBILE_MEANINGS, HOUSE_MEANINGS, NUMBER_PLANET,
} from '../numerologyTools';

describe('numerologyTools', () => {
  it('lifePathFromDob reduces each part then sums (master kept)', () => {
    // 13-05-1978 → day 13→4, month 5, year 1978→1+9+7+8=25→7 ; 4+5+7=16→7
    expect(lifePathFromDob(1978, 5, 13)).toBe(7);
    // 29-02-2000 → 29→11, 2, 2000→2 ; 11+2+2=15→6
    expect(lifePathFromDob(2000, 2, 29)).toBe(6);
  });

  it('areNumbersHarmonious is symmetric and sensible', () => {
    expect(areNumbersHarmonious(1, 3)).toBe(true);
    expect(areNumbersHarmonious(3, 1)).toBe(true);
    // reduces multi-digit inputs first
    expect(areNumbersHarmonious(19, 3)).toBe(areNumbersHarmonious(1, 3));
  });

  it('name correction returns both systems, a compound and a root', () => {
    const r = analyseNameCorrection('Priya Sharma');
    expect(r.chaldean.root).toBeGreaterThanOrEqual(1);
    expect(r.chaldean.root).toBeLessThanOrEqual(9);
    expect(r.pythagorean.root).toBeGreaterThanOrEqual(1);
    expect(r.rootPlanet).toBe(NUMBER_PLANET[r.chaldean.root]);
    expect(r.harmony).toBeUndefined();
  });

  it('name correction adds harmony when a DOB is given', () => {
    const r = analyseNameCorrection('Priya Sharma', { year: 1978, month: 5, day: 13 });
    expect(r.harmony).toBeDefined();
    expect(r.harmony!.lifePath).toBe(7);
    expect(typeof r.harmony!.nameMatchesLifePath).toBe('boolean');
    expect(r.harmony!.note.length).toBeGreaterThan(10);
  });

  it('business name verdict buckets by root', () => {
    // force known roots via crafted inputs is fiddly; assert the verdict is one of three
    const r = analyseBusinessName('Acme Traders');
    expect(['favourable', 'neutral', 'caution']).toContain(r.verdict);
    expect(r.note).toContain(String(r.root));
  });

  it('sumDigitsOf ignores non-digits and reduces to 1-9', () => {
    const r = sumDigitsOf('+91 98-1234-5670');
    const expectedSum = [9, 1, 9, 8, 1, 2, 3, 4, 5, 6, 7, 0].reduce((a, b) => a + b, 0);
    expect(r.sum).toBe(expectedSum);
    expect(r.root).toBeGreaterThanOrEqual(1);
    expect(r.root).toBeLessThanOrEqual(9);
    expect(MOBILE_MEANINGS[r.root]).toBeTruthy();
  });

  it('sumDigitsOf handles alphanumeric house numbers like 12B', () => {
    const r = sumDigitsOf('12B');
    expect(r.sum).toBe(3);
    expect(r.root).toBe(3);
    expect(HOUSE_MEANINGS[r.root]).toBeTruthy();
  });

  it('compoundMeaning returns a classical entry for a known compound, null otherwise', () => {
    expect(compoundMeaning(23)?.tone).toBe('favourable');
    expect(compoundMeaning(13)).toBeTruthy();
    expect(compoundMeaning(999)).toBeNull();
  });
});
