/**
 * Part D-Fix: two checks that pair together.
 *
 *  A) ACCURACY (anti-hallucination) — verifyReadingClaims(): the dangerous
 *     failure mode is a reading that sounds specific but names a WRONG placement
 *     (a fabricated Ascendant stated as confidently as a correct planet). We
 *     extract the structured factual claims the text makes (planet→house,
 *     planet→sign, house→sign, Navamsa planet→sign) and check each against the
 *     REAL calculateBirthChart() output. Any mismatch fails the generation.
 *
 *     Method choice: deterministic PATTERN-MATCHING, not a second Gemini call —
 *     because it must be reliable, testable and free of its own hallucination.
 *     It is tuned for HIGH PRECISION (a flagged claim is genuinely wrong): every
 *     pattern uses a negative lookahead so no OTHER planet name sits between the
 *     subject and the value, which prevents cross-pairing (e.g. "10th house is
 *     Vrischika, and Mars sits in Simha" never checks house-10 against Simha).
 *     It favours precision over recall — it may not catch every prose variation,
 *     but it will not wrongly condemn a correct reading.
 *
 *  B) SPECIFICITY — scoreReadingSpecificity(): confirms each section actually
 *     references real chart terms (not word count) and includes the placement it
 *     is required to (e.g. career names the 10th house or its lord).
 */
import type { ReadingFacts, GeneratedReading } from './readingPrompts';
import { READING_SECTION_KEYS } from './readingPrompts';
import { RASHI_NAMES } from './engine/vedicEngine';

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
// Accept both the engine's long form (Vrishabha) and the common short form (Vrisha).
const SIGN_ALIASES: Record<string, string> = {
  Mesha: 'Mesha', Vrishabha: 'Vrishabha', Vrisha: 'Vrishabha', Mithuna: 'Mithuna', Karka: 'Karka',
  Simha: 'Simha', Kanya: 'Kanya', Tula: 'Tula', Vrischika: 'Vrischika', Dhanu: 'Dhanu',
  Makara: 'Makara', Kumbha: 'Kumbha', Meena: 'Meena',
};
const SIGN_TOKENS = Object.keys(SIGN_ALIASES);
const PLANET_ALT = PLANETS.join('|');
const SIGN_ALT = SIGN_TOKENS.join('|');
const ORD: Record<string, number> = {
  '1st': 1, first: 1, '2nd': 2, second: 2, '3rd': 3, third: 3, '4th': 4, fourth: 4, '5th': 5, fifth: 5,
  '6th': 6, sixth: 6, '7th': 7, seventh: 7, '8th': 8, eighth: 8, '9th': 9, ninth: 9, '10th': 10, tenth: 10,
  '11th': 11, eleventh: 11, '12th': 12, twelfth: 12,
};
const ORD_ALT = Object.keys(ORD).join('|');

function normSign(s: string): string { return SIGN_ALIASES[s.replace(/^\w/, c => c.toUpperCase())] || s; }
// "no other planet name in between" guard fragment
const NO_PLANET = `(?:(?!\\b(?:${PLANET_ALT})\\b).)`;

export interface ClaimCheck { section: string; type: string; text: string; claimed: string; actual: string; ok: boolean; }
export interface AccuracyResult { checked: number; correct: number; wrong: ClaimCheck[]; byClaim: ClaimCheck[]; }

/** Verify every structured chart claim in a reading against the real chart facts. */
export function verifyReadingClaims(reading: Partial<GeneratedReading>, facts: ReadingFacts): AccuracyResult {
  const byName: Record<string, { sign: string; house: number }> = {};
  for (const p of facts.planets) byName[p.planet] = { sign: p.sign, house: p.house };
  const lagnaIdx = Math.max(0, RASHI_NAMES.indexOf(facts.lagna));
  const houseSign = (h: number) => RASHI_NAMES[(lagnaIdx + (h - 1)) % 12];

  const all: ClaimCheck[] = [];

  for (const section of READING_SECTION_KEYS) {
    const text = reading[section] || '';
    if (!text) continue;

    // (1) Planet → house:  "<Planet> ... <ordinal> house"  (no other planet between)
    const rePlanetHouse = new RegExp(`\\b(${PLANET_ALT})\\b${NO_PLANET}{0,28}?\\b(${ORD_ALT})\\s+house\\b`, 'gi');
    for (const m of text.matchAll(rePlanetHouse)) {
      const planet = cap(m[1]); const h = ORD[m[2].toLowerCase()];
      const real = byName[planet]?.house;
      if (real) all.push({ section, type: 'planet→house', text: m[0], claimed: `${planet} in ${ord(h)} house`, actual: `${planet} in ${ord(real)} house`, ok: real === h });
    }

    // (2) Planet → sign:  "<Planet> ... in <Sign>"  (no other planet, no 'house' between).
    // A reading legitimately cites divisional signs (Navamsa/Dasamsa/Shashtiamsa), so
    // a claim is CORRECT if the sign is where the planet actually sits in ANY of D1/
    // D9/D10/D60. Only a sign the planet occupies in NONE of them is a real fabrication.
    const rePlanetSign = new RegExp(`\\b(${PLANET_ALT})\\b(?:(?!\\b(?:${PLANET_ALT})\\b)(?!house).){0,22}?\\b(?:in|sits in|placed in|is in|falls in)\\s+(${SIGN_ALT})\\b`, 'gi');
    for (const m of text.matchAll(rePlanetSign)) {
      const planet = cap(m[1]); const sign = normSign(m[2]);
      const d1 = byName[planet]?.sign;
      if (!d1) continue;
      const occupies = [d1, facts.divisional.d9[planet], facts.divisional.d10[planet], facts.divisional.d60[planet]].filter(Boolean).map(normSign);
      all.push({ section, type: 'planet→sign', text: m[0], claimed: `${planet} in ${sign}`, actual: `${planet} occupies ${occupies.join('/')} (D1/D9/D10/D60)`, ok: occupies.includes(sign) });
    }

    // (3) House → sign:  "<ordinal> house ... <Sign>".  No planet AND no second
    // "house" may sit between — otherwise we'd cross-pair one house with another
    // house's sign (both a mis-attribution and a false-positive risk).
    const reHouseSign = new RegExp(`\\b(${ORD_ALT})\\s+house\\b(?:(?!\\b(?:${PLANET_ALT})\\b)(?!house).){0,25}?\\b(${SIGN_ALT})\\b`, 'gi');
    for (const m of text.matchAll(reHouseSign)) {
      const h = ORD[m[1].toLowerCase()]; const sign = normSign(m[2]);
      const real = normSign(houseSign(h));
      all.push({ section, type: 'house→sign', text: m[0], claimed: `${ord(h)} house is ${sign}`, actual: `${ord(h)} house is ${real}`, ok: real === sign });
    }

    // (4) Navamsa planet → sign:  "Navamsa ... <Planet> ... <Sign>"  or "<Planet>('s) Navamsa ... <Sign>"
    const reNav = new RegExp(`\\bNavamsa\\b(?:(?!\\b(?:${PLANET_ALT})\\b).){0,20}?\\b(${PLANET_ALT})\\b${NO_PLANET}{0,20}?\\b(${SIGN_ALT})\\b`, 'gi');
    for (const m of text.matchAll(reNav)) {
      const planet = cap(m[1]); const sign = normSign(m[2]);
      const real = facts.divisional.d9[planet];
      if (real) all.push({ section, type: 'navamsa→sign', text: m[0], claimed: `Navamsa ${planet} in ${sign}`, actual: `Navamsa ${planet} in ${normSign(real)}`, ok: normSign(real) === sign });
    }
  }

  // De-duplicate identical (section,type,claimed) checks.
  const seen = new Set<string>();
  const byClaim = all.filter(c => { const k = `${c.section}|${c.type}|${c.claimed}`; if (seen.has(k)) return false; seen.add(k); return true; });
  const wrong = byClaim.filter(c => !c.ok);
  return { checked: byClaim.length, correct: byClaim.filter(c => c.ok).length, wrong, byClaim };
}

function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
function ord(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

// ── Specificity scoring ──────────────────────────────────────────────────────
export interface SectionScore { section: string; termCount: number; requiredOk: boolean; pass: boolean; }
export interface SpecificityResult { perSection: SectionScore[]; failing: string[]; overallPass: boolean; }

const SPECIFIC_TERM_RES: RegExp[] = [
  new RegExp(`\\b(${PLANET_ALT})\\b`, 'i'),
  new RegExp(`\\b(${SIGN_ALT})\\b`, 'i'),
  new RegExp(`\\b(${ORD_ALT})\\s+house\\b`, 'i'),
  /\bNavamsa\b/i, /\bShadbala\b/i, /\bDasha\b/i,
  /\b(Mangal|Kaal Sarp|Sade Sati|Manglik)\b/i,
];

function countSpecificTerms(text: string): number {
  // Count DISTINCT specific tokens actually present (planets + signs + "Nth house"
  // + keywords), so a section that says "Mars ... 10th house ... Navamsa" scores 3.
  const found = new Set<string>();
  for (const re of [new RegExp(`\\b(${PLANET_ALT})\\b`, 'gi'), new RegExp(`\\b(${SIGN_ALT})\\b`, 'gi'), new RegExp(`\\b(${ORD_ALT})\\s+house\\b`, 'gi')]) {
    for (const m of text.matchAll(re)) found.add(m[0].toLowerCase());
  }
  for (const re of [/\bNavamsa\b/i, /\bShadbala\b/i, /\b(Mangal|Kaal Sarp|Sade Sati)\b/i]) {
    if (re.test(text)) found.add(re.source);
  }
  return found.size;
}

/** Section-specific "did it reference the placement it was required to" check. */
function requiredRefPresent(section: string, text: string, facts: ReadingFacts): boolean {
  const t = text.toLowerCase();
  const has = (s: string) => t.includes(s.toLowerCase());
  const lord = (h: number) => facts.houseLords.find(x => x.house === h)?.lord || '';
  switch (section) {
    case 'career': return /\b10th\s+house|tenth\s+house\b/i.test(text) || has(lord(10));
    case 'relationships': return /\b7th\s+house|seventh\s+house\b/i.test(text) || has('Venus') || has(lord(7));
    case 'money': return /\b(2nd|11th|second|eleventh)\s+house\b/i.test(text) || has('Jupiter') || has(lord(2)) || has(lord(11));
    case 'family': return /\b(4th|9th|fourth|ninth)\s+house\b/i.test(text) || has(lord(4)) || has(lord(9));
    case 'health': return /\b6th\s+house|sixth\s+house\b/i.test(text) || has(lord(6)) || has(lord(1));
    case 'rightNow': return !facts.dasha || has(facts.dasha.maha);
    case 'divisional': return /\bnavamsa\b/i.test(text);
    default: return true; // snapshot/doshas: term count is enough
  }
}

export function scoreReadingSpecificity(reading: Partial<GeneratedReading>, facts: ReadingFacts, minTerms = 3): SpecificityResult {
  const perSection: SectionScore[] = READING_SECTION_KEYS.map(section => {
    const text = reading[section] || '';
    const termCount = countSpecificTerms(text);
    const requiredOk = requiredRefPresent(section, text, facts);
    return { section, termCount, requiredOk, pass: termCount >= minTerms && requiredOk };
  });
  const failing = perSection.filter(s => !s.pass).map(s => s.section);
  return { perSection, failing, overallPass: failing.length === 0 };
}
