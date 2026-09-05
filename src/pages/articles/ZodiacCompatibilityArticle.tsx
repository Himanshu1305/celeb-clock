import React from 'react';
import { SEO } from '@/components/SEO';
import { WESTERN_ZODIAC_PROFILES } from '@/data/astrologicalData';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

type MatchType = 'compatible' | 'challenging' | 'neutral';

function classifyMatch(signA: string, signB: string): { type: MatchType; note: string } {
  const profile = WESTERN_ZODIAC_PROFILES[signA];
  if (!profile) return { type: 'neutral', note: 'No data available for this sign.' };
  if (profile.love_compatibility.includes(signB)) {
    return {
      type: 'compatible',
      note: `${signB} is one of ${signA}'s natural love matches — this pairing tends to feel easy, energising, and built to last.`,
    };
  }
  if (profile.challenging_signs.includes(signB)) {
    return {
      type: 'challenging',
      note: `${signB} is a challenging match for ${signA}. Sparks can fly, but real effort and compromise are needed to make it work.`,
    };
  }
  return {
    type: 'neutral',
    note: `${signB} is a neutral match for ${signA} — neither a classic soulmate pairing nor an obvious clash. Compatibility here comes down to the people, not just the stars.`,
  };
}

const FAQS = [
  {
    q: 'What is zodiac compatibility?',
    a: 'Zodiac compatibility is the study of how well two star signs get along in love, friendship, and everyday life. It is based on the elements (Fire, Earth, Air, Water), the ruling planets, and the traditional patterns astrologers have noticed between signs. BornClock uses each sign\'s documented love matches and challenging signs — never invented pairings — to show you where two signs naturally align.',
  },
  {
    q: 'Which zodiac signs are most compatible?',
    a: 'Signs sharing a compatible element usually match best: Fire signs (Aries, Leo, Sagittarius) energise each other, Earth signs (Taurus, Virgo, Capricorn) build stability together, Air signs (Gemini, Libra, Aquarius) connect through ideas, and Water signs (Cancer, Scorpio, Pisces) bond deeply through emotion. For example, Scorpio and Cancer are a classic, deeply compatible Water pairing.',
  },
  {
    q: 'Do challenging signs mean a relationship will fail?',
    a: 'No. A "challenging" match simply means two signs approach life differently, so the relationship needs more conscious effort, communication, and compromise. Many long, happy partnerships are between challenging signs. Astrology describes tendencies, not destiny — the people involved always matter more than the chart.',
  },
  {
    q: 'Is sun sign compatibility enough to judge a relationship?',
    a: 'Sun sign compatibility is a useful starting point, but it is only one layer. A full picture also considers moon signs (emotional needs), rising signs, and the placements of Venus and Mars. BornClock offers moon-sign and Vedic tools alongside this guide so you can go deeper than the sun sign alone.',
  },
  {
    q: 'How does the BornClock zodiac compatibility checker work?',
    a: 'The checker lets you pick any two of the 12 signs. It then reads the first sign\'s official love-compatibility and challenging-signs lists from BornClock\'s astrology data and tells you whether the pair is compatible, challenging, or neutral — with a short note. It is free, instant, and needs only the two signs you want to compare.',
  },
];

function ZodiacCompatCalculator() {
  const [signA, setSignA] = React.useState('Scorpio');
  const [signB, setSignB] = React.useState('Cancer');

  const result = classifyMatch(signA, signB);
  const badge = {
    compatible: { label: '💖 Compatible', cls: 'bg-green-100 text-green-800 border-green-300' },
    challenging: { label: '⚡ Challenging', cls: 'bg-red-100 text-red-800 border-red-300' },
    neutral: { label: '🤝 Neutral', cls: 'bg-gray-100 text-gray-700 border-gray-300' },
  }[result.type];

  const selectCls =
    'w-full border-2 border-pink-300 rounded-xl px-4 py-3 text-base bg-white ' +
    'focus:outline-none focus:border-pink-500';

  return (
    <div data-testid="zodiac-compat-calculator"
         className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-pink-900 mb-1">
        Free Zodiac Compatibility Checker
      </h3>
      <p className="text-sm text-pink-700 mb-4">
        Pick any two signs to see whether they are a compatible, challenging, or neutral match.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="signA" className="block text-xs font-bold text-pink-800 mb-1">
            First sign
          </label>
          <select id="signA" value={signA} onChange={e => setSignA(e.target.value)}
                  className={selectCls} aria-label="Select the first zodiac sign">
            {SIGN_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="signB" className="block text-xs font-bold text-pink-800 mb-1">
            Second sign
          </label>
          <select id="signB" value={signB} onChange={e => setSignB(e.target.value)}
                  className={selectCls} aria-label="Select the second zodiac sign">
            {SIGN_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div data-testid="zodiac-compat-result"
           className="bg-white rounded-xl border-2 border-pink-300 p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="text-xl font-black text-gray-900">
            {WESTERN_ZODIAC_PROFILES[signA]?.symbol} {signA}
            <span className="text-pink-400 mx-2">+</span>
            {WESTERN_ZODIAC_PROFILES[signB]?.symbol} {signB}
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.note}</p>
        <a href="/birthday-report"
           className="inline-block bg-pink-600 text-white font-bold px-5 py-2.5
                      rounded-full text-sm hover:bg-pink-700 transition-colors">
          See both signs in a full birthday report →
        </a>
      </div>
    </div>
  );
}

export function ZodiacCompatibilityArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Zodiac Compatibility — Which Signs Match Best?',
    description: 'Zodiac compatibility guide — how all 12 signs match in love and friendship, with the best and worst matches for every sign and a free compatibility checker.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/zodiac-compatibility/',
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
    name: 'Zodiac Compatibility Checker',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };

  return (
    <>
      <SEO
        title="Zodiac Compatibility — Which Signs Match Best? | BornClock"
        description="Zodiac compatibility guide — how all 12 signs match in love and friendship. Free compatibility checker plus the best and worst matches for every sign."
        canonicalUrl="/articles/zodiac-compatibility"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />

      <main data-testid="zodiac-compatibility-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Zodiac Compatibility — Which Zodiac Signs Match Best?
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Few questions are as universal — or as fun — as "are we compatible?" Zodiac
            compatibility looks at how the 12 star signs blend in love, friendship, and daily
            life. It is one of the oldest lenses people have used to understand attraction,
            chemistry, and the small frictions that make or break a relationship. This guide
            covers the best and worst matches for every sign, explains why some pairings click
            instantly while others take work, and gives you a free compatibility checker to test
            any two signs in seconds.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Every compatibility rating on this page comes from BornClock's own astrology data —
            each sign's documented love matches and challenging signs. Nothing here is invented.
            Remember, though: astrology describes tendencies, not certainties. A "challenging"
            pairing is not doomed, and a "compatible" one still needs care. The stars set the
            stage; the two of you write the story.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">How Zodiac Compatibility Works</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Traditional compatibility rests mostly on the four <strong>elements</strong> and how
            their energies interact:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Fire</strong> (Aries, Leo, Sagittarius) — bold, passionate, and energising.</li>
            <li><strong>Earth</strong> (Taurus, Virgo, Capricorn) — grounded, loyal, and practical.</li>
            <li><strong>Air</strong> (Gemini, Libra, Aquarius) — social, curious, and idea-driven.</li>
            <li><strong>Water</strong> (Cancer, Scorpio, Pisces) — emotional, intuitive, and deep.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            As a rule of thumb, signs of the same element understand each other instinctively,
            while Fire pairs beautifully with Air (which feeds the flame) and Earth harmonises
            with Water (which nourishes the ground). Clashes tend to appear between elements that
            work against each other — but plenty of loving couples defy the chart entirely, which
            is exactly why the note below every match matters more than the label.
          </p>

          <ZodiacCompatCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">Compatibility for All 12 Zodiac Signs</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Below is the best-and-worst-match breakdown for each of the twelve signs. The
            "Best matches" are each sign's natural love-compatibility signs; the "Challenging
            matches" are the pairings that traditionally need extra patience and understanding.
          </p>

          {SIGN_ORDER.map(name => {
            const p = WESTERN_ZODIAC_PROFILES[name];
            if (!p) return null;
            return (
              <section key={name} id={`sign-${name.toLowerCase()}`} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  {p.symbol} {p.sign} Compatibility
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  {p.element} · {p.modality} · Ruled by {p.ruling_planet} · {p.date_range}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-green-700 mb-1">💖 Best matches</h4>
                    <div className="flex flex-wrap gap-1">
                      {p.love_compatibility.map(m => (
                        <span key={m} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-red-700 mb-1">⚡ Challenging matches</h4>
                    <div className="flex flex-wrap gap-1">
                      {p.challenging_signs.map(m => (
                        <span key={m} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  As a {p.element} {p.modality} sign, {p.sign} bonds most easily with{' '}
                  {p.love_compatibility.join(', ')} and finds the most friction with{' '}
                  {p.challenging_signs.join(' and ')}. {p.personality_summary}
                </p>
              </section>
            );
          })}

          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl
               p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">Check Your Own Cosmic Match</h2>
            <p className="text-pink-100 mb-6">
              Your sun sign is only the beginning. A full BornClock birthday report reveals your
              Western zodiac, Vedic Rashi, moon sign, Life Path number, and more — everything you
              need to understand your relationships in depth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-pink-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-pink-50 transition-colors">
              Generate My Free Birthday Report →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Compatibility Is a Guide, Not a Verdict</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The best way to use zodiac compatibility is as a mirror for conversation, not a rule
            book. If your signs are a classic match, enjoy the easy chemistry — but never stop
            putting in the effort. If your signs are "challenging", treat that as a map of where
            you differ, so you can meet each other with patience instead of surprise. Sun-sign
            compatibility is a starting point; your moon signs, rising signs, and life paths add
            far richer detail. Curious how deep it goes? Generate a full{' '}
            <a href="/birthday-report" className="text-pink-600 font-semibold underline">
              free birthday report
            </a>{' '}
            for you and your partner and compare the two side by side.
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

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/moon-sign-by-date-of-birth"
                   className="text-pink-600 font-semibold hover:underline">
                  Moon Sign by Date of Birth — Find Your Vedic Rashi →
                </a>
              </li>
              <li>
                <a href="/articles/life-path-number-compatibility"
                   className="text-pink-600 font-semibold hover:underline">
                  Life Path Number Compatibility — Numerology in Love →
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default ZodiacCompatibilityArticle;
