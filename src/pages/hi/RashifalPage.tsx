import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { computeRashifal, RASHIS } from '@/lib/vedic/rashifal';

/**
 * आज का राशिफल (computed). Replaces the old static rashifalData lookup with the
 * same gochar engine behind /rashifal — so the Hindi reading genuinely changes
 * by date and sign (F-RASHIFAL), instead of a fixed "आज का राशिफल" string.
 *
 * The legacy Hindi slugs (mesha, vrisha, …) stay valid for existing links /
 * prerendered URLs; they map to the engine's sign index here.
 */
const HI_SLUG_TO_INDEX: Record<string, number> = {
  mesha: 0, vrisha: 1, mithuna: 2, karka: 3, simha: 4, kanya: 5,
  tula: 6, vrischika: 7, dhanu: 8, makara: 9, kumbha: 10, meena: 11,
};
const HI_SLUGS = Object.keys(HI_SLUG_TO_INDEX);

export default function RashifalPage() {
  const { rashi } = useParams<{ rashi: string }>();
  const idx = rashi != null ? HI_SLUG_TO_INDEX[rashi] : undefined;

  const todayKey = new Date().toISOString().slice(0, 10);
  const data = useMemo(() => (idx == null ? null : computeRashifal(idx, 'today', new Date())), [idx, todayKey]);

  if (idx == null || !data) {
    return (
      <ToolLayout
        theme="vedic"
        testId="rashifal-page"
        seo={<SEO title="राशिफल — आज का राशिफल | BornClock" description="अपनी राशि चुनें और आज का राशिफल पढ़ें — ग्रहों की वास्तविक चाल से गणना किया गया।" canonicalUrl="/hi/rashifal" />}
        breadcrumb={{ current: 'राशिफल' }}
        h1="राशिफल"
      >
        <section className="section">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <p className="text-muted-foreground mb-4">कृपया एक मान्य राशि चुनें:</p>
            <div className="flex flex-wrap gap-2">
              {HI_SLUGS.map(s => (
                <Link key={s} to={`/hi/rashifal/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">
                  {RASHIS[HI_SLUG_TO_INDEX[s]].hindi}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const meta = RASHIS[idx];
  const dateNice = new Date(data.dateRange.startISO + 'T00:00:00Z').toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const overview = data.sections[0];
  const love = data.sections.find(s => s.key === 'love')!;
  const career = data.sections.find(s => s.key === 'career')!;
  const money = data.sections.find(s => s.key === 'money')!;
  const health = data.sections.find(s => s.key === 'health')!;

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-page"
      seo={(
        <SEO
          title={`${meta.hindi} राशिफल — आज का राशिफल (${meta.english}) | BornClock`}
          description={`${meta.hindi} राशि का आज का राशिफल — ग्रहों की वास्तविक चाल (गोचर) से गणना किया गया। प्रेम, करियर, धन और स्वास्थ्य। स्वामी ग्रह ${meta.lordHindi}।`}
          canonicalUrl={`/hi/rashifal/${rashi}`}
        />
      )}
      breadcrumb={{ trail: [{ label: 'राशिफल', to: '/hi/rashifal' }], current: meta.hindi }}
      h1={`${meta.hindi} राशिफल`}
      lead={`स्वामी ग्रह: ${meta.lordHindi} · ${meta.english} · ${dateNice}`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="rounded-2xl border border-border p-5 mb-6 bg-gradient-to-br from-card to-muted/20">
            <h2 className="font-semibold text-foreground mb-1">आज का सारांश</h2>
            <p className="text-foreground leading-relaxed">{overview.textHi}</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <h2 className="font-semibold text-foreground mb-1">प्रेम व संबंध</h2>
              <p className="text-muted-foreground">{love.textHi}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <h2 className="font-semibold text-foreground mb-1">करियर व कार्य</h2>
              <p className="text-muted-foreground">{career.textHi}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <h2 className="font-semibold text-foreground mb-1">धन व वित्त</h2>
              <p className="text-muted-foreground">{money.textHi}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <h2 className="font-semibold text-foreground mb-1">स्वास्थ्य</h2>
              <p className="text-muted-foreground">{health.textHi}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1.5 rounded-lg border border-border text-foreground">शुभ रंग: <strong>{meta.luckyColorHindi}</strong></span>
            <span className="px-3 py-1.5 rounded-lg border border-border text-foreground">शुभ अंक: <strong>{meta.luckyNumbers.join(', ')}</strong></span>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            यह राशिफल ग्रहों की वास्तविक सिडरियल (लाहिड़ी) स्थिति और गोचर नियमों से गणना किया गया है — वही इंजन जो आपकी कुंडली बनाता है। विस्तृत साप्ताहिक/मासिक/वार्षिक राशिफल के लिए{' '}
            <Link to={`/rashifal/${meta.slug}/today`} className="underline">अंग्रेज़ी राशिफल</Link> देखें।
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {HI_SLUGS.filter(s => s !== rashi).map(s => (
              <Link key={s} to={`/hi/rashifal/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                {RASHIS[HI_SLUG_TO_INDEX[s]].hindi}
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">अपनी पूरी कुंडली बनाएं</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
              कुंडली बनाएं →
            </Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
