import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import {
  BA_SEO, BA_SCHEMA, BA_EPIGENETIC_HABITS,
  BA_COPY, BA_REALISTIC_POTENTIAL,
} from '@/content/biologicalAgeContent';

// Same JsonLd pattern as LongevityCalculatorPage.tsx — body scripts prerender reliably.
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
const BA_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is biological age?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Biological age is a measure of how well your body is functioning relative to your chronological age. It is determined by epigenetic markers — specifically DNA methylation patterns — that reflect the cumulative impact of your lifestyle, environment, and genetics on cellular ageing. A 45-year-old who exercises regularly and sleeps well may have a biological age of 38. A sedentary 45-year-old with poor sleep and high stress may have a biological age of 54. Unlike chronological age, biological age is substantially within your control.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is biological age calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The gold standard is the Horvath Clock — developed by Dr Steve Horvath at NIH (2013), based on DNA methylation patterns at 353 specific genomic sites. This requires a blood or saliva test. BornClock estimates biological age using a validated lifestyle-factor model: your chronological age adjusted by epigenetic habit scores and lifestyle factor impacts from peer-reviewed research.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I lower my biological age?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A 2021 clinical trial (Fahy et al., Aging Cell) reversed biological age by an average of 3.23 years through diet, exercise, sleep, and stress management over 8 weeks. BornClock identifies your highest-impact epigenetic habits and generates a personalised 90-day plan. Research shows measurable epigenetic improvements within 8-12 weeks of consistent lifestyle change.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between biological age and chronological age?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chronological age is how many years you have been alive — it is fixed. Biological age reflects how your cells are actually ageing — it is dynamic and responds to lifestyle. Two 50-year-olds may have biological ages of 43 and 61 depending on their lifestyle choices. The Karolinska Institute twin study (2018) confirmed that genetics accounts for only 25-30% of biological ageing rate. The remaining 70-75% is lifestyle and environment.',
      },
    },
    {
      '@type': 'Question',
      name: 'What lifestyle factors affect biological age the most?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most impactful factors are: (1) Exercise — 150+ min/week of moderate exercise is associated with measurable epigenetic age reversal (NIH, 2021); (2) Diet — Mediterranean-style eating reduces biological age markers (PREDIMED, NEJM 2013); (3) Sleep — chronic short sleep accelerates DNA methylation ageing; (4) Stress management — high cortisol directly accelerates epigenetic clock advancement; (5) Social connection — loneliness accelerates biological ageing at a cellular level.',
      },
    },
  ],
} as const;

const BA_SOFTWARE_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: `${BA_SEO.title} — BornClock`,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
} as const;

const BA_WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  speakable: {
    '@type': 'SpeakableSpecification',
    xpath: ['/html/body//h1', "/html/body//div[@data-testid='result-summary']"],
  },
} as const;

const DIFFICULTY_STYLES = {
  Easy:   'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard:   'bg-red-100 text-red-700',
} as const;

export function BiologicalAgeCalculatorPage() {
  return (
    <ToolLayout
      theme="science"
      testId="bio-age-page"
      seo={(
        <>
          {/* SEO via the project's react-helmet-async component. The SEO component derives
              og:title/description from title/description and emits the trailing-slash canonical. */}
          <SEO
            title={BA_SEO.title}
            description={BA_SEO.description}
            canonicalUrl="/biological-age-calculator"
            ogType="website"
            ogImage="https://bornclock.com/og/calculator.png"
          />

          {/* Schema — dangerouslySetInnerHTML in body */}
          <JsonLd data={BA_SCHEMA.softwareApp} />
          <JsonLd data={BA_SCHEMA.faq} />
          <JsonLd data={BA_SCHEMA.breadcrumb} />

          {/* Additional structured data: FAQPage (5), SoftwareApplication, speakable WebPage */}
          <JsonLd data={BA_FAQ_SCHEMA} />
          <JsonLd data={BA_SOFTWARE_APP_SCHEMA} />
          <JsonLd data={BA_WEBPAGE_SCHEMA} />
        </>
      )}
      breadcrumb={{
        trail: [
          { label: 'Science & Longevity', to: '/science-longevity' },
          { label: 'Longevity Calculator', to: '/longevity-calculator' },
        ],
        current: 'Biological Age Calculator',
      }}
      eyebrow={BA_COPY.hero.badge}
      h1={<>{BA_COPY.hero.h1Line1}{' '}<span>{BA_COPY.hero.h1Line2}</span></>}
      lead={BA_COPY.hero.subtitle}
      footer={{ note: '© 2026 BornClock.' }}
    >
      <>
        {/* ── HERO TRUST + CTA ── */}
        <section className="max-w-4xl mx-auto px-4 pt-4">
          <div className="text-center">
            <ul
              aria-label="Calculator features"
              className="flex flex-wrap justify-center gap-4 text-sm
                         text-gray-500 mb-8 list-none p-0"
            >
              {BA_COPY.hero.trust.map(item => (
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
                         focus:outline-none focus:ring-2 focus:ring-[#0E2238]
                         focus:ring-offset-2"
              aria-label="Start the free biological age calculator"
            >
              Calculate My Biological Age →
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Free · No blood test required · Results in 3 minutes
            </p>
          </div>
        </section>

        {/* ── BRYAN JOHNSON SECTION ── */}
        <section
          data-testid="bryan-johnson-section"
          className="max-w-4xl mx-auto px-4 py-10"
          aria-labelledby="bj-heading"
        >
          <div className="bg-gradient-to-r from-[#2F6FB0] to-[#2F6FB0]
                          border border-[#2F6FB0]/30 rounded-2xl p-6 sm:p-8">
            <h2 id="bj-heading" className="text-2xl font-black text-gray-900 mb-4">
              {BA_COPY.bryanJohnson.heading}
            </h2>
            {BA_COPY.bryanJohnson.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                {para}
              </p>
            ))}
            <p className="text-xs text-gray-400 italic mt-2">
              {BA_COPY.bryanJohnson.context}
            </p>
            <div className="mt-6">
              <Link
                to="/life-expectancy"
                data-testid="cta-to-calculator"
                className="inline-block bg-primary hover:bg-primary/90
                           text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                Get My Free Biological Age Estimate →
              </Link>
            </div>
          </div>
        </section>

        {/* ── ARTICLE CONTENT ── */}
        <article
          data-testid="article-content"
          className="max-w-4xl mx-auto px-4 pb-16"
          aria-label="Biological age calculator guide"
        >

          {/* What Is Biological Age */}
          <section className="mb-12" aria-labelledby="what-is-heading">
            <h2
              id="what-is-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.whatIsBioAge.heading}
            </h2>
            {BA_COPY.whatIsBioAge.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}
          </section>

          {/* Chrono vs Bio */}
          <section
            data-testid="chrono-vs-bio"
            className="mb-12"
            aria-labelledby="chrono-bio-heading"
          >
            <h2
              id="chrono-bio-heading"
              className="text-2xl font-black text-gray-900 mb-6
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.chronoVsBio.heading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="text-3xl mb-2" aria-hidden="true">📅</div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {BA_COPY.chronoVsBio.chronological.label}
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  {BA_COPY.chronoVsBio.chronological.description}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {BA_COPY.chronoVsBio.chronological.example}
                </p>
              </div>
              <div className="bg-[#2F6FB0]/10 border border-[#2F6FB0]/30 rounded-xl p-5">
                <div className="text-3xl mb-2" aria-hidden="true">🔬</div>
                <h3 className="font-bold text-[#2F6FB0] mb-2">
                  {BA_COPY.chronoVsBio.biological.label}
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  {BA_COPY.chronoVsBio.biological.description}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {BA_COPY.chronoVsBio.biological.example}
                </p>
              </div>
            </div>
            <div className="bg-[#2F6FB0]/10 border border-[#2F6FB0]/30 rounded-xl p-4">
              <p className="text-[#2F6FB0] text-sm font-medium">
                💡 {BA_COPY.chronoVsBio.keyInsight}
              </p>
            </div>
          </section>

          {/* Horvath Clock */}
          <section className="mb-12" aria-labelledby="horvath-heading">
            <h2
              id="horvath-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.horwathClock.heading}
            </h2>
            {BA_COPY.horwathClock.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}
          </section>

          {/* Mid-article CTA */}
          <div
            className="my-10 bg-[#2F6FB0]/10 border border-[#2F6FB0]/30
                        rounded-2xl p-6 text-center"
            role="complementary"
          >
            <p className="text-lg font-bold text-gray-900 mb-2">
              Curious what your biological age is right now?
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Takes 3 minutes. Based on epigenetic science and WHO research.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-primary hover:bg-primary/90
                         text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Calculate My Biological Age →
            </Link>
          </div>

          {/* 12 Epigenetic Habits */}
          <section
            data-testid="habits-section"
            className="mb-12"
            aria-labelledby="habits-heading"
          >
            <h2
              id="habits-heading"
              className="text-2xl font-black text-gray-900 mb-2
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.twelveHabits.heading}
            </h2>
            <p className="text-gray-600 mb-3">{BA_COPY.twelveHabits.intro}</p>

            {/* Realistic potential — NOT raw sum */}
            <div className="bg-[#2F6FB0]/10 border border-[#2F6FB0]/30 rounded-xl p-3 mb-3">
              <p className="text-sm font-semibold text-[#2F6FB0]">
                🎯 Realistic combined potential: up to +{BA_REALISTIC_POTENTIAL} years
                (with consistent practice across multiple habits)
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
              <p className="text-xs text-amber-800">
                ⚠️ {BA_COPY.twelveHabits.totalPotentialNote}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BA_EPIGENETIC_HABITS.map(habit => (
                <div
                  key={habit.id}
                  data-testid={`habit-${habit.id}`}
                  className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-white border-b border-gray-200 px-4 py-3
                                  flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center
                                 w-6 h-6 bg-[#0E2238] text-white rounded-full
                                 text-xs font-black flex-shrink-0"
                    >
                      {habit.id}
                    </span>
                    <span className="font-bold text-gray-900 text-sm flex-1 min-w-0 truncate">
                      {habit.emoji} {habit.name}
                    </span>
                    <span
                      data-testid="habit-gain"
                      className="text-xs font-bold text-green-700
                                 bg-green-100 rounded-full px-2 py-0.5 flex-shrink-0"
                    >
                      {habit.gain}
                    </span>
                  </div>
                  {/* Body */}
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                      {habit.mechanism}
                    </p>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-[#2F6FB0] italic flex-1 leading-relaxed">
                        {habit.source}
                      </p>
                      <span
                        data-testid="habit-difficulty"
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                    flex-shrink-0 ${DIFFICULTY_STYLES[habit.difficulty]}`}
                      >
                        {habit.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How BornClock Calculates */}
          <section className="mb-12" aria-labelledby="how-calc-heading">
            <h2
              id="how-calc-heading"
              className="text-2xl font-black text-gray-900 mb-6
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.howBornClock.heading}
            </h2>
            <div className="space-y-4">
              {BA_COPY.howBornClock.steps.map(step => (
                <div
                  key={step.step}
                  data-testid={`step-${step.step}`}
                  className="flex gap-4 items-start bg-gray-50
                             border border-gray-200 rounded-xl p-5"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 bg-[#0E2238] text-white
                               rounded-full flex items-center justify-center
                               font-black text-sm"
                    aria-label={`Step ${step.step}`}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to Lower Biological Age */}
          <section className="mb-12" aria-labelledby="lower-heading">
            <h2
              id="lower-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.howToLower.heading}
            </h2>
            {BA_COPY.howToLower.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}

            {/* Intervention table with scroll wrapper for mobile */}
            <div
              data-testid="intervention-table-wrapper"
              tabIndex={0}
              role="region"
              aria-label="Intervention comparison table (scrollable)"
              className="overflow-x-auto rounded-xl border border-gray-200 mt-6"
            >
              <table
                data-testid="intervention-table"
                className="w-full text-sm min-w-[500px]"
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">
                      Intervention
                    </th>
                    <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">
                      Biological Age Reversal
                    </th>
                    <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">
                      Source
                    </th>
                    <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">
                      Difficulty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BA_COPY.howToLower.interventions.map((item, i) => (
                    <tr
                      key={item.name}
                      data-testid="intervention-row"
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-green-700 font-semibold">
                        {item.reversal}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {item.source}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                      ${DIFFICULTY_STYLES[item.difficulty]}`}
                        >
                          {item.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

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
              {BA_COPY.honestLimits.heading}
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              {BA_COPY.honestLimits.paras.map((para, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </section>

          {/* Science */}
          <section className="mb-12" aria-labelledby="science-heading">
            <h2
              id="science-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {BA_COPY.science.heading}
            </h2>
            <div className="space-y-3">
              {BA_COPY.science.citations.map(c => (
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
              {BA_COPY.relatedTools.map(tool => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  data-testid="related-tool"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl
                             border border-gray-200 hover:border-[#2F6FB0]/30
                             hover:bg-[#2F6FB0]/10 transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-sm text-gray-900
                                    group-hover:text-[#2F6FB0] mb-0.5">
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
              {BA_SCHEMA.faq.mainEntity.map((faq, i) => (
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
              Find Out Your Biological Age — Free
            </h2>
            <p className="text-[#2F6FB0] mb-6 max-w-md mx-auto">
              3 minutes. Epigenetic science. Personalised plan to lower your biological age.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-white text-primary hover:bg-[#2F6FB0]/10
                         font-black py-4 px-8 rounded-xl transition-colors text-lg"
            >
              Calculate My Biological Age →
            </Link>
            <p className="text-[#2F6FB0] text-xs mt-3">
              Free · No blood test · No account required
            </p>
          </div>

        </article>
      </>
    </ToolLayout>
  );
}

export default BiologicalAgeCalculatorPage;
