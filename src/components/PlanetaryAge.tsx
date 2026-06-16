import { useRef, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { PlanetaryAgeCard } from '@/components/PlanetaryAgeCard';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── NASA JPL orbital periods (mean sidereal, Earth days) ─────────────────────
// Source: NASA JPL Planetary Fact Sheet (Williams, D.R., 2024)
export const ORBITAL_PERIODS_DAYS: Record<string, number> = {
  Mercury:   87.969,
  Venus:    224.701,
  Mars:     686.971,
  Jupiter: 4332.589,
  Saturn:  10759.22,
  Uranus:  30688.5,
  Neptune: 60182.0,
};

// ── Rich planet display data ──────────────────────────────────────────────────
interface PlanetUIData {
  name: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  gravityRatio: number;
  tempDisplay: string;
  moons: number;
  funFact: string;
  shockingFact: string;
  nasaFact: string;
}

const PLANET_UI: PlanetUIData[] = [
  {
    name: 'Mercury',
    emoji: '☿',
    gradient: 'from-gray-600 to-gray-900',
    accentColor: '#b5b5b5',
    gravityRatio: 0.38,
    tempDisplay: '430°C / -180°C',
    moons: 0,
    funFact: "A day on Mercury lasts 59 Earth days. The Sun sometimes appears to move BACKWARD in Mercury's sky due to its elliptical orbit.",
    shockingFact: 'Despite being closest to the Sun, Mercury is NOT the hottest planet — it has no atmosphere to retain heat.',
    nasaFact: "NASA's MESSENGER orbited Mercury for 4 years, mapping its entire surface.",
  },
  {
    name: 'Venus',
    emoji: '♀',
    gradient: 'from-yellow-700 to-orange-900',
    accentColor: '#e8c44d',
    gravityRatio: 0.91,
    tempDisplay: '464°C always ☠️',
    moons: 0,
    funFact: "A day on Venus (243 Earth days) is LONGER than a year on Venus (225 Earth days). The Sun rises in the WEST on Venus.",
    shockingFact: 'Venus is hotter than Mercury despite being further from the Sun — its thick CO₂ atmosphere traps heat like a runaway greenhouse.',
    nasaFact: "NASA's Magellan spacecraft mapped 98% of Venus's surface using radar through its thick cloud cover.",
  },
  {
    name: 'Mars',
    emoji: '♂',
    gradient: 'from-red-700 to-red-900',
    accentColor: '#e27b50',
    gravityRatio: 0.38,
    tempDisplay: '20°C / -73°C',
    moons: 2,
    funFact: 'The sunset on Mars is BLUE — the opposite of Earth. Martian dust scatters red light, allowing blue light to reach your eyes at sunset.',
    shockingFact: 'Mars has the largest volcano in the solar system — Olympus Mons is 3× taller than Mount Everest.',
    nasaFact: "NASA's Perseverance rover has been exploring Mars since February 2021, collecting rock samples.",
  },
  {
    name: 'Jupiter',
    emoji: '♃',
    gradient: 'from-amber-700 to-orange-900',
    accentColor: '#c88b3a',
    gravityRatio: 2.53,
    tempDisplay: '-108°C average',
    moons: 95,
    funFact: "Jupiter's Great Red Spot is a storm that has been raging for over 400 years — longer than the USA has existed.",
    shockingFact: 'You would weigh 2.53× your Earth weight on Jupiter. A 70kg person weighs 177kg there.',
    nasaFact: 'Jupiter has 95 known moons. Four large ones were discovered by Galileo in 1610.',
  },
  {
    name: 'Saturn',
    emoji: '♄',
    gradient: 'from-yellow-800 to-amber-900',
    accentColor: '#e4c76b',
    gravityRatio: 1.07,
    tempDisplay: '-139°C average',
    moons: 146,
    funFact: 'Saturn is so light it would FLOAT on water — the only planet less dense than water.',
    shockingFact: "Saturn has 146 known moons (record as of 2023). Its moon Titan has liquid methane lakes.",
    nasaFact: "NASA's Cassini spacecraft spent 13 years orbiting Saturn, discovering a global ocean on moon Enceladus.",
  },
  {
    name: 'Uranus',
    emoji: '⛢',
    gradient: 'from-cyan-700 to-teal-900',
    accentColor: '#7de8e8',
    gravityRatio: 0.89,
    tempDisplay: '-195°C coldest planet',
    moons: 28,
    funFact: "Uranus rotates on its SIDE — tilted 98° on its axis. Its north pole points almost directly at the Sun during part of its orbit.",
    shockingFact: 'Uranus is the coldest planet in the solar system — colder than Neptune, despite being closer to the Sun.',
    nasaFact: "Only one spacecraft has ever visited Uranus — NASA's Voyager 2, in 1986.",
  },
  {
    name: 'Neptune',
    emoji: '♆',
    gradient: 'from-blue-800 to-indigo-900',
    accentColor: '#4b70dd',
    gravityRatio: 1.14,
    tempDisplay: '-201°C 🥶',
    moons: 16,
    funFact: 'It can RAIN DIAMONDS on Neptune — intense pressure and heat converts carbon into diamond crystals that sink into the core.',
    shockingFact: "Neptune has never completed a full orbit since it was discovered in 1846. Its first full orbit since discovery was in 2011.",
    nasaFact: 'Wind speeds on Neptune reach 2,100 km/h — the fastest in the solar system.',
  },
];

// ── Shocking space facts for the carousel ────────────────────────────────────
interface SpaceFact {
  icon: string;
  title: string;
  body: string;
  source: string;
  gradient: string;
}

const SPACE_FACTS: SpaceFact[] = [
  {
    icon: '💎',
    title: 'It Rains Diamonds on Neptune',
    body: "The intense pressure and heat in Neptune's interior converts carbon into diamond crystals. Scientists estimate millions of tonnes of diamonds rain down toward Neptune's core every year.",
    source: 'NASA/Caltech, Science Journal, 2017',
    gradient: 'from-blue-800 to-indigo-900',
  },
  {
    icon: '🌅',
    title: 'The Sun Rises in the West on Venus',
    body: 'Venus rotates in the opposite direction to most planets. On Venus, the Sun rises in the west and sets in the east — the complete opposite of Earth.',
    source: 'NASA Planetary Fact Sheet',
    gradient: 'from-yellow-700 to-orange-900',
  },
  {
    icon: '🛁',
    title: 'Saturn Would Float in a Bathtub',
    body: 'Saturn is the least dense planet in the solar system — less dense than water. If you had a bathtub large enough, Saturn would float in it.',
    source: 'NASA Solar System Exploration',
    gradient: 'from-yellow-800 to-amber-900',
  },
  {
    icon: '🌀',
    title: "Jupiter's Storm Is Older Than the USA",
    body: "The Great Red Spot — a storm in Jupiter's atmosphere — has been raging continuously for at least 400 years. It was first observed in 1665. The USA declared independence in 1776.",
    source: 'NASA Hubble Space Telescope Observations',
    gradient: 'from-amber-700 to-orange-900',
  },
  {
    icon: '🌡️',
    title: "Mercury Has Wild Temperature Swings",
    body: 'Without an atmosphere to retain heat, Mercury swings from 430°C during the day to -180°C at night — a temperature range of 610°C. No planet has more extreme daily temperature variation.',
    source: 'NASA MESSENGER Mission Data',
    gradient: 'from-gray-600 to-gray-900',
  },
  {
    icon: '🔄',
    title: "Uranus Rolls Around the Sun",
    body: "Uranus is tilted 98° on its axis — it essentially rotates on its side. During part of its 84-year orbit, one pole points almost directly at the Sun for 42 consecutive years.",
    source: "NASA Voyager 2 Mission, 1986",
    gradient: 'from-cyan-700 to-teal-900',
  },
  {
    icon: '🌬️',
    title: "Neptune Has Solar System's Fastest Winds",
    body: "Wind speeds on Neptune reach 2,100 km/h — faster than the speed of sound on Earth. That's 8× the force of the most powerful hurricane ever recorded on Earth.",
    source: "NASA Voyager 2 Mission, 1989",
    gradient: 'from-blue-700 to-indigo-900',
  },
  {
    icon: '🌅',
    title: "Sunsets on Mars Are Blue",
    body: "On Mars, the sunset sky glows blue around the Sun — the exact opposite of Earth. Martian dust scatters red light, allowing blue light to reach your eyes at sunset.",
    source: "NASA Mars Curiosity Rover, 2015",
    gradient: 'from-red-700 to-red-900',
  },
  {
    icon: '🕐',
    title: "Neptune's Orbit: Longer Than Recorded History",
    body: "Neptune takes 164.8 Earth years to complete one orbit. When it was discovered in 1846, it had never been observed completing a full orbit. Its first full orbit since discovery was completed on July 12, 2011.",
    source: "Neptune Discovery — Le Verrier, 1846",
    gradient: 'from-blue-900 to-slate-900',
  },
  {
    icon: '📏',
    title: "The Scale Is Impossible to Comprehend",
    body: "If Earth were a marble, Jupiter would be the size of a basketball — and the distance between them would be 300 meters. The solar system is 99.86% empty space.",
    source: "NASA Solar System Size Scale",
    gradient: 'from-slate-700 to-slate-900',
  },
];

// ── Neptune historical context ────────────────────────────────────────────────
const NEPTUNE_HISTORY: [number, string][] = [
  [1856, 'the Crimean War was ending'],
  [1861, 'the American Civil War began'],
  [1870, 'the Franco-Prussian War'],
  [1880, 'Thomas Edison demonstrated the lightbulb'],
  [1900, 'the turn of the 20th century'],
  [1912, 'the Titanic sank'],
  [1914, 'World War I began'],
  [1929, 'the Great Depression began'],
  [1939, 'World War II began'],
  [1945, 'World War II ended'],
  [1953, 'the Korean War ended'],
  [1961, 'Yuri Gagarin flew to space'],
  [1969, 'the first Moon landing'],
  [1985, 'Back to the Future was released'],
  [1991, 'the Soviet Union dissolved'],
];

function getNeptuneContext(year: number): string {
  let best = NEPTUNE_HISTORY[0];
  for (const entry of NEPTUNE_HISTORY) {
    if (Math.abs(entry[0] - year) < Math.abs(best[0] - year)) best = entry;
  }
  return best[1];
}

// ── Gravity ratios for weight calc ────────────────────────────────────────────
const GRAVITY_RATIOS: Record<string, number> = {
  Mercury: 0.38,
  Venus: 0.91,
  Earth: 1.0,
  Mars: 0.38,
  Jupiter: 2.53,
  Saturn: 1.07,
  Uranus: 0.89,
  Neptune: 1.14,
};

// ── Core calculation functions ────────────────────────────────────────────────
function getPlanetAge(birthDate: Date, planet: string): number {
  const daysSinceBirth = (Date.now() - birthDate.getTime()) / 86400000;
  return daysSinceBirth / ORBITAL_PERIODS_DAYS[planet];
}

function getDaysToNextBirthday(birthDate: Date, planet: string): number {
  const age = getPlanetAge(birthDate, planet);
  return Math.round((Math.ceil(age) - age) * ORBITAL_PERIODS_DAYS[planet]);
}

function getNextBirthdayDate(birthDate: Date, planet: string): Date {
  const d = new Date();
  d.setDate(d.getDate() + getDaysToNextBirthday(birthDate, planet));
  return d;
}

// ── Planet card component ─────────────────────────────────────────────────────
interface PlanetResult {
  name: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  gravityRatio: number;
  tempDisplay: string;
  moons: number;
  funFact: string;
  shockingFact: string;
  nasaFact: string;
  age: number;
  daysToNext: number;
  nextDate: Date;
  nextBirthdayNum: number;
}

const PlanetCard = ({ p, weightKg }: { p: PlanetResult; weightKg: number | null }) => {
  const [expanded, setExpanded] = useState(false);
  const isUrgent = p.daysToNext > 0 && p.daysToNext < 30;
  const isVeryLong = p.daysToNext > 365;

  return (
    <div
      className={`bg-gradient-to-br ${p.gradient} rounded-2xl p-5 text-white cursor-pointer transition-transform hover:scale-[1.02]`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{p.emoji}</span>
        <div className="text-right">
          <span className="text-xs opacity-60 uppercase tracking-widest">{p.name}</span>
          <div className="text-xs opacity-40">{p.moons > 0 ? `${p.moons} moons` : 'no moons'}</div>
        </div>
      </div>

      <div className="text-4xl font-black mb-0.5 tabular-nums leading-none">
        {p.age < 1 ? p.age.toFixed(3) : p.age.toFixed(2)}
      </div>
      <div className="text-sm opacity-70 mb-3">{p.name} years old</div>

      <div
        className={`text-xs mb-3 font-medium ${isUrgent ? 'text-amber-400' : 'text-slate-300'}`}
      >
        {p.daysToNext === 0
          ? '🎂 Birthday today!'
          : isVeryLong
          ? `Next birthday in ${(p.daysToNext / 365.25).toFixed(1)} Earth years`
          : `Next birthday in ${p.daysToNext.toLocaleString()} days`}
        {!isVeryLong && p.daysToNext > 0 && (
          <span className="opacity-60 ml-1">({format(p.nextDate, 'MMM d, yyyy')})</span>
        )}
      </div>

      <hr className="border-white/15 mb-3" />

      <p className="text-xs text-slate-300 italic leading-relaxed mb-3">
        {expanded ? p.shockingFact : p.funFact}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
          {weightKg ? `${(weightKg * p.gravityRatio).toFixed(1)}kg here` : `${p.gravityRatio}× gravity`}
        </span>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{p.tempDisplay}</span>
      </div>

      <div className="text-[9px] text-white/30 mt-2 text-right">
        {expanded ? 'tap for fun fact' : 'tap for shocking fact'}
      </div>
    </div>
  );
};

// ── Stars (stable, seeded) ───────────────────────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  top: `${(i * 37 + 13) % 100}%`,
  left: `${(i * 61 + 7) % 100}%`,
  delay: `${(i * 0.1) % 3}s`,
  size: `${(i % 2) + 1}px`,
}));

// ── SVG planet configs (for animation) ───────────────────────────────────────
const SVG_PLANETS = [
  { name: 'Mercury', color: '#9ca3af', orbitR: 40, planetR: 3, dur: '3s' },
  { name: 'Venus',   color: '#f59e0b', orbitR: 65, planetR: 5, dur: '5s' },
  { name: 'Mars',    color: '#ef4444', orbitR: 90, planetR: 4, dur: '8s' },
  { name: 'Jupiter', color: '#fb923c', orbitR: 118, planetR: 9, dur: '15s' },
  { name: 'Saturn',  color: '#fbbf24', orbitR: 142, planetR: 7, dur: '25s' },
  { name: 'Uranus',  color: '#7dd3fc', orbitR: 163, planetR: 6, dur: '40s' },
  { name: 'Neptune', color: '#6366f1', orbitR: 185, planetR: 6, dur: '60s' },
];

// ── Main component ────────────────────────────────────────────────────────────
interface PlanetaryAgeProps {
  birthDate: Date;
}

export const PlanetaryAge = ({ birthDate }: PlanetaryAgeProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Card generation
  const [userName, setUserName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Weight calculator
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const weightKg = weight
    ? weightUnit === 'kg'
      ? parseFloat(weight)
      : parseFloat(weight) * 0.453592
    : null;

  // Facts carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const scrollIdxRef = useRef(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const cardW = 304 + 16; // min-w-72 (288px) + gap-4 (16px)
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      scrollIdxRef.current = (scrollIdxRef.current + 1) % SPACE_FACTS.length;
      el.scrollTo({ left: scrollIdxRef.current * cardW, behavior: 'smooth' });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const results = useMemo<PlanetResult[]>(() => {
    return PLANET_UI.map(planet => {
      const age = getPlanetAge(birthDate, planet.name);
      const daysToNext = getDaysToNextBirthday(birthDate, planet.name);
      const nextDate = getNextBirthdayDate(birthDate, planet.name);
      return { ...planet, age, daysToNext, nextDate, nextBirthdayNum: Math.ceil(age) };
    });
  }, [birthDate]);

  const daysSinceBirth = (Date.now() - birthDate.getTime()) / 86400000;
  const earthAgeYears = daysSinceBirth / 365.25;
  const earthAge = Math.floor(earthAgeYears);

  const mercury = results.find(p => p.name === 'Mercury')!;
  const venus = results.find(p => p.name === 'Venus')!;
  const mars = results.find(p => p.name === 'Mars')!;
  const jupiter = results.find(p => p.name === 'Jupiter')!;
  const saturn = results.find(p => p.name === 'Saturn')!;
  const uranus = results.find(p => p.name === 'Uranus')!;
  const neptune = results.find(p => p.name === 'Neptune')!;

  // Most dramatic age for hero display
  const primaryIsNeptune = neptune.age < 1;
  const primaryPlanet = primaryIsNeptune ? neptune : jupiter;
  const primaryAgeStr = primaryIsNeptune
    ? neptune.age.toFixed(3)
    : jupiter.age.toFixed(2);
  const primaryLabel = primaryIsNeptune
    ? 'years old on Neptune'
    : 'years old on Jupiter';

  // Cosmic profile stats
  const mercuryPerYear = (365.25 / ORBITAL_PERIODS_DAYS.Mercury).toFixed(1);
  const neptuneLastYear = new Date().getFullYear() - 165;
  const neptuneContext = getNeptuneContext(neptuneLastYear);
  const totalBirthdays = results.reduce((s, p) => s + Math.floor(p.age), 0) + earthAge;
  const earthPct = totalBirthdays > 0 ? Math.round((earthAge / totalBirthdays) * 100) : 0;
  const firstJupiterDate = new Date(birthDate.getTime() + ORBITAL_PERIODS_DAYS.Jupiter * 86400000);

  // Share helpers
  const planetAgesMap = useMemo(() => {
    const m: Record<string, number> = {};
    results.forEach(r => { m[r.name] = r.age; });
    return m;
  }, [results]);

  const nextBirthdaysMap = useMemo(() => {
    const m: Record<string, number> = {};
    results.forEach(r => { m[r.name] = r.daysToNext; });
    return m;
  }, [results]);

  const getMostDramaticShareText = (): string => {
    const name = userName ? `${userName}'s` : 'My';
    if (neptune.age < 1) {
      return `🪐 ${name} Cosmic Age: only ${neptune.age.toFixed(3)} years old on Neptune — but ${Math.floor(mercury.age)} birthdays on Mercury! Calculate yours: https://bornclock.com/planetary-age #CosmicAge #NASA`;
    }
    return `🪐 ${name} Cosmic Age: ${jupiter.age.toFixed(1)} yrs on Jupiter but ${Math.floor(mercury.age)} on Mercury! Calculate yours: https://bornclock.com/planetary-age #CosmicAge`;
  };

  const fullShareText = useMemo(() => {
    const lines = results.map(p => `  • ${p.name}: ${p.age.toFixed(2)} yrs`).join('\n');
    return `🪐 My age on every planet (born ${format(birthDate, 'MMM d, yyyy')}):\n${lines}\n\nCalculate yours → https://bornclock.com/planetary-age`;
  }, [results, birthDate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareText).then(() => {
      toast({ title: 'Copied!', description: 'Share your planetary ages with anyone.' });
    });
  };

  const handleGenerateCard = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 500));
    if (!cardRef.current) { setGenerating(false); return; }
    try {
      const canvas = await html2canvas(cardRef.current, {
        width: 1080, height: 1080, scale: 1, useCORS: true,
        allowTaint: false, backgroundColor: null, logging: false,
      });
      setCardDataUrl(canvas.toDataURL('image/png', 0.95));
      setCardGenerated(true);
    } catch (e) {
      console.error('Card generation failed:', e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
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
          .planet-orbit { animation: none !important; }
          .star-twinkle { animation: none !important; }
        }
      `}</style>

      {/* ── DRAMATIC HERO RESULT ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#07071a] p-8 mb-8 text-center">
        {STARS.map((s, i) => (
          <div
            key={i}
            className="star-twinkle absolute rounded-full bg-white pointer-events-none"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              animation: `pa-twinkle 3s ease-in-out infinite`,
              animationDelay: s.delay,
            }}
          />
        ))}
        <div className="relative z-10">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-3">Your Cosmic Age Profile</p>
          <div className="text-6xl font-black text-indigo-400 leading-none mb-1">{primaryAgeStr}</div>
          <p className="text-2xl text-slate-300 mb-2">{primaryLabel}</p>
          <p className="text-slate-400 text-lg mb-6">
            But you've had{' '}
            <span className="text-amber-400 font-bold">{Math.floor(mercury.age)}</span>
            {' '}birthdays on Mercury
          </p>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {primaryIsNeptune
              ? "Neptune takes 165 Earth years per orbit. No human has ever celebrated their first Neptune birthday."
              : "Jupiter takes 11.9 Earth years per orbit. Most people have only 3–6 Jupiter birthdays in a full lifetime."}
          </p>
        </div>
      </div>

      {/* ── PLANET CARDS — all 8 ─────────────────────────────────────────── */}
      <h2 className="text-xl font-bold text-foreground mb-4">🪐 Your Age Across All 8 Planets</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {/* Earth reference card */}
        <div className="bg-gradient-to-br from-blue-600 to-green-800 rounded-2xl p-5 text-white border-2 border-blue-400/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-4xl">🌍</span>
            <div className="text-right">
              <span className="text-xs opacity-60 uppercase tracking-widest">Earth</span>
              <div className="text-[10px] opacity-40 bg-blue-400/20 px-1 rounded">reference</div>
            </div>
          </div>
          <div className="text-4xl font-black mb-0.5 leading-none">{earthAge}</div>
          <div className="text-sm opacity-70 mb-3">Earth years old</div>
          <hr className="border-white/15 mb-3" />
          <p className="text-xs text-slate-300 italic leading-relaxed mb-3">
            Earth travels at 107,000 km/h around the Sun — right now, while you sit still.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-auto">
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">1.0× gravity</span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">1 moon</span>
          </div>
        </div>

        {/* All other planets */}
        {results.map(p => (
          <PlanetCard key={p.name} p={p} weightKg={weightKg} />
        ))}
      </div>

      {/* ── SHOCKING FACTS CAROUSEL ──────────────────────────────────────── */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-2">🤯 Facts That Will Break Your Brain</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Click the cards. Hover to pause auto-scroll.
        </p>
        <div
          ref={carouselRef}
          className="overflow-x-auto pb-4 flex gap-4 scrollbar-thin"
          style={{ scrollBehavior: 'smooth' }}
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
        >
          {SPACE_FACTS.map((fact, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${fact.gradient} rounded-2xl p-5 text-white flex-shrink-0`}
              style={{ minWidth: '288px', maxWidth: '288px' }}
            >
              <div className="text-3xl mb-3">{fact.icon}</div>
              <h3 className="font-black text-sm mb-2 leading-tight">{fact.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{fact.body}</p>
              <p className="text-[10px] text-white/40 italic">[{fact.source}]</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PERSONAL COSMIC PROFILE ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#07071a] border border-indigo-900/40 p-6 mb-12">
        <h2 className="text-xl font-bold text-white mb-6">🌌 Your Personal Cosmic Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mercury Birthday Streak */}
          <div className="bg-white/5 rounded-xl p-5">
            <div className="text-2xl mb-2">☿</div>
            <h3 className="font-semibold text-white mb-1">Mercury Birthday Streak</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              You've celebrated{' '}
              <span className="text-amber-400 font-bold">{Math.floor(mercury.age)}</span>
              {' '}birthdays on Mercury — one every 88 Earth days.
            </p>
            <p className="text-slate-400 text-xs mt-2">
              That's <span className="text-amber-400">{mercuryPerYear}</span> Mercury birthdays for every Earth birthday.
            </p>
          </div>

          {/* Jupiter Milestone */}
          <div className="bg-white/5 rounded-xl p-5">
            <div className="text-2xl mb-2">♃</div>
            <h3 className="font-semibold text-white mb-1">Jupiter Milestone</h3>
            {jupiter.age < 1 ? (
              <p className="text-slate-300 text-sm leading-relaxed">
                You haven't reached your first Jupiter birthday yet. You'll celebrate on{' '}
                <span className="text-orange-400 font-bold">{format(firstJupiterDate, 'MMMM d, yyyy')}</span>.
              </p>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">
                You are{' '}
                <span className="text-orange-400 font-bold">{jupiter.age.toFixed(2)}</span>
                {' '}years old on Jupiter — a number most humans never reach even in a full lifetime.
              </p>
            )}
          </div>

          {/* Neptune Status */}
          <div className="bg-white/5 rounded-xl p-5">
            <div className="text-2xl mb-2">♆</div>
            <h3 className="font-semibold text-white mb-1">Neptune Status</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              On Neptune, you are{' '}
              <span className="text-blue-400 font-bold">{neptune.age.toFixed(3)}</span>
              {' '}years old. The last time Neptune completed a full orbit, it was{' '}
              <span className="text-blue-400 font-bold">{neptuneLastYear}</span>
              {' '}— {neptuneContext}.
            </p>
          </div>

          {/* Total Birthday Count */}
          <div className="bg-white/5 rounded-xl p-5">
            <div className="text-2xl mb-2">🎂</div>
            <h3 className="font-semibold text-white mb-1">Your Cosmic Birthday Count</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Across all 8 planets, you have had approximately{' '}
              <span className="text-indigo-400 font-bold">{totalBirthdays.toLocaleString()}</span>
              {' '}birthdays. Earth accounts for only{' '}
              <span className="text-indigo-400 font-bold">{earthPct}%</span>
              {' '}of your cosmic birthday celebrations.
            </p>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE WEIGHT CALCULATOR ────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-muted/20 p-6 mb-12">
        <h2 className="text-xl font-bold text-foreground mb-1">⚖️ How Heavy Are You on Other Planets?</h2>
        <p className="text-sm text-muted-foreground mb-5">Enter your weight to see it across the solar system.</p>

        <div className="flex items-center gap-3 mb-6 max-w-xs">
          <input
            type="number"
            min={1}
            max={500}
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex rounded-xl overflow-hidden border border-border">
            <button
              onClick={() => setWeightUnit('kg')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${weightUnit === 'kg' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              kg
            </button>
            <button
              onClick={() => setWeightUnit('lbs')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${weightUnit === 'lbs' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              lbs
            </button>
          </div>
        </div>

        {weightKg && !isNaN(weightKg) && weightKg > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {Object.entries(GRAVITY_RATIOS).map(([planet, ratio]) => {
                const w = weightKg * ratio;
                const emoji = { Mercury: '☿', Venus: '♀', Earth: '🌍', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆' }[planet] ?? '🪐';
                const isExtreme = ratio > 2;
                const isLight = ratio < 0.5;
                return (
                  <div
                    key={planet}
                    className={`rounded-xl p-3 text-center ${planet === 'Earth' ? 'border-2 border-primary/50 bg-primary/5' : 'border border-border bg-background'}`}
                  >
                    <div className="text-xl mb-1">{emoji}</div>
                    <div className="text-xs text-muted-foreground mb-1">{planet}</div>
                    <div className={`text-base font-bold ${isExtreme ? 'text-red-500' : isLight ? 'text-green-600' : 'text-foreground'}`}>
                      {w.toFixed(1)} {weightUnit === 'kg' ? 'kg' : 'lbs'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fun notes */}
            {weightKg * 2.53 > 200 && (
              <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-lg mb-2">
                ⚠️ On Jupiter, you'd weigh {(weightKg * 2.53).toFixed(1)}kg — you'd need extraordinary structural support just to stand up.
              </p>
            )}
            <p className="text-sm text-green-700 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg">
              🔴 On Mars, you'd weigh only {(weightKg * 0.38).toFixed(1)}{weightUnit} — you could jump 3× higher than on Earth.
            </p>
          </>
        )}
      </div>

      {/* ── SHAREABLE CARD CTA ───────────────────────────────────────────── */}
      {!cardGenerated && !generating && (
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center">
          <div className="text-2xl mb-2">🚀</div>
          <h3 className="text-lg font-semibold mb-1">Create Your Cosmic Age Card</h3>
          <p className="text-slate-300 text-sm mb-4">
            Generate a shareable 1080×1080 card with your ages across the solar system.
          </p>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            maxLength={30}
            className="w-full max-w-xs mx-auto block px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-center focus:outline-none focus:border-indigo-400 mb-4"
          />
          <button
            onClick={handleGenerateCard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Generate My Cosmic Card ✨
          </button>
          <p className="text-slate-500 text-xs mt-3">Free · No signup required · Share anywhere</p>
        </div>
      )}

      {generating && (
        <div className="mb-10 text-center py-8 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950">
          <div className="text-4xl mb-3 animate-spin">🪐</div>
          <p className="text-white font-semibold">Mapping your cosmic profile...</p>
          <p className="text-slate-400 text-sm mt-1">Calculating ages across 4.5 billion km</p>
        </div>
      )}

      {cardGenerated && cardDataUrl && (
        <div className="mb-10">
          <div className="relative max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-6">
            <img src={cardDataUrl} alt="Your Cosmic Age Card" className="w-full rounded-2xl shadow-2xl" />
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Ready to share</div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.download = `${userName || 'my'}-cosmic-age-bornclock.png`;
                link.href = cardDataUrl;
                link.click();
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              ⬇️ Download PNG
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              💬 Share on WhatsApp
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              𝕏 Share on X
            </button>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(getMostDramaticShareText());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy Text'}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mb-6">
            📸 For Instagram: Download the PNG then share to your Story or Feed
          </p>
          {!user && (
            <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50 text-center max-w-sm mx-auto mb-4">
              <p className="font-semibold text-indigo-900 mb-1">Save your Cosmic Profile</p>
              <p className="text-sm text-indigo-700 mb-3">
                Sign in to save your planetary ages and get birthday reminders
              </p>
              <Link
                to="/auth?redirect=/planetary-age"
                className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Sign In to Save →
              </Link>
            </div>
          )}
          <div className="text-center">
            <button
              onClick={() => { setCardGenerated(false); setCardDataUrl(''); }}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Change name or regenerate
            </button>
          </div>
        </div>
      )}

      {/* Quick share buttons (before card is generated) */}
      {!cardGenerated && !generating && (
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" />
            Copy All Planets
          </Button>
          <Button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
            className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0"
          >
            📱 WhatsApp
          </Button>
          <Button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
            className="gap-2 bg-black hover:bg-gray-900 text-white border-0"
          >
            𝕏 Twitter / X
          </Button>
        </div>
      )}

      {/* Off-screen card for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', zIndex: -1 }}>
        <PlanetaryAgeCard
          ref={cardRef}
          userName={userName}
          birthDate={birthDate}
          planetAges={planetAgesMap}
          nextBirthdays={nextBirthdaysMap}
          earthAge={earthAge}
        />
      </div>

      {/* ── SOLAR SYSTEM ANIMATION ───────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-center text-foreground mb-2">
          ☀️ Solar System — Orbital Animation
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-6 max-w-md mx-auto">
          Planets closer to the Sun move faster. Animation speeds are artistic — not proportional to real periods.
        </p>
        <div className="flex justify-center">
          <svg
            viewBox="0 0 400 400" width="360" height="360" className="rounded-2xl"
            aria-label="Animated solar system diagram" role="img"
          >
            <rect width="400" height="400" fill="#07071a" rx="16" />
            <g transform="translate(200,200)">
              {SVG_PLANETS.map(p => (
                <circle key={`ring-${p.name}`} cx="0" cy="0" r={p.orbitR} fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="0.5" />
              ))}
              <circle cx="0" cy="0" r="14" fill="#FDB813" />
              <circle cx="0" cy="0" r="20" fill="none" stroke="#FDB813" strokeOpacity="0.18" strokeWidth="5" />
              {SVG_PLANETS.map(p => (
                <g key={`planet-${p.name}`} className="planet-orbit" style={{ animation: `pa-orbit ${p.dur} linear infinite`, transformOrigin: '0 0' }}>
                  <circle cx={p.orbitR} cy="0" r={p.planetR} fill={p.color} />
                  {p.name === 'Saturn' && (
                    <ellipse cx={p.orbitR} cy="0" rx={p.planetR + 5} ry={p.planetR - 2} fill="none" stroke={p.color} strokeOpacity="0.55" strokeWidth="1.5" />
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
      </section>

      {/* ── KEPLER'S THIRD LAW ───────────────────────────────────────────── */}
      <section className="space-y-6 max-w-3xl mx-auto mb-12">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            ⚙️ Kepler's Third Law — The Science Behind Planetary Ages
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The vast differences in planetary year lengths follow directly from Johannes Kepler's Third Law of
            Planetary Motion, published in <em>Harmonices Mundi</em> (1619): the <strong>square</strong> of a
            planet's orbital period is proportional to the <strong>cube</strong> of its semi-major axis.
            Written as T² ∝ a³, this means a planet twice as far from the Sun takes not twice, but 2^(3/2) ≈ 2.83
            times as long to orbit. Neptune — roughly 30× farther from the Sun than Earth — takes 30^(3/2) ≈
            164 times longer to complete one orbit.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Newton's law of universal gravitation (<em>Principia Mathematica</em>, 1687) later provided the
            physical explanation: gravitational force weakens with the square of distance, so distant planets
            experience weaker pulls and move more slowly along larger paths — compounding both effects.
            All orbital periods in this calculator are mean sidereal values sourced from NASA JPL Solar System
            Dynamics (ssd.jpl.nasa.gov).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">
            How the Calculator Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your "age" on any planet is the number of full orbits that planet has completed around the Sun since
            you were born. We calculate this by dividing the total Earth days elapsed since your birth date by
            each planet's mean sidereal orbital period from NASA JPL (Williams, D.R., 2024). All calculations
            run entirely in your browser — your date of birth never leaves your device.
          </p>
        </div>
      </section>
    </>
  );
};
