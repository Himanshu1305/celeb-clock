/**
 * Saved birth profile (Part E) — the "enter once, reuse everywhere" store for the
 * Vedic features (Kundali, Kundali-Match, Baby Names, birthday-report Vedic
 * section).
 *
 * PRIVACY: birth details are persisted ONLY when the user explicitly opts in
 * (a "Save my birth details" control calls `saveProfile`). Nothing is written
 * silently. This preserves the site's existing privacy policy ("Date of birth —
 * stored only if you explicitly save your profile") and the deliberate decision
 * to not keep birth data in localStorage otherwise. Account-level sync is a
 * documented future follow-up (the profiles table has no birth column yet).
 */

const STORAGE_KEY = 'bornclock-birth-profile';

export interface SavedCity {
  name: string;
  lat: number;
  lon: number;
  tz: number;
}

export interface SavedBirthProfile {
  dob: string;   // YYYY-MM-DD
  time: string;  // HH:MM (24h)
  city: SavedCity;
  savedAt?: string; // ISO
}

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/** A real calendar date in YYYY-MM-DD (no rollover like 1988-13-45). */
function isRealDate(s: string): boolean {
  if (!DOB_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** A valid 24h clock time (rejects 25:99). */
function isRealTime(s: string): boolean {
  if (!TIME_RE.test(s)) return false;
  const [h, min] = s.split(':').map(Number);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

/** True only for a structurally-valid profile. Guards against corrupted storage. */
export function isValidProfile(p: unknown): p is SavedBirthProfile {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  if (typeof o.dob !== 'string' || !isRealDate(o.dob)) return false;
  if (typeof o.time !== 'string' || !isRealTime(o.time)) return false;
  const c = o.city as Record<string, unknown> | undefined;
  if (!c || typeof c !== 'object') return false;
  if (typeof c.name !== 'string' || !c.name) return false;
  if (typeof c.lat !== 'number' || !Number.isFinite(c.lat) || c.lat < -90 || c.lat > 90) return false;
  if (typeof c.lon !== 'number' || !Number.isFinite(c.lon) || c.lon < -180 || c.lon > 180) return false;
  if (typeof c.tz !== 'number' || !Number.isFinite(c.tz) || c.tz < -14 || c.tz > 14) return false;
  return true;
}

/**
 * Load the saved profile, or null. Corrupted/malformed/partial JSON returns null
 * (and self-heals by removing the bad entry) — never throws, never returns a
 * half-built profile that would produce a wrong chart.
 */
export function loadProfile(): SavedBirthProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidProfile(parsed)) {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      return null;
    }
    return parsed;
  } catch {
    // Non-JSON garbage in storage — self-heal by removing it so it can't wedge.
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    return null;
  }
}

/** Persist the profile. Call this ONLY from an explicit user opt-in. */
export function saveProfile(profile: SavedBirthProfile): boolean {
  if (!isValidProfile(profile)) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false; // storage full / disabled — caller continues without persistence
  }
}

/** Forget the saved profile ("use different details" / clear). */
export function clearProfile(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

export const SAVED_PROFILE_STORAGE_KEY = STORAGE_KEY;
