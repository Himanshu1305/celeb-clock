import { useParams, Link, Navigate } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { RashifalDailyView } from '@/components/daily/RashifalDailyView';
import { RashifalPeriodView } from '@/components/daily/RashifalPeriodView';
import { rashiBySlug, RASHIS, RASHIFAL_PERIODS, type RashifalPeriod } from '@/lib/vedic/rashifal';

/**
 * /rashifal/:rashi/:period. Every period now uses the shared daily-page mechanism
 * (src/lib/daily): today → RashifalDailyView; week (Mon–Sun) / month / year →
 * RashifalPeriodView, whose dates and text the Worker injects for the CURRENT period, so
 * they never show the build's week between deploys (Batch 8).
 */
export default function RashifalSign() {
  const { rashi: slug, period: periodParam } = useParams<{ rashi: string; period?: string }>();
  const rashi = slug ? rashiBySlug(slug) : undefined;
  const period = (periodParam ?? 'today') as RashifalPeriod;
  const periodValid = RASHIFAL_PERIODS.includes(period);

  // Unknown period on a valid rashi → canonicalise to the daily page.
  if (rashi && periodParam && !periodValid) {
    return <Navigate to={`/rashifal/${rashi.slug}/today`} replace />;
  }

  // Daily (today) page: shared daily-page mechanism — the Worker injects today's text.
  if (rashi && period === 'today') {
    return <RashifalDailyView rashi={rashi} />;
  }

  if (!rashi || !periodValid) {
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

  return <RashifalPeriodView rashi={rashi} period={period as 'week' | 'month' | 'year'} />;
}
