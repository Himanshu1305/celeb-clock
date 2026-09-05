import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Retirement Planning & Life Expectancy in India | BornClock';
const DESC = 'Retirement planning meets life expectancy — how long your corpus must last in India, longevity risk, EPF/NPS/PPF, and the FIRE movement. Plan for your real lifespan.';
const SLUG = '/articles/retirement-planning-life-expectancy';

const FAQS = [
  {
    q: 'How many years of retirement should I plan for in India?',
    a: "Do not plan only for the average. India's average life expectancy is about 70.2 years, so retiring at 60 looks like roughly 10 years. But averages hide the tail: nearly 30% of people who reach 60 live 10 or more years beyond the average, and a healthy, urban, non-smoking lifestyle can push your lifespan to 75-85+. A safe rule of thumb is to fund for (life expectancy + 10) years — so build a corpus that lasts 25-30 years from age 60, not 10.",
  },
  {
    q: 'What is longevity risk in retirement planning?',
    a: 'Longevity risk is the danger of outliving your money — of living longer than your retirement corpus was designed to support. It is the single most under-estimated risk in retirement, because people anchor on the average life expectancy and forget that living to 85 or 90 is increasingly common. If you fund only 10 years but live 22, the last decade is spent in financial stress. Planning for the tail of your lifespan, not the average, is how you manage longevity risk.',
  },
  {
    q: 'Which is better for retirement in India — EPF, NPS, or PPF?',
    a: 'They serve different roles. EPF (Employees’ Provident Fund) is a mandatory, low-volatility, debt-heavy corpus for salaried employees with an employer match. PPF (Public Provident Fund) is a safe, tax-free, 15-year government-backed scheme open to everyone, good for guaranteed accumulation. NPS (National Pension System) adds market-linked equity exposure with low costs and extra tax deduction under 80CCD(1B), giving the growth needed to beat inflation over a long lifespan. Most Indians benefit from combining all three: EPF/PPF for stability and NPS for long-term growth.',
  },
  {
    q: 'How much retirement corpus do I need in India?',
    a: 'For a middle-class household, a common goal is a corpus of roughly ₹3-5 crore, depending on city, lifestyle, and how long you expect to live. The figure is large because inflation of around 6% a year roughly doubles your living costs every 12 years, so a corpus that feels comfortable at 60 can feel thin at 80. Size the corpus against your real, longevity-adjusted lifespan rather than the national average.',
  },
  {
    q: 'What is the FIRE movement and does it work in India?',
    a: 'FIRE stands for Financial Independence, Retire Early — a movement built around aggressive saving (often 40-60% of income), disciplined investing, and living off a corpus decades earlier than 60. In India it is gaining traction among high earners in tech and finance, but it magnifies longevity risk: retiring at 45 instead of 60 can mean funding 40+ years instead of 22. FIRE works in India only with a very large, inflation-beating, equity-tilted corpus and a conservative withdrawal rate.',
  },
];

const AVG_LE = 70.2;

function CorpusYearsCalculator() {
  const [retireAge, setRetireAge] = React.useState('60');
  const [lifeExpectancy, setLifeExpectancy] = React.useState('82');

  const r = Number(retireAge);
  const le = Number(lifeExpectancy);
  const valid = r > 0 && le > 0 && le > r;
  const yearsFunded = valid ? le - r : null;
  const bufferedYears = valid ? le + 10 - r : null;

  return (
    <div data-testid="corpus-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Years-Funded Calculator: How Long Must Your Corpus Last?
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Your years funded = life expectancy − retirement age. Enter both to see how many
        years your retirement corpus must cover.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-xs font-semibold text-indigo-800">Retirement age</span>
          <input
            type="number"
            min={30}
            max={90}
            value={retireAge}
            onChange={e => setRetireAge(e.target.value)}
            className="mt-1 w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                       text-base focus:outline-none focus:border-indigo-500 bg-white"
            aria-label="Retirement age"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-indigo-800">Life expectancy</span>
          <input
            type="number"
            min={40}
            max={110}
            value={lifeExpectancy}
            onChange={e => setLifeExpectancy(e.target.value)}
            className="mt-1 w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                       text-base focus:outline-none focus:border-indigo-500 bg-white"
            aria-label="Life expectancy"
          />
        </label>
      </div>
      {yearsFunded !== null && bufferedYears !== null && (
        <div data-testid="corpus-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="text-xl font-black text-gray-900 mb-1">
            Your corpus must fund <span className="text-indigo-600">{yearsFunded} years</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            If you retire at {r} and live to {le}, you fund {yearsFunded} years of retirement.
            Because roughly 30% of people outlive the average by a decade, we recommend sizing
            your corpus for <strong>{bufferedYears} years</strong> using the (life expectancy + 10)
            rule of thumb.
          </p>
          <a href="/longevity-calculator"
             className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            Estimate my real life expectancy →
          </a>
        </div>
      )}
    </div>
  );
}

export function RetirementLifeExpectancyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Retirement Planning and Life Expectancy in India',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/retirement-planning-life-expectancy/',
  };
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Years-Funded Retirement Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
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
      <SEO title={TITLE} description={DESC} canonicalUrl={SLUG} ogType="article" />
      <JsonLd data={articleSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="retirement-life-expectancy-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Retirement Planning &amp; Life Expectancy in India: How Long Must Your Money Last?
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Most retirement plans in India answer the wrong question. They ask "how much can I
            save?" when the question that actually determines whether you run out of money is
            "how long will I live?" Retirement planning and life expectancy are two halves of the
            same equation, and the number that connects them is deceptively simple:
            <strong> your years funded = life expectancy − retirement age</strong>. Get that
            number wrong and even a large corpus can be exhausted while you are still very much alive.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            In India the standard retirement age is around 60, and the national average life
            expectancy is about {AVG_LE} years. On paper that suggests you only need to fund
            around 10 years of retirement. That is a dangerous illusion. A healthy, urban,
            non-smoking Indian with access to good healthcare can easily live to 75, 85, or
            beyond — turning a 10-year plan into a 15-to-25-year reality. This is the gap
            that quietly bankrupts retirees.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Longevity Risk: The Danger of Outliving Your Money</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The technical name for this gap is <strong>longevity risk</strong> — the risk of
            outliving your savings. It is the most under-estimated risk in retirement because
            people anchor on the <em>average</em> and forget the tail of the distribution.
            Averages are misleading: roughly <strong>30% of people who reach retirement age go on
            to live 10 or more years beyond the average life expectancy</strong>. Planning only
            for the average means giving yourself a coin-flip chance of a decade in financial distress.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The practical fix is a buffer. A widely used rule of thumb is to fund your corpus for
            <strong> (life expectancy + 10) years</strong>. If your realistic life expectancy is 82
            and you retire at 60, do not plan for 22 years — plan for 32. That buffer absorbs
            the possibility that you are one of the many who live well past the average.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">An Illustrative Calculation</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The arithmetic is easy once you use your <em>real</em> life expectancy rather than the
            national average. Here is the core example:
          </p>
          <div className="bg-gray-50 border-l-4 border-indigo-400 rounded-r-xl p-5 mb-3">
            <p className="text-gray-800 leading-relaxed font-semibold">
              If you live to 82 and retire at 60, you fund 22 years.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              82 − 60 = 22 years of retirement your corpus must cover. Apply the
              (life expectancy + 10) buffer and you should really size your corpus for 32 years of
              spending — not the 10 years the national average of {AVG_LE} would suggest.
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-2">
            Now factor in inflation. At roughly <strong>6% a year</strong>, prices double about
            every 12 years, so ₹50,000 of monthly expenses today becomes ₹1 lakh in 12
            years and ₹2 lakh in 24. A corpus that feels generous at 60 can feel dangerously
            thin at 80 if it is not invested to grow through retirement. This is why inflation, not
            just longevity, forces the corpus higher.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Use the calculator below to plug in your own retirement age and life expectancy and see
            exactly how many years your corpus has to last.
          </p>

          <CorpusYearsCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-3">How Big Should the Corpus Be?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            For a typical middle-class household, a common retirement corpus goal is roughly
            <strong> ₹3–5 crore</strong>, varying with your city, lifestyle, and expected
            lifespan. That figure looks intimidating, but it is driven directly by the two forces
            above: a longer funded period (longevity) and a rising cost of living (inflation).
            Shorten either assumption and you understate the corpus; use your longevity-adjusted
            lifespan and the number becomes realistic rather than pessimistic.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">India's Core Instruments: EPF, NPS, and PPF</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            India gives you three workhorse instruments to build the corpus. Each has a distinct
            job, and a longevity-aware plan usually uses all three together:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
            <li>
              <strong>EPF (Employees' Provident Fund):</strong> a mandatory, employer-matched,
              debt-heavy corpus for salaried workers. Low volatility and steady, but its
              conservative returns may lag inflation over a 25-year retirement, so it is a
              foundation rather than the whole answer.
            </li>
            <li>
              <strong>PPF (Public Provident Fund):</strong> a government-backed, tax-free, 15-year
              scheme open to everyone including the self-employed. Excellent for guaranteed,
              safe accumulation, but again returns are moderate — best used for the stable
              core of your corpus.
            </li>
            <li>
              <strong>NPS (National Pension System):</strong> a low-cost, market-linked scheme
              with equity exposure and an extra ₹50,000 tax deduction under 80CCD(1B). Its
              growth potential is what lets a corpus beat 6% inflation across a long lifespan, so
              it is the engine most suited to funding the tail of your retirement.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            Suitability is about matching each instrument to the risk: EPF and PPF for stability
            and capital protection, NPS for the long-horizon growth that longevity demands. The
            longer your expected lifespan, the more you need the equity-tilted growth that NPS provides.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The FIRE Movement in India</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The <strong>FIRE movement</strong> — Financial Independence, Retire Early — has
            taken hold among high earners in Indian tech and finance. FIRE relies on saving 40–60%
            of income, investing aggressively, and retiring years or decades before 60. But FIRE
            magnifies longevity risk rather than removing it: retiring at 45 instead of 60 can mean
            funding 40+ years instead of 22. Anyone pursuing FIRE in India therefore needs a much
            larger, equity-heavy, inflation-beating corpus and a conservative withdrawal rate —
            because the earlier you stop earning, the longer your money has to survive.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">Plan for Your Real Lifespan, Not the Average</h2>
            <p className="text-indigo-200 mb-6">
              The most important input to your retirement corpus is how long you will actually live.
              Estimate your personal, lifestyle-adjusted life expectancy — then size your money to match.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Estimate My Life Expectancy Free →
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

          <div className="border-t border-gray-200 pt-6 mb-4">
            <p className="text-gray-700 leading-relaxed mb-3">
              Ready to turn your lifespan into a number you can plan around? Start with our
              <a href="/longevity-calculator" className="text-indigo-600 font-semibold hover:underline"> life expectancy calculator</a> and
              feed the result straight back into the years-funded rule above.
            </p>
            <h2 className="text-xl font-black text-gray-900 mb-3">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/how-long-will-i-live-in-india"
                   className="text-indigo-600 font-semibold hover:underline">
                  How Long Will I Live in India? — Life Expectancy Explained
                </a>
              </li>
              <li>
                <a href="/articles/how-to-live-to-100"
                   className="text-indigo-600 font-semibold hover:underline">
                  How to Live to 100 — Habits That Extend Your Lifespan
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default RetirementLifeExpectancyArticle;
