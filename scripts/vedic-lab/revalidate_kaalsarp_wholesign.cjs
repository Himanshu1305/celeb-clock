const fs = require('fs');
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

const results = JSON.parse(fs.readFileSync('/tmp/kaalsarp-sadesati-sample.json', 'utf8'));
const refDate = new Date();

let matches = 0, total = 0;
const mismatches = [];

for (const r of results) {
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, refDate, c.lat, c.lon);
  const ourResult = checkWholeSignKaalSarp(chart);
  const pkResult = r.kaal_sarp?.has_dosha;

  total++;
  const match = ourResult === pkResult;
  if (match) matches++;
  else mismatches.push({ id: r.id, label: r.label, ours: ourResult, prokerala: pkResult });
}

console.log('=== KAAL SARP DOSHA (whole-sign convention) ===');
console.log('Match:', matches, '/', total, '=', (100*matches/total).toFixed(1)+'%');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
