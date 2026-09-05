import { SEO } from '@/components/SEO';
import { LC_FACTORS } from '@/content/longevityCalculatorContent';

// Local JSON-LD helper (copied convention from NumerologyArticle).
function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export interface RegionalStat {
  label: string;
  value: string;
  note: string;
}

export interface CountryFaq {
  q: string;
  a: string;
}

export interface LifeExpectancyCountryProps {
  /** data-testid on the <main> element */
  testId: string;
  /** e.g. "UK", "Australia", "USA", "Canada" — used verbatim in copy */
  country: string;
  /** demonym / adjective, e.g. "British", "Australian", "American", "Canadian" */
  demonym: string;
  /** page path, e.g. "/life-expectancy-calculator-uk" */
  path: string;
  /** hreflang lang code for this page, e.g. "en-GB" */
  hreflang: string;
  /** SEO title (<=70) */
  title: string;
  /** meta description (<=160) */
  description: string;
  /** SoftwareApplication schema name, e.g. "UK Life Expectancy Calculator" */
  appName: string;
  /** average life expectancy figure as a string, e.g. "81.1" */
  avg: string;
  men: string;
  women: string;
  /** source + year, e.g. "ONS 2023" */
  source: string;
  /** global rank, e.g. "29th" */
  rank: string;
  /** regional variation rows (may be empty) */
  regional?: RegionalStat[];
  /** exactly 5 country-specific FAQs */
  faqs: CountryFaq[];
}

const CTA_TARGET = '/longevity-calculator';

export function LifeExpectancyCountryTemplate(props: LifeExpectancyCountryProps) {
  const {
    testId, country, demonym, path, hreflang, title, description,
    appName, avg, men, women, source, rank, regional = [], faqs,
  } = props;

  const canonicalUrl = `https://bornclock.com${path}/`;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appName,
    description,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url: canonicalUrl,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    author: { '@type': 'Organization', name: 'BornClock', url: 'https://bornclock.com' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalUrl={path}
        ogType="website"
        hreflang={[
          { lang: hreflang, url: canonicalUrl },
          { lang: 'x-default', url: 'https://bornclock.com/longevity-calculator/' },
        ]}
      />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid={testId} className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Life Expectancy Calculator {country} — How Long Will You Live?
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            The average life expectancy in the {country} is <strong>{avg} years</strong> ({source}),
            placing it {rank} in the world. But a national average is just a starting point — it says
            almost nothing about <em>your</em> personal outlook. Your own life expectancy is shaped far
            more by how you live than by where you were born. This free {demonym} life expectancy
            calculator uses your {country} baseline and adjusts it with eight evidence-based lifestyle
            factors to give you a personalised estimate in about three minutes.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Below you will find the latest {country} figures, how they vary by region and sex, how they
            compare internationally, and the eight factors research has established as the primary
            drivers of longevity. When you are ready for your own number, run the{' '}
            <a href={CTA_TARGET} className="text-indigo-600 font-semibold underline">
              free longevity calculator
            </a>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            {country} Life Expectancy Statistics ({source})
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-indigo-900">{avg}</div>
              <div className="text-xs text-indigo-700 font-semibold mt-1">Overall (years)</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-blue-900">{men}</div>
              <div className="text-xs text-blue-700 font-semibold mt-1">Men (years)</div>
            </div>
            <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-pink-900">{women}</div>
              <div className="text-xs text-pink-700 font-semibold mt-1">Women (years)</div>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            According to {source}, life expectancy at birth in the {country} is {avg} years overall —
            {' '}{men} years for men and {women} years for women. The persistent gap between the sexes
            (women outliving men by several years) is consistent across almost every country on earth
            and is driven by a mix of biological and behavioural factors. Globally, the {country} ranks
            {' '}{rank}.
          </p>

          {regional.length > 0 && (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-3">
                Regional Variation Within the {country}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                National averages hide large regional differences driven by income, healthcare access,
                and lifestyle. The gap between the highest and lowest regions in the {country} is a
                reminder that geography is not destiny — but it is a strong signal.
              </p>
              <ul className="mb-6 space-y-2">
                {regional.map(r => (
                  <li key={r.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <span className="font-bold text-gray-900">{r.label}: {r.value} years</span>
                    <span className="text-gray-600"> — {r.note}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            How the {country} Compares Internationally
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Context matters. The {country} average of {avg} years sits within a wide global spread.
            For comparison, life expectancy is around <strong>84.3 years in Japan</strong> (one of the
            highest in the world), <strong>83.9 years in Switzerland</strong>, and roughly{' '}
            <strong>70.2 years in India</strong>. The differences between these countries are explained
            far more by diet, healthcare systems, smoking rates, and social structure than by genetics —
            which is precisely why an individual estimate based on your own habits is more useful than any
            national figure.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The 8 Factors That Determine Your Longevity
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Research from the WHO, Harvard, NIH, and the Karolinska Institute shows that genetics
            accounts for only 25–30% of longevity variance. The remaining 70–75% comes down to
            modifiable lifestyle factors. Our calculator assesses these eight:
          </p>
          <div className="space-y-3 mb-6">
            {LC_FACTORS.map(f => (
              <div key={f.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-1">
                  {f.emoji} {f.name} <span className="text-xs font-normal text-gray-500">— {f.impact}</span>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{f.summary}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">
              Calculate Your Personal {country} Life Expectancy
            </h2>
            <p className="text-indigo-200 mb-6">
              The {country} average is {avg} years — but your number could be very different. Answer 8
              quick questions and get your personalised estimate plus a free 90-day action plan.
            </p>
            <a
              href={CTA_TARGET}
              className="inline-block bg-white text-indigo-700 font-black px-8 py-3 rounded-full text-lg hover:bg-indigo-50 transition-colors"
            >
              Start My Free Longevity Calculator →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">
            {country} Life Expectancy — Frequently Asked Questions
          </h2>
          <div className="space-y-4 mb-10">
            {faqs.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            Ready to move beyond the {country} average? Our science-backed{' '}
            <a href={CTA_TARGET} className="text-indigo-600 font-semibold underline">
              longevity calculator
            </a>{' '}
            gives you a personalised life expectancy estimate, a biological age reading, and a free
            90-day plan — in about three minutes.
          </p>

        </article>
      </main>
    </>
  );
}

export default LifeExpectancyCountryTemplate;
