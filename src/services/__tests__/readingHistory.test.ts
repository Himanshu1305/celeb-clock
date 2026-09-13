// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { recordReading, getReadingHistory, changeSince, clearReadingHistory, MAX_HISTORY } from '../readingHistory';

const snap = (dasha: string, dob = '1988-11-05') => ({ dob, rashi: 'Kanya', lagna: 'Kumbha', nakshatra: 'Uttara Phalguni', dasha });

describe('reading history (Part P.3)', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

  it('CONSENT GATE: nothing is stored when there is no saved profile', () => {
    recordReading(snap('Venus / Saturn'), false);
    expect(getReadingHistory()).toHaveLength(0);
  });

  it('records most-recent-first for a saved profile', () => {
    recordReading(snap('Venus / Saturn'), true, new Date('2026-01-01'));
    recordReading(snap('Venus / Mercury'), true, new Date('2026-06-01'));
    const h = getReadingHistory();
    expect(h).toHaveLength(2);
    expect(h[0].dasha).toBe('Venus / Mercury');   // newest first
    expect(h[1].dasha).toBe('Venus / Saturn');
  });

  it('de-dupes: re-opening an UNCHANGED chart refreshes the timestamp, no new row', () => {
    recordReading(snap('Venus / Saturn'), true, new Date('2026-01-01'));
    recordReading(snap('Venus / Saturn'), true, new Date('2026-02-01'));
    const h = getReadingHistory();
    expect(h).toHaveLength(1);
    expect(h[0].generatedAt).toBe(new Date('2026-02-01').toISOString());
  });

  it('enforces the retention bound (most recent MAX_HISTORY)', () => {
    for (let i = 0; i < MAX_HISTORY + 5; i++) recordReading(snap(`Venus / P${i}`), true, new Date(2026, 0, i + 1));
    expect(getReadingHistory().length).toBe(MAX_HISTORY);
  });

  it('changeSince reports a Dasha move between snapshots', () => {
    recordReading(snap('Venus / Saturn'), true, new Date('2026-01-01'));
    recordReading(snap('Venus / Mercury'), true, new Date('2026-06-01'));
    const h = getReadingHistory();
    expect(changeSince(h, 0)).toMatch(/moved from Venus \/ Saturn to Venus \/ Mercury/);
    expect(changeSince(h, 1)).toBeNull();  // oldest has nothing before it
  });

  it('ACCOUNT-SYNC DECISION: history is device-local, keyed to dob, unaffected by any auth state', () => {
    // Simulate "generated while logged out" then "logged in" — the store has no auth
    // concept, so the same device keeps the same history (no wipe, no merge, no sync).
    recordReading(snap('Venus / Saturn'), true, new Date('2026-01-01'));
    // (a login/logout would not touch localStorage['bornclock-reading-history'])
    expect(getReadingHistory('1988-11-05')).toHaveLength(1);
    // a DIFFERENT birth date is a separate device-local track (no cross-contamination)
    recordReading(snap('Sun / Moon', '1990-04-20'), true, new Date('2026-02-01'));
    expect(getReadingHistory('1988-11-05')).toHaveLength(1);
    expect(getReadingHistory('1990-04-20')).toHaveLength(1);
  });

  it('clear removes everything', () => {
    recordReading(snap('Venus / Saturn'), true);
    clearReadingHistory();
    expect(getReadingHistory()).toHaveLength(0);
  });
});
