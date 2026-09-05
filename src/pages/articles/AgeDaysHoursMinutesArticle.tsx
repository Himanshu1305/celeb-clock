import React from 'react';
import { SEO } from '@/components/SEO';
import { calculateDaysLived } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Age in Days, Hours & Minutes — Life Countdown | BornClock';
const DESC = 'How many days, hours and minutes have you lived? Free calculator — exact days, hours, minutes, heartbeats, breaths, full moons and Mercury years from your DOB.';

const FAQS = [
  {
    q: 'How many days have I been alive?',
    a: 'Enter your date of birth in the calculator above and it instantly counts the exact number of days between the day you were born and today. The count uses full calendar days and automatically accounts for leap years, so a person born on 15 January 1990 will see a precise, non-zero figure that grows by one every 24 hours.',
  },
  {
    q: 'How do you convert my age in days into hours and minutes?',
    a: 'It is simple multiplication. One day contains 24 hours, and one hour contains 60 minutes. So your total hours lived equals your days lived multiplied by 24, and your minutes lived equals that number of hours multiplied by 60. A single lifetime quickly runs into hundreds of thousands of hours and tens of millions of minutes.',
  },
  {
    q: 'How many times has my heart beaten in my life?',
    a: 'A resting human heart beats roughly 60 to 100 times per minute; we use an average of about 70 beats per minute. Multiplying your total minutes lived by 70 gives a rough estimate of your lifetime heartbeat count. It is an approximation — your true count depends on your resting heart rate, fitness and activity — but it illustrates just how tirelessly your heart works.',
  },
  {
    q: 'What are Mercury years and full moons in the results?',
    a: 'Mercury orbits the Sun every 88 Earth days, so dividing your days lived by 88 tells you how many Mercury years old you are. A full moon occurs roughly every 29.5 days, so dividing your days lived by 29.5 estimates how many full moons have risen since your birth. Both are playful ways to see your age from a cosmic perspective.',
  },
  {
    q: 'Why does knowing my age in days matter for longevity?',
    a: 'Seeing your life measured in days rather than years makes time feel concrete and finite, which is a powerful motivator. Every day is a fresh opportunity to move, sleep, eat and connect in ways that add up over a lifetime. Small daily habits compound, so counting your days can be the nudge that turns good intentions into lasting change.',
  },
];

function AgeDaysCalculator() {
  const [dob, setDob] = React.useState('');
  const [days, setDays] = React.useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        setDays(calculateDaysLived(day, month, year));
      }
    }
  };

  const hours = days !== null ? days * 24 : 0;
  const minutes = hours * 60;
  const heartbeats = minutes * 70;
  const breaths = days !== null ? days * 20000 : 0;
  const fullMoons = days !== null ? Math.floor(days / 29.5) : 0;
  const mercuryYears = days !== null ? Math.floor(days / 88) : 0;

  const rows: { label: string; value: number }[] = days !== null ? [
    { label: 'Days lived', value: days },
    { label: 'Hours lived', value: hours },
    { label: 'Minutes lived', value: minutes },
    { label: 'Heartbeats (approx.)', value: heartbeats },
    { label: 'Breaths (approx.)', value: breaths },
    { label: 'Full moons seen', value: fullMoons },
    { label: 'Mercury years', value: mercuryYears },
  ] : [];

  return (
    <div data-testid="age-days-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Calculate Your Age in Days, Hours & Minutes
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Enter your date of birth to instantly see how long you have been alive.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                   text-base focus:outline-none focus:border-indigo-500 bg-white mb-4"
        aria-label="Enter your date of birth"
      />
      {days !== null && (
        <div data-testid="age-days-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {rows.map(r => (
              <div key={r.label} className="bg-indigo-50 rounded-lg p-3 text-center">
                <div className="text-xl font-black text-indigo-900">
                  {r.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">{r.label}</div>
              </div>
            ))}
          </div>
          <a href="/birthday-report"
             className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            See my complete birthday report →
          </a>
        </div>
      )}
    </div>
  );
}

export function AgeDaysHoursMinutesArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Age in Days, Hours & Minutes — Your Life in Numbers',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/age-in-days-hours-minutes/',
  };
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Age in Days, Hours & Minutes Calculator',
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
        title={TITLE}
        description={DESC}
        canonicalUrl="/articles/age-in-days-hours-minutes"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="age-in-days-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Your Age in Days, Hours & Minutes — A Life Countdown
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            We measure age in years out of habit, but a year is a blunt instrument. Behind
            every birthday sits a far more vivid number: the exact count of days, hours and
            minutes you have been alive. Seeing your life expressed this way is strangely
            moving — it turns an abstract age into something you can almost feel ticking. The
            calculator below takes your date of birth and instantly converts it into days,
            hours, minutes, and a few cosmic curiosities besides.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The maths is straightforward. Your days lived is the number of full calendar days
            since your birth, leap years included. Multiply by 24 for hours, by 60 again for
            minutes, and the figures climb into the millions. From there we estimate your
            lifetime heartbeat count and the number of breaths you have taken, then translate
            your age into full moons and Mercury years for a change of perspective.
          </p>

          <AgeDaysCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            What Happens in a Human Lifetime
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A life is an astonishing accumulation of small, repeated events. Consider what the
            numbers above represent when you zoom in on a single, tireless organ or a single
            reflex you never think about:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Your heart</strong> beats around 70 times a minute — that is roughly
              100,000 beats a day, and well over 2.5 billion beats across a long life, all
              without a single day off.
            </li>
            <li>
              <strong>Your lungs</strong> draw in air roughly 20,000 times a day. Over decades
              that is hundreds of millions of breaths, moving enough air to fill a small
              hot-air balloon many times over.
            </li>
            <li>
              <strong>The Moon</strong> completes a full cycle about every 29.5 days, so even a
              young adult has watched several hundred full moons rise, whether they noticed or
              not.
            </li>
            <li>
              <strong>Mercury</strong> races around the Sun every 88 days, which means you are
              dozens — or hundreds — of "Mercury years" old, a reminder that time itself is
              relative to where you stand in the solar system.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            None of these figures are exact predictions for any one person — a heartbeat count
            depends on fitness and rest, and breaths vary with activity — but they capture the
            sheer scale of what a body quietly does every single day you are alive.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Why Every Single Day Counts for Longevity
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            There is a practical reason to count your days rather than your years. Longevity is
            not decided by grand, one-off resolutions; it is decided by what you repeat. The
            days you have lived are gone, but the days ahead are a resource you spend one at a
            time. Framing life as a running total of days makes each one feel like a deliberate
            choice rather than a rounding error inside a year.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            The research is consistent: modest daily habits compound into years of extra life.
            Walking for fifteen minutes a day is associated with roughly three additional years
            of life expectancy. Sleeping seven to eight hours, eating more plants, managing
            stress and staying socially connected each move the needle — and they do it through
            the accumulation of ordinary days, not heroic weeks.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            That is the quiet power of a day-counter. Watching the number tick up is a reminder
            that you are always mid-stream, never too early and never too late to make the next
            day count. If the figure on the screen surprises you, let it be a nudge to protect
            the days still ahead.
          </p>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white my-10">
            <h2 className="text-2xl font-black mb-2">Turn Your Numbers Into a Full Report</h2>
            <p className="text-indigo-200 mb-6">
              Your days-lived count is just the beginning. A BornClock birthday report adds your
              zodiac, numerology, planetary ages and life milestones — all from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Generate My Free Birthday Report →
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

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 text-center mb-10">
            <p className="text-gray-700 mb-4">
              Curious how your days translate into a deeper picture of who you are and how you're
              living?
            </p>
            <a href="/birthday-report"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3
                          rounded-full text-base hover:bg-indigo-700 transition-colors">
              Open My Free Birthday Report →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Related Articles</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <a href="/articles/planetary-age-calculator"
               className="block bg-white border-2 border-gray-200 rounded-xl p-5
                          hover:border-indigo-400 transition-colors">
              <div className="font-bold text-gray-900 mb-1">Planetary Age Calculator</div>
              <div className="text-sm text-gray-600">
                How old are you on Mercury, Mars and Saturn? See your age across the solar system.
              </div>
            </a>
            <a href="/articles/numerology-by-date-of-birth"
               className="block bg-white border-2 border-gray-200 rounded-xl p-5
                          hover:border-indigo-400 transition-colors">
              <div className="font-bold text-gray-900 mb-1">Numerology by Date of Birth</div>
              <div className="text-sm text-gray-600">
                Find your Life Path number and what your birth date reveals about you.
              </div>
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default AgeDaysHoursMinutesArticle;
