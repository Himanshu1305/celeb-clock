/**
 * Ranked best-suited career fields — Growth P2 (P2-3, improvements GP2-CAREER-RANKED).
 *
 * Extends the deterministic career report with a ranked list of fields and
 * "approach with care" fields, scored from the real chart: each planet's
 * Shadbala strength, plus bonuses for ruling the 10th, sitting in the 10th,
 * appearing strongly in the Dasamsa (D10), and taking part in a career Yoga.
 * No LLM, no template — every field's placement is earned from the data.
 * Graded strong/moderate/mild (Rule 7); a decision-support layer, not a verdict.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';

const RASHI = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

// Career fields each planet classically signifies.
const PLANET_FIELDS: Record<string, string[]> = {
  Sun: ['Government & civil service', 'Leadership & management', 'Medicine', 'Politics'],
  Moon: ['Public-facing & hospitality', 'Nursing & caregiving', 'Food & beverages', 'Psychology & counselling'],
  Mars: ['Engineering & technical trades', 'Defence, police & security', 'Surgery', 'Sports & athletics'],
  Mercury: ['Writing, media & communication', 'Accounting & finance ops', 'IT & software', 'Commerce & trading'],
  Jupiter: ['Teaching & academia', 'Law & judiciary', 'Finance & advisory', 'Counselling & spirituality'],
  Venus: ['Arts, design & fashion', 'Entertainment & music', 'Luxury, beauty & hospitality', 'Diplomacy & relations'],
  Saturn: ['Administration & operations', 'Law, labour & social service', 'Mining, construction & real estate', 'Research & long-haul institutions'],
};

export interface CareerFieldRank {
  field: string;
  planet: string;
  grade: 'strong' | 'moderate' | 'mild';
  reason: string;
}

export interface CareerFieldsResult {
  ranked: CareerFieldRank[];        // best-suited, high → low
  approachWithCare: CareerFieldRank[]; // fields of the weakest significators
  note: string;
}

const CAREER_YOGA_PLANETS: Record<string, string[]> = {
  Ruchaka: ['Mars'], Bhadra: ['Mercury'], Hamsa: ['Jupiter'], Malavya: ['Venus'], Sasa: ['Saturn'],
  'Budha-Aditya': ['Mercury', 'Sun'],
};

function shadbalaScore(chart: BirthChartResult, planet: string): number {
  const t = chart.shadbala?.[planet]?.total;
  return typeof t === 'number' ? t : 250; // neutral fallback if unavailable
}

export function rankCareerFields(chart: BirthChartResult): CareerFieldsResult {
  const lagnaIdx = chart.lagna.rashiIndex;
  const tenthSignIdx = (lagnaIdx + 9) % 12;
  const tenthLord = SIGN_LORDS[tenthSignIdx];
  const byName: Record<string, BirthChartResult['planets'][number]> = {};
  for (const p of chart.planets) byName[p.name] = p;

  const d10 = chart.divisionalCharts?.d10 || {};
  const yogaPlanets = new Set<string>();
  for (const y of chart.yogas || []) {
    for (const [name, planets] of Object.entries(CAREER_YOGA_PLANETS)) {
      if (y.name.includes(name) && (y.grade === 'full' || y.grade === 'strong' || y.grade === 'moderate')) {
        planets.forEach(pl => yogaPlanets.add(pl));
      }
    }
  }

  const planetScore: Record<string, { score: number; reasons: string[] }> = {};
  for (const planet of Object.keys(PLANET_FIELDS)) {
    const reasons: string[] = [];
    let score = shadbalaScore(chart, planet); // base ~150..450 virupas
    const sb = chart.shadbala?.[planet]?.total;
    if (typeof sb === 'number') reasons.push(`${planet} is ${sb >= 300 ? 'strong' : sb >= 225 ? 'moderately strong' : 'gentle'} by Shadbala`);
    if (planet === tenthLord) { score += 120; reasons.push('rules your 10th house of career'); }
    const p = byName[planet];
    if (p?.house === 10) { score += 100; reasons.push('sits in your 10th house'); }
    if (p?.house === 1 || p?.house === 11) { score += 40; reasons.push(`is placed in your ${p.house === 1 ? '1st (self)' : '11th (gains)'} house`); }
    if (d10[planet] && byName[tenthLord] && d10[planet] === d10[tenthLord]) { score += 60; reasons.push('joins your 10th lord in the D10 career chart'); }
    if (yogaPlanets.has(planet)) { score += 80; reasons.push('takes part in a career Yoga'); }
    planetScore[planet] = { score, reasons };
  }

  const ordered = Object.entries(planetScore).sort((a, b) => b[1].score - a[1].score);
  const maxScore = ordered[0][1].score;
  const minScore = ordered[ordered.length - 1][1].score;

  const grade = (s: number): CareerFieldRank['grade'] => {
    const rel = (s - minScore) / Math.max(1, maxScore - minScore);
    return rel >= 0.66 ? 'strong' : rel >= 0.33 ? 'moderate' : 'mild';
  };

  // Top 3 significators → their fields, ranked.
  const ranked: CareerFieldRank[] = [];
  for (const [planet, info] of ordered.slice(0, 3)) {
    for (const field of PLANET_FIELDS[planet]) {
      ranked.push({ field, planet, grade: grade(info.score), reason: `${planet} — ${info.reasons.join('; ')}.` });
    }
  }

  // Weakest significator's fields → approach with care.
  const [weakPlanet, weakInfo] = ordered[ordered.length - 1];
  const approachWithCare: CareerFieldRank[] = PLANET_FIELDS[weakPlanet].slice(0, 3).map(field => ({
    field, planet: weakPlanet, grade: 'mild' as const,
    reason: `${weakPlanet} is the gentlest career significator in your chart (${weakInfo.reasons.join('; ')}) — these fields are workable but ask for more conscious effort and support.`,
  }));

  return {
    ranked,
    approachWithCare,
    note: 'Fields are ranked from your three strongest career significators (by Shadbala strength plus their involvement with your 10th house, the D10 career chart, and any career Yogas). This is decision-support from the classical significations — a lean, never a limit on what you can do.',
  };
}
