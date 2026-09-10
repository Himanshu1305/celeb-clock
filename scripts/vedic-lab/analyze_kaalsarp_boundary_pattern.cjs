const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}
function normalize360(deg) { return ((deg % 360) + 360) % 360; }

function signInArc(sign, startSign, endSign, inclusive) {
  const arcLen = normalize360(endSign*30 - startSign*30) / 30;
  const pos = normalize360(sign*30 - startSign*30) / 30;
  return inclusive ? pos <= arcLen : pos < arcLen;
}

const results = JSON.parse(fs.readFileSync('/tmp/kaalsarp-full-100.json', 'utf8'));
const refDate = new Date();

const rules = {
  strictDegree: 0,
  wholeSignInclusiveBoth: 0,
  wholeSignAsymmetric: 0,
};
let total = 0;
const detailedMismatches = { strictDegree: [], wholeSignInclusiveBoth: [], wholeSignAsymmetric: [] };

for (const r of results) {
  const pk = r.kaal_sarp?.has_dosha;
  if (pk === undefined) continue;
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const chart = generateFullChart(birthUTC, refDate, c.lat, c.lon);
  total++;

  const rahuLon = chart.planets.Rahu.siderealLongitude;
  const ketuLon = chart.planets.Ketu.siderealLongitude;
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  // Rule 1: strict degree
  function inArcDegree(lon, start, end) {
    const arcLen = normalize360(end - start);
    const pos = normalize360(lon - start);
    return pos <= arcLen;
  }
  const strict = classical.every(n => inArcDegree(chart.planets[n].siderealLongitude, rahuLon, ketuLon)) ||
                 classical.every(n => inArcDegree(chart.planets[n].siderealLongitude, ketuLon, rahuLon));

  // Rule 2: whole-sign inclusive both boundaries
  const wsInclusive = classical.every(n => signInArc(chart.planets[n].rashiIndex, rahuSign, ketuSign, true)) ||
                      classical.every(n => signInArc(chart.planets[n].rashiIndex, ketuSign, rahuSign, true));

  // Rule 3: whole-sign asymmetric (inclusive start, exclusive end)
  const wsAsym = classical.every(n => signInArc(chart.planets[n].rashiIndex, rahuSign, ketuSign, false)) ||
                 classical.every(n => signInArc(chart.planets[n].rashiIndex, ketuSign, rahuSign, false));

  if (strict === pk) rules.strictDegree++;
  else detailedMismatches.strictDegree.push(r.id);

  if (wsInclusive === pk) rules.wholeSignInclusiveBoth++;
  else detailedMismatches.wholeSignInclusiveBoth.push(r.id);

  if (wsAsym === pk) rules.wholeSignAsymmetric++;
  else detailedMismatches.wholeSignAsymmetric.push(r.id);
}

console.log('Total comparable:', total);
console.log('');
console.log('Strict degree rule:', rules.strictDegree, '/', total, '=', (100*rules.strictDegree/total).toFixed(1)+'%');
console.log('Whole-sign inclusive-both:', rules.wholeSignInclusiveBoth, '/', total, '=', (100*rules.wholeSignInclusiveBoth/total).toFixed(1)+'%');
console.log('Whole-sign asymmetric:', rules.wholeSignAsymmetric, '/', total, '=', (100*rules.wholeSignAsymmetric/total).toFixed(1)+'%');
console.log('');
console.log('Mismatched IDs per rule:');
console.log('strictDegree:', detailedMismatches.strictDegree);
console.log('wholeSignInclusiveBoth:', detailedMismatches.wholeSignInclusiveBoth);
console.log('wholeSignAsymmetric:', detailedMismatches.wholeSignAsymmetric);
