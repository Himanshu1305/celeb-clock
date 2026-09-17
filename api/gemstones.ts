// Gemstone suggestions endpoint (Part I.11). Deterministic — reuses the validated
// chart + Shadbala strength. Informational only; no sales flow.
import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { birthRangeError } from './_birthParams.js';
import { buildGemstoneReport } from '../src/lib/vedic/gemstones.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k, def?) => { const v = searchParams.get(k); return v === null || v === '' ? def : Number(v); };
  const y = n('y'), m = n('m'), d = n('d');
  if (![y, m, d].every(Number.isFinite)) return json({ error: 'Missing y/m/d' }, 400);
  const h = n('h', 12), min = n('min', 0), lat = n('lat', 28.6139), lon = n('lon', 77.209), tz = n('tz', 5.5);
  const rangeErr = birthRangeError({ m, d, h, min, lat, lon, tz }); // Part T: clean 400, not 500
  if (rangeErr) return json({ error: rangeErr }, 400);
  try {
    const chart = await calculateBirthChart({ year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon, timezoneOffset: tz }, { includeShadbala: true });
    return json({ report: buildGemstoneReport(chart), lagna: chart.lagna.sign, _cache: 'miss' });
  } catch (e) {
    return json({ error: 'gemstones-failed', detail: String(e?.message || e) }, 500);
  }
}
export const GET = handler;
