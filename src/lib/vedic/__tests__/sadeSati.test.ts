import { describe, it, expect } from 'vitest';
import { computeSadeSati, type SaturnSignFn } from '../sadeSati';

// Synthetic Saturn: advances one sidereal sign every ~2.46 years from a fixed epoch,
// so cycle detection is deterministic and testable without the ephemeris.
const YEAR = 365.25 * 864e5;
const EPOCH = Date.UTC(2000, 0, 1);
const SIGN_LEN = 2.4555 * YEAR; // ~29.46yr / 12
const linearSaturn: SaturnSignFn = (d) => Math.floor(((d.getTime() - EPOCH) / SIGN_LEN) % 12 + 12) % 12;

function saturnSignOn(d: Date) { return linearSaturn(d); }

describe('Sade Sati cycle calculator (Part I.10)', () => {
  it('reports the correct phase when Saturn is on the Moon sign (Peak)', () => {
    // pick a `now` where synthetic Saturn is in some sign S; set Moon = S → Peak.
    const now = new Date(Date.UTC(2026, 5, 1));
    const S = saturnSignOn(now);
    const r = computeSadeSati(S, now, linearSaturn);
    expect(r.active).toBe(true);
    expect(r.phase).toBe('Peak (on Moon sign)');
  });

  it('is inactive when Saturn is far (e.g. 6th) from the Moon, and still gives a real next cycle', () => {
    const now = new Date(Date.UTC(2026, 5, 1));
    const S = saturnSignOn(now);
    const moon = (S + 6) % 12; // Saturn 6 signs away → not in 12/1/2
    const r = computeSadeSati(moon, now, linearSaturn);
    expect(r.active).toBe(false);
    expect(r.phase).toBeNull();
    expect(r.currentCycle).toBeNull();
    expect(r.nextCycle).not.toBeNull();
  });

  it('an active Sade Sati has a ~7.5-year current cycle bracketing now', () => {
    const now = new Date(Date.UTC(2026, 5, 1));
    const S = saturnSignOn(now);
    const r = computeSadeSati(S, now, linearSaturn); // Peak
    expect(r.currentCycle).not.toBeNull();
    const start = new Date(r.currentCycle!.start).getTime(), end = new Date(r.currentCycle!.end).getTime();
    expect(start).toBeLessThanOrEqual(now.getTime());
    expect(end).toBeGreaterThan(now.getTime());
    const years = (end - start) / YEAR;
    expect(years).toBeGreaterThan(6.5);
    expect(years).toBeLessThan(8.5); // 3 signs ≈ 7.37yr
  });

  it('the next cycle starts ~29.5 years after the current one (one Saturn orbit)', () => {
    const now = new Date(Date.UTC(2026, 5, 1));
    const S = saturnSignOn(now);
    const r = computeSadeSati(S, now, linearSaturn);
    const gap = (new Date(r.nextCycle!.start).getTime() - new Date(r.currentCycle!.start).getTime()) / YEAR;
    expect(gap).toBeGreaterThan(28);
    expect(gap).toBeLessThan(31);
  });

  it('detects Dhaiya (Kantaka 4th / Ashtama 8th from Moon)', () => {
    const now = new Date(Date.UTC(2026, 5, 1));
    const S = saturnSignOn(now);
    const moon4 = (S - 3 + 12) % 12; // Saturn in 4th from this Moon
    const r4 = computeSadeSati(moon4, now, linearSaturn);
    expect(r4.dhaiya.active).toBe(true);
    expect(r4.dhaiya.type).toMatch(/Kantaka/);
    expect(r4.dhaiya.currentEnd).not.toBeNull();
    const moon8 = (S - 7 + 12) % 12; // Saturn in 8th from this Moon
    const r8 = computeSadeSati(moon8, now, linearSaturn);
    expect(r8.dhaiya.type).toMatch(/Ashtama/);
  });
});
