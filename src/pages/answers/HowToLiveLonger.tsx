import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function HowToLiveLonger() {
  return (
    <>
      <SEO
        title="How to Live Longer: What Science Actually Says | BornClock"
        description="The science of longevity in plain language. 7 evidence-based habits that add years to your life — backed by Blue Zone research, Harvard studies, and WHO data."
        canonicalUrl="/answers/how-to-live-longer"
        ogType="article"
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">How to live longer</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">How to Live Longer: What Science Actually Says</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              The most powerful longevity interventions are not drugs or supplements — they are behaviours. Not smoking, regular physical activity, a plant-rich diet, healthy body weight, moderate alcohol, quality sleep, and strong social connections together can add 10–14 years to life expectancy compared to having none of these habits.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">The Harvard Study: 5 Habits Add 14 Years</h2>
            <p>A 2018 Harvard T.H. Chan School of Public Health study followed 123,000 participants over 34 years and found that five low-risk lifestyle factors, adopted by age 50, extended life expectancy by 14.0 years for women and 12.2 years for men compared to people who adopted none:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Never smoking</li>
              <li>BMI between 18.5–24.9</li>
              <li>≥30 minutes/day of moderate-to-vigorous exercise</li>
              <li>Moderate alcohol intake</li>
              <li>Healthy diet (top 40% diet quality score)</li>
            </ol>
            <p>Critically, these behaviours are all free and available to almost everyone. No supplements, no medical procedures — just sustained habit change.</p>

            <h2 className="text-xl font-bold text-gray-900">Blue Zones: Where People Actually Live Longest</h2>
            <p>Dan Buettner's 20-year Blue Zones research project identified 5 regions where people live measurably longer and healthier than anywhere else: Okinawa (Japan), Sardinia (Italy), Nicoya (Costa Rica), Ikaria (Greece), and Loma Linda (California). The common factors — known as the <strong>Power 9</strong> — are not calorie-counting or gym memberships, but community structures that make healthy choices the path of least resistance.</p>

            <h2 className="text-xl font-bold text-gray-900">The Top 7 Science-Backed Habits</h2>
            <p><strong>1. Don't smoke (or quit).</strong> The single highest-impact modifiable factor. Heavy smokers lose 10–12 years on average. Quitting before 40 recovers ~90% of those years. Even quitting at 60 adds 3–4 years.</p>
            <p><strong>2. Move naturally every day.</strong> Blue Zone centenarians don't "exercise" — they garden, walk to friends' homes, and do household chores. 8,000–10,000 steps/day is associated with a 51% lower risk of all-cause mortality vs. 4,000 steps.</p>
            <p><strong>3. Eat mostly plants.</strong> Beans are the longevity superfood — every cup consumed daily is associated with 4 additional years of life expectancy. Centenarians eat meat on average 5 times per month, not 5 times per week.</p>
            <p><strong>4. Sleep 7–9 hours.</strong> Both too little (&lt;6 hrs) and too much (&gt;9 hrs) are associated with higher mortality. The sweet spot is 7–9 hours of quality, consistent sleep. Chronic sleep deprivation accelerates cellular aging.</p>
            <p><strong>5. Manage stress actively.</strong> Chronic stress is not just psychological — it shortens telomeres, raises inflammation, and suppresses immune function. Adventists pray, Okinawans honour their ancestors, Ikarians nap. Find your ritual.</p>
            <p><strong>6. Invest in social connection.</strong> The Harvard Study of Adult Development (85 years, 2,000+ participants) found that the quality of close relationships at midlife was the single strongest predictor of health at 80. Strong social connections reduce mortality risk by 50%.</p>
            <p><strong>7. Find purpose.</strong> Okinawans call it <em>ikigai</em> — "why I wake up in the morning." People with a strong sense of purpose live an average of 7 years longer (Mayo Clinic, 2019). Having something to live <em>for</em> keeps you alive longer.</p>

            <h2 className="text-xl font-bold text-gray-900">What Doesn't Work</h2>
            <p>Most supplements sold for longevity lack meaningful clinical evidence. Resveratrol (the red wine supplement) failed to extend life in clinical trials. NAD+ precursors show promise in animal models but limited human data. Anti-aging skincare has no measurable effect on lifespan. The longevity supplement industry is a $50B market largely built on wishful thinking.</p>
            <p>The evidence overwhelmingly points to behaviour, not biology-hacking, as the dominant driver of longevity outcomes.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Calculate How Your Habits Affect Your Lifespan</p>
            <p className="text-sm text-gray-500 mb-4">See the exact year-impact of every lifestyle change with BornClock's What-If Simulator</p>
            <Link to="/life-expectancy"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate My Longevity Score →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-long-will-i-live" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How long will I live?</Link>
              <Link to="/answers/what-is-my-biological-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my biological age?</Link>
              <Link to="/answers/how-does-stress-affect-life-expectancy" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How does stress affect life expectancy?</Link>
              <Link to="/answers/what-is-bmi" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is BMI?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
