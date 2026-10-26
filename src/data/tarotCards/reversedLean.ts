// Batch 7 / W5 — yes/no lean of each card when drawn REVERSED. A BornClock reading
// convention (Waite assigned no yes/no), read off Waite's own reversed list for the card
// (Pictorial Key, Part III). A plain "flip the upright lean" rule would contradict Waite for
// cards whose reversed meaning stays good (The Sun: "the same in a lesser sense"; Four of
// Wands: "unaltered"; Eight of Cups: "great joy") or turns bad (Five of Pentacles reversed:
// disorder, chaos). The yes/no tool always softens a reversed lean (it is never "clearly").
import type { YesNoLean } from './types';

export const REVERSED_LEAN: Record<string, YesNoLean> = {
  // Major Arcana
  'the-fool': 'no', 'the-magician': 'no', 'the-high-priestess': 'no', 'the-empress': 'maybe',
  'the-emperor': 'maybe', 'the-hierophant': 'maybe', 'the-lovers': 'no', 'the-chariot': 'no',
  strength: 'no', 'the-hermit': 'no', 'wheel-of-fortune': 'yes', justice: 'no',
  'the-hanged-man': 'no', death: 'no', temperance: 'no', 'the-devil': 'maybe',
  'the-tower': 'no', 'the-star': 'no', 'the-moon': 'maybe', 'the-sun': 'yes',
  judgement: 'maybe', 'the-world': 'no',
  // Wands
  'ace-of-wands': 'no', 'two-of-wands': 'maybe', 'three-of-wands': 'yes', 'four-of-wands': 'yes',
  'five-of-wands': 'no', 'six-of-wands': 'no', 'seven-of-wands': 'no', 'eight-of-wands': 'no',
  'nine-of-wands': 'no', 'ten-of-wands': 'no', 'page-of-wands': 'no', 'knight-of-wands': 'no',
  'queen-of-wands': 'maybe', 'king-of-wands': 'maybe',
  // Cups
  'ace-of-cups': 'no', 'two-of-cups': 'maybe', 'three-of-cups': 'maybe', 'four-of-cups': 'yes',
  'five-of-cups': 'maybe', 'six-of-cups': 'maybe', 'seven-of-cups': 'yes', 'eight-of-cups': 'yes',
  'nine-of-cups': 'maybe', 'ten-of-cups': 'no', 'page-of-cups': 'no', 'knight-of-cups': 'no',
  'queen-of-cups': 'maybe', 'king-of-cups': 'no',
  // Swords
  'ace-of-swords': 'no', 'two-of-swords': 'no', 'three-of-swords': 'no', 'four-of-swords': 'maybe',
  'five-of-swords': 'no', 'six-of-swords': 'maybe', 'seven-of-swords': 'maybe', 'eight-of-swords': 'no',
  'nine-of-swords': 'no', 'ten-of-swords': 'maybe', 'page-of-swords': 'no', 'knight-of-swords': 'no',
  'queen-of-swords': 'no', 'king-of-swords': 'no',
  // Pentacles
  'ace-of-pentacles': 'maybe', 'two-of-pentacles': 'no', 'three-of-pentacles': 'no', 'four-of-pentacles': 'no',
  'five-of-pentacles': 'no', 'six-of-pentacles': 'no', 'seven-of-pentacles': 'no', 'eight-of-pentacles': 'no',
  'nine-of-pentacles': 'no', 'ten-of-pentacles': 'maybe', 'page-of-pentacles': 'no', 'knight-of-pentacles': 'no',
  'queen-of-pentacles': 'no', 'king-of-pentacles': 'no',
};
