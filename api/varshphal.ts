// B18 — Varshphal (Tajik annual chart) endpoint. Deterministic, no LLM, free.
// Birth: y, m, d, h, min, lat, lon, tzid (shared resolver, DST-correct). Year: `year`
// (birth year + 1 … + 120). Optional place the year is cast for (current residence):
// rlat, rlon, rtzid — defaults to the birth place. `lang` = en | hi for the outlook text.
import { birthRangeError, resolveRequestBirthTz } from './_birthParams.js';
import { computeVarshphal } from '../src/lib/vedic/varshphal.js';
import { buildOutlook } from '../src/lib/vedic/varshphalOutlook.js';
import { isValidTimezone, timezoneForCoordinates } from '../src/lib/timezone/birthTimezone.js';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}

async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k: string, def?: number) => { const v = searchParams.get(k); return v === null || v === '' ? def : Number(v); };
  const y = n('y'), m = n('m'), d = n('d');
  if (![y, m, d].every(Number.isFinite)) return json({ error: 'Missing y/m/d' }, 400);
  const h = n('h', 12)!, min = n('min', 0)!, lat = n('lat', 28.6139)!, lon = n('lon', 77.209)!;
  const rangeErr = birthRangeError({ y, m: m!, d: d!, h, min, lat, lon, tz: n('tz', 5.5)! });
  if (rangeErr) return json({ error: rangeErr }, 400);
  const btz = resolveRequestBirthTz(k => searchParams.get(k), { y: y!, m: m!, d: d!, h, min, lat, lon });
  if ('error' in btz) return json({ error: btz.error }, 400);
  const year = n('year');
  if (!Number.isInteger(year) || year! < y! + 1 || year! > y! + 120 || year! < 1801 || year! > 2200) {
    return json({ error: 'Choose a year after your birth year (up to 120 years).' }, 400);
  }
  const rlat = n('rlat'), rlon = n('rlon');
  const residence = rlat !== undefined && rlon !== undefined;
  if (residence && (!Number.isFinite(rlat) || !Number.isFinite(rlon) || rlat! < -90 || rlat! > 90 || rlon! < -180 || rlon! > 180)) {
    return json({ error: 'Invalid current-residence location' }, 400);
  }
  const plat = residence ? rlat! : lat, plon = residence ? rlon! : lon;
  const rtzid = searchParams.get('rtzid');
  let zone: string;
  try {
    zone = residence
      ? (rtzid && isValidTimezone(rtzid) ? rtzid : timezoneForCoordinates(plat, plon))
      : btz.birthTimezone.timezone;
  } catch {
    return json({ error: 'Invalid location' }, 400);
  }
  const lang = searchParams.get('lang') === 'hi' ? 'hi' : 'en';
  try {
    const result = computeVarshphal({
      birthUTC: new Date(btz.birthTimezone.utcISO), birthLat: lat, birthLon: lon,
      lat: plat, lon: plon, timezone: zone, year: year!,
    });
    const outlook = buildOutlook(result, lang);
    return json({ result, outlook, birthTimezone: btz.birthTimezone, castFor: residence ? 'residence' : 'birth', lang });
  } catch (e) {
    if (e instanceof RangeError) return json({ error: e.message }, 400);
    return json({ error: 'varshphal-failed', detail: String((e as Error)?.message || e) }, 500);
  }
}

export const GET = handler;
