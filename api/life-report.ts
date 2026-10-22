// Life-areas report endpoint (Growth P2, GP2-LIFE-SECTIONS). Deterministic:
// wealth, education, foreign travel/settlement and health&wellbeing graded from
// the real chart (house lords' Shadbala + benefic/malefic occupants). No LLM.
import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { chartBasisFromResult } from '../src/lib/vedic/chartBasis.js';
import { birthRangeError, resolveRequestBirthTz } from './_birthParams.js';
import { buildLifeAreas } from '../src/lib/vedic/lifeAreas.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k, def?) => { const v = searchParams.get(k); return v === null || v === '' ? def : Number(v); };
  const y = n('y'), m = n('m'), d = n('d');
  if (![y, m, d].every(Number.isFinite)) return json({ error: 'Missing y/m/d' }, 400);
  const h = n('h', 12), min = n('min', 0), lat = n('lat', 28.6139), lon = n('lon', 77.209), tzLegacy = n('tz', 5.5);
  const rangeErr = birthRangeError({ m, d, h, min, lat, lon, tz: tzLegacy });
  if (rangeErr) return json({ error: rangeErr }, 400);
  // fix-timezone-accuracy: offset from the birthplace + date via the shared resolver.
  const btz = resolveRequestBirthTz(k => searchParams.get(k), { y, m, d, h, min, lat, lon });
  if ('error' in btz) return json({ error: btz.error }, 400);
  const tz = btz.tz;
  try {
    const now = new Date();
    const chart = await calculateBirthChart({ year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon, timezoneOffset: tz }, { includeShadbala: true, refDate: now });
    return json({ areas: buildLifeAreas(chart), birthTimezone: btz.birthTimezone, basis: chartBasisFromResult(chart, btz.birthTimezone), _cache: 'miss' });
  } catch (e) {
    return json({ error: 'life-report-failed', detail: String(e?.message || e) }, 500);
  }
}
export const GET = handler;
