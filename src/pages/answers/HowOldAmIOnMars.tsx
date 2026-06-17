import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function HowOldAmIOnMars() {
  return (
    <>
      <SEO
        title="How Old Am I on Mars and Other Planets? | BornClock"
        description="Calculate your age on Mars, Jupiter, Saturn and all 8 planets using real NASA orbital data. A 30-year-old on Earth is only 15.9 on Mars."
        canonicalUrl="/answers/how-old-am-i-on-mars"
        ogType="article"
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">How old am I on Mars?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">How Old Am I on Mars and Other Planets?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your age on another planet is calculated by dividing your age in Earth days by that planet's orbital period. A 30-year-old on Earth is 15.9 years old on Mars (which takes 687 Earth days to orbit the Sun), 2.5 on Jupiter, and just 0.1 on Neptune — which takes 165 Earth years to complete one orbit.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">How Planetary Age Works</h2>
            <p>A "year" on any planet is the time it takes to complete one full orbit around the Sun. Earth takes 365.25 days. Mars takes 686.97 Earth days — roughly 1.88 Earth years. So if you're 30 on Earth, you've only experienced 15.9 Martian orbits around the Sun.</p>
            <p>This isn't just a fun thought experiment. Understanding planetary orbital periods is foundational to space mission planning, satellite deployment, and eventually, how we'll track time when humans live on other worlds. Future Martian colonists will almost certainly celebrate birthdays on a different timescale.</p>

            <h2 className="text-xl font-bold text-gray-900">The Math Behind It</h2>
            <p>The formula is simple: <strong>Planetary Age = (Earth Age in days) ÷ (Planet's orbital period in Earth days)</strong></p>
            <p>First convert your Earth age to days: Age × 365.25. Then divide by the planet's orbital period. BornClock uses NASA's official orbital period data for precision.</p>

            <h2 className="text-xl font-bold text-gray-900">All 8 Planets: What a 30-Year-Old Would Be</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="text-left p-3 border border-gray-200">Planet</th>
                    <th className="text-left p-3 border border-gray-200">Orbital Period</th>
                    <th className="text-left p-3 border border-gray-200">Age if 30 on Earth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-3 border border-gray-200">Mercury</td><td className="p-3 border border-gray-200">88 Earth days</td><td className="p-3 border border-gray-200">124.5 years</td></tr>
                  <tr className="bg-gray-50"><td className="p-3 border border-gray-200">Venus</td><td className="p-3 border border-gray-200">225 Earth days</td><td className="p-3 border border-gray-200">48.7 years</td></tr>
                  <tr><td className="p-3 border border-gray-200">Earth</td><td className="p-3 border border-gray-200">365.25 Earth days</td><td className="p-3 border border-gray-200">30 years</td></tr>
                  <tr className="bg-gray-50"><td className="p-3 border border-gray-200">Mars</td><td className="p-3 border border-gray-200">687 Earth days</td><td className="p-3 border border-gray-200">15.9 years</td></tr>
                  <tr><td className="p-3 border border-gray-200">Jupiter</td><td className="p-3 border border-gray-200">4,333 Earth days</td><td className="p-3 border border-gray-200">2.5 years</td></tr>
                  <tr className="bg-gray-50"><td className="p-3 border border-gray-200">Saturn</td><td className="p-3 border border-gray-200">10,759 Earth days</td><td className="p-3 border border-gray-200">1.0 year</td></tr>
                  <tr><td className="p-3 border border-gray-200">Uranus</td><td className="p-3 border border-gray-200">30,687 Earth days</td><td className="p-3 border border-gray-200">0.36 years</td></tr>
                  <tr className="bg-gray-50"><td className="p-3 border border-gray-200">Neptune</td><td className="p-3 border border-gray-200">60,190 Earth days</td><td className="p-3 border border-gray-200">0.18 years</td></tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-gray-900">The Neptune Fact</h2>
            <p>Neptune takes 164.8 Earth years to complete a single orbit. This means that since Neptune was discovered in September 1846, it has completed only one full orbit of the Sun — in August 2011. No human has ever had their first birthday on Neptune. Even the oldest human who ever lived (Jeanne Calment, 122 years) would have experienced only 0.74 Neptunian years.</p>
            <p>On Mercury, by contrast, the situation reverses dramatically. Mercury takes just 88 Earth days per orbit — so a 30-year-old would have celebrated 124 Mercurian birthdays. A person who lived to 80 on Earth would have 332 birthdays on Mercury.</p>

            <h2 className="text-xl font-bold text-gray-900">Why This Matters for Understanding Time</h2>
            <p>Our concept of a "year" is entirely arbitrary — it's just how long Earth takes to orbit the Sun, which happens to be the star closest to us. Time itself doesn't care about that boundary. This realisation is humbling: your "age" is meaningful relative to Earth, but in the broader cosmos, it's a function of your planet's position.</p>
            <p>BornClock's planetary age calculator uses your exact date and time of birth with NASA's orbital data to give you your precise age on all 8 planets plus the Sun and Moon, updated live every second.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">How Old Are You on All 8 Planets?</p>
            <p className="text-sm text-gray-500 mb-4">Live calculation · NASA orbital data · Updates every second</p>
            <Link to="/planetary-age"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate My Planetary Age →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-to-calculate-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to calculate my exact age in seconds</Link>
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my zodiac sign?</Link>
              <Link to="/answers/what-generation-am-i" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What generation am I?</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ Who shares my birthday?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
