/**
 * Period-structured predictions (Growth P2, GP2-PERIOD-PREDICT): yearly /
 * quarterly / monthly views of the running Dasha, graded strong/moderate/mild
 * and reasoned (Rule 7). Date-dependent: computed in the browser against `now`.
 */
import { useMemo, useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { buildPeriodForecast, type ForecastPeriod, type MahaPeriod, type NodePlacements } from '@/lib/vedic/periodForecast';

type Tab = 'yearly' | 'quarterly' | 'monthly';
const gradeColor = (g: string) => g === 'strong' ? 'text-emerald-700' : g === 'moderate' ? 'text-[#6E5AA6]' : 'text-amber-600';

function PeriodCard({ p }: { p: ForecastPeriod }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-foreground text-sm">{p.label}</div>
        <div className={`text-[10px] uppercase font-bold ${gradeColor(p.grade)}`}>{p.grade}</div>
      </div>
      <p className="text-sm text-foreground mt-1">{p.lead}</p>
      <p className="text-xs text-muted-foreground mt-1">{p.reason}</p>
    </div>
  );
}

export function PeriodForecast({ dashaTimeline, lagnaSignIndex, planets }: {
  dashaTimeline: MahaPeriod[];
  lagnaSignIndex: number;
  /** Chart planets as KundaliData carries them (signIndex 1-based) — used for Rahu/Ketu, which act through their placement. */
  planets?: Array<{ name: string; signIndex: number; house: number }>;
}) {
  const [tab, setTab] = useState<Tab>('yearly');
  // lagnaSignIndex (and planet signIndex) arrive 1-based from the API; the engine wants 0-based.
  const forecast = useMemo(() => {
    const nodes: NodePlacements = {};
    for (const p of planets ?? []) {
      if (p.name === 'Rahu' || p.name === 'Ketu') nodes[p.name] = { signIndex: p.signIndex - 1, house: p.house };
    }
    return buildPeriodForecast(dashaTimeline, lagnaSignIndex - 1, Date.now(), nodes);
  }, [dashaTimeline, lagnaSignIndex, planets]);
  const periods = forecast[tab];

  return (
    <div data-testid="period-forecast" className="rounded-xl border border-[#6E5AA6]/30 p-4 mt-6">
      <div className="font-semibold text-foreground mb-1">Your predictions, period by period</div>
      <p className="text-xs text-muted-foreground mb-3">{forecast.note}</p>
      <div className="inline-flex rounded-lg border border-border overflow-hidden mb-3 text-sm" role="group" aria-label="Forecast period">
        {(['yearly', 'quarterly', 'monthly'] as Tab[]).map(t => (
          <button key={t} data-testid={`period-tab-${t}`} type="button" onClick={() => setTab(t)}
            className={`px-4 py-1.5 font-medium capitalize ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
            aria-pressed={tab === t}>{t}</button>
        ))}
      </div>
      <div className="space-y-2" data-testid={`period-list-${tab}`}>
        {periods.map((p, i) => <PeriodCard key={i} p={p} />)}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        For the transit side of timing — Saturn, Jupiter and Rahu–Ketu by year, and Sade Sati — see the{' '}
        <Link to="/transit/" className="text-primary hover:underline">transit pages</Link> and{' '}
        <Link to="/sade-sati/" className="text-primary hover:underline">Sade Sati</Link>.
      </p>
    </div>
  );
}
