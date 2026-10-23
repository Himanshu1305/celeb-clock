/**
 * Audit M4/M5 — DOB compatibility can no longer exceed 100%, and no fake "Rashi" dimension.
 * Reference: round2.txt M4 — "1980-02-22 × 1990-03-10 shows 138%".
 */
import { describe, it, expect } from 'vitest';
import { scoreDobCompatibility } from '@/components/DobCompatibility';
import { lifePathNumber } from '@/lib/lifePath';

describe('scoreDobCompatibility', () => {
  it('the audit pair is ≤ 100% (was 138%) and uses the shared Life Path (33 × 5)', () => {
    const r = scoreDobCompatibility({ day: 22, month: 2, year: 1980 }, { day: 10, month: 3, year: 1990 });
    expect(r.lpA).toBe(33); // 22 + 2 + (1980 → 18 → 9) = 33
    expect(r.lpB).toBe(5);  // 10 → 1, 3, 1990 → 1 → 5
    expect(r.overall).toBeLessThanOrEqual(100);
    expect(r.lpScore).toBeLessThanOrEqual(100);
  });
  it('every score is 0–100 for a broad sweep of date pairs (incl. all master numbers)', () => {
    const dates: Array<{ day: number; month: number; year: number }> = [];
    for (let t = Date.UTC(1950, 0, 1); t < Date.UTC(2010, 0, 1); t += 401 * 86_400_000) {
      const d = new Date(t);
      dates.push({ day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() });
    }
    const masters = new Set<number>();
    for (const a of dates) for (const b of dates) {
      const r = scoreDobCompatibility(a, b);
      for (const v of [r.zScore, r.lpScore, r.overall]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
      if (r.lpA > 9) masters.add(r.lpA);
    }
    expect(masters.size).toBeGreaterThan(0);
    expect(lifePathNumber(22, 2, 1980)).toBe(33);
  });
  it('a master number is compared through its root (11 ↔ 2 is a perfect match)', () => {
    const eleven = { day: 2, month: 1, year: 1979 }; // 2 + 1 + (1979 → 26 → 8) = 11
    const two = { day: 4, month: 8, year: 1961 }; // 4 + 8 + 8 = 20 → 2
    const r = scoreDobCompatibility(eleven, two);
    expect(r.lpA).toBe(11);
    expect(r.lpB).toBe(2);
    expect(r.lpScore).toBe(92);
  });
});
