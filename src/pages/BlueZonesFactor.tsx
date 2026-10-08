import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { POWER_NINE, powerNineBySlug } from '@/data/blueZones';

export default function BlueZonesFactor() {
  const { factor } = useParams<{ factor: string }>();
  const data = factor ? powerNineBySlug(factor) : undefined;

  if (!data) {
    return (
      <ToolLayout
        theme="science"
        testId="bluezones-factor"
        seo={<SEO title="Blue Zones Power 9 — Habits of the World's Longest-Lived People | BornClock" description="The nine habits shared by the world's longevity hotspots." canonicalUrl="/blue-zones" />}
        breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity' }], current: 'Blue Zones' }}
        eyebrow="Blue Zones"
        h1="Power 9 factor not found"
      >
        <section className="section">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {POWER_NINE.map(f => (
                <Link key={f.slug} to={`/blue-zones/${f.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">{f.short}</Link>
              ))}
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const faqItems = [
    { question: `What is "${data.title}" in the Blue Zones?`, answer: `${data.whatItIs}` },
    { question: 'Where is this seen?', answer: `This habit is documented in ${data.regions}.` },
    { question: 'How do I actually apply it?', answer: data.apply.join(' ') },
    ...(data.caveat ? [{ question: 'Is the evidence solid?', answer: data.caveat }] : []),
  ];

  return (
    <ToolLayout
      theme="science"
      testId="bluezones-factor"
      seo={<SEO
        title={`${data.title} — Blue Zones Power 9 | BornClock`}
        description={`${data.whatItIs} How it works, where it's seen (${data.regions}), and how to apply it — with honest sources.`}
        canonicalUrl={`/blue-zones/${data.slug}`}
      />}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity' }, { label: 'Blue Zones', to: '/blue-zones' }], current: data.title }}
      footer={{ tagline: 'The Power 9 habits of the world\'s longest-lived communities.', nav: [{ label: 'All Power 9', to: '/blue-zones' }, { label: 'Life expectancy', to: '/life-expectancy' }] }}
      eyebrow="Blue Zones · Power 9"
      h1={data.title}
      lead={data.whatItIs}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="text-xs text-muted-foreground mb-6">Seen in: {data.regions}</div>

          <div className="rounded-xl border border-border p-4 mb-4" data-testid="bz-mechanism">
            <h2 className="font-semibold text-foreground mb-1">Why it works</h2>
            <p className="text-muted-foreground">{data.mechanism}</p>
          </div>

          <div className="rounded-xl border border-border p-4 mb-4" data-testid="bz-claim">
            <h2 className="font-semibold text-foreground mb-1">What the evidence says</h2>
            <p className="text-muted-foreground">{data.claim}</p>
            <p className="text-xs text-muted-foreground mt-2">Source: {data.source}</p>
          </div>

          {data.caveat && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-4" data-testid="bz-caveat">
              <h2 className="font-semibold text-amber-900 mb-1">An honest caveat</h2>
              <p className="text-amber-900 text-sm">{data.caveat}</p>
            </div>
          )}

          <div className="rounded-xl border border-border p-4 mb-8" data-testid="bz-apply">
            <h2 className="font-semibold text-foreground mb-2">How to apply it</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {data.apply.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>

          <PageFAQ items={faqItems} />

          <h2 className="font-semibold text-foreground mb-2">The other Power 9 habits</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {POWER_NINE.filter(f => f.slug !== data.slug).map(f => (
              <Link key={f.slug} to={`/blue-zones/${f.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{f.short}</Link>
            ))}
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See how your own habits add up.</p>
            <Link to="/life-expectancy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Life expectancy calculator →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
