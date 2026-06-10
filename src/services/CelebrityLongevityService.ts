// src/services/CelebrityLongevityService.ts

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

// Celebrities excluded because their end was non-longevity: violence, accident, suicide, overdose.
const EXCLUSION_NAMES = [
  'Martin Luther King Jr.', 'John F. Kennedy', 'Princess Diana', 'Marilyn Monroe',
  'Heath Ledger', 'Avicii', 'XXXTentacion', 'Juice WRLD', 'Mac Miller',
  'Chester Bennington', 'Chris Cornell', 'Kurt Cobain', 'Amy Winehouse',
  'Janis Joplin', 'Jim Morrison', 'Jimi Hendrix', 'Malcolm X',
  'Abraham Lincoln', 'Mahatma Gandhi', 'Indira Gandhi', 'Rajiv Gandhi',
  'John Lennon', 'Bob Marley', 'Tupac Shakur', 'Biggie Smalls', 'Bruce Lee',
  'River Phoenix', 'Philip Seymour Hoffman', 'Robin Williams', 'Anthony Bourdain',
  'Kate Spade', 'Alexander McQueen', "L'Wren Scott", 'Brian Jones',
];
const EXCLUSION_SET = new Set(EXCLUSION_NAMES.map(n => n.toLowerCase()));

function isExcluded(name: string): boolean {
  const lower = name.toLowerCase();
  return EXCLUSION_SET.has(lower) ||
    EXCLUSION_NAMES.some(e => lower.includes(e.toLowerCase()) || e.toLowerCase().includes(lower));
}

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
    return `${name} (${age}) continues to inspire as a ${prof}, a testament to sustained vitality and purpose.`;
  }
  return `${name} spent ${age} extraordinary years as a ${prof}. Their legacy continues to inspire generations.`;
}

export function findInitialMatches(
  forecastAge: number,
  windowYears = 4,
  userCountry = '',
): CelebrityLongevityProfile[] {
  const currentYear = new Date().getFullYear();
  const seen = new Set<string>();
  const results: CelebrityLongevityProfile[] = [];

  for (const key of Object.keys(birthdayDatabase)) {
    for (const person of birthdayDatabase[key].people) {
      if (!person.birthDate || isExcluded(person.name) || seen.has(person.name)) continue;
      seen.add(person.name);

      const birthYear = new Date(person.birthDate).getFullYear();
      const currentAge = currentYear - birthYear;

      // Exclude very young / short-lived
      if (currentAge < 45) continue;

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

  if (results.length < 3 && windowYears < 10) {
    return findInitialMatches(forecastAge, windowYears + 2, userCountry);
  }

  return results.slice(0, 6);
}

export async function enhanceCelebrityMatches(
  candidates: CelebrityLongevityProfile[],
  forecastAge: number,
): Promise<CelebrityLongevityProfile[]> {
  const currentYear = new Date().getFullYear();

  const enhanced = await Promise.all(
    candidates.map(async (c) => {
      const deathYear = await fetchDeathYear(c.name);
      if (deathYear === null) return c;

      const birthYear = currentYear - c.longevityAge;
      const ageAtDeath = deathYear - birthYear;

      if (ageAtDeath < 45 || isExcluded(c.name)) return null;

      return {
        ...c,
        longevityAge: ageAtDeath,
        isLiving: false,
        achievement: makeAchievement(c.name, ageAtDeath, false, c.profession),
      };
    })
  );

  const valid = enhanced.filter(Boolean) as CelebrityLongevityProfile[];
  const matched = valid.filter(c => Math.abs(c.longevityAge - forecastAge) <= 4);
  return (matched.length >= 3 ? matched : valid).slice(0, 3);
}
