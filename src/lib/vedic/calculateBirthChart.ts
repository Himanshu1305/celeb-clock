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
  getLahiriAyanamsa,
  calculatePlacidusCusps,
  RASHI_NAMES,
  DASHA_LORDS,
  type ChartWarning,
  type FullChart,
} from './engine/vedicEngine';
import { getKaalSarpDetails, type KaalSarpDetails } from './engine/kaalSarp';
import { assessManglik, MANGLIK_CONVENTION } from './manglik';
import {
  getUcchaBala, getSaptavargajaBalaPanchadha, getOjayugmaBala, getKendradiBala, getDrekkanaBala,
} from './engine/sthanaBala';
import { getKalaBalaComplete, getSunHourAngle, getYuddhaBalaAll, type VedicDay } from './engine/kalaBala';
import { sunriseSunset } from './panchangDay';
import { getChestaBala } from './engine/chestaBala';
import { getDrikBala } from './engine/drikBala';
import { detectYogas, type YogaResult } from './yogas';
import { buildShodashvarga, type ShodashvargaChart } from './engine/shodashvarga';
import { buildBirthTimeEdges, type BirthTimeEdge } from './engine/birthTimeEdge';
import { buildYoginiDasha, type YoginiDashaResult } from './engine/yoginiDasha';
import { computeAshtakavarga, type AshtakavargaResult } from './engine/ashtakavarga';

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
  // Pratyantardasha (Part X) — 3rd Dasha level. ADVANCED-VIEW / chat only; never woven
  // into the main plain-language reading narrative this session.
  pratyantardasha?: string | null;
  pratyantardasha_start?: string | null;
  pratyantardasha_end?: string | null;
}

/** One Antardasha (sub-period) — ISO date strings. */
export interface AntardashaPeriod {
  lord: string;
  start: string;
  end: string;
}
/** One Mahadasha with its nested Antardashas — the full-lifetime timeline (Part D-Fix3). */
export interface MahadashaPeriod {
  lord: string;
  start: string;
  end: string;
  antardashas: AntardashaPeriod[];
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
  /** Full-lifetime Vimshottari timeline (9 Mahadashas × 9 Antardashas). Part D-Fix3. */
  dashaTimeline?: MahadashaPeriod[];
  doshas: {
    /** Manglik by the AstroSage convention (Lagna + Moon; houses 1/4/7/8/12) — see manglik.ts. */
    mangalDosha: {
      hasDosha: boolean; severityLabel: 'None' | 'Low' | 'High';
      fromLagna: boolean; fromMoon: boolean;
      marsHouseFromLagna: number; marsHouseFromMoon: number;
      cancellations: string[]; cancelled: boolean; convention: string;
    };
    kaalSarp: KaalSarpDetails;
    sadeSati: { active: boolean; phase: string | null; houseOfSaturnFromMoon: number };
  };
  divisionalCharts: DivisionalCharts;
  /** Batch 7 W3: all sixteen BPHS vargas (D1…D60) with ±5-minute birth-time sensitivity. */
  shodashvarga?: ShodashvargaChart[];
  /** Batch 8: Lagna (±5 / ±15 min) and Moon Rashi / Nakshatra (±5 min) birth-time edges. */
  birthTimeEdges?: BirthTimeEdge[];
  /** Batch 10: Yogini Dasha (8 Yoginis, 36-year cycle) — Mahadasha list; Antardashas derived on demand. */
  yoginiDasha?: YoginiDashaResult;
  /** Batch 10: Bhinnashtakavarga (7 planets, by sign) + Sarvashtakavarga (BPHS ch. 66). */
  ashtakavarga?: AshtakavargaResult;
  kp: Record<string, ReturnType<typeof getKPSubLord>>;
  shadbala?: Record<string, ShadbalaComponent>;
  /** Internal debugging only — which engine produced this chart. */
  source: 'local' | 'prokerala';
  warnings: ChartWarning[];
  /** Detected classical Yogas (present ones, graded). Part G. */
  yogas?: YogaResult[];
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
 * Assemble Shadbala per planet (audit K11 rework, Oct 2026 — BPHS ch. 27, with B.V.
 * Raman's "Graha and Bhava Balas" where BPHS is terse). Uses the REAL local sunrise,
 * sunset and next sunrise of the birth day (panchangDay.sunriseSunset), apparent solar
 * time for Nathonnata, true declination rules for Ayana, the classical Chesta Kendra,
 * ¼(benefic − malefic) Drik Bala, the true Trimsamsa (D30) sign, and Dig Bala measured
 * from the real Ascendant / Midheaven. The Sun's Chesta = its Ayana Bala and the Moon's
 * Chesta = its Paksha Bala (BPHS 27.18). Verified against Raman's worked example and
 * PyJHora on the 10-person panel (see __tests__/shadbalaBphs.test.ts). Gated behind
 * options.includeShadbala; never fails the chart if a component errors.
 */
export function getVedicDay(birthDateUTC: Date, input: BirthChartInput): VedicDay {
  const tz = input.timezoneOffset;
  const civil = new Date(Date.UTC(input.year, input.month - 1, input.day));
  let ss = sunriseSunset(civil, input.latitude, input.longitude, tz);
  if (birthDateUTC.getTime() < ss.rise.getTime()) {
    // Born before sunrise → still the previous Vedic day.
    ss = sunriseSunset(new Date(civil.getTime() - 86400000), input.latitude, input.longitude, tz);
  }
  const weekday = new Date(ss.rise.getTime() + tz * 3600000).getUTCDay();
  return { sunriseUTC: ss.rise, sunsetUTC: ss.set, nextSunriseUTC: ss.nextRise, weekday };
}

function angDist(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

function buildShadbala(chart: FullChart, birthDateUTC: Date, input: BirthChartInput): Record<string, ShadbalaComponent> {
  const seven = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const lons: Record<string, number> = {};
  const trop: Record<string, number> = {};
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);
  for (const n of seven) {
    lons[n] = chart.planets[n].siderealLongitude;
    trop[n] = (lons[n] + ayanamsa) % 360;
  }

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
      trimsamsa: RASHI_NAMES.indexOf(getTrimsamsaSign(lon).trimsamsaSign),
    };
  }

  const day = getVedicDay(birthDateUTC, input);
  const kalaInput = {
    birthUTC: birthDateUTC,
    localDate: { year: input.year, month: input.month, day: input.day },
    sunHourAngleHours: getSunHourAngle(birthDateUTC, input.latitude, input.longitude),
    day,
    siderealLongitudes: lons,
    tropicalLongitudes: trop,
  };

  // Dig Bala reference points: real Ascendant and Midheaven (sidereal).
  const asc = chart.lagna.siderealLongitude;
  const mc = safe(() => calculatePlacidusCusps(birthDateUTC, input.latitude, input.longitude)[10], (asc + 270) % 360);

  type Parts = { sthana: number; dig: number; kala: number; uptoHora: number; chesta: number; drik: number };
  const parts: Record<string, Parts> = {};
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

    const dig = digBala(n, lon, asc, mc);

    const kalaParts = safe(() => getKalaBalaComplete(n, kalaInput), null as ReturnType<typeof getKalaBalaComplete> | null);

    // Chesta: Sun = Ayana Bala, Moon = Paksha Bala (BPHS 27.18); others = Chesta Kendra.
    const chesta = n === 'Sun' ? (kalaParts?.ayana ?? 0)
      : n === 'Moon' ? (kalaParts?.paksha ?? 0)
      : (safe(() => getChestaBala(n, trop[n], birthDateUTC), 0) ?? 0);

    const drik = safe(() => getDrikBala(n, lon, lons), 0);
    parts[n] = { sthana, dig, kala: kalaParts ? kalaParts.total : 0, uptoHora: kalaParts ? kalaParts.uptoHora : 0, chesta, drik };
  }

  // Yuddha Bala (BPHS 27.20) — part of Kala Bala, needs all planets' strengths.
  const preWar: Record<string, number> = {};
  for (const n of seven) preWar[n] = parts[n].sthana + parts[n].dig + parts[n].uptoHora;
  const yuddha = safe(() => getYuddhaBalaAll(lons, preWar), {} as Record<string, number>);

  const out: Record<string, ShadbalaComponent> = {};
  for (const n of seven) {
    const { sthana, dig, chesta, drik } = parts[n];
    const kala = parts[n].kala + (yuddha[n] ?? 0);
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

// Dig Bala (BPHS 27.6–7): arc from the planet's powerless point ÷ 3 (0–60). Powerless
// points: Sun & Mars — the 4th cusp (IC); Moon & Venus — the 10th (MC); Jupiter &
// Mercury — the 7th (Descendant); Saturn — the 1st (Ascendant). The old code used
// whole house numbers (steps of 10 virupas) instead of the real angles.
export function digBala(planet: string, lon: number, asc: number, mc: number): number {
  const powerless: Record<string, number> = {
    Sun: mc + 180, Mars: mc + 180, Moon: mc, Venus: mc, Jupiter: asc + 180, Mercury: asc + 180, Saturn: asc,
  };
  const pt = powerless[planet];
  if (pt === undefined) return 0;
  return angDist(lon, pt) / 3;
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

  const manglik = assessManglik({
    lagnaSignIndex: chart.lagna.rashiIndex,
    moonSignIndex: chart.planets.Moon.rashiIndex,
    marsSignIndex: chart.planets.Mars.rashiIndex,
    jupiterSignIndex: chart.planets.Jupiter.rashiIndex,
    venusSignIndex: chart.planets.Venus.rashiIndex,
  });

  const dasha = chart.currentMahadasha ? {
    mahadasha: chart.currentMahadasha.lord,
    mahadasha_start: chart.currentMahadasha.start,
    mahadasha_end: chart.currentMahadasha.end,
    antardasha: chart.currentAntardasha ? chart.currentAntardasha.lord : '',
    antardasha_start: chart.currentAntardasha ? chart.currentAntardasha.start : null,
    antardasha_end: chart.currentAntardasha ? chart.currentAntardasha.end : null,
    pratyantardasha: chart.currentPratyantardasha ? chart.currentPratyantardasha.lord : null,
    pratyantardasha_start: chart.currentPratyantardasha ? chart.currentPratyantardasha.start : null,
    pratyantardasha_end: chart.currentPratyantardasha ? chart.currentPratyantardasha.end : null,
  } : null;

  const result: BirthChartResult = {
    ayanamsa: chart.ayanamsa,
    lagna: { sign: chart.lagna.rashi, signIndex: chart.lagna.rashiIndex + 1, degrees: round2(chart.lagna.rashiDegree), rashiIndex: chart.lagna.rashiIndex },
    planets,
    nakshatra: { nakshatra: moon.nakshatra, pada: moon.pada, lord: nakshatraLord(moon.nakshatraIndex) },
    rashi: moon.rashi,
    currentDasha: dasha,
    dashaTimeline: (chart as any).fullDashaTimeline,
    doshas: {
      mangalDosha: {
        hasDosha: manglik.hasDosha,
        severityLabel: manglik.level,
        fromLagna: manglik.fromLagna.present,
        fromMoon: manglik.fromMoon.present,
        marsHouseFromLagna: manglik.fromLagna.house,
        marsHouseFromMoon: manglik.fromMoon.house,
        cancellations: manglik.cancellations,
        cancelled: manglik.cancelled,
        convention: MANGLIK_CONVENTION,
      },
      kaalSarp: getKaalSarpDetails(chart),
      sadeSati: chart.doshas.sadeSati,
    },
    divisionalCharts: buildDivisionalCharts(chart),
    shodashvarga: safe(() => buildShodashvarga(
      birthDateUTC, input.latitude, input.longitude,
      { Lagna: chart.lagna.siderealLongitude, ...Object.fromEntries(PLANET_ORDER.map(n => [n, chart.planets[n].siderealLongitude])) },
    ), undefined as any),
    birthTimeEdges: safe(() => buildBirthTimeEdges(
      birthDateUTC, input.latitude, input.longitude,
      { Lagna: chart.lagna.siderealLongitude, Moon: chart.planets.Moon.siderealLongitude },
    ), [] as BirthTimeEdge[]),
    yoginiDasha: safe(() => buildYoginiDasha(birthDateUTC, chart.planets.Moon.siderealLongitude), undefined as any),
    ashtakavarga: safe(() => computeAshtakavarga({
      Lagna: chart.lagna.rashiIndex,
      ...Object.fromEntries(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map(n => [n, chart.planets[n].rashiIndex])),
    } as any), undefined as any),
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
  // Detected classical Yogas (Part G) — fast rule-checking on the computed chart.
  // Shadbala (if present) lets the grading reflect delivery strength.
  result.yogas = safe(() => detectYogas(result), []);
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
