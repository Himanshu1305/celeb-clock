import React from 'react';
import { SEO } from '@/components/SEO';
import { WESTERN_ZODIAC_PROFILES } from '@/data/astrologicalData';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// For each month, the zodiac sign that covers MOST of that month's days.
// (A calendar month always spans two signs; we use the dominant one.)
const MONTHS: { month: string; sign: string; note: string }[] = [
  { month: 'January', sign: 'Capricorn', note: 'Jan 1–19 is Capricorn; Jan 20–31 shifts into Aquarius.' },
  { month: 'February', sign: 'Aquarius', note: 'Feb 1–18 is Aquarius; Feb 19–29 shifts into Pisces.' },
  { month: 'March', sign: 'Pisces', note: 'Mar 1–20 is Pisces; Mar 21–31 shifts into Aries.' },
  { month: 'April', sign: 'Aries', note: 'Apr 1–19 is Aries; Apr 20–30 shifts into Taurus.' },
  { month: 'May', sign: 'Taurus', note: 'May 1–20 is Taurus; May 21–31 shifts into Gemini.' },
  { month: 'June', sign: 'Gemini', note: 'Jun 1–20 is Gemini; Jun 21–30 shifts into Cancer.' },
  { month: 'July', sign: 'Cancer', note: 'Jul 1–22 is Cancer; Jul 23–31 shifts into Leo.' },
  { month: 'August', sign: 'Leo', note: 'Aug 1–22 is Leo; Aug 23–31 shifts into Virgo.' },
  { month: 'September', sign: 'Virgo', note: 'Sep 1–22 is Virgo; Sep 23–30 shifts into Libra.' },
  { month: 'October', sign: 'Libra', note: 'Oct 1–22 is Libra; Oct 23–31 shifts into Scorpio.' },
  { month: 'November', sign: 'Scorpio', note: 'Nov 1–21 is Scorpio; Nov 22–30 shifts into Sagittarius.' },
  { month: 'December', sign: 'Sagittarius', note: 'Dec 1–21 is Sagittarius; Dec 22–31 shifts into Capricorn.' },
];

const FAQS = [
  {
    q: 'Does your birth month really affect your personality?',
    a: 'Your birth month determines your dominant Western zodiac sign for most of that month, and each sign carries a well-documented set of personality themes. Separately, a small body of peer-reviewed research points to modest "seasonal birth" effects — for example, subtle differences in early neural development for winter-born babies. These effects are real but small, and are not the same thing as astrology.',
  },
  {
    q: 'What zodiac sign am I if I was born in a particular month?',
    a: 'Every calendar month spans two zodiac signs because the signs are defined by roughly 30-day windows that do not line up with month boundaries. This guide lists the dominant sign for each month — the one that covers most of its days — and notes the exact date on which the sign changes, so you can confirm yours by your day of birth.',
  },
  {
    q: 'Which birth month has the best personality traits?',
    a: 'No month is objectively "best." Each of the twelve signs has its own strengths — Capricorn discipline, Leo warmth, Libra diplomacy, Scorpio intensity — drawn here from BornClock\'s zodiac profiles rather than invented. What matters is how you work with your natural tendencies, not the month you were born in.',
  },
  {
    q: 'Is the seasonal birth effect the same as astrology?',
    a: 'No. Astrology links personality to the position of the sun and planets and is a cultural tradition, not a scientific claim. The "seasonal birth effect" is a separate, measurable phenomenon studied in epidemiology and neuroscience, where the time of year of birth correlates with small differences in factors such as vitamin D exposure and early brain development. The effect sizes are small.',
  },
  {
    q: 'How does BornClock use my birth month?',
    a: 'BornClock takes your full date of birth — not just the month — and calculates your exact Western zodiac sign, your Vedic Rashi, your Nakshatra, and your numerology Life Path number. This means it can tell precisely which sign you fall under even on the cusp days when a month changes signs, then enrich that with numerology and astrology into one profile.',
  },
];

export function BirthMonthPersonalityArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Birth Month Personality — What Your Birth Month Says About You',
    description: 'Birth month personality guide — the zodiac sign and traits linked to each of the 12 months, plus the science of seasonal birth effects.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/birth-month-personality/',
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
        title="Birth Month Personality — What Your Month Says | BornClock"
        description="Birth month personality guide — the zodiac sign and traits linked to each of the 12 months, plus the science of seasonal birth effects."
        canonicalUrl="/articles/birth-month-personality"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="birth-month-personality-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Birth Month Personality — What Your Birth Month Says About You
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            People have always sensed that their birth month means something. Whether you
            were born in the depths of winter or the height of summer, your month places you
            under a dominant <strong>zodiac sign</strong> and — according to a small but
            genuine strand of scientific research — may even leave a faint imprint on your
            early development. This guide walks through all twelve months, pairs each with the
            zodiac sign that covers most of its days, and describes the real, sourced
            personality themes of that sign.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Every traits summary below is drawn directly from BornClock's zodiac profiles —
            nothing is invented. Because the signs do not line up neatly with calendar months,
            each entry also tells you the exact date on which the sign changes, so you can
            confirm your own sign from your day of birth.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">The 12 Birth Months and Their Zodiac Signs</h2>
          {MONTHS.map(({ month, sign, note }) => {
            const p = WESTERN_ZODIAC_PROFILES[sign];
            if (!p) return null;
            return (
              <section key={month} id={`month-${month.toLowerCase()}`} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  Born in {month} — {p.sign} {p.symbol}
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  Dominant sign: {p.sign} · {p.element} · Ruled by {p.ruling_planet} · {p.date_range}
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{p.personality_summary}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.strengths.map(s => (
                    <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic">{note}</p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-3">The Real Science of Seasonal Birth Effects</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Astrology aside, researchers have found small, measurable differences that track
            with the season of birth. Studies in epidemiology and neuroscience have linked
            winter and early-spring births to subtle differences in early neural development,
            thought to be driven by real environmental factors such as maternal vitamin D
            levels, daylight exposure, and seasonal infection patterns during pregnancy.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            It is important to be precise about the magnitude: these are <strong>small
            effects</strong> at the level of large populations, not destiny for any one person.
            They are also completely separate from astrology — one is a statistical footnote in
            developmental science, the other is a cultural tradition. Both, however, explain why
            the question "does my birth month say anything about me?" keeps coming back.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
            <h3 className="text-lg font-black text-indigo-900 mb-2">
              BornClock enriches your birth month with numerology + astrology
            </h3>
            <p className="text-sm text-indigo-800 leading-relaxed mb-4">
              Your month alone is a blunt instrument — it can only ever tell you your
              dominant sign. BornClock uses your full date of birth to calculate your exact
              Western zodiac sign (even on cusp days), your Vedic Rashi, your Nakshatra, and
              your numerology Life Path number, then combines numerology and astrology into a
              single, personalised birthday profile.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                          rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Generate my free birthday profile →
            </a>
          </div>

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
            <li><a href="/articles/numerology-by-date-of-birth" className="hover:underline">Numerology by Date of Birth — Find Your Life Path Number</a></li>
            <li><a href="/articles/moon-sign-by-date-of-birth" className="hover:underline">Moon Sign by Date of Birth — Your Emotional Blueprint</a></li>
          </ul>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">See What Your Exact Birth Date Reveals</h2>
            <p className="text-indigo-200 mb-6">
              Go beyond your birth month. BornClock reads your full date of birth for your
              precise zodiac sign, Rashi, Nakshatra, Life Path number, and more.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default BirthMonthPersonalityArticle;
