import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const INTERVENTIONS: { title: string; body: string }[] = [
  {
    title: 'Mediterranean diet',
    body: 'A diet rich in olive oil, vegetables, legumes, fish, and whole grains is one of the most consistently studied nutritional patterns in longevity science. It is associated with favourable shifts in gene expression tied to inflammation and metabolism, and with slower biological ageing on DNA-methylation measures.',
  },
  {
    title: 'HIIT exercise',
    body: 'High-intensity interval training drives some of the strongest exercise-related changes in gene expression, including in mitochondrial and metabolic pathways. Regular physical activity is also linked to longer telomeres, and exercise is one of the few interventions shown to help slow — and in some studies partially reverse — telomere shortening.',
  },
  {
    title: '7–9 hours of sleep',
    body: 'Consistent sleep of roughly seven to nine hours a night supports healthy expression of genes involved in immune function, metabolism, and cellular repair. Chronic short sleep, by contrast, is associated with pro-inflammatory gene-expression profiles that accelerate biological ageing.',
  },
];

const FAQS = [
  {
    q: 'What is epigenetics in simple terms?',
    a: 'Epigenetics is the study of changes in gene expression that happen without any change to the underlying DNA sequence. Think of your DNA as the hardware and epigenetics as the software: chemical marks such as DNA methylation switch genes on or off, telling each cell which of its genes to actually use. Diet, exercise, sleep, and stress can all rewrite these marks over time.',
  },
  {
    q: 'What is the Horvath clock?',
    a: 'The Horvath clock is an epigenetic clock introduced by Steve Horvath in 2013. It estimates biological age from patterns of DNA methylation across hundreds of specific sites in the genome. Because it tracks how fast your cells are actually ageing rather than simply how many years have passed, it can differ from your chronological age and is used in longevity research as a biomarker of ageing.',
  },
  {
    q: 'Can lifestyle really change how my genes work?',
    a: 'Yes. While you cannot change your DNA sequence, you can influence which genes are switched on or off through epigenetic marks. Proven interventions such as a Mediterranean diet, high-intensity interval training, and consistent 7–9 hours of sleep are all associated with measurable shifts in gene expression linked to slower biological ageing.',
  },
  {
    q: 'What are telomeres and can telomere shortening be reversed?',
    a: 'Telomeres are protective caps on the ends of your chromosomes that shorten a little each time a cell divides — roughly one percent per year on average. Shorter telomeres are associated with ageing and age-related disease. Research suggests the rate of shortening is partly reversible through lifestyle changes, especially regular exercise combined with stress reduction.',
  },
  {
    q: 'How does BornClock relate to epigenetics and longevity?',
    a: 'BornClock measures eight epigenetically-relevant lifestyle factors — the everyday inputs, like diet quality, exercise, and sleep, that research links to gene expression and biological ageing — and translates them into a longevity estimate. It is an educational, lifestyle-based tool for reflection, not a clinical epigenetic test.',
  },
];

export function EpigeneticsArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Epigenetics and Longevity — How Lifestyle Rewrites Your Genes',
    description: 'Epigenetics and longevity — how diet, exercise and sleep change gene expression. The Horvath clock, telomeres, and 3 proven interventions.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/epigenetics-and-longevity/',
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
      <SEO
        title="Epigenetics and Longevity — How Lifestyle Rewrites Genes | BornClock"
        description="Epigenetics and longevity — how diet, exercise and sleep change gene expression. The Horvath clock, telomeres, and 3 proven interventions."
        canonicalUrl="/articles/epigenetics-and-longevity"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="epigenetics-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Epigenetics and Longevity — How Lifestyle Rewrites Your Genes
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            For most of the twentieth century, DNA was treated as destiny: the genes you
            inherited were the genes you were stuck with. <strong>Epigenetics</strong> has
            rewritten that story. Epigenetics is the study of changes in gene expression that
            occur <em>without</em> any change to the underlying DNA sequence itself. Your DNA is
            the hardware; epigenetic marks are the software layer that decides which genes each
            cell actually switches on — and that software can be edited by how you live.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            This matters enormously for longevity. The way you eat, move, sleep, and manage
            stress leaves chemical marks on your genome that speed up or slow down biological
            ageing. Below we cover the science of the Horvath clock, telomere shortening, and
            three lifestyle interventions with genuine evidence behind them.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Horvath Clock: Measuring Biological Age</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            In 2013, geneticist Steve Horvath introduced what is now called the
            <strong> Horvath clock</strong> — an epigenetic clock that estimates biological age
            from patterns of <strong>DNA methylation</strong> across hundreds of specific sites
            in the genome. Methylation is one of the best-understood epigenetic marks: small
            chemical tags that attach to DNA and quiet or activate nearby genes.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The Horvath clock's power is that it tracks how fast your cells are actually
            ageing, not simply how many birthdays have passed. Someone can be 45
            chronologically but show a biological age of 40 — or 52 — depending on lifestyle
            and health. This gap between chronological and biological age is the number
            longevity research is most interested in shrinking.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Telomeres and the Pace of Ageing</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            A second key marker of ageing is the <strong>telomere</strong> — a protective cap on
            the end of each chromosome. Telomeres shorten a little every time a cell divides, on
            average around <strong>one percent per year</strong>. As they wear down, cells lose
            the ability to divide safely, contributing to ageing and age-related disease. The
            encouraging finding is that telomere shortening is partly
            <strong> reversible</strong>: studies link regular exercise combined with stress
            reduction to a slower rate of telomere loss.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">3 Proven Interventions That Rewrite Gene Expression</h2>
          {INTERVENTIONS.map((it, i) => (
            <section key={it.title} className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-2">{i + 1}. {it.title}</h3>
              <p className="text-gray-700 leading-relaxed">{it.body}</p>
            </section>
          ))}

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 my-8">
            <h3 className="text-lg font-black text-emerald-900 mb-2">
              BornClock measures 8 epigenetically-relevant lifestyle factors
            </h3>
            <p className="text-sm text-emerald-800 leading-relaxed mb-4">
              You cannot rewrite your DNA sequence — but you can influence the lifestyle inputs
              that shape gene expression and biological age. BornClock's longevity calculator
              measures eight epigenetically-relevant lifestyle factors and turns them into a
              personalised estimate of how your habits are shaping your ageing.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-emerald-600 text-white font-bold px-5 py-2.5
                          rounded-full text-sm hover:bg-emerald-700 transition-colors">
              Try the free longevity calculator →
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
          <ul className="list-disc pl-6 text-emerald-700 mb-10 space-y-1">
            <li><a href="/articles/biological-age-vs-chronological-age" className="hover:underline">Biological Age vs Chronological Age — What's the Difference?</a></li>
            <li><a href="/articles/how-to-live-to-100" className="hover:underline">How to Live to 100 — Habits of the World's Longest-Lived People</a></li>
          </ul>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">See How Your Lifestyle Shapes Your Longevity</h2>
            <p className="text-emerald-100 mb-6">
              Your genes are not your destiny. Measure the eight lifestyle factors that
              influence your biological age with BornClock's free longevity calculator.
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-emerald-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-emerald-50 transition-colors">
              Calculate My Longevity Free →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default EpigeneticsArticle;
