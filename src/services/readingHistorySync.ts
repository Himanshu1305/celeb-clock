/**
 * Account-level reading-history sync (Part AC / Part S.6).
 *
 * Extends the exact pattern of `profileSync.ts` (Part L) from the single saved profile
 * to the LIST of reading-history snapshots. A logged-in user's reading history follows
 * them across devices via a `profiles.reading_history` (jsonb) column keyed by `user_id`;
 * anonymous users stay device-only, entirely unchanged (see readingHistory.ts).
 *
 * CONFLICT MODEL (adapted for a LIST, non-destructive by construction): unlike a single
 * profile where "account wins" means one value replaces another, a history is a set of
 * snapshots. The account copy is AUTHORITATIVE, but we never drop device-only snapshots
 * that haven't synced yet — the two are MERGED (union by identity), so there is never a
 * silent overwrite or silent data loss. `deviceOnly` reports the not-yet-synced device
 * entries so the UI can show a clear "these were on this device" notice if desired.
 *
 * ADMIN/TESTING ISOLATION (Part S.6.4 + Part N principle 4): account sync is SKIPPED for
 * admin/testing identities (isHistorySyncEligible === false), so heavy testing under a
 * shared account (e.g. hello@bornclock.com) never writes to an account row and cannot
 * pollute — or be polluted by — a real user's synced history. Real users are keyed by
 * their own user_id, so accounts are isolated from each other by construction regardless.
 *
 * DESIGN: every function degrades gracefully — missing column (Postgres 42703 /
 * PostgREST PGRST204) or ANY error → returns null/false/[] and the app continues on
 * device-only storage exactly as before.
 */
import { MAX_HISTORY, type ReadingHistoryEntry } from './readingHistory';
import { isAdminEmail } from '@/lib/adminEmails';

/** Minimal Supabase surface we rely on — keeps this unit-testable with a mock. */
export interface MinimalSupabase {
  from(table: string): {
    select(cols: string): { eq(col: string, val: string): { maybeSingle(): Promise<{ data: any; error: any }> } };
    update(values: Record<string, unknown>): { eq(col: string, val: string): Promise<{ data: any; error: any }> };
  };
}

const COLUMN = 'reading_history';
const MATCH = 'user_id';

/** Identity of a snapshot: one entry per (birth date, Dasha state) — same key readingHistory de-dupes on. */
const keyOf = (e: ReadingHistoryEntry) => `${e.dob}|${e.dasha}`;

function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return code === '42703' || code === 'PGRST204' || (msg.includes(COLUMN) && msg.includes('column'));
}

function isValidEntry(e: any): e is ReadingHistoryEntry {
  return e && typeof e.generatedAt === 'string' && typeof e.dob === 'string' && typeof e.dasha === 'string';
}

/**
 * Whether a signed-in identity should sync reading history to its account. False for
 * admin/testing identities so their test churn stays device-local (isolation, Part S.6.4).
 */
export function isHistorySyncEligible(email: string | null | undefined): boolean {
  return !isAdminEmail(email);
}

/**
 * Merge account + device histories: union by (dob, Dasha), keeping the most-recent
 * timestamp for each, sorted most-recent-first and capped at MAX_HISTORY. Non-destructive
 * — no snapshot from either side is silently dropped (beyond the shared retention cap).
 */
export function mergeHistories(account: ReadingHistoryEntry[], device: ReadingHistoryEntry[]): ReadingHistoryEntry[] {
  const byKey = new Map<string, ReadingHistoryEntry>();
  // Device first, then account overrides — but we keep whichever has the LATER timestamp.
  for (const e of [...device, ...account]) {
    if (!isValidEntry(e)) continue;
    const k = keyOf(e);
    const existing = byKey.get(k);
    if (!existing || new Date(e.generatedAt).getTime() > new Date(existing.generatedAt).getTime()) byKey.set(k, e);
  }
  return [...byKey.values()]
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, MAX_HISTORY);
}

export interface HistoryResolution {
  /** The merged, authoritative history to use (account superset + any device-only entries). */
  entries: ReadingHistoryEntry[];
  source: 'account' | 'device' | 'none';
  /** Device snapshots NOT present in the account copy (not-yet-synced) — for a non-destructive notice. */
  deviceOnly: ReadingHistoryEntry[];
}

/**
 * Pure resolution policy (unit-testable without a DB): merge account + device, and report
 * which device entries were not in the account. Account is authoritative for ordering/dedup;
 * nothing is lost.
 */
export function resolveHistoryWithConflict(account: ReadingHistoryEntry[] | null, device: ReadingHistoryEntry[]): HistoryResolution {
  const acc = (account || []).filter(isValidEntry);
  const dev = (device || []).filter(isValidEntry);
  const accKeys = new Set(acc.map(keyOf));
  const deviceOnly = dev.filter(e => !accKeys.has(keyOf(e)));
  const merged = mergeHistories(acc, dev);
  const source: HistoryResolution['source'] = acc.length ? 'account' : dev.length ? 'device' : 'none';
  return { entries: merged, source, deviceOnly };
}

/** Save the full history array to the user's account row. False on any failure (caller keeps device-only). */
export async function syncHistoryToAccount(sb: MinimalSupabase, userId: string, entries: ReadingHistoryEntry[]): Promise<boolean> {
  if (!userId) return false;
  try {
    const clean = (entries || []).filter(isValidEntry).slice(0, MAX_HISTORY);
    const { error } = await sb.from('profiles').update({ [COLUMN]: clean }).eq(MATCH, userId);
    if (error) { if (!isMissingColumn(error)) console.debug('[historySync] save fallback:', error.message); return false; }
    return true;
  } catch (e) { console.debug('[historySync] save threw, falling back:', e); return false; }
}

/** Load the account-stored history, or null if none / column missing / any error. */
export async function loadHistoryFromAccount(sb: MinimalSupabase, userId: string): Promise<ReadingHistoryEntry[] | null> {
  if (!userId) return null;
  try {
    const { data, error } = await sb.from('profiles').select(COLUMN).eq(MATCH, userId).maybeSingle();
    if (error) { if (!isMissingColumn(error)) console.debug('[historySync] load fallback:', error.message); return null; }
    const raw = data?.[COLUMN];
    return Array.isArray(raw) ? raw.filter(isValidEntry) : null;
  } catch (e) { console.debug('[historySync] load threw, falling back:', e); return null; }
}

/**
 * Async resolver for a logged-in user: loads the account copy, merges with the device
 * copy, and pushes the merged superset back up so the account becomes authoritative and
 * device-only snapshots are preserved cross-device. Admin/testing identities and
 * anonymous users are left device-only, untouched.
 */
export async function resolveAccountHistory(
  sb: MinimalSupabase | null, userId: string | null, email: string | null, device: ReadingHistoryEntry[],
): Promise<HistoryResolution> {
  if (!sb || !userId || !isHistorySyncEligible(email)) {
    return { entries: (device || []).filter(isValidEntry).slice(0, MAX_HISTORY), source: device?.length ? 'device' : 'none', deviceOnly: [] };
  }
  const account = await loadHistoryFromAccount(sb, userId);
  const res = resolveHistoryWithConflict(account, device);
  // Push the merged superset up when the device holds entries the account lacks (keeps
  // both sides consistent and preserves not-yet-synced device history cross-device).
  if (res.deviceOnly.length || (account === null && res.entries.length)) void syncHistoryToAccount(sb, userId, res.entries);
  return res;
}
