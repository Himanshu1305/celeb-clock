import { useState, useEffect, useRef } from 'react';
import { detectCountry } from '@/services/CountryDetectionService';
import { useAuth } from '@/hooks/useAuth';

// Persisted resolved-country cache (separate from CountryDetectionService's own
// cache) so the hook can seed its state SYNCHRONOUSLY on mount — eliminating the
// null-start window that made CountryExtrasSection flash then disappear on mobile
// re-renders (auth token-refresh / tab-focus events re-render every consumer).
//
// Cache key bumped to _v2 to invalidate any stale values written by the prior
// implementation, which could persist a non-ISO2 or empty-string value.
const CACHE_KEY = 'bc_country_code_v2';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

// A confirmed-valid country code is ISO-3166-1 alpha-2: exactly two ASCII
// letters. profile.country holds a full DISPLAY NAME ("India"), set at signup
// from ipapi's country_name and the countries dropdown (Auth.tsx) — NOT an ISO2
// code. It must be shape-validated before use; otherwise, when the auth profile
// resolves after first paint, "India" overrides the correctly-resolved ipapi
// ISO2 code and collapses ISO2-keyed consumers (COUNTRY_LABEL) to null — the
// mobile flash. We validate the shape rather than translate names (no
// name→code normalizer by design; ipapi already returns ISO2 directly).
function isValidCode(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Za-z]{2}$/.test(v);
}

function readCachedCountry(): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { code, ts } = JSON.parse(raw);
    if (isValidCode(code) && typeof ts === 'number' && Date.now() - ts < TTL_MS) {
      return code.toUpperCase();
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
 * Resolves the visitor's ISO-3166-1 alpha-2 country code without triggering
 * extra API calls.
 *
 * Sources, in order: a confirmed-valid profile.country (only if it happens to be
 * a 2-letter code) → persisted cache → detectCountry() (cached ipapi, same
 * source as pricing).
 *
 * LATCH INVARIANT: once a valid 2-letter code is resolved from ANY source, it is
 * held in a ref and nothing may reset it to null for the session. The return
 * value only ever transitions null→code or code→code, never code→null. This is
 * what stops the flash: mid-session re-renders (auth token-refresh, tab focus)
 * can no longer collapse a resolved code back to null.
 */
export function useCountryCode(): string | null {
  const { profile } = useAuth();
  // Synchronous seed from cache — no null flash on repeat renders.
  const [code, setCode] = useState<string | null>(() => readCachedCountry());
  const latched = useRef<string | null>(code);

  // Accept profile.country only if it is itself a valid ISO2 code; the common
  // case (full display name) and empty string are both rejected here, so they
  // can never override an already-resolved code.
  const profileCode = isValidCode(profile?.country)
    ? (profile!.country as string).toUpperCase()
    : null;

  useEffect(() => {
    if (profileCode && latched.current !== profileCode) {
      latched.current = profileCode;
      writeCachedCountry(profileCode);
      setCode(profileCode);
      return;
    }
    if (latched.current) return; // already resolved — never refetch or reset
    detectCountry()
      .then(info => {
        if (isValidCode(info?.countryCode)) {
          const resolved = info.countryCode.toUpperCase();
          latched.current = resolved;
          writeCachedCountry(resolved);
          setCode(resolved);
        }
      })
      .catch(() => { /* keep previous value — never reset resolved country to null */ });
  }, [profileCode]);

  return code;
}
