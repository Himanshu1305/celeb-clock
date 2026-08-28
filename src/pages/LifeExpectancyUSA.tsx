import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';

const FAQ_ITEMS = [
  { question: 'What is the current US life expectancy?', answer: 'Approximately 77.5 years as of 2023. Women average 80.5 years and men 74.8 years. This is below the OECD average for wealthy nations, which sits around 80 years.' },
  { question: 'Why did US life expectancy drop so sharply?', answer: 'US life expectancy fell from 78.8 years in 2019 to 76.1 years in 2021 — the largest two-year drop since World War II. The primary causes were COVID-19 deaths, the opioid epidemic (80,000+ deaths per year), and gun violence. It has partially recovered since but has not returned to pre-pandemic levels.' },
  { question: 'Which US state has the highest life expectancy?', answer: 'Hawaii leads with approximately 81 years, followed by California, Minnesota, and Massachusetts. Mississippi has the lowest at around 71 years — a 10-year gap that reflects dramatic differences in healthcare access, poverty rates, and lifestyle factors across states.' },
  { question: 'How does US life expectancy compare to other wealthy countries?', answer: 'The USA spends more per capita on healthcare than any other country but ranks below most comparable wealthy nations in life expectancy. Japan (84.3), Switzerland (83.4), Australia (83.2), and most of Western Europe all have higher life expectancy despite lower healthcare spending.' },
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison', label: 'Country Comparison' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
];

const LifeExpectancyUSA = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy in the USA — 2026 Data, the Decline & What It Means"
        description="US life expectancy is 77.5 years — but it fell sharply in 2020-21 and hasn't fully recovered. Here's why, and what Americans can do about it."
        keywords="life expectancy USA, US life expectancy 2026, American lifespan, average life expectancy United States"
        canonicalUrl="/life-expectancy-usa"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy in the USA"
        description="US life expectancy is 77.5 years — why it fell, where it stands now, and what Americans can do about it."
        url="/life-expectancy-usa"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Life Expectancy in the USA — Why It Fell and Where It Stands Now
          </h1>
          <EEATBadges sources={['UN WPP 2023', 'CDC', 'Peterson-KFF']} />
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              The United States life expectancy is approximately 77.5 years as of 2023. Women average 80.5 years; men average 74.8 years. US life expectancy fell from 78.8 years in 2019 to 76.1 years in 2021 — driven by COVID-19, the opioid crisis, and gun violence — and has only partially recovered.
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Dramatic Fall — What Happened Between 2019 and 2021</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Three forces drove almost the entire 2.7-year drop, something unprecedented for a wealthy nation in peacetime. COVID-19 killed hundreds of thousands directly and strained the system that keeps everyone else alive.</p>
            <p className="text-muted-foreground leading-relaxed">Alongside it, the opioid crisis continued to claim more than 80,000 lives a year, concentrated among working-age adults, and gun-violence mortality of about 12.2 per 100,000 added a distinctly American toll. Together these three account for most of the decline — and none of them are about a shortage of medical technology.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why the USA Underperforms vs Comparable Wealthy Nations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The paradox at the center of American health is spending. The USA spends more per capita on healthcare than any country on Earth, yet ranks 40th or lower in life expectancy. Money is not the missing ingredient.</p>
            <p className="text-muted-foreground leading-relaxed">The lack of universal coverage creates mortality gaps that don't exist in peer nations, and lifestyle diverges sharply: adult obesity sits around 36% versus 17% in France, in a food environment dominated by ultra-processed products. The result is more chronic disease, earlier.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Where the USA Does Well</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The picture isn't uniformly bleak. American medical innovation leads the world, and cancer survival rates are among the highest anywhere — if a disease can be treated, the treatment often originates here.</p>
            <p className="text-muted-foreground leading-relaxed">For insured patients, access to specialist care is fast and deep, and emergency-medicine infrastructure is genuinely world-class. The failures are structural and about access, not capability.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The State-by-State Gap Is Enormous</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">There is no single American life expectancy. Hawaii leads at roughly 81 years; Mississippi trails at about 71 — a 10-year gap inside one country. Zip code is one of the strongest predictors of how long an American will live.</p>
            <p className="text-muted-foreground leading-relaxed">Income and race compound geography, so two people the same age can face very different odds. What you can control still moves the needle most — see your own number with the <Link to="/life-expectancy" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare the USA Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how the USA ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Open the Country Comparison Tool →
            </Link>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">USA Life Expectancy FAQs</h2>
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

export default LifeExpectancyUSA;
