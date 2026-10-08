import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { NAKSHATRA_ORDER, NAKSHATRA_EXTRA } from '@/data/nakshatraPages';
import { getNakshatraMeaning } from '@/lib/vedic/nakshatraMeanings';

export default function NakshatraIndex() {
  const faqItems = [
    {
      question: 'What is a Nakshatra?',
      answer: 'A Nakshatra is a lunar mansion — one of 27 equal segments (13°20′ each) that the Moon travels through. Your birth Nakshatra is the one the Moon occupied when you were born, and the tradition reads it as a finer layer of character than the 12 signs alone.',
    },
    {
      question: 'How do I find my Nakshatra?',
      answer: 'It is computed from your exact birth date, time and place. Generate your free Kundli and it tells you your Moon Nakshatra and pada precisely.',
    },
    {
      question: 'What are Nakshatras used for?',
      answer: 'They inform baby-name sounds, Kundali matching (Gana, Yoni and Nadi all come from the Nakshatra), muhurat (choosing auspicious timing) and a deeper reading of temperament.',
    },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="nakshatra-index"
      seo={<SEO
        title="27 Nakshatras — Vedic Birth Stars: Meaning, Ruling Planet & Name Sounds | BornClock"
        description="Explore all 27 Nakshatras (lunar mansions) — each with its deity, symbol, ruling planet, meaning, Gana, Yoni, Nadi and traditional baby-name sounds. Find your birth star free."
        canonicalUrl="/nakshatra"
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Nakshatras' }}
      footer={{ tagline: 'The 27 Nakshatras of Vedic astrology.', nav: [{ label: 'Free Kundli', to: '/kundali' }, { label: 'Kundali matching', to: '/kundali-match' }] }}
      eyebrow="Nakshatra"
      h1="The 27 Nakshatras"
      lead="The 27 lunar mansions of Vedic astrology — each a finer read of character than the sign alone. Tap any birth star for its meaning, ruling planet, matching attributes and name sounds."
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="nakshatra-grid">
            {NAKSHATRA_ORDER.map((n, i) => {
              const extra = NAKSHATRA_EXTRA[n];
              const m = getNakshatraMeaning(n);
              return (
                <Link key={n} to={`/nakshatra/${extra.slug}`} className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                  <div className="font-semibold text-foreground">{i + 1}. {n}</div>
                  <div className="text-xs text-muted-foreground mt-1">Ruled by {m?.rulingPlanet} · {extra.gana} · {extra.yoni}</div>
                  <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{m?.meaning}</div>
                </Link>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-6 mb-10">
            Each Nakshatra is a <TermTip id="nakshatra">lunar mansion</TermTip>. Your birth star is computed from your exact birth Moon.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Find your birth Nakshatra and pada, free.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
