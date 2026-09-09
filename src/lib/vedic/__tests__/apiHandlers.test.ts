import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// In-memory Supabase double, shared with the hoisted mock factory below.
const { store } = vi.hoisted(() => ({ store: new Map<string, any>() }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (_table: string) => ({
      select: () => ({
        eq: (_col: string, val: string) => ({
          maybeSingle: async () => {
            const row = store.get(val);
            return row ? { data: { chart_data: row }, error: null } : { data: null, error: null };
          },
        }),
      }),
      update: () => ({
        eq: () => ({ then: (onF: any, onR: any) => Promise.resolve().then(onF, onR) }),
      }),
      upsert: async (row: any) => { store.set(row.cache_key, row.chart_data); return {}; },
    }),
  }),
}));

import { GET as kundali } from '../../../../api/kundali';

const ENV = { SUPABASE_URL: 'https://test.local', SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
const URL_REF = '/api/kundali?y=1988&m=11&d=5&h=12&min=30&lat=28.6139&lon=77.2090&tz=5.5';

let fetchSpy: any;
beforeEach(() => {
  store.clear();
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    throw new Error('network call not expected in local-engine path');
  });
});
afterEach(() => { fetchSpy.mockRestore(); });

describe('/api/kundali — cache behavior + local-first (no ProKerala calls)', () => {
  it('first call is a cache miss, second identical call is a cache hit with identical data and zero network calls', async () => {
    const r1 = await kundali(new Request('http://localhost' + URL_REF), ENV as any);
    const j1 = await r1.json();
    expect(r1.status).toBe(200);
    expect(j1._cache).toBe('miss');
    expect(j1.source).toBe('local');
    expect(j1.rashi).toBe('Kanya');
    expect(j1.lagna.sign).toBe('Makara');

    const r2 = await kundali(new Request('http://localhost' + URL_REF), ENV as any);
    const j2 = await r2.json();
    expect(j2._cache).toBe('hit');

    // Cache-hit payload equals the miss payload (minus the _cache marker).
    const strip = (o: any) => { const { _cache, ...rest } = o; return rest; };
    expect(strip(j2)).toEqual(strip(j1));

    // Local engine must never hit the network (ProKerala fallback untouched).
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for missing y/m/d without touching cache or network', async () => {
    const r = await kundali(new Request('http://localhost/api/kundali?h=12'), ENV as any);
    expect(r.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(store.size).toBe(0);
  });

  it('surfaces POLAR_LATITUDE warning through the API response for polar births', async () => {
    const r = await kundali(new Request('http://localhost/api/kundali?y=1988&m=11&d=5&h=12&min=30&lat=69.6&lon=18.9&tz=1'), ENV as any);
    const j = await r.json();
    expect(j.warnings.map((w: any) => w.code)).toContain('POLAR_LATITUDE');
  });
});
