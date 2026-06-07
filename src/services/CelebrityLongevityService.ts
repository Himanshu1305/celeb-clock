// src/services/CelebrityLongevityService.ts
// Finds celebrities whose longevity age matches the user's forecast.
// Death dates fetched from Wikidata, cached 30 days in localStorage.

import { birthdayDatabase } from '@/data/birthdayData';

export interface CelebrityLongevityProfile {
  name: string;
  longevityAge: number;
  isLiving: boolean;
  country: string;
  category: string;
  profession: string;
  achievement: string;
  wikiUrl?: string;
  imageUrl?: string;
}

// Celebrities excluded because their deaths were non-longevity events (accident, violence, suicide)
const EXCLUSION_LIST = new Set([
  'Princess Diana', 'Marilyn Monroe', 'Heath Ledger', 'XXXTentacion', 'Avicii',
  'Amy Winehouse', 'Kurt Cobain', 'Chester Bennington', 'Chris Cornell',
  'Janis Joplin', 'Jimi Hendrix', 'Jim Morrison', 'Brian Jones',
]);

const DEATH_CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

async function fetchDeathYear(name: string): Promise<number | null> {
  const key = `celeb-death-${name}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { deathYear, ts } = JSON.parse(raw);
      if (Date.now() - ts < DEATH_CACHE_TTL) return deathYear;
    }
  } catch { /* ignore */ }

  const query = `SELECT ?deathDate WHERE {
    ?person wdt:P570 ?deathDate ;
            rdfs:label "${name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"@en .
  } LIMIT 1`;

  try {
    const res = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) }
    );
    const data = await res.json();
    const raw = data.results?.bindings?.[0]?.deathDate?.value;
    const deathYear = raw ? new Date(raw).getFullYear() : null;
    try { localStorage.setItem(key, JSON.stringify({ deathYear, ts: Date.now() })); } catch { /* ignore */ }
    return deathYear;
  } catch {
    return null;
  }
}

function makeAchievement(name: string, age: number, isLiving: boolean, profession: string): string {
  const prof = profession.toLowerCase();
  if (isLiving) {
    return `${name} (${age}) remains actively engaged as a ${prof}`;
  }
  return `${name} achieved remarkable milestones across ${age} inspiring years as a ${prof}`;
}

// Synchronous: returns matches based purely on birth year (all assumed living).
// Call enhanceCelebrityMatches() afterwards to enrich with death dates.
export function findInitialMatches(forecastAge: number, windowYears = 5): CelebrityLongevityProfile[] {
  const currentYear = new Date().getFullYear();
  const seen = new Set<string>();
  const results: CelebrityLongevityProfile[] = [];

  for (const key of Object.keys(birthdayDatabase)) {
    for (const person of birthdayDatabase[key].people) {
      if (!person.birthDate || EXCLUSION_LIST.has(person.name) || seen.has(person.name)) continue;
      seen.add(person.name);

      const birthYear = new Date(person.birthDate).getFullYear();
      const currentAge = currentYear - birthYear;

      if (Math.abs(currentAge - forecastAge) <= windowYears) {
        results.push({
          name: person.name,
          longevityAge: currentAge,
          isLiving: true,
          country: '',
          category: person.category || 'celebrity',
          profession: person.profession || 'Notable Person',
          achievement: makeAchievement(person.name, currentAge, true, person.profession || 'Notable Person'),
          wikiUrl: person.wikipediaUrl,
        });
      }
    }
  }

  // Widen window if too few results
  if (results.length < 3 && windowYears < 10) {
    return findInitialMatches(forecastAge, windowYears + 3);
  }

  // Shuffle slightly and cap at 6 candidates for async enrichment
  return results.slice(0, 6);
}

// Async: fetches death years for the initial candidates, recalculates longevity ages,
// re-filters to ±3 years, returns top 3.
export async function enhanceCelebrityMatches(
  candidates: CelebrityLongevityProfile[],
  forecastAge: number,
): Promise<CelebrityLongevityProfile[]> {
  const currentYear = new Date().getFullYear();

  const enhanced = await Promise.all(
    candidates.map(async (c) => {
      const deathYear = await fetchDeathYear(c.name);
      if (deathYear === null) return c; // assume still living

      const ageAtDeath = deathYear - (currentYear - c.longevityAge);
      return {
        ...c,
        longevityAge: ageAtDeath,
        isLiving: false,
        achievement: makeAchievement(c.name, ageAtDeath, false, c.profession),
      };
    })
  );

  // Re-filter to ±3 years of forecast
  const matched = enhanced.filter(c => Math.abs(c.longevityAge - forecastAge) <= 3);
  return (matched.length >= 3 ? matched : enhanced).slice(0, 3);
}
