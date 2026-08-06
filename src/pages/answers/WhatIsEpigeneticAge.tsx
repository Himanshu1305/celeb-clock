import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { AnswerLayout } from '@/components/AnswerLayout';

const CANONICAL = 'https://bornclock.com/answers/what-is-epigenetic-age';

const CLOCKS = [
  ['Horvath Clock (2013)', 'The original, trained on 51 tissue types. Measures accumulated biological aging across most cell types in the body.'],
  ['Hannum Clock (2013)', 'Developed simultaneously and independently. Trained specifically on blood samples; slightly better for blood-based aging estimates.'],
  ['PhenoAge Clock (2018)', 'Developed by Morgan Levine. Combines methylation data with clinical biomarkers and is better at predicting age-related diseases and mortality than the original Horvath clock.'],
  ['DunedinPACE Clock (2022)', "Currently considered the gold standard for tracking lifestyle interventions. Rather than measuring accumulated aging, it measures the pace of aging right now — how fast you're aging per calendar year. A score above 1.0 means you're aging faster than one year per year; below 1.0 means you're aging more slowly. This makes it particularly useful for seeing whether lifestyle changes are actually working."],
];

const RELATED = [
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/coach', label: 'Longevity Coach' },
  { path: '/biological-age-vs-chronological-age', label: 'Biological vs Chronological Age' },
];

export default function WhatIsEpigeneticAge() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is epigenetic age?", "item": CANONICAL } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is Epigenetic Age — and Why It's the Most Honest Number About How You're Aging", "description": "Epigenetic age measures biological aging at the DNA level — and it can be reduced. Here's how it works, what it predicts, and what the latest research shows.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-08-06", "dateModified": "2026-08-06", "mainEntityOfPage": CANONICAL };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How is epigenetic age different from biological age?", "acceptedAnswer": { "@type": "Answer", "text": "Epigenetic age is one specific method of measuring biological age — currently the most scientifically accurate one available. Biological age is the broader concept; epigenetic age is the DNA methylation-based measurement of that concept." } },
      { "@type": "Question", "name": "How do I find out my epigenetic age?", "acceptedAnswer": { "@type": "Answer", "text": "Commercial tests are available from companies including TruDiagnostic and Elysium Health, typically costing $200–$500 for a blood or saliva sample. BornClock's biological age calculator offers a lifestyle-based estimate using 12 validated biomarkers — less precise, but free and immediately accessible." } },
      { "@type": "Question", "name": "Is epigenetic aging reversible?", "acceptedAnswer": { "@type": "Answer", "text": "The evidence increasingly suggests yes — to a meaningful degree. Multiple intervention studies have found 2–5 year reductions in epigenetic age within weeks to months of lifestyle changes. The DunedinPACE clock can show whether your current pace of aging is actually slowing in response to what you're doing." } },
      { "@type": "Question", "name": "Can stress change your epigenetic age?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — significantly. Chronic psychological stress is one of the most consistent drivers of epigenetic age acceleration. Long-term caregiving stress, in particular, has been associated with measurably faster biological aging in multiple studies." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Is Epigenetic Age? The Science of Biological Aging | BornClock"
        description="Epigenetic age measures biological aging at the DNA level — and it can be reduced. Here's how it works, what it predicts, and what the latest research shows."
        canonicalUrl="/answers/what-is-epigenetic-age"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AnswerLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">What is epigenetic age?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is Epigenetic Age — and Why It's the Most Honest Number About How You're Aging</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Epigenetic age is a measure of biological aging based on DNA methylation — chemical changes to your DNA that accumulate in predictable patterns as you age. It was pioneered by UCLA geneticist Steve Horvath in 2013 and is currently the most scientifically validated way to measure how fast your body is aging at a cellular level. Unlike your chronological age, which only moves forward, epigenetic age can — with the right interventions — actually go down.
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
            <p>A 2016 study in Aging found that epigenetic age acceleration predicted time to death more accurately than 14 other established biomarkers combined. That's not a small finding.</p>

            <h2 className="text-xl font-bold text-gray-900">Can epigenetic age actually go down?</h2>
            <p>Yes — and this is where the research gets genuinely exciting.</p>
            <p>A 2021 randomized controlled trial by researcher Kara Fitzgerald found that an 8-week diet and lifestyle intervention — involving a specific plant-rich diet, targeted supplementation, exercise, sleep optimization, and stress management — reduced epigenetic age by an average of 3.23 years compared to the control group. The intervention group got measurably biologically younger. The control group got older.</p>
            <p>Factors consistently associated with lower epigenetic age in large studies: regular vigorous exercise, plant-rich diet, not smoking, quality sleep, and maintaining social connections. Factors associated with higher epigenetic age: smoking, obesity, chronic stress, heavy alcohol use, social isolation, and caregiving stress. A 2020 study found that people caring for chronically ill spouses showed significantly accelerated epigenetic aging compared to age-matched controls.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Test My Biological Age</p>
            <p className="text-sm text-gray-500 mb-4">12-biomarker assessment · WHO-validated · Takes 3 minutes</p>
            <Link to="/biological-age"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Test my biological age →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Tools</p>
            <div className="space-y-2">
              {RELATED.map((t) => (
                <Link key={t.path} to={t.path} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ {t.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </AnswerLayout>
    </>
  );
}
