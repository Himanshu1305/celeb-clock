/**
 * Reading/prediction prompt construction, fact extraction, and content-safety
 * scanning for the Vedic reading UX (Part D; specificity overhaul in Part D-Fix).
 *
 * Part D-Fix goal: readings must be genuinely chart-SPECIFIC (name the actual
 * houses, house-lords, planet placements, Navamsa signs, Shadbala strength and
 * current Dasha-lord placement for THIS chart) — not generic astrology prose —
 * while keeping every Part D safety/tone rule. This file now:
 *   1. extracts the full validated data set (house lords, all 9 planets incl.
 *      combust + Navamsa + Shadbala category, Dasha-lord placement), and
 *   2. builds prompts that REQUIRE specific facts per section + forbid generic
 *      phrasing. The anti-hallucination + specificity CHECKS live in
 *      readingSpecificity.ts (paired: specific but WRONG is worse than generic).
 */
import type { BirthChartResult } from './calculateBirthChart';
import { RASHI_NAMES } from './engine/vedicEngine';
import { SIGN_LORDS } from './engine/sthanaBala';

export interface PlanetFact {
  planet: string; sign: string; house: number;
  retrograde: boolean; combust: boolean; navamsa: string;
  shadbala?: { total: number; category: 'strong' | 'moderate' | 'weak' };
}
export interface HouseLordFact {
  house: number; sign: string; lord: string; lordSign: string; lordHouse: number;
}

export interface ReadingFacts {
  rashi: string;
  nakshatra: { name: string; pada: number; lord: string };
  lagna: string;
  dasha: { maha: string; antar: string } | null;
  /** All 9 grahas — sign, house, retrograde, combust, Navamsa, Shadbala. */
  planets: PlanetFact[];
  /** Back-compat subset for the existing UI (VedicReading advanced/degraded view). */
  placements: Array<{ planet: string; sign: string; house: number; retrograde: boolean }>;
  /** Whole-sign house lords for the houses the reading references. */
  houseLords: HouseLordFact[];
  /** The current Mahadasha lord's own placement + strength in THIS chart. */
  dashaLord: { planet: string; sign: string; house: number; shadbalaCategory?: string } | null;
  doshas: {
    mangal: { present: boolean; severityLabel: string; cause: string | null };
    kaalSarp: { present: boolean; isPartial: boolean; type: string | null };
    sadeSati: { active: boolean; phase: string | null };
  };
  divisional: { d9: Record<string, string>; d10: Record<string, string>; d60: Record<string, string>; d10Sun: string; d60Moon: string; d60Disclaimer: string; navamsaMoon: string; navamsaVenus: string };
  warnings: Array<{ code: string; message: string }>;
  fieldsUsed: Record<string, string[]>;
}

// Classical minimum required Shadbala (Ishta) in Virupas (Rupas × 60). Used only
// to bucket strong/moderate/weak. Shadbala is an INDICATIVE score (Part B
// confidence table: ~94% Sthana, ~80% Chesta), so the prompt must hedge it.
const REQUIRED_SHADBALA: Record<string, number> = { Sun: 300, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 390, Venus: 330, Saturn: 300 };
function shadbalaCategory(planet: string, total: number): 'strong' | 'moderate' | 'weak' {
  const req = REQUIRED_SHADBALA[planet];
  if (!req) return 'moderate';
  if (total >= req) return 'strong';
  if (total >= req * 0.75) return 'moderate';
  return 'weak';
}

/** Plain-language strength word for the NARRATIVE (raw virupa numbers stay in the
 * advanced/technical view only, never in the generated prose). */
export function strengthWord(category?: string): string {
  return category === 'strong' ? 'strong' : category === 'weak' ? 'gentle (more tender)' : 'moderately strong';
}

const HOUSES_OF_INTEREST = [1, 2, 4, 6, 7, 9, 10, 11];

/** Extract the full, confidence-aware fact set that feeds the prompt, the
 * accuracy checker, and the deterministic fallback display. */
export function extractReadingFacts(chart: BirthChartResult): ReadingFacts {
  const byName: Record<string, BirthChartResult['planets'][number]> = {};
  for (const p of chart.planets) byName[p.name] = p;

  const planets: PlanetFact[] = chart.planets.map(p => {
    const sb = chart.shadbala?.[p.name];
    return {
      planet: p.name, sign: p.sign, house: p.house,
      retrograde: p.retrograde, combust: !!p.combust, navamsa: p.navamsaSign,
      shadbala: sb ? { total: Math.round(sb.total), category: shadbalaCategory(p.name, sb.total) } : undefined,
    };
  });

  const lagnaIdx = chart.lagna.rashiIndex; // 0-based
  const houseLords: HouseLordFact[] = HOUSES_OF_INTEREST.map(h => {
    const signIdx = (lagnaIdx + (h - 1)) % 12;
    const sign = RASHI_NAMES[signIdx];
    const lord = SIGN_LORDS[signIdx];
    const lp = byName[lord];
    return { house: h, sign, lord, lordSign: lp ? lp.sign : sign, lordHouse: lp ? lp.house : h };
  });

  const dashaMaha = chart.currentDasha?.mahadasha || null;
  const dashaLordPlanet = dashaMaha ? byName[dashaMaha] : undefined;
  const dashaLordSb = dashaMaha ? chart.shadbala?.[dashaMaha] : undefined;
  const dashaLord = dashaLordPlanet
    ? { planet: dashaMaha!, sign: dashaLordPlanet.sign, house: dashaLordPlanet.house, shadbalaCategory: dashaLordSb ? shadbalaCategory(dashaMaha!, dashaLordSb.total) : undefined }
    : null;

  const marsFact = byName['Mars'];
  const mangalCause = chart.doshas.mangalDosha.hasDosha && marsFact ? `Mars in your ${ordinal(marsFact.house)} house` : null;

  return {
    rashi: chart.rashi,
    nakshatra: { name: chart.nakshatra.nakshatra, pada: chart.nakshatra.pada, lord: chart.nakshatra.lord },
    lagna: chart.lagna.sign,
    dasha: chart.currentDasha ? { maha: chart.currentDasha.mahadasha, antar: chart.currentDasha.antardasha } : null,
    planets,
    placements: planets.filter(p => p.planet !== 'Rahu' && p.planet !== 'Ketu').map(p => ({ planet: p.planet, sign: p.sign, house: p.house, retrograde: p.retrograde })),
    houseLords,
    dashaLord,
    doshas: {
      mangal: { present: chart.doshas.mangalDosha.hasDosha, severityLabel: chart.doshas.mangalDosha.severityLabel, cause: mangalCause },
      kaalSarp: { present: chart.doshas.kaalSarp.present, isPartial: chart.doshas.kaalSarp.isPartial, type: chart.doshas.kaalSarp.type },
      sadeSati: { active: chart.doshas.sadeSati.active, phase: chart.doshas.sadeSati.phase },
    },
    divisional: {
      d9: chart.divisionalCharts.d9,
      d10: chart.divisionalCharts.d10,
      d60: chart.divisionalCharts.d60,
      d10Sun: chart.divisionalCharts.d10.Sun,
      d60Moon: chart.divisionalCharts.d60.Moon,
      d60Disclaimer: chart.divisionalCharts.d60Disclaimer,
      navamsaMoon: chart.divisionalCharts.d9.Moon,
      navamsaVenus: chart.divisionalCharts.d9.Venus,
    },
    warnings: chart.warnings.map(w => ({ code: w.code, message: w.message })),
    fieldsUsed: {
      snapshot: ['Lagna + lord placement', 'Moon sign', 'Nakshatra'],
      career: ['10th house sign + lord placement', 'Sun/Mercury/Saturn', 'current Dasha'],
      relationships: ['7th house sign + lord', 'Venus placement + Shadbala', 'Navamsa Venus/Moon'],
      health: ['6th house sign + lord', 'Lagna lord strength', 'planets in health houses'],
      money: ['2nd + 11th house signs + lords', 'Jupiter placement'],
      family: ['4th house (mother/home) sign + lord', '9th house (father/fortune) sign + lord'],
      rightNow: ['current Dasha lord house + sign + Shadbala'],
      doshasSection: ['dosha-causing planet + house', 'Kaal Sarp', 'Sade Sati'],
      divisional: ['Navamsa (D9) placements', 'Dasamsa (D10)', 'Shashtiamsa (D60, low-confidence)'],
    },
  };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Prompt building ──────────────────────────────────────────────────────────

/** The system prompt — safety + tone contract AND the specificity contract. */
export function buildReadingSystemPrompt(): string {
  return `You are a skilled Vedic astrologer writing a genuinely PERSONAL reading from one specific birth chart. Your writing is warm and plain-spoken, but it is grounded in this exact chart's real placements — not generic astrology that could apply to anyone.

THE SPECIFICITY CONTRACT (this is the point of the reading):
- Every substantive sentence must reference a SPECIFIC fact from the chart data provided: a named planet, a house (e.g. "your 10th house"), a sign, a house-lord placement, a Navamsa sign, a Shadbala strength, or the current Dasha lord's placement.
- Do NOT write sentences that would be equally true for a different birth chart. Avoid generic phrases like "you may feel drawn toward", "this is a time for", "you value loyalty" UNLESS you immediately tie them to a specific placement ("...because your 7th lord Venus sits in Kanya").
- SYNTHESIS, not listing: connect at least two chart elements to each other and to a real-world implication — e.g. "your 10th lord Mars sits in your 1st house, so career progress tends to come through personal drive and direct action rather than diplomacy" — not "Mars is in the 1st house" stated in isolation.
- Name houses/planets/signs in the output. Briefly gloss jargon in plain words the first time (e.g. "your 10th house (career)"), so a beginner follows along — but DO name the real placement.
- CRITICAL — accuracy over fluency: only state placements that are actually in the data below. Never invent or guess a planet's house or sign. A confidently wrong placement is worse than a cautious one. If you're unsure, describe only what the data states.
- STRENGTH IN WORDS: describe planetary strength only with the words provided ("strong", "moderately strong", "gentle") — NEVER quote a number or the unit "virupas" in your reply.

VOICE (warmth without losing specificity):
- Write warmly and conversationally, like a thoughtful person talking to one person — not a chart printout.
- Keep sentences fairly SHORT and let them breathe. Do NOT pack more than TWO chart facts into a single sentence — when you have several facts, split them across several short sentences instead of one long, comma-stacked one. More short, natural sentences read better than fewer dense ones.
- Keep every required fact (below) — this is about phrasing, not dropping facts.

ABSOLUTE SAFETY RULES (unchanged — a response that breaks any is unusable):
- BANNED WORDS — never output any of these, even once, in ANY sense: "will", "must", "definitely", "guaranteed", "invest", "buy", "sell", "disease", "illness", "diagnosis", "condition", or any named ailment. Substitutions: "will"→"tends to"/"often"; "invest"→"put time/care into"; "disease/illness/condition"→"wellbeing"/"resilience"/"vitality".
- Never predict the future as certain. Use "tends to", "traditionally associated with", "may", "often".
- No medical claims or diagnoses. For health, name the real chart placements (6th house, Lagna lord strength) but speak ONLY to general wellbeing, daily rhythm, rest and resilience — never any ailment, and never the banned health words above.
- No financial advice/instructions. Never say "invest", "buy", or "sell", and never name assets. Describe money HABITS and the real 2nd/11th-house placements only.
- Doshas are NOT curses. Name the specific cause (which planet, which house) but frame calmly as "an area to be mindful of", de-stigmatising and remedy-aware. Never alarm.
- Warm and constructive even for difficult or weak placements.

CONFIDENCE — these layers are less certain, so use softer language and hedge them explicitly:
- Rashi, Nakshatra, Lagna, house placements and the current Dasha are reliable — state them plainly.
- Shadbala "strength" and the Shashtiamsa (D60) are INDICATIVE, one of several classical methods — when you use them, hedge ("its indicative strength is…", "in one classical reading…").`;
}

/** The user prompt — the full chart data + exactly which facts each section must use. */
export function buildReadingUserPrompt(f: ReadingFacts): string {
  const planetLine = f.planets.map(p => {
    const bits = [`${p.planet} in ${p.sign} (${ordinal(p.house)} house)`];
    if (p.retrograde) bits.push('retrograde');
    if (p.combust) bits.push('combust');
    bits.push(`Navamsa ${p.navamsa}`);
    if (p.shadbala) bits.push(`indicative strength ${strengthWord(p.shadbala.category)}`);
    return '  - ' + bits.join(', ');
  }).join('\n');

  const lordLine = f.houseLords.map(h =>
    `  - ${ordinal(h.house)} house is ${h.sign}, ruled by ${h.lord}; ${h.lord} sits in ${h.lordSign} (${ordinal(h.lordHouse)} house)`
  ).join('\n');

  const dashaLord = f.dashaLord
    ? `${f.dashaLord.planet} (the current main-period lord) sits in ${f.dashaLord.sign}, ${ordinal(f.dashaLord.house)} house${f.dashaLord.shadbalaCategory ? `, indicative strength ${strengthWord(f.dashaLord.shadbalaCategory)}` : ''}`
    : 'not available (birth time needed)';

  const doshaLines = [
    `Mangal Dosha: ${f.doshas.mangal.present ? `present (${f.doshas.mangal.severityLabel})${f.doshas.mangal.cause ? `, caused by ${f.doshas.mangal.cause}` : ''}` : 'not present'}`,
    `Kaal Sarp: ${f.doshas.kaalSarp.present ? `${f.doshas.kaalSarp.isPartial ? 'partial' : 'full'} (${f.doshas.kaalSarp.type})` : 'not present'}`,
    `Sade Sati: ${f.doshas.sadeSati.active ? `active — ${f.doshas.sadeSati.phase}` : 'not active'}`,
  ].join('; ');

  const navamsaLine = Object.entries(f.divisional.d9).map(([pl, sg]) => `${pl}→${sg}`).join(', ');
  const polar = f.warnings.some(w => w.code === 'POLAR_LATITUDE')
    ? '\nIMPORTANT: extreme (polar) latitude — the rising sign and houses are astronomically unreliable here; note in the snapshot that ascendant/house parts are approximate.'
    : '';

  return `THIS PERSON'S BIRTH CHART (sidereal / Lahiri). Use ONLY these facts; do not invent placements.

Core:
- Moon sign (Rashi): ${f.rashi}
- Birth star (Nakshatra): ${f.nakshatra.name}, pada ${f.nakshatra.pada} (ruled by ${f.nakshatra.lord})
- Rising sign (Lagna): ${f.lagna}
- Current planetary period: ${f.dasha ? `${f.dasha.maha} main / ${f.dasha.antar} sub` : 'not available'}
- Current period lord placement: ${dashaLord}

Planets (all nine):
${planetLine}

House lords (whole-sign):
${lordLine}

Navamsa (D9) signs: ${navamsaLine}
Dasamsa (D10) Sun: ${f.divisional.d10Sun}; Shashtiamsa (D60) Moon: ${f.divisional.d60Moon} [D60 = one of several classical methods].
Doshas: ${doshaLines}${polar}

Write the reading as JSON with exactly these fields. EACH must cite the specific facts listed for it:
- "snapshot": 2-3 sentences from the Lagna (${f.lagna}) + its lord's placement, the Moon sign (${f.rashi}) and Nakshatra. Name them.
- "career": MUST reference the 10th house sign AND its ruling planet's placement (house/sign/strength), AND at least one of Sun/Mercury/Saturn by its real placement, AND connect to the current Dasha lord if relevant. Draw a real-world implication.
- "relationships": MUST reference the 7th house sign and its lord's placement, Venus's placement (sign/house/strength), and the Navamsa sign of Venus or Moon. Fold in Mangal Dosha calmly IF present, naming its cause.
- "health": MUST reference the 6th house sign and lord, the Lagna lord's strength, and any planet in a health-relevant house — but describe the 6th house as daily routines, service, habits and resilience, speaking ONLY to general wellbeing, rest and energy. Never use "disease", "illness", "condition" or any ailment name.
- "money": MUST reference the 2nd and 11th house signs and their lords' placements, and Jupiter's placement. Habits/mindset only.
- "family": MUST reference the 4th house (home/mother) and 9th house (father/fortune) signs and their lords' placements.
- "rightNow": MUST describe the CURRENT Dasha lord (${f.dasha ? f.dasha.maha : 'current'}) by its actual house, sign and indicative Shadbala strength in THIS chart — not a textbook description of that planet.
- "doshas": name the specific planet/house behind any dosha present (or reassure plainly if none), calm and de-stigmatising.
- "divisional": name at least TWO real Navamsa (D9) placements by sign (from the Navamsa list above), plus the Dasamsa; mention D60 only with a "one interpretation" hedge.

Every sentence must be traceable to a fact above. Do not write anything equally true of another chart. Describe strength only in words (strong / moderately strong / gentle) — never a number or "virupas". Keep sentences short and warm: at most two facts per sentence, and prefer several short sentences over one dense one. Aim for 4-6 short sentences per field. Return ONLY the JSON object.`;
}

/** Appended to the prompt on a retry when the first output was too generic or wrong. */
export const STRONGER_REMINDER = `

RETRY — the previous attempt was too generic or named a placement not in the data. This time: in EVERY section, name at least one specific house number, house-lord, planet placement or Navamsa/Shadbala value FROM THE DATA ABOVE, and do not state any placement that is not listed above.`;

/** Appended on a retry when the previous attempt used a forbidden word. */
export const SAFETY_REMINDER = `

RETRY — the previous attempt used a forbidden word. Do NOT use "will", "must", "definitely", "guaranteed", "invest", "buy", or "sell" ANYWHERE, even in harmless senses (write "put time into" not "invest time", "tends to bring" not "will bring"). Do not name any disease or medical condition.`;

/** JSON response schema for Gemini structured output. */
export const READING_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    snapshot: { type: 'string' }, career: { type: 'string' }, relationships: { type: 'string' },
    health: { type: 'string' }, money: { type: 'string' }, family: { type: 'string' },
    rightNow: { type: 'string' }, doshas: { type: 'string' }, divisional: { type: 'string' },
  },
  required: ['snapshot', 'career', 'relationships', 'health', 'money', 'family', 'rightNow', 'doshas', 'divisional'],
} as const;

export const READING_SECTION_KEYS = ['snapshot', 'career', 'relationships', 'health', 'money', 'family', 'rightNow', 'doshas', 'divisional'] as const;
export type ReadingSectionKey = typeof READING_SECTION_KEYS[number];
export type GeneratedReading = Record<ReadingSectionKey, string>;

// ── Content-safety scanner (unchanged from Part D) ───────────────────────────
const RED_FLAG_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: 'will (absolute prediction)', re: /\bwill\b/i },
  { label: 'definitely', re: /\bdefinitely\b/i },
  { label: 'must', re: /\bmust\b/i },
  { label: 'guaranteed', re: /\bguarantee(d|s)?\b/i },
  { label: 'invest', re: /\binvest(ing|ment|ments)?\b/i },
  { label: 'buy', re: /\bbuy\b/i },
  { label: 'sell', re: /\bsell\b/i },
  { label: 'diagnosis/disease term', re: /\b(cancer|diabetes|depression|anxiety disorder|tumou?r|disease|diagnos(is|e|ed)|prescrib(e|ed|ing)|medication)\b/i },
];

export function scanForRedFlags(text: string): string[] {
  if (!text) return [];
  return RED_FLAG_PATTERNS.filter(p => p.re.test(text)).map(p => p.label);
}

export function scanReadingForRedFlags(reading: Partial<GeneratedReading>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of READING_SECTION_KEYS) {
    const flags = scanForRedFlags(reading[key] || '');
    if (flags.length) out[key] = flags;
  }
  return out;
}
