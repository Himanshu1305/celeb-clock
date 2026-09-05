import React from 'react';
import { SEO } from '@/components/SEO';
import { calculateDaysLived } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const TITLE = 'Biorhythm Calculator — Physical, Emotional & Intellectual | BornClock';
const DESC = 'Free biorhythm calculator — track your physical (23-day), emotional (28-day) and intellectual (33-day) cycles from your date of birth.';

const CYCLES = [
  {
    key: 'physical',
    name: 'Physical',
    period: 23,
    color: 'rose',
    desc: 'The physical cycle runs on a 23-day rhythm and reflects your energy, strength, stamina, coordination and general bodily wellbeing. Athletes and people doing demanding work often watch this cycle most closely.',
  },
  {
    key: 'emotional',
    name: 'Emotional',
    period: 28,
    color: 'amber',
    desc: 'The emotional cycle runs on a 28-day rhythm and reflects your mood, sensitivity, creativity and how you connect with others. When it is high you tend to feel warm and optimistic; when it is low you may feel more withdrawn.',
  },
  {
    key: 'intellectual',
    name: 'Intellectual',
    period: 33,
    color: 'indigo',
    desc: 'The intellectual cycle runs on a 33-day rhythm and reflects your reasoning, memory, focus and decision-making. It is the cycle many people consult before exams, important meetings or big decisions.',
  },
] as const;

const FAQS = [
  {
    q: 'What is a biorhythm and how is it calculated?',
    a: 'A biorhythm is a simple sine-wave model that maps three natural cycles from your date of birth: physical (23 days), emotional (28 days) and intellectual (33 days). For any day, the value of a cycle is sin(2 × π × days-lived ÷ period) × 100, giving a percentage between -100 and +100. Positive days are considered "high", negative days "low", and the day a cycle crosses zero is called a "critical" day.',
  },
  {
    q: 'What do the three biorhythm cycles mean?',
    a: 'The physical cycle (23 days) tracks energy, strength and stamina. The emotional cycle (28 days) tracks mood, sensitivity and creativity. The intellectual cycle (33 days) tracks focus, memory and reasoning. Each rises and falls independently, so on any given day you might be physically high but intellectually low.',
  },
  {
    q: 'What is a "critical" biorhythm day?',
    a: 'A critical day is when a cycle crosses the zero line — switching from its high (positive) phase to its low (negative) phase or vice versa. On critical days the cycle is neither high nor low but in transition, which biorhythm tradition treats as an unstable, take-it-easy day for that area of life.',
  },
  {
    q: 'Are biorhythms scientifically proven?',
    a: 'No. Biorhythms are not supported by scientific evidence and cannot predict events, performance or health. BornClock presents biorhythms purely as a fun, structured tool for self-reflection — a prompt to check in with your body, mood and mind — never as a medical or predictive forecast.',
  },
  {
    q: 'How often should I check my biorhythm?',
    a: 'Because the cycles are short, your biorhythm changes every day. Many people glance at it in the morning as a light reflection exercise: if your physical cycle is low, you might plan a gentler day; if your intellectual cycle is high, you might tackle harder mental work. Treat it as a journaling prompt, not a rule.',
  },
];

type CycleResult = { name: string; period: number; value: number; label: string; color: string };

function cycleLabel(value: number): string {
  if (value >= 15) return 'High';
  if (value <= -15) return 'Low';
  return 'Critical';
}

function BiorhythmCalculator() {
  const [dob, setDob] = React.useState('');
  const [results, setResults] = React.useState<CycleResult[] | null>(null);
  const [daysLived, setDaysLived] = React.useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const lived = calculateDaysLived(day, month, year);
        setDaysLived(lived);
        setResults(
          CYCLES.map(c => {
            const value = Math.round(Math.sin((2 * Math.PI * lived) / c.period) * 100);
            return { name: c.name, period: c.period, value, label: cycleLabel(value), color: c.color };
          }),
        );
      }
    }
  };

  const colorMap: Record<string, string> = {
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div data-testid="biorhythm-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Calculate Your Biorhythm Free
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Enter your date of birth to see today's physical, emotional and intellectual cycles.
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
      {results && daysLived !== null && (
        <div data-testid="biorhythm-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <p className="text-sm text-gray-600 mb-4">
            You have lived <strong>{daysLived.toLocaleString()}</strong> days. Here are today's cycle
            values (each between -100% and +100%):
          </p>
          <div className="space-y-4">
            {results.map(r => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">
                    {r.name} <span className="text-xs text-gray-500 font-normal">({r.period}-day)</span>
                  </span>
                  <span className="font-black text-gray-900">
                    {r.value}% · {r.label}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300" />
                  <div
                    className={`h-full ${colorMap[r.color]} rounded-full`}
                    style={{
                      marginLeft: r.value >= 0 ? '50%' : `${50 + r.value / 2}%`,
                      width: `${Math.abs(r.value) / 2}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 mb-4">
            Biorhythms are a self-reflection tool, not a scientifically proven prediction.
          </p>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            See my complete birthday profile →
          </a>
        </div>
      )}
    </div>
  );
}

export function BiorhythmArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Biorhythm Calculator — Physical, Emotional & Intellectual Cycles',
    description: DESC,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/biorhythm-calculator/',
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
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BornClock Biorhythm Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };

  return (
    <>
      <SEO
        title={TITLE}
        description={DESC}
        canonicalUrl="/articles/biorhythm-calculator"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={appSchema} />

      <main data-testid="biorhythm-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Biorhythm Calculator — Your Physical, Emotional & Intellectual Cycles
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            The biorhythm theory proposes that from the moment you are born, three natural
            cycles begin to rise and fall like waves — a <strong>physical</strong> cycle of
            23 days, an <strong>emotional</strong> cycle of 28 days, and an{' '}
            <strong>intellectual</strong> cycle of 33 days. Each cycle starts at zero on the
            day you are born and then swings smoothly between a high phase and a low phase,
            repeating for the rest of your life. Because the three cycles have different
            lengths, they drift in and out of alignment, so no two days ever feel exactly
            the same.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our free biorhythm calculator works entirely from your date of birth. It counts
            the number of days you have lived and then plots each cycle as a simple sine wave.
            The value of any cycle on a given day is <em>sin(2 × π × days-lived ÷ period) × 100</em>,
            which produces a percentage somewhere between -100% and +100%. Positive readings are
            "high" days, negative readings are "low" days, and the moment a cycle passes through
            zero is known as a "critical" day.
          </p>

          <BiorhythmCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">The Three Biorhythm Cycles</h2>
          {CYCLES.map(c => (
            <section key={c.key} id={`cycle-${c.key}`} className="mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {c.name} Cycle — {c.period} Days
              </h3>
              <div className="text-xs text-gray-500 mb-3">
                Period: {c.period}-day rhythm
              </div>
              <p className="text-gray-700 leading-relaxed">{c.desc}</p>
            </section>
          ))}

          <h2 className="text-2xl font-black text-gray-900 mb-3">How to Read Your Biorhythm</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Each cycle is independent, so on any single day you can be physically high while
            emotionally low, or intellectually sharp while physically tired. Reading your
            biorhythm is about noticing these combinations rather than chasing a single "good"
            or "bad" score. A rough guide:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
            <li><strong>High (positive %):</strong> the cycle is in its stronger phase — a natural time to lean into that area.</li>
            <li><strong>Low (negative %):</strong> the cycle is in its recovery phase — a natural time to rest and go gently.</li>
            <li><strong>Critical (near 0%):</strong> the cycle is crossing the midline and is considered unstable — a day to be a little more careful.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            Many people combine the reading with their <a href="/birthday-report" className="text-indigo-600 underline font-semibold">birthday report</a>{' '}
            and astrology profile to build a fuller picture of the day ahead. The
            physical (23-day), emotional (28-day) and intellectual (33-day) rhythms make a
            handy daily journaling prompt, especially when paired with your ruling planet and
            zodiac tendencies.
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-8">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Please note:</strong> Biorhythms are a self-reflection tool, not a
              scientifically proven method of prediction. There is no scientific evidence that
              the physical, emotional and intellectual cycles forecast real events, performance
              or health. Use your results as a light prompt for self-awareness — never as
              medical advice or a guaranteed forecast.
            </p>
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

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
            <p className="text-indigo-200 mb-6">
              Your biorhythm is just one lens. BornClock also reveals your Vedic Rashi,
              Western zodiac, Nakshatra, Life Path number and more — all from your date of
              birth, alongside your astrology chart.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href="/articles/numerology-by-date-of-birth" className="text-indigo-600 underline font-semibold">
                  Numerology by Date of Birth — Find Your Life Path Number
                </a>
              </li>
              <li>
                <a href="/articles/planetary-age-calculator" className="text-indigo-600 underline font-semibold">
                  Planetary Age Calculator — Your Age on Every Planet
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default BiorhythmArticle;
