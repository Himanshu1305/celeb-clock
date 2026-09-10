/**
 * Deeper Career Analysis report (Part I.12, paid-depth feature).
 *
 * Extends the decisive-but-bounded method to career specifically, combining the
 * already-validated engines: 10th house + its lord's placement/strength, the
 * Dasamsa (D10) career varga, career-relevant Yogas (Part G: Raj Yoga, Budha-Aditya,
 * Pancha Mahapurusha), and career-timing windows (D-Fix3, generalised significators).
 * Fully DETERMINISTIC — no LLM — so every fact and date is exact by construction.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';
import { categoryTiming, describeWindow, type ActivationWindow } from './yogaTiming';

const CAREER_YOGAS = ['Raj Yoga', 'Budha-Aditya', 'Ruchaka', 'Bhadra', 'Hamsa', 'Malavya', 'Sasa', 'Dhana'];
const strengthWord = (cat?: string) => (cat === 'strong' ? 'strong' : cat === 'weak' ? 'gentle' : 'moderately strong');

export interface CareerReport {
  tenthHouse: { sign: string; lord: string; lordSign: string; lordHouse: number; lordStrength: string; analysis: string };
  occupants: Array<{ planet: string; strength: string }>;
  dasamsa: { tenthLordD10: string; sunD10: string; lagnaD10: string | null; analysis: string };
  yogas: Array<{ name: string; grade: string; summary: string }>;
  timing: { significators: string[]; windows: Array<{ describe: string; range: string; status: string }>; next: string | null; note: string };
  verdict: string;
  disclaimer: string;
}

export function buildCareerReport(chart: BirthChartResult, now: Date = new Date()): CareerReport {
  const lagnaIdx = chart.lagna.rashiIndex;
  const RASHI = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  const tenthSignIdx = (lagnaIdx + 9) % 12;
  const tenthSign = RASHI[tenthSignIdx];
  const lord = SIGN_LORDS[tenthSignIdx];
  const byName: Record<string, BirthChartResult['planets'][number]> = {};
  for (const p of chart.planets) byName[p.name] = p;
  const lordP = byName[lord];
  const lordStrengthCat = chart.shadbala?.[lord] ? (() => { const t = chart.shadbala![lord].total; const req = 300; return t >= req ? 'strong' : t >= req * 0.75 ? 'moderate' : 'weak'; })() : undefined;
  const lordStrength = strengthWord(lordStrengthCat);

  const occupants = chart.planets.filter(p => p.house === 10).map(p => ({
    planet: p.name, strength: strengthWord(chart.shadbala?.[p.name] ? (chart.shadbala[p.name].total >= 300 ? 'strong' : chart.shadbala[p.name].total >= 225 ? 'moderate' : 'weak') : undefined),
  }));

  const tenthAnalysis = `Your 10th house of career and public standing is ${tenthSign}, ruled by ${lord}. ${lord} sits in your ${ordinal(lordP?.house ?? 10)} house in ${lordP?.sign ?? tenthSign} with ${lordStrength} strength — so your professional direction is shaped most by where ${lord} operates${occupants.length ? `, with ${occupants.map(o => o.planet).join(' and ')} placed directly in the 10th adding ${occupants.length > 1 ? 'their' : 'its'} tone.` : '.'}`;

  const d10 = chart.divisionalCharts.d10 || {};
  const dasamsa = {
    tenthLordD10: d10[lord] || '—', sunD10: d10.Sun || '—', lagnaD10: d10.Lagna || null,
    analysis: `In the Dasamsa (D10), the dedicated career chart, your 10th lord ${lord} falls in ${d10[lord] || '—'} and the Sun (the natural significator of career and authority) in ${d10.Sun || '—'}. The D10 refines the career promise of the main chart and is weighed as one classical layer, not the whole verdict.`,
  };

  const yogas = (chart.yogas || []).filter(y => CAREER_YOGAS.some(c => y.name.includes(c))).map(y => ({ name: y.name, grade: y.grade, summary: y.summary }));

  const t = categoryTiming(chart, 'career', now);
  const up = t.windows.filter(w => w.status !== 'past').slice(0, 3);
  const timing = {
    significators: t.significators,
    windows: up.map(w => ({ describe: describeWindow(w), range: fmtRange(w), status: w.status })),
    next: t.next ? describeWindow(t.next) : null,
    note: 'Career-timing windows are the classical activation periods (10th-house lord and any planet in the 10th) from your Vimshottari Dasha — real date ranges framed as likelihood, never a guarantee.',
  };

  // Decisive-but-bounded verdict synthesised from the real data.
  const strongYoga = yogas.find(y => y.grade === 'full' || y.grade === 'strong');
  const verdict = [
    `Reading these together: with a ${lordStrength} 10th lord ${lord} in your ${ordinal(lordP?.house ?? 10)} house${occupants.length ? ` and ${occupants.map(o => o.planet).join('/')} in the 10th` : ''}, your chart leans toward ${careerLean(lord, lordP?.house ?? 10)}.`,
    strongYoga ? `The ${strongYoga.name} (${strongYoga.grade}) is genuine supporting evidence for rise in standing.` : yogas.length ? `Career-relevant Yogas are present but at a moderate/partial grade, so treat them as support rather than a promise.` : `No strong career-specific Yoga stands out, so steady effort matters more than a single chart promise here.`,
    t.next ? `Your strongest upcoming professional window is your ${describeWindow(t.next)} — the classically most supported period for a move.` : `Your strongest career windows are not in the near future; steady consolidation suits the current period.`,
  ].join(' ');

  return {
    tenthHouse: { sign: tenthSign, lord, lordSign: lordP?.sign ?? tenthSign, lordHouse: lordP?.house ?? 10, lordStrength, analysis: tenthAnalysis },
    occupants, dasamsa, yogas, timing, verdict,
    disclaimer: 'This is a classical, evidence-based reading of career tendencies and timing — a decision-support layer, not a guarantee or a substitute for your own judgement. Dates are real computed Dasha windows describing when classical support is highest, not fixed outcomes.',
  };
}

function ordinal(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function fmtRange(w: ActivationWindow): string { const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; const f = (iso: string) => { const d = new Date(iso); return `${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }; return `${f(w.start)} – ${f(w.end)}`; }
function careerLean(lord: string, house: number): string {
  const byLord: Record<string, string> = { Sun: 'authority, government or leadership roles', Moon: 'public-facing, caring or fluid roles', Mars: 'engineering, defence, surgery or driven independent work', Mercury: 'communication, analysis, commerce or writing', Jupiter: 'teaching, advisory, law or finance', Venus: 'creative, relational, design or luxury fields', Saturn: 'structured, service, labour or long-haul institutional work' };
  const byHouse: Record<number, string> = { 1: 'self-driven, front-line work', 3: 'communication and self-effort', 6: 'service, competition and problem-solving', 7: 'partnership and client-facing work', 9: 'ethics, teaching and long-distance connections', 10: 'visible authority and status', 11: 'networks and large organisations' };
  return `${byLord[lord] || 'its natural fields'}${byHouse[house] ? `, expressed through ${byHouse[house]}` : ''}`;
}
