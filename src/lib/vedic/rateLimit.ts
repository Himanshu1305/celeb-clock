/**
 * Daily question rate-limit for the AI astrologer chat (Part F).
 *   Free tier: 3 questions/day. Paid tier: 15 questions/day. Resets at local
 *   midnight.
 *
 * The COUNTING + ENFORCEMENT logic here is real and unit-tested. Persistence is
 * client-side localStorage THIS SESSION (bypassable by clearing storage) — a
 * durable, tamper-proof store needs a server-side usage table + the payment
 * system, both deferred. Paid tier is a stub flag (no payment system built).
 */

export type Tier = 'free' | 'paid';

export interface UsageRecord {
  day: string;   // YYYY-MM-DD (local)
  count: number;
}

export const FREE_DAILY_LIMIT = 3;
export const PAID_DAILY_LIMIT = 15;

export function limitForTier(tier: Tier): number {
  return tier === 'paid' ? PAID_DAILY_LIMIT : FREE_DAILY_LIMIT;
}

/** Local calendar day key. */
export function dayKey(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Normalise a stored record to today (a record from a previous day resets). */
export function currentRecord(stored: UsageRecord | null, now: Date): UsageRecord {
  const today = dayKey(now);
  if (!stored || stored.day !== today || typeof stored.count !== 'number' || stored.count < 0) {
    return { day: today, count: 0 };
  }
  return { day: today, count: Math.floor(stored.count) };
}

export interface RateStatus {
  allowed: boolean;   // may they ask another question now?
  used: number;
  remaining: number;
  limit: number;
  tier: Tier;
}

/** Pure enforcement decision from a (normalised-or-raw) record + tier. */
export function checkRateLimit(stored: UsageRecord | null, tier: Tier, now: Date): RateStatus {
  const rec = currentRecord(stored, now);
  const limit = limitForTier(tier);
  const used = Math.min(rec.count, limit);
  const remaining = Math.max(0, limit - rec.count);
  return { allowed: rec.count < limit, used, remaining, limit, tier };
}

/** Record one asked question (call AFTER a question is accepted). */
export function recordQuestion(stored: UsageRecord | null, now: Date): UsageRecord {
  const rec = currentRecord(stored, now);
  return { day: rec.day, count: rec.count + 1 };
}

/** Server-side guard: is this count already at/over the tier limit? */
export function isOverLimit(count: number, tier: Tier): boolean {
  return count >= limitForTier(tier);
}

/** Friendly message shown when the daily limit is reached. */
export function limitReachedMessage(tier: Tier): string {
  const limit = limitForTier(tier);
  return tier === 'paid'
    ? `You've reached today's limit of ${limit} questions. Your questions refresh tomorrow — I'll be here when you're back.`
    : `You've used your ${limit} free questions for today. They refresh tomorrow. (A future upgrade will raise this to ${PAID_DAILY_LIMIT} a day.)`;
}

// ── Client-side persistence wrapper (localStorage) ───────────────────────────
const STORAGE_KEY = 'bornclock-astrologer-usage';

function readStored(): UsageRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.day === 'string' && typeof parsed.count === 'number') return parsed;
    return null;
  } catch { return null; }
}

function writeStored(rec: UsageRecord): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rec)); } catch { /* noop */ }
}

/** Read current status from localStorage. */
export function getStatus(tier: Tier, now: Date = new Date()): RateStatus {
  return checkRateLimit(readStored(), tier, now);
}

/** Persist one more asked question and return the new status. */
export function commitQuestion(tier: Tier, now: Date = new Date()): RateStatus {
  const next = recordQuestion(readStored(), now);
  writeStored(next);
  return checkRateLimit(next, tier, now);
}

export const RATE_LIMIT_STORAGE_KEY = STORAGE_KEY;
