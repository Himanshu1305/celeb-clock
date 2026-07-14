import { useState, useEffect } from 'react';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { getCountryExtras, CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { useCountryCode } from '@/hooks/useCountryCode';

// Extend this map to unlock the section for additional countries in the future.
const COUNTRY_LABEL: Record<string, string> = {
  IN: 'Born this day — from India 🇮🇳',
};

const CURRENT_YEAR = new Date().getFullYear();

function toDisplay(c: CelebrityBirthdayResult, index: number): DisplayCelebrity {
  const birthYear = c.birthDate ? new Date(c.birthDate + 'T12:00:00').getFullYear() : null;
  const deathYear = c.deathDate ? new Date(c.deathDate + 'T12:00:00').getFullYear() : null;
  return {
    name: c.name,
    birthYear,
    deathYear,
    age: birthYear && c.isLiving ? CURRENT_YEAR - birthYear : null,
    isLiving: c.isLiving,
    occupation: c.occupation ?? 'Celebrity',
    knownFor: c.knownFor,
    imageUrl: null,
    wikipediaUrl: c.wikipediaUrl,
    sitelinks: c.sitelinks,
  };
}

interface Props {
  /** "MM-DD" formatted date string */
  monthDay: string;
  /** Names already shown in the main global list — used for deduplication */
  mainListNames: string[];
}

/**
 * Additive "From India" section rendered below the global celebrity list.
 * Renders nothing for non-IN visitors, when country is still resolving,
 * or when there are no non-overlapping Indian celebrities for the date.
 * Never affects the order of the main list.
 * Suppressed during prerender (window.__PRERENDER__ = true) so bots always
 * see the global-only HTML that matches the prerendered snapshot.
 */
export function CountryExtrasSection({ monthDay, mainListNames }: Props) {
  const country = useCountryCode();
  const [extras, setExtras] = useState<CelebrityBirthdayResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Never render during prerender — bots see global list only
  if (typeof window !== 'undefined' && (window as any).__PRERENDER__) return null;

  useEffect(() => {
    if (!country || !COUNTRY_LABEL[country]) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    getCountryExtras(monthDay, country, mainListNames, 4)
      .then(results => { setExtras(results); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [monthDay, country, mainListNames.join(',')]);

  const label = country ? COUNTRY_LABEL[country] : null;
  if (!label || !loaded || extras.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-foreground mb-3">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {extras.map((celeb, i) => (
          <CelebrityCard
            key={celeb.name}
            celebrity={toDisplay(celeb, mainListNames.length + i)}
            index={mainListNames.length + i}
          />
        ))}
      </div>
    </div>
  );
}
