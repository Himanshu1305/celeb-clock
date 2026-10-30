import { Link } from '@/components/seo/CanonicalLink';
import { ScrollTable } from '@/components/ScrollTable';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { le, leYears, LE_CITATION } from '@/data/lifeExpectancyFacts';
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
// SoftwareApplication and WebPage+speakable.
// (The old second FAQPage block, HLWIL_FAQ_SCHEMA, was removed in the batch 9b review: a
// page carries ONE FAQPage — HLWIL_SCHEMA.faq, the same list the visible FAQ renders.)

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
    <ToolLayout
      theme="science"
      testId="hlwil-page"
      seo={(
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

          {/* Additional structured data: SoftwareApplication, speakable WebPage */}
          <JsonLd data={HLWIL_SOFTWARE_APP_SCHEMA} />
          <JsonLd data={HLWIL_WEBPAGE_SCHEMA} />
        </>
      )}
      breadcrumb={{
        trail: [
          { label: 'Science & Longevity', to: '/science-longevity/' },
          { label: 'Longevity Calculator', to: '/longevity-calculator/' },
        ],
        current: 'How Long Will I Live',
      }}
      eyebrow={HLWIL_COPY.hero.badge}
      h1={HLWIL_COPY.hero.h1}
      lead={HLWIL_COPY.hero.subtitle}
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
              {HLWIL_COPY.hero.trust.map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-green-500" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Above-fold CTA */}
            <Link
              to="/life-expectancy/"
              data-testid="cta-to-calculator"
              className="inline-block bg-primary hover:bg-primary/90
                         text-white font-black py-4 px-10 rounded-xl
                         transition-colors text-lg shadow-md
                         focus:outline-none focus:ring-2 focus:ring-[#0E2238]
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

          <div className="bg-[#2F6FB0]/10 border border-[#2F6FB0]/30 rounded-xl p-4">
            <p className="text-[#2F6FB0] text-sm leading-relaxed">
              💡 {HLWIL_COPY.directAnswer.insight}
              {' '}
              <span className="text-xs text-[#2F6FB0] italic">
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
            className="my-10 bg-[#2F6FB0]/10 border border-[#2F6FB0]/30
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
              to="/life-expectancy/"
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
                                   w-6 h-6 bg-[#0E2238] text-white rounded-full
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
                      <p className="text-xs text-[#2F6FB0] italic">
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
            <ScrollTable testId="country-table-wrapper" label="Life expectancy by country table" boxClassName="rounded-xl border border-gray-200">
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
                          ? 'bg-[#2F6FB0]/10 font-semibold'
                          : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500 text-sm">{row.rank}</td>
                      <td className="px-4 py-3 text-gray-900">{row.country}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#2F6FB0]">{row.expectancy.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.male.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.female.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollTable>

            <p className="text-xs text-gray-400 mt-2 italic">
              {HLWIL_COPY.countryTable.source}
            </p>
            <div className="mt-3 bg-[#2F6FB0]/10 border border-[#2F6FB0]/30 rounded-xl p-3">
              <p className="text-xs text-[#2F6FB0] leading-relaxed">
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
                  className="flex gap-4 items-start bg-[#2F6FB0]/10
                             border border-[#2F6FB0]/30 rounded-xl p-4"
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
                    <h3 className="font-bold text-gray-900 mb-1">{step.action}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mid-article CTA 2 */}
          <div
            className="my-10 bg-[#2F6FB0]/10 border border-[#2F6FB0]/30
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
              to="/life-expectancy/"
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
            <p className="text-[#2F6FB0] mb-6 max-w-md mx-auto">
              3 minutes. 8 science-backed factors. Personalised result and 90-day plan.
            </p>
            <Link
              to="/life-expectancy/"
              data-testid="cta-to-calculator"
              className="inline-block bg-white text-primary hover:bg-[#2F6FB0]/10
                         font-black py-4 px-8 rounded-xl transition-colors text-lg"
            >
              {HLWIL_COPY.hero.ctaButton}
            </Link>
            <p className="text-[#2F6FB0] text-xs mt-3">
              Free · No account required · Results in 3 minutes
            </p>
          </div>

        </article>
      </>
    </ToolLayout>
  );
}

export default HowLongWillILivePage;
