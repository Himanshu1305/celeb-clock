/**
 * Batch 10 — KP (Krishnamurti Paddhati) tables.
 *
 * Ayanamsa: the Krishnamurti (KP) ayanamsa as defined in the Swiss Ephemeris
 * (SE_SIDM_KRISHNAMURTI, mode 5). Measured with pyswisseph 2.10.03 over 1900–2100, it is a
 * constant 348.67″ (5′48.7″) smaller than Swiss SE_SIDM_LAHIRI (both use the same precession
 * model; see scratchpad b10ckj/scripts/ay.py). The site's Lahiri is Swiss mean Lahiri + 24.4″
 * (calibrated to Drik Panchang — see engine/vedicEngine.ts), so
 *     KP ayanamsa = site Lahiri − (24.4″ + 348.67″).
 * This is the classic KP value (often called "KP old"); the separate "KP New" / Newcomb
 * variants are NOT used.
 *
 * Houses: Placidus cusps (the engine's calculatePlacidusCusps, which is Lahiri) shifted to
 * the KP ayanamsa. A KP house runs from its cusp to the next cusp.
 * Lords: sign lord, star (nakshatra) lord, sub lord and sub-sub lord — the engine's
 * getKPSubLord (Vimshottari proportions inside each 13°20′ nakshatra).
 * Significators: the standard four levels, strongest first —
 *   L1 planets in the star of an occupant, L2 occupants, L3 planets in the star of the
 *   house's sign lord, L4 the sign lord of the cusp. (Some KP astrologers also let Rahu/Ketu
 *   act for the planets they sit with or the lord of their sign; that extra rule is not applied.)
 * Rahu/Ketu are the mean nodes, as everywhere on the site.
 *
 * Verified (advanced/__tests__/kp.test.ts) against an independent Python implementation
 * on Swiss Ephemeris: swe.houses_ex(…, 'P') + calc_ut with SE_SIDM_KRISHNAMURTI.
 */
import { calculatePlacidusCusps, getKPSubLord, getSiderealLongitude, normalize360, DASHA_LORDS, DASHA_YEARS } from '../engine/vedicEngine';
import { PLANETS_9, SIGN_LORD, inArc, type PlanetName } from './angles';

/** Swiss SE_SIDM_LAHIRI − SE_SIDM_KRISHNAMURTI (arc-seconds; constant to ±0.001″ 1900–2100). */
export const SWISS_LAHIRI_MINUS_KP_ARCSEC = 348.668;
/** Site Lahiri − Swiss mean Lahiri (arc-seconds; engine/vedicEngine.ts). */
export const SITE_LAHIRI_MINUS_SWISS_ARCSEC = 24.4;
/** Add this to a site (Lahiri) sidereal longitude to get the KP sidereal longitude. */
export const KP_SHIFT_DEG = (SWISS_LAHIRI_MINUS_KP_ARCSEC + SITE_LAHIRI_MINUS_SWISS_ARCSEC) / 3600;

export interface KpLords { sign: string; star: string; sub: string; subSub: string }
export interface KpCusp extends KpLords {
  house: number; longitude: number;
  /** Within 30″ of a sub boundary: our cusps agree with Swiss Ephemeris to ~20″, so the sub
   *  lord here could legitimately read either way between programs. */
  nearBoundary: boolean;
  /** Sub lord differs if the birth time is 2 minutes earlier or later. */
  timeSensitive: boolean;
}
export interface KpPlanet extends KpLords { name: PlanetName; longitude: number; house: number; nearBoundary: boolean }
export interface KpSignificators { house: number; L1: PlanetName[]; L2: PlanetName[]; L3: PlanetName[]; L4: string[] }
export interface KpTables { cusps: KpCusp[]; planets: KpPlanet[]; significators: KpSignificators[] }

export function kpLords(lon: number): KpLords {
  const l = normalize360(lon);
  const k = getKPSubLord(l);
  return { sign: SIGN_LORD[Math.floor(l / 30)], star: k.starLord, sub: k.subLord as string, subSub: k.subSubLord as string };
}

const kpCuspLongitudes = (birthUTC: Date, latitude: number, longitude: number) => {
  const plac = calculatePlacidusCusps(birthUTC, latitude, longitude);
  return Array.from({ length: 12 }, (_, i) => normalize360(plac[i + 1] + KP_SHIFT_DEG));
};

let SUB_STARTS: number[] | null = null;
/** Distance (degrees) from a longitude to the nearest sign/star/sub boundary of the 249 table. */
export function distanceToSubBoundary(lon: number): number {
  SUB_STARTS ??= kpSubTable().map(r => r.start);
  const l = normalize360(lon);
  return Math.min(...SUB_STARTS.map(b => Math.min(Math.abs(l - b), 360 - Math.abs(l - b))));
}
const EDGE_DEG = 30 / 3600;

export function computeKp(birthUTC: Date, latitude: number, longitude: number): KpTables {
  const cuspLon = kpCuspLongitudes(birthUTC, latitude, longitude);
  const TWO_MIN = 2 * 60 * 1000;
  const early = kpCuspLongitudes(new Date(birthUTC.getTime() - TWO_MIN), latitude, longitude);
  const late = kpCuspLongitudes(new Date(birthUTC.getTime() + TWO_MIN), latitude, longitude);
  const cusps: KpCusp[] = cuspLon.map((c, i) => {
    const l = kpLords(c);
    return {
      house: i + 1, longitude: c, ...l,
      nearBoundary: distanceToSubBoundary(c) < EDGE_DEG,
      timeSensitive: kpLords(early[i]).sub !== l.sub || kpLords(late[i]).sub !== l.sub,
    };
  });
  const houseOf = (L: number) => { for (let i = 0; i < 12; i++) if (inArc(L, cuspLon[i], cuspLon[(i + 1) % 12])) return i + 1; return 1; };
  const planets: KpPlanet[] = PLANETS_9.map(name => {
    const L = normalize360(getSiderealLongitude(name, birthUTC) + KP_SHIFT_DEG);
    return { name, longitude: L, house: houseOf(L), ...kpLords(L), nearBoundary: distanceToSubBoundary(L) < EDGE_DEG };
  });
  const starOf = Object.fromEntries(planets.map(p => [p.name, p.star])) as Record<PlanetName, string>;
  const significators: KpSignificators[] = cusps.map(c => {
    const occupants = planets.filter(p => p.house === c.house).map(p => p.name);
    const owner = c.sign;
    return {
      house: c.house,
      L1: PLANETS_9.filter(n => occupants.includes(starOf[n] as PlanetName)),
      L2: occupants,
      L3: PLANETS_9.filter(n => starOf[n] === owner),
      L4: [owner],
    };
  });
  return { cusps, planets, significators };
}

/**
 * The KP "249 subs" table: the zodiac cut wherever the sign, the star lord or the sub lord
 * changes (27 nakshatras × 9 subs = 243, plus 6 subs split by a sign boundary = 249).
 */
export function kpSubTable(): Array<{ start: number; end: number; sign: string; star: string; sub: string }> {
  const span = 360 / 27;
  const cuts = new Set<number>();
  for (let s = 0; s < 12; s++) cuts.add(s * 30);
  for (let n = 0; n < 27; n++) {
    let cur = n * span;
    const i0 = n % 9;
    for (let k = 0; k < 9; k++) {
      cuts.add(Math.round(cur * 1e9) / 1e9);
      cur += span * DASHA_YEARS[DASHA_LORDS[(i0 + k) % 9]] / 120;
    }
  }
  const pts = [...cuts].filter(p => p < 360 - 1e-9).sort((a, b) => a - b);
  return pts.map((p, i) => {
    const l = kpLords(p + 1e-7);
    return { start: p, end: i + 1 < pts.length ? pts[i + 1] : 360, sign: l.sign, star: l.star, sub: l.sub };
  });
}
