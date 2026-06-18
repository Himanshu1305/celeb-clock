import { Link } from 'react-router-dom';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star, Calendar, Users } from 'lucide-react';
import { MONTH_NAMES, MONTH_DAYS, getZodiacSign } from '@/data/birthdayPersonality';

const MONTH_EMOJIS = ['', '❄️', '💙', '🌸', '🌿', '🌺', '☀️', '🌊', '🌻', '🍂', '🎃', '🦃', '🎄'];

const ZODIAC_PAIRS: Record<number, string> = {
  1:  'Capricorn & Aquarius',
  2:  'Aquarius & Pisces',
  3:  'Pisces & Aries',
  4:  'Aries & Taurus',
  5:  'Taurus & Gemini',
  6:  'Gemini & Cancer',
  7:  'Cancer & Leo',
  8:  'Leo & Virgo',
  9:  'Virgo & Libra',
  10: 'Libra & Scorpio',
  11: 'Scorpio & Sagittarius',
  12: 'Sagittarius & Capricorn',
};

// Sample representative date for each month to show its dominant zodiac
const MONTH_SAMPLE_DAY = [0, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15];

export default function BirthdayHub() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay   = today.getDate();

  const faqs = [
    {
      question: 'What determines a birthday personality?',
      answer: 'Birthday personality is shaped by two main forces: your zodiac sign (determined by the Sun\'s position on your birth date) and your Life Path number (derived numerologically from your birth day). Together, they create a unique personality fingerprint — 12 zodiac signs × 9 life path numbers = 108 distinct combinations.',
    },
    {
      question: 'How is my Life Path number calculated from my birthday?',
      answer: 'Your Life Path number is found by reducing your birth day to a single digit. For example, if you were born on the 17th: 1 + 7 = 8. Day 29: 2 + 9 = 11, then 1 + 1 = 2. Numbers 1–9 each carry specific personality energies from leadership (1) to humanitarianism (9).',
    },
    {
      question: 'Are birthday personalities accurate?',
      answer: 'Birthday personality analysis blends astrology and numerology — two ancient systems used across cultures for thousands of years. While not scientifically predictive, they provide meaningful frameworks for self-understanding, communication styles, and relationship compatibility that many people find insightful.',
    },
    {
      question: 'Can two people born on the same day have different personalities?',
      answer: 'Yes. While the zodiac sign and life path number are identical, additional factors like birth year, exact time of birth, rising sign, and cultural upbringing all shape individual personality. The birthday profile provides a foundational template, not a fixed destiny.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Birthday Personality by Date — All 365 Days | BornClock"
        description="Discover the personality, zodiac sign, life path number, lucky day, and compatible signs for every birthday. Explore all 365 days across 12 months."
        keywords="birthday personality, zodiac by birthday, life path number birthday, personality by birth date, birthday astrology numerology"
        canonicalUrl="/birthday"
      />
      <FAQSchema items={faqs} />

      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Birthday Personality</span>
        </nav>

        {/* H1 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">
            Birthday Personality by Date — All 365 Days
          </h1>
          <PageTagline />
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-3">
            Every birthday carries a unique blend of zodiac energy and numerology. Discover the
            personality traits, lucky attributes, and compatible signs for any day of the year.
          </p>
          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <Button asChild className="gap-2">
              <Link to={`/birthday/${currentMonth}/${currentDay}`}>
                <Star className="w-4 h-4" /> My Birthday ({MONTH_NAMES[currentMonth]} {currentDay})
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/celebrity-birthday">
                <Users className="w-4 h-4" /> Celebrity Birthdays
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['Zodiac Sign', 'Life Path Number', 'Core Traits', 'Lucky Day', 'Lucky Color', 'Compatible Signs'].map(f => (
            <span key={f} className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs px-3 py-1.5 font-medium">
              {f}
            </span>
          ))}
        </div>

        {/* 12-month grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Month</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const sample = getZodiacSign(m, MONTH_SAMPLE_DAY[m]);
              const isCurrentMonth = m === currentMonth;
              return (
                <Link
                  key={m}
                  to={`/birthday/${m}`}
                  className={`group block rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:border-indigo-400 ${
                    isCurrentMonth ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{MONTH_EMOJIS[m]}</div>
                  <p className="font-black text-gray-900 text-base group-hover:text-indigo-700">
                    {MONTH_NAMES[m]}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                    {ZODIAC_PAIRS[m]}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-1">{MONTH_DAYS[m]} days</p>
                  {isCurrentMonth && (
                    <span className="inline-block mt-1.5 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                      This month
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            <Sparkles className="w-5 h-5 inline mr-2 text-indigo-500" />
            What Shapes Your Birthday Personality?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-indigo-800 mb-2">Your Zodiac Sign</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Determined by the Sun's position on your birth date, your zodiac sign provides the
                elemental foundation of your character — Fire (Aries, Leo, Sagittarius), Earth
                (Taurus, Virgo, Capricorn), Air (Gemini, Libra, Aquarius), or Water (Cancer, Scorpio, Pisces).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-800 mb-2">Your Life Path Number</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Calculated by reducing your birth day to a single digit (e.g., born on the 23rd:
                2+3=5), your Life Path number adds a numerological layer that modifies and deepens
                your zodiac traits. 12 signs × 9 numbers = 108 unique combinations.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-800 mb-2">Ruling Planet</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Each zodiac sign is governed by a ruling planet — Mars for Aries, Venus for Taurus
                and Libra, Mercury for Gemini and Virgo. The planet's mythological qualities
                translate into specific personality drives and life themes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-800 mb-2">Lucky Attributes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your birth date maps to a lucky day of the week, lucky color, and lucky number.
                These aren't superstitions — they're ancient shorthand for when and how your energy
                tends to flow most powerfully.
              </p>
            </div>
          </div>
        </section>

        {/* Quick-access: today & nearby */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <Calendar className="w-5 h-5 inline mr-2 text-indigo-500" />
            Today & Nearby
          </h2>
          <div className="flex flex-wrap gap-2">
            {[-2, -1, 0, 1, 2].map(offset => {
              const d = new Date(today);
              d.setDate(d.getDate() + offset);
              const m = d.getMonth() + 1;
              const dy = d.getDate();
              const isToday = offset === 0;
              return (
                <Link
                  key={offset}
                  to={`/birthday/${m}/${dy}`}
                  className={`border rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isToday
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-700'
                  }`}
                >
                  {isToday && '★ '}
                  {MONTH_NAMES[m].slice(0, 3)} {dy}
                  {isToday && ' (Today)'}
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{faq.question}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Find Your Complete Birthday Intelligence Report</h2>
          <p className="text-indigo-100 text-sm mb-5 max-w-md mx-auto">
            Beyond personality — discover your celebrity birthday twins, birthstone, numerology
            number, and longevity forecast all in one place.
          </p>
          <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold gap-2">
            <Link to="/">
              Get Your Free Report <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
      <Footer />
    </div>
  );
}
