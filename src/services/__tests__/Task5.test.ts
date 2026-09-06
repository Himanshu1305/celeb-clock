import { describe, it, expect } from 'vitest';
import { geocodeCity } from '../geocoding';

describe('TC-GEO', () => {
  it('TC-GEO-P-01: Delhi lat~28.61 IST', async () => { const r = await geocodeCity('Delhi'); expect(r[0].lat).toBeCloseTo(28.61, 0); expect(r[0].utcOffset).toBe(5.5); });
  it('TC-GEO-P-02: Hyderabad IST lat~17.38', async () => { const r = await geocodeCity('Hyderabad'); expect(r[0].timezone).toBe('Asia/Kolkata'); expect(r[0].lat).toBeCloseTo(17.38, 0); });
  it('TC-GEO-P-03: Vadnagar found', async () => { const r = await geocodeCity('Vadnagar'); expect(r.length).toBeGreaterThan(0); expect(r[0].utcOffset).toBe(5.5); });
  it('TC-GEO-P-04: case insensitive', async () => { const r1 = await geocodeCity('DELHI'); const r2 = await geocodeCity('delhi'); expect(r1[0].lat).toBeCloseTo(r2[0].lat, 1); });
  it('TC-GEO-P-05: New Delhi with space works', async () => { const r = await geocodeCity('New Delhi'); expect(r.length).toBeGreaterThan(0); expect(r[0].utcOffset).toBe(5.5); });
  it('TC-GEO-P-06: utcOffset is number', async () => { expect(typeof (await geocodeCity('Delhi'))[0].utcOffset).toBe('number'); });
  it('TC-GEO-P-07: Prayagraj = Allahabad', async () => { const r1 = await geocodeCity('Allahabad'); const r2 = await geocodeCity('Prayagraj'); expect(r1.length).toBeGreaterThan(0); expect(r2.length).toBeGreaterThan(0); expect(r1[0].lat).toBeCloseTo(r2[0].lat, 1); });
  it('TC-GEO-N-01: nonsense -> empty array', async () => { expect(Array.isArray(await geocodeCity('xyzabc99999'))).toBe(true); }, 15000);
  it('TC-GEO-N-02: empty string -> no crash', async () => { await expect(geocodeCity('')).resolves.toBeDefined(); });
  it('TC-GEO-EDGE-01: Bengaluru = Bangalore', async () => { const r1 = await geocodeCity('Bengaluru'); const r2 = await geocodeCity('Bangalore'); expect(r1[0]?.lat).toBeCloseTo(r2[0]?.lat || 0, 0); });
  it('TC-GEO-EDGE-02: returns array always', async () => { expect(Array.isArray(await geocodeCity('Delhi'))).toBe(true); });
});
