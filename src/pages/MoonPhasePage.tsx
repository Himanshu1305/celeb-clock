/**
 * Batch 10 — Moon phase today + calculator for any date (/moon-phase, ?date=YYYY-MM-DD).
 * Phase name, illuminated %, the Moon's age, the Tithi, and the exact next full Moon
 * (Purnima) and new Moon (Amavasya) in IST. Today's entry comes from the shared daily
 * mechanism (data kind 'moon-day'); another date is computed in the browser with the same
 * engine (src/lib/vedic/sky.ts, checked against Swiss Ephemeris) and the same template.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { addDaysISO, istDateISO } from '@/lib/daily/dates';
import type { DailyEntry } from '@/lib/daily/types';
import { MOON_PHASE_STATIC } from '@/lib/daily/kinds/skyTemplate';
import { isValidDateKey } from '@/lib/vedic/panchangDay';
import { isPrerender } from '@/components/panchang/PanchangControls';

export default function MoonPhasePage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const today = istDateISO(new Date());
  const dParam = sp.get('date');
  const date = isValidDateKey(dParam) ? dParam : today;
  const isToday = date === today;
  const daily = useDailyEntry('moon-phase', isToday ? 'index' : null);
  const [local, setLocal] = useState<DailyEntry | null>(null);
  useEffect(() => {
    if (isToday) return;
    let alive = true;
    setLocal(null);
    Promise.all([import('@/lib/daily/kinds/skyDaily'), import('@/lib/daily/kinds/skyTemplate')]).then(([eng, tpl]) => {
      if (alive) setLocal(tpl.renderMoonPhase(date, eng.computeMoonDayData(date), { today: false }));
    });
    return () => { alive = false; };
  }, [date, isToday]);
  const entry = isToday ? daily.entry : local;
  const setDate = (d: string | null) => navigate(`/moon-phase${d && d !== today ? `?date=${d}` : ''}`, { replace: true });
  const pre = isToday && isPrerender();
  const month = date.slice(0, 7);

  return (
    <ToolLayout
      theme="vedic"
      testId="moon-phase-page"
      seo={<SEO title={MOON_PHASE_STATIC.title} description={MOON_PHASE_STATIC.description} canonicalUrl="/moon-phase" ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Panchang', to: '/panchang' }], current: 'Moon phase' }}
      footer={{ tagline: 'The Moon’s phase from its real position.', nav: [{ label: 'Panchang calendar', to: '/panchang-calendar' }, { label: 'Eclipses', to: '/eclipses' }, { label: 'Planets today', to: '/planets-today' }, { label: 'Festivals', to: '/festivals' }, { label: 'Glossary', to: '/glossary' }] }}
      eyebrow="Moon phase"
      h1={<DailyH1 entry={entry} fallback={MOON_PHASE_STATIC.h1} />}
      lead={<DailyDate entry={entry} />}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-xl border border-border bg-background/60 p-4 mb-6 flex flex-wrap items-center gap-2" data-testid="moon-date-controls">
            <span className="text-sm text-muted-foreground w-full">Moon phase on any date (12:00 noon IST):</span>
            <button type="button" onClick={() => setDate(addDaysISO(date, -1))} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-primary/5" aria-label="Previous day">← Previous day</button>
            <input type="date" aria-label="Choose a date" data-testid="moon-date-input" value={pre ? '' : date} min="1900-01-01" max="2100-12-31"
                   onChange={e => { if (isValidDateKey(e.target.value)) setDate(e.target.value); }}
                   className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm" />
            <button type="button" onClick={() => setDate(addDaysISO(date, 1))} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-primary/5" aria-label="Next day">Next day →</button>
            {!isToday && <button type="button" onClick={() => setDate(null)} className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm hover:bg-primary/5">Back to today</button>}
          </div>

          <DailyBody entry={entry} testId="moon-phase-body" />
          <DailyJsonLd entry={entry} path="/moon-phase" />

          <div className="rounded-xl border border-border p-4 mb-6 text-sm" data-testid="moon-links">
            <h2 className="font-semibold text-foreground mb-2">Purnima and Amavasya dates</h2>
            <p className="text-muted-foreground mb-2">The <TermTip id="purnima">Purnima</TermTip> and <TermTip id="amavasya">Amavasya</TermTip> days you keep for vrats are set by the <TermTip id="tithi">Tithi</TermTip> at sunrise, so see them in the Panchang:</p>
            <ul className="space-y-1">
              <li><Link to={`/panchang-calendar${month !== today.slice(0, 7) ? `?month=${month}` : ''}`} className="text-primary hover:underline">Panchang calendar for this month — every Purnima, Amavasya and Ekadashi →</Link></li>
              <li><Link to="/festivals" className="text-primary hover:underline">Festival calendar for the year →</Link></li>
              <li><Link to="/eclipses" className="text-primary hover:underline">Solar and lunar eclipses 2026–2030 →</Link></li>
            </ul>
          </div>

          <div className="rounded-xl border border-border p-4 mb-8 text-sm text-muted-foreground space-y-2" data-testid="moon-how">
            <h2 className="font-semibold text-foreground">How this is worked out</h2>
            <p>The <TermTip id="moonPhase">phase</TermTip> comes from the real angle between the Moon and the Sun as seen from Earth: 0° is the new Moon, 180° the full Moon. The lit share of the disc and the Moon’s age follow from it, and every 12° of that angle is one Tithi (<TermTip id="paksha">Shukla or Krishna Paksha</TermTip>). On the day of a new Moon, first quarter, full Moon or last quarter (IST), the day takes that name.</p>
            <p>In our tests every new and full Moon of 2026–2027 agrees with Swiss Ephemeris to within about a minute, and the lit share to within 0.01% on five dates. <Link to="/accuracy" className="underline">How we check accuracy →</Link></p>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
