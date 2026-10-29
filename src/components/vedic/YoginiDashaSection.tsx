/**
 * Batch 10 — Yogini Dasha on /kundali: answer first ("you are now in …"), then every
 * Mahadasha with its 8 Antardashas (expand one at a time), current period highlighted,
 * and a plain meaning for each Yogini. Engine: src/lib/vedic/engine/yoginiDasha.ts.
 */
import { useMemo, useState } from 'react';
import { TermTip } from '@/components/vedic/TermTip';
import { CollapsibleSection } from '@/components/vedic/CollapsibleSection';
import { yoginiAntardashas, currentYoginiPeriod, type YoginiPeriod } from '@/lib/vedic/engine/yoginiDasha';
import { YOGINI_META } from '@/data/yoginiAshtakavarga';

export interface YoginiDashaData {
  nakshatraNumber: number;
  startYogini: string;
  balanceYears: number;
  yearDays: number;
  mahadashas: YoginiPeriod[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
/** "3 years 2 months" style balance (365.25-day years, 12 equal months). */
export function balanceText(years: number): string {
  const totalMonths = Math.round(years * 12);
  const y = Math.floor(totalMonths / 12), m = totalMonths % 12;
  const parts = [];
  if (y) parts.push(`${y} year${y === 1 ? '' : 's'}`);
  if (m || !y) parts.push(`${m} month${m === 1 ? '' : 's'}`);
  return parts.join(' ');
}
const label = (y: { yogini: string; lord: string }) => `${y.yogini} (${y.lord})`;

export function YoginiDashaSection({ data, now }: { data: YoginiDashaData; now?: Date }) {
  const at = useMemo(() => now ?? new Date(), [now]);
  const cur = useMemo(() => currentYoginiPeriod(data, at), [data, at]);
  // The first Mahadasha is the one running at birth; show about 100 years from there.
  const firstMs = Date.parse(data.mahadashas[0]?.start ?? '');
  const rows = data.mahadashas.filter(m => Date.parse(m.start) < firstMs + 100 * 365.25 * 86400000);
  const [openIdx, setOpenIdx] = useState<number | null>(() => {
    const i = rows.findIndex(m => cur && m.start === cur.maha.start);
    return i >= 0 ? i : null;
  });
  const meta = cur ? YOGINI_META[cur.maha.yogini] : null;
  const subMeta = cur?.antar ? YOGINI_META[cur.antar.yogini] : null;

  const summary = cur
    ? <>Now: <strong>{label(cur.maha)}</strong>{cur.antar && <> / <strong>{label(cur.antar)}</strong></>}, until {fmtDate((cur.antar ?? cur.maha).end)}.</>
    : <>Your Yogini periods across life, from your birth star.</>;

  return (
    <CollapsibleSection testid="kundali-yogini" title="Yogini Dasha — your second timing system" summary={summary}>
      {cur && meta && (
        <div data-testid="yogini-now" className="result-annotation" style={{ marginBottom: 12 }}>
          <p style={{ margin: 0 }}>
            <strong>What it means for you now:</strong> you are in the <strong>{meta.name}</strong> Yogini
            (ruled by {meta.lord}, {meta.years} year{meta.years === 1 ? '' : 's'}) — {meta.meaning.charAt(0).toLowerCase() + meta.meaning.slice(1)}
            {' '}{meta.guidance}
          </p>
          {cur.antar && subMeta && (
            <p style={{ margin: '6px 0 0' }}>
              {cur.antar.yogini === cur.maha.yogini
                ? <>The current sub-period ({fmtDate(cur.antar.start)} – {fmtDate(cur.antar.end)}) is {subMeta.name}’s own, so these themes are at their clearest.</>
                : <>Within it, the <strong>{subMeta.name}</strong> sub-period ({fmtDate(cur.antar.start)} – {fmtDate(cur.antar.end)}) adds a flavour of {subMeta.meaning.charAt(0).toLowerCase() + subMeta.meaning.slice(1).replace(/\.$/, '')}.</>}
            </p>
          )}
        </div>
      )}
      <p className="text-sm text-muted-foreground" style={{ marginBottom: 8 }}>
        <TermTip id="yoginiDasha">Yogini Dasha</TermTip> is a 36-year cycle of eight Yoginis. Yours began with{' '}
        <strong>{data.startYogini}</strong> because your Moon was in nakshatra no. {data.nakshatraNumber} ({data.nakshatraNumber} + 3, divided by 8);
        {' '}{balanceText(data.balanceYears)} of it was still to run at birth. Read it alongside your Vimshottari{' '}
        <TermTip id="dasha">Dasha</TermTip> above — a theme both systems agree on is the one to trust most.
        Dates use 365.25-day years, the same as our Vimshottari dates. Each <TermTip id="mahadasha">main period</TermTip> splits
        into 8 <TermTip id="antardasha">sub-periods</TermTip>, starting with its own Yogini.
      </p>
      <div className="table-scroll" data-testid="yogini-table-wrap">
        <p className="text-xs text-muted-foreground" style={{ margin: '0 0 4px' }}>Tap a period to see its sub-periods.</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {rows.map((m, i) => {
            const isCur = !!cur && cur.maha.start === m.start;
            const open = openIdx === i;
            const ym = YOGINI_META[m.yogini];
            return (
              <li key={m.start} data-testid={isCur ? 'yogini-current' : undefined}>
                <button type="button" onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open}
                  data-testid={`yogini-row-${i}`}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline', width: '100%', textAlign: 'left',
                    padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    borderLeft: isCur ? '3px solid var(--accent)' : '3px solid transparent',
                    background: isCur ? 'var(--paper-2, rgba(0,0,0,0.03))' : 'transparent', color: 'var(--ink)' }}>
                  <span aria-hidden="true" style={{ width: 12 }}>{open ? '▾' : '▸'}</span>
                  <span style={{ fontWeight: 600 }}>{label(m)}</span>
                  <span className="text-xs text-muted-foreground">{fmtDate(m.start)} – {fmtDate(m.end)} · {m.years} yr{m.years === 1 ? '' : 's'}</span>
                  {ym && <span className="text-xs" style={{ color: ym.tone === 'gentle' ? '#15803D' : 'var(--accent-text)' }}>{ym.tone === 'gentle' ? 'gentler' : 'asks for care'}</span>}
                  {isCur && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-text)' }}>• now</span>}
                </button>
                {open && (
                  <div style={{ margin: '2px 0 8px 28px' }}>
                    {ym && <p className="text-xs text-muted-foreground" style={{ margin: '0 0 4px' }}>{ym.meaning} {ym.guidance}</p>}
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {yoginiAntardashas(m).map(a => {
                        const aCur = !!cur?.antar && cur.antar.start === a.start;
                        return (
                          <li key={a.start} data-testid={aCur ? 'yogini-antar-current' : undefined} className="text-xs"
                            style={{ padding: '2px 6px', borderRadius: 6, fontWeight: aCur ? 700 : 400, background: aCur ? 'var(--paper-2, rgba(0,0,0,0.04))' : 'transparent' }}>
                            {m.yogini}/{a.yogini} ({a.lord}) · {fmtDate(a.start)} – {fmtDate(a.end)}{aCur ? ' • now' : ''}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground" style={{ marginTop: 8 }}>
        Rule and meanings: the classical Yogini Dasha as described in Brihat Parashara Hora Shastra’s Dasha chapters and
        standard references (vedicmarga.com, satyori.com). Gentler Yoginis: Mangala, Dhanya, Bhadrika, Siddha; the others ask
        for more care — never for worry. Like every Dasha, the start date depends on your exact birth time.
      </p>
    </CollapsibleSection>
  );
}

export default YoginiDashaSection;
