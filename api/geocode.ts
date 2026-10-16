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
import { timezoneForCoordinates, offsetSecondsAt } from '../src/lib/timezone/birthTimezone.js';

/** fix-timezone-accuracy: zone from the coordinates (never IST by default) + today's offset. */
function zoneFields(lat: number, lon: number) {
  const timezone = timezoneForCoordinates(lat, lon);
  return { timezone, utcOffset: offsetSecondsAt(timezone, Date.now()) / 3600 };
}

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
  lat: c.lat, lon: c.lon, ...zoneFields(c.lat, c.lon), source: 'bundled',
});

async function nominatim(query: string): Promise<Row[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&accept-language=en&featureType=settlement&q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BornClock/1.0 (+https://bornclock.com; birth-chart city lookup)' },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    const out: Row[] = [];
    for (const r of rows) {
      const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const country = r.address?.country || (r.display_name || '').split(',').pop()?.trim() || '';
      // fix-timezone-accuracy: this used to default EVERY Nominatim result to
      // Asia/Kolkata (+5:30) — the root cause of US/UK/AU births computed in IST.
      // The zone is now looked up from the coordinates.
      out.push({
        name: r.name || (r.display_name || query).split(',')[0].trim(),
        state: r.address?.state || r.address?.region || r.address?.county,
        country, lat, lon, ...zoneFields(lat, lon), source: 'osm',
      });
    }
    return out;
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
