import { Link } from 'react-router-dom';
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

const DIFFICULTY_STYLES = {
  Easy:   'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard:   'bg-red-100 text-red-700',
} as const;

export function BiologicalAgeCalculatorPage() {
  return (
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

      <main
        data-testid="bio-age-page"
        className="min-h-screen bg-white"
      >
        {/* ── BREADCRUMB ── */}
        <nav
          aria-label="Breadcrumb"
          className="max-w-4xl mx-auto px-4 pt-4"
        >
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
              Biological Age Calculator
            </li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <section
          aria-labelledby="page-h1"
          className="bg-gradient-to-br from-violet-50 to-indigo-50
                     border-b border-violet-100 py-12 px-4 mt-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700
                            rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              {BA_COPY.hero.badge}
            </div>

            <h1
              id="page-h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900
                         leading-tight mb-4"
            >
              {BA_COPY.hero.h1Line1}{' '}
              <span className="text-violet-600">{BA_COPY.hero.h1Line2}</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
              {BA_COPY.hero.subtitle}
            </p>

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
              className="inline-block bg-violet-600 hover:bg-violet-500
                         text-white font-black py-4 px-10 rounded-xl
                         transition-colors text-lg shadow-md
                         focus:outline-none focus:ring-2 focus:ring-violet-400
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
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50
                          border border-violet-200 rounded-2xl p-6 sm:p-8">
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
                className="inline-block bg-violet-600 hover:bg-violet-500
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
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
                <div className="text-3xl mb-2" aria-hidden="true">🔬</div>
                <h3 className="font-bold text-violet-900 mb-2">
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
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-indigo-800 text-sm font-medium">
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
            className="my-10 bg-violet-50 border border-violet-200
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
              className="inline-block bg-violet-600 hover:bg-violet-500
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
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mb-3">
              <p className="text-sm font-semibold text-violet-800">
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
                                 w-6 h-6 bg-violet-600 text-white rounded-full
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
                      <p className="text-xs text-violet-600 italic flex-1 leading-relaxed">
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
                    className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white
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
                             border border-gray-200 hover:border-violet-300
                             hover:bg-violet-50 transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-sm text-gray-900
                                    group-hover:text-violet-700 mb-0.5">
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
            className="bg-gradient-to-br from-violet-600 to-indigo-600
                        rounded-2xl p-8 text-center text-white"
            role="complementary"
          >
            <h2 className="text-2xl font-black mb-2">
              Find Out Your Biological Age — Free
            </h2>
            <p className="text-violet-200 mb-6 max-w-md mx-auto">
              3 minutes. Epigenetic science. Personalised plan to lower your biological age.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-white text-violet-600 hover:bg-violet-50
                         font-black py-4 px-8 rounded-xl transition-colors text-lg"
            >
              Calculate My Biological Age →
            </Link>
            <p className="text-violet-300 text-xs mt-3">
              Free · No blood test · No account required
            </p>
          </div>

        </article>
      </main>
    </>
  );
}

export default BiologicalAgeCalculatorPage;
