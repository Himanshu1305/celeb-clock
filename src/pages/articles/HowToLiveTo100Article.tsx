import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'How to Live to 100 — Blue Zones & Science-Backed Habits | BornClock';
const DESC = 'How to live to 100 — the Blue Zones Power 9, Harvard Study findings, and an India-specific longevity plan. Evidence-based habits for a longer life.';

const BLUE_ZONES = [
  {
    name: 'Sardinia',
    country: 'Italy',
    note: 'The mountainous Nuoro province is home to the world\'s highest concentration of male centenarians. Shepherds walk many kilometres of hilly terrain daily, drink local Cannonau red wine, and eat a lean, plant-heavy diet of sourdough, beans, and pecorino from grass-fed sheep.',
  },
  {
    name: 'Okinawa',
    country: 'Japan',
    note: 'Once home to the longest-lived women on Earth. Okinawans practise "hara hachi bu" — eating until 80% full — and maintain "moai", lifelong circles of friends who provide financial and emotional support from childhood into old age.',
  },
  {
    name: 'Loma Linda',
    country: 'United States',
    note: 'A community of Seventh-day Adventists in California who live roughly a decade longer than the average American. Their faith encourages a plant-based diet, no smoking or alcohol, a weekly day of rest, and strong community worship.',
  },
  {
    name: 'Nicoya',
    country: 'Costa Rica',
    note: 'A peninsula where elders keep a strong "plan de vida" — a reason to live. Their calcium-rich water, a simple diet of beans, squash, and corn tortillas, and close family ties support exceptional longevity at low cost.',
  },
  {
    name: 'Ikaria',
    country: 'Greece',
    note: 'An Aegean island where "people forget to die." Ikarians nap daily, follow a Mediterranean diet rich in wild greens and olive oil, drink herbal teas, and keep a relaxed, unhurried relationship with time.',
  },
];

const POWER_9 = [
  { name: 'Move Naturally', note: 'The longest-lived people do not run marathons or lift weights — they live in environments that nudge them into constant movement: gardening, walking, kneading bread, herding, and doing chores by hand.' },
  { name: 'Purpose', note: 'Okinawans call it "ikigai" and Nicoyans call it "plan de vida" — a clear reason to wake up in the morning. Knowing your sense of purpose is worth up to seven extra years of life expectancy.' },
  { name: 'Downshift', note: 'Everyone experiences stress, which drives chronic inflammation linked to major age-related disease. The world\'s centenarians have daily rituals to shed it — prayer, napping, happy hour, or ancestor remembrance.' },
  { name: '80% Rule', note: '"Hara hachi bu" — the Okinawan reminder to stop eating when the stomach is 80% full. That small gap between not hungry and full can be the difference between losing weight and gaining it.' },
  { name: 'Plant Slant', note: 'Beans — fava, black, soy, and lentils — are the cornerstone of most centenarian diets. Meat is eaten in small amounts, roughly five times a month, as a celebration rather than a staple.' },
  { name: 'Wine at 5', note: 'People in most Blue Zones drink alcohol moderately and regularly — one to two glasses a day, with friends and with food. (The habit is optional and not advised for anyone who should avoid alcohol.)' },
  { name: 'Belong', note: 'Almost all centenarians in the original study belonged to a faith-based community. Attending services four times a month adds an estimated four to fourteen years of life expectancy.' },
  { name: 'Loved Ones First', note: 'Successful centenarians keep ageing parents nearby, commit to a life partner, and invest in their children — a family-first structure that protects health at every stage of life.' },
  { name: 'Right Tribe', note: 'The world\'s longest-lived people chose, or were born into, social circles that support healthy behaviours. Habits like smoking, over-eating, and happiness are contagious across friendship networks.' },
];

const FAQS = [
  {
    q: 'What is the single most important habit for living to 100?',
    a: 'There is no single magic habit — longevity in the Blue Zones comes from a whole environment of small daily choices. If forced to pick one, researchers point to strong social connection: the 80-year Harvard Study of Adult Development found that the quality of your relationships is the strongest predictor of healthy ageing, outperforming cholesterol, wealth, or IQ.',
  },
  {
    q: 'Is living to 100 mostly genetics or lifestyle?',
    a: 'Studies of twins suggest that only about 20% of how long the average person lives is dictated by genes — the remaining ~80% is driven by lifestyle and environment. Genetics may matter more for those who reach extreme old age, but for most people, diet, movement, purpose, and relationships are far more decisive than family history.',
  },
  {
    q: 'What do people in the Blue Zones eat?',
    a: 'A predominantly plant-based diet built on beans, whole grains, greens, nuts, and seasonal vegetables, with very little meat, sugar, or processed food. They eat their largest meal earlier in the day, stop at about 80% full, and treat meat and sweets as occasional celebrations rather than daily staples.',
  },
  {
    q: 'Can I still live longer if I start healthy habits later in life?',
    a: 'Yes. Research consistently shows it is never too late — adopting better movement, diet, sleep, and social habits in your 40s, 50s, or even 60s meaningfully lowers disease risk and can add healthy years. The Blue Zones approach is about steady, sustainable changes to your everyday environment, not a perfect record from birth.',
  },
  {
    q: 'How can I estimate my own life expectancy?',
    a: 'You can use BornClock\'s free life expectancy calculator, which combines your age and country-level data to give a personalised estimate, and pairs it with science-backed habits to help you add healthy years. It is an educational tool for reflection, not a medical diagnosis.',
  },
];

export function HowToLiveTo100Article() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Live to 100 — Blue Zones, the Power 9 & Science-Backed Habits',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/how-to-live-to-100/',
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
        canonicalUrl="/articles/how-to-live-to-100"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="how-to-live-to-100-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            How to Live to 100 — Blue Zones & Science-Backed Habits
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Living to 100 was once vanishingly rare. Today it is the fastest-growing age
            group on Earth, and researchers have learned that reaching a healthy century is
            far less about luck — or even genes — than most people assume. The clearest
            evidence comes from a handful of places where people routinely live past 100 in
            good health, identified by researcher Dan Buettner and a team of demographers and
            named the <strong>Blue Zones</strong>. Study how these communities live and a
            surprisingly simple, repeatable pattern emerges.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            This guide walks through the five original Blue Zones, the nine shared habits
            researchers distilled from them (the "Power 9"), what the world's longest-running
            study of human happiness reveals about ageing, how much of your lifespan is
            actually written in your DNA, and how these ideas translate to life in India.
            You can also estimate your own trajectory with our{' '}
            <a href="/how-long-will-i-live" className="text-indigo-600 font-semibold underline">
              life expectancy calculator
            </a>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Five Blue Zones</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            A Blue Zone is a region with an unusually high number of people who live to 100 —
            and, crucially, stay active and healthy while doing so. Five have been rigorously
            documented. They span three continents, four languages, and wildly different
            diets, yet they share the same underlying lifestyle DNA.
          </p>
          <div className="space-y-5 mb-10">
            {BLUE_ZONES.map(z => (
              <section key={z.name} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  {z.name}, {z.country}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{z.note}</p>
              </section>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Power 9 — Habits Shared by the World's Centenarians</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Comparing all five Blue Zones, researchers found nine lifestyle characteristics
            common to every one of them. None of them is exotic or expensive. Together they
            form a practical blueprint for adding years — and, more importantly, health — to
            your life.
          </p>
          <div className="space-y-4 mb-10">
            {POWER_9.map((p, i) => (
              <section key={p.name} className="flex gap-4">
                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{p.note}</p>
                </div>
              </section>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Harvard Study: Relationships Predict Healthy Ageing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Blue Zones findings are echoed by the longest-running study of adult life ever
            conducted: the <strong>Harvard Study of Adult Development</strong>, which has
            followed the same group of men — and later their families — for more than 80 years.
            Its director, psychiatrist Robert Waldinger, summarises the central discovery
            bluntly: the people who stayed healthiest and lived longest were not the richest or
            the most famous, but those with the warmest, most secure relationships.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Good relationships, the study found, do more than make us happy — they protect the
            body. Loneliness turns out to be as damaging to health as smoking or obesity, while
            strong social ties buffer stress, slow cognitive decline, and are linked to longer,
            healthier lives. This is exactly why "Belong," "Loved Ones First," and "Right Tribe"
            appear in the Power 9. Longevity is a team sport.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Genetics vs Lifestyle: The 20/80 Split</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            A common excuse for poor habits is "it's all in the genes." The data says otherwise.
            Studies of Danish twins suggest that only about <strong>20% of how long the average
            person lives is determined by genetics</strong> — the remaining roughly 80% is
            shaped by lifestyle and environment: what you eat, how much you move, how you handle
            stress, whether you smoke, and how connected you are to other people. Genes may load
            the gun, but lifestyle pulls the trigger. That is empowering news: most of the levers
            that decide your healthspan are within your control.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Longevity, the Indian Way</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            India carries some of the world's oldest longevity traditions, several of which map
            neatly onto the Power 9. <strong>Yoga</strong> combines natural movement, breath
            control, and downshifting into a single daily practice — a built-in answer to two
            Blue Zone principles at once. <strong>Ayurveda</strong>, India's traditional system
            of medicine, has for millennia emphasised eating with the seasons, moderation, and
            routine ("dinacharya"), closely mirroring the plant-slant and 80%-rule habits of the
            longest-lived communities.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Indian <strong>joint family</strong> is arguably a ready-made Blue Zone social
            fabric: multiple generations under one roof deliver "Loved Ones First," "Belong," and
            "Right Tribe" automatically, keeping elders engaged, purposeful, and cared for. And
            the Indian kitchen offers a quiet advantage — <strong>turmeric</strong>, whose active
            compound curcumin is studied for its anti-inflammatory effects, is used daily across
            the country.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The challenges are real, though. Rising <strong>air pollution</strong> in Indian
            cities shortens life expectancy measurably, and the rapid adoption of{' '}
            <strong>ultra-processed foods</strong>, sugary drinks, and sedentary desk jobs is
            eroding traditional advantages. The opportunity is to keep the yoga, the shared
            meals, the joint-family bonds, and the turmeric — while cutting the packaged snacks
            and protecting the air we breathe.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">How Long Will You Live?</h2>
            <p className="text-indigo-200 mb-6">
              Get a personalised life expectancy estimate from your age and country — then see
              which science-backed habits could add healthy years to your life.
            </p>
            <a href="/how-long-will-i-live"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3 rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Calculate My Life Expectancy →
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

          <div className="border-t border-gray-200 pt-8 mb-6">
            <h2 className="text-xl font-black text-gray-900 mb-3">Keep Reading</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ready to put this into practice? Estimate your own numbers with the{' '}
              <a href="/how-long-will-i-live" className="text-indigo-600 font-semibold underline">
                life expectancy calculator
              </a>{' '}
              or explore the science further with our{' '}
              <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">
                longevity calculator
              </a>.
            </p>
            <h3 className="font-bold text-gray-900 mb-2">Related Articles</h3>
            <ul className="list-disc pl-6 text-indigo-600 space-y-1">
              <li>
                <a href="/articles/blue-zones-diet" className="font-semibold underline">
                  The Blue Zones Diet: What the World's Longest-Lived People Eat
                </a>
              </li>
              <li>
                <a href="/articles/exercise-and-longevity" className="font-semibold underline">
                  Exercise and Longevity: How Movement Adds Years
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default HowToLiveTo100Article;
