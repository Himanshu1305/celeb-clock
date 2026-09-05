import React from 'react';
import { SEO } from '@/components/SEO';
import { LC_FACTORS } from '@/content/longevityCalculatorContent';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// What each factor measures + its optimal, keyed to LC_FACTORS by id.
const FACTOR_DETAIL: Record<number, { measures: string; optimal: string }> = {
  1: {
    measures: 'Whether you currently smoke tobacco, how much, and — if you quit — how long ago.',
    optimal: 'Never smoking, or having quit before age 40 (which reverses up to 90% of the excess risk).',
  },
  2: {
    measures: 'Your weight relative to height, used as a proxy for body composition and metabolic strain.',
    optimal: 'A BMI in the 21–23 range; risk rises measurably above 25 and below 18.5.',
  },
  3: {
    measures: 'Whether you live with conditions like heart disease, type 2 diabetes, or hypertension — and crucially, whether they are well controlled.',
    optimal: 'No chronic conditions, or conditions that are diagnosed and actively managed to target.',
  },
  4: {
    measures: 'The overall quality of your habitual diet — plants, legumes, whole foods versus ultra-processed intake.',
    optimal: 'A Mediterranean-style pattern rich in vegetables, legumes, and whole grains.',
  },
  5: {
    measures: 'Your typical nightly sleep duration and how consolidated (versus fragmented) that sleep is.',
    optimal: '7–8 hours of consolidated sleep per night; both short and long sleep raise mortality.',
  },
  6: {
    measures: 'Your weekly minutes of moderate-to-vigorous physical activity.',
    optimal: '150–300 minutes of moderate activity per week, per the WHO 2022 guideline.',
  },
  7: {
    measures: 'Your habitual level of chronic stress and whether you have practices that regulate it.',
    optimal: 'Low-to-moderate stress with an active regulation habit (mindfulness, exercise, connection).',
  },
  8: {
    measures: 'The strength and quality of your close relationships and community ties.',
    optimal: 'Strong, regular social connection — the protective effect rivals quitting smoking.',
  },
};

const FAQS = [
  {
    q: 'What is a longevity quiz?',
    a: 'A longevity quiz is a short assessment that estimates how long you are likely to live by scoring the lifestyle and health factors that research has tied to lifespan. Instead of quoting the national average, it starts from a WHO baseline for your country and gender and then adjusts up or down based on your answers to 8 evidence-based questions.',
  },
  {
    q: 'How many questions are in the BornClock longevity quiz?',
    a: 'The BornClock longevity quiz assesses 8 factors: tobacco smoking, body mass index, chronic health conditions, diet quality, sleep duration, physical exercise, stress level, and social connections. Together these account for roughly 70–75% of longevity variance; genetics explains the remaining 25–30%.',
  },
  {
    q: 'Is the longevity quiz accurate?',
    a: 'The quiz produces a statistical estimate, not an individual prediction. It uses WHO Global Health Observatory baselines and risk ratios drawn from peer-reviewed studies (Harvard, Lancet, NIH, Karolinska). Because it is built from modifiable factors, it is best read as a probability-weighted mirror of your habits rather than a fixed forecast.',
  },
  {
    q: 'How long does the longevity quiz take?',
    a: 'About 3 minutes. The 8 questions are quick to answer, and your longevity score, life expectancy estimate, and a personalised 90-day action plan are generated instantly and free of charge.',
  },
  {
    q: 'Can I improve my longevity quiz score?',
    a: 'Yes. Unlike chronological age, the score reflects modifiable habits. Epigenetic research shows measurable biological improvement within 8–12 weeks of consistent change. Start with your weakest high-impact factor — often exercise, sleep, or a managed chronic condition — then retake the quiz every 90 days to track progress.',
  },
];

export function LongevityQuizArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Longevity Quiz — How Long Will You Live? The 8 Factors That Decide',
    description: 'Take the longevity quiz: 8 science-backed factors (WHO, Harvard) that determine how long you will live, with a worked example and results bands.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/longevity-quiz/',
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title="Longevity Quiz — How Long Will You Live? 8 Factors | BornClock"
        description="Take the longevity quiz — 8 science-backed factors (WHO, Harvard) that determine how long you'll live. Free, 3 minutes, with worked example."
        canonicalUrl="/articles/longevity-quiz"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="longevity-quiz-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Longevity Quiz — How Long Will You Live? The 8 Factors That Decide
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            A longevity quiz answers a deceptively simple question: how long will you live?
            Most online quizzes ask your age and whether you smoke, then quote the national
            average and call it personalised. This one is built differently. It scores{' '}
            <strong>8 evidence-based factors</strong> against research from the World Health
            Organization (WHO), Harvard, the NIH, the Lancet, and the Karolinska Institute —
            and turns your answers into a personalised estimate you can actually act on.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The reason 8 factors matter is that longevity is mostly modifiable. The Karolinska
            Institute's landmark twin study found genetics explains only 25–30% of how long we
            live. The other 70–75% comes down to the daily choices this quiz measures. Below,
            each factor gets its own section — what it measures, the science behind it, and the
            optimal target — followed by a full worked example.{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">
              You can take the quiz itself in the longevity calculator
            </a>.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h2 className="text-lg font-black text-indigo-900 mb-1">
              Take the Longevity Quiz Free
            </h2>
            <p className="text-sm text-indigo-700 mb-4">
              8 questions, 3 minutes, WHO country baselines. Get your longevity score, life
              expectancy estimate, and a personalised 90-day action plan.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                          rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Start My Free Longevity Quiz →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">The 8 Longevity Quiz Factors</h2>
          {LC_FACTORS.map(f => {
            const d = FACTOR_DETAIL[f.id];
            return (
              <section key={f.id} id={`factor-${f.id}`} className="mb-9">
                <h2 className="text-xl font-black text-gray-900 mb-1">
                  {f.emoji} {f.name}
                </h2>
                <div className="text-xs font-semibold text-red-600 mb-3">
                  Impact: {f.impact}
                </div>
                <p className="text-gray-700 leading-relaxed mb-2">
                  <strong>What it measures: </strong>{d.measures}
                </p>
                <p className="text-gray-700 leading-relaxed mb-2">{f.summary}</p>
                <p className="text-gray-700 leading-relaxed mb-2">{f.detail}</p>
                <p className="text-gray-700 leading-relaxed mb-2">
                  <strong>Optimal: </strong>{d.optimal}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Source: </strong>{f.source}
                </p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-3">Worked Example: A 42-Year-Old, Scored Factor by Factor</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            To make the scoring concrete, walk through a realistic profile. Meet a{' '}
            <strong>42-year-old non-smoker who exercises 150 minutes per week and sleeps
            7–8 hours a night</strong>. Assume an otherwise healthy, average diet, no chronic
            conditions, moderate stress, and reasonable social ties. Here is how each of the 8
            factors scores:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Tobacco smoking:</strong> Non-smoker — full marks. This alone protects up to 10 years of life expectancy versus a smoker.</li>
            <li><strong>Body mass index:</strong> Assumed in the healthy 21–23 range — strong. No mortality penalty.</li>
            <li><strong>Chronic conditions:</strong> None reported — strong. Nothing to manage.</li>
            <li><strong>Diet quality:</strong> Average, not Mediterranean-optimal — a middling score and the clearest single upgrade available.</li>
            <li><strong>Sleep duration:</strong> 7–8 hours — optimal. Full marks, avoiding the 12% mortality bump seen under 6 hours.</li>
            <li><strong>Physical exercise:</strong> 150 min/week — hits the WHO 2022 threshold linked to a 31% drop in all-cause mortality. Strong.</li>
            <li><strong>Stress level:</strong> Moderate — a solid mid score with room to improve via a regulation habit.</li>
            <li><strong>Social connections:</strong> Reasonable ties — a good score; deepening them is the next lever after diet.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-3">
            Six of the eight factors are optimal or strong (smoking, BMI, chronic conditions,
            sleep, exercise) with two sitting at "good but improvable" (diet, stress, social).
            Weighting the high-impact protective factors heavily, this profile lands a{' '}
            <strong>longevity score in the mid-to-high 70s</strong> — squarely in the
            <strong> "On Track" band (65–79)</strong>. Starting from a WHO baseline around 80
            for a 42-year-old in a high-income country, the strong exercise, sleep, and
            non-smoking status push the personalised life expectancy estimate up toward the
            <strong> mid-to-high 80s</strong>.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The practical takeaway is what the quiz does next: it ranks the two soft
            factors — diet and stress management — as the highest-yield changes. Shifting to
            a Mediterranean-style diet (linked to a 30% cut in cardiovascular events in the
            PREDIMED trial) would move this person from "On Track" into the "Excellent" band
            (80–100). That is the entire point of a longevity quiz — not the number itself,
            but the prioritised, personalised list of what to change first.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">What Your Longevity Quiz Score Means</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
            <li><strong>80–100 (Excellent):</strong> Top-20% habits. Maintain them and patch any remaining weak factor.</li>
            <li><strong>65–79 (On Track):</strong> Above average, with real gains available from 1–2 targeted factors.</li>
            <li><strong>50–64 (Average):</strong> Several factors are limiting your forecast; addressing the top 3 could add years.</li>
            <li><strong>Below 50 (Needs Attention):</strong> Multiple high-impact factors need work — and change at any age helps.</li>
          </ul>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Ready to Take the Longevity Quiz?</h2>
            <p className="text-indigo-200 mb-6">
              8 science-backed factors. 3 minutes. Free personalised 90-day action plan and
              biological age estimate.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Start My Free Longevity Quiz →
            </a>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-black text-gray-900 mb-3">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/how-to-live-to-100" className="text-indigo-600 font-semibold underline">
                  How to Live to 100 — Habits of Centenarians
                </a>
              </li>
              <li>
                <a href="/articles/exercise-and-longevity" className="text-indigo-600 font-semibold underline">
                  Exercise and Longevity — How Much You Really Need
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default LongevityQuizArticle;
