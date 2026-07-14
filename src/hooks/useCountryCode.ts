import { useState, useEffect } from 'react';
import { detectCountry } from '@/services/CountryDetectionService';
import { useAuth } from '@/hooks/useAuth';

/**
 * Resolves the visitor's country code without triggering extra API calls.
 * Priority: profile.country (logged-in) → detectCountry() (cached ipapi, same
 * source as pricing) → null.
 */
export function useCountryCode(): string | null {
  const { profile } = useAuth();
  const [detected, setDetected] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.country) return; // profile takes precedence — no need to detect
    detectCountry()
      .then(info => setDetected(info.countryCode))
      .catch(() => setDetected(null));
  }, [profile?.country]);

  return profile?.country ?? detected;
}
