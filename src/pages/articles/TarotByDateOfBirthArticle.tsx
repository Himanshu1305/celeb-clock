import React from 'react';
import { SEO } from '@/components/SEO';
import { WESTERN_ZODIAC_PROFILES } from '@/data/astrologicalData';
import type { WesternZodiacProfile } from '@/data/astrologicalData';
import { calculateWesternZodiac } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Life Path number → Major Arcana card concept. This is the traditional
// numerology-to-tarot mapping (Life Path n → the n-th Major Arcana card).
const LIFE_PATH_TAROT: { num: number; card: string; concept: string }[] = [
  { num: 1, card: 'The Magician', concept: 'Manifestation, willpower, and turning ideas into action.' },
  { num: 2, card: 'The High Priestess', concept: 'Intuition, patience, and quiet inner knowing.' },
  { num: 3, card: 'The Empress', concept: 'Creativity, abundance, and self-expression.' },
  { num: 4, card: 'The Emperor', concept: 'Structure, stability, and disciplined authority.' },
  { num: 5, card: 'The Hierophant', concept: 'Tradition, learning, and shared belief.' },
  { num: 6, card: 'The Lovers', concept: 'Relationships, values, and meaningful choices.' },
  { num: 7, card: 'The Chariot', concept: 'Willpower, focus, and victory through control.' },
  { num: 8, card: 'Strength', concept: 'Courage, patience, and gentle mastery of instinct.' },
  { num: 9, card: 'The Hermit', concept: 'Introspection, wisdom, and inner guidance.' },
  { num: 11, card: 'Justice', concept: 'Balance, truth, and karmic cause and effect (Master 11).' },
  { num: 22, card: 'The Fool', concept: 'New beginnings, faith, and infinite potential (Master 22).' },
  { num: 33, card: 'The World', concept: 'Completion, fulfilment, and wholeness (Master 33).' },
];

const FAQS = [
  {
    q: 'What is my tarot card by date of birth?',
    a: 'There are two tarot cards linked to your date of birth. The first is your zodiac tarot card — every one of the 12 sun signs corresponds to a specific card in the Major Arcana. The second is your Life Path tarot card, found by reducing your birth date to a single Life Path number and matching it to the numbered Major Arcana card. Together they describe your outer nature and your deeper life theme.',
  },
  {
    q: 'How is a tarot card assigned to my zodiac sign?',
    a: 'Each of the 22 Major Arcana cards has long been associated with an astrological sign, planet, or element in the Western esoteric tradition. Aries links to The Emperor, Taurus to The Hierophant, Scorpio to Death, and so on. BornClock uses this established correspondence — it never invents cards — so entering your date of birth returns the Major Arcana card tied to your sun sign.',
  },
  {
    q: 'What is a Life Path tarot card?',
    a: 'Your Life Path number is calculated by reducing the digits of your full date of birth to a single number (keeping master numbers 11, 22 and 33). That number maps to a numbered card in the Major Arcana — for example Life Path 1 to The Magician and Life Path 9 to The Hermit. It reflects the overarching lesson and journey of your life.',
  },
  {
    q: 'Does the Death card mean something bad?',
    a: 'No. Despite its name, the Death card — the tarot card of Scorpio — almost never refers to physical death. In tarot it means transformation: the ending of one chapter and the beginning of another, letting go so that something new can grow. It is one of the most misunderstood cards in the deck.',
  },
  {
    q: 'Is a tarot reading by date of birth accurate?',
    a: 'A birth-date tarot card is a fixed, symbolic starting point for reflection, not a prediction of the future. It highlights themes and tendencies drawn from tarot and astrology tradition. BornClock presents it as cultural insight and a tool for self-understanding, never as a guaranteed forecast.',
  },
];

function TarotCalculator() {
  const [dob, setDob] = React.useState('');
  const [profile, setProfile] = React.useState<WesternZodiacProfile | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const zodiac = calculateWesternZodiac(day, month);
        setProfile(WESTERN_ZODIAC_PROFILES[zodiac.sign] ?? null);
      }
    }
  };

  return (
    <div data-testid="tarot-calculator"
         className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-purple-900 mb-1">
        Find Your Tarot Card by Date of Birth — Free
      </h3>
      <p className="text-sm text-purple-700 mb-4">
        Enter your date of birth to reveal your zodiac's Major Arcana card and its meaning.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-purple-300 rounded-xl px-4 py-3
                   text-base bg-white mb-4 focus:outline-none focus:border-purple-500"
        aria-label="Enter your date of birth"
      />
      {profile && (
        <div data-testid="tarot-result"
             className="bg-white rounded-xl border-2 border-purple-300 p-5">
          <div className="text-sm text-gray-500 mb-1">
            {profile.sign} {profile.symbol} · {profile.element} · {profile.date_range}
          </div>
          <div className="text-2xl font-black text-purple-800 mb-2">
            {profile.tarot_card}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {profile.tarot_meaning}.
          </p>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-purple-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-purple-700">
            See my full birthday profile →
          </a>
        </div>
      )}
    </div>
  );
}

export function TarotByDateOfBirthArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Tarot Card by Date of Birth — Find Your Card',
    description: 'Find your tarot card by date of birth — your zodiac Major Arcana card and your Life Path tarot card, with meanings.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/tarot-card-by-date-of-birth/',
  };
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tarot Card by Date of Birth Calculator',
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
        title="Tarot Card by Date of Birth — Find Your Card | BornClock"
        description="Find your tarot card by date of birth — your zodiac's Major Arcana card and your Life Path tarot card, with meanings. Free tarot-by-birthday guide."
        canonicalUrl="/articles/tarot-card-by-date-of-birth"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="tarot-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Tarot Card by Date of Birth — Find Your Tarot Card
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Your date of birth is linked to two distinct tarot cards, both drawn from the 22
            cards of the <strong>Major Arcana</strong> — the powerful, archetypal images at the
            heart of every tarot deck. The first is your <strong>zodiac tarot card</strong>:
            each of the 12 sun signs corresponds to one Major Arcana card in the Western esoteric
            tradition. The second is your <strong>Life Path tarot card</strong>, found by reducing
            your birth date to a single Life Path number and matching it to a numbered Major
            Arcana card. Together they describe your outward nature and the deeper theme of your
            life's journey.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            BornClock does not invent these pairings. Every zodiac tarot card below comes from the
            long-established correspondence between the signs and the Major Arcana — the same
            system used in classic esoteric tarot. Enter your date of birth in the calculator and
            you will instantly see your sun sign's card and what it means.
          </p>

          <TarotCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-3">How Tarot Cards Are Linked to Your Birthday</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            In the Western esoteric tradition, the 22 cards of the Major Arcana are mapped onto
            the signs, planets, and elements of astrology. Each zodiac sign is assigned one card
            that captures its essential energy — Aries to <strong>The Emperor</strong> for its
            drive and authority, Libra to <strong>Justice</strong> for its love of balance and
            fairness, and Scorpio to <strong>Death</strong> for its themes of transformation and
            rebirth. This is a symbolic language, not a prediction system: the card is a mirror
            for reflection, not a forecast of events.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your second birth card comes from numerology. Reduce every digit of your date of birth
            to a single <strong>Life Path number</strong> (master numbers 11, 22 and 33 are kept
            as they are), then match that number to its Major Arcana card. Where your zodiac card
            speaks to your temperament, your Life Path card speaks to the overarching lesson you
            are here to learn.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Tarot Card for Every Zodiac Sign</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Here is the complete table of all 12 zodiac signs and the Major Arcana card each one
            corresponds to, with the traditional meaning of that card.
          </p>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-purple-100 text-purple-900">
                  <th className="text-left px-3 py-2 font-bold">Zodiac Sign</th>
                  <th className="text-left px-3 py-2 font-bold">Dates</th>
                  <th className="text-left px-3 py-2 font-bold">Tarot Card</th>
                  <th className="text-left px-3 py-2 font-bold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {SIGN_ORDER.map((sign, i) => {
                  const p = WESTERN_ZODIAC_PROFILES[sign];
                  if (!p) return null;
                  return (
                    <tr key={sign} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        {p.symbol} {p.sign}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{p.date_range}</td>
                      <td className="px-3 py-2 font-bold text-purple-700">{p.tarot_card}</td>
                      <td className="px-3 py-2 text-gray-600">{p.tarot_meaning}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Life Path Tarot Card by Number</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your Life Path number points to a second birth card. Reduce your date of birth to a
            single digit (keeping master numbers) and read across to find your Life Path tarot
            card and the concept it carries.
          </p>
          <div className="overflow-x-auto mb-8">
            <table data-testid="life-path-tarot-table" className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-indigo-900">
                  <th className="text-left px-3 py-2 font-bold">Life Path</th>
                  <th className="text-left px-3 py-2 font-bold">Major Arcana Card</th>
                  <th className="text-left px-3 py-2 font-bold">Concept</th>
                </tr>
              </thead>
              <tbody>
                {LIFE_PATH_TAROT.map((row, i) => (
                  <tr key={row.num} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-bold text-indigo-700">Life Path {row.num}</td>
                    <td className="px-3 py-2 font-semibold text-gray-900">{row.card}</td>
                    <td className="px-3 py-2 text-gray-600">{row.concept}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Reading the two cards side by side is where birth-date tarot becomes genuinely useful.
            A Scorpio with a Life Path 1, for instance, blends the transformative energy of
            <strong> Death</strong> with the initiating force of <strong>The Magician</strong> — a
            person who repeatedly reinvents themselves and builds something new from the ashes.
          </p>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl
               p-6 text-center text-white my-8">
            <h2 className="text-xl font-black mb-2">Want both of your birth cards at once?</h2>
            <p className="text-purple-100 mb-4 text-sm">
              BornClock reads your date of birth for your zodiac tarot card, Life Path number,
              Vedic Rashi, lucky stone and more — all in one free profile.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-purple-700 font-black px-6 py-2.5
                          rounded-full hover:bg-purple-50 transition-colors">
              Get My Free Birthday Profile →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Understanding the Major Arcana</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The Major Arcana is the 22-card spine of the tarot, beginning with The Fool (0) and
            ending with The World (21). Each card is an archetype — a universal stage or force in
            human experience, from the fresh start of The Magician to the deep endings of Death
            and the completion of The World. Because these archetypes are timeless, they map
            naturally onto the signs of the zodiac and the numbers of numerology, which is exactly
            why your date of birth can point to a card. Whether you read your zodiac card, your
            Life Path card, or both, the aim is the same: a moment of honest self-reflection, not
            a fixed prophecy about what is to come.
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
            <li>
              <a href="/articles/numerology-by-date-of-birth" className="hover:underline">
                Numerology by Date of Birth — Find Your Life Path Number
              </a>
            </li>
            <li>
              <a href="/articles/moon-sign-by-date-of-birth" className="hover:underline">
                Moon Sign by Date of Birth — Find Your Vedic Rashi
              </a>
            </li>
          </ul>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-purple-100 mb-6">
              Your tarot cards are one layer. BornClock also shows your Western zodiac, Vedic
              Rashi, Nakshatra, Life Path number, lucky stone and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-purple-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-purple-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default TarotByDateOfBirthArticle;
