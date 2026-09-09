/**
 * Reading/prediction prompt construction, fact extraction, and content-safety
 * scanning for the Vedic reading UX (Part D).
 *
 * Kept SEPARATE from the celebrity-bio and longevity-coach prompts (different
 * purpose/tone), but follows the coach's proven graceful-degradation shape.
 *
 * Confidence handling (from the Part B confidence table): D60, Sthana Bala and
 * Chesta Bala are lower-confidence and MUST be described with visibly softer
 * language than the 100%-validated Rashi/Nakshatra/Lagna/Dasha/Mangal fields.
 */
import type { BirthChartResult } from './calculateBirthChart';

export interface ReadingFacts {
  rashi: string;
  nakshatra: { name: string; pada: number; lord: string };
  lagna: string;
  dasha: { maha: string; antar: string } | null;
  placements: Array<{ planet: string; sign: string; house: number; retrograde: boolean }>;
  doshas: {
    mangal: { present: boolean; severityLabel: string };
    kaalSarp: { present: boolean; isPartial: boolean; type: string | null };
    sadeSati: { active: boolean; phase: string | null };
  };
  divisional: { d9Moon: string; d10Sun: string; d60Moon: string; d60Disclaimer: string };
  warnings: Array<{ code: string; message: string }>;
  /** Which chart fields fed which section — stored alongside the reading for QA. */
  fieldsUsed: Record<string, string[]>;
}

/** Extract the plain, confidence-aware facts that feed both the prompt and the
 * deterministic (non-AI) fallback display. */
export function extractReadingFacts(chart: BirthChartResult): ReadingFacts {
  const placements = chart.planets
    .filter(p => p.name !== 'Rahu' && p.name !== 'Ketu')
    .map(p => ({ planet: p.name, sign: p.sign, house: p.house, retrograde: p.retrograde }));
  return {
    rashi: chart.rashi,
    nakshatra: { name: chart.nakshatra.nakshatra, pada: chart.nakshatra.pada, lord: chart.nakshatra.lord },
    lagna: chart.lagna.sign,
    dasha: chart.currentDasha ? { maha: chart.currentDasha.mahadasha, antar: chart.currentDasha.antardasha } : null,
    placements,
    doshas: {
      mangal: { present: chart.doshas.mangalDosha.hasDosha, severityLabel: chart.doshas.mangalDosha.severityLabel },
      kaalSarp: { present: chart.doshas.kaalSarp.present, isPartial: chart.doshas.kaalSarp.isPartial, type: chart.doshas.kaalSarp.type },
      sadeSati: { active: chart.doshas.sadeSati.active, phase: chart.doshas.sadeSati.phase },
    },
    divisional: {
      d9Moon: chart.divisionalCharts.d9.Moon,
      d10Sun: chart.divisionalCharts.d10.Sun,
      d60Moon: chart.divisionalCharts.d60.Moon,
      d60Disclaimer: chart.divisionalCharts.d60Disclaimer,
    },
    warnings: chart.warnings.map(w => ({ code: w.code, message: w.message })),
    fieldsUsed: {
      snapshot: ['rashi', 'nakshatra', 'lagna'],
      career: ['Sun/Saturn placements', 'current Dasha'],
      relationships: ['Venus/Mars placements', 'Mangal Dosha'],
      health: ['Lagna', 'Moon', 'Sade Sati'],
      money: ['Jupiter/Mercury placements', 'current Dasha'],
      family: ['Moon placement', '4th-house context'],
      rightNow: ['current Mahadasha', 'current Antardasha'],
      doshasSection: ['Mangal Dosha severity', 'Kaal Sarp', 'Sade Sati'],
      divisional: ['Navamsa (D9)', 'Dasamsa (D10)', 'Shashtiamsa (D60, low-confidence)'],
    },
  };
}

/** The system prompt — the safety + tone contract for every reading. */
export function buildReadingSystemPrompt(): string {
  return `You are a warm, grounded Vedic astrology writer creating a personal reading for one person from their birth chart. You write in plain, everyday English for someone who knows nothing about astrology jargon.

ABSOLUTE RULES (a response that breaks any of these is unusable):
- Never predict the future as certain. Never use the words "will", "definitely", "must", or "guaranteed" as predictions. Instead use "this period is traditionally associated with", "may", "tends to", "often", "you might find".
- No medical claims or diagnoses of any kind. Never name diseases or conditions. For health, speak only in gentle, general wellbeing terms (rest, balance, routine).
- No financial advice or instructions. Never say "invest", "buy", or "sell", and never name assets. For money, speak about general habits and mindset only.
- Doshas are NOT curses or omens. Frame any dosha calmly as "an area to be mindful of", with a constructive, de-stigmatising tone. Dosha stigma causes real harm (e.g. in marriage) — never alarm the reader.
- Organise everything by life area (Career, Relationships, Health, Money, Family) in plain language. Never use chart jargon like "9th house", "lord", "exalted" in the output.
- Warm and constructive even for difficult placements — never fatalistic.

CONFIDENCE — softer language for less-certain parts:
- Rashi, Nakshatra, Lagna and the current planetary period (Dasha) are reliable — you may state them plainly.
- The Shashtiamsa (D60) divisional chart and any "strength" scores are ONE of several classical interpretations and are less certain — when you mention them, explicitly hedge ("in one classical reading…", "some traditions suggest…").`;
}

/** The user prompt — the person's chart facts + what each section should cover. */
export function buildReadingUserPrompt(f: ReadingFacts): string {
  const placements = f.placements.map(p => `${p.planet} in ${p.sign} (house ${p.house})${p.retrograde ? ', retrograde' : ''}`).join('; ');
  const dasha = f.dasha ? `${f.dasha.maha} main period, ${f.dasha.antar} sub-period` : 'not available';
  const doshaLines = [
    `Mangal Dosha: ${f.doshas.mangal.present ? `present (${f.doshas.mangal.severityLabel})` : 'not present'}`,
    `Kaal Sarp: ${f.doshas.kaalSarp.present ? `${f.doshas.kaalSarp.isPartial ? 'partial' : 'full'} (${f.doshas.kaalSarp.type})` : 'not present'}`,
    `Sade Sati: ${f.doshas.sadeSati.active ? `active — ${f.doshas.sadeSati.phase}` : 'not active'}`,
  ].join('; ');
  const polar = f.warnings.some(w => w.code === 'POLAR_LATITUDE')
    ? '\nIMPORTANT: This birth is at an extreme (polar) latitude where the rising sign and houses are astronomically unreliable. Gently note in the snapshot that the ascendant/house-based parts are approximate for this birth.'
    : '';

  return `Here is the person's Vedic birth chart (sidereal / Lahiri):
- Moon sign (Rashi): ${f.rashi}
- Birth star (Nakshatra): ${f.nakshatra.name}, pada ${f.nakshatra.pada} (ruled by ${f.nakshatra.lord})
- Rising sign (Lagna): ${f.lagna}
- Current planetary period: ${dasha}
- Planet placements: ${placements}
- Doshas: ${doshaLines}
- Divisional highlights: Navamsa (D9) Moon in ${f.divisional.d9Moon}; Dasamsa (D10) Sun in ${f.divisional.d10Sun}; Shashtiamsa (D60) Moon in ${f.divisional.d60Moon} [D60 is one of several classical methods].${polar}

Write the reading as JSON with exactly these fields:
- "snapshot": 2-3 warm sentences introducing them from their Moon sign, birth star and rising sign.
- "career": one short paragraph on work/vocation, grounded in the placements and current period.
- "relationships": one short paragraph on connection and partnership (fold in the Mangal Dosha calmly if present).
- "health": one short paragraph on general wellbeing and routine — no medical terms.
- "money": one short paragraph on money habits and mindset — no financial instructions.
- "family": one short paragraph on home and family life.
- "rightNow": one short paragraph titled to the current period, describing what this ${f.dasha ? f.dasha.maha : 'current'} period is traditionally associated with, in plain language.
- "doshas": one calm, de-stigmatising paragraph explaining any doshas present and gentle traditional remedies/context; if none are present, say so reassuringly.
- "divisional": one short paragraph on what the Navamsa and Dasamsa add, and mention the D60 only with an explicit "one interpretation" hedge.

Keep each field to 2-5 sentences. Return ONLY the JSON object.`;
}

/** JSON response schema for Gemini structured output. */
export const READING_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    snapshot: { type: 'string' },
    career: { type: 'string' },
    relationships: { type: 'string' },
    health: { type: 'string' },
    money: { type: 'string' },
    family: { type: 'string' },
    rightNow: { type: 'string' },
    doshas: { type: 'string' },
    divisional: { type: 'string' },
  },
  required: ['snapshot', 'career', 'relationships', 'health', 'money', 'family', 'rightNow', 'doshas', 'divisional'],
} as const;

export const READING_SECTION_KEYS = ['snapshot', 'career', 'relationships', 'health', 'money', 'family', 'rightNow', 'doshas', 'divisional'] as const;
export type ReadingSectionKey = typeof READING_SECTION_KEYS[number];
export type GeneratedReading = Record<ReadingSectionKey, string>;

/**
 * Content-safety scanner. Returns the list of red-flag phrases found in the text
 * (empty = clean). Used both server-side (reject/degrade unsafe AI output) and
 * in tests (scan real generated text). Word-boundary matched, case-insensitive.
 */
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

/** Scan a whole generated reading (all sections). Returns per-section flags. */
export function scanReadingForRedFlags(reading: Partial<GeneratedReading>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of READING_SECTION_KEYS) {
    const flags = scanForRedFlags(reading[key] || '');
    if (flags.length) out[key] = flags;
  }
  return out;
}
