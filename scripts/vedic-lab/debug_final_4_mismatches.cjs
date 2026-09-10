const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const allCharts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));
const kaalSarpData = JSON.parse(fs.readFileSync('/tmp/kaalsarp-full-100.json', 'utf8'));
const targetIds = [7, 8, 68, 89];

for (const id of targetIds) {
  const c = allCharts.find(x => x.id === id);
  const pk = kaalSarpData.find(x => x.id === id);
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, new Date(), c.lat, c.lon);

  console.log('---', c.label, '(id', id, ') ---');
  console.log('ProKerala has_dosha:', pk.kaal_sarp?.has_dosha);
  console.log('Rahu:', chart.planets.Rahu.siderealLongitude.toFixed(4), 'sign', chart.planets.Rahu.rashiIndex);
  console.log('Ketu:', chart.planets.Ketu.siderealLongitude.toFixed(4), 'sign', chart.planets.Ketu.rashiIndex);
  for (const name of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
    const p = chart.planets[name];
    console.log(name + ':', p.siderealLongitude.toFixed(4), 'sign', p.rashiIndex);
  }
  console.log('');
}
