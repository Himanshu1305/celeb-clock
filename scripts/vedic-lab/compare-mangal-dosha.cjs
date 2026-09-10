const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const results = JSON.parse(fs.readFileSync('/tmp/prokerala-full-100-results.json', 'utf8'));
const refDate = new Date();

let lagnaOnlyMatches = 0, threePointMatches = 0, total = 0, skipped = 0;
const mismatches = [];

for (const r of results) {
  const pk = r.prokerala;
  if (!pk || pk.error || pk.dasha === undefined) { skipped++; continue; }
  // We need mangal_dosha data, but our earlier batch only saved the kundali.ts
  // response shape, which doesn't include mangal_dosha. Flag this gap.
  if (pk.mangal_dosha === undefined) { skipped++; continue; }

  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateFullChart(birthUTC, refDate, c.lat, c.lon);

  total++;
  const pkHasDosha = pk.mangal_dosha.has_dosha;
  const lagnaOnlyMatch = ours.doshas.mangalDosha.fromLagna === pkHasDosha;
  const threePointMatch = ours.doshas.mangalDosha.hasDosha === pkHasDosha;

  if (lagnaOnlyMatch) lagnaOnlyMatches++;
  if (threePointMatch) threePointMatches++;

  if (!lagnaOnlyMatch || !threePointMatch) {
    mismatches.push({ id: r.id, label: r.label, prokerala: pkHasDosha, fromLagna: ours.doshas.mangalDosha.fromLagna, threePointOR: ours.doshas.mangalDosha.hasDosha });
  }
}

console.log('Total comparable:', total, '(', skipped, 'skipped - no mangal_dosha field saved)');
console.log('Lagna-only convention match:', lagnaOnlyMatches, '/', total);
console.log('Three-point-OR convention match:', threePointMatches, '/', total);
console.log('');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
