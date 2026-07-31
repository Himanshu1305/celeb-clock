import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { PageFAQ } from '@/components/PageFAQ';
import { SharePageBar } from '@/components/SharePageBar';
import { getZodiacByDate } from '@/data/zodiacData';
import {
  RISING_SIGN_DATA, SIGN_ORDER, RISING_DISCLAIMER,
  calculateRisingSign, type RisingSignInfo,
} from '@/data/risingSignData';

const ELEMENT_BADGE: Record<string, string> = {
  Fire: 'bg-red-100 text-red-700',
  Earth: 'bg-green-100 text-green-700',
  Air: 'bg-sky-100 text-sky-700',
  Water: 'bg-blue-100 text-blue-700',
};

export default function RisingSignPage() {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<{ rising: RisingSignInfo; sunSign: string } | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const calculate = () => {
    setError('');
    if (!dob) { setError('Please enter your birth date.'); return; }
    if (!time) { setError('Please enter your birth time — the rising sign depends on it.'); return; }
    const [y, m, d] = dob.split('-').map(Number);
    const hour = parseInt(time.split(':')[0], 10);
    if (!m || !d || Number.isNaN(hour)) { setError('Please check your birth date and time.'); return; }
    const sun = getZodiacByDate(m, d);
    if (!sun) { setError('Could not read that date.'); return; }
    setResult({ rising: calculateRisingSign(sun.name, hour), sunSign: sun.name });
  };

  // WebApplication schema rendered IN-BODY (Helmet-injected JSON-LD does not survive
  // the prerender capture, so crawlers would never see it via <WebApplicationSchema>).
  const webAppLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Rising Sign Calculator',
    description: 'Free rising sign (ascendant) calculator by birth date and time, with descriptions of all 12 rising signs and a sun-vs-moon-vs-rising explainer.',
    url: 'https://bornclock.com/rising-sign-calculator/',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqItems = [
    { question: 'What is a rising sign (ascendant)?', answer: 'Your rising sign, or ascendant, is the zodiac sign that was climbing over the eastern horizon at the exact moment and place you were born. It is often described as your "mask" — the first impression you give and the style with which you meet the world, distinct from your Sun sign (your core self) and Moon sign (your emotional inner life).' },
    { question: 'How accurate is this rising sign calculator?', answer: 'This is an approximation. The exact ascendant needs your precise birth time AND birth location, because it depends on which sign was rising over the horizon at that spot. This tool uses the standard simplified table — your Sun sign at around 6am, advancing one sign roughly every two hours. It is a solid starting point, but for an exact ascendant you need a full birth chart with your birth time and place.' },
    { question: 'What is the difference between sun, moon and rising signs?', answer: 'Your Sun sign (changes ~monthly) is your core identity and ego. Your Moon sign (changes ~every 2.5 days) is your emotional world and instincts. Your rising sign (changes ~every 2 hours) is your outward style — how you come across before people know you well. Together they are often called the "big three".' },
    { question: 'Why do I need my birth time for my rising sign?', answer: 'Because the ascendant moves through all twelve signs in a single day, a shift of a couple of hours can change your rising sign entirely. Your Sun and Moon signs need only the date, but the rising sign is time-sensitive — which is exactly why it is the part of your chart most people never learn.' },
    { question: 'Is my birth time stored anywhere?', answer: 'No. Your birth time is used only in your browser to do the calculation. It is never sent to a server or stored anywhere — the result is computed entirely on your device.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Rising Sign Calculator — Find Your Ascendant by Birth Time | BornClock"
        description="Free rising sign (ascendant) calculator by birth date and time. Find your rising sign and what first impression it gives — plus how it differs from your sun and moon signs."
        keywords="rising sign calculator, ascendant calculator, what is my rising sign, rising sign by birth time, ascendant by birth time"
        canonicalUrl="/rising-sign-calculator"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />

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
          <Link to="/zodiac" className="hover:text-indigo-600">Zodiac</Link>
          <span>›</span>
          <span className="text-gray-600">Rising Sign Calculator</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Rising Sign Calculator</h1>
        <p className="text-gray-600 mb-5">
          Your rising sign — the ascendant — is the first impression you give: the "mask" you wear when the world meets you.
          It is set by the exact time you were born, which is why so few people know theirs.
        </p>

        {/* MANDATORY honesty framing */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5 mb-8">
          <p className="text-sm text-blue-900 leading-relaxed"><strong>How to read this:</strong> {RISING_DISCLAIMER}</p>
        </div>

        {/* Inputs */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Birth date</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <label className="block text-sm font-semibold text-gray-700 mb-1">Birth time (local birth-place time)</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <p className="text-xs text-gray-400 mb-4">Use the local time at your birthplace. No timezone conversion is needed for this simplified table, and your time is never stored.</p>
          <button onClick={calculate}
            className="w-full bg-indigo-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-indigo-700 transition-colors">
            Find my rising sign →
          </button>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        {/* Result */}
        {result && (
          <div className="mb-10">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 mb-4">
              <p className="text-sm text-gray-500 mb-1">With a {result.sunSign} Sun, born at {time}, your approximate rising sign is</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl leading-none">{result.rising.symbol}</span>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{result.rising.name} Rising</h2>
                  <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium ${ELEMENT_BADGE[result.rising.element]}`}>
                    {result.rising.element} · ruled by {result.rising.ruler}
                  </span>
                </div>
              </div>
              <p className="text-gray-800 leading-relaxed mb-3"><strong>First impression:</strong> {result.rising.firstImpression}</p>
              <p className="text-gray-700 leading-relaxed mb-3">{result.rising.appearance}</p>
              <p className="text-gray-700 leading-relaxed">{result.rising.approach}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={`/zodiac/${result.rising.slug}`} className="text-sm text-indigo-600 hover:underline">Full {result.rising.name} guide →</Link>
              <Link to="/moon-sign" className="text-sm text-indigo-600 hover:underline">Find your Moon sign →</Link>
              <Link to="/birthday-report" className="text-sm text-indigo-600 hover:underline">Your full Birthday Blueprint →</Link>
            </div>
          </div>
        )}

        <SharePageBar
          path="/rising-sign-calculator"
          title="Rising Sign Calculator"
          text="Find your rising sign (ascendant) — the first impression you give — from your birth time"
          className="mb-10"
        />

        {/* Sun vs Moon vs Rising explainer */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sun vs Moon vs Rising — your "big three"</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="font-bold text-gray-900 mb-1">☀️ Sun sign</p>
              <p className="text-sm text-gray-600">Your core identity and ego. Changes about once a month — needs only your birth date.</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="font-bold text-gray-900 mb-1">🌙 Moon sign</p>
              <p className="text-sm text-gray-600">Your emotional world and instincts. Changes every ~2.5 days. <Link to="/moon-sign" className="text-indigo-600 hover:underline">Find yours →</Link></p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="font-bold text-gray-900 mb-1">⬆️ Rising sign</p>
              <p className="text-sm text-gray-600">Your outward style and first impression. Changes every ~2 hours — which is why birth time matters.</p>
            </div>
          </div>
        </section>

        {/* All 12 rising signs */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All 12 rising signs</h2>
          <div className="space-y-2">
            {SIGN_ORDER.map(name => {
              const r = RISING_SIGN_DATA[name];
              const open = expanded === name;
              return (
                <div key={name} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : name)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
                    <span className="font-semibold text-gray-900">{r.symbol} {r.name} Rising</span>
                    <span className="text-gray-400">{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed space-y-2">
                      <p><strong className="text-gray-800">First impression:</strong> {r.firstImpression}</p>
                      <p>{r.appearance}</p>
                      <p>{r.approach}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <PageFAQ title="Rising sign — Frequently Asked Questions" items={faqItems} />

        {/* Related tools */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to="/moon-sign" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Moon Sign Calculator</Link>
            <Link to="/zodiac" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ All Zodiac Signs</Link>
            <Link to="/compatibility" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Zodiac Compatibility</Link>
            <Link to="/birthday-report" className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors">→ Your Birthday Report</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
