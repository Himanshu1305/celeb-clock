/**
 * Reusable "What this means for you / What you can do" block (Batch 5, goal d).
 * Shown wherever a finding appears — dosha pages, Kundali results, match results,
 * Sade Sati, the Dasha view — and in full on /remedies/:slug and /hi/upay/:slug.
 *
 * Order is deliberate: meaning first (calm, honest about how common it is and that
 * cancellations exist), then free everyday remedies, then daan, puja, temples,
 * gemstone (always with the caution) and when to consult. Every item shows its
 * traditional source. BornClock sells no pujas or stones.
 */
import { Link } from '@/components/seo/CanonicalLink';
import {
  REMEDIES, TEMPLES, GEM_CAUTION, remedyByKey,
  type Finding, type Lang, type L10n, type Mantra, type Practice, type RemedyEntry,
} from '@/lib/vedic/remedies';

const T = {
  meaning: { en: 'What this means for you', hi: 'आपके लिए इसका अर्थ' },
  howCommon: { en: 'How common is it?', hi: 'यह कितना आम है?' },
  cancellations: { en: 'Why it is often milder than feared', hi: 'यह अक्सर डर से हल्का क्यों होता है' },
  whatToDo: { en: 'What you can do', hi: 'आप क्या कर सकते हैं' },
  whatToDoLead: { en: 'Optional traditional remedies — free ones first. None is required, and none guarantees a result.', hi: 'वैकल्पिक पारंपरिक उपाय — पहले निःशुल्क। कोई भी अनिवार्य नहीं, और कोई भी परिणाम की गारंटी नहीं देता।' },
  free: { en: '1. Free, everyday remedies', hi: '1. निःशुल्क, रोज़मर्रा के उपाय' },
  mantra: { en: 'Mantra', hi: 'मंत्र' },
  prayer: { en: 'Prayer / stotra', hi: 'प्रार्थना / स्तोत्र' },
  fasting: { en: 'Fasting (optional)', hi: 'व्रत (वैकल्पिक)' },
  lifestyle: { en: 'Everyday practice', hi: 'दैनिक अभ्यास' },
  seva: { en: 'Seva (service)', hi: 'सेवा' },
  daan: { en: '2. Daan (donation)', hi: '2. दान' },
  what: { en: 'What', hi: 'क्या' },
  toWhom: { en: 'To whom', hi: 'किसे' },
  day: { en: 'When', hi: 'कब' },
  puja: { en: '3. Puja / havan', hi: '3. पूजा / हवन' },
  temples: { en: '4. Temples traditionally associated', hi: '4. परंपरा से जुड़े मंदिर' },
  templesLead: { en: 'Visiting is optional. Locations checked against the sources linked.', hi: 'दर्शन वैकल्पिक है। स्थान दिए गए स्रोतों से जाँचे गए हैं।' },
  verified: { en: 'Checked against', hi: 'स्रोत' },
  gem: { en: '5. Gemstone — with caution', hi: '5. रत्न — सावधानी के साथ' },
  gemTool: { en: 'Check which stone (if any) suits your full chart →', hi: 'आपकी पूरी कुंडली के लिए कौन-सा रत्न (यदि कोई) उपयुक्त है, देखें →' },
  consult: { en: '6. When to consult an astrologer', hi: '6. ज्योतिषी से कब मिलें' },
  source: { en: 'Source', hi: 'स्रोत' },
  count: { en: 'Count', hi: 'संख्या' },
  when: { en: 'When', hi: 'कब' },
  home: { en: 'Can be done at home', hi: 'घर पर कर सकते हैं' },
  priest: { en: 'Needs a priest', hi: 'पुरोहित आवश्यक' },
  homeOrPriest: { en: 'At home, or with a priest', hi: 'घर पर, या पुरोहित के साथ' },
  footer: {
    en: 'These are traditional customs offered for reflection and comfort — never guaranteed, never required, and not medical, legal or financial advice. BornClock sells no pujas or gemstones.',
    hi: 'ये पारंपरिक प्रथाएँ चिंतन और मन की शांति के लिए दी गई हैं — कभी पक्की नहीं, कभी अनिवार्य नहीं, और चिकित्सीय, कानूनी या आर्थिक सलाह नहीं। BornClock कोई पूजा या रत्न नहीं बेचता।',
  },
  fullPage: { en: 'Full remedies page →', hi: 'पूरा उपाय पेज →' },
  findingsTitle: { en: 'What was found — and what you can do', hi: 'क्या मिला — और आप क्या कर सकते हैं' },
  allRemedies: { en: 'All remedies', hi: 'सभी उपाय' },
} satisfies Record<string, L10n>;

const t = (k: keyof typeof T, lang: Lang) => T[k][lang];
const tx = (v: L10n, lang: Lang) => v[lang];

export function remedyPath(entry: RemedyEntry, lang: Lang): string {
  return lang === 'hi' ? `/hi/upay/${entry.slug}` : `/remedies/${entry.slug}`;
}

function Src({ s, lang }: { s: string; lang: Lang }) {
  return <span className="block text-[11px] text-muted-foreground/80 mt-0.5">{t('source', lang)}: {s}</span>;
}

function MantraCard({ m, lang }: { m: Mantra; lang: Lang }) {
  return (
    <div data-testid="remedy-mantra" className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-semibold text-foreground">{tx(m.name, lang)}</div>
      <p lang="sa" className="mt-1 text-base leading-relaxed text-foreground">{m.devanagari}</p>
      <p className="text-sm italic text-muted-foreground">{m.transliteration}</p>
      <p className="mt-1 text-xs text-muted-foreground"><strong className="text-foreground">{t('count', lang)}:</strong> {tx(m.count, lang)} · <strong className="text-foreground">{t('when', lang)}:</strong> {tx(m.when, lang)}</p>
      <Src s={m.source} lang={lang} />
    </div>
  );
}

function PracticeList({ items, lang }: { items: Practice[]; lang: Lang }) {
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
      {items.map((p, i) => <li key={i}>{tx(p.text, lang)}<Src s={p.source} lang={lang} /></li>)}
    </ul>
  );
}

function H({ children, testid }: { children: React.ReactNode; testid?: string }) {
  return <h3 data-testid={testid} className="mt-4 mb-2 text-sm font-bold text-foreground">{children}</h3>;
}

/** The meaning half — calm, honest. */
export function RemedyMeaning({ entry, lang = 'en' }: { entry: RemedyEntry; lang?: Lang }) {
  return (
    <div data-testid="remedy-meaning" className="space-y-2">
      <p className="text-sm text-foreground leading-relaxed">{tx(entry.meaning.plain, lang)}</p>
      <p className="text-sm text-muted-foreground"><strong className="text-foreground">{t('howCommon', lang)}</strong> {tx(entry.meaning.howCommon, lang)}</p>
      <p className="text-sm text-muted-foreground"><strong className="text-foreground">{t('cancellations', lang)}:</strong> {tx(entry.meaning.cancellations, lang)}</p>
    </div>
  );
}

/** The "What you can do" half — six sections in the fixed order. */
export function RemedyActions({ entry, lang = 'en' }: { entry: RemedyEntry; lang?: Lang }) {
  const whereLabel = (w: string) => (w === 'home' ? t('home', lang) : w === 'priest' ? t('priest', lang) : t('homeOrPriest', lang));
  return (
    <div data-testid="remedy-actions">
      <p className="text-xs text-muted-foreground">{t('whatToDoLead', lang)}</p>

      <H testid="remedy-free">{t('free', lang)}</H>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('mantra', lang)}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {entry.free.mantras.map((m, i) => <MantraCard key={i} m={m} lang={lang} />)}
      </div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('prayer', lang)}</div>
      <PracticeList items={entry.free.prayers} lang={lang} />
      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('fasting', lang)}</div>
      <PracticeList items={[entry.free.fasting]} lang={lang} />
      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('lifestyle', lang)}</div>
      <PracticeList items={entry.free.lifestyle} lang={lang} />
      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('seva', lang)}</div>
      <PracticeList items={entry.free.seva} lang={lang} />

      <H testid="remedy-daan">{t('daan', lang)}</H>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {entry.daan.map((d, i) => (
          <li key={i} className="rounded-lg border border-border p-2">
            <div><strong className="text-foreground">{t('what', lang)}:</strong> {tx(d.what, lang)}</div>
            <div><strong className="text-foreground">{t('toWhom', lang)}:</strong> {tx(d.toWhom, lang)}</div>
            <div><strong className="text-foreground">{t('day', lang)}:</strong> {tx(d.day, lang)}</div>
            <Src s={d.source} lang={lang} />
          </li>
        ))}
      </ul>

      <H testid="remedy-puja">{t('puja', lang)}</H>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {entry.puja.map((p, i) => (
          <li key={i} className="rounded-lg border border-border p-2">
            <div className="font-semibold text-foreground">{tx(p.name, lang)} <span data-testid="remedy-puja-where" className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{whereLabel(p.where)}</span></div>
            <div><strong className="text-foreground">{t('day', lang)}:</strong> {tx(p.when, lang)}</div>
            <div>{tx(p.note, lang)}</div>
            <Src s={p.source} lang={lang} />
          </li>
        ))}
      </ul>

      <H testid="remedy-temples">{t('temples', lang)}</H>
      {entry.temples.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground mb-2">{t('templesLead', lang)}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {entry.temples.map(id => {
              const tp = TEMPLES[id];
              if (!tp) return null;
              return (
                <li key={id} data-testid="remedy-temple" className="rounded-lg border border-border p-2">
                  <div className="font-semibold text-foreground">{tx(tp.name, lang)}</div>
                  <div className="text-xs">{tp.town}, {lang === 'hi' ? `${tp.district} ज़िला` : `${tp.district} district`}, {tp.state}</div>
                  <div className="mt-1">{tx(tp.association, lang)}</div>
                  <span className="block text-[11px] text-muted-foreground/80 mt-0.5">
                    {t('verified', lang)}:{' '}
                    {tp.verifiedFrom.map((u, i) => (
                      <span key={u}>{i > 0 && ' · '}<a href={u} target="_blank" rel="noopener noreferrer" className="underline">{new URL(u).hostname.replace(/^www\./, '')}</a></span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{entry.templesNote ? tx(entry.templesNote, lang) : ''}</p>
      )}

      <H testid="remedy-gem">{t('gem', lang)}</H>
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-900">
        <p>{tx(entry.gemstone.note, lang)}</p>
        <p data-testid="remedy-gem-caution" className="mt-1 text-xs">{tx(GEM_CAUTION, lang)}</p>
        <Link to="/gemstones/" className="mt-1 inline-block text-xs font-semibold underline">{t('gemTool', lang)}</Link>
      </div>

      <H testid="remedy-consult">{t('consult', lang)}</H>
      <p className="text-sm text-muted-foreground">{tx(entry.consult, lang)}</p>

      <p className="mt-4 text-xs text-amber-700">{t('footer', lang)}</p>
    </div>
  );
}

/**
 * Compact block for result pages: meaning visible, actions in a collapsible.
 * `remedyKey` is a REMEDIES key (e.g. "manglik", "planet:Saturn").
 */
export function Remedies({ remedyKey, lang = 'en', label, open = false, testid }: { remedyKey: string; lang?: Lang; label?: L10n; open?: boolean; testid?: string }) {
  const entry = remedyByKey(remedyKey);
  if (!entry) return null;
  return (
    <div data-testid={testid ?? `remedies-${entry.slug}`} className="rounded-xl border border-border p-5">
      <div className="font-semibold text-foreground mb-1">{label ? tx(label, lang) : tx(entry.name, lang)}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('meaning', lang)}</div>
      <RemedyMeaning entry={entry} lang={lang} />
      <details className="mt-3" open={open}>
        <summary className="cursor-pointer text-sm font-semibold text-primary">{t('whatToDo', lang)}</summary>
        <div className="mt-2"><RemedyActions entry={entry} lang={lang} /></div>
      </details>
      <Link to={remedyPath(entry, lang)} className="mt-3 inline-block text-xs text-primary hover:underline">{t('fullPage', lang)}</Link>
    </div>
  );
}

/** A list of findings (e.g. from findingsFromKundali), each with its remedy block. */
export function RemediesForFindings({ findings, lang = 'en', testid = 'remedies-findings' }: { findings: Finding[]; lang?: Lang; testid?: string }) {
  if (!findings.length) return null;
  return (
    <div data-testid={testid} className="space-y-3">
      <h3 className="font-semibold text-foreground">{t('findingsTitle', lang)}</h3>
      {findings.map(f => <Remedies key={f.key} remedyKey={f.key} label={f.label} lang={lang} />)}
      <Link to={lang === 'hi' ? '/hi/upay' : '/remedies'} className="inline-block text-xs text-primary hover:underline">{t('allRemedies', lang)} →</Link>
    </div>
  );
}

export { REMEDIES };
