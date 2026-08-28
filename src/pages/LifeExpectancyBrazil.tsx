import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is Brazil's life expectancy?", answer: 'Approximately 74.6 years as of 2023. Women average 78.5 years and men 70.9 years. Brazil has improved significantly from 54 years in 1960 but faces persistent inequality challenges that create large gaps between regions and income groups.' },
  { question: 'Why is there such a large gender gap in Brazilian life expectancy?', answer: "The 7.6-year gap between women and men is primarily driven by high male homicide rates and road accident mortality. Brazil has one of the world's highest homicide rates at 22.4 per 100,000, with young men disproportionately affected. Workplace accident rates and higher male smoking rates also contribute." },
  { question: 'How does inequality affect life expectancy in Brazil?', answer: 'Dramatically. Wealthy neighborhoods in São Paulo have life expectancy above 80 years — comparable to Western Europe. Poor northeastern regions average 10-12 years less. Race compounds this: Afro-Brazilian populations face significantly higher mortality rates at every age compared to white Brazilians.' },
  { question: "What is Brazil's SUS healthcare system?", answer: 'SUS (Sistema Único de Saúde) is Brazil\'s constitutional universal health system providing free healthcare to all Brazilians since 1988. The Família Saúde community health program — which places health workers directly in communities — is credited with dramatically reducing infant mortality in the northeast and is studied as a model globally.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyBrazil = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in Brazil — 2026 Data, Inequality & Regional Gaps"
        description="Brazil's life expectancy is 74.6 years. Here's how inequality, violence, and regional gaps shape Brazilian longevity — and what's improving."
        keywords="life expectancy Brazil, Brazilian lifespan 2026, how long do Brazilians live, Brazil longevity"
        canonicalUrl="/life-expectancy-brazil"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in Brazil"
        description="Brazil's life expectancy is 74.6 years — progress, inequality, and the regional divide behind the number."
        url="/life-expectancy-brazil"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in Brazil — Progress, Inequality, and the Regional Divide
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'WHO', 'IBGE']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Brazil's average life expectancy is approximately 74.6 years as of 2023. Women average 78.5 years; men average 70.9 years — a large 7.6-year gender gap driven significantly by high male homicide and accident rates. Brazil has improved substantially since 1960 (when life expectancy was 54 years) but inequality remains the central challenge.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Inequality Dimension</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Brazil has one of the world's highest income-inequality measures, and it maps directly onto lifespan. Wealthy São Paulo neighbourhoods reach above 80 years, while poor northeastern regions average 10-12 years less.</p>
            <p className="text-muted-foreground leading-relaxed">Race compounds geography: Afro-Brazilian populations face significantly higher mortality at younger ages, reflecting historical inequities in education, income and healthcare access rather than any biological difference.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Violence as a Health Crisis</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Brazil carries one of the world's highest homicide rates — around 22.4 per 100,000 — and it falls disproportionately on young men, making it the primary driver of the 7.6-year gender gap.</p>
            <p className="text-muted-foreground leading-relaxed">Road-accident mortality is also among the highest in Latin America. These are structural causes, not individual lifestyle choices, which is what makes them so hard to shift.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">SUS — Brazil's Universal Health System</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The Sistema Único de Saúde has provided universal coverage to all Brazilians since 1988 and is one of the largest public-health systems on Earth.</p>
            <p className="text-muted-foreground leading-relaxed">Its Família Saúde community-health programme — placing health workers directly inside communities — is credited with cutting infant mortality by around 75% in the northeast and is studied globally as a model.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What's Actually Improving</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Childhood immunisation rates are among the highest globally, Brazil's HIV-treatment programme is internationally recognised, and infant mortality has fallen from 60 per 1,000 in 1990 to 13 in 2023.</p>
            <p className="text-muted-foreground leading-relaxed">Cardiovascular mortality is declining, diabetes management is improving in urban areas, and cancer screening is expanding. See how your own habits change your forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare Brazil Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how Brazil ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Brazil Life Expectancy FAQs</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="rounded-xl border border-border p-5 bg-white/50">
                <p className="font-semibold text-foreground mb-2">{item.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED.map((t) => (
              <Link key={t.path} to={t.path} className="block rounded-xl border border-border p-4 font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {t.label} →
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default LifeExpectancyBrazil;
