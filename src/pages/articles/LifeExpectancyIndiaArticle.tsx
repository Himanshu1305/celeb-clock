import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Real SRS 2020 (Sample Registration System, Office of the Registrar General of India)
// life expectancy at birth, in years, by state.
const HIGHEST_STATES: { state: string; le: string }[] = [
  { state: 'Kerala', le: '75.1' },
  { state: 'Delhi', le: '73.2' },
  { state: 'Punjab', le: '72.6' },
  { state: 'Himachal Pradesh', le: '72.0' },
];

const LOWEST_STATES: { state: string; le: string }[] = [
  { state: 'Madhya Pradesh', le: '66.5' },
  { state: 'Assam', le: '66.2' },
  { state: 'Chhattisgarh', le: '65.3' },
  { state: 'Uttar Pradesh', le: '65.0' },
];

const FAQS = [
  {
    q: 'What is the average life expectancy in India?',
    a: "According to the Sample Registration System (SRS) 2020 released by the Office of the Registrar General of India, life expectancy at birth for India is 70.2 years overall — 68.7 years for men and 71.7 years for women. This is a dramatic improvement from around 32 years at independence in 1947, driven by better vaccination coverage, maternal and child health programmes, and access to clean water.",
  },
  {
    q: 'Which state in India has the highest life expectancy?',
    a: 'Kerala has the highest life expectancy in India at 75.1 years — roughly five years above the national average of 70.2. Kerala is followed by Delhi (73.2), Punjab (72.6) and Himachal Pradesh (72.0). Kerala\'s lead is credited to near-universal literacy, a dense public-health network, high vaccination rates and a diet rich in fish, vegetables and coconut.',
  },
  {
    q: 'Which state in India has the lowest life expectancy?',
    a: 'Uttar Pradesh has the lowest life expectancy among major states at 65.0 years, followed by Chhattisgarh (65.3), Assam (66.2) and Madhya Pradesh (66.5). These states face higher infant and maternal mortality, lower per-capita health spending, and gaps in rural healthcare access — all of which pull the average down.',
  },
  {
    q: 'Why do women live longer than men in India?',
    a: 'SRS 2020 shows Indian women live to 71.7 years on average versus 68.7 for men — a gap of three years. Globally, women tend to outlive men because of biological factors (oestrogen offers cardiovascular protection, two X chromosomes) and behavioural ones (men in India smoke, chew tobacco and drink at far higher rates, and are more exposed to occupational and road-accident risk).',
  },
  {
    q: 'How much longer do people in urban India live than in rural India?',
    a: 'There is a persistent urban-rural gap of about five years: life expectancy in urban India is roughly 73 years compared with about 68 years in rural India. Cities offer closer hospitals, specialists, better sanitation and higher incomes. Rural areas, home to two-thirds of Indians, lag on doctor availability, emergency care and safe drinking water — though the gap has been narrowing.',
  },
];

export function LifeExpectancyIndiaArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How Long Will I Live in India? Life Expectancy by State',
    description:
      'Life expectancy in India by state using SRS 2020 data. Kerala leads at 75.1 years; the national average is 70.2. See where your state ranks and how to beat the average.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/how-long-will-i-live-in-india/',
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
        title="How Long Will I Live in India? Life Expectancy Guide | BornClock"
        description="Life expectancy in India by state — SRS data. Kerala 75.1 leads; national average 70.2. See your state and how to beat the average."
        canonicalUrl="/articles/how-long-will-i-live-in-india"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="life-expectancy-india-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            How Long Will I Live in India? Life Expectancy by State
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            "How long will I live?" is one of the most human questions there is — and in
            India, the honest answer depends enormously on <em>where</em> you were born and
            how you live today. According to the Sample Registration System (SRS) 2020, the
            official demographic survey run by the Office of the Registrar General of India,
            the national life expectancy at birth is <strong>70.2 years</strong>. But that
            single number hides a range of more than ten years between states. A child born
            in Kerala can expect to live to <strong>75.1</strong>, while a child born in
            Uttar Pradesh averages just 65.0 — a difference of a full decade, inside the same
            country.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            This guide breaks down life expectancy in India state by state, explains the
            "Kerala model" behind the country's longest lives, unpacks the stubborn gap
            between urban and rural India, and — most importantly — shows how much of your
            own lifespan is still in your hands. State averages are a starting point, not a
            verdict. Your habits, health checks and lifestyle can move you well above or
            below the number for your postcode.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Life Expectancy in India by State (SRS 2020)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The table below shows life expectancy at birth (in years) for the highest- and
            lowest-ranking major states, from SRS 2020 data. The all-India averages are
            shown for comparison.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-black text-indigo-900">Rank</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-black text-indigo-900">State</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-black text-indigo-900">Life Expectancy (years)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50">
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 font-bold text-green-800">Highest life expectancy</td>
                </tr>
                {HIGHEST_STATES.map((row, i) => (
                  <tr key={row.state} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-gray-600">{i + 1}</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-gray-900">{row.state}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-bold text-green-700">{row.le}</td>
                  </tr>
                ))}
                <tr className="bg-indigo-100">
                  <td className="border border-gray-300 px-4 py-2 font-bold text-indigo-900" colSpan={2}>India — national average</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-black text-indigo-900">70.2</td>
                </tr>
                <tr className="bg-red-50">
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 font-bold text-red-800">Lowest life expectancy</td>
                </tr>
                {LOWEST_STATES.map((row) => (
                  <tr key={row.state} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-gray-600">—</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-gray-900">{row.state}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-bold text-red-700">{row.le}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-indigo-900">70.2</div>
              <div className="text-xs text-gray-600">National average</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-blue-900">68.7</div>
              <div className="text-xs text-gray-600">Men</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-pink-900">71.7</div>
              <div className="text-xs text-gray-600">Women</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-900">73 / 68</div>
              <div className="text-xs text-gray-600">Urban / Rural</div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Kerala Model: Why Some States Live Longer</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kerala's life expectancy of <strong>75.1 years</strong> puts it on par with many
            middle-income countries and roughly five years ahead of the Indian average. What
            makes Kerala different is not wealth — it is not India's richest state — but a
            combination of factors demographers now call the "Kerala model":
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Literacy, especially female literacy.</strong> Kerala achieved near-universal
              literacy decades before the rest of India. Educated mothers seek antenatal care,
              vaccinate their children, and manage household nutrition and hygiene far better —
              which is why female literacy is one of the strongest predictors of longevity anywhere.
            </li>
            <li>
              <strong>Healthcare access.</strong> Kerala built a dense network of primary health
              centres and hospitals long ago, so most people live close to a clinic. Immunisation
              rates are high and infant mortality — the single biggest drag on life expectancy — is
              among the lowest in the country.
            </li>
            <li>
              <strong>Diet and lifestyle.</strong> The traditional Kerala diet is rich in fish
              (heart-healthy omega-3s), vegetables, coconut and rice, with comparatively less
              reliance on the fried, sugar-heavy foods that drive diabetes and heart disease
              elsewhere.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The mirror image explains the bottom of the table. Uttar Pradesh, Chhattisgarh,
            Assam and Madhya Pradesh combine lower literacy, higher infant and maternal
            mortality, fewer doctors per person and weaker rural health infrastructure. Life
            expectancy is less about genetics than about the systems around you.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Urban–Rural Gap</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cutting across every state is a second divide: urban Indians live about
            <strong> 73 years</strong> on average, while rural Indians live about
            <strong> 68 years</strong> — a five-year gap. Roughly two-thirds of India still
            lives in rural areas, so this gap shapes the national number heavily.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Cities win on proximity: closer hospitals, more specialists, faster emergency
            response, better sanitation and higher household incomes that pay for medicine and
            nutrition. Rural India lags on doctor availability, ambulance access and safe
            drinking water. The encouraging news is that the gap has been narrowing as roads,
            mobile clinics and rural health missions expand — but it remains one of the clearest
            levers on how long an average Indian lives.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Beyond the State Average: Your Number Is Personal</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Here is the crucial point that a state average can never capture: your lifespan is
            not fixed by your postcode. Two people born the same day in the same district can
            differ by fifteen or twenty years depending on whether they smoke, how they eat,
            whether they exercise, their blood pressure, and whether they get regular check-ups.
            Researchers estimate that only a modest share of lifespan is genetic — the majority
            is lifestyle and environment, both of which you can influence.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            That is why a single state figure is a starting line, not a finish line. Not smoking,
            staying active, keeping a healthy weight, controlling blood pressure and blood sugar,
            and cutting tobacco and excess alcohol can each add years — and they compound. Someone
            in a "low" state with excellent habits can easily outlive someone in Kerala who smokes.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            BornClock takes you beyond the crude state average. Our{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
              longevity calculator
            </a>{' '}
            personalises your estimate using your own lifestyle inputs — your habits, activity
            level and health factors — instead of lumping you in with millions of strangers who
            happen to share your state. It shows both where you stand today and, more usefully,
            how many years the changes within your control could add.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">Find Out How Long <em>You</em> Might Live</h2>
            <p className="text-indigo-200 mb-6">
              Stop guessing from a state average. The BornClock longevity calculator turns your
              own lifestyle into a personalised life-expectancy estimate — and shows how many
              years your habits could add.
            </p>
            <a
              href="/longevity-calculator"
              className="inline-block bg-white text-indigo-700 font-black px-8 py-3 rounded-full text-lg hover:bg-indigo-50 transition-colors"
            >
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

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/life-expectancy-by-country-2026" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
                  Life Expectancy by Country 2026 — Global Rankings
                </a>
              </li>
              <li>
                <a href="/articles/how-to-live-to-100" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
                  How to Live to 100 — Habits of the World's Longest-Lived People
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default LifeExpectancyIndiaArticle;
