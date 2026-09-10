const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const sample1 = JSON.parse(fs.readFileSync('/tmp/mangal-dosha-sample.json', 'utf8'));
const sample2 = JSON.parse(fs.readFileSync('/tmp/mangal-dosha-remaining.json', 'utf8'));
const results = [...sample1, ...sample2];
const refDate = new Date();

let lagnaOnlyMatches = 0, total = 0, skipped = 0;
const mismatches = [];

for (const r of results) {
  if (!r.mangal_dosha || r.mangal_dosha.has_dosha === undefined) { skipped++; continue; }
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateFullChart(birthUTC, refDate, c.lat, c.lon);

  total++;
  const pkHasDosha = r.mangal_dosha.has_dosha;
  const match = ours.doshas.mangalDosha.fromLagna === pkHasDosha;
  if (match) lagnaOnlyMatches++;
  else mismatches.push({ id: r.id, label: r.label, prokerala: pkHasDosha, ours: ours.doshas.mangalDosha.fromLagna, marsHouse: ours.planets.Mars.house });
}

console.log('=== FULL MANGAL DOSHA VALIDATION (Lagna-only convention) ===');
console.log('Total comparable:', total, '(', skipped, 'skipped - undefined in ProKerala)');
console.log('Match:', lagnaOnlyMatches, '/', total, '=', (100*lagnaOnlyMatches/total).toFixed(2)+'%');
console.log('');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
