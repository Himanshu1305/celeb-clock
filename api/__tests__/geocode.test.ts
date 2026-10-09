import { describe, it, expect } from 'vitest';
import { GET } from '../geocode.ts';

const call = (q: string) => GET(new Request(`https://bornclock.com/api/geocode?q=${encodeURIComponent(q)}`));

describe('api/geocode (P5-1 proxy)', () => {
  it('serves a bundled city WITHOUT touching the network, long-cache', async () => {
    const res = await call('Delhi');
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    const body = await res.json();
    expect(body.results[0].name).toBe('Delhi');
    expect(body.results[0].source).toBe('bundled');
    expect(body.results[0].utcOffset).toBe(5.5);
    expect(body.attribution).toBeNull(); // bundled → no OSM credit needed
  });

  it('resolves an alias from the bundled set', async () => {
    const body = await (await call('bangalore')).json();
    expect(body.results[0].name).toBe('Bengaluru');
    expect(body.results[0].source).toBe('bundled');
  });

  it('prefix-matches bundled cities', async () => {
    const body = await (await call('hyder')).json();
    expect(body.results.some((r: any) => r.name === 'Hyderabad')).toBe(true);
  });

  it('empty query returns an empty result set, no-store', async () => {
    const res = await call('');
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects non-GET', async () => {
    const res = await GET(new Request('https://bornclock.com/api/geocode', { method: 'POST' }));
    expect(res.status).toBe(405);
  });
});
