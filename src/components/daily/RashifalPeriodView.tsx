/**
 * /rashifal/:rashi/week | month | year — the weekly (Monday–Sunday), monthly and yearly
 * Vedic rashifal (Batch 8), on the shared daily-page mechanism (src/lib/daily): the
 * Worker injects the CURRENT period's dates and text (precomputed per week / month /
 * year); this component renders the same entry (embedded data → period JSON → fallback).
 */
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { RASHIS, RASHIFAL_PERIODS, type RashifalPeriod, type RashiMeta } from '@/lib/vedic/rashifal';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { RASHI_SLUGS, RASHI_SLUGS_HI } from '@/lib/daily/registry';
import { DailyTermStrip } from './DailyTermStrip';

type Period = Exclude<RashifalPeriod, 'today'>;
const PERIOD_TAB: Record<RashifalPeriod, string> = { today: 'Today', week: 'This week', month: 'This month', year: 'This year' };
const PERIOD_WORD: Record<Period, string> = { week: 'Weekly', month: 'Monthly', year: 'Yearly' };

export function RashifalPeriodView({ rashi, period }: { rashi: RashiMeta; period: Period }) {
  const idx = RASHIS.findIndex(r => r.slug === rashi.slug);
  const name = rashi.slug.charAt(0).toUpperCase() + rashi.slug.slice(1);
  const path = `/rashifal/${rashi.slug}/${period}`;
  const { entry } = useDailyEntry(`rashifal-${period}`, rashi.slug);

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-sign"
      seo={<SEO
        title={entry?.title ?? `${rashi.sanskrit} (${rashi.english}) ${PERIOD_WORD[period]} Horoscope — Rashifal | BornClock`}
        description={entry?.description ?? `${PERIOD_WORD[period]} rashifal for ${rashi.sanskrit} (${rashi.english}), computed from the real sidereal planetary transits for this period.`}
        canonicalUrl={path}
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Rashifal', to: '/rashifal' }], current: `${rashi.sanskrit} · ${PERIOD_TAB[period]}` }}
      footer={{ tagline: 'Computed Vedic horoscopes from your real Moon sign.', nav: [{ label: 'All rashis', to: '/rashifal' }, { label: 'Free Kundli', to: '/kundali' }], note: 'Readings are computed from sidereal planetary transits and attributed to the Vedic tradition — reflective guidance, not certainty.' }}
      eyebrow="Rashifal · by Moon sign"
      h1={<DailyH1 entry={entry} fallback={`${name} ${PERIOD_WORD[period]} Rashifal`} />}
      lead={<>{rashi.sanskrit} ({rashi.english}) Moon sign · ruled by {rashi.lord} · <DailyDate entry={entry} /></>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-4" data-testid="rashifal-periods">
            {RASHIFAL_PERIODS.map(p => (
              <Link key={p} to={`/rashifal/${rashi.slug}/${p}`}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${p === period ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}>
                {PERIOD_TAB[p]}
              </Link>
            ))}
            <Link to={`/hi/rashifal/${RASHI_SLUGS_HI[idx]}`} lang="hi" className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">हिंदी में (आज)</Link>
          </div>

          <DailyBody entry={entry} testId={`rashifal-${period}`} />

          <DailyTermStrip
            title="What these words mean"
            terms={[
              { key: 'gochar', label: 'Gochar (transit)' },
              { key: 'houseFromMoon', label: 'House from your Moon sign' },
              { key: 'transitGrade', label: 'Strong / moderate / mild' },
              { key: 'sadeSati', label: 'Sade Sati' },
              { key: 'dhaiya', label: 'Dhaiya' },
              { key: 'ingress', label: 'Planetary move (ingress)' },
              { key: 'ayanamsa', label: 'Lahiri (sidereal)' },
              { key: 'luckyColour', label: 'Lucky colour' },
              { key: 'luckyNumber', label: 'Lucky numbers' },
            ]}
          />

          <p className="text-xs text-muted-foreground mb-6">
            Computed from the real sidereal (Lahiri) positions of the planets for this period with the same engine behind your Kundli, and read by classical gochar rules from your Moon sign.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <h2 className="font-semibold text-foreground mb-2">Other rashis — {PERIOD_TAB[period]}</h2>
          <div className="flex flex-wrap gap-2 mb-8" data-testid="rashifal-others">
            {RASHIS.filter(r => r.slug !== rashi.slug).map(r => (
              <Link key={r.slug} to={`/rashifal/${r.slug}/${period}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                {r.sanskrit}
              </Link>
            ))}
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Not sure of your Moon sign? Generate your free Kundli to find it — then your rashifal is read from the right sign.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
              <Link to={`/vedic-zodiac/${RASHI_SLUGS[idx]}`} className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">About {rashi.sanskrit} →</Link>
            </div>
          </div>
        </div>
      </section>
      <DailyJsonLd entry={entry} path={path} />
    </ToolLayout>
  );
}
