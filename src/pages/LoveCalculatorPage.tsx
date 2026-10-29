/**
 * /love-calculator — name compatibility "just for fun" (Batch 10). Deterministic Chaldean
 * name numbers + the site's friendly-number table (src/lib/nameLove.ts); clearly NOT an
 * astrology prediction, with links to real Kundali matching.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { ToolFaq, ToolSources } from '@/components/tools/ToolFaq';
import { nameLove, type NameLoveResult, type NameLoveSide } from '@/lib/nameLove';

export const LOVE_PATH = '/love-calculator';
export const LOVE_META = {
  title: 'Love Calculator by Name — Just for Fun, No Random | BornClock',
  description: 'A love calculator by name that is honest: each name’s Chaldean number and how the two numbers get along, the same result every time. For fun — use Kundali matching for real matching.',
};

const FAQ = [
  { q: 'Is this love calculator accurate?', a: 'It is for fun, not a prediction. It turns each name into its Chaldean numerology number and tells you how the two numbers get along in the traditional table. A name number cannot tell how a real relationship will go — kindness, respect and communication do that.' },
  { q: 'Why do I get the same result every time?', a: 'Because there is no random draw. The result depends only on the letters of the two names, so the same two names always give the same answer, and swapping their order changes nothing.' },
  { q: 'How are the name numbers worked out?', a: 'Each letter has a Chaldean value from 1 to 8 (A, I, J, Q, Y = 1; B, K, R = 2; C, G, L, S = 3; D, M, T = 4; E, H, N, X = 5; U, V, W = 6; O, Z = 7; F, P = 8). The values are added and the total reduced to one digit. The two digits are then looked up in the friendly-number table our name-correction tool uses.' },
  { q: 'How do I check real marriage compatibility?', a: 'Use Kundali matching (Guna Milan) with both birth dates, times and places — it compares the two birth charts on 36 traditional points and checks Manglik status. If you only have names, Kundli milan by name gives a rough version based on each name’s first syllable.' },
];

const TIER_STYLE: Record<NameLoveResult['tier'], string> = {
  same: 'border-primary/50 bg-primary/5',
  harmonious: 'border-emerald-500/40 bg-emerald-500/5',
  growth: 'border-amber-500/40 bg-amber-500/5',
};

function Side({ s, testId }: { s: NameLoveSide; testId: string }) {
  return (
    <div className="rounded-lg border border-border p-3 text-sm" data-testid={testId}>
      <div className="text-xs text-muted-foreground truncate">{s.name}</div>
      <div className="text-3xl font-black text-primary">{s.number}</div>
      <div className="text-xs text-muted-foreground">Chaldean total {s.total} → {s.number} · {s.planet}</div>
      <div className="text-xs text-muted-foreground">{s.keyword}</div>
    </div>
  );
}

export default function LoveCalculatorPage() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [r, setR] = useState<NameLoveResult | null>(null);
  const go = () => setR(nameLove(a, b));

  return (
    <ToolLayout
      theme="mystic"
      testId="love-calculator-page"
      seo={<SEO title={LOVE_META.title} description={LOVE_META.description}
        keywords="love calculator, love calculator by name, name compatibility calculator, love compatibility by name, numerology love calculator"
        canonicalUrl={LOVE_PATH} />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Love calculator' }}
      footer={{ tagline: 'Name compatibility, just for fun.', nav: [{ label: 'Kundali matching', to: '/kundali-match' }, { label: 'Kundli milan by name', to: '/kundli-milan-by-name' }, { label: 'Zodiac compatibility', to: '/compatibility' }] }}
      eyebrow="Just for fun · Numerology"
      h1="Love Calculator by Name"
      lead="Type two names to see each name’s numerology number and how the two numbers get along. It is a bit of fun — the same names always give the same answer, and it is not an astrology prediction."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Your name</span>
                <input data-testid="love-a" value={a} onChange={e => setA(e.target.value)} placeholder="e.g. Priya Sharma" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Their name</span>
                <input data-testid="love-b" value={b} onChange={e => setB(e.target.value)} placeholder="e.g. Rahul Verma" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
            </div>
            <button data-testid="love-go" onClick={go} disabled={!/[a-z]/i.test(a) || !/[a-z]/i.test(b)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">Check name compatibility</button>
            <p className="text-xs text-muted-foreground">Names in English letters. Nothing you type is saved.</p>
          </div>

          {r && (
            <div className="mb-8" data-testid="love-result">
              <div className={`rounded-2xl border p-5 mb-4 ${TIER_STYLE[r.tier]}`}>
                <div className="text-xs text-muted-foreground mb-1">Just for fun</div>
                <div className="text-2xl font-bold text-foreground mb-2" data-testid="love-headline">{r.headline}</div>
                <p className="text-foreground" data-testid="love-text">{r.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Side s={r.a} testId="love-side-a" />
                <Side s={r.b} testId="love-side-b" />
              </div>
              <div className="rounded-xl border border-border p-4 text-sm" data-testid="love-real">
                <p className="text-foreground font-semibold mb-1">Thinking about marriage?</p>
                <p className="text-muted-foreground mb-3">Real matching compares the two birth charts, not names: <TermTip id="ashtakoota">Guna Milan</TermTip> (36 points) and <TermTip id="manglik">Manglik</TermTip> status from birth date, time and place.</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/kundali-match" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Kundali matching →</Link>
                  <Link to="/kundli-milan-by-name" className="inline-flex items-center gap-2 border border-border rounded-lg px-5 py-2 font-semibold text-foreground">Kundli milan by name →</Link>
                </div>
              </div>
            </div>
          )}

          <ToolFaq items={FAQ} title="Questions about the love calculator" testId="love-faq" />
          <ToolSources testId="love-sources" items={[
            { label: 'Chaldean letter values and name number', note: 'the same calculation as our name numerology page (/name-numerology)' },
            { label: 'Friendly-number table', note: 'the classical planetary friendships of the numbers’ ruling planets, as used by our name-correction tool (/name-correction)' },
          ]} />
        </div>
      </section>
    </ToolLayout>
  );
}
