const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const results = JSON.parse(fs.readFileSync('/tmp/mangal-dosha-sample.json', 'utf8'));
const refDate = new Date();

let lagnaOnlyMatches = 0, threePointMatches = 0, total = 0, skipped = 0;
const details = [];

for (const r of results) {
  if (!r.mangal_dosha || r.mangal_dosha.has_dosha === undefined) { skipped++; continue; }
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateFullChart(birthUTC, refDate, c.lat, c.lon);

  total++;
  const pkHasDosha = r.mangal_dosha.has_dosha;
  const lagnaOnlyMatch = ours.doshas.mangalDosha.fromLagna === pkHasDosha;
  const threePointMatch = ours.doshas.mangalDosha.hasDosha === pkHasDosha;
  if (lagnaOnlyMatch) lagnaOnlyMatches++;
  if (threePointMatch) threePointMatches++;

  details.push({ id: r.id, label: r.label, prokerala: pkHasDosha, fromLagna: ours.doshas.mangalDosha.fromLagna, fromMoon: ours.doshas.mangalDosha.fromMoon, fromVenus: ours.doshas.mangalDosha.fromVenus, threePointOR: ours.doshas.mangalDosha.hasDosha, lagnaMatch: lagnaOnlyMatch, threePointMatch });
}

console.log('Total comparable:', total, '(', skipped, 'skipped)');
console.log('Lagna-only convention match:', lagnaOnlyMatches, '/', total, '=', (100*lagnaOnlyMatches/total).toFixed(1)+'%');
console.log('Three-point-OR convention match:', threePointMatches, '/', total, '=', (100*threePointMatches/total).toFixed(1)+'%');
console.log('');
details.forEach(d => console.log(JSON.stringify(d)));
