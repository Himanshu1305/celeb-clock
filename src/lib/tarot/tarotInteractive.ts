/**
 * Interactive tarot engine — P4-TAROT-INTERACTIVE.
 * Deterministic, testable draw mechanics over the 22-card Major Arcana:
 *  - daily card (stable per calendar day, computed at render time — evergreen)
 *  - yes/no (single card, orientation-aware verdict)
 *  - love spread (3 positions, position- and orientation-aware)
 * Pure functions; the RNG is injectable so draws are reproducible in tests.
 */
import { TAROT_DECK, type DeckCard, type YesNo } from '@/data/tarotDeck';
import { TAROT_CARDS, type TarotCardEntry } from '@/data/tarotCards';

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

// ─── Batch 7 / W5: yes/no over the full 78-card deck ─────────────────────────
// The yes/no tab draws ONE card from all 78 (src/data/tarotCards), each with its own
// sourced meaning and yes/no lean, and links to that card's page. Same orientation rule
// as yesNoVerdict above: a reversed card flips and weakens the card's lean.

export interface FullDeckDraw {
  card: TarotCardEntry;
  reversed: boolean;
}

export function drawFromFullDeck(rng: () => number = Math.random): FullDeckDraw {
  const idx = Math.min(TAROT_CARDS.length - 1, Math.floor(rng() * TAROT_CARDS.length));
  return { card: TAROT_CARDS[idx], reversed: rng() < 0.5 };
}

const LEAN_WORD = { yes: 'a soft yes', no: 'a gentle no', maybe: 'mixed — not a clear yes or no' } as const;

/** One plain line on what the card leans to when reversed (also shown on the card page). */
export function reversedLeanText(card: TarotCardEntry): string {
  const lean = card.reversedLean ?? 'maybe';
  return `Reversed, ${card.name} reads as ${LEAN_WORD[lean]}: ${card.reversedKeywords.slice(0, 3).join(', ')}.`;
}

export interface FullDeckVerdict extends YesNoVerdict {
  /** The meaning shown for this orientation (the card's upright or reversed reading). */
  meaning: string;
  keywords: string[];
}

export function yesNoFullDeck(drawn: FullDeckDraw): FullDeckVerdict {
  // Upright: the card's lean at full strength. Reversed: the card's own reversed lean
  // (src/data/tarotCards/reversedLean.ts, read from Waite's reversed list), softened.
  const score = drawn.reversed
    ? POLARITY_SCORE[drawn.card.reversedLean ?? 'maybe'] * 0.5
    : POLARITY_SCORE[drawn.card.yesNo];
  let answer: YesNoAnswer;
  if (score > 0.3) answer = 'Yes';
  else if (score < -0.3) answer = 'No';
  else answer = 'Maybe';
  const confidence: YesNoConfidence = Math.abs(score) >= 1 ? 'strong' : Math.abs(score) >= 0.5 ? 'leaning' : 'mixed';
  const orient = drawn.reversed ? 'reversed' : 'upright';
  const why = drawn.reversed ? reversedLeanText(drawn.card) : drawn.card.yesNoWhy;
  const explanation = `${drawn.card.name} (${orient}) suggests ${answer.toLowerCase()}${
    confidence === 'strong' ? ', clearly' : confidence === 'leaning' ? ', on balance' : ' — the signs are mixed'
  }. ${why}`;
  return {
    answer,
    confidence,
    explanation,
    meaning: drawn.reversed ? drawn.card.reversed : drawn.card.upright,
    keywords: drawn.reversed ? drawn.card.reversedKeywords : drawn.card.keywords,
  };
}
