/**
 * /sade-sati/:rashi and /hi/sade-sati/:rashi (Batch 9b) — Sade Sati & Shani Dhaiya dates
 * for one Moon sign, 1950–2060, from the engine-precomputed Saturn ingress table
 * (src/data/saturnIngresses.json; verified against Swiss Ephemeris and Drik Panchang in
 * src/lib/vedic/__tests__/sadeSatiRashi.test.ts).
 *
 * Freshness: the status card is worked out in the BROWSER for today's date from the same
 * table (status only changes at ingress instants), so a deploy that is months old still
 * shows the right phase. The prerendered HTML labels it with its date; every other block
 * (tables, FAQ, JSON-LD) is phrased as fixed date ranges, which never go stale.
 */
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { ScrollTable } from '@/components/ScrollTable';
import { PajPage } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { TermTip } from '@/components/vedic/TermTip';
import { Remedies } from '@/components/vedic/Remedies';
import { RASHIS } from '@/lib/vedic/rashifal';
import { RASHI_SLUGS_HI } from '@/lib/daily/registry';
import { periodsFor, statusAt, nextPeriod, type SaturnPeriod } from '@/lib/vedic/sadeSatiRashi';
import {
  type Lang, ssPageMeta, ssPath, ssIndexFromSlug, rashiName, signName, fmtDate, houseOrd,
  PHASE_NAME, DHAIYA_NAME, phaseExplainers, statusText, yearsAway, ssFaq,
} from '@/lib/vedic/sadeSatiRashiText';

const SITE = 'https://bornclock.com';

const T = {
  en: {
    eyebrow: 'Shani · Saturn transit', crumbVedic: 'Vedic Astrology', crumbSS: 'Sade Sati',
    today: 'Today', statusNote: 'Saturn’s status only changes on the dates in the tables below — this card is worked out for today’s date when the page opens.',
    nextSS: 'Next Sade Sati', nextDh: 'Next Shani Dhaiya', away: 'from now',
    phasesH: 'The three phases, in plain words',
    phasesLead: (me: string) => <>Sade Sati is the roughly 7½ years when Saturn moves through the sign before, on and after your <TermTip id="rashi">Moon sign</TermTip> ({me}). Read it as a period of responsibility and steady effort — what you build in it tends to last.</>,
    ssH: (me: string) => `All Sade Sati periods for ${me}, 1950–2060`,
    ssLead: <>Each period runs from Saturn’s first entry to its final exit. When Saturn turns <TermTip id="retrograde">retrograde</TermTip> near the edge of a sign it steps back for a few months — those rows are marked, so you can see every exit and re-entry.</>,
    dhH: (me: string) => `Shani Dhaiya periods for ${me}, 1950–2060`,
    dhLead: <><TermTip id="dhaiya">Dhaiya</TermTip> (small Panoti) is the 2½-year stay of Saturn in the 4th sign (Kantaka Shani) or the 8th sign (Ashtama Shani) from your Moon — a lighter version of Sade Sati’s themes.</>,
    th: ['Saturn in', 'Phase', 'From', 'To'],
    out: 'Outside (retrograde step)', retro: 'retrograde re-entry', nowRow: 'today',
    run: 'Runs', inside: 'In the Dhaiya sign',
    remH: 'What you can do — free practices first',
    remLead: 'Nothing here is needed to “avoid harm”. These are the traditional, mostly free practices people find grounding during Saturn periods, each with its source. No remedy guarantees a result.',
    faqH: 'Questions about Sade Sati for',
    howH: 'How these dates were worked out',
    how: 'Every date is the moment Saturn changes sign, computed with BornClock’s own engine (sidereal, Lahiri ayanamsa — the same engine as your Kundli) and shown in Indian Standard Time. All 112 Saturn sign changes from 1940 to 2071 were checked against Swiss Ephemeris; in the same Lahiri convention the largest difference is 19 minutes. Spot checks against Drik Panchang’s Shani transit tables agree to within 12 minutes.',
    personal: 'These dates are the same for everyone whose Moon sign is', personal2: 'Not sure of your Moon sign, or want the dates with your own birth details?',
    calc: 'Open the Sade Sati calculator →', rashifal: 'rashifal today →', others: 'Sade Sati dates for other Moon signs',
    hindi: 'हिंदी में', tz: 'All dates in Indian Standard Time (IST).',
  },
  hi: {
    eyebrow: 'शनि गोचर', crumbVedic: 'राशिफल', crumbSS: 'साढ़ेसाती',
    today: 'आज', statusNote: 'शनि की स्थिति केवल नीचे दी गई तारीखों पर बदलती है — यह कार्ड पेज खुलते समय आज की तारीख के लिए गणना करता है।',
    nextSS: 'अगली साढ़ेसाती', nextDh: 'अगली शनि ढैया', away: 'बाद',
    phasesH: 'तीनों चरण, सरल शब्दों में',
    phasesLead: (me: string) => <>साढ़ेसाती लगभग साढ़े सात वर्ष का वह समय है जब शनि आपकी <TermTip id="rashi" lang="hi">चंद्र राशि</TermTip> ({me}) से पहले, उस पर और उसके बाद की राशि से गुज़रते हैं। इसे ज़िम्मेदारी और लगातार प्रयास का समय समझें — इसमें बनाई गई नींव लंबे समय तक टिकती है।</>,
    ssH: (me: string) => `${me} राशि की सभी साढ़ेसाती, 1950–2060`,
    ssLead: <>हर अवधि शनि के पहले प्रवेश से अंतिम निकास तक चलती है। राशि की सीमा के पास <TermTip id="retrograde" lang="hi">वक्री</TermTip> होने पर शनि कुछ महीनों के लिए पीछे लौटते हैं — वे पंक्तियाँ अलग दिखाई गई हैं, ताकि हर निकास और दोबारा प्रवेश दिखे।</>,
    dhH: (me: string) => `${me} राशि की शनि ढैया, 1950–2060`,
    dhLead: <><TermTip id="dhaiya" lang="hi">ढैया</TermTip> (लघु पनौती) शनि का चंद्र से चौथी (कंटक शनि) या आठवीं (अष्टम शनि) राशि में लगभग ढाई वर्ष का गोचर है — साढ़ेसाती के विषयों का हल्का रूप।</>,
    th: ['शनि राशि', 'चरण', 'से', 'तक'],
    out: 'बाहर (वक्री कदम)', retro: 'वक्री होकर वापसी', nowRow: 'आज',
    run: 'अवधि', inside: 'ढैया की राशि में',
    remH: 'आप क्या कर सकते हैं — पहले बिना ख़र्च वाले उपाय',
    remLead: '“नुकसान से बचने” के लिए इनमें से कुछ भी ज़रूरी नहीं है। ये शनि काल में अपनाए जाने वाले पारंपरिक, अधिकतर निःशुल्क उपाय हैं, हर एक का स्रोत साथ में। कोई उपाय परिणाम की गारंटी नहीं देता।',
    faqH: 'साढ़ेसाती से जुड़े प्रश्न —',
    howH: 'ये तारीखें कैसे निकाली गईं',
    how: 'हर तारीख वह क्षण है जब शनि राशि बदलते हैं — BornClock के अपने इंजन (सायन नहीं, निरयन; लाहिड़ी अयनांश — वही इंजन जो आपकी कुंडली बनाता है) से गणना, भारतीय मानक समय में। 1940 से 2071 तक शनि के सभी 112 राशि-परिवर्तन स्विस एफ़ेमेरिस से मिलाए गए; उसी लाहिड़ी पद्धति में सबसे बड़ा अंतर 19 मिनट है। द्रिक पंचांग की शनि गोचर तालिकाओं से भी 12 मिनट के भीतर मेल।',
    personal: 'ये तारीखें हर उस व्यक्ति के लिए समान हैं जिसकी चंद्र राशि है', personal2: 'अपनी चंद्र राशि नहीं पता, या अपनी जन्म-जानकारी से तारीखें देखनी हैं?',
    calc: 'साढ़ेसाती कैलकुलेटर खोलें →', rashifal: 'आज का राशिफल →', others: 'दूसरी राशियों की साढ़ेसाती',
    hindi: 'English', tz: 'सभी तारीखें भारतीय मानक समय (IST) में।',
  },
} as const;

function PeriodTable({ p, lang, nowMs }: { p: SaturnPeriod; lang: Lang; nowMs: number }) {
  const t = T[lang];
  const current = Date.parse(p.start) <= nowMs && nowMs < Date.parse(p.end);
  return (
    <div data-testid={`ss-period-${p.type}`} className={`rounded-xl border p-4 ${current ? 'border-amber-300 bg-amber-50/60' : 'border-border'}`}>
      <div className="font-semibold text-foreground">
        {t.run}: {fmtDate(p.start, lang, 'long')} – {fmtDate(p.end, lang, 'long')}
        {p.type !== 'sadeSati' && <span className="text-muted-foreground font-normal"> · {DHAIYA_NAME[lang][p.type]}</span>}
      </div>
      <ScrollTable className="mt-2" lang={lang}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground">{t.th.map(h => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {p.segments.map(s => {
              const now = Date.parse(s.start) <= nowMs && nowMs < Date.parse(s.end);
              const label = !s.inside ? t.out : s.phase ? PHASE_NAME[lang][s.phase] : t.inside;
              return (
                <tr key={s.start} className={`border-t border-border ${!s.inside ? 'text-muted-foreground' : 'text-foreground'} ${now ? 'font-semibold' : ''}`}>
                  <td className="py-1 pr-3 whitespace-nowrap">{signName(s.sign, lang)} <span className="text-muted-foreground">({houseOrd(s.house, lang)})</span></td>
                  <td className="py-1 pr-3">{label}{s.retroEntry ? <span className="text-xs text-muted-foreground"> · {t.retro}</span> : null}{now ? <span className="ml-1 rounded bg-amber-200 px-1 text-xs">{t.nowRow}</span> : null}</td>
                  <td className="py-1 pr-3 whitespace-nowrap">{fmtDate(s.start, lang)}</td>
                  <td className="py-1 pr-3 whitespace-nowrap">{fmtDate(s.end, lang)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollTable>
    </div>
  );
}

export default function SadeSatiRashiPage({ lang = 'en' }: { lang?: Lang }) {
  const { rashi: slug } = useParams<{ rashi: string }>();
  const idx = ssIndexFromSlug(slug, lang);
  if (idx < 0) return <Navigate to={lang === 'hi' ? '/hi/rashifal' : '/sade-sati'} replace />;

  const t = T[lang];
  const meta = ssPageMeta(idx, lang);
  const me = rashiName(idx, lang);
  const path = ssPath(idx, lang);
  // Today's instant, read on every render in the browser (the app is client-rendered, no
  // hydration), so the status below is always for the viewer's today.
  const nowMs = Date.now();
  const status = statusAt(idx, nowMs);
  const st = status ? statusText(idx, status, lang) : null;
  const nextSS = nextPeriod(idx, nowMs, ['sadeSati']);
  const nextDh = nextPeriod(idx, nowMs, ['kantaka', 'ashtama']);
  const ss = periodsFor(idx, 'sadeSati');
  const dh = [...periodsFor(idx, 'kantaka'), ...periodsFor(idx, 'ashtama')].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const faq = ssFaq(idx, lang);
  const active = status && status.kind !== 'none';
  const rashifalPath = lang === 'hi' ? `/hi/rashifal/${RASHI_SLUGS_HI[idx]}` : `/rashifal/${RASHIS[idx].slug}/today`;
  const otherLangPath = ssPath(idx, lang === 'hi' ? 'en' : 'hi');

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="sadesati-rashi-page"
      seo={(
        <>
          <SEO title={meta.title} description={meta.description} canonicalUrl={path} ogType="article"
            hreflang={[{ lang: 'en', url: `${SITE}${ssPath(idx, 'en')}/` }, { lang: 'hi', url: `${SITE}${ssPath(idx, 'hi')}/` }]} />
          <FAQSchema items={faq} />
        </>
      )}
      breadcrumb={{
        trail: lang === 'hi'
          ? [{ label: t.crumbVedic, to: '/hi/rashifal/' }]
          : [{ label: t.crumbVedic, to: '/vedic-astrology/' }, { label: t.crumbSS, to: '/sade-sati/' }],
        current: lang === 'hi' ? `${me} साढ़ेसाती` : `${me} Sade Sati`,
        edition: t.eyebrow,
      }}
    >
      <section className="section" lang={lang}>
        <div className="section-head">
          <div><span className="eyebrow">{t.eyebrow}</span><h1>{meta.h1}</h1></div>
          <p>{t.personal} {me} ({RASHIS[idx].english}). {t.tz}{' '}
            <Link to={otherLangPath} lang={lang === 'hi' ? 'en' : 'hi'} className="underline">{t.hindi}</Link></p>
        </div>

        {status && st && (
          <div data-testid="ss-rashi-status" className={`rounded-xl border p-5 ${active ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="text-sm text-muted-foreground">{t.today}, <span data-testid="ss-rashi-today">{fmtDate(new Date(nowMs).toISOString(), lang, 'long')}</span></div>
            <div className={`text-xl font-black mt-1 ${active ? 'text-amber-800' : 'text-emerald-800'}`} data-testid="ss-rashi-headline">{st.headline}</div>
            <p className="text-sm text-foreground mt-2">{st.detail}</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
              {nextSS && <div data-testid="ss-rashi-next"><strong>{t.nextSS}:</strong> {fmtDate(nextSS.start, lang)} – {fmtDate(nextSS.end, lang)} <span className="text-muted-foreground">({yearsAway(nextSS.start, nowMs, lang)} {t.away})</span></div>}
              {nextDh && <div><strong>{t.nextDh}:</strong> {fmtDate(nextDh.start, lang)} – {fmtDate(nextDh.end, lang)} <span className="text-muted-foreground">({DHAIYA_NAME[lang][nextDh.type as 'kantaka' | 'ashtama']})</span></div>}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{t.statusNote}</p>
          </div>
        )}

        <h2 className="mt-8 mb-2">{t.phasesH}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.phasesLead(me)}</p>
        <div className="grid md:grid-cols-3 gap-3" data-testid="ss-rashi-phases">
          {phaseExplainers(idx, lang).map(ph => (
            <div key={ph.name} className="rounded-xl border border-border p-4">
              <div className="font-semibold text-foreground"><TermTip id="sadeSatiPhase" lang={lang}>{ph.name}</TermTip></div>
              <p className="text-sm text-foreground mt-1">{ph.text}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 mb-2">{t.ssH(me)}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.ssLead}</p>
        <div className="space-y-3" data-testid="ss-rashi-sadesati">
          {ss.map(p => <PeriodTable key={p.start} p={p} lang={lang} nowMs={nowMs} />)}
        </div>

        <h2 className="mt-8 mb-2">{t.dhH(me)}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.dhLead}</p>
        <div className="space-y-3" data-testid="ss-rashi-dhaiya">
          {dh.map(p => <PeriodTable key={p.type + p.start} p={p} lang={lang} nowMs={nowMs} />)}
        </div>

        <h2 className="mt-8 mb-2">{t.remH}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.remLead}</p>
        <div className="space-y-3">
          <Remedies remedyKey="sadeSati" lang={lang} testid="ss-rashi-remedies" />
          <Remedies remedyKey="dhaiya" lang={lang} testid="ss-rashi-dhaiya-remedies" />
        </div>

        <h2 className="mt-8 mb-2">{t.faqH} {me}</h2>
        <div className="space-y-3" data-testid="ss-rashi-faq">
          {faq.map(f => (
            <details key={f.question} className="rounded-xl border border-border p-4">
              <summary className="font-semibold text-foreground cursor-pointer">{f.question}</summary>
              <p className="text-sm text-muted-foreground mt-2">{f.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-brand-purple/30 bg-brand-purple/10 p-4" data-testid="ss-rashi-method">
          <div className="font-semibold text-foreground mb-1">{t.howH}</div>
          <p className="text-sm text-foreground">{t.how} <TermTip id="ayanamsa" lang={lang}>{lang === 'hi' ? 'अयनांश' : 'Ayanamsa'}</TermTip></p>
        </div>

        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/10 p-5 text-center">
          <p className="text-muted-foreground mb-3">{t.personal2}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/sade-sati/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold">{t.calc}</Link>
            <Link to={rashifalPath} className="inline-flex items-center gap-2 border border-border rounded-lg px-5 py-2.5 font-semibold text-foreground">{me} {t.rashifal}</Link>
          </div>
        </div>

        <h2 className="mt-8 mb-2">{t.others}</h2>
        <div className="flex flex-wrap gap-2" data-testid="ss-rashi-others">
          {RASHIS.map((r, i) => i === idx ? null : (
            <Link key={r.slug} to={ssPath(i, lang)} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
              {rashiName(i, lang)} <span className="text-muted-foreground">({r.english})</span>
            </Link>
          ))}
        </div>
      </section>
    </PajPage>
  );
}
