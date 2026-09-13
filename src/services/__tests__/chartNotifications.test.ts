import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDueChartEvents } from '../chartNotifications';
import type { SavedBirthProfile } from '../savedProfile';

const FULL: SavedBirthProfile = { dob: '1988-11-05', time: '14:30', city: { name: 'Delhi', lat: 28.6, lon: 77.2, tz: 5.5 } };

describe('getDueChartEvents — opt-in gate (Part P Part 2.3)', () => {
  let fetchSpy: any;
  beforeEach(() => {
    // jsdom localStorage exists; ensure clean shown-store
    try { localStorage.clear(); } catch { /* noop */ }
    fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ events: [{ type: 'dasha-antar', key: 'k1', title: 'T', body: 'B', whenISO: '2026-10-01' }] }) });
    (globalThis as any).fetch = fetchSpy;
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('NEGATIVE: a profile that has NOT opted in gets nothing and never even calls the API', async () => {
    expect(await getDueChartEvents({ ...FULL })).toEqual([]);                         // notifyOptIn undefined
    expect(await getDueChartEvents({ ...FULL, notifyOptIn: false })).toEqual([]);     // explicit false
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('NEGATIVE: opted-in but no profile → nothing', async () => {
    expect(await getDueChartEvents(null)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('NEGATIVE: opted-in but only a partial profile (no time/place) → nothing', async () => {
    expect(await getDueChartEvents({ dob: '1988-11-05', notifyOptIn: true })).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POSITIVE: opted-in + full profile fetches and returns the due events', async () => {
    const evs = await getDueChartEvents({ ...FULL, notifyOptIn: true });
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(evs).toHaveLength(1);
    expect(evs[0].key).toBe('k1');
  });
});
