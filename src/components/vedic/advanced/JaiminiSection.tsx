/**
 * Batch 10 — Jaimini: Chara Karakas, Karakamsha and Chara Dasha (K.N. Rao) on /kundali.
 * Method + sources: lib/vedic/advanced/jaimini.ts.
 */
import { TermTip } from '@/components/vedic/TermTip';
import { formatDegreeInSign } from '@/lib/vedic/formatDegree';
import { signName, ordinal } from '@/lib/vedic/advanced/angles';
import { jaiminiHeadline, karakamshaLine, currentCharaPeriod, charaHouseFromLagna, KARAKA_META, HOUSE_TOPIC, planetLabel } from '@/lib/vedic/advanced/advancedText';
import type { JaiminiResult } from '@/lib/vedic/advanced/jaimini';
import { CollapsibleSection, ScrollHint } from './CollapsibleSection';

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function JaiminiSection({ jaimini, lagnaSignIndex, now = new Date() }: { jaimini: JaiminiResult; lagnaSignIndex: number; now?: Date }) {
  const cur = currentCharaPeriod(jaimini, now);
  const sensitive = jaimini.timeSensitive.map(c => KARAKA_META[c].name);
  const zero = jaimini.charaDasha.filter(p => p.years === 0);
  const total = jaimini.charaDasha.reduce((a, p) => a + p.years, 0);
  return (
    <CollapsibleSection testid="kundali-jaimini" eyebrow="Jaimini astrology"
      title={<><TermTip id="charaKaraka">Chara karakas</TermTip>, <TermTip id="karakamsha">Karakamsha</TermTip> and <TermTip id="charaDasha">Chara Dasha</TermTip></>}
      answer={jaiminiHeadline(jaimini)}>
      <h4 className="text-sm font-semibold">Your seven Chara karakas</h4>
      <p className="text-xs text-muted-foreground">Ranked by how far each planet has moved inside its sign (seven-karaka scheme, Sun to Saturn — Rahu is not included, as taught by K.N. Rao). The highest is your <TermTip id="atmakaraka">Atmakaraka</TermTip>. Planet positions match the Swiss Ephemeris on our test charts (October 2026).</p>
      <ScrollHint />
      <div className="table-scroll">
        <table data-testid="jaimini-karaka-table" className="data-table" style={{ width: '100%', minWidth: 480 }}>
          <thead><tr><th>Karaka</th><th>Planet</th><th>Degree in sign</th><th>Stands for</th></tr></thead>
          <tbody>
            {jaimini.karakas.map(k => (
              <tr key={k.code}><td>{KARAKA_META[k.code].name} ({k.code})</td><td>{k.planet}</td><td>{formatDegreeInSign(k.degreeInSign)}</td><td>{KARAKA_META[k.code].role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {sensitive.length > 0 && (
        <p className="text-sm" data-testid="jaimini-time-note">Birth-time check: two planets are very close in degree, so {sensitive.join(' and ')} would swap if you were born 5 minutes earlier or later.</p>
      )}

      <p className="text-sm" data-testid="jaimini-karakamsha" style={{ marginTop: 12 }}>{karakamshaLine(jaimini)}</p>

      <h4 className="text-sm font-semibold" style={{ marginTop: 12 }}>Chara Dasha (K.N. Rao’s method)</h4>
      {cur && (
        <p className="text-sm" data-testid="chara-current">
          <strong>Now: {signName(cur.signIndex)} period</strong>, {monthYear(cur.start)} – {monthYear(cur.end)}. {signName(cur.signIndex).split(' ')[0]} is your {ordinal(charaHouseFromLagna(cur.signIndex, lagnaSignIndex))} house, so this period tends to bring {HOUSE_TOPIC[charaHouseFromLagna(cur.signIndex, lagnaSignIndex)]} into focus. Read it alongside your Vimshottari Dasha above — a theme both timelines point to is the one to plan around.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        How it works: the first period is your Lagna sign; because the 9th sign from your Lagna is {jaimini.charaForward ? 'odd-footed, the signs run forwards' : 'even-footed, the signs run backwards'}. A sign’s length is counted from the sign to its lord, minus one (12 years if the lord is in its own sign; one year more if the lord is exalted, one less if debilitated). Years are sidereal years. Checked against PyJHora’s documented K.N. Rao example (October 2026).
      </p>
      <ScrollHint />
      <div className="table-scroll">
        <table data-testid="chara-dasha-table" className="data-table" style={{ width: '100%', minWidth: 520 }}>
          <thead><tr><th>Sign</th><th>House</th><th>Years</th><th>From</th><th>To</th><th>Counted to</th></tr></thead>
          <tbody>
            {jaimini.charaDasha.map(p => (
              <tr key={p.signIndex} aria-current={cur?.signIndex === p.signIndex ? 'true' : undefined}
                style={cur?.signIndex === p.signIndex ? { fontWeight: 600 } : undefined}>
                <td>{signName(p.signIndex)}{cur?.signIndex === p.signIndex ? ' — now' : ''}</td>
                <td>{ordinal(charaHouseFromLagna(p.signIndex, lagnaSignIndex))}</td>
                <td>{p.years}</td>
                <td>{p.years ? monthYear(p.start) : '—'}</td>
                <td>{p.years ? monthYear(p.end) : '—'}</td>
                <td>{planetLabel(p.lord, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        One full cycle of the 12 signs ({total} years) is shown.{zero.length > 0 ? ` ${zero.map(p => signName(p.signIndex)).join(', ')} ${zero.length > 1 ? 'get' : 'gets'} 0 years under these rules (the lord is debilitated one sign away), so ${zero.length > 1 ? 'those periods are' : 'that period is'} skipped.` : ''} Scorpio and Aquarius each have two lords; the stronger one is used.
      </p>
    </CollapsibleSection>
  );
}
