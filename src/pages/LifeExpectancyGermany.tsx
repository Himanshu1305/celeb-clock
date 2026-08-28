import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is Germany's life expectancy?", answer: 'Approximately 80.6 years as of 2023. Women average 83.2 years and men 78.2 years. Germany ranks in the middle of Western European nations — below France, Spain, and Italy but above Central and Eastern European neighbours.' },
  { question: 'Why is German life expectancy lower than France or Spain?', answer: 'The primary factors are higher smoking rates, higher alcohol consumption, and a rising obesity rate. Germany also has a less Mediterranean dietary pattern than southern European nations — research consistently links Mediterranean diet to lower cardiovascular disease mortality.' },
  { question: 'Is there still a life expectancy difference between East and West Germany?', answer: 'The gap has nearly closed since reunification in 1990, but some difference persists in rural eastern states. At peak, East Germans lived 3-4 years less than West Germans. The remaining gap is attributed to higher unemployment rates and historically different healthcare infrastructure in some eastern regions.' },
  { question: "How does Germany's healthcare system compare globally?", answer: 'Germany has one of the world\'s most comprehensive healthcare systems — universal coverage through statutory health insurance, very high hospital density, and among the lowest wait times of any universal system. Despite this, life expectancy outcomes rank below expectation because lifestyle factors dominate population-level longevity more than healthcare quality alone.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyGermany = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in Germany — 2026 Data, East-West Gap & Key Drivers"
        description="Germany's life expectancy is 80.6 years — below most Western European neighbours. Here's why, including the persistent east-west divide."
        keywords="life expectancy Germany, German lifespan 2026, how long do Germans live, Germany longevity"
        canonicalUrl="/life-expectancy-germany"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in Germany"
        description="Germany's life expectancy is 80.6 years — strong healthcare, but below its European neighbours. Here's why."
        url="/life-expectancy-germany"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in Germany — Strong Healthcare, But Below Its European Neighbours
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'Destatis', 'WHO']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Germany's average life expectancy is approximately 80.6 years as of 2023. Women average 83.2 years; men average 78.2 years. Despite having one of the world's most advanced healthcare systems, Germany ranks below most Western European neighbours — largely due to higher smoking rates, higher alcohol consumption, and a rising obesity rate.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Germany Underperforms vs France, Spain, and Italy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Germany is the clearest case of world-class healthcare not being enough on its own. Smoking prevalence runs higher than in its southern European neighbours, and alcohol consumption is higher too.</p>
            <p className="text-muted-foreground leading-relaxed">Obesity is rising — around 25% of adults, against 17% in France — and the German diet is less Mediterranean, with more sedentary urban lifestyles in the northern regions. Lifestyle, not medicine, is the drag.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The East-West Divide</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Former East Germany still shows slightly lower life expectancy than the former West — a gap that persisted for decades after the 1990 reunification and is now mostly, but not entirely, closed.</p>
            <p className="text-muted-foreground leading-relaxed">Where it remains visible, in some rural eastern states, it traces back to higher unemployment, economic stress, and historically different healthcare infrastructure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Where Germany Excels</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The strengths are real. World-class hospitals and specialist care, strong occupational health and safety standards, and statutory health insurance covering all residents form a genuinely robust system.</p>
            <p className="text-muted-foreground leading-relaxed">Emergency medicine is excellent, and wait times for specialist care are among the lowest of any universal system anywhere.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Improving Trends</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Smoking rates are declining, cancer-screening uptake is increasing, and cardiovascular mortality has fallen significantly since 1990.</p>
            <p className="text-muted-foreground leading-relaxed">Life expectancy at 65 is competitive with European peers — the underperformance is concentrated in working-age mortality from preventable causes. See how your own habits change your forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare Germany Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how Germany ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Germany Life Expectancy FAQs</h2>
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

export default LifeExpectancyGermany;
