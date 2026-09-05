import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Retirement Age & Life Expectancy in India | BornClock';
const DESC = 'Retirement age and life expectancy in India — EPFO pension, NPS, when early retirement makes sense given your longevity, and the FIRE approach.';
const SLUG = 'retirement-age-india-life-expectancy';

const FAQS = [
  {
    q: 'What is the standard retirement age in India?',
    a: 'For most central government employees the standard retirement age is 60. Public sector banks and many state governments also use 60, though some states set 58 and certain roles (such as university professors and judges) retire later. In the private sector there is no legal retirement age — it is set by company policy, most often 58 or 60.',
  },
  {
    q: 'How does the EPFO pension work?',
    a: 'The Employees’ Provident Fund Organisation (EPFO) runs two things: the EPF, a lump-sum retirement corpus built from your and your employer’s monthly contributions, and the Employees’ Pension Scheme (EPS), which pays a monthly pension after retirement. EPS eligibility normally begins at 58 with at least 10 years of service; the pension amount depends on your pensionable salary and years of service.',
  },
  {
    q: 'What is the National Pension System (NPS)?',
    a: 'The NPS is a voluntary, market-linked retirement account regulated by the PFRDA. You contribute during your working years, the money is invested across equity and debt, and at 60 you can withdraw up to 60% as a tax-free lump sum while at least 40% must buy an annuity that pays a lifelong monthly income. It is a core tool for anyone planning a retirement that must last decades.',
  },
  {
    q: 'When does early retirement make financial sense in India?',
    a: 'Early retirement makes sense when your invested corpus can safely fund every year between your retirement date and your life expectancy — with a margin for inflation and healthcare. The key is the years-funded gap: if BornClock estimates you will live to 82 and you want to retire at 50, you must fund 32 years, not the ~22 a standard retiree at 60 needs. The longer your expected life, the larger the corpus required.',
  },
  {
    q: 'How do I estimate how many years my retirement needs to last?',
    a: 'Subtract your planned retirement age from your personal life expectancy: years to fund = life expectancy − retirement age. Use a personalised estimate rather than the national average of about 70, because your own outlook — based on age, sex and lifestyle — may be higher. Planning to the average and then living longer is one of the most common retirement mistakes.',
  },
];

const SCENARIOS = [
  { retire: 60, le: 78, label: 'Standard retirement, average outlook' },
  { retire: 60, le: 85, label: 'Standard retirement, healthy long-lived' },
  { retire: 50, le: 82, label: 'Early retirement (FIRE)' },
  { retire: 45, le: 85, label: 'Aggressive FIRE' },
];

export function RetirementAgeIndiaArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Retirement Age & Life Expectancy in India',
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

      <main data-testid="retirement-age-india-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Retirement Age &amp; Life Expectancy in India
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Retirement planning in India used to be simple: work until 60, collect a provident fund
            and a pension, and rely on family. That world has changed. People are living longer,
            joint-family support is thinner, and healthcare costs are rising fast. The single most
            important input into any retirement plan is no longer just how much you save — it is how
            long you are likely to live. This guide connects <strong>retirement age in India</strong>
            {' '}to your personal life expectancy, walks through EPFO and NPS, and shows exactly when
            early retirement or a FIRE strategy actually adds up.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Standard Retirement Age: 60</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            For most central government employees the standard retirement age is <strong>60</strong>.
            Public sector banks and many state governments follow the same line, though a handful of
            states retire staff at 58 and certain professions — professors, judges and some
            scientists — continue past 60. In the private sector there is no legally fixed retirement
            age; each employer sets its own, typically 58 or 60.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The problem is that "60" was set decades ago, when Indian life expectancy was far lower.
            Today a healthy 60-year-old can reasonably expect two more decades of life — which means
            a retirement corpus has to stretch much further than most people assume.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">EPFO: Provident Fund and Pension</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The <strong>EPFO</strong> (Employees' Provident Fund Organisation) is the backbone of
            formal-sector retirement in India, and it runs two schemes that people often confuse:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-2">
            <li>
              <strong>EPF (Provident Fund):</strong> a lump-sum corpus. You and your employer each
              contribute a share of your basic salary every month, it earns an annual interest rate
              declared by EPFO, and you withdraw the accumulated amount at retirement.
            </li>
            <li>
              <strong>EPS (Employees' Pension Scheme):</strong> a monthly pension. Part of the
              employer contribution is diverted here. You generally need at least 10 years of service
              and can start the pension from age 58; the amount depends on your pensionable salary and
              years of service.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            For many salaried Indians the EPS pension alone is modest, which is exactly why a second
            pillar — the NPS — matters so much.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">NPS: The Longevity Pillar</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The <strong>National Pension System (NPS)</strong> is a voluntary, market-linked account
            regulated by the PFRDA. You contribute through your working years, the money is invested
            across equity and debt, and it compounds until age 60. At retirement you can take up to
            60% as a tax-free lump sum, and at least 40% must be used to buy an annuity that pays a
            monthly income <em>for life</em>.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            That lifelong annuity is the point. Because it pays until you die, the NPS directly
            hedges the biggest financial risk of a long life — outliving your money. The longer your
            expected lifespan, the more valuable a guaranteed lifelong income becomes.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Years-Funded Math</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Every retirement plan comes down to one gap you must fund:
          </p>
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-6 text-center">
            <p className="text-lg font-black text-indigo-900">
              Years to fund = Life Expectancy − Retirement Age
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-3">
            The table below shows how dramatically the funding requirement changes with both your
            retirement age and your expected lifespan:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 font-bold text-gray-900">Scenario</th>
                  <th className="p-3 font-bold text-gray-900">Retire at</th>
                  <th className="p-3 font-bold text-gray-900">Live to</th>
                  <th className="p-3 font-bold text-gray-900">Years to fund</th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s, i) => (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 text-gray-700">{s.label}</td>
                    <td className="p-3 text-center text-gray-700">{s.retire}</td>
                    <td className="p-3 text-center text-gray-700">{s.le}</td>
                    <td className="p-3 text-center font-black text-indigo-700">{s.le - s.retire}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Notice that retiring ten years early and living slightly longer can nearly
            <em> double</em> the number of years your corpus must cover. This is why using your own
            life expectancy — not the national average of around 70 — is the foundation of an honest
            plan. Underestimate your lifespan and you risk running out of money in your eighties.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h3 className="text-lg font-black text-indigo-900 mb-2">Start with your own number</h3>
            <p className="text-sm text-indigo-700 mb-4">
              Before you pick a retirement age, get a personalised life expectancy so you know how
              many years you actually need to fund.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Estimate My Life Expectancy →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">When Early Retirement Makes Sense</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Early retirement — and its more aggressive cousin, the <strong>FIRE</strong> movement
            (Financial Independence, Retire Early) — is achievable in India, but only when the maths
            works. It makes financial sense when:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li>Your invested corpus can safely fund every year to your <em>personal</em> life expectancy.</li>
            <li>Your annual withdrawal stays within a sustainable rate (many Indian FIRE planners use 3–3.5% given inflation).</li>
            <li>You have a separate, ring-fenced fund for medical costs and health insurance that lasts to the end.</li>
            <li>You have accounted for inflation over a potentially 30–40 year horizon.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The FIRE approach flips the usual order: instead of asking "when can I retire?", it asks
            "what corpus do I need to fund my expected lifespan?" and then works backwards to a
            savings rate. A longer life expectancy is not a reason to abandon FIRE — it is a reason to
            build a larger cushion and to favour lifelong-income products like the NPS annuity.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">Plan Retirement Around Your Real Lifespan</h2>
            <p className="text-indigo-200 mb-6">
              Get a personalised life expectancy, then subtract your target retirement age to see
              exactly how many years you need to fund.
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
              <a href="/articles/retirement-planning-life-expectancy" className="hover:underline font-semibold">
                Retirement Planning &amp; Life Expectancy
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

export default RetirementAgeIndiaArticle;
