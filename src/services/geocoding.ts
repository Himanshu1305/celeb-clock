/**
 * Geocoding for birth-city input (P5-1 — robust city lookup).
 *
 * Resolution order, cheapest → most dependent on an external service:
 *   1. Bundled city dataset (src/data/cityDataset.ts) — ~190 Indian + ~100 world
 *      cities, resolved instantly and offline, NEVER touching the network.
 *   2. localStorage result cache — a previously-looked-up city is reused for 30
 *      days, so the same query never re-hits OpenStreetMap.
 *   3. Server-side proxy /api/geocode — one well-identified origin, edge-cached,
 *      which calls OpenStreetMap Nominatim with the required User-Agent. This is
 *      what reduces direct browser → Nominatim traffic.
 *   4. Direct Nominatim — final fallback for local dev where the worker route
 *      isn't present. Best-effort; never throws (returns [] on failure).
 *
 * OpenStreetMap attribution is shown wherever a result may come from Nominatim
 * (see OSM_ATTRIBUTION below and the city-field notices in the forms).
 */
import { CITY_DATASET, lookupCity, prefixCities, type CityDef } from '@/data/cityDataset';

export interface GeoResult {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffset: number;
  /** 'bundled' = from our offline dataset; 'osm' = from OpenStreetMap Nominatim. */
  source?: 'bundled' | 'osm';
}

/** OpenStreetMap credit required by the ODbL when Nominatim results are shown. */
export const OSM_ATTRIBUTION = {
  text: '© OpenStreetMap contributors',
  href: 'https://www.openstreetmap.org/copyright',
};

const toResult = (c: CityDef): GeoResult => ({
  name: c.name, state: c.state, country: c.country,
  lat: c.lat, lon: c.lon, timezone: c.timezone, utcOffset: c.utcOffset,
  source: 'bundled',
});

// ── localStorage result cache (30-day TTL) ───────────────────────────────────
const CACHE_KEY = 'bornclock-geocode-cache';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

interface CacheEntry { at: number; results: GeoResult[]; }
type CacheShape = Record<string, CacheEntry>;

function readCache(): CacheShape {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : {};
  } catch { return {}; }
}

function cacheGet(q: string): GeoResult[] | null {
  const entry = readCache()[q];
  if (entry && Date.now() - entry.at < CACHE_TTL && Array.isArray(entry.results)) return entry.results;
  return null;
}

function cachePut(q: string, results: GeoResult[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const cache = readCache();
    cache[q] = { at: Date.now(), results };
    // Keep the cache bounded (most-recent ~200 queries).
    const keys = Object.keys(cache);
    if (keys.length > 200) {
      keys.sort((a, b) => cache[a].at - cache[b].at).slice(0, keys.length - 200).forEach(k => delete cache[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* noop */ }
}

function mapRows(rows: any[], query: string): GeoResult[] {
  return rows.map(r => ({
    name: (r.name || r.display_name || query).split(',')[0].trim(),
    state: r.state,
    country: r.country || (r.display_name || '').split(',').pop()?.trim() || 'Unknown',
    lat: typeof r.lat === 'number' ? r.lat : parseFloat(r.lat),
    lon: typeof r.lon === 'number' ? r.lon : parseFloat(r.lon),
    timezone: r.timezone || 'Asia/Kolkata',
    utcOffset: typeof r.utcOffset === 'number' ? r.utcOffset : 5.5,
    source: 'osm' as const,
  })).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lon));
}

/** Preferred network path: the edge proxy (edge-cached, single User-Agent). */
async function viaProxy(query: string): Promise<GeoResult[] | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data?.results)) return null;
    return mapRows(data.results, query);
  } catch { return null; }
}

/** Last-resort direct Nominatim (local dev without the worker route). */
async function viaNominatim(query: string): Promise<GeoResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { headers: { 'User-Agent': 'BornClock/1.0 (+https://bornclock.com)' }, signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    return mapRows(rows.map(r => ({
      name: (r.display_name || query).split(',')[0].trim(),
      country: (r.display_name || '').split(',').pop()?.trim() || 'Unknown',
      lat: parseFloat(r.lat), lon: parseFloat(r.lon),
      timezone: 'Asia/Kolkata', utcOffset: 5.5,
    })), query);
  } catch { return []; }
}

export async function geocodeCity(query: string): Promise<GeoResult[]> {
  const raw = (query || '').trim();
  const q = raw.toLowerCase();
  if (!q) return [];

  // 1. Exact / alias match in the bundled dataset.
  const exact = lookupCity(q);
  if (exact) return [toResult(exact)];

  // 2. Prefix match against the bundled dataset (offline, instant).
  const prefix = prefixCities(q, 5);
  if (prefix.length) return prefix.map(toResult);

  // 3. Cached network result.
  const cached = cacheGet(q);
  if (cached) return cached;

  // 4. Edge proxy, then 5. direct Nominatim.
  const proxied = await viaProxy(raw);
  const results = proxied && proxied.length ? proxied : await viaNominatim(raw);
  if (results.length) cachePut(q, results);
  return results;
}

/** Whether a set of results includes anything sourced from OpenStreetMap (→ show attribution). */
export function resultsNeedOsmAttribution(results: GeoResult[]): boolean {
  return results.some(r => r.source === 'osm');
}

export { CITY_DATASET };
