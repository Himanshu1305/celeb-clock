/**
 * B14 — /festivals/2027/:slug and /hi/festivals/2027/:slug.
 *
 * The date, tithi start / end and the puja window come from the festival engine
 * (src/lib/year2027/festivalData.ts → src/lib/vedic/festivals.ts), for New Delhi; nothing is
 * typed by hand. The descriptive text is in src/lib/year2027/festivalContent.ts.
 */
import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { festival2027, festivals2027, dayLabel } from '@/lib/year2027/festivalData';
import { festivalDetails } from '@/lib/vedic/festivals';
import { FESTIVAL_TEXT_EN, FESTIVAL_TEXT_HI } from '@/lib/year2027/festivalContent';
import { FESTIVALS_2027, p2027, year2027Meta } from '@/lib/year2027/meta.js';
import type { Lang } from '@/lib/year2027/text';
import { H2, Card, FaqList, LinkChips, KV, YearJsonLd } from './parts';

const SITE = 'https://bornclock.com';
const MON_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

/** Replace {d:slug} tokens in static text with the engine's 2027 date ("27 October"). */
function fillDates(text: string, lang: Lang): string {
  return text.replace(/\{d:([a-z-]+)\}/g, (_m, slug: string) => {
    const iso = slug === 'narak'
      ? festivalDetails(2027).find(f => f.name === 'Narak Chaturdashi')?.dateISO
      : festivals2027('en').find(f => f.slug === slug)?.dateISO;
    if (!iso) return '';
    const [, m, d] = iso.split('-').map(Number);
    return `${d} ${lang === 'en' ? MON_EN[m - 1] : MON_HI[m - 1]}`;
  });
}

export default function FestivalDatePage({ lang = 'en' }: { lang?: Lang }) {
  const { slug = '' } = useParams<{ slug: string }>();
  const meta0 = FESTIVALS_2027.find(f => f.slug === slug && (lang === 'en' || f.hiPage));
  const f = useMemo(() => (meta0 ? festival2027(slug, lang) : undefined), [meta0, slug, lang]);
  if (!meta0 || !f) return <Navigate to="/festivals/2027/" replace />;

  const en = lang === 'en';
  const path = en ? p2027.festival(slug) : p2027.festivalHi(slug);
  const meta = year2027Meta(path)!;
  const text = en ? FESTIVAL_TEXT_EN[slug] : { ...FESTIVAL_TEXT_HI[slug], more: FESTIVAL_TEXT_EN[slug].more };
  const name = en ? meta0.en : meta0.hi;
  const when = dayLabel(f.dateISO, lang);
  const hasHi = !!meta0.hiPage;
  const hreflang = hasHi ? [
    { lang: 'en', url: `${SITE}${p2027.festival(slug)}/` }, { lang: 'hi', url: `${SITE}${p2027.festivalHi(slug)}/` }, { lang: 'x-default', url: `${SITE}${p2027.festival(slug)}/` },
  ] : undefined;

  const answer = en
    ? `${name} 2027 is on ${when} (New Delhi). ${f.tithiLabel === '' ? '' : `It falls on ${f.tithiLabel}.`}${f.alt ? ` In Bengal, by the Para-Viddha rule, it is kept on ${dayLabel(f.alt.dateISO, 'en')}.` : ''}`
    : `${name} 2027 ${when} को है (नई दिल्ली)। तिथि: ${f.tithiLabel}।${f.alt ? ` बंगाल में पर-विद्धा नियम से यह ${dayLabel(f.alt.dateISO, 'hi')} को मनाया जाता है।` : ''}`;

  const computedFaq = en
    ? [
        { question: `When is ${name} in 2027?`, answer: `${when}, for New Delhi. ${f.tithiLabel}.` },
        ...(f.timings.length ? [{ question: `What are the ${name} 2027 timings?`, answer: f.timings.map(t => `${t.label}: ${t.value}`).join('; ') + ' (IST, New Delhi).' }] : []),
        { question: `Is the ${name} date the same in every city?`, answer: 'Usually yes, but not always. Tithis change at the same instant everywhere, while sunrise, sunset and moonrise depend on your city, so a festival decided by sunrise, evening or moonrise can occasionally fall a day apart in another city, and the puja times shift by minutes. All times here are for New Delhi in IST.' },
      ]
    : [
        { question: `2027 में ${name} कब है?`, answer: `${when}, नई दिल्ली के लिए। ${f.tithiLabel}।` },
        ...(f.timings.length ? [{ question: `${name} 2027 का समय क्या है?`, answer: f.timings.map(t => `${t.label}: ${t.value}`).join('; ') + ' (IST, नई दिल्ली)।' }] : []),
        { question: `क्या ${name} की तारीख़ हर शहर में एक ही होती है?`, answer: 'आम तौर पर हाँ, पर हमेशा नहीं। तिथि हर जगह एक ही क्षण बदलती है, पर सूर्योदय, सूर्यास्त और चंद्रोदय शहर के अनुसार बदलते हैं — इसलिए सूर्योदय, शाम या चंद्रोदय से तय होने वाला पर्व किसी दूसरे शहर में कभी-कभी एक दिन आगे-पीछे हो सकता है और पूजा का समय कुछ मिनट बदलता है। यहाँ सभी समय नई दिल्ली के (IST) हैं।' },
      ];
  const faq = [...computedFaq, ...text.faq.map(x => ({ question: x.q, answer: fillDates(x.a, lang) }))];

  // Event schema (date only; the event takes place across India — Place = India).
  const event = {
    '@context': 'https://schema.org', '@type': 'Event', name: `${en ? meta0.en : meta0.hi} 2027`,
    startDate: f.dateISO, endDate: f.dateISO, eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: 'India', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
    description: meta.description, url: `${SITE}${path}/`, inLanguage: en ? 'en-IN' : 'hi-IN',
    organizer: { '@type': 'Organization', name: 'Hindu tradition (public observance)', url: `${SITE}/festivals/2027/` },
  };
  const crumbs = en
    ? [{ name: 'Festivals 2027', path: '/festivals/2027' }, { name: `${meta0.en} 2027`, path }]
    : [{ name: 'त्योहार 2027', path: '/festivals/2027' }, { name: `${meta0.hi} 2027`, path }];

  // Other festivals of the year, nearest first.
  const all = festivals2027('en');
  const near = all.filter(x => x.slug !== slug).sort((a, b) => Math.abs(Date.parse(a.dateISO) - Date.parse(f.dateISO)) - Math.abs(Date.parse(b.dateISO) - Date.parse(f.dateISO))).slice(0, 8)
    .sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  const others = en
    ? near.map(x => ({ to: `${p2027.festival(x.slug)}/`, label: `${FESTIVALS_2027.find(m => m.slug === x.slug)!.en} 2027` }))
    : FESTIVALS_2027.filter(m => m.hiPage && m.slug !== slug).map(m => ({ to: `${p2027.festivalHi(m.slug)}/`, label: `${m.hi} 2027` }));

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="festival2027-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png" hreflang={hreflang} breadcrumbItems={crumbs} articleSchema={false} />}
      breadcrumb={{
        trail: en ? [{ label: 'Festivals', to: '/festivals/' }, { label: '2027', to: '/festivals/2027/' }] : [{ label: 'त्योहार 2027', to: '/festivals/2027/' }],
        current: `${name} 2027`,
        edition: en ? 'Festival date 2027' : 'त्योहार 2027',
      }}
      footer={{
        tagline: en ? 'Festival dates computed from the real Sun and Moon.' : 'सूर्य और चंद्रमा की वास्तविक स्थिति से गणना की गई त्योहार तिथियाँ।',
        nav: [{ label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }, { label: 'Festivals 2027', to: '/festivals/2027/' }, { label: 'Rashifal 2027', to: '/rashifal-2027/' }],
        note: en ? 'Dates and times are for New Delhi (IST); local Panchangs can differ by a day for sunrise-, evening- or moonrise-based festivals.' : 'तारीख़ और समय नई दिल्ली (IST) के लिए; सूर्योदय, शाम या चंद्रोदय पर आधारित पर्वों में स्थानीय पंचांग एक दिन अलग हो सकते हैं।',
      }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang={lang} extra={[event]} />
      <section className="section" lang={lang}>
        <div className="section-head">
          <div><span className="eyebrow">{en ? 'Festival date · 2027' : 'त्योहार · 2027'}</span><h1 data-testid="festival2027-h1">{meta.h1}</h1></div>
          <p>
            {hasHi && <Link to={en ? `${p2027.festivalHi(slug)}/` : `${p2027.festival(slug)}/`} lang={en ? 'hi' : 'en'} className="underline">{en ? 'हिंदी में पढ़ें' : 'Read in English'}</Link>}
          </p>
        </div>

        <Card className="border-brand-gold/50 bg-brand-gold/10" testId="festival2027-answer">
          <div className="text-sm text-brand-gold-text font-semibold">{en ? `${name} 2027 date` : `${name} 2027 की तारीख़`}</div>
          <div className="text-2xl font-black text-brand-ink mt-1" data-testid="festival2027-date" data-date={f.dateISO}>{when}</div>
          <p className="text-brand-ink mt-2">{answer}</p>
        </Card>

        <H2 id="timings">{en ? `${name} 2027 tithi and puja timings (New Delhi, IST)` : `${name} 2027 — तिथि और पूजा का समय (नई दिल्ली, IST)`}</H2>
        <Card testId="festival2027-timings">
          <KV rows={f.timings.map(t => ({ label: t.label, value: t.value }))} />
          {f.alt && <p className="text-sm text-brand-ink-soft mt-3">{en ? `Bengal (Para-Viddha rule — Navami for at least one muhurta after sunrise): ${dayLabel(f.alt.dateISO, 'en')}.` : `बंगाल (पर-विद्धा नियम — सूर्योदय के बाद कम से कम एक मुहूर्त नवमी): ${dayLabel(f.alt.dateISO, 'hi')}।`}</p>}
          {f.notes.map(n => <p key={n.slice(0, 30)} className="text-sm text-brand-ink-soft mt-3">{n}</p>)}
          <p className="text-xs text-brand-muted mt-3">{en
            ? 'Computed by BornClock’s festival engine from the real positions of the Sun and Moon (sidereal, Lahiri), with New Delhi sunrise, sunset and moonrise; the date follows the classical rule for this festival. In another city the times shift by minutes and, rarely, the date by a day.'
            : 'BornClock के पंचांग इंजन से सूर्य और चंद्रमा की वास्तविक स्थिति (निरयन, लाहिड़ी) और नई दिल्ली के सूर्योदय, सूर्यास्त व चंद्रोदय से गणना; तारीख़ इस पर्व के शास्त्रीय नियम से तय है। दूसरे शहर में समय कुछ मिनट बदलता है और कभी-कभी तारीख़ एक दिन।'}{' '}
            <Link to="/accuracy/" className="underline">{en ? 'How we check our dates →' : 'हम तारीख़ें कैसे जाँचते हैं →'}</Link>
          </p>
        </Card>

        <H2 id="what">{en ? `What is ${name}?` : `${name} क्या है?`}</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed" data-testid="festival2027-what">
          {text.what.map(p => <p key={p.slice(0, 30)}>{fillDates(p, lang)}</p>)}
        </div>

        <H2 id="observed">{en ? `How ${name} is observed` : `${name} कैसे मनाया जाता है`}</H2>
        <ul className="list-disc pl-5 space-y-1.5 text-brand-ink" data-testid="festival2027-observed">
          {text.observed.map(o => <li key={o.slice(0, 30)}>{o}</li>)}
        </ul>

        <H2 id="regional">{en ? 'Regional names and customs' : 'क्षेत्रीय नाम और परंपराएँ'}</H2>
        <ul className="list-disc pl-5 space-y-1 text-brand-ink" data-testid="festival2027-regional">
          {text.regional.map(o => <li key={o}>{o}</li>)}
        </ul>

        <H2 id="related">{en ? 'Related vrats and dates' : 'संबंधित व्रत और तिथियाँ'}</H2>
        <LinkChips testId="festival2027-related" items={text.related.map(x => ({ to: x.to.endsWith('/') ? x.to : `${x.to}/`, label: x.label }))} />

        <H2 id="faq">{en ? `${name} 2027 — questions` : `${name} 2027 — प्रश्नोत्तर`}</H2>
        <FaqList items={faq} testId="festival2027-faq" />

        <p className="text-sm text-brand-muted mt-4">{en ? 'Further reading' : 'अधिक जानकारी'}: <a href={text.more.url} className="underline" rel="noopener" target="_blank">{text.more.label}</a></p>

        <H2 id="more">{en ? 'More festival dates in 2027' : '2027 के और त्योहार'}</H2>
        <LinkChips testId="festival2027-others" items={others} />
        <p className="text-sm text-brand-muted mt-4">
          <Link to="/hindu-calendar-2027/" className="underline">{en ? 'Hindu calendar 2027' : 'हिंदू कैलेंडर 2027'}</Link>
          {' · '}<Link to="/festivals/2027/" className="underline">{en ? 'Full festival & vrat calendar 2027' : 'पूरा त्योहार व व्रत कैलेंडर 2027'}</Link>
          {' · '}<Link to="/ekadashi-2027/" className="underline">{en ? 'Ekadashi 2027' : 'एकादशी 2027'}</Link>
          {' · '}<Link to={en ? '/rashifal-2027/' : '/hi/rashifal-2027/'} className="underline">{en ? 'Rashifal 2027' : 'राशिफल 2027'}</Link>
        </p>
      </section>
    </PajPage>
  );
}
