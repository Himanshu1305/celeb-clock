/**
 * Shadbala — Kala Bala (Temporal Strength), all 9 sub-components. Ported from
 * scripts/vedic-lab/kalaBalaFinal.cjs (B.V. Raman Method B).
 *
 * Confidence: component-verified (Hora sequence, values 15/30/45/60 unanimous
 * across sources) → exact-match on sub-components. Yuddha Bala is a documented
 * simplification (fixed ±5, not disc-diameter ratios).
 */
import * as Astronomy from 'astronomy-engine';

function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }
const LAHIRI_J2000_DEG = 23.853222;
function getLahiriAyanamsa(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const precessionArcsec = 5029.0966 * T + 1.11161 * T * T - 0.000113 * T * T * T;
  return LAHIRI_J2000_DEG + precessionArcsec / 3600;
}
function getSunSiderealLongitude(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const vec = Astronomy.GeoVector('Sun' as Astronomy.Body, time, true);
  const tropicalLon = normalize360(Astronomy.Ecliptic(vec).elon);
  return normalize360(tropicalLon - getLahiriAyanamsa(date));
}

export function getPakshaBala(moonLon: number, sunLon: number, isBenefic: boolean): number {
  let diff = normalize360(moonLon - sunLon);
  if (diff > 180) diff = 360 - diff;
  const beneficBala = diff / 3;
  return isBenefic ? beneficBala : (60 - beneficBala);
}
const BENEFIC_PLANETS = ['Moon', 'Mercury', 'Jupiter', 'Venus'];

export function getNathonnataBala(hourOfDay: number, planet: string): number {
  const DAY_PLANETS = ['Sun', 'Jupiter', 'Venus'];
  if (planet === 'Mercury') return 60;
  let birthTimeDeg = hourOfDay * 15;
  if (birthTimeDeg > 180) birthTimeDeg = 360 - birthTimeDeg;
  if (DAY_PLANETS.includes(planet)) return birthTimeDeg / 3;
  return (180 - birthTimeDeg) / 3;
}

export function getTribhagaBala(hourOfDay: number, planet: string, sunriseHour: number, sunsetHour: number): number {
  if (planet === 'Jupiter') return 60;
  const dayLen = sunsetHour - sunriseHour;
  const isDayTime = hourOfDay >= sunriseHour && hourOfDay < sunsetHour;
  if (isDayTime) {
    const progress = (hourOfDay - sunriseHour) / dayLen;
    const third = Math.min(2, Math.floor(progress * 3));
    const dayLords = ['Mercury', 'Sun', 'Saturn'];
    return planet === dayLords[third] ? 60 : 0;
  } else {
    const nightLen = 24 - dayLen;
    const nightHour = hourOfDay >= sunsetHour ? hourOfDay - sunsetHour : hourOfDay + (24 - sunsetHour);
    const progress = nightHour / nightLen;
    const third = Math.min(2, Math.floor(progress * 3));
    const nightLords = ['Moon', 'Venus', 'Mars'];
    return planet === nightLords[third] ? 60 : 0;
  }
}

export function getAyanaBala(declination: number): number {
  const obliquity = 23.4500;
  return 60 * (obliquity + declination) / (2 * obliquity);
}
function getDeclination(planetName: string, time: Astronomy.AstroTime): number {
  const observer = new Astronomy.Observer(0, 0, 0);
  const equ = Astronomy.Equator(planetName as Astronomy.Body, time, observer, true, true);
  return equ.dec;
}

const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

function findSignIngressDate(birthDate: Date, targetDegree: number, searchDaysBack: number): Date {
  let low = new Date(birthDate.getTime() - searchDaysBack * 24 * 3600 * 1000);
  let high = new Date(birthDate.getTime());
  function isAtOrPastTarget(date: Date): boolean {
    const lon = getSunSiderealLongitude(date);
    if (targetDegree === 0) return lon < 30;
    return lon >= targetDegree;
  }
  for (let i = 0; i < 60; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    if (isAtOrPastTarget(mid)) high = mid; else low = mid;
  }
  return high;
}

export function getVaraBala(planet: string, localDayOfWeek: number): number {
  return planet === WEEKDAY_LORDS[localDayOfWeek] ? 45 : 0;
}

export function getMasaBala(planet: string, birthDateUTC: Date): number {
  const sunLon = getSunSiderealLongitude(birthDateUTC);
  const currentSignStart = Math.floor(sunLon / 30) * 30;
  const ingressDate = findSignIngressDate(birthDateUTC, currentSignStart, 40);
  const lord = WEEKDAY_LORDS[ingressDate.getUTCDay()];
  return planet === lord ? 30 : 0;
}

export function getVarshaBala(planet: string, birthDateUTC: Date): number {
  const ingressDate = findSignIngressDate(birthDateUTC, 0, 400);
  const lord = WEEKDAY_LORDS[ingressDate.getUTCDay()];
  return planet === lord ? 15 : 0;
}

export function getHoraBala(planet: string, birthHourDecimal: number, sunriseHourDecimal: number, localDayOfWeek: number): number {
  const startLord = WEEKDAY_LORDS[localDayOfWeek];
  const startIdx = CHALDEAN_ORDER.indexOf(startLord);
  let hoursSinceSunrise = birthHourDecimal - sunriseHourDecimal;
  if (hoursSinceSunrise < 0) hoursSinceSunrise += 24;
  const horaIndex = Math.floor(hoursSinceSunrise);
  const lord = CHALDEAN_ORDER[(startIdx + horaIndex) % 7];
  return planet === lord ? 60 : 0;
}

const WAR_PLANETS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
export function getYuddhaBala(planet: string, allPlanetLongitudes: Record<string, number>): number {
  if (!WAR_PLANETS.includes(planet)) return 0;
  for (const other of WAR_PLANETS) {
    if (other === planet) continue;
    let diff = Math.abs(allPlanetLongitudes[planet] - allPlanetLongitudes[other]);
    if (diff > 180) diff = 360 - diff;
    if (diff <= 1) {
      const winner = allPlanetLongitudes[planet] < allPlanetLongitudes[other] ? planet : other;
      return winner === planet ? 5 : -5;
    }
  }
  return 0;
}

export function getKalaBalaComplete(planet: string, birthDateUTC: Date, allPlanetLongitudes: Record<string, number>, sunriseHour: number, sunsetHour: number, localHour: number, localDayOfWeek: number) {
  const time = Astronomy.MakeTime(birthDateUTC);
  const declination = getDeclination(planet, time);
  const isBenefic = BENEFIC_PLANETS.includes(planet);

  const nathonnata = getNathonnataBala(localHour, planet);
  const paksha = getPakshaBala(allPlanetLongitudes.Moon, allPlanetLongitudes.Sun, isBenefic);
  const tribhaga = getTribhagaBala(localHour, planet, sunriseHour, sunsetHour);
  const ayana = getAyanaBala(declination);
  const vara = getVaraBala(planet, localDayOfWeek);
  const masa = getMasaBala(planet, birthDateUTC);
  const varsha = getVarshaBala(planet, birthDateUTC);
  const hora = getHoraBala(planet, localHour, sunriseHour, localDayOfWeek);
  const yuddha = getYuddhaBala(planet, allPlanetLongitudes);

  return {
    nathonnata, paksha, tribhaga, ayana, vara, masa, varsha, hora, yuddha,
    total: nathonnata + paksha + tribhaga + ayana + vara + masa + varsha + hora + yuddha,
  };
}
