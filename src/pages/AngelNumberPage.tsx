/**
 * Angel number detail page — /angel-numbers/:number (Batch 7, W6).
 *
 * One page per sequence in src/data/angelNumbers.ts (000 … 2222). Answer-first layout:
 * a 2–3 sentence direct answer, then meaning, love, career, twin flame, what to do,
 * numerology (computed with the ONE sitewide Life Path module) and an honest "is it a
 * sign?" note. Every meaning is a paraphrase of named popular sources, listed on the
 * page. Popular belief — never a prediction.
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import {
  ANGEL_NUMBERS, ANGEL_SEO, angelBySequence, angelNumerology, angelTitle, lifePathLabel, numerologyText,
  type AngelNumber,
} from '@/data/angelNumbers';
import { lifePathWorking } from '@/lib/lifePath';
import { palette } from '../theme/palette';

const ACCENT = palette.purple;

const FOOTER = {
  tagline: 'Angel numbers explained honestly — a modern spiritual belief, not numerology from a birthday.',
  nav: [
    { label: 'All angel numbers', to: '/angel-numbers/' },
    { label: 'Numerology calculator', to: '/numerology/' },
    { label: 'Personal Year Number', to: '/personal-year-number/' },
    { label: 'Mystic Corner', to: '/mystic-corner/' },
    { label: 'Privacy', to: '/privacy/' },
  ],
  note: '© 2026 BornClock · Popular belief, presented honestly — not a prediction.',
};

function LifePathCheck({ a }: { a: AngelNumber }) {
  const [dob, setDob] = useState('');
  const n = angelNumerology(a.sequence);
  let result: { lp: number; steps: string } | null = null;
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const w = lifePathWorking(Number(m[3]), Number(m[2]), Number(m[1]));
    result = { lp: w.number, steps: w.steps };
  }
  return (
    <div className="rounded-xl border border-border p-4 mt-3" data-testid="angel-lifepath-check">
      <label htmlFor="angel-dob" className="block text-sm font-semibold text-foreground mb-2">
        Does {a.sequence} share your Life Path number?
      </label>
      <input
        id="angel-dob"
        type="date"
        value={dob}
        onChange={e => setDob(e.target.value)}
        className="w-full sm:w-auto border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
      />
      {result && (
        <div className="mt-3 text-sm text-foreground leading-relaxed" data-testid="angel-lifepath-result">
          <p>
            Your <TermTip id="lifePath">Life Path number</TermTip> is <strong>{result.lp}</strong>{' '}
            <span className="text-muted-foreground">({result.steps})</span>.
          </p>
          <p className="mt-1">
            {n.isLifePathNumber && n.root === result.lp
              ? <>The digits of {a.sequence} also reduce to {n.root}, so they share your number theme. That is a fun overlap, not a personal message — {a.sequence} means the same for everyone in angel-number belief.</>
              : <>{n.isLifePathNumber ? <>The digits of {a.sequence} reduce to {n.root}, a different theme from yours.</> : <>{a.sequence} reduces to 0, which is not a Life Path number.</>}{' '}Angel numbers are not calculated from a birth date, so this does not change what {a.sequence} is said to mean.</>}
          </p>
          <p className="mt-1">
            <Link to={`/numerology/${result.lp}`} className="hover:underline" style={{ color: ACCENT }}>Read about Life Path {result.lp} →</Link>
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        Uses the same Life Path method as our <Link to="/numerology/" className="underline">numerology calculator</Link> (day, month and year reduced separately, keeping 11, 22 and 33). Your date stays in your browser.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <PajPage
      theme="mystic"
      variant="editorial"
      testId="angel-number-not-found"
      seo={<SEO title="Angel Number Not Found | BornClock" description="See all the angel numbers BornClock explains — 000, 111, 222, 333 and more." canonicalUrl="/angel-numbers" />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Angel Numbers', to: '/angel-numbers/' }], current: 'Not found' }}
      footer={FOOTER}
    >
      <section className="section">
        <h1>Angel number not found.</h1>
        <p className="text-muted-foreground mb-4">We explain these sequences:</p>
        <div className="flex flex-wrap gap-2">
          {ANGEL_NUMBERS.map(x => (
            <Link key={x.sequence} to={`/angel-numbers/${x.sequence}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground">{x.sequence}</Link>
          ))}
        </div>
      </section>
    </PajPage>
  );
}

export default function AngelNumberPage() {
  const { number } = useParams<{ number: string }>();
  const a = angelBySequence(number);
  if (!a) return <NotFound />;

  const n = angelNumerology(a.sequence);
  const numText = numerologyText(a);
  const seq = a.sequence;

  const faqItems = [
    { question: `What does angel number ${seq} mean?`, answer: a.answer },
    { question: `What does ${seq} mean in love and relationships?`, answer: a.love },
    { question: `What does ${seq} mean for twin flames?`, answer: a.twinFlame },
    { question: `What should I do if I keep seeing ${seq}?`, answer: a.whatToDo.join(' ') },
    { question: `How is ${seq} connected to numerology?`, answer: numText },
    {
      question: `Is seeing ${seq} a real sign or a prediction?`,
      answer: `Angel numbers are a modern spiritual belief, not a prediction and not science. Psychology explains why ${seq} can seem to follow you: once a number feels meaningful, you notice it more (the frequency illusion), and people naturally see patterns in random events (apophenia). Many people still find it a useful prompt to pause and reflect — that is how BornClock presents it.`,
    },
  ];

  return (
    <PajPage
      theme="mystic"
      variant="editorial"
      testId="angel-number-page"
      seo={<SEO title={angelTitle(seq)} description={ANGEL_SEO[seq]} canonicalUrl={`/angel-numbers/${seq}`} ogType="article" />}
      breadcrumb={{
        trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Angel Numbers', to: '/angel-numbers/' }],
        current: seq,
        edition: 'Popular belief · Not a prediction',
      }}
      footer={FOOTER}
    >
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Angel number · {a.theme}</span>
            <h1>Angel Number {seq} Meaning</h1>
          </div>
        </div>

        {/* Answer first (AI Overviews / featured snippet) */}
        <div className="rounded-xl border p-5 mb-4" style={{ borderColor: ACCENT, background: 'rgba(110,90,166,0.07)' }} data-testid="angel-answer">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-black" style={{ color: ACCENT }}>{seq}</span>
            <span className="text-sm font-semibold text-foreground">{a.theme}</span>
          </div>
          <p className="text-base text-foreground leading-relaxed">{a.answer}</p>
        </div>

        <TrustStrip
          claim={`Meanings are paraphrased from the popular sources listed at the bottom of this page — a spiritual belief, not a forecast. Numerology here is calculated, not written by hand.`}
          href="/how-it-works/#numerology"
          linkLabel="How it works"
        />

        <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm">
          <div className="rounded-xl border border-border p-3"><div className="text-muted-foreground text-xs">Theme</div><div className="font-semibold text-foreground">{a.theme}</div></div>
          <div className="rounded-xl border border-border p-3"><div className="text-muted-foreground text-xs">Digits add up to</div><div className="font-semibold text-foreground">{n.working}</div></div>
          <div className="rounded-xl border border-border p-3"><div className="text-muted-foreground text-xs">Number theme</div><div className="font-semibold text-foreground">{n.isLifePathNumber ? <Link to={`/numerology/${n.root}`} className="hover:underline" style={{ color: ACCENT }}>{lifePathLabel(n.root)}</Link> : 'None (adds up to 0)'}</div></div>
        </div>

        <div className="rounded-xl border border-border p-5 mb-4">
          <h2 className="text-lg font-bold text-foreground mb-2">What {seq} is believed to mean</h2>
          <p className="text-sm text-foreground leading-relaxed">{a.meaning}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-border p-5">
            <h2 className="text-lg font-bold text-foreground mb-2">{seq} in love and relationships</h2>
            <p className="text-sm text-foreground leading-relaxed">{a.love}</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h2 className="text-lg font-bold text-foreground mb-2">{seq} for career and money</h2>
            <p className="text-sm text-foreground leading-relaxed">{a.career}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border p-5 mb-4">
          <h2 className="text-lg font-bold text-foreground mb-2">{seq} and twin flames</h2>
          <p className="text-sm text-foreground leading-relaxed">{a.twinFlame}</p>
          <p className="text-xs text-muted-foreground mt-2">
            A <TermTip id="twinFlame">twin flame</TermTip> is a popular spiritual idea, not something numerology or astrology can confirm. No number can tell you who your partner is or when you will meet them.
          </p>
        </div>

        <div className="rounded-xl border border-border p-5 mb-4">
          <h2 className="text-lg font-bold text-foreground mb-2">What to do if you keep seeing {seq}</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            {a.whatToDo.map(t => <li key={t}>{t}</li>)}
          </ul>
        </div>

        {a.extra && (
          <div className="rounded-xl border border-border p-5 mb-4">
            <h2 className="text-lg font-bold text-foreground mb-2">{a.extra.heading}</h2>
            <p className="text-sm text-foreground leading-relaxed">{a.extra.text}</p>
          </div>
        )}

        <div className="rounded-xl border border-border p-5 mb-4" data-testid="angel-numerology">
          <h2 className="text-lg font-bold text-foreground mb-2">{seq} and numerology</h2>
          <p className="text-sm text-foreground leading-relaxed">{numText}</p>
          {n.baseDigits.length > 0 && (
            <p className="text-sm text-foreground leading-relaxed mt-2">
              Built from {n.baseDigits.length === 1 ? 'the digit' : 'the digits'}{' '}
              {n.baseDigits.map((d, i) => (
                <span key={d}>{i > 0 && (i === n.baseDigits.length - 1 ? ' and ' : ', ')}<Link to={`/numerology/${d}`} className="hover:underline" style={{ color: ACCENT }}>{d}</Link></span>
              ))}
              {n.containsMaster.length > 0 && <> — and the <TermTip id="masterNumber">master number</TermTip> <Link to={`/numerology/${n.containsMaster[0]}`} className="hover:underline" style={{ color: ACCENT }}>{n.containsMaster[0]}</Link></>}.
            </p>
          )}
          <LifePathCheck a={a} />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
          <strong>Is it really a sign?</strong> An <TermTip id="angelNumber">angel number</TermTip> is a modern spiritual
          belief. Psychology offers a simpler reason a number seems to follow you: once it feels meaningful you notice it
          more (the frequency illusion), and people naturally find patterns in random events (apophenia). Use {seq} as a
          prompt to pause and reflect — never as a reason to make a big money, health or relationship decision.
        </div>

        <h2 className="text-lg font-bold text-foreground mb-2">Related angel numbers</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {a.related.map(r => {
            const x = angelBySequence(r);
            return x ? (
              <Link key={r} to={`/angel-numbers/${r}`} className="px-3 py-1.5 rounded-lg border text-sm text-foreground hover:bg-primary/5" style={{ borderColor: ACCENT }}>
                <strong>{r}</strong> · {x.theme}
              </Link>
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-2 mb-8" aria-label="All angel numbers">
          {ANGEL_NUMBERS.filter(x => x.sequence !== seq && !a.related.includes(x.sequence)).map(x => (
            <Link key={x.sequence} to={`/angel-numbers/${x.sequence}`} className="px-2.5 py-1 rounded-lg border border-border text-xs text-foreground hover:bg-primary/5">{x.sequence}</Link>
          ))}
          <Link to="/angel-numbers/" className="px-2.5 py-1 rounded-lg border border-border text-xs text-foreground hover:bg-primary/5">All angel numbers →</Link>
        </div>

        <PageFAQ items={faqItems} title={`Angel number ${seq}: questions people ask`} />

        <div className="rounded-xl border border-border p-4 mb-6">
          <h2 className="font-semibold text-foreground mb-2">Where these meanings come from</h2>
          <p className="text-xs text-muted-foreground mb-2">We paraphrase what these popular sources say about {seq}; we do not add predictions of our own.</p>
          <ul className="text-sm space-y-1">
            {a.sources.map(s => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline" style={{ color: ACCENT }}>{s.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl p-6 text-center border" style={{ borderColor: ACCENT, background: 'rgba(110,90,166,0.07)' }}>
          <p className="text-muted-foreground mb-3">Want a number that is actually calculated for you? Your Life Path comes from your birth date.</p>
          <Link to="/numerology/" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white" style={{ background: ACCENT }}>Free numerology calculator →</Link>
        </div>
      </section>
    </PajPage>
  );
}
