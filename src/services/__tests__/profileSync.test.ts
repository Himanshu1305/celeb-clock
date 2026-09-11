import { describe, it, expect } from 'vitest';
import { syncProfileToAccount, loadProfileFromAccount, resolveProfile, type MinimalSupabase } from '../profileSync';

const FULL = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 } };

// Mock Supabase that SIMULATES the birth_profile column existing (in-memory store).
function mockWithColumn(initial: Record<string, any> = {}): MinimalSupabase & { store: Record<string, any> } {
  const store = { ...initial };
  return {
    store,
    from() {
      return {
        select() { return { eq(_c: string, id: string) { return { async maybeSingle() { return { data: { birth_profile: store[id] ?? null }, error: null }; } }; } }; },
        update(values: Record<string, unknown>) { return { async eq(_c: string, id: string) { store[id] = values.birth_profile; return { data: null, error: null }; } }; },
      };
    },
  };
}
// Mock where the column does NOT exist yet (Postgres 42703).
const mockNoColumn: MinimalSupabase = {
  from() {
    const err = { code: '42703', message: 'column profiles.birth_profile does not exist' };
    return {
      select() { return { eq() { return { async maybeSingle() { return { data: null, error: err }; } }; } }; },
      update() { return { async eq() { return { data: null, error: err }; } }; },
    };
  },
};

describe('account profile sync (Part K, Item 4) — prepared + tested vs a mocked schema', () => {
  it('saves and loads a profile when the column exists', async () => {
    const sb = mockWithColumn();
    expect(await syncProfileToAccount(sb, 'user-1', FULL)).toBe(true);
    expect(sb.store['user-1']).toEqual(FULL);
    expect(await loadProfileFromAccount(sb, 'user-1')).toEqual(FULL);
  });

  it('degrades gracefully when the column does NOT exist (no throw, false/null)', async () => {
    expect(await syncProfileToAccount(mockNoColumn, 'user-1', FULL)).toBe(false);
    expect(await loadProfileFromAccount(mockNoColumn, 'user-1')).toBeNull();
  });

  it('rejects an invalid profile and never writes it', async () => {
    const sb = mockWithColumn();
    expect(await syncProfileToAccount(sb, 'user-1', { time: '12:30' } as any)).toBe(false); // no dob
    expect(sb.store['user-1']).toBeUndefined();
  });

  it('load returns null for corrupted account data (guards bad rows)', async () => {
    const sb = mockWithColumn({ 'user-1': { dob: '1988-13-45' } }); // impossible date
    expect(await loadProfileFromAccount(sb, 'user-1')).toBeNull();
  });

  it('resolveProfile: anonymous → device-only unchanged; logged-in prefers account, else pushes device', async () => {
    // anonymous
    expect(await resolveProfile(null, null, FULL)).toEqual(FULL);
    // logged-in, account has a copy → account wins
    const withAcct = mockWithColumn({ 'u': { dob: '1990-01-01', time: '06:00', city: { name: 'Pune', lat: 18.5, lon: 73.8, tz: 5.5 } } });
    expect((await resolveProfile(withAcct, 'u', FULL))!.dob).toBe('1990-01-01');
    // logged-in, no account copy → returns device + best-effort pushes it up
    const empty = mockWithColumn();
    expect(await resolveProfile(empty, 'u', FULL)).toEqual(FULL);
    await new Promise(r => setTimeout(r, 0));
    expect(empty.store['u']).toEqual(FULL); // device profile was synced to the account
  });
});
