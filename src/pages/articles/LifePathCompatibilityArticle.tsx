import React from 'react';
import { SEO } from '@/components/SEO';
import { LIFE_PATH_EXTENDED } from '@/data/astrologicalData';
import { calculateLifePathNumber } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const LIFE_PATH_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

// Which numbers each Life Path most naturally harmonises with, per traditional
// numerology compatibility (grouped by shared temperament and complementary energy).
const HARMONY: Record<number, number[]> = {
  1:  [3, 5, 9],
  2:  [6, 8, 9],
  3:  [1, 5, 9],
  4:  [2, 7, 8],
  5:  [1, 3, 7],
  6:  [2, 8, 9],
  7:  [4, 5, 9],
  8:  [2, 4, 6],
  9:  [1, 3, 6],
  11: [2, 6, 8],
  22: [4, 6, 8],
  33: [6, 9, 22],
};

// Reduce a master number to its base for like-minded comparison notes.
function baseOf(n: number): number {
  if (n === 11) return 2;
  if (n === 22) return 4;
  if (n === 33) return 6;
  return n;
}

function compatibilityNote(a: number, b: number): string {
  const pa = LIFE_PATH_EXTENDED[a];
  const pb = LIFE_PATH_EXTENDED[b];
  const ba = baseOf(a);
  const bb = baseOf(b);
  if (a === b) {
    return `Two ${a}s share the same core rhythm as ${pa.title.toLowerCase()}s — an instantly familiar match that flows easily, though you will need to guard against amplifying each other's blind spots.`;
  }
  if (ba === bb) {
    return `${pa.title} (${a}) and ${pb.title} (${b}) run on the same underlying vibration, so you understand each other intuitively — one simply carries a more intense, master-number charge.`;
  }
  if (HARMONY[a]?.includes(b) || HARMONY[b]?.includes(a)) {
    return `${pa.title} (${a}) and ${pb.title} (${b}) are a naturally harmonious pairing: your strengths cover each other's gaps, making for an easy, mutually supportive connection.`;
  }
  return `${pa.title} (${a}) and ${pb.title} (${b}) are a growth pairing rather than an effortless one. The differences that create friction early on can, with awareness, become your greatest source of balance.`;
}

const FAQS = [
  {
    q: 'What is Life Path number compatibility?',
    a: 'Life Path number compatibility looks at how two people\'s Life Path numbers — each derived from their full date of birth and reduced to 1–9 or a master number 11, 22 or 33 — interact in love and partnership. Numbers that share a temperament or complement each other tend to harmonise, while very different numbers require more conscious effort to balance.',
  },
  {
    q: 'How do I find my Life Path number for a compatibility check?',
    a: 'Reduce your birth day, month and full year each to a single digit (keeping master numbers 11, 22 and 33), then add the three results and reduce once more. Or use the calculator on this page: enter two dates of birth and it instantly returns both Life Path numbers, their titles and a compatibility note.',
  },
  {
    q: 'Which Life Path numbers are most compatible?',
    a: 'There is no single "best" pairing. In general, 1 pairs well with 3, 5 and 9; 2 with 6, 8 and 9; and 6 is one of the most universally harmonious numbers, blending naturally with 2, 8, 9 and the master numbers. Master numbers 11, 22 and 33 harmonise strongly with their base numbers (2, 4 and 6) and with each other.',
  },
  {
    q: 'Are master numbers 11, 22 and 33 compatible with single-digit Life Paths?',
    a: 'Yes. Master numbers carry a heightened version of their base number — 11 relates to 2, 22 to 4, and 33 to 6 — so they connect most easily with those base energies and with fellow master numbers. They can pair with any number, but their intensity means grounding, patient partners often suit them best.',
  },
  {
    q: 'Does an incompatible Life Path number mean a relationship will fail?',
    a: 'No. Numerology describes tendencies, not destiny. A "growth" pairing simply means two numbers start with more differences to reconcile — those differences often become the relationship\'s greatest strength. BornClock presents Life Path compatibility as a tool for reflection and understanding, never as a prediction or guarantee.',
  },
];

function LifePathCompatCalculator() {
  const [dobA, setDobA] = React.useState('');
  const [dobB, setDobB] = React.useState('');

  const lpA = React.useMemo(() => {
    if (dobA.length !== 10) return null;
    const [y, m, d] = dobA.split('-').map(Number);
    if (!y || !m || !d) return null;
    return calculateLifePathNumber(d, m, y);
  }, [dobA]);

  const lpB = React.useMemo(() => {
    if (dobB.length !== 10) return null;
    const [y, m, d] = dobB.split('-').map(Number);
    if (!y || !m || !d) return null;
    return calculateLifePathNumber(d, m, y);
  }, [dobB]);

  const profileA = lpA ? LIFE_PATH_EXTENDED[lpA] : null;
  const profileB = lpB ? LIFE_PATH_EXTENDED[lpB] : null;
  const both = lpA !== null && lpB !== null && profileA && profileB;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div data-testid="lp-compat-calculator"
         className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-rose-900 mb-1">
        Life Path Compatibility Calculator — Free
      </h3>
      <p className="text-sm text-rose-700 mb-4">
        Enter two dates of birth to reveal both Life Path numbers and how they match.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block text-xs font-bold text-rose-800 mb-1" htmlFor="lp-dob-a">
            Person 1 — date of birth
          </label>
          <input
            id="lp-dob-a"
            type="date"
            value={dobA}
            max={today}
            onChange={(e) => setDobA(e.target.value)}
            className="w-full border-2 border-rose-300 rounded-xl px-4 py-3 text-base
                       bg-white focus:outline-none focus:border-rose-500"
            aria-label="Person 1 date of birth"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-rose-800 mb-1" htmlFor="lp-dob-b">
            Person 2 — date of birth
          </label>
          <input
            id="lp-dob-b"
            type="date"
            value={dobB}
            max={today}
            onChange={(e) => setDobB(e.target.value)}
            className="w-full border-2 border-rose-300 rounded-xl px-4 py-3 text-base
                       bg-white focus:outline-none focus:border-rose-500"
            aria-label="Person 2 date of birth"
          />
        </div>
      </div>

      {both && (
        <div data-testid="lp-compat-result"
             className="bg-white rounded-xl border-2 border-rose-300 p-5 mt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[{ n: lpA!, p: profileA! }, { n: lpB!, p: profileB! }].map((x, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto bg-rose-600 rounded-full flex items-center
                                justify-center text-2xl font-black text-white mb-2">
                  {x.n}
                </div>
                <div className="text-lg font-black text-gray-900">Life Path {x.n}</div>
                <div className="text-rose-600 font-semibold text-sm">{x.p.title}</div>
              </div>
            ))}
          </div>
          <div className="bg-rose-50 rounded-lg p-4 mb-4">
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wide mb-1">
              Compatibility note
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {compatibilityNote(lpA!, lpB!)}
            </p>
          </div>
          <a href={`/birthday-report?dob=${dobA}`}
             className="inline-block bg-rose-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-rose-700 transition-colors">
            See the full birthday profile →
          </a>
        </div>
      )}
    </div>
  );
}

export function LifePathCompatibilityArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Life Path Number Compatibility — Numerology Love Match Guide',
    description: 'How Life Path numbers 1-9 and master numbers 11, 22, 33 match in love, with a free compatibility calculator and full matrix.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/life-path-number-compatibility/',
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
    name: 'Life Path Compatibility Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };

  return (
    <>
      <SEO
        title="Life Path Number Compatibility — Numerology Love Match | BornClock"
        description="Life Path number compatibility guide — how numbers 1-9 and master numbers 11, 22, 33 match in love. Free calculator plus a full compatibility matrix."
        canonicalUrl="/articles/life-path-number-compatibility"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />

      <main data-testid="life-path-compatibility-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Life Path Number Compatibility — Your Numerology Love Match
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Of all the tools in numerology, none is used more often for relationships than the
            Life Path number. Calculated from your full date of birth and fixed for life, your
            Life Path reveals your core nature, your natural strengths, and the lessons you are
            here to learn. When you place two people's Life Path numbers side by side, you get a
            surprisingly rich picture of how their temperaments meet — where they flow together
            easily, and where they will have to work.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            This guide explains how Life Path number compatibility works, walks through all
            twelve Life Paths — the single digits 1 through 9 plus the three master numbers
            11, 22 and 33 — and gives you a free calculator that reads two dates of birth at
            once. Think of it as a starting point for understanding, not a verdict: numerology
            describes tendencies, never destiny.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">How Life Path Compatibility Works</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Every Life Path number carries a distinct energy. Some numbers naturally resonate
            because they share a temperament; others complement each other, one supplying what
            the other lacks. Traditional numerology groups the harmonies roughly like this:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>The independent numbers (1, 5, 7):</strong> value freedom and space, and pair best with partners who won't smother them.</li>
            <li><strong>The relational numbers (2, 6, 9):</strong> are wired for partnership and harmony, and get on with almost everyone.</li>
            <li><strong>The creative and expansive numbers (3, 5):</strong> keep things lively and thrive with equally spontaneous partners.</li>
            <li><strong>The grounded, goal-driven numbers (4, 8):</strong> build stability together and appreciate reliability above novelty.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The <strong>master numbers 11, 22 and 33</strong> deserve special mention. They are
            never reduced, and each carries a heightened version of a base number: <strong>11
            relates to 2</strong>, <strong>22 to 4</strong>, and <strong>33 to 6</strong>. That
            means a master number connects most easily with its base energy and with fellow
            master numbers — but its intensity often calls for a grounded, patient partner who
            can hold steady while the master number reaches high.
          </p>

          <LifePathCompatCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">Every Life Path Number and Who It Matches</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Below are all twelve Life Paths with their traits pulled directly from BornClock's
            data, followed by the numbers each one tends to harmonise with in love.
          </p>
          {LIFE_PATH_ORDER.map(n => {
            const p = LIFE_PATH_EXTENDED[n];
            if (!p) return null;
            const partners = HARMONY[n] || [];
            return (
              <section key={n} id={`life-path-${n}`} className="mb-9">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  Life Path {n} — {p.title}
                </h3>
                <div className="text-xs text-gray-500 mb-2">
                  Ruling Planet: {p.ruling_planet} · Element: {p.element}
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{p.traits}</p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>In love: </strong>{p.love_style}
                </p>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                    Most harmonious with:{' '}
                  </span>
                  <span className="text-sm text-gray-700">
                    {partners.map((m, i) => {
                      const pm = LIFE_PATH_EXTENDED[m];
                      return (
                        <React.Fragment key={m}>
                          {i > 0 && ', '}
                          <strong>{m}</strong> ({pm.title})
                        </React.Fragment>
                      );
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  <strong>Growth pairing note: </strong>{p.spiritual_lesson}
                </p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Life Path Compatibility Matrix</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A compatibility matrix simply crosses every Life Path number against every other one
            and marks how the pairing tends to feel. Rather than a rigid grid of scores, it helps
            to read the matrix in three bands:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Natural matches:</strong> numbers listed as "most harmonious" for each other above — the connection is easy and mutually supportive from the start.</li>
            <li><strong>Same-vibration matches:</strong> identical numbers, or a master number with its base (11 with 2, 22 with 4, 33 with 6). You understand each other instinctively, though you may share the same weaknesses.</li>
            <li><strong>Growth pairings:</strong> numbers with very different temperaments. These take conscious effort, but the friction that shows up early often matures into genuine balance — the practical 4 steadies the restless 5, the visionary 11 lifts the grounded 8.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The key insight of any Life Path compatibility matrix is that <em>no pairing is
            doomed and none is guaranteed</em>. The numbers describe where the current flows with
            you and where you must paddle. Two well-matched numbers can still drift apart without
            care, and a "difficult" pairing can become one of the most rewarding once both people
            understand what each number needs.
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

          <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">See Your Complete Birthday Profile</h2>
            <p className="text-rose-100 mb-6">
              Your Life Path is just one layer of the picture. BornClock reads your Vedic Rashi,
              Western zodiac, Nakshatra, lucky stone and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-rose-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-rose-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/numerology-by-date-of-birth"
                   className="text-rose-700 font-semibold hover:underline">
                  Numerology by Date of Birth — Find Your Life Path Number →
                </a>
              </li>
              <li>
                <a href="/articles/moon-sign-by-date-of-birth"
                   className="text-rose-700 font-semibold hover:underline">
                  Moon Sign by Date of Birth — Find Your Vedic Rashi →
                </a>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Ready to go deeper? Your{' '}
              <a href="/birthday-report" className="text-rose-700 font-semibold hover:underline">
                free birthday report
              </a>{' '}
              combines your Life Path with your full astrology profile.
            </p>
          </div>

        </article>
      </main>
    </>
  );
}

export default LifePathCompatibilityArticle;
