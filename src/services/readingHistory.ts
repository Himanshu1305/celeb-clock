/**
 * Saved reading history (Part P, Part 3) — lightweight continuity so a user can see
 * how their chart's story has evolved, not just the latest reading.
 *
 * WHAT IS STORED: a small snapshot per generated reading (when, and the key facts
 * Rashi / Lagna / Nakshatra / current Dasha) — reusing already-computed data, no new
 * calculation and no reading prose. Device-local (localStorage), never the server.
 *
 * CONSENT: recorded ONLY for a user who has saved their profile (i.e. already opted
 * into on-device storage of their birth data — Part E). No saved profile → nothing is
 * retained. Same "stored on this device only" posture as the saved profile itself.
 *
 * RETENTION BOUND: the most recent MAX_HISTORY (10) entries are kept; older ones are
 * dropped. Chosen so the list shows real evolution over years of Dasha changes without
 * unbounded growth on a small device store.
 *
 * ACCOUNT-SYNC INTERACTION (deliberate, tested — Part 3.5): history is DEVICE-LOCAL and
 * keyed only to the birth date. It is NOT synced to the account and is NOT wiped by
 * logging in or out — on a given device it simply persists (same birth date → same
 * history). It does NOT merge or transfer across devices. This is an explicit scope
 * bound (a full account-synced history is a documented future step), chosen to avoid
 * bloating the Part L account jsonb and to keep the privacy surface minimal.
 */

export interface ReadingHistoryEntry {
  generatedAt: string;  // ISO
  dob: string;          // ties the entry to a birth identity (device-local key)
  rashi: string;
  lagna: string;
  nakshatra: string;
  dasha: string;        // "Maha / Antar"
}

export const MAX_HISTORY = 10;
const STORAGE_KEY = 'bornclock-reading-history';

function readAll(): ReadingHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(e => e && typeof e.generatedAt === 'string' && typeof e.dob === 'string') : [];
  } catch { return []; }
}
function writeAll(list: ReadingHistoryEntry[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_HISTORY))); } catch { /* noop */ }
}

/**
 * Record a reading snapshot (most-recent-first), capped at MAX_HISTORY. De-duplicates:
 * if the newest existing entry for this dob already has the SAME Dasha, only its
 * timestamp is refreshed (re-opening an unchanged chart doesn't spam the history).
 * `hasSavedProfile` is the consent gate — false → nothing is stored.
 */
export function recordReading(entry: Omit<ReadingHistoryEntry, 'generatedAt'>, hasSavedProfile: boolean, now: Date = new Date()): void {
  if (!hasSavedProfile) return;                     // consent gate
  if (!entry.dob || !entry.dasha) return;
  const list = readAll();
  const newest = list[0];
  const full: ReadingHistoryEntry = { ...entry, generatedAt: now.toISOString() };
  if (newest && newest.dob === entry.dob && newest.dasha === entry.dasha) {
    list[0] = { ...newest, generatedAt: full.generatedAt }; // same state → refresh timestamp only
    writeAll(list);
    return;
  }
  writeAll([full, ...list]);
}

/** All history entries, most recent first (optionally filtered to one birth date). */
export function getReadingHistory(dob?: string): ReadingHistoryEntry[] {
  const all = readAll();
  return dob ? all.filter(e => e.dob === dob) : all;
}

/** Clear all history (user control / logout-if-desired). */
export function clearReadingHistory(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

/**
 * "What's changed since" note for an entry, comparing it to the NEXT-OLDER entry with
 * the same dob. Returns null when nothing notable changed. Reuses stored data only.
 */
export function changeSince(entries: ReadingHistoryEntry[], index: number): string | null {
  const cur = entries[index];
  const older = entries.slice(index + 1).find(e => e.dob === cur.dob);
  if (!older) return null;
  if (older.dasha !== cur.dasha) return `Your Dasha period has since moved from ${older.dasha} to ${cur.dasha}.`;
  return null;
}
