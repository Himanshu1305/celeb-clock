import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import {
  computeYearTransit,
  TRANSIT_PLANETS,
  type TransitPlanet,
} from '@/lib/vedic/transits';
import { RASHIS, type Grade, type Tone } from '@/lib/vedic/rashifal';

const GRADE_STYLE: Record<Grade, string> = {
  strong: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  moderate: 'bg-amber-100 text-amber-800 border-amber-300',
  mild: 'bg-slate-100 text-slate-700 border-slate-300',
};
const TONE_DOT: Record<Tone, string> = {
  favourable: 'text-emerald-600', mixed: 'text-amber-600', challenging: 'text-rose-600',
};

function GradeBadge({ grade, tone }: { grade: Grade; tone: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${GRADE_STYLE[grade]}`}>
      <span className={TONE_DOT[tone]}>●</span>{grade} · {tone}
    </span>
  );
}

const PLANET_SLUGS: TransitPlanet[] = ['saturn', 'jupiter', 'rahu', 'ketu'];
// Window the worker's not-found logic also enforces (see functions/_worker.ts).
const MIN_YEAR = 2020;
const MAX_YEAR = 2039;

function niceDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function TransitYearPage() {
  const { planet: planetParam, year: yearParam } = useParams<{ planet: string; year: string }>();
  const planet = (planetParam ?? '') as TransitPlanet;
  const planetValid = PLANET_SLUGS.includes(planet);
  const year = Number(yearParam);
  const yearValid = Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;

  const data = useMemo(() => {
    if (!planetValid || !yearValid) return null;
    return computeYearTransit(planet, year);
  }, [planet, planetValid, year, yearValid]);

  if (!planetValid || !yearValid || !data) {
    return (
      <ToolLayout
        theme="vedic"
        testId="transit-year"
        seo={<SEO title="Planetary Transits by Year — Saturn, Jupiter, Rahu & Ketu | BornClock" description="Pick a planet and year for its computed Vedic transit: real ingress dates and the effect on each Moon sign." canonicalUrl="/transit" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Transits' }}
        eyebrow="Gochar · planetary transits"
        h1="Planetary transits by year"
      >
        <section className="section">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <p className="text-muted-foreground mb-4">That transit page was not found. Choose a planet:</p>
            <div className="flex flex-wrap gap-2">
              {PLANET_SLUGS.map(p => (
                <Link key={p} to={`/transit/${p}/${new Date().getUTCFullYear()}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">
                  {TRANSIT_PLANETS[p].label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const meta = TRANSIT_PLANETS[planet];
  const title = `${meta.label} Transit ${year} — Dates & Effect on Every Rashi | BornClock`;
  const description = `${meta.label} transit (gochar) for ${year}: the sign it occupies, the real ingress date(s), and a graded, plain-language reading of its effect on each of the 12 Moon signs — computed from sidereal positions.`;

  const sameSign = data.startSign === data.endSign;
  const faqItems = [
    {
      question: `Where is ${meta.label} in ${year}?`,
      answer: sameSign
        ? `Through ${year}, ${meta.label.split(' ')[0]} stays in ${data.startSign}. ${meta.blurb}`
        : `${meta.label.split(' ')[0]} begins ${year} in ${data.startSign} and moves to ${data.endSign} during the year (see the dates above). ${meta.blurb}`,
    },
    {
      question: `How is this transit calculated?`,
      answer: `We read the planet's real sidereal (Lahiri) longitude for ${year}, find the exact day it changes sign (ingress), and then read it from each Moon sign by the classical "house from the Moon" method. The effect therefore differs by your Moon sign — it is not one paragraph for everyone.`,
    },
    {
      question: `What do strong, moderate and mild mean?`,
      answer: `They grade how pronounced the influence is for that Moon sign — strong is a headline theme for the year, moderate a real secondary influence, mild a light background note. Nothing here names dates for sensitive events; it is how the Vedic tradition reads this transit.`,
    },
  ];

  const years = [year - 1, year, year + 1].filter(y => y >= MIN_YEAR && y <= MAX_YEAR);

  return (
    <ToolLayout
      theme="vedic"
      testId="transit-year"
      seo={<SEO title={title} description={description} canonicalUrl={`/transit/${planet}/${year}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Transits', to: '/transit' }], current: `${meta.label.split(' ')[0]} ${year}` }}
      footer={{ tagline: 'Computed Vedic transits from real sidereal positions.', nav: [{ label: 'All transits', to: '/transit' }, { label: 'Rashifal', to: '/rashifal' }, { label: 'Free Kundli', to: '/kundali' }], note: 'Transit readings are computed and attributed to the Vedic tradition — reflective guidance, not certainty.' }}
      eyebrow="Gochar · planetary transit"
      h1={`${meta.label} Transit ${year}`}
      lead={sameSign ? `In ${data.startSign} through ${year}` : `${data.startSign} → ${data.endSign} during ${year}`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">

          {/* Year switcher */}
          <div className="flex flex-wrap gap-2 mb-4" data-testid="transit-years">
            {years.map(y => (
              <Link key={y} to={`/transit/${planet}/${y}`} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${y === year ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}>
                {y}
              </Link>
            ))}
            <span className="px-3 py-1.5 text-sm text-muted-foreground">·</span>
            {PLANET_SLUGS.filter(p => p !== planet).map(p => (
              <Link key={p} to={`/transit/${p}/${year}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                {TRANSIT_PLANETS[p].label.split(' ')[0]} {year}
              </Link>
            ))}
          </div>

          {/* Overview */}
          <div className="rounded-2xl border border-border p-5 mb-6 bg-gradient-to-br from-card to-muted/20" data-testid="transit-overview">
            <h2 className="text-lg font-semibold text-foreground mb-2">What is happening</h2>
            <p className="text-foreground leading-relaxed mb-2">{meta.blurb}</p>
            <p className="text-muted-foreground">
              {sameSign
                ? `Through ${year}, it remains in ${data.startSign}, so the themes below hold for the whole year.`
                : `It begins the year in ${data.startSign} and shifts to ${data.endSign} — the house it occupies from your Moon sign changes on the ingress date, which is why the reading can turn during the year.`}
            </p>
          </div>

          {/* Ingress timeline */}
          <div className="rounded-xl border border-border p-4 mb-6" data-testid="transit-ingress">
            <h2 className="font-semibold text-foreground mb-2">Sign changes in {year}</h2>
            {data.ingress.length > 0 ? (
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                {data.ingress.map((n, i) => <li key={i}><strong className="text-foreground">{niceDate(n.date)}</strong> — enters {n.sign}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No sign change in {year} — {meta.label.split(' ')[0]} stays in {data.startSign} all year.</p>
            )}
          </div>

          {/* Per Moon sign */}
          <h2 className="font-semibold text-foreground mb-2">Effect on each Moon sign in {year}</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Read by the <TermTip id="rashi">house from your Moon sign</TermTip>. Find your Moon sign free with a <Link to="/kundali" className="underline">Kundli</Link>.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6" data-testid="transit-persign">
            {data.perSign.map(s => (
              <Link key={s.moonSlug} to={`/rashifal/${s.moonSlug}/year`} className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{RASHIS.find(r => r.slug === s.moonSlug)?.sanskrit} <span className="text-muted-foreground font-normal text-xs">({RASHIS.find(r => r.slug === s.moonSlug)?.english})</span></h3>
                  <GradeBadge grade={s.grade} tone={s.tone} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                {s.sadeSati && <span className="inline-block mt-2 text-xs px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Sade Sati</span>}
                {s.dhaiya && <span className="inline-block mt-2 ml-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Dhaiya</span>}
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-8">
            Computed from the real sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) position of {meta.label.split(' ')[0]} for {year} and read by classical gochar rules — the same engine behind your Kundli.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
            {planet === 'saturn' && <> · <Link to="/sade-sati" className="underline">Check your Sade Sati →</Link></>}
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">See how this transit lands in your own chart, from your real Moon sign.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
              <Link to="/rashifal" className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">Daily Rashifal →</Link>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
