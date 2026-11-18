// Muhurat finder endpoint (Part I.9). Reuses the engine's validated sidereal Sun/Moon
// longitudes to derive the Panchang and score auspicious days for a purpose.
// Deterministic — no LLM.

import { getSiderealLongitude } from '../src/lib/vedic/engine/vedicEngine.js';
import { findMuhurats, muhuratMethodology, MUHURAT_PURPOSE_IDS, type MuhuratPurpose, type MuhuratDayFn } from '../src/lib/vedic/panchang.js';
import { muhuratDayAtSunrise } from '../src/lib/vedic/panchangDay.js';
import { resolveRequestBirthTz } from './_birthParams.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
const sunMoon = (d: Date) => ({ sun: getSiderealLongitude('Sun', d, 'drik'), moon: getSiderealLongitude('Moon', d, 'drik') });

async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const purpose = ((MUHURAT_PURPOSE_IDS as string[]).includes(searchParams.get('purpose') || '') ? searchParams.get('purpose') : 'general') as MuhuratPurpose;
  // Part AI — custom range capped at 180 days (was 90).
  const days = Math.min(180, Math.max(7, Number(searchParams.get('days')) || 30));
  // tz drives the Panchang day boundary / sunrise approximation for the chosen location.
  let tz = Number.isFinite(Number(searchParams.get('tz'))) && searchParams.get('tz') !== null ? Number(searchParams.get('tz')) : 5.5;
  const fromStr = searchParams.get('from');
  try {
    const from = fromStr && /^\d{4}-\d{2}-\d{2}$/.test(fromStr) ? new Date(fromStr + 'T00:00:00Z') : new Date();
    // fix-timezone-accuracy: when the client sends the place's coordinates, the offset is
    // the one in force there on the start date (DST-aware) from the shared resolver.
    // B14 F2: with no place given, an IST request defaults to New Delhi (the site's default
    // Panchang city) so every day is still read at a REAL sunrise with real Rahu Kalam.
    const hasPlace = searchParams.get('lat') !== null && searchParams.get('lon') !== null;
    const lat = hasPlace ? Number(searchParams.get('lat')) : 28.6139;
    const lon = hasPlace ? Number(searchParams.get('lon')) : 77.209;
    let dayAt: MuhuratDayFn | undefined;
    if (hasPlace) {
      const btz = resolveRequestBirthTz(k => searchParams.get(k), {
        y: from.getUTCFullYear(), m: from.getUTCMonth() + 1, d: from.getUTCDate(), h: 12, min: 0, lat, lon,
      });
      if ('error' in btz) return json({ error: btz.error }, 400);
      tz = btz.tz;
      // Offset resolved PER DAY (local noon, as the Panchang page does) so a DST change
      // inside the range moves sunrise and Rahu Kalam with it.
      dayAt = muhuratDayAtSunrise(lat, lon, (y, m, d) => {
        const r = resolveRequestBirthTz(k => searchParams.get(k), { y, m, d, h: 12, min: 0, lat, lon });
        return 'error' in r ? tz : r.tz;
      });
    } else {
      // Legacy link with no place: India (IST) → New Delhi's real sunrise; any other bare
      // offset keeps the old fixed 06:00 approximation (no coordinates to compute a sunrise).
      dayAt = tz === 5.5 ? muhuratDayAtSunrise(lat, lon, () => 5.5) : undefined;
    }
    const all = findMuhurats(purpose, from, days, sunMoon, tz, dayAt);
    const auspicious = all.filter(d => d.auspicious);
    const polar = all.some(d => d.polar);
    return json({ purpose, days, tz, count: auspicious.length, methodology: muhuratMethodology(purpose), auspicious, all, ...(polar ? { polar: true } : {}), _cache: 'miss' });
  } catch (e) {
    return json({ error: 'muhurat-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
