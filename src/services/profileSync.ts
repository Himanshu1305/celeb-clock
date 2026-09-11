/**
 * Account-level birth-profile sync (Part K, Item 4) — PREPARED + TESTED, dormant.
 *
 * STATUS: the sync CODE below is written and unit-tested against a mocked Supabase
 * client (both "column present" and "column absent" cases). It is NOT yet wired live,
 * because the required `profiles.birth_profile` column does not exist yet and the
 * migration cannot be reliably applied/verified from this environment (no Supabase
 * CLI; the local service-role key is invalid; migrations follow the manual
 * dashboard/NOTES-*.sql pattern). See docs/part-k-flags.md for the exact, ready-to-run
 * SQL and the one-line enable step.
 *
 * DESIGN: every function degrades gracefully — if the column is missing (Postgres
 * 42703 / PostgREST PGRST204) or ANY error occurs, it returns null/false and the app
 * continues on device-only storage exactly as it does today. The opt-in, device-only
 * consent model is unchanged: account sync is an ADDITION for logged-in users who have
 * already chosen to save, never a silent expansion of what's stored.
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
    const { error } = await sb.from('profiles').update({ [COLUMN]: profile }).eq('id', userId);
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
    const { data, error } = await sb.from('profiles').select(COLUMN).eq('id', userId).maybeSingle();
    if (error) { if (!isMissingColumn(error)) console.debug('[profileSync] load fallback:', error.message); return null; }
    const raw = data?.[COLUMN];
    return raw && isValidProfile(raw) ? (raw as SavedBirthProfile) : null;
  } catch (e) { console.debug('[profileSync] load threw, falling back:', e); return null; }
}

/**
 * Resolve the effective profile for a logged-in user: prefer the account copy, else
 * the device copy; if only a device copy exists, best-effort push it to the account
 * (so it follows the user to other devices once the column exists). Pure/graceful.
 */
export async function resolveProfile(sb: MinimalSupabase | null, userId: string | null, deviceProfile: SavedBirthProfile | null): Promise<SavedBirthProfile | null> {
  if (!sb || !userId) return deviceProfile;              // anonymous → device-only, unchanged
  const account = await loadProfileFromAccount(sb, userId);
  if (account) return account;
  if (deviceProfile && isValidProfile(deviceProfile)) { void syncProfileToAccount(sb, userId, deviceProfile); }
  return deviceProfile;
}
