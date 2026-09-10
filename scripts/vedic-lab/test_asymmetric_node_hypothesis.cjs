const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}
function normalize360(deg) { return ((deg % 360) + 360) % 360; }

// Hypothesis: the node's OWN sign is inclusive for Rahu but exclusive for
// Ketu, regardless of which arc direction is being tested. I.e. a planet
// in Rahu's sign always counts as "hemmed"; a planet in Ketu's sign never
// does (must be strictly before Ketu's sign in zodiacal order from Rahu).
function checkKaalSarpNodeAsymmetric(chart) {
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  const signs = classical.map(n => chart.planets[n].rashiIndex);

  function testDirection(startSign, endSign, startIsRahu) {
    // arc from startSign to endSign; startSign inclusive if it's Rahu's sign,
    // endSign exclusive if it's Ketu's sign
    const arcLen = normalize360(endSign*30 - startSign*30) / 30;
    return signs.every(s => {
      const pos = normalize360(s*30 - startSign*30) / 30;
      if (pos === 0) return startIsRahu; // at start boundary: ok only if start is Rahu
      if (pos === arcLen) return !startIsRahu; // at end boundary: ok only if end is Rahu (i.e. start is Ketu)
      return pos > 0 && pos < arcLen;
    });
  }

  // Direction 1: Rahu -> Ketu (start=Rahu so inclusive, end=Ketu so exclusive)
  const dir1 = testDirection(rahuSign, ketuSign, true);
  // Direction 2: Ketu -> Rahu (start=Ketu so should be exclusive at start... 
  // but our rule says "Rahu inclusive always, Ketu exclusive always" so:
  const dir2 = testDirection(ketuSign, rahuSign, false);

  return dir1 || dir2;
}

const allCharts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));
const kaalSarpData = JSON.parse(fs.readFileSync('/tmp/kaalsarp-full-100.json', 'utf8'));
const refDate = new Date();

let matches = 0, total = 0;
const mismatches = [];

for (const pk of kaalSarpData) {
  if (pk.kaal_sarp?.has_dosha === undefined) continue;
  const c = pk.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, refDate, c.lat, c.lon);
  const ours = checkKaalSarpNodeAsymmetric(chart);
  const pkResult = pk.kaal_sarp.has_dosha;

  total++;
  if (ours === pkResult) matches++;
  else mismatches.push({ id: pk.id, label: pk.label, ours, prokerala: pkResult });
}

console.log('=== Node-asymmetric rule (Rahu sign inclusive, Ketu sign exclusive) ===');
console.log('Match:', matches, '/', total, '=', (100*matches/total).toFixed(1)+'%');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
