import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import {
  computeRashifal,
  rashiBySlug,
  RASHIS,
  RASHIFAL_PERIODS,
  type RashifalPeriod,
  type Grade,
  type Tone,
} from '@/lib/vedic/rashifal';

const PERIOD_WORD: Record<RashifalPeriod, string> = {
  today: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly',
};
const PERIOD_TAB: Record<RashifalPeriod, string> = {
  today: 'Today', week: 'This week', month: 'This month', year: 'This year',
};

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

export default function RashifalSign() {
  const { rashi: slug, period: periodParam } = useParams<{ rashi: string; period?: string }>();
  const rashi = slug ? rashiBySlug(slug) : undefined;
  const period = (periodParam ?? 'today') as RashifalPeriod;
  const periodValid = RASHIFAL_PERIODS.includes(period);

  // Compute at request time from today's real planetary positions; memoise per day.
  const todayKey = new Date().toISOString().slice(0, 10);
  const data = useMemo(() => {
    if (!rashi || !periodValid) return null;
    const idx = RASHIS.findIndex(r => r.slug === rashi.slug);
    return computeRashifal(idx, period, new Date());
  }, [rashi?.slug, period, periodValid, todayKey]);

  // Unknown period on a valid rashi → canonicalise to the daily page.
  if (rashi && periodParam && !periodValid) {
    return <Navigate to={`/rashifal/${rashi.slug}/today`} replace />;
  }

  if (!rashi || !data) {
    return (
      <ToolLayout
        theme="vedic"
        testId="rashifal-sign"
        seo={<SEO title="Rashifal — Horoscope by Moon Sign | BornClock" description="Pick your Vedic Moon sign (rashi) for a computed daily, weekly, monthly and yearly horoscope." canonicalUrl="/rashifal" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Rashifal' }}
        eyebrow="Rashifal"
        h1="Choose your Rashi"
      >
        <section className="section">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <p className="text-muted-foreground mb-4">That rashi was not found. Pick your Vedic Moon sign:</p>
            <div className="flex flex-wrap gap-2">
              {RASHIS.map(r => (
                <Link key={r.slug} to={`/rashifal/${r.slug}/today`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">
                  {r.sanskrit} <span className="text-muted-foreground">({r.english})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const overview = data.sections[0];
  const areaSections = data.sections.slice(1);
  const startNice = new Date(data.dateRange.startISO + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const endNice = new Date(data.dateRange.endISO + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const rangeLabel = period === 'today' ? startNice : `${startNice} – ${endNice}`;

  const title = `${rashi.sanskrit} (${rashi.english}) ${PERIOD_WORD[period]} Horoscope — Rashifal | BornClock`;
  const description = `${PERIOD_WORD[period]} rashifal for ${rashi.sanskrit} (${rashi.english}), computed from the real sidereal planetary transits for this period — graded, plain-language predictions for love, career, money and health.`;

  const faqItems = [
    {
      question: `How is the ${rashi.sanskrit} rashifal calculated?`,
      answer: `It is a gochar (transit) reading. We compute where each planet actually sits in the sky right now using the sidereal (Lahiri) zodiac, then read each one by the classical "house from your Moon sign" method. Because the planets move, the reading changes with the date — it is not a fixed, pre-written paragraph.`,
    },
    {
      question: `Is rashifal based on my Sun sign or Moon sign?`,
      answer: `Vedic rashifal is read from your Moon sign (Chandra rashi), not the Sun sign used in most Western horoscopes. If you are not sure of your Moon sign, generate your free Kundli to find it.`,
    },
    {
      question: `What do "strong", "moderate" and "mild" mean here?`,
      answer: `They grade how pronounced an influence is. Strong = a clear, headline influence (usually a slow planet like Saturn or Jupiter in a notable house); moderate = a real but secondary influence; mild = a light background note. Nothing here is a guarantee — it is how the tradition reads the current sky.`,
    },
    {
      question: `Should I make decisions based on this?`,
      answer: `Treat it as reflective guidance, not instruction. It never names dates for illness, loss or other sensitive events, and it is not a substitute for medical, financial or legal advice.`,
    },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-sign"
      seo={<SEO title={title} description={description} canonicalUrl={`/rashifal/${rashi.slug}/${period}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Rashifal', to: '/rashifal' }], current: `${rashi.sanskrit} · ${PERIOD_TAB[period]}` }}
      footer={{ tagline: 'Computed Vedic horoscopes from your real Moon sign.', nav: [{ label: 'All rashis', to: '/rashifal' }, { label: 'Free Kundli', to: '/kundali' }], note: 'Readings are computed from sidereal planetary transits and attributed to the Vedic tradition — reflective guidance, not certainty.' }}
      eyebrow="Rashifal · by Moon sign"
      h1={`${rashi.sanskrit} ${PERIOD_WORD[period]} Horoscope`}
      lead={`${rashi.english} · ruled by ${rashi.lord} · ${rangeLabel}`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">

          {/* Period tabs */}
          <div className="flex flex-wrap gap-2 mb-4" data-testid="rashifal-periods">
            {RASHIFAL_PERIODS.map(p => (
              <Link
                key={p}
                to={`/rashifal/${rashi.slug}/${p}`}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${p === period ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}
              >
                {PERIOD_TAB[p]}
              </Link>
            ))}
          </div>

          {/* Overview */}
          <div className="rounded-2xl border border-border p-5 mb-6 bg-gradient-to-br from-card to-muted/20" data-testid="rashifal-overview">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Overview</h2>
              <GradeBadge grade={overview.grade} tone={overview.tone} />
            </div>
            <p className="text-foreground leading-relaxed">{overview.text}</p>
          </div>

          {/* Life areas */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6" data-testid="rashifal-sections">
            {areaSections.map(s => (
              <div key={s.key} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-foreground">{s.title}</h2>
                  <GradeBadge grade={s.grade} tone={s.tone} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Ingress (month/year) */}
          {data.ingress.length > 0 && (
            <div className="rounded-xl border border-border p-4 mb-6" data-testid="rashifal-ingress">
              <h2 className="font-semibold text-foreground mb-2">Key planetary moves this {period === 'year' ? 'year' : 'month'}</h2>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                {data.ingress.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          {/* Why — the transits */}
          <details className="rounded-xl border border-border p-4 mb-6" data-testid="rashifal-transits">
            <summary className="font-semibold text-foreground cursor-pointer">Why — the transits behind this reading</summary>
            <p className="text-xs text-muted-foreground mt-2 mb-3">
              Each line reads a planet by its <TermTip id="rashi">house from your Moon sign</TermTip>. Grades reflect how pronounced the influence is.
            </p>
            <ul className="space-y-2">
              {data.transits.map(t => (
                <li key={t.planet} className="text-sm">
                  <span className="font-medium text-foreground">{t.planet}</span>
                  {t.sadeSati && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Sade Sati</span>}
                  {t.dhaiya && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Dhaiya</span>}
                  <span className="ml-2"><GradeBadge grade={t.grade} tone={t.tone} /></span>
                  <p className="text-muted-foreground mt-0.5">{t.text}</p>
                </li>
              ))}
            </ul>
          </details>

          {/* Lucky + honesty */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span className="px-3 py-1.5 rounded-lg border border-border text-foreground">Traditional lucky colour: <strong>{data.lucky.color}</strong></span>
            <span className="px-3 py-1.5 rounded-lg border border-border text-foreground">Lucky numbers: <strong>{data.lucky.numbers.join(', ')}</strong></span>
          </div>
          <p className="text-xs text-muted-foreground mb-8">
            Computed from the real sidereal (<TermTip id="ayanamsa">Lahiri</TermTip>) positions of the planets for this period and read by classical gochar (transit) rules — the same engine behind your Kundli.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          {/* Other signs */}
          <h2 className="font-semibold text-foreground mb-2">Other rashis — {PERIOD_TAB[period]}</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {RASHIS.filter(r => r.slug !== rashi.slug).map(r => (
              <Link key={r.slug} to={`/rashifal/${r.slug}/${period}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                {r.sanskrit}
              </Link>
            ))}
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Not sure of your Moon sign? Generate your free Kundli to find it — then your rashifal is read from the right sign.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
              <Link to={`/vedic-zodiac/${rashi.slug}`} className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">About {rashi.sanskrit} →</Link>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
