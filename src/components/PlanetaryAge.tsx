import { useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// ── NASA JPL orbital periods (mean sidereal, Earth days) ─────────────────────
// Source: NASA JPL Planetary Fact Sheet (Williams, D.R., 2024)
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/
export const ORBITAL_PERIODS_DAYS: Record<string, number> = {
  Mercury:   87.969,
  Venus:    224.701,
  Mars:     686.971,
  Jupiter: 4332.589,
  Saturn:  10759.22,
  Uranus:  30688.5,
  Neptune: 60182.0,
};

// ── Core calculation functions (spec-defined) ─────────────────────────────────
function getPlanetAge(birthDate: Date, planet: string): number {
  const now = new Date();
  const daysSinceBirth =
    (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceBirth / ORBITAL_PERIODS_DAYS[planet];
}

function getDaysToNextBirthday(birthDate: Date, planet: string): number {
  const planetAge = getPlanetAge(birthDate, planet);
  const nextBirthday = Math.ceil(planetAge);
  const daysUntil =
    (nextBirthday - planetAge) * ORBITAL_PERIODS_DAYS[planet];
  return Math.round(daysUntil);
}

function getNextBirthdayDate(birthDate: Date, planet: string): Date {
  const daysUntil = getDaysToNextBirthday(birthDate, planet);
  const result = new Date();
  result.setDate(result.getDate() + daysUntil);
  return result;
}

// ── Planet configuration ──────────────────────────────────────────────────────
interface PlanetConfig {
  name: string;
  emoji: string;
  svgColor: string;
  svgOrbitR: number;
  svgPlanetR: number;
  svgAnimDuration: string;
  periodLabel: string;
  tagline: (age: number) => string;
  fact: string;
}

const PLANETS: PlanetConfig[] = [
  {
    name: 'Mercury',
    emoji: '🔘',
    svgColor: '#9ca3af',
    svgOrbitR: 40,
    svgPlanetR: 3,
    svgAnimDuration: '3s',
    periodLabel: '87.969 Earth days',
    tagline: (a) =>
      a > 200 ? 'Practically ancient here!' : a > 100 ? 'A Mercury veteran' : 'Fast-aging on the inner lane',
    fact:
      'Mercury completes one full orbit every 87.969 Earth days — the fastest of any planet. On Mercury you age approximately 4.15 times faster than on Earth. Despite being closest to the Sun, Mercury is not the hottest planet; its near-vacuum atmosphere means daytime temperatures reach +430 °C while nights plunge to −180 °C, creating the most extreme thermal swings in the solar system.',
  },
  {
    name: 'Venus',
    emoji: '🟡',
    svgColor: '#f59e0b',
    svgOrbitR: 65,
    svgPlanetR: 5,
    svgAnimDuration: '5s',
    periodLabel: '224.701 Earth days',
    tagline: (a) =>
      a > 60 ? 'Quite the elder on Venus' : 'Still relatively youthful',
    fact:
      'Venus orbits the Sun once every 224.701 Earth days, but its rotation is so slow that a Venusian solar day (243 Earth days) is longer than its year. Venus also rotates retrograde — the Sun rises in the west and sets in the east. A runaway greenhouse effect locks surface temperatures near 465 °C, making Venus the hottest planet despite being second, not first, from the Sun.',
  },
  {
    name: 'Mars',
    emoji: '🔴',
    svgColor: '#ef4444',
    svgOrbitR: 90,
    svgPlanetR: 4,
    svgAnimDuration: '8s',
    periodLabel: '686.971 Earth days (~1.88 yrs)',
    tagline: (a) =>
      `A Martian ${a < 10 ? 'child' : a < 18 ? 'youngster' : a < 40 ? 'adult' : 'elder'}`,
    fact:
      "A Martian year lasts 686.971 Earth days — nearly two Earth years. Mars has four seasons similar to Earth's owing to its axial tilt of 25.2°. ISRO's Mars Orbiter Mission (Mangalyaan, 2014) became the first Asian spacecraft to reach Martian orbit, succeeding on its very first attempt. NASA's Perseverance rover is currently exploring Jezero Crater in search of signs of ancient microbial life.",
  },
  {
    name: 'Jupiter',
    emoji: '🟠',
    svgColor: '#fb923c',
    svgOrbitR: 118,
    svgPlanetR: 9,
    svgAnimDuration: '15s',
    periodLabel: '4,332.589 Earth days (~11.9 yrs)',
    tagline: () => 'Basically a toddler on Jupiter!',
    fact:
      'Jupiter takes 4,332.589 Earth days — nearly 12 Earth years — to orbit the Sun. Its Great Red Spot, a storm larger than Earth itself, has persisted for over 350 years. Jupiter hosts 95 confirmed moons, including Europa (believed to harbour a liquid-water ocean beneath its icy crust), Io (the most volcanically active body in the solar system), and Ganymede (the largest moon in the solar system).',
  },
  {
    name: 'Saturn',
    emoji: '🪐',
    svgColor: '#fbbf24',
    svgOrbitR: 142,
    svgPlanetR: 7,
    svgAnimDuration: '25s',
    periodLabel: '10,759.22 Earth days (~29.5 yrs)',
    tagline: () => 'Just a Saturn newborn!',
    fact:
      'Saturn completes an orbit every 10,759.22 Earth days — roughly 29.5 Earth years. Its iconic ring system extends up to 282,000 km from the planet yet is often less than 100 metres thick. Saturn is the least dense planet — light enough to float on water. Its moon Titan, larger than the planet Mercury, is the only moon with a dense nitrogen atmosphere and has liquid methane lakes on its surface.',
  },
  {
    name: 'Uranus',
    emoji: '🔵',
    svgColor: '#7dd3fc',
    svgOrbitR: 163,
    svgPlanetR: 6,
    svgAnimDuration: '40s',
    periodLabel: '30,688.5 Earth days (~84 yrs)',
    tagline: () => 'Not even born yet on Uranus!',
    fact:
      'Uranus takes 30,688.5 Earth days — approximately 84 Earth years — to orbit the Sun. Most people born today will not see Uranus complete a full orbit in their lifetime. Uranus rotates on its side with an axial tilt of 97.77°, creating extreme polar seasons of 42-year-long days followed by 42-year-long polar nights. It is an ice giant composed largely of water, methane, and ammonia ices.',
  },
  {
    name: 'Neptune',
    emoji: '💙',
    svgColor: '#6366f1',
    svgOrbitR: 185,
    svgPlanetR: 6,
    svgAnimDuration: '60s',
    periodLabel: '60,182.0 Earth days (~165 yrs)',
    tagline: () => 'A mere blink of cosmic time!',
    fact:
      'Neptune takes 60,182.0 Earth days — approximately 165 Earth years — to complete one full orbit. Discovered in 1846, it completed only its first orbit since discovery in 2011. Neptune has the strongest sustained winds of any planet, reaching 2,100 km/h. Its largest moon Triton orbits in the opposite direction to Neptune\'s rotation — strongly suggesting it was a captured Kuiper Belt object rather than an in-place formation.',
  },
];

// ── PlanetCard ────────────────────────────────────────────────────────────────
interface PlanetResult extends PlanetConfig {
  age: number;
  daysToNext: number;
  nextDate: Date;
  nextBirthdayNum: number;
}

const PlanetCard = ({ p }: { p: PlanetResult }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center space-y-1.5 hover:bg-white/[0.08] transition-colors">
    <div className="text-3xl">{p.emoji}</div>
    <div className="font-bold text-white text-sm">{p.name}</div>
    <div className="text-2xl font-bold text-purple-300 tabular-nums">
      {p.age.toFixed(2)}
    </div>
    <div className="text-[11px] text-gray-400">{p.name} years old</div>
    <div className="text-[10px] text-gray-500 leading-snug mt-1 space-y-0.5">
      <div>🎂 Birthday #{p.nextBirthdayNum}</div>
      <div>
        {p.daysToNext === 0
          ? 'is today!'
          : `in ${p.daysToNext.toLocaleString()} Earth days`}
      </div>
      {p.daysToNext > 0 && (
        <div className="text-purple-400/70">
          {format(p.nextDate, 'MMM d, yyyy')}
        </div>
      )}
    </div>
    <div className="text-[10px] text-amber-400/60 italic leading-snug">
      {p.tagline(p.age)}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
interface PlanetaryAgeProps {
  birthDate: Date;
}

export const PlanetaryAge = ({ birthDate }: PlanetaryAgeProps) => {
  const { toast } = useToast();

  // Generate 60 stars once — stable across re-renders
  const starsRef = useRef<
    Array<{ top: string; left: string; delay: string; size: string }>
  >([]);
  if (starsRef.current.length === 0) {
    starsRef.current = Array.from({ length: 60 }, () => ({
      top: `${(Math.random() * 100).toFixed(1)}%`,
      left: `${(Math.random() * 100).toFixed(1)}%`,
      delay: `${(Math.random() * 3).toFixed(1)}s`,
      size: `${(Math.random() * 2 + 1).toFixed(1)}px`,
    }));
  }

  const results = useMemo<PlanetResult[]>(() => {
    return PLANETS.map((planet) => {
      const age = getPlanetAge(birthDate, planet.name);
      const daysToNext = getDaysToNextBirthday(birthDate, planet.name);
      const nextDate = getNextBirthdayDate(birthDate, planet.name);
      const nextBirthdayNum = Math.ceil(age);
      return { ...planet, age, daysToNext, nextDate, nextBirthdayNum };
    });
  }, [birthDate]);

  const mars = results.find((p) => p.name === 'Mars')!;
  const mercury = results.find((p) => p.name === 'Mercury')!;

  const fullShareText = useMemo(() => {
    const lines = results
      .map((p) => `  • ${p.name}: ${p.age.toFixed(2)} yrs`)
      .join('\n');
    return (
      `🪐 My age on every planet (born ${format(birthDate, 'MMM d, yyyy')}):\n` +
      `${lines}\n\n` +
      `Calculate yours → https://bornclock.com/planetary-age`
    );
  }, [results, birthDate]);

  const tweetText = useMemo(
    () =>
      `🪐 I'm ${mars.age.toFixed(1)} years old on Mars and ${mercury.age.toFixed(0)} in Mercury years! What's your planetary age?`,
    [mars.age, mercury.age],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareText).then(() => {
      toast({
        title: 'Copied to clipboard!',
        description: 'Share your planetary ages with anyone.',
      });
    });
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://bornclock.com/planetary-age')}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      {/* Animation keyframes */}
      <style>{`
        @keyframes pa-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pa-twinkle {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.85; }
        }
        @media (prefers-reduced-motion: reduce) {
          .planet-orbit  { animation: none !important; }
          .star-twinkle  { animation: none !important; }
        }
      `}</style>

      {/* ── Planet cards with star field ────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#07071a] p-6 mb-6 min-h-[260px]">
        {/* Star field */}
        {starsRef.current.map((s, i) => (
          <div
            key={i}
            className="star-twinkle absolute rounded-full bg-white pointer-events-none"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animation: `pa-twinkle ${(2.5 + parseFloat(s.delay)).toFixed(1)}s ease-in-out infinite`,
              animationDelay: s.delay,
            }}
          />
        ))}

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white text-center mb-5">
            🪐 Your Age Across the Solar System
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map((p) => (
              <PlanetCard key={p.name} p={p} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Share buttons ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        <Button variant="outline" onClick={handleCopy} className="gap-2">
          <Copy className="w-4 h-4" />
          Copy Text
        </Button>

        <Button
          onClick={handleWhatsApp}
          className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.878-1.426A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
          WhatsApp
        </Button>

        <Button
          onClick={handleTwitter}
          className="gap-2 bg-black hover:bg-gray-900 text-white border-0"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.732-8.84L2.25 2.25H8.08l4.254 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter / X
        </Button>
      </div>

      {/* ── Solar system animation ──────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-center text-foreground mb-2">
          ☀️ Solar System — Orbital Animation
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-6 max-w-md mx-auto">
          Planets closer to the Sun move faster along smaller orbits. Animation
          speeds are artistic — not proportional to real orbital periods.
        </p>

        <div className="flex justify-center">
          <svg
            viewBox="0 0 400 400"
            width="360"
            height="360"
            className="rounded-2xl"
            aria-label="Animated diagram of the solar system showing seven planets orbiting the Sun"
            role="img"
          >
            <rect width="400" height="400" fill="#07071a" rx="16" />

            <g transform="translate(200,200)">
              {/* Orbit rings */}
              {PLANETS.map((p) => (
                <circle
                  key={`ring-${p.name}`}
                  cx="0"
                  cy="0"
                  r={p.svgOrbitR}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.07"
                  strokeWidth="0.5"
                />
              ))}

              {/* Sun */}
              <circle cx="0" cy="0" r="14" fill="#FDB813" />
              <circle
                cx="0"
                cy="0"
                r="20"
                fill="none"
                stroke="#FDB813"
                strokeOpacity="0.18"
                strokeWidth="5"
              />

              {/* Animated planets */}
              {PLANETS.map((p) => (
                <g
                  key={`planet-${p.name}`}
                  className="planet-orbit"
                  style={{
                    animation: `pa-orbit ${p.svgAnimDuration} linear infinite`,
                    transformOrigin: '0 0',
                  }}
                >
                  <circle
                    cx={p.svgOrbitR}
                    cy="0"
                    r={p.svgPlanetR}
                    fill={p.svgColor}
                  />
                  {/* Saturn ring */}
                  {p.name === 'Saturn' && (
                    <ellipse
                      cx={p.svgOrbitR}
                      cy="0"
                      rx={p.svgPlanetR + 5}
                      ry={p.svgPlanetR - 2}
                      fill="none"
                      stroke={p.svgColor}
                      strokeOpacity="0.55"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
      </section>

      {/* ── Educational content ─────────────────────────────────────────── */}
      <section className="space-y-10 max-w-3xl mx-auto">

        {/* How it works */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            How the Planetary Age Calculator Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your "age" on any planet is the number of full orbits that planet
            has completed around the Sun since you were born. We calculate this
            by dividing the total Earth days elapsed since your birth date by
            each planet's{' '}
            <strong>mean sidereal orbital period</strong> — the time it takes to
            complete one orbit relative to the stars — using verified constants
            from NASA JPL's Planetary Fact Sheet (Williams, D.R., 2024). All
            calculations run entirely in your browser; your date of birth never
            leaves your device.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Your next "planetary birthday" is the moment a planet completes its
            next full orbit since your birth. We find this by taking the ceiling
            of your current planetary age, then converting the fractional
            remainder back to Earth days and projecting forward from today.
            Dates are for educational enjoyment — actual planetary positions are
            not used in birthday calculations!
          </p>
        </div>

        {/* Per-planet explanations */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-5">
            Your Age on Each Planet — Explained
          </h2>
          <div className="space-y-6">
            {results.map((p) => (
              <div
                key={p.name}
                className="border-l-2 border-purple-500/30 pl-5"
              >
                <h3 className="text-lg font-semibold text-foreground mb-1.5">
                  {p.emoji}&nbsp; {p.name} — {p.periodLabel}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.fact}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ISRO section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            🇮🇳 ISRO's Planetary Missions
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            India's space agency ISRO has made remarkable strides in planetary
            exploration. The Mars Orbiter Mission (Mangalyaan), launched in
            November 2013 and achieving Mars orbit insertion in September 2014,
            made India the first Asian nation and the fourth space agency in the
            world to successfully reach Mars orbit — and the only one to do so
            on a first attempt. The spacecraft operated for over seven years,
            far exceeding its six-month design life.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            ISRO's Chandrayaan-3 mission (2023) achieved a historic soft
            landing near the Moon's south pole — a first for any nation. The
            Pragyan rover confirmed the presence of sulphur and several other
            elements in the lunar south polar soil. ISRO continues to advance
            its deep-space programme with Aditya-L1 (solar observation,
            launched 2023), the forthcoming Chandrayaan-4, and a proposed Venus
            Orbiter Mission (Shukrayaan-1).
          </p>
        </div>

        {/* Kepler section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            ⚙️ Kepler's Third Law — The Science Behind Planetary Ages
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The vast differences in planetary year lengths follow directly from
            Johannes Kepler's Third Law of Planetary Motion, published in{' '}
            <em>Harmonices Mundi</em> (1619): the <strong>square</strong> of a
            planet's orbital period is proportional to the{' '}
            <strong>cube</strong> of its semi-major axis (mean distance from the
            Sun). Written as T² ∝ a³, this means a planet twice as far from the
            Sun takes not twice, but 2^(3/2) ≈ 2.83 times as long to orbit.
            Neptune — roughly 30 times farther from the Sun than Earth — takes
            30^(3/2) ≈ 164 times longer to complete one orbit.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Newton's law of universal gravitation (
            <em>Principia Mathematica</em>, 1687) later provided the physical
            explanation: gravitational force weakens with the square of
            distance, so distant planets experience weaker pulls and move more
            slowly along larger paths — compounding both effects. All orbital
            periods in this calculator are mean sidereal values sourced from
            NASA JPL Solar System Dynamics (ssd.jpl.nasa.gov).
          </p>
        </div>

      </section>
    </>
  );
};
