const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}
function normalize360(deg) { return ((deg % 360) + 360) % 360; }

function checkWholeSignKaalSarp(chart) {
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  function signInArc(sign, startSign, endSign) {
    const arcLen = normalize360(endSign*30 - startSign*30) / 30;
    const pos = normalize360(sign*30 - startSign*30) / 30;
    return pos <= arcLen;
  }

  const allInRahuArc = classical.every(name => signInArc(chart.planets[name].rashiIndex, rahuSign, ketuSign));
  const allInKetuArc = classical.every(name => signInArc(chart.planets[name].rashiIndex, ketuSign, rahuSign));
  return allInRahuArc || allInKetuArc;
}

const testCases = [
  { label: 'Exact midnight IST', y:2005,m:6,d:15,h:0,min:0,lat:28.6139,lon:77.2090,tz:5.5 },
  { label: 'Near Antarctic', y:1985,m:12,d:21,h:12,min:0,lat:-54.8019,lon:-68.3030,tz:-3 },
  { label: 'EU DST transition 2019', y:2019,m:3,d:31,h:1,min:30,lat:51.5074,lon:-0.1278,tz:0 },
];

for (const tc of testCases) {
  const birthUTC = tzOffsetToUTC(tc.y, tc.m, tc.d, tc.h, tc.min, tc.tz);
  const chart = generateFullChart(birthUTC, new Date(), tc.lat, tc.lon);
  console.log(tc.label, '- whole-sign Kaal Sarp:', checkWholeSignKaalSarp(chart));
}
