/**
 * B14 — the 2027 hubs: /rashifal-2027, /hi/rashifal-2027 (Vedic, by Moon sign) and
 * /horoscope-2027 (Western, by Sun sign). Each card's verdict and best stretch are computed
 * from the same reading as the sign page (src/lib/year2027/reading.ts).
 */
import { OtherLanguages } from '@/components/lang/OtherLanguages';
import { useMemo } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { RASHIS } from '@/lib/vedic/rashifal';
import { computeYearReading, type System } from '@/lib/year2027/reading';
import { computeYearSky } from '@/lib/year2027/sky';
import { longDate, range, span, shortDate, TONE_WORD, type Lang } from '@/lib/year2027/text';
import { WESTERN_SIGNS, WESTERN_DATES } from '@/lib/year2027/western';
import { p2027, year2027Meta, RASHI_NAME_EN, RASHI_NAME_HI, Y2027_PUBLISHED, Y2027_UPDATED } from '@/lib/year2027/meta.js';
import { ToneBadge, H2, Card, FaqList, YearJsonLd } from './parts';

const SITE = 'https://bornclock.com';

export default function YearHubPage({ system, lang = 'en' }: { system: System; lang?: Lang }) {
  const western = system === 'western';
  const L: Lang = western ? 'en' : lang;
  const path = western ? p2027.horoscopeHub : lang === 'hi' ? p2027.rashifalHubHi : p2027.rashifalHub;
  const meta = year2027Meta(path)!;
  const readings = useMemo(() => Array.from({ length: 12 }, (_, i) => computeYearReading(i, system, L)), [system, L]);
  const sky = useMemo(() => computeYearSky(2027, western ? 'tropical' : 'sidereal'), [western]);
  const signName = (s: number) => (western ? WESTERN_SIGNS[s] : L === 'hi' ? RASHIS[s].hindi : `${RASHIS[s].sanskrit} (${RASHIS[s].english})`);
  const moves = (p: 'Jupiter' | 'Saturn' | 'Rahu' | 'Ketu') => sky.segs[p]?.map(s => `${signName(s.sign)} ${span(s.from, s.to, L)}`).join(L === 'hi' ? ', फिर ' : ', then ');
  const pathFor = (i: number) => (western ? p2027.horoscope(i) : L === 'hi' ? p2027.rashifalHi(i) : p2027.rashifal(i));
  const nameFor = (i: number) => (western ? WESTERN_SIGNS[i] : L === 'hi' ? RASHI_NAME_HI[i] : RASHI_NAME_EN[i]);
  const sadeSati = readings.filter(r => r.saturn.status === 'sadeSati').map(r => nameFor(r.signIndex));
  const dhaiya = readings.filter(r => r.saturn.status === 'dhaiya').map(r => nameFor(r.signIndex));

  const faq = western
    ? [
        { question: 'Which planets shape 2027?', answer: `Jupiter moves through ${moves('Jupiter')}; Saturn stays in ${moves('Saturn')}. There are ${sky.eclipses.length} eclipses and ${sky.retro.filter(x => x.planet === 'Mercury').length} Mercury retrograde periods.` },
        { question: 'Is this horoscope based on my Sun sign?', answer: 'Yes. Western horoscopes read the year from your Sun sign, counting each planet’s “solar house” from it. If you follow Vedic astrology, read the Rashifal 2027 for your Moon sign instead.' },
        { question: 'When are the Mercury retrogrades of 2027?', answer: sky.retro.filter(x => x.planet === 'Mercury').map(x => range(x.from, x.to, 'en')).join(', ') + '.' },
        { question: 'How is it calculated?', answer: 'From the real tropical positions of the planets through 2027, split at every exact sign change, and read by classical house rules. It describes tendencies, not certainties.' },
      ]
    : L === 'en'
      ? [
          { question: 'Which rashis have Sade Sati in 2027?', answer: `${sadeSati.join(', ')} (Saturn in the 12th, 1st or 2nd sign from the Moon for part or all of the year). Shani Dhaiya: ${dhaiya.join(', ') || 'none'}. Exact dates are on each rashi’s page.` },
          { question: 'Where are Jupiter, Saturn and Rahu–Ketu in 2027?', answer: `Jupiter: ${moves('Jupiter')}. Saturn: ${moves('Saturn')}. Rahu: ${moves('Rahu')}; Ketu: ${moves('Ketu')} (sidereal, dates IST).` },
          { question: 'Is rashifal 2027 based on the Moon sign or Sun sign?', answer: 'On the Moon sign (Chandra rashi), as Vedic astrology reads it. If you don’t know your Moon sign, generate your free Kundli — it shows it at once.' },
          { question: 'How many eclipses are there in 2027?', answer: `${sky.eclipses.length}: ${sky.eclipses.map(e => `${e.name} on ${longDate(e.istDate, 'en')}`).join('; ')}.` },
          { question: 'How is rashifal 2027 calculated?', answer: 'It is rigorously computed from the real 2027 positions of the planets (sidereal, Lahiri ayanamsa), split at their exact sign changes and read by classical gochar rules from each Moon sign. It describes tendencies — not certainties — and never predicts specific events.' },
        ]
      : [
          { question: '2027 में किन राशियों पर साढ़ेसाती है?', answer: `${sadeSati.join(', ')} (वर्ष के कुछ या पूरे समय शनि चंद्र राशि से 12वें, पहले या दूसरे भाव में)। शनि ढैया: ${dhaiya.join(', ') || 'कोई नहीं'}। सटीक तारीख़ें हर राशि के पेज पर हैं।` },
          { question: '2027 में गुरु, शनि और राहु-केतु कहाँ रहेंगे?', answer: `गुरु: ${moves('Jupiter')}। शनि: ${moves('Saturn')}। राहु: ${moves('Rahu')}; केतु: ${moves('Ketu')} (निरयन, तारीख़ें IST)।` },
          { question: 'राशिफल 2027 चंद्र राशि से है या सूर्य राशि से?', answer: 'चंद्र राशि से, जैसा वैदिक ज्योतिष में पढ़ा जाता है। अपनी चंद्र राशि नहीं पता तो मुफ़्त कुंडली बनाएँ — वह तुरंत बता देती है।' },
          { question: '2027 में कितने ग्रहण हैं?', answer: `${sky.eclipses.length}: ${sky.eclipses.map(e => longDate(e.istDate, 'hi')).join(', ')}।` },
          { question: 'राशिफल 2027 कैसे बनाया गया है?', answer: '2027 में ग्रहों की वास्तविक स्थिति (निरयन, लाहिड़ी अयनांश) से सटीक गणना, राशि-परिवर्तन की सटीक तारीख़ों पर बाँटकर, हर चंद्र राशि से शास्त्रीय गोचर नियमों से पढ़ा गया है। यह प्रवृत्तियाँ बताता है — निश्चितता नहीं — और किसी ख़ास घटना की भविष्यवाणी नहीं करता।' },
        ];

  const crumbs = [{ name: western ? 'Horoscope 2027' : L === 'hi' ? 'राशिफल 2027' : 'Rashifal 2027', path }];
  const hreflang = western ? undefined : [
    { lang: 'en', url: `${SITE}${p2027.rashifalHub}/` }, { lang: 'hi', url: `${SITE}${p2027.rashifalHubHi}/` }, { lang: 'x-default', url: `${SITE}${p2027.rashifalHub}/` },
  ];
  const intro = western
    ? `2027 at a glance: Jupiter moves through ${moves('Jupiter')}, Saturn stays in ${moves('Saturn')}, and there are ${sky.eclipses.length} eclipses. Pick your Sun sign for the full forecast — love, career, money, health, month-by-month notes and the best and hardest stretches of the year, all computed from the real planetary positions.`
    : L === 'en'
      ? `The year’s big story: Jupiter moves through ${moves('Jupiter')}; Saturn through ${moves('Saturn')}; Rahu stays in ${moves('Rahu')} and Ketu in ${moves('Ketu')}. Sade Sati runs for ${sadeSati.join(', ')}. Pick your Moon sign (rashi) for the full computed forecast.`
      : `इस वर्ष की मुख्य बातें: गुरु ${moves('Jupiter')}; शनि ${moves('Saturn')}; राहु ${moves('Rahu')} और केतु ${moves('Ketu')}। साढ़ेसाती: ${sadeSati.join(', ')}। पूरा भविष्यफल पढ़ने के लिए अपनी चंद्र राशि चुनें।`;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="year2027-hub"
      seo={(
        <>
          <SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article" ogImage="https://bornclock.com/og/vedic.png"
            publishedTime={Y2027_PUBLISHED} modifiedTime={Y2027_UPDATED} hreflang={hreflang}
            breadcrumbItems={crumbs} articleSchema={false} />
        </>
      )}
      breadcrumb={{
        trail: L === 'hi' ? [{ label: 'राशिफल', to: '/hi/rashifal/' }] : [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }],
        current: western ? 'Horoscope 2027' : L === 'hi' ? 'राशिफल 2027' : 'Rashifal 2027',
        edition: '2027',
      }}
      footer={{
        tagline: 'Computed yearly forecasts from the real 2027 sky.',
        nav: [{ label: 'Rashifal 2027', to: `${p2027.rashifalHub}/` }, { label: 'राशिफल 2027', to: `${p2027.rashifalHubHi}/` }, { label: 'Horoscope 2027', to: `${p2027.horoscopeHub}/` }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }],
        note: 'Readings follow the astrological tradition — reflective guidance, not certainty.',
      }}
    >
      <YearJsonLd headline={meta.title} description={meta.description} path={path} crumbs={crumbs} faq={faq} lang={L} />
      <section className="section" lang={L}>
        <div className="section-head">
          <div><span className="eyebrow">2027</span><h1 data-testid="year2027-h1">{meta.h1}</h1></div>
          <p data-testid="year2027-hub-intro">{intro}{' '}
            {!western && <Link to={L === 'en' ? `${p2027.rashifalHubHi}/` : `${p2027.rashifalHub}/`} lang={L === 'en' ? 'hi' : 'en'} className="underline">{L === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}</Link>}
          </p>
        </div>

        {!western && <OtherLanguages label={L === 'en' ? 'Read this in' : 'दूसरी भाषाओं में'} />}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="year2027-hub-grid">
          {readings.map(r => (
            <Link key={r.signIndex} to={`${pathFor(r.signIndex)}/`} className="block rounded-xl border border-brand-line bg-brand-paper p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between gap-2 !mb-1">
                <span className="font-semibold text-brand-ink">{western ? WESTERN_SIGNS[r.signIndex] : L === 'hi' ? `${RASHI_NAME_HI[r.signIndex]} राशिफल 2027` : `${RASHI_NAME_EN[r.signIndex]} Rashifal 2027`}</span>
                <ToneBadge tone={r.tone} label={TONE_WORD[L][r.tone]} />
              </div>
              <div className="text-xs text-brand-muted !mb-1">{western ? WESTERN_DATES[r.signIndex] : `${RASHIS[r.signIndex].english} · ${L === 'hi' ? 'चंद्र राशि' : 'Moon sign'}`}</div>
              <p className="text-sm text-brand-ink-soft">
                {r.best[0] ? `${L === 'hi' ? 'सबसे अच्छा समय' : 'Best stretch'}: ${range(r.best[0].from, r.best[0].to, L)}. ` : ''}
                {r.saturn.status === 'sadeSati' ? (L === 'hi' ? 'साढ़ेसाती जारी। ' : 'Sade Sati year. ') : r.saturn.status === 'dhaiya' ? (L === 'hi' ? 'शनि ढैया। ' : 'Shani Dhaiya. ') : ''}
                {L === 'hi' ? 'शुभ महीने' : 'Strongest months'}: {r.lucky.months.join(', ')}.
              </p>
            </Link>
          ))}
        </div>

        <H2 id="year">{western ? 'The 2027 sky in one table' : L === 'hi' ? '2027 के मुख्य गोचर' : 'The main transits of 2027'}</H2>
        <Card testId="year2027-hub-sky">
          <ul className="space-y-1 text-sm text-brand-ink">
            {(western ? (['Jupiter', 'Saturn'] as const) : (['Jupiter', 'Saturn', 'Rahu', 'Ketu'] as const)).map(p => (
              <li key={p}><strong>{L === 'hi' ? { Jupiter: 'गुरु', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' }[p] : p}:</strong> {moves(p)}</li>
            ))}
            <li><strong>{L === 'hi' ? 'वक्री' : 'Retrograde'}:</strong> {sky.retro.map(x => `${L === 'hi' ? { Mercury: 'बुध', Venus: 'शुक्र', Mars: 'मंगल', Jupiter: 'गुरु', Saturn: 'शनि' }[x.planet as 'Mercury'] : x.planet} ${x.from.startsWith('2027') ? range(x.from, x.to, L) : `${longDate(x.from, L)} – ${shortDate(x.to, L)}`}`).join('; ')}</li>
          </ul>
        </Card>

        <H2 id="faq">{L === 'hi' ? 'प्रश्नोत्तर' : 'Questions'}</H2>
        <FaqList items={faq} testId="year2027-hub-faq" />

        <p className="text-sm text-brand-muted !mt-6" data-testid="year2027-hub-links">
          {L === 'hi' ? 'यह भी देखें' : 'Also for 2027'}: <Link to="/hindu-calendar-2027/" className="underline">{L === 'hi' ? 'हिंदू कैलेंडर 2027' : 'Hindu calendar 2027'}</Link>
          {' · '}<Link to="/festivals/2027/diwali/" className="underline">{L === 'hi' ? 'दिवाली 2027' : 'Diwali 2027'}</Link>
          {' · '}<Link to="/festivals/2027/holi/" className="underline">{L === 'hi' ? 'होली 2027' : 'Holi 2027'}</Link>
          {' · '}<Link to="/eclipses/2027/" className="underline">{L === 'hi' ? 'ग्रहण 2027' : 'Eclipses 2027'}</Link>
          {' · '}<Link to="/numerology-2027/" className="underline">{L === 'hi' ? 'अंक ज्योतिष 2027' : 'Numerology 2027'}</Link>
          {' · '}<Link to="/chinese-horoscope-2027/" className="underline">{L === 'hi' ? 'चीनी राशिफल 2027' : 'Chinese horoscope 2027'}</Link>
          {' · '}<Link to={western ? `${p2027.rashifalHub}/` : `${p2027.horoscopeHub}/`} className="underline">{western ? 'Rashifal 2027 (Vedic)' : L === 'hi' ? 'Horoscope 2027 (Western)' : 'Horoscope 2027 (Western, Sun sign)'}</Link>
          {' · '}<Link to="/transit/saturn/2027/" className="underline">{L === 'hi' ? 'शनि गोचर 2027' : 'Saturn transit 2027'}</Link>
        </p>
      </section>
    </PajPage>
  );
}
