import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'How Is Life Expectancy Calculated? WHO Method | BornClock';
const DESC = "How life expectancy is calculated — WHO methodology, period vs cohort life tables, the 5 data sources, and why India's figure may be underestimated.";
const SLUG = 'life-expectancy-how-it-is-calculated';

const DATA_SOURCES = [
  {
    name: 'National census',
    detail:
      'A full population count — taken in India every ten years (most recently the 2011 Census) — establishes how many people are alive at each age. This is the denominator for every mortality rate: without knowing how many people are in an age band, a raw count of deaths tells you nothing.',
  },
  {
    name: 'Birth registrations',
    detail:
      'Civil registration of births fixes the size of each birth cohort and anchors infant and child mortality rates. In India the Civil Registration System (CRS) and the Sample Registration System (SRS) together supply these figures; birth registration completeness now exceeds 90% nationally but still varies by state.',
  },
  {
    name: 'Death registrations',
    detail:
      'The numerator of every mortality rate. Life tables are only as good as the count of deaths by age. India records deaths through the CRS and SRS, but registration completeness — especially recording the age and cause of death — remains incomplete in several states, which is the single biggest reason the national figure may be understated.',
  },
  {
    name: 'Health and demographic surveys',
    detail:
      'Large sample surveys such as the National Family Health Survey (NFHS) and the SRS fill gaps where administrative registration is thin. They estimate age-specific death rates for populations and regions that vital registration misses, and they are re-weighted against census totals.',
  },
  {
    name: 'Hospital and cause-of-death data',
    detail:
      'Hospital records and the Medical Certification of Cause of Death (MCCD) refine the picture — distinguishing, for example, deaths from cardiovascular disease versus injury. This lets statisticians model how mortality is shifting and project future improvements for cohort life tables.',
  },
];

const FAQS = [
  {
    q: 'How is life expectancy actually calculated?',
    a: 'Life expectancy is calculated from a life table. Statisticians take age-specific death rates — the probability of dying between one birthday and the next — for every age band, apply them to a hypothetical group of 100,000 newborns, and track how many survive year by year. Summing all the years lived by that group and dividing by 100,000 gives life expectancy at birth. The method follows WHO and UN standards so figures are comparable across countries.',
  },
  {
    q: 'What is the difference between a period life table and a cohort life table?',
    a: 'A period (or current) life table uses the death rates observed in a single year, as if a baby would live its whole life under this year’s mortality — this is the "70.2 years" headline figure you usually see. A cohort life table follows an actual birth cohort across its real lifetime and projects how death rates will keep falling, so it usually produces a higher, more realistic number for people alive today.',
  },
  {
    q: 'Why might India’s life expectancy of around 70 years be underestimated?',
    a: 'India’s figure rests on death-registration data that is still incomplete in several states — deaths, and especially the age at death, are under-recorded. When deaths are undercounted the mortality rate looks lower in some bands and distorted in others, and the period-table approach ignores future medical improvements. Analysts widely believe the true figure for a child born today, using a cohort approach, is higher than the headline period figure.',
  },
  {
    q: 'Does life expectancy tell me how long I personally will live?',
    a: 'No. Life expectancy is a population average built from a hypothetical cohort. Your own outlook depends on your current age, sex, lifestyle, medical history, income and where you live. That is why BornClock starts from the national baseline and then adjusts for individual factors, rather than quoting one number for everyone.',
  },
  {
    q: 'Who produces official life expectancy figures?',
    a: 'Globally, the World Health Organization (WHO) and the United Nations Population Division publish comparable estimates using standardised life-table methods. In India the Registrar General of India, through the Sample Registration System, produces the official abridged life tables that national and state figures are based on.',
  },
];

export function LifeExpectancyHowCalculatedArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How Life Expectancy Is Calculated — WHO Methodology and Life Tables',
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

      <main data-testid="le-how-calculated-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            How Life Expectancy Is Calculated — The WHO Method Explained
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            When a headline says "life expectancy in India is 70.2 years," it can sound like a
            simple fact — a stopwatch on the average life. In reality that number is the output of
            a careful statistical machine called a <strong>life table</strong>, built from millions
            of records and standardised so that every country's figure means the same thing. This
            guide explains exactly how life expectancy is calculated, why demographers distinguish
            period from cohort life tables, the five data sources that feed the model, and why
            India's official figure may actually underestimate how long a child born today will live.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Understanding the method matters because a population average is not a personal
            forecast. Once you know how the number is built, you can see why your own outlook can be
            very different — and why a tool that adjusts for your individual circumstances is more
            useful than one national figure.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Core Idea: A Life Table</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The World Health Organization and the United Nations use a single, well-established
            instrument to calculate life expectancy: the <strong>life table</strong>. The method is
            elegant. Statisticians measure the <em>age-specific death rate</em> for every age band —
            the probability of dying between one birthday and the next — then imagine a hypothetical
            group of 100,000 newborns and apply those probabilities year after year.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li>Start with 100,000 imaginary babies.</li>
            <li>Apply the death rate for age 0, then age 1, then age 2, and so on.</li>
            <li>Track how many survive at each age and how many years each group lives.</li>
            <li>Add up every year lived by the whole cohort.</li>
            <li>Divide the total years lived by 100,000 — that average is <strong>life expectancy at birth</strong>.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The same table also gives life expectancy at <em>any</em> age. This is why an Indian who
            has already reached 60 has a life expectancy well above 70 — they have already survived
            the ages where earlier deaths pulled the birth figure down. The number at birth is
            dragged lower by infant and child mortality that a 60-year-old has, by definition,
            already escaped.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h3 className="text-lg font-black text-indigo-900 mb-2">See your own adjusted estimate</h3>
            <p className="text-sm text-indigo-700 mb-4">
              The national life table is only a starting point. BornClock takes the baseline and
              adjusts for your age, sex and lifestyle to estimate your personal outlook.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Try the Longevity Calculator →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Period vs Cohort Life Tables</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            There are two ways to build the table, and the difference explains most of the confusion
            around the numbers.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2">Period (current) life table</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Uses the death rates observed in a single calendar year, as if a newborn would live
                its entire life under this year's mortality conditions. It is a snapshot. The widely
                quoted "India ≈ 70 years" is a period figure. It is easy to compare across countries
                but assumes medicine and living standards never improve.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2">Cohort (generational) life table</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Follows a real birth cohort across its actual lifetime and projects that death rates
                will keep falling as healthcare improves. Because it credits future progress, the
                cohort figure for a baby born today is usually <strong>higher</strong> than the
                period figure — often by several years.
              </p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Neither is "wrong" — they answer different questions. The period table asks, "How long
            would a life be under today's conditions?" The cohort table asks, "How long will
            someone born now actually live?" For personal planning, the cohort view is more honest,
            because you will benefit from decades of medical improvement the period table ignores.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">The 5 Data Sources Behind the Number</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A life table is only as reliable as the data feeding it. Five distinct sources are
            combined and cross-checked to produce a national figure:
          </p>
          <div className="space-y-4 mb-6">
            {DATA_SOURCES.map((s, i) => (
              <section key={s.name} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-1">
                  {i + 1}. {s.name}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{s.detail}</p>
              </section>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Why India's 70.2 May Be Underestimated</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            India's headline life expectancy of roughly 70.2 years rests on the quality of its death
            registration — and that is precisely where the weakness lies. Two structural issues push
            the figure down:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
            <li>
              <strong>Registration completeness.</strong> Deaths, and especially the exact age at
              death, are still under-recorded in several states. When death records are patchy, the
              modelled mortality rates can be distorted, and the period-table method locks in
              whatever mortality the incomplete data implies.
            </li>
            <li>
              <strong>The period assumption.</strong> The official figure is a period table, so it
              assumes no future improvement in healthcare, nutrition or income. Given how fast
              India's child mortality has fallen and how quickly access to medicine is expanding, a
              cohort view of a child born today points to a materially longer life than 70.2 years.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The practical takeaway: treat 70.2 as a conservative national baseline, not a ceiling.
            For most people — and especially anyone who has already survived childhood, does not
            smoke, and has access to healthcare — the realistic personal outlook is higher.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">How BornClock Adapts for Individual Variation</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A life table is a population instrument; you are an individual. BornClock's approach is
            to start from the national life-table baseline and then adjust for the factors that
            actually move an individual's odds:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Current age</strong> — you get credit for every year you have already survived.</li>
            <li><strong>Sex</strong> — female life expectancy in India runs a few years above male.</li>
            <li><strong>Lifestyle</strong> — smoking, activity, diet and body weight shift the estimate.</li>
            <li><strong>Context</strong> — access to healthcare and broad living standards.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The result is not a promise — no calculator can predict an individual life — but it is a
            far more useful, personalised estimate than a single national average. It turns an
            abstract statistic into a number you can plan around.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">Get Your Personal Life Expectancy Estimate</h2>
            <p className="text-indigo-200 mb-6">
              Move beyond the national average. Enter your details and see an estimate adjusted for
              your age, sex and lifestyle in seconds.
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
              <a href="/articles/life-expectancy-by-country-2026" className="hover:underline font-semibold">
                Life Expectancy by Country 2026
              </a>
            </li>
            <li>
              <a href="/articles/how-long-will-i-live-in-india" className="hover:underline font-semibold">
                How Long Will I Live in India?
              </a>
            </li>
          </ul>

        </article>
      </main>
    </>
  );
}

export default LifeExpectancyHowCalculatedArticle;
