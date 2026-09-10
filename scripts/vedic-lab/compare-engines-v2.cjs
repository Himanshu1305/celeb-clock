const fs = require('fs');
const Astronomy = require('astronomy-engine');

const RASHI_NAMES = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_ALIASES = { 'Vrisha': 'Vrishabha', 'Vrishabha': 'Vrishabha' };
function normalizeRashiName(name) { return RASHI_ALIASES[name] || name; }

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
// Standard alternate transliterations - verified to be the same nakshatra
// by index position in the canonical 27-nakshatra ordering, not just
// visual similarity.
const NAKSHATRA_ALIASES = {
  'Moola': 'Mula', 'Mula': 'Mula',
  'Jyeshta': 'Jyeshtha', 'Jyeshtha': 'Jyeshtha',
  'Mrigashirsha': 'Mrigashira', 'Mrigashira': 'Mrigashira',
  'Vishaka': 'Vishakha', 'Vishakha': 'Vishakha',
  'Dhanishta': 'Dhanishtha', 'Dhanishtha': 'Dhanishtha',
  'Krithika': 'Krittika', 'Krittika': 'Krittika',
};
function normalizeNakshatraName(name) { return NAKSHATRA_ALIASES[name] || name; }

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

  return { ayanamsa, moon, currentMahadasha: currentMahadasha ? { lord: currentMahadasha.lord } : null };
}

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const results = JSON.parse(fs.readFileSync('/tmp/prokerala-full-100-results.json', 'utf8'));
const refDate = new Date();

let rashiMatch = 0, nakshatraMatch = 0, dashaLordMatch = 0, dashaComparable = 0;
let skipped = 0;
const realMismatches = [];

for (const r of results) {
  const pk = r.prokerala;
  if (!pk || pk.error || !pk.nakshatra || pk.nakshatra.nakshatra === 'Unknown') { skipped++; continue; }

  const c = r.input;
  const birthUTC = tzOffsetToUTC(c.y, c.m, c.d, c.h, c.min, c.tz);
  const ours = generateOurChart(birthUTC, refDate);

  const ourRashi = normalizeRashiName(ours.moon.rashi);
  const pkRashi = normalizeRashiName(pk.rashi);
  const rashiOk = ourRashi === pkRashi;
  if (rashiOk) rashiMatch++;

  const ourNak = normalizeNakshatraName(ours.moon.nakshatra);
  const pkNak = normalizeNakshatraName(pk.nakshatra.nakshatra);
  const nakOk = ourNak === pkNak;
  if (nakOk) nakshatraMatch++;

  const pkDashaLord = pk.dasha?.mahadasha || null;
  const ourDashaLord = ours.currentMahadasha?.lord || null;
  let dashaOk = true;
  if (pkDashaLord !== null) {
    dashaComparable++;
    dashaOk = pkDashaLord === ourDashaLord;
    if (dashaOk) dashaLordMatch++;
  }

  if (!rashiOk || !nakOk || (pkDashaLord !== null && !dashaOk)) {
    realMismatches.push({ id: r.id, label: r.label, category: r.category,
      rashi: { ours: ourRashi, prokerala: pkRashi },
      nakshatra: { ours: ourNak, prokerala: pkNak },
      dashaLord: { ours: ourDashaLord, prokerala: pkDashaLord } });
  }
}

const total = rashiMatch + (99 - rashiMatch - 0); // placeholder, recompute cleanly below
const totalCompared = results.filter(r => { const pk = r.prokerala; return pk && !pk.error && pk.nakshatra && pk.nakshatra.nakshatra !== 'Unknown'; }).length;

console.log('=== CORRECTED COMPARISON SUMMARY (with transliteration normalization) ===');
console.log('Total charts compared:', totalCompared, '(', skipped, 'skipped due to ProKerala errors)');
console.log('');
console.log('Rashi match:', rashiMatch, '/', totalCompared, '=', (100*rashiMatch/totalCompared).toFixed(1) + '%');
console.log('Nakshatra match:', nakshatraMatch, '/', totalCompared, '=', (100*nakshatraMatch/totalCompared).toFixed(1) + '%');
console.log('Dasha lord match:', dashaLordMatch, '/', dashaComparable, '=', (100*dashaLordMatch/dashaComparable).toFixed(1) + '% (', totalCompared - dashaComparable, 'had no ProKerala dasha to compare)');
console.log('');
console.log('=== GENUINE MISMATCHES (' + realMismatches.length + ') ===');
realMismatches.forEach(m => console.log(JSON.stringify(m, null, 2)));

fs.writeFileSync('/tmp/comparison-summary-v2.json', JSON.stringify({ totalCompared, skipped, rashiMatch, nakshatraMatch, dashaLordMatch, dashaComparable, realMismatches }, null, 2));
console.log('\nWritten to /tmp/comparison-summary-v2.json');
