const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const cases = [
  { label: 'One minute before midnight', y:2005,m:6,d:15,h:23,min:59,lat:28.6139,lon:77.2090,tz:5.5 },
  { label: 'One minute after midnight', y:2005,m:6,d:16,h:0,min:1,lat:28.6139,lon:77.2090,tz:5.5 },
];

for (const c of cases) {
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, new Date(), c.lat, c.lon);
  console.log('---', c.label, '---');
  console.log('Rahu:', chart.planets.Rahu.siderealLongitude, '(sign', chart.planets.Rahu.rashiIndex, ')');
  console.log('Ketu:', chart.planets.Ketu.siderealLongitude, '(sign', chart.planets.Ketu.rashiIndex, ')');
  for (const name of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
    const p = chart.planets[name];
    console.log(name + ':', p.siderealLongitude, '(sign', p.rashiIndex, ')');
  }
  console.log('');
}
