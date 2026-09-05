import React from 'react';
import { SEO } from '@/components/SEO';
import { calculatePlanetaryAges, calculateDaysLived } from '@/utils/celebrityCalculations';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Descriptive context for each planet — orbital facts only, no invented claims.
const PLANET_INFO: Record<string, { orbit: string; note: string }> = {
  Mercury: { orbit: '88 Earth days', note: 'The fastest planet in the solar system races around the Sun in under three months, so your Mercury age is by far your highest number.' },
  Venus:   { orbit: '225 Earth days', note: 'Venus completes a year in about seven and a half Earth months, making your Venusian age noticeably larger than your Earth age.' },
  Mars:    { orbit: '687 Earth days', note: 'A Martian year is nearly two Earth years long, so your Mars age is roughly half of your age on Earth.' },
  Jupiter: { orbit: '11.9 Earth years', note: 'The giant planet takes almost twelve Earth years for a single orbit, so most people are only a handful of Jupiter years old.' },
  Saturn:  { orbit: '29.5 Earth years', note: 'One trip around the Sun takes Saturn nearly three decades — many people never complete even two full Saturn years in a lifetime.' },
  Uranus:  { orbit: '84 Earth years', note: 'An ice giant with an 84-year orbit; a long human life barely amounts to a single Uranian year.' },
  Neptune: { orbit: '164.8 Earth years', note: 'The most distant major planet takes over 160 Earth years to orbit the Sun, so no human has ever turned two on Neptune.' },
};

const FAQS = [
  {
    q: 'How old am I on other planets?',
    a: 'Your age on another planet is simply the number of times that planet has orbited the Sun since you were born. Because each planet takes a different amount of time to complete one orbit, your age changes on every planet. On fast-orbiting Mercury you are much older, while on slow, distant Neptune you may not even be one year old yet.',
  },
  {
    q: 'Why is my age on Mercury so high?',
    a: 'Mercury is the closest planet to the Sun and completes a full orbit in just 88 Earth days — roughly four Mercury years fit inside a single Earth year. Since your Mercury age counts how many of those short 88-day years have passed, it is always far higher than your age on Earth.',
  },
  {
    q: 'How is planetary age actually calculated?',
    a: 'First we count the total number of days you have lived since your date of birth. We then divide that number of days by the length of each planet\'s year (its orbital period in Earth days): 88 for Mercury, 225 for Venus, 687 for Mars, and so on. The result is how many times that planet has circled the Sun during your lifetime.',
  },
  {
    q: 'How old would I be on Jupiter or Saturn?',
    a: 'Because Jupiter takes about 11.9 Earth years and Saturn about 29.5 Earth years to orbit the Sun, your age on these giant planets is much smaller than your Earth age. A 30-year-old on Earth is only about two and a half Jupiter years old and roughly one Saturn year old.',
  },
  {
    q: 'Can I be less than one year old on Neptune?',
    a: 'Yes. Neptune takes almost 165 Earth years to complete a single orbit, so anyone under 165 years old is less than one Neptune year old. In fact, no human being who has ever lived has reached the age of two on Neptune, and only a rare few have reached even one Uranian year.',
  },
];

function PlanetaryAgeCalculator() {
  const [dob, setDob] = React.useState('');
  const [planets, setPlanets] = React.useState<ReturnType<typeof calculatePlanetaryAges>>([]);
  const [earthDays, setEarthDays] = React.useState<number | null>(null);
  const [earthYears, setEarthYears] = React.useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const ages = calculatePlanetaryAges({ day, month, year, isFullDate: true });
        const days = calculateDaysLived(day, month, year);
        setPlanets(ages);
        setEarthDays(days);
        setEarthYears(Math.floor(days / 365.25));
      }
    } else {
      setPlanets([]);
      setEarthDays(null);
      setEarthYears(null);
    }
  };

  return (
    <div data-testid="planetary-age-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Planetary Age Calculator — Your Age on Every Planet
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Enter your date of birth to instantly see how old you are on all seven other planets.
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
      {planets.length > 0 && earthYears !== null && (
        <div data-testid="planetary-age-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="mb-4 pb-3 border-b border-indigo-100">
            <div className="text-sm text-gray-500">On Earth you are</div>
            <div className="text-2xl font-black text-gray-900">
              {earthYears} years <span className="text-base font-semibold text-gray-500">({earthDays?.toLocaleString()} days)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {planets.map(p => (
              <div key={p.planet}
                   className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3">
                <span className="text-2xl w-8 text-center flex-shrink-0" aria-hidden="true">{p.emoji}</span>
                <div>
                  <div className="font-black text-indigo-900">{p.planet}</div>
                  <div className="text-sm text-gray-700">
                    <strong>{p.age.toLocaleString()}</strong> {p.planet} {p.age === 1 ? 'year' : 'years'} old
                  </div>
                  <div className="text-xs text-gray-400">1 orbit ≈ {p.orbit_years} Earth years</div>
                </div>
              </div>
            ))}
          </div>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block mt-4 bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            See my complete birthday report →
          </a>
        </div>
      )}
    </div>
  );
}

export function PlanetaryAgeArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Planetary Age Calculator — Your Age on Every Planet',
    description: 'Find out how old you are on Mercury, Venus, Mars, Jupiter, Saturn, Uranus and Neptune with a free planetary age calculator based on orbital periods.',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/articles/planetary-age-calculator/',
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
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Planetary Age Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };

  return (
    <>
      <SEO
        title="Planetary Age Calculator — Your Age on Every Planet | BornClock"
        description="How old are you on Mercury, Mars, Jupiter? Free planetary age calculator — your age on all 7 planets from your date of birth, based on orbital periods."
        canonicalUrl="/articles/planetary-age-calculator"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />

      <main data-testid="planetary-age-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Planetary Age Calculator — Your Age on Every Planet
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Your age is just a count of how many times the Earth has travelled around the Sun
            since the day you were born. But Earth is only one of eight planets, and every one
            of them orbits the Sun at a different speed. A "year" on Mercury lasts only 88 Earth
            days, while a single year on Neptune stretches across almost 165 Earth years. That
            means your age is completely different on every planet — and this free planetary age
            calculator shows you exactly how old you are on all seven of the others.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            The idea is beautifully simple. One "planet year" is the time that planet takes to
            complete a single orbit of the Sun, known as its orbital period. Divide the number
            of days you have lived by the length of that planet's year, and you get your age on
            that world. On the inner planets, which race around the Sun quickly, you are far
            older than you are on Earth. On the outer giants, which crawl through their vast
            orbits, you are surprisingly young.
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-3">How Planetary Age Is Calculated</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The calculation uses real orbital periods — the number of Earth days each planet
            needs to complete one lap around the Sun:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-3 space-y-1">
            <li><strong>Mercury:</strong> 88 Earth days per orbit</li>
            <li><strong>Venus:</strong> 225 Earth days per orbit</li>
            <li><strong>Earth:</strong> 365.25 Earth days per orbit (your ordinary age)</li>
            <li><strong>Mars:</strong> 687 Earth days per orbit</li>
            <li><strong>Jupiter:</strong> 4,333 Earth days (about 11.9 years)</li>
            <li><strong>Saturn:</strong> 10,759 Earth days (about 29.5 years)</li>
            <li><strong>Uranus:</strong> 30,687 Earth days (about 84 years)</li>
            <li><strong>Neptune:</strong> 60,190 Earth days (about 164.8 years)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            To find your age on any planet, we first count the total days you have lived since
            your date of birth, then divide that total by the planet's orbital period. Because
            Mercury's year is the shortest of all, your Mercury age is always the biggest number
            you will see — many times larger than your age on Earth. That single fact surprises
            almost everyone the first time they try it.
          </p>

          <PlanetaryAgeCalculator />

          <h2 className="text-2xl font-black text-gray-900 mb-4">Your Age on All Seven Planets</h2>
          {['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map(name => {
            const info = PLANET_INFO[name];
            return (
              <section key={name} id={`planet-${name.toLowerCase()}`} className="mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  Your Age on {name}
                </h3>
                <div className="text-xs text-gray-500 mb-2">
                  Orbital period: {info.orbit}
                </div>
                <p className="text-gray-700 leading-relaxed">{info.note}</p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-3">Why This Is More Than a Party Trick</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Comparing your age across planets is a genuinely useful way to feel the scale of the
            solar system. It turns abstract astronomy — orbital periods measured in millions of
            kilometres and years — into something personal you can hold onto. It is also a
            wonderful teaching tool for children: the moment a nine-year-old learns they are
            over 37 years old on Mercury but not yet one year old on Saturn, the sizes of the
            orbits suddenly become real. The numbers are exact, based on the same orbital periods
            astronomers use, applied to your own date of birth. Want the full picture from your
            birthday? <a href="/birthday-report" className="text-indigo-700 font-semibold hover:underline">Generate
            your free birthday report</a> to see your planetary ages alongside your zodiac sign,
            Life Path number and more.
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
            <li><a href="/articles/biorhythm-calculator" className="hover:underline">Biorhythm Calculator — Track Your Physical, Emotional &amp; Intellectual Cycles</a></li>
            <li><a href="/articles/chinese-zodiac-by-year" className="hover:underline">Chinese Zodiac by Year — Find Your Animal Sign</a></li>
          </ul>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Report</h2>
            <p className="text-indigo-200 mb-6">
              Your planetary ages are just the start. BornClock also reveals your zodiac sign,
              Life Path number, days lived, next birthday countdown and more — all from your
              date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Generate My Free Birthday Report →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default PlanetaryAgeArticle;
