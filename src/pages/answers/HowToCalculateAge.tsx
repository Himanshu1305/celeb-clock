import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function HowToCalculateAge() {
  return (
    <>
      <SEO
        title="How to Calculate Your Exact Age in Years, Months, Days and Seconds | BornClock"
        description="Calculate your exact age right now — in years, months, days, hours, minutes and seconds. Updated live every second. Also find your generation and birthday twin."
        canonicalUrl="/answers/how-to-calculate-age"
        ogType="article"
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">How to calculate age</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">How to Calculate Your Exact Age in Years, Months, Days and Seconds</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your exact age is the difference between your date of birth and the current date and time, expressed in years, months, days, hours, minutes, and seconds. It updates every second. BornClock calculates this live and also shows your total days lived, generation, and which celebrities share your birthday.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">The Formula for Exact Age Calculation</h2>
            <p>Simple year subtraction gives an approximate answer but misses crucial detail. A proper exact age calculation requires:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Start with the total elapsed milliseconds: <code>now.getTime() - birthDate.getTime()</code></li>
              <li>Derive total seconds, minutes, hours, and days from this single source of truth</li>
              <li>Calculate calendar-based years, months, and remaining days separately</li>
              <li>Account for whether the birthday has occurred yet this calendar year</li>
            </ol>

            <h2 className="text-xl font-bold text-gray-900">Why Simple Subtraction Isn't Enough</h2>
            <p><strong>Months have different lengths.</strong> February has 28 or 29 days; other months have 30 or 31. Subtracting months directly creates inconsistencies — "one month from January 31" cannot simply be "February 31."</p>
            <p><strong>Leap years.</strong> Every 4 years (with exceptions for century years), February gains a day. Someone born on February 29 technically only has a birthday every 4 years in strict terms. For practical age calculation, February 28 is used as the birthday in non-leap years.</p>
            <p><strong>Time zones.</strong> If your birth time is recorded in one time zone and you're now in another, the precise moment of birth needs timezone-adjusted comparison to get hours and seconds right. BornClock uses your browser's local time zone automatically.</p>

            <h2 className="text-xl font-bold text-gray-900">Interesting Age Milestones</h2>
            <p>Some age milestones to look forward to (or look back on):</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>1 billion seconds old:</strong> approximately 31 years, 251 days. This is a milestone many longevity enthusiasts celebrate.</li>
              <li><strong>10,000 days old:</strong> approximately 27 years, 4 months. Used as a milestone by the 10,000 days movement.</li>
              <li><strong>1 billion heartbeats:</strong> at a resting rate of 70 bpm, this takes about 27 years — a sobering measure of cardiac reserve.</li>
              <li><strong>100 million minutes:</strong> approximately 190 years — no human has reached this milestone.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900">What Your Total Seconds Lived Means</h2>
            <p>A person who lives to 80 will have experienced approximately 2.52 billion seconds. Every second is a finite resource — which is part of what makes seeing it tick in real time so viscerally motivating. BornClock's age calculator shows all these totals live, updating every second.</p>
            <p>The total days lived is perhaps the most useful metric: it's easily comparable across people, doesn't depend on time zones, and maps intuitively to "how many more days might I have." A 35-year-old has lived approximately 12,775 days.</p>

            <h2 className="text-xl font-bold text-gray-900">How BornClock Calculates It</h2>
            <p>BornClock's age calculator runs entirely in your browser — no date of birth is sent to any server. The calculation runs every second via a JavaScript interval, using your browser's local clock. All sub-day values (hours, minutes, seconds) are derived from the total elapsed milliseconds to ensure they always stay in sync. The years, months, and remaining days use calendar logic that correctly handles month-length variation and leap years.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Calculate My Exact Age Right Now</p>
            <p className="text-sm text-gray-500 mb-4">Live countdown · Seconds · Generations · Celebrity twins</p>
            <Link to="/age-calculator"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Calculate My Exact Age Right Now →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/what-generation-am-i" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What generation am I?</Link>
              <Link to="/answers/how-old-am-i-on-mars" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How old am I on Mars?</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ Who shares my birthday?</Link>
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my zodiac sign?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
