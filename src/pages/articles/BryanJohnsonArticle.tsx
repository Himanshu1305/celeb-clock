import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Bryan Johnson Blueprint — A Free, Science-Backed Alternative | BornClock';
const DESC = "Bryan Johnson's Blueprint protocol costs $2M/year. Here's a free, science-backed longevity alternative — the habits that actually matter, no budget needed.";
const SLUG = 'bryan-johnson-blueprint-alternative';

type HabitCard = {
  title: string;
  evidence: string;
  what: string;
};

const HABITS: HabitCard[] = [
  {
    title: 'Sleep 7–9 hours on a consistent schedule',
    evidence: 'Strongest lever Johnson pushes — and it costs nothing.',
    what: 'Keep a fixed wake time, get morning light, and protect a dark, cool bedroom. Chronic short sleep is linked in large cohort studies to higher cardiovascular and all-cause mortality. You do not need a sleep lab; you need a routine.',
  },
  {
    title: 'Move most days — mix cardio and strength',
    evidence: 'The single most consistent predictor of longer, healthier life.',
    what: 'Aim for roughly 150 minutes of moderate activity a week plus two strength sessions. Even brisk walking meaningfully lowers mortality risk. No Zone-2 treadmill or VO2-max sled required — a park and your bodyweight are enough.',
  },
  {
    title: 'Eat mostly whole plants, protein, and fewer ultra-processed foods',
    evidence: 'The dietary pattern Johnson chases is, at its core, ordinary and cheap.',
    what: 'Vegetables, legumes, whole grains, nuts, fruit, and adequate protein, with limited added sugar and ultra-processed food. This is the Blue Zones pattern and the Mediterranean pattern — repeatedly linked to lower mortality — reachable on a normal grocery budget.',
  },
  {
    title: 'Do not smoke, and keep alcohol low',
    evidence: 'Removing harm beats adding supplements.',
    what: 'Smoking is the largest single preventable cause of early death. Not smoking, and keeping alcohol modest, delivers more proven life-years than any pill Johnson takes. This step is entirely free.',
  },
  {
    title: 'Invest in social connection',
    evidence: 'One of the most under-rated longevity factors.',
    what: 'Meta-analyses find strong social ties are associated with survival benefits comparable to quitting smoking. Regular contact with friends and family is a genuine longevity intervention — and it is free.',
  },
];

const FAQS = [
  {
    q: 'How much does Bryan Johnson spend on Project Blueprint?',
    a: "Bryan Johnson has publicly stated he spends roughly $2 million a year on his Blueprint longevity protocol, which covers a large medical team, continuous testing, dozens of supplements, custom meals, and frequent scans. That figure is what makes the program inaccessible to almost everyone — and why a free alternative built on the same evidence base is worth understanding.",
  },
  {
    q: 'Is the Bryan Johnson Blueprint scientifically proven?',
    a: 'Parts of Blueprint rest on solid evidence — the emphasis on sleep, exercise, a whole-food diet, and rigorous measurement all align with mainstream science. But much of the specific protocol (the exact supplement stack, the extreme frequency of testing, experimental therapies) is not proven to extend human lifespan. The evidence-backed core is separable from the expensive, experimental extras.',
  },
  {
    q: 'What is a free alternative to the Bryan Johnson Blueprint?',
    a: 'A free alternative is to adopt the handful of habits with the strongest longevity evidence: sleep 7–9 hours consistently, exercise most days combining cardio and strength, eat mostly whole plants and adequate protein, avoid smoking and excess alcohol, and maintain strong social connections. None of these require a budget, and together they capture most of the achievable benefit.',
  },
  {
    q: 'Do I need expensive testing and supplements to live longer?',
    a: 'No. Continuous biomarker testing and large supplement stacks are the most costly part of Blueprint and the least proven for healthy people. For most people, occasional standard check-ups plus consistent lifestyle habits deliver the vast majority of the benefit. Supplements can help fix specific deficiencies, but they are not a substitute for sleep, movement, and diet.',
  },
  {
    q: 'How can BornClock help me track my longevity progress?',
    a: 'BornClock turns your date of birth into clear, personalised figures — your exact age, days lived, and life-expectancy estimates — and our longevity calculator lets you see how everyday habits shift the picture. It is a free, science-backed way to make the abstract goal of "living longer" concrete, without a $2M team behind you.',
  },
];

export function BryanJohnsonArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Bryan Johnson Blueprint — A Free, Science-Backed Alternative',
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

      <main data-testid="bryan-johnson-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            The Bryan Johnson Blueprint — And a Free, Science-Backed Alternative
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Tech entrepreneur Bryan Johnson has become the most visible face of the modern
            longevity movement. After selling his payments company Braintree, he poured his
            fortune into <strong>Project Blueprint</strong> — an intensely measured attempt to
            slow, and ideally reverse, his own biological ageing. His routine is documented in
            granular detail: hundreds of biomarkers tracked, dozens of supplements, custom
            meals weighed to the gram, MRI and ultrasound scans, and a full medical team
            interpreting the data.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The headline number is what stops most people: Johnson has said Blueprint costs him
            around <strong>$2 million a year</strong>. That price tag is the whole problem. The
            good news is that the parts of his protocol with the strongest scientific support
            are almost all things you can do for <strong>free</strong>. This article separates
            the evidence-backed core from the expensive extras, and gives you a free alternative
            you can start today.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">What Bryan Johnson Actually Does</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Strip away the theatrics and Blueprint rests on four pillars that mainstream science
            broadly agrees on:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Measurement:</strong> continuous testing of sleep, heart rate, blood markers, and organ function to catch problems early and track change.</li>
            <li><strong>Diet:</strong> a nutrient-dense, mostly plant-based pattern with controlled calories and adequate protein.</li>
            <li><strong>Sleep:</strong> a fiercely protected, consistent sleep schedule treated as non-negotiable.</li>
            <li><strong>Exercise:</strong> daily structured movement combining cardio, strength, and mobility work.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            On top of that sits a large, more experimental layer: a big supplement stack,
            frequent advanced imaging, and therapies whose long-term human benefits are still
            unproven. The pillars are sound. The layer on top is where the money — and the
            uncertainty — lives.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">What&apos;s Actually Inaccessible</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The reason you cannot simply copy Blueprint is not the diet or the sleep — those are
            free. It is the <strong>cost and the extreme measurement</strong>. A dedicated
            physician team, monthly blood panels, regular MRI scans, custom-formulated meals,
            and a rotating menu of supplements add up to the roughly $2M annual figure. For
            almost everyone, that level of instrumentation offers steeply diminishing returns.
            The measurements confirm what the habits already deliver — but you do not need to
            pay to measure something in order to benefit from doing it.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">The Free Alternative: The Habits That Actually Matter</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Decades of population research converge on a short list of habits that do most of the
            work in extending healthy lifespan. These are the same behaviours Johnson optimises
            with his fortune — and every one of them is free.
          </p>

          <div className="space-y-4 mb-8">
            {HABITS.map((h, i) => (
              <div key={i} className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
                <h3 className="text-lg font-black text-emerald-900 mb-1">{i + 1}. {h.title}</h3>
                <p className="text-sm text-emerald-700 font-semibold mb-2">{h.evidence}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{h.what}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8 text-center">
            <h3 className="text-lg font-black text-indigo-900 mb-2">See how these habits change your numbers</h3>
            <p className="text-sm text-indigo-700 mb-4">
              Our free longevity calculator estimates how sleep, exercise, diet, and smoking
              status shift your life-expectancy — no budget, no medical team required.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3
                          rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Try the free longevity calculator →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">How the Options Compare</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Here is a plain comparison of two free tools against the full Blueprint protocol,
            across the things that matter most.
          </p>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-900">
                  <th className="border border-gray-300 px-3 py-2 text-left">Approach</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Cost</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Personalisation</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Science-backed</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Accessible</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-gray-700">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">Death Clock</td>
                  <td className="border border-gray-300 px-3 py-2">Free</td>
                  <td className="border border-gray-300 px-3 py-2">Low — mostly novelty</td>
                  <td className="border border-gray-300 px-3 py-2">Limited</td>
                  <td className="border border-gray-300 px-3 py-2">Yes</td>
                </tr>
                <tr className="text-gray-700 bg-emerald-50">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">BornClock</td>
                  <td className="border border-gray-300 px-3 py-2">Free</td>
                  <td className="border border-gray-300 px-3 py-2">High — from your date of birth &amp; habits</td>
                  <td className="border border-gray-300 px-3 py-2">Yes — evidence-based estimates</td>
                  <td className="border border-gray-300 px-3 py-2">Yes</td>
                </tr>
                <tr className="text-gray-700">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">Bryan Johnson Blueprint</td>
                  <td className="border border-gray-300 px-3 py-2">~$2M / year</td>
                  <td className="border border-gray-300 px-3 py-2">Very high — full medical team</td>
                  <td className="border border-gray-300 px-3 py-2">Partly — core yes, extras unproven</td>
                  <td className="border border-gray-300 px-3 py-2">No — cost-prohibitive</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            The takeaway is simple: Blueprint&apos;s biggest advantage is the depth of its
            measurement, not the habits themselves — and the habits are what actually move
            the needle. A <strong>free</strong> tool paired with consistent behaviour captures
            most of the benefit at none of the cost.
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
            <h2 className="text-2xl font-black mb-2">Build Your Own Longevity Plan — Free</h2>
            <p className="text-indigo-200 mb-6">
              You do not need a $2M budget to take ageing seriously. Use BornClock&apos;s free
              longevity calculator to see how the habits that matter reshape your projected
              lifespan.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Open the Free Longevity Calculator →
            </a>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-black text-gray-900 mb-3">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/how-to-live-to-100"
                   className="text-indigo-600 font-semibold hover:underline">
                  How to Live to 100 — Habits of the World&apos;s Longest-Lived People →
                </a>
              </li>
              <li>
                <a href="/articles/blue-zones-diet"
                   className="text-indigo-600 font-semibold hover:underline">
                  The Blue Zones Diet — What the Longest-Living Communities Eat →
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default BryanJohnsonArticle;
