/**
 * /varshphal and /hi/varshphal — B18: FREE Varshphal (Tajik annual chart / yearly horoscope).
 *
 * The calculation runs server-side in /api/varshphal (src/lib/vedic/varshphal.ts, validated
 * against Swiss Ephemeris and the published AIFAS worked examples); this page only collects
 * the birth details, the year and (optionally) the city the person lives in now, and shows the
 * result — summary, annual chart, plain-language outlook (impact → reason → what to do),
 * month-by-month Mudda dasha, Sahams, Tajik yogas, free-first remedies and a print/PDF copy.
 * Free: no paywall, no pricing flags touched.
 */
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { CityPicker } from '@/components/CityPicker';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { Remedies } from '@/components/vedic/Remedies';
import { planetRemedyKey } from '@/lib/vedic/remedies';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { timezoneForCoordinates } from '@/lib/timezone/birthTimezone';
import { printHtmlViaIframe } from '@/lib/pdf/printHtml';
import type { SavedCity } from '@/services/savedProfile';
import type { VarshphalResult } from '@/lib/vedic/varshphal';
import type { Outlook } from '@/lib/vedic/varshphalOutlook';
import { type Lang, type Tone, pName, sName, toneLabel, HOUSE_THEME, SAHAM_LABEL, ROLE_LABEL } from '@/lib/vedic/varshphalLabels';
import { fmtDate, fmtDateHi } from '@/components/guide/Guide';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { VarshphalGuide } from '@/content/guides/VarshphalGuide';

const KundaliChart = lazy(() => import('@/components/KundaliChart').then(m => ({ default: m.KundaliChart })));

const SITE = 'https://bornclock.com';
interface ApiResponse { result: VarshphalResult; outlook: Outlook; castFor: 'birth' | 'residence'; error?: string }

const TONE_CLASS: Record<Tone, string> = {
  supportive: 'bg-brand-green/10 text-brand-green-ink border-brand-green/40',
  mixed: 'bg-brand-gold/10 text-brand-gold-ink border-brand-gold/40',
  careful: 'bg-brand-coral/10 text-brand-coral-ink border-brand-coral/40',
};

/** ISO instant → yyyy-mm-dd in the chart's time zone (IANA, or the fixed IST option). */
function localYmd(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
  } catch {
    return new Date(Date.parse(iso) + 5.5 * 3600_000).toISOString().slice(0, 10);
  }
}

const COPY = {
  en: {
    eyebrow: 'Tajik annual chart · Lahiri sidereal', crumb: 'Varshphal', edition: 'Varshphal · yearly horoscope',
    intro: <>Your <TermTip id="varshphal">Varshphal</TermTip> is a chart for one year of your life, cast for the exact moment the Sun returns to its birth degree (<TermTip id="varshaPravesh">Varsha Pravesh</TermTip>). It shows the <TermTip id="varshesh">lord of the year</TermTip>, the <TermTip id="muntha">Muntha</TermTip>, the <TermTip id="saham">Sahams</TermTip> and a month-by-month <TermTip id="muddaDasha">Mudda dasha</TermTip> — read here in plain language. Free.</>,
    trust: 'The exact Sun-return moment and annual chart, checked against Swiss Ephemeris (within seconds) and published Varshphal worked examples.',
    formTitle: 'Your birth details', formNote: 'The birth time sets your Muntha and Mudda dasha; the place sets the year’s ascendant.',
    year: 'Year', residence: 'Cast the year for the city I live in now (some astrologers prefer this; the classical default is the birth place)',
    residenceCity: 'City you live in now', submit: (y: number) => `Show my Varshphal ${y}`, loading: 'Calculating…',
    failed: 'The service is temporarily unavailable. Please try again shortly.',
    summary: 'Your year at a glance', pravesh: 'Varsha Pravesh (year begins)', lagna: 'Annual Lagna', muntha: 'Muntha', varshesh: 'Lord of the year',
    day: 'by day', night: 'by night', house: 'house', chart: 'Annual chart', planets: 'Planets in the annual chart',
    planet: 'Planet', sign: 'Sign', degree: 'Degree', strength: 'Strength /20', harsha: 'Harsha /20',
    outlook: 'Your year, in plain language', impact: 'Impact', why: 'Why', todo: 'What to do',
    months: 'Month by month (Mudda dasha)', monthsNote: 'Each planet leads a stretch of the year. Dates are in the time zone of the chart’s place.',
    windows: 'Best windows this year', relWindows: 'Windows that suit relationship steps',
    relNote: 'These are better times for important conversations, family meetings or commitments — not dates that something will happen.',
    sahams: 'Sahams — sensitive points for the year', sahamCol: 'Saham', pos: 'Position', area: 'Read for', formula: 'Formula',
    yogas: 'Tajik yogas in your annual chart', noYogas: 'No Ithasala or Ishrafa contacts within orb this year — the year’s results lean more on placements than on planet-to-planet contacts.',
    selection: 'How the lord of the year was chosen', role: 'Office', candidate: 'Planet', aspects: 'Aspects the annual Lagna?', yes: 'Yes', no: 'No',
    chosen: (p: string, rule: string) => rule === 'muntha-lord-fallback' ? `None of the candidates aspects the annual Lagna, so the Muntha lord ${p} becomes lord of the year (classical rule).` : `${p} is the strongest candidate (Pancha-vargiya bala) that aspects the annual Lagna, so it is the lord of the year.`,
    remedies: 'Gentle, free-first remedies', pdf: 'Download Varshphal (PDF) — free', kundali: 'See your full Kundali →',
    method: 'Method: true Lahiri (Chitrapaksha) sidereal positions, as AstroSage; Tajik rules from Dr. S.P. Gour’s “Varshaphal” (AIFAS) and Balabhadra’s Hayanaratna. A guide to the year’s tendencies — not fixed events, and not medical, legal or financial advice.',
    castBirth: 'Cast for your birth place', castRes: 'Cast for your current city',
    yogaText: (k: string, a: string, b: string, via?: string) => ({
      ithasala: `${a} and ${b} are coming together (applying) — matters they rule tend to move forward this year.`,
      ishrafa: `${a} has just moved past ${b} (separating) — something linked to them has peaked; restart it with fresh effort.`,
      nakta: `${a} and ${b} don’t see each other, but ${via} links them — help comes through a go-between.`,
      yamaya: `${a} and ${b} are linked through slower ${via} — results come through an elder or an established channel.`,
      kamboola: `The Moon supports the ${a}–${b} Ithasala — a helpful boost for what they promise.`,
    } as Record<string, string>)[k],
    yearRange: 'Pick a year after your birth year.',
  },
  hi: {
    eyebrow: 'ताजिक वर्ष कुंडली · लाहिड़ी अयनांश', crumb: 'वर्षफल', edition: 'वर्षफल · वार्षिक राशिफल',
    intro: <>आपका <TermTip id="varshphal" lang="hi">वर्षफल</TermTip> आपके जीवन के एक वर्ष की कुंडली है — उस क्षण के लिए बनी जब सूर्य ठीक अपने जन्म के अंश पर लौटता है (<TermTip id="varshaPravesh" lang="hi">वर्ष प्रवेश</TermTip>)। इसमें <TermTip id="varshesh" lang="hi">वर्षेश</TermTip>, <TermTip id="muntha" lang="hi">मुंथा</TermTip>, <TermTip id="saham" lang="hi">सहम</TermTip> और महीनेवार <TermTip id="muddaDasha" lang="hi">मुद्दा दशा</TermTip> — सरल भाषा में। मुफ़्त।</>,
    trust: 'सूर्य के लौटने का सटीक क्षण और वर्ष कुंडली — Swiss Ephemeris (कुछ सेकंड के भीतर) और प्रकाशित वर्षफल उदाहरणों से जाँची गई।',
    formTitle: 'आपका जन्म विवरण', formNote: 'जन्म समय से मुंथा और मुद्दा दशा तय होती है; स्थान से वर्ष लग्न।',
    year: 'वर्ष', residence: 'वर्ष कुंडली मेरे वर्तमान शहर के लिए बनाएँ (कुछ ज्योतिषी यही मानते हैं; शास्त्रीय रूप से जन्म स्थान लिया जाता है)',
    residenceCity: 'अभी आप किस शहर में रहते हैं', submit: (y: number) => `मेरा वर्षफल ${y} देखें`, loading: 'गणना हो रही है…',
    failed: 'सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर प्रयास करें।',
    summary: 'एक नज़र में आपका वर्ष', pravesh: 'वर्ष प्रवेश', lagna: 'वर्ष लग्न', muntha: 'मुंथा', varshesh: 'वर्षेश (वर्ष का स्वामी)',
    day: 'दिन में', night: 'रात में', house: 'भाव', chart: 'वर्ष कुंडली', planets: 'वर्ष कुंडली में ग्रह',
    planet: 'ग्रह', sign: 'राशि', degree: 'अंश', strength: 'बल /20', harsha: 'हर्ष /20',
    outlook: 'सरल भाषा में आपका वर्ष', impact: 'असर', why: 'कारण', todo: 'क्या करें',
    months: 'महीनेवार (मुद्दा दशा)', monthsNote: 'वर्ष का हर हिस्सा किसी एक ग्रह के नेतृत्व में चलता है। तिथियाँ कुंडली के स्थान के समय-क्षेत्र में हैं।',
    windows: 'इस वर्ष की सबसे अनुकूल अवधियाँ', relWindows: 'रिश्तों के अहम कदमों के लिए अनुकूल अवधियाँ',
    relNote: 'ये अहम बातचीत, परिवारों के मिलने या प्रतिबद्धता के लिए बेहतर समय हैं — किसी घटना की निश्चित तिथि नहीं।',
    sahams: 'सहम — वर्ष के संवेदनशील बिंदु', sahamCol: 'सहम', pos: 'स्थिति', area: 'विषय', formula: 'सूत्र',
    yogas: 'वर्ष कुंडली के ताजिक योग', noYogas: 'इस वर्ष कोई इत्थशाल या ईशराफ योग अंशों के भीतर नहीं है — फल ग्रहों की स्थिति पर अधिक निर्भर हैं।',
    selection: 'वर्षेश कैसे चुना गया', role: 'पद', candidate: 'ग्रह', aspects: 'वर्ष लग्न पर दृष्टि?', yes: 'हाँ', no: 'नहीं',
    chosen: (p: string, rule: string) => rule === 'muntha-lord-fallback' ? `कोई अधिकारी ग्रह वर्ष लग्न को नहीं देखता, इसलिए मुंथेश ${p} वर्षेश बना (शास्त्रीय नियम)।` : `वर्ष लग्न को देखने वाले अधिकारियों में ${p} सबसे बलवान (पंचवर्गीय बल) है, इसलिए वही वर्षेश है।`,
    remedies: 'सरल, पहले मुफ़्त उपाय', pdf: 'वर्षफल डाउनलोड करें (PDF) — मुफ़्त', kundali: 'अपनी पूरी कुंडली देखें →',
    method: 'पद्धति: लाहिड़ी (चित्रापक्ष) अयनांश, AstroSage की तरह; ताजिक नियम डॉ. एस.पी. गौड़ की “वर्षफल” (AIFAS) और बलभद्र के हायनरत्न से। यह वर्ष की प्रवृत्तियों का मार्गदर्शन है — निश्चित घटनाएँ नहीं, और न ही चिकित्सा, कानूनी या वित्तीय सलाह।',
    castBirth: 'जन्म स्थान के लिए', castRes: 'वर्तमान शहर के लिए',
    yogaText: (k: string, a: string, b: string, via?: string) => ({
      ithasala: `${a} और ${b} एक-दूसरे की ओर बढ़ रहे हैं (इत्थशाल) — इनके विषय इस वर्ष आगे बढ़ते हैं।`,
      ishrafa: `${a} अभी ${b} से आगे निकला है (ईशराफ) — इनसे जुड़ा विषय चरम पार कर चुका है; नए सिरे से प्रयास करें।`,
      nakta: `${a} और ${b} एक-दूसरे को नहीं देखते, पर ${via} दोनों को जोड़ता है (नक्त) — काम किसी मध्यस्थ से बनता है।`,
      yamaya: `${a} और ${b} धीमे ग्रह ${via} से जुड़ते हैं (यमया) — किसी बड़े या स्थापित माध्यम से काम बनता है।`,
      kamboola: `चंद्रमा ${a}–${b} के इत्थशाल का साथ देता है (कंबूल) — योग को अतिरिक्त बल।`,
    } as Record<string, string>)[k],
    yearRange: 'जन्म वर्ष के बाद का कोई वर्ष चुनें।',
  },
};

export default function VarshphalPage({ lang = 'en' }: { lang?: Lang }) {
  const hi = lang === 'hi';
  const c = COPY[lang];
  const path = hi ? '/hi/varshphal' : '/varshphal';
  const META = GUIDE_META[path];
  const location = useLocation();
  const { profile, save } = useSavedProfile();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [useResidence, setUseResidence] = useState(false);
  const [residence, setResidence] = useState<SavedCity | null>(null);
  const [saveChecked, setSaveChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState('');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [used, setUsed] = useState<BirthDetails | null>(null);
  const autoRan = useRef(false);

  // Carry-forward from /kundali (same ?dob=&time=&place=&lat=&lon=&tz=[&tzid=][&name=] scheme).
  const carried = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(sp.get('dob') || '') ? sp.get('dob')! : '';
    const time = /^\d{2}:\d{2}$/.test(sp.get('time') || '') ? sp.get('time')! : '';
    const lat = Number(sp.get('lat')), lon = Number(sp.get('lon'));
    if (!dob || !time || !Number.isFinite(lat) || !Number.isFinite(lon) || sp.get('lat') === null || sp.get('lon') === null) return null;
    const tzid = sp.get('tzid');
    const city: SavedCity = { name: sp.get('place') || '', lat, lon, tz: Number(sp.get('tz')) || 0, ...(tzid ? { timezone: tzid, manualTimezone: true } : {}) };
    const y = Number(sp.get('year'));
    return { details: { dob, time, city, name: sp.get('name') || undefined } as BirthDetails, year: Number.isInteger(y) ? y : null };
  }, [location.search]);

  const initial = carried
    ? { dob: carried.details.dob, time: carried.details.time, city: carried.details.city, name: carried.details.name }
    : profile ? { dob: profile.dob, time: profile.time, city: profile.city, name: profile.name } : undefined;

  const birthYear = Number((initial?.dob || used?.dob || '').slice(0, 4)) || 0;
  const years = Array.from({ length: 11 }, (_, i) => thisYear - 5 + i).filter(y => !birthYear || y > birthYear);

  const run = async (d: BirthDetails, forYear = year) => {
    if (Number(d.dob.slice(0, 4)) >= forYear) { setFailed(c.yearRange); setData(null); return; }
    setLoading(true); setFailed(''); setData(null); setUsed(d);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city, name: d.name });
    try {
      const q = new URLSearchParams(birthQuery(d.dob, d.time, d.city));
      q.set('year', String(forYear));
      q.set('lang', lang);
      if (useResidence && residence) {
        q.set('rlat', String(residence.lat)); q.set('rlon', String(residence.lon));
        try { q.set('rtzid', residence.manualTimezone && residence.timezone ? residence.timezone : timezoneForCoordinates(residence.lat, residence.lon)); } catch { /* server derives it */ }
      }
      const res = await fetch(`/api/varshphal?${q.toString()}`);
      const body = await res.json().catch(() => null) as ApiResponse | null;
      if (!res.ok || !body?.result) { setFailed(body?.error || c.failed); return; }
      setData(body);
    } catch {
      setFailed(c.failed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (carried && !autoRan.current) {
      autoRan.current = true;
      const y = carried.year && carried.year > Number(carried.details.dob.slice(0, 4)) ? carried.year : thisYear;
      setYear(y);
      void run(carried.details, y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carried]);

  const r = data?.result, o = data?.outlook;
  const tz = r?.varshaPravesh.timezone ?? 'Asia/Kolkata';
  const fd = (iso: string) => (hi ? fmtDateHi : fmtDate)(localYmd(iso, tz));
  const P = (p: string) => pName(p, lang);
  const ordinal = (n: number) => (hi ? `${n}वाँ` : `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`);

  const downloadPdf = async () => {
    if (!r || !o || !used) return;
    const { buildVarshphalPdfHtml } = await import('@/lib/pdf/varshphalPdfHtml');
    printHtmlViaIframe(buildVarshphalPdfHtml(r, o, lang, {
      name: used.name, dob: used.dob, time: used.time, place: used.city.name,
      castPlace: data?.castFor === 'residence' ? residence?.name : undefined,
      fmtDate: fd, sahamLabel: k => SAHAM_LABEL[k]?.[lang].name ?? k,
    }));
  };

  const kundaliHref = used
    ? `/kundali/?${new URLSearchParams({ dob: used.dob, time: used.time, place: used.city.name, lat: String(used.city.lat), lon: String(used.city.lon), tz: String(used.city.tz ?? 0), ...(used.name ? { name: used.name } : {}) }).toString()}`
    : '/kundali/';

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="varshphal-page"
      seo={(
        <SEO title={META.title} description={META.description} canonicalUrl={path} ogType="website"
          hreflang={[{ lang: 'en', url: `${SITE}/varshphal/` }, { lang: 'hi', url: `${SITE}/hi/varshphal/` }]} />
      )}
      breadcrumb={{ trail: [{ label: hi ? 'वैदिक ज्योतिष' : 'Vedic Astrology', to: '/vedic-astrology/' }], current: c.crumb, edition: c.edition }}
      footer={{
        tagline: hi ? 'आपका वर्षफल — सटीक सूर्य-प्रवेश और ताजिक नियमों से, मुफ़्त।' : 'Your Varshphal — the exact Sun return and classical Tajik rules, free.',
        nav: [
          { label: hi ? 'कुंडली' : 'Kundali', to: '/kundali/' },
          { label: hi ? 'राशिफल 2027' : 'Rashifal 2027', to: hi ? '/hi/rashifal-2027/' : '/rashifal-2027/' },
          { label: hi ? 'वैदिक ज्योतिष' : 'Vedic Astrology', to: '/vedic-astrology/' },
          { label: hi ? 'English' : 'हिंदी में', to: hi ? '/varshphal/' : '/hi/varshphal/' },
          { label: hi ? 'निजता' : 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <section className="section" lang={hi ? 'hi' : undefined}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{c.eyebrow}</span>
            <h1>{META.h1}</h1>
          </div>
          <p>{c.intro}</p>
        </div>
        <p className="text-sm" style={{ marginTop: 8 }}>
          <Link to={hi ? '/varshphal/' : '/hi/varshphal/'} className="underline" lang={hi ? 'en' : 'hi'}>{hi ? 'Read in English' : 'हिंदी में वर्षफल देखें'}</Link>
        </p>

        <TrustStrip claim={c.trust} href="/how-it-works/#vedic" />

        <div className="form-band" style={{ marginTop: 16 }}>
          <div>
            <h3>{c.formTitle}</h3>
            <p className="small muted">{c.formNote}</p>
            <div className="mt-3">
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="varshphal-year">{c.year}</label>
              <select id="varshphal-year" data-testid="varshphal-year" value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm text-foreground mt-3 cursor-pointer">
              <input type="checkbox" data-testid="varshphal-residence-toggle" checked={useResidence} onChange={e => setUseResidence(e.target.checked)} className="h-4 w-4 mt-0.5 rounded border-border" />
              <span>{c.residence}</span>
            </label>
            {useResidence && (
              <div className="relative mt-2">
                <label className="block text-xs text-muted-foreground mb-1" htmlFor="varshphal-residence">{c.residenceCity}</label>
                <CityPicker id="varshphal-residence" testid="varshphal-residence" value={residence} onPick={setResidence} mode="place"
                  placeholder={hi ? 'जैसे बेंगलुरु' : 'e.g. Bengaluru'} ariaLabel={c.residenceCity} />
              </div>
            )}
          </div>
          <BirthDetailsForm
            initial={initial}
            submitLabel={c.submit(year)}
            loadingLabel={c.loading}
            loading={loading}
            onSubmit={d => void run(d)}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix="varshphal"
            lang={lang}
          />
        </div>

        {failed && <p className="subtle" data-testid="varshphal-error" style={{ marginTop: 12 }}>{failed}</p>}
      </section>

      {r && o && (
        <div data-testid="varshphal-result" lang={hi ? 'hi' : undefined}>
          <section className="section white">
            <div className="section-head"><div><span className="eyebrow">{data?.castFor === 'residence' ? c.castRes : c.castBirth}</span>
              <h2 style={{ overflowWrap: 'anywhere' }}>{used?.name ? (hi ? `${used.name} — ` : `${used.name} — `) : ''}{o.headline}</h2></div></div>
            <div data-testid="varshphal-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-brand-purple/40 bg-brand-purple/10 p-4">
                <div className="text-xs text-muted-foreground">{c.pravesh}</div>
                <div className="text-lg font-bold text-brand-purple-deep">{fd(r.varshaPravesh.utc)}</div>
                <div className="text-sm text-foreground">{r.varshaPravesh.localTime} ({r.varshaPravesh.offset}) · {r.varshaPravesh.isDay ? c.day : c.night}</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground">{c.lagna}</div>
                <div className="text-lg font-bold text-foreground">{sName(r.lagna.sign, lang)}</div>
                <div className="text-sm text-foreground">{hi ? 'स्वामी' : 'lord'} {P(r.lagna.lord)}</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs text-muted-foreground"><TermTip id="muntha" lang={lang}>{c.muntha}</TermTip></div>
                <div className="text-lg font-bold text-foreground">{sName(r.muntha.sign, lang)}</div>
                <div className="text-sm text-foreground">{ordinal(r.muntha.house)} {c.house} · {HOUSE_THEME[lang][r.muntha.house]}</div>
              </div>
              <div className="rounded-xl border border-brand-gold/50 bg-brand-gold/10 p-4">
                <div className="text-xs text-muted-foreground"><TermTip id="varshesh" lang={lang}>{c.varshesh}</TermTip></div>
                <div className="text-lg font-bold text-brand-gold-ink">{P(r.varshesh.planet)}</div>
                <div className="text-sm text-foreground">{ordinal(r.planets.find(p => p.name === r.varshesh.planet)!.house)} {c.house}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <figure data-testid="varshphal-chart" style={{ margin: 0 }}>
                <figcaption className="text-sm font-semibold text-center mb-1">{c.chart} {r.year}</figcaption>
                <Suspense fallback={<div style={{ width: 300, height: 300 }} aria-hidden="true" />}>
                  <KundaliChart lagnaSignIndex={r.lagna.sign + 1} planets={r.planets.map(p => ({ name: p.name, house: p.house, signIndex: p.sign + 1 }))} label={c.chart} />
                </Suspense>
              </figure>
              <div className="table-scroll" style={{ overflowX: 'auto' }}>
                <table className="data-table w-full text-sm" data-testid="varshphal-planets">
                  <caption className="text-left font-semibold mb-1">{c.planets}</caption>
                  <thead><tr><th className="text-left p-1.5">{c.planet}</th><th className="text-left p-1.5">{c.sign}</th><th className="text-left p-1.5">{c.degree}</th><th className="text-left p-1.5">{c.house}</th><th className="text-left p-1.5"><TermTip id="panchaVargiyaBala" lang={lang}>{c.strength}</TermTip></th><th className="text-left p-1.5"><TermTip id="harshaBala" lang={lang}>{c.harsha}</TermTip></th></tr></thead>
                  <tbody>
                    {r.planets.map(p => {
                      const pv = (r.panchaVargiya as Record<string, { vimshopaka: number }>)[p.name];
                      const hb = (r.harsha as Record<string, { total: number }>)[p.name];
                      return (
                        <tr key={p.name}>
                          <td className="p-1.5 border-t border-border">{P(p.name)}{p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu' ? ' (R)' : ''}</td>
                          <td className="p-1.5 border-t border-border">{sName(p.sign, lang)}</td>
                          <td className="p-1.5 border-t border-border">{Math.floor(p.degree)}°{String(Math.floor((p.degree % 1) * 60)).padStart(2, '0')}′</td>
                          <td className="p-1.5 border-t border-border">{p.house}</td>
                          <td className="p-1.5 border-t border-border">{pv ? pv.vimshopaka.toFixed(1) : '—'}</td>
                          <td className="p-1.5 border-t border-border">{hb ? hb.total : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="section" data-testid="varshphal-outlook">
            <div className="section-head"><div><span className="eyebrow">{hi ? 'वर्ष का फल' : 'Yearly outlook'}</span><h2>{c.outlook}</h2></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {o.blocks.map(b => (
                <div key={b.key} data-testid={`varshphal-block-${b.key}`} className="rounded-xl border border-border bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">{b.title}</h3>
                    <span className={`text-xs font-semibold rounded-full border px-2 py-0.5 ${TONE_CLASS[b.tone]}`}>{toneLabel(b.tone, lang)}</span>
                  </div>
                  <p className="mt-2 text-foreground"><strong>{c.impact}:</strong> {b.impact}</p>
                  <p className="mt-1 text-sm text-foreground"><strong>{c.why}:</strong> {b.reason}</p>
                  <p className="mt-1 text-sm text-foreground"><strong>{c.todo}:</strong> {b.todo}</p>
                </div>
              ))}
            </div>

            {o.bestWindows.length > 0 && (
              <div data-testid="varshphal-windows" className="mt-6 rounded-xl border border-brand-green/40 bg-brand-green/10 p-4">
                <h3 className="font-bold text-foreground">{c.windows}</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground">
                  {o.bestWindows.map(w => <li key={w.start}><strong>{fd(w.start)} – {fd(w.end)}</strong> ({P(w.lord)}): {w.goodFor}</li>)}
                </ul>
              </div>
            )}
            {o.relationshipWindows.length > 0 && (
              <div data-testid="varshphal-rel-windows" className="mt-4 rounded-xl border border-border p-4">
                <h3 className="font-bold text-foreground">{c.relWindows}</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-foreground">
                  {o.relationshipWindows.map(w => <li key={w.start}>{fd(w.start)} – {fd(w.end)} ({P(w.lord)})</li>)}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">{c.relNote}</p>
              </div>
            )}
          </section>

          <section className="section white" data-testid="varshphal-months">
            <div className="section-head"><div><span className="eyebrow"><TermTip id="muddaDasha" lang={lang}>{hi ? 'मुद्दा दशा' : 'Mudda dasha'}</TermTip></span><h2>{c.months}</h2></div><p>{c.monthsNote}</p></div>
            <ol className="space-y-3">
              {o.months.map((m, i) => (
                <li key={i} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <strong className="text-foreground">{fd(m.start)} – {fd(m.end)} · {P(m.lord)}</strong>
                    <span className={`text-xs font-semibold rounded-full border px-2 py-0.5 ${TONE_CLASS[m.tone]}`}>{toneLabel(m.tone, lang)}</span>
                  </div>
                  <p className="mt-1 text-foreground">{m.impact}</p>
                  <p className="text-sm text-foreground">{m.reason} {m.todo}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="section" data-testid="varshphal-sahams">
            <div className="section-head"><div><span className="eyebrow"><TermTip id="saham" lang={lang}>{hi ? 'सहम' : 'Sahams'}</TermTip></span><h2>{c.sahams}</h2></div></div>
            <div className="table-scroll" style={{ overflowX: 'auto' }}>
              <table className="data-table w-full text-sm">
                <thead><tr><th className="text-left p-1.5">{c.sahamCol}</th><th className="text-left p-1.5">{c.pos}</th><th className="text-left p-1.5">{c.house}</th><th className="text-left p-1.5">{c.area}</th><th className="text-left p-1.5">{c.formula}</th></tr></thead>
                <tbody>
                  {r.sahams.map(s => (
                    <tr key={s.key}>
                      <td className="p-1.5 border-t border-border font-semibold">{SAHAM_LABEL[s.key][lang].name}</td>
                      <td className="p-1.5 border-t border-border">{sName(s.sign, lang)} {Math.floor(s.longitude % 30)}°{String(Math.floor(((s.longitude % 30) % 1) * 60)).padStart(2, '0')}′</td>
                      <td className="p-1.5 border-t border-border">{s.house} — {HOUSE_THEME[lang][s.house]}</td>
                      <td className="p-1.5 border-t border-border">{SAHAM_LABEL[s.key][lang].area}</td>
                      <td className="p-1.5 border-t border-border text-xs">{s.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{hi ? 'सहम जिस भाव में हो, उसका स्वामी बलवान हो और भाव 6, 8 या 12 न हो, तो वह विषय वर्ष में अधिक सहज रहता है।' : 'A Saham in a good house (not the 6th, 8th or 12th) with a strong lord suggests its theme flows more easily this year.'}</p>
          </section>

          <section className="section white" data-testid="varshphal-yogas">
            <div className="section-head"><div><span className="eyebrow"><TermTip id="tajikAspect" lang={lang}>{hi ? 'ताजिक दृष्टि' : 'Tajik aspects'}</TermTip></span><h2>{c.yogas}</h2></div></div>
            {r.yogas.length === 0 ? <p className="text-foreground">{c.noYogas}</p> : (
              <ul className="space-y-2">
                {r.yogas.map((y, i) => (
                  <li key={i} className="rounded-xl border border-border p-3 text-foreground">
                    <strong><TermTip id={YOGA_TERM[y.kind]} lang={lang}>{YOGA_NAME[lang][y.kind]}</TermTip>:</strong>{' '}
                    {c.yogaText(y.kind, P(y.planets[0]), P(y.planets[1]), y.via ? P(y.via) : undefined)}
                    {y.gap !== undefined && <span className="text-xs text-muted-foreground"> ({Math.abs(y.gap).toFixed(1)}° / {y.orb}°)</span>}
                  </li>
                ))}
              </ul>
            )}

            <h3 className="text-lg font-bold text-foreground mt-6"><TermTip id="panchaAdhikari" lang={lang}>{c.selection}</TermTip></h3>
            <div className="table-scroll" style={{ overflowX: 'auto' }}>
              <table className="data-table w-full text-sm" data-testid="varshphal-adhikaris">
                <thead><tr><th className="text-left p-1.5">{c.role}</th><th className="text-left p-1.5">{c.candidate}</th><th className="text-left p-1.5">{c.aspects}</th><th className="text-left p-1.5">{c.strength}</th></tr></thead>
                <tbody>
                  {r.adhikaris.map(a => {
                    const cand = r.candidates.find(x => x.roles.includes(a.role));
                    return (
                      <tr key={a.role}>
                        <td className="p-1.5 border-t border-border">{ROLE_LABEL[a.role][lang]}</td>
                        <td className="p-1.5 border-t border-border">{P(a.planet)}{cand && cand.planet !== a.planet ? ` → ${P(cand.planet)}` : ''}</td>
                        <td className="p-1.5 border-t border-border">{cand ? (cand.aspectsLagna ? c.yes : c.no) : '—'}</td>
                        <td className="p-1.5 border-t border-border">{cand ? cand.vimshopaka.toFixed(1) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-foreground mt-2">{c.chosen(P(r.varshesh.planet), r.varshesh.rule)}</p>
          </section>

          {o.remedies.length > 0 && (
            <section className="section" data-testid="varshphal-remedies">
              <div className="section-head"><div><span className="eyebrow">{hi ? 'उपाय' : 'Remedies'}</span><h2>{c.remedies}</h2></div></div>
              <div className="space-y-3">
                {o.remedies.map(rm => (
                  <div key={rm.planet}>
                    <p className="text-foreground mb-1">{rm.why}</p>
                    <Remedies remedyKey={planetRemedyKey(rm.planet)} lang={lang} testid={`varshphal-remedy-${rm.planet.toLowerCase()}`} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section white">
            <div className="inline-actions">
              <button data-testid="varshphal-download-pdf" type="button" className="btn secondary" onClick={() => void downloadPdf()}>{c.pdf}</button>
              <Link className="btn secondary" to={kundaliHref}>{c.kundali}</Link>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{c.method}</p>
          </section>
        </div>
      )}

      <VarshphalGuide lang={lang} />
    </PajPage>
  );
}

const YOGA_TERM: Record<string, string> = { ithasala: 'ithasala', ishrafa: 'ishrafa', nakta: 'naktaYamaya', yamaya: 'naktaYamaya', kamboola: 'kamboola' };
const YOGA_NAME: Record<Lang, Record<string, string>> = {
  en: { ithasala: 'Ithasala', ishrafa: 'Ishrafa', nakta: 'Nakta', yamaya: 'Yamaya', kamboola: 'Kamboola' },
  hi: { ithasala: 'इत्थशाल', ishrafa: 'ईशराफ', nakta: 'नक्त', yamaya: 'यमया', kamboola: 'कंबूल' },
};
