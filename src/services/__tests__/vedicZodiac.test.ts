import { describe, it, expect } from 'vitest';
import { getVedicRashi, getWesternSign, compareZodiacs, currentAyanamsaDeg } from '../VedicZodiacService';

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

// N12 regression: Sun's sidereal sign from the chart engine's Lahiri ayanamsa.
// Expected signs + longitudes from Swiss Ephemeris (pyswisseph, SIDM_LAHIRI, Sun at
// 12:00 IST = 06:30 UTC) run in scratchpad/engine-audit/venv. The old fixed-23.85°
// formula put every one of these in the NEXT sign.
describe('N12 — getVedicRashi uses the engine ayanamsa (Swiss Ephemeris reference)', () => {
  const CASES: [string, string, number][] = [
    ['2024-02-13', 'Makara', 299.843],
    ['2024-04-13', 'Meena', 359.629],
    ['2024-05-14', 'Mesha', 29.763],
    ['2024-06-14', 'Vrishabha', 59.504],
    ['2024-12-15', 'Vrishchika', 239.568],
    ['1995-06-15', 'Vrishabha', 59.917],
  ];
  for (const [date, rashi, lon] of CASES) {
    it(`${date} noon IST → ${rashi} (Swiss sidereal Sun ${lon}°)`, () => {
      expect(getVedicRashi(new Date(`${date}T06:30:00Z`)).name).toBe(rashi);
    });
  }
  it('current ayanamsa shown is the engine value (~24.2° in Oct 2026), not 23.85°', () => {
    // Swiss Ephemeris SIDM_LAHIRI on 2026-10-23 0h UT: 24.2316°
    expect(currentAyanamsaDeg(new Date('2026-10-23T00:00:00Z'))).toBeCloseTo(24.2316, 1);
  });
});
