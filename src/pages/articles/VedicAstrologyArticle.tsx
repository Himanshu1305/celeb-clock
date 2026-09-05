import React from 'react';
import { SEO } from '@/components/SEO';
import { VEDIC_RASHI_PROFILES, NAKSHATRA_PROFILES } from '@/data/astrologicalData';
import type { VedicRashiProfile, NakshatraProfile } from '@/data/astrologicalData';
import { calculateVedicRashi, calculateNakshatra } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Zodiac order for the 12 Rashis (Vedic sequence starting at Mesha/Aries).
const RASHI_ORDER = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];

// NAKSHATRA_PROFILES is keyed without spaces (e.g. PurvaPhalguni), while
// calculateNakshatra returns display names ("Purva Phalguni"). Build a
// lookup by the profile's own display `nakshatra` field so we can resolve
// gana/lord reliably.
const NAKSHATRA_BY_NAME: Record<string, NakshatraProfile> = Object.values(
  NAKSHATRA_PROFILES,
).reduce((acc, p) => {
  acc[p.nakshatra] = p;
  return acc;
}, {} as Record<string, NakshatraProfile>);

const ALL_NAKSHATRAS: NakshatraProfile[] = Object.values(NAKSHATRA_PROFILES).sort(
  (a, b) => a.number - b.number,
);

const FAQS = [
  {
    q: 'What is a Vedic astrology birth chart?',
    a: 'A Vedic astrology birth chart, called a Kundali or Janam Kundali, is a map of the sky at the exact moment and place of your birth. It plots the positions of the Sun, Moon, planets and the rising sign (Lagna) across the 12 houses and the sidereal zodiac. Unlike Western astrology, Vedic astrology (Jyotish) centres on the Moon Rashi and the 27 Nakshatras.',
  },
  {
    q: 'What is the difference between Vedic and Western astrology?',
    a: 'Western astrology uses the tropical zodiac (fixed to the seasons) and highlights your Sun sign. Vedic astrology uses the sidereal zodiac (measured against the fixed stars) and highlights your Moon Rashi and Nakshatra. Because of a roughly 24-degree offset called ayanamsa, your Western Sun sign and your Vedic Rashi often fall in different signs.',
  },
  {
    q: 'Can I get my Vedic birth chart from my date of birth alone?',
    a: 'From your date of birth alone you can find an approximate Moon Rashi and Nakshatra, which is what BornClock calculates. A complete Vedic birth chart, however, needs your exact birth time and place, because the Lagna (Ascendant) changes roughly every two hours and the Moon moves through a Nakshatra in less than a day.',
  },
  {
    q: 'What are the three most important parts of a Vedic chart?',
    a: 'The three key elements are the Lagna (Ascendant, the sign rising on the eastern horizon at birth), the Moon Rashi (your emotional and mental nature), and the Sun position (your soul and vitality). Vedic astrologers read the Lagna and the Moon as the two most important reference points in the whole chart.',
  },
  {
    q: 'What is a Nakshatra and why does it matter?',
    a: 'A Nakshatra is one of the 27 lunar mansions, each spanning about 13 degrees 20 minutes of the zodiac. Your birth Nakshatra is the mansion the Moon occupied when you were born. Nakshatras add finer detail than the 12 Rashis and traditionally decide the first syllable used to name a newborn and the compatibility gana (Deva, Manushya or Rakshasa).',
  },
];

function VedicCalculator() {
  const [dob, setDob] = React.useState('');
  const [rashi, setRashi] = React.useState<VedicRashiProfile | null>(null);
  const [nakshatra, setNakshatra] = React.useState<NakshatraProfile | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const rashiResult = calculateVedicRashi(day, month);
        const nakResult = calculateNakshatra(day, month);
        setRashi(VEDIC_RASHI_PROFILES[rashiResult.rashi] ?? null);
        setNakshatra(NAKSHATRA_BY_NAME[nakResult.nakshatra] ?? null);
      }
    }
  };

  return (
    <div data-testid="vedic-calculator"
         className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-orange-900 mb-1">
        Vedic Birth Chart Calculator — Free
      </h3>
      <p className="text-sm text-orange-700 mb-4">
        Enter your date of birth to find your approximate Moon Rashi and birth Nakshatra instantly.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-orange-300 rounded-xl px-4 py-3
                   text-base bg-white mb-4 focus:outline-none focus:border-orange-500"
        aria-label="Enter your date of birth"
      />
      {rashi && (
        <div data-testid="vedic-result"
             className="bg-white rounded-xl border-2 border-orange-300 p-5">
          <div className="text-2xl font-black text-orange-800 mb-0.5">
            {rashi.rashi} ({rashi.rashi_devanagari}) — {rashi.western_equivalent}
          </div>
          <div className="text-sm text-gray-500 mb-3">
            Lord: {rashi.lord} ({rashi.lord_devanagari}) · {rashi.element} · {rashi.quality}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="text-orange-700 font-bold">Lucky Stone</div>
              <div>{rashi.lucky_stone} ({rashi.lucky_stone_hindi})</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="text-orange-700 font-bold">Element</div>
              <div>{rashi.element}</div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 text-xs mb-3">
            <div className="text-orange-700 font-bold mb-0.5">Mantra</div>
            <div className="font-medium">{rashi.mantra}</div>
          </div>
          {nakshatra && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm mb-3">
              <div className="font-bold text-amber-900 mb-0.5">
                Birth Nakshatra: {nakshatra.nakshatra}
              </div>
              <div className="text-xs text-amber-800">
                Lord: {nakshatra.lord} · Gana: {nakshatra.gana} · {nakshatra.quality}
              </div>
            </div>
          )}
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {rashi.personality_summary}
          </p>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-orange-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-orange-700">
            See my full birthday profile →
          </a>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3 italic">
        Note: This is an approximate reading based on the solar date. A precise Vedic
        birth chart requires your exact birth <strong>time</strong> and <strong>place</strong>,
        because the Lagna (Ascendant) changes roughly every 2 hours.
      </p>
    </div>
  );
}

export function VedicAstrologyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Vedic Astrology Birth Chart — Rashi, Nakshatra & Lagna Guide',
    description: 'Understand your Vedic astrology birth chart: Moon Rashi, Nakshatra and Lagna from your date of birth, with a free calculator.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/vedic-astrology-birth-chart/',
  };
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Vedic Birth Chart Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
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
        title="Vedic Astrology Birth Chart — Rashi & Nakshatra Guide | BornClock"
        description="Vedic astrology birth chart explained — your Moon Rashi, Nakshatra, and Lagna from date of birth. Free calculator with all 12 Rashis and 27 Nakshatras."
        canonicalUrl="/articles/vedic-astrology-birth-chart"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="vedic-astrology-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Vedic Astrology Birth Chart — Your Rashi, Nakshatra & Lagna Explained
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            A <strong>Vedic astrology birth chart</strong> — known in India as your
            <strong> Kundali</strong> or <strong>Janam Kundali</strong> — is a snapshot of the
            entire sky at the precise moment and place you were born. Rooted in Jyotish, the
            ancient Indian science of light, it maps the Sun, the Moon, the planets and the
            rising sign across twelve houses and the sidereal zodiac. Where Western astrology
            asks for your Sun sign, Vedic astrology places the <strong>Moon Rashi</strong> and
            the <strong>27 Nakshatras</strong> at the heart of the reading.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            This guide explains how a Vedic chart is built, how it differs from Western
            astrology, and how far you can get from your date of birth alone. Use the free
            calculator below to find your approximate Moon Rashi and birth Nakshatra in
            seconds — then read on for all 12 Rashis and all 27 Nakshatras.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Vedic vs Western Astrology</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The two systems diverge at their very foundation. Western astrology uses the
            <strong> tropical zodiac</strong>, tied to the seasons and the Sun's apparent path,
            resetting each year at the spring equinox. Vedic astrology uses the
            <strong> sidereal zodiac</strong>, measured against the fixed stars. Over centuries
            the two have drifted apart by roughly 24 degrees — an offset called
            <strong> ayanamsa</strong>. This is why your Western Sun sign and your Vedic Rashi
            frequently land in different signs.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            There is a second, deeper difference of emphasis. Western astrology leads with the
            <strong> Sun sign</strong> — your outward identity and ego. Vedic astrology leads
            with the <strong>Moon sign (Rashi)</strong> — your mind, emotions and inner life —
            and the <strong>Ascendant (Lagna)</strong>, the sign rising on the eastern horizon
            at the exact minute of birth. To a Vedic astrologer, the Moon and the Lagna say far
            more about you than the Sun alone.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The 3 Key Elements of a Vedic Chart</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>
              <strong>Lagna (Ascendant):</strong> the sign rising on the eastern horizon at
              your birth. It anchors the entire chart, defining the twelve houses and shaping
              your body, temperament and life direction. Because the Earth rotates, the Lagna
              changes roughly every two hours — which is exactly why birth time is essential.
            </li>
            <li>
              <strong>Moon Rashi:</strong> the sign the Moon occupied at birth. It governs your
              emotions, mind and instinctive nature, and it is the sign most Indians identify
              with. Kundali Milan (marriage matching) and muhurta (auspicious timing) both
              revolve around the Moon Rashi and its Nakshatra.
            </li>
            <li>
              <strong>Sun position:</strong> the sign and house of the Sun, representing your
              soul, vitality, father and sense of purpose. In Vedic astrology the Sun is
              important but secondary to the Moon and Lagna.
            </li>
          </ul>

          <h2 className="text-2xl font-black text-gray-900 mb-3">From Date of Birth Alone</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Your date of birth is enough to estimate two of these elements approximately: your
            <strong> Moon Rashi</strong> and your <strong>Nakshatra</strong>. The Lagna cannot
            be found without a precise birth time, since it shifts every couple of hours. That
            is the single most important caveat in this article.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>Disclaimer:</strong> the results below are <em>approximate</em>. A precise
            Vedic birth chart needs your exact birth <strong>time</strong> and
            <strong> place</strong>, because the Lagna (Ascendant) changes roughly every 2
            hours and the Moon moves through an entire Nakshatra in under a day. Treat this as a
            helpful starting point, not a substitute for a full Kundali cast by an astrologer.
          </p>

          <VedicCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">The 12 Rashis at a Glance</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {RASHI_ORDER.map(name => {
              const p = VEDIC_RASHI_PROFILES[name];
              if (!p) return null;
              return (
                <div key={name} className="border border-gray-200 rounded-xl p-3">
                  <div className="font-black text-gray-900">
                    {p.rashi} ({p.rashi_devanagari})
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.western_equivalent} · Lord: {p.lord} ({p.lord_devanagari}) · {p.element}
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">All 27 Nakshatras</h2>
          <div className="grid sm:grid-cols-2 gap-2 mb-10">
            {ALL_NAKSHATRAS.map(n => (
              <div key={n.number} className="border border-gray-200 rounded-lg p-2 text-sm">
                <span className="font-bold text-gray-900">{n.number}. {n.nakshatra}</span>
                <span className="text-xs text-gray-500"> · Lord: {n.lord} · Gana: {n.gana}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Reading a Kundali</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            A complete Kundali weaves these threads together: the Lagna sets the twelve houses,
            the Moon Rashi colours your emotional life, the Nakshatra adds fine-grained detail
            and the Gana (Deva, Manushya or Rakshasa) that guides compatibility, and the
            planets are placed by house and sign to reveal timing through the Vimshottari Dasha
            system. No single factor tells the whole story — a skilled astrologer reads the
            relationships between them. What you can do today, from your date of birth alone, is
            discover your approximate Rashi and Nakshatra as a meaningful first step.
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
          <ul className="list-disc pl-6 text-indigo-700 mb-10 space-y-1">
            <li><a href="/articles/moon-sign-by-date-of-birth" className="hover:underline">Moon Sign by Date of Birth — Find Your Vedic Rashi</a></li>
            <li><a href="/articles/nakshatra-by-date-of-birth" className="hover:underline">Nakshatra by Date of Birth — Your Lunar Mansion</a></li>
          </ul>

          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-orange-100 mb-6">
              Your Rashi and Nakshatra are just the start. BornClock also shows your Western
              zodiac, Life Path number, lucky stone, mantra and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-orange-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-orange-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default VedicAstrologyArticle;
