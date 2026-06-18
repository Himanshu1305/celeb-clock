import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { RASHI_RATNA_DATA, NAVRATNA_INFO, type RashiRatna } from '@/data/rashiRatnaData';

export default function RashiRatnaPage() {
  const [selectedRashi, setSelectedRashi] = useState<RashiRatna | null>(null);

  const faqItems = [
    { question: 'What is Rashi Ratna?',
      answer: 'Rashi Ratna (also written Rashi Ratnam or Rashi Ratnam) refers to the gemstone assigned to your Vedic zodiac sign (Rashi) rather than your birth month. Unlike Western birthstones which are based on calendar month, Indian Rashi Ratna is based on the ruling planet of your zodiac sign. Each of the 12 Rashis has one or more primary gemstones that are believed to strengthen the beneficial energy of that sign\'s ruling planet.' },
    { question: 'How is Rashi Ratna different from Western birthstones?',
      answer: 'Western birthstones (like garnet for January, amethyst for February) are based purely on birth month. Indian Rashi Ratna is based on your Vedic zodiac sign\'s ruling planet — for example, because Leo is ruled by the Sun, Leo\'s Rashi Ratna is Ruby, regardless of what month they were born in. The two systems can give completely different gemstone recommendations for the same person.' },
    { question: 'Which is the most powerful Rashi Ratna?',
      answer: 'Blue Sapphire (Neelam) for Saturn-ruled signs (Capricorn/Aquarius) is considered the most powerful and fastest-acting Navratna — with both the most dramatic positive effects and the most significant risks if it doesn\'t suit the wearer. Ruby (Manikya) for Leo is considered the most prestigious. Yellow Sapphire (Pukhraj) for Jupiter-ruled signs is considered the safest and most universally beneficial.' },
    { question: 'Should I consult an astrologer before wearing a Rashi Ratna?',
      answer: 'For most Rashi Ratnas, personal astrological consultation is strongly recommended — particularly for Blue Sapphire (Neelam), Ruby (Manikya), and Red Coral (Moonga), which are considered powerful and can have strong effects. The gemstone must suit your specific birth chart (Kundali), not just your sun sign. Some astrologers check the placement and strength of the ruling planet in the chart before recommending the stone.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Rashi Ratna — Gemstone by Zodiac Sign (Indian Vedic Birthstones) | BornClock"
        description="Find your Rashi Ratna — the Indian Vedic birthstone for your zodiac sign. Complete guide to Navratna gems: Ruby, Pearl, Emerald, Diamond, Yellow Sapphire, Blue Sapphire, and more."
        keywords="rashi ratna, rashi ratna by zodiac, gemstone by rashi, vedic birthstone, navratna, moonga for aries, pukhraj for leo, neelam for capricorn, heera for taurus"
        canonicalUrl="/rashi-ratna"
      />
      <FAQSchema items={faqItems} />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>›</span>
          <Link to="/birthstone" className="hover:text-indigo-600">Birthstone</Link>
          <span>›</span>
          <span className="text-gray-600">Rashi Ratna</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 mb-1">Rashi Ratna — Indian Vedic Birthstones</h1>
        <PageTagline />

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-5 my-6">
          <p className="text-base font-semibold text-orange-900 leading-relaxed">
            In the Indian Vedic tradition, your birthstone is determined not by your birth month but by your Rashi (zodiac sign) and its ruling planet. These gemstones — drawn from the sacred Navratna system — have been used for over 2,000 years to strengthen planetary energies, protect against malefic influences, and bring prosperity, health, and clarity.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {RASHI_RATNA_DATA.map(rr => (
            <button
              key={rr.rashi}
              onClick={() => setSelectedRashi(selectedRashi?.rashi === rr.rashi ? null : rr)}
              className={`border rounded-2xl p-4 text-left transition-all ${
                selectedRashi?.rashi === rr.rashi
                  ? 'border-orange-400 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <div className="text-2xl mb-1">{rr.symbol}</div>
              <div className="font-bold text-gray-900 text-sm">{rr.rashi}</div>
              <div className="text-xs text-gray-500 mb-2">{rr.rashiEnglish}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rr.hex }} />
                <div className="text-xs font-medium text-gray-700">{rr.primaryStone}</div>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">({rr.primaryStoneHindi})</div>
            </button>
          ))}
        </div>

        {selectedRashi && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-5xl">{selectedRashi.symbol}</div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{selectedRashi.rashi} ({selectedRashi.rashiEnglish})</h2>
                <p className="text-sm text-gray-500">{selectedRashi.rulingPlanet}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="w-10 h-10 rounded-full mx-auto mb-1" style={{ backgroundColor: selectedRashi.hex }} />
                <p className="text-xs text-gray-500">{selectedRashi.color}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-700 mb-1">Primary Stone</p>
                <p className="text-xl font-black text-gray-900">{selectedRashi.primaryStone}</p>
                <p className="text-sm text-gray-600">({selectedRashi.primaryStoneHindi})</p>
                <p className="text-xs text-gray-500 mt-1 italic">{selectedRashi.scientificName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-600 mb-1">Alternative Stone</p>
                <p className="text-base font-semibold text-gray-800">{selectedRashi.secondaryStone}</p>
                <p className="text-xs text-gray-500 mt-2">For those who cannot access the primary stone</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-gray-600 mb-2">Benefits</p>
              <ul className="grid sm:grid-cols-2 gap-1.5">
                {selectedRashi.benefits.map(b => (
                  <li key={b} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-5 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Wearing Day</p>
                <p className="font-medium text-gray-900">{selectedRashi.wearingDay}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Finger</p>
                <p className="font-medium text-gray-900">{selectedRashi.fingerToWear}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 mb-1">Metal</p>
                <p className="font-medium text-gray-900">{selectedRashi.metalToUse}</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-5">{selectedRashi.description}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Important Caution</p>
              <p className="text-sm text-amber-900">{selectedRashi.caution}</p>
            </div>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{NAVRATNA_INFO.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{NAVRATNA_INFO.description}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-600">Gemstone</th>
                  <th className="text-left py-3 text-gray-600">Planet</th>
                  <th className="text-left py-3 text-gray-600">Rashi</th>
                </tr>
              </thead>
              <tbody>
                {NAVRATNA_INFO.gems.map(({ gem, planet, rashi }) => (
                  <tr key={gem} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{gem}</td>
                    <td className="py-3 text-gray-600">{planet}</td>
                    <td className="py-3 text-gray-500">{rashi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              { text: 'Western Birthstones', href: '/birthstone' },
              { text: 'Vedic Zodiac (Rashi)', href: '/vedic-zodiac' },
              { text: 'Moon Sign Calculator', href: '/moon-sign' },
              { text: 'Numerology Calculator', href: '/numerology' },
            ].map(item => (
              <Link key={item.href} to={item.href}
                className="p-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm text-gray-700 hover:text-orange-700 transition-colors">
                → {item.text}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
