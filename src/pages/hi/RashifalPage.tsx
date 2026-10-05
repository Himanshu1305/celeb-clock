import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { RASHIFAL, RASHIFAL_SLUGS } from '@/data/rashifalData';

export default function RashifalPage() {
  const { rashi } = useParams<{ rashi: string }>();
  const entry = rashi ? RASHIFAL[rashi] : undefined;

  if (!entry) {
    return (
      <ToolLayout
        theme="vedic"
        testId="rashifal-page"
        seo={<SEO title="राशिफल — आज का राशिफल | BornClock" description="अपनी राशि चुनें और आज का राशिफल पढ़ें।" canonicalUrl="/hi/rashifal" />}
        breadcrumb={{ current: 'राशिफल' }}
        h1="राशिफल"
      >
        <section className="section">
          <p className="text-muted-foreground mb-4">कृपया एक मान्य राशि चुनें:</p>
          <div className="flex flex-wrap gap-2">
            {RASHIFAL_SLUGS.map(s => (
              <Link key={s} to={`/hi/rashifal/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-primary/5">
                {RASHIFAL[s].hindi}
              </Link>
            ))}
          </div>
        </section>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-page"
      seo={(
        <SEO
          title={`${entry.hindi} राशिफल — आज का राशिफल (${entry.english}) | BornClock`}
          description={`${entry.hindi} राशि का आज का राशिफल — प्रेम, करियर और स्वास्थ्य। स्वामी ग्रह ${entry.ruler}।`}
          canonicalUrl={`/hi/rashifal/${entry.slug}`}
        />
      )}
      breadcrumb={{ trail: [{ label: 'राशिफल', to: '/hi/rashifal' }], current: entry.hindi }}
      h1={`${entry.hindi} राशिफल`}
      lead={`स्वामी ग्रह: ${entry.ruler} · ${entry.english}`}
    >
      <section className="section">
        <p className="text-foreground leading-relaxed mb-6">{entry.intro}</p>

        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground mb-1">प्रेम व संबंध</h2>
            <p className="text-muted-foreground">{entry.love}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground mb-1">करियर व धन</h2>
            <p className="text-muted-foreground">{entry.career}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground mb-1">स्वास्थ्य</h2>
            <p className="text-muted-foreground">{entry.health}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {RASHIFAL_SLUGS.filter(s => s !== entry.slug).map(s => (
            <Link key={s} to={`/hi/rashifal/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
              {RASHIFAL[s].hindi}
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-3">अपनी पूरी कुंडली बनाएं</p>
          <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
            कुंडली बनाएं →
          </Link>
        </div>
      </section>
    </ToolLayout>
  );
}
