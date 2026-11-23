import { describe, it, expect } from 'vitest';
import { calculatePapasamyam, papaPoints, houseFrom, papaInputFromChart } from '../papasamyam';

const chart = (lagnaSign: number, moonSign: number, venusSign: number, Mars: number, Saturn: number, Sun: number, Rahu: number) =>
  ({ lagnaSign, moonSign, venusSign, signs: { Mars, Saturn, Sun, Rahu } });

describe('papasamyam (Kerala malefic balance)', () => {
  it('counts houses whole-sign, same sign = 1', () => {
    expect(houseFrom(0, 0)).toBe(1);
    expect(houseFrom(0, 6)).toBe(7);
    expect(houseFrom(10, 9)).toBe(12);
    expect(houseFrom(11, 0)).toBe(2);
  });

  it('weights Lagna 1, Moon ½, Venus ¼', () => {
    // Lagna, Moon, Venus all in Mesha; Mars in Tula (7th from all three), others in 3rd (not counted).
    const p = papaPoints(chart(0, 0, 0, 6, 2, 2, 2));
    expect(p.byRef).toEqual({ lagna: 1, moon: 0.5, venus: 0.25 });
    expect(p.total).toBe(1.75);
    expect(p.hits.every(h => h.planet === 'Mars' && h.house === 7)).toBe(true);
  });

  it('counts only 1, 2, 4, 7, 8, 12 — not 3, 5, 6, 9, 10, 11', () => {
    for (const h of [3, 5, 6, 9, 10, 11]) {
      const s = h - 1;
      expect(papaPoints(chart(0, 6, 6, s, s, s, s)).byRef.lagna).toBe(0);
    }
    for (const h of [1, 2, 4, 7, 8, 12]) {
      const s = h - 1;
      expect(papaPoints(chart(0, 6, 6, s, 2, 2, 2)).byRef.lagna).toBe(1);
    }
  });

  it('maximum is 4 malefics × (1 + ½ + ¼) = 7', () => {
    expect(papaPoints(chart(0, 0, 0, 0, 6, 7, 11)).total).toBe(7);
  });

  it('balanced when bride ≤ groom, not when bride > groom', () => {
    const low = chart(0, 0, 0, 2, 2, 2, 2);   // 0 points
    const high = chart(0, 0, 0, 6, 2, 2, 2);  // 1.75
    expect(calculatePapasamyam(low, high).balanced).toBe(true);
    expect(calculatePapasamyam(low, low).balanced).toBe(true);
    const r = calculatePapasamyam(high, low);
    expect(r.balanced).toBe(false);
    expect(r.difference).toBe(-1.75);
  });

  it('reads signs from sidereal chart longitudes', () => {
    const c = papaInputFromChart({ lagna: { rashiIndex: 3 }, planets: [
      { name: 'Moon', longitude: 45 }, { name: 'Venus', longitude: 359.9 }, { name: 'Mars', longitude: 180 },
      { name: 'Saturn', longitude: 30 }, { name: 'Sun', longitude: 0.1 }, { name: 'Rahu', longitude: 300 },
    ] });
    expect(c).toEqual({ lagnaSign: 3, moonSign: 1, venusSign: 11, signs: { Mars: 6, Saturn: 1, Sun: 0, Rahu: 10 } });
  });
});
