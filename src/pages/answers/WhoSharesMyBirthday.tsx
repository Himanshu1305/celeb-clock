import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function WhoSharesMyBirthday() {
  return (
    <>
      <SEO
        title="Which Famous People Share My Birthday? | BornClock"
        description="Discover which celebrities, athletes, scientists and world leaders share your exact birthday. BornClock searches 50,000+ celebrities by date of birth."
        canonicalUrl="/answers/who-shares-my-birthday"
        ogType="article"
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">Who shares my birthday?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Which Famous People Share My Birthday?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Thousands of notable people share every birthday — from world leaders and Oscar winners to scientists and athletes. BornClock's database of 50,000+ celebrities lets you find your famous birthday twins instantly by entering your date of birth.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">Why Celebrity Birthdays Are Fascinating</h2>
            <p>There are 365 days in a year (366 in a leap year), and roughly 8 billion people on Earth. That means an average of 21 million people share your birthday worldwide. Among those, thousands have achieved recognition across every field — from Nobel laureates to Olympic champions, from Oscar-winning actors to heads of state.</p>
            <p>Discovering your celebrity birthday twins is more than trivia. Psychologically, it creates a sense of connection and belonging — you share something specific with people who have shaped culture and history. It's also one of the most engaging pieces of personalised content you can share on your own birthday.</p>

            <h2 className="text-xl font-bold text-gray-900">Famous Sharing-Birthday Pairings</h2>
            <p>Some of the most striking celebrity birthday pairings — people who share an exact date of birth despite having no other obvious connection:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>January 17:</strong> Muhammad Ali (1942) and Jim Carrey (1962)</li>
              <li><strong>April 23:</strong> William Shakespeare (1564) and Shirley Temple (1928)</li>
              <li><strong>August 4:</strong> Barack Obama (1961) and Percy Bysshe Shelley (1792)</li>
              <li><strong>October 9:</strong> John Lennon (1940) and Guillermo del Toro (1964)</li>
              <li><strong>December 25:</strong> Humphrey Bogart (1899) and Justin Trudeau (1971)</li>
            </ul>
            <p>These pairings span centuries and continents, which is part of what makes the discovery feel meaningful — the calendar creates an unexpected thread between otherwise unconnected lives.</p>

            <h2 className="text-xl font-bold text-gray-900">How BornClock's Database Works</h2>
            <p>BornClock's celebrity birthday database is sourced from verified Wikipedia biographical data, cross-referenced with major public records. The database covers celebrities across these categories:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Actors, directors, and musicians (the largest category)</li>
              <li>Professional athletes across 30+ sports</li>
              <li>Political leaders, heads of state, and historical figures</li>
              <li>Scientists, inventors, and Nobel Prize winners</li>
              <li>Authors, philosophers, and cultural icons</li>
              <li>Business leaders and tech entrepreneurs</li>
            </ul>
            <p>Results are sorted by fame score — a composite metric derived from Wikipedia page views, external citations, and cultural impact — so the most universally recognised people appear first.</p>

            <h2 className="text-xl font-bold text-gray-900">What You Can Learn From Your Birthday Twins</h2>
            <p>Your famous birthday twins share more than a date. They share your sun sign, your numerological birth energy (the day number in numerology), and — if you subscribe to astrology — the same planetary positions at the moment of sunrise on your shared date. Many astrologers and numerologists believe these shared energies create underlying personality resonances.</p>
            <p>Whether or not you accept that interpretation, your birthday twins often reveal something interesting about the date itself. Dates associated with major historical events or celestial alignments tend to attract curious correspondences across the people born on them.</p>

            <h2 className="text-xl font-bold text-gray-900">The Zodiac Connection</h2>
            <p>Every birthday falls within one of 12 Western zodiac signs. Your birthday twins also share your sun sign, giving you a starting point for exploring your astrological personality profile. BornClock shows your Western sign, Vedic Rashi, and Chinese zodiac animal — three complementary lenses for understanding the energy of your birth date.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Find Your Celebrity Birthday Twin</p>
            <p className="text-sm text-gray-500 mb-4">Search 50,000+ celebrities by date of birth — free, instant results</p>
            <Link to="/"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Find My Celebrity Birthday Twin →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my zodiac sign?</Link>
              <Link to="/answers/what-is-my-life-path-number" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my Life Path number?</Link>
              <Link to="/answers/how-to-calculate-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How to calculate my exact age</Link>
              <Link to="/answers/what-generation-am-i" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What generation am I?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
