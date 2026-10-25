// Batch 7 / W5 — builds the fixed fields (slug, name, label, emoji, Waite chapter slug)
// for a Minor Arcana card so the per-suit files only hold the authored text.
import type { Suit, TarotCardEntry } from './types';

export const RANK_LABELS = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'] as const;

export const SUIT_META: Record<Suit, { name: string; emoji: string; theme: string }> = {
  // Suit themes follow the site's existing glossary entry (termDefinitions.ts → minorArcana).
  wands: { name: 'Wands', emoji: '🌿', theme: 'energy, drive and work' },
  cups: { name: 'Cups', emoji: '🍷', theme: 'feelings and relationships' },
  swords: { name: 'Swords', emoji: '⚔️', theme: 'thoughts, words and conflict' },
  pentacles: { name: 'Pentacles', emoji: '🪙', theme: 'money, work and the body' },
};

type Authored = Omit<TarotCardEntry, 'slug' | 'name' | 'arcana' | 'number' | 'label' | 'suit' | 'emoji' | 'waiteSlug'>;

export function minorCard(suit: Suit, number: number, o: Authored): TarotCardEntry {
  const label = RANK_LABELS[number];
  const slug = `${label.toLowerCase()}-of-${suit}`;
  return {
    ...o,
    slug,
    name: `${label} of ${SUIT_META[suit].name}`,
    arcana: 'minor',
    number,
    label,
    suit,
    emoji: SUIT_META[suit].emoji,
    waiteSlug: slug,
  };
}
