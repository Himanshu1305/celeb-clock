/**
 * Wikimedia "On this day" feed — P4-BIRTHDAY-EVENTS + NB-DEATHS.
 *
 * "What happened on your birthday" — notable historical EVENTS, BIRTHS and
 * DEATHS for a given month/day, pulled at request time from Wikipedia's public
 * REST "On this day" feed. The page is evergreen (one stable URL per
 * month/day); the content is fetched live and refreshes as Wikipedia does, so
 * we never bake one prerendered page per date (Rule 13).
 *
 * Content is Wikipedia text and must carry CC BY-SA 4.0 attribution
 * (see WIKIMEDIA_ATTRIBUTION). Every item links back to its source article.
 */

/** REST v1 "On this day" feed. CORS-enabled, no auth required. */
const ONTHISDAY_API = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday';
const CACHE_PREFIX = 'otd_cache_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days — content changes slowly.

export const WIKIMEDIA_ATTRIBUTION = {
  text: 'Historical events, births and deaths from Wikipedia, licensed under CC BY-SA 4.0.',
  licenseName: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  sourceLabel: 'Wikipedia — On this day',
  sourceUrl: 'https://en.wikipedia.org/wiki/Wikipedia:On_this_day',
} as const;

export type OtdKind = 'events' | 'births' | 'deaths';

export interface OtdItem {
  year: number;
  text: string;
  pageTitle: string | null;
  pageUrl: string | null;
  extract: string | null;
  thumbnail: string | null;
}

export interface OnThisDay {
  events: OtdItem[];
  births: OtdItem[];
  deaths: OtdItem[];
  /** True when the live fetch failed and we are returning empty data. */
  failed: boolean;
}

interface RawPage {
  title?: string;
  normalizedtitle?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string }; mobile?: { page?: string } };
  thumbnail?: { source?: string };
}
interface RawItem {
  text?: string;
  year?: number;
  pages?: RawPage[];
}

const pad = (n: number) => String(n).padStart(2, '0');

function mapItem(raw: RawItem): OtdItem {
  const page = raw.pages?.[0];
  return {
    year: Number(raw.year) || 0,
    text: String(raw.text || '').trim(),
    pageTitle: page?.normalizedtitle || page?.title || null,
    pageUrl: page?.content_urls?.desktop?.page || page?.content_urls?.mobile?.page || null,
    extract: page?.extract || null,
    thumbnail: page?.thumbnail?.source || null,
  };
}

/** Most-recent-first, capped — recent entries are the most recognisable. */
function clean(items: RawItem[] | undefined, limit: number): OtdItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map(mapItem)
    .filter(i => i.text.length > 0)
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);
}

function readCache(key: string): OnThisDay | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: OnThisDay };
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: OnThisDay): void {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

async function fetchKind(kind: OtdKind, month: number, day: number): Promise<RawItem[]> {
  const url = `${ONTHISDAY_API}/${kind}/${pad(month)}/${pad(day)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`onthisday ${kind} ${res.status}`);
  const json = (await res.json()) as Record<string, RawItem[]>;
  return json[kind] || [];
}

/**
 * Fetch the On-this-day feed for a month/day. Resolves to empty arrays with
 * `failed: true` on any network/parse error — never throws, never hangs the UI.
 */
export async function fetchOnThisDay(
  month: number,
  day: number,
  limit = 12,
): Promise<OnThisDay> {
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31)) {
    return { events: [], births: [], deaths: [], failed: true };
  }
  const key = `${CACHE_PREFIX}${pad(month)}_${pad(day)}`;
  const cached = readCache(key);
  if (cached) return cached;

  try {
    const [events, births, deaths] = await Promise.all([
      fetchKind('events', month, day),
      fetchKind('births', month, day),
      fetchKind('deaths', month, day),
    ]);
    const data: OnThisDay = {
      events: clean(events, limit),
      births: clean(births, limit),
      deaths: clean(deaths, limit),
      failed: false,
    };
    // Only cache a genuinely populated response.
    if (data.events.length || data.births.length || data.deaths.length) {
      writeCache(key, data);
    }
    return data;
  } catch {
    return { events: [], births: [], deaths: [], failed: true };
  }
}
