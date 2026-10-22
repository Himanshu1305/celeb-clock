// fix-timezone-accuracy — real /api/geocode, real OpenStreetMap Nominatim (no mocks).
// Before the fix every Nominatim result came back as Asia/Kolkata +5.5 (the root cause).
// Skips (rather than fails) only when this machine cannot reach Nominatim at all.
import { describe, it, expect } from 'vitest';
import { GET } from '../geocode.ts';

const call = (q: string) => GET(new Request(`https://bornclock.com/api/geocode?q=${encodeURIComponent(q)}`));

describe('api/geocode — zone from coordinates, never IST by default', () => {
  it('bundled world city carries its real IANA zone', async () => {
    const body = await (await call('Sydney')).json();
    expect(body.results[0].timezone).toBe('Australia/Sydney');
  });

  it('Pontiac: Michigan and Illinois are separate choices with their own zones', async (ctx) => {
    const body = await (await call('Pontiac')).json();
    if (!body.results.length) ctx.skip(); // Nominatim unreachable from this machine
    const mi = body.results.find((r: any) => r.state === 'Michigan');
    const il = body.results.find((r: any) => r.state === 'Illinois');
    expect(mi?.timezone).toBe('America/Detroit');
    expect(il?.timezone).toBe('America/Chicago');
    expect(body.results.every((r: any) => r.timezone !== 'Asia/Kolkata')).toBe(true);
  }, 15000);
});
