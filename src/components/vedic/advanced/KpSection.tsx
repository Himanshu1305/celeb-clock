/**
 * Batch 10 — KP (Krishnamurti Paddhati) tables on /kundali. Method + sources: lib/vedic/advanced/kp.ts.
 */
import { TermTip } from '@/components/vedic/TermTip';
import { formatDegreeInSign } from '@/lib/vedic/formatDegree';
import { SIGN_EN, ordinal } from '@/lib/vedic/advanced/angles';
import { kpSummary, HOUSE_TOPIC } from '@/lib/vedic/advanced/advancedText';
import type { KpTables } from '@/lib/vedic/advanced/kp';
import { CollapsibleSection, ScrollHint } from './CollapsibleSection';

const pos = (lon: number) => `${SIGN_EN[Math.floor(lon / 30) % 12]} ${formatDegreeInSign(lon)}`;
const list = (xs: string[]) => (xs.length ? xs.join(', ') : '—');

export function KpSection({ kp, mahadasha }: { kp: KpTables; mahadasha?: string | null }) {
  const [first, ...rest] = kpSummary(kp, mahadasha);
  const sensitive = kp.cusps.filter(c => c.timeSensitive).map(c => c.house);
  const edge = [...kp.cusps.filter(c => c.nearBoundary).map(c => `${ordinal(c.house)} cusp`), ...kp.planets.filter(p => p.nearBoundary).map(p => p.name)];
  return (
    <CollapsibleSection testid="kundali-kp" eyebrow="KP astrology"
      title={<><TermTip id="kp">KP (Krishnamurti Paddhati)</TermTip> — cusps, sub lords and significators</>}
      answer={first}>
      {rest.map((l, i) => <p key={i} className="text-sm" data-testid="kp-dasha-line">{l}</p>)}
      <p className="text-sm text-muted-foreground" style={{ marginTop: 8 }}>
        Houses are <strong>Placidus</strong> cusps in the <strong>KP (Krishnamurti) ayanamsa</strong> — the original value as defined in the Swiss Ephemeris (about 6′ less than the Lahiri used elsewhere on this page), not the later “KP New” variant. Each row shows the <TermTip id="starLord">star lord</TermTip> and <TermTip id="subLord">sub lord</TermTip>; a KP house runs from its cusp to the next cusp. Checked against the Swiss Ephemeris: cusps within 1 arc-minute and identical sub lords on our test charts (October 2026).
      </p>
      {sensitive.length > 0 && (
        <p className="text-sm" data-testid="kp-time-note">
          Birth-time check: the sub lord of cusp{sensitive.length > 1 ? 's' : ''} {sensitive.join(', ')} would change if you were born 2 minutes earlier or later. KP astrologers first confirm (rectify) the birth time before relying on cusp sub lords.
        </p>
      )}
      {edge.length > 0 && (
        <p className="text-sm" data-testid="kp-edge-note">
          On a boundary: {edge.join(', ')} {edge.length > 1 ? 'sit' : 'sits'} within half an arc-minute of the line between two sub lords, so another program may show the neighbouring sub lord.
        </p>
      )}

      <h4 className="text-sm font-semibold" style={{ marginTop: 12 }}>House cusps</h4>
      <ScrollHint />
      <div className="table-scroll">
        <table data-testid="kp-cusp-table" className="data-table" style={{ width: '100%', minWidth: 520 }}>
          <thead><tr><th>Cusp</th><th>Position</th><th>Sign lord</th><th>Star lord</th><th>Sub lord</th></tr></thead>
          <tbody>
            {kp.cusps.map(c => (
              <tr key={c.house}><td>{ordinal(c.house)}</td><td>{pos(c.longitude)}</td><td>{c.sign}</td><td>{c.star}</td><td><strong>{c.sub}</strong>{c.timeSensitive ? ' *' : ''}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {sensitive.length > 0 && <p className="text-xs text-muted-foreground">* changes within ±2 minutes of birth time.</p>}

      <h4 className="text-sm font-semibold" style={{ marginTop: 12 }}>Planets</h4>
      <ScrollHint />
      <div className="table-scroll">
        <table data-testid="kp-planet-table" className="data-table" style={{ width: '100%', minWidth: 560 }}>
          <thead><tr><th>Planet</th><th>Position</th><th>KP house</th><th>Sign lord</th><th>Star lord</th><th>Sub lord</th></tr></thead>
          <tbody>
            {kp.planets.map(p => (
              <tr key={p.name}><td>{p.name}</td><td>{pos(p.longitude)}</td><td>{ordinal(p.house)}</td><td>{p.sign}</td><td>{p.star}</td><td>{p.sub}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-sm font-semibold" style={{ marginTop: 12 }}><TermTip id="kpSignificator">Significators</TermTip> of each house (strongest level first)</h4>
      <p className="text-xs text-muted-foreground">Level 1: planets in the star of the occupants · Level 2: occupants · Level 3: planets in the star of the house lord · Level 4: the house lord. Rahu and Ketu are listed only where they qualify by these four rules (the extra node-agent rule some KP astrologers add is not applied).</p>
      <ScrollHint />
      <div className="table-scroll">
        <table data-testid="kp-significator-table" className="data-table" style={{ width: '100%', minWidth: 640 }}>
          <thead><tr><th>House</th><th>Life area</th><th>Level 1</th><th>Level 2</th><th>Level 3</th><th>Level 4</th></tr></thead>
          <tbody>
            {kp.significators.map(s => (
              <tr key={s.house}><td>{ordinal(s.house)}</td><td>{HOUSE_TOPIC[s.house]}</td><td>{list(s.L1)}</td><td>{list(s.L2)}</td><td>{list(s.L3)}</td><td>{list(s.L4)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}
