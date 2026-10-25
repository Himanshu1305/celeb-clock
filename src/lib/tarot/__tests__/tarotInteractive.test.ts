import { describe, it, expect } from 'vitest';
import { TAROT_DECK } from '@/data/tarotDeck';
import {
  mulberry32,
  dateSeed,
  drawCards,
  dailyCard,
  yesNoVerdict,
  loveSpread,
  LOVE_POSITIONS,
} from '@/lib/tarot/tarotInteractive';

describe('P4-TAROT-INTERACTIVE deck', () => {
  it('TC-TAROT-01: deck is the full 22-card Major Arcana in order', () => {
    expect(TAROT_DECK).toHaveLength(22);
    TAROT_DECK.forEach((c, i) => {
      expect(c.index).toBe(i);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.upright.length).toBeGreaterThan(20);
      expect(c.reversed.length).toBeGreaterThan(10);
      expect(['yes', 'no', 'maybe']).toContain(c.yesNo);
    });
  });

  it('TC-TAROT-02: Death card is framed as transformation, not literal death', () => {
    const death = TAROT_DECK.find((c) => c.name === 'Death')!;
    expect(death).toBeTruthy();
    expect(/\bkill|\bdie\b|\bdeath of you|mortal/i.test(death.upright)).toBe(false);
    expect(/transform|ending|change|renew|release/i.test(death.upright)).toBe(true);
  });
});

describe('P4-TAROT-INTERACTIVE draw mechanics', () => {
  it('TC-TAROT-03: drawCards returns N unique cards', () => {
    const rng = mulberry32(42);
    const three = drawCards(3, rng);
    expect(three).toHaveLength(3);
    const idxs = three.map((d) => d.card.index);
    expect(new Set(idxs).size).toBe(3);
  });

  it('TC-TAROT-04: dailyCard is deterministic per calendar day', () => {
    const d1 = dailyCard(new Date(2026, 9, 9));
    const d2 = dailyCard(new Date(2026, 9, 9));
    const d3 = dailyCard(new Date(2026, 9, 10));
    expect(d1.card.index).toBe(d2.card.index);
    expect(d1.reversed).toBe(d2.reversed);
    // different day -> (very likely) different draw; at least the seed differs
    expect(dateSeed(new Date(2026, 9, 9))).not.toBe(dateSeed(new Date(2026, 9, 10)));
    expect(typeof d3.card.index).toBe('number');
  });

  it('TC-TAROT-05: yes/no verdict flips & weakens when reversed', () => {
    const yesCard = TAROT_DECK.find((c) => c.yesNo === 'yes')!;
    const up = yesNoVerdict({ card: yesCard, reversed: false });
    const rev = yesNoVerdict({ card: yesCard, reversed: true });
    expect(up.answer).toBe('Yes');
    expect(up.confidence).toBe('strong');
    expect(rev.answer).not.toBe('Yes'); // flipped/weakened
    expect(up.explanation).toContain(yesCard.name);
  });

  it('TC-TAROT-06: maybe cards read as Maybe/mixed upright', () => {
    const maybeCard = TAROT_DECK.find((c) => c.yesNo === 'maybe')!;
    const v = yesNoVerdict({ card: maybeCard, reversed: false });
    expect(v.answer).toBe('Maybe');
  });

  it('TC-TAROT-07: love spread gives 3 position-aware readings', () => {
    const rng = mulberry32(7);
    const spread = loveSpread(drawCards(3, rng));
    expect(spread).toHaveLength(3);
    spread.forEach((s, i) => {
      expect(s.position).toBe(LOVE_POSITIONS[i]);
      expect(s.reading).toContain(s.drawn.card.name);
      expect(s.reading.length).toBeGreaterThan(40);
    });
  });
});

// Batch 7 / W5 — the yes/no tab draws one card from all 78 (src/data/tarotCards).
import { drawFromFullDeck, yesNoFullDeck } from '@/lib/tarot/tarotInteractive';
import { TAROT_CARDS, tarotCardBySlug } from '@/data/tarotCards';

describe('W5 yes/no over the full 78-card deck', () => {
  it('TC-TAROT-08: draws can reach Minor Arcana cards and are reproducible with a seed', () => {
    const a = drawFromFullDeck(mulberry32(123));
    const b = drawFromFullDeck(mulberry32(123));
    expect(a.card.slug).toBe(b.card.slug);
    expect(a.reversed).toBe(b.reversed);
    const seen = new Set<string>();
    const rng = mulberry32(99);
    for (let i = 0; i < 2000; i++) seen.add(drawFromFullDeck(rng).card.slug);
    expect(seen.size).toBe(TAROT_CARDS.length); // every one of the 78 cards is reachable
  });

  it('TC-TAROT-09: verdict follows the card lean and flips/softens when reversed', () => {
    const sun = tarotCardBySlug('the-sun')!;
    expect(yesNoFullDeck({ card: sun, reversed: false })).toMatchObject({ answer: 'Yes', confidence: 'strong' });
    // Waite: The Sun reversed is "the same in a lesser sense" → still yes, but softened.
    expect(yesNoFullDeck({ card: sun, reversed: true })).toMatchObject({ answer: 'Yes', confidence: 'leaning' });
    // Waite: Five of Pentacles reversed = disorder, chaos → no (a blind flip would wrongly say yes).
    expect(yesNoFullDeck({ card: tarotCardBySlug('five-of-pentacles')!, reversed: true }).answer).toBe('No');
    // A reversed draw is never "clearly".
    for (const c of TAROT_CARDS) expect(yesNoFullDeck({ card: c, reversed: true }).confidence).not.toBe('strong');
    const tenSwords = tarotCardBySlug('ten-of-swords')!;
    expect(yesNoFullDeck({ card: tenSwords, reversed: false }).answer).toBe('No');
    const twoSwords = tarotCardBySlug('two-of-swords')!;
    expect(yesNoFullDeck({ card: twoSwords, reversed: false }).answer).toBe('Maybe');
  });

  it('TC-TAROT-11: every card has a reversed lean', () => {
    for (const c of TAROT_CARDS) expect(['yes', 'no', 'maybe'], c.slug).toContain(c.reversedLean);
  });

  it('TC-TAROT-10: explanation names the card and orientation and shows that orientation’s meaning', () => {
    const c = tarotCardBySlug('page-of-cups')!;
    const v = yesNoFullDeck({ card: c, reversed: true });
    expect(v.explanation).toContain('Page of Cups (reversed)');
    expect(v.meaning).toBe(c.reversed);
    expect(v.keywords).toEqual(c.reversedKeywords);
  });
});
