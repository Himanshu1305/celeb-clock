const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const allCharts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));
const kaalSarpData = JSON.parse(fs.readFileSync('/tmp/kaalsarp-full-100.json', 'utf8'));
const refDate = new Date();

let matches = 0, total = 0;
const mismatches = [];

for (const pk of kaalSarpData) {
  if (pk.kaal_sarp?.has_dosha === undefined) continue;
  const c = allCharts.find(x => x.id === pk.id);
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, refDate, c.lat, c.lon);
  const ours = chart.doshas.kaalSarpDosha;
  const pkResult = pk.kaal_sarp.has_dosha;

  total++;
  if (ours === pkResult) matches++;
  else mismatches.push({ id: pk.id, label: pk.label, ours, prokerala: pkResult });
}

console.log('=== KAAL SARP DOSHA - main engine file, full 100 charts ===');
console.log('Match:', matches, '/', total, '=', (100*matches/total).toFixed(1)+'%');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
