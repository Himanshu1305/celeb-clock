import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is India's life expectancy in 2026?", answer: "Based on UN World Population Prospects 2023 data, India's life expectancy is approximately 70.9 years. Women average 72.3 years and men 69.5 years. This is expected to continue rising as healthcare access expands." },
  { question: 'Which Indian state has the highest life expectancy?', answer: 'Kerala consistently leads with approximately 75-77 years — comparable to several European countries — driven by high female literacy rates, better healthcare infrastructure, and lower infant mortality. Bihar and Uttar Pradesh have the lowest figures at around 64-66 years.' },
  { question: 'Why do Indians get heart attacks earlier than Western populations?', answer: 'Indians are genetically predisposed to higher insulin resistance and central adiposity at lower BMI thresholds. The Indian Heart Association has documented that Indians experience heart attacks an average of 10 years earlier than Western populations — making cardiovascular health particularly important for Indian adults from their 30s onwards.' },
  { question: "How has India's life expectancy changed over time?", answer: "India's life expectancy has nearly doubled since 1960, when it stood at just 41.4 years. The improvement is driven by better maternal and infant care, expanded vaccination coverage, reduced infectious disease burden, and economic development — one of the most dramatic public health achievements of the 20th and 21st centuries." },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyIndia = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in India — 2026 Data, Causes & How to Beat the Average"
        description="India's life expectancy is 70.9 years (2023). Here's what drives it, how it compares globally, and what Indian adults can do to outlive the national average."
        keywords="life expectancy India, India life expectancy 2026, average lifespan India, how long do Indians live"
        canonicalUrl="/life-expectancy-india"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in India"
        description="India's life expectancy is 70.9 years (2023) — what drives it, how it compares, and how to outlive the average."
        url="/life-expectancy-india"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in India — What the Numbers Actually Mean
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'WHO', 'Indian Heart Association']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              India's average life expectancy is 70.9 years as of 2023 (UN World Population Prospects). Women average 72.3 years; men average 69.5 years. India has gained nearly 30 years of life expectancy since 1960 — one of the fastest improvements of any large nation in history.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why 70.9 Years — The Key Drivers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The single biggest constraint is healthcare access. India has roughly 0.7 hospital beds per 1,000 people, well below the global average of 2.7 — a gap that shows up most sharply in emergencies and in the management of chronic disease. Where care is thin, treatable conditions become fatal ones.</p>
            <p className="text-muted-foreground leading-relaxed mb-4">Cardiovascular disease is the other heavy weight on the average. The Indian Heart Association has documented that Indians tend to have heart attacks about a decade earlier than Western populations, driven by a genetic tendency toward insulin resistance and abdominal fat at lower body weights. It means heart health matters for Indian adults from their 30s, not their 50s.</p>
            <p className="text-muted-foreground leading-relaxed">Environmental factors pile on top. Air pollution alone is estimated to cost the average Indian around 2.6 years of life (EPIC, 2023), and road-traffic mortality — about 15.6 deaths per 100,000 — falls disproportionately on young, working-age adults, pulling the whole average down.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Where India Is Closing the Gap Fast</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The national number hides enormous progress. Kerala already sits at 75-77 years — level with several European countries — largely because of high female literacy, which correlates tightly with better family health outcomes, earlier care-seeking, and lower infant mortality.</p>
            <p className="text-muted-foreground leading-relaxed">Vaccination coverage has widened dramatically, and maternal mortality has fallen from around 556 per 100,000 births in 1990 to roughly 97 in 2023 (WHO). Each of these gains compounds over a generation, and the trajectory is still pointing up.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Where India Punches Above Its Weight</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Some of India's advantages are cultural rather than clinical. Multigenerational family structures keep older adults socially embedded — and loneliness is now classified by the WHO as a mortality risk comparable to smoking 15 cigarettes a day. Simply not being isolated is protective.</p>
            <p className="text-muted-foreground leading-relaxed">Traditional plant-rich diets, especially across South India, align closely with the Blue Zone research on longevity, and substance-related mortality remains far lower than in the United States. These are real, measurable buffers against an early death.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What This Means for You Personally</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">A national average describes a population, not a person. Twin studies suggest lifestyle accounts for roughly 70-80% of the variation in how long individuals live — which means your habits and your biological age matter far more than your nationality.</p>
            <p className="text-muted-foreground leading-relaxed">A health-conscious Indian adult can comfortably outlive the national average by a decade or more. Run the numbers on your own life with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>, then check how your body is actually ageing with the <Link to="/biological-age" className="text-primary underline">Biological Age Test</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare India Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how India's life expectancy stacks up globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">India Life Expectancy FAQs</h2>
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

export default LifeExpectancyIndia;
