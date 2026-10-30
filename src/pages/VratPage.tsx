/**
 * Batch 10 — vrat katha + puja vidhi pages.
 *   /vrat, /vrat/:slug (English) · /hi/vrat, /hi/vrat/:slug (Hindi)
 * Static, sourced content: src/lib/vedic/vrats/content.ts (every section cites the page it
 * came from). The "next date + timings" block is a daily page (src/lib/daily, kinds 'vrat' /
 * 'vrat-hi', data 'vrat-next') so it stays current between deploys; the title is static.
 * Linked from /festivals/:year and from the daily Panchang on the days the vrat falls.
 */
import { Navigate, useParams } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { VRAT_CONTENT, vratSources, type Source, type VratSection } from '@/lib/vedic/vrats/content';
import { VRAT_INDEX_SLUG, VRAT_NAMES, VRAT_SLUGS, VRAT_SLUG_SET, vratMeta, vratPath, type VratSlug } from '@/lib/vedic/vrats/meta';

const SITE = 'https://bornclock.com';
type Lang = 'en' | 'hi';

/** Terms explained on every vrat page (TermTip ids). */
const VRAT_TERM: Record<string, string> = {
  Tithi: 'tithi', Paksha: 'paksha', Purnima: 'purnima', Ekadashi: 'ekadashi', Sankalpa: 'sankalpa', Parana: 'parana',
  'Pradosh Kaal': 'pradoshKaal', 'Nishita Kaal': 'nishitaKaal', // One glossary entry per concept: 'purnimanta' explains both month systems (amanta has its own).
  'Amanta / Purnimanta': 'purnimanta',
  'Abhijit Muhurta': 'abhijit', 'Adhik Maas': 'adhikMaas', Chaturmas: 'chaturmas', Muhurat: 'muhurat',
};
/** Hindi chip labels for the same terms. */
const VRAT_TERM_HI: Record<string, string> = {
  Tithi: 'तिथि', Paksha: 'पक्ष', Purnima: 'पूर्णिमा', Ekadashi: 'एकादशी', Sankalpa: 'संकल्प', Parana: 'पारण',
  'Pradosh Kaal': 'प्रदोष काल', 'Nishita Kaal': 'निशीथ काल', 'Amanta / Purnimanta': 'अमांत / पूर्णिमांत',
  'Abhijit Muhurta': 'अभिजित मुहूर्त', 'Adhik Maas': 'अधिक मास', Chaturmas: 'चातुर्मास', Muhurat: 'मुहूर्त',
};
const TERMS_FOR: Record<VratSlug | 'index', string[]> = {
  index: ['Tithi', 'Paksha', 'Purnima', 'Ekadashi', 'Sankalpa', 'Parana', 'Amanta / Purnimanta'],
  'ekadashi': ['Tithi', 'Paksha', 'Ekadashi', 'Sankalpa', 'Parana', 'Adhik Maas', 'Chaturmas', 'Amanta / Purnimanta'],
  'satyanarayan-katha': ['Tithi', 'Purnima', 'Sankalpa'],
  'pradosh-vrat': ['Tithi', 'Paksha', 'Pradosh Kaal'],
  'sankashti-chaturthi': ['Tithi', 'Paksha', 'Sankalpa', 'Amanta / Purnimanta'],
  'karwa-chauth': ['Tithi', 'Paksha', 'Sankalpa', 'Amanta / Purnimanta'],
  'somvar-vrat': ['Sankalpa', 'Amanta / Purnimanta'],
  'mangalvar-vrat': ['Sankalpa'],
  'navratri': ['Tithi', 'Paksha', 'Abhijit Muhurta', 'Muhurat'],
  'mahashivratri': ['Tithi', 'Paksha', 'Nishita Kaal', 'Sankalpa', 'Parana', 'Amanta / Purnimanta'],
  'janmashtami': ['Tithi', 'Paksha', 'Nishita Kaal', 'Amanta / Purnimanta'],
};

const T = {
  en: {
    crumbVedic: 'Vedic Astrology', crumbVrat: 'Vrat katha', otherLang: 'हिंदी में पढ़ें', eyebrow: 'Vrat katha & puja vidhi',
    gentleH: 'A gentle note',
    gentle: 'A vrat is about devotion, not perfection. If you miss a step, cannot find an item or need to eat, that is fine — do what you can with a sincere heart. Anyone unwell, pregnant, elderly or on regular medicines should keep a lighter fast or skip it, and check with a doctor. BornClock does not sell pujas or any items.',
    source: 'Source', sources: 'Sources', mantraH: 'Mantra (with meaning)', meaning: 'Meaning', when: 'When', terms: 'What these terms mean', termsHint: 'Tap a term for a plain-language explanation.',
    others: 'Other vrats', calendar: 'Full festival & vrat calendar', panchang: 'Today’s Panchang', faq: 'Frequently Asked Questions',
    sourceNote: 'The katha and vidhi above are paraphrased in plain language from the sources listed; customs vary by family and region — your family tradition comes first.',
    hubLead: 'Plain-language vrat kathas and simple puja vidhis for the ten most-kept Hindu fasts, each with its sources, regional customs and the next date from our Panchang.',
    deity: 'Deity',
  },
  hi: {
    crumbVedic: 'वैदिक ज्योतिष', crumbVrat: 'व्रत कथा', otherLang: 'Read in English', eyebrow: 'व्रत कथा और पूजा विधि',
    gentleH: 'एक सरल बात',
    gentle: 'व्रत श्रद्धा का विषय है, पूर्णता का नहीं। कोई चरण छूट जाए, कोई सामग्री न मिले या भोजन करना पड़े — तो कोई बात नहीं; सच्चे मन से जितना हो सके करें। अस्वस्थ, गर्भवती, बुज़ुर्ग या नियमित दवा लेने वाले लोग हल्का व्रत रखें या न रखें, और डॉक्टर से पूछ लें। BornClock कोई पूजा या सामग्री नहीं बेचता।',
    source: 'स्रोत', sources: 'स्रोत', mantraH: 'मंत्र (अर्थ सहित)', meaning: 'अर्थ', when: 'कब', terms: 'इन शब्दों का अर्थ', termsHint: 'किसी शब्द पर टैप करें — सरल भाषा में अर्थ दिखेगा।',
    others: 'अन्य व्रत', calendar: 'पूरा त्योहार और व्रत कैलेंडर', panchang: 'आज का पंचांग', faq: 'अक्सर पूछे जाने वाले प्रश्न',
    sourceNote: 'ऊपर दी गई कथा और विधि सूचीबद्ध स्रोतों से सरल भाषा में ली गई है; परंपराएँ परिवार और क्षेत्र के अनुसार बदलती हैं — आपके परिवार की परंपरा सबसे पहले।',
    hubLead: 'दस सबसे अधिक रखे जाने वाले व्रतों की सरल भाषा में कथा और आसान पूजा विधि — हर एक के स्रोत, क्षेत्रीय परंपराएँ और हमारे पंचांग से अगली तिथि के साथ।',
    deity: 'देवता',
  },
} as const;

function SourceLinks({ sources, lang }: { sources: Source[]; lang: Lang }) {
  return (
    <p className="text-xs text-muted-foreground mt-3" data-testid="vrat-section-sources">
      {T[lang].source}:{' '}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && ' · '}
          {s.url.startsWith('/')
            ? <Link to={s.url} className="underline">{s.label}</Link>
            : <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.label}</a>}
        </span>
      ))}
    </p>
  );
}

function Section({ s, lang }: { s: VratSection; lang: Lang }) {
  return (
    <section id={`vrat-${s.id}`} className="rounded-xl border border-border p-4 sm:p-5 mb-4" data-testid={`vrat-section-${s.id}`}>
      <h2 className="font-semibold text-foreground mb-2 text-lg">{s.heading[lang]}</h2>
      {s.paras?.map((p, i) => <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">{p[lang]}</p>)}
      {s.list && (
        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
          {s.list.map((x, i) => <li key={i}>{x[lang]}</li>)}
        </ul>
      )}
      {s.steps && (
        <ol className="list-decimal pl-5 space-y-2 text-sm text-foreground">
          {s.steps.map((x, i) => <li key={i} className="leading-relaxed">{x[lang]}</li>)}
        </ol>
      )}
      {s.rows && (
        <ul className="space-y-2 text-sm mt-2">
          {s.rows.map((r, i) => (
            <li key={i} className="border-t border-border pt-2 first:border-0 first:pt-0">
              <strong className="text-foreground">{r.label[lang]}</strong>
              <span className="block text-muted-foreground leading-relaxed">{r.text[lang]}</span>
            </li>
          ))}
        </ul>
      )}
      <SourceLinks sources={s.sources} lang={lang} />
    </section>
  );
}

function TermList({ labels, lang }: { labels: string[]; lang: Lang }) {
  return (
    <div className="rounded-xl border border-border p-4 mb-6" data-testid="vrat-terms">
      <h2 className="font-semibold text-foreground mb-1">{T[lang].terms}</h2>
      <p className="text-xs text-muted-foreground mb-2">{T[lang].termsHint}</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {labels.map(label => <li key={label} className="rounded-full border border-border px-3 py-1"><TermTip id={VRAT_TERM[label]} lang={lang}>{lang === 'hi' ? VRAT_TERM_HI[label] : label}</TermTip></li>)}
      </ul>
    </div>
  );
}

export default function VratPage({ lang = 'en' }: { lang?: Lang }) {
  const { slug: slugParam } = useParams<{ slug?: string }>();
  const valid = !slugParam || VRAT_SLUG_SET.has(slugParam);
  const pageSlug = slugParam && valid ? slugParam : VRAT_INDEX_SLUG;
  const kind = lang === 'hi' ? 'vrat-hi' : 'vrat';
  const { entry } = useDailyEntry(kind, valid ? pageSlug : null);
  if (!valid) return <Navigate to={vratPath(VRAT_INDEX_SLUG, lang)} replace />;

  const t = T[lang];
  const meta = vratMeta(pageSlug, lang);
  const path = vratPath(pageSlug, lang);
  const hreflang = [{ lang: 'en', url: `${SITE}${vratPath(pageSlug, 'en')}/` }, { lang: 'hi', url: `${SITE}${vratPath(pageSlug, 'hi')}/` }];
  const hub = vratPath(VRAT_INDEX_SLUG, lang);
  const nameOf = (s: VratSlug) => VRAT_NAMES[s][lang];
  const isHub = pageSlug === VRAT_INDEX_SLUG;
  const content = isHub ? null : VRAT_CONTENT[pageSlug as VratSlug];

  const dailyBlock = (
    <div className="mb-6" data-testid="vrat-next">
      <p className="text-xs text-muted-foreground mb-2"><DailyDate entry={entry} /></p>
      <DailyBody entry={entry} testId="vrat-daily" />
      <DailyJsonLd entry={entry} path={path} />
    </div>
  );

  const footer = {
    tagline: lang === 'hi' ? 'स्रोत-सहित व्रत कथा और पूजा विधि।' : 'Sourced vrat kathas and puja vidhi.',
    nav: [{ label: t.calendar, to: '/festivals/' }, { label: t.panchang, to: lang === 'hi' ? '/hi/panchang' : '/panchang' }, { label: lang === 'hi' ? 'सभी व्रत' : 'All vrats', to: hub }],
    note: lang === 'hi' ? 'तिथियाँ नई दिल्ली के लिए गणना की गई हैं; स्थानीय पंचांग में एक दिन का अंतर हो सकता है।' : 'Dates are computed for New Delhi; a local Panchang can differ by a day.',
  };

  if (isHub) {
    return (
      <ToolLayout
        theme="vedic"
        testId="vrat-hub"
        seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogImage="https://bornclock.com/og/vedic.png" hreflang={hreflang} />}
        breadcrumb={{ trail: [{ label: t.crumbVedic, to: '/vedic-astrology/' }], current: t.crumbVrat }}
        footer={footer}
        eyebrow={t.eyebrow}
        h1={<DailyH1 entry={entry} fallback={meta.h1} />}
        lead={t.hubLead}
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-3xl">
            <p className="text-xs text-muted-foreground mb-4"><Link to={vratPath(VRAT_INDEX_SLUG, lang === 'hi' ? 'en' : 'hi')} className="underline" data-testid="vrat-lang-switch">{t.otherLang}</Link></p>
            {dailyBlock}
            <div className="grid sm:grid-cols-2 gap-3 mb-6" data-testid="vrat-hub-cards">
              {VRAT_SLUGS.map(s => (
                <Link key={s} to={vratPath(s, lang)} className="rounded-xl border border-border p-4 hover:shadow-sm transition" data-testid={`vrat-card-${s}`}>
                  <div className="font-semibold text-foreground">{nameOf(s)}</div>
                  <div className="text-xs text-primary mb-1">{t.deity}: {lang === 'hi' ? VRAT_NAMES[s].deityHi : VRAT_NAMES[s].deityEn}</div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{VRAT_CONTENT[s].summary[lang]}</p>
                </Link>
              ))}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 mb-6 text-sm text-foreground" data-testid="vrat-gentle">
              <h2 className="font-semibold mb-1">{t.gentleH}</h2><p>{t.gentle}</p>
            </div>
            <TermList labels={TERMS_FOR.index} lang={lang} />
            <PageFAQ
              title={t.faq}
              items={lang === 'hi'
                ? [
                    { question: 'इन पृष्ठों पर व्रत की तिथियाँ कहाँ से आती हैं?', answer: 'हमारे पंचांग इंजन से, जो सूर्य-चंद्रमा की वास्तविक स्थिति से तिथि निकालता है और हर व्रत का पारंपरिक नियम नई दिल्ली के सूर्योदय-सूर्यास्त पर लगाता है। ये तिथियाँ द्रिक पंचांग के नई दिल्ली कैलेंडर से जाँची गई हैं; आपके शहर में कभी-कभी एक दिन का अंतर हो सकता है।' },
                    { question: 'कथा और पूजा विधि किन स्रोतों से है?', answer: 'हर खंड के नीचे उसका स्रोत दिया है — विकिपीडिया लेख और द्रिक पंचांग के व्रत पृष्ठ, जिन्हें हमने खोलकर पढ़ा और सरल भाषा में लिखा। हमने कोई कथा, मंत्र या विधि अपनी ओर से नहीं जोड़ी; मंत्र केवल वहीं हैं जहाँ स्रोत में उसका उच्चारण और अर्थ दोनों दिए हैं।' },
                    { question: 'अगर व्रत का कोई नियम छूट जाए तो?', answer: 'कोई बात नहीं। व्रत श्रद्धा का विषय है; सच्चे मन से जितना हो सके करें, और स्वास्थ्य के अनुसार हल्का व्रत चुनें।' },
                  ]
                : [
                    { question: 'Where do the vrat dates on these pages come from?', answer: 'From our Panchang engine, which finds each tithi from the real Sun and Moon and applies each vrat’s classical rule against New Delhi’s sunrise and sunset. The dates are checked against Drik Panchang’s New Delhi calendar; your city can occasionally differ by a day.' },
                    { question: 'Where do the kathas and puja vidhis come from?', answer: 'Each section lists its source below it — Wikipedia articles and Drik Panchang’s vrat pages, which we opened and paraphrased in plain language. We have not added any story, mantra or ritual of our own; mantras appear only where the source gives both the transliteration and the meaning.' },
                    { question: 'What if I miss a rule of the vrat?', answer: 'That is fine. A vrat is about devotion; do what you can with a sincere heart, and choose a lighter fast if your health needs it.' },
                  ]}
            />
          </div>
        </section>
      </ToolLayout>
    );
  }

  const c = content!;
  const s = pageSlug as VratSlug;
  return (
    <ToolLayout
      theme="vedic"
      testId="vrat-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogImage="https://bornclock.com/og/vedic.png" ogType="article" hreflang={hreflang} />}
      breadcrumb={{ trail: [{ label: t.crumbVedic, to: '/vedic-astrology/' }, { label: t.crumbVrat, to: hub }], current: nameOf(s) }}
      footer={footer}
      eyebrow={`${t.eyebrow} · ${t.deity}: ${lang === 'hi' ? VRAT_NAMES[s].deityHi : VRAT_NAMES[s].deityEn}`}
      h1={<DailyH1 entry={entry} fallback={meta.h1} />}
      lead={c.summary[lang]}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <p className="text-xs text-muted-foreground mb-4"><Link to={vratPath(s, lang === 'hi' ? 'en' : 'hi')} className="underline" data-testid="vrat-lang-switch">{t.otherLang}</Link></p>
          {dailyBlock}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 mb-6 text-sm text-foreground" data-testid="vrat-gentle">
            <h2 className="font-semibold mb-1">{t.gentleH}</h2><p>{t.gentle}</p>
          </div>

          {c.sections.map(sec => <Section key={sec.id} s={sec} lang={lang} />)}

          {c.mantras.length > 0 && (
            <section className="rounded-xl border border-border p-4 sm:p-5 mb-4" data-testid="vrat-mantras">
              <h2 className="font-semibold text-foreground mb-2 text-lg">{t.mantraH}</h2>
              <ul className="space-y-4 text-sm">
                {c.mantras.map((m, i) => (
                  <li key={i}>
                    <p className="text-foreground font-medium" lang="sa">{m.deva}</p>
                    <p className="italic text-muted-foreground">{m.translit}</p>
                    <p className="text-foreground"><span className="text-muted-foreground">{t.meaning}:</span> {m.meaning[lang]}</p>
                    <p className="text-xs text-muted-foreground">{t.when}: {m.use[lang]}</p>
                    <SourceLinks sources={[m.source]} lang={lang} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <TermList labels={TERMS_FOR[s]} lang={lang} />

          <div className="rounded-xl border border-border p-4 mb-6 text-sm" data-testid="vrat-sources">
            <h2 className="font-semibold text-foreground mb-2">{t.sources}</h2>
            <ul className="list-disc pl-5 space-y-1 break-words">
              {vratSources(c).map(src => (
                <li key={src.url}>{src.url.startsWith('/') ? <Link to={src.url} className="underline">{src.label}</Link> : <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline">{src.label}</a>}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">{t.sourceNote}</p>
          </div>

          <h2 className="font-semibold text-foreground mb-2">{t.others}</h2>
          <div className="flex flex-wrap gap-2 mb-8" data-testid="vrat-others">
            {VRAT_SLUGS.filter(x => x !== s).map(x => <Link key={x} to={vratPath(x, lang)} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{nameOf(x)}</Link>)}
            <Link to="/festivals/" className="px-3 py-1.5 rounded-lg border border-border text-sm text-primary hover:bg-primary/5">{t.calendar} →</Link>
          </div>

          <PageFAQ title={t.faq} items={c.faq.map(f => ({ question: f.q[lang], answer: f.a[lang] }))} />
          <div className="-mt-12 mb-8 max-w-3xl mx-auto" data-testid="vrat-faq-sources"><SourceLinks sources={c.faqSources} lang={lang} /></div>
        </div>
      </section>
    </ToolLayout>
  );
}
