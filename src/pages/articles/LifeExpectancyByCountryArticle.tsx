import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Real WHO 2023 life expectancy at birth (years), latest published figures.
// Used both for the interactive lookup and the ranking tables below.
interface CountryLE {
  name: string;
  le: number;
  note: string;
}

const COUNTRY_DATA: Record<string, CountryLE> = {
  japan: { name: 'Japan', le: 84.3, note: 'Highest in the world — a diet rich in fish and vegetables, universal healthcare, and very low obesity.' },
  switzerland: { name: 'Switzerland', le: 83.9, note: 'Second highest globally, driven by high income, excellent healthcare, and an active outdoor culture.' },
  'south korea': { name: 'South Korea', le: 83.3, note: 'Among the world leaders after decades of rapid gains in healthcare and living standards.' },
  singapore: { name: 'Singapore', le: 83.1, note: 'Asia’s longevity model, with world-class medicine and strong public-health systems.' },
  spain: { name: 'Spain', le: 83.1, note: 'The Mediterranean diet and universal healthcare make Spain one of Europe’s longest-living nations.' },
  cyprus: { name: 'Cyprus', le: 83.0, note: 'A Mediterranean lifestyle and steadily improving healthcare put Cyprus near the very top.' },
  australia: { name: 'Australia', le: 83.0, note: 'High income, strong healthcare, and low smoking rates sustain a very high life expectancy.' },
  italy: { name: 'Italy', le: 82.9, note: 'Home to famous “Blue Zones” like Sardinia, with a Mediterranean diet and close family ties.' },
  iceland: { name: 'Iceland', le: 82.9, note: 'Clean environment, universal healthcare, and an active population keep Iceland near the top.' },
  israel: { name: 'Israel', le: 82.7, note: 'Rounding out the global top ten, with advanced medicine and a Mediterranean-style diet.' },
  india: { name: 'India', le: 70.2, note: 'A remarkable rise from just 52 years in 1970 — now above the global average and still climbing.' },
  'united kingdom': { name: 'United Kingdom', le: 81.1, note: 'A high-income nation with universal healthcare through the NHS.' },
  uk: { name: 'United Kingdom', le: 81.1, note: 'A high-income nation with universal healthcare through the NHS.' },
  usa: { name: 'United States', le: 79.1, note: 'Lower than most wealthy peers, held back by chronic disease, obesity, and healthcare access gaps.' },
  'united states': { name: 'United States', le: 79.1, note: 'Lower than most wealthy peers, held back by chronic disease, obesity, and healthcare access gaps.' },
  china: { name: 'China', le: 78.2, note: 'Decades of economic growth and healthcare expansion have pushed China above the world average.' },
  brazil: { name: 'Brazil', le: 75.9, note: 'The largest South American economy, with life expectancy above the global average.' },
  chad: { name: 'Chad', le: 54.3, note: 'The lowest in the world, reflecting poverty, limited healthcare, and high child mortality.' },
  nigeria: { name: 'Nigeria', le: 54.7, note: 'Among the lowest globally, constrained by healthcare access and infectious disease burden.' },
  'sierra leone': { name: 'Sierra Leone', le: 54.7, note: 'One of the lowest worldwide, following years of conflict and fragile health infrastructure.' },
  'central african republic': { name: 'Central African Republic', le: 55.0, note: 'Very low life expectancy amid instability, poverty, and weak health systems.' },
  lesotho: { name: 'Lesotho', le: 55.4, note: 'Among the lowest, heavily affected by HIV/AIDS and limited healthcare.' },
};

const TOP_TEN: CountryLE[] = [
  COUNTRY_DATA['japan'],
  COUNTRY_DATA['switzerland'],
  COUNTRY_DATA['south korea'],
  COUNTRY_DATA['singapore'],
  COUNTRY_DATA['spain'],
  COUNTRY_DATA['cyprus'],
  COUNTRY_DATA['australia'],
  COUNTRY_DATA['italy'],
  COUNTRY_DATA['iceland'],
  COUNTRY_DATA['israel'],
];

const BOTTOM_FIVE: CountryLE[] = [
  COUNTRY_DATA['lesotho'],
  COUNTRY_DATA['central african republic'],
  COUNTRY_DATA['sierra leone'],
  COUNTRY_DATA['nigeria'],
  COUNTRY_DATA['chad'],
];

const REFERENCE: CountryLE[] = [
  COUNTRY_DATA['uk'],
  COUNTRY_DATA['usa'],
  COUNTRY_DATA['china'],
  COUNTRY_DATA['brazil'],
  COUNTRY_DATA['india'],
];

const FAQS = [
  {
    q: 'What country has the highest life expectancy in 2026?',
    a: 'Japan has the highest life expectancy in the world at 84.3 years, according to the latest WHO data. Switzerland (83.9) and South Korea (83.3) follow closely. Japan’s lead is credited to a diet rich in fish and vegetables, universal healthcare, low obesity rates, and strong social cohesion among older adults.',
  },
  {
    q: 'Why does life expectancy vary so much between countries?',
    a: 'Life expectancy varies mainly because of differences in income, healthcare access, nutrition, and sanitation. Wealthy nations with universal healthcare, clean water, and low child mortality reach the low-to-mid 80s, while the lowest-ranked countries — Chad at 54.3 years, for example — face poverty, infectious disease, and fragile health systems. The gap between the top and bottom is roughly 30 years.',
  },
  {
    q: 'What is India’s life expectancy?',
    a: 'India’s life expectancy is 70.2 years in the latest WHO data — now above the global average. This reflects an extraordinary rise from just 52 years in 1970, driven by falling child mortality, better vaccination coverage, cleaner water, and expanding healthcare access. India’s trajectory is one of the steepest improvements of any large nation.',
  },
  {
    q: 'Is life expectancy rising globally?',
    a: 'Yes. Global life expectancy has risen dramatically over the past half-century, from the low 50s in 1970 to the low 70s today. Progress came from vaccines, antibiotics, clean water, and lower child mortality. The COVID-19 pandemic caused a temporary dip, but the long-term trend remains upward across almost every region.',
  },
  {
    q: 'How do I improve my own life expectancy regardless of my country?',
    a: 'Your daily choices matter more than your passport. Not smoking, staying physically active, eating a plant-forward diet, maintaining a healthy weight, sleeping well, keeping strong social ties, and getting regular medical check-ups can each add years. Research suggests lifestyle can shift individual life expectancy by a decade or more. You can estimate your own with the BornClock longevity calculator.',
  },
];

function CountryLookup() {
  const [query, setQuery] = React.useState('');
  const [result, setResult] = React.useState<CountryLE | null | undefined>(undefined);

  const handleLookup = (value: string) => {
    setQuery(value);
    const key = value.trim().toLowerCase();
    if (!key) {
      setResult(undefined);
      return;
    }
    setResult(COUNTRY_DATA[key] ?? null);
  };

  return (
    <div data-testid="country-le-lookup"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Look Up a Country&apos;s Life Expectancy
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Type a country name (try Japan, India, USA, UK, China, Brazil, or Chad) to see its
        2026 life expectancy and how it compares globally.
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => handleLookup(e.target.value)}
        placeholder="Enter a country name…"
        className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                   text-base focus:outline-none focus:border-indigo-500 bg-white mb-4"
        aria-label="Enter a country name to look up its life expectancy"
      />
      {result && (
        <div data-testid="country-le-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-20 h-14 bg-indigo-600 rounded-xl flex items-center
                            justify-center text-2xl font-black text-white flex-shrink-0">
              {result.le}
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{result.name}</div>
              <div className="text-indigo-600 font-semibold">
                {result.le} years (life expectancy at birth)
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{result.note}</p>
        </div>
      )}
      {result === null && query.trim() && (
        <div className="bg-white rounded-xl border-2 border-indigo-300 p-4 text-sm text-gray-600">
          No match for &ldquo;{query}&rdquo; in this table. Try Japan, Switzerland, India,
          United States, United Kingdom, China, Brazil, Nigeria, or Chad.
        </div>
      )}
    </div>
  );
}

export function LifeExpectancyByCountryArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Life Expectancy by Country 2026 — Global Rankings',
    description: 'Life expectancy by country in 2026 using WHO data for 190+ nations — global rankings, what drives the differences, and how to improve your own.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/life-expectancy-by-country-2026/',
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
        title="Life Expectancy by Country 2026 — Global Rankings | BornClock"
        description="Life expectancy by country in 2026 — WHO data for 190+ nations. See global rankings, what drives the differences, and how to improve your own."
        canonicalUrl="/articles/life-expectancy-by-country-2026"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="life-expectancy-country-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Life Expectancy by Country 2026 — Global Rankings
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Life expectancy is one of the clearest single measures of how well a nation cares
            for its people. It captures healthcare, nutrition, sanitation, income, and safety
            in a single number: the average years a newborn can expect to live if today&apos;s
            conditions hold. In 2026, drawing on the latest World Health Organization (WHO)
            data covering more than 190 nations, the gap between the longest- and
            shortest-living countries is roughly <strong>30 years</strong> — from Japan at
            84.3 years down to Chad at 54.3. This guide ranks the leaders and laggards,
            explains what drives the differences, and shows how to add years to your own life
            no matter where you were born.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The good news is that these numbers are not fixed. Global life expectancy has
            climbed from the low 50s in 1970 to the low 70s today, and countries like India
            have gained nearly two decades of life in a single generation. Curious what the
            numbers mean for you personally? Our{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">
              longevity calculator
            </a>{' '}
            estimates your own life expectancy from your lifestyle and habits.
          </p>

          <CountryLookup />

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The 10 Countries With the Highest Life Expectancy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The world&apos;s longevity leaders cluster in East Asia and Western Europe, plus a
            handful of high-income outliers. <strong>Japan</strong> holds the global top spot
            at <strong>84.3</strong> years, thanks to a diet rich in fish and vegetables,
            universal healthcare, and remarkably low obesity. Here are the top ten:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-bold text-gray-700">Rank</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-700">Country</th>
                  <th className="text-right px-3 py-2 font-bold text-gray-700">Life Expectancy</th>
                </tr>
              </thead>
              <tbody>
                {TOP_TEN.map((c, i) => (
                  <tr key={c.name} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-600">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold text-gray-900">{c.name}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{c.le} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The Countries With the Lowest Life Expectancy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At the other end of the scale, the lowest life expectancies are concentrated in
            Sub-Saharan Africa, where poverty, infectious disease, high child mortality, and
            fragile health systems combine. The five lowest-ranked nations are:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-bold text-gray-700">Country</th>
                  <th className="text-right px-3 py-2 font-bold text-gray-700">Life Expectancy</th>
                </tr>
              </thead>
              <tbody>
                {BOTTOM_FIVE.map((c) => (
                  <tr key={c.name} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-900">{c.name}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{c.le} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Where Do the Big Economies Sit?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Between the extremes sit the world&apos;s most populous and powerful nations. Note
            how income alone does not guarantee the top spot — the United States, despite being
            among the wealthiest countries, trails most of its high-income peers because of
            chronic disease, obesity, and uneven healthcare access.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-bold text-gray-700">Country</th>
                  <th className="text-right px-3 py-2 font-bold text-gray-700">Life Expectancy</th>
                </tr>
              </thead>
              <tbody>
                {REFERENCE.map((c) => (
                  <tr key={c.name} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-900">{c.name}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{c.le} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Regional Patterns</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Life expectancy is not scattered randomly across the map — it follows clear
            regional patterns rooted in development and public health.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
            <li>
              <strong>East Asia and Western Europe lead.</strong> Japan, South Korea and
              Singapore in Asia, and Switzerland, Spain, Italy and Iceland in Europe, all
              exceed 82 years. They share universal healthcare, high incomes, low smoking
              rates, and diets built around fish, vegetables and olive oil.
            </li>
            <li>
              <strong>The Mediterranean effect.</strong> Spain (83.1), Italy (82.9) and Cyprus
              (83.0) show how the Mediterranean diet and close-knit communities translate into
              measurable extra years — Italy&apos;s Sardinia is one of the world&apos;s famous
              &ldquo;Blue Zones.&rdquo;
            </li>
            <li>
              <strong>Sub-Saharan Africa lags.</strong> The lowest figures — Chad (54.3),
              Nigeria (54.7), Sierra Leone (54.7), the Central African Republic (55.0) and
              Lesotho (55.4) — reflect poverty, infectious disease, weak health infrastructure,
              and in some cases conflict.
            </li>
            <li>
              <strong>The middle is rising fast.</strong> Large emerging economies like China
              (78.2), Brazil (75.9) and India (70.2) have all pushed above the global average
              as incomes and healthcare have improved.
            </li>
          </ul>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            What Drives the Differences?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The 30-year gap between Japan and Chad is not about genetics. Four factors explain
            most of the variation between countries:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-1">Healthcare access</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Universal coverage, vaccination, maternal care and treatment for chronic
                disease keep people alive through illnesses that would once have been fatal.
                The longest-living nations nearly all have strong public health systems.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-1">Income and poverty</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Higher national income buys better hospitals, cleaner infrastructure, and more
                nutritious food. Poverty is the single strongest predictor of a low national
                life expectancy.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-1">Diet and nutrition</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                The Japanese and Mediterranean diets — high in fish, vegetables, whole grains
                and healthy fats, low in processed food — are strongly linked to longer,
                healthier lives and lower rates of heart disease.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-1">Sanitation and clean water</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Safe water and sewage systems prevent the infectious diseases that drive child
                mortality. Much of the world&apos;s longevity progress since 1970 came from
                this basic public-health infrastructure.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            India&apos;s Remarkable Trajectory
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            No large nation better illustrates how fast life expectancy can change than India.
            In <strong>1970</strong>, an Indian newborn could expect to live just{' '}
            <strong>52 years</strong>. Today that figure is <strong>70.2 years</strong> — a
            gain of more than 18 years in a single generation, lifting India above the global
            average. The drivers are textbook public health: sharply falling child mortality,
            wider vaccination coverage, cleaner water and sanitation, better maternal care, and
            expanding access to doctors and hospitals. India still trails the East Asian leaders
            by more than a decade, which shows how much room there is for continued gains as
            healthcare and incomes keep rising. If you want to see how these national numbers
            translate to an individual in India, our{' '}
            <a href="/longevity-calculator" className="text-indigo-600 font-semibold underline">
              longevity calculator
            </a>{' '}
            factors in your own lifestyle rather than a national average.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            How to Improve Your Personal Life Expectancy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Your country sets the starting line, but your own choices decide how far you run.
            Research on lifestyle and longevity consistently finds that daily habits can shift
            an individual&apos;s life expectancy by a decade or more — often outweighing the
            gap between two countries. The highest-impact levers are the same everywhere:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Don&apos;t smoke.</strong> Smoking is the single largest avoidable cause of early death; quitting adds years at any age.</li>
            <li><strong>Move daily.</strong> Even 30 minutes of brisk activity most days lowers heart disease, diabetes and dementia risk.</li>
            <li><strong>Eat plant-forward.</strong> Borrow from the Japanese and Mediterranean diets: more vegetables, fish, whole grains and legumes, less processed and red meat.</li>
            <li><strong>Keep a healthy weight.</strong> Obesity drives the chronic diseases that pull down life expectancy in wealthy nations like the United States.</li>
            <li><strong>Sleep and manage stress.</strong> Consistent, sufficient sleep and lower chronic stress protect the heart and brain.</li>
            <li><strong>Stay socially connected.</strong> Strong relationships are one of the best-documented predictors of a long life — a hallmark of Blue Zone communities.</li>
            <li><strong>Get regular check-ups.</strong> Early detection of blood pressure, cholesterol and cancer turns fatal conditions into manageable ones.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The takeaway: national rankings describe averages, not destinies. Wherever you
            live, the levers above are within your control.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">How Long Will You Live?</h2>
            <p className="text-indigo-200 mb-6">
              National averages only tell part of the story. See a personalised estimate based
              on your own lifestyle, habits and health with the free BornClock longevity
              calculator.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
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

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/how-long-will-i-live-in-india"
                   className="text-indigo-600 font-semibold underline">
                  How Long Will I Live in India? →
                </a>
              </li>
              <li>
                <a href="/articles/how-to-live-to-100"
                   className="text-indigo-600 font-semibold underline">
                  How to Live to 100 →
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default LifeExpectancyByCountryArticle;
