const Astronomy = require('astronomy-engine');
const { getKalaBalaComplete } = require('./kalaBalaFinal.cjs');

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

const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const time = Astronomy.MakeTime(birthUTC);
const ayanamsa = getLahiriAyanamsa(birthUTC);

const longitudes = {};
for (const p of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
  longitudes[p] = getPlanetSiderealLongitude(p, time, ayanamsa);
}

const sunriseHour = 6 + 40/60 + 2/3600;
const sunsetHour = 17 + 29/60 + 10/3600;
const localHour = 12.5;
const localDayOfWeek = 6; // Saturday

console.log('=== Complete Kala Bala for reference chart ===');
for (const p of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
  const kala = getKalaBalaComplete(p, birthUTC, longitudes, sunriseHour, sunsetHour, localHour, localDayOfWeek);
  console.log(p + ':', JSON.stringify(kala));
}
