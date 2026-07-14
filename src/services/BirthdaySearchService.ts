import { WikiPerson, WikiEvent } from '@/services/WikimediaService';
import { findCelebrityByBirthday } from '@/data/celebrities';
import { supabase } from '@/integrations/supabase/client';
import { CELEBRITY_NATIONALITY } from '@/data/celebrityNationality';

export interface BirthdaySearchResult {
  people: WikiPerson[];
  events: WikiEvent[];
  source: 'local' | 'api' | 'fallback';
  searchedDate: Date;
  nearbyDates?: Date[];
}

export type SearchPhase = 'local' | 'wikipedia' | 'nearby' | 'done';

// --- localStorage cache helpers (24-hour TTL) ---
const CACHE_PREFIX = 'birthday_search_';
const CACHE_TTL = 24 * 60 * 60 * 1000;

const getCacheKey = (date: Date): string => {
  return `${CACHE_PREFIX}${formatDateKey(date)}`;
};

const getCachedResult = (date: Date): BirthdaySearchResult | null => {
  try {
    const key = getCacheKey(date);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return { ...cached.data, searchedDate: new Date(cached.data.searchedDate) };
  } catch {
    return null;
  }
};

const setCachedResult = (date: Date, result: BirthdaySearchResult): void => {
  try {
    const key = getCacheKey(date);
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data: result }));
  } catch { /* quota exceeded – ignore */ }
};

// --- helpers ---

const convertCelebrityToWikiPerson = (celebrity: any): WikiPerson => ({
  name: celebrity.name,
  birthDate: celebrity.birthDate,
  profession: celebrity.profession,
  category: categorizeByProfession(celebrity.profession),
  description: celebrity.funFact,
  image: celebrity.image,
});

const categorizeByProfession = (profession: string): WikiPerson['category'] => {
  const lower = profession.toLowerCase();
  if (lower.includes('actor') || lower.includes('actress')) return 'actor';
  if (lower.includes('singer') || lower.includes('musician')) return 'celebrity';
  if (lower.includes('dancer')) return 'dancer';
  if (lower.includes('artist') || lower.includes('painter')) return 'artist';
  if (lower.includes('entrepreneur') || lower.includes('business')) return 'entrepreneur';
  if (lower.includes('scientist') || lower.includes('physicist')) return 'scientist';
  if (lower.includes('athlete') || lower.includes('player') || lower.includes('wrestler')) return 'sports';
  return 'celebrity';
};

const formatDateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const getNearbyDates = (date: Date): Date[] => {
  const nearby: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + i);
    nearby.push(newDate);
  }
  return nearby;
};

// --- search functions ---

export const searchLocalDatabase = async (date: Date): Promise<{ people: WikiPerson[], events: WikiEvent[] }> => {
  const dateKey = formatDateKey(date);
  const results: { people: WikiPerson[], events: WikiEvent[] } = { people: [], events: [] };

  const { birthdayDatabase } = await import('@/data/birthdayData');
  const birthdayData = birthdayDatabase[dateKey];
  if (birthdayData) {
    results.people.push(...birthdayData.people);
    results.events.push(...birthdayData.events);
  }

  const matchedCelebrities = await findCelebrityByBirthday(date);
  const convertedCelebrities = matchedCelebrities.map(convertCelebrityToWikiPerson);
  convertedCelebrities.forEach(celeb => {
    if (!results.people.some(p => p.name.toLowerCase() === celeb.name.toLowerCase())) {
      results.people.push(celeb);
    }
  });

  return results;
};

export const searchNearbyDates = async (date: Date): Promise<{ people: WikiPerson[], events: WikiEvent[], dates: Date[] }> => {
  const nearbyDates = getNearbyDates(date);
  const results: { people: WikiPerson[], events: WikiEvent[], dates: Date[] } = { people: [], events: [], dates: [] };

  for (const nearbyDate of nearbyDates) {
    const localResults = await searchLocalDatabase(nearbyDate);
    if (localResults.people.length > 0 || localResults.events.length > 0) {
      results.people.push(...localResults.people);
      results.events.push(...localResults.events);
      if (!results.dates.some(d => d.getTime() === nearbyDate.getTime())) {
        results.dates.push(nearbyDate);
      }
    }
  }

  return results;
};

// Single-attempt Wikidata query with 8s timeout
export const queryWikidata = async (
  date: Date,
  timeout: number = 8000,
  signal?: AbortSignal
): Promise<{ people: WikiPerson[], events: WikiEvent[] }> => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const query = `
    SELECT DISTINCT ?person ?personLabel ?birthDate ?occupationLabel ?image ?article WHERE {
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P569 ?birthDate .
      FILTER(SUBSTR(STR(?birthDate), 6, 5) = "${month}-${day}")
      OPTIONAL { ?person wdt:P106 ?occupation }
      OPTIONAL { ?person wdt:P18 ?image }
      OPTIONAL {
        ?article schema:about ?person .
        ?article schema:inLanguage "en" .
        ?article schema:isPartOf <https://en.wikipedia.org/> .
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY DESC(?birthDate)
    LIMIT 50
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // If an external signal is already aborted, bail immediately
  if (signal?.aborted) {
    clearTimeout(timeoutId);
    return { people: [], events: [] };
  }

  // Abort our internal controller if external signal fires
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  try {
    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Wikidata query failed');
    const data = await response.json();

    const people: WikiPerson[] = [];
    for (const result of data.results?.bindings || []) {
      if (result.personLabel?.value && result.birthDate?.value) {
        const occupation = result.occupationLabel?.value || 'Notable Person';
        people.push({
          name: result.personLabel.value,
          birthDate: result.birthDate.value.split('T')[0],
          profession: occupation,
          category: categorizeByProfession(occupation),
          image: result.image?.value,
          wikipediaUrl: result.article?.value
        });
      }
    }

    return { people, events: [] };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Wikidata query failed or timed out (single attempt):', error);
    return { people: [], events: [] };
  } finally {
    signal?.removeEventListener('abort', onExternalAbort);
  }
};

// Main search – single attempt per phase, with abort support
// Now always tries to get at least 6 celebrities
export const searchBirthdayMatches = async (
  date: Date,
  onProgress?: (status: string, phase: SearchPhase) => void,
  signal?: AbortSignal
): Promise<BirthdaySearchResult> => {
  const searchedDate = date;
  const MIN_CELEBRITIES = 6;

  // Check cache first
  const cached = getCachedResult(date);
  if (cached && cached.people.length >= MIN_CELEBRITIES) {
    onProgress?.('Found cached results!', 'done');
    return cached;
  }

  // Phase 1: Local database (instant)
  onProgress?.('Searching our celebrity database...', 'local');
  const localResults = await searchLocalDatabase(date);

  // If we have enough local results, return them
  if (localResults.people.length >= MIN_CELEBRITIES) {
    onProgress?.('Found matches in our database!', 'done');
    const result: BirthdaySearchResult = {
      people: localResults.people,
      events: localResults.events,
      source: 'local',
      searchedDate
    };
    setCachedResult(date, result);
    return result;
  }

  // Bail if aborted
  if (signal?.aborted) {
    return { people: localResults.people, events: localResults.events, source: 'local', searchedDate };
  }

  // Phase 2: Wikidata – try to supplement local results (increased timeout to 15s)
  onProgress?.('Searching Wikipedia for more matches...', 'wikipedia');
  const apiResults = await queryWikidata(date, 15000, signal);

  // Combine local and API results, removing duplicates
  const combinedPeople = [...localResults.people];
  const existingNames = new Set(combinedPeople.map(p => p.name.toLowerCase()));
  
  for (const person of apiResults.people) {
    if (!existingNames.has(person.name.toLowerCase())) {
      combinedPeople.push(person);
      existingNames.add(person.name.toLowerCase());
    }
  }

  if (combinedPeople.length > 0) {
    onProgress?.('Found matches!', 'done');
    const result: BirthdaySearchResult = {
      people: combinedPeople,
      events: [...localResults.events, ...apiResults.events],
      source: combinedPeople.length === localResults.people.length ? 'local' : 'api',
      searchedDate
    };
    setCachedResult(date, result);
    return result;
  }

  if (signal?.aborted) {
    return { people: [], events: [], source: 'local', searchedDate };
  }

  // Phase 3: Nearby dates fallback
  onProgress?.('Searching nearby dates...', 'nearby');
  const nearbyResults = await searchNearbyDates(date);

  if (nearbyResults.people.length > 0) {
    onProgress?.('Found matches from nearby dates!', 'done');
    const result: BirthdaySearchResult = {
      people: nearbyResults.people,
      events: nearbyResults.events,
      source: 'fallback',
      searchedDate,
      nearbyDates: nearbyResults.dates
    };
    setCachedResult(date, result);
    return result;
  }

  onProgress?.('No matches found', 'done');
  return { people: [], events: [], source: 'local', searchedDate };
};

export interface CelebrityBirthdayResult {
  name: string;
  birthDate: string | null;
  deathDate: string | null;
  sitelinks: number;
  nationality: string | null;
  nationalityCode: string | null;
  occupation: string | null;
  knownFor: string | null;
  wikipediaUrl: string | null;
  wikidataId: string | null;
  isLiving: boolean;
}

/**
 * Canonical celebrity-for-date query used by all surfaces:
 * BirthdayResults, TodaysBirthdays, CelebrityBirthday, ReportView, BornOnDay, CelebrityMatch.
 *
 * Ranking: sitelinks DESC + optional country boost (+500 for userCountry match).
 * No secondary re-sorting — callers must not override this order.
 */
export async function getRankedBirthdayCelebrities(
  monthDay: string,       // "MM-DD" format
  userCountry: string | null,
  limit: number = 12
): Promise<CelebrityBirthdayResult[]> {
  try {
    const { data, error } = await supabase
      .from('celebrity_sitelinks')
      .select('name, birth_date, death_date, sitelinks, nationality, nationality_code, occupation, known_for, wikipedia_url, wikidata_id')
      .eq('birth_month_day', monthDay)
      .order('sitelinks', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return [];
    }

    // Apply country boost: celebrities from user's country get +500 to their score.
    // nationality_code is NULL for all Supabase rows; use local map as fallback.
    const scored = data.map(celeb => {
      const effectiveNationality =
        celeb.nationality_code ||
        CELEBRITY_NATIONALITY[celeb.name] ||
        null;
      return {
        ...celeb,
        score: (celeb.sitelinks ?? 0) + (
          userCountry && effectiveNationality === userCountry ? 500 : 0
        ),
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(c => ({
      name: c.name,
      birthDate: c.birth_date,
      deathDate: c.death_date,
      sitelinks: c.sitelinks ?? 0,
      nationality: c.nationality,
      nationalityCode: c.nationality_code,
      occupation: c.occupation,
      knownFor: c.known_for ?? null,
      wikipediaUrl: c.wikipedia_url,
      wikidataId: c.wikidata_id,
      isLiving: !c.death_date,
    }));
  } catch (err) {
    console.error('BirthdaySearchService: Supabase celebrity query failed (returning []):', err);
    return [];
  }
}
