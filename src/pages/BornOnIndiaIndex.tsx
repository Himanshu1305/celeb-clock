import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import bornOnDates from '@/data/indiaBornOnDates.json';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface IndiaDate { slug: string; mmdd: string; month: number; day: number; count: number; top3: string[]; }

const DATES = bornOnDates as IndiaDate[];
const TOTAL_CELEBS = DATES.reduce((s, d) => s + d.count, 0);

// Group qualifying dates by month, preserving day order.
const byMonth: Record<number, IndiaDate[]> = {};
for (const d of DATES) (byMonth[d.month] ??= []).push(d);
for (const m of Object.keys(byMonth)) byMonth[+m].sort((a, b) => a.day - b.day);

export default function BornOnIndiaIndex() {
  return (
    <ToolLayout
      theme="birthday"
      testId="born-on-india-index-page"
      seo={(
        <SEO
          title="Indian Celebrities by Birth Date — Born On Any Day | BornClock"
          description={`Browse ${TOTAL_CELEBS.toLocaleString()}+ notable Indians by the day they were born. Pick any date to see the Indian actors, leaders, scientists and legends who share it.`}
          canonicalUrl="/born-on/india"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Born On', to: '/born-on' }], current: 'India 🇮🇳' }}
      footer={{
        tagline: 'Notable Indians by the day they were born.',
        nav: [
          { label: 'Born On', to: '/born-on' },
          { label: 'Born In (months)', to: '/born-in' },
          { label: 'Celebrities', to: '/celebrity' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Born-on dates.',
      }}
      eyebrow="Born in India"
      h1={<span className="inline-flex items-center gap-3"><span className="text-3xl">🇮🇳</span>Indian Celebrities by Birth Date</span>}
      lead={<>{TOTAL_CELEBS.toLocaleString()}+ notable Indians across {DATES.length} birth dates — actors,
        freedom fighters, scientists, cricketers and cultural icons. Pick a date to see who shares it.</>}
    >
      <section className="section">
        <div className="space-y-8">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
            const dates = byMonth[m];
            if (!dates || dates.length === 0) return null;
            return (
              <section key={m}>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {MONTH_NAMES[m]}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({dates.length} date{dates.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dates.map(d => (
                    <Link
                      key={d.slug}
                      to={`/born-on/${d.slug}/india`}
                      title={d.top3.filter(Boolean).join(', ')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-background/70 border border-border hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      {MONTH_NAMES[m]} {d.day}
                      <span className="text-xs text-muted-foreground">{d.count}</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </ToolLayout>
  );
}
