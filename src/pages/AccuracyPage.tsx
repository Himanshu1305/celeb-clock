/**
 * /accuracy — "How we check our accuracy" (Batch 8).
 *
 * Every number on this page comes from src/lib/accuracy/evidence.ts, which documents the
 * test or fixture each one came from, and src/lib/accuracy/__tests__/accuracyEvidence.test.ts
 * re-derives them from the reference fixtures on every test run.
 *
 * Wording rules (India ASCI code): every claim is dated and backed by the evidence shown;
 * no "100%", "most accurate" or comparisons; AstroSage and Drik Panchang are named only as
 * what we compared with — never as being wrong.
 */
import { Link } from 'react-router-dom';
import { ArticleLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { TermTip } from '@/components/vedic/TermTip';
import { EVIDENCE, ACCURACY_FAQ, COUNTS, TESTED_MONTH, PAGE_UPDATED, PAGE_UPDATED_ISO } from '@/lib/accuracy/evidence';

const link = 'text-primary underline hover:opacity-80';

export default function AccuracyPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ACCURACY_FAQ.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <ArticleLayout
      theme="vedic"
      testId="accuracy-page"
      seo={(
        <SEO
          title="How We Check Our Accuracy — Dated Test Results | BornClock"
          description={`In our tests (${TESTED_MONTH}), BornClock's Kundali positions were within 1 arc-minute of the Swiss Ephemeris for ${COUNTS.kundaliBirths} test births, and Panchang sunrise and Rahu Kaal times within 1 minute of Drik Panchang. See every check, the reference, the date and the limits.`}
          keywords="BornClock accuracy, kundali accuracy test, panchang accuracy, swiss ephemeris, lahiri ayanamsa, guna milan astrosage, how we test"
          canonicalUrl="/accuracy"
          ogImage="https://bornclock.com/og/vedic.png"
          modifiedTime={PAGE_UPDATED_ISO}
        />
      )}
      breadcrumb={{ trail: [{ label: 'How it works', to: '/how-it-works' }], current: 'Accuracy' }}
      footer={{
        tagline: 'What we checked, against what, and when — including the limits.',
        nav: [
          { label: 'How it works', to: '/how-it-works' },
          { label: 'Free Kundali', to: '/kundali' },
          { label: 'Kundali Matching', to: '/kundali-match' },
          { label: 'Panchang', to: '/panchang' },
          { label: 'Glossary', to: '/glossary' },
          { label: 'Contact', to: '/contact' },
        ],
      }}
      eyebrow="Accuracy"
      h1="How we check our accuracy."
      lead={`Our calculations are checked against standard references. Here is exactly what we compared, with what, how many cases, the result and the date. Last updated ${PAGE_UPDATED}.`}
    >
      <JsonLd data={faqJsonLd} id="accuracy-faq" />
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl text-muted-foreground leading-relaxed">

          <p className="mb-6" data-testid="accuracy-summary">
            In our tests ({TESTED_MONTH}), the same code that runs on this website gave{' '}
            <TermTip id="lagna">Lagna</TermTip> and planet positions within 1 arc-minute of the Swiss Ephemeris
            (an independent astronomical library) for all {COUNTS.kundaliBirths} test births, the same{' '}
            <TermTip id="ashtakoota">Guna Milan</TermTip> total as AstroSage for all {COUNTS.couples} test couples,
            and <TermTip id="panchang">Panchang</TermTip> clock times such as sunrise and Rahu Kaal within 1 minute of Drik
            Panchang in {COUNTS.panchangCities} cities.
            We check calculations — the astronomy, dates and scores — not predictions.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-3">What we checked</h2>
          <div className="overflow-x-auto rounded-lg border border-border mb-3">
            <table className="w-full text-sm" data-testid="accuracy-table">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th scope="col" className="text-left px-3 py-2 font-semibold">What we checked</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold">Compared with</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold">How many</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold">Result</th>
                  <th scope="col" className="text-left px-3 py-2 font-semibold whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {EVIDENCE.map(r => (
                  <tr key={r.id} data-testid={`accuracy-row-${r.id}`}>
                    <td className="px-3 py-2 font-medium text-foreground align-top">{r.what}</td>
                    <td className="px-3 py-2 align-top">{r.reference}</td>
                    <td className="px-3 py-2 align-top">{r.howMany}</td>
                    <td className="px-3 py-2 align-top">{r.result}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mb-8">
            Dates are when the reference values were recorded or the comparison was run. AstroSage values were entered by
            hand on astrosage.com; Drik Panchang and NASA values were copied from their published pages; Swiss Ephemeris
            values were computed with pyswisseph 2.10.03. The test births include people born in India, the UK, the USA and
            Australia, and edge cases chosen because a planet or the Lagna sits close to a sign boundary.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-3">What “within 1 arc-minute” means</h2>
          <p className="mb-8">
            A zodiac sign is 30 degrees wide and a degree has 60 arc-minutes, so 1 arc-minute is 1/1,800 of a sign. The
            largest gap we found was {COUNTS.kundaliMaxArcsec} arc-seconds (about half an arc-minute). At that size the sign,{' '}
            <TermTip id="nakshatra">Nakshatra</TermTip> and <TermTip id="pada">pada</TermTip> come out the same unless a
            planet sits right on a boundary — which is why we include boundary cases in the tests.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-3">Our conventions</h2>
          <p className="mb-3">Astrology sites can differ simply because they follow different conventions. These are ours:</p>
          <ul className="list-disc pl-5 space-y-2 mb-8">
            <li>
              <strong className="text-foreground"><TermTip id="ayanamsa">Ayanamsa</TermTip>: Lahiri</strong>, in the form Drik
              Panchang uses (the mean Lahiri value, calibrated so planet ingress moments line up with Drik’s published times).
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="rahu">Rahu</TermTip> and Ketu: mean node</strong> — the
              smoothed average position, with Ketu exactly opposite Rahu. Sites that use the “true node” can show Rahu a
              little earlier or later.
            </li>
            <li>
              <strong className="text-foreground">Houses: whole sign</strong> — each house is one full sign counted from the Lagna.
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="vimshottari">Vimshottari Dasha</TermTip></strong> per the
              classical text (Brihat Parashara Hora Shastra), with a year of 365.25 days.
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="shodashvarga">Divisional charts</TermTip>: Parashari rules</strong>{' '}
              from Brihat Parashara Hora Shastra, chapter 6, for all 16 charts from D1 to D60.
            </li>
            <li>
              <strong className="text-foreground">Kundali matching: AstroSage’s convention</strong> — the same Ashtakoota
              tables, including which way round the boy and girl are counted.
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="manglik">Manglik</TermTip>: AstroSage’s convention</strong> —
              Mars in house 1, 4, 7, 8 or 12 counted from the Lagna and, separately, from the Moon. Both = High, one = Low,
              none = not Manglik. Classical cancellations are not applied to the level.
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="kaalsarp">Kaal Sarp</TermTip>: full pattern only</strong> — all
              seven planets from the Sun to Saturn between Rahu and Ketu on one side.
            </li>
            <li>
              <strong className="text-foreground">Panchang</strong>: the five limbs are read at local sunrise. Festival and{' '}
              <TermTip id="ekadashi">Ekadashi</TermTip> dates are compared with Drik Panchang’s New Delhi calendar (its
              Smarta date where it lists two).
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mb-3">Honest limits</h2>
          <ul className="list-disc pl-5 space-y-2 mb-8">
            <li>
              <strong className="text-foreground">Birth time matters.</strong> The Lagna moves about one degree every four
              minutes, so a birth time that is a few minutes off can change the Lagna, the houses and the finer divisional
              charts (D27 and above, especially D60). The calculation can only be as exact as the birth time you enter. The
              divisional-charts section notes when a chart would change within five minutes either side of your time.
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="tithi">Tithi</TermTip> and Nakshatra end times can differ by up
              to about 2 minutes</strong> from another Panchang. They depend only on the Moon, and small differences between
              astronomical methods shift them by seconds, which can tip the rounding to the next minute. Sunrise, sunset and
              windows such as Rahu Kaal were within 1 minute in our tests.
            </li>
            <li>
              <strong className="text-foreground">Date-only Moon sign.</strong> When only a birth date is known (as on our
              celebrity pages), the Moon may change sign during that day. On those days we show both signs and say it depends
              on the birth time.
            </li>
            <li>
              <strong className="text-foreground"><TermTip id="dasha">Dasha</TermTip> dates move with the Moon.</strong> A tiny
              difference in the Moon’s position shifts Dasha start dates by hours. In our tests the current Antardasha start
              was within {COUNTS.dashaMaxHours} hours of the Swiss Ephemeris date for every test birth. A site using a different
              year length or ayanamsa will show different dates.
            </li>
            <li>
              <strong className="text-foreground">Very old dates.</strong> For a few births before 1210 CE, the Moon position
              differed from the Swiss Ephemeris by up to about 9 arc-minutes (the sign was still the same). Ancient birth dates
              are often uncertain anyway.
            </li>
            <li>
              <strong className="text-foreground">Tests cover samples, not every possible chart.</strong> The table says exactly
              how many cases were checked. If you find a difference, please tell us at{' '}
              <a href="mailto:hello@bornclock.com" className={link}>hello@bornclock.com</a> with the birth details and the
              site you compared with.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mb-3">How we keep it true</h2>
          <p className="mb-3">
            The reference values are stored with the code, and the checks are automatic:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-8">
            <li>
              <strong className="text-foreground">Weekly drift check.</strong> Every Monday at about 03:00 India time, an
              automatic job sends the {COUNTS.goldenBirths} reference births and {COUNTS.couples} couples both to the current code
              and to the live bornclock.com website, and compares every answer with the stored reference values. Any
              difference opens an alert for us to fix.
            </li>
            <li>
              <strong className="text-foreground">Before every release.</strong> The same reference tests — Kundali, matching,
              Panchang, festivals, eclipses and divisional charts — run before each new version of the website goes live, and
              any failure stops the release. They include a test that re-checks the numbers on this page.
            </li>
            <li>
              <strong className="text-foreground">Dated wording.</strong> When we re-run a comparison, we update the date and
              numbers here.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mb-3">Questions</h2>
          <div className="space-y-4 mb-8" data-testid="accuracy-faq">
            {ACCURACY_FAQ.map(f => (
              <div key={f.q}>
                <h3 className="font-semibold text-foreground">{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <p className="text-sm">
            Try it yourself: <Link to="/kundali" className={link}>Free Kundali</Link> ·{' '}
            <Link to="/kundali-match" className={link}>Kundali Matching</Link> ·{' '}
            <Link to="/panchang" className={link}>Today’s Panchang</Link> ·{' '}
            <Link to="/how-it-works#vedic" className={link}>How BornClock works</Link>
          </p>
        </div>
      </section>
    </ArticleLayout>
  );
}
