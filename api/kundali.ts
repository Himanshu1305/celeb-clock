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
const RASHI_NAMES = ['Mesha','Vrisha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const NK_DEV = {'Ashwini':'अश्विनी','Bharani':'भरणी','Krittika':'कृत्तिका','Rohini':'रोहिणी','Mrigashira':'मृगशिरा','Ardra':'आर्द्रा','Punarvasu':'पुनर्वसु','Pushya':'पुष्य','Ashlesha':'आश्लेषा','Magha':'मघा','Purva Phalguni':'पूर्वाफाल्गुनी','Uttara Phalguni':'उत्तराफाल्गुनी','Hasta':'हस्त','Chitra':'चित्रा','Swati':'स्वाती','Vishakha':'विशाखा','Anuradha':'अनुराधा','Jyeshtha':'ज्येष्ठा','Mula':'मूल','Purva Ashadha':'पूर्वाषाढ़ा','Uttara Ashadha':'उत्तराषाढ़ा','Shravana':'श्रवण','Dhanishtha':'धनिष्ठा','Shatabhisha':'शतभिषा','Purva Bhadrapada':'पूर्वाभाद्रपदा','Uttara Bhadrapada':'उत्तराभाद्रपदा','Revati':'रेवती'};

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

async function handler(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const n = (k, def) => { const v = searchParams.get(k); return (v===null||v==='') ? def : Number(v); };
  const y=n('y'), m=n('m'), d=n('d');
  if (![y,m,d].every(v=>Number.isFinite(v))) return json({ error:'Missing y/m/d' }, 400);
  const h=n('h',12), min=n('min',0), lat=n('lat',28.6139), lon=n('lon',77.2090), tz=n('tz',5.5);
  try {
    const token = await getProKeralaToken(env);
    if (!token) return json({ error:'Kundali service not configured' }, 503);
    const datetime = prokeralaDatetime(y, m, d, h, min, tz);
    const coords = lat+','+lon;
    const hdrs = { Authorization:'Bearer '+token };
    const [planetRes, bdRes, advRes] = await Promise.all([
      fetch('https://api.prokerala.com/v2/astrology/planet-position?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }),
      fetch('https://api.prokerala.com/v2/astrology/birth-details?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }),
      fetch('https://api.prokerala.com/v2/astrology/kundli/advanced?datetime='+encodeURIComponent(datetime)+'&coordinates='+coords+'&ayanamsa=1', { headers: hdrs }),
    ]);
    const [pd, bd, adv] = await Promise.all([planetRes.json(), bdRes.json(), advRes.json()]);

    const rawPlanets = pd?.data?.planet_position || [];
    const nk = bd?.data?.nakshatra;
    const rashi = bd?.data?.chandra_rasi;
    const asc = pd?.data?.ascendant;

    const dashaPeriods = adv?.data?.dasha_periods;
    const currentDasha = findCurrentDasha(dashaPeriods, new Date());

    const ascLon = asc?.longitude ?? rawPlanets.find(p => p.name === 'Ascendant')?.longitude ?? 0;
    const lagnaIdx = Math.floor(((ascLon % 360) + 360) % 360 / 30);
    const planets = rawPlanets.filter(p => p.name !== 'Ascendant').map(p => {
      const sIdx = Math.floor(((p.longitude % 360) + 360) % 360 / 30);
      return { name:p.name, sign:RASHI_NAMES[sIdx]||'Unknown', signIndex:sIdx+1, house:((sIdx-lagnaIdx+12)%12)+1, longitude:Number((p.longitude||0).toFixed(2)), retrograde:!!p.is_retrograde };
    });
    const nkName = nk?.name || 'Unknown';
    const rashiName = rashi?.name || null;

    return json({
      lagna: { sign:RASHI_NAMES[lagnaIdx]||'Unknown', signIndex:lagnaIdx+1, degrees:Number((ascLon||0).toFixed(2)) },
      planets,
      nakshatra: { nakshatra:nkName, nakshatra_devanagari:NK_DEV[nkName]||nkName, pada:nk?.pada||1, confidence:'high', is_boundary:false },
      rashi: rashiName,
      rashi_devanagari: null,
      dasha: currentDasha,
      requires_birth_time: false,
    });
  } catch(e) { return json({ error:'calc-failed', detail:String(e.message||e) }, 500); }
}
export const GET = handler;
