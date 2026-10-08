/**
 * DashaCalculatorPage — standalone Vimshottari Dasha timeline calculator.
 * SEO target: "dasha calculator" / "vimshottari dasha calculator" queries.
 * Distinct from the full Kundali page; reuses existing building blocks only.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { DashaDeepDive } from '@/components/vedic/DashaDeepDive';
import { WhatsAhead } from '@/components/vedic/WhatsAhead';
import { fetchKundali, type KundaliData } from '@/services/kundaliService';
import { JsonLd } from '@/components/JsonLd';

const PAGE_TITLE = 'Dasha Calculator — Your Vimshottari Dasha Timeline | BornClock';
const PAGE_DESC =
  'Free Vimshottari Dasha calculator — your full planetary-period timeline (Mahadasha to Prana), with real start and end dates from your birth chart.';

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a Dasha / Vimshottari Dasha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'A Dasha is a planetary period in Vedic astrology. The Vimshottari Dasha is the most widely used system — a 120-year cycle divided between nine planets: Ketu (7 years), Venus (20 years), Sun (6 years), Moon (10 years), Mars (7 years), Rahu (18 years), Jupiter (16 years), Saturn (19 years), and Mercury (17 years). The sequence your life runs through depends on the exact position of the Moon at the moment of your birth, making accurate birth time essential.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the Dasha calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'At the Mahadasha and Antardasha levels, the calculations are highly accurate given a correct date of birth and a reasonably accurate birth time (within a few minutes). Deeper levels — Pratyantardasha, Sookshma, and Prana — last from weeks down to hours and become very sensitive to the exact birth time. The calculator uses the sidereal (Lahiri) ayanamsa, the standard reference frame in classical Vedic astrology.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are Antardasha, Pratyantardasha, Sookshma, and Prana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'These are the sub-levels nested inside a Mahadasha (the main planetary period). An Antardasha is the first sub-period (lasting months to a few years); Pratyantardasha is the next level down (weeks to months); Sookshma runs for days to a few weeks; and Prana spans hours to a few days. Each level follows the same Vimshottari proportions and the nine-planet sequence within its parent period. The deeper the level, the more birth-time precision matters.',
      },
    },
  ],
};

export default function DashaCalculatorPage() {
  const { profile, save } = useSavedProfile();
  const [result, setResult] = useState<KundaliData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true);
    setFailed(false);
    setResult(null);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city });
    try {
      const k = await fetchKundali(d.dob, d.time, {
        lat: d.city.lat,
        lon: d.city.lon,
        tz: d.city.tz,
      });
      setResult(k);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const initial = profile
    ? { dob: profile.dob, time: profile.time, city: profile.city }
    : undefined;

  const hasDasha = result && result.dasha;
  const hasTimeline =
    result && result.dashaTimeline && result.dashaTimeline.length > 0;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="dasha-calculator-page"
      seo={(
        <SEO
          title={PAGE_TITLE}
          description={PAGE_DESC}
          canonicalUrl="/dasha-calculator"
          ogType="website"
        />
      )}
      breadcrumb={{
        trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }],
        current: 'Dasha Calculator',
        edition: 'Vimshottari · planetary periods',
      }}
      footer={{
        tagline:
          'Dasha timeline computed from your real Moon position — the same Lahiri-ayanamsa engine as the rest of BornClock.',
        nav: [
          { label: 'Kundali', to: '/kundali' },
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Sade Sati', to: '/sade-sati' },
          { label: 'How It Works', to: '/how-it-works' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <JsonLd data={FAQ_LD} id="dasha-faq" />

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Vimshottari · planetary periods</span>
            <h1>Dasha Calculator.</h1>
          </div>
          <p>
            Your complete{' '}
            <TermTip id="dasha">Vimshottari Dasha</TermTip> timeline — from the
            current <TermTip id="mahadasha">Mahadasha</TermTip> and{' '}
            <TermTip id="antardasha">Antardasha</TermTip> right down to
            Pratyantardasha, Sookshma and Prana — with real start and end dates
            computed from your Moon's position at birth.
          </p>
        </div>

        {/* ── Explanatory content — renders on first paint, prerenderable ── */}
        <div className="rounded-xl border border-border bg-muted/20 p-5 mt-4 space-y-3 text-sm text-foreground leading-relaxed">
          <p>
            <strong>What is the Vimshottari Dasha?</strong> It is a 120-year
            planetary timing system used in Vedic astrology to identify which
            planet governs any given chapter of your life. Nine planets each
            rule a fixed period: <strong>Ketu 7 years</strong>,{' '}
            <strong>Venus 20 years</strong>, <strong>Sun 6 years</strong>,{' '}
            <strong>Moon 10 years</strong>, <strong>Mars 7 years</strong>,{' '}
            <strong>Rahu 18 years</strong>, <strong>Jupiter 16 years</strong>,{' '}
            <strong>Saturn 19 years</strong>, <strong>Mercury 17 years</strong>{' '}
            — totalling 120 years. The sequence and the starting point depend on
            where the Moon was at the moment of your birth.
          </p>
          <p>
            Each main period (<TermTip id="mahadasha">Mahadasha</TermTip>) is
            divided into nine sub-periods (
            <TermTip id="antardasha">Antardasha</TermTip>), which subdivide
            again into Pratyantardasha, Sookshma, and Prana. The deeper levels
            last from days to hours and require an accurate birth time to be
            meaningful. This calculator uses the sidereal Lahiri{' '}
            <TermTip id="ayanamsa">ayanamsa</TermTip> — the standard reference
            frame in classical Indian astrology.
          </p>
          <p className="text-xs text-muted-foreground">
            Note: the deeper sub-period levels (Sookshma, Prana) are sensitive
            to your exact birth time. A few minutes' difference can shift them.
            Treat those levels as indicative rather than precise.
          </p>
        </div>

        <TrustStrip claim="Computed from your real Moon position — sidereal Lahiri ayanamsa, the same engine as the full Kundali." />

        <div className="form-band" style={{ marginTop: 16 }}>
          <div>
            <h3>Your birth details</h3>
            <p className="small muted">
              We use your Moon's nakshatra position to place the starting Dasha.
              Birth time matters — an accurate time gives more reliable
              sub-period dates.
            </p>
          </div>
          <BirthDetailsForm
            initial={initial}
            submitLabel="Calculate my Dasha timeline"
            loadingLabel="Calculating…"
            loading={loading}
            onSubmit={run}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix="dasha"
          />
        </div>

        {failed && (
          <p className="subtle" style={{ marginTop: 12 }}>
            The service is temporarily unavailable. Please try again shortly.
          </p>
        )}

        {/* ── Results — appear after submit only ── */}
        {result && (
          <div data-testid="dasha-result" className="mt-6 space-y-4">

            {/* Current period summary */}
            {hasDasha && (
              <div
                data-testid="dasha-current-period"
                className="rounded-xl border border-[#6E5AA6]/40 bg-[#6E5AA6]/10 p-5"
              >
                <div className="text-sm text-muted-foreground mb-1">
                  Current planetary period
                </div>
                <div className="text-2xl font-black text-[#4B3A8C]">
                  {result.dasha!.mahadasha} Mahadasha
                </div>
                <div className="text-base font-semibold text-foreground mt-1">
                  {result.dasha!.antardasha} Antardasha
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  The Mahadasha is the broad planetary chapter; the Antardasha
                  is the sub-period running within it. Expand the timeline below
                  for exact dates and deeper levels.
                </p>
              </div>
            )}

            {/* 5-level expandable Dasha tree */}
            {hasTimeline && (
              <DashaDeepDive
                mahadashas={result.dashaTimeline!.map(m => ({
                  lord: m.lord,
                  start: m.start,
                  end: m.end,
                }))}
              />
            )}

            {/* What's ahead — by life area and time horizon */}
            {hasTimeline && (
              <WhatsAhead
                lagnaSignIndex={result.lagna.signIndex}
                planets={result.planets.map(p => ({
                  name: p.name,
                  house: p.house,
                }))}
                dashaTimeline={result.dashaTimeline!}
              />
            )}

            {/* Methodology note */}
            <p className="text-xs text-muted-foreground">
              Dates are computed from your Moon's sidereal longitude using the
              Lahiri <TermTip id="ayanamsa">ayanamsa</TermTip>. The Vimshottari
              system uses classical proportional divisions — the same nine-planet
              sequence applies at every level. Treat this as a classical timing
              guide, not a fixed prediction.
            </p>
          </div>
        )}

        {/* ── Anti-orphan interlinks — always visible ── */}
        <nav
          aria-label="Related tools"
          className="mt-8 pt-6 border-t border-border"
        >
          <p className="text-xs text-muted-foreground mb-2">Related tools</p>
          <ul className="flex flex-wrap gap-3 text-sm">
            <li>
              <Link to="/kundali" className="text-primary hover:underline">
                Full Kundali chart
              </Link>
            </li>
            <li>
              <Link to="/vedic-astrology" className="text-primary hover:underline">
                Vedic Astrology overview
              </Link>
            </li>
            <li>
              <Link to="/sade-sati" className="text-primary hover:underline">
                Sade Sati calculator
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="text-primary hover:underline">
                How it works
              </Link>
            </li>
          </ul>
        </nav>
      </section>
    </PajPage>
  );
}
