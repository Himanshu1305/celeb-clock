/**
 * Interactive tarot engine — P4-TAROT-INTERACTIVE.
 * Deterministic, testable draw mechanics over the 22-card Major Arcana:
 *  - daily card (stable per calendar day, computed at render time — evergreen)
 *  - yes/no (single card, orientation-aware verdict)
 *  - love spread (3 positions, position- and orientation-aware)
 * Pure functions; the RNG is injectable so draws are reproducible in tests.
 */
import { TAROT_DECK, type DeckCard, type YesNo } from '@/data/tarotDeck';

export interface DrawnCard {
  card: DeckCard;
  reversed: boolean;
}

/** mulberry32 — small deterministic PRNG for seeded (daily) draws. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable integer seed from a calendar day (local date). */
export function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Draw `count` unique cards with random orientation using the given RNG. */
export function drawCards(count: number, rng: () => number = Math.random): DrawnCard[] {
  const n = Math.max(0, Math.min(count, TAROT_DECK.length));
  const pool = TAROT_DECK.map((c) => c.index);
  // Fisher–Yates with the injected RNG
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).map((idx) => ({ card: TAROT_DECK[idx], reversed: rng() < 0.5 }));
}

/** The card of the day — deterministic per calendar day, so it is stable on refresh. */
export function dailyCard(date: Date = new Date()): DrawnCard {
  const rng = mulberry32(dateSeed(date));
  return drawCards(1, rng)[0];
}

export type YesNoAnswer = 'Yes' | 'No' | 'Maybe';
export type YesNoConfidence = 'strong' | 'leaning' | 'mixed';

export interface YesNoVerdict {
  answer: YesNoAnswer;
  confidence: YesNoConfidence;
  explanation: string;
}

const POLARITY_SCORE: Record<YesNo, number> = { yes: 1, no: -1, maybe: 0 };

/**
 * Orientation-aware yes/no. A reversed card flips and weakens the polarity
 * (standard tarot convention), so a bold upright "yes" becomes a cautious lean.
 */
export function yesNoVerdict(drawn: DrawnCard): YesNoVerdict {
  const base = POLARITY_SCORE[drawn.card.yesNo];
  const score = drawn.reversed ? base * -0.5 : base;
  let answer: YesNoAnswer;
  let confidence: YesNoConfidence;
  if (score > 0.3) answer = 'Yes';
  else if (score < -0.3) answer = 'No';
  else answer = 'Maybe';
  if (Math.abs(score) >= 1) confidence = 'strong';
  else if (Math.abs(score) >= 0.5) confidence = 'leaning';
  else confidence = 'mixed';
  const meaning = drawn.reversed ? drawn.card.reversed : drawn.card.upright;
  const orient = drawn.reversed ? 'reversed' : 'upright';
  const explanation = `${drawn.card.name} (${orient}) suggests ${answer.toLowerCase()}${
    confidence === 'strong' ? ', clearly' : confidence === 'leaning' ? ', on balance' : ' — the signs are mixed'
  }. ${meaning}`;
  return { answer, confidence, explanation };
}

export const LOVE_POSITIONS = ['You', 'The other person', 'The connection'] as const;

const LOVE_FRAMING: Record<(typeof LOVE_POSITIONS)[number], string> = {
  You: 'What you bring to this relationship right now',
  'The other person': 'Where the other person stands',
  'The connection': 'The direction the connection is heading',
};

export interface LovePositionReading {
  position: string;
  framing: string;
  drawn: DrawnCard;
  reading: string;
}

/** Position- and orientation-aware 3-card love spread. */
export function loveSpread(drawn: DrawnCard[]): LovePositionReading[] {
  return LOVE_POSITIONS.slice(0, drawn.length).map((position, i) => {
    const d = drawn[i];
    const meaning = d.reversed ? d.card.reversed : d.card.upright;
    const orient = d.reversed ? 'reversed' : 'upright';
    return {
      position,
      framing: LOVE_FRAMING[position],
      drawn: d,
      reading: `${LOVE_FRAMING[position]}: ${d.card.name} (${orient}). ${meaning} ${d.card.love}`,
    };
  });
}
