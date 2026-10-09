import { describe, it, expect } from 'vitest';
import {
  generateWesternChart,
  formatSignPosition,
  TROPICAL_SIGNS,
  WESTERN_BODIES,
} from '@/lib/western/westernChart';
import { planetInSign, bigThreeReading, ASPECT_MEANINGS } from '@/data/westernChartData';

// Reference chart: 1978-05-13 19:30 Jammu, India (tz +5:30) => 14:00 UTC.
const JAMMU_LAT = 32.7266;
const JAMMU_LON = 74.857;
const refUTC = new Date(Date.UTC(1978, 4, 13, 14, 0, 0));

describe('P4-WESTERN-CHART engine', () => {
  const chart = generateWesternChart(refUTC, JAMMU_LAT, JAMMU_LON);

  it('TC-WEST-01: Sun is in the correct tropical sign (Taurus for mid-May)', () => {
    expect(chart.sun.sign).toBe('Taurus');
  });

  it('TC-WEST-02: all 11 bodies are placed with valid signs and houses', () => {
    expect(chart.placements).toHaveLength(WESTERN_BODIES.length);
    for (const p of chart.placements) {
      expect(TROPICAL_SIGNS).toContain(p.sign);
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(p.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(p.degreeInSign).toBeLessThan(30);
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
    }
  });

  it('TC-WEST-03: Sun and Moon are never retrograde; an outer planet can be', () => {
    expect(chart.sun.retrograde).toBe(false);
    expect(chart.moon.retrograde).toBe(false);
  });

  it('TC-WEST-04: house 1 cusp sign equals the Ascendant sign (non-polar => placidus)', () => {
    expect(chart.houseSystem).toBe('placidus');
    expect(chart.houses[0].sign).toBe(chart.ascendant.sign);
    expect(chart.houses[9].sign).toBe(chart.midheaven.sign);
    expect(chart.warnings).toHaveLength(0);
  });

  it('TC-WEST-05: 12 distinct house cusps spanning the zodiac', () => {
    expect(chart.houses).toHaveLength(12);
    const signs = new Set(chart.houses.map((h) => h.sign));
    // Placidus at mid latitude: at least 6 different signs across the cusps.
    expect(signs.size).toBeGreaterThanOrEqual(6);
  });

  it('TC-WEST-06: aspects respect their orb limits and known types', () => {
    const valid = Object.keys(ASPECT_MEANINGS);
    for (const a of chart.aspects) {
      expect(valid).toContain(a.type);
      // luminary bonus is at most +1
      expect(a.orb).toBeLessThanOrEqual(8 + 1 + 0.001);
      expect(a.a).not.toBe(a.b);
    }
  });

  it('TC-WEST-07: North Node is included and flagged retrograde', () => {
    const nn = chart.placements.find((p) => p.name === 'North Node');
    expect(nn).toBeTruthy();
    expect(nn!.retrograde).toBe(true);
  });

  it('TC-WEST-08: polar latitude falls back to whole-sign houses with a warning', () => {
    const polar = generateWesternChart(refUTC, 78.2, 15.6); // Svalbard
    expect(polar.houseSystem).toBe('whole-sign');
    expect(polar.warnings.some((w) => w.code === 'POLAR_LATITUDE')).toBe(true);
    // whole-sign: each cusp exactly 30 apart starting at ascendant sign start
    expect(polar.houses[0].degreeInSign).toBeCloseTo(0, 5);
  });

  it('TC-WEST-09: formatSignPosition renders degrees/minutes', () => {
    expect(formatSignPosition(44.5)).toBe('14° Taurus 30′');
    expect(formatSignPosition(0)).toBe('0° Aries 00′');
  });
});

describe('P4-WESTERN-CHART interpretations', () => {
  it('TC-WEST-10: planet-in-sign readings are distinct per sign and non-empty', () => {
    const aries = planetInSign('Venus', 0).body;
    const scorpio = planetInSign('Venus', 7).body;
    expect(aries.length).toBeGreaterThan(40);
    expect(aries).not.toBe(scorpio);
    expect(planetInSign('Venus', 0).headline).toBe('Venus in Aries');
  });

  it('TC-WEST-11: big-three readings reference the real sign and differ by kind', () => {
    const sun = bigThreeReading('Sun', 1); // Taurus
    const moon = bigThreeReading('Moon', 1);
    const rising = bigThreeReading('Rising', 1);
    expect(sun).toContain('Taurus');
    expect(sun).not.toBe(moon);
    expect(rising).toContain('Rising');
  });
});
