import { describe, it, expect } from 'vitest';
import { probabilityOfReaching, reachPercent } from '../survival';

describe('P(reach 100) estimate', () => {
  it('is monotonic in the forecast and bounded', () => {
    expect(reachPercent(75)).toBeLessThan(reachPercent(85));
    expect(reachPercent(85)).toBeLessThan(reachPercent(95));
    for (const f of [60, 80, 95, 110]) {
      const p = probabilityOfReaching(f);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(0.99);
    }
  });

  it('gives ~50% when the forecast equals the target', () => {
    expect(Math.abs(reachPercent(100) - 50)).toBeLessThan(1);
  });

  it('gives a small single-digit chance at a typical life expectancy', () => {
    const p = reachPercent(81);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(10);
  });

  it('handles invalid input safely', () => {
    expect(probabilityOfReaching(0)).toBe(0);
    expect(probabilityOfReaching(NaN)).toBe(0);
  });
});
