import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function WhatIsMyZodiacSign() {
  return (
    <>
      <SEO
        title="What Is My Zodiac Sign? Western, Vedic and Chinese Explained | BornClock"
        description="Find your Western sun sign, Vedic Rashi, and Chinese zodiac animal from your birthday. Most people have a different sign in Vedic astrology than Western."
        canonicalUrl="/answers/what-is-my-zodiac-sign"
        ogType="article"
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">What is my zodiac sign?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">What Is My Zodiac Sign? Western, Vedic and Chinese Explained</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your zodiac sign depends on which system you use. In Western astrology, your sign is determined by the Sun's position on your birthday. In Vedic (Indian) astrology, the system is shifted by ~24 degrees — so most people have a different Rashi than their Western sign. Your Chinese zodiac is determined by your birth year, not birth date.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">Western Astrology (Tropical Zodiac)</h2>
            <p>Western astrology uses the <strong>tropical zodiac</strong>, which is anchored to the seasons rather than the actual star positions. The Sun enters Aries on the spring equinox (around March 21), regardless of whether the stars have shifted. The 12 signs, each covering approximately 30 degrees of the ecliptic, are:</p>
            <ul className="list-disc pl-6 space-y-0.5 text-sm">
              <li>Aries: March 21 – April 19</li>
              <li>Taurus: April 20 – May 20</li>
              <li>Gemini: May 21 – June 20</li>
              <li>Cancer: June 21 – July 22</li>
              <li>Leo: July 23 – August 22</li>
              <li>Virgo: August 23 – September 22</li>
              <li>Libra: September 23 – October 22</li>
              <li>Scorpio: October 23 – November 21</li>
              <li>Sagittarius: November 22 – December 21</li>
              <li>Capricorn: December 22 – January 19</li>
              <li>Aquarius: January 20 – February 18</li>
              <li>Pisces: February 19 – March 20</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900">Vedic Astrology (Sidereal Zodiac)</h2>
            <p>Vedic astrology — the <em>Jyotish</em> system from India — uses the <strong>sidereal zodiac</strong>, which tracks the actual positions of constellations in the sky. Due to a phenomenon called the <strong>precession of the equinoxes</strong> (the slow wobble of Earth's axis over ~26,000 years), the tropical and sidereal zodiacs are currently offset by approximately 23–24 degrees — called the <em>ayanamsha</em>.</p>
            <p>This means that if you're a Western Aries (born March 21–April 19), you're probably a Vedic Pisces. If you're a Western Taurus, you're likely a Vedic Aries. In Vedic astrology, your <strong>Rashi</strong> (moon sign) is often considered more important than your sun sign for personality analysis.</p>

            <h2 className="text-xl font-bold text-gray-900">Chinese Zodiac (Shengxiao)</h2>
            <p>The Chinese zodiac operates on a completely different system — a <strong>12-year cycle</strong> in which each year is associated with one of 12 animals: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig. Your Chinese zodiac sign is determined by your <em>birth year</em>, not your birth month or day.</p>
            <p>But there's a nuance: the Chinese New Year falls in January or February each year (the exact date shifts). If you were born in January or early February, you may belong to the previous year's animal rather than the calendar year. The full cycle combines 12 animals with 5 elements (Wood, Fire, Earth, Metal, Water), producing a 60-year cycle.</p>
            <p>Recent years: 2020 Rat · 2021 Ox · 2022 Tiger · 2023 Rabbit · 2024 Dragon · 2025 Snake · 2026 Horse</p>

            <h2 className="text-xl font-bold text-gray-900">Why Knowing All Three Gives a Fuller Picture</h2>
            <p>Western astrology's sun sign reflects your core identity and ego expression. Vedic astrology's moon sign (Rashi) reflects your emotional nature, mental tendencies, and how you experience inner life. Your Chinese zodiac reflects your social instincts, career tendencies, and the generational patterns of your birth year cohort.</p>
            <p>Many people who feel their Western sun sign "doesn't quite fit" find that their Vedic moon sign resonates far more strongly. Using all three systems gives a richer, more nuanced portrait than any single tradition.</p>

            <h2 className="text-xl font-bold text-gray-900">Famous Examples of Dual-Sign Shifts</h2>
            <p>Taylor Swift is a Western Sagittarius but a Vedic Scorpio. Elon Musk is a Western Cancer but a Vedic Gemini. Barack Obama is a Western Leo but a Vedic Cancer. This shift affects roughly 80% of people — only those born in the middle third of each Western sign retain the same sign in Vedic astrology.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Discover All 3 of Your Zodiac Signs</p>
            <p className="text-sm text-gray-500 mb-4">Western · Vedic Rashi · Chinese Zodiac — all from your birthday</p>
            <Link to="/"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Discover All 3 of My Zodiac Signs →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/what-is-my-life-path-number" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my Life Path number?</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ Which famous people share my birthday?</Link>
              <Link to="/answers/what-generation-am-i" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What generation am I?</Link>
              <Link to="/answers/how-old-am-i-on-mars" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How old am I on Mars?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
