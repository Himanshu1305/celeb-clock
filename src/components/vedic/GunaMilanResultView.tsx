/**
 * Guna Milan result block for the name-matching pages and the Hindi Kundli milan page
 * (Batch 9b). Pure presentation of a GunaMilanResult from the ONE engine
 * (src/lib/vedic/matchmaking.ts) — no scoring here.
 *
 * Hindi: koota names are the standard terms (वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट,
 * नाड़ी); each koota's plain-Hindi explanation is the existing TermTip Hindi definition
 * (termDefinitions.ts), and the score notes are the Hindi twins of numberNotes.ts.
 */
import { TermTip, NumberNote } from '@/components/vedic/TermTip';
import { RemediesForFindings } from '@/components/vedic/Remedies';
import { findingsFromMatch } from '@/lib/vedic/remedies';
import { getTermDef, MATCH_DOSHA_TERM } from '@/lib/vedic/termDefinitions';
import { kootaScoreNote, gunaTotalNote, kootaScoreNoteHi, gunaTotalNoteHi } from '@/lib/vedic/numberNotes';
import type { GunaMilanResult } from '@/lib/vedic/matchmaking';
import { KOOTA_HI, KOOTA_TERM, COMPAT_HI, DOSHA_HI } from '@/lib/vedic/nameMatching';

const KOOTA_EN: Record<string, string> = {
  varna: 'Varna', vashya: 'Vashya', tara: 'Tara', yoni: 'Yoni',
  graha_maitri: 'Graha Maitri', gana: 'Gana', bhakoot: 'Bhakoot', nadi: 'Nadi',
};

/** Plain-Hindi line for a matching dosha, built from its structured flags. */
export function doshaLineHi(d: { name: string; present: boolean; cancelled: boolean }): string {
  const n = DOSHA_HI[d.name] || d.name;
  if (d.name === 'Bhakoot Dosha') return `${n}: दोनों चंद्र राशियाँ 2/12, 5/9 या 6/8 की स्थिति में हैं, इसलिए भकूट में 7 में से 0 गुण मिले। इसे भावनात्मक और आर्थिक तालमेल पर ध्यान देने के क्षेत्र के रूप में शांति से देखें — यह कोई अंतिम निर्णय नहीं है।`;
  const what = d.name === 'Nadi Dosha' ? 'दोनों की नाड़ी एक है' : 'दोनों के गण आपस में मेल नहीं खाते';
  return d.cancelled
    ? `${n}: ${what}, पर शास्त्रीय परिहार (दोष निवारण का नियम) लागू होता है, इसलिए इसे चिंता का विषय नहीं माना जाता।`
    : `${n}: ${what} और कोई शास्त्रीय परिहार लागू नहीं होता। इसे शांति से, ध्यान देने के क्षेत्र के रूप में देखें — नीचे सरल उपाय दिए हैं।`;
}

export function GunaMilanResultView({
  result, lang = 'en', manglikStatus, withNames = (s: string) => s, testid = 'guna-result',
}: {
  result: GunaMilanResult;
  lang?: 'en' | 'hi';
  manglikStatus?: string | null;
  withNames?: (s: string) => string;
  testid?: string;
}) {
  const hi = lang === 'hi';
  return (
    <div data-testid={testid} className="space-y-4" lang={hi ? 'hi' : undefined}>
      <div className="text-center rounded-xl border border-border p-4">
        <div className="text-sm text-muted-foreground">{hi ? <>कुल <TermTip id="ashtakoota" lang="hi">गुण मिलान</TermTip></> : <>Total <TermTip id="ashtakoota">Guna Milan</TermTip></>}</div>
        <div data-testid={`${testid}-total`} className="text-4xl font-black text-brand-purple">{result.total} / 36</div>
        <div className="font-semibold text-foreground">{hi ? COMPAT_HI[result.compatibility] : result.compatibility}</div>
        <NumberNote testid={`${testid}-total-note`}>{hi ? gunaTotalNoteHi(result.total) : gunaTotalNote(result.total)}</NumberNote>
      </div>

      {result.doshas.some(d => d.present) && (
        <div data-testid={`${testid}-doshas`} className="space-y-2">
          {result.doshas.filter(d => d.present).map(d => (
            <div key={d.name} className={`rounded-lg border p-3 text-sm ${d.cancelled ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              {hi ? (
                <><span className="font-semibold">{d.cancelled ? '✓' : '⚠️'} {MATCH_DOSHA_TERM[d.name] ? <TermTip id={MATCH_DOSHA_TERM[d.name]} lang="hi">{DOSHA_HI[d.name]}</TermTip> : DOSHA_HI[d.name]}</span> — {doshaLineHi(d).split(': ').slice(1).join(': ')}</>
              ) : (
                <><span className="font-semibold">{d.cancelled ? '✓' : '⚠️'} {MATCH_DOSHA_TERM[d.name] ? <TermTip id={MATCH_DOSHA_TERM[d.name]}>{d.name}</TermTip> : d.name}{d.cancelled ? ' — cancelled' : ''}:</span> {withNames(d.reason)}</>
              )}
            </div>
          ))}
        </div>
      )}

      <table data-testid={`${testid}-table`} className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead><tr className="text-left text-muted-foreground"><th className="px-3 py-2 font-medium">{hi ? <TermTip id="koota" lang="hi">कूट</TermTip> : <TermTip id="koota">Koota</TermTip>}</th><th className="px-3 py-2 font-medium text-right">{hi ? 'गुण' : 'Points'}</th></tr></thead>
        <tbody>
          {result.kootas.map(k => (
            <tr key={k.key} data-testid={`${testid}-row-${k.key}`} className="border-t border-border">
              <td className="px-3 py-1.5 text-foreground"><TermTip id={KOOTA_TERM[k.key]} lang={lang}>{hi ? KOOTA_HI[k.key] : KOOTA_EN[k.key] ?? k.label}</TermTip></td>
              <td className="px-3 py-1.5 text-right font-semibold text-foreground">{k.score} / {k.max}</td>
            </tr>
          ))}
          <tr className="border-t border-border"><td className="px-3 py-1.5 font-semibold text-foreground">{hi ? 'कुल' : 'Total'}</td><td className="px-3 py-1.5 text-right font-bold text-brand-purple">{result.total} / 36</td></tr>
        </tbody>
      </table>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{hi ? 'आठों कूट क्या देखते हैं — सरल भाषा में:' : 'What each of the eight parts looks at:'}</p>
        {result.kootas.map(k => (
          <div key={k.key} data-testid={`${testid}-koota-${k.key}`} className={`rounded-lg border p-3 ${k.heavy ? 'border-brand-purple/30 bg-brand-purple/10' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-foreground">{hi ? KOOTA_HI[k.key] : KOOTA_EN[k.key] ?? k.label}</div>
              <div className={`font-bold ${k.score === 0 ? 'text-amber-600' : 'text-brand-purple'}`}>{k.score} / {k.max}</div>
            </div>
            <NumberNote testid={`${testid}-note-${k.key}`}>{hi ? kootaScoreNoteHi(k.key, k.score, k.max) : kootaScoreNote(k.key, k.score, k.max)}</NumberNote>
            <div className="text-sm text-muted-foreground mt-1">{hi ? getTermDef(KOOTA_TERM[k.key])?.hi : withNames(k.explanation)}</div>
          </div>
        ))}
      </div>

      <RemediesForFindings testid={`${testid}-remedies`} lang={lang} findings={findingsFromMatch(result.doshas, manglikStatus)} />
    </div>
  );
}
