const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const data = JSON.parse(fs.readFileSync('/tmp/manglik-percentages.json', 'utf8'));
const refDate = new Date();

let matches = 0, total = 0;
const details = [];

for (const r of data) {
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, refDate, c.lat, c.lon);
  const ourVerdict = chart.doshas.mangalDosha.hasDosha;
  const apiVerdict = r.manglik.is_present;
  const apiPct = r.manglik.percentage_manglik_present;

  total++;
  const match = ourVerdict === apiVerdict;
  if (match) matches++;
  details.push({ id: r.id, ourVerdict, apiVerdict, apiPct, match, marsHouse: chart.planets.Mars.house });
}

console.log('Verdict match:', matches, '/', total, '=', (100*matches/total).toFixed(1)+'%');
console.log('');
details.forEach(d => console.log(JSON.stringify(d)));
