import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: "What is Canada's life expectancy?", answer: 'Approximately 82.3 years as of 2023. Women average 84.6 years and men 80.1 years. Canada ranks among the top 20 countries globally for life expectancy.' },
  { question: 'Why does Canada have higher life expectancy than the USA?', answer: 'The primary factors are universal healthcare (eliminating financial barriers to treatment), significantly lower gun violence mortality, lower opioid death rates, lower obesity rates, and stronger social safety nets that reduce poverty-related mortality.' },
  { question: 'Which Canadian province has the highest life expectancy?', answer: 'British Columbia consistently leads, followed closely by Ontario. Both benefit from large urban populations with good healthcare access, lower smoking rates, and diverse populations. Rural and remote provinces, as well as Indigenous communities, face significantly lower life expectancy.' },
  { question: 'How does Canada compare to other G7 nations on life expectancy?', answer: 'Canada (82.3) ranks in the middle of G7 nations — below Japan (84.3), France (82.7), and Italy (82.9), but above Germany (80.6), the UK (81.3), and significantly above the USA (77.5).' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyCanada = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in Canada — 2026 Data, Provincial Differences & Key Factors"
        description="Canada's life expectancy is 82.3 years. Here's what drives it, how provinces compare, and why Canada outperforms the USA by nearly 5 years."
        keywords="life expectancy Canada, Canadian lifespan 2026, how long do Canadians live, Canada longevity"
        canonicalUrl="/life-expectancy-canada"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in Canada"
        description="Canada's life expectancy is 82.3 years — what drives it, how provinces compare, and why Canadians outlive Americans by nearly 5 years."
        url="/life-expectancy-canada"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in Canada — Why Canadians Outlive Americans by 5 Years
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'Statistics Canada', 'WHO']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Canada's average life expectancy is approximately 82.3 years as of 2023. Women average 84.6 years; men average 80.1 years. Canada consistently outperforms the United States by approximately 5 years — largely due to universal healthcare, lower gun violence, lower opioid mortality, and stronger social safety nets.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Canada vs USA — Why the 5-Year Gap Exists</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Two similar, neighbouring, wealthy countries diverge by five years — and the reasons are structural. Universal healthcare since 1966 removes the financial barrier to treatment that shortens American lives, and gun-violence mortality of about 2.1 per 100,000 in Canada versus 12.2 in the USA is a stark contrast.</p>
            <p className="text-muted-foreground leading-relaxed">Lower opioid death rates, lower obesity, and stronger social safety nets that blunt poverty-related mortality complete the picture. The gap has actually widened over the past two decades as the US opioid crisis worsened.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Provincial Differences</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">British Columbia leads the country, with Ontario close behind, while Quebec and Alberta sit a little below the national average. Geography matters: rural and remote provinces face real access challenges.</p>
            <p className="text-muted-foreground leading-relaxed">Indigenous communities face significant health gaps similar to those in Australia — a recognised national priority rather than a settled problem.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What Canada Does Well</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Canada's public-health infrastructure is strong, vaccination rates are consistently among OECD leaders, and cancer-screening programmes are effective and widely used.</p>
            <p className="text-muted-foreground leading-relaxed">Air pollution is low across most regions, and high levels of education correlate with better health literacy and more preventive behaviour — a quiet, compounding advantage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Challenges Ahead</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">An ageing population is putting pressure on the healthcare system, and the opioid crisis has worsened sharply, particularly in British Columbia. Mental-health service gaps are widening.</p>
            <p className="text-muted-foreground leading-relaxed">Climate change is affecting northern communities through extreme weather and food-security pressures. See how your own habits shift your forecast with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare Canada Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how Canada ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Canada Life Expectancy FAQs</h2>
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

export default LifeExpectancyCanada;
