/**
 * Interactive tarot reading — P4-TAROT-INTERACTIVE.
 * Three free spreads: a daily card and a 3-card love spread over the 22-card Major
 * Arcana, and (Batch 7 / W5) a one-card yes/no draw over the full 78-card deck, each
 * card linking to its own meaning page (/tarot/cards/:slug). `?spread=yes-no` or
 * `?spread=love` opens that tab (canonical stays /tarot-reading — no new URL). The visitor draws their own cards; interpretations are
 * position- and orientation-aware. The daily card is computed at render time
 * (evergreen — no prerendered page per date).
 */
import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CollectionLayout } from '@/components/central';
import { TermTip } from '@/components/vedic/TermTip';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import {
  dailyCard,
  drawCards,
  loveSpread,
  drawFromFullDeck,
  yesNoFullDeck,
  type DrawnCard,
  type FullDeckDraw,
} from '@/lib/tarot/tarotInteractive';
import { tarotCardPath } from '@/data/tarotCards';

type Mode = 'daily' | 'yesno' | 'love';

const SPREAD_PARAM: Record<string, Mode> = { 'yes-no': 'yesno', yesno: 'yesno', love: 'love', daily: 'daily' };

const FAQ_ITEMS = [
  { question: 'How does the tarot draw work?', answer: 'The daily card and the love spread are drawn from the 22-card Major Arcana; the yes/no answer is one card drawn from all 78 cards. Each card can appear upright or reversed, and the reading changes with its orientation and its position in the spread.' },
  { question: 'How does the yes/no tarot work?', answer: 'Hold a yes-or-no question in mind and draw one card from the full 78-card deck. Each card has a lean — yes, no or mixed — based on its traditional meaning; a reversed card turns that lean around and softens it. The answer is a prompt for reflection, not a prediction.' },
  { question: 'Is the daily card the same all day?', answer: 'Yes — the card of the day is fixed for the whole calendar day, so you and a friend drawing on the same day see the same card. It changes at midnight.' },
  { question: 'Can tarot predict the future?', answer: 'Tarot is a reflective tool, not a prediction. It offers a prompt for thinking about a situation from a new angle — it never names dates or guarantees outcomes.' },
  { question: 'What is a reversed card?', answer: 'A reversed (upside-down) card usually softens, blocks or turns inward the card’s upright meaning. It is not simply “bad” — it points to the shadow side or an inner version of the theme.' },
];

function CardFace({ drawn, large }: { drawn: DrawnCard; large?: boolean }) {
  return (
    <div className={`text-center ${large ? '' : ''}`}>
      <div className={large ? 'text-7xl mb-2' : 'text-5xl mb-1'} style={{ transform: drawn.reversed ? 'rotate(180deg)' : undefined }}>
        {drawn.card.emoji}
      </div>
      <p className="font-semibold text-foreground">{drawn.card.name}</p>
      <p className="text-xs text-muted-foreground"><TermTip id="majorArcana">{drawn.card.roman}</TermTip> · <TermTip id="reversedCard">{drawn.reversed ? 'Reversed' : 'Upright'}</TermTip></p>
    </div>
  );
}

export default function TarotReading() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(() => SPREAD_PARAM[params.get('spread') ?? ''] ?? 'daily');
  const today = useMemo(() => dailyCard(), []);
  const [yesNoDraw, setYesNoDraw] = useState<FullDeckDraw | null>(null);
  const [question, setQuestion] = useState('');
  const [loveDraw, setLoveDraw] = useState<DrawnCard[] | null>(null);

  const verdict = yesNoDraw ? yesNoFullDeck(yesNoDraw) : null;
  const spread = loveDraw ? loveSpread(loveDraw) : null;

  return (
    <CollectionLayout
      theme="mystic"
      testId="tarot-reading-page"
      seo={(
        <SEO
          title="Free Interactive Tarot Reading — Daily Card, Yes/No & Love Spread | BornClock"
          description="Draw your own tarot cards free: a daily card and a 3-card love spread from the Major Arcana, plus a one-card yes/no answer from all 78 cards — each card explained."
          keywords="free tarot reading, interactive tarot, daily tarot card, yes no tarot, love tarot spread, tarot online"
          canonicalUrl="/tarot-reading"
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }], current: 'Tarot Reading' }}
      footer={{
        tagline: 'Draw your own tarot — a daily card, a yes/no answer, and a 3-card love spread, free.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Tarot by Birthday', to: '/tarot-card-by-birthday' },
          { label: 'All 78 Cards', to: '/tarot/cards' },
          { label: 'Zodiac Signs', to: '/zodiac' },
          { label: 'Numerology', to: '/numerology' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · A reflective tool, not a prediction.',
      }}
      eyebrow="Interactive Tarot"
      h1="Free Tarot Reading"
      lead="Draw your own cards — a daily card, a yes/no answer, or a 3-card love spread."
    >
      <FAQSchema items={FAQ_ITEMS} />
      <section className="section container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-8 justify-center" role="tablist" aria-label="Tarot spread">
            {([['daily', 'Daily Card'], ['yesno', 'Yes / No'], ['love', 'Love Spread']] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                data-testid={`tarot-tab-${m}`}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? 'bg-[#0E2238] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Daily */}
          {mode === 'daily' && (
            <Card className="glass-card" data-testid="tarot-daily">
              <CardContent className="p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold mb-4 text-foreground">Your <TermTip id="cardOfDay">Card of the Day</TermTip></h2>
                <CardFace drawn={today} large />
                <p className="text-muted-foreground text-sm leading-relaxed mt-4 max-w-xl mx-auto">
                  {today.reversed ? today.card.reversed : today.card.upright}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {today.card.keywords.map((k) => (
                    <span key={k} className="px-2 py-1 bg-[#6E5AA6]/10 text-[#6E5AA6] rounded text-xs">{k}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">This card is the same for everyone today and changes at midnight.</p>
              </CardContent>
            </Card>
          )}

          {/* Yes / No */}
          {mode === 'yesno' && (
            <Card className="glass-card" data-testid="tarot-yesno">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4 text-foreground text-center">Ask a Yes / No Question</h2>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  data-testid="tarot-yesno-question"
                  placeholder="e.g. Should I take the new job?"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-4"
                />
                <div className="text-center">
                  <button
                    onClick={() => setYesNoDraw(drawFromFullDeck())}
                    data-testid="tarot-yesno-draw"
                    className="px-6 py-3 rounded-lg bg-[#0E2238] text-white font-semibold hover:opacity-90"
                  >
                    {yesNoDraw ? 'Draw again' : 'Draw a card'}
                  </button>
                </div>
                {yesNoDraw && verdict && (
                  <div className="mt-6 text-center" data-testid="tarot-yesno-result">
                    {question.trim() && <p className="text-sm text-muted-foreground italic mb-3">“{question.trim()}”</p>}
                    <div className="text-7xl mb-2" style={{ transform: yesNoDraw.reversed ? 'rotate(180deg)' : undefined }}>{yesNoDraw.card.emoji}</div>
                    <p className="font-semibold text-foreground">{yesNoDraw.card.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {yesNoDraw.card.arcana === 'major' ? <TermTip id="majorArcana">Major Arcana</TermTip> : <TermTip id="minorArcana">Minor Arcana</TermTip>} · <TermTip id="reversedCard">{yesNoDraw.reversed ? 'Reversed' : 'Upright'}</TermTip>
                    </p>
                    <p className="text-3xl font-extrabold mt-3 text-foreground" data-testid="tarot-yesno-answer">{verdict.answer}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{verdict.confidence}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-3 max-w-xl mx-auto">{verdict.explanation}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2 max-w-xl mx-auto">{verdict.meaning}</p>
                    <Link to={tarotCardPath(yesNoDraw.card.slug)} className="inline-block mt-3 text-sm underline text-foreground" data-testid="tarot-yesno-card-link">Read the full meaning of {yesNoDraw.card.name} →</Link>
                    <p className="text-xs text-muted-foreground mt-3">One card from all 78. A reflection prompt, not a prediction.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Love spread */}
          {mode === 'love' && (
            <Card className="glass-card" data-testid="tarot-love">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-2 text-foreground text-center">3-Card Love Spread</h2>
                <p className="text-sm text-muted-foreground text-center mb-4">You · The other person · The connection</p>
                <div className="text-center">
                  <button
                    onClick={() => setLoveDraw(drawCards(3))}
                    data-testid="tarot-love-draw"
                    className="px-6 py-3 rounded-lg bg-[#0E2238] text-white font-semibold hover:opacity-90"
                  >
                    {loveDraw ? 'Draw again' : 'Draw three cards'}
                  </button>
                </div>
                {spread && (
                  <div className="mt-6 space-y-6" data-testid="tarot-love-result">
                    <div className="grid grid-cols-3 gap-3">
                      {spread.map((s) => (
                        <div key={s.position}>
                          <CardFace drawn={s.drawn} />
                          <p className="text-xs font-semibold text-center text-foreground mt-1">{s.position}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {spread.map((s) => (
                        <div key={s.position} className="border-b border-border/30 pb-3 last:border-0">
                          <h3 className="font-semibold text-foreground text-sm mb-1">{s.position} — {s.drawn.card.name} {s.drawn.reversed ? '(Reversed)' : ''}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{s.reading}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Links + FAQ */}
          <div className="rounded-lg bg-muted/40 p-5 text-sm text-muted-foreground mt-8">
            Prefer a reading tied to your birth date?{' '}
            <Link to="/tarot-card-by-birthday" className="underline text-foreground">Find your birth-card →</Link>
            <br />
            Want to look a card up?{' '}
            <Link to="/tarot/cards" className="underline text-foreground" data-testid="tarot-all-cards-link">All 78 tarot card meanings →</Link>
          </div>

          <Card className="glass-card mt-8">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 text-foreground">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {FAQ_ITEMS.map((f, i) => (
                  <div key={i} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-foreground mb-1">{f.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </CollectionLayout>
  );
}
