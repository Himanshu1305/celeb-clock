import { describe, it, expect } from 'vitest';
import {
  computeYearTransit,
  computeMercuryRetrogrades,
  TRANSIT_PLANETS,
} from '../transits';

describe('transit-by-year engine', () => {
  it('computes a reading for each of the 12 Moon signs', () => {
    const t = computeYearTransit('saturn', 2026);
    expect(t.perSign).toHaveLength(12);
    for (const s of t.perSign) {
      expect(['strong', 'moderate', 'mild']).toContain(s.grade);
      expect(['favourable', 'mixed', 'challenging']).toContain(s.tone);
      expect(s.text.length).toBeGreaterThan(20);
      expect(s.house).toBeGreaterThanOrEqual(1);
      expect(s.house).toBeLessThanOrEqual(12);
    }
  });

  it('Saturn stays in Meena (Pisces) through 2026 — no ingress', () => {
    const t = computeYearTransit('saturn', 2026);
    expect(t.startSign).toBe('Meena');
    expect(t.endSign).toBe('Meena');
    expect(t.ingress).toHaveLength(0);
  });

  it('Jupiter changes sign during 2026 with in-year ingress dates', () => {
    const t = computeYearTransit('jupiter', 2026);
    expect(t.ingress.length).toBeGreaterThanOrEqual(1);
    for (const ing of t.ingress) {
      expect(ing.date.startsWith('2026')).toBe(true);
    }
  });

  it('every slow planet has a label, blurb and cycle', () => {
    for (const p of ['saturn', 'jupiter', 'rahu', 'ketu'] as const) {
      expect(TRANSIT_PLANETS[p].label.length).toBeGreaterThan(3);
      expect(TRANSIT_PLANETS[p].blurb.length).toBeGreaterThan(30);
      expect(TRANSIT_PLANETS[p].cycleYears).toBeGreaterThan(0);
    }
  });

  it('Mercury retrogrades ~3 times/year, each ~3 weeks, start before end', () => {
    const r = computeMercuryRetrogrades(2025);
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(r.length).toBeLessThanOrEqual(4);
    for (const p of r) {
      const days = (new Date(p.endISO).getTime() - new Date(p.startISO).getTime()) / 86400000;
      expect(days).toBeGreaterThan(14);
      expect(days).toBeLessThan(30);
      expect(p.startISO < p.endISO).toBe(true);
    }
  });

  it('matches the known first 2025 Mercury retrograde window (mid-Mar to early-Apr)', () => {
    // Published: ~15 Mar – 7 Apr 2025. Allow a ±2-day computation margin.
    const r = computeMercuryRetrogrades(2025);
    const first = r.find(p => p.startISO.startsWith('2025-03'));
    expect(first).toBeTruthy();
    expect(first!.startISO >= '2025-03-13' && first!.startISO <= '2025-03-18').toBe(true);
    expect(first!.endISO >= '2025-04-05' && first!.endISO <= '2025-04-09').toBe(true);
  });
});
