/**
 * Vedic profile via ProKerala birth-details API — no WASM, safe for Cloudflare Workers.
 * GET /api/vedic-profile?y=&m=&d=&h=&min=&lat=&lon=&tz=
 */
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
async function handler(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k, def) => { const v = searchParams.get(k); return (v===null||v==='') ? def : Number(v); };
  const y=n('y'), m=n('m'), d=n('d');
  if (![y,m,d].every(v=>Number.isFinite(v))) return json({ error:'Missing y/m/d' }, 400);
  const hasBirthTime = searchParams.has('h') && searchParams.get('h') !== '';
  const h=n('h',12), min=n('min',0), lat=n('lat',28.6139), lon=n('lon',77.2090), tz=n('tz',5.5);
  try {
    const token = await getProKeralaToken(env);
    if (!token) return json({ error:'Vedic service not configured' }, 503);
    const datetime = prokeralaDatetime(y, m, d, h, min, tz);
    const coords = lat+','+lon;
    const hdrs = { Authorization:'Bearer '+token };
    const [bdRes, dashaRes] = await Promise.all([
      fetch('https://api.prokerala.com/v2/astrology/birth-details?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }),
      hasBirthTime ? fetch('https://api.prokerala.com/v2/astrology/vimshottari-dasha?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }) : Promise.resolve(null),
    ]);
    const bd = await bdRes.json();
    const dd = dashaRes ? await dashaRes.json() : null;
    const nk = bd?.data?.nakshatra;
    const rashi = bd?.data?.chandra_rasi;
    const currentDasha = dd?.data?.dasha_periods?.[0] || dd?.data?.mahadasha?.[0];
    const nkName = nk?.name || 'Unknown';
    const rashiName = rashi?.name || null;
    return json({
      nakshatra: { nakshatra:nkName, nakshatra_devanagari:NK_DEV[nkName]||nkName, pada:nk?.pada||1, lord:nk?.lord?.name||'', confidence:hasBirthTime?'high':'low', is_boundary:false, calculation_method:'prokerala' },
      rashi: rashiName,
      rashi_devanagari: rashiName ? (RASHI_DEV[rashiName]||rashiName) : null,
      lagna: null,
      dasha: currentDasha ? { mahadasha:currentDasha.planet||currentDasha.name, antardasha:currentDasha.sub_periods?.[0]?.planet||'' } : null,
      requires_birth_time: !hasBirthTime,
      input_summary: hasBirthTime ? 'Calculated with birth time via ProKerala' : 'Date-only approximation',
    });
  } catch(e) { return json({ error:'calc-failed', detail:String(e.message||e) }, 500); }
}
export const GET = handler;
