import React from 'react';
import { ArticleLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { NAKSHATRA_PROFILES } from '@/data/astrologicalData';
import type { NakshatraProfile } from '@/data/astrologicalData';
import { moonSignsForDate, describeAlternatives } from '@/lib/vedic/dateOnlyMoonSign';
import { DateOnlyMoonNote } from '@/components/vedic/DateOnlyMoonNote';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// NAKSHATRA_PROFILES keys are space-less (e.g. "PurvaPhalguni") while each object
// carries a `.nakshatra` display field (e.g. "Purva Phalguni"). The chart engine
// returns the display name, so we resolve profiles via a lookup keyed on `.nakshatra`.
const PROFILE_BY_NAME: Record<string, NakshatraProfile> = Object.values(NAKSHATRA_PROFILES)
  .reduce((acc, p) => { acc[p.nakshatra] = p; return acc; }, {} as Record<string, NakshatraProfile>);

// Ordered list of all 27 profiles, sorted by their canonical number.
const NAKSHATRAS_ORDERED: NakshatraProfile[] = Object.values(NAKSHATRA_PROFILES)
  .sort((a, b) => a.number - b.number);

const GANA_INFO = [
  {
    name: 'Deva (Divine)',
    desc: 'Deva gana Nakshatras carry a divine, godly temperament. Natives are typically gentle, generous, spiritually inclined and compassionate, drawn toward harmony rather than conflict. There are nine Deva Nakshatras, including Ashwini, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana and Revati.',
  },
  {
    name: 'Manushya (Human)',
    desc: 'Manushya gana Nakshatras carry a human, worldly temperament — a balance of the divine and the demonic. Natives blend ambition with compassion, are practically capable, and navigate material and emotional life with a grounded, relatable nature. Bharani, Rohini, Ardra and the four Phalguni/Ashadha/Bhadrapada pairs fall here.',
  },
  {
    name: 'Rakshasa (Demonic)',
    desc: 'Rakshasa gana Nakshatras carry an intense, powerful temperament. This does not mean "evil" — it describes willpower, sharpness, protectiveness and a capacity to transform through struggle. Natives are determined, perceptive and formidable. Krittika, Ashlesha, Magha, Chitra, Vishakha, Jyeshtha, Mula, Dhanishtha and Shatabhisha are Rakshasa Nakshatras.',
  },
];

const FAQS = [
  {
    q: 'What is a Nakshatra by date of birth?',
    a: 'A Nakshatra is one of the 27 lunar mansions of Vedic astrology — the segment of the sky the Moon occupied at your birth. Each Nakshatra spans about 13°20\' of the zodiac and carries a ruling planet (lord), a presiding deity, a gana (temperament) and a distinct personality signature. BornClock works out the Moon\'s real sidereal position for your birth date and shows the Nakshatra (or, if the Moon moved on that day, the two or three possible ones).',
  },
  {
    q: 'How many Nakshatras are there and what are they?',
    a: 'There are exactly 27 Nakshatras, beginning with Ashwini and ending with Revati. Together they divide the 360° zodiac into 27 equal lunar mansions of roughly 13.3° each. Every one of the 12 Rashis (moon signs) contains parts of two or three Nakshatras, which is why Nakshatras give finer detail than the sign alone.',
  },
  {
    q: 'What are the three ganas — Deva, Manushya and Rakshasa?',
    a: 'Gana is the temperament class of a Nakshatra. Deva (divine) Nakshatras are gentle and spiritual; Manushya (human) Nakshatras are balanced and worldly; Rakshasa (demonic) Nakshatras are intense and powerful. Gana matters most in Kundali Milan (marriage matching), where compatible ganas are considered a favourable sign.',
  },
  {
    q: 'Can I find my Nakshatra accurately from date of birth alone?',
    a: 'Often not exactly. The Moon passes through a full Nakshatra in roughly a day, so on most dates it changes Nakshatra at some point during the day. BornClock checks the Moon from 00:00 to 23:59 Indian Standard Time and shows every Nakshatra possible that day; your exact birth time and place (in the Kundali) decide which one, its pada (quarter) and the traditional naming syllable.',
  },
  {
    q: 'Why is Nakshatra used to name babies in India?',
    a: 'In the traditional Namakaran ceremony, a newborn\'s name often begins with a syllable drawn from the pada (quarter) of the Nakshatra the Moon occupied at birth. Each of the 27 Nakshatras is divided into four padas, and each pada is linked to a specific starting sound — a custom that ties the child\'s name to the sky at the moment of birth.',
  },
];

function NakshatraCalculator() {
  const [dob, setDob] = React.useState('');
  const [names, setNames] = React.useState<string[]>([]);
  const profiles = names.map(n => PROFILE_BY_NAME[n]).filter((p): p is NakshatraProfile => !!p);
  const profile = profiles[0] ?? null;
  const fallbackName = names.length > 0 && !profile ? describeAlternatives(names) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    // Batch 6: real sidereal Moon (chart engine) for the whole date.
    const r = val.length === 10 ? moonSignsForDate(val) : null;
    setNames(r ? r.nakshatraNames : []);
  };

  return (
    <div data-testid="nakshatra-calculator"
         className="bg-brand-purple/10 border-2 border-brand-purple/30 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-brand-purple mb-1">
        Find Your Nakshatra — Free Calculator
      </h3>
      <p className="text-sm text-brand-purple mb-4">
        Enter your date of birth to see the Nakshatra(s) the Moon was in that day.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-brand-purple/30 rounded-xl px-4 py-3
                   text-base bg-white mb-4 focus:outline-none focus:border-brand-purple/30"
        aria-label="Enter your date of birth"
      />
      {profile && (
        <div data-testid="nakshatra-result"
             className="bg-white rounded-xl border-2 border-brand-purple/30 p-5">
          <div className="text-sm text-gray-600 mb-2">
            Nakshatra: <strong data-testid="nakshatra-answer">{describeAlternatives(names)}</strong>
          </div>
          {profiles.length > 1 && (
            <p className="text-xs text-gray-500 mb-2">Showing {profile.nakshatra} first; your birth time decides which one is yours.</p>
          )}
          <div className="text-2xl font-black text-brand-purple mb-0.5">
            {profile.nakshatra}
          </div>
          <div className="text-sm text-gray-500 mb-3">
            Nakshatra #{profile.number} · Lord: {profile.lord} · Gana: {profile.gana} · Deity: {profile.deity}
          </div>
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">
              🪐 Lord: {profile.lord}
            </span>
            <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">
              🕉 Deity: {profile.deity}
            </span>
            <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">
              ✨ Gana: {profile.gana}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {profile.personality_summary}
          </p>
          <a href={`/birthday-report/?dob=${dob}`}
             className="inline-block bg-brand-navy text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-brand-navy">
            See my full birthday profile →
          </a>
        </div>
      )}
      {!profile && fallbackName && (
        <div data-testid="nakshatra-result"
             className="bg-white rounded-xl border-2 border-brand-purple/30 p-5 text-sm text-gray-700">
          Your Nakshatra is <strong>{fallbackName}</strong>. Full profile details are being added.
        </div>
      )}
      <DateOnlyMoonNote ambiguous={names.length ? names.length > 1 : null} what="Nakshatra" />
    </div>
  );
}

export function NakshatraArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Nakshatra by Date of Birth — All 27 Lunar Mansions Explained',
    description: 'Find your Nakshatra by date of birth. All 27 lunar mansions with lord, deity, gana and personality, plus a free Nakshatra calculator.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/nakshatra-by-date-of-birth/',
  };
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BornClock Nakshatra Calculator',
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
      theme="vedic"
      testId="nakshatra-article"
      seo={(
        <SEO
          title="Nakshatra by Date of Birth — All 27 Lunar Mansions | BornClock"
          description="Find your Nakshatra by date of birth — all 27 lunar mansions with lord, deity, gana and personality. Free calculator plus the meaning of each Nakshatra."
          canonicalUrl="/articles/nakshatra-by-date-of-birth"
          ogType="article"
          articleSchema={false}
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }], current: 'Nakshatra' }}
      footer={{
        tagline: 'Nakshatra by date of birth — all 27 lunar mansions with lord, deity and gana.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology/' },
          { label: 'Kundali', to: '/kundali/' },
          { label: 'Kundali Matching', to: '/kundali-match/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
      eyebrow="Vedic Astrology"
      h1="Nakshatra by Date of Birth — All 27 Lunar Mansions"
      lead={(
        <>
          In Vedic astrology, the <strong>Nakshatra</strong> — or lunar mansion — is the most
          intimate layer of your birth sky. While your Rashi (moon sign) is one of 12 broad
          signs, your Nakshatra is one of <strong>27</strong> finer divisions: the exact
          segment of the zodiac the Moon occupied at the moment you were born. Each Nakshatra
          spans roughly 13°20&rsquo; of the heavens, and together the 27 of them map the full 360°
          journey of the Moon against the fixed stars.
        </>
      )}
    >
      <JsonLd data={articleSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <section className="section" data-testid="nakshatra-article">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <p className="text-gray-700 leading-relaxed mb-6">
            Because the Nakshatra tracks the Moon so closely, it is treasured in Indian tradition
            for detail the Rashi cannot give: the temperament (gana) used in marriage matching,
            the ruling planet and presiding deity that colour your inner nature, and the naming
            syllable chosen for a newborn. BornClock works out the Moon's real sidereal position for your
            date of birth. The Moon passes through a full Nakshatra in about a single day, so on
            most dates two are possible and your exact birth time and place decide which one.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">What Is a Nakshatra?</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The word Nakshatra means "that which does not decay" — the eternal stars. Long before
            the 12-sign zodiac was widely used in India, astrologers charted the sky by the
            Moon's nightly progress through these 27 lunar mansions. Each Nakshatra carries four
            defining attributes: a <strong>lord</strong> (one of the nine planets, or grahas,
            that rules it), a presiding <strong>deity</strong>, a symbolic image, and a
            <strong> gana</strong> or temperament class. Every one of the 12 Rashis contains
            parts of two or three Nakshatras, which is why two people born under the same moon
            sign can feel so different — their Nakshatras differ.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your Nakshatra is used across Indian life. In <strong>Kundali Milan</strong> (marriage
            compatibility), the ganas and lords of two Nakshatras are compared. In the
            <strong> Namakaran</strong> naming ceremony, a baby's first syllable is drawn from the
            pada, or quarter, of their birth Nakshatra. And in <strong>muhurta</strong> — choosing
            auspicious timing — the Moon's Nakshatra on a given day guides whether it is favourable
            for weddings, travel or new ventures.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Three Ganas Explained</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Every Nakshatra belongs to one of three <strong>ganas</strong>, or temperament
            classes. Gana describes the essential nature a person tends to express, and it is one
            of the most important factors in traditional compatibility matching.
          </p>
          <div className="space-y-3 mb-8">
            {GANA_INFO.map(g => (
              <div key={g.name} className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-4">
                <h3 className="font-bold text-brand-purple mb-1">{g.name}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>

          <NakshatraCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">All 27 Nakshatras Explained</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Below are all 27 Nakshatras in their traditional order, from Ashwini to Revati, each
            with its number, ruling planet (lord), presiding deity, gana and a line on its core
            personality.
          </p>
          {NAKSHATRAS_ORDERED.map(p => (
            <section key={p.number} id={`nakshatra-${p.number}`} className="mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {p.number}. {p.nakshatra}
              </h3>
              <div className="text-xs text-gray-500 mb-2">
                Lord: {p.lord} · Deity: {p.deity} · Gana: {p.gana}
              </div>
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">
                  🪐 {p.lord}
                </span>
                <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">
                  🕉 {p.deity}
                </span>
                <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">
                  ✨ {p.gana}
                </span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  🔱 {p.symbol}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                {p.personality_summary}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Quality: </strong>{p.quality}
              </p>
            </section>
          ))}

          <h2 className="text-2xl font-black text-gray-900 mb-3">Nakshatra, Rashi and Your Full Chart</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your Nakshatra never works alone. It sits inside your <strong>Rashi</strong> (moon
            sign) and interacts with your <strong>birth chart</strong> as a whole. To understand
            the bigger picture, explore how your moon sign shapes your emotional nature in our
            guide to the{' '}
            <a href="/articles/moon-sign-by-date-of-birth/" className="text-brand-purple underline font-semibold">
              moon sign by date of birth
            </a>
            , and see how every placement fits together in the{' '}
            <a href="/articles/vedic-astrology-birth-chart/" className="text-brand-purple underline font-semibold">
              Vedic astrology birth chart
            </a>{' '}
            guide. For the fastest complete reading, generate your full{' '}
            <a href="/birthday-report/" className="text-brand-purple underline font-semibold">
              birthday report
            </a>{' '}
            — it combines your Nakshatra, Rashi, Western zodiac and more from a single date of birth.
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

          <div className="bg-gradient-to-r from-brand-purple to-brand-purple rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-white/90 mb-6">
              Your Nakshatra is just one layer. BornClock also shows your Rashi, Western zodiac,
              Life Path number, lucky stone, and more — all from your date of birth.
            </p>
            <a href="/birthday-report/"
               className="inline-block bg-white text-brand-purple font-black px-8 py-3
                          rounded-full text-lg hover:bg-brand-purple/10 transition-colors">
              Generate My Free Birthday Report →
            </a>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/moon-sign-by-date-of-birth/" className="text-brand-purple underline font-semibold">
                  Moon Sign by Date of Birth — Find Your Vedic Rashi
                </a>
              </li>
              <li>
                <a href="/articles/vedic-astrology-birth-chart/" className="text-brand-purple underline font-semibold">
                  Vedic Astrology Birth Chart — Read Your Kundali
                </a>
              </li>
            </ul>
          </div>

        </article>
      </section>
    </ArticleLayout>
  );
}

export default NakshatraArticle;
