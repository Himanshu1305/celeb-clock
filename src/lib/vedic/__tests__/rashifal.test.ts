import { describe, it, expect } from 'vitest';
import {
  computeRashifal,
  RASHIS,
  rashiBySlug,
  RASHIFAL_PERIODS,
  type RashifalPeriod,
} from '../rashifal';
import { getSiderealLongitude } from '../engine/vedicEngine';

const REF = new Date('2026-10-09T12:00:00Z');

describe('rashifal engine', () => {
  it('has 12 rashis with worker-valid slugs in sign order', () => {
    expect(RASHIS).toHaveLength(12);
    expect(RASHIS.map(r => r.slug)).toEqual([
      'mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya',
      'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen',
    ]);
    expect(rashiBySlug('mesh')?.english).toBe('Aries');
    expect(rashiBySlug('nope')).toBeUndefined();
  });

  it('computes valid houses (1..12) for every planet and sign', () => {
    for (let s = 0; s < 12; s++) {
      for (const period of RASHIFAL_PERIODS) {
        const r = computeRashifal(s, period, REF);
        for (const t of r.transits) {
          expect(t.house).toBeGreaterThanOrEqual(1);
          expect(t.house).toBeLessThanOrEqual(12);
          expect(['favourable', 'mixed', 'challenging']).toContain(t.tone);
          expect(['strong', 'moderate', 'mild']).toContain(t.grade);
          expect(t.text.length).toBeGreaterThan(40);
        }
        expect(r.sections[0].key).toBe('overview');
        expect(r.sections).toHaveLength(5);
      }
    }
  });

  it('is deterministic for the same inputs', () => {
    const a = computeRashifal(4, 'today', REF);
    const b = computeRashifal(4, 'today', REF);
    expect(a.sections[0].text).toBe(b.sections[0].text);
  });

  it('produces different overviews for different signs on the same day', () => {
    const texts = new Set(RASHIS.map((_, i) => computeRashifal(i, 'today', REF).sections[0].text));
    // Each sign reads the same sky from a different Moon-sign house, so overviews differ.
    expect(texts.size).toBeGreaterThan(6);
  });

  it('house-from-Moon math matches the raw sidereal Saturn position', () => {
    const saturnSign = Math.floor((((getSiderealLongitude('Saturn', REF) % 360) + 360) % 360) / 30);
    const r = computeRashifal(0, 'today', REF); // Moon sign Mesha
    const saturn = r.transits.find(t => t.planet === 'Saturn')!;
    const expectedHouse = (((saturnSign - 0) % 12) + 12) % 12 + 1;
    expect(saturn.house).toBe(expectedHouse);
  });

  it('flags Sade Sati when Saturn is in the 12th/1st/2nd from the Moon', () => {
    const saturnSign = Math.floor((((getSiderealLongitude('Saturn', REF) % 360) + 360) % 360) / 30);
    const sadeSatiMoonSigns = [(saturnSign + 1) % 12, saturnSign, (saturnSign + 11) % 12];
    for (const ms of sadeSatiMoonSigns) {
      const r = computeRashifal(ms, 'today', REF);
      expect(r.transits.find(t => t.planet === 'Saturn')?.sadeSati).toBe(true);
    }
  });

  it('includes real ingress notes only for month/year periods', () => {
    const today = computeRashifal(0, 'today', REF);
    expect(today.ingress).toHaveLength(0);
    const year = computeRashifal(0, 'year', REF);
    // Jupiter changes sign roughly yearly, so a yearly scan should find ≥1 ingress.
    expect(year.ingress.length).toBeGreaterThanOrEqual(1);
    expect(year.ingress.join(' ')).toMatch(/enters .* on .*\d{4}/);
  });
});
