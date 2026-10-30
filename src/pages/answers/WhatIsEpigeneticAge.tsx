import { Link } from '@/components/seo/CanonicalLink';
import { PageFAQ } from '@/components/PageFAQ';
import { faqItemsFromSchema } from '@/lib/seo/faqFromSchema';
import { SEO } from '@/components/SEO';
import { ArticleLayout } from '@/components/central';

const CANONICAL = 'https://bornclock.com/answers/what-is-epigenetic-age';

const CLOCKS = [
  ['Horvath Clock (2013)', 'The original, trained on 51 tissue types. Measures accumulated biological aging across most cell types in the body.'],
  ['Hannum Clock (2013)', 'Developed simultaneously and independently. Trained specifically on blood samples; slightly better for blood-based aging estimates.'],
  ['PhenoAge Clock (2018)', 'Developed by Morgan Levine. Combines methylation data with clinical biomarkers and is better at predicting age-related diseases and mortality than the original Horvath clock.'],
  ['DunedinPACE Clock (2022)', "Currently considered the gold standard for tracking lifestyle interventions. Rather than measuring accumulated aging, it measures the pace of aging right now — how fast you're aging per calendar year. A score above 1.0 means you're aging faster than one year per year; below 1.0 means you're aging more slowly. This makes it particularly useful for seeing whether lifestyle changes are actually working."],
];

const RELATED = [
  { path: '/biological-age/', label: 'Biological Age Calculator' },
  { path: '/life-expectancy/', label: 'Life Expectancy Calculator' },
  { path: '/coach/', label: 'Longevity Coach' },
  { path: '/biological-age-vs-chronological-age/', label: 'Biological vs Chronological Age' },
];

// Batch 9b honesty pass — sources opened via PubMed (29 Oct 2026):
//  - Fitzgerald KN et al. Aging (Albany NY) 2021;13(7):9419-9432, doi:10.18632/aging.202913 —
//    pilot RCT, 43 healthy men aged 50-72, 8 weeks, 3.23-year lower Horvath DNAmAge vs controls;
//    "Larger-scale and longer duration clinical trials are needed to confirm these findings."
//  - Chen BH et al. Aging (Albany NY) 2016;8(9):1844-1865, doi:10.18632/aging.101020 — meta-analysis,
//    13 cohorts, 13,089 people; epigenetic age acceleration predicted all-cause mortality independent
//    of chronological age and traditional risk factors. (The old "more accurate than 14 biomarkers
//    combined" claim is NOT in that paper and was removed, as was an unsourced 2020 caregiver study.)
export default function WhatIsEpigeneticAge() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is epigenetic age?", "item": CANONICAL } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is Epigenetic Age — and Why It's the Most Honest Number About How You're Aging", "description": "Epigenetic age estimates biological aging from DNA methylation. Here's how it works, what it predicts, and what early research says about changing it.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-08-06", "dateModified": "2026-08-06", "mainEntityOfPage": CANONICAL };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How is epigenetic age different from biological age?", "acceptedAnswer": { "@type": "Answer", "text": "Epigenetic age is one specific laboratory method of estimating biological age — one of the most studied. Biological age is the broader concept; epigenetic age is the DNA methylation-based measurement of that concept." } },
      { "@type": "Question", "name": "How do I find out my epigenetic age?", "acceptedAnswer": { "@type": "Answer", "text": "Epigenetic age needs a laboratory test of a blood or saliva sample, sold by some private companies. BornClock's free biological age calculator is different: it gives a lifestyle- and fitness-based estimate from 15 questions and does not measure epigenetic age." } },
      { "@type": "Question", "name": "Is epigenetic aging reversible?", "acceptedAnswer": { "@type": "Answer", "text": "Possibly, but the evidence is still early. A small 2021 pilot randomized trial (Fitzgerald et al., Aging; 43 healthy men aged 50–72) found an 8-week diet and lifestyle programme was associated with a 3.23-year lower Horvath epigenetic age than the control group. The authors say larger and longer trials are needed to confirm it, so treat it as a promising early result, not proof." } },
      { "@type": "Question", "name": "Can stress change your epigenetic age?", "acceptedAnswer": { "@type": "Answer", "text": "Chronic psychological stress has been associated with faster epigenetic ageing in observational studies. That is an association, not proof that stress causes it or that reducing stress lowers your epigenetic age." } }
    ]
  };

  return (
    <ArticleLayout
      theme="science"
      testId="answer-what-is-epigenetic-age"
      seo={(
        <SEO
          title="What Is Epigenetic Age? The Science of Biological Aging | BornClock"
          description="Epigenetic age estimates biological aging from DNA methylation. Here's how it works, what it predicts, and what early research says about changing it."
          canonicalUrl="/answers/what-is-epigenetic-age"
          ogType="article"
          articleSchema={false}
        />
      )}
      breadcrumb={{ trail: [{ label: 'Answers', to: '/answers/' }], current: 'What is epigenetic age?' }}
      eyebrow="Answers"
      h1={<>What Is Epigenetic Age — and Why It's the Most Honest Number About How You're Aging</>}
      lead={<>Know your time. Live it well.</>}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-[#2F6FB0]/10 border-l-4 border-[#2F6FB0]/30 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-[#2F6FB0] leading-relaxed">
              Epigenetic age is a measure of biological aging based on DNA methylation — chemical changes to your DNA that accumulate in predictable patterns as you age. It was pioneered by UCLA geneticist Steve Horvath in 2013 and is one of the most studied laboratory ways to estimate biological aging at a cellular level. Your chronological age only moves forward; small early trials suggest an epigenetic age estimate may move down as well, but larger trials have not yet confirmed this.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">A useful way to think about it</h2>
            <p>Think of your DNA sequence as a computer's hardware — the fixed physical architecture you were born with. The epigenome is the software: it decides which programs (genes) actually run, when they run, and at what intensity. The hardware doesn't change much over a lifetime. The software changes constantly — shaped by what you eat, how you sleep, how much you move, what you're exposed to, and how much stress you carry.</p>
            <p>DNA methylation is one of the most studied of these software changes. It involves the attachment of small chemical tags — methyl groups — to specific locations on the DNA strand. As you age, the pattern of methylation at thousands of specific sites across your genome shifts in ways that scientists have now mapped in detail.</p>
            <p>Steve Horvath discovered that by measuring the methylation status at 353 carefully chosen sites, he could estimate a person's biological age with an accuracy of roughly 3–5 years — using only a blood or saliva sample. The clock works across almost every tissue type in the body, which is what made it so significant.</p>

            <h2 className="text-xl font-bold text-gray-900">The major epigenetic clocks</h2>
            {CLOCKS.map(([name, desc]) => (
              <p key={name}><strong>{name}</strong> — {desc}</p>
            ))}

            <h2 className="text-xl font-bold text-gray-900">What epigenetic age predicts</h2>
            <p>Epigenetic age acceleration — when your biological age runs ahead of your chronological age — is associated with: higher all-cause mortality independently of chronological age, increased cardiovascular disease risk, higher cancer risk, faster cognitive decline and earlier dementia onset, and reduced physical capacity and earlier frailty.</p>
            <p>A 2016 meta-analysis in Aging (Chen et al.; 13 cohorts, 13,089 people) found that epigenetic age acceleration predicted all-cause mortality independently of chronological age, even after adjusting for traditional risk factors. That is an association across groups of people; it does not tell any one person how long they will live.</p>

            <h2 className="text-xl font-bold text-gray-900">Can epigenetic age actually go down?</h2>
            <p>Possibly — but the evidence is still early and small.</p>
            <p>A small 2021 pilot randomized trial by Kara Fitzgerald and colleagues (Aging, 2021; 43 healthy men aged 50–72) found that an 8-week programme — diet, sleep, exercise and relaxation guidance plus supplements — was associated with a 3.23-year lower Horvath epigenetic age compared with the control group. The authors say larger and longer trials are needed to confirm the finding.</p>
            <p>Factors consistently associated with lower epigenetic age in large studies: regular vigorous exercise, plant-rich diet, not smoking, quality sleep, and maintaining social connections. Factors associated with higher epigenetic age: smoking, obesity, chronic stress, heavy alcohol use, social isolation, and caregiving stress.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Estimate My Biological Age</p>
            <p className="text-sm text-gray-500 mb-4">Free 15-question lifestyle and fitness estimate · Not a lab test</p>
            <Link to="/biological-age/"
              className="inline-block bg-[#0E2238] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0E2238] transition-colors">
              Estimate my biological age →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Tools</p>
            <div className="space-y-2">
              {RELATED.map((t) => (
                <Link key={t.path} to={t.path} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#2F6FB0]/30 hover:bg-[#2F6FB0]/10 transition-colors text-sm text-gray-700 hover:text-[#2F6FB0]">→ {t.label}</Link>
              ))}
            </div>
          </div>
        </div>
      {/* Batch 10: the FAQPage Q&As are shown on the page (PageFAQ also emits the JSON-LD). */}
      <div className="max-w-2xl mx-auto px-4">
        <PageFAQ title="Common questions" items={faqItemsFromSchema(faqSchema)} />
      </div>
    </ArticleLayout>
  );
}
