/**
 * Love / name compatibility "for fun" (Batch 10) — /love-calculator.
 *
 * NOT astrology and NOT a prediction. It is a deterministic numerology comparison of two
 * names, using only machinery the site already uses elsewhere:
 *   • each name → its Chaldean name number 1–9 (chaldeanName, the one sitewide function
 *     behind /name-numerology, /name-correction and /numerology);
 *   • the two numbers are read with the friendly-number table the name-correction tool
 *     uses (areNumbersHarmonious / FRIENDLY in ./numerologyTools.ts — classical planetary
 *     friendships of the numbers' ruling planets).
 * Same two names → always the same result (no random "FLAMES" draw), and the order of the
 * names does not matter. For real matching, the page links to Kundali milan (36 gunas from
 * birth details) and Kundli milan by name.
 */
import { chaldeanName, NUMBER_KEYWORD, NUMBER_PLANET, areNumbersHarmonious } from './numerologyTools';

export type LoveTier = 'same' | 'harmonious' | 'growth';

export interface NameLoveSide {
  name: string;
  total: number;
  number: number;
  planet: string;
  keyword: string;
  letters: Array<{ ch: string; value: number }>;
}

export interface NameLoveResult {
  a: NameLoveSide;
  b: NameLoveSide;
  tier: LoveTier;
  headline: string;
  text: string;
}

function side(name: string): NameLoveSide {
  const r = chaldeanName(name);
  return { name: name.trim(), total: r.total, number: r.root, planet: NUMBER_PLANET[r.root] ?? '—', keyword: NUMBER_KEYWORD[r.root] ?? '', letters: r.letters };
}

export function nameLove(nameA: string, nameB: string): NameLoveResult | null {
  const a = side(nameA), b = side(nameB);
  if (!a.number || !b.number) return null;
  let tier: LoveTier;
  if (a.number === b.number) tier = 'same';
  else tier = areNumbersHarmonious(a.number, b.number) ? 'harmonious' : 'growth';
  const headline = tier === 'same' ? 'Mirror numbers' : tier === 'harmonious' ? 'Friendly numbers' : 'Different rhythms';
  const text = tier === 'same'
    ? `Both names reduce to ${a.number} (${a.keyword}). Same-number pairs are read as instantly familiar — you “get” each other — with the gentle reminder not to double up on the same blind spots.`
    : tier === 'harmonious'
      ? `${a.number} (${a.planet}) and ${b.number} (${b.planet}) sit on each other's friendly list in the classical number table — read as an easy, supportive mix: ${a.keyword} meets ${b.keyword}.`
      : `${a.number} (${a.planet}) and ${b.number} (${b.planet}) are not on each other's friendly list — read as a pairing of different rhythms (${a.keyword} with ${b.keyword}), where understanding grows with patience. Different is not bad — a name number says nothing about how a real relationship will go.`;
  return { a, b, tier, headline, text };
}
