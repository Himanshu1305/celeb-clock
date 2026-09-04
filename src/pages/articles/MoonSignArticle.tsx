import React from 'react';
import { SEO } from '@/components/SEO';
import { VEDIC_RASHI_PROFILES } from '@/data/astrologicalData';
import type { VedicRashiProfile } from '@/data/astrologicalData';
import { calculateVedicRashi } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Real Indian examples per Rashi (from indianCelebrities.ts, mapped via sun-sign → Rashi).
const CELEB_EXAMPLES: Record<string, string> = {
  Mesha: 'Bhimrao Ambedkar, Aryabhata',
  Vrishabha: 'Rabindranath Tagore, Gopal Krishna Gokhale',
  Mithuna: 'Bal Gangadhar Tilak, Chandra Shekhar Azad',
  Karka: 'Ranveer Singh, Rajkummar Rao',
  Simha: 'Bhagat Singh, Ishwar Chandra Vidyasagar',
  Kanya: 'Sardar Vallabhbhai Patel, Vinoba Bhave',
  Tula: 'Mahatma Gandhi, Annie Besant',
  Vrischika: 'Jawaharlal Nehru, Maulana Abul Kalam Azad',
  Dhanu: 'Subhas Chandra Bose, Lala Lajpat Rai',
  Makara: 'Swami Vivekananda, Paramahansa Yogananda',
  Kumbha: 'Sarojini Naidu, Dayananda Saraswati',
  Meena: 'Aamir Khan, Alia Bhatt',
};

const RASHI_ORDER = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];

const FAQS = [
  {
    q: 'What is my moon sign by date of birth?',
    a: 'Your moon sign — called Rashi in Vedic astrology — is the zodiac sign the Moon occupied at your birth. BornClock estimates your Rashi from your date of birth. For a precise Rashi, your exact birth time and place are needed, but the date alone gives a strong approximate result.',
  },
  {
    q: 'Is Rashi the same as moon sign?',
    a: 'Yes. In Vedic astrology (Jyotish), your Rashi is your moon sign — the sign the Moon was in when you were born. This differs from your Western "sun sign", which is based on the Sun\'s position. Indians traditionally identify with their Rashi rather than their sun sign.',
  },
  {
    q: 'How accurate is Rashi calculated from date of birth alone?',
    a: 'A date-only Rashi is approximate. The Moon moves through a full sign roughly every 2.25 days, so exact birth time and location are required for a precise Rashi. BornClock clearly labels its calculation as approximate — a helpful starting point, not a substitute for a full Kundali.',
  },
  {
    q: 'Which Rashi is luckiest in India?',
    a: 'No Rashi is universally "luckiest" — each has its own strengths, lucky stone, lucky day and favourable direction. What matters in Jyotish is the placement of the Moon and other planets in your full birth chart, not the Rashi in isolation.',
  },
  {
    q: 'What is the difference between Rashi and Nakshatra?',
    a: 'Rashi is one of the 12 zodiac signs (each 30°), while Nakshatra is one of the 27 lunar mansions (each ~13.3°). Every Rashi contains parts of two or three Nakshatras. Nakshatras are used for finer detail — including the traditional first syllable for naming a newborn.',
  },
];

function RashiCalculator() {
  const [dob, setDob] = React.useState('');
  const [profile, setProfile] = React.useState<VedicRashiProfile | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const rashiResult = calculateVedicRashi(day, month);
        setProfile(VEDIC_RASHI_PROFILES[rashiResult.rashi] ?? null);
      }
    }
  };

  return (
    <div data-testid="rashi-calculator"
         className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-amber-900 mb-1">
        Find Your Vedic Rashi — Free Calculator
      </h3>
      <p className="text-sm text-amber-700 mb-4">
        Enter your date of birth to discover your approximate Vedic Rashi instantly.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-amber-300 rounded-xl px-4 py-3
                   text-base bg-white mb-4 focus:outline-none focus:border-amber-500"
        aria-label="Enter your date of birth"
      />
      {profile && (
        <div data-testid="rashi-result"
             className="bg-white rounded-xl border-2 border-amber-300 p-5">
          <div className="text-2xl font-black text-amber-800 mb-0.5">
            {profile.rashi} ({profile.rashi_devanagari})
          </div>
          <div className="text-sm text-gray-500 mb-3">
            Lord: {profile.lord} ({profile.lord_devanagari}) ·
            {profile.element} · {profile.quality}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-amber-700 font-bold">Lucky Stone</div>
              <div>{profile.lucky_stone} ({profile.lucky_stone_hindi})</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-amber-700 font-bold">Lucky Day</div>
              <div>{profile.lucky_day}</div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-xs mb-3">
            <div className="text-amber-700 font-bold mb-0.5">Mantra</div>
            <div className="font-medium">{profile.mantra}</div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {profile.personality_summary}
          </p>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-amber-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-amber-700">
            See my full birthday profile →
          </a>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3 italic">
        Note: This is an approximate calculation based on solar position.
        Precise Rashi requires exact birth time and location.
      </p>
    </div>
  );
}

export function MoonSignArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Moon Sign by Date of Birth — Find Your Vedic Rashi (India Guide)',
    description: 'Find your Vedic Rashi (moon sign) by date of birth. All 12 Rashis with lucky stone, mantra, personality and a free calculator.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/moon-sign-by-date-of-birth/',
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
        title="Moon Sign by Date of Birth — Find Your Vedic Rashi India | BornClock"
        description="Find your Vedic Rashi (moon sign) by date of birth. All 12 Rashis with lucky stone, mantra, personality, Devanagari names, and free Rashi calculator."
        canonicalUrl="/articles/moon-sign-by-date-of-birth"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="moon-sign-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Moon Sign by Date of Birth — Find Your Vedic Rashi (India Guide)
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            In Indian astrology, the sign that matters most is not your Western "sun sign" —
            it is your <strong>Rashi</strong>, or moon sign: the zodiac sign the Moon occupied
            at the moment you were born. While Western astrology asks "what's your sign?" and
            means the Sun, Vedic astrology (Jyotish) places the Moon at the centre, because the
            Moon governs the mind, emotions, and inner life. Your Rashi is the sign most Indians
            identify with, and the one used in traditional practice.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Rashi shapes real-world decisions across India — from marriage matching (Kundali
            Milan) and choosing auspicious dates (muhurta) to the syllable a newborn is named
            with. BornClock estimates your Rashi directly from your date of birth, giving you an
            approximate but meaningful reading in seconds. For a precise Rashi, your exact birth
            time and place are needed, but your birth date alone is a strong starting point.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Sun Sign vs Moon Sign</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Western astrology is <strong>solar</strong>: it tracks the Sun's position through the
            tropical zodiac, giving the 12 familiar sun signs on a calendar that resets with the
            seasons. Vedic astrology is <strong>lunar and sidereal</strong>: it tracks the Moon's
            position through the 12 Rashis and 27 Nakshatras, measured against the fixed stars.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            Because the two systems use different reference points, they are offset by roughly
            23 days. This is why your Western sun sign and your Vedic Rashi can differ — someone
            born in late November may be a Sagittarius by Western reckoning but carry a Vrischika
            (Scorpio) influence in the sidereal system. Neither is "wrong"; they describe
            different layers of the self — the Sun your outward identity, the Moon your inner
            emotional nature.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>Important:</strong> the Rashi shown here is <em>approximate</em>, derived from
            your birth date alone. The Moon changes sign roughly every 2.25 days, so a precise
            Rashi requires your exact birth <strong>time</strong> and <strong>place</strong>. Treat
            this as a helpful guide, not a full Kundali.
          </p>

          <RashiCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">All 12 Rashis Explained</h2>
          {RASHI_ORDER.map(rashiName => {
            const p = VEDIC_RASHI_PROFILES[rashiName];
            if (!p) return null;
            return (
              <section key={rashiName} id={`rashi-${rashiName.toLowerCase()}`} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  {p.rashi} ({p.rashi_devanagari}) — {p.western_equivalent}
                </h3>
                <div className="text-xs text-gray-500 mb-2">
                  Lord: {p.lord} ({p.lord_devanagari}) · {p.element} · {p.quality}
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    💎 {p.lucky_stone} ({p.lucky_stone_hindi})
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    📅 {p.lucky_day}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    🧭 {p.lucky_direction}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mb-3">
                  🕉 {p.mantra}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  {p.personality_summary}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Career: </strong>{p.career_strengths}
                </p>
                <p className="text-xs text-amber-700 mb-2">
                  <strong>Health: </strong>{p.health_tendencies}
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Famous Indians: </strong>
                  {CELEB_EXAMPLES[rashiName] || 'Examples being added.'}
                </p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-3">Rashi in Indian Tradition</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Rashi runs through the fabric of Indian life. A <strong>Kundali</strong> (birth chart)
            built around the Moon's Rashi is consulted for <strong>Kundali Milan</strong> — the
            compatibility matching that precedes many marriages. <strong>Muhurta</strong>, the
            selection of auspicious timing for weddings, housewarmings and new ventures, is guided
            by the Moon's Rashi and Nakshatra. Traditional <strong>naming ceremonies</strong>
            (Namakaran) often choose a baby's first syllable from the Nakshatra within their Rashi.
            Even festival observances and fasting days are timed to the Moon's movement through the
            Rashis — a living tradition that treats the sky as a shared calendar.
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

          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-amber-100 mb-6">
              Your Rashi is just one piece. BornClock also shows your Nakshatra, Western zodiac,
              Life Path number, lucky stone, and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-amber-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-amber-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default MoonSignArticle;
