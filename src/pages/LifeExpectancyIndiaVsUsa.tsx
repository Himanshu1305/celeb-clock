import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { AuthorBio } from '@/components/AuthorBio';

const FAQ_ITEMS = [
  { question: "What is India's current life expectancy?", answer: 'Approximately 70.9 years (UN World Population Prospects, 2023). Women average 72.3 years; men average 69.5 years.' },
  { question: 'Why does the USA have higher life expectancy than India?', answer: "The primary drivers are healthcare infrastructure, lower rates of cardiovascular disease at young ages, better air quality in most regions, and lower road traffic mortality. However, the USA's advantage is shrinking — driven by the opioid crisis, gun violence, and high chronic disease rates." },
  { question: "Is India's life expectancy improving?", answer: 'Significantly. India has gained nearly 30 years of life expectancy since 1960 — one of the largest improvements of any nation in that period. The trend continues, driven by better maternal and infant care, expanded vaccination coverage, and economic development.' },
  { question: 'Which Indian states have the highest life expectancy?', answer: 'Kerala consistently leads with approximately 75–77 years — comparable to several European countries — driven by high literacy rates, better healthcare infrastructure, and lower infant mortality. Bihar and Uttar Pradesh have the lowest state-level figures.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyIndiaVsUsa = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy India vs USA — The 6.6-Year Gap Explained"
        description="India's life expectancy is 70.9 years; the USA's is 77.5. The gap has specific causes — and India is closing it faster than most people realize."
        keywords="life expectancy India vs USA, India life expectancy 2026, USA life expectancy comparison, India USA health comparison"
        canonicalUrl="/life-expectancy-india-vs-usa"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in India vs USA — Why the Gap Exists and What's Changing
          </h1>
          <EEATBadges sources={['UN World Population Prospects', 'WHO', 'Indian Heart Association', 'University of Chicago EPIC']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              India's average life expectancy is approximately 70.9 years (UN World Population Prospects, 2023). The USA's is approximately 77.5 years — a difference of 6.6 years. But here's the context that matters: in 1960, India's life expectancy was 41.4 years. It has nearly doubled in six decades — one of the most dramatic public health achievements of the 20th and 21st centuries. The gap is real, but the trajectory tells a different story.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why the 6.6-Year Gap Exists</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The difference between India and the USA isn't random or inevitable. Researchers point to several specific, measurable causes:</p>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Healthcare access</strong> — India has approximately 0.7 hospital beds per 1,000 people; the USA has 2.9. Rural India in particular has significant gaps in emergency care, maternal health services, and chronic disease management. These gaps disproportionately affect life expectancy through higher infant and maternal mortality rates — deaths that pull the population average down significantly.</p>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Cardiovascular disease at younger ages</strong> — India has one of the world's highest rates of cardiovascular disease mortality, and it strikes younger here than in Western populations. Indians are genetically predisposed to higher insulin resistance and central adiposity at lower BMI thresholds. The Indian Heart Association has documented that Indians experience heart attacks an average of 10 years earlier than Western populations — a profound difference in years of life lost.</p>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Air quality</strong> — India has 9 of the world's 20 most polluted cities by PM2.5 concentration. The Energy Policy Institute at the University of Chicago estimated in 2023 that air pollution reduces average life expectancy across India by 2.6 years. That single factor accounts for a meaningful portion of the total gap.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Road traffic mortality</strong> — India's road traffic death rate is approximately 15.6 per 100,000 people, compared to 12.7 in the USA. Because road deaths disproportionately affect young adults — who have the most years of life remaining — the impact on average life expectancy is outsized.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The gender dimension</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">In both countries, women outlive men — but the gap looks different in each.</p>
            <p className="text-muted-foreground leading-relaxed">In the USA, women live approximately 5.7 years longer than men (80.5 vs 74.8 years). In India, the gap is smaller but still present: women average 72.3 years, men 69.5 — a difference of about 2.8 years. India's gender gap in life expectancy is actually narrower than in most developed countries, partly because historical inequities in healthcare access and nutrition have disproportionately affected women — a gap that is gradually closing as female literacy, education, and economic participation improve.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Where India is actually ahead</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The comparison isn't entirely in the USA's favour.</p>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Social connection</strong> — India's multigenerational family structures and strong community networks provide a protective effect that Western individualism often doesn't. US Surgeon General Vivek Murthy declared loneliness a public health epidemic in 2023. Social isolation is now classified as a cardiovascular risk factor comparable to smoking 15 cigarettes a day.</p>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Traditional diet</strong> — Traditional South Indian vegetarian diets align remarkably closely with what longevity researchers describe as ideal: high legume intake, plant diversity, low ultra-processed food, fermented foods. The Blue Zone dietary pattern and a traditional South Indian thali look more similar than different.</p>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">Substance-related mortality</strong> — The USA's opioid crisis has meaningfully dragged down national life expectancy, particularly among working-age men. India has significantly lower rates of opioid addiction and alcohol-related mortality than the USA.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">The USA's recent decline</strong> — US life expectancy fell from 78.8 years in 2019 to 76.1 years in 2021, driven by COVID-19, the opioid crisis, and gun violence. It has partially recovered since, but the USA's advantage over comparable wealthy nations has been shrinking for two decades.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What this means for you personally</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">National life expectancy averages are population statistics. They describe the average, not your individual trajectory. An Indian with excellent lifestyle habits, access to good healthcare, and low environmental pollution exposure will likely outlive the national average significantly. An American with poor lifestyle habits and limited healthcare access may not reach the US average.</p>
            <p className="text-muted-foreground leading-relaxed">Your biological age, lifestyle choices, and healthcare access matter far more than your nationality for predicting your personal lifespan.</p>
          </section>
        </article>

        <PageFAQ items={FAQ_ITEMS} title="India vs USA Life Expectancy FAQs" />

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

        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default LifeExpectancyIndiaVsUsa;
