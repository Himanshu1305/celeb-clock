/**
 * Batch 10 — "Planets today" (/planets-today): where all nine grahas are today in the
 * sidereal (Lahiri) zodiac — sign, degree, Nakshatra-pada, retrograde and combust status,
 * and each one's next sign change — plus the year's retrograde and combustion periods.
 *
 * Today's block comes from the shared daily mechanism (data kind 'planet-day', injected by
 * the Worker each day); the year table is computed with the same engine (src/lib/vedic/sky.ts,
 * checked against Swiss Ephemeris in src/lib/vedic/__tests__/sky.test.ts).
 * Distinct from /transit (slow planets by year) and /planet-in-sign (meanings).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { formatShortDateEn, istDateISO } from '@/lib/daily/dates';
import { PLANETS_TODAY_STATIC } from '@/lib/daily/kinds/skyTemplate';
import { combustPeriods, retrogradePeriods, COMBUST_ORBS, type Graha, type Period } from '@/lib/vedic/sky';

const YEAR_PLANETS: Graha[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const span = (p: Period) => `${formatShortDateEn(istDateISO(p.start))} – ${formatShortDateEn(istDateISO(p.end))}`;

function YearTable({ year }: { year: number }) {
  const rows = useMemo(() => YEAR_PLANETS.map(p => ({
    planet: p, retro: retrogradePeriods(p, year), combust: combustPeriods(p, year),
  })), [year]);
  return (
    <>
      <p className="mt-2 text-xs text-muted-foreground sm:hidden">Swipe sideways to see every column →</p>
      <figure className="mt-2 overflow-x-auto" data-testid="planets-year-table">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr>
              <th scope="col" className="text-left font-semibold text-foreground px-2 py-1 border-b border-border">Planet</th>
              <th scope="col" className="text-left font-semibold text-foreground px-2 py-1 border-b border-border">Retrograde (turns back → turns direct)</th>
              <th scope="col" className="text-left font-semibold text-foreground px-2 py-1 border-b border-border">Combust (orb)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.planet} className="border-b border-border/60 align-top">
                <th scope="row" className="text-left font-medium text-foreground px-2 py-1 whitespace-nowrap">{r.planet}</th>
                <td className="px-2 py-1 text-muted-foreground">{r.retro.length ? r.retro.map(span).join('; ') : 'not retrograde this year'}</td>
                <td className="px-2 py-1 text-muted-foreground">{r.combust.length ? r.combust.map(span).join('; ') : 'not combust this year'} <span className="text-xs">({COMBUST_ORBS[r.planet]![0]}°{COMBUST_ORBS[r.planet]![1] !== COMBUST_ORBS[r.planet]![0] ? `, ${COMBUST_ORBS[r.planet]![1]}° retrograde` : ''})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </>
  );
}

export default function PlanetsTodayPage() {
  const { entry } = useDailyEntry('planets-today', 'index');
  const thisYear = Number(istDateISO(new Date()).slice(0, 4));
  const [year, setYear] = useState(thisYear);

  return (
    <ToolLayout
      theme="vedic"
      testId="planets-today-page"
      seo={<SEO title={PLANETS_TODAY_STATIC.title} description={PLANETS_TODAY_STATIC.description} canonicalUrl="/planets-today" ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Transits', to: '/transit' }], current: 'Planets today' }}
      footer={{ tagline: 'Daily planet positions from the real sky.', nav: [{ label: 'Transits by year', to: '/transit' }, { label: 'Mercury retrograde', to: '/mercury-retrograde' }, { label: 'Moon phase', to: '/moon-phase' }, { label: 'Rashifal', to: '/rashifal' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Gochar · today"
      h1={<DailyH1 entry={entry} fallback={PLANETS_TODAY_STATIC.h1} />}
      lead={<DailyDate entry={entry} />}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <DailyBody entry={entry} testId="planets-today-body" />
          <DailyJsonLd entry={entry} path="/planets-today" />

          <section className="rounded-xl border border-border p-4 mb-6" data-testid="planets-year">
            <h2 className="font-semibold text-foreground mb-1">Retrograde and combust periods in {year}</h2>
            <p className="text-sm text-muted-foreground">Dates in IST. A <TermTip id="retrograde">retrograde</TermTip> spell runs from the day the planet turns back to the day it turns forward again; a <TermTip id="combust">combust</TermTip> spell is the time it stays within the Surya Siddhanta distance of the Sun. Stations are gradual, so the date matters, not the minute.</p>
            <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Year">
              {[thisYear - 1, thisYear, thisYear + 1].map(y => (
                <button key={y} type="button" onClick={() => setYear(y)} aria-pressed={y === year}
                        className={`px-3 py-1 rounded-lg border text-sm ${y === year ? 'border-primary text-primary' : 'border-border'}`}>{y}</button>
              ))}
            </div>
            <YearTable year={year} />
          </section>

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="planets-how">
            <h2 className="font-semibold text-foreground">How these positions are worked out</h2>
            <p>Positions are for 12:00 noon IST and use the sidereal zodiac with the <TermTip id="ayanamsa">Lahiri ayanamsa</TermTip>, as Indian Panchangs do; <TermTip id="rahu">Rahu</TermTip> and Ketu are the mean lunar nodes. Each sign is split into <TermTip id="nakshatra">Nakshatras</TermTip> and their four <TermTip id="pada">padas</TermTip>; the degree is how far into its sign the planet is (<TermTip id="planetDegree">what the degree means</TermTip>).</p>
            <p>In our tests the positions agree with Swiss Ephemeris to well within 1 arc-minute on five dates from 2026 to 2030, sign changes and stations to within minutes, and combustion spells to within minutes using the same orbs. Drik Panchang’s own combustion (Asta) dates use a visibility model for the observer, so they can differ from these orb-based dates by several days. <Link to="/accuracy" className="underline">How we check accuracy →</Link></p>
          </div>

          <nav className="text-sm mb-8 space-x-3" aria-label="Related pages">
            <Link to="/transit" className="text-primary hover:underline">Saturn, Jupiter, Rahu &amp; Ketu by year →</Link>
            <Link to="/mercury-retrograde" className="text-primary hover:underline">Mercury retrograde dates →</Link>
            <Link to="/planet-in-sign" className="text-primary hover:underline">What each planet means in each sign →</Link>
          </nav>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See how today’s planets fall in YOUR chart — houses, dasha and transits from your Moon sign.</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Open your Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
