import React from 'react';
import { ArticleLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { WESTERN_ZODIAC_PROFILES } from '@/data/astrologicalData';
import type { WesternZodiacProfile } from '@/data/astrologicalData';
import { calculateWesternZodiac } from '@/utils/celebrityCalculations';
import { getTarotBirthCards, MAJOR_ARCANA } from '@/data/tarotData';
import { describeBirthCardWorking } from '@/lib/tarot/birthCard';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Audit N7: birth-card table for the ONE sitewide method (Mary K. Greer: month + day + year,
// digits added until 22 or less). Pairs follow Greer: 10–21 reduce to their digit sum,
// 19 → 10 → 1, and 22 = The Fool (0) with The Emperor (4).
const BIRTH_CARD_PAIRS: { total: string; cards: number[] }[] = [
  { total: '10', cards: [10, 1] }, { total: '11', cards: [11, 2] }, { total: '12', cards: [12, 3] },
  { total: '13', cards: [13, 4] }, { total: '14', cards: [14, 5] }, { total: '15', cards: [15, 6] },
  { total: '16', cards: [16, 7] }, { total: '17', cards: [17, 8] }, { total: '18', cards: [18, 9] },
  { total: '19', cards: [19, 10, 1] }, { total: '20', cards: [20, 2] }, { total: '21', cards: [21, 3] },
  { total: '22', cards: [0, 4] }, { total: '1–9 (single digit)', cards: [] },
];

const FAQS = [
  {
    q: 'What is my tarot card by date of birth?',
    a: 'Your tarot card by date of birth is your tarot birth card, found with the standard method popularised by Mary K. Greer and used by most birth card calculators: add your birth month, day and full year as numbers, then add the digits of the total until you reach 22 or less. For 31 August 1996: 8 + 31 + 1996 = 2035, and 2 + 0 + 3 + 5 = 10, so the birth card is Wheel of Fortune (10), paired with The Magician (1 + 0 = 1). Separately, each zodiac sign also has a traditional Major Arcana correspondence, which describes your sun sign rather than your birth date.',
  },
  {
    q: 'How is a tarot card assigned to my zodiac sign?',
    a: 'Each of the 22 Major Arcana cards has long been associated with an astrological sign, planet, or element in the Western esoteric tradition. Aries links to The Emperor, Taurus to The Hierophant, Scorpio to Death, and so on. BornClock uses this established correspondence — it never invents cards. This zodiac card is a different thing from your birth card: it is the same for everyone born under your sun sign.',
  },
  {
    q: 'Why do I have two (or three) birth cards?',
    a: 'If your total is between 10 and 21, that card is your birth card and the sum of its two digits gives its pair — 18 (The Moon) pairs with 9 (The Hermit). A total of 19 gives three cards: The Sun (19), Wheel of Fortune (10) and The Magician (1). A total of 22 is The Fool, paired with The Emperor (4). If the total reduces straight to a single digit, that one card is your birth card on its own.',
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
  const [birth, setBirth] = React.useState<{ names: string[]; working: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const zodiac = calculateWesternZodiac(day, month);
        setProfile(WESTERN_ZODIAC_PROFILES[zodiac.sign] ?? null);
        const bc = getTarotBirthCards(day, month, year);
        setBirth({
          names: bc.cards.map(c => `${c.name} (${c.number})`),
          working: describeBirthCardWorking(day, month, year),
        });
      }
    }
  };

  return (
    <div data-testid="tarot-calculator"
         className="bg-[#6E5AA6]/10 border-2 border-[#6E5AA6]/30 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-[#6E5AA6] mb-1">
        Find Your Tarot Card by Date of Birth — Free
      </h3>
      <p className="text-sm text-[#6E5AA6] mb-4">
        Enter your date of birth to reveal your tarot birth card (standard month + day + year method).
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-[#6E5AA6]/30 rounded-xl px-4 py-3
                   text-base bg-white mb-4 focus:outline-none focus:border-[#6E5AA6]/30"
        aria-label="Enter your date of birth"
      />
      {birth && (
        <div data-testid="tarot-result"
             className="bg-white rounded-xl border-2 border-[#6E5AA6]/30 p-5">
          <div className="text-sm text-gray-500 mb-1">Your tarot birth card</div>
          <div data-testid="tarot-birth-card" className="text-2xl font-black text-[#6E5AA6] mb-1">
            {birth.names[0]}
          </div>
          {birth.names.length > 1 && (
            <p className="text-sm text-gray-700 mb-1">Paired with {birth.names.slice(1).join(' and ')}</p>
          )}
          <p className="text-xs text-gray-500 mb-4">{birth.working}</p>
          {profile && (
            <p data-testid="tarot-zodiac-card" className="text-sm text-gray-700 leading-relaxed mb-4">
              Separate tradition: your sun sign, {profile.sign} {profile.symbol}, corresponds
              to <strong>{profile.tarot_card}</strong> — {profile.tarot_meaning.charAt(0).toLowerCase() + profile.tarot_meaning.slice(1)}.
            </p>
          )}
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-[#0E2238] text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-[#0E2238]">
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
    description: 'Find your tarot birth card by date of birth using the standard month + day + year method, plus the Major Arcana card for each zodiac sign.',
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
    <ArticleLayout
      theme="mystic"
      testId="tarot-article"
      seo={(
        <SEO
          title="Tarot Card by Date of Birth — Find Your Card | BornClock"
          description="Find your tarot birth card by date of birth with the standard month + day + year method, plus the Major Arcana card for each zodiac sign. Free tarot-by-birthday guide."
          canonicalUrl="/articles/tarot-card-by-date-of-birth"
          ogType="article"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Articles', to: '/articles' }], current: 'Tarot by Date of Birth' }}
      footer={{
        tagline: 'Find your tarot birth card by date of birth — month + day + year, reduced to the Major Arcana.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Numerology', to: '/numerology' },
          { label: 'Zodiac', to: '/zodiac' },
          { label: 'Compatibility', to: '/compatibility' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Tarot"
      h1="Tarot Card by Date of Birth — Find Your Tarot Card"
      lead={(
        <>
          Your <strong>tarot birth card</strong> comes from one of the 22 cards of the
          <strong> Major Arcana</strong> — the archetypal images at the heart of every tarot
          deck. BornClock uses the standard method popularised by tarot author Mary K. Greer
          and used by most birth card calculators: add your birth month, day and full year,
          then reduce the total to a number of 22 or less. Most people get a pair of cards.
          Separately, each zodiac sign has its own traditional Major Arcana card, which
          describes your sun sign rather than your exact birth date.
        </>
      )}
    >
      <JsonLd data={articleSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <section className="section" data-testid="tarot-article">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <p className="text-gray-700 leading-relaxed mb-6">
            BornClock does not invent these pairings. The birth card follows Mary K. Greer's
            published method, and every zodiac card below comes from the long-established
            correspondence between the signs and the Major Arcana used in classic esoteric
            tarot. Enter your date of birth in the calculator to see your birth card and how it
            was worked out.
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
            Your birth card itself comes from your full date of birth. Add the month, day and
            year as numbers — 31 August 1996 gives 8 + 31 + 1996 = 2035 — then add the digits
            (2 + 0 + 3 + 5 = 10) and keep going until the result is 22 or less. That number is
            your <strong>birth card</strong>; reducing it once more gives its pair. Where your
            zodiac card speaks to your sun sign's temperament, your birth card is specific to
            your birth date.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Tarot Card for Every Zodiac Sign</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Here is the complete table of all 12 zodiac signs and the Major Arcana card each one
            corresponds to, with the traditional meaning of that card.
          </p>
          <div className="overflow-x-auto mb-8" tabIndex={0} role="region" aria-label="Tarot card by zodiac sign">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#6E5AA6]/10 text-[#6E5AA6]">
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
                      <td className="px-3 py-2 font-bold text-[#6E5AA6]">{p.tarot_card}</td>
                      <td className="px-3 py-2 text-gray-600">{p.tarot_meaning}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Tarot Birth Card Pairs by Number</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Once you have reduced month + day + year to 22 or less, read across to find your
            birth card and its pair.
          </p>
          <div className="overflow-x-auto mb-8" tabIndex={0} role="region" aria-label="Tarot birth card pairs by number">
            <table data-testid="birth-card-table" className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#6E5AA6]/10 text-[#6E5AA6]">
                  <th className="text-left px-3 py-2 font-bold">Reduced total</th>
                  <th className="text-left px-3 py-2 font-bold">Birth card</th>
                  <th className="text-left px-3 py-2 font-bold">Paired with</th>
                </tr>
              </thead>
              <tbody>
                {BIRTH_CARD_PAIRS.map((row, i) => (
                  <tr key={row.total} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-bold text-[#6E5AA6]">{row.total}</td>
                    <td className="px-3 py-2 font-semibold text-gray-900">
                      {row.cards.length ? `${MAJOR_ARCANA[row.cards[0]].name} (${MAJOR_ARCANA[row.cards[0]].number})` : 'That single card (The Magician to The Hermit)'}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {row.cards.length ? row.cards.slice(1).map(n => `${MAJOR_ARCANA[n].name} (${MAJOR_ARCANA[n].number})`).join(' and ') : 'Stands alone'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Reading the pair together is where birth-date tarot becomes genuinely useful. A
            birth card of <strong>Death</strong> (13) paired with <strong>The Emperor</strong> (4),
            for instance, describes a person who repeatedly reinvents themselves and then builds
            something solid from each new start.
          </p>

          <div className="bg-gradient-to-r from-[#6E5AA6] to-[#6E5AA6] rounded-2xl
               p-6 text-center text-white my-8">
            <h2 className="text-xl font-black mb-2">Want both of your birth cards at once?</h2>
            <p className="text-[#6E5AA6] mb-4 text-sm">
              BornClock reads your date of birth for your tarot birth card, zodiac sign, Life Path
              number, Vedic Rashi, lucky stone and more — all in one free profile.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-[#6E5AA6] font-black px-6 py-2.5
                          rounded-full hover:bg-[#6E5AA6]/10 transition-colors">
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
            why your date of birth can point to a card. Whether you read your birth card, your
            zodiac card, or both, the aim is the same: a moment of honest self-reflection, not
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
          <ul className="list-disc pl-6 text-[#6E5AA6] mb-10 space-y-1">
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

          <div className="bg-gradient-to-r from-[#6E5AA6] to-[#6E5AA6] rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-[#6E5AA6] mb-6">
              Your tarot cards are one layer. BornClock also shows your Western zodiac, Vedic
              Rashi, Nakshatra, Life Path number, lucky stone and more — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-[#6E5AA6] font-black px-8 py-3
                          rounded-full text-lg hover:bg-[#6E5AA6]/10 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

        </article>
      </section>
    </ArticleLayout>
  );
}

export default TarotByDateOfBirthArticle;
