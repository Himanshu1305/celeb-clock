/**
 * Batch 10 — Bhava Chalit (Sripati) on /kundali. Method + sources: lib/vedic/advanced/bhavaChalit.ts.
 */
import { lazy, Suspense } from 'react';
import { TermTip } from '@/components/vedic/TermTip';
import { formatDegreeInSign } from '@/lib/vedic/formatDegree';
import { SIGN_EN, ordinal } from '@/lib/vedic/advanced/angles';
import { chalitSummary, HOUSE_TOPIC } from '@/lib/vedic/advanced/advancedText';
import type { BhavaChalit } from '@/lib/vedic/advanced/bhavaChalit';
import { CollapsibleSection, ScrollHint } from './CollapsibleSection';

const KundaliChart = lazy(() => import('@/components/KundaliChart').then(m => ({ default: m.KundaliChart })));

const pos = (lon: number) => `${SIGN_EN[Math.floor(lon / 30) % 12]} ${formatDegreeInSign(lon)}`;

export function BhavaChalitSection({ chalit, chartStyle }: { chalit: BhavaChalit; chartStyle: 'north' | 'south' }) {
  const { headline, lines } = chalitSummary(chalit);
  const lagna1 = chalit.lagnaSignIndex + 1;
  const chartPlanets = chalit.planets.map(p => ({ name: p.name, house: p.bhava, signIndex: ((chalit.lagnaSignIndex + p.bhava - 1) % 12) + 1 }));
  return (
    <CollapsibleSection testid="kundali-chalit" eyebrow="Bhava Chalit"
      title={<><TermTip id="bhavaChalit">Bhava Chalit</TermTip> — the house each planet works through</>}
      answer={headline}>
      {lines.length > 0 && (
        <ul data-testid="chalit-shifts" className="text-sm" style={{ paddingLeft: 18, marginBottom: 12 }}>
          {lines.map((l, i) => <li key={i} style={{ marginBottom: 4 }}>{l}</li>)}
        </ul>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <figure style={{ margin: 0 }} data-testid="chalit-chart">
          <figcaption className="text-sm font-semibold text-center" style={{ marginBottom: 4 }}>Bhava Chalit chart</figcaption>
          <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
            <KundaliChart lagnaSignIndex={lagna1} planets={chartPlanets} style={chartStyle} label="Bhava Chalit chart" />
          </Suspense>
          <p className="text-xs text-muted-foreground" style={{ marginTop: 4 }}>Planets are drawn in their Chalit house; the sign numbers are those of your Rashi chart.</p>
        </figure>
        <div className="text-sm space-y-2">
          <p><strong>How it is worked out.</strong> We use the <strong>Sripati</strong> method: your Lagna is the middle (<TermTip id="bhavaMadhya">bhava madhya</TermTip>) of the 1st house and the Midheaven the middle of the 10th; each quarter in between is split into three equal parts. A house runs from one <TermTip id="bhavaSandhi">sandhi</TermTip> (junction, halfway between two middles) to the next.</p>
          <p>When a planet changes house here, astrologers read its results for the Chalit house — the sign it sits in does not change.</p>
          <p className="text-muted-foreground">Checked against the Swiss Ephemeris (Porphyry/Sripati houses, Lahiri): every house middle and junction within 1 arc-minute on our test charts (October 2026).</p>
        </div>
      </div>
      <ScrollHint />
      <div className="table-scroll" style={{ marginTop: 8 }}>
        <table data-testid="chalit-table" className="data-table" style={{ width: '100%', minWidth: 520 }}>
          <thead><tr><th>House</th><th>Starts (sandhi)</th><th>Middle (madhya)</th><th>Planets in it</th><th>Life area</th></tr></thead>
          <tbody>
            {chalit.bhavas.map(b => {
              const ps = chalit.planets.filter(p => p.bhava === b.house);
              return (
                <tr key={b.house}>
                  <td>{ordinal(b.house)}</td>
                  <td>{pos(b.start)}</td>
                  <td>{pos(b.madhya)}</td>
                  <td>{ps.length ? ps.map(p => `${p.name}${p.shifted ? ` (from ${ordinal(p.rashiHouse)})` : ''}`).join(', ') : '—'}</td>
                  <td>{HOUSE_TOPIC[b.house]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}
