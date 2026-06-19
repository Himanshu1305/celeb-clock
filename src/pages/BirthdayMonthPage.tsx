import { useParams, Link } from 'react-router-dom';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getZodiacSign, MONTH_NAMES, MONTH_DAYS } from '@/data/birthdayPersonality';
import { MONTH_CONTENT } from '@/data/birthdayMonthContent';

// Which zodiac signs are active in each month
const MONTH_ZODIAC: Record<number, string> = {
  1:  'Capricorn (Jan 1–19) & Aquarius (Jan 20–31)',
  2:  'Aquarius (Feb 1–18) & Pisces (Feb 19–28/29)',
  3:  'Pisces (Mar 1–20) & Aries (Mar 21–31)',
  4:  'Aries (Apr 1–19) & Taurus (Apr 20–30)',
  5:  'Taurus (May 1–20) & Gemini (May 21–31)',
  6:  'Gemini (Jun 1–20) & Cancer (Jun 21–30)',
  7:  'Cancer (Jul 1–22) & Leo (Jul 23–31)',
  8:  'Leo (Aug 1–22) & Virgo (Aug 23–31)',
  9:  'Virgo (Sep 1–22) & Libra (Sep 23–30)',
  10: 'Libra (Oct 1–22) & Scorpio (Oct 23–31)',
  11: 'Scorpio (Nov 1–21) & Sagittarius (Nov 22–30)',
  12: 'Sagittarius (Dec 1–21) & Capricorn (Dec 22–31)',
};

const DAY_SUFFIX = (d: number) => {
  if (d >= 11 && d <= 13) return 'th';
  switch (d % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default function BirthdayMonthPage() {
  const { month: monthParam } = useParams<{ month: string }>();
  const month = parseInt(monthParam || '1', 10);

  if (month < 1 || month > 12) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Month not found</h1>
          <Link to="/birthday" className="text-indigo-600 hover:underline">Browse all months</Link>
        </div>
      </div>
    );
  }

  const monthName  = MONTH_NAMES[month];
  const totalDays  = MONTH_DAYS[month];
  const prevMonth  = month === 1 ? 12 : month - 1;
  const nextMonth  = month === 12 ? 1 : month + 1;
  const zodiacText = MONTH_ZODIAC[month] ?? '';

  const title       = `${monthName} Birthdays — Personality, Zodiac & Famous People`;
  const description = `Explore personality insights for every day in ${monthName}. Discover the zodiac signs, life path numbers, and unique traits of people born throughout ${monthName}.`;

  const faqs = [
    {
      question: `What zodiac signs are in ${monthName}?`,
      answer: `${monthName} spans two zodiac signs: ${zodiacText}. Each sign has distinct traits shaped by its element and ruling planet.`,
    },
    {
      question: `What are people born in ${monthName} like?`,
      answer: `People born in ${monthName} carry the energy of ${zodiacText}. They combine the elemental traits of their specific sign with a unique life path number derived from their birth day.`,
    },
    {
      question: `How do I find my birthday personality in ${monthName}?`,
      answer: `Click on your specific birth date below to see your full personality profile — including zodiac sign, life path number, core traits, lucky day, and compatible signs.`,
    },
    {
      question: `What is the luckiest day in ${monthName}?`,
      answer: `Every day in ${monthName} carries unique energy. Click any date below to discover the lucky day, lucky color, and lucky number for that specific birthday.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={title}
        description={description}
        keywords={`${monthName} birthdays, ${monthName} zodiac personality, ${monthName} birthday traits, born in ${monthName}`}
        canonicalUrl={`/birthday/${month}`}
      />
      <FAQSchema items={faqs} />

      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/birthday" className="hover:text-indigo-600 transition-colors">Birthday</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">{monthName}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
          {monthName} Birthdays — Personality, Zodiac &amp; Famous People
        </h1>
        <PageTagline />

        {/* Intro */}
        <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-2xl">
          {monthName} covers <strong>{zodiacText}</strong>. Each day brings a unique combination of
          zodiac energy and life path numerology. Select your birthday to discover your full personality profile.
        </p>

        {/* Day grid */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your {monthName} Birthday</h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
              const z = getZodiacSign(month, d);
              const elementColors: Record<string, string> = {
                Fire:  'hover:bg-red-50 hover:border-red-300',
                Earth: 'hover:bg-green-50 hover:border-green-300',
                Air:   'hover:bg-blue-50 hover:border-blue-300',
                Water: 'hover:bg-cyan-50 hover:border-cyan-300',
              };
              const hoverClass = elementColors[z.element] ?? 'hover:bg-indigo-50 hover:border-indigo-300';
              return (
                <Link
                  key={d}
                  to={`/birthday/${month}/${d}`}
                  className={`group border border-gray-200 rounded-lg p-2 text-center transition-all ${hoverClass}`}
                >
                  <span className="block text-lg font-black text-gray-900 group-hover:text-indigo-700">
                    {d}
                  </span>
                  <span className="block text-[10px] text-gray-400 mt-0.5 leading-none">
                    {z.symbol}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Each tile shows the day number and its zodiac symbol. Click any date for the full personality profile.
          </p>
        </section>

        {/* Zodiac breakdown */}
        <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Zodiac Signs in {monthName}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>{monthName}</strong> births span <strong>{zodiacText}</strong>.
            The transition between signs brings a cusp energy — those born within 2–3 days of the sign change
            often display traits from both signs, making them uniquely adaptable and multi-faceted.
          </p>
        </section>

        {/* Rich month content sections */}
        {MONTH_CONTENT[month] && (() => {
          const mc = MONTH_CONTENT[month];
          return (
            <>
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  About {monthName} Birthdays
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{mc.intro}</p>
              </section>

              <section className="mb-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {monthName} Personality Traits
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{mc.signatureTraits}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {monthName} Famous Birthdays — Themes &amp; Patterns
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{mc.famousTheme}</p>
              </section>

              <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  The Season of {monthName}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{mc.seasonContext}</p>
              </section>
            </>
          );
        })()}

        {/* FAQ */}
        <section className="mb-8">
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

        {/* Month navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Link
            to={`/birthday/${prevMonth}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {MONTH_NAMES[prevMonth]}
          </Link>
          <Link to="/birthday" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            All 12 Months
          </Link>
          <Link
            to={`/birthday/${nextMonth}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            {MONTH_NAMES[nextMonth]}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
