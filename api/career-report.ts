// Career analysis report endpoint (Part I.12). Deterministic — reuses the validated
// chart + Yoga + D-Fix3 timing engines. No LLM, so every fact/date is exact.
import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { chartBasisFromResult } from '../src/lib/vedic/chartBasis.js';
import { birthRangeError, resolveRequestBirthTz } from './_birthParams.js';
import { buildCareerReport } from '../src/lib/vedic/careerReport.js';
import { rankCareerFields } from '../src/lib/vedic/careerFields.js';

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
  const rangeErr = birthRangeError({ m, d, h, min, lat, lon, tz: tzLegacy }); // Part T: clean 400, not 500
  if (rangeErr) return json({ error: rangeErr }, 400);
  // fix-timezone-accuracy: offset from the birthplace + date via the shared resolver.
  const btz = resolveRequestBirthTz(k => searchParams.get(k), { y, m, d, h, min, lat, lon });
  if ('error' in btz) return json({ error: btz.error }, 400);
  const tz = btz.tz;
  try {
    const now = new Date();
    const chart = await calculateBirthChart({ year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon, timezoneOffset: tz }, { includeShadbala: true, refDate: now });
    return json({ report: buildCareerReport(chart, now), fields: rankCareerFields(chart), birthTimezone: btz.birthTimezone, basis: chartBasisFromResult(chart, btz.birthTimezone), _cache: 'miss' });
  } catch (e) {
    return json({ error: 'career-report-failed', detail: String(e?.message || e) }, 500);
  }
}
export const GET = handler;
