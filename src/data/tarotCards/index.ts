// Batch 7 / W5 — the full 78-card tarot reference used by /tarot/cards and
// /tarot/cards/:slug, and by the yes/no draw on /tarot-reading. Source: ./types.ts.
import type { Suit, TarotCardEntry } from './types';
import { MAJOR_CARDS } from './major';
import { WANDS } from './wands';
import { CUPS } from './cups';
import { SWORDS } from './swords';
import { PENTACLES } from './pentacles';
import { REVERSED_LEAN } from './reversedLean';

export type { TarotCardEntry, Suit, Arcana, YesNoLean } from './types';
export { SUIT_META, RANK_LABELS } from './minorFactory';

export const SUIT_ORDER: Suit[] = ['wands', 'cups', 'swords', 'pentacles'];

const SUIT_CARDS: Record<Suit, TarotCardEntry[]> = { wands: WANDS, cups: CUPS, swords: SWORDS, pentacles: PENTACLES };

/** All 78 cards: 22 Major Arcana (0–XXI), then Wands, Cups, Swords, Pentacles (Ace → King). */
export const TAROT_CARDS: TarotCardEntry[] = [...MAJOR_CARDS, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];
for (const c of TAROT_CARDS) c.reversedLean = REVERSED_LEAN[c.slug];

export const TAROT_CARD_SLUGS: string[] = TAROT_CARDS.map((c) => c.slug);

const BY_SLUG = new Map(TAROT_CARDS.map((c) => [c.slug, c]));

export function tarotCardBySlug(slug: string | undefined): TarotCardEntry | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

export function cardsOfSuit(suit: Suit): TarotCardEntry[] {
  return SUIT_CARDS[suit];
}

export const tarotCardPath = (slug: string) => `/tarot/cards/${slug}`;

// Major Arcana links that Waite himself draws in Part II (e.g. Strength wears the Magician's
// sign of life; the Devil's hand reverses the Hierophant's blessing and his chained pair echo
// the Lovers; Justice's pillars recall the High Priestess's; Judgement is compared with
// Temperance; the Wheel and the World share the four living creatures; the Emperor is the
// Empress's counterpart; the Moon follows the Star and precedes the Sun).
const MAJOR_LINKS: Record<string, string[]> = {
  'the-magician': ['strength'],
  strength: ['the-magician'],
  'the-hierophant': ['the-devil', 'the-high-priestess'],
  'the-devil': ['the-hierophant', 'the-lovers'],
  'the-lovers': ['the-devil'],
  'the-high-priestess': ['justice', 'the-empress'],
  justice: ['the-high-priestess'],
  'the-empress': ['the-emperor', 'the-high-priestess'],
  'the-emperor': ['the-empress'],
  temperance: ['judgement'],
  judgement: ['temperance'],
  'wheel-of-fortune': ['the-world'],
  'the-world': ['wheel-of-fortune', 'the-fool'],
  'the-fool': ['the-world'],
  'the-star': ['the-moon', 'the-sun'],
  'the-moon': ['the-star', 'the-sun'],
  'the-sun': ['the-moon', 'the-star'],
  death: ['the-hanged-man'],
  'the-hanged-man': ['death'],
};

/** Related cards for internal linking: neighbours in sequence plus Waite's own cross-references
 *  (majors) or the same rank in the other three suits (minors). Never includes the card itself. */
export function relatedCards(card: TarotCardEntry): TarotCardEntry[] {
  const out: TarotCardEntry[] = [];
  const add = (c: TarotCardEntry | undefined) => {
    if (c && c.slug !== card.slug && !out.some((o) => o.slug === c.slug)) out.push(c);
  };
  if (card.arcana === 'major') {
    add(MAJOR_CARDS[card.number - 1]);
    add(MAJOR_CARDS[card.number + 1]);
    (MAJOR_LINKS[card.slug] ?? []).forEach((s) => add(BY_SLUG.get(s)));
  } else {
    const suit = SUIT_CARDS[card.suit!];
    add(suit[card.number - 2]);
    add(suit[card.number]);
    SUIT_ORDER.filter((s) => s !== card.suit).forEach((s) => add(SUIT_CARDS[s][card.number - 1]));
    // Waite compares the Three of Pentacles with the Eight (the apprentice rewarded).
    if (card.slug === 'three-of-pentacles') add(BY_SLUG.get('eight-of-pentacles'));
    if (card.slug === 'eight-of-pentacles') add(BY_SLUG.get('three-of-pentacles'));
    if (card.slug === 'king-of-swords') add(BY_SLUG.get('justice'));
  }
  return out;
}

export const WAITE_BASE_URL = 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/';
