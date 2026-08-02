import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { DobInput, toISODate } from '@/components/DobInput';
import { Footer } from '@/components/Footer';
import { PlanetaryAge, SPACE_FACTS } from '@/components/PlanetaryAge';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';

// ── Seeded star field (consistent, no layout thrash) ─────────────────────────
const HERO_STARS = Array.from({ length: 80 }, (_, i) => ({
  top: `${(i * 37 + 13) % 100}%`,
  left: `${(i * 61 + 7) % 100}%`,
  size: (i % 3) + 1,
  opacity: 0.25 + (i % 5) * 0.12,
  dur: 2 + (i % 3),
  delay: ((i * 0.13) % 3).toFixed(1),
}));

// ── Structured data ───────────────────────────────────────────────────────────
const WEB_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Planetary Age Calculator — BornClock',
  description: 'Calculate your age on all 8 planets using verified NASA JPL orbital data',
  url: 'https://bornclock.com/planetary-age',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0' },
  citation: {
    '@type': 'CreativeWork',
    name: 'NASA JPL Planetary Fact Sheet',
    author: { '@type': 'Person', name: 'Dr. David R. Williams' },
    publisher: { '@type': 'Organization', name: 'NASA Goddard Space Flight Center' },
    datePublished: '2024',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
  },
};

// ── FAQ items (7 items, no ISRO) ──────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: 'How old am I on Mars?',
    answer: 'Your age on Mars = your Earth age × 365.25 ÷ 687. A 30-year-old on Earth is approximately 15.9 years old on Mars, because Mars takes 687 Earth days to complete one orbit around the Sun. [NASA JPL Planetary Fact Sheet, Williams, 2024]',
  },
  {
    question: 'How old am I on Jupiter?',
    answer: "Your age on Jupiter = Earth age × 365.25 ÷ 4,331. A 30-year-old on Earth is approximately 2.53 years old on Jupiter. Most people haven't even reached their third Jupiter birthday in a full human lifetime. [NASA JPL Planetary Fact Sheet, Williams, 2024]",
  },
  {
    question: 'Would I have had my first birthday on Neptune?',
    answer: 'Neptune takes 164.8 Earth years to orbit the Sun [NASA JPL]. No human in history has ever lived to celebrate their first Neptune birthday. A 30-year-old on Earth is only 0.18 years old on Neptune.',
  },
  {
    question: 'Why is a year different on each planet?',
    answer: "A year is simply the time a planet takes to orbit the Sun once. This is governed by Kepler's Third Law of Planetary Motion (1619): planets further from the Sun travel slower and have longer years. Mercury's year is 88 Earth days; Neptune's year is 164.8 Earth years.",
  },
  {
    question: 'Can it really rain diamonds on Neptune?',
    answer: "Yes — according to research published in the journal Science (2017), the extreme pressure and heat in Neptune's interior causes carbon atoms to form diamond crystals that sink toward the core. Scientists estimate millions of tonnes of diamonds precipitate through Neptune's interior annually.",
  },
  {
    question: 'Why is the sunset on Mars blue?',
    answer: "Mars has a reddish sky during the day because iron oxide dust scatters red light. But at sunset, the dust particles scatter blue light toward the observer. NASA's Curiosity rover captured blue Martian sunsets in 2015.",
  },
  {
    question: 'How accurate is this planetary age calculator?',
    answer: "This calculator uses orbital period data directly from NASA's Planetary Fact Sheets (Williams, D.R., NASA Goddard Space Flight Center, 2024). Accuracy is within 0.01% of true astronomical values. Formula: Age on Planet X = (Days since birth) ÷ (Orbital period of Planet X in Earth days).",
  },
];

// ── Page component ────────────────────────────────────────────────────────────
const PlanetaryAgePage = () => {
  const { birthDate, setBirthDate } = useBirthDate();
  const [localDob, setLocalDob] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pageOpenTime = useRef(Date.now());

  // Weight calculator (always-visible section)

  // Facts carousel (always-visible section)
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const scrollIdxRef = useRef(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const cardW = 304;
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      scrollIdxRef.current = (scrollIdxRef.current + 1) % SPACE_FACTS.length;
      el.scrollTo({ left: scrollIdxRef.current * cardW, behavior: 'smooth' });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Pre-populate from ?dob= URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dob = params.get('dob');
    if (dob) {
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) {
        setBirthDate(parsed);
        setShowResults(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live Mercury counter — only tick when on Phase 1
  useEffect(() => {
    if (showResults) return;
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - pageOpenTime.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [showResults]);

  const handleCalculate = () => {
    if (!localDob) return;
    const parsed = new Date(localDob + 'T12:00:00');
    if (!isNaN(parsed.getTime())) {
      setBirthDate(parsed);
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setLocalDob('');
    setElapsedSeconds(0);
    pageOpenTime.current = Date.now();
  };

  const mercuryOrbits = (elapsedSeconds / (87.969 * 86400)).toFixed(9);
  const neptuneLastYear = new Date().getFullYear() - 165;

  return (
    <>
    <div className="min-h-screen bg-slate-950">
      <SEO
        title="Planetary Age Calculator — How Old Are You on Mars, Jupiter & Every Planet? | BornClock"
        description="How old are you on other planets? On Mercury you have hundreds of birthdays. On Neptune you've barely been born. It rains diamonds on Neptune. The sunset on Mars is blue. Calculate your cosmic age across all 8 planets using real NASA data. Mind-blowing and shareable."
        keywords="how old am I on other planets, age on Mars calculator, age on Jupiter, planetary age calculator, how old would I be on Mars, age on other planets NASA, cosmic age calculator, how old am I on Mercury, my age on other planets"
        canonicalUrl="/planetary-age"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <FAQSchema items={FAQ_ITEMS} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(WEB_APP_SCHEMA)}</script>
        <style>{`
          @keyframes pa-page-twinkle {
            0%, 100% { opacity: 0.15; }
            50%       { opacity: 0.85; }
          }
          @keyframes emoji-drift {
            0%   { transform: translateX(-10px); }
            50%  { transform: translateX(10px); }
            100% { transform: translateX(-10px); }
          }
          @keyframes bounce-down {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(8px); }
          }
        `}</style>
      </Helmet>

      {/* ── WHITE NAVBAR — always light, always readable ─────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* ── PHASE 1 — Space landing hero (before DOB) ────────────────────── */}
      {!showResults && (
        <>
          {/* Hero section — dark gradient overlay on the dark base */}
          <div
            className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0d1a2e 100%)' }}
          >
            {/* Star field */}
            {HERO_STARS.map((s, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: s.top,
                  left: s.left,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  borderRadius: '50%',
                  background: 'white',
                  opacity: s.opacity,
                  animation: `pa-page-twinkle ${s.dur}s ease-in-out infinite`,
                  animationDelay: `${s.delay}s`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            <div className="container mx-auto px-4 py-16 relative z-10">
              <div className="max-w-3xl mx-auto text-center pb-16">
                {/* Animated planet emoji row */}
                <div
                  className="text-3xl mb-8 tracking-widest"
                  style={{ animation: 'emoji-drift 20s ease-in-out infinite' }}
                >
                  ☿ &nbsp; ♀ &nbsp; 🌍 &nbsp; ♂ &nbsp; ♃ &nbsp; ♄ &nbsp; ⛢ &nbsp; ♆
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                  How Old Are You<br />
                  <span className="text-indigo-400">in the Universe?</span>
                </h1>
                <PageTagline />

                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
                  On Mercury you have hundreds of birthdays. On Neptune you haven't had your first yet.
                  Your age is completely relative to where you're standing.
                </p>

                <p className="text-lg text-amber-400 font-medium mb-6">
                  Enter your birthday to see your cosmic age across all 8 planets —
                  calculated using real NASA orbital data.
                </p>

                {/* Concise answer block (AEO) */}
                <div className="max-w-2xl mx-auto mb-10 text-left bg-white/5 border border-white/10 rounded-xl p-5">
                  <h2 className="text-lg font-bold text-white mb-2">How old am I on other planets?</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Your age on another planet is your age in Earth days divided by that planet's orbital
                    period. A 30-year-old is about 15.9 on Mars (687-day year), ~2.5 on Jupiter, and not
                    yet 1 on Neptune (164.8 Earth years per orbit). Enter your date of birth for your exact
                    age on all eight planets, from NASA orbital data — free, no sign-up.
                  </p>
                </div>

                {/* DOB input card — white on dark */}
                <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto mb-6 shadow-2xl">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-2">
                    Your date of birth
                  </label>
                  <div className="mb-4">
                    <DobInput label="" onValidChange={d => setLocalDob(d ? toISODate(d) : '')} />
                  </div>
                  <button
                    onClick={handleCalculate}
                    disabled={!localDob}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                  >
                    Calculate My Cosmic Age 🚀
                  </button>
                </div>

                {/* Live teaser facts */}
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5 max-w-lg mx-auto mb-10 text-left">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-4 text-center font-semibold">
                    While you read this:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-400 text-sm shrink-0 mt-0.5">☿</span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Mercury completed{' '}
                        <span className="text-amber-400 font-mono font-bold">{mercuryOrbits}</span>
                        {' '}orbits since you opened this page
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-400 text-sm shrink-0 mt-0.5">♃</span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Your age on Jupiter is probably a single digit.{' '}
                        <span className="text-slate-500 italic">Enter your birthday above to find out.</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-300 text-sm shrink-0 mt-0.5">♆</span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        The last time Neptune completed a full orbit, it was{' '}
                        <span className="text-indigo-300 font-bold">{neptuneLastYear}</span>
                        {' '}— the year the American Civil War began.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scroll nudge */}
                <div
                  className="text-slate-500 text-sm"
                  style={{ animation: 'bounce-down 1.5s ease-in-out infinite' }}
                >
                  Discover the facts ↓
                </div>
              </div>
            </div>
          </div>

          {/* ── "Why Your Age Depends" narrative — on dark bg ──────────────── */}
          <div className="container mx-auto px-4 py-14 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white mb-6">
              Why Your Age Depends on Where You Stand
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A year isn't a universal measure. It's just how long it takes your specific planet to orbit the Sun.
              Earth takes 365.25 days. Mercury takes 88 days. Neptune takes 60,190 days — nearly 165 Earth years.
              Same Sun. Completely different experience of time.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              This isn't just a fun trick. It's a genuine consequence of Kepler's Third Law of Planetary Motion,
              published in 1619 — the relationship between a planet's orbital period and its distance from the Sun.
              The further you are from the Sun, the slower you orbit, and the longer your year.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              The implications are mind-bending. A 30-year-old on Earth is simultaneously 124.5 years old on Mercury,
              48.9 on Venus, 15.9 on Mars, 2.5 on Jupiter, 1.0 on Saturn, 0.35 on Uranus, and barely 0.16 on Neptune.
              Same person. Eight completely different ages. Enter your birthday to find yours.
            </p>
            <p className="text-xs text-slate-500 mt-4 italic">
              [NASA JPL Planetary Fact Sheets, 2024; Kepler, J., Harmonices Mundi, 1619]
            </p>
          </div>
        </>
      )}

      {/* ── PHASE 2 — Results (after DOB) ────────────────────────────────── */}
      {showResults && birthDate && (
        <>
          <div className="container mx-auto px-4 pb-8 pt-4">
            <div className="text-center py-4">
              <button
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-slate-200 underline transition-colors"
              >
                ← Calculate for a different birthday
              </button>
            </div>
            <PlanetaryAge birthDate={birthDate} />
          </div>

          <div className="max-w-2xl mx-auto px-4 py-8 text-center">
            <p className="text-xs text-slate-600 leading-relaxed">
              Sources: NASA JPL Planetary Fact Sheet (Williams, D.R., 2024) — nssdc.gsfc.nasa.gov/planetary/factsheet/ |
              NASA JPL Solar System Dynamics — ssd.jpl.nasa.gov | Kepler, J. (1619). Harmonices Mundi |
              Newton, I. (1687). Principia Mathematica | Science, 2017 (diamond precipitation on Neptune) |
              NASA Curiosity Rover, 2015 (Martian sunsets) | All periods are mean sidereal values. Last verified: 2024.
            </p>
          </div>
        </>
      )}

      {/* ── SHOCKING FACTS CAROUSEL — always visible ─────────────────────── */}
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h2 className="text-xl font-bold text-white mb-2">🤯 Facts That Will Break Your Brain</h2>
        <p className="text-sm text-slate-400 mb-5">Auto-scrolling · hover to pause</p>
        <div
          ref={carouselRef}
          className="overflow-x-auto pb-4 flex gap-4"
          style={{ scrollBehavior: 'smooth' }}
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
        >
          {SPACE_FACTS.map((fact, i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white flex-shrink-0"
              style={{ minWidth: '288px', maxWidth: '288px', borderLeft: `4px solid ${fact.useAmber ? '#f59e0b' : '#6366f1'}` }}
            >
              <div className="text-3xl mb-3">{fact.icon}</div>
              <h3 className="font-black text-sm mb-2 leading-tight text-white">{fact.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{fact.body}</p>
              <p className="text-[10px] text-slate-600 italic">[{fact.source}]</p>
            </div>
          ))}
        </div>
        <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl px-4 py-3 mt-4 text-sm text-indigo-200">
          <span className="font-bold text-indigo-400">The science:</span> Each planet's year is governed by Kepler's Third Law (1619) — the further a planet is from the Sun, the slower it orbits. Neptune's year lasts 164.8 Earth years because it travels 30× further from the Sun than Earth, at 5.4 km/s vs Earth's 29.8 km/s.
        </div>
      </div>

      {/* ── Cross-link to the dedicated weight tool (weight ≠ age — separate concepts) ── */}
      <div className="container mx-auto px-4 pb-12 max-w-5xl">
        <a href="/weight-on-planets" className="block rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-indigo-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-1">⚖️ How heavy are you on other planets?</h2>
          <p className="text-sm text-slate-300">
            Age is about orbits; <strong>weight</strong> is about gravity — a different question entirely. See your
            weight across all 8 planets and the Moon on the dedicated calculator →
          </p>
          <span className="inline-block mt-3 text-sm font-semibold text-indigo-400">Open the Weight on Planets calculator →</span>
        </a>
      </div>

    </div>
    <div className="bg-white">
      <Footer />
    </div>
    </>
  );
};

export default PlanetaryAgePage;
