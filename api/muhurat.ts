// Muhurat finder endpoint (Part I.9). Reuses the engine's validated sidereal Sun/Moon
// longitudes to derive the Panchang and score auspicious days for a purpose.
// Deterministic — no LLM.

import { getSiderealLongitude } from '../src/lib/vedic/engine/vedicEngine.js';
import { findMuhurats, muhuratMethodology, type MuhuratPurpose } from '../src/lib/vedic/panchang.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
const sunMoon = (d: Date) => ({ sun: getSiderealLongitude('Sun', d), moon: getSiderealLongitude('Moon', d) });

async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const purpose = (['business', 'travel', 'general'].includes(searchParams.get('purpose') || '') ? searchParams.get('purpose') : 'general') as MuhuratPurpose;
  const days = Math.min(90, Math.max(7, Number(searchParams.get('days')) || 30));
  const tz = Number(searchParams.get('tz')) || 5.5;
  const fromStr = searchParams.get('from');
  try {
    const from = fromStr && /^\d{4}-\d{2}-\d{2}$/.test(fromStr) ? new Date(fromStr + 'T00:00:00Z') : new Date();
    const all = findMuhurats(purpose, from, days, sunMoon, tz);
    const auspicious = all.filter(d => d.auspicious);
    return json({ purpose, days, tz, count: auspicious.length, methodology: muhuratMethodology(purpose), auspicious, all, _cache: 'miss' });
  } catch (e) {
    return json({ error: 'muhurat-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
