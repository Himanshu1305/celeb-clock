import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is Singapore's life expectancy?", answer: 'Approximately 83.5 years as of 2023. Women average 85.9 years and men 81.2 years. Singapore consistently ranks in the top 5 globally — extraordinary for a nation with no natural resources and a population under 6 million.' },
  { question: 'Why does Singapore have such high life expectancy?', answer: "Singapore's longevity results from deliberate policy sustained over 60 years: mandatory health savings (Medisave), strong preventive healthcare, strict anti-smoking laws since 1970, highly regulated food safety, walkable urban design, and universal primary care access." },
  { question: 'How does Singapore compare to Japan on life expectancy?', answer: "Singapore (83.5) and Japan (84.3) both rank among the world's longest-lived populations and often trade the top positions. Japan's advantage comes from dietary tradition and culture; Singapore's from deliberate health policy and urban design. Both demonstrate that high life expectancy at scale is achievable." },
  { question: "Is Singapore's model replicable for larger countries?", answer: 'Partially. Singapore benefits from its small size — policy changes can be implemented rapidly across 5.9 million people in a single urban area. Scaling to India or the USA with diverse geography, politics, and income levels is far harder. But specific elements — preventive savings, walkable design, strong food regulation — are studied and adapted globally.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancySingapore = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in Singapore — Why This City-State Ranks Among the World's Best"
        description="Singapore's life expectancy is 83.5 years — one of the highest globally. Here's how a city-state with no natural resources built one of the world's healthiest populations."
        keywords="life expectancy Singapore, Singapore lifespan 2026, how long do Singaporeans live, Singapore longevity"
        canonicalUrl="/life-expectancy-singapore"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in Singapore"
        description="Singapore's life expectancy is 83.5 years — how a city-state built one of the world's healthiest populations through deliberate policy."
        url="/life-expectancy-singapore"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in Singapore — How a City-State Built One of the World's Healthiest Populations
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'WHO', 'MOH Singapore']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Singapore's average life expectancy is approximately 83.5 years as of 2023 — one of the highest of any nation. Women average 85.9 years; men average 81.2 years. Singapore achieved this with no natural resources and a population of only 5.9 million — through deliberate, evidence-based public health policy sustained over 60 years.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How Singapore Built Its Health System</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Singapore's longevity is engineered, not inherited. Mandatory health-savings accounts (Medisave), running since 1984, ensure everyone has funds set aside for care, sitting on top of universal primary care.</p>
            <p className="text-muted-foreground leading-relaxed">A highly regulated food environment enforces strict safety standards, anti-smoking laws from 1970 were among the world's earliest, and heavy investment in walkable public housing quietly reduces sedentary behaviour for millions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Diet and Lifestyle Factors</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Singapore's multicultural population — Chinese, Malay, Indian — brings genuine dietary diversity, and hawker-centre culture keeps freshly cooked food central rather than ultra-processed alternatives.</p>
            <p className="text-muted-foreground leading-relaxed">High walkability and low car dependency make public transport the default, so active commuting is built into daily life almost by accident of design.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Preventive Healthcare Emphasis</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The system leans heavily on prevention: government-subsidised regular screening, strong maternal and infant care, and very low infant mortality of about 2.2 per 1,000 births.</p>
            <p className="text-muted-foreground leading-relaxed">Proactive chronic-disease management, high vaccination rates, and health-literacy programmes sustained in schools over decades keep the whole population healthier for longer.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What Singapore Shows About Intentional Public Health</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The lesson is that longevity doesn't require natural wealth or a large land area — it requires consistent, evidence-based policy sustained over decades.</p>
            <p className="text-muted-foreground leading-relaxed">Singapore's experience is studied worldwide as a model for what deliberate health investment can achieve regardless of starting conditions. See how your own habits move your forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare Singapore Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how Singapore ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Singapore Life Expectancy FAQs</h2>
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

export default LifeExpectancySingapore;
