import { useParams } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { RASHIS } from '@/lib/vedic/rashifal';
import { TermTip } from '@/components/vedic/TermTip';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { RASHI_SLUGS_HI } from '@/lib/daily/registry';
import { DailyTermStrip } from '@/components/daily/DailyTermStrip';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { HiRashifalGuide } from '@/content/guides/HiRashifalGuide';

const INDEX_META = GUIDE_META['/hi/rashifal'];

/**
 * आज का राशिफल (Batch 7, W1). The daily Hindi rashifal now uses the shared daily-page
 * mechanism (src/lib/daily): every India date is precomputed from the real sky with the
 * same engine as the English page, and the Worker injects today's text — so the page is
 * never stale between deploys. The legacy Hindi slugs (mesha, vrisha, …) stay the URLs.
 */
const HI_SLUG_TO_INDEX: Record<string, number> = Object.fromEntries(RASHI_SLUGS_HI.map((s, i) => [s, i]));
const HI_SLUGS = [...RASHI_SLUGS_HI];

export default function RashifalPage() {
  const { rashi } = useParams<{ rashi: string }>();
  const idx = rashi != null ? HI_SLUG_TO_INDEX[rashi] : undefined;
  const { entry } = useDailyEntry('rashifal-hi', idx == null ? null : rashi);

  if (idx == null) {
    return (
      <ToolLayout
        theme="vedic"
        testId="rashifal-page"
        seo={<SEO title={INDEX_META.title} description={INDEX_META.description} canonicalUrl="/hi/rashifal" />}
        breadcrumb={{ current: 'राशिफल' }}
        h1={INDEX_META.h1}
      >
        <section className="section">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <p className="text-muted-foreground mb-4">अपनी चंद्र राशि चुनें और आज का राशिफल पढ़ें:</p>
            <div className="flex flex-wrap gap-2">
              {HI_SLUGS.map(s => (
                <Link key={s} to={`/hi/rashifal/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">
                  {RASHIS[HI_SLUG_TO_INDEX[s]].hindi}
                </Link>
              ))}
            </div>
            <p data-testid="hi-rashifal-2027-index" className="mt-6">
              <Link to="/hi/rashifal-2027/" className="inline-block rounded-xl border border-brand-gold/50 bg-brand-gold/10 px-4 py-3 font-semibold text-brand-ink">राशिफल 2027 — सभी 12 राशियों का वार्षिक भविष्यफल →</Link>
            </p>
            <p data-testid="hi-rashifal-index-tools" className="text-sm text-muted-foreground mt-6">
              और हिंदी में: <Link to="/hi/kundli-milan/" className="underline">कुंडली मिलान (36 गुण)</Link> · <Link to="/hi/naam-se-kundli-milan/" className="underline">नाम से कुंडली मिलान</Link> · <Link to="/hi/panchang/" className="underline">पंचांग</Link> · <Link to="/hi/upay/" className="underline">उपाय</Link>
            </p>
          </div>
        </section>
        {/* B14: explanatory guide (Hindi) + FAQPage — below the sign list. */}
        <HiRashifalGuide />
      </ToolLayout>
    );
  }

  const meta = RASHIS[idx];
  const path = `/hi/rashifal/${rashi}`;

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-page"
      seo={(
        <SEO
          title={entry?.title ?? `${meta.hindi} राशिफल — आज का राशिफल (${meta.english}) | BornClock`}
          description={entry?.description ?? `${meta.hindi} राशि का आज का राशिफल — ग्रहों की वास्तविक चाल (गोचर) से गणना किया गया।`}
          canonicalUrl={path}
        />
      )}
      breadcrumb={{ trail: [{ label: 'राशिफल', to: '/hi/rashifal/' }], current: meta.hindi }}
      h1={<DailyH1 entry={entry} fallback={`${meta.hindi} राशिफल`} />}
      lead={<>स्वामी ग्रह: {meta.lordHindi} · {meta.english} · <DailyDate entry={entry} /></>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl" lang="hi">
          <Link to={`/hi/rashifal/${rashi}/2027/`} data-testid="hi-rashifal-2027-link" className="block rounded-xl border border-brand-gold/50 bg-brand-gold/10 p-4 mb-4 text-sm">
            <span className="font-semibold text-brand-ink">{meta.hindi} राशिफल 2027 पढ़ें →</span>{' '}
            <span className="text-brand-ink-soft">पूरे वर्ष का भविष्यफल — महीनेवार फल, साढ़ेसाती, ग्रहण और शुभ समय।</span>
          </Link>
          <DailyBody entry={entry} testId="rashifal-daily" />

          <DailyTermStrip
            lang="hi"
            title="इन शब्दों का अर्थ"
            terms={[
              { key: 'chandrabala', label: 'चंद्र बल' },
              { key: 'tarabala', label: 'तारा बल' },
              { key: 'nakshatra', label: 'नक्षत्र' },
              { key: 'chandrashtama', label: 'चंद्राष्टम' },
              { key: 'sadeSati', label: 'साढ़े साती' },
              { key: 'dhaiya', label: 'ढैया' },
              { key: 'choghadiya', label: 'चौघड़िया' },
              { key: 'rahuKalam', label: 'राहु काल' },
            ]}
          />

          <p className="text-xs text-muted-foreground mt-4">
            यह <TermTip id="rashifal" lang="hi">राशिफल</TermTip> ग्रहों की वास्तविक सिडरियल (<TermTip id="ayanamsa" lang="hi">लाहिड़ी</TermTip>) स्थिति और <TermTip id="gochar" lang="hi">गोचर</TermTip> नियमों से गणना किया गया है — वही इंजन जो आपकी कुंडली बनाता है। साप्ताहिक/मासिक/वार्षिक राशिफल के लिए{' '}
            <Link to={`/rashifal/${meta.slug}/today`} className="underline">अंग्रेज़ी राशिफल</Link> देखें।
          </p>

          <p className="text-sm text-muted-foreground mt-4" data-testid="rashifal-sadesati-link">
            शनि की अवधि: <Link to={`/hi/sade-sati/${rashi}`} className="underline">{meta.hindi} राशि साढ़ेसाती और ढैया — शुरू और खत्म होने की तारीख →</Link>
          </p>

          <h2 className="font-semibold text-foreground mt-8 mb-2">दूसरी राशियों का आज का राशिफल</h2>
          <div className="flex flex-wrap gap-2">
            {HI_SLUGS.filter(s => s !== rashi).map(s => (
              <Link key={s} to={`/hi/rashifal/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                {RASHIS[HI_SLUG_TO_INDEX[s]].hindi}
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">अपनी चंद्र राशि और जन्म नक्षत्र जानने के लिए अपनी पूरी कुंडली बनाएं</p>
            <Link to="/kundali/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
              कुंडली बनाएं →
            </Link>
            {/* Batch 9b: Hindi matching tools from the Hindi hub. */}
            <p data-testid="hi-rashifal-milan-links" className="text-sm text-muted-foreground mt-4">
              विवाह के लिए: <Link to="/hi/kundli-milan/" className="underline">कुंडली मिलान (36 गुण)</Link> · <Link to="/hi/naam-se-kundli-milan/" className="underline">नाम से कुंडली मिलान</Link>
            </p>
          </div>
        </div>
      </section>
      <DailyJsonLd entry={entry} path={path} />
    </ToolLayout>
  );
}
