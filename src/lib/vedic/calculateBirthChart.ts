/**
 * Engine-agnostic birth-chart interface (Part B1).
 *
 * calculateBirthChart() runs the validated local engine first and, only if the
 * local engine throws, falls back to an injected ProKerala provider. Polar
 * latitudes are still computed and their `warnings` passed through untouched
 * (they are surfaced, never silently normalized). The `source` field is for
 * internal debugging only.
 *
 * Pure/deterministic except for the `refDate` used for transit fields (Dasha,
 * Sade Sati), which defaults to `new Date()` but can be injected for tests.
 *
 * Confidence tolerances (tests + UI copy) are documented per-field in the
 * engine modules and in docs/BornClock_Prompt1_EngineIntegration_and_UX_v2.md.
 */
import {
  generateFullChart,
  getDasamsaSign,
  getShastiamsaSign,
  getHoraSign,
  getDrekkanaSign,
  getSaptamsaSign,
  getDwadasamsaSign,
  getTrimsamsaSign,
  getKPSubLord,
  getMangalDoshaSeverity,
  getLahiriAyanamsa,
  DASHA_LORDS,
  type ChartWarning,
  type FullChart,
} from './engine/vedicEngine';
import { getKaalSarpDetails, type KaalSarpDetails } from './engine/kaalSarp';
import {
  getUcchaBala, getSaptavargajaBalaPanchadha, getOjayugmaBala, getKendradiBala, getDrekkanaBala,
} from './engine/sthanaBala';
import { getKalaBalaComplete } from './engine/kalaBala';
import { getChestaBala } from './engine/chestaBala';
import { getDrikBala } from './engine/drikBala';

export interface BirthChartInput {
  year: number;
  month: number;   // 1-12
  day: number;     // 1-31
  hour: number;    // 0-23
  minute: number;  // 0-59
  latitude: number;   // -90..90
  longitude: number;  // -180..180
  timezoneOffset: number; // hours east of UTC, e.g. 5.5 for IST
}

export interface PlanetPosition {
  name: string;
  sign: string;
  signIndex: number; // 1-based
  house: number;     // 1-12
  longitude: number; // sidereal degrees
  degreeInSign: number;
  nakshatra: string;
  pada: number;
  navamsaSign: string;
  retrograde: boolean;
  combust?: boolean;
}

export interface CurrentDasha {
  mahadasha: string;
  mahadasha_start: string | null;
  mahadasha_end: string | null;
  antardasha: string;
  antardasha_start: string | null;
  antardasha_end: string | null;
}

export interface DivisionalCharts {
  /** D60 uses one of several classical methods — UI MUST show the disclaimer. */
  d60Method: string;
  d60Disclaimer: string;
  /** Per-planet sign in each varga (plus 'Lagna'). */
  d9: Record<string, string>;
  d10: Record<string, string>;
  d60: Record<string, string>;
}

export interface ShadbalaComponent {
  sthana: number;
  dig: number;
  kala: number;
  chesta: number;
  naisargika: number;
  drik: number;
  total: number;
}

export interface BirthChartResult {
  ayanamsa: number;
  lagna: { sign: string; signIndex: number; degrees: number; rashiIndex: number };
  planets: PlanetPosition[];
  /** Moon's nakshatra (the birth nakshatra). */
  nakshatra: { nakshatra: string; pada: number; lord: string };
  /** Moon's sign (chandra rasi). */
  rashi: string;
  currentDasha: CurrentDasha | null;
  doshas: {
    mangalDosha: { hasDosha: boolean; severityLabel: string; severityPercentage: number; fromLagna: boolean; fromMoon: boolean; fromVenus: boolean };
    kaalSarp: KaalSarpDetails;
    sadeSati: { active: boolean; phase: string | null; houseOfSaturnFromMoon: number };
  };
  divisionalCharts: DivisionalCharts;
  kp: Record<string, ReturnType<typeof getKPSubLord>>;
  shadbala?: Record<string, ShadbalaComponent>;
  /** Internal debugging only — which engine produced this chart. */
  source: 'local' | 'prokerala';
  warnings: ChartWarning[];
}

/** Thrown for invalid/malformed input — never a silently-wrong chart. */
export class BirthChartInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BirthChartInputError';
  }
}

export interface CalculateOptions {
  includeShadbala?: boolean;
  /** Reference instant for transit fields (Dasha/Sade Sati). Defaults to now. */
  refDate?: Date;
  /**
   * Fallback provider, used ONLY if the local engine throws. Receives the same
   * input and returns a full result (source will be tagged 'prokerala') or null.
   */
  prokeralaFallback?: (input: BirthChartInput) => Promise<BirthChartResult | null>;
}

const PLANET_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

const D60_DISCLAIMER =
  'The Shashtiamsa (D60) is calculated using one of several classical traditions; other schools compute it differently, so treat it as one interpretation rather than a settled result.';

// Naisargika (natural) Bala — fixed constants, 100% exact. Virupas.
const NAISARGIKA: Record<string, number> = {
  Sun: 60, Moon: 51.43, Venus: 42.85, Jupiter: 34.28, Mercury: 25.70, Mars: 17.14, Saturn: 8.57,
};

function isFiniteInt(v: number): boolean {
  return Number.isFinite(v) && Math.floor(v) === v;
}

function validateInput(input: BirthChartInput): void {
  if (!input || typeof input !== 'object') {
    throw new BirthChartInputError('Birth chart input is missing.');
  }
  const { year, month, day, hour, minute, latitude, longitude, timezoneOffset } = input;
  for (const [k, v] of Object.entries({ year, month, day, hour, minute })) {
    if (!isFiniteInt(v)) throw new BirthChartInputError(`Invalid or missing "${k}": expected an integer, got ${v}.`);
  }
  if (month < 1 || month > 12) throw new BirthChartInputError(`Invalid month: ${month} (expected 1-12).`);
  if (day < 1 || day > 31) throw new BirthChartInputError(`Invalid day: ${day} (expected 1-31).`);
  if (hour < 0 || hour > 23) throw new BirthChartInputError(`Invalid hour: ${hour} (expected 0-23).`);
  if (minute < 0 || minute > 59) throw new BirthChartInputError(`Invalid minute: ${minute} (expected 0-59).`);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new BirthChartInputError(`Invalid latitude: ${latitude} (expected -90..90).`);
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new BirthChartInputError(`Invalid longitude: ${longitude} (expected -180..180).`);
  }
  if (!Number.isFinite(timezoneOffset) || timezoneOffset < -14 || timezoneOffset > 14) {
    throw new BirthChartInputError(`Invalid timezoneOffset: ${timezoneOffset} (expected -14..14 hours).`);
  }
  // Reject non-existent calendar dates (e.g. Feb 29 in a non-leap year) rather
  // than silently rolling over to a wrong chart. Valid leap days pass.
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw new BirthChartInputError(`Invalid calendar date: ${year}-${month}-${day} does not exist.`);
  }
}

/** Local-time (year..minute at timezoneOffset) → UTC instant. */
function toBirthDateUTC(input: BirthChartInput): Date {
  const localMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0);
  return new Date(localMs - input.timezoneOffset * 3600 * 1000);
}

function nakshatraLord(nakshatraIndex: number): string {
  return DASHA_LORDS[nakshatraIndex % 9];
}

function buildDivisionalCharts(chart: FullChart): DivisionalCharts {
  const d9: Record<string, string> = {};
  const d10: Record<string, string> = {};
  const d60: Record<string, string> = {};
  for (const name of PLANET_ORDER) {
    const p = chart.planets[name];
    if (!p) continue;
    d9[name] = p.navamsaSign;
    d10[name] = getDasamsaSign(p.siderealLongitude).dasamsaSign;
    d60[name] = getShastiamsaSign(p.siderealLongitude).shastiamsaSign;
  }
  d9['Lagna'] = chart.lagna ? getNavamsaFromLon(chart.lagna.siderealLongitude) : '';
  d10['Lagna'] = getDasamsaSign(chart.lagna.siderealLongitude).dasamsaSign;
  d60['Lagna'] = getShastiamsaSign(chart.lagna.siderealLongitude).shastiamsaSign;
  return {
    d60Method: 'Parashari (degree × 2) — one of several classical traditions',
    d60Disclaimer: D60_DISCLAIMER,
    d9, d10, d60,
  };
}

// Small local navamsa helper for the Lagna longitude (planets already carry it).
import { getNavamsaSign } from './engine/vedicEngine';
function getNavamsaFromLon(lon: number): string {
  return getNavamsaSign(lon).navamsaSign;
}

/**
 * Assemble Shadbala per planet. NOTE the confidence spread: naisargika + dig are
 * exact; sthana ~94% (residual); chesta ~80% (modern-equivalent); kala uses a
 * fixed 06:00/18:00 sunrise/sunset approximation here (the lab used real
 * panchang sunrise). Consumers MUST soften copy accordingly. Gated behind
 * options.includeShadbala; never fails the chart if a component errors.
 */
function buildShadbala(chart: FullChart, birthDateUTC: Date, input: BirthChartInput): Record<string, ShadbalaComponent> {
  const seven = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const lons: Record<string, number> = {};
  for (const n of seven) lons[n] = chart.planets[n].siderealLongitude;

  // Varga map for Panchadha Maitri (sign indices, 0-based) across the 7 vargas.
  const vargas: Record<string, Record<string, number>> = {};
  for (const n of seven) {
    const lon = lons[n];
    vargas[n] = {
      rasi: Math.floor(lon / 30),
      hora: getHoraSign(lon).horaSignIndex,
      drekkana: getDrekkanaSign(lon).drekkanaSignIndex,
      saptamsa: getSaptamsaSign(lon).saptamsaSignIndex,
      navamsa: getNavamsaSign(lon).navamsaSignIndex,
      dwadasamsa: getDwadasamsaSign(lon).dwadasamsaSignIndex,
      trimsamsa: Math.floor(lon / 30), // D30 sign not exposed as index; rasi proxy
    };
  }

  const localHour = input.hour + input.minute / 60;
  const localDayOfWeek = new Date(Date.UTC(input.year, input.month - 1, input.day)).getUTCDay();
  const SUNRISE = 6, SUNSET = 18; // documented approximation

  const out: Record<string, ShadbalaComponent> = {};
  for (const n of seven) {
    const p = chart.planets[n];
    const lon = lons[n];
    const degInSign = lon % 30;

    // Sthana Bala (5 sub-components).
    const uccha = getUcchaBala(n, lon);
    const saptavargaja = safe(() => getSaptavargajaBalaPanchadha(n, vargas, lon), 0);
    const ojayugma = getOjayugmaBala(n, vargas[n].rasi, vargas[n].navamsa);
    const kendradi = getKendradiBala(p.house);
    const drekkanaBala = getDrekkanaBala(n, degInSign);
    const sthana = uccha + saptavargaja + ojayugma + kendradi + drekkanaBala;

    // Dig Bala — directional strength from the strongest-house cusp.
    const dig = digBala(n, p.house);

    // Kala Bala.
    const kala = safe(() => getKalaBalaComplete(n, birthDateUTC, lons, SUNRISE, SUNSET, localHour, localDayOfWeek).total, 0);

    // Chesta Bala (Sun/Moon substitute → null → 0 here; softened).
    const chesta = safe(() => getChestaBala(n, lon, birthDateUTC), 0) ?? 0;

    // Drik Bala.
    const drik = safe(() => getDrikBala(n, lon, lons), 0);

    const naisargika = NAISARGIKA[n] ?? 0;

    out[n] = {
      sthana: round2(sthana),
      dig: round2(dig),
      kala: round2(kala),
      chesta: round2(chesta),
      naisargika: round2(naisargika),
      drik: round2(drik),
      total: round2(sthana + dig + kala + chesta + naisargika + drik),
    };
  }
  return out;
}

// Dig Bala: each planet is strongest at a specific angle (house) and powerless
// 180° away. Strength = 60 × (distance from powerless house) / 6 houses.
const DIG_STRONG_HOUSE: Record<string, number> = {
  Jupiter: 1, Mercury: 1, Sun: 10, Mars: 10, Saturn: 7, Moon: 4, Venus: 4,
};
function digBala(planet: string, house: number): number {
  const strong = DIG_STRONG_HOUSE[planet];
  if (!strong) return 0;
  const powerless = ((strong + 6 - 1) % 12) + 1;
  let dist = Math.abs(house - powerless);
  if (dist > 6) dist = 12 - dist;
  return 60 * dist / 6;
}

function safe<T>(fn: () => T, fallback: T): T {
  try { const v = fn(); return v === null || v === undefined ? fallback : v; } catch { return fallback; }
}
function round2(n: number): number { return Math.round(n * 100) / 100; }

function toResult(chart: FullChart, source: 'local' | 'prokerala', includeShadbala: boolean, birthDateUTC: Date, input: BirthChartInput): BirthChartResult {
  const moon = chart.planets.Moon;
  const planets: PlanetPosition[] = PLANET_ORDER.map((name) => {
    const p = chart.planets[name];
    return {
      name,
      sign: p.rashi,
      signIndex: p.rashiIndex + 1,
      house: p.house,
      longitude: p.siderealLongitude,
      degreeInSign: round2(p.rashiDegree),
      nakshatra: p.nakshatra,
      pada: p.pada,
      navamsaSign: p.navamsaSign,
      retrograde: p.retrograde,
      combust: p.combust,
    };
  });

  const marsHouse = chart.planets.Mars.house;
  const severity = getMangalDoshaSeverity(marsHouse, false);

  const dasha = chart.currentMahadasha ? {
    mahadasha: chart.currentMahadasha.lord,
    mahadasha_start: chart.currentMahadasha.start,
    mahadasha_end: chart.currentMahadasha.end,
    antardasha: chart.currentAntardasha ? chart.currentAntardasha.lord : '',
    antardasha_start: chart.currentAntardasha ? chart.currentAntardasha.start : null,
    antardasha_end: chart.currentAntardasha ? chart.currentAntardasha.end : null,
  } : null;

  const result: BirthChartResult = {
    ayanamsa: chart.ayanamsa,
    lagna: { sign: chart.lagna.rashi, signIndex: chart.lagna.rashiIndex + 1, degrees: round2(chart.lagna.rashiDegree), rashiIndex: chart.lagna.rashiIndex },
    planets,
    nakshatra: { nakshatra: moon.nakshatra, pada: moon.pada, lord: nakshatraLord(moon.nakshatraIndex) },
    rashi: moon.rashi,
    currentDasha: dasha,
    doshas: {
      mangalDosha: {
        hasDosha: chart.doshas.mangalDosha.hasDosha,
        severityLabel: severity.label,
        severityPercentage: severity.percentage,
        fromLagna: chart.doshas.mangalDosha.fromLagna,
        fromMoon: chart.doshas.mangalDosha.fromMoon,
        fromVenus: chart.doshas.mangalDosha.fromVenus,
      },
      kaalSarp: getKaalSarpDetails(chart),
      sadeSati: chart.doshas.sadeSati,
    },
    divisionalCharts: buildDivisionalCharts(chart),
    kp: {
      Lagna: getKPSubLord(chart.lagna.siderealLongitude),
      ...Object.fromEntries(PLANET_ORDER.map((n) => [n, getKPSubLord(chart.planets[n].siderealLongitude)])),
    },
    source,
    warnings: chart.warnings,
  };

  if (includeShadbala) {
    result.shadbala = safe(() => buildShadbala(chart, birthDateUTC, input), undefined as any);
  }
  return result;
}

/**
 * Compute a full birth chart. Local engine first; ProKerala fallback (if
 * injected) only on local-engine error. Throws BirthChartInputError for invalid
 * input — never returns a silently-wrong chart.
 */
export async function calculateBirthChart(
  input: BirthChartInput,
  options: CalculateOptions = {},
): Promise<BirthChartResult> {
  validateInput(input);
  const birthDateUTC = toBirthDateUTC(input);
  const refDate = options.refDate ?? new Date();
  const includeShadbala = !!options.includeShadbala;

  try {
    // Polar latitudes are still computed here; generateFullChart populates
    // `warnings` with POLAR_LATITUDE and we pass it through untouched.
    const chart = generateFullChart(birthDateUTC, refDate, input.latitude, input.longitude);
    return toResult(chart, 'local', includeShadbala, birthDateUTC, input);
  } catch (localErr) {
    if (options.prokeralaFallback) {
      const fb = await options.prokeralaFallback(input);
      if (fb) return { ...fb, source: 'prokerala' };
    }
    throw localErr;
  }
}

export { getLahiriAyanamsa };
