/**
 * Shadbala — Kala Bala (Temporal Strength), 9 sub-components.
 *
 * Audit K11 rework (Oct 2026). Rules follow Brihat Parashara Hora Shastra ch. 27
 * ("BPHS 27.n" below); where BPHS is terse or ambiguous we follow B.V. Raman,
 * "Graha and Bhava Balas" (the worked example on 16 Oct 1918, 14:22:16 IST,
 * 13°N 77°35'E is used as a regression test). What changed vs the old port:
 *   - the day is the REAL local day: actual sunrise/sunset/next sunrise are passed in
 *     (no more fixed 06:00/18:00), the weekday is the weekday of the sunrise that
 *     began the Vedic day (a birth before sunrise belongs to the previous day), and
 *     horas are counted from that sunrise;
 *   - Nathonnata uses apparent solar time (the Sun's hour angle), "measured from
 *     midnight" (BPHS 27.8), not the clock hour;
 *   - Ayana Bala uses each planet's own direction rule (BPHS 27.16–17): north
 *     declination helps the Sun, Mars, Jupiter, Venus; south helps the Moon and
 *     Saturn; Mercury always counts it as a gain. Formula (24° + kranti) × 60/48 with
 *     kranti from the classical 24° table (Raman's Table of declinations);
 *   - Paksha Bala: the Moon, Jupiter, Venus (and an unafflicted Mercury) take
 *     elongation/3, malefics 60 minus that (BPHS 27.10–11);
 *   - Abda (year) and Masa (month) lords use the Ahargana count (BPHS / Raman,
 *     Table I) instead of the solar-ingress weekday.
 * The Sun's Chesta = its Ayana Bala and the Moon's Chesta = its Paksha Bala (BPHS
 * 27.18) — those are added in calculateBirthChart (Chesta), not doubled here.
 * Yuddha Bala now uses the BPHS 27.20 strength-difference ÷ disc-diameter rule.
 */
import * as Astronomy from 'astronomy-engine';

function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }
const DEG = Math.PI / 180;

export const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

/** The real local day the birth falls in (Vedic day = sunrise to next sunrise). */
export interface VedicDay {
  sunriseUTC: Date;      // the sunrise that began the Vedic day of birth
  sunsetUTC: Date;       // that day's sunset
  nextSunriseUTC: Date;  // the sunrise that ends it
  weekday: number;       // 0 = Sunday … weekday of sunriseUTC in local time
}

/**
 * Benefic / malefic split used for Paksha and Drik Bala.
 *  - Jupiter, Venus: benefic. Sun, Mars, Saturn: malefic.
 *  - Moon: benefic when waxing, malefic when waning (P.V.R. Narasimha Rao's rule, the
 *    one that reproduces Raman's worked Drik Bala example). For PAKSHA Bala the Moon
 *    always takes the benefic formula — BPHS 27.11 lists her with the benefics.
 *  - Mercury: benefic when alone or with more benefics in his sign; malefic when with
 *    more malefics (Raman, Hindu Predictive Astrology; his Shadbala example treats
 *    Mercury conjunct the Sun as malefic). A tie goes to the nearer planet.
 */
export function beneficMap(lons: Record<string, number>): Record<string, boolean> {
  const elong = normalize360(lons.Moon - lons.Sun);
  const moonBenefic = elong < 180;
  const out: Record<string, boolean> = {
    Sun: false, Mars: false, Saturn: false, Jupiter: true, Venus: true, Moon: moonBenefic,
  };
  const mSign = Math.floor(lons.Mercury / 30);
  const near = (p: string) => { let d = Math.abs(lons[p] - lons.Mercury); if (d > 180) d = 360 - d; return d; };
  const withMerc = ['Sun', 'Moon', 'Mars', 'Jupiter', 'Venus', 'Saturn'].filter(p => Math.floor(lons[p] / 30) === mSign);
  const ben = withMerc.filter(p => out[p]);
  const mal = withMerc.filter(p => !out[p]);
  if (ben.length === mal.length) {
    if (ben.length === 0) out.Mercury = true;
    else {
      const nb = Math.min(...ben.map(near)), nm = Math.min(...mal.map(near));
      out.Mercury = nb <= nm;
    }
  } else out.Mercury = ben.length > mal.length;
  return out;
}

/** Elongation-based Paksha Bala (0–60). BPHS 27.10–11. */
export function getPakshaBala(moonLon: number, sunLon: number, isBenefic: boolean): number {
  let diff = normalize360(moonLon - sunLon);
  if (diff > 180) diff = 360 - diff;
  const beneficBala = diff / 3;
  return isBenefic ? beneficBala : (60 - beneficBala);
}

/**
 * Nathonnata (Divaratri) Bala. `sunHourAngleHours` is the Sun's local hour angle
 * (0 = apparent noon, 12 = apparent midnight). Sun, Jupiter, Venus peak (60) at noon;
 * Moon, Mars, Saturn peak at midnight; Mercury always 60. BPHS 27.8–9.
 */
export function getNathonnataBala(sunHourAngleHours: number, planet: string): number {
  if (planet === 'Mercury') return 60;
  const ha = ((sunHourAngleHours % 24) + 24) % 24;
  const hoursFromMidnight = Math.abs(12 - ha); // 0 at midnight, 12 at noon
  const diva = hoursFromMidnight * 5;
  if (['Sun', 'Jupiter', 'Venus'].includes(planet)) return diva;
  return 60 - diva;
}

/** Sun's hour angle (hours, 0–24) at the birth place — apparent solar time. */
export function getSunHourAngle(birthDateUTC: Date, latitude: number, longitude: number): number {
  return Astronomy.HourAngle(Astronomy.Body.Sun, Astronomy.MakeTime(birthDateUTC), new Astronomy.Observer(latitude, longitude, 0));
}

/** Tribhaga Bala with the REAL day/night: thirds of the day go to Mercury, Sun,
 * Saturn; thirds of the night to Moon, Venus, Mars; Jupiter always 60. */
export function getTribhagaBala(planet: string, birthUTC: Date, day: VedicDay): number {
  if (planet === 'Jupiter') return 60;
  const t = birthUTC.getTime();
  const rise = day.sunriseUTC.getTime(), set = day.sunsetUTC.getTime(), next = day.nextSunriseUTC.getTime();
  if (t < set) {
    const third = Math.min(2, Math.max(0, Math.floor(((t - rise) / (set - rise)) * 3)));
    return planet === ['Mercury', 'Sun', 'Saturn'][third] ? 60 : 0;
  }
  const third = Math.min(2, Math.max(0, Math.floor(((t - set) / (next - set)) * 3)));
  return planet === ['Moon', 'Venus', 'Mars'][third] ? 60 : 0;
}

/**
 * Kranti (declination of the ecliptic point) from the TROPICAL longitude, using the
 * classical 24° obliquity of the Indian tables (Raman's declination table:
 * 362′, 703′, 1002′, 1238′, 1388′, 1440′ for 15°…90° — i.e. asin(sin 24° · sin λ)).
 */
export function getKranti(tropicalLongitude: number): number {
  return Math.asin(Math.sin(24 * DEG) * Math.sin(tropicalLongitude * DEG)) / DEG;
}

/** Ayana Bala (0–60) from tropical longitude. BPHS 27.15–17: (24 ± kranti) × 60/48. */
export function getAyanaBala(planet: string, tropicalLongitude: number): number {
  const k = getKranti(tropicalLongitude);
  let signed: number;
  if (planet === 'Mercury') signed = Math.abs(k);
  else if (planet === 'Moon' || planet === 'Saturn') signed = -k;
  else signed = k; // Sun, Mars, Jupiter, Venus — north declination is a gain
  return (24 + signed) * 1.25;
}

export function getVaraBala(planet: string, day: VedicDay): number {
  return planet === WEEKDAY_LORDS[day.weekday] ? 45 : 0;
}

/** Hora Bala: equal 1-hour horas counted from the sunrise of the Vedic day (Raman). */
export function getHoraBala(planet: string, birthUTC: Date, day: VedicDay): number {
  const horaIndex = Math.floor((birthUTC.getTime() - day.sunriseUTC.getTime()) / 3600000);
  const startIdx = CHALDEAN_ORDER.indexOf(WEEKDAY_LORDS[day.weekday]);
  const lord = CHALDEAN_ORDER[(startIdx + Math.max(0, horaIndex)) % 7];
  return planet === lord ? 60 : 0;
}

// --- Abda / Masa lords by Ahargana (BPHS 27.12–13; Raman, Graha & Bhava Balas Table I) ---
const ABDA_MASA_LORDS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Sun', 'Moon'];
function isLeap(y: number): boolean { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
/**
 * Reduced Ahargana for a LOCAL civil date: Raman's Table I value at the end of 1951
 * (174) plus the civil days elapsed since. Only its residues mod 360·7 and 30·7 matter.
 * Verified against both published worked examples (Raman 1918: year lord Saturn,
 * month lord Mercury; V.P. Jain 1981: Mars, Mars).
 */
export function getAhargana(year: number, month: number, day: number): number {
  let d = 174;
  if (year - 1 >= 1951) for (let y = 1952; y <= year - 1; y++) d += isLeap(y) ? 366 : 365;
  else for (let y = year; y < 1952; y++) d -= isLeap(y) ? 366 : 365;
  const doy = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000) + 1;
  return d + doy;
}
const mod = (a: number, n: number) => ((a % n) + n) % n;
export function getAbdaLord(year: number, month: number, day: number): string {
  const a = getAhargana(year, month, day);
  return ABDA_MASA_LORDS[mod(Math.floor(a / 360) * 3 + 1, 7)];
}
export function getMasaLord(year: number, month: number, day: number): string {
  const a = getAhargana(year, month, day);
  return ABDA_MASA_LORDS[mod(Math.floor(a / 30) * 2 + 1, 7)];
}

// --- Yuddha Bala (planetary war), BPHS 27.20 ---
const WAR_PLANETS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
/** Apparent disc diameters (Surya Siddhanta values as used by Raman / V.P. Jain). */
const DISC_DIAMETER: Record<string, number> = { Mars: 9.4, Mercury: 6.6, Jupiter: 190.4, Venus: 16.6, Saturn: 158.0 };
/**
 * Two of Mars…Saturn within 1° are at war. The difference of their strengths
 * (Sthana + Dig + Kala up to Hora, i.e. before Ayana and Yuddha) divided by the
 * difference of their disc diameters is added to the winner and taken from the loser.
 * Winner = the planet with the smaller longitude (the convention of V.P. Jain's worked
 * example, where Jupiter at 170.45° beats Mercury at 170.51° by 0.76 virupa).
 */
export function getYuddhaBalaAll(lons: Record<string, number>, preWarStrength: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of WAR_PLANETS) out[p] = 0;
  for (let i = 0; i < WAR_PLANETS.length; i++) {
    for (let j = i + 1; j < WAR_PLANETS.length; j++) {
      const a = WAR_PLANETS[i], b = WAR_PLANETS[j];
      if (lons[a] === undefined || lons[b] === undefined) continue;
      const fwd = normalize360(lons[b] - lons[a]); // how far b is ahead of a
      if (Math.min(fwd, 360 - fwd) > 1) continue;
      const winner = fwd <= 180 ? a : b;
      const loser = winner === a ? b : a;
      const v = Math.abs((preWarStrength[a] ?? 0) - (preWarStrength[b] ?? 0)) / Math.abs(DISC_DIAMETER[a] - DISC_DIAMETER[b]);
      out[winner] += v;
      out[loser] -= v;
    }
  }
  return out;
}

export interface KalaBalaInput {
  birthUTC: Date;
  /** Local civil birth date (for the Ahargana year/month lords). */
  localDate: { year: number; month: number; day: number };
  sunHourAngleHours: number;
  day: VedicDay;
  siderealLongitudes: Record<string, number>;
  tropicalLongitudes: Record<string, number>;
}

export function getKalaBalaComplete(planet: string, k: KalaBalaInput) {
  const lons = k.siderealLongitudes;
  const benefic = beneficMap(lons);
  const nathonnata = getNathonnataBala(k.sunHourAngleHours, planet);
  // BPHS 27.11: the Moon is counted with the benefics for Paksha Bala.
  const paksha = getPakshaBala(lons.Moon, lons.Sun, planet === 'Moon' ? true : benefic[planet]);
  const tribhaga = getTribhagaBala(planet, k.birthUTC, k.day);
  const ayana = getAyanaBala(planet, k.tropicalLongitudes[planet]);
  const vara = getVaraBala(planet, k.day);
  const { year, month, day } = k.localDate;
  const masa = getMasaLord(year, month, day) === planet ? 30 : 0;
  const varsha = getAbdaLord(year, month, day) === planet ? 15 : 0;
  const hora = getHoraBala(planet, k.birthUTC, k.day);
  // Yuddha needs every planet's other strengths, so calculateBirthChart adds it.
  const uptoHora = nathonnata + paksha + tribhaga + varsha + masa + vara + hora;
  return {
    nathonnata, paksha, tribhaga, ayana, vara, masa, varsha, hora, uptoHora,
    total: uptoHora + ayana,
  };
}
