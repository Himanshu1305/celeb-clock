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

// Convert Celebrity from celebrities.ts to WikiPerson format
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

// Format date as MM-DD for database lookup
const formatDateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

// Get nearby dates (±3 days)
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

// Search local database first
export const searchLocalDatabase = (date: Date): { people: WikiPerson[], events: WikiEvent[] } => {
  const dateKey = formatDateKey(date);
  const results: { people: WikiPerson[], events: WikiEvent[] } = {
    people: [],
    events: []
  };

  // 1. Check birthdayDatabase (comprehensive static data)
  const birthdayData = birthdayDatabase[dateKey];
  if (birthdayData) {
    results.people.push(...birthdayData.people);
    results.events.push(...birthdayData.events);
  }

  // 2. Check celebrities.ts (featured celebrities)
  const matchedCelebrities = findCelebrityByBirthday(date);
  const convertedCelebrities = matchedCelebrities.map(convertCelebrityToWikiPerson);
  
  // Add unique celebrities (avoid duplicates by name)
  convertedCelebrities.forEach(celeb => {
    if (!results.people.some(p => p.name.toLowerCase() === celeb.name.toLowerCase())) {
      results.people.push(celeb);
    }
  });

  return results;
};

// Search nearby dates in local database
export const searchNearbyDates = (date: Date): { people: WikiPerson[], events: WikiEvent[], dates: Date[] } => {
  const nearbyDates = getNearbyDates(date);
  const results: { people: WikiPerson[], events: WikiEvent[], dates: Date[] } = {
    people: [],
    events: [],
    dates: []
  };

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

// Wikidata SPARQL query with shorter timeout
export const queryWikidata = async (date: Date, timeout: number = 3000): Promise<{ people: WikiPerson[], events: WikiEvent[] }> => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const monthDay = `--${month}-${day}`;

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
    console.log('Wikidata query failed or timed out:', error);
    return { people: [], events: [] };
  }
};

// Main search function with optimized flow
export const searchBirthdayMatches = async (
  date: Date,
  onProgress?: (status: string) => void
): Promise<BirthdaySearchResult> => {
  const searchedDate = date;
  
  // Step 1: Search local database FIRST (instant)
  onProgress?.('Searching local database...');
  const localResults = searchLocalDatabase(date);
  
  if (localResults.people.length > 0) {
    onProgress?.('Found matches in local database!');
    return {
      people: localResults.people,
      events: localResults.events,
      source: 'local',
      searchedDate
    };
  }

  // Step 2: Try Wikidata API with short timeout (3 seconds)
  onProgress?.('Searching Wikipedia...');
  const apiResults = await queryWikidata(date, 3000);
  
  if (apiResults.people.length > 0) {
    onProgress?.('Found matches from Wikipedia!');
    return {
      people: apiResults.people,
      events: apiResults.events,
      source: 'api',
      searchedDate
    };
  }

  // Step 3: Search nearby dates as fallback
  onProgress?.('Searching nearby dates...');
  const nearbyResults = searchNearbyDates(date);
  
  if (nearbyResults.people.length > 0) {
    onProgress?.(`Found matches from nearby dates!`);
    return {
      people: nearbyResults.people,
      events: nearbyResults.events,
      source: 'fallback',
      searchedDate,
      nearbyDates: nearbyResults.dates
    };
  }

  // Step 4: No matches found
  onProgress?.('No matches found');
  return {
    people: [],
    events: [],
    source: 'local',
    searchedDate
  };
};
