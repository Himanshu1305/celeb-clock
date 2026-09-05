import { SEO } from '@/components/SEO';
import {
  calculateLifePathNumber,
  calculateWesternZodiac,
  calculateAge,
} from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface Celeb {
  name: string;
  dob: string; // YYYY-MM-DD
  discipline: string;
  habits: string[];
  note: string;
}

// DOBs sourced from src/data/indianCelebrities.ts. Habits limited to widely
// reported, publicly documented facts — no fabrication.
const CELEBS: Celeb[] = [
  {
    name: 'Virat Kohli',
    dob: '1988-11-05',
    discipline: 'Cricket',
    habits: [
      'Adopted intermittent fasting and a largely plant-based diet',
      'Publicly gave up alcohol to protect his fitness',
      'Disciplined, year-round strength and conditioning routine',
    ],
    note:
      'Kohli is widely credited with raising the fitness bar for Indian cricket. He has spoken openly about cutting alcohol, following intermittent fasting and eating a mostly vegetarian, home-cooked diet.',
  },
  {
    name: 'MS Dhoni',
    dob: '1981-07-07',
    discipline: 'Cricket',
    habits: [
      'Stays active off the field with motorcycling and outdoor pursuits',
      'Runs a farm and does hands-on physical work in Ranchi',
      'Known for natural, functional athleticism rather than gym showmanship',
    ],
    note:
      'Dhoni is famous for his love of motorcycles and for the farm he tends near Ranchi, where he grows produce and keeps an active, outdoor lifestyle away from the cricket circuit.',
  },
  {
    name: 'Amitabh Bachchan',
    dob: '1942-10-11',
    discipline: 'Acting',
    habits: [
      'Long-time practitioner of yoga and pranayama breathing',
      'Eats a light, largely vegetarian diet with minimal meat',
      'Keeps walking and staying active well past age 80',
    ],
    note:
      'Bachchan has often credited yoga, breathing practice and a disciplined, light diet for keeping him working at a demanding pace into his eighties.',
  },
  {
    name: 'PV Sindhu',
    dob: '1995-07-05',
    discipline: 'Badminton',
    habits: [
      'Full-time professional athlete training schedule',
      'Structured strength, agility and court drills under expert coaching',
      'Strict diet and recovery discipline around competition',
    ],
    note:
      'As an Olympic medallist and World Champion, Sindhu follows the rigorous daily training, conditioning and recovery routine of an elite professional athlete.',
  },
  {
    name: 'Saina Nehwal',
    dob: '1990-03-17',
    discipline: 'Badminton',
    habits: [
      'Years of high-volume professional training',
      'Focus on speed, endurance and injury prevention',
      'Careful diet and rest built around the tournament calendar',
    ],
    note:
      'The first Indian to reach world No.1 in badminton, Nehwal built her career on relentless training, conditioning and the recovery discipline demanded of a top-tier athlete.',
  },
  {
    name: 'Milind Soman',
    dob: '1965-11-04',
    discipline: 'Acting & Endurance Sport',
    habits: [
      'Completed Ironman triathlons and ultra-distance runs',
      'Barefoot and minimalist running approach',
      'Emphasises consistency and outdoor activity over gym equipment',
    ],
    note:
      'Soman is one of India\'s best-known fitness figures, having completed an Ironman triathlon in his fifties and long-distance runs, championing simple, consistent, outdoor movement.',
  },
];

// Map Life Path number to a natural fitness style — self-reflection framing only.
const LIFEPATH_FITNESS_STYLE: Record<number, string> = {
  1: 'Thrives on solo goals and being first — great for individual challenges, PBs and self-set targets.',
  2: 'Does best with a partner or class — pairs, doubles and group accountability keep it going.',
  3: 'Needs it to be fun — dance, sport and variety beat repetitive routines.',
  4: 'Loves structure — a fixed schedule and measurable progress build lasting habits.',
  5: 'Craves variety and adventure — outdoor, travel and mixed workouts prevent boredom.',
  6: 'Motivated by care and routine — training for health, family and the long game.',
  7: 'Prefers mindful movement — yoga, solo runs and practices that quiet the mind.',
  8: 'Driven by results and metrics — measurable strength and performance goals.',
  9: 'Inspired by a bigger purpose — charity runs, causes and leading by example.',
  11: 'Guided by intuition and inspiration — practices that connect body and mind.',
  22: 'Builds systems — long-term, structured programmes with a big ambition.',
  33: 'Motivated by service — activity that also uplifts and teaches others.',
};

const FAQS = [
  {
    q: 'How does Virat Kohli stay so fit?',
    a: 'Virat Kohli follows a highly disciplined, year-round fitness routine. He has publicly said he gave up alcohol, adopted intermittent fasting and eats a mostly plant-based, home-cooked diet, combined with consistent strength and conditioning work. These are habits he has discussed openly in interviews.',
  },
  {
    q: 'Is Amitabh Bachchan really fit at over 80?',
    a: 'Amitabh Bachchan has spoken about practising yoga and pranayama breathing, keeping a light and largely vegetarian diet, and staying active with regular walking. He continues to work a demanding schedule well into his eighties, which he credits to these long-standing habits.',
  },
  {
    q: 'What is a Life Path number and how is it calculated?',
    a: 'A Life Path number is a numerology figure derived from your full date of birth. You reduce the day, month and year to single digits (keeping master numbers 11, 22 and 33), add them, and reduce again. It is used for self-reflection about your natural tendencies, including how you might prefer to stay active.',
  },
  {
    q: 'Do zodiac signs affect fitness or health?',
    a: 'There is no scientific evidence that a zodiac sign determines health or fitness. BornClock presents zodiac signs and Life Path numbers as cultural and self-reflection tools — a fun lens on personality and preferences, never a medical or performance prediction.',
  },
  {
    q: 'What can I learn from how Indian celebrities stay fit?',
    a: 'The common thread is consistency, not extremes: disciplined routines, mindful eating, staying active outdoors and prioritising recovery. You do not need a celebrity budget — regular movement, a balanced diet and good sleep are the documented fundamentals behind most of these routines.',
  },
];

export function IndianCelebritiesFitnessArticle() {
  const enriched = CELEBS.map((c) => {
    const [year, month, day] = c.dob.split('-').map(Number);
    const lifePath = calculateLifePathNumber(day, month, year);
    const zodiac = calculateWesternZodiac(day, month);
    const age = calculateAge(day, month, year);
    return { ...c, lifePath, zodiac, age };
  });

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How Indian Celebrities Stay Fit — Habits & Life Paths',
    description:
      'How Indian celebrities stay fit — Virat Kohli, Milind Soman, Amitabh Bachchan and more. Verified habits, their Life Path numbers, and lessons for you.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/how-indian-celebrities-stay-fit/',
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title="How Indian Celebrities Stay Fit — Habits & Life Paths | BornClock"
        description="How Indian celebrities stay fit — Virat Kohli, Milind Soman, Amitabh Bachchan and more. Verified habits, their Life Path numbers, and lessons for you."
        canonicalUrl="/articles/how-indian-celebrities-stay-fit"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="celebrities-fitness-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            How Indian Celebrities Stay Fit — Habits, Discipline & Their Life Paths
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            From cricket icons to actors still working past eighty, some Indian celebrities
            seem to defy age. But behind the headlines there is rarely a secret trick — just
            documented habits repeated consistently over years. Below we look at five well-known
            Indian personalities and the fitness routines they have spoken about publicly, then
            pair each with their <strong>Life Path number</strong> and <strong>zodiac sign</strong>,
            calculated directly from their real date of birth.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Everything here is limited to widely reported facts. The numerology and astrology are
            offered purely as a light, self-reflection lens — never as medical, performance or
            factual claims. Want the same breakdown for yourself? Explore the{' '}
            <a href="/celebrity" className="text-indigo-600 font-semibold underline">
              celebrity index
            </a>{' '}
            or generate your own{' '}
            <a href="/birthday-report" className="text-indigo-600 font-semibold underline">
              birthday report
            </a>.
          </p>

          {enriched.map((c) => (
            <section key={c.name} className="mb-10 border border-gray-100 rounded-2xl p-6 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <h2 className="text-2xl font-black text-gray-900">{c.name}</h2>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                  {c.discipline}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Born {c.dob} · Age {c.age} · Life Path {c.lifePath} · {c.zodiac.symbol} {c.zodiac.sign}
              </div>

              <p className="text-gray-700 leading-relaxed mb-3">{c.note}</p>

              <h3 className="text-sm font-bold text-gray-900 mb-1">Documented habits</h3>
              <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-4">
                {c.habits.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-indigo-100 p-4">
                  <div className="text-xs font-bold text-indigo-700 mb-1">Life Path {c.lifePath}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {LIFEPATH_FITNESS_STYLE[c.lifePath]}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                  <div className="text-xs font-bold text-purple-700 mb-1">
                    {c.zodiac.sign} {c.zodiac.symbol}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {c.zodiac.element} sign, ruled by {c.zodiac.ruling_planet}. {c.zodiac.traits}
                  </p>
                </div>
              </div>
            </section>
          ))}

          <h2 className="text-2xl font-black text-gray-900 mb-3">What They All Have in Common</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Line up these five routines and the differences almost disappear. None of them relies on
            a fad or a shortcut. Instead, four themes repeat across every single one:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
            <li><strong>Consistency over intensity</strong> — habits repeated for years, not weeks.</li>
            <li><strong>Mindful eating</strong> — lighter, often plant-forward, home-cooked diets.</li>
            <li><strong>Staying active outside the gym</strong> — walking, farming, motorcycling, running, yoga.</li>
            <li><strong>Recovery and rest</strong> — treating sleep and downtime as part of training.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The reassuring takeaway: none of these fundamentals requires fame or a celebrity budget.
            Regular movement, balanced meals and good sleep are the documented basics behind almost
            every routine on this page.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">The BornClock Connection: Your Life Path & Your Fitness Style</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            One reason fitness plans fail is that they fight your nature. Numerology offers a playful
            lens on this: your Life Path number, fixed at birth, hints at the kind of activity you are
            most likely to <em>stick with</em>. A Life Path 5 may quit a rigid gym plan but happily run
            trails; a Life Path 4 thrives on exactly the structure a 5 finds stifling.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Notice the pattern above — several of these stars share a Life Path 6 or 9, numbers tied to
            purpose, care and the long game, which fits routines built for decades rather than quick
            results. Curious what your own number suggests? Browse the{' '}
            <a href="/celebrity" className="text-indigo-600 font-semibold underline">
              full celebrity index
            </a>{' '}
            to compare, or run your{' '}
            <a href="/birthday-report" className="text-indigo-600 font-semibold underline">
              free birthday report
            </a>{' '}
            to see your Life Path, zodiac and more in seconds.
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
          <ul className="list-disc pl-6 text-indigo-600 mb-10 space-y-1">
            <li>
              <a href="/articles/exercise-and-longevity" className="font-semibold underline">
                Exercise and Longevity — How Movement Adds Years
              </a>
            </li>
            <li>
              <a href="/articles/how-to-live-to-100" className="font-semibold underline">
                How to Live to 100 — Habits of the World's Longest-Lived People
              </a>
            </li>
          </ul>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Compare Yourself to Your Favourite Stars</h2>
            <p className="text-indigo-200 mb-6">
              See the Life Path number, zodiac sign and birth details of hundreds of Indian celebrities —
              and find out who shares yours.
            </p>
            <a href="/celebrity"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3 rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Explore the Celebrity Index →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default IndianCelebritiesFitnessArticle;
