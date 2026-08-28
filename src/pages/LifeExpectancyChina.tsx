import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is China's life expectancy?", answer: 'Approximately 78.2 years as of 2023. Women average 81.1 years and men 75.5 years — a 5.6-year gender gap largely driven by very high male smoking rates.' },
  { question: "How fast has China's life expectancy improved?", answer: 'Extremely fast. China went from 43.7 years in 1960 to 78.2 years in 2023 — a gain of 34.5 years in 63 years. This is one of the most rapid life expectancy improvements ever recorded for a large population.' },
  { question: 'Why is life expectancy so different between Shanghai and rural China?', answer: 'Shanghai and Beijing residents have life expectancy above 83 years — comparable to Japan. Rural inland provinces average 10+ years less. The gap is driven by dramatically different healthcare access, income levels, air quality, diet, and occupational risk.' },
  { question: 'Does smoking significantly affect Chinese life expectancy?', answer: "Yes — substantially. China has the world's largest tobacco market with over 300 million smokers, predominantly male. Male smoking rates above 50% are the primary driver of the large gender gap in life expectancy and are projected to cause 1 million additional deaths annually by 2030 if rates do not decline." },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyChina = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in China — 2026 Data, the Dramatic Rise & Regional Gaps"
        description="China's life expectancy is 78.2 years — up from 43 in 1960. Here's one of history's most dramatic health transformations and what still drives gaps."
        keywords="life expectancy China, Chinese lifespan 2026, how long do Chinese live, China longevity"
        canonicalUrl="/life-expectancy-china"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in China"
        description="China's life expectancy is 78.2 years — one of history's most dramatic health transformations, and the gaps that remain."
        url="/life-expectancy-china"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in China — One of History's Most Dramatic Health Transformations
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'WHO', 'EPIC']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              China's average life expectancy is approximately 78.2 years as of 2023. Women average 81.1 years; men average 75.5 years. China has gained over 34 years of life expectancy since 1960 — from 43.7 years to 78.2 — one of the most rapid improvements ever recorded for a large population.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Extraordinary Rise</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The trajectory is almost hard to believe: from 43.7 years in 1960 to 78.2 in 2023. Economic growth, improved nutrition, expanded healthcare access, mass vaccination and a sharp fall in infectious disease all compounded.</p>
            <p className="text-muted-foreground leading-relaxed">China now approaches Western European levels and has overtaken many middle-income countries. It is one of the great public-health stories of the modern era.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Urban-Rural Divide</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The national figure averages two very different Chinas. Residents of Shanghai and Beijing live past 83 years — on par with Japan — while rural inland provinces remain more than a decade behind.</p>
            <p className="text-muted-foreground leading-relaxed">Healthcare access, income, and pollution exposure all drive this internal gap, which mirrors the same inequality patterns seen globally.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Smoking Challenge</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">China has the world's largest tobacco market — more than 300 million smokers, overwhelmingly male. This single factor is the main driver of the 5.6-year gender gap.</p>
            <p className="text-muted-foreground leading-relaxed">Male smoking rates remain above 50%, and on current trends this is projected to cause a million additional deaths a year by 2030 unless rates fall.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Air Pollution's Toll and Improvement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Rapid industrialisation created severe air-quality problems, with PM2.5 exposure estimated to cut 2-3 years of life in the most polluted areas.</p>
            <p className="text-muted-foreground leading-relaxed">The trend is now improving as clean-air policies take effect — Beijing's PM2.5 levels have fallen more than 50% since 2013. See how your own habits shift your forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare China Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how China ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">China Life Expectancy FAQs</h2>
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

export default LifeExpectancyChina;
