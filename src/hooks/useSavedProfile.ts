/**
 * React hook over the saved birth profile (Part E; account sync added in Part L).
 *
 * Reads the device (localStorage) profile on mount. For a LOGGED-IN user it also syncs
 * with their account (`profiles.birth_profile`): the account copy follows them across
 * devices. Anonymous users are entirely unchanged — device-only. Writes still happen
 * ONLY via `save` (explicit opt-in). When a device profile and a DIFFERENT account
 * profile both exist, the account takes precedence and a `conflict` is surfaced so the
 * UI can offer a one-tap switch (never a silent overwrite of the user's local entry).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadProfile,
  saveProfile as persist,
  clearProfile as forget,
  isFullVedicProfile,
  SAVED_PROFILE_STORAGE_KEY,
  type SavedBirthProfile,
} from '@/services/savedProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { resolveAccountProfile, syncProfileToAccount } from '@/services/profileSync';

export interface ProfileConflict { account: SavedBirthProfile; device: SavedBirthProfile }

export interface UseSavedProfile {
  profile: SavedBirthProfile | null;
  loaded: boolean;
  /** True when the saved profile has date + time + place (what Vedic tools need). */
  isFull: boolean;
  /** Set when a device profile and a DIFFERENT account profile both exist (account wins by default). */
  conflict: ProfileConflict | null;
  /** Resolve a surfaced conflict: keep the account copy, or switch to this device's copy. */
  resolveConflict: (keep: 'account' | 'device') => void;
  /** Explicit opt-in save (device + account when logged in). Returns whether it persisted locally. */
  save: (p: SavedBirthProfile) => boolean;
  /** Forget the saved profile (device only). */
  clear: () => void;
  /** Re-read from storage. */
  refresh: () => void;
}

export function useSavedProfile(): UseSavedProfile {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [profile, setProfile] = useState<SavedBirthProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [conflict, setConflict] = useState<ProfileConflict | null>(null);
  const resolvedFor = useRef<string | null>(null);

  const refresh = useCallback(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_PROFILE_STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  // On login, reconcile the device profile with the account (once per user id). Any
  // failure (network/RLS) falls back silently to the device profile — no broken UX.
  useEffect(() => {
    if (!userId) { resolvedFor.current = null; return; }
    if (resolvedFor.current === userId) return;
    resolvedFor.current = userId;
    let cancelled = false;
    (async () => {
      const device = loadProfile();
      const res = await resolveAccountProfile(supabase as any, userId, device);
      if (cancelled) return;
      setProfile(res.active);
      setConflict(res.conflict);
      // Account won cleanly → cache it locally so this device reflects it too.
      if (res.source === 'account' && !res.conflict && res.active) persist(res.active);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const save = useCallback((p: SavedBirthProfile) => {
    const ok = persist(p);
    if (ok) { setProfile({ ...p }); setConflict(null); }
    if (userId) void syncProfileToAccount(supabase as any, userId, p); // best-effort account sync
    return ok;
  }, [userId]);

  const resolveConflict = useCallback((keep: 'account' | 'device') => {
    setConflict(c => {
      if (!c) return null;
      const chosen = keep === 'device' ? c.device : c.account;
      persist(chosen);                 // make it the device copy
      setProfile(chosen);
      if (userId) void syncProfileToAccount(supabase as any, userId, chosen); // and the account copy
      return null;
    });
  }, [userId]);

  const clear = useCallback(() => {
    forget();
    setProfile(null);
    setConflict(null);
  }, []);

  return { profile, loaded, isFull: isFullVedicProfile(profile), conflict, resolveConflict, save, clear, refresh };
}
