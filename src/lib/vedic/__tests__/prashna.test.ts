/** B21 — KP Prashna (horary). */
import { describe, it, expect } from 'vitest';
import { KP_NUMBERS, kpNumberLongitude, judgePrashna, prashnaAnswer, timeForAscendant, PRASHNA_TOPICS } from '../prashna';
import { calculatePlacidusCusps, normalize360 } from '../engine/vedicEngine';
import { KP_SHIFT_DEG } from '../advanced/kp';

const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600;

describe('KP horary numbers', () => {
  it('P1 — 249 numbers; the published starting points', () => {
    expect(KP_NUMBERS).toBe(249);
    expect(kpNumberLongitude(1)).toBeCloseTo(0, 9);
    expect(kpNumberLongitude(2)).toBeCloseTo(dms(0, 46, 40), 6);
    expect(kpNumberLongitude(3)).toBeCloseTo(dms(3, 0, 0), 6);
    expect(kpNumberLongitude(10)).toBeCloseTo(dms(13, 20, 0), 6);   // Bharani, Venus sub
    expect(kpNumberLongitude(249)).toBeCloseTo(330 + dms(27, 53, 20), 6); // Pisces 27°53′20″, Saturn sub of Revati
    expect(() => kpNumberLongitude(250)).toThrow();
    for (let n = 2; n <= 249; n++) expect(kpNumberLongitude(n)).toBeGreaterThan(kpNumberLongitude(n - 1));
  });

  it('P2 — the house chart really has that Ascendant (within 1″)', () => {
    const around = new Date('2026-11-27T06:30:00Z');
    for (const n of [1, 57, 108, 175, 249]) {
      const t = timeForAscendant(kpNumberLongitude(n), around, 28.6139, 77.209);
      const asc = normalize360(calculatePlacidusCusps(t, 28.6139, 77.209)[1] + KP_SHIFT_DEG);
      const d = Math.abs(normalize360(asc - kpNumberLongitude(n) + 180) - 180) * 3600;
      expect(d, `n=${n}`).toBeLessThan(1);
      expect(Math.abs(t.getTime() - around.getTime())).toBeLessThanOrEqual(12 * 3_600_000);
    }
  });

  it('P3 — judgement follows the stated rule for every topic', () => {
    const moment = new Date('2026-11-27T06:30:00Z');
    for (const topic of Object.keys(PRASHNA_TOPICS) as Array<keyof typeof PRASHNA_TOPICS>) {
      const r = judgePrashna({ topic, number: 108, moment, lat: 28.6139, lon: 77.209, tzHours: 5.5 });
      const T = PRASHNA_TOPICS[topic];
      expect(r.cuspSubLord).toBe(r.cusps[T.cusp - 1].sub);
      expect(r.yesHit.every(h => T.yes.includes(h) && r.signified.includes(h))).toBe(true);
      expect(r.verdict).toBe(r.yesHit.length && !r.noHit.length ? 'yes' : r.yesHit.length ? 'mixed' : 'not-now');
      expect(prashnaAnswer(r)).not.toMatch(/certain|definitely|guarantee|death|die/i);
      expect(r.planets).toHaveLength(9);
      expect(r.rulingPlanets.dayLord).toBe('Venus'); // 27 Nov 2026 is a Friday in India
    }
  });

  it('P4 — moment method uses the Ascendant of the moment', () => {
    const moment = new Date('2026-11-27T06:30:00Z');
    const r = judgePrashna({ topic: 'career', moment, lat: 19.076, lon: 72.8777, tzHours: 5.5 });
    expect(r.method).toBe('moment');
    expect(r.ascendant).toBeCloseTo(normalize360(calculatePlacidusCusps(moment, 19.076, 72.8777)[1] + KP_SHIFT_DEG), 9);
  });
});
