import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { PageFAQ } from '@/components/PageFAQ';
import { SharePageBar } from '@/components/SharePageBar';
import { MONTH_HUB_DATA } from '@/data/monthHubData';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { postsForTags } from '@/lib/mesh';

// Hub for the 12 /born-in-{month} pages — previously reachable only by guessing the URL.
export default function MonthsHubPage() {
  const meshPosts = postsForTags(['birthstone', 'zodiac', 'birthday'], 2);

  const faqs = [
    { question: 'What does my birth month say about me?', answer: 'Traditionally, a birth month is tied to one or two zodiac sun signs, a birthstone and birth flowers — a cluster of cultural associations built up over centuries. It is folklore and tradition, meaningful as heritage and celebration, not a scientific predictor of personality or fate.' },
    { question: 'Why does each month have two zodiac signs?', answer: 'The tropical zodiac boundaries fall around the 19th–23rd of each month, not on the 1st, so almost every calendar month is split between two sun signs — for example May runs from Taurus into Gemini around 20–21 May.' },
    { question: 'Which birthstone belongs to my month?', answer: 'Each month has a primary birthstone in the modern (1912 Jewelers of America) list — January garnet, April diamond, July ruby, September sapphire, December turquoise/tanzanite, and so on. Open your month for its full stone, meaning and history.' },
    { question: 'What are birth flowers?', answer: 'Alongside the birthstone, most months carry one or two traditional birth flowers (January carnation & snowdrop, June rose & honeysuckle, and so on), each with its own Victorian flower-language meaning. Each month page lists them.' },
    { question: 'Are birthstones and birth-month signs real science?', answer: 'No. Zodiac signs, birthstones and birth flowers are cultural and historical traditions with no evidence for predicting personality or events. We present them as heritage and a fun way to explore your date — never as a forecast.' },
    { question: 'How do I find famous people born in my month?', answer: 'Open any month below to see the most globally recognised people born in it (plus a dedicated Indian-celebrities section), each linking to their exact birthday page.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Born in Each Month — Birthstones, Zodiac Signs & Famous Birthdays | BornClock"
        description="Browse all 12 birth months: the zodiac signs, birthstone and birth flowers of each, plus the famous people born in it. Cultural tradition and celebration — never a prediction."
        keywords="birth month, birthstone by month, zodiac signs by month, born in month, birth month meaning, birthstones and birth flowers"
        canonicalUrl="/born-in"
      />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>›</span>
          <span className="text-gray-600">Born in Each Month</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Born in Each Month</h1>
        {/* Answer-first (AEO) */}
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Every birth month carries its own zodiac signs, birthstone and birth flowers — from January's
          garnet and Capricorn–Aquarius pairing to December's turquoise and Sagittarius–Capricorn. Browse
          all 12 below for the traits, gems, flowers and famous people tied to each. It's cultural
          tradition and celebration, not a prediction.
        </p>

        <SharePageBar path="/born-in" title="Born in Each Month" text="Every birth month's zodiac signs, birthstone and famous birthdays — all 12 in one place" className="mb-8" />

        {/* The 12 months */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {MONTH_HUB_DATA.map(m => {
            const stone = BIRTHSTONE_DATA[m.monthNumber - 1];
            const signs = m.zodiacSpans.map(z => z.sign).join(' & ');
            return (
              <Link key={m.slug} to={`/born-in-${m.slug}`}
                className="block rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors">
                <p className="text-lg font-bold text-gray-900 mb-1">{m.month}</p>
                <p className="text-sm text-gray-600">💎 {stone?.primaryStone ?? '—'} · ♈ {signs}</p>
                <p className="text-xs text-indigo-600 mt-2">Explore {m.month} →</p>
              </Link>
            );
          })}
        </div>

        <PageFAQ title="Birth months — Frequently Asked Questions" items={faqs} />

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meshPosts.map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ {p.title}</Link>
            ))}
            <Link to="/born-on" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Browse by exact birth date</Link>
            <Link to="/birthstone" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Birthstone finder</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
