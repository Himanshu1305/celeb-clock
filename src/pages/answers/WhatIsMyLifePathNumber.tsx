import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { ArticleLayout } from '@/components/central';

export default function WhatIsMyLifePathNumber() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is my life path number?", "item": "https://bornclock.com/answers/what-is-my-life-path-number" } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is My Life Path Number and What Does It Mean?", "description": "Your Life Path number is calculated from your full date of birth and reveals your core purpose. Calculate yours free and get your 2026 Personal Year forecast.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-06-17", "dateModified": "2026-06-17", "mainEntityOfPage": "https://bornclock.com/answers/what-is-my-life-path-number" };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is my Life Path number?", "acceptedAnswer": { "@type": "Answer", "text": "Your Life Path number is calculated by reducing your full date of birth to a single digit (or master number 11, 22, 33). Reduce your birth month, day and year separately (keeping 11, 22 and 33), add them, then reduce the total to a single digit or master number." } },
      { "@type": "Question", "name": "How do I calculate my Life Path number?", "acceptedAnswer": { "@type": "Answer", "text": "Example: July 14, 1990. Month: 7. Day: 1+4=5. Year: 1+9+9+0=19→1+9=10→1. Total: 7+5+1=13→1+3=4. Life Path 4." } },
      { "@type": "Question", "name": "What do the Life Path numbers mean?", "acceptedAnswer": { "@type": "Answer", "text": "Life Path 1=Leader, 2=Diplomat, 3=Creator, 4=Builder, 5=Explorer, 6=Nurturer, 7=Seeker, 8=Achiever, 9=Humanitarian. Master numbers 11=Intuitive Visionary, 22=Master Builder, 33=Master Teacher." } },
      { "@type": "Question", "name": "What are master numbers in numerology?", "acceptedAnswer": { "@type": "Answer", "text": "Master numbers (11, 22, 33) are not reduced further. They carry amplified energy: 11 is the Intuitive Visionary, 22 is the Master Builder with capacity to manifest grand visions, and 33 is the rare Master Teacher associated with unconditional service." } }
    ]
  };

  return (
    <ArticleLayout
      theme="mystic"
      seo={(
        <SEO
          title="What Is My Life Path Number and What Does It Mean? | BornClock"
          description="Your Life Path number is calculated from your full date of birth and reveals your core purpose. Calculate yours free and get your 2026 Personal Year forecast."
          canonicalUrl="/answers/what-is-my-life-path-number"
          ogType="article"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }], current: 'What is my Life Path number?' }}
      footer={{
        tagline: 'Your Life Path number reduces your full date of birth to reveal your core purpose.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Numerology', to: '/numerology' },
          { label: 'Zodiac', to: '/zodiac' },
          { label: 'Compatibility', to: '/compatibility' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Answers"
      h1="What Is My Life Path Number and What Does It Mean?"
      lead={(
        <>
          Your Life Path number is calculated by reducing your full date of birth to a single digit (or master number 11, 22, 33). It represents your core purpose, the challenges you're here to master, and the strengths you were born with. It is the most important number in numerology.
        </>
      )}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="section">
          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">How to Calculate Your Life Path Number</h2>
            <p>The Pythagorean method reduces the month, day and year of your birth separately (keeping master numbers 11, 22 and 33), adds them, and reduces the total. Example: <strong>July 14, 1990 = 07/14/1990</strong></p>
            <p>Step 1: Reduce each component: Month: 0+7 = 7 · Day: 1+4 = 5 · Year: 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1</p>
            <p>Step 2: Add the results: 7 + 5 + 1 = 13 → 1+3 = <strong>4</strong></p>
            <p>Note: If at any stage you reach 11, 22, or 33 before reducing further, stop — these are Master Numbers with special significance.</p>

            <h2 className="text-xl font-bold text-gray-900">What Each Life Path Number Means (in one line)</h2>
            <ul className="list-none pl-0 space-y-1" data-testid="answer-number-links">
              {[
                [1, 'The Leader — independent, pioneering'], [2, 'The Diplomat — cooperative, sensitive'],
                [3, 'The Creator — expressive, optimistic'], [4, 'The Builder — practical, disciplined'],
                [5, 'The Explorer — freedom-loving, versatile'], [6, 'The Nurturer — responsible, caring'],
                [7, 'The Seeker — analytical, introspective'], [8, 'The Achiever — ambitious, authoritative'],
                [9, 'The Humanitarian — compassionate, idealistic'], [11, 'Master number — the intuitive visionary'],
                [22, 'Master number — the master builder'], [33, 'Master number — the master teacher'],
              ].map(([n, t]) => (
                <li key={n}><Link to={`/numerology/${n}`} className="text-[#6E5AA6] hover:underline"><strong>{n}</strong> — {t}</Link></li>
              ))}
            </ul>

            <h2 className="text-xl font-bold text-gray-900">Is the Life Path the same as Bhagyank?</h2>
            <p>Almost. The Indian <strong>Bhagyank</strong> adds every digit of your date of birth and reduces to 1–9, so it always ends on the same single digit as your Life Path. The only difference: the Western Life Path keeps 11, 22 and 33 as master numbers, while the Bhagyank reduces them (11 → 2). Your <strong>Mulank</strong> is different again — it uses only your birth day. The <Link to="/articles/numerology-by-date-of-birth" className="text-[#6E5AA6] underline">India guide</Link> explains all three, and the <Link to="/numerology" className="text-[#6E5AA6] underline">numerology calculator</Link> shows them side by side.</p>

            <h2 className="text-xl font-bold text-gray-900">Your Personal Year Number for 2026</h2>
            <p>Your Personal Year number changes every calendar year and reflects the energy theme of the 12 months ahead. Calculate it: <strong>add your birth month + birth day + 2026</strong>, then reduce to a single digit.</p>
            <p>Example: Born July 14 → 7+14+2026 = 2047 → 2+0+4+7 = 13 → 1+3 = 4. Personal Year 4 in 2026 is a year of building foundations, practical effort, and establishing order.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Calculate My Life Path Number</p>
            <p className="text-sm text-gray-500 mb-4">Free · Western Life Path plus your Mulank and Bhagyank, with the working shown</p>
            <Link to="/numerology"
              className="inline-block bg-[#0E2238] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0E2238] transition-colors">
              Calculate My Life Path Number →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#6E5AA6]/30 hover:bg-[#6E5AA6]/10 transition-colors text-sm text-gray-700 hover:text-[#6E5AA6]">→ What is my zodiac sign?</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#6E5AA6]/30 hover:bg-[#6E5AA6]/10 transition-colors text-sm text-gray-700 hover:text-[#6E5AA6]">→ Who shares my birthday?</Link>
              <Link to="/answers/how-to-calculate-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#6E5AA6]/30 hover:bg-[#6E5AA6]/10 transition-colors text-sm text-gray-700 hover:text-[#6E5AA6]">→ How to calculate my exact age</Link>
              <Link to="/answers/what-generation-am-i" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#6E5AA6]/30 hover:bg-[#6E5AA6]/10 transition-colors text-sm text-gray-700 hover:text-[#6E5AA6]">→ What generation am I?</Link>
            </div>
          </div>
      </section>
    </ArticleLayout>
  );
}
