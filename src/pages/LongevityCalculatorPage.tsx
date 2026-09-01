import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import {
  LC_SEO, LC_SCHEMA, LC_FACTORS, LC_COPY
} from '@/content/longevityCalculatorContent';

// ── Schema helper ────────────────────────────────────────────
// Rendered in the component body (not via Helmet) so the JSON-LD lands in the
// prerendered static HTML reliably — react-helmet's per-route flush is bypassed
// by the prerender pipeline (see scripts/prerender-titles.mjs).
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Impact color helper ──────────────────────────────────────
const IMPACT_COLORS = {
  red:    'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-amber-50 border-amber-200 text-amber-700',
  green:  'bg-green-50 border-green-200 text-green-700',
} as const;

export function LongevityCalculatorPage() {
  return (
    <>
      {/* SEO via the project's standard react-helmet-async component — title, meta,
          canonical (trailing-slash form, the Worker's 200 URL), og + twitter. */}
      <SEO
        title={LC_SEO.title}
        description={LC_SEO.description}
        canonicalUrl="/longevity-calculator"
        ogType="website"
        ogImage="https://bornclock.com/og/calculator.png"
      />

      {/* Schema — body scripts for reliable prerender capture */}
      <JsonLd data={LC_SCHEMA.softwareApp} />
      <JsonLd data={LC_SCHEMA.faq} />
      <JsonLd data={LC_SCHEMA.breadcrumb} />

      <main
        data-testid="longevity-calc-page"
        className="min-h-screen bg-white"
      >
        {/* ── BREADCRUMB ── */}
        <nav
          aria-label="Breadcrumb"
          className="max-w-4xl mx-auto px-4 pt-4"
        >
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-indigo-600">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-gray-700 font-medium" aria-current="page">
              Longevity Calculator
            </li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <section
          aria-labelledby="page-h1"
          className="bg-gradient-to-br from-indigo-50 to-purple-50
                     border-b border-indigo-100 py-12 px-4 mt-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700
                            rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              {LC_COPY.hero.badge}
            </div>

            <h1
              id="page-h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900
                         leading-tight mb-4"
            >
              {LC_COPY.hero.h1Line1}{' '}
              <span className="text-indigo-600">{LC_COPY.hero.h1Line2}</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
              {LC_COPY.hero.subtitle}
            </p>

            <ul
              aria-label="Calculator features"
              className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8
                         list-none p-0"
            >
              {LC_COPY.hero.trust.map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-green-500" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Above-fold CTA — always visible without scrolling */}
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-indigo-600 hover:bg-indigo-500
                         text-white font-black py-4 px-10 rounded-xl
                         transition-colors text-lg shadow-md
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         focus:ring-offset-2"
              aria-label="Start the free longevity calculator"
            >
              Start My Free Longevity Calculator →
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Free · No account required · Results in 3 minutes
            </p>
          </div>
        </section>

        {/* ── CALCULATOR EMBED ──
            The interactive quiz lives at /life-expectancy (it needs date-of-birth
            context + a multi-phase flow that isn't cleanly standalone), so we present
            it as a prominent calculator card that launches the live tool. */}
        <section
          data-testid="calculator-section"
          className="max-w-4xl mx-auto px-4 py-8"
          aria-label="Longevity Calculator"
        >
          <div
            data-testid="calculator-embed"
            className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl
                       p-8 text-center"
          >
            <p className="text-xl font-bold text-gray-900 mb-2">
              🔬 Your Personalised Life Expectancy Calculator
            </p>
            <p className="text-gray-600 mb-6">
              Answer 8 questions based on WHO, Harvard, and NIH research.
              Get your personalised forecast, longevity score, and 90-day action plan.
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-indigo-600 hover:bg-indigo-500
                         text-white font-black py-4 px-10 rounded-xl
                         transition-colors text-lg"
            >
              Calculate My Life Expectancy →
            </Link>
          </div>
        </section>

        {/* ── ARTICLE CONTENT ── */}
        <article
          data-testid="article-content"
          className="max-w-4xl mx-auto px-4 pb-16"
          aria-label="Longevity calculator guide"
        >

          {/* Intro paragraphs */}
          <div className="mb-12">
            {LC_COPY.introParas.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed text-lg mb-4">
                {para}
              </p>
            ))}
          </div>

          {/* What Is a Longevity Calculator */}
          <section className="mb-12" aria-labelledby="what-is-heading">
            <h2
              id="what-is-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.whatIs.heading}
            </h2>
            {LC_COPY.whatIs.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {para}
              </p>
            ))}
          </section>

          {/* Why Different */}
          <section className="mb-12" aria-labelledby="why-diff-heading">
            <h2
              id="why-diff-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.whyDifferent.heading}
            </h2>
            {LC_COPY.whyDifferent.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {para}
              </p>
            ))}
          </section>

          {/* Mid-article CTA */}
          <div
            className="my-10 bg-indigo-50 border border-indigo-200
                        rounded-2xl p-6 text-center"
            role="complementary"
            aria-label="Calculator call to action"
          >
            <p className="text-lg font-bold text-gray-900 mb-2">
              {LC_COPY.midCTA.heading}
            </p>
            <p className="text-gray-600 text-sm mb-4">{LC_COPY.midCTA.sub}</p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-indigo-600 hover:bg-indigo-500
                         text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              {LC_COPY.midCTA.button}
            </Link>
          </div>

          {/* 8 Factors */}
          <section className="mb-12" aria-labelledby="factors-heading">
            <h2
              id="factors-heading"
              className="text-2xl font-black text-gray-900 mb-2
                         pb-3 border-b border-gray-200"
            >
              The 8 Factors That Determine Your Longevity
            </h2>
            <p className="text-gray-600 mb-8">
              BornClock's calculator assesses 8 independent lifestyle and health
              factors. Here is what each measures and why it matters:
            </p>

            <div className="space-y-6">
              {LC_FACTORS.map(factor => (
                <div
                  key={factor.id}
                  data-testid={`factor-${factor.id}`}
                  className="rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Factor header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-3
                                  flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center
                                 w-7 h-7 bg-indigo-600 text-white rounded-full
                                 text-sm font-black flex-shrink-0"
                    >
                      {factor.id}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {factor.emoji} {factor.name}
                    </h3>
                    <span
                      className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full
                                  border ${IMPACT_COLORS[factor.impactColor]}`}
                    >
                      {factor.impact}
                    </span>
                  </div>

                  {/* Factor content */}
                  <div className="px-5 py-4">
                    <p className="text-gray-700 font-medium mb-2">{factor.summary}</p>
                    <p className="text-gray-600 text-sm mb-3">{factor.detail}</p>
                    <p className="text-xs text-indigo-600 italic">
                      📚 {factor.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Longevity Score */}
          <section className="mb-12" aria-labelledby="score-heading">
            <h2
              id="score-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.longevityScore.heading}
            </h2>
            <div className="space-y-3">
              {LC_COPY.longevityScore.bands.map(band => (
                <div
                  key={band.range}
                  data-testid="score-band"
                  className="flex gap-4 items-start bg-gray-50
                             rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex-shrink-0 text-center min-w-[80px]">
                    <div className="font-black text-indigo-600 text-sm">
                      {band.range}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {band.label}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {band.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How to Improve */}
          <section className="mb-12" aria-labelledby="improve-heading">
            <h2
              id="improve-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.howToImprove.heading}
            </h2>
            {LC_COPY.howToImprove.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {para}
              </p>
            ))}
          </section>

          {/* Who Should Use */}
          <section className="mb-12" aria-labelledby="who-heading">
            <h2
              id="who-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.whoShouldUse.heading}
            </h2>
            {LC_COPY.whoShouldUse.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {para}
              </p>
            ))}
          </section>

          {/* Honest Limits */}
          <section className="mb-12" aria-labelledby="limits-heading">
            <h2
              id="limits-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.limitations.heading}
            </h2>
            {LC_COPY.limitations.paras.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {para}
              </p>
            ))}
          </section>

          {/* Science Section */}
          <section className="mb-12" aria-labelledby="science-heading">
            <h2
              id="science-heading"
              className="text-2xl font-black text-gray-900 mb-4
                         pb-3 border-b border-gray-200"
            >
              {LC_COPY.science.heading}
            </h2>
            <p className="text-gray-700 mb-6">{LC_COPY.science.intro}</p>
            <div className="space-y-3">
              {LC_COPY.science.citations.map(c => (
                <div
                  key={c.source}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="font-bold text-blue-900 text-sm mb-1">
                    {c.source}
                  </div>
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
            <h2
              id="related-heading"
              className="text-xl font-bold text-gray-900 mb-4"
            >
              Related BornClock Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LC_COPY.relatedTools.map(tool => (
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

          {/* FAQ Section */}
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
              {LC_SCHEMA.faq.mainEntity.map((faq, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-5"
                >
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
            className="bg-gradient-to-br from-indigo-600 to-purple-600
                        rounded-2xl p-8 text-center text-white"
            role="complementary"
          >
            <h2 className="text-2xl font-black mb-2">
              {LC_COPY.bottomCTA.heading}
            </h2>
            <p className="text-indigo-200 mb-6 max-w-md mx-auto">
              {LC_COPY.bottomCTA.sub}
            </p>
            <Link
              to="/life-expectancy"
              data-testid="cta-to-calculator"
              className="inline-block bg-white text-indigo-600 hover:bg-indigo-50
                         font-black py-4 px-8 rounded-xl transition-colors text-lg"
            >
              {LC_COPY.bottomCTA.button}
            </Link>
            <p className="text-indigo-300 text-xs mt-3">
              {LC_COPY.bottomCTA.footnote}
            </p>
          </div>

        </article>
      </main>
    </>
  );
}

export default LongevityCalculatorPage;
