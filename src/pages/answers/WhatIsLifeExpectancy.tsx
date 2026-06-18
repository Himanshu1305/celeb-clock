import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function WhatIsLifeExpectancy() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is life expectancy?", "item": "https://bornclock.com/answers/what-is-life-expectancy" } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is Life Expectancy and How Is It Calculated?", "description": "Life expectancy explained: what it means, how it's calculated, why India's is 70.4 years, and how your personal forecast differs from the national average.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-06-17", "dateModified": "2026-06-17", "mainEntityOfPage": "https://bornclock.com/answers/what-is-life-expectancy" };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Life expectancy is a statistical measure of the average number of years a person is expected to live, based on current mortality rates for their age, sex, and country. The global average is 72.8 years (WHO 2023)." } },
      { "@type": "Question", "name": "What is the life expectancy in India?", "acceptedAnswer": { "@type": "Answer", "text": "India's average life expectancy is 70.4 years (WHO 2023), with significant variation by state: Kerala 77.3 years, Uttar Pradesh 65.8 years. Women live approximately 2.5 years longer than men on average." } },
      { "@type": "Question", "name": "How is life expectancy calculated?", "acceptedAnswer": { "@type": "Answer", "text": "Life expectancy is calculated using life tables, which track what proportion of a birth cohort survives to each age based on current mortality rates. The most common type is the period life table, which uses current (not projected) mortality rates." } },
      { "@type": "Question", "name": "Which country has the highest life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Japan has the highest life expectancy at 84.3 years (WHO 2023), followed by Switzerland (83.8) and South Korea (83.7). These countries share features of strong public health systems, traditional plant-rich diets, and active lifestyles." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Is Life Expectancy and How Is It Calculated? | BornClock"
        description="Life expectancy explained: what it means, how it's calculated, why India's is 70.4 years, and how your personal forecast differs from the national average."
        canonicalUrl="/answers/what-is-life-expectancy"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">What is life expectancy?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is Life Expectancy and How Is It Calculated?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Life expectancy is a statistical measure of the average number of years a person is expected to live, based on current mortality rates for their age, sex, and country. The global average is 72.8 years (WHO 2023). India's average is 70.4 years. But your personal life expectancy can differ significantly based on your health and lifestyle.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">How Life Expectancy Is Calculated</h2>
            <p>Demographers use <strong>life tables</strong> to calculate life expectancy. A life table tracks what proportion of a birth cohort survives to each age, based on current age-specific mortality rates. The most common type is the <strong>period life table</strong>, which uses current mortality rates rather than projecting how they'll change in the future.</p>
            <p>This creates an important caveat: period life expectancy is a snapshot of <em>current</em> mortality conditions, not a prediction of how long any specific person will live. A 30-year-old today will benefit from medical advances in the coming decades that current life tables cannot account for. Most longevity researchers believe period life expectancy underestimates actual lifespan for people alive today.</p>
            <p>The alternative, <strong>cohort life expectancy</strong>, follows a birth cohort over time as mortality rates evolve. This is more accurate but takes decades to compute. Projected cohort life expectancy for someone born in 1990 in a high-income country is often 5–10 years higher than their country's current period life expectancy.</p>

            <h2 className="text-xl font-bold text-gray-900">Global Averages by Country (Top 10)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="text-left p-3 border border-gray-200">Rank</th>
                    <th className="text-left p-3 border border-gray-200">Country</th>
                    <th className="text-left p-3 border border-gray-200">Life Expectancy</th>
                  </tr>
                </thead>
                <tbody>
                  {[['1','Japan','84.3'],['2','Switzerland','83.8'],['3','South Korea','83.7'],['4','Australia','83.5'],['5','Spain','83.4'],['6','Singapore','83.1'],['7','Italy','83.1'],['8','Sweden','82.8'],['9','Norway','82.7'],['10','France','82.5']].map(([r,c,l]) => (
                    <tr key={r} className={parseInt(r) % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-3 border border-gray-200">{r}</td>
                      <td className="p-3 border border-gray-200">{c}</td>
                      <td className="p-3 border border-gray-200">{l} years</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 italic">Source: WHO Global Health Observatory 2023. Global average: 72.8 years. India: 70.4 years.</p>

            <h2 className="text-xl font-bold text-gray-900">India-Specific Data</h2>
            <p>India's national average of 70.4 years masks enormous internal variation. Kerala (77.3 years) and Goa (76.7 years) approach Western European levels, while Uttar Pradesh (65.8) and Chhattisgarh (64.2) lag 10+ years behind. This variation is driven by: healthcare access, diet patterns, urban vs rural divide, air quality, sanitation, and literacy levels (which correlate strongly with health outcomes).</p>
            <p>The gender gap in India is 2.5 years — women live longer than men, consistent with the global pattern. However, this gap is narrowing in some states due to improved women's health outcomes and changing patterns of health risk.</p>

            <h2 className="text-xl font-bold text-gray-900">What Has Increased Life Expectancy in History</h2>
            <p>The greatest gains in life expectancy in the 20th century came not from high-tech medicine but from public health infrastructure: clean water, sewage systems, vaccination, and improved nutrition. In 1900, global life expectancy was approximately 31 years — not because most people died young, but because infant and child mortality was catastrophically high. An adult reaching 40 in 1900 could expect to live to 65–70.</p>
            <p>Since 1950, life expectancy has risen by approximately 25 years globally. Antibiotics, vaccines, surgical advances, and cancer treatments drove the post-1950 gains. The next phase — precision medicine, gene therapy, and AI-guided drug discovery — may drive further gains in coming decades.</p>

            <h2 className="text-xl font-bold text-gray-900">Why Your Number Differs From the National Average</h2>
            <p>National averages blend people across the full health spectrum — from heavy smokers and people with multiple chronic diseases to athletes who never smoked and eat plant-based diets. The gap between these groups in life expectancy can be 15–20 years within the same country. BornClock's calculator gives you a personalised forecast that reflects your specific health profile, habits, family history, and community environment.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Calculate My Personal Life Expectancy</p>
            <p className="text-sm text-gray-500 mb-4">Personalised to your habits, country, and family history</p>
            <Link to="/life-expectancy"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate My Personal Life Expectancy →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-long-will-i-live" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How long will I live?</Link>
              <Link to="/answers/how-to-live-longer" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to live longer</Link>
              <Link to="/answers/what-is-my-biological-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my biological age?</Link>
              <Link to="/answers/how-does-stress-affect-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How stress affects life expectancy</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
