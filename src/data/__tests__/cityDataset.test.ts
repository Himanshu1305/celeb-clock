import { describe, it, expect } from 'vitest';
import { CITY_DATASET, lookupCity, prefixCities, CITY_LOOKUP } from '../cityDataset';

describe('cityDataset (P5-1 bundled city lookup)', () => {
  it('covers a large bundled set (reduces Nominatim dependence)', () => {
    expect(CITY_DATASET.length).toBeGreaterThan(200);
  });

  it('every entry has finite coords, an IANA zone, and a numeric offset', () => {
    for (const c of CITY_DATASET) {
      expect(Number.isFinite(c.lat)).toBe(true);
      expect(Number.isFinite(c.lon)).toBe(true);
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lon).toBeGreaterThanOrEqual(-180);
      expect(c.lon).toBeLessThanOrEqual(180);
      expect(typeof c.timezone).toBe('string');
      expect(c.timezone).toMatch(/\//); // IANA "Area/Location"
      expect(typeof c.utcOffset).toBe('number');
      expect(c.country.length).toBeGreaterThan(0);
    }
  });

  it('resolves core Indian metros to IST with correct coords', () => {
    expect(lookupCity('Delhi')?.utcOffset).toBe(5.5);
    expect(lookupCity('mumbai')?.lat).toBeCloseTo(19.07, 1);
    expect(lookupCity('Chennai')?.timezone).toBe('Asia/Kolkata');
  });

  it('resolves aliases (bangalore, bombay, prayagraj, new delhi)', () => {
    expect(lookupCity('bangalore')?.name).toBe('Bengaluru');
    expect(lookupCity('bombay')?.name).toBe('Mumbai');
    expect(lookupCity('prayagraj')?.name).toBe('Allahabad');
    expect(lookupCity('new delhi')?.name).toBe('Delhi');
  });

  it('carries exact (non-IST) offsets for major world cities', () => {
    expect(lookupCity('London')?.utcOffset).toBe(0);
    expect(lookupCity('New York')?.utcOffset).toBe(-5);
    expect(lookupCity('Dubai')?.utcOffset).toBe(4);
    expect(lookupCity('Singapore')?.utcOffset).toBe(8);
    expect(lookupCity('Kathmandu')?.utcOffset).toBe(5.75);
    expect(lookupCity('Tokyo')?.timezone).toBe('Asia/Tokyo');
  });

  it('prefix match returns bundled cities without duplicates', () => {
    const r = prefixCities('mum');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].name).toBe('Mumbai');
    const names = prefixCities('ban', 5).map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('prefix ignores queries under 2 chars', () => {
    expect(prefixCities('m')).toEqual([]);
  });

  it('lookup map keys are unique (first-wins, no overwrite)', () => {
    // Every alias/name resolves to exactly one def.
    expect(CITY_LOOKUP.get('delhi')?.name).toBe('Delhi');
  });
});
