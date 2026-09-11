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

/**
 * PROGRESSIVE profile (Part J): only `dob` is required. `time` and `city` are
 * optional so a date-only tool (e.g. the Age Calculator) can save just a date, and
 * a richer Vedic tool can later fill in the missing pieces — never re-asking for
 * what's already saved. Opt-in + device-only is UNCHANGED (privacy model preserved).
 */
export interface SavedBirthProfile {
  dob: string;         // YYYY-MM-DD (required)
  time?: string;       // HH:MM (24h) — optional (Vedic tools need it)
  city?: SavedCity;    // optional (Vedic tools need it)
  savedAt?: string;    // ISO
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

function isValidCity(c: unknown): c is SavedCity {
  if (!c || typeof c !== 'object') return false;
  const o = c as Record<string, unknown>;
  if (typeof o.name !== 'string' || !o.name) return false;
  if (typeof o.lat !== 'number' || !Number.isFinite(o.lat) || o.lat < -90 || o.lat > 90) return false;
  if (typeof o.lon !== 'number' || !Number.isFinite(o.lon) || o.lon < -180 || o.lon > 180) return false;
  if (typeof o.tz !== 'number' || !Number.isFinite(o.tz) || o.tz < -14 || o.tz > 14) return false;
  return true;
}

/**
 * True for a structurally-valid (possibly PARTIAL) profile: a real `dob` is
 * required; `time`/`city` are validated ONLY if present. Guards corrupted storage
 * without rejecting a legitimate date-only profile.
 */
export function isValidProfile(p: unknown): p is SavedBirthProfile {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  if (typeof o.dob !== 'string' || !isRealDate(o.dob)) return false;
  if (o.time !== undefined && (typeof o.time !== 'string' || !isRealTime(o.time))) return false;
  if (o.city !== undefined && !isValidCity(o.city)) return false;
  return true;
}

/** True when the profile has everything a Vedic tool needs (date + time + place). */
export function isFullVedicProfile(p: unknown): p is Required<Pick<SavedBirthProfile, 'dob' | 'time' | 'city'>> & SavedBirthProfile {
  return isValidProfile(p) && typeof (p as SavedBirthProfile).time === 'string' && isValidCity((p as SavedBirthProfile).city);
}

/**
 * Merge a patch into an existing profile (progressive extension). Only fills/updates
 * fields present in the patch; never drops what's already saved. Returns a profile
 * that must still pass isValidProfile before saving.
 */
export function mergeProfile(existing: SavedBirthProfile | null, patch: Partial<SavedBirthProfile>): SavedBirthProfile {
  return {
    dob: patch.dob ?? existing?.dob ?? '',
    time: patch.time ?? existing?.time,
    city: patch.city ?? existing?.city,
  };
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
