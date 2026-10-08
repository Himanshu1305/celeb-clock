import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { POWER_NINE } from '@/data/blueZones';

export default function BlueZonesIndex() {
  const faqItems = [
    { question: 'What are the Blue Zones?', answer: 'Blue Zones are five regions with exceptional longevity — Okinawa (Japan), Sardinia (Italy), Nicoya (Costa Rica), Ikaria (Greece) and Loma Linda (California). Researcher Dan Buettner and National Geographic studied what their centenarians share.' },
    { question: 'What is the "Power 9"?', answer: 'The Power 9 are the nine lifestyle habits found across all the Blue Zones: move naturally, know your purpose, downshift stress, the 80% rule, a plant slant, wine at 5, belong to a community, put loved ones first, and the right tribe.' },
    { question: 'Can I add years by copying them?', answer: 'The Power 9 are associations observed in long-lived populations, not guarantees for an individual. They are, however, low-risk, well-supported habits — and most of them cost nothing.' },
  ];

  return (
    <ToolLayout
      theme="science"
      testId="bluezones-index"
      seo={<SEO
        title="Blue Zones Power 9 — 9 Habits of the World's Longest-Lived People | BornClock"
        description="The nine habits (the Power 9) shared by the world's five Blue Zones — move naturally, purpose, downshift, 80% rule, plant slant, wine at 5, belong, loved ones first, right tribe. Each explained with honest sources."
        canonicalUrl="/blue-zones"
      />}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity' }], current: 'Blue Zones' }}
      footer={{ tagline: 'The Power 9 habits of the world\'s longest-lived communities.', nav: [{ label: 'Life expectancy', to: '/life-expectancy' }, { label: 'Science & longevity', to: '/science-longevity' }] }}
      eyebrow="Blue Zones"
      h1="The Blue Zones Power 9"
      lead="Nine habits shared by the world's longest-lived communities — Okinawa, Sardinia, Nicoya, Ikaria and Loma Linda. Each one explained plainly, with how to apply it and honest sources."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="bz-grid">
            {POWER_NINE.map((f, i) => (
              <Link key={f.slug} to={`/blue-zones/${f.slug}`} className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                <div className="font-semibold text-foreground">{i + 1}. {f.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{f.regions}</div>
                <div className="text-sm text-muted-foreground mt-2 line-clamp-3">{f.whatItIs}</div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6 mb-10">
            Source: Dan Buettner / Blue Zones (bluezones.com) and the Adventist Health, Okinawa Centenarian and Sardinia longevity studies. The Power 9 are population-level associations, not individual guarantees.
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See how your habits shape your own estimate.</p>
            <Link to="/life-expectancy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Life expectancy calculator →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
