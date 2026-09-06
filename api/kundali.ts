/**
 * Full Kundali (birth chart) data — computed SERVER-SIDE via the Swiss Ephemeris
 * WASM (Node only). Returns Lagna, 9 planet positions (sign + house), Moon
 * Nakshatra/Rashi and current Dasha. ProKerala is not required; a key only
 * refines rare Nakshatra-boundary cases.
 * GET /api/kundali?y=&m=&d=&h=&min=&lat=&lon=&tz=
 */
import * as panchangam from '@fusionstrings/panchangam';
import { calculateVedicProfile, RASHI_NAMES } from '../src/utils/vedicCalculations';

const { p_julday, calculate_planets, calculate_houses, AyanamshaMode } = panchangam as any;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k: string, d?: number) => { const v = searchParams.get(k); return v === null || v === '' ? d : Number(v); };
  const y = n('y'), m = n('m'), d = n('d');
  if (![y, m, d].every(v => Number.isFinite(v))) return json({ error: 'Missing y/m/d' }, 400);
  const h = n('h', 12)!, min = n('min', 0)!;
  const lat = n('lat', 28.6139)!, lon = n('lon', 77.2090)!, tz = n('tz', 5.5)!;

  try {
    const profile = await calculateVedicProfile(d!, m!, y!, h, min, { city: '', lat, lon, timezone: tz });
    const jd = p_julday(y!, m!, d!, h + min / 60 - tz, 1);
    const rawPlanets: any[] = calculate_planets(jd, 1) || [];

    let lagnaSignIdx = 0;
    let lagnaDeg = 0;
    try {
      const houses: any = calculate_houses(jd, lat, lon, 'W', 1);
      lagnaDeg = ((houses.ascendant % 360) + 360) % 360;
      lagnaSignIdx = Math.floor(lagnaDeg / 30);
    } catch { /* invalid coords — default lagna */ }

    const planets = rawPlanets.map(p => {
      const lon360 = ((p.longitude % 360) + 360) % 360;
      const signIdx = Math.floor(lon360 / 30);
      const house = ((signIdx - lagnaSignIdx + 12) % 12) + 1; // whole-sign houses
      return {
        name: p.name,
        sign: RASHI_NAMES[signIdx],
        signIndex: signIdx + 1,
        house,
        longitude: Number(lon360.toFixed(2)),
        retrograde: !!p.is_retrograde,
      };
    });

    return json({
      lagna: { sign: RASHI_NAMES[lagnaSignIdx], signIndex: lagnaSignIdx + 1, degrees: Number(lagnaDeg.toFixed(2)) },
      planets,
      nakshatra: profile.nakshatra,
      rashi: profile.rashi,
      rashi_devanagari: profile.rashi_devanagari,
      dasha: profile.dasha,
      requires_birth_time: profile.requires_birth_time,
    });
  } catch (e) {
    return json({ error: 'calc-failed', detail: String((e as Error).message || e) }, 500);
  }
}

export const GET = handler;
