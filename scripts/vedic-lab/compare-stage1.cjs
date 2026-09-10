const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1.cjs');

const RASHI_ALIASES = { 'Vrisha': 'Vrishabha', 'Vrishabha': 'Vrishabha' };
function normRashi(name) { return RASHI_ALIASES[name] || name; }
const NAK_ALIASES = {
  'Moola': 'Mula', 'Mula': 'Mula', 'Jyeshta': 'Jyeshtha', 'Jyeshtha': 'Jyeshtha',
  'Mrigashirsha': 'Mrigashira', 'Mrigashira': 'Mrigashira', 'Vishaka': 'Vishakha', 'Vishakha': 'Vishakha',
  'Dhanishta': 'Dhanishtha', 'Dhanishtha': 'Dhanishtha', 'Krithika': 'Krittika', 'Krittika': 'Krittika',
};
function normNak(name) { return NAK_ALIASES[name] || name; }

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const results = JSON.parse(fs.readFileSync('/tmp/prokerala-full-100-results.json', 'utf8'));
const refDate = new Date();

let planetSignMatches = 0, planetSignTotal = 0;
let retroMatches = 0, retroTotal = 0;
let skipped = 0;
const mismatches = [];

for (const r of results) {
  const pk = r.prokerala;
  if (!pk || pk.error || !pk.planets || pk.planets.length === 0) { skipped++; continue; }

  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateFullChart(birthUTC, refDate);

  for (const pkPlanet of pk.planets) {
    const ourPlanet = ours.planets[pkPlanet.name];
    if (!ourPlanet) continue;
    planetSignTotal++;
    const signMatch = normRashi(ourPlanet.rashi) === normRashi(pkPlanet.sign);
    if (signMatch) planetSignMatches++;
    else mismatches.push({ id: r.id, label: r.label, planet: pkPlanet.name, field: 'sign', ours: normRashi(ourPlanet.rashi), prokerala: normRashi(pkPlanet.sign) });

    retroTotal++;
    const retroMatch = ourPlanet.retrograde === pkPlanet.retrograde;
    if (retroMatch) retroMatches++;
    else mismatches.push({ id: r.id, label: r.label, planet: pkPlanet.name, field: 'retrograde', ours: ourPlanet.retrograde, prokerala: pkPlanet.retrograde });
  }
}

console.log('=== STAGE 1 EXTENDED VALIDATION ===');
console.log('Charts compared:', results.length - skipped, '(', skipped, 'skipped)');
console.log('');
console.log('Planet sign match:', planetSignMatches, '/', planetSignTotal, '=', (100*planetSignMatches/planetSignTotal).toFixed(2) + '%');
console.log('Retrograde match:', retroMatches, '/', retroTotal, '=', (100*retroMatches/retroTotal).toFixed(2) + '%');
console.log('');
console.log('=== MISMATCHES (' + mismatches.length + ') ===');
mismatches.forEach(m => console.log(JSON.stringify(m)));

fs.writeFileSync('/tmp/stage1-comparison.json', JSON.stringify({ planetSignMatches, planetSignTotal, retroMatches, retroTotal, mismatches }, null, 2));
console.log('\nWritten to /tmp/stage1-comparison.json');
