const fs = require('fs');
const { generateFullChart, calculatePlacidusCusps, getKPSubLord } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const RASHI_ALIASES = {
  'Aries':'Mesha','Taurus':'Vrishabha','Gemini':'Mithuna','Cancer':'Karka','Leo':'Simha',
  'Virgo':'Kanya','Libra':'Tula','Scorpio':'Vrischika','Sagittarius':'Dhanu','Capricorn':'Makara',
  'Aquarius':'Kumbha','Pisces':'Meena'
};
function normRashi(name) { return RASHI_ALIASES[name] || name; }

const results = JSON.parse(fs.readFileSync('/tmp/astrologyapi-batch-25.json', 'utf8'));
const refDate = new Date();

let planetSignMatches = 0, planetSignTotal = 0;
let houseMatches = 0, houseTotal = 0;
let padaMatches = 0, padaTotal = 0;
let retroMatches = 0, retroTotal = 0;
let manglikMatches = 0, manglikTotal = 0;
let kalsarpMatches = 0, kalsarpTotal = 0;
let kpMatches = 0, kpTotal = 0;
let skipped = 0;
const mismatches = [];

for (const r of results) {
  if (!Array.isArray(r.planets)) { skipped++; continue; }
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateFullChart(birthUTC, refDate, c.lat, c.lon);

  const nameMap = { Sun:'Sun', Moon:'Moon', Mars:'Mars', Mercury:'Mercury', Jupiter:'Jupiter', Venus:'Venus', Saturn:'Saturn' };
  for (const apiPlanet of r.planets) {
    if (!nameMap[apiPlanet.name]) continue;
    const ourP = ours.planets[nameMap[apiPlanet.name]];
    if (!ourP) continue;

    planetSignTotal++;
    if (normRashi(apiPlanet.sign) === ourP.rashi) planetSignMatches++;
    else mismatches.push({ id: r.id, field: 'sign', planet: apiPlanet.name, ours: ourP.rashi, api: normRashi(apiPlanet.sign) });

    houseTotal++;
    if (apiPlanet.house === ourP.house) houseMatches++;
    else mismatches.push({ id: r.id, field: 'house', planet: apiPlanet.name, ours: ourP.house, api: apiPlanet.house });

    padaTotal++;
    if (apiPlanet.nakshatra_pad === ourP.pada) padaMatches++;
    else mismatches.push({ id: r.id, field: 'pada', planet: apiPlanet.name, ours: ourP.pada, api: apiPlanet.nakshatra_pad });

    retroTotal++;
    const apiRetro = apiPlanet.isRetro === 'true' || apiPlanet.isRetro === true;
    if (apiRetro === ourP.retrograde) retroMatches++;
    else mismatches.push({ id: r.id, field: 'retro', planet: apiPlanet.name, ours: ourP.retrograde, api: apiRetro });
  }

  if (r.manglik && r.manglik.is_present !== undefined) {
    manglikTotal++;
    if (r.manglik.is_present === ours.doshas.mangalDosha.hasDosha) manglikMatches++;
    else mismatches.push({ id: r.id, field: 'manglik', ours: ours.doshas.mangalDosha.hasDosha, api: r.manglik.is_present });
  }

  if (r.kalsarpa && r.kalsarpa.present !== undefined) {
    kalsarpTotal++;
    if (r.kalsarpa.present === ours.doshas.kaalSarpDosha) kalsarpMatches++;
    else mismatches.push({ id: r.id, field: 'kalsarp', ours: ours.doshas.kaalSarpDosha, api: r.kalsarpa.present });
  }

  if (r.kpCusps && Array.isArray(r.kpCusps)) {
    const ourCusps = calculatePlacidusCusps(birthUTC, c.lat, c.lon);
    for (const apiCusp of r.kpCusps) {
      const ourKP = getKPSubLord(ourCusps[apiCusp.house_id]);
      kpTotal++;
      if (apiCusp.sub_lord === ourKP.subLord && apiCusp.sub_sub_lord === ourKP.subSubLord) kpMatches++;
      else mismatches.push({ id: r.id, field: 'kp_house_' + apiCusp.house_id, ours: ourKP.subLord+'/'+ourKP.subSubLord, api: apiCusp.sub_lord+'/'+apiCusp.sub_sub_lord });
    }
  }
}

console.log('=== ASTROLOGYAPI COMPARISON ===');
console.log('Charts processed:', results.length - skipped, '(', skipped, 'skipped due to rate limit)');
console.log('Planet sign:', planetSignMatches, '/', planetSignTotal, '=', (100*planetSignMatches/planetSignTotal).toFixed(1)+'%');
console.log('House:', houseMatches, '/', houseTotal, '=', (100*houseMatches/houseTotal).toFixed(1)+'%');
console.log('Pada:', padaMatches, '/', padaTotal, '=', (100*padaMatches/padaTotal).toFixed(1)+'%');
console.log('Retrograde:', retroMatches, '/', retroTotal, '=', (100*retroMatches/retroTotal).toFixed(1)+'%');
console.log('Manglik:', manglikMatches, '/', manglikTotal, '=', (100*manglikMatches/manglikTotal).toFixed(1)+'%');
console.log('KaalSarp:', kalsarpMatches, '/', kalsarpTotal, '=', (100*kalsarpMatches/kalsarpTotal).toFixed(1)+'%');
console.log('KP sub-lords:', kpMatches, '/', kpTotal, '=', (100*kpMatches/kpTotal).toFixed(1)+'%');
console.log('');
console.log('=== MISMATCHES (' + mismatches.length + ') ===');
mismatches.forEach(m => console.log(JSON.stringify(m)));
