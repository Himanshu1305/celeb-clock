import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { calculateAllNameNumbers, getLetterBreakdown, NAME_NUMBER_MEANINGS } from '@/data/nameNumerologyData';

type NumberType = 'expression' | 'soulUrge' | 'personality';

const NUMBER_TYPE_INFO: Record<NumberType, { label: string; subtitle: string; color: string; bgColor: string; borderColor: string }> = {
  expression: { label: 'Expression Number', subtitle: 'Calculated from all letters — who you are destined to be', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300' },
  soulUrge: { label: 'Soul Urge Number', subtitle: "Calculated from vowels — what your heart truly desires", color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-300' },
  personality: { label: 'Personality Number', subtitle: 'Calculated from consonants — how others see you', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300' },
};

export default function NameNumerologyPage() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateAllNameNumbers> | null>(null);
  const [breakdown, setBreakdown] = useState<ReturnType<typeof getLetterBreakdown>>([]);
  const [activeType, setActiveType] = useState<NumberType>('expression');

  const handleCalculate = () => {
    if (!name.trim()) return;
    setResult(calculateAllNameNumbers(name));
    setBreakdown(getLetterBreakdown(name));
  };

  const faqItems = [
    { question: 'What is name numerology?',
      answer: 'Name numerology (also called the Pythagorean system) assigns a number 1–9 to each letter of the alphabet. By summing the numbers corresponding to the letters in your full name, you calculate three key numbers: your Expression Number (all letters), Soul Urge Number (vowels only), and Personality Number (consonants only). Each number reveals a different dimension of your character and destiny.' },
    { question: 'Should I use my full birth name or current name?',
      answer: 'Traditional numerology uses the full name given at birth — including middle names — as it carries the original energetic imprint. However, calculating your current commonly-used name can reveal how you are presenting to the world today. Many numerologists calculate both and compare them.' },
    { question: "What is the difference between Pythagorean and Chaldean numerology?",
      answer: "Pythagorean numerology (this calculator) assigns letters sequentially: A=1, B=2, C=3... This is the most widely used system in the West. Chaldean numerology uses a different, older assignment based on vibration: A=1, B=2, C=3, D=4, E=5, U=6, O=7, F=8, with no letter assigned the number 9 (considered sacred). Both systems have their proponents." },
    { question: 'What are master numbers?',
      answer: 'In numerology, 11, 22, and 33 are considered Master Numbers — they are not reduced to a single digit because they carry heightened spiritual significance. If your name reduces to 11 (the Inspirational Messenger), 22 (the Master Builder), or 33 (the Master Teacher), these are considered particularly powerful name vibrations.' },
  ];

  const getMeaning = (num: number, type: NumberType) => {
    const m = NAME_NUMBER_MEANINGS[num];
    if (!m) return 'This number carries unique energy — its meaning is found in the context of your full chart.';
    return m[type];
  };

  return (
    <>
      <SEO
        title="Name Numerology Calculator — Expression, Soul Urge & Personality Numbers | BornClock"
        description="Calculate your Expression Number, Soul Urge Number, and Personality Number from your name. Free Pythagorean name numerology calculator with full meanings."
        keywords="name numerology calculator, numerology by name, expression number calculator, soul urge number, name number meaning, personality number"
        canonicalUrl="/name-numerology"
      />
      <FAQSchema items={faqItems} />

      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Navigation />
            <AuthNav />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-10">

          <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <span className="text-gray-600">Name Numerology</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Name Numerology Calculator</h1>
          <PageTagline />

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Every letter in your name carries a numerical vibration. Together, they reveal three distinct numbers: your Expression Number (who you're destined to be), your Soul Urge Number (what your heart truly wants), and your Personality Number (how others perceive you). Enter your full birth name below.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter your full birth name</p>
            <div className="flex gap-3 mb-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                placeholder="e.g. Ravi Shankar Kumar"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Calculate →
              </button>
            </div>
            <p className="text-xs text-gray-400">Use your full name as given at birth, including middle name(s), for the most accurate reading.</p>
          </div>

          {result && (
            <div className="mb-10">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(Object.keys(NUMBER_TYPE_INFO) as NumberType[]).map(type => {
                  const info = NUMBER_TYPE_INFO[type];
                  const num = result[type];
                  return (
                    <button key={type} onClick={() => setActiveType(type)}
                      className={`rounded-2xl p-4 text-center border-2 transition-all ${
                        activeType === type ? `${info.bgColor} ${info.borderColor}` : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className={`text-4xl font-black mb-1 ${activeType === type ? info.color : 'text-gray-700'}`}>{num}</div>
                      <div className="text-xs font-semibold text-gray-600">{type === 'expression' ? 'Expression' : type === 'soulUrge' ? 'Soul Urge' : 'Personality'}</div>
                    </button>
                  );
                })}
              </div>

              {(Object.keys(NUMBER_TYPE_INFO) as NumberType[]).map(type => {
                if (activeType !== type) return null;
                const info = NUMBER_TYPE_INFO[type];
                const num = result[type];
                const meaning = NAME_NUMBER_MEANINGS[num];
                return (
                  <div key={type} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl ${info.bgColor} flex items-center justify-center text-3xl font-black ${info.color} flex-shrink-0`}>
                        {num}
                      </div>
                      <div>
                        <h2 className="font-black text-gray-900 text-lg">{info.label} · {meaning?.title || `Number ${num}`}</h2>
                        <p className="text-xs text-gray-500">{info.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{getMeaning(num, type)}</p>
                    {meaning && (
                      <>
                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Best Career Paths</p>
                          <div className="flex flex-wrap gap-2">
                            {meaning.bestCareers.map(c => (
                              <span key={c} className={`text-xs ${info.bgColor} ${info.color} px-3 py-1 rounded-full`}>{c}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Famous people with this number</p>
                          <div className="flex flex-wrap gap-2">
                            {meaning.famousNames.map(n => (
                              <span key={n} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{n}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Letter-by-letter breakdown</p>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.map((item, i) => (
                    <div key={i} className={`rounded-lg px-2 py-2 text-center min-w-[36px] ${item.isVowel ? 'bg-rose-50 border border-rose-200' : 'bg-indigo-50 border border-indigo-200'}`}>
                      <div className={`text-xs font-black ${item.isVowel ? 'text-rose-700' : 'text-indigo-700'}`}>{item.letter}</div>
                      <div className="text-xs text-gray-500">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span><span className="inline-block w-3 h-3 bg-rose-100 border border-rose-200 rounded mr-1"></span>Vowels (Soul Urge)</span>
                  <span><span className="inline-block w-3 h-3 bg-indigo-100 border border-indigo-200 rounded mr-1"></span>Consonants (Personality)</span>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get your complete Birthday Intelligence Report</p>
                <p className="text-indigo-200 text-sm mb-4">Your name numerology + moon sign + tarot card + 12 more sections — personalised to your exact birthday.</p>
                <Link to="/birthday-report" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                  Generate My Report → ₹199
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Nine Name Numbers Explained</h2>
            <div className="space-y-3">
              {Object.entries(NAME_NUMBER_MEANINGS).map(([num, m]) => (
                <div key={num} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center">{num}</span>
                    <span className="font-bold text-gray-900">{m.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.expression.slice(0, 180)}...</p>
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
                { text: 'Numerology Calculator', href: '/numerology' },
                { text: 'Tarot by Birthday', href: '/tarot-card-by-birthday' },
                { text: 'Moon Sign Calculator', href: '/moon-sign' },
                { text: 'Biorhythm Calculator', href: '/biorhythm' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">
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
