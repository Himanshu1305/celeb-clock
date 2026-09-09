import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { toVedicProfileLegacy } from '../src/lib/vedic/legacyAdapters.js';

async function getProKeralaToken(env) {
  const id = (env && env.VITE_PROKERALA_CLIENT_ID) || process.env.VITE_PROKERALA_CLIENT_ID;
  const secret = (env && env.VITE_PROKERALA_CLIENT_SECRET) || process.env.VITE_PROKERALA_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  const data = await res.json();
  return data.access_token || null;
}
function prokeralaDatetime(y, m, d, h, min, tz) {
  const sign = tz >= 0 ? '+' : '-';
  const abstz = Math.abs(tz);
  const tzH = String(Math.floor(abstz)).padStart(2, '0');
  const tzM = tz % 1 === 0.5 ? '30' : '00';
  return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')+'T'+String(h).padStart(2,'0')+':'+String(min).padStart(2,'0')+':00'+sign+tzH+':'+tzM;
}
const NK_DEV = {'Ashwini':'अश्विनी','Bharani':'भरणी','Krittika':'कृत्तिका','Rohini':'रोहिणी','Mrigashira':'मृगशिरा','Ardra':'आर्द्रा','Punarvasu':'पुनर्वसु','Pushya':'पुष्य','Ashlesha':'आश्लेषा','Magha':'मघा','Purva Phalguni':'पूर्वाफाल्गुनी','Uttara Phalguni':'उत्तराफाल्गुनी','Hasta':'हस्त','Chitra':'चित्रा','Swati':'स्वाती','Vishakha':'विशाखा','Anuradha':'अनुराधा','Jyeshtha':'ज्येष्ठा','Mula':'मूल','Purva Ashadha':'पूर्वाषाढ़ा','Uttara Ashadha':'उत्तराषाढ़ा','Shravana':'श्रवण','Dhanishtha':'धनिष्ठा','Shatabhisha':'शतभिषा','Purva Bhadrapada':'पूर्वाभाद्रपदा','Uttara Bhadrapada':'उत्तराभाद्रपदा','Revati':'रेवती'};
const RASHI_DEV = {'Mesha':'मेष','Vrisha':'वृष','Mithuna':'मिथुन','Karka':'कर्क','Simha':'सिंह','Kanya':'कन्या','Tula':'तुला','Vrischika':'वृश्चिक','Dhanu':'धनु','Makara':'मकर','Kumbha':'कुम्भ','Meena':'मीन'};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
  });
}

function findCurrentDasha(dashaPeriods, refDate) {
  if (!Array.isArray(dashaPeriods)) return null;
  const ref = refDate.getTime();
  const inRange = (p) => {
    const s = new Date(p.start).getTime();
    const e = new Date(p.end).getTime();
    return ref >= s && ref <= e;
  };
  const maha = dashaPeriods.find(inRange);
  if (!maha) return null;
  const antar = Array.isArray(maha.antardasha) ? maha.antardasha.find(inRange) : null;
  return {
    mahadasha: maha.name,
    mahadasha_start: maha.start,
    mahadasha_end: maha.end,
    antardasha: antar ? antar.name : '',
    antardasha_start: antar ? antar.start : null,
    antardasha_end: antar ? antar.end : null,
  };
}

function buildCacheKey(y, m, d, h, min, lat, lon, tz, hasBirthTime) {
  const rlat = Number(lat).toFixed(4);
  const rlon = Number(lon).toFixed(4);
  return ['vp', y, m, d, hasBirthTime ? h : 'x', hasBirthTime ? min : 'x', rlat, rlon, tz].join('-');
}

async function getSupabase(env) {
  const url = (env && env.SUPABASE_URL) || process.env.SUPABASE_URL;
  const key = (env && env.SUPABASE_SERVICE_ROLE_KEY) || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

async function getCachedChart(sb, cacheKey) {
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('vedic_chart_cache')
      .select('chart_data')
      .eq('cache_key', cacheKey)
      .maybeSingle();
    if (error || !data) return null;
    sb.from('vedic_chart_cache')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('cache_key', cacheKey)
      .then(() => {}, () => {});
    return data.chart_data;
  } catch (e) {
    return null;
  }
}

async function setCachedChart(sb, cacheKey, chartData, source = 'prokerala') {
  if (!sb) return;
  try {
    await sb.from('vedic_chart_cache').upsert({
      cache_key: cacheKey,
      chart_data: chartData,
      source,
      last_accessed_at: new Date().toISOString(),
    });
  } catch (e) {
    // cache write failure should never break the response
  }
}

// Validates that a ProKerala JSON response is a genuine success, not an error
// payload or a rate-limit response disguised as a 200. Mirrors the guard in
// api/kundali.ts — this endpoint previously lacked it, so rate-limit/error
// responses could be cached with null nakshatra/rashi forever.
function checkProKeralaStatus(data, label) {
  if (!data || data.status === 'error') {
    const detail = data?.errors?.[0]?.detail || 'unknown error';
    return `ProKerala ${label} failed: ${detail}`;
  }
  return null;
}

async function fetchFromProKerala(env, y, m, d, h, min, lat, lon, tz, hasBirthTime) {
  const token = await getProKeralaToken(env);
  if (!token) return { error: 'Vedic service not configured', status: 503 };
  const datetime = prokeralaDatetime(y, m, d, h, min, tz);
  const coords = lat+','+lon;
  const hdrs = { Authorization:'Bearer '+token };
  const [bdRes, advRes] = await Promise.all([
    fetch('https://api.prokerala.com/v2/astrology/birth-details?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }),
    hasBirthTime ? fetch('https://api.prokerala.com/v2/astrology/kundli/advanced?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }) : Promise.resolve(null),
  ]);
  const bd = await bdRes.json();
  const adv = advRes ? await advRes.json() : null;

  // Fail loudly on an error/rate-limit payload rather than caching a chart with
  // null fields (the silent-failure bug this guard closes).
  const bdErr = checkProKeralaStatus(bd, 'birth-details');
  if (bdErr) return { error: bdErr, status: 502 };
  if (hasBirthTime) {
    const advErr = checkProKeralaStatus(adv, 'kundli/advanced');
    if (advErr) return { error: advErr, status: 502 };
  }
  if (!bd?.data?.nakshatra?.name) {
    return { error: 'ProKerala returned incomplete data (missing nakshatra)', status: 502 };
  }

  const nk = bd?.data?.nakshatra;
  const rashi = bd?.data?.chandra_rasi;
  const dashaPeriods = adv?.data?.dasha_periods;
  const currentDasha = hasBirthTime ? findCurrentDasha(dashaPeriods, new Date()) : null;
  const nkName = nk?.name || 'Unknown';
  const rashiName = rashi?.name || null;

  return {
    chart: {
      nakshatra: { nakshatra:nkName, nakshatra_devanagari:NK_DEV[nkName]||nkName, pada:nk?.pada||1, lord:nk?.lord?.name||'', confidence:hasBirthTime?'high':'low', is_boundary:false, calculation_method:'prokerala' },
      rashi: rashiName,
      rashi_devanagari: rashiName ? (RASHI_DEV[rashiName]||rashiName) : null,
      lagna: null,
      dasha: currentDasha,
      requires_birth_time: !hasBirthTime,
      input_summary: hasBirthTime ? 'Calculated with birth time via ProKerala' : 'Date-only approximation',
    },
  };
}

// Local engine first; ProKerala only on local-engine error. Returns
// { chart, source } or { error, status }.
async function computeProfile(env, y, m, d, h, min, lat, lon, tz, hasBirthTime) {
  try {
    const result = await calculateBirthChart(
      { year: y, month: m, day: d, hour: hasBirthTime ? h : 12, minute: hasBirthTime ? min : 0, latitude: lat, longitude: lon, timezoneOffset: tz },
    );
    return { chart: toVedicProfileLegacy(result, hasBirthTime), source: 'local' };
  } catch (localErr) {
    const pk = await fetchFromProKerala(env, y, m, d, h, min, lat, lon, tz, hasBirthTime);
    if (pk.error) return { error: pk.error, status: pk.status, localError: String(localErr?.message || localErr) };
    return { chart: pk.chart, source: 'prokerala' };
  }
}

async function handler(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k, def) => { const v = searchParams.get(k); return (v===null||v==='') ? def : Number(v); };
  const y=n('y'), m=n('m'), d=n('d');
  if (![y,m,d].every(v=>Number.isFinite(v))) return json({ error:'Missing y/m/d' }, 400);
  const hasBirthTime = searchParams.has('h') && searchParams.get('h') !== '';
  const h=n('h',12), min=n('min',0), lat=n('lat',28.6139), lon=n('lon',77.2090), tz=n('tz',5.5);

  try {
    const sb = await getSupabase(env);
    const cacheKey = buildCacheKey(y, m, d, h, min, lat, lon, tz, hasBirthTime);

    const cached = await getCachedChart(sb, cacheKey);
    if (cached) {
      return json({ ...cached, _cache: 'hit' });
    }

    const result = await computeProfile(env, y, m, d, h, min, lat, lon, tz, hasBirthTime);
    if (result.error) return json({ error: result.error }, result.status);

    await setCachedChart(sb, cacheKey, result.chart, result.source);

    return json({ ...result.chart, _cache: 'miss' });
  } catch(e) { return json({ error:'calc-failed', detail:String(e.message||e) }, 500); }
}
export const GET = handler;
