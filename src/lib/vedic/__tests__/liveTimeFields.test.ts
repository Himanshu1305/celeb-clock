import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Stale "current Dasha" from the chart cache: a chart saved in 2024 and read in 2027
// must show the 2027 Antardasha and Sade Sati status, not the 2024 ones.
//
// Reference (Swiss Ephemeris, pyswisseph 2.10.03, SIDM_LAHIRI, Vimshottari 365.25-day
// years from the Moon's nakshatra — scratchpad/fix3/ref.py):
//   Birth 1990-01-27 10:00 IST, New Delhi. Moon 287.97° sidereal → Makara.
//   2024-06-01: Saturn 324.55° (Kumbha, 2nd from Moon → Sade Sati active), Jupiter / Mercury.
//   2027-03-01: Saturn 348.84° (Meena, 3rd from Moon → not active),        Jupiter / Venus.

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
import { GET as vedicProfile } from '../../../../api/vedic-profile';

const ENV = { SUPABASE_URL: 'https://test.local', SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
const Q = 'y=1990&m=1&d=27&h=10&min=0&lat=28.6139&lon=77.2090&tz=5.5';

let fetchSpy: any;
beforeEach(() => {
  store.clear();
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => { throw new Error('no network'); });
  vi.useFakeTimers({ toFake: ['Date'] });
});
afterEach(() => { vi.useRealTimers(); fetchSpy.mockRestore(); });

describe('cached charts: "current" fields are recomputed at request time', () => {
  it('/api/kundali: chart cached in 2024, read in 2027 → 2027 Antardasha and Sade Sati', async () => {
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const j1 = await (await kundali(new Request('http://localhost/api/kundali?' + Q), ENV as any)).json();
    expect(j1._cache).toBe('miss');
    expect(j1.rashi).toBe('Makara');
    expect(j1.dasha.mahadasha).toBe('Jupiter');
    expect(j1.dasha.antardasha).toBe('Mercury');
    expect(j1.doshas.sadeSati.active).toBe(true);
    expect(store.size).toBe(1);

    vi.setSystemTime(new Date('2027-03-01T00:00:00Z'));
    const j2 = await (await kundali(new Request('http://localhost/api/kundali?' + Q), ENV as any)).json();
    expect(j2._cache).toBe('hit');
    expect(j2.dasha.mahadasha).toBe('Jupiter');
    expect(j2.dasha.antardasha).toBe('Venus');
    expect(j2.doshas.sadeSati.active).toBe(false);
    expect(j2.doshas.sadeSati.houseOfSaturnFromMoon).toBe(3);
    // Natal chart is unchanged (served from the cache).
    expect(j2.lagna).toEqual(j1.lagna);
    expect(j2.planets).toEqual(j1.planets);
    expect(j2.doshas.mangalDosha).toEqual(j1.doshas.mangalDosha);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('/api/vedic-profile: cached in 2024, read in 2027 → 2027 Antardasha', async () => {
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const j1 = await (await vedicProfile(new Request('http://localhost/api/vedic-profile?' + Q), ENV as any)).json();
    expect(j1._cache).toBe('miss');
    expect(j1.dasha.antardasha).toBe('Mercury');

    vi.setSystemTime(new Date('2027-03-01T00:00:00Z'));
    const j2 = await (await vedicProfile(new Request('http://localhost/api/vedic-profile?' + Q), ENV as any)).json();
    expect(j2._cache).toBe('hit');
    expect(j2.dasha.mahadasha).toBe('Jupiter');
    expect(j2.dasha.antardasha).toBe('Venus');
    expect(j2.nakshatra).toEqual(j1.nakshatra);
  });
});
