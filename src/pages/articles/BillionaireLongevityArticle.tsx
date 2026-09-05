import React from 'react';
import { SEO } from '@/components/SEO';
import { calculateLifePathNumber } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Longevity Habits of Indian Billionaires | BornClock';
const DESC = 'Longevity habits of Indian billionaires — Ratan Tata, Azim Premji, Mukesh Ambani. Documented health habits, their Life Path numbers, and lessons for you.';
const SLUG = 'longevity-habits-of-indian-billionaires';

// Real dates of birth (public record). Life Path numbers computed, never hardcoded.
const BILLIONAIRES = [
  {
    name: 'Ratan Tata',
    dob: { day: 28, month: 12, year: 1937 },
    dobLabel: 'December 28, 1937',
    documented:
      'Ratan Tata was widely documented as living with notable personal simplicity despite leading one of India’s largest conglomerates — driving himself, keeping a relatively private life, and channelling much of the Tata group’s profits into philanthropy through the Tata Trusts. He was publicly known for measured, unhurried decision-making and a strong sense of purpose that extended well past conventional retirement age.',
    lesson:
      'A sense of purpose and low personal ego are consistent themes in longevity research. Tata’s example points less to any diet secret and more to sustained meaning, restraint, and staying engaged with work he cared about into his later years.',
  },
  {
    name: 'Azim Premji',
    dob: { day: 24, month: 7, year: 1945 },
    dobLabel: 'July 24, 1945',
    documented:
      'Azim Premji, the founder-chairman of Wipro, is well documented for an unusually frugal lifestyle for someone of his wealth — flying economy in his earlier years and famously careful with expenses — alongside one of the largest philanthropic commitments in Indian history through the Azim Premji Foundation. He is consistently described as disciplined and understated.',
    lesson:
      'Financial discipline and a life organised around giving rather than consumption map onto lower-stress, higher-meaning living. The documented lesson here is habit and consistency over indulgence.',
  },
  {
    name: 'Mukesh Ambani',
    dob: { day: 19, month: 4, year: 1957 },
    dobLabel: 'April 19, 1957',
    documented:
      'Mukesh Ambani, chairman of Reliance Industries, has publicly spoken about following a vegetarian diet, and reports of significant, deliberate weight loss through diet and daily walking have been widely covered in the press. He is described as a disciplined, early-rising worker with a strong family-centred routine.',
    lesson:
      'The most transferable, documented habits here are ordinary ones: a largely vegetarian diet, regular walking, and consistent daily structure — none of which require a billionaire’s budget.',
  },
];

const FAQS = [
  {
    q: 'What longevity habits do Indian billionaires share?',
    a: 'The publicly documented habits are surprisingly ordinary and consistent: personal discipline and routine, a sense of purpose that keeps them engaged well past normal retirement age, and — in Mukesh Ambani’s case specifically — a vegetarian diet and regular walking. These are the same habits longevity research links to longer, healthier lives, and none of them depend on wealth.',
  },
  {
    q: 'What is Mukesh Ambani’s documented approach to health?',
    a: 'Mukesh Ambani has publicly described following a vegetarian diet, and widely reported coverage has noted a deliberate weight-loss effort through diet and daily walking. He is also described as an early riser with a disciplined daily routine centred on family. We report only what is publicly documented and avoid unverified claims.',
  },
  {
    q: 'What is a Life Path number and why calculate it for billionaires?',
    a: 'A Life Path number is a numerology figure derived from a person’s full date of birth by reducing the digits to a single number (keeping master numbers 11, 22 and 33). We compute it directly from each billionaire’s real, publicly known date of birth as a bit of cultural insight — it is presented for reflection and entertainment, not as an explanation of their success or health.',
  },
  {
    q: 'Can ordinary people copy the longevity habits of the ultra-wealthy?',
    a: 'Yes — the transferable habits are the affordable ones. A largely plant-based diet, daily walking, consistent sleep and routine, and a strong sense of purpose are available to anyone. The genuine lessons from wealthy Indians are about discipline and meaning, not about expensive interventions.',
  },
  {
    q: 'How can I estimate my own life expectancy?',
    a: 'Use BornClock’s longevity calculator, which starts from the national life-table baseline and adjusts for your age, sex and lifestyle. It gives a personalised estimate you can plan around, rather than a single national average.',
  },
];

export function BillionaireLongevityArticle() {
  const enriched = BILLIONAIRES.map(b => ({
    ...b,
    lifePath: calculateLifePathNumber(b.dob.day, b.dob.month, b.dob.year),
  }));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Longevity Habits of Indian Billionaires',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: `https://bornclock.com/articles/${SLUG}/`,
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
      <SEO title={TITLE} description={DESC} canonicalUrl={`/articles/${SLUG}`} ogType="article" />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="billionaire-longevity-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Longevity Habits of Indian Billionaires
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            When people picture the health routines of the ultra-wealthy, they imagine private
            doctors and exotic interventions. The publicly documented habits of India's most famous
            billionaires — Ratan Tata, Azim Premji and Mukesh Ambani — tell a quieter, more useful
            story. Their common threads are discipline, purpose, and, in the case of Ambani, an
            ordinary vegetarian diet and daily walking. This article sticks strictly to what is on
            the public record, adds each person's numerology Life Path number computed from their
            real date of birth, and draws out the longevity lessons that anyone can apply.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            A note on honesty: we deliberately avoid inventing health claims. Where a habit is not
            publicly documented, we do not speculate. What follows is measured and verifiable.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">The Three Billionaires</h2>
          <div className="space-y-6 mb-8">
            {enriched.map(b => (
              <section key={b.name} className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                    {b.lifePath}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{b.name}</h3>
                    <div className="text-sm text-indigo-700 font-semibold">
                      Life Path {b.lifePath}
                    </div>
                    <div className="text-xs text-gray-500">Born {b.dobLabel}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Documented public record: </strong>{b.documented}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Longevity lesson: </strong>{b.lesson}
                </p>
              </section>
            ))}
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            The Life Path numbers above are computed directly from each billionaire's real date of
            birth using the standard numerology reduction method. We present them as cultural
            insight and reflection — a Life Path number does not cause success, health or longevity,
            and we make no such claim. It is simply a lens some readers enjoy.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h3 className="text-lg font-black text-indigo-900 mb-2">How long might you live?</h3>
            <p className="text-sm text-indigo-700 mb-4">
              The habits below are free. Start by seeing your own baseline — then decide which
              lessons are worth adopting.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Estimate My Life Expectancy →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Longevity Lessons You Can Actually Use</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Strip away the wealth and the documented habits of these Indian billionaires converge on
            a short, affordable list — the same list longevity science tends to endorse:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
            <li>
              <strong>A largely plant-based diet.</strong> Ambani's publicly stated vegetarianism
              mirrors decades of nutrition research linking plant-forward eating to lower
              cardiovascular risk.
            </li>
            <li>
              <strong>Daily movement.</strong> Regular walking — cheap, low-impact and sustainable —
              appears repeatedly in coverage of Ambani's routine and is one of the best-evidenced
              longevity habits.
            </li>
            <li>
              <strong>Discipline and routine.</strong> Premji's documented frugality and consistency
              reflect the stable, low-chaos daily structure associated with healthier ageing.
            </li>
            <li>
              <strong>Purpose that outlasts a career.</strong> Tata's continued engagement and
              philanthropy well past normal retirement age echoes the strong link between a sense of
              purpose and longer life.
            </li>
            <li>
              <strong>Giving over consuming.</strong> All three are defined more by what they gave
              away than by conspicuous consumption — a lower-stress orientation that research
              associates with wellbeing.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The reassuring conclusion is that none of these require a billionaire's balance sheet.
            Diet, movement, routine and purpose are available to everyone — which means the real
            longevity advantage of the ultra-wealthy is less about money and more about habit.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">See Your Own Longevity Baseline</h2>
            <p className="text-indigo-200 mb-6">
              Adopt the free habits — and track your progress against a personalised estimate of how
              long you might live.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3 rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Open the Longevity Calculator →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Related Articles</h2>
          <ul className="list-disc pl-6 text-indigo-700 space-y-2 mb-6">
            <li>
              <a href="/articles/how-indian-celebrities-stay-fit" className="hover:underline font-semibold">
                How Indian Celebrities Stay Fit
              </a>
            </li>
            <li>
              <a href="/articles/how-to-live-to-100" className="hover:underline font-semibold">
                How to Live to 100
              </a>
            </li>
          </ul>

        </article>
      </main>
    </>
  );
}

export default BillionaireLongevityArticle;
