const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

// Chart 6: Exact midnight IST, 2005-06-15, Delhi
const birthUTC = tzOffsetToUTC(2005, 6, 15, 0, 0, 5.5);
const refDate = new Date();
const chart = generateFullChart(birthUTC, refDate, 28.6139, 77.2090);

const rahu = chart.planets.Rahu.siderealLongitude;
const ketu = chart.planets.Ketu.siderealLongitude;
console.log('Rahu:', rahu, '| Ketu:', ketu);
console.log('');

const classical = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
for (const name of classical) {
  const lon = chart.planets[name].siderealLongitude;
  console.log(name + ':', lon);
}
