// City-geocode proxy (P5-1 — robust city lookup).
//
// Purpose: cut direct browser → OpenStreetMap Nominatim traffic. The browser
// resolves the bundled dataset first (offline, instant); only genuine long-tail
// queries reach here. This endpoint:
//   1. re-checks the SAME bundled dataset server-side (so a bundled city never
//      hits Nominatim even if the client calls through);
//   2. otherwise queries Nominatim ONCE, from a single well-identified origin
//      with the User-Agent its usage policy requires;
//   3. returns an edge-cacheable response (Cache-Control) so repeat lookups of
//      the same city are served from the Cloudflare edge, not from Nominatim.
//
// Best-effort and non-throwing: any failure returns an empty result set so the
// city field degrades gracefully. OpenStreetMap attribution is surfaced to the
// user wherever a result from this path is shown (see src/services/geocoding.ts
// OSM_ATTRIBUTION and the city-field notices).

import { CITY_DATASET, lookupCity, prefixCities } from '../src/data/cityDataset.js';

interface Row {
  name: string; state?: string; country: string;
  lat: number; lon: number; timezone: string; utcOffset: number;
  source: 'bundled' | 'osm';
}

function json(body: unknown, status = 200, cacheSeconds = 0) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  headers['Cache-Control'] = status === 200 && cacheSeconds > 0
    ? `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`
    : 'no-store';
  return new Response(JSON.stringify(body), { status, headers });
}

const bundledRow = (c: typeof CITY_DATASET[number]): Row => ({
  name: c.name, state: c.state, country: c.country,
  lat: c.lat, lon: c.lon, timezone: c.timezone, utcOffset: c.utcOffset, source: 'bundled',
});

async function nominatim(query: string): Promise<Row[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BornClock/1.0 (+https://bornclock.com; birth-chart city lookup)' },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    return rows.map(r => {
      const country = r.address?.country || (r.display_name || '').split(',').pop()?.trim() || 'Unknown';
      // We don't run a tz database in the worker, so default to IST (unchanged
      // from the prior behaviour). The bundled dataset already carries exact
      // offsets for every major world city, so this fallback is almost always
      // an Indian long-tail town where IST is correct.
      return {
        name: (r.display_name || query).split(',')[0].trim(),
        state: r.address?.state,
        country,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        timezone: 'Asia/Kolkata',
        utcOffset: 5.5,
        source: 'osm' as const,
      };
    }).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lon));
  } catch {
    return [];
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const q = (searchParams.get('q') || '').trim();
  if (!q) return json({ results: [], attribution: null });

  // 1. Bundled dataset (exact/alias, then prefix) — no network, cache a long time.
  const exact = lookupCity(q);
  if (exact) return json({ results: [bundledRow(exact)], attribution: null }, 200, 86400);
  const prefix = prefixCities(q, 5);
  if (prefix.length) return json({ results: prefix.map(bundledRow), attribution: null }, 200, 86400);

  // 2. Nominatim fallback — cache 24h at the edge so repeats don't re-hit OSM.
  const results = await nominatim(q);
  return json({
    results,
    attribution: results.length ? { text: '© OpenStreetMap contributors', href: 'https://www.openstreetmap.org/copyright' } : null,
  }, 200, 86400);
}

export const GET = handler;
