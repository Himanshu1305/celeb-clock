/**
 * आज का पंचांग (Hindi Panchang) — P4-LANG; on the shared daily-page mechanism since
 * batch 7 (W7), so it shows TODAY between deploys. The day's text comes from the same
 * per-city data as the English pages, rendered by the Hindi template
 * (src/lib/daily/kinds/panchangTemplate.ts renderPanchangHiEntry). Machine-assisted
 * Hindi, flagged for human review (AutoTranslatedNotice) per the P4 language rule.
 */
import { Link, useParams } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { AutoTranslatedNotice } from '@/components/AutoTranslatedNotice';
import { TermTip } from '@/components/vedic/TermTip';
import { PANCHANG_CITIES } from '@/lib/vedic/panchangDay';
import { HINDI_PANCHANG_SLUGS } from '@/lib/seo/panchangSlugs';
import { cityHi } from '@/lib/vedic/panchangHindi';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { hindiPanchangMeta, PANCHANG_INDEX_SLUG } from '@/lib/daily/kinds/panchangTemplate';
import { formatLongDateHi, istDateISO } from '@/lib/daily/dates';

// Hindi pages exist for 10 cities (batch 7 grew the English list to 50).
const HI_CITIES = PANCHANG_CITIES.filter(c => HINDI_PANCHANG_SLUGS.has(c.slug));

export default function HindiPanchangPage() {
  const { city: cityParam } = useParams<{ city?: string }>();
  const city = HI_CITIES.find(c => c.slug === cityParam) || HI_CITIES.find(c => c.slug === 'delhi')!;
  const slug = cityParam ? city.slug : PANCHANG_INDEX_SLUG;
  const { entry } = useDailyEntry('panchang-hi', slug);
  const meta = hindiPanchangMeta(slug);
  const cityName = cityHi(city.slug, city.name);
  const path = cityParam ? `/hi/panchang/${city.slug}` : '/hi/panchang';

  return (
    <ToolLayout
      theme="vedic"
      testId="hi-panchang-page"
      seo={<SEO title={meta.title} description={meta.description} canonicalUrl={path} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'राशिफल', to: '/hi/rashifal' }], current: `पंचांग · ${cityName}` }}
      footer={{ tagline: 'वास्तविक सूर्योदय और सूर्यास्त से गणना किया गया दैनिक पंचांग।', nav: [{ label: 'राशिफल', to: '/hi/rashifal' }, { label: 'Panchang (English)', to: '/panchang' }, { label: 'मुहूर्त', to: '/muhurat' }] }}
      eyebrow="पंचांग"
      h1={<DailyH1 entry={entry} fallback={meta.h1} />}
      lead={<span data-testid="hi-panchang-date">{cityParam ? '' : `${cityName} · `}<DailyDate entry={entry} fallback={formatLongDateHi(istDateISO(new Date()))} /></span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <AutoTranslatedNotice lang="hi" />
          <p className="text-sm mb-4">
            <Link to={`/panchang/${city.slug}`} className="text-primary hover:underline" data-testid="hi-panchang-english-top">English: Panchang for {city.name} — किसी भी तारीख़ और किसी भी शहर के लिए →</Link>
          </p>

          <nav aria-label="शहर" className="flex flex-wrap items-center gap-2 mb-6" data-testid="hi-panchang-cities">
            <span className="text-sm text-muted-foreground">शहर:</span>
            {HI_CITIES.map(c => (
              <Link key={c.slug} to={`/hi/panchang/${c.slug}`}
                    className={`px-3 py-1 rounded-lg border text-sm ${c.slug === city.slug && cityParam ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}>
                {cityHi(c.slug, c.name)}
              </Link>
            ))}
          </nav>

          <DailyBody entry={entry} testId="hi-panchang-daily" />
          <DailyJsonLd entry={entry} path={path} />

          <div className="rounded-xl border border-border p-4 mb-6" data-testid="hi-panchang-terms">
            <h2 className="font-semibold text-foreground mb-2">इन शब्दों का अर्थ</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="panchang" lang="hi">पंचांग</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="tithi" lang="hi">तिथि</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="paksha" lang="hi">पक्ष</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="panchangNakshatra" lang="hi">नक्षत्र</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="panchangYoga" lang="hi">योग</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="karana" lang="hi">करण</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="vara" lang="hi">वार</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="brahmaMuhurta" lang="hi">ब्रह्म मुहूर्त</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="abhijit" lang="hi">अभिजित मुहूर्त</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="amritKalam" lang="hi">अमृत काल</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="rahuKalam" lang="hi">राहु काल</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="gulikaKaal" lang="hi">गुलिक काल</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="yamaganda" lang="hi">यमगण्ड</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="durMuhurtam" lang="hi">दुर्मुहूर्त</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="varjyam" lang="hi">वर्ज्यम्</TermTip></li>
              <li className="rounded-full border border-border px-3 py-1"><TermTip id="choghadiya" lang="hi">चौघड़िया</TermTip></li>
            </ul>
          </div>

          <div className="rounded-xl border border-border p-4 mb-6 text-sm text-muted-foreground space-y-2" data-testid="hi-panchang-how">
            <h2 className="font-semibold text-foreground">यह पंचांग कैसे बनता है</h2>
            <p>पंचांग ("पाँच अंग") किसी दिन की तिथि, नक्षत्र, योग, करण और वार बताता है। ये पाँचों अंग स्थानीय सूर्योदय के समय पढ़े जाते हैं, और निरयण (लाहिड़ी अयनांश) सूर्य-चंद्र से गणना होते हैं — वही इंजन जो आपकी कुंडली के पीछे है।</p>
            <p>सूर्योदय-सूर्यास्त {cityName} के अक्षांश-देशांतर के लिए सूर्य की वास्तविक स्थिति से निकाले गए हैं। राहु काल, गुलिक और यमगण्ड दिन के आठ बराबर भागों में से एक-एक भाग हैं; अभिजित, दुर्मुहूर्त और ब्रह्म मुहूर्त दिन या रात के पंद्रहवें भाग हैं; अमृत काल और वर्ज्यम् दिन के नक्षत्र के तय हिस्से हैं। समय निकटतम मिनट तक गोल किए गए हैं।</p>
            <p><Link to={`/panchang/${city.slug}`} className="underline" data-testid="hi-panchang-english-link">View in English ({city.name}) →</Link> · <Link to="/glossary" className="underline">शब्दकोश (Glossary) →</Link></p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">कोई महत्वपूर्ण कार्य के लिए तिथि चुन रहे हैं? शुभ मुहूर्त खोजें।</p>
            <Link to="/muhurat" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">मुहूर्त खोजें →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
