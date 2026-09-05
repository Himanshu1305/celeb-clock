import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import {
  HLWIL_SEO, HLWIL_SCHEMA, HLWIL_COUNTRY_TABLE,
  HLWIL_FACTORS, HLWIL_COPY,
} from '@/content/howLongWillILiveContent';

// Same JsonLd pattern as the Day 3/4 pages — body scripts prerender reliably.
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Additional structured-data schemas (SEO batch) ───────────
// FAQPage (exactly 5), SoftwareApplication, and WebPage+speakable.
const HLWIL_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long will I live?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The global average life expectancy is approximately 73 years (WHO, 2023), but this varies dramatically based on country, gender, and individual lifestyle. A non-smoking, regularly exercising person with strong social connections and good sleep may have a statistical life expectancy above 85. Someone with multiple lifestyle risk factors may be well below the national average. BornClock\'s 8-factor quiz gives you a personalised estimate using WHO baseline data adjusted for your specific lifestyle choices.',
      },
    },
    {
      '@type': 'Question',
      name: 'What determines how long you live?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Research from the Karolinska Institute (2018) confirmed that genetics accounts for only 25-30% of longevity. The remaining 70-75% is determined by lifestyle. The most impactful factors are: smoking (up to 10 years difference), physical exercise (31% reduction in all-cause mortality with 150+ min/week, WHO 2022), BMI (each 5-unit increase above 25 reduces life expectancy by 0.9 years, Lancet 2016), sleep (under 6 hours linked to 12% higher mortality), and social connections (isolation has mortality impact comparable to smoking 15 cigarettes per day).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I increase how long I live?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Because 70-75% of longevity is determined by lifestyle rather than genetics, meaningful change is possible at any age. Research shows that quitting smoking before 40 reduces smoking-related death risk by 90%. Adding 15 minutes of daily moderate exercise adds approximately 3 years of life expectancy. Improving sleep from 5 to 7 hours consistently can add up to 2 years. BornClock\'s personalised 90-day action plan identifies your highest-impact opportunities and provides specific steps to improve your forecast.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which country has the highest life expectancy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to WHO 2023 data, Japan has the highest life expectancy at approximately 84.3 years, followed by Switzerland (83.4), South Korea (83.3), Singapore (83.2), and Australia (83.2). India\'s average is approximately 70.2 years. The United States averages 76.4 years, lower than many high-income countries due to lifestyle factors including obesity rates, limited healthcare access for some populations, and higher rates of accidents. BornClock uses country-specific WHO baselines so your estimate is calibrated for your actual national context.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is a life expectancy calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Life expectancy calculators provide statistical estimates based on population research — they cannot predict individual outcomes. BornClock uses WHO Global Health Observatory baselines specific to your country and gender, then applies adjustments from 8 peer-reviewed factors. Research shows these 8 factors account for 70-75% of longevity variance, making them the most reliable basis for personalised estimation without a clinical examination. Accuracy depends on answering honestly and completely.',
      },
    },
  ],
} as const;

const HLWIL_SOFTWARE_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: `${HLWIL_SEO.title} — BornClock`,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
} as const;

const HLWIL_WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  speakable: {
    '@type': 'SpeakableSpecification',
    xpath: ['/html/body//h1', "/html/body//div[@data-testid='result-summary']"],
  },
} as const;

// Direction badge styles
const DIRECTION_CONFIG = {
  negative: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    label: 'Risk factor',
  },
  positive: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700',
    label: 'Protective factor',
  },
  mixed: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Mixed impact',
  },
} as const;

export function HowLongWillILivePage() {
  return (
    <>
      {/* SEO via the project's react-helmet-async component. canonicalUrl is the
          RELATIVE path (the component adds domain + trailing slash). */}
      <SEO
        title={HLWIL_SEO.title}
        description={HLWIL_SEO.description}
        canonicalUrl="/how-long-will-i-live"
        ogType="website"
        ogImage="https://bornclock.com/og/calculator.png"
      />

      {/* Schema tags in body — dangerouslySetInnerHTML pattern */}
      <JsonLd data={HLWIL_SCHEMA.softwareApp} />
      <JsonLd data={HLWIL_SCHEMA.faq} />
      <JsonLd data={HLWIL_SCHEMA.breadcrumb} />

      {/* Additional structured data: FAQPage (5), SoftwareApplication, speakable WebPage */}
      <JsonLd data={HLWIL_FAQ_SCHEMA} />
      <JsonLd data={HLWIL_SOFTWARE_APP_SCHEMA} />
      <JsonLd data={HLWIL_WEBPAGE_SCHEMA} />

      <main
        data-testid="hlwil-page"
        className="min-h-screen bg-white"
      >
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-4 pt-4">
          <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap list-none p-0">
            <li data-testid="breadcrumb-item">
              <Link to="/" className="hover:text-indigo-600">Home</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li data-testid="breadcrumb-item">
              <Link to="/longevity-calculator" className="hover:text-indigo-600">
                Longevity Calculator
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li
              data-testid="breadcrumb-item"
              className="text-gray-700 font-medium"
              aria-current="page"
            >
              How Long Will I Live?
            </li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <section
          aria-labelledby="page-h1"
          className="bg-gradient-to-br from-indigo-50 to-indigo-50
                     border-b border-indigo-100 py-12 px-4 mt-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100
                            text-indigo-700 rounded-full px-4 py-1.5
                            text-sm font-semibold mb-4">
              {HLWIL_COPY.hero.badge}
            </div>

            <h1
              id="page-h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black
                         gradient-text-primary leading-tight mb-4"
            >
              {HLWIL_COPY.hero.h1}
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
              {HLWIL_COPY.hero.subtitle}
            </p>

            <ul
              aria-label="Calculator features"
              className="flex flex-wrap justify-center gap-4 text-sm
                         text-gray-500 mb-8 list-none p-0"
            >
              {HLWIL_COPY.hero.trust.map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-green-500" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Above-fold CTA */}
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-primary hover:bg-primary/90
                         text-white font-black py-4 px-10 rounded-xl
                         transition-colors text-lg shadow-md
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         focus:ring-offset-2"
              aria-label="Start the free life expectancy quiz"
            >
              {HLWIL_COPY.hero.ctaButton}
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Free · Takes 3 minutes · No account required
            </p>
          </div>
        </section>

        {/* ── 4 STAT CARDS ── */}
        <section
          className="max-w-4xl mx-auto px-4 py-10"
          aria-labelledby="direct-answer-heading"
        >
          <h2
            id="direct-answer-heading"
            className="text-2xl font-black text-gray-900 mb-2 text-center"
          >
            {HLWIL_COPY.directAnswer.heading}
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            WHO Global Health Observatory, 2023
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {HLWIL_COPY.directAnswer.stats.map(stat => (
              <div
                key={stat.label}
                data-testid="stat-card"
                className="bg-white border border-gray-200 rounded-xl p-4 text-center"
              >
                <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.note}</div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-indigo-800 text-sm leading-relaxed">
              💡 {HLWIL_COPY.directAnswer.insight}
              {' '}
              <span className="text-xs text-indigo-600 italic">
                — {HLWIL_COPY.directAnswer.karolinskaSource}
              </span>
            </p>
          </div>
        </section>

        {/* ── ARTICLE CONTENT ── */}
        <article
          data-testid="article-content"
          className="max-w-4xl mx-auto px-4 pb-16"
          aria-label="How long will I live guide"
        >

          {/* Why averages mislead */}
          <section className="mb-12" aria-labelledby="averages-heading">
            <h2
              id="averages-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.whyAveragesMislead.heading}
            </h2>
            {HLWIL_COPY.whyAveragesMislead.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}
          </section>

          {/* Mid-article CTA 1 */}
          <div
            className="my-10 bg-indigo-50 border border-indigo-200
                        rounded-2xl p-6 text-center"
            role="complementary"
          >
            <p className="text-lg font-bold text-gray-900 mb-2">
              Get your personalised estimate — not just the national average
            </p>
            <p className="text-gray-600 text-sm mb-4">
              8 questions. WHO, Harvard, and NIH research. 3 minutes.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-primary hover:bg-primary/90
                         text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Find Out How Long I'll Live →
            </Link>
          </div>

          {/* 8 Factors */}
          <section className="mb-12" aria-labelledby="factors-heading">
            <h2
              id="factors-heading"
              className="text-2xl font-black text-gray-900 mb-2
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.eightFactors.heading}
            </h2>
            <p className="text-gray-600 mb-6">{HLWIL_COPY.eightFactors.intro}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HLWIL_FACTORS.map(factor => {
                const config = DIRECTION_CONFIG[factor.direction];
                return (
                  <div
                    key={factor.id}
                    data-testid={`factor-${factor.id}`}
                    className={`rounded-xl border overflow-hidden ${config.border} ${config.bg}`}
                  >
                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 px-4 py-3
                                    flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center justify-center
                                   w-6 h-6 bg-indigo-600 text-white rounded-full
                                   text-xs font-black flex-shrink-0"
                      >
                        {factor.id}
                      </span>
                      <span className="font-bold text-gray-900 text-sm flex-1">
                        {factor.icon} {factor.name}
                      </span>
                      <span
                        data-testid="factor-direction"
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                    flex-shrink-0 ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {factor.impact}
                      </p>
                      <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                        {factor.detail}
                      </p>
                      <p className="text-xs text-indigo-700 italic">
                        📚 {factor.source}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Country Table */}
          <section
            data-testid="country-table-section"
            className="mb-12"
            aria-labelledby="country-table-heading"
          >
            <h2
              id="country-table-heading"
              className="text-2xl font-black text-gray-900 mb-2
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.countryTable.heading}
            </h2>
            <p className="text-gray-600 mb-4">{HLWIL_COPY.countryTable.intro}</p>

            {/* Scroll wrapper prevents mobile overflow */}
            <div
              data-testid="country-table-wrapper"
              className="overflow-x-auto rounded-xl border border-gray-200 max-w-full"
            >
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">Rank</th>
                    <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">Country</th>
                    <th scope="col" className="text-right px-4 py-3 font-bold text-gray-700">Overall</th>
                    <th scope="col" className="text-right px-4 py-3 font-bold text-gray-700">Male</th>
                    <th scope="col" className="text-right px-4 py-3 font-bold text-gray-700">Female</th>
                  </tr>
                </thead>
                <tbody>
                  {HLWIL_COUNTRY_TABLE.map((row, i) => (
                    <tr
                      key={row.country}
                      data-testid="country-row"
                      data-country={row.country}
                      className={`border-b border-gray-100 last:border-0 ${
                        row.country === 'India'
                          ? 'bg-indigo-50 font-semibold'
                          : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500 text-sm">{row.rank}</td>
                      <td className="px-4 py-3 text-gray-900">{row.country}</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-700">{row.expectancy}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.male}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.female}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-2 italic">
              {HLWIL_COPY.countryTable.source}
            </p>
            <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <p className="text-xs text-indigo-800 leading-relaxed">
                🇮🇳 {HLWIL_COPY.countryTable.indiaNote}
              </p>
            </div>
          </section>

          {/* US vs Europe Gap */}
          <section
            data-testid="gap-analysis"
            className="mb-12"
            aria-labelledby="gap-heading"
          >
            <h2
              id="gap-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.gapAnalysis.heading}
            </h2>
            {HLWIL_COPY.gapAnalysis.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}
          </section>

          {/* How to Live Longer */}
          <section className="mb-12" aria-labelledby="improve-heading">
            <h2
              id="improve-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.howToImprove.heading}
            </h2>
            {HLWIL_COPY.howToImprove.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}

            <div
              data-testid="improvement-steps"
              className="space-y-3 mt-6"
            >
              {HLWIL_COPY.howToImprove.steps.map(step => (
                <div
                  key={step.step}
                  data-testid={`step-${step.step}`}
                  className="flex gap-4 items-start bg-indigo-50
                             border border-indigo-200 rounded-xl p-4"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white
                               rounded-full flex items-center justify-center
                               font-black text-sm"
                    aria-label={`Step ${step.step}`}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.action}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mid-article CTA 2 */}
          <div
            className="my-10 bg-indigo-50 border border-indigo-200
                        rounded-2xl p-6 text-center"
            role="complementary"
          >
            <p className="text-lg font-bold text-gray-900 mb-2">
              Ready to find out your personalised life expectancy?
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Not the national average. Yours — based on your 8 lifestyle factors.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-primary hover:bg-primary/90
                         text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Take the 3-Minute Quiz →
            </Link>
          </div>

          {/* Honest Limits */}
          <section
            data-testid="honest-limits"
            className="mb-12"
            aria-labelledby="limits-heading"
          >
            <h2
              id="limits-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.honestLimits.heading}
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              {HLWIL_COPY.honestLimits.paras.map((para, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </section>

          {/* Science citations */}
          <section className="mb-12" aria-labelledby="science-heading">
            <h2
              id="science-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {HLWIL_COPY.science.heading}
            </h2>
            <div className="space-y-3">
              {HLWIL_COPY.science.citations.map(c => (
                <div key={c.source} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="font-bold text-blue-900 text-sm mb-1">{c.source}</div>
                  <div className="text-blue-800 text-sm">{c.text}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools */}
          <section
            className="mb-12 bg-gray-50 rounded-2xl border border-gray-200 p-6"
            aria-labelledby="related-heading"
          >
            <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-4">
              Related BornClock Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HLWIL_COPY.relatedTools.map(tool => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  data-testid="related-tool"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl
                             border border-gray-200 hover:border-indigo-300
                             hover:bg-indigo-50 transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-sm text-gray-900
                                    group-hover:text-indigo-700 mb-0.5">
                      {tool.title}
                    </div>
                    <div className="text-xs text-gray-500">{tool.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section
            data-testid="faq-section"
            className="mb-12"
            aria-labelledby="faq-heading"
          >
            <h2
              id="faq-heading"
              className="text-2xl font-black text-gray-900 mb-6
                         pb-3 border-b border-gray-200"
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {HLWIL_SCHEMA.faq.mainEntity.map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h3
                    data-testid="faq-question"
                    className="font-bold text-gray-900 mb-3"
                  >
                    {faq.name}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <div
            className="bg-gradient-to-br from-primary to-primary
                        rounded-2xl p-8 text-center text-white"
            role="complementary"
          >
            <h2 className="text-2xl font-black mb-2">
              How Long Will You Live? Find Out Free.
            </h2>
            <p className="text-indigo-200 mb-6 max-w-md mx-auto">
              3 minutes. 8 science-backed factors. Personalised result and 90-day plan.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-white text-primary hover:bg-indigo-50
                         font-black py-4 px-8 rounded-xl transition-colors text-lg"
            >
              {HLWIL_COPY.hero.ctaButton}
            </Link>
            <p className="text-indigo-300 text-xs mt-3">
              Free · No account required · Results in 3 minutes
            </p>
          </div>

        </article>
      </main>
    </>
  );
}

export default HowLongWillILivePage;
