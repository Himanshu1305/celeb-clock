import { TermTip } from '@/components/vedic/TermTip';

/** Glossary ids a daily page may explain (checked by the glossary-coverage test). */
export const DAILY_TERM: Record<string, string> = {
  chandrabala: 'chandrabala',
  tarabala: 'tarabala',
  chandrashtama: 'chandrashtama',
  nakshatra: 'nakshatra',
  sadeSati: 'sadeSati',
  dhaiya: 'dhaiya',
  gochar: 'gochar',
  houseFromMoon: 'houseFromMoon',
  choghadiya: 'choghadiya',
  rahuKalam: 'rahuKalam',
  luckyColour: 'luckyColour',
  luckyNumber: 'luckyNumber',
  ayanamsa: 'ayanamsa',
  solarHouse: 'solarHouse',
  westernAspect: 'westernAspect',
  retrograde: 'retrograde',
  ingress: 'ingress',
  transitGrade: 'transitGrade',
  tropicalZodiac: 'tropicalZodiac',
  sunSign: 'sunSign',
};
export type DailyTermKey = string;

/** Static "what these words mean" strip shown under a daily reading (outside the
 *  Worker-injected block, so the TermTip popovers stay React components). */
export function DailyTermStrip({ title, terms, lang = 'en' }: { title: string; terms: { key: DailyTermKey; label: string }[]; lang?: 'en' | 'hi' }) {
  return (
    <div className="rounded-xl border border-border p-4 mb-6" data-testid="daily-terms">
      <h2 className="font-semibold text-foreground mb-2 text-sm">{title}</h2>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {terms.map(t => (
          <span key={t.key}><TermTip id={DAILY_TERM[t.key]} lang={lang}>{t.label}</TermTip></span>
        ))}
      </div>
    </div>
  );
}
