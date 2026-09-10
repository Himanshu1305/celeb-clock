const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const cases = [
  { label: 'Chart 7 - One minute before midnight', y:2005,m:6,d:15,h:23,min:59,lat:28.6139,lon:77.2090,tz:5.5 },
  { label: 'Chart 8 - One minute after midnight', y:2005,m:6,d:16,h:0,min:1,lat:28.6139,lon:77.2090,tz:5.5 },
  { label: 'Chart 68 - Toronto 2025', y:2025,m:5,d:9,h:0,min:53,lat:43.6532,lon:-79.3832,tz:-5 },
  { label: 'Chart 89 - Cairo 2005', y:2005,m:7,d:14,h:2,min:11,lat:30.0444,lon:31.2357,tz:2 },
];

for (const c of cases) {
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, new Date(), c.lat, c.lon);
  console.log('---', c.label, '---');
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  console.log('Rahu sign:', rahuSign, '| Ketu sign:', ketuSign);
  for (const name of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']) {
    const p = chart.planets[name];
    console.log(name + ':', p.siderealLongitude.toFixed(4), 'sign', p.rashiIndex, 'degree-in-sign', p.rashiDegree.toFixed(2));
  }
  console.log('');
}
