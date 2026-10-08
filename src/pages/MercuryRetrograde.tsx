import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { computeMercuryRetrogrades } from '@/lib/vedic/transits';

const MIN_YEAR = 2020;
const MAX_YEAR = 2039;

function niceDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function shortDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export default function MercuryRetrograde() {
  const { year: yearParam } = useParams<{ year?: string }>();
  const thisYear = new Date().getUTCFullYear();
  const year = yearParam ? Number(yearParam) : thisYear;
  const yearValid = Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;

  const periods = useMemo(() => (yearValid ? computeMercuryRetrogrades(year) : []), [year, yearValid]);

  if (yearParam && !yearValid) {
    return <Navigate to="/mercury-retrograde" replace />;
  }

  const title = `Mercury Retrograde ${year} — Exact Dates & Meaning | BornClock`;
  const description = `Every Mercury retrograde in ${year} with exact start and end dates, computed from Mercury's real apparent motion, plus what the Vedic tradition reads into it and how to use the time.`;

  const years = [year - 1, year, year + 1, year + 2].filter(y => y >= MIN_YEAR && y <= MAX_YEAR);

  const faqItems = [
    {
      question: 'What does Mercury retrograde actually mean?',
      answer: 'Retrograde is an optical effect: as Earth overtakes Mercury, Mercury appears to move backward against the stars for about three weeks. It is read in the Vedic tradition (and Western astrology) as a period to review, revise and re-check — especially communication, contracts, travel and technology — rather than to start brand-new ventures.',
    },
    {
      question: `How many times is Mercury retrograde in ${year}?`,
      answer: `${periods.length === 0 ? 'The dates are computed from real positions; see the list above for this year.' : `${periods.length} time${periods.length === 1 ? '' : 's'} in ${year}. Mercury typically turns retrograde three to four times a year, each lasting roughly three weeks.`}`,
    },
    {
      question: 'Are these dates calculated?',
      answer: 'Yes. We compute Mercury’s real sidereal longitude day by day and detect the days its apparent motion turns backward (retrograde) and forward again (direct). The dates are not copied from a table — they come from the same engine behind your Kundli. Day precision; a reading at the exact station hour can differ by a day.',
    },
    {
      question: 'Should I avoid signing anything?',
      answer: 'Treat it as reflective guidance, not a rule. The tradition suggests double-checking details, backing up data and re-reading contracts — sensible any time. It never predicts disaster and is not a substitute for professional advice.',
    },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="mercury-retrograde"
      seo={<SEO title={title} description={description} canonicalUrl={yearParam ? `/mercury-retrograde/${year}` : '/mercury-retrograde'} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Transits', to: '/transit' }], current: `Mercury retrograde ${year}` }}
      footer={{ tagline: 'Computed from Mercury’s real apparent motion.', nav: [{ label: 'All transits', to: '/transit' }, { label: 'Rashifal', to: '/rashifal' }, { label: 'Free Kundli', to: '/kundali' }], note: 'Reflective guidance attributed to the astrological tradition — not certainty or professional advice.' }}
      eyebrow="Gochar · Mercury"
      h1={`Mercury Retrograde ${year}`}
      lead={periods.length > 0 ? `${periods.length} retrograde period${periods.length === 1 ? '' : 's'} this year — exact, computed dates below.` : 'Exact, computed retrograde dates below.'}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">

          {/* Year switcher */}
          <div className="flex flex-wrap gap-2 mb-4" data-testid="mercury-years">
            {years.map(y => (
              <Link key={y} to={y === thisYear ? '/mercury-retrograde' : `/mercury-retrograde/${y}`} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${y === year ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}>
                {y}
              </Link>
            ))}
          </div>

          {/* Periods */}
          <div className="space-y-4 mb-6" data-testid="mercury-periods">
            {periods.length === 0 && (
              <p className="text-muted-foreground">No retrograde period computed for {year}.</p>
            )}
            {periods.map((p, i) => {
              const days = Math.round((new Date(p.endISO).getTime() - new Date(p.startISO).getTime()) / 86400000);
              return (
                <div key={i} className="rounded-xl border border-border p-5" data-testid="mercury-period">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-semibold text-foreground">{shortDate(p.startISO)} – {shortDate(p.endISO)}</h2>
                    <span className="text-xs text-muted-foreground">≈ {days} days</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Turns retrograde on <strong className="text-foreground">{niceDate(p.startISO)}</strong>{p.signAtStart === p.signAtEnd ? ` in ${p.signAtStart}` : ` in ${p.signAtStart}`} and direct again on <strong className="text-foreground">{niceDate(p.endISO)}</strong>{p.signAtStart === p.signAtEnd ? '' : ` in ${p.signAtEnd}`}.
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border p-5 mb-8">
            <h2 className="font-semibold text-foreground mb-2">How to use a Mercury retrograde</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li><strong className="text-foreground">Review, don’t launch.</strong> Finish, edit and revisit rather than kick off something brand-new where you can choose the timing.</li>
              <li><strong className="text-foreground">Double-check communication.</strong> Re-read messages and contracts before sending; confirm travel and meeting details.</li>
              <li><strong className="text-foreground">Back up and allow buffer.</strong> Save your work and leave slack in schedules for mix-ups.</li>
              <li><strong className="text-foreground">Keep perspective.</strong> This is a traditional reading of an optical effect, not a forecast of events.</li>
            </ul>
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See how the current sky lands in your own chart.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
              <Link to="/transit" className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">All transits →</Link>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
