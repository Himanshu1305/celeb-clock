import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function HowDoesStressAffectLifeExpectancy() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How does stress affect life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Chronic stress reduces life expectancy by 2–3 years on average through multiple pathways: shortening telomeres (cellular aging), elevating cortisol (cardiovascular damage), suppressing immunity, and increasing inflammation." } },
      { "@type": "Question", "name": "How does stress shorten telomeres?", "acceptedAnswer": { "@type": "Answer", "text": "Chronic psychological stress activates oxidative pathways that damage telomeres — the protective caps on chromosomes. Nobel Prize-winning research showed chronically stressed individuals have measurably shorter telomeres, equivalent to 10+ years of additional biological aging." } },
      { "@type": "Question", "name": "What is the best way to reduce stress for longevity?", "acceptedAnswer": { "@type": "Answer", "text": "The 5 highest-evidence stress reduction techniques are: mindfulness meditation (reduces cortisol measurably), regular exercise, strong social connections, quality sleep (when cortisol naturally drops), and having a sense of purpose." } },
      { "@type": "Question", "name": "Does loneliness affect life expectancy?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Loneliness carries the same mortality risk as smoking 15 cigarettes per day — a 29% higher risk of premature death. The WHO has classified loneliness as a global public health crisis." } }
    ]
  };

  return (
    <>
      <SEO
        title="How Does Stress Affect Life Expectancy? The Science Explained | BornClock"
        description="Chronic stress can reduce life expectancy by up to 2.8 years. Here's how stress damages the body at a cellular level — and 5 science-backed ways to reverse it."
        canonicalUrl="/answers/how-does-stress-affect-life-expectancy"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">How stress affects life expectancy</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">How Does Stress Affect Life Expectancy? The Science Explained</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Chronic stress reduces life expectancy through multiple biological pathways: it shortens telomeres (accelerating cellular aging), raises cortisol (damaging cardiovascular health), suppresses immune function, and increases inflammation. Studies estimate chronic stress reduces life expectancy by 2–3 years on average — more in people with high-stress occupations or trauma histories.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">The Biology of Stress</h2>
            <p><strong>Cortisol:</strong> The primary stress hormone. In acute stress (a physical threat, a near-miss accident), cortisol is adaptive — it mobilises energy, sharpens focus, and prepares you to respond. The problem is chronic activation. When cortisol is elevated for weeks or months, it suppresses immune function, damages the hippocampus (affecting memory and learning), increases blood pressure, raises blood sugar, and accelerates atherosclerosis.</p>
            <p><strong>Telomere shortening:</strong> Telomeres are the protective caps on chromosomes — like the plastic tips on shoelaces. They shorten with each cell division and are a direct measure of cellular aging. Nobel Prize-winning research by Elizabeth Blackburn and colleagues showed that psychological stress is one of the strongest non-genetic predictors of telomere length. Chronically stressed individuals have measurably shorter telomeres — equivalent to 10+ years of additional biological aging.</p>
            <p><strong>Inflammation:</strong> Chronic stress activates pro-inflammatory pathways, particularly the NF-κB pathway. Sustained low-grade inflammation is now recognised as a root cause of most age-related diseases — heart disease, type 2 diabetes, Alzheimer's, and certain cancers. Stressed individuals have chronically elevated inflammatory markers including CRP (C-reactive protein) and IL-6.</p>

            <h2 className="text-xl font-bold text-gray-900">The Whitehall Study: Job Stress and Mortality</h2>
            <p>The Whitehall II Study followed 10,308 British civil servants for 30+ years and found that people in low-control, high-demand jobs had 68% higher odds of developing heart disease than those in high-control positions — independent of other risk factors. Low job control (the "demand-control" stress model) predicted mortality more strongly than salary or grade level.</p>
            <p>This has profound implications: the stress of a difficult commute, a micromanaging boss, financial precarity, or caregiving without adequate support — all of these translate into measurable biological damage over time.</p>

            <h2 className="text-xl font-bold text-gray-900">Different Types of Stress Have Different Effects</h2>
            <p><strong>Acute stress</strong> (short-term, specific stressor): Adaptive and largely harmless to healthy individuals. The stress response evolved for exactly this purpose. Repeated acute stress without sufficient recovery can, however, prime the chronic stress response.</p>
            <p><strong>Chronic stress</strong> (ongoing, unresolved): The dangerous kind. Whether from work pressure, relationship difficulties, financial strain, or unresolved trauma, sustained cortisol elevation drives the biological pathways described above.</p>
            <p><strong>Traumatic stress / PTSD:</strong> Post-traumatic stress disorder is associated with dramatically accelerated biological aging — studies show PTSD patients have biological ages 10–15 years older than controls. The ongoing hyperarousal state maintains chronically elevated cortisol and inflammatory markers.</p>

            <h2 className="text-xl font-bold text-gray-900">5 Evidence-Based Stress Reduction Techniques</h2>
            <p><strong>1. Mindfulness meditation:</strong> A 2013 meta-analysis of 47 randomised trials found mindfulness meditation significantly reduces cortisol, anxiety, and depression. Just 8 weeks of daily 20-minute meditation measurably lengthened telomeres in some studies. Blue Zone centenarians in Loma Linda practise daily prayer with similar physiological benefits.</p>
            <p><strong>2. Exercise:</strong> Physical activity is one of the most potent stress relievers known, activating endorphins, BDNF (brain-derived neurotrophic factor), and reducing cortisol. Even 20–30 minutes of brisk walking measurably reduces anxiety and improves mood for 4–6 hours afterward.</p>
            <p><strong>3. Social connection:</strong> Strong social bonds buffer the biological stress response. Married individuals, people with close friendships, and those embedded in tight communities show lower cortisol responses to the same stressors compared to isolated individuals.</p>
            <p><strong>4. Sleep:</strong> Sleep is when cortisol naturally drops to its lowest point and cellular repair occurs. Chronic sleep deprivation amplifies the cortisol stress response — creating a vicious cycle where stress impairs sleep and poor sleep increases stress reactivity.</p>
            <p><strong>5. Purpose and meaning:</strong> Having a clear sense of purpose buffers against stress-induced biological damage. The Harvard Study of Adult Development found that people with a strong sense of meaning showed more resilient cortisol profiles in response to challenges.</p>

            <h2 className="text-xl font-bold text-gray-900">The Social Stress Factor</h2>
            <p>Loneliness is now classified as a major public health crisis by the WHO. It activates the same biological stress pathways as physical pain — the brain treats social exclusion as a survival threat. Chronically lonely individuals have elevated cortisol, shortened telomeres, and a 29% higher mortality risk. Connection is not a luxury — it is a biological necessity with measurable longevity consequences.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">See How Stress Affects Your Personal Forecast</p>
            <p className="text-sm text-gray-500 mb-4">Move the stress slider in BornClock's What-If Simulator to see the year-impact in real time</p>
            <Link to="/life-expectancy"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              See Stress Impact on My Lifespan →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-long-will-i-live" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How long will I live?</Link>
              <Link to="/answers/what-is-my-biological-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my biological age?</Link>
              <Link to="/answers/how-to-live-longer" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to live longer</Link>
              <Link to="/answers/what-is-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is life expectancy?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
