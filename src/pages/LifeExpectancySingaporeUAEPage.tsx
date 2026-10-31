import { SEO } from '@/components/SEO';
import { ToolLayout } from '@/components/central';
import { LC_FACTORS } from '@/content/longevityCalculatorContent';
import { leYears, leDiff, LE_CITATION } from '@/data/lifeExpectancyFacts';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Life Expectancy Calculator — Singapore & UAE | BornClock';
const DESC = `Life expectancy in Singapore (${leYears('Singapore')}) and UAE (${leYears('United Arab Emirates')}) — UN WPP 2024 data for the Indian diaspora. Compare with India ${leYears('India')} and calculate your own with 8 factors.`;

const COUNTRIES = [
  {
    flag: '🇸🇬',
    name: 'Singapore',
    le: leYears('Singapore'),
    note: 'UN WPP 2024, 2023 estimate — among the highest in the world',
    detail: `Singapore's life expectancy of ${leYears('Singapore')} years places it among the longest-lived nations globally. Its success is built on near-universal healthcare, one of the lowest infant mortality rates in the world, and a public health culture that keeps chronic disease in check. The famous hawker-centre food culture, while rich, sits alongside high walkability and active-ageing programmes that keep older Singaporeans mobile and socially engaged.`,
  },
  {
    flag: '🇦🇪',
    name: 'UAE',
    le: leYears('United Arab Emirates'),
    note: 'UN WPP 2024, 2023 estimate — steadily improving',
    detail: `The UAE's life expectancy of ${leYears('United Arab Emirates')} years has risen sharply over recent decades on the back of heavy investment in world-class hospitals and preventive screening. The lifestyle picture is mixed: a young, largely expatriate workforce and rising incomes coexist with challenges from desert heat, sedentary office life, and higher rates of diabetes. Government wellness drives and mandatory health insurance continue to push the figure upward.`,
  },
  {
    flag: '🇮🇳',
    name: 'India',
    le: leYears('India'),
    note: 'UN WPP 2024, 2023 estimate — baseline for comparison',
    detail: `India's life expectancy of ${leYears('India')} years is the reference point most of the diaspora grew up with. The ${leDiff('Singapore', 'India')}-year gap between India and Singapore is driven far less by genetics than by healthcare access, air quality, sanitation, and lifestyle — which is precisely why relocating and adopting local health habits can meaningfully change an individual's outlook.`,
  },
  {
    flag: '🇬🇧',
    name: 'UK',
    le: leYears('United Kingdom'),
    note: 'UN WPP 2024, 2023 estimate — another major diaspora hub',
    detail: `The UK, home to a large and long-established Indian community, sits at ${leYears('United Kingdom')} years. It offers a useful midpoint between Singapore's figure and India's, showing that even among high-income destinations, life expectancy varies with diet, activity, climate and healthcare model.`,
  },
];

const FAQS = [
  {
    q: 'What is the life expectancy in Singapore and the UAE?',
    a: `According to the ${LE_CITATION}, life expectancy in Singapore is ${leYears('Singapore')} years — among the highest in the world — while the UAE sits at ${leYears('United Arab Emirates')} years. Both are well above India's figure of ${leYears('India')} years, largely due to differences in healthcare access, sanitation and lifestyle rather than genetics.`,
  },
  {
    q: 'Why do Indians in Singapore and the UAE tend to live longer?',
    a: `Members of the Indian diaspora often benefit from the healthcare systems, food safety, sanitation and air quality of their adopted countries. Singapore's universal healthcare and the UAE's heavy investment in hospitals and preventive screening both raise the baseline. The gap with India of about ${leDiff('Singapore', 'India')} years for Singapore is driven by environment and lifestyle, not heritage, which means individual habits still matter enormously.`,
  },
  {
    q: 'How large is the Indian community in Singapore and the UAE?',
    a: 'There are more than 350,000 Indians in Singapore, forming one of its major ethnic communities, and around 3.5 million Indians in the UAE, where they make up the single largest expatriate group. These sizeable communities make local life-expectancy data directly relevant to millions of people of Indian origin living abroad.',
  },
  {
    q: 'How is my personal life expectancy different from the national average?',
    a: `A national average like ${leYears('Singapore')} for Singapore is a population statistic. Your personal life expectancy adjusts that baseline up or down based on your own smoking, BMI, chronic conditions, diet, sleep, exercise, stress and social connections. Research shows these lifestyle factors account for 70–75% of longevity variance, so two people in the same country can differ by 20 years or more.`,
  },
  {
    q: 'How do I calculate my own life expectancy?',
    a: 'Use the BornClock longevity calculator, which starts from a population baseline for your country (UN WPP 2024 where available, otherwise a WHO regional average) and adjusts it across 8 evidence-based lifestyle factors. The quiz takes about 3 minutes and returns a personalised estimate, a longevity score and a 90-day action plan — free, with no account required.',
  },
];

export function LifeExpectancySingaporeUAEPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Life Expectancy Calculator — Singapore & UAE',
    description: DESC,
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
    <ToolLayout
      theme="science"
      testId="sg-uae-le-page"
      seo={(
        <>
          <SEO
            title={TITLE}
            description={DESC}
            canonicalUrl="/life-expectancy-calculator-singapore-uae"
            ogType="website"
          />
          <JsonLd data={softwareSchema} />
          <JsonLd data={faqSchema} />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity/' }], current: 'Singapore & UAE Life Expectancy' }}
      eyebrow="Life Expectancy"
      h1="Life Expectancy Calculator — Singapore & UAE"
      lead={(
        <>
          For the millions of people of Indian origin living in Singapore and the UAE, life
          expectancy is more than a statistic — it shapes decisions about careers, families,
          retirement and where to grow old. Singapore records one of the highest life
          expectancies on Earth at <strong>{leYears('Singapore')} years</strong>, while the UAE sits
          at <strong>{leYears('United Arab Emirates')} years</strong>. Both comfortably exceed
          India&apos;s figure of <strong>{leYears('India')} years</strong> ({LE_CITATION}).
        </>
      )}
    >
      <article className="max-w-3xl mx-auto px-4 py-10">

          <p className="text-gray-700 leading-relaxed mb-6">
            This page pulls together UN World Population Prospects 2024 country data for the Indian diaspora, explains why the
            gap exists, and lets you go one step further — estimating your own life expectancy
            based on 8 evidence-based lifestyle factors rather than a national average.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8 text-center">
            <p className="text-emerald-900 font-semibold mb-4">
              Averages describe countries. This tool describes you.
            </p>
            <a href="/longevity-calculator/"
               className="inline-block bg-emerald-700 text-white font-black px-8 py-3
                          rounded-full text-lg hover:bg-emerald-800 transition-colors">
              Calculate My Life Expectancy →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Life Expectancy by Country (UN WPP 2024, 2023 estimate)
          </h2>
          <div className="space-y-4 mb-8">
            {COUNTRIES.map(c => (
              <div key={c.name} className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <div className="text-xl font-black text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.note}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-3xl font-black text-emerald-600">{c.le}</div>
                    <div className="text-xs text-gray-500">years</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The Indian Diaspora in Singapore and the UAE
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The Indian community is a defining part of both countries. More than{' '}
            <strong>350,000 Indians</strong> live in Singapore, where they form one of the
            major ethnic communities, and around <strong>3.5 million Indians</strong> live in
            the UAE, making them the single largest expatriate group in the country. For these
            families, local life-expectancy figures are not foreign trivia — they describe the
            environment their own health is shaped by every day.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The encouraging news is that the {leDiff('Singapore', 'India')}-year gap between India ({leYears('India')}) and
            Singapore ({leYears('Singapore')}) is overwhelmingly explained by healthcare access, sanitation, air
            quality and lifestyle — not by ancestry. Comparing against the UK ({leYears('United Kingdom')}), another
            major diaspora hub, tells the same story: environment and daily habits move the
            number far more than genetics do. That means the choices an individual makes about
            diet, movement and stress genuinely matter.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            The 8 Factors That Shape Your Life Expectancy
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            National averages are a starting point. Your personal life expectancy is decided by
            the compounding effect of daily habits. Research shows these 8 modifiable factors
            account for 70–75% of longevity variance:
          </p>
          <div className="space-y-3 mb-8">
            {LC_FACTORS.map(f => (
              <div key={f.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-bold text-gray-900">{f.name}</span>
                  <span className="ml-auto text-xs font-semibold text-emerald-700 text-right">
                    {f.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{f.summary}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl
               p-8 text-center text-white mb-10">
            <h2 className="text-2xl font-black mb-2">See Your Own Number, Not the Average</h2>
            <p className="text-emerald-100 mb-6">
              Whether you&apos;re in Singapore, the UAE, India or the UK, the BornClock longevity
              calculator adjusts a population baseline for your country (UN WPP 2024 where available, otherwise a WHO regional average) across all 8 factors in about 3 minutes.
            </p>
            <a href="/longevity-calculator/"
               className="inline-block bg-white text-emerald-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-emerald-50 transition-colors">
              Start My Free Longevity Calculator →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-6">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

        </article>
    </ToolLayout>
  );
}

export default LifeExpectancySingaporeUAEPage;
