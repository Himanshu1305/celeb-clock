import { getIndianCelebritiesByDate } from '@/data/indianCelebrities';
import { classifyDisplayTier } from '@/data/celebrityCategories';

export function isIndianUser(): boolean {
  try {
    const cached = localStorage.getItem('bornclock_country');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Simple format: { country: 'IN' } (written by CountryDetectionService >= v2)
      if (typeof parsed.country === 'string') return parsed.country === 'IN' || parsed.country === 'India';
      // Legacy format: { data: { countryCode }, timestamp }
      if (parsed.data?.countryCode) return parsed.data.countryCode === 'IN';
    }
    return true;
  } catch {
    return true;
  }
}

export interface MergedCelebrity {
  name: string;
  birth_date?: string;
  category?: string;
  known_for?: string;
  nationality?: string;
  birth_year?: number;
  death_year?: number | null;
  tier: 'entertainment' | 'public_figure' | 'historical';
  isIndian: boolean;
  [key: string]: unknown;
}

export function mergeWithIndianCelebrities(
  globalCelebrities: unknown[],
  month: number,
  day: number,
  showIndianFirst: boolean = true
): MergedCelebrity[] {
  const indianMatches = getIndianCelebritiesByDate(month, day);

  const indianMerged: MergedCelebrity[] = indianMatches.map(celeb => ({
    ...celeb,
    tier: celeb.tier,
    isIndian: true,
  }));

  const globalMerged: MergedCelebrity[] = (globalCelebrities as Record<string, unknown>[]).map(celeb => ({
    ...celeb,
    tier: classifyDisplayTier(celeb as Parameters<typeof classifyDisplayTier>[0]),
    isIndian: false,
  }));

  const indianNames = new Set(indianMatches.map(c => c.name.toLowerCase()));
  const dedupedGlobal = globalMerged.filter(
    c => !indianNames.has(String(c.name || '').toLowerCase())
  );

  if (showIndianFirst) {
    return [...indianMerged, ...dedupedGlobal];
  }
  return [...dedupedGlobal, ...indianMerged];
}

export function hasIndianCelebritiesForDate(month: number, day: number): boolean {
  return getIndianCelebritiesByDate(month, day).length > 0;
}
