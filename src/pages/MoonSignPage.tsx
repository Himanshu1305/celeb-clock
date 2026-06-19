import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { calculateMoonSignAndNakshatra, MOON_SIGN_DATA, NAKSHATRAS, getNakshatraLifeApplication } from '@/data/moonSignData';

type TabKey = 'personality' | 'love' | 'shadow' | 'compatible';

const TAB_LABELS: Record<TabKey, string> = {
  personality: '🌙 Personality',
  love: '❤️ In Love',
  shadow: '🌑 Shadow',
  compatible: '✨ Compatible',
};

export default function MoonSignPage() {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateMoonSignAndNakshatra> | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('personality');
  const [expandedSign, setExpandedSign] = useState<string | null>(null);
  const [expandedNak, setExpandedNak] = useState<number | null>(null);

  const handleCalculate = () => {
    if (!dob) return;
    const date = new Date(dob + 'T12:00:00');
    setResult(calculateMoonSignAndNakshatra(date));
    setActiveTab('personality');
  };

  const faqItems = [
    { question: 'What is a moon sign?',
      answer: 'Your moon sign is the zodiac sign the Moon was in at the exact moment you were born. While your sun sign (determined by your birth date) represents your conscious identity, your moon sign represents your emotional nature, instincts, and subconscious self. It is often considered more important than the sun sign for understanding personality and emotional needs.' },
    { question: 'How is my moon sign different from my sun sign?',
      answer: 'Your sun sign changes roughly every 30 days (as the Sun moves through the zodiac). Your moon sign changes approximately every 2.5 days (as the Moon moves much faster). Your sun sign represents your conscious self and outer personality; your moon sign represents your emotional world, instincts, and how you feel inside.' },
    { question: 'What is a nakshatra?',
      answer: 'A nakshatra is one of 27 lunar mansions used in Vedic (Indian) astrology. The Moon completes its cycle through all 27 nakshatras in approximately 27.3 days. Each nakshatra has its own ruling deity, quality, and meaning. Knowing your birth nakshatra gives much greater precision than your moon sign alone — it is considered fundamental in Jyotish (Vedic astrology) for reading personality, timing, and compatibility.' },
    { question: 'Is the moon sign calculator accurate?',
      answer: 'This calculator uses a simplified approximation based on the Moon\'s average orbital period of 27.3 days. For precise astrological use (especially for Vedic calculations and marriage matching), you should calculate using your exact birth time and location, as the Moon can shift signs in the middle of a day.' },
  ];

  return (
    <>
      <SEO
        title="Moon Sign Calculator — Find Your Vedic & Western Moon Sign | BornClock"
        description="Calculate your moon sign and nakshatra by date of birth. Free moon rashi calculator with full personality interpretations for all 12 moon signs and 27 nakshatras."
        keywords="moon sign calculator, what is my moon sign, nakshatra calculator, moon sign by date of birth India, moon rashi calculator"
        canonicalUrl="/moon-sign"
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
            <span className="text-gray-600">Moon Sign Calculator</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Moon Sign Calculator</h1>
          <PageTagline />

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-blue-900 leading-relaxed">
              Your moon sign reveals your emotional nature, instincts, and subconscious self — things your sun sign cannot show. The Moon changes signs every 2.5 days, making it far more personally specific than your sun sign. Your nakshatra (Vedic lunar mansion) refines this further to one of 27 precise cosmic positions.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter your date of birth</p>
            <div className="flex gap-3">
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCalculate}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Find My Sign →
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">For greater accuracy, use your exact birth time with a full Vedic chart calculator.</p>
          </div>

          {result && (
            <div className="mb-10">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white text-center">
                  <p className="text-xs text-blue-300 mb-1 uppercase tracking-wide">Moon Sign</p>
                  <div className="text-5xl mb-2">{result.moonSignData.symbol}</div>
                  <h2 className="text-2xl font-black text-white mb-1">{result.moonSign} Moon</h2>
                  <p className="text-xs text-blue-300">{result.moonSignData.element} · {result.moonSignData.rulingPlanet}</p>
                  <p className="text-xs text-blue-200 mt-2 italic">{result.moonSignData.emotionalNature}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 text-white text-center">
                  <p className="text-xs text-purple-300 mb-1 uppercase tracking-wide">Nakshatra</p>
                  <div className="text-5xl mb-2">{result.nakshatraData.symbol}</div>
                  <h2 className="text-2xl font-black text-white mb-1">{result.nakshatraData.name}</h2>
                  <p className="text-xs text-purple-300">#{result.nakshatraNumber} · {result.nakshatraData.meaning}</p>
                  <p className="text-xs text-purple-200 mt-2 italic">{result.nakshatraData.quality}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {(Object.keys(TAB_LABELS) as TabKey[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-0 py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                {activeTab === 'personality' && (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.moonSignData.personality}</p>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Core Instincts</p>
                      <p className="text-sm text-gray-700">{result.moonSignData.instincts}</p>
                    </div>
                  </>
                )}
                {activeTab === 'love' && <p className="text-sm text-gray-700 leading-relaxed">{result.moonSignData.inLove}</p>}
                {activeTab === 'shadow' && <p className="text-sm text-gray-700 leading-relaxed">{result.moonSignData.shadow}</p>}
                {activeTab === 'compatible' && (
                  <>
                    <p className="text-xs font-semibold text-gray-500 mb-3">Most compatible moon signs</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.moonSignData.compatible.map(c => (
                        <span key={c} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3 py-1.5 rounded-full font-medium">{c}</span>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Famous {result.moonSign} Moons</p>
                    <div className="flex flex-wrap gap-2">
                      {result.moonSignData.celebrities.map(c => (
                        <span key={c} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{c}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 rounded-2xl p-5 mb-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Your Nakshatra — {result.nakshatraData.name}</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{result.nakshatraData.description}</p>
                <p className="text-xs text-gray-500">Deity: {result.nakshatraData.deity}</p>
              </div>

              <div className="bg-blue-600 rounded-2xl p-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get the complete Birthday Intelligence Report</p>
                <p className="text-blue-200 text-sm mb-4">Moon sign + nakshatra + tarot card + name numerology + 12 more sections — personalised to your exact birthday.</p>
                <Link to="/birthday-report" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  Generate My Report → ₹199
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sun Sign vs Moon Sign</h2>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-amber-700 mb-2">☀️ Sun Sign</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Changes every ~30 days</li>
                    <li>• Represents conscious identity</li>
                    <li>• How you present to the world</li>
                    <li>• Your ego and life purpose</li>
                    <li>• Easy to calculate from birth date</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-blue-700 mb-2">🌙 Moon Sign</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Changes every ~2.5 days</li>
                    <li>• Represents emotional nature</li>
                    <li>• How you feel inside</li>
                    <li>• Your instincts and subconscious</li>
                    <li>• Requires birth date (+ time for precision)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All 12 Moon Signs</h2>
            <div className="space-y-2">
              {Object.values(MOON_SIGN_DATA).map(sign => (
                <div key={sign.sign} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSign(expandedSign === sign.sign ? null : sign.sign)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">{sign.symbol}</span>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900">{sign.sign} Moon</span>
                      <span className="text-xs text-gray-400 ml-2">{sign.element} · {sign.rulingPlanet}</span>
                    </div>
                    <span className="text-gray-400">{expandedSign === sign.sign ? '▲' : '▼'}</span>
                  </button>
                  {expandedSign === sign.sign && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed italic mb-2">{sign.emotionalNature}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{sign.personality.slice(0, 300)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All 27 Nakshatras</h2>
            <div className="space-y-2">
              {Object.entries(NAKSHATRAS).map(([num, nak]) => (
                <div key={num} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedNak(expandedNak === Number(num) ? null : Number(num))}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{nak.symbol}</span>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 text-sm">{nak.name}</span>
                      <span className="text-xs text-gray-400 ml-2">#{num} · {nak.quality}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{expandedNak === Number(num) ? '▲' : '▼'}</span>
                  </button>
                  {expandedNak === Number(num) && (
                    <div className="px-4 pb-4 border-t border-gray-100 space-y-3">
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        <span><strong>Meaning:</strong> {nak.meaning}</span>
                        <span>·</span>
                        <span><strong>Deity:</strong> {nak.deity}</span>
                        <span>·</span>
                        <span><strong>Quality:</strong> {nak.quality}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{nak.description}</p>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <p className="text-xs font-bold text-purple-700 mb-2">🌙 In Your Daily Life</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{getNakshatraLifeApplication(nak.name)}</p>
                      </div>
                    </div>
                  )}
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
                { text: 'Tarot Card by Birthday', href: '/tarot-card-by-birthday' },
                { text: 'Vedic Zodiac (Rashi)', href: '/vedic-zodiac' },
                { text: 'Compatibility Calculator', href: '/compatibility' },
                { text: 'Numerology Calculator', href: '/numerology' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 transition-colors">
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
