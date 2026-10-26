// Sade Sati / Dhaiya endpoint (Part I.10). Reuses the validated engine: the natal
// Moon sign from calculateBirthChart, and getSaturnSignIndex (same position+ayanamsa
// path the chart uses) to turn the already-validated "current status" into real
// cycle START/END dates. Deterministic — no LLM.

import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { chartBasisFromResult } from '../src/lib/vedic/chartBasis.js';
import { birthRangeError, resolveRequestBirthTz } from './_birthParams.js';
import { getSaturnSignIndex, RASHI_NAMES } from '../src/lib/vedic/engine/vedicEngine.js';
import { computeSadeSati } from '../src/lib/vedic/sadeSati.js';
import { buildGemstoneReport, blueSapphireAllowed } from '../src/lib/vedic/gemstones.js';
import { completedYearsAtOffset } from '../src/lib/ageBreakdown.js';

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
    const chart = await calculateBirthChart({ year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon, timezoneOffset: tz }, { refDate: now });
    const moonSign = Math.max(0, RASHI_NAMES.indexOf(chart.rashi));
    // Birth instant (UTC) so the "last Sade Sati" never predates birth and child wording can be used (audit D10).
    const birth = new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600_000);
    const report = computeSadeSati(moonSign, now, getSaturnSignIndex, birth);
    const ageYears = Math.max(0, completedYearsAtOffset(birth, now, tz)); // batch 8: birthday-aware
    // D8: only mention Blue Sapphire when the full-chart gemstone logic recommends Saturn (adults only).
    const blueSapphireOk = blueSapphireAllowed(buildGemstoneReport(chart), ageYears);
    return json({ ...report, ageYears, blueSapphireOk, moonSignName: chart.rashi, birthTimezone: btz.birthTimezone, basis: chartBasisFromResult(chart, btz.birthTimezone), _cache: 'miss' });
  } catch (e) {
    return json({ error: 'sade-sati-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
