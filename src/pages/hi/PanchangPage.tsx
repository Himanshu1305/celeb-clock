/**
 * आज का पंचांग (Hindi Panchang) — P4-LANG.
 * Hindi version of /panchang, reusing the SAME computeDayPanchang engine, so
 * the Hindi page shows the identical, real, date/city-computed values — only
 * the UI copy is translated. Machine-assisted Hindi, flagged for human review
 * (AutoTranslatedNotice) per the P4 language rule.
 */
import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { AutoTranslatedNotice } from '@/components/AutoTranslatedNotice';
import { computeDayPanchang, PANCHANG_CITIES, type TimeWindow } from '@/lib/vedic/panchangDay';

const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];
const KARANA_FIXED_END = ['Shakuni', 'Chatushpada', 'Naga'];
function karanaName(i: number): string {
  if (i <= 0) return 'Kimstughna';
  if (i >= 57) return KARANA_FIXED_END[Math.min(2, i - 57)];
  return KARANA_MOVABLE[(i - 1) % 7];
}

const WEEKDAY_HI: Record<string, string> = {
  Sunday: 'रविवार', Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
  Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार',
};
const CITY_HI: Record<string, string> = {
  delhi: 'दिल्ली', mumbai: 'मुंबई', bengaluru: 'बेंगलुरु', kolkata: 'कोलकाता',
  chennai: 'चेन्नई', hyderabad: 'हैदराबाद', pune: 'पुणे', ahmedabad: 'अहमदाबाद',
  jaipur: 'जयपुर', lucknow: 'लखनऊ',
};
const cityHi = (slug: string, fallback: string) => CITY_HI[slug] || fallback;

const QUALITY_STYLE: Record<TimeWindow['quality'], string> = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  neutral: 'bg-slate-50 border-slate-200 text-slate-700',
  bad: 'bg-rose-50 border-rose-200 text-rose-800',
};

function ChoghadiyaRow({ c }: { c: TimeWindow }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${QUALITY_STYLE[c.quality]}`}>
      <span className="font-medium">{c.name}</span>
      <span className="tabular-nums">{c.start}–{c.end}</span>
    </div>
  );
}

export default function HindiPanchangPage() {
  const { city: cityParam } = useParams<{ city?: string }>();
  const initial = PANCHANG_CITIES.find(c => c.slug === cityParam) || PANCHANG_CITIES[0];
  const [citySlug, setCitySlug] = useState(initial.slug);
  const city = PANCHANG_CITIES.find(c => c.slug === citySlug) || PANCHANG_CITIES[0];
  const cityName = cityHi(city.slug, city.name);

  const todayKey = new Date().toISOString().slice(0, 10);
  const p = useMemo(
    () => computeDayPanchang(new Date(), city.lat, city.lon, city.tz, city.name),
    [city.slug, todayKey],
  );

  const dateNice = new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const faqItems = [
    { question: 'पंचांग क्या है?', answer: 'पंचांग ("पाँच अंग") किसी दिन का वैदिक पंचांग है: तिथि (चंद्र दिवस), नक्षत्र (चंद्रमा का तारा), योग, करण और वार (सप्ताह का दिन)। इससे दिन की गुणवत्ता समझी जाती है और शुभ समय चुना जाता है।' },
    { question: 'राहु काल क्या है?', answer: 'राहु काल दिन का लगभग 90 मिनट का एक काल है जिसे महत्वपूर्ण कार्य शुरू करने के लिए अशुभ माना जाता है। यह दिन के प्रकाश के आठ बराबर भागों में से एक है और वार के अनुसार बदलता है — इसलिए इसे आपके शहर के वास्तविक सूर्योदय और सूर्यास्त से गणना किया गया है।' },
    { question: 'चौघड़िया क्या है?', answer: 'चौघड़िया दिन और रात को आठ-आठ भागों में बाँटता है — अमृत, शुभ, लाभ (शुभ), चर (सामान्य) तथा उद्वेग, काल, रोग (बचें)। किसी कार्य के लिए शुभ समय चुनने का यह एक सरल, लोकप्रिय तरीका है।' },
    { question: 'समय कितने सटीक हैं?', answer: 'सूर्योदय, सूर्यास्त और सभी काल आपके शहर के अक्षांश-देशांतर के लिए सूर्य की वास्तविक खगोलीय स्थिति से गणना किए गए हैं। किसी स्थापित पंचांग (जैसे Drik Panchang) से तुलना करने पर ये एक-दो मिनट के भीतर मेल खाने चाहिए।' },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="hi-panchang-page"
      seo={<SEO
        title={`आज का पंचांग${cityName ? ` — ${cityName}` : ''} | तिथि, नक्षत्र, राहु काल व चौघड़िया | BornClock`}
        description={`${cityName} का आज का पंचांग: तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त, राहु काल, गुलिक, यमगण्ड और दिन-रात का चौघड़िया — वास्तविक सूर्योदय/सूर्यास्त से गणना।`}
        canonicalUrl={cityParam ? `/hi/panchang/${city.slug}` : '/hi/panchang'}
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'राशिफल', to: '/hi/rashifal' }], current: `पंचांग · ${cityName}` }}
      footer={{ tagline: 'वास्तविक सूर्योदय और सूर्यास्त से गणना किया गया दैनिक पंचांग।', nav: [{ label: 'राशिफल', to: '/hi/rashifal' }, { label: 'Panchang (English)', to: '/panchang' }, { label: 'मुहूर्त', to: '/muhurat' }] }}
      eyebrow="पंचांग"
      h1={`आज का पंचांग — ${cityName}`}
      lead={dateNice}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <AutoTranslatedNotice lang="hi" />

          {/* City selector */}
          <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="hi-panchang-cities">
            <span className="text-sm text-muted-foreground">शहर:</span>
            {PANCHANG_CITIES.map(c => (
              <button
                key={c.slug}
                onClick={() => setCitySlug(c.slug)}
                className={`px-3 py-1 rounded-lg border text-sm ${c.slug === city.slug ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}
              >
                {cityHi(c.slug, c.name)}
              </button>
            ))}
          </div>

          {/* Five limbs */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6" data-testid="hi-panchang-limbs">
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">तिथि</div>
              <div className="font-semibold text-foreground">{p.tithiName} <span className="text-muted-foreground font-normal">({p.paksha} पक्ष)</span></div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">नक्षत्र</div>
              <div className="font-semibold text-foreground">{p.nakshatra}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">योग</div>
              <div className="font-semibold text-foreground">{p.yoga}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">करण · वार</div>
              <div className="font-semibold text-foreground">{karanaName(p.karana)} · {WEEKDAY_HI[p.weekday] || p.weekday}</div>
            </div>
          </div>

          {/* Sun + inauspicious windows */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-border p-4" data-testid="hi-panchang-sun">
              <h2 className="font-semibold text-foreground mb-2">सूर्य</h2>
              <div className="text-sm text-muted-foreground">सूर्योदय <strong className="text-foreground tabular-nums">{p.sunrise}</strong> · सूर्यास्त <strong className="text-foreground tabular-nums">{p.sunset}</strong></div>
            </div>
            <div className="rounded-xl border border-border p-4" data-testid="hi-panchang-windows">
              <h2 className="font-semibold text-foreground mb-2">अशुभ काल</h2>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between"><span>राहु काल</span><span className="tabular-nums text-rose-700">{p.rahuKaal.start}–{p.rahuKaal.end}</span></li>
                <li className="flex justify-between"><span>गुलिक काल</span><span className="tabular-nums">{p.gulikaKaal.start}–{p.gulikaKaal.end}</span></li>
                <li className="flex justify-between"><span>यमगण्ड</span><span className="tabular-nums">{p.yamaganda.start}–{p.yamaganda.end}</span></li>
              </ul>
            </div>
          </div>

          {/* Choghadiya */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8" data-testid="hi-panchang-choghadiya">
            <div>
              <h2 className="font-semibold text-foreground mb-2">दिन का चौघड़िया</h2>
              <div className="space-y-1">{p.dayChoghadiya.map((c, i) => <ChoghadiyaRow key={i} c={c} />)}</div>
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-2">रात का चौघड़िया</h2>
              <div className="space-y-1">{p.nightChoghadiya.map((c, i) => <ChoghadiyaRow key={i} c={c} />)}</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-8">
            सूर्योदय, सूर्यास्त और प्रत्येक काल {cityName} के निर्देशांकों के लिए सूर्य की वास्तविक खगोलीय स्थिति से गणना किए गए हैं, और पाँच अंग सायन (Lahiri) सूर्य-चंद्र से — वही इंजन जो आपकी कुंडली के पीछे है।{' '}
            <Link to="/panchang" className="underline">View in English →</Link>
          </p>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">कोई महत्वपूर्ण कार्य के लिए तिथि चुन रहे हैं? शुभ मुहूर्त खोजें।</p>
            <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">मुहूर्त खोजें →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
