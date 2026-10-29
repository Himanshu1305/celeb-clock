/**
 * Batch 10 — Ashtakavarga on /kundali: answer first (your best-supported and lighter houses),
 * then a compact planet × house table (Bhinnashtakavarga rows + the Sarvashtakavarga total),
 * then plain guidance. Engine: src/lib/vedic/engine/ashtakavarga.ts (BPHS ch. 66).
 */
import { TermTip } from '@/components/vedic/TermTip';
import { CollapsibleSection } from '@/components/vedic/CollapsibleSection';
import { AV_PLANETS, byHouse } from '@/lib/vedic/engine/ashtakavarga';
import { HOUSE_THEMES, SAV_STRONG, SAV_WEAK, savBand, SAV_BAND_LABEL } from '@/data/yoginiAshtakavarga';

export interface AshtakavargaData {
  bav: Record<string, number[]>;
  sav: number[];
  lagnaSignIndex: number;
}

const SIGN_SHORT = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

/** Houses ranked by SAV (ties keep house order) — exported for tests. */
export function rankHouses(sav: number[], lagnaSignIndex: number) {
  const list = HOUSES.map(h => ({ house: h, points: byHouse(sav, lagnaSignIndex, h) }));
  const top = [...list].sort((a, b) => b.points - a.points || a.house - b.house).slice(0, 3);
  const low = [...list].sort((a, b) => a.points - b.points || a.house - b.house).slice(0, 3);
  return { list, top, low };
}

export function AshtakavargaSection({ data }: { data: AshtakavargaData }) {
  const { list, top, low } = rankHouses(data.sav, data.lagnaSignIndex);
  const strongCount = list.filter(x => x.points >= SAV_STRONG).length;
  const describe = (xs: typeof top) => xs.map(x => `${ord(x.house)} (${HOUSE_THEMES[x.house - 1]}, ${x.points})`).join(', ');
  const cellStyle = { padding: '4px 6px', textAlign: 'center' as const, whiteSpace: 'nowrap' as const };

  return (
    <CollapsibleSection testid="kundali-ashtakavarga" title="Ashtakavarga — where your chart has the most support"
      summary={<>Strongest houses: {top.map(x => `${ord(x.house)} (${x.points})`).join(', ')} · {strongCount} of 12 houses score {SAV_STRONG}+.</>}>
      <div data-testid="av-answer" className="result-annotation" style={{ marginBottom: 12 }}>
        <p style={{ margin: 0 }}>
          <strong>What it means for you:</strong> your best-supported life areas are the {describe(top)} — effort there
          tends to pay off more easily. The {describe(low)} have fewer points: nothing is wrong there, they simply
          reward steadier, more patient effort.
        </p>
      </div>
      <p className="text-sm text-muted-foreground" style={{ marginBottom: 8 }}>
        <TermTip id="ashtakavarga">Ashtakavarga</TermTip> gives each sign <TermTip id="bindu">points</TermTip> from the seven planets
        and your <TermTip id="lagna">Lagna</TermTip>, using the tables in Brihat Parashara Hora Shastra (ch. 66). Each row below is one
        planet’s own table (<TermTip id="bhinnashtakavarga">Bhinnashtakavarga</TermTip>, 0–8 per house); the last row is the total
        (<TermTip id="sarvashtakavarga">Sarvashtakavarga</TermTip>). Houses are counted from your Lagna; the small letters are the signs.
      </p>
      <p className="text-xs text-muted-foreground" style={{ margin: '0 0 4px' }} data-testid="av-scroll-hint">Swipe sideways to see all 12 houses →</p>
      <div className="table-scroll" data-testid="av-table-wrap">
        <table data-testid="av-table" className="data-table" style={{ fontSize: 12.5, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...cellStyle, textAlign: 'left' }}>House</th>
              {HOUSES.map(h => (
                <th key={h} style={cellStyle}>{h}<br /><span className="text-muted-foreground" style={{ fontWeight: 400, fontSize: 11 }}>{SIGN_SHORT[(data.lagnaSignIndex + h - 1) % 12]}</span></th>
              ))}
              <th style={cellStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {AV_PLANETS.map(p => {
              const row = data.bav[p] ?? [];
              return (
                <tr key={p} data-testid={`av-row-${p}`}>
                  <td style={{ ...cellStyle, textAlign: 'left', fontWeight: 600 }}>{p}</td>
                  {HOUSES.map(h => {
                    const v = byHouse(row, data.lagnaSignIndex, h);
                    return <td key={h} style={{ ...cellStyle, fontWeight: v >= 4 ? 700 : 400, color: v >= 4 ? 'var(--ink)' : 'var(--muted, #667)' }}>{v}</td>;
                  })}
                  <td style={{ ...cellStyle, fontWeight: 600 }}>{row.reduce((s, x) => s + x, 0)}</td>
                </tr>
              );
            })}
            <tr data-testid="av-row-SAV" style={{ borderTop: '2px solid var(--line, #e4dcc8)' }}>
              <td style={{ ...cellStyle, textAlign: 'left', fontWeight: 700 }}>All (SAV)</td>
              {HOUSES.map(h => {
                const v = byHouse(data.sav, data.lagnaSignIndex, h);
                const band = savBand(v);
                return (
                  <td key={h} title={SAV_BAND_LABEL[band]} style={{ ...cellStyle, fontWeight: 700,
                    background: band === 'strong' ? 'rgba(21,128,61,0.12)' : band === 'lighter' ? 'rgba(217,119,6,0.12)' : 'transparent' }}>{v}</td>
                );
              })}
              <td style={{ ...cellStyle, fontWeight: 700 }}>{data.sav.reduce((s, x) => s + x, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="text-sm" style={{ marginTop: 10, paddingLeft: 18 }} data-testid="av-guidance">
        <li><strong>Green totals ({SAV_STRONG}+ points)</strong> mark well-supported houses; amber (below {SAV_WEAK}) houses ask for steadier effort. The average is about 28, because the twelve totals always add up to 337.</li>
        <li><strong>Transits:</strong> when a slow planet such as Saturn or Jupiter moves through a sign with a high total — or a sign where that planet’s own row shows 4 or more (bold) — that stretch tends to go smoother. Low-point signs are times to plan ahead and pace yourself.</li>
        <li>Every planet’s row always adds up to the same fixed total (Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39), so compare houses within your chart, not with someone else’s.</li>
      </ul>
      <p className="text-xs text-muted-foreground" style={{ marginTop: 6 }}>
        Tables: Brihat Parashara Hora Shastra ch. 66. Some software (e.g. Jagannatha Hora by default) uses Varahamihira’s slightly
        different readings for a few of the Moon’s and Venus’s points, so those two rows can differ by a point in a few houses;
        the totals stay the same. Guidance thresholds: standard Ashtakavarga references (28+ strong, below 25 lighter).
      </p>
    </CollapsibleSection>
  );
}

export default AshtakavargaSection;
