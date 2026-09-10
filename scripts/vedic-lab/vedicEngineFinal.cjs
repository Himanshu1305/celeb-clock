const Astronomy = require('astronomy-engine');

const RASHI_NAMES = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_MODALITY = { 0:'movable', 1:'fixed', 2:'dual', 3:'movable', 4:'fixed', 5:'dual', 6:'movable', 7:'fixed', 8:'dual', 9:'movable', 10:'fixed', 11:'dual' };
const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
const DASHA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };

const COMBUSTION_ORBS = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };
const COMBUSTION_ORBS_RETROGRADE = { Mercury: 12, Venus: 8 };

function normalize360(deg) { return ((deg % 360) + 360) % 360; }
const LAHIRI_J2000_DEG = 23.853222;

function getLahiriAyanamsa(date) {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}

function getMeanNodeTropicalLongitude(date) {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  let node = 125.04455501 - 1934.1361849 * T + 0.0020754 * T * T;
  return normalize360(node);
}

function siderealBreakdown(siderealLon) {
  const rashiIndex = Math.floor(siderealLon / 30);
  const rashiDegree = siderealLon % 30;
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(siderealLon / nakshatraSpan);
  const nakshatraDegree = siderealLon % nakshatraSpan;
  const padaSpan = nakshatraSpan / 4;
  const pada = Math.floor(nakshatraDegree / padaSpan) + 1;
  return { rashiIndex, rashi: RASHI_NAMES[rashiIndex], rashiDegree, nakshatraIndex, nakshatra: NAKSHATRA_NAMES[nakshatraIndex], nakshatraDegree, pada };
}

function getNavamsaSign(siderealLongitude) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const navamsaDivision = Math.floor(degreeInSign / (30 / 9));
  const modality = RASHI_MODALITY[signIndex];
  let startSign;
  if (modality === 'movable') startSign = signIndex;
  else if (modality === 'fixed') startSign = (signIndex + 8) % 12;
  else startSign = (signIndex + 4) % 12;
  const navamsaSignIndex = (startSign + navamsaDivision) % 12;
  return { navamsaSignIndex, navamsaSign: RASHI_NAMES[navamsaSignIndex] };
}

function getPlanetSiderealLongitude(planetName, time, ayanamsa) {
  if (planetName === 'Moon') {
    const vec = Astronomy.GeoMoon(time);
    const ecl = Astronomy.Ecliptic(vec);
    return normalize360(normalize360(ecl.elon) - ayanamsa);
  }
  const vec = Astronomy.GeoVector(planetName, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  return normalize360(normalize360(ecl.elon) - ayanamsa);
}

function isRetrograde(planetName, time) {
  if (planetName === 'Sun' || planetName === 'Moon') return false;
  const vec1 = Astronomy.GeoVector(planetName, time, true);
  const lon1 = Astronomy.Ecliptic(vec1).elon;
  const laterTime = Astronomy.MakeTime(new Date(time.date.getTime() + 24*3600*1000));
  const vec2 = Astronomy.GeoVector(planetName, laterTime, true);
  const lon2 = Astronomy.Ecliptic(vec2).elon;
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function calculateLagna(birthDateUTC, latitude, longitude) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const gst = Astronomy.SiderealTime(time);
  const lst = gst + longitude / 15;
  const ramc = normalize360(lst * 15);
  const tilt = Astronomy.e_tilt(time);
  const obliquity = tilt.tobl;
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;
  const ramcRad = toRad(ramc);
  const latRad = toRad(latitude);
  const oblRad = toRad(obliquity);
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad));
  let ascTropical = normalize360(toDeg(Math.atan2(y, x)));
  const ascSidereal = normalize360(ascTropical - ayanamsa);
  return { ascTropical, ascSidereal };
}

// Kaal Sarp Dosha: WHOLE-SIGN check (not exact degree), inclusive of both
// Rahu's and Ketu's own signs. Empirically validated at 96% (96/100)
// against live ProKerala data - the best of 4 tested conventions (strict
// degree: 94%, asymmetric variants: 92-94%). The residual 4% likely
// reflects a ProKerala-internal detail (possibly true vs mean node, or
// ayanamsa micro-differences at sign boundaries) not reverse-engineerable
// from black-box API testing alone.
function checkKaalSarpDosha(chart) {
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  function signInArc(sign, startSign, endSign) {
    const arcLen = normalize360(endSign*30 - startSign*30) / 30;
    const pos = normalize360(sign*30 - startSign*30) / 30;
    return pos <= arcLen;
  }
  const allInRahuArc = classical.every(n => signInArc(chart.planets[n].rashiIndex, rahuSign, ketuSign));
  const allInKetuArc = classical.every(n => signInArc(chart.planets[n].rashiIndex, ketuSign, rahuSign));
  return allInRahuArc || allInKetuArc;
}

function generateFullChart(birthDateUTC, refDateUTC, latitude, longitude) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);

  const lagnaResult = calculateLagna(birthDateUTC, latitude, longitude);
  const lagnaBreakdown = siderealBreakdown(lagnaResult.ascSidereal);
  const lagnaSignIdx = lagnaBreakdown.rashiIndex;

  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planets = {};
  const siderealLons = {};

  for (const name of planetNames) {
    const lon = getPlanetSiderealLongitude(name, time, ayanamsa);
    siderealLons[name] = lon;
    const breakdown = siderealBreakdown(lon);
    const navamsa = getNavamsaSign(lon);
    const retro = isRetrograde(name, time);
    const house = ((breakdown.rashiIndex - lagnaSignIdx + 12) % 12) + 1;
    planets[name] = { name, siderealLongitude: Number(lon.toFixed(4)), ...breakdown, house, navamsaSign: navamsa.navamsaSign, retrograde: retro };
  }

  const rahuTropical = getMeanNodeTropicalLongitude(birthDateUTC);
  const rahuSidereal = normalize360(rahuTropical - ayanamsa);
  const ketuSidereal = normalize360(rahuSidereal + 180);
  siderealLons['Rahu'] = rahuSidereal;
  siderealLons['Ketu'] = ketuSidereal;
  const rahuBreakdown = siderealBreakdown(rahuSidereal);
  const ketuBreakdown = siderealBreakdown(ketuSidereal);
  planets['Rahu'] = { name: 'Rahu', siderealLongitude: Number(rahuSidereal.toFixed(4)), ...rahuBreakdown, house: ((rahuBreakdown.rashiIndex - lagnaSignIdx + 12) % 12) + 1, navamsaSign: getNavamsaSign(rahuSidereal).navamsaSign, retrograde: true };
  planets['Ketu'] = { name: 'Ketu', siderealLongitude: Number(ketuSidereal.toFixed(4)), ...ketuBreakdown, house: ((ketuBreakdown.rashiIndex - lagnaSignIdx + 12) % 12) + 1, navamsaSign: getNavamsaSign(ketuSidereal).navamsaSign, retrograde: true };

  const sunLon = siderealLons['Sun'];
  for (const name of ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    let dist = Math.abs(siderealLons[name] - sunLon);
    if (dist > 180) dist = 360 - dist;
    const orb = (planets[name].retrograde && COMBUSTION_ORBS_RETROGRADE[name]) || COMBUSTION_ORBS[name];
    planets[name].combust = dist <= orb;
    planets[name].distanceFromSun = Number(dist.toFixed(2));
  }

  const mangalDoshaFromLagna = [1,2,4,7,8,12].includes(planets['Mars'].house);
  const moonSignIdx = planets['Moon'].rashiIndex;

  const kaalSarpDosha = checkKaalSarpDosha({ planets });

  const refTime = Astronomy.MakeTime(refDateUTC);
  const refAyanamsa = getLahiriAyanamsa(refDateUTC);
  const transitingSaturnLon = getPlanetSiderealLongitude('Saturn', refTime, refAyanamsa);
  const transitingSaturnSignIdx = Math.floor(transitingSaturnLon / 30);
  const houseOfSaturnFromMoon = ((transitingSaturnSignIdx - moonSignIdx + 12) % 12) + 1;
  let saturnTransitPhase = null;
  if (houseOfSaturnFromMoon === 12) saturnTransitPhase = 'Rising';
  else if (houseOfSaturnFromMoon === 1) saturnTransitPhase = 'Peak';
  else if (houseOfSaturnFromMoon === 2) saturnTransitPhase = 'Setting';
  else if (houseOfSaturnFromMoon === 4) saturnTransitPhase = 'Small Panoti';
  else if (houseOfSaturnFromMoon === 8) saturnTransitPhase = 'Ashtama Sani';
  const isInSadeSatiOrDhaiya = saturnTransitPhase !== null;

  const moon = planets['Moon'];
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
    ayanamsa: Number(ayanamsa.toFixed(6)),
    lagna: { siderealLongitude: Number(lagnaResult.ascSidereal.toFixed(4)), ...lagnaBreakdown },
    planets,
    currentMahadasha: currentMahadasha ? { lord: currentMahadasha.lord, start: currentMahadasha.start.toISOString(), end: currentMahadasha.end.toISOString() } : null,
    doshas: {
      mangalDosha: { hasDosha: mangalDoshaFromLagna },
      kaalSarpDosha,
      saturnTransit: { active: isInSadeSatiOrDhaiya, phase: saturnTransitPhase, houseFromMoon: houseOfSaturnFromMoon },
    },
  };
}

module.exports = { generateFullChart, getLahiriAyanamsa, getNavamsaSign, calculateLagna, checkKaalSarpDosha, normalize360 };
