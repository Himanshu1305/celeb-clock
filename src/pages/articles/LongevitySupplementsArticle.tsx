import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = "Longevity Supplements — What Works, What's Hype (India) | BornClock";
const DESC = 'Longevity supplements ranked by evidence — Vitamin D, omega-3, magnesium, ashwagandha, NMN and more. India availability, real science, and a food-first message.';

type Row = {
  name: string;
  evidence: string;
  evidenceTone: 'strong' | 'moderate' | 'weak' | 'emerging';
  finding: string;
  india: string;
};

const SUPPLEMENTS: Row[] = [
  {
    name: 'Vitamin D3',
    evidence: 'Strong',
    evidenceTone: 'strong',
    finding: '7% reduced all-cause mortality (BMJ meta-analysis)',
    india: 'Common and affordable in India',
  },
  {
    name: 'Magnesium Glycinate',
    evidence: 'Strong',
    evidenceTone: 'strong',
    finding: '10% lower cardiovascular disease (CVD) risk',
    india: 'Widely available',
  },
  {
    name: 'Omega-3 (Fish Oil)',
    evidence: 'Strong',
    evidenceTone: 'strong',
    finding: 'Reduces inflammation, cardiac benefit (NEJM)',
    india: 'Available; flaxseed is a plant-based alternative',
  },
  {
    name: 'NMN / NR',
    evidence: 'Moderate',
    evidenceTone: 'moderate',
    finding: 'NAD+ precursor; animal data strong, human data limited',
    india: 'Expensive',
  },
  {
    name: 'Coenzyme Q10',
    evidence: 'Moderate',
    evidenceTone: 'moderate',
    finding: 'Supports mitochondrial energy; statin users may benefit',
    india: 'Available',
  },
  {
    name: 'Ashwagandha',
    evidence: 'Moderate-Strong (Indian research)',
    evidenceTone: 'moderate',
    finding: 'Cortisol (stress hormone) reduction',
    india: 'Very available and affordable',
  },
  {
    name: 'Turmeric + Piperine',
    evidence: 'Moderate',
    evidenceTone: 'moderate',
    finding: 'Anti-inflammatory; piperine boosts absorption',
    india: 'Food source is best',
  },
  {
    name: 'Resveratrol',
    evidence: 'Weak-Moderate',
    evidenceTone: 'weak',
    finding: 'Sirtuin activation; poor bioavailability',
    india: 'Expensive',
  },
  {
    name: 'Metformin (Rx)',
    evidence: 'Emerging',
    evidenceTone: 'emerging',
    finding: 'TAME trial ongoing',
    india: 'Prescription only',
  },
  {
    name: 'Rapamycin (Rx)',
    evidence: 'Emerging',
    evidenceTone: 'emerging',
    finding: 'mTOR inhibition',
    india: 'Prescription only; not for healthy use',
  },
];

const TONE_CLASSES: Record<Row['evidenceTone'], string> = {
  strong: 'bg-green-100 text-green-800',
  moderate: 'bg-amber-100 text-amber-800',
  weak: 'bg-orange-100 text-orange-800',
  emerging: 'bg-slate-200 text-slate-700',
};

const FAQS = [
  {
    q: 'Do longevity supplements actually make you live longer?',
    a: 'A few come close. Vitamin D3 is linked to a roughly 7% reduction in all-cause mortality in a large BMJ meta-analysis, and magnesium and omega-3 have solid cardiovascular evidence. But most trendy "anti-aging" pills — resveratrol, NMN and similar — rest on animal studies or weak human data. No supplement replaces sleep, movement, and a good diet. Think of supplements as filling specific gaps, not as a longevity shortcut.',
  },
  {
    q: 'Which longevity supplement has the strongest evidence for Indians?',
    a: 'Vitamin D3 is the standout for India, where deficiency is extremely common due to indoor lifestyles, air pollution and skin melanin. It is cheap, widely available, and backed by strong mortality data. Magnesium glycinate and omega-3 also have strong evidence. Ashwagandha is unusual in that much of its research comes from Indian institutions, showing measurable cortisol reduction — and it is both very available and affordable here.',
  },
  {
    q: 'Are NMN, resveratrol and rapamycin worth taking?',
    a: 'For most people, no. NMN and NR are NAD+ precursors with strong animal data but limited human proof, and they are expensive in India. Resveratrol has weak-to-moderate evidence and poor bioavailability. Rapamycin is a prescription-only mTOR inhibitor with emerging research — it is not appropriate for healthy people to self-experiment with, and using it without medical supervision can be dangerous.',
  },
  {
    q: 'Is metformin a safe anti-aging drug to take?',
    a: 'Metformin is a prescription-only diabetes medication being studied for aging in the TAME trial, but that research is still ongoing. It is not approved as a longevity drug, and taking any prescription medicine without a doctor is unsafe. If you have blood-sugar or metabolic concerns, discuss it with a physician rather than sourcing it yourself.',
  },
  {
    q: 'Should I take supplements or just eat better?',
    a: 'Food first, always. The Indian supplement market is largely unregulated, and most marketing claims are unproven, so real food is safer, cheaper and better absorbed. Supplements make sense only to fill a genuine, ideally tested gap — for example vitamin D if a blood test confirms deficiency, or omega-3 if you eat no fish or flaxseed. Everything else should come from your plate.',
  },
];

export function LongevitySupplementsArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Longevity Supplements — What Works, What Is Hype (India Guide)',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/longevity-supplements/',
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
      <SEO title={TITLE} description={DESC} canonicalUrl="/articles/longevity-supplements" ogType="article" />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="longevity-supplements-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Longevity Supplements — Which Supplement Actually Works, and What's Just Hype
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Walk into any pharmacy or scroll any wellness feed in India and you will be
            promised a longer life in a bottle. NMN, resveratrol, "cellular anti-aging"
            capsules, exotic mushroom blends — the marketing is relentless and the prices
            are high. The honest truth is that only a handful of supplements have real,
            repeatable science behind them, and most of the popular ones are hype. This
            guide ranks the best-known longevity supplements strictly by the strength of
            their evidence, notes availability and cost in India, and keeps one message at
            the centre: <strong>food first, supplements only to fill genuine gaps.</strong>
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            We do not invent efficacy numbers or overstate benefits. Where a supplement has
            strong human data — like Vitamin D and its link to reduced all-cause mortality —
            we say so. Where the evidence is thin, animal-only, or still emerging in clinical
            trials, we say that too. That distinction between <em>Strong</em>, <em>Moderate</em>,
            <em> Weak</em> and <em>Emerging</em> evidence is the whole point of this page.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Longevity Supplements Ranked by Evidence</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The table below rates each supplement by evidence level, summarises the key
            finding, and notes availability in India. Higher on the list means stronger,
            more human-tested evidence.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 font-bold text-gray-900 border-b border-gray-200">Supplement</th>
                  <th className="p-3 font-bold text-gray-900 border-b border-gray-200">Evidence</th>
                  <th className="p-3 font-bold text-gray-900 border-b border-gray-200">Key Finding</th>
                  <th className="p-3 font-bold text-gray-900 border-b border-gray-200">India Availability</th>
                </tr>
              </thead>
              <tbody>
                {SUPPLEMENTS.map(row => (
                  <tr key={row.name} className="align-top border-b border-gray-100">
                    <td className="p-3 font-semibold text-gray-900">{row.name}</td>
                    <td className="p-3">
                      <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${TONE_CLASSES[row.evidenceTone]}`}>
                        {row.evidence}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{row.finding}</td>
                    <td className="p-3 text-gray-600">{row.india}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 my-8">
            <h2 className="text-lg font-black text-red-900 mb-2">Read This Before You Buy Anything</h2>
            <p className="text-sm text-red-800 leading-relaxed mb-3">
              The supplement market in India is <strong>largely unregulated.</strong> Products
              are often sold as "nutraceuticals" with limited testing of purity, dose accuracy,
              or contamination. Most on-label claims — "reverses aging", "boosts cellular
              energy", "detoxifies" — are <strong>unproven</strong> and would not survive a
              proper clinical trial. Higher price does not mean higher quality.
            </p>
            <p className="text-sm text-red-800 leading-relaxed mb-3">
              <strong>Food first.</strong> Real food delivers nutrients in forms your body
              absorbs better, alongside fibre and other compounds a capsule cannot replicate.
              Supplements should fill a specific, ideally blood-tested gap — not replace a diet.
            </p>
            <p className="text-sm text-red-800 leading-relaxed">
              <strong>Prescription warning:</strong> Metformin and Rapamycin are
              <strong> prescription-only</strong> medicines, not lifestyle supplements. Rapamycin
              in particular is <strong>not for healthy people to use.</strong> Never source or
              self-dose any prescription drug for "longevity" — doing so without a doctor's
              supervision can cause serious harm. Talk to a qualified physician first, and treat
              anyone selling prescription drugs as anti-aging supplements as a red flag.
            </p>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Ones Actually Worth Considering</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            <strong>Vitamin D3</strong> is the clearest win for most Indians. Deficiency is
            widespread thanks to indoor lifestyles, pollution and skin melanin, and a large
            BMJ meta-analysis links supplementation to about a 7% reduction in all-cause
            mortality. It is cheap and everywhere. <strong>Magnesium glycinate</strong> is a
            gentle, well-absorbed form associated with roughly 10% lower cardiovascular
            disease risk. <strong>Omega-3 fish oil</strong> reduces inflammation and has
            NEJM-level cardiac data; if you avoid fish, flaxseed is a plant-based alternative.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>Ashwagandha</strong> deserves a special mention because much of its
            evidence comes from Indian research, showing measurable cortisol reduction — and
            it is both very available and affordable. <strong>Coenzyme Q10</strong> supports
            mitochondrial energy and can help statin users. <strong>Turmeric with piperine</strong> is
            anti-inflammatory, though a turmeric-rich diet is usually the better route. By
            contrast, <strong>NMN/NR</strong> and <strong>resveratrol</strong> ride on strong
            animal data or weak bioavailability and are expensive — promising, not proven.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">How Long Could You Live?</h2>
            <p className="text-indigo-100 mb-6">
              Supplements are a small lever. Sleep, movement, diet and stress matter far more.
              See how your habits shape your lifespan with our free longevity calculator.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3 rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Try the Longevity Calculator →
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

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8 text-center">
            <p className="text-indigo-900 font-semibold mb-4">
              Curious what really moves the needle on how long you live? Your daily habits
              outweigh any pill.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Estimate My Lifespan Free →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Related Articles</h2>
          <div className="grid gap-3 mb-6">
            <a href="/articles/longevity-foods-india"
               className="block bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
              <div className="font-bold text-gray-900">Longevity Foods in India</div>
              <div className="text-sm text-gray-600">The food-first foundation these supplements are meant to support.</div>
            </a>
            <a href="/articles/how-to-live-to-100"
               className="block bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
              <div className="font-bold text-gray-900">How to Live to 100</div>
              <div className="text-sm text-gray-600">The habits and lifestyle patterns of the world's longest-lived people.</div>
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default LongevitySupplementsArticle;
