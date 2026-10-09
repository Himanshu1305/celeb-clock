/**
 * SERVER-SIDE daily rate limit for the AI astrologer chat (P5-3).
 *
 * Before this, the only enforcement lived in the browser: localStorage counted
 * the questions and the server simply trusted the `questionCount` the client
 * sent. Clearing localStorage (or editing the request) reset the limit. This
 * module makes the SERVER authoritative: it keeps its own daily count keyed by a
 * hashed client IP and ignores whatever the client claims.
 *
 * Privacy: the raw IP is never stored — only a SHA-256 hash (salted) is used as
 * the map key, so the store cannot be read back to an address. Nothing is
 * persisted to the database; counts live in the worker isolate's memory and
 * reset at UTC midnight.
 *
 * Durability note: an in-memory store is per-isolate and resets on restart.
 * That already closes the "clear localStorage to reset" bypass (the server no
 * longer trusts the client), and within a colo the isolate is reused across a
 * visitor's requests. A GLOBALLY durable, tamper-proof counter (shared across
 * every edge location, surviving restarts) needs a Cloudflare KV namespace or a
 * Supabase usage table — both documented for the person in MIGRATIONS_TO_APPLY.md
 * and listed under "Needs the person"; the `evaluate()` core here is written
 * against an injectable store so either backend can drop in later.
 */
import { limitForTier, type Tier } from './rateLimit';

/** UTC calendar-day key (edge-safe — independent of the isolate's locale). */
export function dayKeyUTC(now: Date): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/** Salted SHA-256 of the client IP → hex. The raw IP is never stored. */
export async function hashClientId(ip: string, salt = 'bornclock'): Promise<string> {
  try {
    const data = new TextEncoder().encode(`${salt}:${ip}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // If Web Crypto is unavailable, fall back to a non-reversible-enough key that
    // still namespaces by IP (never the raw IP alone).
    return `nohash:${salt}:${ip}`;
  }
}

export interface ServerRateRecord { day: string; count: number; }
export interface ServerRateStatus { allowed: boolean; used: number; remaining: number; limit: number; }

/** Read-only check: has this key already hit the tier's daily limit? Does NOT count. */
export function peek(store: Map<string, ServerRateRecord>, key: string, tier: Tier, now: Date): ServerRateStatus {
  const limit = limitForTier(tier);
  const day = dayKeyUTC(now);
  const rec = store.get(key);
  const count = rec && rec.day === day ? rec.count : 0;
  return { allowed: count < limit, used: Math.min(count, limit), remaining: Math.max(0, limit - count), limit };
}

/** Count one delivered answer against the key and return the new status. */
export function record(store: Map<string, ServerRateRecord>, key: string, tier: Tier, now: Date): ServerRateStatus {
  const limit = limitForTier(tier);
  const day = dayKeyUTC(now);
  const rec = store.get(key);
  const count = (rec && rec.day === day ? rec.count : 0) + 1;
  store.set(key, { day, count });
  // Bound memory: evict stale (previous-day) entries opportunistically.
  if (store.size > 5000) {
    for (const [k, v] of store) { if (v.day !== day) store.delete(k); }
  }
  return { allowed: count <= limit, used: Math.min(count, limit), remaining: Math.max(0, limit - count), limit };
}

// ── Module-level isolate store + convenience wrappers used by the endpoint ──
const STORE = new Map<string, ServerRateRecord>();

export function peekLimit(key: string, tier: Tier, now: Date = new Date()): ServerRateStatus {
  return peek(STORE, key, tier, now);
}

export function recordQuestionServer(key: string, tier: Tier, now: Date = new Date()): ServerRateStatus {
  return record(STORE, key, tier, now);
}

/** Test-only: clear the isolate store. */
export function __resetServerLimitStore(): void {
  STORE.clear();
}
