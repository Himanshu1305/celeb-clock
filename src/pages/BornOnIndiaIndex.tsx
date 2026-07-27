import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
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
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Indian Celebrities by Birth Date — Born On Any Day | BornClock"
        description={`Browse ${TOTAL_CELEBS.toLocaleString()}+ notable Indians by the day they were born. Pick any date to see the Indian actors, leaders, scientists and legends who share it.`}
        canonicalUrl="/born-on/india"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/born-on" className="hover:text-foreground">Born On</Link>
          <span>›</span>
          <span className="text-foreground">India 🇮🇳</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🇮🇳</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Indian Celebrities by Birth Date
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {TOTAL_CELEBS.toLocaleString()}+ notable Indians across {DATES.length} birth dates — actors,
          freedom fighters, scientists, cricketers and cultural icons. Pick a date to see who shares it.
        </p>

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
      </div>
      <Footer />
    </div>
  );
}
