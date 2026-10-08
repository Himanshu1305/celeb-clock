import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import {
  chaldeanName, pythagoreanName, CHALDEAN_LETTER_TABLE, BIRTHDAY_MEANINGS,
} from '@/lib/numerologyExtra';

export default function ChaldeanNumerologyPage() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<{ c: ReturnType<typeof chaldeanName>; p: ReturnType<typeof pythagoreanName> } | null>(null);

  const calc = () => {
    if (!name.trim()) return;
    setResult({ c: chaldeanName(name), p: pythagoreanName(name) });
  };

  const faqItems = [
    { question: 'What is Chaldean numerology?', answer: 'Chaldean numerology is one of the oldest systems, rooted in ancient Babylon. Unlike the Western Pythagorean system, it assigns letters values 1–8 based on the sound/vibration of the letter, and never gives a letter the number 9 (treated as sacred). It is widely used in India for name analysis and name-correction.' },
    { question: 'How is Chaldean different from Pythagorean?', answer: 'Pythagorean assigns letters in simple order (A=1, B=2 … I=9, then repeat). Chaldean uses a different, vibration-based map and stops at 8 for letters. The two usually give different numbers for the same name — this page shows both side by side.' },
    { question: 'What is a "compound" number?', answer: 'In Chaldean work the two-digit total before the final single-digit reduction (the "compound" number) is considered meaningful in its own right. We show the raw total, the compound, and the final root digit.' },
    { question: 'Is numerology scientific?', answer: 'No — it is a symbolic tradition, not a science. Treat the result as a prompt for reflection, not a fact about you or a basis for important decisions.' },
  ];

  return (
    <ToolLayout
      theme="mystic"
      testId="chaldean-page"
      seo={<SEO
        title="Chaldean Numerology Calculator — Name Number (vs Pythagorean) | BornClock"
        description="Free Chaldean numerology calculator for your name number, shown side by side with the Pythagorean result. Includes the full Chaldean letter table and plain-language meaning."
        keywords="chaldean numerology, chaldean name number calculator, chaldean vs pythagorean numerology"
        canonicalUrl="/chaldean-numerology"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Chaldean Numerology' }}
      footer={{ tagline: 'Chaldean name numerology, with a Pythagorean comparison.', nav: [{ label: 'Numerology', to: '/numerology' }, { label: 'Name numerology', to: '/name-numerology' }, { label: 'Birthday & Attitude', to: '/attitude-number' }] }}
      eyebrow="Numerology"
      h1="Chaldean Numerology"
      lead="The older, vibration-based name-number system — shown side by side with the Western Pythagorean result so you can compare."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[200px]">
                <span className="block text-muted-foreground mb-1">Full name</span>
                <input data-testid="chaldean-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="chaldean-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Calculate</button>
            </div>
          </div>

          {result && (
            <div className="grid sm:grid-cols-2 gap-4 mb-8" data-testid="chaldean-result">
              <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20">
                <div className="text-xs text-muted-foreground mb-1">Chaldean name number</div>
                <div className="text-4xl font-black text-primary mb-1">{result.c.root}</div>
                <div className="text-sm text-muted-foreground">Total {result.c.total} · compound {result.c.compound} · root {result.c.root}</div>
                <div className="font-semibold text-foreground mt-2">{BIRTHDAY_MEANINGS[result.c.root]?.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{BIRTHDAY_MEANINGS[result.c.root]?.text}</p>
              </div>
              <div className="rounded-2xl border border-border p-5">
                <div className="text-xs text-muted-foreground mb-1">Pythagorean (for comparison)</div>
                <div className="text-4xl font-black text-foreground mb-1">{result.p.root}</div>
                <div className="text-sm text-muted-foreground">Total {result.p.total} · root {result.p.root}</div>
                <p className="text-sm text-muted-foreground mt-2">{result.c.root === result.p.root ? 'Both systems agree on the root number here — an unusually consistent name.' : 'The two systems give different numbers, which is normal — they use different letter maps.'}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border p-4 mb-8" data-testid="chaldean-table">
            <h2 className="font-semibold text-foreground mb-2">The Chaldean letter table</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {CHALDEAN_LETTER_TABLE.map(row => (
                <div key={row.value} className="rounded-lg border border-border px-3 py-2">
                  <div className="font-semibold text-primary">{row.value}</div>
                  <div className="text-muted-foreground">{row.letters}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Note: in the Chaldean system no letter is ever assigned 9 — it is considered sacred and stands apart.</p>
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Compare with the Western system on your name.</p>
            <Link to="/name-numerology" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Pythagorean name numerology →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
