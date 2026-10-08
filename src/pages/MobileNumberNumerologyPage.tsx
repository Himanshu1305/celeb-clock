import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { sumDigitsOf, MOBILE_MEANINGS, NUMBER_PLANET, type DigitStringResult } from '@/lib/numerologyTools';

export default function MobileNumberNumerologyPage() {
  const [num, setNum] = useState('');
  const [result, setResult] = useState<DigitStringResult | null>(null);

  const calc = () => {
    const r = sumDigitsOf(num);
    if (r.digits.length === 0) return;
    setResult(r);
  };

  const faqItems = [
    { question: 'How is a mobile number reduced?', answer: 'We add every digit of the number together, then keep reducing until a single digit 1–9 is left. For example 98-1234-5670 adds to 55, and 5+5 = 10, 1+0 = 1. That final digit is the "number" we read.' },
    { question: 'Does my phone number affect my luck?', answer: 'No — a phone number is a telecoms identifier, nothing more. This is a light, symbolic tradition some people enjoy as a reflection: which "vibration" does your number carry? Please do not pay a premium for a number expecting it to change your fortune.' },
    { question: 'Why does the ruling planet matter?', answer: 'Each digit 1–9 is linked to a planet in the Chaldean tradition (1 Sun, 5 Mercury, 8 Saturn, and so on). The planet is a shorthand for the number\'s character — it is symbolism, not astronomy.' },
    { question: 'Is this scientific?', answer: 'No. It is a symbolic tradition, for reflection only — never a basis for a purchase or an important decision.' },
  ];

  return (
    <ToolLayout
      theme="mystic"
      testId="mobile-number-page"
      seo={<SEO
        title="Mobile Number Numerology — Your Phone Number's Number | BornClock"
        description="Free mobile-number numerology calculator: reduce your phone number to its single digit, see its ruling planet and plain-language meaning. Honest, reflection-first."
        keywords="mobile number numerology, phone number numerology, lucky mobile number, number vibration calculator"
        canonicalUrl="/mobile-number-numerology"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Mobile Number' }}
      footer={{ tagline: 'Mobile-number numerology, for reflection only.', nav: [{ label: 'House number', to: '/house-number-numerology' }, { label: 'Name correction', to: '/name-correction' }, { label: 'Numerology', to: '/numerology' }] }}
      eyebrow="Numerology"
      h1="Mobile Number Numerology"
      lead="Reduce your phone number to a single digit and see the character the tradition reads into it — a light reflection, never a reason to pay for a 'lucky' number."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[200px]">
                <span className="block text-muted-foreground mb-1">Mobile number</span>
                <input data-testid="mn-input" value={num} onChange={e => setNum(e.target.value)} placeholder="e.g. 98123 45670" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="mn-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Analyse</button>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-8" data-testid="mn-result">
              <div className="text-xs text-muted-foreground mb-1">Mobile number vibration</div>
              <div className="text-4xl font-black text-primary mb-1">{result.root}</div>
              <div className="text-sm text-muted-foreground">Digit sum {result.sum} → reduced to {result.root} · ruled by {NUMBER_PLANET[result.root]}</div>
              <p className="text-sm text-muted-foreground mt-2">{MOBILE_MEANINGS[result.root]}</p>
            </div>
          )}

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Curious about your home instead?</p>
            <Link to="/house-number-numerology" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">House number numerology →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
