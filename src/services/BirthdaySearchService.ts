import { WikiPerson, WikiEvent } from '@/services/WikimediaService';
import { birthdayDatabase, searchCelebrities } from '@/data/birthdayData';
import { celebrities, findCelebrityByBirthday } from '@/data/celebrities';

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

export const searchLocalDatabase = (date: Date): { people: WikiPerson[], events: WikiEvent[] } => {
  const dateKey = formatDateKey(date);
  const results: { people: WikiPerson[], events: WikiEvent[] } = { people: [], events: [] };

  const birthdayData = birthdayDatabase[dateKey];
  if (birthdayData) {
    results.people.push(...birthdayData.people);
    results.events.push(...birthdayData.events);
  }

  const matchedCelebrities = findCelebrityByBirthday(date);
  const convertedCelebrities = matchedCelebrities.map(convertCelebrityToWikiPerson);
  convertedCelebrities.forEach(celeb => {
    if (!results.people.some(p => p.name.toLowerCase() === celeb.name.toLowerCase())) {
      results.people.push(celeb);
    }
  });

  return results;
};

export const searchNearbyDates = (date: Date): { people: WikiPerson[], events: WikiEvent[], dates: Date[] } => {
  const nearbyDates = getNearbyDates(date);
  const results: { people: WikiPerson[], events: WikiEvent[], dates: Date[] } = { people: [], events: [], dates: [] };

  for (const nearbyDate of nearbyDates) {
    const localResults = searchLocalDatabase(nearbyDate);
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
    LIMIT 30
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
    console.log('Wikidata query failed or timed out (single attempt):', error);
    return { people: [], events: [] };
  } finally {
    signal?.removeEventListener('abort', onExternalAbort);
  }
};

// Main search – single attempt per phase, with abort support
export const searchBirthdayMatches = async (
  date: Date,
  onProgress?: (status: string, phase: SearchPhase) => void,
  signal?: AbortSignal
): Promise<BirthdaySearchResult> => {
  const searchedDate = date;

  // Check cache first
  const cached = getCachedResult(date);
  if (cached) {
    onProgress?.('Found cached results!', 'done');
    return cached;
  }

  // Phase 1: Local database (instant)
  onProgress?.('Searching our celebrity database...', 'local');
  const localResults = searchLocalDatabase(date);

  if (localResults.people.length > 0) {
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
    return { people: [], events: [], source: 'local', searchedDate };
  }

  // Phase 2: Wikidata – single attempt, 8s timeout
  onProgress?.('No local matches found. Searching Wikipedia...', 'wikipedia');
  const apiResults = await queryWikidata(date, 8000, signal);

  if (apiResults.people.length > 0) {
    onProgress?.('Found matches from Wikipedia!', 'done');
    const result: BirthdaySearchResult = {
      people: apiResults.people,
      events: apiResults.events,
      source: 'api',
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
  const nearbyResults = searchNearbyDates(date);

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
