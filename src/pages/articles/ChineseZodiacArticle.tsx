import React from 'react';
import { SEO } from '@/components/SEO';
import { CHINESE_ZODIAC_PROFILES } from '@/data/astrologicalData';
import { calculateChineseZodiac } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const ZODIAC_ORDER = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];

const FAQS = [
  {
    q: 'How do I find my Chinese zodiac animal by year?',
    a: 'The Chinese zodiac runs in a repeating twelve-year cycle, so your animal sign is determined by your year of birth. Simply enter your birth year into the calculator above and it will tell you which of the twelve animals — Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog or Pig — rules your year, along with its element and personality.',
  },
  {
    q: 'What are the 12 animals of the Chinese zodiac in order?',
    a: 'The twelve animals always follow the same order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig. According to legend this order was set by the Great Race organised by the Jade Emperor, in which the clever Rat rode across the river on the Ox and jumped ahead to finish first.',
  },
  {
    q: 'What does my Chinese zodiac element mean?',
    a: 'Alongside the twelve animals, the Chinese zodiac cycles through five elements — Wood, Fire, Earth, Metal and Water. Each animal pairs with an element depending on the year, creating a full sixty-year cycle. Your element adds nuance to your sign; for example, a Wood Dragon and a Fire Dragon share the Dragon\'s core nature but express it differently.',
  },
  {
    q: 'Is the Dragon the luckiest Chinese zodiac sign?',
    a: 'The Dragon is traditionally seen as the most auspicious and powerful sign, associated with success, ambition and charisma, and many families hope to have children in a Dragon year. That said, every sign carries its own strengths and lucky attributes, and no single animal is universally "best" — Chinese astrology values balance across the whole cycle.',
  },
  {
    q: 'How does Chinese zodiac compatibility work?',
    a: 'Compatibility is based on how the animals relate within the twelve-year cycle. Signs that sit in harmonious groups tend to match well, while opposite signs can clash. For instance, the Dragon pairs strongly with the Rat, Monkey and Rooster, whereas the Horse and Rat are considered a difficult match. Each animal profile below lists its best and worst matches.',
  },
];

function ChineseZodiacCalculator() {
  const [year, setYear] = React.useState('');
  const [result, setResult] = React.useState<ReturnType<typeof calculateChineseZodiac> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYear(val);
    const y = Number(val);
    if (val.length === 4 && y > 0) {
      setResult(calculateChineseZodiac(y));
    } else {
      setResult(null);
    }
  };

  const profile = result ? CHINESE_ZODIAC_PROFILES[result.animal] : null;

  return (
    <div data-testid="chinese-zodiac-calculator"
         className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-red-900 mb-1">
        Chinese Zodiac Calculator — Find Your Animal by Year
      </h3>
      <p className="text-sm text-red-700 mb-4">
        Enter your year of birth to instantly discover your Chinese zodiac animal, element and personality.
      </p>
      <input
        type="number"
        value={year}
        onChange={handleChange}
        min={1}
        max={new Date().getFullYear()}
        placeholder="e.g. 1988"
        className="w-full border-2 border-red-300 rounded-xl px-4 py-3
                   text-base focus:outline-none focus:border-red-500 bg-white mb-4"
        aria-label="Enter your year of birth"
      />
      {result && profile && (
        <div data-testid="chinese-zodiac-result"
             className="bg-white rounded-xl border-2 border-red-300 p-5">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl w-14 text-center flex-shrink-0" aria-hidden="true">{profile.emoji}</span>
            <div>
              <div className="text-2xl font-black text-red-800">{result.animal}</div>
              <div className="text-red-600 font-semibold">{result.element} {result.animal} · {profile.yin_yang}</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {profile.personality_summary}
          </p>
          <div className="flex flex-wrap gap-1 mb-4">
            {profile.strengths.map(s => (
              <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
          <a href={`/birthday-report?year=${year}`}
             className="inline-block bg-red-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-red-700 transition-colors">
            See my complete birthday report →
          </a>
        </div>
      )}
    </div>
  );
}

export function ChineseZodiacArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Chinese Zodiac by Year — Find Your Animal Sign',
    description: 'Chinese zodiac by birth year — find your animal sign and its personality, luck and compatibility. All 12 animals with a free year-to-animal calculator.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/chinese-zodiac-by-year/',
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Chinese Zodiac Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };

  return (
    <>
      <SEO
        title="Chinese Zodiac by Year — Find Your Animal Sign | BornClock"
        description="Chinese zodiac by birth year — find your animal sign and its personality, luck and compatibility. All 12 animals with a free year-to-animal calculator."
        canonicalUrl="/articles/chinese-zodiac-by-year"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />

      <main data-testid="chinese-zodiac-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Chinese Zodiac by Year — Find Your Animal Sign
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            The Chinese zodiac, known as <strong>Shengxiao</strong>, is one of the oldest and most
            beloved systems of astrology in the world. Unlike Western astrology, which assigns a
            sign based on the month you were born, the Chinese zodiac works by <strong>year</strong>.
            It runs in a repeating twelve-year cycle, with each year ruled by one of twelve animals:
            the Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig.
            Whatever year you were born in, one of these animals is your zodiac sign — and it is said
            to shape your personality, your fortune, and even how well you get along with others.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            For thousands of years, families across China and much of East Asia have used the zodiac
            to understand character, choose auspicious wedding dates, and match couples for marriage.
            The sign of the year in which a child is born is celebrated, and certain animal years —
            especially the Dragon — see a noticeable rise in births as parents hope to pass on that
            animal&apos;s legendary good fortune. Use the calculator below to find your animal sign by
            year, then read the full profile for your sign further down the page.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">How the Chinese Zodiac Works</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The twelve animals always appear in the same fixed order, repeating every twelve years.
            According to legend, this order was decided by the <strong>Great Race</strong>: the Jade
            Emperor invited all the animals to a race across a great river, and the first twelve to
            arrive earned a place in the calendar. The quick-thinking Rat hitched a ride on the
            hardworking Ox and leapt off at the finish to win first place — which is why the Rat
            begins the cycle and the Ox comes second.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Layered on top of the twelve animals are the <strong>five elements</strong> — Wood, Fire,
            Earth, Metal and Water. Each animal pairs with an element depending on the exact year,
            and it takes a full <strong>sixty years</strong> for the same animal-and-element
            combination to return. This is why a person born in a Wood Dragon year and one born in a
            Metal Dragon year share the Dragon&apos;s core nature but express it in subtly different ways.
            Our calculator gives you both your animal and your element instantly.
          </p>

          <ChineseZodiacCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">All 12 Chinese Zodiac Animals</h2>
          {ZODIAC_ORDER.map(name => {
            const p = CHINESE_ZODIAC_PROFILES[name];
            if (!p) return null;
            return (
              <section key={name} id={`animal-${name.toLowerCase()}`} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  {p.emoji} {p.animal}
                </h3>
                <div className="text-xs text-gray-500 mb-2">
                  Fixed element: {p.element_fixed} · {p.yin_yang}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {p.personality_summary}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-green-700 mb-1">Strengths</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {p.strengths.map(s => <li key={s}>• {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-700 mb-1">Weaknesses</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {p.weaknesses.map(w => <li key={w}>• {w}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    🎨 {p.lucky_colors.join(', ')}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    🔢 {p.lucky_numbers.join(', ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Best matches: </strong>{p.best_match.join(', ')}.
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Challenging matches: </strong>{p.worst_match.join(', ')}.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Career strengths: </strong>{p.career_strengths}
                </p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Chinese Zodiac in Everyday Life</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The zodiac is far more than a birthday curiosity. Compatibility between animal signs is
            still consulted before many marriages, and the animal of the coming year is a major
            theme of the Lunar New Year celebrations that welcome it. People pay special attention
            to their <strong>Benming Nian</strong> — the year of their own zodiac animal, which
            comes around every twelve years and is traditionally believed to bring both challenges
            and the need for extra care, often marked by wearing red for protection. Understanding
            your sign gives you a window into a living cultural tradition shared by well over a
            billion people. To see your Chinese zodiac animal alongside your other birth signs,
            <a href="/birthday-report" className="text-red-700 font-semibold hover:underline"> generate
            your free birthday report</a> from your full date of birth.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Related Articles</h2>
          <ul className="list-disc pl-6 text-red-700 mb-10 space-y-1">
            <li><a href="/articles/moon-sign-by-date-of-birth" className="hover:underline">Moon Sign by Date of Birth — Find Your Vedic Rashi</a></li>
            <li><a href="/articles/planetary-age-calculator" className="hover:underline">Planetary Age Calculator — Your Age on Every Planet</a></li>
          </ul>

          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Report</h2>
            <p className="text-red-100 mb-6">
              Your Chinese zodiac animal is just one piece. BornClock also shows your Western zodiac,
              Vedic Rashi, Life Path number, days lived and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-red-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-red-50 transition-colors">
              Generate My Free Birthday Report →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default ChineseZodiacArticle;
