/**
 * B21 — ayanamsa choice. AY1: Raman, KP and tropical (Sayana) positions of Sun … Saturn, Rahu and the
 * Lagna for the 22 golden births vs the Swiss Ephemeris (golden/ayanamsaSwiss.json), within 1 arc-minute.
 * AY2: withAyanamsa always restores Lahiri, even when the computation throws.
 */
import { describe, it, expect } from 'vitest';
import ref from './golden/ayanamsaSwiss.json';
import { withAyanamsa, getSiderealLongitude, calculateLagna, getNatalAyanamsa, type AyanamsaChoice } from '../engine/vedicEngine';
import { COUNTS } from '../../accuracy/evidence';

const diff = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d) * 60; };
const BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'] as const;

describe('Ayanamsa choice vs Swiss Ephemeris', () => {
  it('AY1 — every position within 1 arc-minute in Raman, KP and tropical', () => {
    let checks = 0, worst = 0;
    for (const b of ref.births) {
      const t = new Date(b.utc);
      for (const mode of ['raman', 'kp', 'tropical'] as AyanamsaChoice[]) {
        const want = (b as Record<string, unknown>)[mode] as Record<string, number>;
        withAyanamsa(mode, () => {
          for (const p of BODIES) { const d = diff(getSiderealLongitude(p, t, 'natal'), want[p]); worst = Math.max(worst, d); expect(d, `${b.id} ${mode} ${p}`).toBeLessThan(1); checks++; }
          if (Math.abs(b.lat) <= 66) { const d = diff(calculateLagna(t, b.lat, b.lon).ascSidereal, want.Lagna); worst = Math.max(worst, d); expect(d, `${b.id} ${mode} Lagna`).toBeLessThan(1); checks++; }
        });
      }
    }
    // eslint-disable-next-line no-console
    console.log(`[ayanamsa] ${checks} positions, worst ${(worst * 60).toFixed(1)}″`);
    expect(checks).toBe(COUNTS.ayanamsaChecks);
    expect(worst * 60).toBeLessThanOrEqual(COUNTS.ayanamsaMaxArcsec);
  });

  it('AY2 — Lahiri is restored after every call, including a throwing one', () => {
    const t = new Date('2000-01-01T00:00:00Z');
    const lahiri = getNatalAyanamsa(t);
    expect(withAyanamsa('tropical', () => getNatalAyanamsa(t))).toBe(0);
    expect(() => withAyanamsa('raman', () => { throw new Error('x'); })).toThrow();
    expect(getNatalAyanamsa(t)).toBe(lahiri);
    expect(withAyanamsa('raman', () => getNatalAyanamsa(t)) - lahiri).toBeCloseTo(-1.446301, 6);
  });
});
