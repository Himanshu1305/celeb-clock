const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}
function normalize360(deg) { return ((deg % 360) + 360) % 360; }

function signInArcWholeSign(sign, startSign, endSign) {
  const arcLen = normalize360(endSign * 30 - startSign * 30) / 30;
  const pos = normalize360(sign * 30 - startSign * 30) / 30;
  return pos <= arcLen;
}

function checkHybridKaalSarp(chart) {
  const rahuLon = chart.planets.Rahu.siderealLongitude;
  const ketuLon = chart.planets.Ketu.siderealLongitude;
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  function checkPlanetInArc(planetLon, planetSign, startSign, endSign, startLon) {
    // If planet shares the START sign (Rahu or Ketu's own sign), use exact
    // degree comparison against that node's precise longitude. Otherwise
    // use whole-sign.
    if (planetSign === startSign) {
      return planetLon >= startLon || (startLon > 330 && planetLon < 30); // handle wraparound loosely
    }
    return signInArcWholeSign(planetSign, startSign, endSign);
  }

  const allInRahuArc = classical.every(n => checkPlanetInArc(chart.planets[n].siderealLongitude, chart.planets[n].rashiIndex, rahuSign, ketuSign, rahuLon));
  const allInKetuArc = classical.every(n => checkPlanetInArc(chart.planets[n].siderealLongitude, chart.planets[n].rashiIndex, ketuSign, rahuSign, ketuLon));

  return allInRahuArc || allInKetuArc;
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
  const ours = checkHybridKaalSarp(chart);
  const pkResult = pk.kaal_sarp.has_dosha;

  total++;
  if (ours === pkResult) matches++;
  else mismatches.push({ id: pk.id, label: pk.label, ours, prokerala: pkResult });
}

console.log('=== HYBRID RULE (whole-sign + exact-degree for shared node sign) ===');
console.log('Match:', matches, '/', total, '=', (100*matches/total).toFixed(1)+'%');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
