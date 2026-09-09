/**
 * React hook over the saved birth profile (Part E). Reads on mount, exposes the
 * current profile plus explicit save/clear. Writes happen ONLY via `save`, which
 * a component must call from a user opt-in — never automatically.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  loadProfile,
  saveProfile as persist,
  clearProfile as forget,
  SAVED_PROFILE_STORAGE_KEY,
  type SavedBirthProfile,
} from '@/services/savedProfile';

export interface UseSavedProfile {
  profile: SavedBirthProfile | null;
  loaded: boolean;
  /** Explicit opt-in save. Returns whether it persisted. */
  save: (p: SavedBirthProfile) => boolean;
  /** Forget the saved profile. */
  clear: () => void;
  /** Re-read from storage (e.g. after external changes). */
  refresh: () => void;
}

export function useSavedProfile(): UseSavedProfile {
  const [profile, setProfile] = useState<SavedBirthProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    // If storage is cleared/changed in another tab (or dev tools mid-session),
    // reflect it gracefully rather than keeping stale data.
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_PROFILE_STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const save = useCallback((p: SavedBirthProfile) => {
    const ok = persist(p);
    if (ok) setProfile({ ...p });
    return ok;
  }, []);

  const clear = useCallback(() => {
    forget();
    setProfile(null);
  }, []);

  return { profile, loaded, save, clear, refresh };
}
