// Batch 7 / W5 — shared types for the 78-card tarot reference (/tarot/cards/:slug).
//
// SOURCE: every card's meaning is a plain-English paraphrase of A. E. Waite,
// "The Pictorial Key to the Tarot" (London: Rider, 1910; public domain), read on
// sacred-texts.com (https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/<waiteSlug>)
// on 25 Oct 2026. Part II gives the picture symbolism of the 22 Trumps; Part III gives
// the "divinatory meanings" and "reversed" meanings of all 78 cards. Nothing is copied at
// length — the `waite*` fields are short keyword paraphrases of his lists, and the
// `upright` / `reversed` / `love` / `career` / `money` text is our modern, calm reading of
// those same meanings (tone rules: no fear, no prediction of death, illness or accidents).
// Where Waite lists a grim or medical meaning (e.g. "sickness"), it is deliberately left out.
//
// Yes/no leans are a BornClock reading convention derived from each card's meaning, not
// something Waite wrote; the page says so.

export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type YesNoLean = 'yes' | 'no' | 'maybe';

export interface TarotCardEntry {
  slug: string;
  name: string;
  arcana: Arcana;
  /** Major: 0–21 (Rider–Waite order: VIII Strength, XI Justice). Minor: 1 (Ace) … 14 (King). */
  number: number;
  /** Roman numeral for majors ('0'…'XXI'); rank label for minors ('Ace', 'Two' … 'King'). */
  label: string;
  suit?: Suit;
  emoji: string;
  /** 2–3 sentence direct answer shown first on the page (answer-first layout). */
  answer: string;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  love: string;
  career: string;
  money: string;
  yesNo: YesNoLean;
  yesNoWhy: string;
  /** Lean when the card is drawn reversed (filled in ./index.ts from ./reversedLean.ts). */
  reversedLean?: YesNoLean;
  /** What is in the 1909 Pamela Colman Smith picture, as Waite describes it: [element, meaning]. */
  symbols: [string, string][];
  /** Short paraphrase of Waite's own divinatory list (upright). */
  waiteUpright: string;
  /** Short paraphrase of Waite's reversed list ('' when Waite gives none). */
  waiteReversed: string;
  /** sacred-texts.com chapter slug for the Waite citation. */
  waiteSlug: string;
}
