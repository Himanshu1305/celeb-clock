import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { sumDigitsOf, HOUSE_MEANINGS, NUMBER_PLANET, type DigitStringResult } from '@/lib/numerologyTools';

export default function HouseNumberNumerologyPage() {
  const [num, setNum] = useState('');
  const [result, setResult] = useState<DigitStringResult | null>(null);

  const calc = () => {
    const r = sumDigitsOf(num);
    if (r.digits.length === 0) return;
    setResult(r);
  };

  const faqItems = [
    { question: 'How do I calculate a house number — what about letters like 12B?', answer: 'Add the digits of the house/flat number and reduce to a single digit 1–9. For a number with a letter (12B), the tradition usually adds only the digits (1+2 = 3); some add the letter\'s value too. We add the digits — try both and see which you prefer.' },
    { question: 'What does a house number "mean"?', answer: 'The tradition reads each number as a different atmosphere: a 1 home for new beginnings, a 6 home for family warmth, a 7 home for quiet and study, and so on. It is a gentle lens on the feel of a space, not a property valuation or a reason to move.' },
    { question: 'Should a house number change whether I buy a home?', answer: 'No. A home is a practical, financial and emotional decision. Treat the number as a bit of fun and reflection — never as a reason to buy, sell or avoid a property.' },
    { question: 'Is this scientific?', answer: 'No. It is a symbolic tradition, for reflection only.' },
  ];

  return (
    <ToolLayout
      theme="mystic"
      testId="house-number-page"
      seo={<SEO
        title="House Number Numerology — Your Home's Number & Meaning | BornClock"
        description="Free house-number numerology calculator: reduce your house or flat number (including 12B-style) to a single digit and read the atmosphere the tradition links to it."
        keywords="house number numerology, flat number numerology, home number meaning, apartment numerology"
        canonicalUrl="/house-number-numerology"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'House Number' }}
      footer={{ tagline: 'House-number numerology, a gentle reflection.', nav: [{ label: 'Mobile number', to: '/mobile-number-numerology' }, { label: 'Name correction', to: '/name-correction' }, { label: 'Numerology', to: '/numerology' }] }}
      eyebrow="Numerology"
      h1="House Number Numerology"
      lead="Reduce your house or flat number to a single digit and read the atmosphere the tradition links to it — from the fresh-start 1 home to the family-warm 6."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[200px]">
                <span className="block text-muted-foreground mb-1">House / flat number (e.g. 221B)</span>
                <input data-testid="hn-input" value={num} onChange={e => setNum(e.target.value)} placeholder="e.g. 221B" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="hn-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Analyse</button>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-8" data-testid="hn-result">
              <div className="text-xs text-muted-foreground mb-1">House number</div>
              <div className="text-4xl font-black text-primary mb-1">{result.root}</div>
              <div className="text-sm text-muted-foreground">Digit sum {result.sum} → reduced to {result.root} · ruled by {NUMBER_PLANET[result.root]}</div>
              <p className="text-sm text-muted-foreground mt-2">{HOUSE_MEANINGS[result.root]}</p>
            </div>
          )}

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Check your phone number too.</p>
            <Link to="/mobile-number-numerology" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Mobile number numerology →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
