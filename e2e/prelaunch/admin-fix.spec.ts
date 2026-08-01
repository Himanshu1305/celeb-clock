/**
 * Suite — admin-fix.spec.ts  (ADMIN-FIX: phantom column + error surfacing + auth timing)
 *
 * Pure-logic unit tests over src/lib/adminUsers.ts (no browser / servers needed). They
 * pin the behaviours the two admin bugs required:
 *   1. fetchUsers happy path renders full details.
 *   2. promo_premium_until absent → fallback select → details STILL render + warning.
 *   3. a query error → surfaced error + empty list (never a silent empty list).
 *   4. delayed session → the fetch AWAITS getSession before querying (not anon-first).
 *   5. grantPromo / revoke error paths return the DB message (component surfaces it).
 */
import { test, expect } from '@playwright/test';
import {
  loadAdminUsers,
  grantPromoDays,
  grantFullPremium,
  revokePremium,
} from '../../src/lib/adminUsers';

type SelectResult = { data: unknown; error: { message: string } | null };

/** Configurable structural mock of the Supabase client the helpers consume. */
function makeClient(opts: {
  selectResponses?: (cols: string) => SelectResult;
  updateResponse?: { error: { message: string } | null };
  sessionDelayMs?: number;
}) {
  const calls: string[] = [];
  const client = {
    _calls: calls,
    auth: {
      getSession: async () => {
        if (opts.sessionDelayMs) await new Promise((r) => setTimeout(r, opts.sessionDelayMs));
        calls.push('getSession');
        return { data: { session: {} } };
      },
    },
    from: () => ({
      select: (cols: string) => ({
        order: () => ({
          limit: async () => {
            calls.push(`select:${cols}`);
            return opts.selectResponses ? opts.selectResponses(cols) : { data: [], error: null };
          },
        }),
      }),
      update: () => ({
        eq: async () => {
          calls.push('update');
          return opts.updateResponse ?? { error: null };
        },
      }),
    }),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client as any;
}

const ROW = { id: '1', email: 'ada@bornclock-test.invalid', name: 'Ada', country: 'IN', created_at: '2026-01-01T00:00:00Z', premium_status: true };

test('fetchUsers happy path — full select returns rows with details, no fallback', async () => {
  const client = makeClient({
    selectResponses: () => ({ data: [{ ...ROW, promo_premium_until: null }], error: null }),
  });
  const res = await loadAdminUsers(client);
  expect(res.users).toHaveLength(1);
  expect(res.users[0].email).toBe('ada@bornclock-test.invalid');
  expect(res.usedFallback).toBe(false);
  expect(res.error).toBeNull();
  expect(res.warning).toBeNull();
});

test('promo column absent → fallback select → details STILL render + warning surfaced', async () => {
  const client = makeClient({
    selectResponses: (cols) =>
      cols.includes('promo_premium_until')
        ? { data: null, error: { message: 'column profiles.promo_premium_until does not exist' } }
        : { data: [ROW], error: null },
  });
  const res = await loadAdminUsers(client);
  expect(res.users).toHaveLength(1);                 // list NOT silently emptied
  expect(res.users[0].email).toBe('ada@bornclock-test.invalid');
  expect(res.usedFallback).toBe(true);
  expect(res.error).toBeNull();
  expect(res.warning).toContain('does not exist');   // original error is surfaced, not swallowed
});

test('query error (both selects fail) → surfaced error + empty list, never silent', async () => {
  const client = makeClient({
    selectResponses: () => ({ data: null, error: { message: 'permission denied for table profiles' } }),
  });
  const res = await loadAdminUsers(client);
  expect(res.users).toEqual([]);
  expect(res.error).toContain('permission denied');  // component maps this → visible banner
  expect(res.warning).toBeNull();
});

test('delayed session → fetch AWAITS getSession before querying (not anon-first)', async () => {
  const client = makeClient({
    sessionDelayMs: 25,
    selectResponses: () => ({ data: [], error: null }),
  });
  await loadAdminUsers(client);
  // Order proves the query fired only AFTER the session hydrated.
  expect(client._calls[0]).toBe('getSession');
  expect(client._calls[1]).toContain('select:');
});

test('grantPromo / revoke error path returns the DB message (surfaced by component)', async () => {
  const failing = makeClient({ updateResponse: { error: { message: 'column profiles.promo_premium_until does not exist' } } });
  expect((await grantPromoDays(failing, 'id1', 30)).error).toContain('does not exist');
  expect((await revokePremium(failing, 'id1')).error).toContain('does not exist');

  const ok = makeClient({ updateResponse: { error: null } });
  expect((await grantPromoDays(ok, 'id1', 30)).error).toBeNull();
  expect((await grantFullPremium(ok, 'id1')).error).toBeNull();
  expect((await revokePremium(ok, 'id1')).error).toBeNull();
});
