import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { analyseBusinessName, type BusinessNameResult } from '@/lib/numerologyTools';

export default function BusinessNameNumerologyPage() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<BusinessNameResult | null>(null);

  const calc = () => {
    if (!name.trim()) return;
    setResult(analyseBusinessName(name));
  };

  const faqItems = [
    { question: 'How is a business-name number calculated?', answer: 'We add the Chaldean values of the letters in the business name, reduce to a single digit (1–9), and read that number by its ruling planet. We also show the two-digit "compound" number and its classical meaning where one exists.' },
    { question: 'Which numbers are "good" for business?', answer: 'The Chaldean tradition most often cites 1, 3, 5, 6 and 9 as supportive for enterprise — leadership, growth, trade, goodwill and reach. 4 and 8 are the numbers it asks you to approach with patience. This is a tradition, not a rule: plenty of large businesses carry every number.' },
    { question: 'Should I rename my company based on this?', answer: 'No tool should make that decision for you. A business name is a legal, branding and practical choice first. Use this as one more lens for reflection, not as a reason to rebrand — numerology is symbolic, not predictive.' },
    { question: 'Is this scientific?', answer: 'No. It is a symbolic tradition. Treat the result as a prompt for reflection, never a forecast of profit or loss.' },
  ];

  const verdictColor = result?.verdict === 'favourable' ? 'text-green-600' : result?.verdict === 'caution' ? 'text-amber-600' : 'text-foreground';

  return (
    <ToolLayout
      theme="mystic"
      testId="business-name-page"
      seo={<SEO
        title="Business Name Numerology — Chaldean Company Number | BornClock"
        description="Free business-name numerology calculator (Chaldean): your company name's number, its ruling planet and compound meaning, and which numbers the tradition favours for enterprise."
        keywords="business name numerology, company name number, chaldean business numerology, lucky business name"
        canonicalUrl="/business-name-numerology"
      />}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Numerology', to: '/numerology' }], current: 'Business Name' }}
      footer={{ tagline: 'Chaldean business-name numerology, honestly framed.', nav: [{ label: 'Name correction', to: '/name-correction' }, { label: 'Chaldean numerology', to: '/chaldean-numerology' }, { label: 'Mobile number', to: '/mobile-number-numerology' }] }}
      eyebrow="Numerology"
      h1="Business Name Numerology"
      lead="Your company name's Chaldean number, its ruling planet and the compound meaning behind it — with an honest note on which numbers the tradition favours for enterprise."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[200px]">
                <span className="block text-muted-foreground mb-1">Business name</span>
                <input data-testid="bn-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunrise Traders" className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground" />
              </label>
              <button data-testid="bn-calc" onClick={calc} className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold">Analyse</button>
            </div>
          </div>

          {result && (
            <div data-testid="bn-result">
              <div className="rounded-2xl border border-primary/40 p-5 bg-gradient-to-br from-card to-muted/20 mb-6">
                <div className="text-xs text-muted-foreground mb-1">Business name number</div>
                <div className="text-4xl font-black text-primary mb-1">{result.root}</div>
                <div className="text-sm text-muted-foreground">Total {result.chaldean.total} · compound {result.compound} · ruled by {result.rootPlanet}</div>
                <div className={`font-semibold mt-2 capitalize ${verdictColor}`}>{result.verdict}</div>
                <p className="text-sm text-muted-foreground mt-1">{result.note}</p>
              </div>

              {result.compoundMeaning && (
                <div className="rounded-xl border border-border p-4 mb-6">
                  <div className="text-xs text-muted-foreground mb-1">Classical compound meaning (Chaldean / Cheiro tradition)</div>
                  <div className="font-semibold text-foreground">{result.compound} — {result.compoundMeaning.name}</div>
                  <p className="text-sm text-muted-foreground mt-1">{result.compoundMeaning.text}</p>
                </div>
              )}
            </div>
          )}

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Check your personal name too.</p>
            <Link to="/name-correction" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Name correction →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
