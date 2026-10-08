import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { VARGAS, vargaBySlug } from '@/data/divisionalCharts';

export default function DivisionalChartPage() {
  const { slug } = useParams<{ slug: string }>();
  const varga = slug ? vargaBySlug(slug) : undefined;

  // Hub
  if (!slug || !varga) {
    return (
      <ToolLayout
        theme="vedic"
        testId="divisional-hub"
        seo={<SEO title="Divisional Charts (Vargas) — D1 to D60 Explained | BornClock" description="The Vedic divisional charts (vargas) explained plainly — D9 Navamsa (marriage), D10 Dasamsa (career), D7 Saptamsha (children), D4 (property), D24 (education) and more." canonicalUrl="/divisional-charts" ogImage="https://bornclock.com/og/vedic.png" />}
        breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Divisional charts' }}
        footer={{ tagline: 'Every varga, explained plainly.', nav: [{ label: 'Free Kundli', to: '/kundali' }, { label: 'Vedic yogas', to: '/yoga' }] }}
        eyebrow="Vedic charts"
        h1="Divisional charts (Vargas) — D1 to D60"
        lead="A divisional chart zooms into one area of life by subdividing each sign. Here is what each varga shows, how it is built, and how to read it."
      >
        <section className="section">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="grid sm:grid-cols-2 gap-3" data-testid="varga-grid">
              {VARGAS.map(v => (
                <Link key={v.slug} to={`/divisional-charts/${v.slug}`} className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                  <div className="font-semibold text-foreground">{v.label}</div>
                  <p className="text-sm text-muted-foreground mt-1">{v.lifeArea}</p>
                  {v.computedByBornClock && <span className="inline-block mt-2 text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Computed in your Kundli</span>}
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">“Computed in your Kundli” marks the vargas BornClock calculates today (D1, D9, D10, D60). The others are explained here; we’ll add their computation over time.</p>
          </div>
        </section>
      </ToolLayout>
    );
  }

  const title = `${varga.label} — Meaning & How to Read It | BornClock`;
  const description = `${varga.label}: the divisional chart for ${varga.lifeArea}. What it shows, how it is computed and how to read it against your main (D1) chart.`;
  const others = VARGAS.filter(v => v.slug !== varga.slug);

  const faqItems = [
    { question: `What does the ${varga.label} show?`, answer: varga.whatItShows },
    { question: `How is the ${varga.name} calculated?`, answer: `${varga.howComputed} The planet’s position within the sign decides which sub-part — and therefore which new sign — it maps to in the ${varga.name}.` },
    { question: `Does BornClock compute the ${varga.name}?`, answer: varga.computedByBornClock ? `Yes — your free Kundli computes the ${varga.name} and reads it against your main chart.` : `Not yet. Your Kundli currently computes the D1, D9 (Navamsa), D10 (Dasamsa) and D60. This page explains the ${varga.name} so you can interpret it; we are expanding divisional-chart computation over time.` },
  ];

  return (
    <ToolLayout
      theme="vedic"
      testId="divisional-chart"
      seo={<SEO title={title} description={description} canonicalUrl={`/divisional-charts/${varga.slug}`} ogImage="https://bornclock.com/og/vedic.png" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }, { label: 'Divisional charts', to: '/divisional-charts' }], current: varga.label }}
      footer={{ tagline: 'Vedic divisional charts, explained.', nav: [{ label: 'All vargas', to: '/divisional-charts' }, { label: 'Free Kundli', to: '/kundali' }], note: 'Divisional charts refine the main chart; a result is trusted only when the D1 agrees. Very high divisions need an accurate birth time.' }}
      eyebrow={`Varga · ${varga.label}`}
      h1={`${varga.label}`}
      lead={`For ${varga.lifeArea}`}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {varga.computedByBornClock && (
            <div className="mb-4"><span className="inline-block text-xs px-2 py-0.5 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-800">Computed in your free Kundli</span></div>
          )}
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">What it shows</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{varga.whatItShows}</p>
          </div>
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-1">How it is computed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{varga.howComputed}</p>
          </div>
          <div className="rounded-xl border border-border p-4 mb-6">
            <h2 className="font-semibold text-foreground mb-1">How to read it</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{varga.howToRead}</p>
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            A varga is read against your main (<TermTip id="rashi">Rashi</TermTip>) chart — never alone.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate this →</Link>
          </p>

          <h2 className="font-semibold text-foreground mb-2">Other divisional charts</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {others.map(v => (
              <Link key={v.slug} to={`/divisional-charts/${v.slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{v.label.split(' ')[0]}</Link>
            ))}
          </div>

          <PageFAQ items={faqItems} />

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">{varga.computedByBornClock ? `See your ${varga.name} in your free Kundli.` : 'See your D1, Navamsa (D9), Dasamsa (D10) and D60 in your free Kundli.'}</p>
            <Link to="/kundali" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
