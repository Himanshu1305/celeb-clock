import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { analyseNameCorrection, type NameCorrectionResult } from '@/lib/numerologyTools';

export default function NameCorrectionPage() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<NameCorrectionResult | null>(null);

  const calc = () => {
    if (!name.trim()) return;
    let parsed: { year: number; month: number; day: number } | undefined;
    if (dob) {
      const [y, m, d] = dob.split('-').map(Number);
      if (y && m && d) parsed = { year: y, month: m, day: d };
    }
    setResult(analyseNameCorrection(name, parsed));
  };

  const faqItems = [
    { question: 'What is name-number correction?', answer: 'In the Chaldean numerology tradition, the letters of your name add up to a "name number". Name correction is the practice of looking at that number — and the two-digit "compound" behind it — and reflecting on whether a spelling variant gives a number the tradition reads as more supportive or more harmonious with your birth numbers. We show you the numbers; we never promise that changing a spelling changes your life.' },
    { question: 'Should I actually change the spelling of my name?', answer: 'That is entirely your choice and a personal one. This tool is for reflection and comparison — try a variant spelling and watch the number move. It is a symbolic tradition, not a scientific fact, so please do not make a legal name change expecting a guaranteed outcome.' },
    { question: 'Why Chaldean and not Pythagorean?', answer: 'Name correction in India is done almost entirely in the Chaldean system, which values letters by sound/vibration (1–8, never 9 for a letter). We compute the Pythagorean number too, for comparison, but the correction reading follows the Chaldean tradition.' },
    { question: 'What is the "compound" number?', answer: 'The two-digit total before the final single-digit reduction. The classical Chaldean (Cheiro) tradition gives each compound 10–52 its own meaning — some fortunate, some cautionary. We show the traditional meaning where one exists, cited as tradition, with no invented figures.' },
    { question: 'Is this scientific?', answer: 'No. Numerology is a symbolic tradition, not a science. Treat every result here as a prompt for reflection, not a fact about you or a basis for an important decision.' },
  ];

  const toneColor = (tone?: string) =>
    tone === 'favourable' ? 'text-green-600' : tone === 'caution' ? 'text-amber-600' : 'text-foreground';

  return (
    <ToolLayout
      theme="mystic"
      testId="name-correction-page"
      seo={<SEO
        title="Name Numerology Correction — Chaldean Name Number | BornClock"
        description="Free name-correction calculator in the Chaldean tradition: your name number, its compound meaning, and how it sits with your birth numbers. Honest, reflection-first."
        keywords="name correction numerology, chaldean name number, lucky name numerology, name number calculator"
        canonicalUrl="/name-correction"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Name Correction' }}
      footer={{ tagline: 'Chaldean name-number correction, reflection-first.', nav: [{ label: 'Chaldean numerology', to: '/chaldean-numerology' }, { label: 'Name numerology', to: '/name-numerology' }, { label: 'Business name', to: '/business-name-numerology' }] }}
      eyebrow="Numerology"
      h1="Name Numerology Correction"
      lead="See your name's Chaldean number and its classical compound meaning — and, if you add your birth date, how the two sit together. For reflection, never a promise."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[200px]">
                <span className="block text-muted-foreground mb-1">Full name (try a variant spelling too)</span>
                <input data-testid="nc-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <label className="text-sm">
                <span className="block text-muted-foreground mb-1">Birth date (optional)</span>
                <input data-testid="nc-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="nc-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Analyse</button>
            </div>
          </div>

          {result && (
            <div data-testid="nc-result">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Chaldean name number</div>
                  <div className="text-4xl font-black text-primary mb-1">{result.chaldean.root}</div>
                  <div className="text-sm text-muted-foreground">Total {result.chaldean.total} · compound {result.compound} · root {result.chaldean.root}</div>
                  <div className="font-semibold text-foreground mt-2">Ruled by {result.rootPlanet}</div>
                  <p className="text-sm text-muted-foreground mt-1">Keynotes: {result.rootKeyword}.</p>
                </div>
                <div className="rounded-2xl border border-border p-5">
                  <div className="text-xs text-muted-foreground mb-1">Pythagorean (for comparison)</div>
                  <div className="text-4xl font-black text-foreground mb-1">{result.pythagorean.root}</div>
                  <div className="text-sm text-muted-foreground">Total {result.pythagorean.total} · root {result.pythagorean.root}</div>
                </div>
              </div>

              {result.compoundMeaning && (
                <div className="rounded-xl border border-border p-4 mb-6">
                  <div className="text-xs text-muted-foreground mb-1">Classical compound meaning (Chaldean / Cheiro tradition)</div>
                  <div className={`font-semibold ${toneColor(result.compoundMeaning.tone)}`}>{result.compound} — {result.compoundMeaning.name}</div>
                  <p className="text-sm text-muted-foreground mt-1">{result.compoundMeaning.text}</p>
                </div>
              )}

              {result.harmony && (
                <div className="rounded-xl border border-border p-4 mb-6">
                  <div className="text-xs text-muted-foreground mb-1">How your name sits with your birth numbers</div>
                  <div className="text-sm text-foreground">Life Path <strong>{result.harmony.lifePath}</strong> · Birthday number <strong>{result.harmony.birthday}</strong></div>
                  <p className="text-sm text-muted-foreground mt-1">{result.harmony.note}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mb-8">Tip: change one letter of the spelling and press Analyse again to see how the number shifts — that comparison is the whole point of the exercise.</p>
            </div>
          )}

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Checking a company name instead?</p>
            <Link to="/business-name-numerology" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Business name numerology →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
