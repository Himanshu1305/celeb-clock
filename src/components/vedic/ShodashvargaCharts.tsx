/**
 * Batch 7 W3 — "Divisional charts (Shodashvarga)" on /kundali.
 *
 * A selector for all sixteen Parashari vargas (D1 … D60), each drawn with the same chart
 * component and North/South style as the main chart, with a one-line plain meaning, its
 * classical source (BPHS chapter/verse) and an honest birth-time note:
 *  - D27 and above always carry a gentle "needs an exact birth time" note;
 *  - every chart reports whether any point's sign in it changes within ±5 minutes of the
 *    given time (computed server-side by the engine — see engine/shodashvarga.ts);
 *  - if the birth time is unknown, every chart above D1 says it cannot be relied on.
 */
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { TermTip } from '@/components/vedic/TermTip';
import { SHODASHVARGA_META, VARGA_TERM, D60_NOTE } from '@/data/shodashvarga';

const KundaliChart = lazy(() => import('@/components/KundaliChart').then(m => ({ default: m.KundaliChart })));

export interface ShodashvargaChartData {
  key: string;
  division: number;
  lagnaSignIndex: number;
  planets: Array<{ name: string; signIndex: number; house: number }>;
  timeSensitive: string[];
}

const listJoin = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

/** Plain sentence for the ±5-minute check (exported for tests). */
export function sensitivityNote(timeSensitive: string[]): string {
  if (timeSensitive.length === 0) {
    return 'Birth-time check: this chart stays the same even if your birth time is off by up to 5 minutes either way.';
  }
  const planets = timeSensitive.filter(p => p !== 'Lagna');
  const name = (p: string) => (p === 'Sun' || p === 'Moon' ? `the ${p}` : p);
  const parts: string[] = [];
  if (timeSensitive.includes('Lagna')) parts.push('the Lagna (and so every house in this chart)');
  parts.push(...planets.map(name));
  return `Birth-time check: if you were born 5 minutes earlier or later, ${listJoin(parts)} would fall in a different sign in this chart. Read it with care unless your birth time is exact (for example, from a hospital record).`;
}

export function ShodashvargaCharts({ charts, chartStyle, birthTimeKnown = true }: {
  charts: ShodashvargaChartData[];
  chartStyle: 'north' | 'south';
  birthTimeKnown?: boolean;
}) {
  const [selected, setSelected] = useState('D9');
  const byKey = Object.fromEntries(charts.map(c => [c.key, c]));
  const available = SHODASHVARGA_META.filter(m => byKey[m.key]);
  if (available.length === 0) return null;
  const meta = available.find(m => m.key === selected) ?? available[0];
  const chart = byKey[meta.key];
  const title = `${meta.key} ${meta.name}`;

  return (
    <div data-testid="kundali-shodashvarga" style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 4 }}>Divisional charts (<TermTip id="shodashvarga">Shodashvarga</TermTip>)</h3>
      <p className="text-sm text-muted-foreground" style={{ marginBottom: 8 }}>
        <TermTip id="varga">Divisional charts</TermTip> zoom into one area of life — the sixteen that Parashara describes in
        Brihat Parashara Hora Shastra. Pick one to see it. The first house is each chart’s own <TermTip id="lagna">Lagna</TermTip>,
        and each is read together with your main (D1) chart, never alone.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3 text-sm" role="group" aria-label="Choose a divisional chart">
        {available.map(m => (
          <button key={m.key} type="button" data-testid={`varga-btn-${m.key}`}
            onClick={() => setSelected(m.key)} aria-pressed={m.key === meta.key}
            className={`rounded-lg border border-border px-2.5 py-1 font-medium ${m.key === meta.key ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}>
            {m.key}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <figure data-testid={`kundali-varga-${meta.key}`} style={{ margin: 0 }}>
          <figcaption className="text-sm font-semibold text-center" style={{ marginBottom: 4 }}>{title}</figcaption>
          <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
            <KundaliChart lagnaSignIndex={chart.lagnaSignIndex} planets={chart.planets} style={chartStyle} label={`${title} chart`} />
          </Suspense>
        </figure>
        <div className="text-sm">
          <p className="font-semibold text-foreground" data-testid="varga-name">
            <TermTip id={VARGA_TERM[meta.key]}>{title}</TermTip>
          </p>
          <p className="text-foreground" style={{ marginTop: 4 }} data-testid="varga-meaning">{meta.meaning}</p>
          <p className="text-xs text-muted-foreground" style={{ marginTop: 6 }} data-testid="varga-source">
            Classical source: {meta.source} — Brihat Parashara Hora Shastra (ch. 6 shows how it is built, ch. 7 what it is read for).
            {meta.slug && <> <Link to={`/divisional-charts/${meta.slug}`} className="underline">How to read the {meta.name} →</Link></>}
          </p>
          {meta.needsExactTime && (
            <p className="text-xs text-muted-foreground" style={{ marginTop: 6 }} data-testid="varga-exact-time">
              Charts from D27 upward divide each sign into very small parts, so they need an exact birth time —
              {meta.key === 'D60' ? ' on average the D60 Lagna moves into a new part about every two minutes of birth time.' : ' a few minutes’ difference can change them.'}
            </p>
          )}
          {meta.key !== 'D1' && !birthTimeKnown ? (
            <p className="text-xs rounded-lg border border-amber-500/60 bg-amber-50 text-amber-900 p-2" style={{ marginTop: 6 }} data-testid="varga-time-unknown">
              Your birth time is not known, so this chart cannot be relied on — it was drawn for the time used above only.
            </p>
          ) : (
            <p className={`text-xs ${chart.timeSensitive.length ? 'rounded-lg border border-amber-500/60 bg-amber-50 text-amber-900 p-2' : 'text-muted-foreground'}`}
              style={{ marginTop: 6 }} data-testid="varga-sensitivity">
              {sensitivityNote(chart.timeSensitive)}
            </p>
          )}
          {meta.key === 'D60' && (
            <p className="text-xs text-muted-foreground italic" style={{ marginTop: 6 }} data-testid="varga-d60-note">{D60_NOTE}</p>
          )}
        </div>
      </div>
    </div>
  );
}
