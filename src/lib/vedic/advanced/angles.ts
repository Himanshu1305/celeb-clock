/**
 * Batch 10 — shared helpers for the Bhava Chalit / KP / Jaimini sections.
 *
 * Sidereal Ascendant and Midheaven (MC) from the SAME engine path the Kundali uses
 * (calculateLagna: apparent sidereal time + true obliquity, Lahiri). The MC is the
 * ecliptic point on the upper meridian: atan2(sin RAMC, cos RAMC · cos ε), i.e. the
 * same formula the engine uses for its polar check and its Placidus 10th cusp.
 */
import * as Astronomy from 'astronomy-engine';
import { calculateLagna, getLahiriAyanamsa, normalize360 } from '../engine/vedicEngine';

export const PLANETS_9 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
export type PlanetName = typeof PLANETS_9[number];

export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_SA = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
/** Classical sign lords (Parashari; Scorpio = Mars, Aquarius = Saturn). Index 0 = Aries. */
export const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

/** "Capricorn (Makara)" for a 0-based sign index. */
export const signName = (i: number) => `${SIGN_EN[i]} (${SIGN_SA[i]})`;

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Sidereal (Lahiri) Ascendant and MC in degrees 0–360. */
export function siderealAngles(birthUTC: Date, latitude: number, longitude: number): { asc: number; mc: number } {
  const time = Astronomy.MakeTime(birthUTC);
  const ramc = normalize360((Astronomy.SiderealTime(time) + longitude / 15) * 15);
  const obl = Astronomy.e_tilt(time).tobl * Math.PI / 180;
  const r = ramc * Math.PI / 180;
  const mcTrop = normalize360(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(obl)) * 180 / Math.PI);
  const ay = getLahiriAyanamsa(birthUTC);
  return { asc: calculateLagna(birthUTC, latitude, longitude).ascSidereal, mc: normalize360(mcTrop - ay) };
}

/** Forward arc a → b in degrees, 0 ≤ arc < 360. */
export const arc = (a: number, b: number) => normalize360(b - a);
/** True when x lies in the forward arc [a, b). */
export const inArc = (x: number, a: number, b: number) => arc(a, x) < arc(a, b);
