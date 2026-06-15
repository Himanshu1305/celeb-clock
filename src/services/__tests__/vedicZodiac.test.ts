import { describe, it, expect } from 'vitest';
import { getVedicRashi, getWesternSign, compareZodiacs } from '../VedicZodiacService';

describe('getWesternSign — tropical zodiac', () => {
  it('VZ1: March 21 → Aries', () => {
    expect(getWesternSign(new Date('2000-03-21T12:00:00'))).toBe('Aries');
  });
  it('VZ2: June 15 → Gemini', () => {
    expect(getWesternSign(new Date('1990-06-15T12:00:00'))).toBe('Gemini');
  });
  it('VZ3: December 25 → Capricorn', () => {
    expect(getWesternSign(new Date('1985-12-25T12:00:00'))).toBe('Capricorn');
  });
  it('VZ4: February 14 → Aquarius', () => {
    expect(getWesternSign(new Date('1995-02-14T12:00:00'))).toBe('Aquarius');
  });
});

describe('getVedicRashi — sidereal zodiac', () => {
  it('VZ5: result has all required fields', () => {
    const rashi = getVedicRashi(new Date('1990-06-15T12:00:00'));
    expect(rashi).toHaveProperty('name');
    expect(rashi).toHaveProperty('english');
    expect(rashi).toHaveProperty('symbol');
    expect(rashi).toHaveProperty('emoji');
    expect(rashi).toHaveProperty('ruling_planet');
    expect(rashi).toHaveProperty('element');
    expect(rashi).toHaveProperty('traits');
    expect(Array.isArray(rashi.traits)).toBe(true);
  });

  it('VZ6: returns a valid sign name', () => {
    const validSigns = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
      'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
    const rashi = getVedicRashi(new Date('1985-05-15T12:00:00'));
    expect(validSigns).toContain(rashi.name);
  });
});

describe('compareZodiacs — side-by-side comparison', () => {
  it('VZ7: returns westernSign, vedicRashi, isSame, note', () => {
    const result = compareZodiacs(new Date('1990-06-15T12:00:00'));
    expect(result).toHaveProperty('westernSign');
    expect(result).toHaveProperty('vedicRashi');
    expect(result).toHaveProperty('isSame');
    expect(result).toHaveProperty('note');
    expect(typeof result.isSame).toBe('boolean');
    expect(typeof result.note).toBe('string');
    expect(result.note.length).toBeGreaterThan(0);
  });

  it('VZ8: note message differs for same vs different signs', () => {
    const date1 = new Date('2000-04-01T12:00:00');
    const date2 = new Date('1990-03-21T12:00:00');
    const r1 = compareZodiacs(date1);
    const r2 = compareZodiacs(date2);
    if (r1.isSame) {
      expect(r1.note).toContain('sweet spot');
    } else {
      expect(r1.note).toContain('ayanamsa');
    }
    if (r2.isSame) {
      expect(r2.note).toContain('sweet spot');
    } else {
      expect(r2.note).toContain('ayanamsa');
    }
  });
});
