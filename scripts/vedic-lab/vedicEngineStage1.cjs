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

function generateFullChart(birthDateUTC, refDateUTC) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);
  const lagna = null;

  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planets = {};
  const siderealLons = {};

  for (const name of planetNames) {
    const lon = getPlanetSiderealLongitude(name, time, ayanamsa);
    siderealLons[name] = lon;
    const breakdown = siderealBreakdown(lon);
    const navamsa = getNavamsaSign(lon);
    const retro = isRetrograde(name, time);
    planets[name] = { name, siderealLongitude: Number(lon.toFixed(4)), ...breakdown, navamsaSign: navamsa.navamsaSign, retrograde: retro };
  }

  const rahuTropical = getMeanNodeTropicalLongitude(birthDateUTC);
  const rahuSidereal = normalize360(rahuTropical - ayanamsa);
  const ketuSidereal = normalize360(rahuSidereal + 180);
  siderealLons['Rahu'] = rahuSidereal;
  siderealLons['Ketu'] = ketuSidereal;
  planets['Rahu'] = { name: 'Rahu', siderealLongitude: Number(rahuSidereal.toFixed(4)), ...siderealBreakdown(rahuSidereal), navamsaSign: getNavamsaSign(rahuSidereal).navamsaSign, retrograde: true };
  planets['Ketu'] = { name: 'Ketu', siderealLongitude: Number(ketuSidereal.toFixed(4)), ...siderealBreakdown(ketuSidereal), navamsaSign: getNavamsaSign(ketuSidereal).navamsaSign, retrograde: true };

  const sunLon = siderealLons['Sun'];
  for (const name of ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    let dist = Math.abs(siderealLons[name] - sunLon);
    if (dist > 180) dist = 360 - dist;
    const orb = (planets[name].retrograde && COMBUSTION_ORBS_RETROGRADE[name]) || COMBUSTION_ORBS[name];
    planets[name].combust = dist <= orb;
    planets[name].distanceFromSun = Number(dist.toFixed(2));
  }

  const moonSignIdx = planets['Moon'].rashiIndex;
  const marsSignIdx = planets['Mars'].rashiIndex;
  const houseFromMoon = ((marsSignIdx - moonSignIdx + 12) % 12) + 1;
  const mangalDoshaFromMoon = [1,2,4,7,8,12].includes(houseFromMoon);

  const classicalPlanetLons = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map(n => siderealLons[n]);
  const rahuLon = rahuSidereal, ketuLon = ketuSidereal;
  function angularPositionInArc(lon, start, end) {
    const normalizedLon = normalize360(lon - start);
    const arcLength = normalize360(end - start);
    return normalizedLon <= arcLength;
  }
  const allInRahuToKetuArc = classicalPlanetLons.every(lon => angularPositionInArc(lon, rahuLon, ketuLon));
  const allInKetuToRahuArc = classicalPlanetLons.every(lon => angularPositionInArc(lon, ketuLon, rahuLon));
  const kaalSarpDosha = allInRahuToKetuArc || allInKetuToRahuArc;

  const refTime = Astronomy.MakeTime(refDateUTC);
  const refAyanamsa = getLahiriAyanamsa(refDateUTC);
  const transitingSaturnLon = getPlanetSiderealLongitude('Saturn', refTime, refAyanamsa);
  const transitingSaturnSignIdx = Math.floor(transitingSaturnLon / 30);
  const houseOfSaturnFromMoon = ((transitingSaturnSignIdx - moonSignIdx + 12) % 12) + 1;
  let sadeSatiPhase = null;
  if (houseOfSaturnFromMoon === 12) sadeSatiPhase = 'Rising (12th from Moon)';
  else if (houseOfSaturnFromMoon === 1) sadeSatiPhase = 'Peak (on Moon sign)';
  else if (houseOfSaturnFromMoon === 2) sadeSatiPhase = '2nd from Moon';
  const sadeSatiActive = sadeSatiPhase !== null;

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
    lagna,
    planets,
    currentMahadasha: currentMahadasha ? { lord: currentMahadasha.lord, start: currentMahadasha.start.toISOString(), end: currentMahadasha.end.toISOString() } : null,
    doshas: {
      mangalDoshaFromMoon: { hasDoshaFromMoon: mangalDoshaFromMoon, houseFromMoon, note: 'Partial check only - true Lagna-based Mangal Dosha not yet validated' },
      kaalSarpDosha,
      sadeSati: { active: sadeSatiActive, phase: sadeSatiPhase, houseOfSaturnFromMoon },
    },
  };
}

module.exports = { generateFullChart, getLahiriAyanamsa, getNavamsaSign, normalize360 };
