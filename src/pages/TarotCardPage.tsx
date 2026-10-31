/**
 * Batch 7 / W5 — the 78-card tarot reference.
 *   /tarot/cards          → index of all 78 cards
 *   /tarot/cards/:slug    → one card: answer first, then upright, reversed, love / career /
 *                           money, yes-or-no lean, symbolism, Waite's own keywords, related cards.
 * Meanings paraphrase A. E. Waite, The Pictorial Key to the Tarot (1910, public domain) — see
 * src/data/tarotCards/types.ts. Card images (batch 8): the 1909 Rider–Waite–Smith scans by
 * Pamela Colman Smith from Wikimedia Commons, each file's licence checked as "Public domain"
 * by scripts/fetch-tarot-images.mjs (src/data/tarotCards/images.json keeps the file page).
 */
import type { ReactNode } from 'react';
import TAROT_IMAGES from '@/data/tarotCards/images.json';
import { useParams } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { CollectionLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import {
  TAROT_CARDS,
  SUIT_ORDER,
  SUIT_META,
  cardsOfSuit,
  relatedCards,
  tarotCardBySlug,
  tarotCardPath,
  WAITE_BASE_URL,
  type TarotCardEntry,
} from '@/data/tarotCards';
import { TAROT_INDEX_META, tarotCardDescription, tarotCardTitle } from '@/data/tarotCards/meta';
import { reversedLeanText } from '@/lib/tarot/tarotInteractive';

const LEAN_LABEL = { yes: 'Leans yes', no: 'Leans no', maybe: 'Mixed / not yet' } as const;
const LEAN_STYLE = {
  yes: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  no: 'border-rose-300 bg-rose-50 text-rose-800',
  maybe: 'border-amber-300 bg-amber-50 text-amber-800',
} as const;

const FOOTER = {
  tagline: 'Every tarot card, explained plainly — a reflective tool, not a prediction.',
  nav: [
    { label: 'All 78 cards', to: '/tarot/cards/' },
    { label: 'Free tarot reading', to: '/tarot-reading/' },
    { label: 'Tarot by birthday', to: '/tarot-card-by-birthday/' },
    { label: 'Mystic Corner', to: '/mystic-corner/' },
  ],
  note: 'Meanings are paraphrased from A. E. Waite, The Pictorial Key to the Tarot (1910, public domain). Tarot is for reflection; it does not predict events.',
};

function arcanaLine(card: TarotCardEntry) {
  if (card.arcana === 'major') {
    return <>Card {card.label} of the <TermTip id="majorArcana">Major Arcana</TermTip></>;
  }
  const suit = SUIT_META[card.suit!];
  const court = card.number > 10;
  return (
    <>
      {court ? <TermTip id="courtCard">Court card</TermTip> : 'Number card'} · Suit of {suit.name} ({suit.theme}) ·{' '}
      <TermTip id="minorArcana">Minor Arcana</TermTip>
    </>
  );
}

type TarotImage = { src: string; width: number; height: number; commonsPage: string; licence: string; artist: string };
const IMAGES = TAROT_IMAGES as Record<string, TarotImage>;

function CardTile({ card }: { card: TarotCardEntry }) {
  const img = IMAGES[card.slug];
  if (img) {
    return (
      <figure className="mx-auto w-36 shrink-0" data-testid="tarot-card-image">
        <img
          src={img.src}
          width={img.width}
          height={img.height}
          alt={`${card.name} tarot card from the 1909 Rider–Waite–Smith deck`}
          className="w-36 h-auto rounded-lg border border-border shadow-sm"
          loading="eager"
          decoding="async"
        />
        <figcaption className="mt-1 text-[10px] leading-tight text-muted-foreground text-center">
          {img.artist}. <a href={img.commonsPage} target="_blank" rel="noopener noreferrer" className="underline">{img.licence}</a>
        </figcaption>
      </figure>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-28 h-44 rounded-xl border-2 border-brand-purple/40 bg-gradient-to-b from-indigo-950 to-indigo-900 flex flex-col items-center justify-center text-center shadow-sm"
    >
      <span className="text-[10px] tracking-widest text-brand-purple-pale uppercase">{card.arcana === 'major' ? card.label : SUIT_META[card.suit!].name}</span>
      <span className="text-4xl my-2">{card.emoji}</span>
      <span className="text-white text-xs font-semibold px-2 leading-tight">{card.name}</span>
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-xl border border-border p-4 mb-4">
      <h2 className="font-semibold text-foreground mb-2">{title}</h2>
      {children}
    </section>
  );
}

function Chips({ items, tone }: { items: string[]; tone: 'up' | 'down' }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map((k) => (
        <span key={k} className={`px-2 py-0.5 rounded text-xs ${tone === 'up' ? 'bg-brand-purple/10 text-brand-purple-ink' : 'bg-muted text-muted-foreground'}`}>{k}</span>
      ))}
    </div>
  );
}

function TarotIndex() {
  const majors = TAROT_CARDS.filter((c) => c.arcana === 'major');
  const faq = [
    { question: 'How many cards are in a tarot deck?', answer: 'A standard tarot deck has 78 cards: 22 Major Arcana (The Fool to The World) and 56 Minor Arcana in four suits of 14 — Wands, Cups, Swords and Pentacles. Each suit runs Ace to Ten, then Page, Knight, Queen and King.' },
    { question: 'Which deck are these meanings based on?', answer: 'The Rider–Waite–Smith deck of 1909, drawn by Pamela Colman Smith to A. E. Waite’s design. The meanings here are plain-English paraphrases of Waite’s own guide, The Pictorial Key to the Tarot (1910), which is in the public domain.' },
    { question: 'What is the difference between the Major and Minor Arcana?', answer: 'The Major Arcana are the 22 “big theme” cards — life lessons and turning points. The Minor Arcana deal with everyday matters: Wands with energy and work, Cups with feelings, Swords with thoughts and conflict, Pentacles with money, work and the body.' },
    { question: 'Can tarot predict the future?', answer: 'No. Tarot is a reflective tool — a prompt to look at a situation from a new angle. BornClock never treats a card as a prediction of events, health or dates.' },
  ];
  return (
    <CollectionLayout
      theme="mystic"
      testId="tarot-cards-index"
      seo={<SEO title={TAROT_INDEX_META.title} description={TAROT_INDEX_META.description} canonicalUrl="/tarot/cards" ogImage="https://bornclock.com/og/zodiac.png" />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Tarot Reading', to: '/tarot-reading/' }], current: 'All 78 tarot cards' }}
      footer={FOOTER}
      eyebrow="Tarot card meanings"
      h1="All 78 Tarot Cards and Their Meanings"
      lead="A tarot deck has 78 cards: 22 Major Arcana for life’s big themes and 56 Minor Arcana for everyday matters. Pick any card for its upright and reversed meaning, what it says about love, career and money, and whether it leans yes or no."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground mb-6">
            Have a question in mind? <Link to="/tarot-reading/?spread=yes-no" className="underline text-foreground">Draw one card for a yes / no answer →</Link>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1">The <TermTip id="majorArcana">Major Arcana</TermTip> (22 cards)</h2>
          <p className="text-sm text-muted-foreground mb-3">Numbered 0 to XXI in the Rider–Waite order (VIII Strength, XI Justice).</p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-8" data-testid="tarot-index-major">
            {majors.map((c) => (
              <li key={c.slug}>
                <Link to={tarotCardPath(c.slug)} className="block rounded-lg border border-border p-3 hover:shadow-sm transition h-full">
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                  <span className="block font-semibold text-foreground text-sm">{c.emoji} {c.name}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{c.keywords.slice(0, 3).join(', ')}</span>
                </Link>
              </li>
            ))}
          </ul>

          {SUIT_ORDER.map((s) => (
            <div key={s} className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-1">Suit of {SUIT_META[s].name} (14 cards)</h2>
              <p className="text-sm text-muted-foreground mb-3">Part of the <TermTip id="minorArcana">Minor Arcana</TermTip> — {SUIT_META[s].theme}.</p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2" data-testid={`tarot-index-${s}`}>
                {cardsOfSuit(s).map((c) => (
                  <li key={c.slug}>
                    <Link to={tarotCardPath(c.slug)} className="block rounded-lg border border-border p-3 hover:shadow-sm transition h-full">
                      <span className="block font-semibold text-foreground text-sm">{c.name}</span>
                      <span className="block text-xs text-muted-foreground mt-1">{c.keywords.slice(0, 3).join(', ')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-xs text-muted-foreground mb-8">
            Source: A. E. Waite, <a className="underline" href={WAITE_BASE_URL} target="_blank" rel="noopener noreferrer">The Pictorial Key to the Tarot</a> (London, 1910; public domain), paraphrased in plain English. Card pictures are not shown.
          </p>

          <PageFAQ items={faq} />
        </div>
      </section>
    </CollectionLayout>
  );
}

function TarotCardDetail({ card }: { card: TarotCardEntry }) {
  const related = relatedCards(card);
  const path = tarotCardPath(card.slug);
  const faq = [
    { question: `What does ${card.name} mean upright?`, answer: card.upright },
    { question: `What does ${card.name} mean reversed?`, answer: card.reversed },
    { question: `Is ${card.name} a yes or no card?`, answer: `Upright: ${LEAN_LABEL[card.yesNo].toLowerCase()}. ${card.yesNoWhy} ${reversedLeanText(card)} (This is BornClock’s reading convention, based on the card’s meaning — a prompt for reflection, not a prediction.)` },
    { question: `What does ${card.name} mean in love?`, answer: card.love },
    { question: `What does ${card.name} mean for career and money?`, answer: `${card.career} ${card.money}` },
  ];
  return (
    <CollectionLayout
      theme="mystic"
      testId="tarot-card-page"
      seo={<SEO title={tarotCardTitle(card)} description={tarotCardDescription(card)} canonicalUrl={path} ogImage="https://bornclock.com/og/zodiac.png" />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Tarot cards', to: '/tarot/cards/' }], current: card.name }}
      footer={FOOTER}
      eyebrow={card.arcana === 'major' ? `Major Arcana · ${card.label}` : `Minor Arcana · ${SUIT_META[card.suit!].name}`}
      h1={`${card.name} Tarot Card Meaning`}
      lead={card.answer}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-6" data-testid="tarot-card-summary">
            <CardTile card={card} />
            <div className="flex-1 w-full">
              <p className="text-sm text-muted-foreground">{arcanaLine(card)}</p>
              <p className="mt-3 text-sm"><span className="font-semibold text-foreground">Upright keywords:</span></p>
              <Chips items={card.keywords} tone="up" />
              <p className="mt-3 text-sm"><span className="font-semibold text-foreground">Reversed keywords:</span></p>
              <Chips items={card.reversedKeywords} tone="down" />
              <div className="mt-4">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${LEAN_STYLE[card.yesNo]}`} data-testid="tarot-card-lean">Yes / no: {LEAN_LABEL[card.yesNo]}</span>
              </div>
            </div>
          </div>

          <Section title={`${card.name} upright`} id="upright">
            <p className="text-sm text-muted-foreground leading-relaxed">{card.upright}</p>
          </Section>
          <Section title={`${card.name} reversed`} id="reversed">
            <p className="text-sm text-muted-foreground leading-relaxed">{card.reversed}</p>
            <p className="text-xs text-muted-foreground mt-2">A <TermTip id="reversedCard">reversed card</TermTip> is one drawn upside-down.</p>
          </Section>

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {([['Love', card.love], ['Career', card.career], ['Money', card.money]] as const).map(([t, v]) => (
              <div key={t} className="rounded-xl border border-border p-4">
                <h2 className="font-semibold text-foreground mb-1 text-sm">{card.name} in {t.toLowerCase()}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{v}</p>
              </div>
            ))}
          </div>

          <Section title={`Is ${card.name} a yes or no?`} id="yes-no">
            <p className="text-sm text-muted-foreground leading-relaxed"><strong className="text-foreground">Upright: {LEAN_LABEL[card.yesNo]}.</strong> {card.yesNoWhy}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1" data-testid="tarot-card-reversed-lean"><strong className="text-foreground">Reversed:</strong> {reversedLeanText(card)}</p>
            <p className="text-xs text-muted-foreground mt-2">The yes/no lean is BornClock’s reading convention drawn from the card’s meaning — Waite himself did not assign one.</p>
            <Link to="/tarot-reading/?spread=yes-no" className="inline-block mt-3 text-sm underline text-foreground">Ask your own question — draw one card →</Link>
          </Section>

          <Section title={`Symbolism in the ${card.name} card`} id="symbolism">
            <p className="text-xs text-muted-foreground mb-2">What appears in the 1909 Rider–Waite–Smith picture, as Waite describes it:</p>
            <ul className="space-y-1.5">
              {card.symbols.map(([el, meaning]) => (
                <li key={el} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{el}</span> — {meaning}</li>
              ))}
            </ul>
          </Section>

          <Section title="In Waite’s own words (paraphrased)" id="waite">
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Upright:</span> {card.waiteUpright}.</p>
            <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Reversed:</span> {card.waiteReversed ? `${card.waiteReversed}.` : 'Waite gives no reversed meaning for this card.'}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Source: A. E. Waite, <a className="underline" href={`${WAITE_BASE_URL}${card.waiteSlug}`} target="_blank" rel="noopener noreferrer">The Pictorial Key to the Tarot</a> (1910, public domain). Some of Waite’s 1910 fortune-telling meanings are old-fashioned; the plain-English reading above is ours.
            </p>
          </Section>

          <h2 className="font-semibold text-foreground mt-6 mb-2">Related cards</h2>
          <div className="flex flex-wrap gap-2 mb-8" data-testid="tarot-related">
            {related.map((r) => (
              <Link key={r.slug} to={tarotCardPath(r.slug)} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{r.emoji} {r.name}</Link>
            ))}
            <Link to="/tarot/cards/" className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">All 78 cards</Link>
          </div>

          <PageFAQ items={faq} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center mb-6">
            <p className="text-muted-foreground mb-3">Draw your own card — a daily card, a yes/no answer or a love spread.</p>
            <Link to="/tarot-reading/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free tarot reading →</Link>
          </div>
        </div>
      </section>
    </CollectionLayout>
  );
}

export default function TarotCardPage() {
  const { slug } = useParams<{ slug: string }>();
  const card = tarotCardBySlug(slug);
  if (!card) return <TarotIndex />;
  return <TarotCardDetail card={card} />;
}
