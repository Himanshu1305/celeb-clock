/**
 * B14 — the 2027 yearly forecast for one sign:
 *   /rashifal/:rashi/2027      (Vedic, English)
 *   /hi/rashifal/:rashi/2027   (Vedic, Hindi — legacy Hindi slugs)
 *   /horoscope/:sign/2027      (Western, tropical)
 *
 * Everything on the page is computed from the real 2027 sky (src/lib/year2027/reading.ts).
 * The page is fixed to the calendar year 2027 (no "today" content), so the prerendered HTML
 * never goes stale.
 */
import { OtherLanguages } from '@/components/lang/OtherLanguages';
import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { ScrollTable } from '@/components/ScrollTable';
import { RASHIS } from '@/lib/vedic/rashifal';
import { remedyByKey, TEMPLES, GEM_CAUTION } from '@/lib/vedic/remedies';
import { computeYearReading, type System } from '@/lib/year2027/reading';
import { longDate, range, TONE_WORD, type Lang } from '@/lib/year2027/text';
import {
  RASHI_SLUGS_2027, RASHI_SLUGS_HI_2027, SIGN_SLUGS_2027, SIGN_EN, RASHI_NAME_EN, RASHI_NAME_HI,
  p2027, year2027Meta, Y2027_PUBLISHED, Y2027_UPDATED,
} from '@/lib/year2027/meta.js';
import { WESTERN_DATES } from '@/lib/year2027/western';
import { ToneBadge, H2, Card, FaqList, LinkChips, KV, YearJsonLd } from './parts';

const SITE = 'https://bornclock.com';

const T = {
  en: {
    brief: '2027 in brief', facts: 'At a glance', transits: 'The big planetary moves of 2027 for you',
    th: ['Planet', 'Sign', 'Your house', 'When', 'Effect'],
    areas: 'Love, career, money and health in 2027', why: 'Why', todo: 'What to do',
    months: 'Month-by-month 2027', best: 'Best periods of 2027', hard: 'Periods that need care', love: 'Relationship and marriage windows',
    loveLead: 'Windows when Venus or Jupiter supports your houses of love. Use them for important conversations; any marriage date (muhurat) should come from both partners’ full charts.',
    bestLead: 'The stretches where the planets lean most in your favour — good for starting, asking and planning.',
    hardLead: 'The stretches where more planets ask for care. They are not “bad luck” — use them to finish, review and rest.',
    because: 'Because', ecl: 'Eclipses of 2027 and the houses they touch',
    eclLead: 'Dates and times IST (checked against NASA). Tradition keeps the eclipse day quiet — prayer, then charity — and starts nothing new on it.',
    eclTh: ['Eclipse', 'Date & time (IST)', 'House', 'What it means'],
    lucky: 'Lucky months, colours and numbers', luckyMonths: 'Lucky months', colours: 'Colours', numbers: 'Numbers', day: 'Day',
    rem: 'Remedies for 2027 — free practices first', remLead: 'Optional, traditional practices for this year’s most demanding influences. None is required and none guarantees a result. BornClock sells no pujas or gemstones.',
    mantra: 'Mantra', fasting: 'Fasting (optional)', daan: 'Daan (charity)', temple: 'Temple visit (optional)', gem: 'Gemstone — optional, with caution', fullRem: 'Full remedies page →',
    faq: 'Questions about', method: 'How this forecast is made',
    methodText: 'Rigorously computed: the real sidereal (Lahiri) position of every planet through 2027, split at each exact sign change and read by classical gochar rules from your Moon sign — so every rashi’s page is different. It describes tendencies, not certainties.',
    cta: 'Your Moon sign decides which page is yours. Not sure of it?', ctaBtn: 'Free Kundli — find your Moon sign →',
    others: 'Rashifal 2027 for the other rashis', other: 'हिंदी में पढ़ें', sadeSati: 'Sade Sati and Shani Dhaiya in 2027', ssLink: 'All Sade Sati dates for',
    updated: 'Updated', moonSign: 'Moon sign', also: 'Also see',
  },
  hi: {
    brief: '2027 संक्षेप में', facts: 'एक नज़र में', transits: '2027 में आपके लिए ग्रहों के बड़े बदलाव',
    th: ['ग्रह', 'राशि', 'आपका भाव', 'कब', 'प्रभाव'],
    areas: '2027 में प्रेम, करियर, धन और सेहत', why: 'क्यों', todo: 'क्या करें',
    months: '2027 का महीनेवार राशिफल', best: '2027 का सबसे अच्छा समय', hard: 'सावधानी वाला समय', love: 'रिश्तों और विवाह के लिए अनुकूल समय',
    loveLead: 'वे समय जब शुक्र या गुरु आपके प्रेम के भावों को सहयोग देते हैं। महत्वपूर्ण बातचीत के लिए इनका उपयोग करें; विवाह की तिथि (मुहूर्त) दोनों की पूरी कुंडली से निकालें।',
    bestLead: 'वे समय जब ग्रह सबसे ज़्यादा आपके पक्ष में होते हैं — शुरुआत, माँग और योजना के लिए अच्छे।',
    hardLead: 'वे समय जब ज़्यादा ग्रह सावधानी माँगते हैं। यह "दुर्भाग्य" नहीं है — इनमें काम पूरे करें, समीक्षा करें और आराम करें।',
    because: 'कारण', ecl: '2027 के ग्रहण और वे किन भावों को छूते हैं',
    eclLead: 'तारीख़ और समय IST (नासा से मिलान)। परंपरा में ग्रहण के दिन शांति — प्रार्थना, फिर दान — और कोई नई शुरुआत नहीं।',
    eclTh: ['ग्रहण', 'तारीख़ व समय (IST)', 'भाव', 'अर्थ'],
    lucky: 'शुभ महीने, रंग और अंक', luckyMonths: 'शुभ महीने', colours: 'रंग', numbers: 'अंक', day: 'दिन',
    rem: '2027 के उपाय — पहले बिना ख़र्च वाले', remLead: 'इस वर्ष के सबसे ज़्यादा मेहनत माँगने वाले ग्रहों के लिए वैकल्पिक, पारंपरिक उपाय। कोई भी अनिवार्य नहीं और कोई भी परिणाम की गारंटी नहीं देता। BornClock कोई पूजा या रत्न नहीं बेचता।',
    mantra: 'मंत्र', fasting: 'व्रत (वैकल्पिक)', daan: 'दान', temple: 'मंदिर दर्शन (वैकल्पिक)', gem: 'रत्न — वैकल्पिक, सावधानी के साथ', fullRem: 'पूरा उपाय पेज →',
    faq: 'प्रश्न —', method: 'यह भविष्यफल कैसे बनाया गया',
    methodText: 'सटीक गणना: 2027 में हर ग्रह की वास्तविक निरयन (लाहिड़ी) स्थिति, राशि-परिवर्तन की सटीक तारीख़ पर बाँटकर, आपकी चंद्र राशि से शास्त्रीय गोचर नियमों से पढ़ी गई — इसलिए हर राशि का पेज अलग है। यह प्रवृत्तियाँ बताता है, निश्चितता नहीं।',
    cta: 'आपकी चंद्र राशि तय करती है कि कौन-सा पेज आपका है। पक्का नहीं पता?', ctaBtn: 'मुफ़्त कुंडली — अपनी चंद्र राशि जानें →',
    others: 'दूसरी राशियों का राशिफल 2027', other: 'Read in English', sadeSati: '2027 में साढ़ेसाती और शनि ढैया', ssLink: 'साढ़ेसाती की सभी तारीख़ें —',
    updated: 'अपडेट', moonSign: 'चंद्र राशि', also: 'यह भी देखें',
  },
} as const;

const W = {
  saturn: 'Saturn in 2027', rem: 'Practical steps for 2027', remLead: 'Simple, practical things to do with this year’s influences — no rituals or purchases needed.',
  method: 'How this horoscope is made',
  methodText: 'Rigorously computed: we take the real tropical (Western) positions of the Sun, Mercury, Venus, Mars, Jupiter and Saturn through 2027, split each planet’s year at its exact sign changes, and count houses from your Sun sign (the “solar houses” used for sun-sign horoscopes). Each placement is read by the classical rule that Jupiter and Venus help most in the angles, trines and the house of gains, while Saturn and Mars give their best results in the 3rd, 6th, 10th and 11th. It describes tendencies, not certainties.',
  cta: 'Want the Vedic view, read from your Moon sign?', ctaBtn: 'Rashifal 2027 →', others: 'Horoscope 2027 for the other signs',
};

export default function YearForecastPage({ system, lang = 'en' }: { system: System; lang?: Lang }) {
  const { sign: slug } = useParams<{ sign: string }>();
  const slugs = system === 'western' ? SIGN_SLUGS_2027 : lang === 'hi' ? RASHI_SLUGS_HI_2027 : RASHI_SLUGS_2027;
  const idx = slug ? slugs.indexOf(slug) : -1;
  const r = useMemo(() => (idx < 0 ? null : computeYearReading(idx, system, lang)), [idx, system, lang]);
  if (idx < 0 || !r) return <Navigate to={system === 'western' ? p2027.horoscopeHub : lang === 'hi' ? p2027.rashifalHubHi : p2027.rashifalHub} replace />;

  const t = T[lang];
  const western = system === 'western';
  const path = western ? p2027.horoscope(idx) : lang === 'hi' ? p2027.rashifalHi(idx) : p2027.rashifal(idx);
  const meta = year2027Meta(path)!;
  const rashi = RASHIS[idx];
  const hubPath = western ? p2027.horoscopeHub : lang === 'hi' ? p2027.rashifalHubHi : p2027.rashifalHub;
  const name = western ? SIGN_EN[idx] : lang === 'hi' ? RASHI_NAME_HI[idx] : RASHI_NAME_EN[idx];
  const hreflang = western ? undefined : [
    { lang: 'en', url: `${SITE}${p2027.rashifal(idx)}/` },
    { lang: 'hi', url: `${SITE}${p2027.rashifalHi(idx)}/` },
    { lang: 'x-default', url: `${SITE}${p2027.rashifal(idx)}/` },
  ];
  const otherLang = western ? null : lang === 'en' ? p2027.rashifalHi(idx) : p2027.rashifal(idx);
  const L = lang === 'hi' && !western ? 'hi' : 'en';
  const crumbs = western
    ? [{ name: 'Horoscope 2027', path: p2027.horoscopeHub }, { name: `${name} 2027`, path }]
    : lang === 'hi'
      ? [{ name: 'राशिफल 2027', path: p2027.rashifalHubHi }, { name: `${name} राशिफल 2027`, path }]
      : [{ name: 'Rashifal 2027', path: p2027.rashifalHub }, { name: `${name} 2027`, path }];

  const facts: Array<{ label: string; value: string }> = western
    ? [
        { label: 'Sun-sign dates', value: WESTERN_DATES[idx] },
        { label: 'Year tone', value: r.headline },
        { label: 'Best stretch', value: r.best[0] ? range(r.best[0].from, r.best[0].to, 'en') : '—' },
        { label: 'Needs care', value: r.challenging[0] ? range(r.challenging[0].from, r.challenging[0].to, 'en') : '—' },
        { label: 'Strongest months', value: r.lucky.months.join(', ') },
      ]
    : [
        { label: t.moonSign, value: lang === 'en' ? `${rashi.sanskrit} (${rashi.english}), ruled by ${rashi.lord}` : `${rashi.hindi} (${rashi.english}), स्वामी ${rashi.lordHindi}` },
        { label: lang === 'en' ? 'Sade Sati / Dhaiya' : 'साढ़ेसाती / ढैया', value: r.saturn.status === 'sadeSati' ? (lang === 'en' ? 'Sade Sati in 2027' : '2027 में साढ़ेसाती') : r.saturn.status === 'dhaiya' ? (lang === 'en' ? 'Shani Dhaiya in 2027' : '2027 में शनि ढैया') : (lang === 'en' ? 'None in 2027' : '2027 में नहीं') },
        { label: lang === 'en' ? 'Best stretch' : 'सबसे अच्छा समय', value: r.best[0] ? range(r.best[0].from, r.best[0].to, L) : '—' },
        { label: lang === 'en' ? 'Needs most care' : 'सबसे ज़्यादा सावधानी', value: r.challenging[0] ? range(r.challenging[0].from, r.challenging[0].to, L) : '—' },
        { label: t.luckyMonths, value: r.lucky.months.join(', ') },
      ];

  // The single most demanding influence's remedies (the full page links to the rest).
  const remEntries = western ? [] : r.remedyKeys.map(k => remedyByKey(k)).filter((e): e is NonNullable<typeof e> => !!e).slice(0, 1);

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="year2027-forecast"
      seo={(
        <>
          <SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png"
            publishedTime={Y2027_PUBLISHED} modifiedTime={Y2027_UPDATED} section={western ? 'Horoscope 2027' : 'Rashifal 2027'}
            hreflang={hreflang} breadcrumbItems={crumbs} articleSchema={false} />
        </>
      )}
      breadcrumb={{
        trail: western
          ? [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }, { label: 'Horoscope 2027', to: `${p2027.horoscopeHub}/` }]
          : lang === 'hi'
            ? [{ label: 'राशिफल', to: '/hi/rashifal/' }, { label: 'राशिफल 2027', to: `${p2027.rashifalHubHi}/` }]
            : [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }, { label: 'Rashifal 2027', to: `${p2027.rashifalHub}/` }],
        current: western ? `${name} 2027` : lang === 'hi' ? `${name} 2027` : `${name} 2027`,
        edition: western ? 'Horoscope 2027' : lang === 'hi' ? 'वार्षिक राशिफल' : 'Yearly rashifal',
      }}
      footer={{
        tagline: western ? 'Computed horoscopes from the real sky.' : 'Computed Vedic horoscopes from your real Moon sign.',
        nav: western
          ? [{ label: 'Horoscope 2027', to: `${p2027.horoscopeHub}/` }, { label: 'Rashifal 2027', to: `${p2027.rashifalHub}/` }, { label: 'Festivals 2027', to: '/hindu-calendar-2027/' }]
          : [{ label: 'Rashifal 2027', to: `${p2027.rashifalHub}/` }, { label: 'राशिफल 2027', to: `${p2027.rashifalHubHi}/` }, { label: 'Free Kundli', to: '/kundali/' }],
        note: western ? 'Readings follow the astrological tradition — reflective guidance, not certainty.' : 'Readings are computed from sidereal planetary transits and attributed to the Vedic tradition — reflective guidance, not certainty.',
      }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={r.faq} lang={L} />
      <section className="section" lang={L}>
        <div className="section-head">
          <div><span className="eyebrow">{western ? 'Horoscope 2027' : lang === 'hi' ? 'राशिफल 2027' : 'Rashifal 2027'}</span><h1 data-testid="year2027-h1">{meta.h1}</h1></div>
          <p>
            <strong data-testid="year2027-headline">{r.headline}</strong>{' '}
            <span className="text-sm text-brand-muted">{t.updated}: {longDate(Y2027_UPDATED, L)}.</span>{' '}
            {otherLang && <Link to={otherLang} lang={lang === 'en' ? 'hi' : 'en'} className="underline" data-testid="year2027-lang-switch">{t.other}</Link>}
          </p>
        </div>

        {!western && <OtherLanguages label={lang === 'en' ? 'Read this in' : 'दूसरी भाषाओं में'} />}
        <H2 id="brief">{t.brief}</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed" data-testid="year2027-brief">
          {r.brief.map(p => <p key={p.slice(0, 40)}>{p}</p>)}
        </div>
        <Card className="!mt-4" testId="year2027-facts">
          <div className="font-semibold text-brand-ink !mb-2">{t.facts}</div>
          <KV rows={facts} />
        </Card>

        <H2 id="transits">{western ? 'The big planetary moves of 2027 for you' : t.transits}</H2>
        <ScrollTable lang={L}>
          <table className="w-full text-sm" data-testid="year2027-transits">
            <thead><tr className="text-left text-brand-muted">{(western ? ['Planet', 'Sign', 'Solar house', 'When', 'Effect'] : t.th).map(h => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {r.transits.map(x => (
                <tr key={x.planet + x.from} className="border-t border-brand-line text-brand-ink">
                  <td className="py-1.5 pr-3 whitespace-nowrap font-medium">{x.planetLabel}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{x.sign}</td>
                  <td className="py-1.5 pr-3">{x.house}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{x.when}</td>
                  <td className="py-1.5 pr-3"><ToneBadge tone={x.tone} label={x.toneLabel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>

        <H2 id="areas">{western ? 'Love, career, money and health in 2027' : t.areas}</H2>
        <div className="grid md:grid-cols-2 gap-4" data-testid="year2027-areas">
          {r.areas.map(a => (
            <Card key={a.key}>
              <div className="flex items-center justify-between gap-2 !mb-2">
                <h3 className="font-semibold text-brand-ink">{a.title}</h3>
                <ToneBadge tone={a.tone} label={TONE_WORD[L][a.tone]} />
              </div>
              <p className="text-brand-ink font-medium !mb-2">{a.impact}</p>
              <div className="text-sm text-brand-ink-soft"><strong className="text-brand-ink">{t.why}: </strong>
                <ul className="list-disc pl-5 !mt-1 space-y-1">{a.reasons.map(x => <li key={x}>{x}</li>)}</ul>
              </div>
              <p className="text-sm text-brand-ink-soft !mt-2"><strong className="text-brand-ink">{t.todo}: </strong>{a.todo}</p>
            </Card>
          ))}
        </div>

        <H2 id="months">{t.months}</H2>
        <div className="grid md:grid-cols-2 gap-3" data-testid="year2027-months">
          {r.months.map(m => (
            <Card key={m.month}>
              <div className="flex items-center justify-between gap-2 !mb-1">
                <h3 className="font-semibold text-brand-ink">{m.name} 2027</h3>
                <ToneBadge tone={m.tone} label={TONE_WORD[L][m.tone]} />
              </div>
              <p className="text-sm font-medium text-brand-ink">{m.verdict}.</p>
              <p className="text-sm text-brand-ink-soft !mt-1 leading-relaxed">{m.text}</p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 !mt-2">
          <div>
            <H2 id="best">{t.best}</H2>
            <p className="text-sm text-brand-muted !mb-2">{t.bestLead}</p>
            <ul className="space-y-2" data-testid="year2027-best">
              {r.best.map(w => <li key={w.from} className="text-sm text-brand-ink"><strong>{range(w.from, w.to, L)}</strong> — {t.because}: {w.why}.</li>)}
            </ul>
          </div>
          <div>
            <H2 id="care">{t.hard}</H2>
            <p className="text-sm text-brand-muted !mb-2">{t.hardLead}</p>
            <ul className="space-y-2" data-testid="year2027-hard">
              {r.challenging.map(w => <li key={w.from} className="text-sm text-brand-ink"><strong>{range(w.from, w.to, L)}</strong> — {t.because}: {w.why}.</li>)}
            </ul>
          </div>
        </div>

        {r.loveWindows.length > 0 && (
          <>
            <H2 id="love-windows">{t.love}</H2>
            <p className="text-sm text-brand-muted !mb-2">{t.loveLead}</p>
            <ul className="space-y-2" data-testid="year2027-love">
              {r.loveWindows.map(w => <li key={w.from} className="text-sm text-brand-ink"><strong>{range(w.from, w.to, L)}</strong> — {w.why}.</li>)}
            </ul>
          </>
        )}

        <H2 id="saturn">{western ? W.saturn : t.sadeSati}</H2>
        <Card testId="year2027-saturn">
          <p className="text-brand-ink leading-relaxed">{r.saturn.text}</p>
          <ul className="!mt-2 space-y-1 text-sm text-brand-ink-soft">
            {r.saturn.rows.map(x => <li key={x.from}><strong className="text-brand-ink">{x.when}</strong> — {x.label}</li>)}
          </ul>
          {!western && <p className="text-sm !mt-2"><Link to={lang === 'hi' ? `/hi/sade-sati/${RASHI_SLUGS_HI_2027[idx]}` : `/sade-sati/${RASHI_SLUGS_2027[idx]}`} className="underline">{t.ssLink} {name} →</Link></p>}
        </Card>

        <H2 id="eclipses">{t.ecl}</H2>
        <p className="text-sm text-brand-muted !mb-2">{western ? 'Every solar and lunar eclipse of 2027 (dates and times IST; checked against NASA’s eclipse tables), and the solar house each one activates for you.' : t.eclLead}</p>
        <ScrollTable lang={L}>
          <table className="w-full text-sm" data-testid="year2027-eclipses">
            <thead><tr className="text-left text-brand-muted">{t.eclTh.map(h => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {r.eclipses.map(e => (
                <tr key={e.date + e.name} className="border-t border-brand-line text-brand-ink align-top">
                  <td className="py-1.5 pr-3">{e.name}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{longDate(e.date, L)}, {e.time}</td>
                  <td className="py-1.5 pr-3">{e.house}</td>
                  <td className="py-1.5 pr-3 text-brand-ink-soft">{e.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>
        <p className="text-sm !mt-2"><Link to="/eclipses/2027/" className="underline">{lang === 'hi' && !western ? 'ग्रहण 2027 — पूरा विवरण →' : 'Eclipses 2027 — full details →'}</Link></p>

        <H2 id="lucky">{t.lucky}</H2>
        <Card testId="year2027-lucky">
          <KV rows={[
            { label: t.luckyMonths, value: r.lucky.months.join(', ') },
            ...(r.lucky.colours.length ? [{ label: t.colours, value: r.lucky.colours.join(', ') }] : []),
            ...(r.lucky.numbers.length ? [{ label: t.numbers, value: r.lucky.numbers.join(', ') }] : []),
            { label: t.day, value: r.lucky.day },
          ]} />
          <p className="text-sm text-brand-ink-soft !mt-3">{r.lucky.text}</p>
        </Card>

        <H2 id="remedies">{western ? W.rem : t.rem}</H2>
        <p className="text-sm text-brand-muted !mb-3">{western ? W.remLead : t.remLead}</p>
        {western ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-brand-ink" data-testid="year2027-steps">
            {r.areas.map(a => <li key={a.key}><strong>{a.title}:</strong> {a.todo}</li>)}
          </ul>
        ) : (
          <div className="grid md:grid-cols-2 gap-4" data-testid="year2027-remedies">
            {remEntries.map(e => {
              const mantra = e.free.mantras[0];
              const temple = e.temples.map(id => TEMPLES[id]).find(Boolean);
              return (
                <Card key={e.key}>
                  <h3 className="font-semibold text-brand-ink !mb-2">{e.name[lang]}</h3>
                  <KV rows={[
                    ...(mantra ? [{ label: t.mantra, value: <><span lang="sa">{mantra.devanagari}</span><br /><em>{mantra.transliteration}</em> — {mantra.count[lang]}, {mantra.when[lang]}</> }] : []),
                    { label: t.fasting, value: e.free.fasting.text[lang] },
                    ...(e.daan[0] ? [{ label: t.daan, value: `${e.daan[0].what[lang]} — ${e.daan[0].toWhom[lang]}, ${e.daan[0].day[lang]}` }] : []),
                    ...(temple ? [{ label: t.temple, value: `${temple.name[lang]} (${temple.town}, ${temple.state})` }] : []),
                  ]} />
                  <p className="text-sm !mt-2"><Link to={lang === 'hi' ? `/hi/upay/${e.slug}` : `/remedies/${e.slug}`} className="underline">{t.fullRem}</Link></p>
                </Card>
              );
            })}
          </div>
        )}
        {!western && <p className="text-sm text-brand-ink-soft !mt-3" data-testid="year2027-gem-note"><strong className="text-brand-ink">{t.gem}: </strong>{GEM_CAUTION[lang].split(/(?<=[.।])\s/)[0]} <Link to={lang === 'hi' ? '/hi/upay/' : '/remedies/'} className="underline">{lang === 'hi' ? 'सभी उपाय →' : 'All remedies →'}</Link></p>}

        <H2 id="faq">{western ? `Questions about ${name} in 2027` : lang === 'hi' ? `${t.faq} ${name} राशिफल 2027` : `${t.faq} ${name} rashifal 2027`}</H2>
        <FaqList items={r.faq} testId="year2027-faq" />

        <div className="!mt-8 rounded-xl border border-brand-purple/30 bg-brand-purple/10 p-4" data-testid="year2027-method">
          <div className="font-semibold text-brand-ink !mb-1">{western ? W.method : t.method}</div>
          <p className="text-sm text-brand-ink">{western ? W.methodText : t.methodText} <Link to="/how-it-works/#vedic" className="underline">{lang === 'hi' && !western ? 'गणना पद्धति →' : 'Methodology →'}</Link></p>
        </div>

        <div className="!mt-6 rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-5 text-center">
          <p className="text-brand-ink !mb-3">{western ? W.cta : t.cta}</p>
          <Link to={western ? `${p2027.rashifalHub}/` : '/kundali/'} className="inline-flex items-center gap-2 bg-brand-navy text-white rounded-lg px-5 py-2.5 font-semibold">{western ? W.ctaBtn : t.ctaBtn}</Link>
        </div>

        <H2 id="others">{western ? W.others : t.others}</H2>
        <LinkChips testId="year2027-others" items={slugs.map((_, i) => i).filter(i => i !== idx).map(i => ({
          to: western ? `${p2027.horoscope(i)}/` : lang === 'hi' ? `${p2027.rashifalHi(i)}/` : `${p2027.rashifal(i)}/`,
          label: western ? SIGN_EN[i] : lang === 'hi' ? `${RASHI_NAME_HI[i]} राशिफल 2027` : `${RASHI_NAME_EN[i]} 2027`,
        }))} />
        <p className="text-sm text-brand-muted !mt-4" data-testid="year2027-also">
          {t.also}: <Link to={`${hubPath}/`} className="underline">{western ? 'Horoscope 2027 (all signs)' : lang === 'hi' ? 'राशिफल 2027 (सभी राशियाँ)' : 'Rashifal 2027 (all rashis)'}</Link>
          {' · '}<Link to={western ? `/zodiac/${SIGN_SLUGS_2027[idx]}/` : lang === 'hi' ? `/hi/rashifal/${RASHI_SLUGS_HI_2027[idx]}/` : `/rashifal/${RASHI_SLUGS_2027[idx]}/today/`} className="underline">{western ? `${name} sign guide` : lang === 'hi' ? `आज का ${name} राशिफल` : `${name} rashifal today`}</Link>
          {' · '}<Link to="/hindu-calendar-2027/" className="underline">{lang === 'hi' && !western ? 'हिंदू कैलेंडर 2027' : 'Hindu calendar 2027'}</Link>
          {' · '}<Link to="/numerology-2027/" className="underline">{lang === 'hi' && !western ? 'अंक ज्योतिष 2027' : 'Numerology 2027'}</Link>
          {!western && <>{' · '}<Link to={`${p2027.horoscope(idx)}/`} className="underline">{SIGN_EN[idx]} horoscope 2027 (Western)</Link></>}
        </p>
      </section>
    </PajPage>
  );
}
