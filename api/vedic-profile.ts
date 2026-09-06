/**
 * Accurate Vedic profile — computed SERVER-SIDE (Node) so the Swiss Ephemeris
 * WASM (which reads its .wasm via fs) never ships to the browser.
 * GET /api/vedic-profile?y=&m=&d=&h=&min=&lat=&lon=&tz=
 */
import { calculateVedicProfile } from '../src/utils/vedicCalculations';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const num = (k: string) => Number(searchParams.get(k));
  const y = num('y'), m = num('m'), d = num('d');
  if (![y, m, d].every(Number.isFinite)) return json({ error: 'Missing y/m/d' }, 400);
  const hRaw = searchParams.get('h');
  const minRaw = searchParams.get('min');
  const h = hRaw === null || hRaw === '' ? null : Number(hRaw);
  const min = minRaw === null || minRaw === '' ? null : Number(minRaw);
  const lat = Number(searchParams.get('lat') ?? 28.6139);
  const lon = Number(searchParams.get('lon') ?? 77.2090);
  const tz = Number(searchParams.get('tz') ?? 5.5);

  try {
    const profile = await calculateVedicProfile(d, m, y, h, min, { city: '', lat, lon, timezone: tz });
    return json(profile);
  } catch (e) {
    return json({ error: 'calc-failed', detail: String((e as Error).message || e) }, 500);
  }
}

export const GET = handler;
