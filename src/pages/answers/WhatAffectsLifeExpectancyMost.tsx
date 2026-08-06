import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { AnswerLayout } from '@/components/AnswerLayout';

const CANONICAL = 'https://bornclock.com/answers/what-affects-life-expectancy-most';

const FACTORS = [
  ['1. Smoking — the single largest modifiable factor', 'Smoking is the leading cause of preventable death globally, killing more than 8 million people per year according to the WHO. Heavy smokers lose an average of 10 years of life expectancy compared to non-smokers. The recovery timeline after quitting is genuinely encouraging: within 20 minutes, heart rate drops; within a year, cardiovascular risk halves; within 15 years, risk approaches that of a lifelong non-smoker. The body forgives faster than most people expect.'],
  ['2. Physical activity — the closest thing medicine has to a longevity drug', 'A 2022 analysis in the British Journal of Sports Medicine found that 150–300 minutes of moderate aerobic activity per week was associated with a 21% lower risk of all-cause mortality. More is better up to a point, but the biggest gains come from moving from sedentary to any regular activity at all. Even 10–15 minutes of daily walking, consistently sustained, shows meaningful mortality risk reduction in large studies. The barrier is lower than people think.'],
  ['3. Diet — patterns over decades, not individual foods', 'No single food is the key to longevity, and no single food is the villain. What matters is the long-term dietary pattern sustained over years. The strongest evidence points to diets rich in vegetables, legumes, whole grains, nuts, and fish — and lower in ultra-processed foods, added sugar, and processed meat. The Mediterranean diet and DASH diet have the most robust longevity evidence. Blue Zone populations eat diets that are 90–95% plant-based — but they also share meals socially, eat until only 80% full, and treat food as pleasure rather than optimization.'],
  ['4. Body weight — specifically where fat is stored', 'Obesity is associated with significantly increased risk of cardiovascular disease, type 2 diabetes, several cancers, and sleep apnea. But BMI alone is an imperfect measure — it doesn’t distinguish between muscle and fat, or between subcutaneous fat and visceral fat around organs. Waist-to-height ratio — your waist circumference divided by your height — is a better predictor of cardiovascular risk. A ratio below 0.5 is associated with meaningfully lower metabolic disease risk.'],
  ['5. Alcohol — the most nuanced factor, and the most misunderstood', 'Earlier research suggested moderate drinking was protective for cardiovascular health — the so-called J-curve effect. More recent and methodologically rigorous studies have significantly weakened this finding. The current WHO position is that no level of alcohol consumption is definitively safe from a cancer risk perspective. Moderate drinking appears to have a small net effect on lifespan — neither dramatically harmful nor clearly beneficial. Heavy drinking, consistently, reduces lifespan. And longevity is built on patterns over decades, not on any single habit in isolation.'],
];

const RELATED = [
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/coach', label: 'Longevity Coach' },
  { path: '/country-comparison', label: 'Country Comparison' },
];

export default function WhatAffectsLifeExpectancyMost() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What affects life expectancy most?", "item": CANONICAL } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Affects Life Expectancy the Most? The Answer Might Surprise You", "description": "A Harvard study of 123,000 people found 5 habits that add up to 14 extra years of life. Genetics matters less than you think. Here's what the evidence actually shows.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-08-06", "dateModified": "2026-08-06", "mainEntityOfPage": CANONICAL };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How much does genetics affect life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Studies of identical twins raised apart suggest genetics accounts for approximately 20–30% of lifespan variation. For most people, lifestyle choices have a larger influence on longevity than inherited genes." } },
      { "@type": "Question", "name": "What is the single most impactful change for life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "If you smoke, stopping is the highest-impact single change available. For non-smokers, regular physical activity has the strongest and most consistent evidence across the largest number of studies." } },
      { "@type": "Question", "name": "Does stress affect life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — chronic stress is associated with accelerated cellular aging (measured through telomere length), higher cardiovascular disease risk, and impaired immune function. A study in PLOS Medicine found that high perceived stress levels were associated with a 2.8-year reduction in life expectancy." } },
      { "@type": "Question", "name": "How much does diet matter compared to exercise?", "acceptedAnswer": { "@type": "Answer", "text": "Both matter significantly, and they interact — combining them is more protective than either alone. Diet has a somewhat larger effect on chronic disease risk overall, while exercise has particularly strong effects on cardiovascular health, cognitive function, and all-cause mortality. Neither replaces the other." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Affects Life Expectancy Most? What a Harvard Study Found | BornClock"
        description="A Harvard study of 123,000 people found 5 habits that add up to 14 extra years of life. Genetics matters less than you think. Here's what the evidence actually shows."
        canonicalUrl="/answers/what-affects-life-expectancy-most"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AnswerLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">What affects life expectancy most?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Affects Life Expectancy the Most? The Answer Might Surprise You</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              The five factors that most affect individual life expectancy are smoking status, physical activity, diet quality, body weight, and alcohol consumption. Harvard researchers tracked 123,000 Americans over three decades and found that people who maintained all five healthy habits by age 50 lived an average of 14 years longer (women) and 12 years longer (men) than those with none. Genetics, by contrast, accounts for only about 20–30% of how long you live. The rest is largely within your control.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">What Harvard found when they tracked 123,000 people for 30 years</h2>
            <p>The study, published in Circulation in 2018, was one of the largest long-term examinations of lifestyle and mortality ever conducted. Researchers followed participants from the Health Professionals Follow-Up Study and the Nurses' Health Study — tracking their habits, health events, and deaths over three decades.</p>
            <p>The finding was striking: five specific lifestyle factors accounted for the majority of premature deaths in the United States. People who maintained all five healthy habits had 74% fewer cardiovascular deaths and 65% fewer cancer deaths compared to those who maintained none. The researchers estimated that if Americans broadly adopted these habits, half of all premature deaths could be prevented.</p>
            <p>Half. That's not a marginal improvement — it's a restructuring of what human lifespan looks like in practice.</p>

            <h2 className="text-xl font-bold text-gray-900">The five factors — what the evidence actually shows</h2>
            {FACTORS.map(([heading, body]) => (
              <div key={heading}>
                <h3 className="text-lg font-bold text-gray-900">{heading}</h3>
                <p>{body}</p>
              </div>
            ))}

            <h2 className="text-xl font-bold text-gray-900">A word on genetics</h2>
            <p>Many people assume their genes largely determine how long they live. Twin studies — which separate genetic from environmental factors by comparing identical twins raised in different environments — consistently find that genetics accounts for only about 20–30% of variation in lifespan. The environment and lifestyle choices account for the remaining 70–80%.</p>
            <p>Even people with strong family histories of cardiovascular disease or cancer can significantly modify their personal risk through lifestyle. Genes load the gun; lifestyle largely decides whether it fires.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Calculate My Life Expectancy</p>
            <p className="text-sm text-gray-500 mb-4">Personalised to your habits, country, and family history</p>
            <Link to="/life-expectancy"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate my life expectancy →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Tools</p>
            <div className="space-y-2">
              {RELATED.map((t) => (
                <Link key={t.path} to={t.path} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ {t.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </AnswerLayout>
    </>
  );
}
