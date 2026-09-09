/**
 * Shadbala — Sthana Bala (Positional Strength), all 5 sub-components + full
 * Panchadha Maitri. Ported from scripts/vedic-lab/sthanaBala.cjs.
 *
 * Confidence: ~94% accurate with a known small (~3.75-point) residual on
 * Saptavargaja Bala vs live AstrologyAPI — likely a proprietary detail. Tests
 * MUST use range/tolerance assertions, not exact-match, and UI copy MUST soften
 * to "indicative strength" (see confidence table).
 */

export const EXALTATION_DEG: Record<string, number> = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
export const DEBILITATION_DEG: Record<string, number> = {};
for (const p in EXALTATION_DEG) DEBILITATION_DEG[p] = (EXALTATION_DEG[p] + 180) % 360;

export const MOOLATRIKONA: Record<string, { min: number; max: number }> = {
  Sun: { min: 120, max: 140 }, Moon: { min: 34, max: 60 }, Mars: { min: 0, max: 12 },
  Mercury: { min: 166, max: 170 }, Jupiter: { min: 240, max: 250 }, Venus: { min: 180, max: 195 }, Saturn: { min: 300, max: 320 },
};
export const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10],
};
export const FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'], Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'],
};
export const ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'], Moon: [], Mars: ['Mercury'], Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon'], Saturn: ['Sun', 'Moon', 'Mars'],
};
export const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }

export function getUcchaBala(planet: string, siderealLongitude: number): number {
  let diff = siderealLongitude - DEBILITATION_DEG[planet];
  diff = normalize360(diff);
  if (diff > 180) diff = 360 - diff;
  return diff / 3;
}

function getSignDignityPoints(planet: string, signIndex: number, allowMoolatrikona: boolean, absoluteLongitude?: number): number {
  if (allowMoolatrikona && MOOLATRIKONA[planet] && absoluteLongitude !== undefined) {
    const mt = MOOLATRIKONA[planet];
    if (absoluteLongitude >= mt.min && absoluteLongitude <= mt.max) return 45;
  }
  if (OWN_SIGNS[planet] && OWN_SIGNS[planet].includes(signIndex)) return 30;
  const lord = SIGN_LORDS[signIndex];
  if (lord === planet) return 30;
  const isFriend = FRIENDS[planet] && FRIENDS[planet].includes(lord);
  const isEnemy = ENEMIES[planet] && ENEMIES[planet].includes(lord);
  if (isFriend) return 22.5;
  if (isEnemy) return 3.75;
  return 7.5;
}

export function getSaptavargajaBala(planet: string, rasiSign: number, horaSign: number, drekkanaSign: number, saptamsaSign: number, navamsaSign: number, dwadasamsaSign: number, trimsamsaSign: number, rasiAbsoluteLongitude: number): number {
  let total = 0;
  total += getSignDignityPoints(planet, rasiSign, true, rasiAbsoluteLongitude);
  total += getSignDignityPoints(planet, horaSign, false);
  total += getSignDignityPoints(planet, drekkanaSign, false);
  total += getSignDignityPoints(planet, saptamsaSign, false);
  total += getSignDignityPoints(planet, navamsaSign, false);
  total += getSignDignityPoints(planet, dwadasamsaSign, false);
  total += getSignDignityPoints(planet, trimsamsaSign, false);
  return total;
}

const MALE_PLANETS = ['Sun', 'Mars', 'Jupiter', 'Mercury', 'Saturn'];
export function getOjayugmaBala(planet: string, rasiSignIndex: number, navamsaSignIndex: number): number {
  const rasiIsOdd = (rasiSignIndex % 2) === 0;
  const navamsaIsOdd = (navamsaSignIndex % 2) === 0;
  const isMale = MALE_PLANETS.includes(planet);
  let points = 0;
  if (isMale) {
    if (rasiIsOdd) points += 15;
    if (navamsaIsOdd) points += 15;
  } else {
    if (!rasiIsOdd) points += 15;
    if (!navamsaIsOdd) points += 15;
  }
  return points;
}

export function getKendradiBala(house: number): number {
  if ([1, 4, 7, 10].includes(house)) return 60;
  if ([2, 5, 8, 11].includes(house)) return 30;
  return 15;
}

const FEMALE_PLANETS = ['Moon', 'Venus'];
const HERMAPHRODITE_PLANETS = ['Mercury', 'Saturn'];
export function getDrekkanaBala(planet: string, degreeInSign: number): number {
  const decanate = Math.floor(degreeInSign / 10);
  const isMale = MALE_PLANETS.includes(planet) && !HERMAPHRODITE_PLANETS.includes(planet);
  const isHermaphrodite = HERMAPHRODITE_PLANETS.includes(planet);
  const isFemale = FEMALE_PLANETS.includes(planet);
  if (isMale && decanate === 0) return 15;
  if (isHermaphrodite && decanate === 1) return 15;
  if (isFemale && decanate === 2) return 15;
  return 0;
}

// --- Panchadha Maitri (5-fold compound friendship) ---
const PANCHADHA_POINTS: Record<string, number> = { own: 30, moolatrikona: 45, greatFriend: 22.5, friend: 15, neutral: 7.5, enemy: 3.75, greatEnemy: 1.875 };
const TEMPORARY_FRIEND_HOUSES = [2, 3, 4, 10, 11, 12];

export function getTemporaryRelationship(planetSign: number, lordSign: number): string {
  const housesAway = ((lordSign - planetSign + 12) % 12) + 1;
  return TEMPORARY_FRIEND_HOUSES.includes(housesAway) ? 'friend' : 'enemy';
}

export function getPanchadhaMaitriTier(natural: string, temporary: string): string {
  if (natural === 'friend' && temporary === 'friend') return 'greatFriend';
  if (natural === 'friend' && temporary === 'enemy') return 'neutral';
  if (natural === 'neutral' && temporary === 'friend') return 'friend';
  if (natural === 'neutral' && temporary === 'enemy') return 'enemy';
  if (natural === 'enemy' && temporary === 'friend') return 'neutral';
  return 'greatEnemy';
}

type VargaMap = Record<string, Record<string, number>>;

function getSignDignityPointsPanchadha(planet: string, planetSign: number, allVargas: VargaMap, vargaName: string, allowMoolatrikona: boolean, absoluteLongitude: number): number {
  if (allowMoolatrikona && MOOLATRIKONA[planet]) {
    const mt = MOOLATRIKONA[planet];
    if (absoluteLongitude >= mt.min && absoluteLongitude <= mt.max) return PANCHADHA_POINTS.moolatrikona;
  }
  const lord = SIGN_LORDS[planetSign];
  if (lord === planet) return PANCHADHA_POINTS.own;

  const lordSignInThisVarga = allVargas[lord][vargaName];
  const natural = FRIENDS[planet]?.includes(lord) ? 'friend' : (ENEMIES[planet]?.includes(lord) ? 'enemy' : 'neutral');
  const temporary = getTemporaryRelationship(planetSign, lordSignInThisVarga);
  const tier = getPanchadhaMaitriTier(natural, temporary);
  return PANCHADHA_POINTS[tier];
}

export function getSaptavargajaBalaPanchadha(planet: string, allVargas: VargaMap, rasiAbsoluteLongitude: number): number {
  let total = 0;
  const vargaConfigs: Array<[string, boolean]> = [
    ['rasi', true], ['hora', false], ['drekkana', false], ['saptamsa', false],
    ['navamsa', false], ['dwadasamsa', false], ['trimsamsa', false],
  ];
  for (const [vargaName, allowMT] of vargaConfigs) {
    const sign = allVargas[planet][vargaName];
    total += getSignDignityPointsPanchadha(planet, sign, allVargas, vargaName, allowMT, rasiAbsoluteLongitude);
  }
  return total;
}
