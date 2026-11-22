/**
 * B18 — free Lal Kitab Kundli at /lal-kitab (English) and /hi/lal-kitab (Hindi).
 *
 * The birth chart comes from the same /api/kundali engine as /kundali (true-Lahiri sidereal);
 * the Lal Kitab layer (src/lib/vedic/lalKitab) keeps each planet in its house from the Lagna,
 * reads house 1 as Aries, and adds pakka ghar, uchcha/neech, sleeping planets and houses,
 * kaayam/dharmi planets, teva types, masnui planets, the nine Rin, this year's Varshphal and
 * simple optional remedies. Arriving from /kundali carries the birth details in the URL
 * (?dob=&time=&place=&lat=&lon=&tz=[&tzid=&name=]), exactly like /kundali's own carry-forward.
 */
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { AutoTranslatedNotice } from '@/components/AutoTranslatedNotice';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { fetchKundali, type KundaliData } from '@/services/kundaliService';
import { printHtmlViaIframe } from '@/lib/pdf/printHtml';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import {
  buildLalKitabChart, lalKitabVarshphal, runningYearOfLife, cyclePlanetAt, ageInYears,
  planetName, reading, remedyFor, toneOf, TONE_LABEL, rinText, TEVA_TEXT, DIGNITY_LABEL, label, houseTheme,
  REMEDY_DAYS, CYCLE_35, type Lang, type LkChart, type LkPlacement,
} from '@/lib/vedic/lalKitab';
import { LalKitabGuide } from '@/content/guides/LalKitabGuide';
import { RASHI_HI } from '@/content/guides/shared';

const KundaliChart = lazy(() => import('@/components/KundaliChart').then(m => ({ default: m.KundaliChart })));
const SITE = 'https://bornclock.com';

export default function LalKitabPage({ lang = 'en' }: { lang?: Lang }) {
  const hi = lang === 'hi';
  const T = (en: string, h: string) => (hi ? h : en);
  const path = hi ? '/hi/lal-kitab' : '/lal-kitab';
  const META = GUIDE_META[path];
  const { profile, loaded, isFull } = useSavedProfile();
  const location = useLocation();
  const autoRan = useRef(false);

  const [data, setData] = useState<KundaliData | null>(null);
  const [birth, setBirth] = useState<{ dob: string; time: string; place: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dateError, setDateError] = useState('');
  const [usingDifferent, setUsingDifferent] = useState(false);

  const carried = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(sp.get('dob') || '') ? sp.get('dob')! : '';
    const time = /^\d{2}:\d{2}$/.test(sp.get('time') || '') ? sp.get('time')! : '';
    const lat = sp.get('lat'), lon = sp.get('lon'), tz = sp.get('tz'), tzid = sp.get('tzid');
    const zone = tzid ? { timezone: tzid, manualTimezone: true } : {};
    const ok = !!dob && !!time && lat != null && lon != null && tz != null && Number.isFinite(+lat) && Number.isFinite(+lon) && Number.isFinite(+tz);
    return ok ? { dob, time, name: sp.get('name') || undefined, city: { name: sp.get('place') || '', lat: +lat!, lon: +lon!, tz: +tz!, ...zone } } as BirthDetails : null;
  }, [location.search]);

  const usingSaved = isFull && !usingDifferent && !carried;
  const initial = carried
    ? { dob: carried.dob, time: carried.time, city: carried.city, name: carried.name }
    : usingSaved && profile ? { dob: profile.dob, time: profile.time, city: profile.city, name: profile.name } : undefined;

  const generate = async (d: BirthDetails) => {
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (d.dob > todayIso) { setData(null); setDateError(T('A birth date cannot be in the future.', 'जन्म तिथि भविष्य की नहीं हो सकती।')); return; }
    if (d.dob < '1800-01-01') { setData(null); setDateError(T('Please enter a birth year from 1800 onwards.', 'कृपया 1800 या उसके बाद का जन्म वर्ष डालें।')); return; }
    setDateError(''); setLoading(true); setFailed(false);
    try {
      const k = await fetchKundali(d.dob, d.time, d.city);
      setData(k);
      setBirth({ dob: d.dob, time: d.time, place: d.city.name, name: d.name ?? '' });
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (autoRan.current || !loaded) return;
    if (carried) { autoRan.current = true; setUsingDifferent(true); void generate(carried); return; }
    if (isFull && profile) { autoRan.current = true; void generate({ dob: profile.dob, time: profile.time!, city: profile.city!, name: profile.name }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, carried, isFull, profile]);

  const chart: LkChart | null = useMemo(() => (data ? buildLalKitabChart(data.planets) : null), [data]);
  const today = useMemo(() => new Date(), []);
  const year = birth ? runningYearOfLife(birth.dob, today) : 0;
  const varshphal = chart && data ? lalKitabVarshphal(data.planets, year) : null;
  const cycle = birth ? cyclePlanetAt(ageInYears(birth.dob, today)) : null;
  const care = chart ? chart.placements.filter(p => toneOf(p.planet, p.house) === 'care' || p.debilitated) : [];

  const downloadPdf = async () => {
    if (!chart) return;
    const { buildLalKitabPdfHtml } = await import('@/lib/pdf/lalKitabPdfHtml');
    printHtmlViaIframe(buildLalKitabPdfHtml(chart, varshphal, { ...birth, lang }));
  };

  const badges = (p: LkPlacement) => ([
    p.pakkaGhar && DIGNITY_LABEL.pakka, p.exalted && DIGNITY_LABEL.exalted, p.debilitated && DIGNITY_LABEL.debilitated,
    p.sleeping && DIGNITY_LABEL.sleeping, p.kaayam && DIGNITY_LABEL.kaayam, p.dharmi && DIGNITY_LABEL.dharmi,
  ].filter(Boolean) as Array<[string, string]>).map(b => label(b, lang));

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId={hi ? 'hi-lal-kitab-page' : 'lal-kitab-page'}
      seo={<SEO title={META.title} description={META.description} canonicalUrl={path} ogType="website"
        hreflang={[{ lang: 'en', url: `${SITE}/lal-kitab/` }, { lang: 'hi', url: `${SITE}/hi/lal-kitab/` }]} />}
      breadcrumb={{ trail: [{ label: T('Vedic Astrology', 'वैदिक ज्योतिष'), to: '/vedic-astrology/' }], current: T('Lal Kitab Kundli', 'लाल किताब कुंडली'), edition: T('Lal Kitab · houses from Lagna', 'लाल किताब · लग्न से घर') }}
      footer={{
        tagline: T('Lal Kitab Kundli — your chart read the Lal Kitab way, with simple, optional remedies.', 'लाल किताब कुंडली — आपकी कुंडली लाल किताब के तरीके से, सरल और वैकल्पिक उपायों के साथ।'),
        nav: [
          { label: T('Free Kundli', 'मुफ़्त कुंडली'), to: '/kundali/' },
          { label: T('Remedies (Upay)', 'उपाय'), to: hi ? '/hi/upay/' : '/remedies/' },
          { label: T('Vedic Astrology', 'वैदिक ज्योतिष'), to: '/vedic-astrology/' },
          { label: T('हिंदी में', 'English'), to: hi ? '/lal-kitab/' : '/hi/lal-kitab/' },
          { label: T('Privacy', 'गोपनीयता'), to: '/privacy/' },
        ],
        note: T('© 2026 BornClock · Vedic astrology, computed with care.', '© 2026 BornClock · वैदिक ज्योतिष, सावधानी से गणना।'),
      }}
    >
      <section className="section" lang={hi ? 'hi' : undefined}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{T('Lal Kitab', 'लाल किताब')}</span>
            <h1>{META.h1}</h1>
          </div>
          <p data-testid="lk-answer">{T(
            'Enter your date, time and place of birth to see your Lal Kitab chart: which house each planet sits in, its pakka ghar, exalted or debilitated houses, sleeping planets and houses, any of the nine Rin (karmic debts), this year’s Varshphal, and simple, free remedies — all calm and optional.',
            'अपनी जन्म तिथि, समय और स्थान डालें और देखें अपनी लाल किताब कुंडली: हर ग्रह किस घर में है, उसका पक्का घर, उच्च-नीच घर, सोये ग्रह और घर, नौ ऋणों में से कोई ऋण, इस साल का वर्षफल और सरल, मुफ़्त उपाय — शांत और वैकल्पिक।',
          )}</p>
        </div>
        {hi && <AutoTranslatedNotice lang="hi" />}
        <TrustStrip
          claim={T('The planets come from the same engine as our Kundali — in our October 2026 tests, Lagna and planet positions for 22 births were within 1 arc-minute of the Swiss Ephemeris. The Lal Kitab rules are listed with their sources on this page.', 'ग्रह वही इंजन देता है जो हमारी कुंडली में है — अक्टूबर 2026 के परीक्षण में 22 जन्मों के लग्न और ग्रह स्विस एफ़ेमेरिस से 1 कला के भीतर मिले। लाल किताब के नियम स्रोत के साथ इसी पेज पर दिए हैं।')}
          href="/accuracy/" linkLabel={T('How we check accuracy', 'हम सटीकता कैसे जाँचते हैं')} />

        {loaded && usingSaved && (
          <div data-testid="lk-saved-banner" className="result-annotation" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <span>★ {T('Using your saved birth details', 'आपका सहेजा जन्म विवरण')} — <strong>{profile!.dob}</strong>, {profile!.time}, {profile!.city?.name}</span>
            <button type="button" className="text-button" onClick={() => { setUsingDifferent(true); setData(null); autoRan.current = true; }}>{T('Use different details', 'दूसरा विवरण डालें')}</button>
          </div>
        )}
        {carried && (
          <div data-testid="lk-carried-banner" className="result-annotation" style={{ marginTop: 16 }}>
            ★ {T('Using the birth details from your Kundali', 'आपकी कुंडली वाला जन्म विवरण')} — <strong>{carried.dob}</strong>, {carried.time}{carried.city.name ? `, ${carried.city.name}` : ''}.
          </div>
        )}

        <div className="form-band" style={{ marginTop: 16 }}>
          <div><h3>{T('Birth details', 'जन्म विवरण')}</h3><p className="small muted">{T('Birth time matters: Lal Kitab reads planets by house, and houses are counted from the Lagna.', 'जन्म समय ज़रूरी है: लाल किताब ग्रहों को घर से पढ़ती है, और घर लग्न से गिने जाते हैं।')}</p></div>
          <BirthDetailsForm
            key={usingSaved ? 'saved' : carried ? 'carried' : 'new'}
            testIdPrefix="lk" lang={lang} initial={initial}
            submitLabel={T('Show my Lal Kitab chart →', 'मेरी लाल किताब कुंडली दिखाएँ →')}
            loadingLabel={T('Calculating…', 'गणना हो रही है…')}
            loading={loading} onSubmit={generate}
          />
        </div>
        {dateError && <p data-testid="lk-date-error" className="subtle" style={{ marginTop: 16 }}>{dateError}</p>}
        {failed && <p className="subtle" style={{ marginTop: 16 }}>{T('The chart service is unavailable just now. Please try again shortly.', 'कुंडली सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर कोशिश करें।')}</p>}
      </section>

      {data && chart && (
        <div lang={hi ? 'hi' : undefined}>
          <section className="section white" data-testid="lk-result">
            <div className="section-head"><div><span className="eyebrow">{T('Your teva', 'आपका टेवा')}</span><h2>{birth?.name ? T(`${birth.name}’s Lal Kitab chart`, `${birth.name} की लाल किताब कुंडली`) : T('Your Lal Kitab chart', 'आपकी लाल किताब कुंडली')}</h2></div></div>
            <div className="chart-with-stats">
              <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
                <KundaliChart lagnaSignIndex={1} style="north" label={T('Lal Kitab chart', 'लाल किताब कुंडली')}
                  planets={chart.placements.map(p => ({ name: p.planet, house: p.house, signIndex: p.house }))} />
              </Suspense>
              <p data-testid="lk-chart-legend" className="text-xs text-muted-foreground" style={{ maxWidth: 340 }}>
                {T(
                  `How to read it: the top-centre diamond is house 1, counted from your Lagna (${data.lagna.sign}). In Lal Kitab the signs are set aside — house 1 is always read as Aries, house 2 as Taurus … house 12 as Pisces — so the small numbers are simply the house numbers. Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra Rahu · Ke Ketu.`,
                  `कैसे पढ़ें: ऊपर बीच का खाना पहला घर है, जो आपके लग्न (${RASHI_HI[data.lagna.signIndex - 1] ?? data.lagna.sign}) से गिना गया है। लाल किताब में राशियाँ अलग रख दी जाती हैं — पहला घर हमेशा मेष, दूसरा वृषभ … बारहवाँ मीन — इसलिए छोटे अंक बस घर-संख्या हैं। Su सूर्य · Mo चंद्र · Ma मंगल · Me बुध · Ju गुरु · Ve शुक्र · Sa शनि · Ra राहु · Ke केतु।`,
                )}
              </p>
              <div className="chart-stats">
                <div className="chart-stat"><small>{T('Sleeping planets', 'सोये ग्रह')}</small><strong data-testid="lk-sleeping-count">{chart.placements.filter(p => p.sleeping).length}</strong><span>{T('of 9', '9 में से')}</span></div>
                <div className="chart-stat"><small>{T('Rin (debts)', 'ऋण')}</small><strong data-testid="lk-rin-count">{chart.rins.length}</strong><span>{T('of 9', '9 में से')}</span></div>
                <div className="chart-stat"><small>{T('Varshphal year', 'वर्षफल वर्ष')}</small><strong>{year}</strong><span>{T('of life', 'जीवन का')}</span></div>
              </div>
            </div>

            <div className="table-scroll" style={{ marginTop: 16 }}>
              <table data-testid="lk-planet-table" className="data-table" style={{ width: '100%' }}>
                <thead><tr><th>{T('Planet', 'ग्रह')}</th><th>{T('House', 'घर')}</th><th>{T('Area of life', 'जीवन-क्षेत्र')}</th><th>{T('Lal Kitab status', 'लाल किताब स्थिति')}</th></tr></thead>
                <tbody>
                  {chart.placements.map(p => (
                    <tr key={p.planet} data-planet={p.planet}>
                      <td>{planetName(p.planet, lang)}</td>
                      <td>{p.house}</td>
                      <td>{houseTheme(p.house, lang)}</td>
                      <td>{badges(p).join(' · ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground" style={{ marginTop: 8 }}>{T(
              'Pakka ghar = the planet’s permanent home in Lal Kitab. Exalted / debilitated = the house where it is strongest / weakest (Lal Kitab counts these by house, not sign). Sleeping = it looks at no other planet, so its results wait to be woken (never in its pakka ghar). Kaayam = no enemy sits with it or looks at it, so it works steadily. Dharmi = turned mild and pious.',
              'पक्का घर = लाल किताब में ग्रह का स्थायी घर। उच्च / नीच = वह घर जहाँ ग्रह सबसे बलवान / कमज़ोर है (लाल किताब इन्हें घर से गिनती है, राशि से नहीं)। सोया = वह किसी दूसरे ग्रह को नहीं देखता, इसलिए उसका फल जागने का इंतज़ार करता है (पक्के घर में कभी नहीं)। कायम = न कोई शत्रु साथ है न उसे देखता है, इसलिए लगातार फल देता है। धर्मी = सौम्य और धार्मिक हो गया ग्रह।',
            )}</p>
          </section>

          <section className="section" data-testid="lk-readings">
            <div className="section-head">
              <div><span className="eyebrow">{T('Planet in house', 'घर में ग्रह')}</span><h2>{T('What each placement means in Lal Kitab', 'लाल किताब में हर स्थिति का अर्थ')}</h2></div>
              <p>{T('Lal Kitab judges a planet by its house alone. Traditional guidance for reflection — never a certainty.', 'लाल किताब ग्रह को केवल उसके घर से परखती है। चिंतन के लिए पारंपरिक मार्गदर्शन — कोई निश्चितता नहीं।')}</p>
            </div>
            <div className="honesty-items" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {chart.placements.map(p => {
                const tone = toneOf(p.planet, p.house);
                return (
                  <div key={p.planet} data-testid="lk-reading" data-tone={tone}>
                    <h3>{planetName(p.planet, lang)} {T('in house', 'घर')} {p.house} <span className="text-xs font-semibold text-brand-gold-ink">· {label(TONE_LABEL[tone], lang)}</span></h3>
                    <p>{reading(p.planet, p.house, lang)}</p>
                    {(tone === 'care' || p.debilitated) && (
                      <p className="small"><strong>{T('Optional upay', 'वैकल्पिक उपाय')}:</strong> {remedyFor(p.planet, p.house, lang)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="section white" data-testid="lk-houses-teva">
            <div className="section-head"><div><span className="eyebrow">{T('Houses & chart type', 'घर और टेवा')}</span><h2>{T('Sleeping houses, teva type and masnui planets', 'सोये घर, टेवा का प्रकार और मसनुई ग्रह')}</h2></div></div>
            <h3>{T('Sleeping houses (soya ghar)', 'सोये घर')}</h3>
            <p className="small muted">{T('A house sleeps when no planet sits in it and no planet looks at it; its area of life stays quiet until a planet, a yearly turn or a remedy wakes it.', 'जिस घर में न कोई ग्रह हो और न कोई ग्रह उसे देखे, वह सोया माना जाता है; उसका जीवन-क्षेत्र तब तक शांत रहता है जब तक कोई ग्रह, वर्षफल या उपाय उसे जगाए नहीं।')}</p>
            <ul data-testid="lk-sleeping-houses" className="list-disc pl-5" style={{ marginTop: 6 }}>
              {chart.sleepingHouses.length ? chart.sleepingHouses.map(h => <li key={h}>{T('House', 'घर')} {h} — {houseTheme(h, lang)}</li>) : <li>{T('None — every house is either occupied or looked at.', 'कोई नहीं — हर घर में या तो ग्रह है या उसे कोई ग्रह देखता है।')}</li>}
            </ul>

            <h3 style={{ marginTop: 18 }}>{T('Teva type', 'टेवा का प्रकार')}</h3>
            <ul data-testid="lk-teva" className="list-disc pl-5" style={{ marginTop: 6 }}>
              {(Object.keys(chart.teva) as Array<keyof LkChart['teva']>).map(k => (
                <li key={k}><strong>{label(TEVA_TEXT[k].name, lang)}</strong> — {chart.teva[k] ? <><strong>{T('yes', 'हाँ')}</strong>. {label(TEVA_TEXT[k].meaning, lang)}</> : T('no', 'नहीं')} <span className="text-xs text-muted-foreground">({label(TEVA_TEXT[k].rule, lang)})</span></li>
              ))}
            </ul>

            <h3 style={{ marginTop: 18 }}>{T('Masnui (artificial) planets', 'मसनुई (बनावटी) ग्रह')}</h3>
            <p className="small muted">{T('In Lal Kitab two planets in one house can behave like a third — for example Sun + Venus together act like Jupiter.', 'लाल किताब में एक घर के दो ग्रह मिलकर तीसरे ग्रह जैसा व्यवहार कर सकते हैं — जैसे सूर्य + शुक्र मिलकर गुरु जैसे।')}</p>
            <ul data-testid="lk-masnui" className="list-disc pl-5" style={{ marginTop: 6 }}>
              {chart.masnui.length ? chart.masnui.map((m, i) => (
                <li key={i}>{T('House', 'घर')} {m.house}: {planetName(m.pair[0], lang)} + {planetName(m.pair[1], lang)} → {T('acts like', 'जैसे')} {planetName(m.acts, lang)}{m.quality ? ` (${label(m.quality === 'exalted' ? DIGNITY_LABEL.exalted : DIGNITY_LABEL.debilitated, lang)})` : ''}</li>
              )) : <li>{T('None in this chart.', 'इस कुंडली में कोई नहीं।')}</li>}
            </ul>
          </section>

          <section className="section" data-testid="lk-rin">
            <div className="section-head">
              <div><span className="eyebrow">{T('Rin', 'ऋण')}</span><h2>{T('Lal Kitab Rin (karmic debts)', 'लाल किताब के ऋण')}</h2></div>
              <p>{T('A Rin is read when a planet’s own house holds its enemies — a family duty to honour, not a punishment. Lal Kitab’s remedy is done together: an equal small share from each blood relative, used on one day.', 'जब किसी ग्रह के अपने घर में उसके शत्रु बैठे हों, तो ऋण पढ़ा जाता है — यह निभाने वाला पारिवारिक कर्तव्य है, सज़ा नहीं। लाल किताब का उपाय मिलकर होता है: हर सगे संबंधी का बराबर छोटा हिस्सा, एक ही दिन में।')}</p>
            </div>
            {chart.rins.length ? (
              <div className="honesty-items" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {chart.rins.map(r => { const t = rinText(r.key, lang); return (
                  <div key={r.key} data-testid={`lk-rin-${r.key}`}>
                    <h3>{t.name}</h3>
                    <p>{t.meaning} {T('In your chart', 'आपकी कुंडली में')}: {r.causes.map(c => `${planetName(c.planet, lang)} ${T('in house', 'घर')} ${c.house}`).join(', ')}.</p>
                    <p className="small"><strong>{T('Optional remedy', 'वैकल्पिक उपाय')}:</strong> {t.remedy}</p>
                  </div>
                ); })}
              </div>
            ) : <p data-testid="lk-rin-none">{T('None of the nine Lal Kitab debts is indicated in this chart.', 'इस कुंडली में लाल किताब के नौ ऋणों में से कोई संकेत नहीं है।')}</p>}
          </section>

          {varshphal && (
            <section className="section white" data-testid="lk-varshphal">
              <div className="section-head">
                <div><span className="eyebrow">{T('Varshphal', 'वर्षफल')}</span><h2>{T(`This year: year ${year} of your life`, `इस साल: आपके जीवन का ${year}वाँ वर्ष`)}</h2></div>
                <p>{T('Lal Kitab’s yearly chart moves the planets of each birth house to a new house every year of life, from a fixed 120-year table. Year 1 runs from birth to the first birthday.', 'लाल किताब का वार्षिक चार्ट एक निश्चित 120 वर्ष की तालिका से हर साल हर जन्म-घर के ग्रहों को नए घर में रखता है। पहला वर्ष जन्म से पहले जन्मदिन तक होता है।')}</p>
              </div>
              <div className="table-scroll">
                <table className="data-table" style={{ width: '100%' }}>
                  <thead><tr><th>{T('Planet', 'ग्रह')}</th><th>{T('Birth house', 'जन्म का घर')}</th><th>{T('House this year', 'इस वर्ष का घर')}</th><th>{T('Area this year', 'इस वर्ष का क्षेत्र')}</th></tr></thead>
                  <tbody>{varshphal.placements.map(p => (
                    <tr key={p.planet}><td>{planetName(p.planet, lang)}</td><td>{p.natalHouse}</td><td><strong>{p.yearHouse}</strong></td><td>{houseTheme(p.yearHouse, lang)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              {cycle && (
                <p data-testid="lk-cycle" style={{ marginTop: 12 }}>{T(
                  `35-year cycle: Lal Kitab also gives each planet a turn in a repeating 35-year cycle (${CYCLE_35.map(c => `${c.planet} ${c.years}`).join(', ')}). By that cycle, ages ${cycle.fromAge}–${cycle.toAge} are ${cycle.planet}’s years for you. Some sites start the same sequence from Jupiter.`,
                  `35 वर्ष का चक्र: लाल किताब हर ग्रह को 35 वर्ष के दोहराए जाने वाले चक्र में बारी देती है (${CYCLE_35.map(c => `${planetName(c.planet, 'hi')} ${c.years}`).join(', ')})। इस चक्र से आपकी उम्र ${cycle.fromAge}–${cycle.toAge} वर्ष ${planetName(cycle.planet, 'hi')} के वर्ष हैं। कुछ साइटें यही क्रम गुरु से शुरू करती हैं।`,
                )}</p>
              )}
            </section>
          )}

          <section className="section" data-testid="lk-remedies">
            <div className="section-head">
              <div><span className="eyebrow">{T('Upay', 'उपाय')}</span><h2>{T('Simple Lal Kitab remedies — free first, all optional', 'सरल लाल किताब उपाय — पहले मुफ़्त, सब वैकल्पिक')}</h2></div>
              <p>{T(`Lal Kitab sources advise doing one remedy at a time, daily between sunrise and sunset, for ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} days, and starting the count again if a day is missed; a blood relative may do it for you. Nothing here is required, and no remedy can guarantee a result.`, `लाल किताब के स्रोत एक समय में एक उपाय, रोज़ सूर्योदय से सूर्यास्त के बीच, ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} दिन तक करने की सलाह देते हैं; कोई दिन छूटे तो गिनती फिर से शुरू करें; कोई सगा संबंधी भी आपके लिए कर सकता है। यहाँ कुछ भी अनिवार्य नहीं, और कोई उपाय परिणाम की गारंटी नहीं दे सकता।`)}</p>
            </div>
            {care.length ? (
              <ul className="list-disc pl-5 space-y-2">
                {care.map(p => <li key={p.planet}><strong>{planetName(p.planet, lang)} ({T('house', 'घर')} {p.house})</strong> — {remedyFor(p.planet, p.house, lang)}</li>)}
              </ul>
            ) : <p>{T('No placement in this chart asks for a remedy — Lal Kitab remedies are meant for placements that ask for care.', 'इस कुंडली में किसी स्थिति के लिए उपाय की ज़रूरत नहीं — लाल किताब के उपाय सावधानी माँगने वाली स्थितियों के लिए हैं।')}</p>}
            <div className="inline-actions" style={{ marginTop: 18 }}>
              <button data-testid="lk-download-pdf" type="button" className="btn secondary" onClick={() => void downloadPdf()}>{T('Download Lal Kitab Kundli (PDF) — free', 'लाल किताब कुंडली डाउनलोड करें (PDF) — मुफ़्त')}</button>
              <Link className="btn secondary" to="/kundali/">{T('See your full Vedic Kundali →', 'पूरी वैदिक कुंडली देखें →')}</Link>
              <Link className="btn secondary" to={hi ? '/hi/upay/' : '/remedies/'}>{T('More remedies →', 'और उपाय →')}</Link>
            </div>
          </section>
        </div>
      )}

      <LalKitabGuide lang={lang} />
    </PajPage>
  );
}
