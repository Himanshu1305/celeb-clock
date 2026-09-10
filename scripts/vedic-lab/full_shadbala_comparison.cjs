const Astronomy = require('astronomy-engine');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');
const sthanaBala = require('./sthanaBala.cjs');
const { getKalaBalaComplete } = require('./kalaBalaFinal.cjs');
const { getChestaBala } = require('./chestaBala.cjs');
const { getDrikBala } = require('./drikBala.cjs');

function normalize360(deg) { return ((deg % 360) + 360) % 360; }
const LAHIRI_J2000_DEG = 23.853222;
function getLahiriAyanamsa(date) {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}
function getPlanetSiderealLongitude(planetName, time, ayanamsa) {
  if (planetName === 'Moon') {
    const vec = Astronomy.GeoMoon(time);
    return normalize360(normalize360(Astronomy.Ecliptic(vec).elon) - ayanamsa);
  }
  const vec = Astronomy.GeoVector(planetName, time, true);
  return normalize360(normalize360(Astronomy.Ecliptic(vec).elon) - ayanamsa);
}
function getHoraSignIdx(lon) {
  const signIndex = Math.floor(lon / 30);
  const degreeInSign = lon % 30;
  const isOddSign = (signIndex % 2) === 0;
  const isFirstHalf = degreeInSign < 15;
  let rulerIsSun = isOddSign ? isFirstHalf : !isFirstHalf;
  return rulerIsSun ? 4 : 3;
}
function getDrekkanaSignIdx(lon) {
  const signIndex = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / 10);
  return (signIndex + part * 4) % 12;
}
function getSaptamsaSignIdx(lon) {
  const signIndex = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / (30/7));
  const isOdd = (signIndex % 2) === 0;
  const start = isOdd ? signIndex : (signIndex + 6) % 12;
  return (start + part) % 12;
}
const RASHI_MODALITY = { 0:'movable', 1:'fixed', 2:'dual', 3:'movable', 4:'fixed', 5:'dual', 6:'movable', 7:'fixed', 8:'dual', 9:'movable', 10:'fixed', 11:'dual' };
function getNavamsaSignIdx(lon) {
  const signIndex = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / (30/9));
  const modality = RASHI_MODALITY[signIndex];
  let start = modality === 'movable' ? signIndex : modality === 'fixed' ? (signIndex+8)%12 : (signIndex+4)%12;
  return (start + part) % 12;
}
function getDwadasamsaSignIdx(lon) {
  const signIndex = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / 2.5);
  return (signIndex + part) % 12;
}
function getTrimsamsaSignIdx(lon) {
  const signIndex = Math.floor(lon / 30);
  const deg = lon % 30;
  const isOdd = (signIndex % 2) === 0;
  if (isOdd) {
    if (deg<5) return 0; if (deg<10) return 10; if (deg<18) return 8; if (deg<25) return 2; return 6;
  } else {
    if (deg<5) return 1; if (deg<12) return 5; if (deg<20) return 8; if (deg<25) return 9; return 7;
  }
}

// Real AstrologyAPI Shadbala data for reference chart
const apiData = {
  Sun: { sthana: 141.877284, kala: 143.337882, cheshta: 23.539383, dig: 53.539383, naisargika: 60, drik: -5.616602 },
  Moon: { sthana: 226.806272, kala: 47.302709, cheshta: 16.016889, dig: 9.556272, naisargika: 51.43, drik: -7.063614 },
  Mars: { sthana: 161.509299, kala: 74.542535, cheshta: 48.539166, dig: 7.800965, naisargika: 17.14, drik: 15.683602 },
  Mercury: { sthana: 214.839834, kala: 177.46258, cheshta: 25.873901, dig: 31.410166, naisargika: 25.71, drik: -9.9924 },
  Jupiter: { sthana: 140.936694, kala: 218.857937, cheshta: 55.018094, dig: 16.771639, naisargika: 34.29, drik: 30.958796 },
  Venus: { sthana: 174.979279, kala: 116.598365, cheshta: 23.937568, dig: 5.354279, naisargika: 42.86, drik: -10.354814 },
  Saturn: { sthana: 217.296143, kala: 150.451311, cheshta: 15.58824, dig: 8.129476, naisargika: 8.57, drik: 37.108487 },
};

const NAISARGIKA_BALA = { Sun: 60, Moon: 51.43, Mars: 17.14, Mercury: 25.71, Jupiter: 34.29, Venus: 42.86, Saturn: 8.57 };
const DIG_BALA_STRONG_HOUSE = { Sun: 10, Mars: 10, Moon: 4, Venus: 4, Mercury: 1, Jupiter: 1, Saturn: 7 };

const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);
const time = Astronomy.MakeTime(birthUTC);
const ayanamsa = getLahiriAyanamsa(birthUTC);

const longitudes = {};
for (const p of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
  longitudes[p] = getPlanetSiderealLongitude(p, time, ayanamsa);
}

console.log('=== FULL SHADBALA COMPONENT COMPARISON ===');
for (const p of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
  const lon = longitudes[p];
  const rasiSign = Math.floor(lon/30);
  const horaSign = getHoraSignIdx(lon);
  const drekkanaSign = getDrekkanaSignIdx(lon);
  const saptamsaSign = getSaptamsaSignIdx(lon);
  const navamsaSign = getNavamsaSignIdx(lon);
  const dwadasamsaSign = getDwadasamsaSignIdx(lon);
  const trimsamsaSign = getTrimsamsaSignIdx(lon);

  const uchcha = sthanaBala.getUcchaBala(p, lon);
  const sapta = sthanaBala.getSaptavargajaBala(p, rasiSign, horaSign, drekkanaSign, saptamsaSign, navamsaSign, dwadasamsaSign, trimsamsaSign, lon);
  const oja = sthanaBala.getOjayugmaBala(p, rasiSign, navamsaSign);
  const kendra = sthanaBala.getKendradiBala(chart.planets[p].house);
  const drek = sthanaBala.getDrekkanaBala(p, lon % 30);
  const ourSthana = uchcha + sapta + oja + kendra + drek;

  const ourDig = (() => {
    const strongHouse = DIG_BALA_STRONG_HOUSE[p];
    const weakHouse = ((strongHouse + 6 - 1) % 12) + 1;
    // need house cusps for real dig bala - using simplified whole sign cusps
    const lagnaSign = chart.lagna.rashiIndex;
    const weakCusp = normalize360((lagnaSign + weakHouse - 1) * 30);
    let diff = normalize360(lon - weakCusp);
    if (diff > 180) diff = 360 - diff;
    return (diff/180)*60;
  })();

  const ourChesta = ['Sun','Moon'].includes(p) ? null : getChestaBala(p, lon, birthUTC);

  const api = apiData[p];
  console.log('---', p, '---');
  console.log('  Sthana: ours=' + ourSthana.toFixed(2) + ' api=' + api.sthana.toFixed(2) + ' diff=' + Math.abs(ourSthana-api.sthana).toFixed(2));
  console.log('  Naisargika: ours=' + NAISARGIKA_BALA[p] + ' api=' + api.naisargika + ' -', NAISARGIKA_BALA[p]===api.naisargika?'EXACT MATCH':'DIFFER');
  console.log('  Dig (approx): ours=' + ourDig.toFixed(2) + ' api=' + api.dig.toFixed(2) + ' diff=' + Math.abs(ourDig-api.dig).toFixed(2));
  if (ourChesta !== null) console.log('  Chesta: ours=' + ourChesta.toFixed(2) + ' api=' + api.cheshta.toFixed(2) + ' diff=' + Math.abs(ourChesta-api.cheshta).toFixed(2));
}
