import { describe, it, expect } from 'vitest';
import {
  syncHistoryToAccount, loadHistoryFromAccount, mergeHistories,
  resolveHistoryWithConflict, resolveAccountHistory, isHistorySyncEligible,
  type MinimalSupabase,
} from '../readingHistorySync';
import type { ReadingHistoryEntry } from '../readingHistory';

const E = (dob: string, dasha: string, at: string): ReadingHistoryEntry =>
  ({ generatedAt: at, dob, rashi: 'Karka', lagna: 'Makara', nakshatra: 'Pushya', dasha });

const A1 = E('1988-11-05', 'Venus / Jupiter', '2026-01-01T00:00:00.000Z');
const A2 = E('1988-11-05', 'Venus / Saturn', '2025-01-01T00:00:00.000Z');
const D_ONLY = E('1988-11-05', 'Venus / Mercury', '2026-06-01T00:00:00.000Z'); // device-only, newer

// Mock Supabase simulating the reading_history column (in-memory).
function mockWithColumn(initial: Record<string, any> = {}): MinimalSupabase & { store: Record<string, any> } {
  const store = { ...initial };
  return {
    store,
    from() {
      return {
        select() { return { eq(_c: string, id: string) { return { async maybeSingle() { return { data: { reading_history: store[id] ?? null }, error: null }; } }; } }; },
        update(values: Record<string, unknown>) { return { async eq(_c: string, id: string) { store[id] = values.reading_history; return { data: null, error: null }; } }; },
      };
    },
  };
}
const mockNoColumn: MinimalSupabase = {
  from() {
    const err = { code: '42703', message: 'column profiles.reading_history does not exist' };
    return {
      select() { return { eq() { return { async maybeSingle() { return { data: null, error: err }; } }; } }; },
      update() { return { async eq() { return { data: null, error: err }; } }; },
    };
  },
};

describe('reading-history account sync (Part AC / Part S.6)', () => {
  it('saves and loads history when the column exists', async () => {
    const sb = mockWithColumn();
    expect(await syncHistoryToAccount(sb, 'u1', [A1, A2])).toBe(true);
    expect(await loadHistoryFromAccount(sb, 'u1')).toEqual([A1, A2]);
  });

  it('degrades gracefully when the column does NOT exist (no throw)', async () => {
    expect(await syncHistoryToAccount(mockNoColumn, 'u1', [A1])).toBe(false);
    expect(await loadHistoryFromAccount(mockNoColumn, 'u1')).toBeNull();
  });

  it('merge is non-destructive: union by (dob, Dasha), most-recent-first, keeps latest timestamp', () => {
    const older = { ...A1, generatedAt: '2024-01-01T00:00:00.000Z' };
    const merged = mergeHistories([A1, A2], [D_ONLY, older]);
    // three distinct (dob,dasha) states survive; the newer A1 timestamp wins over `older`
    expect(merged.map(e => e.dasha)).toEqual(['Venus / Mercury', 'Venus / Jupiter', 'Venus / Saturn']);
    expect(merged.find(e => e.dasha === 'Venus / Jupiter')!.generatedAt).toBe(A1.generatedAt);
  });

  it('conflict resolution reports device-only (not-yet-synced) entries without losing anything', () => {
    const res = resolveHistoryWithConflict([A1, A2], [A1, D_ONLY]);
    expect(res.source).toBe('account');
    expect(res.deviceOnly.map(e => e.dasha)).toEqual(['Venus / Mercury']); // D_ONLY only
    expect(res.entries).toHaveLength(3);                                   // nothing dropped
  });

  it('resolveAccountHistory merges account+device and pushes the superset back up', async () => {
    const sb = mockWithColumn({ u1: [A1, A2] });
    const res = await resolveAccountHistory(sb, 'u1', 'real.user@example.com', [D_ONLY]);
    expect(res.entries.map(e => e.dasha).sort()).toEqual(['Venus / Jupiter', 'Venus / Mercury', 'Venus / Saturn']);
    // account row now contains the device-only entry too (pushed up)
    expect((sb.store['u1'] as ReadingHistoryEntry[]).some(e => e.dasha === 'Venus / Mercury')).toBe(true);
  });

  it('ADMIN/TESTING isolation: admin identity is not eligible and never writes to an account row', async () => {
    expect(isHistorySyncEligible('hello@bornclock.com')).toBe(false);
    expect(isHistorySyncEligible('himanshu1305@gmail.com')).toBe(false);
    expect(isHistorySyncEligible('real.user@example.com')).toBe(true);
    const sb = mockWithColumn();
    const res = await resolveAccountHistory(sb, 'admin-uid', 'hello@bornclock.com', [A1, D_ONLY]);
    expect(res.source).toBe('device');           // stays device-local
    expect(sb.store['admin-uid']).toBeUndefined(); // nothing written to the account
  });

  it('ACCOUNT isolation: two different users keep independent histories', async () => {
    const sb = mockWithColumn();
    await syncHistoryToAccount(sb, 'u1', [A1]);
    await syncHistoryToAccount(sb, 'u2', [D_ONLY]);
    expect(await loadHistoryFromAccount(sb, 'u1')).toEqual([A1]);
    expect(await loadHistoryFromAccount(sb, 'u2')).toEqual([D_ONLY]);
  });

  it('anonymous (no userId) stays device-only, untouched', async () => {
    const sb = mockWithColumn();
    const res = await resolveAccountHistory(sb, null, null, [A1]);
    expect(res.source).toBe('device');
    expect(res.entries).toEqual([A1]);
    expect(Object.keys(sb.store)).toHaveLength(0);
  });
});
