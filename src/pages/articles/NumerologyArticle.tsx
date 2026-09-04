import React from 'react';
import { SEO } from '@/components/SEO';
import { LIFE_PATH_EXTENDED } from '@/data/astrologicalData';
import { calculateLifePathNumber } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Real Indian examples with calculated Life Path numbers (from indianCelebrities.ts).
const CELEB_EXAMPLES: Record<number, string> = {
  1: 'Bhimrao Ambedkar (April 14, 1891), Rabindranath Tagore (May 7, 1861)',
  2: 'Dharmendra (December 8, 1935), Vicky Kaushal (May 16, 1988)',
  3: 'Guru Nanak Dev (April 15, 1469), Sai Baba of Shirdi (September 28, 1838)',
  4: 'Subhas Chandra Bose (January 23, 1897), Swami Vivekananda (January 12, 1863)',
  5: 'Bal Gangadhar Tilak (July 23, 1856), Sri Aurobindo (August 15, 1872)',
  6: 'Jawaharlal Nehru (November 14, 1889), Ram Prasad Bismil (June 11, 1897)',
  7: 'Vinoba Bhave (September 11, 1895), Kabir Das (June 1, 1440)',
  8: 'Sardar Vallabhbhai Patel (October 31, 1875), Gopal Krishna Gokhale (May 9, 1866)',
  9: 'Mahatma Gandhi (October 2, 1869), Bhagat Singh (September 28, 1907)',
  11: 'Maulana Abul Kalam Azad (November 11, 1888), Sharad Pawar (December 12, 1940)',
  22: 'Usha Uthup (November 8, 1947), M.S. Oberoi (August 15, 1898)',
  33: 'Mahesh Bhatt (September 20, 1948), Puneeth Rajkumar (March 17, 1975)',
};

const FAQS = [
  {
    q: 'What is a Life Path number in numerology?',
    a: 'Your Life Path number is the single most important number in your numerology chart. It is derived from the full digits of your date of birth and reveals your core nature, natural strengths, typical challenges, and the lessons you are here to learn. Unlike personality tests, it is fixed at birth and never changes.',
  },
  {
    q: 'How do I calculate my Life Path number from my date of birth?',
    a: 'Reduce your day, month, and full year each to a single digit (or a master number 11, 22, 33), then add those three results together and reduce again. For example, March 28, 1973: day 28→1, month 3, year 1973→2; 1+3+2 = 6, giving Life Path 6.',
  },
  {
    q: 'Which Life Path number is most successful in India?',
    a: 'No single number is "best" — each Life Path has its own kind of success. Life Path 8 (The Achiever) is traditionally associated with business and authority, Life Path 1 with leadership, and the master numbers 11, 22 and 33 with exceptional vision and service. Success depends on how you work with your number\'s energy, not on the number itself.',
  },
  {
    q: 'Is numerology accurate for predicting the future?',
    a: 'Numerology is a system of self-understanding and reflection, not fortune-telling. It describes tendencies, strengths and challenges — it does not predict specific events. BornClock presents numerology as cultural insight and a tool for self-reflection, never as a guaranteed forecast.',
  },
  {
    q: 'How does BornClock calculate my numerology profile?',
    a: 'BornClock uses the standard Pythagorean reduction method on your date of birth, preserving master numbers 11, 22 and 33. Your Life Path number is calculated instantly and paired with a full profile — ruling planet, element, strengths, challenges, love style, career paths and spiritual lesson.',
  },
];

function LifePathCalculator() {
  const [dob, setDob] = React.useState('');
  const [result, setResult] = React.useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        setResult(calculateLifePathNumber(day, month, year));
      }
    }
  };

  const profile = result ? LIFE_PATH_EXTENDED[result] : null;

  return (
    <div data-testid="lp-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Calculate Your Life Path Number Free
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Enter your date of birth to instantly find your Life Path number.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                   text-base focus:outline-none focus:border-indigo-500 bg-white mb-4"
        aria-label="Enter your date of birth"
      />
      {profile && result && (
        <div data-testid="lp-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center
                            justify-center text-2xl font-black text-white flex-shrink-0">
              {result}
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">Life Path {result}</div>
              <div className="text-indigo-600 font-semibold">{profile.title}</div>
              <div className="text-xs text-gray-500">{profile.ruling_planet} · {profile.element}</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{profile.traits}</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {profile.strengths.map(s => (
              <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            See my complete birthday profile →
          </a>
        </div>
      )}
    </div>
  );
}

export function NumerologyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Numerology by Date of Birth — Find Your Life Path Number (India Guide)',
    description: 'Calculate your Life Path number by date of birth. All 9 life paths explained with famous Indian examples and a free calculator.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/numerology-by-date-of-birth/',
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

  return (
    <>
      <SEO
        title="Numerology by Date of Birth — Life Path Number Guide India | BornClock"
        description="Calculate your Life Path number by date of birth. All 9 life paths explained with famous Indian examples, compatibility guide, and free calculator."
        canonicalUrl="/articles/numerology-by-date-of-birth"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="numerology-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Numerology by Date of Birth — Find Your Life Path Number (India Guide)
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Numerology is one of the oldest systems of self-understanding, used across
            cultures for thousands of years to reveal personality, purpose, and potential
            from a person's birth date. In India, numerology has deep roots — from the
            Vedic tradition of Jyotish to everyday decisions about auspicious dates,
            business names, and compatibility matching. At BornClock, every birth date
            is automatically analysed to reveal your Life Path number — the single most
            important number in your numerological chart.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your Life Path number is calculated from the full digits of your date of birth
            and never changes. Unlike personality tests that depend on how you answer
            questions, your Life Path is fixed at birth — a mathematical constant that
            reveals your core nature, natural strengths, typical challenges, and the
            lessons you are here to learn.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">How to Calculate Your Life Path Number</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Your Life Path number is found by reducing each part of your date of birth to a
            single digit, then adding those together and reducing once more. Take the example
            of <strong>March 28, 1973</strong>:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Day:</strong> 28 → 2 + 8 = 10 → 1 + 0 = 1</li>
            <li><strong>Month:</strong> 3 (March)</li>
            <li><strong>Year:</strong> 1973 → 1 + 9 + 7 + 3 = 20 → 2 + 0 = 2</li>
            <li><strong>Total:</strong> 1 + 3 + 2 = 6 → <strong>Life Path 6</strong></li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            One important exception: the <strong>master numbers 11, 22, and 33</strong> are
            never reduced. If any stage of the calculation — or the final total — produces
            11, 22, or 33, you keep it as-is. These carry a heightened, more demanding version
            of their reduced counterparts (2, 4, and 6 respectively).
          </p>

          <LifePathCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">All Life Path Numbers Explained</h2>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map(n => {
            const p = LIFE_PATH_EXTENDED[n];
            if (!p) return null;
            return (
              <section key={n} id={`life-path-${n}`} className="mb-10">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  Life Path {n} — {p.title}
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  Ruling Planet: {p.ruling_planet} · Element: {p.element}
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{p.traits}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-green-700 mb-1">Strengths</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {p.strengths.map(s => <li key={s}>• {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-700 mb-1">Challenges</h4>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {p.challenges.map(c => <li key={c}>• {c}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Love: </strong>{p.love_style}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Career paths: </strong>{p.career_paths.join(', ')}.
                </p>
                <p className="text-sm text-indigo-700 mb-3 italic">
                  <strong>Spiritual lesson: </strong>{p.spiritual_lesson}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Famous Indians with Life Path {n}: </strong>
                  {CELEB_EXAMPLES[n] || 'Examples being added.'}
                </p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-indigo-200 mb-6">
              Your Life Path is just one piece. BornClock also shows your Vedic Rashi,
              Western zodiac, Nakshatra, lucky stone, and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default NumerologyArticle;
