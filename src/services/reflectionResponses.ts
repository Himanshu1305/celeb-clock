/**
 * Past-Period Reflection responses (Part R) — persistent, per-user tracking of which
 * reflection theme-questions have been shown/answered, so each theme is asked AT MOST
 * ONCE, EVER (never per-session), and the user's answer is stored for the person's own
 * future reference/analytics.
 *
 * CONSENT: recorded ONLY for a user who has saved their profile (i.e. already opted
 * into on-device storage of their birth data — Part E). No saved profile → nothing is
 * stored and no question is tracked. This is the SAME consent gate and device-local
 * posture as the saved reading history (Part P) — see docs/part-r-touchpoints.md. No
 * new category of data leaves the device; account-sync is a documented future bound,
 * identical to reading history.
 *
 * ROBUST "ONCE EVER" (adversarial requirement): responses live under their OWN storage
 * key, keyed by birth date (dob). Regenerating the chart (same dob) finds the same
 * answered set, so an answered theme never reappears; clearing a DIFFERENT piece of
 * state (reading history, or the saved profile itself) does not touch these responses.
 * The first answer for a (dob, theme) is IMMUTABLE — a second, careless or rapid click
 * cannot overwrite it, so state stays consistent.
 */
import type { ReflectionTheme, ReflectionResponse } from '@/lib/vedic/reflection';

export interface ReflectionAnswer {
  dob: string;                 // YYYY-MM-DD — birth identity (device-local key)
  theme: ReflectionTheme;
  response: ReflectionResponse;
  answeredAt: string;          // ISO
}

const STORAGE_KEY = 'bornclock-reflection-responses';

function readAll(): ReflectionAnswer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.filter(a => a && typeof a.dob === 'string' && typeof a.theme === 'string' && typeof a.response === 'string')
      : [];
  } catch { return []; }
}

function writeAll(list: ReflectionAnswer[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

/**
 * Record a reflection answer. `hasSavedProfile` is the consent gate — false → no-op.
 * The first answer for a (dob, theme) stands: a later call for the same pair is
 * ignored (immutable once-ever), keeping the tracking robust to double/careless taps.
 * Returns true if a NEW answer was stored.
 */
export function recordReflectionResponse(
  dob: string, theme: ReflectionTheme, response: ReflectionResponse,
  hasSavedProfile: boolean, now: Date = new Date(),
): boolean {
  if (!hasSavedProfile) return false;          // consent gate
  if (!dob || !theme || !response) return false;
  const list = readAll();
  if (list.some(a => a.dob === dob && a.theme === theme)) return false; // once ever — immutable
  list.push({ dob, theme, response, answeredAt: now.toISOString() });
  writeAll(list);
  return true;
}

/** The set of themes already answered for this birth date (what must NOT be re-shown). */
export function getAnsweredThemes(dob: string): Set<ReflectionTheme> {
  return new Set(readAll().filter(a => a.dob === dob).map(a => a.theme));
}

/** All stored responses, optionally filtered to one birth date (analytics / reference). */
export function getReflectionResponses(dob?: string): ReflectionAnswer[] {
  const all = readAll();
  return dob ? all.filter(a => a.dob === dob) : all;
}

/** Clear all stored reflection responses (user control). */
export function clearReflectionResponses(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

export const REFLECTION_STORAGE_KEY = STORAGE_KEY;
