import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function WhatIsBMI() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "What is BMI?", "item": "https://bornclock.com/answers/what-is-bmi" } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "What Is BMI and What Does Your Number Actually Mean?", "description": "BMI (Body Mass Index) explained: how to calculate it, what the ranges mean, and why waist-to-height ratio is actually a better predictor of health. Calculate yours free.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-06-17", "dateModified": "2026-06-17", "mainEntityOfPage": "https://bornclock.com/answers/what-is-bmi" };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is BMI?", "acceptedAnswer": { "@type": "Answer", "text": "BMI (Body Mass Index) is calculated by dividing your weight in kilograms by your height in metres squared. A BMI of 18.5–24.9 is healthy, 25–29.9 is overweight, and 30+ is obese." } },
      { "@type": "Question", "name": "How do I calculate my BMI?", "acceptedAnswer": { "@type": "Answer", "text": "BMI = weight (kg) ÷ height (m)². Example: 75 kg ÷ (1.75 m × 1.75 m) = 24.5, which is healthy weight." } },
      { "@type": "Question", "name": "Is BMI accurate?", "acceptedAnswer": { "@type": "Answer", "text": "BMI has significant limitations — it doesn't distinguish muscle from fat, doesn't account for fat distribution, and has different risk thresholds for different ethnicities (South Asians develop metabolic risk at lower BMIs). Waist-to-height ratio is a better predictor of cardiovascular risk." } },
      { "@type": "Question", "name": "How does BMI affect life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "A BMI of 30–35 is associated with a 2–4 year reduction in life expectancy. Severe obesity (BMI 40+) can reduce life expectancy by 8–10 years. However, fitness level significantly modifies these risk estimates." } }
    ]
  };

  return (
    <>
      <SEO
        title="What Is BMI and What Does Your Number Actually Mean? | BornClock"
        description="BMI (Body Mass Index) explained: how to calculate it, what the ranges mean, and why waist-to-height ratio is actually a better predictor of health. Calculate yours free."
        canonicalUrl="/answers/what-is-bmi"
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
            <span className="text-gray-600">What is BMI?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is BMI and What Does Your Number Actually Mean?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              BMI (Body Mass Index) is calculated by dividing your weight in kilograms by your height in metres squared (kg/m²). A BMI of 18.5–24.9 is considered healthy, 25–29.9 is overweight, and 30+ is obese. However, BMI does not measure body fat directly and can be misleading for athletes and older adults.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">The BMI Formula</h2>
            <p><strong>BMI = weight (kg) ÷ height (m)²</strong></p>
            <p>Example: A person weighing 75 kg and standing 1.75 m tall has a BMI of 75 ÷ (1.75 × 1.75) = 75 ÷ 3.0625 = <strong>24.5</strong> (healthy weight).</p>
            <p>In imperial units: BMI = (weight in pounds × 703) ÷ (height in inches)². The formula was developed by Belgian statistician Adolphe Quetelet in the 1830s — originally as a population-level measure, never intended for individual health diagnosis.</p>

            <h2 className="text-xl font-bold text-gray-900">The 4 BMI Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="text-left p-3 border border-gray-200">Category</th>
                    <th className="text-left p-3 border border-gray-200">BMI Range</th>
                    <th className="text-left p-3 border border-gray-200">Health Implication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-3 border border-gray-200">Underweight</td><td className="p-3 border border-gray-200">&lt; 18.5</td><td className="p-3 border border-gray-200">Increased risk of nutritional deficiency, bone loss, immune weakness</td></tr>
                  <tr className="bg-gray-50"><td className="p-3 border border-gray-200">Healthy Weight</td><td className="p-3 border border-gray-200">18.5–24.9</td><td className="p-3 border border-gray-200">Lowest all-cause mortality risk</td></tr>
                  <tr><td className="p-3 border border-gray-200">Overweight</td><td className="p-3 border border-gray-200">25–29.9</td><td className="p-3 border border-gray-200">Moderately elevated cardiovascular and metabolic risk</td></tr>
                  <tr className="bg-gray-50"><td className="p-3 border border-gray-200">Obese</td><td className="p-3 border border-gray-200">≥ 30</td><td className="p-3 border border-gray-200">Significantly elevated risk of type 2 diabetes, heart disease, certain cancers</td></tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-gray-900">BMI Limitations</h2>
            <p><strong>It doesn't distinguish muscle from fat.</strong> A bodybuilder with 10% body fat and 100 kg of muscle mass may have a BMI of 32 — classified as obese despite having exceptional health. Conversely, a "skinny fat" person with a BMI of 22 but high visceral fat percentage may have elevated metabolic risk.</p>
            <p><strong>It doesn't account for fat distribution.</strong> Where you carry fat matters enormously. Abdominal (visceral) fat surrounding organs is far more dangerous than subcutaneous fat on hips and thighs. Two people with the same BMI can have very different cardiovascular risk profiles based on fat distribution.</p>
            <p><strong>It varies by ethnicity.</strong> Research shows that South Asians (including Indians) develop metabolic complications at lower BMIs than European populations. The WHO recommends lower BMI thresholds for Asian populations: overweight at 23+, obese at 27.5+.</p>
            <p><strong>It's less useful at older ages.</strong> After 65, slightly higher BMI (25–27) is associated with lower mortality — the "obesity paradox" in the elderly.</p>

            <h2 className="text-xl font-bold text-gray-900">Better Metrics: Waist-to-Height Ratio</h2>
            <p>Waist-to-height ratio (WHtR) is a stronger predictor of cardiovascular risk and metabolic syndrome than BMI. The formula: <strong>waist circumference ÷ height</strong>. A ratio below 0.5 is healthy — meaning your waist should be less than half your height. This measure captures abdominal fat distribution that BMI misses entirely.</p>
            <p>BornClock's biological age assessment uses both BMI and waist circumference (via WHO waist risk thresholds) to give a more accurate picture than BMI alone.</p>

            <h2 className="text-xl font-bold text-gray-900">How BMI Affects Life Expectancy</h2>
            <p>A BMI of 30–35 is associated with a 2–4 year reduction in life expectancy. Severe obesity (BMI 40+) can reduce life expectancy by 8–10 years. However, the risks are not linear — moderate obesity (BMI 30–35) in physically active individuals with no other metabolic risk factors carries lower risk than sedentary individuals at a "healthy" BMI. Fitness level modifies BMI risk substantially.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Test Your Biological Age Including BMI and WHtR</p>
            <p className="text-sm text-gray-500 mb-4">12-biomarker assessment · WHO-validated · 3 minutes</p>
            <Link to="/biological-age"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Test My Biological Age →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/what-is-my-biological-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my biological age?</Link>
              <Link to="/answers/how-to-live-longer" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to live longer</Link>
              <Link to="/answers/how-long-will-i-live" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How long will I live?</Link>
              <Link to="/answers/how-does-stress-affect-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How stress affects life expectancy</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
