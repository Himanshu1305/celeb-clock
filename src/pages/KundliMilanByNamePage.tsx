/**
 * Kundli milan by name (Batch 9b) — /kundli-milan-by-name (English) and
 * /hi/naam-se-kundli-milan (Hindi). A distinct search intent ("match without birth
 * details"), so its own page rather than a mode of /kundali-match.
 *
 * Name → first syllable → Nakshatra pada (src/lib/vedic/nameMatching.ts) → the same
 * Ashtakoota engine as birth-detail matching. The approximation is stated up front and
 * every result links to the accurate (birth-details) matcher.
 */
import { useMemo, useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { AutoTranslatedNotice } from '@/components/AutoTranslatedNotice';
import { GunaMilanResultView } from '@/components/vedic/GunaMilanResultView';
import { readName, matchByName, ALL_PADAS, RASHI_EN, RASHI_HI_LIST, type NameStar } from '@/lib/vedic/nameMatching';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';

type Lang = 'en' | 'hi';
const SITE = 'https://bornclock.com';
export const NAME_MATCH_PATH: Record<Lang, string> = { en: '/kundli-milan-by-name', hi: '/hi/naam-se-kundli-milan' };
const ACCURATE_PATH: Record<Lang, string> = { en: '/kundali-match', hi: '/hi/kundli-milan' };

export const NAME_MATCH_META: Record<Lang, { title: string; description: string; h1: string }> = {
  en: {
    title: 'Kundli Milan by Name — Match Without Birth Details | BornClock',
    description: 'Kundli milan by name: the first syllable of each name gives a nakshatra, and the 36 gunas are added up. An approximation — use birth details for an accurate match.',
    h1: 'Kundli milan by name',
  },
  hi: {
    title: 'नाम से कुंडली मिलान — बिना जन्म तिथि गुण मिलान | BornClock',
    description: 'नाम से कुंडली मिलान: नाम के पहले अक्षर से नक्षत्र और राशि, फिर 36 गुणों का मिलान। यह अनुमान है — सटीक मिलान के लिए जन्म तिथि, समय और स्थान डालें।',
    h1: 'नाम से कुंडली मिलान',
  },
};

const T = {
  en: {
    eyebrow: 'Naam se Kundli Milan',
    answer: 'Type the boy’s and the girl’s names. Each name’s first syllable points to a birth star (nakshatra) and Moon sign, and the traditional 36 gunas are added up from those two stars.',
    limit: 'Name-based matching is an approximation; for an accurate match use birth details.',
    limitLink: 'Match with birth details →',
    boy: 'Boy’s name (groom)', girl: 'Girl’s name (bride)',
    placeholder: 'e.g. Rahul or राहुल',
    reads: (syl: string, nak: string, pada: number, rashi: string) => `${syl} → ${nak} pada ${pada}, Moon sign ${rashi}`,
    several: 'This spelling can be read more than one way — pick the sound your family uses:',
    none: 'No syllable in the traditional table starts this way. Pick the syllable closest to how the name sounds:',
    pickPh: 'Choose a syllable…',
    other: 'Know the naam nakshatra, or want a different syllable?',
    viaFirst: '(first letter)', viaEq: (s: string) => `(${s} is read with this letter group)`,
    resultHead: 'Name match result',
    manglik: 'Manglik (Mangal Dosha) cannot be checked from names — it needs where Mars was at birth.',
    manglikLink: 'Check Manglik with birth details',
    enterBoth: 'Enter both names to see the score.',
    how: 'How name matching works',
    howText: 'In the Hindu naming tradition the first sound of a child’s name was chosen from the syllable of the Moon’s nakshatra pada at birth (108 padas, 4 per nakshatra). Reading that syllable back gives the nakshatra and Moon sign, and the eight kootas — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi — are scored from them exactly as in birth-detail matching. If a name was not chosen this way (most modern names), the result says nothing about the real charts.',
    faqHead: 'Questions',
    hindiLink: 'नाम से कुंडली मिलान (हिंदी)',
  },
  hi: {
    eyebrow: 'नाम से कुंडली मिलान',
    answer: 'लड़के और लड़की का नाम लिखें। हर नाम का पहला अक्षर एक नक्षत्र और चंद्र राशि बताता है, और इन्हीं दो नक्षत्रों से पारंपरिक 36 गुणों का मिलान किया जाता है।',
    limit: 'नाम से मिलान केवल एक अनुमान है; सटीक मिलान के लिए जन्म विवरण (तिथि, समय, स्थान) का उपयोग करें।',
    limitLink: 'जन्म विवरण से मिलान करें →',
    boy: 'लड़के का नाम (वर)', girl: 'लड़की का नाम (कन्या)',
    placeholder: 'जैसे राहुल या Rahul',
    reads: (syl: string, nak: string, pada: number, rashi: string) => `${syl} → ${nak} नक्षत्र, चरण ${pada}, चंद्र राशि ${rashi}`,
    several: 'यह नाम एक से अधिक तरह पढ़ा जा सकता है — जो उच्चारण आपके परिवार में है, वह चुनें:',
    none: 'पारंपरिक तालिका में इस ध्वनि से कोई अक्षर शुरू नहीं होता। नाम के उच्चारण के सबसे निकट का अक्षर चुनें:',
    pickPh: 'अक्षर चुनें…',
    other: 'नाम नक्षत्र पता है, या कोई और अक्षर चुनना है?',
    viaFirst: '(पहला अक्षर)', viaEq: (s: string) => `(${s} इसी अक्षर-समूह में पढ़ा जाता है)`,
    resultHead: 'नाम मिलान का परिणाम',
    manglik: 'नाम से मांगलिक (मंगल दोष) नहीं देखा जा सकता — इसके लिए जन्म के समय मंगल की स्थिति चाहिए।',
    manglikLink: 'जन्म विवरण से मांगलिक देखें',
    enterBoth: 'स्कोर देखने के लिए दोनों नाम लिखें।',
    how: 'नाम से मिलान कैसे होता है',
    howText: 'हिंदू नामकरण परंपरा में बच्चे के नाम का पहला अक्षर जन्म के समय चंद्रमा के नक्षत्र-चरण के अक्षर से रखा जाता था (27 नक्षत्र × 4 चरण = 108 अक्षर)। उसी अक्षर से नक्षत्र और चंद्र राशि वापस निकलती है, और फिर आठों कूट — वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट और नाड़ी — ठीक जन्म-विवरण वाले मिलान की तरह गिने जाते हैं। अगर नाम इस तरह नहीं रखा गया (आज के ज़्यादातर नाम), तो परिणाम असली कुंडलियों के बारे में कुछ नहीं बताता।',
    faqHead: 'सामान्य प्रश्न',
    hindiLink: 'Kundli milan by name (English)',
  },
} as const;

export const NAME_MATCH_FAQ: Record<Lang, Array<{ question: string; answer: string }>> = {
  en: [
    { question: 'How does kundli milan by name work?', answer: 'The first syllable of each name is looked up in the traditional 108-syllable table (4 syllables for each of the 27 nakshatras). That gives each person’s nakshatra and Moon sign, and the 36-point Ashtakoota (Guna Milan) is scored from those two stars.' },
    { question: 'Is matching by name accurate?', answer: 'It is an approximation. A name only shows which syllable was chosen, not where the Moon really was at birth. Most modern names are not chosen from the birth star, so for a marriage decision use birth date, time and place.' },
    { question: 'What if my name starts with a sound that fits two nakshatras?', answer: 'English spellings like “Ta”, “Da” or “Na” can stand for two different Hindi letters (त or ट, द or ड, न or ण), which belong to different nakshatras. The page shows every reading and lets you choose; typing the name in Hindi (Devanagari) removes most of this doubt.' },
    { question: 'Can Manglik dosha be checked from names?', answer: 'No. Manglik dosha depends on the house Mars occupied at birth, which a name cannot tell. Use birth-detail matching for the Manglik check.' },
    { question: 'How many gunas are needed for marriage?', answer: 'Traditionally 18 of 36 is the pass mark; 24 and above is considered good and 28 and above excellent. Families also look at Nadi and Bhakoot dosha and their cancellations.' },
  ],
  hi: [
    { question: 'नाम से कुंडली मिलान कैसे होता है?', answer: 'हर नाम का पहला अक्षर पारंपरिक 108 अक्षरों की तालिका (27 नक्षत्र × 4 चरण) में देखा जाता है। इससे दोनों का नक्षत्र और चंद्र राशि मिलती है, और फिर इन्हीं से 36 गुणों का अष्टकूट मिलान होता है।' },
    { question: 'क्या नाम से कुंडली मिलान सही होता है?', answer: 'यह केवल अनुमान है। नाम से सिर्फ़ इतना पता चलता है कि कौन-सा अक्षर चुना गया, यह नहीं कि जन्म के समय चंद्रमा कहाँ था। आज के ज़्यादातर नाम जन्म नक्षत्र से नहीं रखे जाते, इसलिए विवाह के निर्णय के लिए जन्म तिथि, समय और स्थान से मिलान करें।' },
    { question: 'अगर नाम का पहला अक्षर दो नक्षत्रों में आता हो तो?', answer: 'अंग्रेज़ी में "Ta", "Da" या "Na" जैसे अक्षर दो अलग हिंदी अक्षर (त/ट, द/ड, न/ण) हो सकते हैं, जो अलग नक्षत्रों के हैं। पेज सभी विकल्प दिखाता है और आप चुन सकते हैं; नाम हिंदी (देवनागरी) में लिखने से यह भ्रम ज़्यादातर दूर हो जाता है।' },
    { question: 'क्या नाम से मांगलिक दोष देखा जा सकता है?', answer: 'नहीं। मांगलिक दोष जन्म के समय मंगल के भाव पर निर्भर है, जो नाम से पता नहीं चलता। इसके लिए जन्म विवरण से मिलान करें।' },
    { question: 'विवाह के लिए कितने गुण मिलने चाहिए?', answer: 'परंपरा में 36 में से 18 गुण न्यूनतम माने जाते हैं; 24 या अधिक अच्छे और 28 या अधिक उत्तम। साथ में नाड़ी और भकूट दोष व उनके परिहार भी देखे जाते हैं।' },
  ],
};

const nakName = (n: string, lang: Lang) => (lang === 'hi' ? NAKSHATRA_HINDI[n] || n : n);
const rashiName = (i: number, lang: Lang) => (lang === 'hi' ? RASHI_HI_LIST[i] : RASHI_EN[i]);
const padaId = (s: NameStar) => `${s.nakshatra}#${s.pada}`;

function NameInput({ who, lang, value, onChange, chosen, onChoose }: {
  who: 'boy' | 'girl'; lang: Lang; value: string; onChange: (v: string) => void;
  chosen: string | null; onChoose: (id: string | null) => void;
}) {
  const t = T[lang];
  const reading = useMemo(() => readName(value), [value]);
  const cands = reading.candidates;
  const manual = chosen && !cands.some(c => padaId(c) === chosen) ? chosen : '';
  const label = (s: NameStar) => {
    const syl = lang === 'hi' ? s.akshara.hi : `${s.akshara.en} (${s.akshara.hi})`;
    const via = s.via === 'firstLetter' ? ` ${t.viaFirst}` : s.via === 'equivalent' ? ` ${t.viaEq(Array.from(value.trim())[0] || '')}` : '';
    return t.reads(syl, nakName(s.nakshatra, lang), s.pada, rashiName(s.rashiIndex, lang)) + via;
  };
  const select = (
    <select data-testid={`nm-pick-${who}`} value={manual} onChange={e => onChoose(e.target.value || null)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
      <option value="">{t.pickPh}</option>
      {ALL_PADAS.map(s => (
        <option key={padaId(s)} value={padaId(s)}>{lang === 'hi' ? s.akshara.hi : `${s.akshara.en} ${s.akshara.hi}`} — {nakName(s.nakshatra, lang)} {s.pada}</option>
      ))}
    </select>
  );
  return (
    <div className="rounded-xl border border-border p-4 space-y-2">
      <label className="font-semibold text-foreground block" htmlFor={`nm-name-${who}`}>{who === 'boy' ? t.boy : t.girl}</label>
      <input id={`nm-name-${who}`} data-testid={`nm-name-${who}`} type="text" value={value} maxLength={40}
             onChange={e => { onChange(e.target.value); onChoose(null); }} placeholder={t.placeholder}
             className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      {value.trim() && cands.length === 1 && (
        <p data-testid={`nm-reading-${who}`} className="text-sm text-muted-foreground">{label(cands[0])}</p>
      )}
      {cands.length > 1 && (
        <fieldset data-testid={`nm-choices-${who}`} className="text-sm space-y-1">
          <legend className="text-xs text-muted-foreground mb-1">{t.several}</legend>
          {cands.map((c, i) => (
            <label key={padaId(c)} className="flex items-start gap-2">
              <input type="radio" name={`nm-${who}`} checked={chosen ? chosen === padaId(c) : i === 0} onChange={() => onChoose(padaId(c))} />
              <span>{label(c)}</span>
            </label>
          ))}
        </fieldset>
      )}
      {value.trim() && cands.length === 0 && (
        <div data-testid={`nm-none-${who}`} className="space-y-1">
          <p className="text-xs text-amber-800">{t.none}</p>
          {select}
        </div>
      )}
      {cands.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">{t.other}</summary>
          <div className="mt-1">{select}</div>
        </details>
      )}
    </div>
  );
}

function resolve(name: string, chosen: string | null): NameStar | null {
  if (chosen) return ALL_PADAS.find(s => padaId(s) === chosen) ?? readName(name).candidates.find(c => padaId(c) === chosen) ?? null;
  return readName(name).candidates[0] ?? null;
}

export default function KundliMilanByNamePage({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  const meta = NAME_MATCH_META[lang];
  const hi = lang === 'hi';
  const [boy, setBoy] = useState('');
  const [girl, setGirl] = useState('');
  const [boyPick, setBoyPick] = useState<string | null>(null);
  const [girlPick, setGirlPick] = useState<string | null>(null);

  const bStar = boy.trim() ? resolve(boy, boyPick) : null;
  const gStar = girl.trim() ? resolve(girl, girlPick) : null;
  const dispB = boy.trim() || (hi ? 'लड़का' : 'the boy');
  const dispG = girl.trim() || (hi ? 'लड़की' : 'the girl');
  const result = bStar && gStar ? matchByName(bStar, gStar, { groom: dispB, bride: dispG }) : null;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="name-match-page"
      seo={(
        <SEO title={meta.title} description={meta.description} canonicalUrl={NAME_MATCH_PATH[lang]} ogType="website"
             hreflang={[{ lang: 'en', url: `${SITE}${NAME_MATCH_PATH.en}/` }, { lang: 'hi', url: `${SITE}${NAME_MATCH_PATH.hi}/` }]} />
      )}
      breadcrumb={hi
        ? { trail: [{ label: 'कुंडली मिलान', to: '/hi/kundli-milan/' }], current: 'नाम से कुंडली मिलान', edition: '36 गुण · नाम के पहले अक्षर से' }
        : { trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }, { label: 'Kundali Matching', to: '/kundali-match/' }], current: 'Kundli milan by name', edition: '36 gunas · from the first syllable' }}
      footer={{
        tagline: hi ? 'नाम के पहले अक्षर से गुण मिलान — एक अनुमान; सटीक मिलान जन्म विवरण से।' : 'Guna milan from the first syllable of each name — an approximation; birth details give the accurate match.',
        nav: hi
          ? [{ label: 'कुंडली मिलान', to: '/hi/kundli-milan/' }, { label: 'राशिफल', to: '/hi/rashifal/' }, { label: 'उपाय', to: '/hi/upay/' }, { label: 'English', to: NAME_MATCH_PATH.en }]
          : [{ label: 'Kundali Matching', to: '/kundali-match/' }, { label: 'Vedic Astrology', to: '/vedic-astrology/' }, { label: 'Baby names by nakshatra', to: '/baby-names/' }, { label: 'हिंदी', to: NAME_MATCH_PATH.hi }],
      }}
    >
      <FAQSchema items={NAME_MATCH_FAQ[lang]} />
      <section className="section" lang={hi ? 'hi' : undefined}>
        <div className="section-head">
          <div><span className="eyebrow">{t.eyebrow}</span><h1>{meta.h1}</h1></div>
          <p data-testid="nm-answer">{t.answer}</p>
        </div>
        {hi && <AutoTranslatedNotice lang="hi" />}
        <p data-testid="nm-limit" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" style={{ marginBottom: 16 }}>
          {t.limit} <Link to={ACCURATE_PATH[lang]} className="underline font-semibold">{t.limitLink}</Link>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <NameInput who="boy" lang={lang} value={boy} onChange={setBoy} chosen={boyPick} onChoose={setBoyPick} />
          <NameInput who="girl" lang={lang} value={girl} onChange={setGirl} chosen={girlPick} onChoose={setGirlPick} />
        </div>
        <p className="text-xs text-muted-foreground">
          {hi ? <>मिलान लड़के से लड़की की ओर पढ़ा जाता है, इसलिए नाम सही खाने में लिखें। <TermTip id="matchDirection" lang="hi" iconOnly /></>
              : <>Matching is read from the boy to the girl, so put each name in the right box. <TermTip id="matchDirection" iconOnly /></>}
        </p>
      </section>

      <section className="section white" lang={hi ? 'hi' : undefined}>
        {result && bStar && gStar ? (
          <div data-testid="nm-result" className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t.resultHead}</h2>
            <p data-testid="nm-people" className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{dispB}</span> ({nakName(bStar.nakshatra, lang)} {bStar.pada}, {rashiName(bStar.rashiIndex, lang)})
              {' × '}
              <span className="font-medium text-foreground">{dispG}</span> ({nakName(gStar.nakshatra, lang)} {gStar.pada}, {rashiName(gStar.rashiIndex, lang)})
            </p>
            <GunaMilanResultView result={result} lang={lang} testid="nm" />
            <p data-testid="nm-manglik" className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              {t.manglik} <Link to={hi ? '/hi/kundli-milan' : '/manglik'} className="textlink">{t.manglikLink}</Link>
            </p>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {t.limit} <Link to={ACCURATE_PATH[lang]} className="underline font-semibold">{t.limitLink}</Link>
            </p>
          </div>
        ) : (
          <p data-testid="nm-empty" className="subtle">{t.enterBoth}</p>
        )}

        <div className="space-y-2" style={{ marginTop: 24 }}>
          <h2 className="text-lg font-bold text-foreground">{t.how}</h2>
          <p className="text-sm text-muted-foreground">{t.howText}</p>
        </div>
        <div data-testid="nm-faq" className="space-y-2" style={{ marginTop: 24 }}>
          <h2 className="text-lg font-bold text-foreground">{t.faqHead}</h2>
          {NAME_MATCH_FAQ[lang].map(f => (
            <details key={f.question} className="rounded-lg border border-border p-3 text-sm">
              <summary className="cursor-pointer font-medium text-foreground">{f.question}</summary>
              <p className="mt-2 text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
        <p className="subtle" style={{ marginTop: 24 }}>
          <Link to={ACCURATE_PATH[lang]} className="textlink">{hi ? 'जन्म विवरण से कुंडली मिलान' : 'Kundali matching with birth details'}</Link>
          {' · '}
          <Link to={hi ? NAME_MATCH_PATH.en : NAME_MATCH_PATH.hi} className="textlink" lang={hi ? 'en' : 'hi'}>{t.hindiLink}</Link>
        </p>
      </section>
    </PajPage>
  );
}
