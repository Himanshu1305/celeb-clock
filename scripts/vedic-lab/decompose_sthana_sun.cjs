const Astronomy = require('astronomy-engine');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');
const sthanaBala = require('./sthanaBala.cjs');

function normalize360(deg) { return ((deg % 360) + 360) % 360; }
const LAHIRI_J2000_DEG = 23.853222;
function getLahiriAyanamsa(date) {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}
function getPlanetSiderealLongitude(planetName, time, ayanamsa) {
  const vec = Astronomy.GeoVector(planetName, time, true);
  return normalize360(normalize360(Astronomy.Ecliptic(vec).elon) - ayanamsa);
}
const RASHI_MODALITY = { 0:'movable', 1:'fixed', 2:'dual', 3:'movable', 4:'fixed', 5:'dual', 6:'movable', 7:'fixed', 8:'dual', 9:'movable', 10:'fixed', 11:'dual' };
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

const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);
const time = Astronomy.MakeTime(birthUTC);
const ayanamsa = getLahiriAyanamsa(birthUTC);
const lon = getPlanetSiderealLongitude('Sun', time, ayanamsa);

const rasiSign = Math.floor(lon/30);
const horaSign = getHoraSignIdx(lon);
const drekkanaSign = getDrekkanaSignIdx(lon);
const saptamsaSign = getSaptamsaSignIdx(lon);
const navamsaSign = getNavamsaSignIdx(lon);
const dwadasamsaSign = getDwadasamsaSignIdx(lon);
const trimsamsaSign = getTrimsamsaSignIdx(lon);

console.log('Sun longitude:', lon.toFixed(4), '(sign', rasiSign, ')');
console.log('D-chart signs - Hora:', horaSign, 'Drekkana:', drekkanaSign, 'Saptamsa:', saptamsaSign, 'Navamsa:', navamsaSign, 'Dwadasamsa:', dwadasamsaSign, 'Trimsamsa:', trimsamsaSign);
console.log('');
console.log('Uchcha:', sthanaBala.getUcchaBala('Sun', lon).toFixed(3));
console.log('Ojayugma:', sthanaBala.getOjayugmaBala('Sun', rasiSign, navamsaSign));
console.log('Kendradi (house', chart.planets.Sun.house + '):', sthanaBala.getKendradiBala(chart.planets.Sun.house));
console.log('Drekkana Bala:', sthanaBala.getDrekkanaBala('Sun', lon % 30));
console.log('Saptavargaja:', sthanaBala.getSaptavargajaBala('Sun', rasiSign, horaSign, drekkanaSign, saptamsaSign, navamsaSign, dwadasamsaSign, trimsamsaSign, lon).toFixed(3));
console.log('');
console.log('TOTAL:', (sthanaBala.getUcchaBala('Sun', lon) + sthanaBala.getOjayugmaBala('Sun', rasiSign, navamsaSign) + sthanaBala.getKendradiBala(chart.planets.Sun.house) + sthanaBala.getDrekkanaBala('Sun', lon % 30) + sthanaBala.getSaptavargajaBala('Sun', rasiSign, horaSign, drekkanaSign, saptamsaSign, navamsaSign, dwadasamsaSign, trimsamsaSign, lon)).toFixed(3));
console.log('');
console.log('API breakdown for Sun sthana_bala: uccha=3.127284, ojayugma=15, kendradi=60, drekkana=0, saptavargaja=63.75, total=141.877284');
