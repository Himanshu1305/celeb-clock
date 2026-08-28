import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is Japan's life expectancy?", answer: "Japan's average life expectancy is 84.3 years as of 2023. Women average 87.1 years — the highest female life expectancy of any country — and men average 81.1 years. Japan has consistently ranked among the top countries for longevity for over 40 years." },
  { question: 'Why do Japanese people live so long?', answer: 'Research points to several converging factors: a diet high in fish, vegetables, and fermented foods with low ultra-processed content; strong social connections and sense of purpose (ikigai); universal healthcare with prevention emphasis; very low obesity rates (4.3%); and high physical activity through daily walking.' },
  { question: 'What is the Okinawa longevity secret?', answer: "Okinawa — Japan's southernmost prefecture — is a Blue Zone with one of the world's highest concentrations of centenarians. Traditional Okinawan diet is 90%+ plant-based, very low in calories, and high in sweet potato, tofu, and bitter melon. Okinawans also practice hara hachi bu — eating until 80% full — and maintain moai social support groups throughout life." },
  { question: "Is Japan's longevity advantage declining?", answer: 'Somewhat. As younger Japanese generations adopt more Westernized diets and lifestyles, the longevity advantage is narrowing slightly. Okinawa in particular has shifted away from traditional eating patterns partly due to US military base influence. However, Japan still holds the global top position.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyJapan = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in Japan — Why Japan Lives Longest & What We Can Learn"
        description="Japan's life expectancy is 84.3 years — the highest of any large nation. The reasons are specific, evidence-based, and partially replicable anywhere."
        keywords="life expectancy Japan, why does Japan live longest, Japanese longevity, Japan average lifespan"
        canonicalUrl="/life-expectancy-japan"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in Japan"
        description="Japan's life expectancy is 84.3 years — why the Japanese live longest and what the science says about it."
        url="/life-expectancy-japan"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in Japan — Why the Japanese Live Longest and What Science Says About It
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'Blue Zones', 'The Lancet']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Japan's average life expectancy is 84.3 years — the highest of any large nation on Earth (UN World Population Prospects 2023). Women average 87.1 years; men average 81.1 years. Japan has held this position for decades, and the reasons are specific and well-studied.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Japanese Diet — What Actually Drives Longevity</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Diet does the heavy lifting. High fish consumption, a steady intake of fermented foods like miso, natto and pickles, and unusual plant diversity combine with a very low share of ultra-processed food. Portions are small by design.</p>
            <p className="text-muted-foreground leading-relaxed">The traditional ichiju sansai structure — one soup, three sides — builds moderation into every meal. The Okinawan diet, studied directly in Blue Zone research, is more than 90% plant-based, and it is exactly this pattern of eating, not any single superfood, that shows up in the mortality data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Social and Cultural Factors</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The Japanese concept of ikigai — a sense of purpose, a reason to get up in the morning — is linked in research to lower rates of dementia and mortality. Communities stay tightly bound, and social isolation runs lower than in most Western nations.</p>
            <p className="text-muted-foreground leading-relaxed">Walking is the default way to get around, active ageing keeps the elderly socially engaged for longer, and Okinawa's moai — lifelong mutual-support groups — give people a guaranteed circle that never disbands. Connection, it turns out, is a longevity intervention.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Healthcare System's Role</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Japan has had universal coverage since 1961, and the system leans hard toward prevention and regular screening rather than late-stage rescue. Problems are caught early, when they are cheap and survivable.</p>
            <p className="text-muted-foreground leading-relaxed">Obesity sits at roughly 4.3% — against 36% in the USA — and decades of public-health campaigns have driven smoking rates steadily down. High hospital density means care is rarely far away.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What Anyone Can Take From the Japanese Model</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The most useful finding is that the drivers are habits, not genetics. Walking more, eating more fish and fermented foods, keeping strong social ties, and holding a clear sense of purpose all travel across borders.</p>
            <p className="text-muted-foreground leading-relaxed">Hara hachi bu — stopping at 80% full — is achievable at any dinner table in the world. See how these levers change your own forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare Japan Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how Japan's world-leading life expectancy compares globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Japan Life Expectancy FAQs</h2>
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

export default LifeExpectancyJapan;
