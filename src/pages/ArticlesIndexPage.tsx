import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface ArticleEntry {
  title: string;
  href: string;
  category: string;
  blurb: string;
}

const ARTICLES: ArticleEntry[] = [
  // Longevity
  {
    title: 'Life Expectancy by Country (2026)',
    href: '/articles/life-expectancy-by-country-2026',
    category: 'Longevity',
    blurb: 'Compare average lifespans across the world with the latest 2026 data and see how your country ranks.',
  },
  {
    title: 'How Long Will I Live in India?',
    href: '/articles/how-long-will-i-live-in-india',
    category: 'Longevity',
    blurb: 'A data-driven look at Indian life expectancy and the lifestyle factors that add or subtract years.',
  },
  {
    title: 'Biological Age vs Chronological Age',
    href: '/articles/biological-age-vs-chronological-age',
    category: 'Longevity',
    blurb: 'Why the number on your birthday cake is not the whole story, and how to measure your true body age.',
  },
  {
    title: 'Longevity Quiz',
    href: '/articles/longevity-quiz',
    category: 'Longevity',
    blurb: 'Take a quick, evidence-based quiz to estimate your longevity and spot the habits worth changing.',
  },
  {
    title: 'Bryan Johnson Blueprint Alternative',
    href: '/articles/bryan-johnson-blueprint-alternative',
    category: 'Longevity',
    blurb: 'A realistic, affordable take on the Blueprint protocol for people who are not billionaires.',
  },
  {
    title: 'How to Live to 100',
    href: '/articles/how-to-live-to-100',
    category: 'Longevity',
    blurb: 'The science-backed habits shared by centenarians and how to start building them today.',
  },
  {
    title: 'Exercise and Longevity',
    href: '/articles/exercise-and-longevity',
    category: 'Longevity',
    blurb: 'How much movement actually extends your life, and which types of exercise matter most.',
  },
  {
    title: 'Blue Zones Diet',
    href: '/articles/blue-zones-diet',
    category: 'Longevity',
    blurb: 'What the world\'s longest-lived communities eat, and how to bring their plate to your kitchen.',
  },
  {
    title: 'Longevity Foods in India',
    href: '/articles/longevity-foods-india',
    category: 'Longevity',
    blurb: 'Everyday Indian ingredients and dishes linked to a longer, healthier life.',
  },
  {
    title: 'Death Clock Alternative',
    href: '/articles/death-clock-alternative',
    category: 'Longevity',
    blurb: 'A kinder, more useful way to think about your remaining time than a grim countdown.',
  },
  {
    title: 'Retirement Planning by Life Expectancy',
    href: '/articles/retirement-planning-life-expectancy',
    category: 'Longevity',
    blurb: 'How to plan your finances around how long you are actually likely to live.',
  },
  {
    title: 'Longevity Supplements',
    href: '/articles/longevity-supplements',
    category: 'Longevity',
    blurb: 'An evidence-first review of the supplements people take for a longer life, and which have real backing.',
  },
  {
    title: 'How Indian Celebrities Stay Fit',
    href: '/articles/how-indian-celebrities-stay-fit',
    category: 'Longevity',
    blurb: 'The routines and diets behind the ageless looks of India\'s biggest stars.',
  },
  {
    title: 'Famous People Who Lived to 100',
    href: '/articles/famous-people-lived-to-100',
    category: 'Longevity',
    blurb: 'Centenarians from history and their remarkable stories of a full, long life.',
  },
  {
    title: 'Epigenetics and Longevity',
    href: '/articles/epigenetics-and-longevity',
    category: 'Longevity',
    blurb: 'How your lifestyle switches genes on and off, and what that means for your lifespan.',
  },
  {
    title: 'Life Expectancy: How It Is Calculated',
    href: '/articles/life-expectancy-how-it-is-calculated',
    category: 'Longevity',
    blurb: 'The demographics and math behind life-expectancy numbers, explained simply.',
  },
  {
    title: 'Retirement Age and Life Expectancy in India',
    href: '/articles/retirement-age-india-life-expectancy',
    category: 'Longevity',
    blurb: 'How India\'s rising life expectancy is reshaping retirement age and savings needs.',
  },
  {
    title: 'Longevity Habits of Indian Billionaires',
    href: '/articles/longevity-habits-of-indian-billionaires',
    category: 'Longevity',
    blurb: 'The daily disciplines the ultra-wealthy use to protect their health and their years.',
  },
  {
    title: 'Age in Days, Hours and Minutes',
    href: '/articles/age-in-days-hours-minutes',
    category: 'Longevity',
    blurb: 'See your age broken down into days, hours and minutes, and why the count matters.',
  },

  // Numerology
  {
    title: 'Numerology by Date of Birth',
    href: '/articles/numerology-by-date-of-birth',
    category: 'Numerology',
    blurb: 'Find your Life Path number from your birth date, with all nine paths explained.',
  },
  {
    title: 'Life Path Number Compatibility',
    href: '/articles/life-path-number-compatibility',
    category: 'Numerology',
    blurb: 'Which Life Path numbers click and which clash, for love and friendship.',
  },

  // Vedic Astrology
  {
    title: 'Moon Sign by Date of Birth',
    href: '/articles/moon-sign-by-date-of-birth',
    category: 'Vedic Astrology',
    blurb: 'Discover your Vedic Rashi (moon sign) and what it reveals about your inner world.',
  },
  {
    title: 'Nakshatra by Date of Birth',
    href: '/articles/nakshatra-by-date-of-birth',
    category: 'Vedic Astrology',
    blurb: 'Find your birth star among the 27 nakshatras and its meaning in Vedic astrology.',
  },
  {
    title: 'Vedic Astrology Birth Chart',
    href: '/articles/vedic-astrology-birth-chart',
    category: 'Vedic Astrology',
    blurb: 'Understand the houses, planets and signs that make up your Vedic birth chart.',
  },

  // Western Astrology
  {
    title: 'Zodiac Compatibility',
    href: '/articles/zodiac-compatibility',
    category: 'Western Astrology',
    blurb: 'How the twelve zodiac signs match up in love and how to read the chemistry.',
  },
  {
    title: 'Tarot Card by Date of Birth',
    href: '/articles/tarot-card-by-date-of-birth',
    category: 'Western Astrology',
    blurb: 'Find the tarot card tied to your birth date and the archetype it carries.',
  },
  {
    title: 'Birth Month Personality',
    href: '/articles/birth-month-personality',
    category: 'Western Astrology',
    blurb: 'What the month you were born in says about your traits and tendencies.',
  },
  {
    title: 'Biorhythm Calculator',
    href: '/articles/biorhythm-calculator',
    category: 'Western Astrology',
    blurb: 'Track your physical, emotional and intellectual cycles from your date of birth.',
  },
  {
    title: 'Planetary Age Calculator',
    href: '/articles/planetary-age-calculator',
    category: 'Western Astrology',
    blurb: 'How old you would be on Mars, Venus and every other planet in the solar system.',
  },

  // Chinese Zodiac
  {
    title: 'Chinese Zodiac by Year',
    href: '/articles/chinese-zodiac-by-year',
    category: 'Chinese Zodiac',
    blurb: 'Find your Chinese zodiac animal by birth year and what it means for your personality.',
  },

  // Monthly
  {
    title: 'Famous Indians Born in January',
    href: '/articles/famous-indians-born-in-january',
    category: 'Monthly',
    blurb: 'Celebrated Indians who share a January birthday, from leaders to stars.',
  },
  {
    title: 'Famous Indians Born in February',
    href: '/articles/famous-indians-born-in-february',
    category: 'Monthly',
    blurb: 'The notable Indians born in February and the legacy they left behind.',
  },
  {
    title: 'Famous Indians Born in March',
    href: '/articles/famous-indians-born-in-march',
    category: 'Monthly',
    blurb: 'March-born Indian icons across politics, cinema, sport and science.',
  },
  {
    title: 'Famous Indians Born in April',
    href: '/articles/famous-indians-born-in-april',
    category: 'Monthly',
    blurb: 'The famous Indians who celebrate their birthdays in April.',
  },
  {
    title: 'Famous Indians Born in May',
    href: '/articles/famous-indians-born-in-may',
    category: 'Monthly',
    blurb: 'Remarkable Indians born in May and the stories that made them famous.',
  },
  {
    title: 'Famous Indians Born in June',
    href: '/articles/famous-indians-born-in-june',
    category: 'Monthly',
    blurb: 'June-born personalities who shaped modern India.',
  },
  {
    title: 'Famous Indians Born in July',
    href: '/articles/famous-indians-born-in-july',
    category: 'Monthly',
    blurb: 'The well-known Indians who share a July birthday.',
  },
  {
    title: 'Famous Indians Born in August',
    href: '/articles/famous-indians-born-in-august',
    category: 'Monthly',
    blurb: 'August-born Indian legends from freedom fighters to film stars.',
  },
  {
    title: 'Famous Indians Born in September',
    href: '/articles/famous-indians-born-in-september',
    category: 'Monthly',
    blurb: 'The notable Indians born in September and why they are remembered.',
  },
  {
    title: 'Famous Indians Born in October',
    href: '/articles/famous-indians-born-in-october',
    category: 'Monthly',
    blurb: 'October-born Indian icons and their lasting contributions.',
  },
  {
    title: 'Famous Indians Born in November',
    href: '/articles/famous-indians-born-in-november',
    category: 'Monthly',
    blurb: 'The famous Indians who celebrate a November birthday.',
  },
  {
    title: 'Famous Indians Born in December',
    href: '/articles/famous-indians-born-in-december',
    category: 'Monthly',
    blurb: 'December-born personalities who left a mark on India.',
  },

  // Hindi
  {
    title: 'जीवन प्रत्याशा कैलकुलेटर (Life Expectancy Calculator)',
    href: '/hi/life-expectancy-calculator',
    category: 'Hindi',
    blurb: 'हिंदी में अपनी जीवन प्रत्याशा का अनुमान लगाएं — मुफ़्त और साक्ष्य-आधारित।',
  },
  {
    title: 'अंक ज्योतिष जन्म तिथि से (Numerology by Date of Birth)',
    href: '/hi/numerology-by-date-of-birth',
    category: 'Hindi',
    blurb: 'अपनी जन्म तिथि से अपना मूलांक और जीवन पथ अंक हिंदी में जानें।',
  },
  {
    title: 'मेरी जीवन प्रत्याशा (Meri Jeevan Pratyasha)',
    href: '/hi/meri-jeevan-pratyasha',
    category: 'Hindi',
    blurb: 'हिंदी में जानें कि आप कितने वर्ष जी सकते हैं और इसे कैसे बढ़ाएं।',
  },
];

const CATEGORIES = [
  'All',
  ...Array.from(new Set(ARTICLES.map(a => a.category))),
];

export function ArticlesIndexPage() {
  const [active, setActive] = React.useState('All');

  const visible = active === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === active);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'BornClock Articles',
    description:
      'Browse all BornClock articles — longevity science, numerology, Vedic and Western astrology, Chinese zodiac, and Hindi guides.',
    url: 'https://bornclock.com/articles/',
  };

  return (
    <>
      <SEO
        title="All Articles — Longevity, Numerology & Astrology Guides | BornClock"
        description="Browse all BornClock articles — longevity science, numerology, Vedic and Western astrology, Chinese zodiac, and Hindi guides. Free, evidence-based."
        canonicalUrl="/articles"
        ogType="website"
      />
      <JsonLd data={collectionSchema} />

      <main data-testid="articles-index-page" className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-4">
            All Articles
          </h1>
          <p className="text-gray-700 leading-relaxed mb-8 max-w-3xl">
            Every BornClock guide in one place — the science of a longer life,
            numerology and astrology from your date of birth, Chinese zodiac,
            monthly birthday collections, and guides in Hindi. All free and
            evidence-based.
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                data-testid="category-filter"
                onClick={() => setActive(cat)}
                aria-pressed={active === cat}
                className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                  active === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Article cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(a => (
              <a
                key={a.href}
                href={a.href}
                data-testid="article-card"
                className="block bg-white border-2 border-gray-100 rounded-2xl p-5
                           hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <span className="inline-block text-[11px] font-bold uppercase tracking-wide
                                 text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-1 mb-3">
                  {a.category}
                </span>
                <h2 className="text-lg font-black text-gray-900 leading-snug mb-2">
                  {a.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{a.blurb}</p>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
                          p-8 text-center text-white mt-12">
            <h2 className="text-2xl font-black mb-2">Start With Your Own Numbers</h2>
            <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
              Reading is a great start — but the real insight comes from your own
              date of birth. Generate your free profile or estimate your life
              expectancy in seconds.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/birthday-report"
                data-testid="cta-birthday-report"
                className="inline-block bg-white text-indigo-700 font-black px-6 py-3
                           rounded-full text-base hover:bg-indigo-50 transition-colors"
              >
                Generate My Birthday Report →
              </a>
              <a
                href="/longevity-calculator"
                data-testid="cta-longevity-calculator"
                className="inline-block bg-indigo-800 text-white font-black px-6 py-3
                           rounded-full text-base hover:bg-indigo-900 transition-colors"
              >
                Estimate My Life Expectancy →
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ArticlesIndexPage;
