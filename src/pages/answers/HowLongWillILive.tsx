import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function HowLongWillILive() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "How long will I live?", "item": "https://bornclock.com/answers/how-long-will-i-live" } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "How Long Will I Live? A Science-Based Answer", "description": "How long will I live? Science shows life expectancy depends on genetics (25%), lifestyle (75%), country, and habits. Calculate your personal forecast free.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-06-17", "dateModified": "2026-06-17", "mainEntityOfPage": "https://bornclock.com/answers/how-long-will-i-live" };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How long will I live?", "acceptedAnswer": { "@type": "Answer", "text": "The average global life expectancy is 72.8 years (WHO 2023), but your personal forecast depends far more on lifestyle than genetics. Research shows genetics accounts for only 25–30% of longevity — your habits, environment, and choices control the remaining 70–75%." } },
      { "@type": "Question", "name": "What is the average life expectancy in the world?", "acceptedAnswer": { "@type": "Answer", "text": "The global average life expectancy is 72.8 years (WHO 2023). Japan leads with 84.3 years. India's average is 70.4 years. The US average is 77.5 years." } },
      { "@type": "Question", "name": "What factors affect how long I will live?", "acceptedAnswer": { "@type": "Answer", "text": "The biggest factors are: smoking (removes 10–12 years for heavy smokers), physical activity, diet quality, social connections, stress levels, sleep, BMI, blood pressure, and family history. Lifestyle factors account for 70–75% of longevity variation." } },
      { "@type": "Question", "name": "Can I calculate my personal life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. BornClock's Life Expectancy Calculator uses a 5-pillar model covering lifestyle, health metrics, genetics, country baseline, and community environment to give you a personalised forecast that reflects your specific profile." } }
    ]
  };

  return (
    <>
      <SEO
        title="How Long Will I Live? A Science-Based Answer | BornClock"
        description="How long will I live? Science shows life expectancy depends on genetics (25%), lifestyle (75%), country, and habits. Calculate your personal forecast free."
        canonicalUrl="/answers/how-long-will-i-live"
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
            <span className="text-gray-600">How long will I live?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">How Long Will I Live? A Science-Based Answer</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              The average global life expectancy is 72.8 years (WHO 2023), but your personal forecast depends far more on lifestyle than genetics. Research from the Karolinska Institute shows genetics accounts for only 25–30% of longevity — your habits, environment, and choices control the remaining 70–75%.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">Global Life Expectancy Averages</h2>
            <p>Life expectancy varies enormously by country. Japan leads with 84.3 years, followed by Switzerland (83.8), Australia (83.7), and South Korea (83.5). At the other end, several sub-Saharan nations average below 60 years — not because of genetics, but because of healthcare access, nutrition, sanitation, and infectious disease burden.</p>
            <p>India's national average is 70.4 years as of 2023, with wide variation by state: Kerala reaches 77.3 years while Uttar Pradesh averages 65.8. This 11.5-year gap within a single country proves that your address shapes your lifespan almost as much as your genes.</p>

            <h2 className="text-xl font-bold text-gray-900">What Factors Matter Most</h2>
            <p>The largest scientific study on longevity determinants — a 2018 Harvard meta-analysis of 123,000 participants — identified five lifestyle factors that, when combined, add 14 years of life expectancy for women and 12.2 years for men:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Not smoking</strong> — the single highest-impact factor</li>
              <li><strong>Maintaining a healthy BMI</strong> (18.5–24.9)</li>
              <li><strong>Moderate-to-vigorous exercise</strong> (30+ minutes/day)</li>
              <li><strong>Moderate alcohol consumption</strong> (or none)</li>
              <li><strong>High diet quality</strong> (plant-rich, low ultra-processed)</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900">The 5 Biggest Modifiable Risks</h2>
            <p><strong>1. Smoking:</strong> Heavy smokers lose 10–12 years on average. Even light smoking (fewer than 5 cigarettes/day) removes 3–5 years. Quitting before 40 recovers 90% of lost years.</p>
            <p><strong>2. Physical inactivity:</strong> A sedentary lifestyle is associated with a 20–30% higher all-cause mortality risk. Just 30 minutes of brisk walking daily reduces this risk substantially.</p>
            <p><strong>3. Poor diet:</strong> High consumption of processed meat, refined carbohydrates, and ultra-processed foods is linked to a 3–4 year reduction in life expectancy. A Mediterranean-pattern diet confers the opposite effect.</p>
            <p><strong>4. Social isolation:</strong> Loneliness is now classified by the WHO as a global health threat. It carries the same mortality risk as smoking 15 cigarettes a day — roughly a 29% increased risk of premature death.</p>
            <p><strong>5. Chronic stress:</strong> Prolonged cortisol elevation shortens telomeres, accelerates cellular aging, and raises cardiovascular risk. High-stress occupations are associated with 2–3 fewer years of life.</p>

            <h2 className="text-xl font-bold text-gray-900">Why Your Number Will Differ From Average</h2>
            <p>National averages are period life tables — they calculate how long someone born today would live <em>if mortality rates stayed constant</em>. They don't account for your personal health profile, family history, or the medical advances likely in coming decades. A 35-year-old today will benefit from healthcare that doesn't yet exist.</p>
            <p>More importantly, averages blend people with very different health behaviours. Someone who never smoked, exercises regularly, eats well, and has strong social connections can expect to live 10–15 years longer than a peer who does none of these things — regardless of the national average.</p>

            <h2 className="text-xl font-bold text-gray-900">How BornClock Calculates Your Forecast</h2>
            <p>BornClock's Life Expectancy Calculator uses a 5-pillar model: baseline country data, lifestyle factors (smoking, diet, exercise, sleep, stress, alcohol), health metrics (BMI, blood pressure, diabetes status), genetic blueprint (family longevity history), and community environment (social connections, Blue Zone habits). The model is informed by data from WHO, CDC, Harvard, and the Blue Zones research of Dan Buettner.</p>
            <p>The result is a personalised forecast that reflects <em>you</em> — not the average person in your country.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Get Your Personal Life Expectancy Forecast</p>
            <p className="text-sm text-gray-500 mb-4">8-step calculator · 5-pillar model · Takes 4 minutes</p>
            <Link to="/life-expectancy"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate My Life Expectancy →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-to-live-longer" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to live longer: what science actually says</Link>
              <Link to="/answers/what-is-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is life expectancy and how is it calculated?</Link>
              <Link to="/answers/how-does-stress-affect-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How does stress affect life expectancy?</Link>
              <Link to="/answers/what-is-my-biological-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my biological age?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
