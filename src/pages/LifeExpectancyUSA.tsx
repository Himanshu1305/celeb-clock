import { Link } from '@/components/seo/CanonicalLink';
import { ArticleLayout } from '@/components/central';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { leYears, leGap, leDiff, LE_CITATION, WPP2024_HISTORY } from '@/data/lifeExpectancyFacts';
import { US_STATE_LE_SOURCE, US_STATE_LE_HIGHEST, US_STATE_LE_LOWEST } from '@/data/usStateLifeExpectancy';

const STATE_GAP = (US_STATE_LE_HIGHEST[0][1] - US_STATE_LE_LOWEST[0][1]).toFixed(1);

const FAQ_ITEMS = [
  { question: 'What is the current US life expectancy?', answer: `Approximately ${leYears('United States')} years (${LE_CITATION}). Women average ${leYears('United States', 'female')} years and men ${leYears('United States', 'male')} years. This is below the OECD average for wealthy nations, which sits around 80 years.` },
  { question: 'Why did US life expectancy drop so sharply?', answer: `US life expectancy fell from ${WPP2024_HISTORY['United States'][2019]} years in 2019 to ${WPP2024_HISTORY['United States'][2021]} years in 2021 — the largest two-year drop since World War II. The primary causes were COVID-19 deaths, the opioid epidemic (80,000+ deaths per year), and gun violence. By 2023 it had recovered to ${leYears('United States')} years, slightly above its 2019 level.` },
  { question: 'Which US state has the highest life expectancy?', answer: `Hawaii, at 80.0 years in 2022 (latest CDC state data), followed by Massachusetts (79.8), New Jersey (79.6), New York (79.5) and Connecticut (79.4). West Virginia had the lowest at 72.2 years, then Mississippi (72.6) — a ${STATE_GAP}-year gap that reflects big differences in healthcare access, income and lifestyle across states. Source: CDC/NCHS U.S. State Life Tables, 2022.` },
  { question: 'How does US life expectancy compare to other wealthy countries?', answer: `The USA spends more per capita on healthcare than any other country but ranks below most comparable wealthy nations in life expectancy. Japan (${leYears('Japan')}), Switzerland (${leYears('Switzerland')}), Australia (${leYears('Australia')}), and most of Western Europe all have higher life expectancy despite lower healthcare spending.` },
];

const RELATED = [
  { path: '/life-expectancy/', label: 'Life Expectancy Calculator' },
  { path: '/country-comparison/', label: 'Country Comparison' },
  { path: '/biological-age/', label: 'Biological Age Test' },
  { path: '/coach/', label: 'Longevity Coach' },
];

const LifeExpectancyUSA = () => {
  return (
    <ArticleLayout
      theme="science"
      testId="life-expectancy-usa"
      seo={(
        <>
          <SEO
            title="Life Expectancy in the USA — 2026 Data, the Decline & What It Means"
            description={`US life expectancy is ${leYears('United States')} years — after a sharp fall in 2020-21 and a recovery by 2023. Here's why, and what Americans can do about it.`}
            keywords="life expectancy USA, US life expectancy 2026, American lifespan, average life expectancy United States"
            canonicalUrl="/life-expectancy-usa"
            ogImage="https://bornclock.com/og/calculator.png"
          />
          <WebApplicationSchema
            name="Life Expectancy in the USA"
            description={`US life expectancy is ${leYears('United States')} years — why it fell, where it stands now, and what Americans can do about it.`}
            url="/life-expectancy-usa"
          />
          <FAQSchema items={FAQ_ITEMS} />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity/' }], current: 'USA Life Expectancy' }}
      eyebrow="Life Expectancy"
      h1="Life Expectancy in the USA — Why It Fell and Where It Stands Now"
      lead={`The United States life expectancy is approximately ${leYears('United States')} years (${LE_CITATION}). Women average ${leYears('United States', 'female')} years; men average ${leYears('United States', 'male')} years. US life expectancy fell from ${WPP2024_HISTORY['United States'][2019]} years in 2019 to ${WPP2024_HISTORY['United States'][2021]} years in 2021 — driven by COVID-19, the opioid crisis, and gun violence — before recovering by 2023.`}
    >
      <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
        <EEATBadges sources={['UN WPP 2024', 'CDC', 'Peterson-KFF']} />
      </section>

      <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Dramatic Fall — What Happened Between 2019 and 2021</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Three forces drove almost the entire {(WPP2024_HISTORY['United States'][2019] - WPP2024_HISTORY['United States'][2021]).toFixed(1)}-year drop, something unprecedented for a wealthy nation in peacetime. COVID-19 killed hundreds of thousands directly and strained the system that keeps everyone else alive.</p>
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
            <p className="text-muted-foreground leading-relaxed mb-4">There is no single American life expectancy. In {US_STATE_LE_SOURCE.year}, Hawaii led at {US_STATE_LE_HIGHEST[0][1].toFixed(1)} years and West Virginia trailed at {US_STATE_LE_LOWEST[0][1].toFixed(1)} — a {STATE_GAP}-year gap inside one country. Where you live is one of the strongest predictors of how long an American will live.</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-3" data-testid="us-state-le">
              <div className="rounded-xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-2">Highest ({US_STATE_LE_SOURCE.year})</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {US_STATE_LE_HIGHEST.map(([st, v]) => <li key={st} className="flex justify-between"><span>{st}</span><strong className="text-foreground">{v.toFixed(1)} years</strong></li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-2">Lowest ({US_STATE_LE_SOURCE.year})</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {US_STATE_LE_LOWEST.map(([st, v]) => <li key={st} className="flex justify-between"><span>{st}</span><strong className="text-foreground">{v.toFixed(1)} years</strong></li>)}
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Life expectancy at birth, both sexes. Source: <a href={US_STATE_LE_SOURCE.url} className="underline" target="_blank" rel="noopener">{US_STATE_LE_SOURCE.label}</a> — the latest state table published. State figures are for {US_STATE_LE_SOURCE.year} and come from a different source and year than the national figure at the top of this page, so the two are not directly comparable.
            </p>
            <p className="text-muted-foreground leading-relaxed">Income and race compound geography, so two people the same age can face very different odds. What you can control still moves the needle most — see your own number with the <Link to="/life-expectancy/" className="text-primary underline">Life Expectancy Calculator</Link>.</p>
          </section>
        </article>

        <section className="max-w-3xl mx-auto mb-16 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Compare the USA Against 57 Countries</h2>
            <p className="text-sm text-muted-foreground mb-4">See how the USA ranks globally — and how much your own habits could shift your personal forecast.</p>
            <Link to="/country-comparison/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
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
    </ArticleLayout>
  );
};

export default LifeExpectancyUSA;
