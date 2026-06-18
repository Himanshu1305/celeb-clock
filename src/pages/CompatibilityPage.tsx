import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { getCompatibility, ZODIAC_SIGNS } from '@/data/compatibilityData';

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const SIGN_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const BEST_MATCHES: Record<string, string[]> = {
  Aries: ['Leo', 'Sagittarius', 'Gemini'],
  Taurus: ['Virgo', 'Capricorn', 'Cancer'],
  Gemini: ['Libra', 'Aquarius', 'Aries'],
  Cancer: ['Scorpio', 'Pisces', 'Taurus'],
  Leo: ['Aries', 'Sagittarius', 'Libra'],
  Virgo: ['Taurus', 'Capricorn', 'Scorpio'],
  Libra: ['Gemini', 'Aquarius', 'Leo'],
  Scorpio: ['Cancer', 'Pisces', 'Capricorn'],
  Sagittarius: ['Aries', 'Leo', 'Aquarius'],
  Capricorn: ['Taurus', 'Virgo', 'Pisces'],
  Aquarius: ['Gemini', 'Libra', 'Sagittarius'],
  Pisces: ['Cancer', 'Scorpio', 'Capricorn'],
};

export default function CompatibilityPage() {
  const { sign1: paramSign1, sign2: paramSign2 } = useParams<{ sign1?: string; sign2?: string }>();

  const [sign1, setSign1] = useState('');
  const [sign2, setSign2] = useState('');
  const [result, setResult] = useState<ReturnType<typeof getCompatibility> | null>(null);
  const [calcSigns, setCalcSigns] = useState<{ s1: string; s2: string } | null>(null);

  useEffect(() => {
    if (paramSign1 && paramSign2) {
      const s1 = paramSign1.charAt(0).toUpperCase() + paramSign1.slice(1).toLowerCase();
      const s2 = paramSign2.charAt(0).toUpperCase() + paramSign2.slice(1).toLowerCase();
      if (ZODIAC_SIGNS.includes(s1 as typeof ZODIAC_SIGNS[number]) && ZODIAC_SIGNS.includes(s2 as typeof ZODIAC_SIGNS[number])) {
        setSign1(s1);
        setSign2(s2);
        setResult(getCompatibility(s1, s2));
        setCalcSigns({ s1, s2 });
      }
    }
  }, [paramSign1, paramSign2]);

  const handleCalculate = () => {
    if (!sign1 || !sign2) return;
    setResult(getCompatibility(sign1, sign2));
    setCalcSigns({ s1: sign1, s2: sign2 });
  };

  const overallColor = (s: number) =>
    s >= 85 ? 'text-green-600' : s >= 70 ? 'text-blue-600' : s >= 55 ? 'text-amber-600' : 'text-orange-600';

  const overallLabel = (s: number) =>
    s >= 85 ? 'Excellent Match' : s >= 70 ? 'Good Match' : s >= 55 ? 'Moderate Match' : 'Challenging Match';

  const faqItems = [
    { question: 'How does zodiac compatibility work?',
      answer: 'Zodiac compatibility is assessed by comparing the elements (Fire, Earth, Air, Water), modalities (Cardinal, Fixed, Mutable), and ruling planets of two signs. Signs sharing the same element typically have natural understanding. Complementary elements (Fire-Air, Earth-Water) often balance each other. Opposite signs (six signs apart on the wheel) can be intensely attracted while also challenging.' },
    { question: 'Can incompatible signs have great relationships?',
      answer: "Absolutely. Zodiac compatibility reflects natural tendencies and potential areas of friction — it does not determine whether a relationship succeeds. Many deeply loving partnerships exist between traditionally 'incompatible' signs. Personal growth, communication skills, shared values, and life experience matter far more than sun sign compatibility." },
    { question: 'Should I use sun sign or moon sign for compatibility?',
      answer: "Both are valuable but reveal different things. Sun sign compatibility shows how your core identities and life purposes align. Moon sign compatibility shows how your emotional worlds resonate — often considered more important for long-term intimate relationships. For the deepest reading, a full synastry chart comparing all planetary positions is used." },
    { question: 'Which zodiac sign is the best match overall?',
      answer: "There is no single 'best match' for everyone. Each sign has multiple highly compatible partners. Generally, same-element signs share natural understanding, and complementary-element signs provide enriching balance. The key is understanding your own needs and communicating them clearly to any partner." },
  ];

  const seoTitle = calcSigns
    ? `${calcSigns.s1} and ${calcSigns.s2} Compatibility — ${getCompatibility(calcSigns.s1, calcSigns.s2).overall}% Match | BornClock`
    : 'Zodiac Compatibility Calculator — How Compatible Are You? | BornClock';

  return (
    <>
      <SEO
        title={seoTitle}
        description="Calculate zodiac compatibility for any two signs. Free love, friendship, and work compatibility calculator for all 144 sign combinations."
        keywords="zodiac compatibility, are aries and leo compatible, horoscope compatibility, birthday compatibility calculator, love compatibility zodiac"
        canonicalUrl="/compatibility"
      />
      <FAQSchema items={faqItems} />

      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-10">

          <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <span className="text-gray-600">Compatibility Calculator</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Zodiac Compatibility Calculator</h1>
          <PageTagline />

          <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-rose-900 leading-relaxed">
              Zodiac compatibility is assessed by comparing elements, modalities, and planetary energies. Select two signs to see how they align in love, friendship, and work — with full descriptions of strengths, challenges, and practical advice.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">Select two zodiac signs</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{ value: sign1, setter: setSign1, label: 'Sign 1' }, { value: sign2, setter: setSign2, label: 'Sign 2' }].map(({ value, setter, label }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <select
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Choose sign...</option>
                    {ZODIAC_SIGNS.map(s => (
                      <option key={s} value={s}>{SIGN_EMOJIS[s]} {s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={handleCalculate}
              disabled={!sign1 || !sign2}
              className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              Check Compatibility →
            </button>
          </div>

          {result && calcSigns && (
            <div className="mb-10">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 text-white text-center mb-6">
                <div className="flex justify-center items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-5xl mb-1">{SIGN_EMOJIS[calcSigns.s1]}</div>
                    <p className="font-bold">{calcSigns.s1}</p>
                  </div>
                  <div className="text-3xl">💕</div>
                  <div className="text-center">
                    <div className="text-5xl mb-1">{SIGN_EMOJIS[calcSigns.s2]}</div>
                    <p className="font-bold">{calcSigns.s2}</p>
                  </div>
                </div>
                <div className={`text-7xl font-black mb-2 ${overallColor(result.overall).replace('text-', 'text-white')} text-white`}>{result.overall}%</div>
                <p className="text-xl font-bold text-white">{overallLabel(result.overall)}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                <ScoreBar label="❤️ Love & Romance" score={result.love} color="bg-rose-400" />
                <ScoreBar label="🤝 Friendship" score={result.friendship} color="bg-blue-400" />
                <ScoreBar label="💼 Work & Collaboration" score={result.work} color="bg-amber-400" />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{result.description}</p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-700 mb-2">✓ Strengths</p>
                    <ul className="space-y-1">
                      {result.strengths.filter(Boolean).map(s => (
                        <li key={s} className="text-xs text-green-800">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 mb-2">⚠ Challenges</p>
                    <ul className="space-y-1">
                      {result.challenges.filter(Boolean).map(c => (
                        <li key={c} className="text-xs text-amber-800">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-1">💡 Relationship Advice</p>
                  <p className="text-sm text-blue-900">{result.advice}</p>
                </div>
              </div>

              <div className="bg-rose-600 rounded-2xl p-6 text-center text-white">
                <p className="text-lg font-bold mb-1">See your compatibility profile in your Birthday Report</p>
                <p className="text-rose-200 text-sm mb-4">Your top compatible signs + moon sign + tarot card + name numerology + more.</p>
                <Link to="/birthday-report" className="inline-block bg-white text-rose-600 px-8 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-colors">
                  Generate My Report → ₹199
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Matches for Every Sign</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ZODIAC_SIGNS.map(sign => (
                <div key={sign} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{SIGN_EMOJIS[sign]}</span>
                    <span className="font-bold text-gray-900 text-sm">{sign}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {(BEST_MATCHES[sign] || []).map(match => (
                      <Link key={match} to={`/compatibility/${sign.toLowerCase()}/${match.toLowerCase()}`}
                        className="text-xs text-indigo-600 hover:underline">
                        {SIGN_EMOJIS[match]} {match}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How Element Compatibility Works</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: '🔥 Fire + Air', score: '83%', desc: 'Air feeds fire — ideas ignite action. Natural synergy between Fire (Aries, Leo, Sagittarius) and Air (Gemini, Libra, Aquarius) signs.' },
                { title: '🌊 Water + Earth', score: '82%', desc: 'Earth holds water — structure and feeling complement each other. Water (Cancer, Scorpio, Pisces) and Earth (Taurus, Virgo, Capricorn) often thrive together.' },
                { title: '🔥 Fire + Fire', score: '82%', desc: 'Mutual passion and understanding. Both speak the same language — challenge is channelling all that energy without competing.' },
                { title: '🌊 Water + Water', score: '85%', desc: 'Deep emotional resonance. The most intuitive pairings in the zodiac — danger is becoming too insular or emotionally intense.' },
                { title: '🔥 Fire + Water', score: '58%', desc: 'The most challenging combination — fire and water instinctively dampen or scorch each other. Requires significant conscious effort and genuine mutual respect.' },
                { title: '🌍 Air + Earth', score: '60%', desc: 'Ideas meet practicality — can be complementary but often frustrating. Air moves fast; Earth moves methodically. Requires patience from both.' },
              ].map(({ title, score, desc }) => (
                <div key={title} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 text-sm">{title}</span>
                    <span className="text-sm font-bold text-gray-500">{score}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map(({ question, answer }) => (
                <div key={question} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">{question}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { text: 'Western Zodiac', href: '/zodiac' },
                { text: 'Vedic Zodiac', href: '/vedic-zodiac' },
                { text: 'Moon Sign Calculator', href: '/moon-sign' },
                { text: 'Tarot by Birthday', href: '/tarot-card-by-birthday' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-sm text-gray-700 hover:text-rose-700 transition-colors">
                  → {item.text}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
