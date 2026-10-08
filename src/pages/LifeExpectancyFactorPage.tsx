import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { LONGEVITY_FACTORS, factorBySlug, LONGEVITY_BASELINE_NOTE } from '@/data/longevityFactors';
import { reachPercent } from '@/lib/longevity/survival';

const DIR_STYLE: Record<string, string> = {
  add: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  subtract: 'bg-rose-100 text-rose-800 border-rose-300',
  mixed: 'bg-amber-100 text-amber-800 border-amber-300',
};

export default function LifeExpectancyFactorPage() {
  const { factor: slug } = useParams<{ factor: string }>();
  const factor = slug ? factorBySlug(slug) : undefined;

  // Hub
  if (!slug || !factor) {
    return (
      <ToolLayout
        theme="neutral"
        testId="le-factors-hub"
        seo={<SEO title="What Affects Life Expectancy — Factor by Factor | BornClock" description="How much each factor changes life expectancy — smoking, exercise, diet, weight, sleep, alcohol, blood pressure, diabetes and social connection — with the years, the evidence and what to do." canonicalUrl="/life-expectancy/factors" ogType="website" />}
        breadcrumb={{ trail: [{ label: 'Life Expectancy', to: '/life-expectancy' }], current: 'By factor' }}
        eyebrow="Longevity · by factor"
        h1="What affects life expectancy — factor by factor"
        lead="How many years each major factor adds or subtracts, the mechanism, the published evidence, and the actions that move the needle."
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="grid sm:grid-cols-2 gap-3" data-testid="factor-grid">
              {LONGEVITY_FACTORS.map(f => (
                <Link key={f.slug} to={`/life-expectancy/factors/${f.slug}`} className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-foreground">{f.name}</span>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${DIR_STYLE[f.direction]}`}>{f.impact}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.summary}</p>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">{LONGEVITY_BASELINE_NOTE}</p>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center mt-6">
              <p className="text-muted-foreground mb-3">Put the factors together — get your personal forecast and your chance of reaching 100.</p>
              <Link to="/life-expectancy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Life Expectancy Calculator →</Link>
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const title = `How ${factor.name} Affects Life Expectancy (${factor.impact}) | BornClock`;
  const description = `${factor.name} and life expectancy: ${factor.summary} The mechanism, the published evidence (${factor.impact}) and what to do.`;
  const others = LONGEVITY_FACTORS.filter(f => f.slug !== factor.slug);

  const faqItems = [
    { question: `How many years does ${factor.name.toLowerCase()} change life expectancy?`, answer: `${factor.evidence}` },
    { question: `Is this a personal prediction?`, answer: `No. ${LONGEVITY_BASELINE_NOTE}` },
    { question: `What can I do about it?`, answer: factor.actions.join(' ') },
  ];

  return (
    <ToolLayout
      theme="neutral"
      testId="le-factor"
      seo={<SEO title={title} description={description} canonicalUrl={`/life-expectancy/factors/${factor.slug}`} ogType="article" />}
      breadcrumb={{ trail: [{ label: 'Life Expectancy', to: '/life-expectancy' }, { label: 'By factor', to: '/life-expectancy/factors' }], current: factor.name }}
      eyebrow={`Longevity · ${factor.category}`}
      h1={`${factor.name} & life expectancy`}
      lead={factor.summary}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex items-center gap-2 mb-5">
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${DIR_STYLE[factor.direction]}`}>Typical impact: {factor.impact}</span>
          </div>

          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">Why it matters (the mechanism)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{factor.mechanism}</p>
          </div>
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">The evidence</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{factor.evidence}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 mb-6">
            <h2 className="font-semibold text-foreground mb-1">What to do</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              {factor.actions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>

          {/* P(reach 100) illustration (NS-P100) */}
          <div className="rounded-xl border border-border p-4 mb-6" data-testid="factor-reach100">
            <h2 className="font-semibold text-foreground mb-1">And the chance of reaching 100?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your odds of reaching 100 rise steeply with your overall forecast. As an illustration, a forecast age of 85 implies roughly a <strong className="text-foreground">{reachPercent(85)}%</strong> chance of reaching 100; a forecast of 92 implies around <strong className="text-foreground">{reachPercent(92)}%</strong>. Factors like {factor.name.toLowerCase()} shift where your forecast lands. Get your personal figure in the calculator.
            </p>
          </div>

          <p className="text-xs text-muted-foreground mb-6">{LONGEVITY_BASELINE_NOTE}</p>

          <h2 className="font-semibold text-foreground mb-2">Other factors</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {others.map(f => (
              <Link key={f.slug} to={`/life-expectancy/factors/${f.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{f.name}</Link>
            ))}
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See how {factor.name.toLowerCase()} and everything else combine in <em>your</em> forecast — plus your chance of reaching 100.</p>
            <Link to="/life-expectancy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Life Expectancy Calculator →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
