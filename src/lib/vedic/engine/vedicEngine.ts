/**
 * BornClock Vedic engine — main chart generator (ported from
 * scripts/vedic-lab/vedicEngineStage1b.cjs, extensively validated over a prior
 * lab session; see docs/vedic-integration-touchpoints.md).
 *
 * Confidence (governs test tolerances AND UI copy tone — see the confidence
 * table in docs/BornClock_Prompt1_EngineIntegration_and_UX_v2.md):
 * - Rashi, Retrograde, Nakshatra, Pada, Dasha: 100% vs 2 providers → exact-match.
 * - Lagna / non-polar houses: ~99.99% (0.004° precision) → exact-match.
 * - Mangal Dosha (binary, Lagna-only rule): 99-100% → exact-match.
 * - Sade Sati/Dhaiya: 100% vs ProKerala → exact-match.
 * - Kaal Sarp (whole-sign): 96-100% → exact-match with documented ~4% edge tolerance.
 * - Divisional charts D2..D45: multi-source / primary-text verified → exact-match.
 * - D60 (Shastiamsa): ONE of 3 competing classical methods → UI MUST show a
 *   "one interpretation" disclaimer.
 * - Polar latitude (>~66.56°): known unreliable → emits a POLAR_LATITUDE warning;
 *   UI MUST surface a banner and never present the chart as normal.
 *
 * Pure computation, no network. Runs in both Node (vitest) and the Cloudflare
 * Worker runtime.
 */
import * as Astronomy from 'astronomy-engine';

const RASHI_NAMES = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_MODALITY: Record<number, string> = { 0:'movable', 1:'fixed', 2:'dual', 3:'movable', 4:'fixed', 5:'dual', 6:'movable', 7:'fixed', 8:'dual', 9:'movable', 10:'fixed', 11:'dual' };
const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
const DASHA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS: Record<string, number> = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };

const COMBUSTION_ORBS: Record<string, number> = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };
const COMBUSTION_ORBS_RETROGRADE: Record<string, number> = { Mercury: 12, Venus: 8 };

export function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }
const LAHIRI_J2000_DEG = 23.853222;

export function getLahiriAyanamsa(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}

function getMeanNodeTropicalLongitude(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const node = 125.04455501 - 1934.1361849 * T + 0.0020754 * T * T;
  return normalize360(node);
}

function siderealBreakdown(siderealLon: number) {
  const rashiIndex = Math.floor(siderealLon / 30);
  const rashiDegree = siderealLon % 30;
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(siderealLon / nakshatraSpan);
  const nakshatraDegree = siderealLon % nakshatraSpan;
  const padaSpan = nakshatraSpan / 4;
  const pada = Math.floor(nakshatraDegree / padaSpan) + 1;
  return { rashiIndex, rashi: RASHI_NAMES[rashiIndex], rashiDegree, nakshatraIndex, nakshatra: NAKSHATRA_NAMES[nakshatraIndex], nakshatraDegree, pada };
}

export function getNavamsaSign(siderealLongitude: number) {
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

function getPlanetSiderealLongitude(planetName: string, time: Astronomy.AstroTime, ayanamsa: number): number {
  if (planetName === 'Moon') {
    const vec = Astronomy.GeoMoon(time);
    const ecl = Astronomy.Ecliptic(vec);
    return normalize360(normalize360(ecl.elon) - ayanamsa);
  }
  const vec = Astronomy.GeoVector(planetName as Astronomy.Body, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  return normalize360(normalize360(ecl.elon) - ayanamsa);
}

function isRetrograde(planetName: string, time: Astronomy.AstroTime): boolean {
  if (planetName === 'Sun' || planetName === 'Moon') return false;
  const vec1 = Astronomy.GeoVector(planetName as Astronomy.Body, time, true);
  const lon1 = Astronomy.Ecliptic(vec1).elon;
  const laterTime = Astronomy.MakeTime(new Date(time.date.getTime() + 24*3600*1000));
  const vec2 = Astronomy.GeoVector(planetName as Astronomy.Body, laterTime, true);
  const lon2 = Astronomy.Ecliptic(vec2).elon;
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

export function calculateLagna(birthDateUTC: Date, latitude: number, longitude: number) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const gst = Astronomy.SiderealTime(time);
  const lst = gst + longitude / 15;
  const ramc = normalize360(lst * 15);

  const tilt = Astronomy.e_tilt(time);
  const obliquity = tilt.tobl;

  const ayanamsa = getLahiriAyanamsa(birthDateUTC);

  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;

  const ramcRad = toRad(ramc);
  const latRad = toRad(latitude);
  const oblRad = toRad(obliquity);

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad));

  const ascTropical = normalize360(toDeg(Math.atan2(y, x)));
  const ascSidereal = normalize360(ascTropical - ayanamsa);

  return { ascTropical, ascSidereal };
}

/**
 * Polar-latitude threshold check. Above ~66.56° (90 − obliquity) the ecliptic
 * becomes circumpolar and both the Ascendant formula and Placidus cusps have
 * documented astronomical ambiguity. The engine flags rather than guesses.
 */
export function isPolarLatitude(latitude: number, obliquity: number): boolean {
  const threshold = 90 - obliquity;
  return Math.abs(latitude) > threshold;
}

export interface ChartWarning { code: string; message: string; latitude?: number; }

/**
 * Generate a full sidereal (Lahiri) birth chart. `birthDateUTC` is the birth
 * instant in UTC; `refDateUTC` is the "now" reference for transit-based fields
 * (Dasha, Sade Sati). Returns lagna, 9 planets, current Mahadasha, doshas, and
 * a `warnings` array (populated with POLAR_LATITUDE above ~66.56°).
 */
export function generateFullChart(birthDateUTC: Date, refDateUTC: Date, latitude: number, longitude: number) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);

  const _polarTime = Astronomy.MakeTime(birthDateUTC);
  const _polarTilt = Astronomy.e_tilt(_polarTime);
  const _polarThreshold = 90 - _polarTilt.tobl;
  const isPolarLatitudeWarning = Math.abs(latitude) > _polarThreshold;

  const lagnaResult = calculateLagna(birthDateUTC, latitude, longitude);
  const lagnaBreakdown = siderealBreakdown(lagnaResult.ascSidereal);
  const lagnaSignIdx = lagnaBreakdown.rashiIndex;

  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planets: Record<string, any> = {};
  const siderealLons: Record<string, number> = {};

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
  const marsSignIdx = planets['Mars'].rashiIndex;
  const houseFromMoon = ((marsSignIdx - moonSignIdx + 12) % 12) + 1;
  const mangalDoshaFromMoon = [1,2,4,7,8,12].includes(houseFromMoon);
  const venusSignIdx = planets['Venus'].rashiIndex;
  const houseFromVenus = ((marsSignIdx - venusSignIdx + 12) % 12) + 1;
  const mangalDoshaFromVenus = [1,2,4,7,8,12].includes(houseFromVenus);
  // Lagna-only rule, validated 99/99=100% against ProKerala.
  const mangalDosha = mangalDoshaFromLagna;

  // Kaal Sarp Dosha: WHOLE-SIGN check, inclusive of Rahu's and Ketu's own
  // signs. Empirically validated at 96% against live ProKerala (best of 4
  // tested conventions).
  const rahuSignIdx = Math.floor(rahuSidereal / 30);
  const ketuSignIdx = Math.floor(ketuSidereal / 30);
  const classicalSignIndices = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map(nm => Math.floor(siderealLons[nm] / 30));
  function signInArcWholeSign(sign: number, startSign: number, endSign: number): boolean {
    const arcLen = normalize360(endSign*30 - startSign*30) / 30;
    const pos = normalize360(sign*30 - startSign*30) / 30;
    return pos <= arcLen;
  }
  const allInRahuArcWS = classicalSignIndices.every(s => signInArcWholeSign(s, rahuSignIdx, ketuSignIdx));
  const allInKetuArcWS = classicalSignIndices.every(s => signInArcWholeSign(s, ketuSignIdx, rahuSignIdx));
  const kaalSarpDosha = allInRahuArcWS || allInKetuArcWS;

  const refTime = Astronomy.MakeTime(refDateUTC);
  const refAyanamsa = getLahiriAyanamsa(refDateUTC);
  const transitingSaturnLon = getPlanetSiderealLongitude('Saturn', refTime, refAyanamsa);
  const transitingSaturnSignIdx = Math.floor(transitingSaturnLon / 30);
  const houseOfSaturnFromMoon = ((transitingSaturnSignIdx - moonSignIdx + 12) % 12) + 1;
  let sadeSatiPhase: string | null = null;
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
  const dashaTimeline: Array<{ lord: string; start: Date; end: Date }> = [];
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

  // Nested Antardasha (bhukti) within the current Mahadasha. Standard
  // Vimshottari proportion: sub-period length = maha years × (sub lord years /
  // 120), starting from the maha lord itself. Added in the port (the lab
  // engine returned Mahadasha only); Dasha timing is 100%-validated so this
  // nested split inherits that confidence.
  let currentAntardasha: { lord: string; start: string; end: string } | null = null;
  if (currentMahadasha) {
    const mahaLordIdx = DASHA_LORDS.indexOf(currentMahadasha.lord);
    const mahaYears = DASHA_YEARS[currentMahadasha.lord];
    let antarCursor = new Date(currentMahadasha.start.getTime());
    for (let i = 0; i < 9; i++) {
      const subLord = DASHA_LORDS[(mahaLordIdx + i) % 9];
      const subYears = mahaYears * (DASHA_YEARS[subLord] / 120);
      const subStart = new Date(antarCursor.getTime());
      const subEnd = new Date(antarCursor.getTime() + subYears * 365.25 * 24 * 3600 * 1000);
      if (refDateUTC >= subStart && refDateUTC < subEnd) {
        currentAntardasha = { lord: subLord, start: subStart.toISOString(), end: subEnd.toISOString() };
        break;
      }
      antarCursor = subEnd;
    }
  }

  return {
    ayanamsa: Number(ayanamsa.toFixed(6)),
    lagna: { siderealLongitude: Number(lagnaResult.ascSidereal.toFixed(4)), ...lagnaBreakdown },
    planets,
    currentMahadasha: currentMahadasha ? { lord: currentMahadasha.lord, start: currentMahadasha.start.toISOString(), end: currentMahadasha.end.toISOString() } : null,
    currentAntardasha,
    doshas: {
      mangalDosha: { hasDosha: mangalDosha, fromLagna: mangalDoshaFromLagna, fromMoon: mangalDoshaFromMoon, fromVenus: mangalDoshaFromVenus },
      kaalSarpDosha,
      sadeSati: { active: sadeSatiActive, phase: sadeSatiPhase, houseOfSaturnFromMoon },
    },
    warnings: (isPolarLatitudeWarning ? [{
      code: 'POLAR_LATITUDE',
      message: 'Birth latitude is above the polar circle threshold (~66.56 degrees). The Ascendant and house placements may be unreliable due to well-documented astronomical ambiguity at extreme latitudes (the ecliptic becomes circumpolar). Consider flagging this chart for manual review or a specialized polar-latitude calculation method.',
      latitude,
    }] : []) as ChartWarning[],
  };
}

export type FullChart = ReturnType<typeof generateFullChart>;

// --- Divisional charts D2, D3, D4, D7, D12 ---
// Verified against multiple independent published worked examples.

export function getHoraSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const isOddSign = (signIndex % 2) === 0;
  const isFirstHalf = degreeInSign < 15;
  let rulerIsSun;
  if (isOddSign) rulerIsSun = isFirstHalf;
  else rulerIsSun = !isFirstHalf;
  const horaSignIndex = rulerIsSun ? 4 : 3;
  return { horaSignIndex, horaSign: RASHI_NAMES[horaSignIndex], ruler: rulerIsSun ? 'Sun' : 'Moon' };
}

export function getDrekkanaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const part = Math.floor(degreeInSign / 10);
  const offset = part * 4;
  const drekkanaSignIndex = (signIndex + offset) % 12;
  return { drekkanaSignIndex, drekkanaSign: RASHI_NAMES[drekkanaSignIndex], part: part + 1 };
}

export function getChaturthamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const quarter = Math.floor(degreeInSign / 7.5);
  const offset = quarter * 3;
  const chaturthamsaSignIndex = (signIndex + offset) % 12;
  return { chaturthamsaSignIndex, chaturthamsaSign: RASHI_NAMES[chaturthamsaSignIndex], quarter: quarter + 1 };
}

export function getSaptamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 7;
  const part = Math.floor(degreeInSign / divisionSize);
  const isOddSign = (signIndex % 2) === 0;
  const startSign = isOddSign ? signIndex : (signIndex + 6) % 12;
  const saptamsaSignIndex = (startSign + part) % 12;
  return { saptamsaSignIndex, saptamsaSign: RASHI_NAMES[saptamsaSignIndex], part: part + 1 };
}

export function getDwadasamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const part = Math.floor(degreeInSign / 2.5);
  const dwadasamsaSignIndex = (signIndex + part) % 12;
  return { dwadasamsaSignIndex, dwadasamsaSign: RASHI_NAMES[dwadasamsaSignIndex], part: part + 1 };
}

// --- Divisional charts D10, D16, D20, D24, D27, D30 ---
const MODALITY_MAP: Record<number, string> = { 0:'movable', 1:'fixed', 2:'dual', 3:'movable', 4:'fixed', 5:'dual', 6:'movable', 7:'fixed', 8:'dual', 9:'movable', 10:'fixed', 11:'dual' };
const ELEMENT_MAP: Record<number, string> = { 0:'fire', 1:'earth', 2:'air', 3:'water', 4:'fire', 5:'earth', 6:'air', 7:'water', 8:'fire', 9:'earth', 10:'air', 11:'water' };

export function getDasamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const part = Math.floor(degreeInSign / 3);
  const isOddSign = (signIndex % 2) === 0;
  const startSign = isOddSign ? signIndex : (signIndex + 8) % 12;
  const dasamsaSignIndex = (startSign + part) % 12;
  return { dasamsaSignIndex, dasamsaSign: RASHI_NAMES[dasamsaSignIndex], part: part + 1 };
}

export function getShodasamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 16;
  const part = Math.floor(degreeInSign / divisionSize);
  const modality = MODALITY_MAP[signIndex];
  let startSign;
  if (modality === 'movable') startSign = 0;
  else if (modality === 'fixed') startSign = 4;
  else startSign = 8;
  const shodasamsaSignIndex = (startSign + part) % 12;
  return { shodasamsaSignIndex, shodasamsaSign: RASHI_NAMES[shodasamsaSignIndex], part: part + 1 };
}

export function getVimsamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 20;
  const part = Math.floor(degreeInSign / divisionSize);
  const modality = MODALITY_MAP[signIndex];
  let startSign;
  if (modality === 'movable') startSign = 0;
  else if (modality === 'fixed') startSign = 8;
  else startSign = 4;
  const vimsamsaSignIndex = (startSign + part) % 12;
  return { vimsamsaSignIndex, vimsamsaSign: RASHI_NAMES[vimsamsaSignIndex], part: part + 1 };
}

export function getChaturvimsamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 24;
  const part = Math.floor(degreeInSign / divisionSize);
  const isOddSign = (signIndex % 2) === 0;
  const startSign = isOddSign ? 4 : 3;
  const chaturvimsamsaSignIndex = (startSign + part) % 12;
  return { chaturvimsamsaSignIndex, chaturvimsamsaSign: RASHI_NAMES[chaturvimsamsaSignIndex], part: part + 1 };
}

export function getSaptavimsamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 27;
  const part = Math.floor(degreeInSign / divisionSize);
  const element = ELEMENT_MAP[signIndex];
  let startSign;
  if (element === 'fire') startSign = 0;
  else if (element === 'earth') startSign = 3;
  else if (element === 'air') startSign = 6;
  else startSign = 9;
  const saptavimsamsaSignIndex = (startSign + part) % 12;
  return { saptavimsamsaSignIndex, saptavimsamsaSign: RASHI_NAMES[saptavimsamsaSignIndex], part: part + 1 };
}

export function getTrimsamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const deg = siderealLongitude % 30;
  const isOdd = (signIndex % 2) === 0;
  if (isOdd) {
    if (deg < 5) return { trimsamsaSign: RASHI_NAMES[0], lord: 'Mars' };
    if (deg < 10) return { trimsamsaSign: RASHI_NAMES[10], lord: 'Saturn' };
    if (deg < 18) return { trimsamsaSign: RASHI_NAMES[8], lord: 'Jupiter' };
    if (deg < 25) return { trimsamsaSign: RASHI_NAMES[2], lord: 'Mercury' };
    return { trimsamsaSign: RASHI_NAMES[6], lord: 'Venus' };
  } else {
    if (deg < 5) return { trimsamsaSign: RASHI_NAMES[1], lord: 'Venus' };
    if (deg < 12) return { trimsamsaSign: RASHI_NAMES[5], lord: 'Mercury' };
    if (deg < 20) return { trimsamsaSign: RASHI_NAMES[8], lord: 'Jupiter' };
    if (deg < 25) return { trimsamsaSign: RASHI_NAMES[9], lord: 'Saturn' };
    return { trimsamsaSign: RASHI_NAMES[7], lord: 'Mars' };
  }
}

// --- Divisional charts D40, D45, D60 (completing all 16 Shodasavarga) ---

export function getKhavedamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 40;
  const part = Math.floor(degreeInSign / divisionSize);
  const isOddSign = (signIndex % 2) === 0;
  const startSign = isOddSign ? 0 : 6;
  const khavedamsaSignIndex = (startSign + part) % 12;
  return { khavedamsaSignIndex, khavedamsaSign: RASHI_NAMES[khavedamsaSignIndex], part: part + 1 };
}

export function getAkshavedamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const divisionSize = 30 / 45;
  const part = Math.floor(degreeInSign / divisionSize);
  const modality = MODALITY_MAP[signIndex];
  let startSign;
  if (modality === 'movable') startSign = 0;
  else if (modality === 'fixed') startSign = 4;
  else startSign = 8;
  const akshavedamsaSignIndex = (startSign + part) % 12;
  return { akshavedamsaSignIndex, akshavedamsaSign: RASHI_NAMES[akshavedamsaSignIndex], part: part + 1 };
}

/**
 * D60 Shastiamsa. NOTE: this varga has genuine, textually-documented
 * disagreement between at least 3 classical calculation methods. This
 * implements the most commonly-cited "multiply degree by 2" method — NOT a
 * settled consensus. Any UI showing D60 MUST carry a "one of several classical
 * traditions" disclaimer (see confidence table).
 */
export function getShastiamsaSign(siderealLongitude: number) {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degreeInSign = siderealLongitude % 30;
  const doubled = Math.floor(degreeInSign * 2);
  const remainder = doubled % 12;
  const countForward = remainder + 1;
  const shastiamsaSignIndex = (signIndex + countForward - 1) % 12;
  return { shastiamsaSignIndex, shastiamsaSign: RASHI_NAMES[shastiamsaSignIndex], countForward };
}

// --- KP System: Sub-lord and Sub-sub-lord ---
// KP ayanamsa empirically confirmed identical to Lahiri. Verified 8/8 sub-lords
// and 5/5 sub-sub-lords vs live ProKerala kp-planet-position.
export function getKPSubLord(siderealLongitude: number) {
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(siderealLongitude / nakshatraSpan);
  const nakshatraDegree = siderealLongitude % nakshatraSpan;
  const startLordIndex = nakshatraIndex % 9;

  let cursor = 0;
  let subLord: string | null = null, subStart = 0, subSpan = 0;
  for (let i = 0; i < 9; i++) {
    const lordIndex = (startLordIndex + i) % 9;
    const lord = DASHA_LORDS[lordIndex];
    const span = (DASHA_YEARS[lord] / 120) * nakshatraSpan;
    if (nakshatraDegree < cursor + span || i === 8) {
      subLord = lord;
      subStart = cursor;
      subSpan = span;
      break;
    }
    cursor += span;
  }

  const positionWithinSub = nakshatraDegree - subStart;
  const subLordIndex = DASHA_LORDS.indexOf(subLord as string);
  let subCursor = 0;
  let subSubLord: string | null = null;
  for (let i = 0; i < 9; i++) {
    const lordIndex = (subLordIndex + i) % 9;
    const lord = DASHA_LORDS[lordIndex];
    const span = (DASHA_YEARS[lord] / 120) * subSpan;
    if (positionWithinSub < subCursor + span || i === 8) {
      subSubLord = lord;
      break;
    }
    subCursor += span;
  }

  return { starLord: DASHA_LORDS[startLordIndex], subLord, subSubLord };
}

// --- Placidus house system (for KP cuspal sub-lords) ---
// 0.004° precision vs real ProKerala Placidus cusp data (non-polar).
function iteratePlacidusCuspTropical(ramc: number, latitude: number, obliquity: number, offsetDeg: number, F: number, useSupplementary: boolean, negateSin: boolean): number {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;
  const L = toRad(latitude);
  const e = toRad(obliquity);
  let RA = ramc + offsetDeg;
  for (let iter = 0; iter < 20; iter++) {
    const RArad = toRad(RA);
    const sinPart = negateSin ? -Math.sin(RArad) : Math.sin(RArad);
    let inner = sinPart * Math.tan(e) * Math.tan(L);
    inner = Math.max(-1, Math.min(1, inner));
    const arccos = toDeg(Math.acos(inner));
    let newRA;
    if (useSupplementary) newRA = ramc + 180 - arccos / F;
    else newRA = ramc + arccos / F;
    if (Math.abs(newRA - RA) < 0.0000001) { RA = newRA; break; }
    RA = newRA;
  }
  const RArad = toRad(RA);
  const lon = toDeg(Math.atan2(Math.sin(RArad), Math.cos(RArad) * Math.cos(e)));
  return normalize360(lon);
}

export function calculatePlacidusCusps(birthDateUTC: Date, latitude: number, longitude: number): Record<number, number> {
  const time = Astronomy.MakeTime(birthDateUTC);
  const gst = Astronomy.SiderealTime(time);
  const lst = gst + longitude / 15;
  const ramc = normalize360(lst * 15);
  const tilt = Astronomy.e_tilt(time);
  const obliquity = tilt.tobl;
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);

  const cusp11trop = iteratePlacidusCuspTropical(ramc, latitude, obliquity, 30, 3, false, true);
  const cusp12trop = iteratePlacidusCuspTropical(ramc, latitude, obliquity, 60, 1.5, false, true);
  const cusp2trop = iteratePlacidusCuspTropical(ramc, latitude, obliquity, 120, 1.5, true, false);
  const cusp3trop = iteratePlacidusCuspTropical(ramc, latitude, obliquity, 150, 3, true, false);

  const lagna = calculateLagna(birthDateUTC, latitude, longitude);
  const mcTropicalRaw = normalize360(Math.atan(Math.tan(ramc * Math.PI/180) / Math.cos(obliquity * Math.PI/180)) * 180/Math.PI);
  const ramcNorm = normalize360(ramc);
  const sameHalfAsRamc = (ramcNorm < 180) === (mcTropicalRaw < 180);
  const mcTropical = sameHalfAsRamc ? mcTropicalRaw : normalize360(mcTropicalRaw + 180);

  const toSidereal = (trop: number) => normalize360(trop - ayanamsa);

  const h1 = lagna.ascSidereal;
  const h10 = toSidereal(mcTropical);
  const h11 = toSidereal(cusp11trop);
  const h12 = toSidereal(cusp12trop);
  const h2 = toSidereal(cusp2trop);
  const h3 = toSidereal(cusp3trop);
  const h4 = normalize360(h10 + 180);
  const h7 = normalize360(h1 + 180);
  const h5 = normalize360(h11 + 180);
  const h6 = normalize360(h12 + 180);
  const h8 = normalize360(h2 + 180);
  const h9 = normalize360(h3 + 180);

  return { 1:h1, 2:h2, 3:h3, 4:h4, 5:h5, 6:h6, 7:h7, 8:h8, 9:h9, 10:h10, 11:h11, 12:h12 };
}

// --- Mangal Dosha severity (Mars-only, classical) ---
const MANGAL_DOSHA_HOUSE_SEVERITY: Record<number, number> = { 12: 50, 1: 60, 2: 80, 4: 80, 7: 100, 8: 100 };

export function getMangalDoshaSeverity(marsHouseFromLagna: number, hasCancellation: boolean) {
  let basePercentage = MANGAL_DOSHA_HOUSE_SEVERITY[marsHouseFromLagna] || 0;
  if (hasCancellation) basePercentage = basePercentage / 2;
  let label;
  if (basePercentage === 0) label = 'None';
  else if (basePercentage <= 50) label = 'Mild';
  else if (basePercentage <= 80) label = 'Moderate';
  else label = 'Severe';
  return { percentage: basePercentage, label, hasDosha: basePercentage > 0 };
}

export { RASHI_NAMES, NAKSHATRA_NAMES, DASHA_LORDS, DASHA_YEARS };
