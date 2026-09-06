import { describe, it, expect } from 'vitest';
import { calculateVedicProfile, isNearNakshatraBoundary, NAKSHATRA_TO_DEVANAGARI } from '../vedicCalculations';
import { VIRAT, SRK, SACHIN, MODI, AMITABH, VALID_27_NAKSHATRAS } from '../../__tests__/testData';

const DELHI = { city: 'Delhi', lat: 28.6139, lon: 77.2090, timezone: 5.5 };
const MUMBAI = { city: 'Mumbai', lat: 19.0760, lon: 72.8777, timezone: 5.5 };
const VADNAGAR = { city: 'Vadnagar', lat: 23.7867, lon: 72.6367, timezone: 5.5 };
const PRAYAG = { city: 'Allahabad', lat: 25.4358, lon: 81.8463, timezone: 5.5 };

// Expected values are the astronomically-correct Lahiri Nakshatras (verified
// against the Swiss Ephemeris) — see src/__tests__/testData.ts for the finding.
describe('TC-VEDIC', () => {
  it('TC-VEDIC-P-01: Virat -> Uttara Phalguni', async () => { const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI); expect(r.nakshatra.nakshatra).toBe(VIRAT.nakshatra); }, 20000);
  it('TC-VEDIC-P-02: SRK -> Dhanishtha', async () => { const r = await calculateVedicProfile(2, 11, 1965, 14, 30, DELHI); expect(r.nakshatra.nakshatra).toBe(SRK.nakshatra); }, 20000);
  it('TC-VEDIC-P-03: Sachin -> Purva Ashadha', async () => { const r = await calculateVedicProfile(24, 4, 1973, 12, 0, MUMBAI); expect(r.nakshatra.nakshatra).toBe(SACHIN.nakshatra); }, 20000);
  it('TC-VEDIC-P-04: Modi -> Anuradha', async () => { const r = await calculateVedicProfile(17, 9, 1950, 11, 0, VADNAGAR); expect(r.nakshatra.nakshatra).toBe(MODI.nakshatra); }, 20000);
  it('TC-VEDIC-P-05: Amitabh -> Swati', async () => { const r = await calculateVedicProfile(11, 10, 1942, 16, 0, PRAYAG); expect(r.nakshatra.nakshatra).toBe(AMITABH.nakshatra); }, 20000);
  it('TC-VEDIC-P-06: result is one of 27 valid Nakshatras', async () => {
    const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI);
    expect(VALID_27_NAKSHATRAS as readonly string[]).toContain(r.nakshatra.nakshatra);
  }, 20000);
  it('TC-VEDIC-P-07: pada is 1-4', async () => {
    const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI);
    expect(r.nakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(r.nakshatra.pada).toBeLessThanOrEqual(4);
  }, 20000);
  it('TC-VEDIC-P-08: with time -> confidence=high, lagna not null', async () => {
    const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI);
    expect(r.nakshatra.confidence).toBe('high');
    expect(r.lagna).not.toBeNull();
  }, 20000);
  it('TC-VEDIC-P-09: Nakshatra has Devanagari', async () => {
    const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI);
    expect(r.nakshatra.nakshatra_devanagari).toMatch(/[ऀ-ॿ]/);
  }, 20000);
  it('TC-VEDIC-P-10: all 27 have Devanagari in mapping', () => {
    VALID_27_NAKSHATRAS.forEach(n => {
      expect(NAKSHATRA_TO_DEVANAGARI[n], `Missing: ${n}`).toBeTruthy();
    });
  });
  it('TC-VEDIC-N-01: Virat is NOT the popularly-cited-wrong Anuradha', async () => { const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI); expect(r.nakshatra.nakshatra).not.toBe(VIRAT.wrong_nakshatra); }, 20000);
  it('TC-VEDIC-N-02: SRK is NOT the popularly-cited-wrong Vishakha', async () => { const r = await calculateVedicProfile(2, 11, 1965, 14, 30, DELHI); expect(r.nakshatra.nakshatra).not.toBe(SRK.wrong_nakshatra); }, 20000);
  it('TC-VEDIC-N-03: Sachin is NOT Ashlesha', async () => { const r = await calculateVedicProfile(24, 4, 1973, 12, 0, MUMBAI); expect(r.nakshatra.nakshatra).not.toBe('Ashlesha'); }, 20000);
  it('TC-VEDIC-N-04: without time -> lagna=null, confidence low/medium', async () => {
    const r = await calculateVedicProfile(5, 11, 1988, null, null, DELHI);
    expect(r.lagna).toBeNull(); expect(r.requires_birth_time).toBe(true);
    expect(['low', 'medium']).toContain(r.nakshatra.confidence);
  }, 20000);
  it('TC-VEDIC-N-05: no undefined in result', async () => {
    const r = await calculateVedicProfile(5, 11, 1988, 12, 30, DELHI);
    expect(JSON.stringify(r)).not.toContain('"undefined"');
  }, 20000);
  it('TC-VEDIC-N-06: invalid coords -> no crash', async () => {
    await expect(calculateVedicProfile(5, 11, 1988, 12, 30, { city: 'X', lat: 0, lon: 0, timezone: 0 })).resolves.toBeTruthy();
  }, 20000);
  it('TC-VEDIC-EDGE-01: Feb 29 1988 -> no crash', async () => { await expect(calculateVedicProfile(29, 2, 1988, 12, 0, DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-02: Jan 1 1900 -> no crash', async () => { await expect(calculateVedicProfile(1, 1, 1900, 12, 0, DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-03: midnight 00:00 -> no crash', async () => { await expect(calculateVedicProfile(5, 11, 1988, 0, 0, DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-04: 23:59 -> no crash', async () => { await expect(calculateVedicProfile(5, 11, 1988, 23, 59, DELHI)).resolves.toBeTruthy(); }, 20000);
  it('TC-VEDIC-EDGE-05: isNearBoundary(0.3) = true', () => { expect(isNearNakshatraBoundary(0.3)).toBe(true); });
  it('TC-VEDIC-EDGE-06: isNearBoundary(6.5) = false', () => { expect(isNearNakshatraBoundary(6.5)).toBe(false); });
  it('TC-VEDIC-EDGE-07: near Nakshatra end is boundary', () => { expect(isNearNakshatraBoundary(360 / 27 - 0.2)).toBe(true); });
  it('TC-VEDIC-ACCURACY: >=4/5 known celebrities match (astronomically-correct)', async () => {
    const tests = [
      { d: 5, m: 11, y: 1988, h: 12, min: 30, loc: DELHI, exp: VIRAT.nakshatra },
      { d: 2, m: 11, y: 1965, h: 14, min: 30, loc: DELHI, exp: SRK.nakshatra },
      { d: 24, m: 4, y: 1973, h: 12, min: 0, loc: MUMBAI, exp: SACHIN.nakshatra },
      { d: 17, m: 9, y: 1950, h: 11, min: 0, loc: VADNAGAR, exp: MODI.nakshatra },
      { d: 11, m: 10, y: 1942, h: 16, min: 0, loc: PRAYAG, exp: AMITABH.nakshatra },
    ];
    let pass = 0;
    for (const t of tests) {
      const r = await calculateVedicProfile(t.d, t.m, t.y, t.h, t.min, t.loc);
      if (r.nakshatra.nakshatra === t.exp) pass++;
      else console.log(`MISMATCH: expected ${t.exp}, got ${r.nakshatra.nakshatra}`);
    }
    console.log(`Accuracy: ${pass}/5`);
    expect(pass, 'Accuracy <80%').toBeGreaterThanOrEqual(4);
  }, 120000);
});
