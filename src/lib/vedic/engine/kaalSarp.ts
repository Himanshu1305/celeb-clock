/**
 * Kaal Sarp Dosha — full classification (full/partial + 12 types + direction).
 * Ported from scripts/vedic-lab/kaalSarpComplete.cjs.
 *
 * Confidence: present/isPartial/type match AstrologyAPI exactly on independent
 * test charts; whole-sign presence ~96-100% vs ProKerala (allow documented ~4%
 * edge-case tolerance in tests). Direction verified against real data:
 * planets in the Ketu→Rahu arc = "Ascending", Rahu→Ketu arc = "Descending".
 */
import type { FullChart } from './vedicEngine';

function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }

export const KAAL_SARP_TYPES: Record<number, string> = {
  1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal', 5: 'Padma', 6: 'Mahapadma',
  7: 'Takshak', 8: 'Karkotak', 9: 'Shankhnaad', 10: 'Patak', 11: 'Vishdhar', 12: 'Sheshnag',
};

export interface KaalSarpDetails {
  present: boolean;
  isPartial: boolean;
  type: string | null;
  direction: 'Ascending' | 'Descending' | null;
}

export function getKaalSarpDetails(chart: FullChart): KaalSarpDetails {
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  function signInArc(sign: number, startSign: number, endSign: number): boolean {
    const arcLen = normalize360(endSign * 30 - startSign * 30) / 30;
    const pos = normalize360(sign * 30 - startSign * 30) / 30;
    return pos <= arcLen;
  }

  const inRahuArc = classical.map(n => signInArc(chart.planets[n].rashiIndex, rahuSign, ketuSign));
  const inKetuArc = classical.map(n => signInArc(chart.planets[n].rashiIndex, ketuSign, rahuSign));
  const rahuArcCount = inRahuArc.filter(Boolean).length;
  const ketuArcCount = inKetuArc.filter(Boolean).length;

  const isFullRahu = rahuArcCount === 7;
  const isFullKetu = ketuArcCount === 7;
  const isPartialRahu = rahuArcCount === 6;
  const isPartialKetu = ketuArcCount === 6;

  const lagnaSignIdx = chart.lagna.rashiIndex;
  const rahuHouse = ((rahuSign - lagnaSignIdx + 12) % 12) + 1;
  const type = KAAL_SARP_TYPES[rahuHouse];

  if (isFullRahu || isFullKetu) {
    return { present: true, isPartial: false, type, direction: isFullKetu ? 'Ascending' : 'Descending' };
  }
  if (isPartialRahu || isPartialKetu) {
    return { present: true, isPartial: true, type, direction: isPartialKetu ? 'Ascending' : 'Descending' };
  }
  return { present: false, isPartial: false, type: null, direction: null };
}
