const fs = require('fs');
const Astronomy = require('astronomy-engine');

const RASHI_NAMES = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_ALIASES = { 'Vrisha': 'Vrishabha', 'Vrishabha': 'Vrishabha' };
function normalizeRashiName(name) {
  return RASHI_ALIASES[name] || name;
}

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
const DASHA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };

function normalize360(deg) { return ((deg % 360) + 360) % 360; }

const LAHIRI_J2000_DEG = 23.853222;

function getLahiriAyanamsa(date) {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}

function siderealBreakdown(siderealLon) {
  const rashiIndex = Math.floor(siderealLon / 30);
  const rashiDegree = siderealLon % 30;
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(siderealLon / nakshatraSpan);
  const nakshatraDegree = siderealLon % nakshatraSpan;
  const padaSpan = nakshatraSpan / 4;
  const pada = Math.floor(nakshatraDegree / padaSpan) + 1;
  return {
    rashiIndex, rashi: RASHI_NAMES[rashiIndex], rashiDegree,
    nakshatraIndex, nakshatra: NAKSHATRA_NAMES[nakshatraIndex], nakshatraDegree, pada,
  };
}

function generateOurChart(birthDateUTC, refDateUTC) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);

  const moonVec = Astronomy.GeoMoon(time);
  const moonEcl = Astronomy.Ecliptic(moonVec);
  const moonTropicalLon = normalize360(moonEcl.elon);
  const moonSiderealLon = normalize360(moonTropicalLon - ayanamsa);
  const moon = { siderealLongitude: moonSiderealLon, ...siderealBreakdown(moonSiderealLon) };

  const nakshatraSpan = 360 / 27;
  const fractionElapsed = moon.nakshatraDegree / nakshatraSpan;
  const birthLordIndex = moon.nakshatraIndex % 9;
  const birthLord = DASHA_LORDS[birthLordIndex];
  const birthLordFullYears = DASHA_YEARS[birthLord];
  const yearsElapsed = birthLordFullYears * fractionElapsed;

  const birthMahadashaStart = new Date(birthDateUTC.getTime() - yearsElapsed * 365.25 * 24 * 3600 * 1000);
  let cursorDate = birthMahadashaStart;
  let lordIndex = birthLordIndex;
  const dashaTimeline = [];
  for (let i = 0; i < 12; i++) {
    const lord = DASHA_LORDS[lordIndex % 9];
    const years = DASHA_YEARS[lord];
    const start = new Date(cursorDate.getTime());
    const end = new Date(cursorDate.getTime() + years * 365.25 * 24 * 3600 * 1000);
    dashaTimeline.push({ lord, start, end });
    cursorDate = end;
    lordIndex++;
    if (start > refDateUTC && dashaTimeline.length > 2) break;
  }
  const currentMahadasha = dashaTimeline.find(p => refDateUTC >= p.start && refDateUTC < p.end);

  return {
    ayanamsa,
    moon,
    currentMahadasha: currentMahadasha ? { lord: currentMahadasha.lord, start: currentMahadasha.start, end: currentMahadasha.end } : null,
  };
}

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const results = JSON.parse(fs.readFileSync('/tmp/prokerala-full-100-results.json', 'utf8'));
const refDate = new Date();

let rashiMatch = 0, rashiMismatch = 0;
let nakshatraMatch = 0, nakshatraMismatch = 0;
let dashaLordMatch = 0, dashaLordMismatch = 0;
let skipped = 0;
const mismatchDetails = [];

for (const r of results) {
  const pk = r.prokerala;
  if (!pk || pk.error || !pk.nakshatra || pk.nakshatra.nakshatra === 'Unknown') {
    skipped++;
    continue;
  }

  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateOurChart(birthUTC, refDate);

  const ourRashi = normalizeRashiName(ours.moon.rashi);
  const pkRashi = normalizeRashiName(pk.rashi);
  const rashiOk = ourRashi === pkRashi;
  if (rashiOk) rashiMatch++; else rashiMismatch++;

  const nakOk = ours.moon.nakshatra === pk.nakshatra.nakshatra;
  if (nakOk) nakshatraMatch++; else nakshatraMismatch++;

  const pkDashaLord = pk.dasha?.mahadasha || null;
  const ourDashaLord = ours.currentMahadasha?.lord || null;
  const dashaOk = pkDashaLord === ourDashaLord;
  if (dashaOk) dashaLordMatch++; else dashaLordMismatch++;

  if (!rashiOk || !nakOk || !dashaOk) {
    mismatchDetails.push({
      id: r.id, label: r.label, category: r.category,
      rashi: { ours: ourRashi, prokerala: pkRashi, match: rashiOk },
      nakshatra: { ours: ours.moon.nakshatra, prokerala: pk.nakshatra.nakshatra, match: nakOk, ourDegree: ours.moon.nakshatraDegree.toFixed(4) },
      dashaLord: { ours: ourDashaLord, prokerala: pkDashaLord, match: dashaOk },
    });
  }
}

const total = rashiMatch + rashiMismatch;
console.log('=== COMPARISON SUMMARY ===');
console.log('Total charts compared:', total, '(', skipped, 'skipped due to ProKerala errors)');
console.log('');
console.log('Rashi match:', rashiMatch, '/', total, '=', (100*rashiMatch/total).toFixed(1) + '%');
console.log('Nakshatra match:', nakshatraMatch, '/', total, '=', (100*nakshatraMatch/total).toFixed(1) + '%');
console.log('Current Dasha lord match:', dashaLordMatch, '/', total, '=', (100*dashaLordMatch/total).toFixed(1) + '%');
console.log('');
console.log('=== MISMATCHES (' + mismatchDetails.length + ') ===');
mismatchDetails.forEach(m => {
  console.log(JSON.stringify(m, null, 2));
});

fs.writeFileSync('/tmp/comparison-summary.json', JSON.stringify({
  total, skipped,
  rashiMatch, rashiMismatch,
  nakshatraMatch, nakshatraMismatch,
  dashaLordMatch, dashaLordMismatch,
  mismatches: mismatchDetails,
}, null, 2));
console.log('\nFull summary written to /tmp/comparison-summary.json');
