/**
 * Map what BornClock's detectors actually return to remedy entries, so every page
 * that shows a finding can show its "What this means / What you can do" block.
 * Pure functions — no fetching — so they are easy to test.
 */
import type { L10n, PlanetName } from './types';
import { planetRemedyKey, remedyByKey } from './catalog';
import { PLANET_BASE } from './planets';
import {
  computeGrahanDosha, computeMoolDosha, computePitraDosha, doshaInputFromKundali,
} from '../moreDoshas';

export interface Finding {
  /** Remedy-entry key in REMEDIES. */
  key: string;
  /** Short line saying what was found, e.g. "Mangal Dosha (Low)". */
  label: L10n;
}

/** Sidereal sign of debilitation, 1-based (1 = Aries). Classical (BPHS). */
const DEBIL_SIGN_1: Partial<Record<PlanetName, number>> = {
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1,
};
const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];

const isPlanet = (n: string): n is PlanetName => n in PLANET_BASE;

export interface KundaliLike {
  planets?: Array<{ name: string; signIndex: number; house: number; longitude: number }>;
  nakshatra?: { nakshatra: string; pada: number };
  dasha?: { mahadasha: string; antardasha?: string } | null;
  doshas?: {
    mangalDosha?: { hasDosha: boolean; severityLabel?: string; cancelled?: boolean };
    kaalSarp?: { present: boolean; isPartial?: boolean };
    sadeSati?: { active: boolean; houseOfSaturnFromMoon?: number };
  };
}

/** Every finding in an /api/kundali result that has a remedy entry. */
export function findingsFromKundali(data: KundaliLike): Finding[] {
  const out: Finding[] = [];
  const md = data.doshas?.mangalDosha;
  if (md?.hasDosha) {
    out.push({ key: 'manglik', label: {
      en: `Mangal Dosha (${md.severityLabel ?? 'present'})${md.cancelled ? ' — classically cancelled in your chart' : ''}`,
      hi: `मंगल दोष (${md.severityLabel === 'High' ? 'उच्च' : md.severityLabel === 'Low' ? 'निम्न' : 'उपस्थित'})${md.cancelled ? ' — आपकी कुंडली में शास्त्रीय परिहार लागू' : ''}`,
    } });
  }
  // Founder decision: only FULL Kaal Sarp counts as present.
  if (data.doshas?.kaalSarp?.present && !data.doshas.kaalSarp.isPartial) {
    out.push({ key: 'kaalSarp', label: { en: 'Kaal Sarp Dosha (full)', hi: 'कालसर्प दोष (पूर्ण)' } });
  }
  const ss = data.doshas?.sadeSati;
  if (ss?.active) out.push({ key: 'sadeSati', label: { en: 'Sade Sati is running now', hi: 'साढ़ेसाती अभी चल रही है' } });
  else if (ss && (ss.houseOfSaturnFromMoon === 4 || ss.houseOfSaturnFromMoon === 8)) {
    out.push({ key: 'dhaiya', label: {
      en: `Shani Dhaiya is running now (Saturn ${ss.houseOfSaturnFromMoon}th from your Moon)`,
      hi: `शनि ढैया अभी चल रही है (चंद्र से ${ss.houseOfSaturnFromMoon}वें शनि)`,
    } });
  }

  const input = doshaInputFromKundali(data as Parameters<typeof doshaInputFromKundali>[0]);
  if (input) {
    const pitra = computePitraDosha(input);
    if (pitra.present) out.push({ key: 'pitra', label: { en: `Pitra Dosha (${pitra.grade})`, hi: `पितृ दोष (${gradeHi(pitra.grade)})` } });
    const grahan = computeGrahanDosha(input);
    if (grahan.present) out.push({ key: 'grahan', label: { en: `Grahan Dosha (${grahan.grade})`, hi: `ग्रहण दोष (${gradeHi(grahan.grade)})` } });
    const mool = computeMoolDosha(input);
    if (mool.present) out.push({ key: 'mool', label: { en: `Born in ${mool.nakshatra}, a gandamool nakshatra`, hi: `${mool.nakshatra} में जन्म — गंडमूल नक्षत्र` } });
  }

  const lord = data.dasha?.mahadasha;
  if (lord && isPlanet(lord)) {
    out.push({ key: planetRemedyKey(lord), label: { en: `${PLANET_BASE[lord].name.en} Mahadasha is running`, hi: `${PLANET_BASE[lord].name.hi} की महादशा चल रही है` } });
  }
  for (const p of data.planets ?? []) {
    if (!isPlanet(p.name)) continue;
    const d = DEBIL_SIGN_1[p.name];
    if (d && p.signIndex === d && !out.some(f => f.key === planetRemedyKey(p.name))) {
      out.push({ key: planetRemedyKey(p.name), label: {
        en: `${PLANET_BASE[p.name].name.en} is in ${SIGN_EN[d - 1]}, its sign of debilitation (often cancelled — Neecha Bhanga)`,
        hi: `${PLANET_BASE[p.name].name.hi} ${SIGN_HI[d - 1]} में — नीच राशि (प्रायः नीच भंग से निरस्त)`,
      } });
    }
  }
  return out.filter(f => remedyByKey(f.key));
}

function gradeHi(g: string): string {
  return g === 'strong' ? 'प्रबल' : g === 'moderate' ? 'मध्यम' : g === 'mild' ? 'हल्का' : g;
}

/** Matching doshas that are present AND not cancelled, plus a one-sided Manglik. */
export function findingsFromMatch(
  doshas: Array<{ name: string; present: boolean; cancelled: boolean }>,
  manglikStatus?: string | null,
): Finding[] {
  const map: Record<string, { key: string; label: L10n }> = {
    'Nadi Dosha': { key: 'nadi', label: { en: 'Nadi Dosha (not cancelled)', hi: 'नाड़ी दोष (निरस्त नहीं)' } },
    'Bhakoot Dosha': { key: 'bhakoot', label: { en: 'Bhakoot Dosha', hi: 'भकूट दोष' } },
    'Gana Dosha': { key: 'gana', label: { en: 'Gana Dosha (not cancelled)', hi: 'गण दोष (निरस्त नहीं)' } },
  };
  const out: Finding[] = [];
  for (const d of doshas) {
    if (d.present && !d.cancelled && map[d.name]) out.push(map[d.name]);
  }
  if (manglikStatus === 'one-sided') out.push({ key: 'manglik', label: { en: 'Manglik in one chart only', hi: 'केवल एक कुंडली में मांगलिक' } });
  return out;
}
