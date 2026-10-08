import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { TRANSIT_PLANETS, type TransitPlanet } from '@/lib/vedic/transits';

const PLANET_SLUGS: TransitPlanet[] = ['saturn', 'jupiter', 'rahu', 'ketu'];

export default function TransitIndex() {
  const year = new Date().getUTCFullYear();

  const faqItems = [
    {
      question: 'What is a planetary transit (gochar)?',
      answer: 'Gochar is the ongoing movement of the planets through the signs. Where a slow planet like Saturn or Jupiter sits — and which house that is from your Moon sign — is the basis of the Vedic yearly outlook, Sade Sati and much of a rashifal.',
    },
    {
      question: 'Why only Saturn, Jupiter, Rahu and Ketu?',
      answer: 'These are the slow-moving planets: they spend a year or more in a sign, so their transit defines the big themes of a period. The faster planets (Sun, Mercury, Venus, Mars) change sign every few weeks and are read in the daily/weekly rashifal instead.',
    },
    {
      question: 'Are these dates computed or looked up?',
      answer: 'Computed. We read each planet’s real sidereal (Lahiri) longitude and find the exact day it changes sign, the same engine used for your Kundli — so the ingress dates and per-sign effects are not copied from a table.',
    },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="transit-index"
      seo={<SEO
        title={`Planetary Transits ${year} — Saturn, Jupiter, Rahu & Ketu | BornClock`}
        description="Free Vedic transit (gochar) pages for the slow planets — Saturn, Jupiter, Rahu and Ketu — by year, with real ingress dates and the graded effect on every Moon sign. Plus Mercury retrograde dates."
        canonicalUrl="/transit"
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Transits' }}
      footer={{ tagline: 'Computed Vedic transits from real sidereal positions.', nav: [{ label: 'Rashifal', to: '/rashifal' }, { label: 'Sade Sati', to: '/sade-sati' }, { label: 'Free Kundli', to: '/kundali' }] }}
      eyebrow="Gochar · planetary transits"
      h1="Planetary transits by year"
      lead="Where the slow planets are, when they change sign, and what each movement means for your Moon sign — computed from the real sky, not a fixed table."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-4" data-testid="transit-grid">
            {PLANET_SLUGS.map(p => (
              <Link key={p} to={`/transit/${p}/${year}`} className="rounded-xl border border-border p-5 hover:shadow-sm transition">
                <div className="font-semibold text-foreground mb-1">{TRANSIT_PLANETS[p].label} — {year}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{TRANSIT_PLANETS[p].blurb}</p>
                <div className="text-xs text-primary mt-2">Dates & effect on every rashi →</div>
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-border p-5 mt-4" data-testid="transit-mercury-card">
            <div className="font-semibold text-foreground mb-1">Mercury retrograde {year}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">The dates Mercury appears to move backward — read in the Vedic tradition as a time to review, re-check and re-do rather than launch. Computed from real apparent motion.</p>
            <Link to="/mercury-retrograde" className="text-xs text-primary mt-2 inline-block">Mercury retrograde dates →</Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6 mb-10">
            Each transit is read by its <TermTip id="rashi">house from your Moon sign</TermTip>, from the sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) positions of the planets.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Don't know your Moon sign? Find it free, then read every transit from the right sign.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
