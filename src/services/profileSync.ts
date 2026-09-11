/**
 * Account-level birth-profile sync (Part K Item 4 → ACTIVATED in Part L Item 1).
 *
 * The `profiles.birth_profile` (jsonb) column is now present (confirmed via a real
 * query), so this is live: a logged-in user's saved birth profile syncs to their
 * account row and follows them to other devices; anonymous users stay device-only,
 * unchanged. The opt-in, device-only consent model is preserved — account sync only
 * ADDS cross-device reach for a profile the user already chose to save.
 *
 * IMPORTANT: the user's profile row is matched by the `user_id` column (= auth user
 * id), the same key the rest of the app (useAuth) uses — NOT the row's own `id` PK.
 *
 * DESIGN: every function degrades gracefully — if the column is somehow missing
 * (Postgres 42703 / PostgREST PGRST204) or ANY error occurs (network, RLS), it returns
 * null/false and the app continues on device-only storage exactly as before.
 */
import type { SavedBirthProfile } from './savedProfile';
import { isValidProfile } from './savedProfile';

/** Minimal shape of the Supabase client we rely on — keeps this testable with a mock. */
export interface MinimalSupabase {
  from(table: string): {
    select(cols: string): { eq(col: string, val: string): { maybeSingle(): Promise<{ data: any; error: any }> } };
    update(values: Record<string, unknown>): { eq(col: string, val: string): Promise<{ data: any; error: any }> };
  };
}

const COLUMN = 'birth_profile';
const MATCH = 'user_id'; // the profiles row is keyed by the auth user id (like the rest of the app)

/** True when an error means "the column isn't there yet" (so we fall back silently). */
function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return code === '42703' || code === 'PGRST204' || msg.includes(COLUMN) && msg.includes('column');
}

/**
 * Save the profile to the logged-in user's account row. Returns true on success,
 * false on any failure (missing column, network, RLS) — caller keeps device-only.
 */
export async function syncProfileToAccount(sb: MinimalSupabase, userId: string, profile: SavedBirthProfile): Promise<boolean> {
  if (!userId || !isValidProfile(profile)) return false;
  try {
    const { error } = await sb.from('profiles').update({ [COLUMN]: profile }).eq(MATCH, userId);
    if (error) { if (!isMissingColumn(error)) console.debug('[profileSync] save fallback:', error.message); return false; }
    return true;
  } catch (e) { console.debug('[profileSync] save threw, falling back:', e); return false; }
}

/**
 * Load the account-stored profile, or null if none / column missing / any error.
 * Only returns a structurally-valid profile (guards corrupted/partial account data).
 */
export async function loadProfileFromAccount(sb: MinimalSupabase, userId: string): Promise<SavedBirthProfile | null> {
  if (!userId) return null;
  try {
    const { data, error } = await sb.from('profiles').select(COLUMN).eq(MATCH, userId).maybeSingle();
    if (error) { if (!isMissingColumn(error)) console.debug('[profileSync] load fallback:', error.message); return null; }
    const raw = data?.[COLUMN];
    return raw && isValidProfile(raw) ? (raw as SavedBirthProfile) : null;
  } catch (e) { console.debug('[profileSync] load threw, falling back:', e); return null; }
}

/** Deep-equal two profiles on the fields that matter (dob/time/city). */
export function sameProfile(a: SavedBirthProfile | null, b: SavedBirthProfile | null): boolean {
  if (!a || !b) return a === b;
  return a.dob === b.dob && a.time === b.time &&
    (a.city?.name ?? null) === (b.city?.name ?? null) &&
    (a.city?.lat ?? null) === (b.city?.lat ?? null) &&
    (a.city?.lon ?? null) === (b.city?.lon ?? null) &&
    (a.city?.tz ?? null) === (b.city?.tz ?? null);
}

export interface ProfileResolution {
  /** The profile to actually use right now. */
  active: SavedBirthProfile | null;
  source: 'account' | 'device' | 'none';
  /**
   * Set ONLY when a device profile and a DIFFERENT account profile both exist — so the
   * UI can surface a clear notice. The DOCUMENTED DEFAULT is: the account's synced
   * profile takes precedence (active = account), while `conflict.device` lets the user
   * one-tap switch back to the details entered on this device. Never a silent overwrite.
   */
  conflict: { account: SavedBirthProfile; device: SavedBirthProfile } | null;
}

/**
 * Pure conflict-resolution policy (unit-testable without a DB):
 * - account only            → use account.
 * - device only             → use device (caller pushes it up).
 * - both, identical         → use account, no conflict.
 * - both, DIFFERENT          → use account (precedence) AND report a conflict, so the
 *                              user gets a notice with a one-tap "use this device's details".
 * - neither                 → none.
 */
export function resolveWithConflict(account: SavedBirthProfile | null, device: SavedBirthProfile | null): ProfileResolution {
  const accountValid = account && isValidProfile(account) ? account : null;
  const deviceValid = device && isValidProfile(device) ? device : null;
  if (accountValid && deviceValid) {
    if (sameProfile(accountValid, deviceValid)) return { active: accountValid, source: 'account', conflict: null };
    return { active: accountValid, source: 'account', conflict: { account: accountValid, device: deviceValid } };
  }
  if (accountValid) return { active: accountValid, source: 'account', conflict: null };
  if (deviceValid) return { active: deviceValid, source: 'device', conflict: null };
  return { active: null, source: 'none', conflict: null };
}

/**
 * Async resolver for a logged-in user: loads the account copy, applies the conflict
 * policy, and — when only a device copy exists — best-effort pushes it up so it follows
 * the user to other devices. Anonymous users are never touched (device-only, unchanged).
 */
export async function resolveAccountProfile(sb: MinimalSupabase | null, userId: string | null, deviceProfile: SavedBirthProfile | null): Promise<ProfileResolution> {
  if (!sb || !userId) return { active: deviceProfile, source: deviceProfile ? 'device' : 'none', conflict: null };
  const account = await loadProfileFromAccount(sb, userId);
  const res = resolveWithConflict(account, deviceProfile);
  if (res.source === 'device' && res.active) { void syncProfileToAccount(sb, userId, res.active); } // first login on a fresh account
  return res;
}

/** Back-compat thin wrapper (Part K): returns just the active profile. */
export async function resolveProfile(sb: MinimalSupabase | null, userId: string | null, deviceProfile: SavedBirthProfile | null): Promise<SavedBirthProfile | null> {
  return (await resolveAccountProfile(sb, userId, deviceProfile)).active;
}
