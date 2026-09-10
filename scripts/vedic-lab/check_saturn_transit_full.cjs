const fs = require('fs');
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const results = JSON.parse(fs.readFileSync('/tmp/kaalsarp-sadesati-sample.json', 'utf8'));
const refDate = new Date();

let kaalSarpMatches = 0, kaalSarpTotal = 0;
let saturnHouseMatches = 0, saturnHouseTotal = 0;
const mismatches = [];

// Map our house-from-Moon number to what ProKerala's phase labels mean
function classifyHouse(house) {
  if (house === 12) return 'Rising';
  if (house === 1) return 'Peak';
  if (house === 2) return 'Setting';
  if (house === 4) return 'Small Panoti'; // Kantaka Shani
  if (house === 8) return 'Ashtama Sani';
  return null;
}

for (const r of results) {
  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateFullChart(birthUTC, refDate, c.lat, c.lon);

  // Kaal Sarp comparison
  kaalSarpTotal++;
  const pkKaalSarp = r.kaal_sarp?.has_dosha;
  const ourKaalSarp = ours.doshas.kaalSarpDosha;
  const ksMatch = pkKaalSarp === ourKaalSarp;
  if (ksMatch) kaalSarpMatches++;

  // Saturn-from-Moon house classification (covers Sade Sati + Dhaiya together)
  saturnHouseTotal++;
  const ourHouse = ours.doshas.sadeSati.houseOfSaturnFromMoon;
  const ourClassification = classifyHouse(ourHouse);
  const pkIsActive = r.sade_sati?.is_in_sade_sati;
  const pkPhase = r.sade_sati?.transit_phase;

  // Match if: (ProKerala says active AND our classification matches their phase name)
  //        OR (ProKerala says not active AND our house isn't one of the 5 flagged houses)
  let phaseMatch;
  if (pkIsActive) {
    phaseMatch = (ourClassification !== null) && (
      (pkPhase === 'Small Panoti' && ourHouse === 4) ||
      (pkPhase === 'Ashtama Sani' && ourHouse === 8) ||
      (pkPhase === 'Rising' && ourHouse === 12) ||
      (pkPhase === 'Peak' && ourHouse === 1) ||
      (pkPhase === 'Setting' && ourHouse === 2)
    );
  } else {
    phaseMatch = ourClassification === null;
  }
  if (phaseMatch) saturnHouseMatches++;

  if (!ksMatch || !phaseMatch) {
    mismatches.push({ id: r.id, label: r.label, pkKaalSarp, ourKaalSarp, ksMatch, pkPhase, pkIsActive, ourHouse, ourClassification, phaseMatch });
  }
}

console.log('=== KAAL SARP DOSHA ===');
console.log('Match:', kaalSarpMatches, '/', kaalSarpTotal, '=', (100*kaalSarpMatches/kaalSarpTotal).toFixed(1)+'%');
console.log('');
console.log('=== SATURN-FROM-MOON TRANSIT (Sade Sati + Dhaiya combined) ===');
console.log('Match:', saturnHouseMatches, '/', saturnHouseTotal, '=', (100*saturnHouseMatches/saturnHouseTotal).toFixed(1)+'%');
console.log('');
console.log('Mismatches:', JSON.stringify(mismatches, null, 2));
