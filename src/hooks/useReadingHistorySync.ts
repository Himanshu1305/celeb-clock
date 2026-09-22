/**
 * React hook over reading history WITH account sync (Part AC / Part S.6).
 *
 * Reads the device (localStorage) history like before. For a LOGGED-IN, sync-eligible
 * user it also reconciles once with the account copy (`profiles.reading_history`): the
 * account + device histories are MERGED (non-destructive), the merged superset is written
 * back to this device, and any not-yet-synced device entries are surfaced as `deviceOnly`
 * so the UI can show a clear notice. Anonymous and admin/testing users are device-only,
 * unchanged. Any failure (network/RLS/missing column) falls back silently to device-only.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getReadingHistory, replaceAllHistory, type ReadingHistoryEntry } from '@/services/readingHistory';
import { resolveAccountHistory } from '@/services/readingHistorySync';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UseReadingHistorySync {
  entries: ReadingHistoryEntry[];
  /** Device snapshots not yet in the account copy (for a non-destructive notice). */
  deviceOnly: ReadingHistoryEntry[];
  /** True once an account reconcile has completed for this user. */
  synced: boolean;
  refresh: () => void;
}

export function useReadingHistorySync(dob?: string, refreshKey?: unknown): UseReadingHistorySync {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const email = user?.email ?? null;
  const [entries, setEntries] = useState<ReadingHistoryEntry[]>([]);
  const [deviceOnly, setDeviceOnly] = useState<ReadingHistoryEntry[]>([]);
  const [synced, setSynced] = useState(false);
  const reconciledFor = useRef<string | null>(null);

  const refresh = useCallback(() => setEntries(getReadingHistory(dob)), [dob]);

  // Device read (and re-read on new reading / dob change).
  useEffect(() => { setEntries(getReadingHistory(dob)); }, [dob, refreshKey]);

  // One-time account reconcile per user id. Falls back silently to device-only.
  useEffect(() => {
    if (!userId) { reconciledFor.current = null; setSynced(false); setDeviceOnly([]); return; }
    if (reconciledFor.current === userId) return;
    reconciledFor.current = userId;
    let cancelled = false;
    (async () => {
      const device = getReadingHistory();                    // full device history (all dobs)
      const res = await resolveAccountHistory(supabase as any, userId, email, device);
      if (cancelled) return;
      // Persist the merged superset locally so this device reflects the account too.
      if (res.entries.length !== device.length || res.source === 'account') replaceAllHistory(res.entries);
      setEntries(getReadingHistory(dob));
      setDeviceOnly(res.deviceOnly);
      setSynced(true);
    })();
    return () => { cancelled = true; };
  }, [userId, email, dob]);

  return { entries, deviceOnly, synced, refresh };
}
