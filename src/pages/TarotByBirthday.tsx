import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { getTarotCardByLifePath, MAJOR_ARCANA, type TarotCard } from '@/data/tarotData';

function calculateLifePath(day: number, month: number, year: number): number {
  const sum =
    String(day).split('').reduce((s, d) => s + parseInt(d), 0) +
    String(month).split('').reduce((s, d) => s + parseInt(d), 0) +
    String(year).split('').reduce((s, d) => s + parseInt(d), 0);
  let n = sum;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

type TabKey = 'meaning' | 'love' | 'career' | 'health' | 'spirituality';

export default function TarotByBirthday() {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<{ lifePathNumber: number; card: TarotCard } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('meaning');

  const handleCalculate = () => {
    if (!dob) return;
    const [year, month, day] = dob.split('-').map(Number);
    const lp = calculateLifePath(day, month, year);
    setResult({ lifePathNumber: lp, card: getTarotCardByLifePath(lp) });
  };

  const faqItems = [
    { question: 'How is my tarot card determined by birthday?',
      answer: 'Your birthday tarot card is determined by your Life Path number — calculated by reducing your full date of birth to a single digit (or master number 11, 22, 33). Each Life Path number corresponds to one of the Major Arcana cards in the tarot deck, which represents your soul\'s core archetype and life theme.' },
    { question: 'What are the Major Arcana tarot cards?',
      answer: 'The Major Arcana are the 22 trump cards in a tarot deck, numbered 0 (The Fool) through 21 (The World). Unlike the Minor Arcana which reflect everyday events, the Major Arcana represent significant life themes, soul lessons, and archetypal forces that shape a person\'s entire journey.' },
    { question: 'Can my tarot card change?',
      answer: 'Your birthday tarot card — determined by your Life Path number — remains constant throughout your life. However, you also have a Personal Year card that changes annually, reflecting the current energetic theme of that particular year for you.' },
    { question: 'Which tarot card is the most powerful?',
      answer: "The World (XXI) is often considered the most complete card, representing full integration and achievement. The Fool (0) holds infinite potential. Master number cards — Justice (11) and The World (22) — carry particularly intense archetypal energy." },
  ];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'meaning', label: '✨ Meaning' },
    { key: 'love', label: '❤️ Love' },
    { key: 'career', label: '💼 Career' },
    { key: 'health', label: '🌿 Health' },
    { key: 'spirituality', label: '🕯️ Spirit' },
  ];

  return (
    <>
      <SEO
        title="Tarot Card by Birthday — Find Your Major Arcana Card | BornClock"
        description="Discover your Major Arcana tarot card from your date of birth. Your Life Path number determines your soul's archetypal card — free calculator with full interpretations."
        keywords="tarot card by birthday, birthday tarot card, major arcana calculator, life path tarot, tarot by date of birth"
        canonicalUrl="/tarot-card-by-birthday"
      />
      <FAQSchema items={faqItems} />

      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-10">

          <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <span className="text-gray-600">Tarot Card by Birthday</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Your Tarot Card by Birthday</h1>
          <PageTagline />

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your birthday tarot card is determined by your Life Path number — the single most important number in numerology, calculated from your full date of birth. Each Life Path corresponds to one of the 22 Major Arcana cards, representing your soul's core archetype and the deepest theme of your life journey.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter your date of birth</p>
            <div className="flex gap-3">
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Find My Card →
              </button>
            </div>
          </div>

          {result && (
            <div className="mb-10">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white text-center mb-6">
                <p className="text-sm text-indigo-300 mb-1">Your Life Path is {result.lifePathNumber} · Your card is</p>
                <div className="text-7xl mb-3">{result.card.emoji}</div>
                <p className="text-sm font-semibold text-indigo-300 mb-1">Card {result.card.number}</p>
                <h2 className="text-3xl font-black text-white mb-4">{result.card.name}</h2>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {result.card.keywords.map(kw => (
                    <span key={kw} className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                      activeTab === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                {activeTab === 'meaning' && (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.card.upright}</p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.card.deepMeaning}</p>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-semibold text-amber-600 mb-1">⚠️ Shadow side</p>
                      <p className="text-sm text-gray-700">{result.card.reversed}</p>
                    </div>
                  </>
                )}
                {activeTab === 'love' && <p className="text-sm text-gray-700 leading-relaxed">{result.card.love}</p>}
                {activeTab === 'career' && <p className="text-sm text-gray-700 leading-relaxed">{result.card.career}</p>}
                {activeTab === 'health' && <p className="text-sm text-gray-700 leading-relaxed">{result.card.health}</p>}
                {activeTab === 'spirituality' && <p className="text-sm text-gray-700 leading-relaxed">{result.card.spirituality}</p>}

                <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-semibold text-green-600 mb-1">✨ Your Affirmation</p>
                  <p className="text-sm text-gray-700 italic">"{result.card.affirmation}"</p>
                </div>

                {result.card.famousPeople.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Famous people with this card</p>
                    <div className="flex gap-2 flex-wrap">
                      {result.card.famousPeople.map(p => (
                        <span key={p} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 mt-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get the complete Birthday Intelligence Report</p>
                <p className="text-indigo-200 text-sm mb-4">Your tarot card + moon sign + nakshatra + name numerology + 12 more sections — personalised to your exact birthday.</p>
                <Link to="/birthday-report" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                  Generate My Report → ₹199
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">The 22 Major Arcana Cards</h2>
            <p className="text-gray-500 text-sm mb-6">Each card represents a universal archetype. Your birthday determines which one is your soul's signature.</p>
            <div className="space-y-3">
              {Object.entries(MAJOR_ARCANA).map(([num, card]) => (
                <div key={num} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{card.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium">Card {card.number}</span>
                        <span className="font-bold text-gray-900">{card.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {card.keywords.slice(0, 3).map(kw => (
                          <span key={kw} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
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
                { text: 'Moon Sign Calculator', href: '/moon-sign' },
                { text: 'Numerology Calculator', href: '/numerology' },
                { text: 'Name Numerology', href: '/name-numerology' },
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
