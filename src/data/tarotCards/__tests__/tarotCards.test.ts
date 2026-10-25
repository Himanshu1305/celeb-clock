import { describe, it, expect } from 'vitest';
import {
  TAROT_CARDS,
  TAROT_CARD_SLUGS,
  SUIT_ORDER,
  cardsOfSuit,
  relatedCards,
  tarotCardBySlug,
} from '@/data/tarotCards';
import { tarotMetaMap, tarotCardTitle, tarotCardDescription } from '@/data/tarotCards/meta';
import { TAROT_DECK } from '@/data/tarotDeck';
import committedMeta from '@/data/tarotCards/tarotMeta.json';

// Batch 7 / W5 — the 78-card reference (/tarot/cards/:slug).
// Meanings: paraphrases of A. E. Waite, The Pictorial Key to the Tarot (1910), see types.ts.

const { getAllRoutes } = await import('../../../../scripts/prerender-routes.mjs');
const routes: string[] = await getAllRoutes();
const { getTitleForRoute } = await import('../../../../scripts/prerender-titles.mjs');

const TEXT_FIELDS = ['answer', 'upright', 'reversed', 'love', 'career', 'money', 'yesNoWhy'] as const;

describe('W5 tarot deck — structure', () => {
  it('has all 78 cards: 22 Major Arcana in Rider–Waite order + 4 suits of 14', () => {
    expect(TAROT_CARDS).toHaveLength(78);
    const majors = TAROT_CARDS.filter((c) => c.arcana === 'major');
    expect(majors).toHaveLength(22);
    majors.forEach((c, i) => expect(c.number).toBe(i));
    expect(majors[8].name).toBe('Strength'); // VIII in the Rider–Waite deck
    expect(majors[11].name).toBe('Justice'); // XI in the Rider–Waite deck
    for (const s of SUIT_ORDER) {
      const suit = cardsOfSuit(s);
      expect(suit).toHaveLength(14);
      suit.forEach((c, i) => {
        expect(c.number).toBe(i + 1);
        expect(c.suit).toBe(s);
      });
      expect(suit[0].slug).toBe(`ace-of-${s}`);
      expect(suit[13].slug).toBe(`king-of-${s}`);
    }
  });

  it('slugs and names are unique and URL-safe', () => {
    expect(new Set(TAROT_CARD_SLUGS).size).toBe(78);
    expect(new Set(TAROT_CARDS.map((c) => c.name)).size).toBe(78);
    TAROT_CARD_SLUGS.forEach((s) => expect(s).toMatch(/^[a-z]+(-[a-z]+)*$/));
    expect(tarotCardBySlug('the-fool')?.name).toBe('The Fool');
    expect(tarotCardBySlug('page-of-cups')?.name).toBe('Page of Cups');
    expect(tarotCardBySlug('nope')).toBeUndefined();
  });

  it('every card has a full set of content', () => {
    for (const c of TAROT_CARDS) {
      for (const f of TEXT_FIELDS) expect(c[f].length, `${c.slug}.${f}`).toBeGreaterThan(f === 'yesNoWhy' ? 10 : 25);
      expect(c.keywords.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.reversedKeywords.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.symbols.length, c.slug).toBeGreaterThanOrEqual(1);
      expect(c.waiteUpright.length, c.slug).toBeGreaterThan(5);
      expect(['yes', 'no', 'maybe']).toContain(c.yesNo);
      expect(c.waiteSlug, c.slug).toMatch(/^[a-z0-9-]+$/);
      // answer-first: the direct answer names the card and is 2–3 sentences
      expect(c.answer, c.slug).toContain(c.name);
      const sentences = c.answer.split(/(?<=[.!?])\s+/).filter(Boolean).length;
      expect(sentences, `${c.slug} answer sentences`).toBeGreaterThanOrEqual(2);
      expect(sentences, `${c.slug} answer sentences`).toBeLessThanOrEqual(3);
    }
  });

  it('only the Two of Cups lacks a Waite reversed meaning (Waite gives none)', () => {
    expect(TAROT_CARDS.filter((c) => !c.waiteReversed).map((c) => c.slug)).toEqual(['two-of-cups']);
  });

  it('Major Arcana yes/no leans agree with the interactive reader deck', () => {
    TAROT_DECK.forEach((d) => {
      const c = TAROT_CARDS[d.index];
      expect(c.name).toBe(d.name);
      expect(c.yesNo, c.name).toBe(d.yesNo);
    });
  });
});

describe('W5 tarot deck — every page is genuinely distinct (no swapped-name templates)', () => {
  it.each(TEXT_FIELDS)('%s text is unique across all 78 cards, even with the card name removed', (f) => {
    const norm = TAROT_CARDS.map((c) => c[f].split(c.name).join('#').toLowerCase().replace(/\s+/g, ' '));
    expect(new Set(norm).size).toBe(78);
  });

  it('keyword sets and symbol lists are unique per card', () => {
    expect(new Set(TAROT_CARDS.map((c) => c.keywords.join('|'))).size).toBe(78);
    expect(new Set(TAROT_CARDS.map((c) => c.symbols.map((s) => s[0]).join('|'))).size).toBe(78);
  });
});

describe('W5 tarot deck — tone rules (calm, no fear, no health/death predictions)', () => {
  const FEAR = /\b(sickness|sick|disease|illness|accident|miscarriage|widow\w*|you will die|fatal|curse)\b/i;
  it('no fear or medical words in any user-facing text', () => {
    for (const c of TAROT_CARDS) {
      const all = [...TEXT_FIELDS.map((f) => c[f]), c.waiteUpright, c.waiteReversed, ...c.keywords, ...c.reversedKeywords, ...c.symbols.flat()].join(' ');
      expect(FEAR.test(all), c.slug).toBe(false);
    }
  });
  it('"death" appears only to say the cards are NOT about physical death', () => {
    for (const c of TAROT_CARDS) {
      if (c.slug === 'death') continue;
      for (const f of TEXT_FIELDS) {
        const t = c[f];
        if (/\bdeath\b/i.test(t)) expect(t, `${c.slug}.${f}`).toMatch(/not (a card of|a sign of|specifically)?\s*(violent )?death|not death|life, not death/i);
      }
    }
    expect(tarotCardBySlug('death')!.answer).toMatch(/almost never means physical death/);
  });
});

describe('W5 tarot pages — routes, titles and sitemap', () => {
  it('index + all 78 card pages are in the prerender list (= sitemap source)', () => {
    expect(routes).toContain('/tarot/cards');
    for (const s of TAROT_CARD_SLUGS) expect(routes).toContain(`/tarot/cards/${s}`);
    expect(routes.filter((r) => r.startsWith('/tarot/cards/'))).toHaveLength(78);
  });

  it('committed tarotMeta.json matches the page meta (run `npx tsx scripts/gen-tarot-meta.mts`)', () => {
    expect(committedMeta).toEqual(tarotMetaMap());
  });

  it('the prerender injects the same title/description the page sets', () => {
    for (const c of TAROT_CARDS) {
      const m = getTitleForRoute(`/tarot/cards/${c.slug}`);
      expect(m.title).toBe(tarotCardTitle(c));
      expect(m.description).toBe(tarotCardDescription(c));
    }
    expect(getTitleForRoute('/tarot/cards').title).toContain('78');
  });

  it('titles are ≤ 70 chars, branded and unique; descriptions unique', () => {
    const meta = Object.values(tarotMetaMap());
    meta.forEach((m) => {
      expect(m.title.length, m.title).toBeLessThanOrEqual(70);
      expect(m.title).toContain('BornClock');
    });
    expect(new Set(meta.map((m) => m.title)).size).toBe(meta.length);
    expect(new Set(meta.map((m) => m.description)).size).toBe(meta.length);
  });

  // Sprint rule: no two sitemap URLs may share a title. On 25 Oct 2026 the base (main
  // 3f0581e) already had 21 pre-existing pairs outside tarot — 20 celebrity slugs listed
  // twice (e.g. /celebrity/virat-kohli and /celebrity/virat-kohli-1988) and /planetary-age
  // vs /articles/planetary-age-calculator. They are reported for the founder, not changed
  // here (other workstreams' scope). This test fails on ANY new duplicate; when one of the
  // known pairs is fixed, delete it from the list.
  const KNOWN_PRE_EXISTING_DUPLICATE_ROUTES = new Set([
    '/articles/planetary-age-calculator',
    ...['dayananda-saraswati-1824', 'ajith-kumar-1971', 'mani-ratnam-1956', 'vijay-1974', 'leander-paes-1973',
      'sonu-nigam-1973', 'bhuvneshwar-kumar-1990', 'virat-kohli-1988', 'rajesh-khanna-1942', 'dilip-kumar-1922',
      'mohammed-rafi-1924', 'neeraj-chopra-1997', 'rajinikanth-1950', 'yuvraj-singh-1981', 'pranab-mukherjee-1935',
      'osho-rajneesh-1931', 'subramania-bharati-1882', 'dhirubhai-ambani-1932', 'ratan-tata-1937', 'nayanthara-1984',
    ].map((s) => `/celebrity/${s}`),
  ]);
  it('no two sitemap URLs share the same prerender title (beyond the known pre-existing pairs)', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const r of routes) {
      const m = getTitleForRoute(r);
      if (!m?.title) continue;
      const prev = seen.get(m.title);
      if (prev && !KNOWN_PRE_EXISTING_DUPLICATE_ROUTES.has(r)) dupes.push(`${prev} = ${r} (${m.title})`);
      if (!prev) seen.set(m.title, r);
    }
    expect(dupes).toEqual([]);
  });
});

describe('W5 related-card links', () => {
  it('every card links to 2+ other real cards and never to itself', () => {
    for (const c of TAROT_CARDS) {
      const rel = relatedCards(c);
      expect(rel.length, c.slug).toBeGreaterThanOrEqual(2);
      rel.forEach((r) => {
        expect(r.slug).not.toBe(c.slug);
        expect(tarotCardBySlug(r.slug)).toBeTruthy();
      });
    }
  });
  it('minor cards link to the same rank in the other three suits', () => {
    const rel = relatedCards(tarotCardBySlug('five-of-cups')!).map((r) => r.slug);
    expect(rel).toEqual(expect.arrayContaining(['four-of-cups', 'six-of-cups', 'five-of-wands', 'five-of-swords', 'five-of-pentacles']));
  });
  it('Waite’s own cross-references are linked (Devil ↔ Lovers, Strength ↔ Magician)', () => {
    expect(relatedCards(tarotCardBySlug('the-devil')!).map((r) => r.slug)).toContain('the-lovers');
    expect(relatedCards(tarotCardBySlug('strength')!).map((r) => r.slug)).toContain('the-magician');
  });
});
