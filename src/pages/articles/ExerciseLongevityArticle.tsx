import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Exercise and Longevity — How Movement Adds Years | BornClock';
const DESC = 'Exercise and longevity — the science on how movement adds years. JAMA & Lancet data, step counts, resistance training, and a 30-day plan for Indians.';

const FAQS = [
  {
    q: 'How much exercise do I need to live longer?',
    a: 'The evidence points to 150 minutes of moderate activity per week as the baseline. A landmark JAMA (2012) study by Wen et al. found that just 15 minutes of moderate exercise a day — around 90 minutes a week — was linked to a 14% lower risk of death, and full compliance with 150 minutes a week was associated with roughly 3.4 extra years of life. More is generally better up to a point, but even modest, consistent movement delivers most of the benefit.',
  },
  {
    q: 'Do daily steps really affect how long I live?',
    a: 'Yes. A JAMA (2021) study found that walking 8,000 or more steps a day was associated with a 51% lower risk of all-cause mortality compared with only 4,000 steps a day. Notably, the benefit came from step volume rather than intensity — so a brisk morning park walk in your neighbourhood counts. You do not need 10,000 steps to see a meaningful effect; the biggest jump in survival happens as you move from a sedentary 4,000 up toward 8,000 steps.',
  },
  {
    q: 'Is resistance training important for longevity, or is cardio enough?',
    a: 'Both matter, and resistance training has its own independent benefit. A meta-analysis in the British Journal of Sports Medicine (2022) found that resistance (muscle-strengthening) training just 1–2 times per week was associated with a 23% lower risk of death from any cause. Strength work preserves muscle mass, bone density and metabolic health as you age, which cardio alone cannot fully provide. Combining aerobic activity with 1–2 weekly strength sessions gives the strongest longevity payoff.',
  },
  {
    q: 'How bad is sitting all day for my health?',
    a: 'Prolonged sitting is a serious, independent risk. Research published in the Annals of Internal Medicine found that being sedentary for more than 8 hours a day is comparable to the mortality risk of smoking and obesity, even in people who exercise. The practical fix is to break up long sitting periods: stand and move for a few minutes every 30–60 minutes, take walking phone calls, and use stairs. Movement scattered through the day matters as much as a single workout.',
  },
  {
    q: 'Can high-intensity exercise add more years than moderate activity?',
    a: 'Higher intensity does appear to offer extra protection. A large Lancet (2017) study found that people doing high levels of physical activity, including higher-intensity effort, had a 39% lower risk of all-cause mortality. That said, intensity should be layered on top of a consistent base, not instead of it — and it should be introduced gradually. For most Indians starting out, building the habit with brisk walking, cycling to work, or yoga first, then adding intensity, is both safer and sustainable.',
  },
];

export function ExerciseLongevityArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Exercise and Longevity — How Movement Adds Years to Your Life',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/exercise-and-longevity/',
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
        title={TITLE}
        description={DESC}
        canonicalUrl="/articles/exercise-and-longevity"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="exercise-longevity-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Exercise and Longevity — How Movement Adds Years to Your Life
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Of every lifestyle choice you can make, regular exercise is the one most
            consistently linked to a longer, healthier life. It is not a fad or a
            supplement — it is the closest thing medicine has to a genuine anti-ageing
            intervention, and the evidence comes from some of the largest and most
            respected studies ever run. This guide walks through what the science
            actually shows, how it applies to everyday Indian life, and a practical
            30-day plan to get you moving. If you want to see how your own habits stack
            up, try the <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">BornClock longevity calculator</a> once
            you have read through the numbers below.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The message of the research is encouraging: you do not need to become an
            athlete. Most of the life-extending benefit comes from moving from doing
            nothing to doing something. A daily park walk, cycling to work, a game of
            cricket on the weekend, or a short morning yoga routine can each move the
            needle. Below, the hard data first — then how to build the habit.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">What the Science Says</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The most cited baseline is 150 minutes of moderate exercise per week — the
            level recommended by the WHO and most health bodies. In a landmark JAMA
            (2012) study by Wen et al., following more than 400,000 people, meeting this
            target was associated with roughly <strong>3.4 extra years of life</strong>.
            Even a fraction of it helped: 15 minutes a day cut the risk of death by 14%.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Intensity adds a further layer. A large Lancet (2017) study reported that
            people doing high-intensity or high-volume physical activity had a{' '}
            <strong>39% lower risk of all-cause mortality</strong> compared with the
            least active. Intensity is not a replacement for consistency — it is a bonus
            built on top of a regular base.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can also measure this in <strong>step count</strong>. A JAMA (2021)
            study found that walking <strong>8,000 or more steps a day was linked to a
            51% lower risk of all-cause mortality</strong> compared with just 4,000
            steps. Crucially, it was total steps — not walking speed — that mattered, so
            a steady morning walk in the park counts fully.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cardio is only half the picture. <strong>Resistance training</strong> — lifting,
            bodyweight work, or bands — carries an independent benefit. A meta-analysis
            in the British Journal of Sports Medicine (2022) found that resistance
            training just <strong>1–2 times per week was associated with a 23% lower
            risk of mortality</strong>. Muscle and bone strength protect you against
            falls, frailty and metabolic disease as you age.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Finally, a warning about the opposite of movement. Research in the Annals of
            Internal Medicine found that being <strong>sedentary for more than 8 hours a
            day is comparable to the risk of smoking</strong> — even for people who
            exercise. Long, unbroken sitting is its own hazard, so breaking it up
            through the day matters as much as any single workout.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h3 className="text-lg font-black text-indigo-900 mb-3">The Numbers at a Glance</h3>
            <ul className="text-sm text-indigo-900 space-y-2">
              <li>• <strong>+3.4 years</strong> of life — 150 min/week moderate exercise (JAMA 2012, Wen et al.)</li>
              <li>• <strong>39% lower</strong> all-cause mortality — high-intensity exercise (Lancet 2017)</li>
              <li>• <strong>51% lower</strong> all-cause mortality — 8,000+ steps/day vs 4,000 (JAMA 2021)</li>
              <li>• <strong>23% lower</strong> mortality — resistance training 1–2×/week (British Journal of Sports Medicine 2022)</li>
              <li>• Sitting <strong>&gt;8 hrs/day</strong> ≈ risk of smoking (Annals of Internal Medicine)</li>
            </ul>
            <p className="text-sm text-indigo-700 mt-4">
              Curious what these habits could mean for you personally? The{' '}
              <a href="/longevity-calculator" className="text-indigo-700 font-bold underline">longevity calculator</a> turns
              lifestyle inputs like activity level into an estimated life expectancy.
            </p>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Movement the Indian Way</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You do not need a gym membership or imported equipment to hit these targets.
            India already has a rich culture of everyday movement — the trick is to make
            it deliberate and regular.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li><strong>Morning park walks:</strong> The classic neighbourhood walk is
              pure step-count gold. A brisk 40-minute round easily adds 4,000–5,000 steps
              and doubles as social time.</li>
            <li><strong>Yoga:</strong> Sun salutations (Surya Namaskar) blend mobility,
              light strength and breath work — an accessible way to build a daily base
              and, with held poses, a form of resistance training.</li>
            <li><strong>Cycling to work:</strong> Where roads allow, cycling turns a
              commute into moderate-to-vigorous cardio without spending a rupee extra.</li>
            <li><strong>Cricket:</strong> A weekend match delivers sprints, throwing and
              hours on your feet — a genuinely intense session disguised as fun.</li>
            <li><strong>Resistance at home:</strong> Squats, push-ups, lunges and a pair
              of resistance bands or filled water cans cover strength work with zero gym
              cost.</li>
          </ul>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Your 30-Day Progressive Plan</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            This four-week plan is built around the Indian lifestyle above. It starts
            gently and ramps up so your body adapts. Combine cardio (steps, walking,
            cycling) with two weekly resistance sessions — the combination the research
            rewards most.
          </p>

          <div className="space-y-6 mb-10">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-2">Week 1 — Build the Habit</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 20–25 minute morning park walk, 5 days — aim for ~5,000 steps/day.</li>
                <li>• 1 short resistance session: 2 sets of 8 squats, 6 push-ups (knees ok), 8 lunges.</li>
                <li>• Stand and move for 2–3 minutes every hour to break up sitting.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-2">Week 2 — Add Distance</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Walk 30 minutes, 5–6 days — push toward 6,500 steps/day.</li>
                <li>• 2 resistance sessions: 3 sets of 10 squats, 8 push-ups, 10 lunges, plus 20-sec planks.</li>
                <li>• Add 10 rounds of Surya Namaskar on a rest day for mobility.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-2">Week 3 — Add Intensity</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Reach ~8,000 steps/day; include one brisk-pace or cycling-to-work day.</li>
                <li>• 2 resistance sessions with added load (bands or water cans), 3 sets each.</li>
                <li>• One "fun intensity" session — a game of cricket or badminton on the weekend.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-2">Week 4 — Lock It In</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Hold 8,000+ steps/day and hit the 150 min/week moderate-activity target.</li>
                <li>• 2 full resistance sessions (the 23%-mortality-cut dose) plus one intensity session.</li>
                <li>• Review the month, keep what fits your routine, and make it permanent.</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">
            After 30 days you will have quietly assembled every ingredient the studies
            reward: a step count above 8,000, 150 minutes of weekly moderate activity,
            resistance training twice a week, and far less unbroken sitting. Keep it
            going and the years, on the evidence, add up. Check your progress against an
            estimate with the{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">longevity calculator</a>.
          </p>

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
            <h2 className="text-2xl font-black mb-2">See How Many Years You Could Gain</h2>
            <p className="text-indigo-200 mb-6">
              Exercise is one of the biggest levers on lifespan. Enter your habits into
              the BornClock longevity calculator to get a personalised life-expectancy
              estimate — and see the impact of moving more.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Try the Longevity Calculator →
            </a>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/how-to-live-to-100" className="text-indigo-600 font-semibold underline">
                  How to Live to 100 — Habits of the World's Longest-Lived People
                </a>
              </li>
              <li>
                <a href="/articles/longevity-quiz" className="text-indigo-600 font-semibold underline">
                  The Longevity Quiz — Test Your Lifestyle Against the Science
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default ExerciseLongevityArticle;
