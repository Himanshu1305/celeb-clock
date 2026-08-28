import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is Australia's life expectancy?", answer: 'Approximately 83.2 years as of 2023. Women average 85.2 years and men 81.2 years. Australia consistently ranks in the top 5-10 countries globally for life expectancy.' },
  { question: 'Why do Australians live so long?', answer: 'Several factors contribute: universal Medicare providing healthcare access to all residents; high rates of outdoor physical activity; strong food safety regulation; relatively low smoking rates; and a diverse diet influenced by Mediterranean and Asian food cultures in major cities.' },
  { question: 'Is there a life expectancy gap between Indigenous and non-Indigenous Australians?', answer: 'Yes — a significant one. Aboriginal and Torres Strait Islander Australians have a life expectancy approximately 8 years lower than non-Indigenous Australians, attributed to higher rates of chronic disease, poorer healthcare access in remote communities, and socioeconomic disadvantage. Closing this gap is a stated priority of the Australian government.' },
  { question: 'How does Australian life expectancy compare to the UK and USA?', answer: 'Australia (83.2) significantly outperforms both UK (81.3) and USA (77.5) — a gap of nearly 6 years over the USA. The difference is attributed to universal healthcare, lower obesity rates, more active lifestyles, and stronger social safety nets.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyAustralia = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in Australia — 2026 Data & Why Australians Live So Long"
        description="Australia's life expectancy is 83.2 years — among the highest in the world. Here's what drives it and where the gaps remain."
        keywords="life expectancy Australia, Australian lifespan 2026, how long do Australians live, Australia longevity"
        canonicalUrl="/life-expectancy-australia"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in Australia"
        description="Australia's life expectancy is 83.2 years — what drives one of the world's longest-lived populations and where gaps remain."
        url="/life-expectancy-australia"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in Australia — Why Australians Are Among the World's Longest-Lived
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'AIHW', 'WHO']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Australia's average life expectancy is approximately 83.2 years as of 2023 — one of the highest of any nation. Women average 85.2 years; men average 81.2 years. Australia has maintained this position for decades through universal healthcare, outdoor lifestyle culture, and strong public health investment.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What Drives Australian Longevity</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Universal Medicare, in place since 1984, means care is not gated by income — a structural advantage that shows up directly in the numbers. On top of that sits a genuinely outdoor culture, with high rates of everyday physical activity.</p>
            <p className="text-muted-foreground leading-relaxed">Strong food-safety standards and lower smoking rates than most comparable nations help, and decades of diverse immigration have brought Mediterranean and Asian food cultures into urban kitchens, widening the range of protective diets.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Indigenous Health Gap</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The headline figure conceals a serious inequity. Aboriginal and Torres Strait Islander Australians live roughly 8 years less than non-Indigenous Australians — one of the largest such gaps in any wealthy nation.</p>
            <p className="text-muted-foreground leading-relaxed">It is driven by poorer healthcare access in remote communities, socioeconomic disadvantage, and the long-term health impact of historical policies. Closing it is a stated national priority.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Australia vs Comparable Nations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Australia ranks alongside Switzerland, Japan and Spain at the very top of the global longevity tables, and comfortably outperforms both the UK (81.3) and the USA (77.5).</p>
            <p className="text-muted-foreground leading-relaxed">It sits in the same band as the Scandinavian countries and lands consistently in the global top ten for both male and female life expectancy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Australian Lifestyle Factors Researchers Study</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The outdoor culture and high sun exposure cut both ways — good for activity, though skin-cancer risk is a real countervailing factor that requires attention. Urban populations increasingly follow a Mediterranean-influenced diet.</p>
            <p className="text-muted-foreground leading-relaxed">Strong social networks, relatively low work stress compared with East Asian economies, and high walkability in coastal cities round out the picture. See how these levers move your own number with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare Australia Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how Australia ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Australia Life Expectancy FAQs</h2>
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

export default LifeExpectancyAustralia;
