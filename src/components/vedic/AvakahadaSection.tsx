/**
 * B21 — Avkahada Chakra + Ghatak Chakra on /kundali. Answer first (one sentence a reader can keep),
 * then the full table with a plain-language note on every row, then the Ghatak list framed as
 * "dates to avoid for big starts", never as danger. Engine: src/lib/vedic/avakahada.ts.
 */
import type { ReactNode } from 'react';
import { TermTip } from '@/components/vedic/TermTip';
import { CollapsibleSection } from '@/components/vedic/CollapsibleSection';
import { computeAvakahada, computeGhatak, AVAKAHADA_HELP, SIGN_EN } from '@/lib/vedic/avakahada';

const GANA_PLAIN: Record<string, string> = { Deva: 'gentle (Deva)', Manushya: 'practical (Manushya)', Rakshasa: 'intense (Rakshasa)' };

export function AvakahadaSection({ sun, moon, lagnaSignIndex }: { sun: number; moon: number; lagnaSignIndex: number }) {
  const a = computeAvakahada({ sun, moon, lagnaSignIndex });
  const g = computeGhatak(SIGN_EN.indexOf(a.rashi));
  const rows: Array<[ReactNode, ReactNode, string?]> = [
    ['Lagna (rising sign) · lord', `${a.lagna} · ${a.lagnaLord}`],
    ['Moon sign (Rashi) · lord', `${a.rashi} · ${a.rashiLord}`],
    ['Birth star (Nakshatra) · pada · lord', `${a.nakshatra} · ${a.pada} · ${a.nakshatraLord}`],
    ['Tithi at birth', `${a.paksha} ${a.tithi}`],
    ['Yoga · Karana at birth', `${a.yoga} · ${a.karana}`],
    ['Gana', a.gana, AVAKAHADA_HELP.gana],
    ['Nadi', a.nadi, AVAKAHADA_HELP.nadi],
    ['Yoni', a.yoni, AVAKAHADA_HELP.yoni],
    ['Varna', a.varna, AVAKAHADA_HELP.varna],
    ['Vashya', a.vashya, AVAKAHADA_HELP.vashya],
    ['Name syllable', `${a.nameAlphabet.en} (${a.nameAlphabet.hi})`, AVAKAHADA_HELP.nameAlphabet],
    [<><TermTip id="nameVarga">Varga</TermTip></>, a.varga, AVAKAHADA_HELP.varga],
    [<><TermTip id="yunja">Yunja</TermTip></>, a.yunja, AVAKAHADA_HELP.yunja],
    [<><TermTip id="hansak">Hansak (element)</TermTip></>, a.hansak, AVAKAHADA_HELP.hansak],
    [<><TermTip id="paya">Paya</TermTip> (by Moon house · by star)</>, `${a.payaRashi} · ${a.payaNakshatra}`, AVAKAHADA_HELP.paya],
  ];
  return (
    <CollapsibleSection testid="kundali-avakahada" title="Avkahada Chakra — your birth summary"
      summary={<>{a.rashi} Moon · {a.nakshatra} pada {a.pada} · {a.gana} Gana · {a.nadi} Nadi · name syllable “{a.nameAlphabet.en}”</>}>
      <p data-testid="avk-answer" className="result-annotation" style={{ marginBottom: 10 }}>
        <strong>In one line:</strong> your Moon is in {a.rashi} in the star {a.nakshatra} (pada {a.pada}), which makes your nature {GANA_PLAIN[a.gana]},
        your Nadi {a.nadi} and your traditional name syllable “{a.nameAlphabet.en}”. These are the same values used when your Kundli is matched for marriage.
      </p>
      <p className="text-sm text-muted-foreground" style={{ marginBottom: 8 }}>
        The <TermTip id="avakahada">Avkahada Chakra</TermTip> is the summary table printed on every traditional Kundli. Nearly every entry comes from the Moon at your birth.
      </p>
      <div className="table-scroll">
        <table data-testid="avk-table" className="data-table" style={{ fontSize: 13.5, borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {rows.map(([k, v, help], i) => (
              <tr key={i}>
                <th scope="row" style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 600, verticalAlign: 'top' }}>{k}</th>
                <td style={{ padding: '5px 8px', verticalAlign: 'top' }}><strong>{v}</strong>{help && <div className="text-xs text-muted-foreground">{help}</div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 style={{ margin: '16px 0 4px' }} data-testid="ghatak-title"><TermTip id="ghatak">Ghatak Chakra</TermTip> — when to avoid big new starts</h4>
      <p data-testid="ghatak-answer" className="text-sm" style={{ margin: '0 0 6px' }}>
        For a {a.rashi} Moon, tradition advises not to begin something major (a business, a move, a large purchase) when these fall together with you —
        for example a <strong>{g.day}</strong> in the month of <strong>{g.month}</strong>, or a day ruled by the star <strong>{g.nakshatra}</strong>.
        It is a calendar hint, not a warning: on such a day simply choose a nearby date for the start.
      </p>
      <table data-testid="ghatak-table" className="data-table" style={{ fontSize: 13.5, borderCollapse: 'collapse' }}>
        <tbody>
          {([
            ['Month', g.month], ['Tithi', `${g.tithiGroup} (${g.tithis.join(', ')} of each half-month)`], ['Weekday', g.day], ['Nakshatra', g.nakshatra],
            ['Yoga', g.yoga], ['Karana', g.karana], ['Prahar (3-hour watch)', g.prahar],
            ['Moon’s ghatak sign — for a man', g.moonMale], ['Moon’s ghatak sign — for a woman', g.moonFemale],
          ] as const).map(([k, v]) => (
            <tr key={k}><th scope="row" style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 600 }}>{k}</th><td style={{ padding: '4px 8px' }}>{v}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground" style={{ marginTop: 6 }}>
        Sources: Antim Parichay’s Ghata Chakra (after Shreedhara Shivalal) and astrovachmi.com’s Ghat Chakra table agree on every entry except the Prahar for
        Cancer, Leo and Virgo Moons (shown as “1 or 5”). Classical texts exempt weddings, upanayan, yajna and pilgrimage from Ghatak restrictions.
        Avkahada values are checked against FuturePoint’s published tables for 80 charts — see <a href="/accuracy/" className="underline">How we check our accuracy</a>.
      </p>
    </CollapsibleSection>
  );
}

export default AvakahadaSection;
