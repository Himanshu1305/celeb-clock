import { useState, useEffect } from 'react';
import { detectCountry } from '@/services/CountryDetectionService';
import { useAuth } from '@/hooks/useAuth';

// Persisted resolved-country cache (separate from CountryDetectionService's own
// cache) so the hook can seed its state SYNCHRONOUSLY on mount — eliminating the
// null-start window that made CountryExtrasSection flash then disappear on mobile
// re-renders (auth token-refresh / tab-focus events re-render every consumer).
const CACHE_KEY = 'bc_country_code';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

function readCachedCountry(): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { code, ts } = JSON.parse(raw);
    if (typeof code === 'string' && typeof ts === 'number' && Date.now() - ts < TTL_MS) {
      return code;
    }
  } catch { /* storage unavailable / private mode — never throw */ }
  return null;
}

function writeCachedCountry(code: string): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ code, ts: Date.now() }));
  } catch { /* never throw on storage errors */ }
}

/**
 * Resolves the visitor's country code without triggering extra API calls.
 * Priority: profile.country (logged-in) → persisted cache → detectCountry()
 * (cached ipapi, same source as pricing) → null.
 *
 * The resolved value is persisted (24h TTL) and read synchronously via the
 * useState initializer, so repeat mounts/renders return the code immediately
 * and never collapse back to null mid-session.
 */
export function useCountryCode(): string | null {
  const { profile } = useAuth();
  // Synchronous seed from cache — no null flash on repeat renders.
  const [detected, setDetected] = useState<string | null>(() => readCachedCountry());

  useEffect(() => {
    if (profile?.country) return; // profile takes precedence — no need to detect
    if (detected) return;         // already resolved (cache or prior fetch) — don't refetch/reset
    detectCountry()
      .then(info => {
        if (info?.countryCode) {
          writeCachedCountry(info.countryCode);
          setDetected(info.countryCode);
        }
      })
      .catch(() => { /* keep previous value — never reset resolved country to null */ });
  }, [profile?.country, detected]);

  return profile?.country ?? detected;
}
