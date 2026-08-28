import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is the UK's life expectancy in 2026?", answer: 'Approximately 81.3 years based on 2023 UN data. Women average 83.1 years and men 79.4 years. England has slightly higher figures than Scotland, Wales, and Northern Ireland.' },
  { question: 'Why is there such a big regional gap in UK life expectancy?', answer: 'The gap between healthiest and least healthy UK regions reaches 10-12 years. Main drivers are deprivation, unemployment, diet quality, housing conditions, and healthcare access. Scotland — particularly Glasgow — has historically had worse outcomes than comparable European cities even after controlling for socioeconomic factors.' },
  { question: 'How does UK life expectancy compare to Europe?', answer: 'The UK sits below the Western European average. France (82.3), Spain (83.3), Italy (82.9), and Switzerland (83.4) all have higher life expectancy. The gap is attributed to higher UK obesity rates, higher alcohol consumption in some regions, and historically higher smoking rates.' },
  { question: 'Did COVID significantly affect UK life expectancy?', answer: 'Yes — UK life expectancy fell by approximately 1.3 years between 2019 and 2021. It has largely recovered since, though NHS waiting list backlogs are now considered a secondary mortality risk affecting tens of thousands of patients annually.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyUK = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in the UK — 2026 Data, Regional Gaps & Key Drivers"
        description="UK life expectancy is 81.3 years, but there's a 10-year gap between the healthiest and least healthy regions. Here's what the data shows."
        keywords="life expectancy UK, United Kingdom life expectancy 2026, British lifespan, average life expectancy England"
        canonicalUrl="/life-expectancy-uk"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in the UK"
        description="UK life expectancy is 81.3 years — the national average, the regional reality, and the key drivers behind both."
        url="/life-expectancy-uk"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in the UK — The National Average and the Regional Reality
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'ONS', 'WHO']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              The United Kingdom's average life expectancy is approximately 81.3 years as of 2023. Women average 83.1 years; men average 79.4 years. The UK has some of the most dramatic regional life expectancy gaps of any wealthy nation — up to 12 years between the healthiest and least healthy areas.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The North-South Divide</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The national average hides a chasm. A man in Glasgow can expect around 73 years; a man in Kensington &amp; Chelsea around 85 — a 12-year gap inside one country. Poverty, unemployment, diet and healthcare access all feed into it.</p>
            <p className="text-muted-foreground leading-relaxed">There is also the so-called "Glasgow effect": worse health outcomes than comparable European cities even after deprivation is accounted for — a documented phenomenon that researchers are still trying to fully explain.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How the NHS Affects Longevity</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Universal coverage since 1948 guarantees basic access regardless of income, and strong preventive-care programmes catch a great deal early. That floor under everyone matters.</p>
            <p className="text-muted-foreground leading-relaxed">But growing waiting times and declining GP access since COVID are now affecting outcomes, and the NHS backlog is increasingly treated as a secondary mortality risk in its own right.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">UK vs Comparable European Nations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">At 81.3 years the UK sits just below France (82.3), Spain (83.3) and Switzerland (83.4). The distance is small in headline terms but consistent.</p>
            <p className="text-muted-foreground leading-relaxed">Higher obesity rates than most of Western Europe, higher alcohol consumption in some regions, and a legacy of higher smoking rates now in decline all help explain the shortfall.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What's Actually Improving</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Smoking rates are at historic lows, cancer survival is improving significantly, and cardiovascular mortality continues to decline. The trend lines are broadly positive.</p>
            <p className="text-muted-foreground leading-relaxed">Life expectancy at 65 is competitive with European peers — the shortfall is concentrated in younger-age mortality from avoidable causes. See how your own habits change your forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare the UK Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how the UK ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">UK Life Expectancy FAQs</h2>
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

export default LifeExpectancyUK;
