export interface WikiPerson {
  name: string;
  birthDate: string;
  deathDate?: string;
  profession: string;
  category: 'celebrity' | 'actor' | 'dancer' | 'artist' | 'internet_celebrity' | 'scientist' | 'entrepreneur' | 'sports' | 'athlete' | 'other';
  description?: string;
  image?: string;
  wikipediaUrl?: string;
  funFact?: string;
}

export interface WikiEvent {
  title: string;
  date: string;
  year: number;
  description: string;
  category: string;
  wikipediaUrl?: string;
}

export class WikimediaService {
  private static readonly WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
  private static readonly WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private static getCacheKey(type: 'people' | 'events', date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `wiki_${type}_${month}_${day}`;
  }

  private static getFromCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data as T;
    } catch {
      return null;
    }
  }

  private static setCache<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // Ignore cache errors (storage full, etc.)
    }
  }

  private static async queryWikidata(query: string): Promise<any> {
    const url = `${this.WIKIDATA_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Wikidata query failed');
      return await response.json();
    } catch (error) {
      console.error('Wikidata query error:', error);
      return { results: { bindings: [] } };
    }
  }

  private static async getWikipediaExtract(title: string): Promise<string> {
    const url = `${this.WIKIPEDIA_API}?action=query&format=json&titles=${encodeURIComponent(title)}&prop=extracts&exintro=true&explaintext=true&origin=*`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      const pages = data.query?.pages;
      const pageId = Object.keys(pages)[0];
      return pages[pageId]?.extract || '';
    } catch (error) {
      console.error('Wikipedia extract error:', error);
      return '';
    }
  }

  private static categorizeOccupation(occupation: string): WikiPerson['category'] {
    const lower = occupation.toLowerCase();
    
    // Specific categories first
    if (lower.includes('actor') || lower.includes('actress')) {
      return 'actor';
    }
    
    if (lower.includes('dancer') || lower.includes('choreographer') || lower.includes('ballet')) {
      return 'dancer';
    }
    
    if (lower.includes('painter') || lower.includes('sculptor') || lower.includes('artist') && 
        !lower.includes('music')) {
      return 'artist';
    }
    
    if (lower.includes('influencer') || lower.includes('youtuber') || lower.includes('streamer') ||
        lower.includes('blogger') || lower.includes('content creator')) {
      return 'internet_celebrity';
    }
    
    // Broader categories
    if (lower.includes('singer') || lower.includes('musician') || lower.includes('director') || 
        lower.includes('writer') || lower.includes('comedian') || lower.includes('entertainer')) {
      return 'celebrity';
    }
    
    if (lower.includes('scientist') || lower.includes('physicist') || lower.includes('chemist') ||
        lower.includes('biologist') || lower.includes('mathematician') || lower.includes('researcher')) {
      return 'scientist';
    }
    
    if (lower.includes('entrepreneur') || lower.includes('business') || lower.includes('founder') ||
        lower.includes('ceo') || lower.includes('inventor')) {
      return 'entrepreneur';
    }
    
    if (lower.includes('athlete') || lower.includes('player') || lower.includes('runner') ||
        lower.includes('swimmer') || lower.includes('gymnast') || lower.includes('tennis') ||
        lower.includes('football') || lower.includes('basketball') || lower.includes('baseball') ||
        lower.includes('soccer') || lower.includes('golf') || lower.includes('boxing') ||
        lower.includes('sport')) {
      return 'sports';
    }
    
    return 'other';
  }

  static async getPeopleByBirthDate(date: Date): Promise<WikiPerson[]> {
    // Check cache first
    const cacheKey = this.getCacheKey('people', date);
    const cached = this.getFromCache<WikiPerson[]>(cacheKey);
    if (cached) {
      console.log('Using cached people data');
      return cached;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const monthDay = `--${month}-${day}`;

    // Try API first
    const query = `
      SELECT DISTINCT ?person ?personLabel ?birthDate ?occupationLabel ?article WHERE {
        ?person wdt:P31 wd:Q5 .
        ?person wdt:P569 ?birthDate .
        FILTER(SUBSTR(STR(?birthDate), 6, 5) = "${monthDay}")
        OPTIONAL { ?person wdt:P106 ?occupation }
        OPTIONAL {
          ?article schema:about ?person .
          ?article schema:inLanguage "en" .
          ?article schema:isPartOf <https://en.wikipedia.org/> .
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
      }
      ORDER BY DESC(?birthDate)
      LIMIT 20
    `;

    try {
      const data = await Promise.race([
        this.queryWikidata(query),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
      ]) as any;
      
      const people: WikiPerson[] = [];

      for (const result of data.results?.bindings || []) {
        if (result.personLabel?.value && result.birthDate?.value) {
          const person: WikiPerson = {
            name: result.personLabel.value,
            birthDate: result.birthDate.value.split('T')[0],
            profession: result.occupationLabel?.value || 'Notable Person',
            category: this.categorizeOccupation(result.occupationLabel?.value || ''),
            wikipediaUrl: result.article?.value
          };

          people.push(person);
        }
      }

      if (people.length > 0) {
        console.log('Fetched people from Wikidata API');
        this.setCache(cacheKey, people);
        return people;
      }

      throw new Error('No results from API');
    } catch (error) {
      console.log('API failed, falling back to static data:', error);
      // Fallback to static data
      const { getBirthdayData } = await import('@/data/birthdayData');
      const data = getBirthdayData(date.getMonth() + 1, date.getDate());
      return data.people;
    }
  }

  static async getHistoricalEvents(date: Date): Promise<WikiEvent[]> {
    // Check cache first
    const cacheKey = this.getCacheKey('events', date);
    const cached = this.getFromCache<WikiEvent[]>(cacheKey);
    if (cached) {
      console.log('Using cached events data');
      return cached;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const monthDay = `--${month}-${day}`;

    // Try API first
    const query = `
      SELECT DISTINCT ?event ?eventLabel ?date ?year ?article WHERE {
        ?event wdt:P585 ?date .
        FILTER(SUBSTR(STR(?date), 6, 5) = "${monthDay}")
        BIND(YEAR(?date) as ?year)
        OPTIONAL {
          ?article schema:about ?event .
          ?article schema:inLanguage "en" .
          ?article schema:isPartOf <https://en.wikipedia.org/> .
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
      }
      ORDER BY DESC(?year)
      LIMIT 10
    `;

    try {
      const data = await Promise.race([
        this.queryWikidata(query),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
      ]) as any;
      
      const events: WikiEvent[] = [];

      for (const result of data.results?.bindings || []) {
        if (result.eventLabel?.value && result.date?.value) {
          const event: WikiEvent = {
            title: result.eventLabel.value,
            date: result.date.value.split('T')[0],
            year: parseInt(result.year?.value || '0'),
            description: 'Historical Event',
            category: 'Historical Event',
            wikipediaUrl: result.article?.value
          };

          events.push(event);
        }
      }

      if (events.length > 0) {
        console.log('Fetched events from Wikidata API');
        this.setCache(cacheKey, events);
        return events;
      }

      throw new Error('No results from API');
    } catch (error) {
      console.log('API failed, falling back to static data:', error);
      // Fallback to static data
      const { getBirthdayData } = await import('@/data/birthdayData');
      const data = getBirthdayData(date.getMonth() + 1, date.getDate());
      return data.events;
    }
  }
}