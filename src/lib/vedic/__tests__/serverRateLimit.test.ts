import { describe, it, expect } from 'vitest';
import { peek, record, dayKeyUTC, hashClientId, type ServerRateRecord } from '../serverRateLimit';
import { FREE_DAILY_LIMIT, PAID_DAILY_LIMIT } from '../rateLimit';

const at = (iso: string) => new Date(iso);

describe('serverRateLimit (P5-3 server-authoritative AI limit)', () => {
  it('dayKeyUTC is UTC-based and stable', () => {
    expect(dayKeyUTC(at('2026-10-09T23:59:00Z'))).toBe('2026-10-09');
    expect(dayKeyUTC(at('2026-10-10T00:00:00Z'))).toBe('2026-10-10');
  });

  it('hashClientId never returns the raw IP and is deterministic', async () => {
    const ip = '203.0.113.7';
    const h1 = await hashClientId(ip, 'salt');
    const h2 = await hashClientId(ip, 'salt');
    expect(h1).toBe(h2);
    expect(h1).not.toContain(ip);
    expect(await hashClientId(ip, 'other')).not.toBe(h1); // salt changes the hash
  });

  it('allows up to the free daily limit, then blocks (no client count trusted)', () => {
    const store = new Map<string, ServerRateRecord>();
    const now = at('2026-10-09T10:00:00Z');
    for (let i = 0; i < FREE_DAILY_LIMIT; i++) {
      expect(peek(store, 'k', 'free', now).allowed).toBe(true);
      record(store, 'k', 'free', now);
    }
    expect(peek(store, 'k', 'free', now).allowed).toBe(false);
    expect(peek(store, 'k', 'free', now).remaining).toBe(0);
  });

  it('paid tier gets the higher cap', () => {
    const store = new Map<string, ServerRateRecord>();
    const now = at('2026-10-09T10:00:00Z');
    for (let i = 0; i < PAID_DAILY_LIMIT; i++) record(store, 'p', 'paid', now);
    expect(peek(store, 'p', 'paid', now).allowed).toBe(false);
    // a free key is independent and unaffected
    expect(peek(store, 'free-key', 'free', now).allowed).toBe(true);
  });

  it('resets at UTC midnight (a new day restores the quota)', () => {
    const store = new Map<string, ServerRateRecord>();
    const day1 = at('2026-10-09T12:00:00Z');
    for (let i = 0; i < FREE_DAILY_LIMIT; i++) record(store, 'k', 'free', day1);
    expect(peek(store, 'k', 'free', day1).allowed).toBe(false);
    const day2 = at('2026-10-10T00:01:00Z');
    expect(peek(store, 'k', 'free', day2).allowed).toBe(true);
  });

  it('admin tier is effectively unlimited', () => {
    const store = new Map<string, ServerRateRecord>();
    const now = at('2026-10-09T10:00:00Z');
    for (let i = 0; i < 100; i++) record(store, 'a', 'admin', now);
    expect(peek(store, 'a', 'admin', now).allowed).toBe(true);
  });

  it('record only increments on call — peek never mutates', () => {
    const store = new Map<string, ServerRateRecord>();
    const now = at('2026-10-09T10:00:00Z');
    peek(store, 'k', 'free', now);
    peek(store, 'k', 'free', now);
    expect(store.get('k')).toBeUndefined(); // peeks did not count
    record(store, 'k', 'free', now);
    expect(store.get('k')?.count).toBe(1);
  });
});
