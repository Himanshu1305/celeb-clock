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
export const ORBITAL_PERIODS_DAYS: Record<string, number> = {
  Mercury:   87.969,
  Venus:    224.701,
  Mars:     686.971,
  Jupiter: 4332.589,
  Saturn:  10759.22,
  Uranus:  30688.5,
  Neptune: 60182.0,
};

// ── Planet display data — accent color only (no gradient) ────────────────────
interface PlanetUIData {
  name: string;
  emoji: string;
  accentColor: string;
  gravityRatio: number;
  tempDisplay: string;
  moons: number;
  funFact: string;
  shockingFact: string;
}

const PLANET_UI: PlanetUIData[] = [
  {
    name: 'Mercury',
    emoji: '☿',
    accentColor: '#94a3b8',
    gravityRatio: 0.38,
    tempDisplay: '430°C / -180°C',
    moons: 0,
    funFact: "A day on Mercury lasts 59 Earth days. The Sun sometimes appears to move BACKWARD in Mercury's sky due to its elliptical orbit.",
    shockingFact: 'Despite being closest to the Sun, Mercury is NOT the hottest planet — it has no atmosphere to retain heat.',
  },
  {
    name: 'Venus',
    emoji: '♀',
    accentColor: '#fbbf24',
    gravityRatio: 0.91,
    tempDisplay: '464°C always ☠️',
    moons: 0,
    funFact: "A day on Venus (243 Earth days) is LONGER than a year on Venus (225 Earth days). The Sun rises in the WEST on Venus.",
    shockingFact: "Venus is hotter than Mercury despite being further from the Sun — its thick CO₂ atmosphere creates a runaway greenhouse.",
  },
  {
    name: 'Mars',
    emoji: '♂',
    accentColor: '#f97316',
    gravityRatio: 0.38,
    tempDisplay: '20°C / -73°C',
    moons: 2,
    funFact: 'The sunset on Mars is BLUE — the opposite of Earth. Martian dust scatters red light at sunset, leaving blue to reach your eyes.',
    shockingFact: 'Mars has the largest volcano in the solar system — Olympus Mons is 3× taller than Mount Everest.',
  },
  {
    name: 'Jupiter',
    emoji: '♃',
    accentColor: '#f59e0b',
    gravityRatio: 2.53,
    tempDisplay: '-108°C average',
    moons: 95,
    funFact: "Jupiter's Great Red Spot is a storm that has been raging for over 400 years — longer than the USA has existed.",
    shockingFact: 'You would weigh 2.53× your Earth weight on Jupiter. A 70kg person weighs 177kg there.',
  },
  {
    name: 'Saturn',
    emoji: '♄',
    accentColor: '#e4c76b',
    gravityRatio: 1.07,
    tempDisplay: '-139°C average',
    moons: 146,
    funFact: 'Saturn is so light it would FLOAT on water — the only planet less dense than water.',
    shockingFact: "Saturn has 146 known moons (record as of 2023). Its moon Titan has liquid methane lakes.",
  },
  {
    name: 'Uranus',
    emoji: '⛢',
    accentColor: '#67e8f9',
    gravityRatio: 0.89,
    tempDisplay: '-195°C coldest',
    moons: 28,
    funFact: "Uranus rotates on its SIDE — tilted 98° on its axis. One pole points almost directly at the Sun for 42 consecutive years.",
    shockingFact: 'Uranus is the coldest planet in the solar system — even colder than Neptune, despite being closer to the Sun.',
  },
  {
    name: 'Neptune',
    emoji: '♆',
    accentColor: '#818cf8',
    gravityRatio: 1.14,
    tempDisplay: '-201°C 🥶',
    moons: 16,
    funFact: 'It can RAIN DIAMONDS on Neptune — intense pressure converts carbon into diamond crystals that sink into the core.',
    shockingFact: "Neptune has never completed a full orbit since it was discovered in 1846. Its first orbit since discovery was in 2011.",
  },
];

// ── Space facts — indigo/amber accent only ───────────────────────────────────
interface SpaceFact {
  icon: string;
  title: string;
  body: string;
  source: string;
  useAmber: boolean; // true = amber accent, false = indigo accent
}

const SPACE_FACTS: SpaceFact[] = [
  {
    icon: '💎',
    title: 'It Rains Diamonds on Neptune',
    body: "The intense pressure and heat in Neptune's interior converts carbon into diamond crystals. Scientists estimate millions of tonnes of diamonds rain down toward Neptune's core every year.",
    source: 'NASA/Caltech, Science Journal, 2017',
    useAmber: false,
  },
  {
    icon: '🌅',
    title: 'The Sun Rises in the West on Venus',
    body: 'Venus rotates in the opposite direction to most planets. On Venus, the Sun rises in the west and sets in the east — the complete opposite of Earth.',
    source: 'NASA Planetary Fact Sheet',
    useAmber: true,
  },
  {
    icon: '🛁',
    title: 'Saturn Would Float in a Bathtub',
    body: 'Saturn is the least dense planet in the solar system — less dense than water. If you had a bathtub large enough, Saturn would float in it.',
    source: 'NASA Solar System Exploration',
    useAmber: true,
  },
  {
    icon: '🌀',
    title: "Jupiter's Storm Is Older Than the USA",
    body: "The Great Red Spot has been raging continuously for at least 400 years. It was first observed in 1665. The USA declared independence in 1776.",
    source: 'NASA Hubble Space Telescope',
    useAmber: false,
  },
  {
    icon: '🌡️',
    title: 'Mercury Has 610°C Temperature Swings',
    body: "Without an atmosphere, Mercury swings from 430°C during the day to -180°C at night — a 610°C range. No planet has more extreme daily temperature variation.",
    source: 'NASA MESSENGER Mission Data',
    useAmber: false,
  },
  {
    icon: '🔄',
    title: 'Uranus Rolls Around the Sun',
    body: "Uranus is tilted 98° on its axis — it essentially rotates on its side. During part of its 84-year orbit, one pole points almost directly at the Sun for 42 consecutive years.",
    source: 'NASA Voyager 2, 1986',
    useAmber: true,
  },
  {
    icon: '🌬️',
    title: "Neptune Has Solar System's Fastest Winds",
    body: "Wind speeds on Neptune reach 2,100 km/h — faster than the speed of sound on Earth. That's 8× the force of the most powerful hurricane ever recorded.",
    source: 'NASA Voyager 2, 1989',
    useAmber: false,
  },
  {
    icon: '🌅',
    title: 'Sunsets on Mars Are Blue',
    body: "On Mars, the sunset sky glows blue around the Sun — the exact opposite of Earth. Martian dust scatters red light, allowing blue light to reach your eyes.",
    source: 'NASA Curiosity Rover, 2015',
    useAmber: true,
  },
  {
    icon: '🕐',
    title: "Neptune's Orbit: Longer Than Recorded History",
    body: "Neptune takes 164.8 Earth years to complete one orbit. Its first full orbit since discovery (1846) was completed on July 12, 2011 — 165 years later.",
    source: 'Neptune Discovery — Le Verrier, 1846',
    useAmber: false,
  },
  {
    icon: '📏',
    title: 'The Scale Is Impossible to Comprehend',
    body: "If Earth were a marble, Jupiter would be the size of a basketball — 300 meters away. The solar system is 99.86% empty space.",
    source: 'NASA Solar System Size Scale',
    useAmber: true,
  },
];

// ── Neptune historical context ────────────────────────────────────────────────
const NEPTUNE_HISTORY: [number, string][] = [
  [1856, 'the Crimean War was ending'],
  [1861, 'the American Civil War began'],
  [1880, 'Thomas Edison demonstrated the lightbulb'],
  [1912, 'the Titanic sank'],
  [1914, 'World War I began'],
  [1939, 'World War II began'],
  [1945, 'World War II ended'],
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
const GRAVITY_DATA: { name: string; emoji: string; ratio: number }[] = [
  { name: 'Mercury', emoji: '☿', ratio: 0.38 },
  { name: 'Venus',   emoji: '♀', ratio: 0.91 },
  { name: 'Earth',   emoji: '🌍', ratio: 1.00 },
  { name: 'Mars',    emoji: '♂', ratio: 0.38 },
  { name: 'Jupiter', emoji: '♃', ratio: 2.53 },
  { name: 'Saturn',  emoji: '♄', ratio: 1.07 },
  { name: 'Uranus',  emoji: '⛢', ratio: 0.89 },
  { name: 'Neptune', emoji: '♆', ratio: 1.14 },
];

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

// ── Planet card ───────────────────────────────────────────────────────────────
interface PlanetResult extends PlanetUIData {
  age: number;
  daysToNext: number;
  nextDate: Date;
  nextBirthdayNum: number;
}

const PlanetCard = ({ p, weightKg }: { p: PlanetResult; weightKg: number | null }) => {
  const [showShocking, setShowShocking] = useState(false);
  const isUrgent = p.daysToNext > 0 && p.daysToNext < 30;
  const isVeryLong = p.daysToNext > 365;

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white cursor-pointer transition-all hover:border-slate-500 hover:bg-slate-750"
      style={{ borderLeft: `4px solid ${p.accentColor}` }}
      onClick={() => setShowShocking(s => !s)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{p.emoji}</span>
        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase tracking-widest">{p.name}</div>
          <div className="text-[10px] text-slate-600">{p.moons > 0 ? `${p.moons} moons` : 'no moons'}</div>
        </div>
      </div>

      <div
        className="text-4xl font-black mb-0.5 tabular-nums leading-none"
        style={{ color: p.accentColor }}
      >
        {p.age < 1 ? p.age.toFixed(3) : p.age.toFixed(2)}
      </div>
      <div className="text-sm text-slate-400 mb-3">{p.name} years old</div>

      <div className={`text-xs mb-3 font-medium ${isUrgent ? 'text-amber-400' : 'text-slate-300'}`}>
        {p.daysToNext === 0
          ? '🎂 Birthday today!'
          : isVeryLong
          ? `Next birthday in ${(p.daysToNext / 365.25).toFixed(1)} Earth years`
          : `Next birthday in ${p.daysToNext.toLocaleString()} days`}
        {!isVeryLong && p.daysToNext > 0 && (
          <span className="text-slate-600 ml-1">({format(p.nextDate, 'MMM d, yyyy')})</span>
        )}
      </div>

      <hr className="border-slate-700 mb-3" />

      <p className="text-xs text-slate-300 italic leading-relaxed mb-3 min-h-[3rem]">
        {showShocking ? p.shockingFact : p.funFact}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
          {weightKg && !isNaN(weightKg)
            ? `${(weightKg * p.gravityRatio).toFixed(1)}kg here`
            : `${p.gravityRatio}× gravity`}
        </span>
        <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
          {p.tempDisplay}
        </span>
      </div>
      <div className="text-[9px] text-slate-600 mt-2 text-right">
        {showShocking ? 'tap for fun fact' : 'tap for shocking fact'}
      </div>
    </div>
  );
};

// ── Stars (seeded, stable) ───────────────────────────────────────────────────
const RESULT_STARS = Array.from({ length: 60 }, (_, i) => ({
  top: `${(i * 37 + 13) % 100}%`,
  left: `${(i * 61 + 7) % 100}%`,
  delay: `${(i * 0.1) % 3}s`,
  size: `${(i % 2) + 1}px`,
}));

// ── SVG planet configs for animation ─────────────────────────────────────────
const SVG_PLANETS = [
  { name: 'Mercury', color: '#9ca3af', orbitR: 40,  planetR: 3, dur: '3s'  },
  { name: 'Venus',   color: '#f59e0b', orbitR: 65,  planetR: 5, dur: '5s'  },
  { name: 'Mars',    color: '#ef4444', orbitR: 90,  planetR: 4, dur: '8s'  },
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
  const [shareCopied, setShareCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const text = getMostDramaticShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Cosmic Ages — BornClock', text, url: 'https://bornclock.com/planetary-age' });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // Weight calculator
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const weightKg = weight
    ? weightUnit === 'kg'
      ? parseFloat(weight)
      : parseFloat(weight) * 0.453592
    : null;

  // Facts carousel auto-scroll
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const scrollIdxRef = useRef(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const cardW = 304; // 288px card + 16px gap
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
  const earthAge = Math.floor(daysSinceBirth / 365.25);

  const mercury  = results.find(p => p.name === 'Mercury')!;
  const jupiter  = results.find(p => p.name === 'Jupiter')!;
  const neptune  = results.find(p => p.name === 'Neptune')!;

  const primaryIsNeptune = neptune.age < 1;
  const primaryAgeStr = primaryIsNeptune ? neptune.age.toFixed(3) : jupiter.age.toFixed(2);
  const primaryLabel  = primaryIsNeptune ? 'years old on Neptune' : 'years old on Jupiter';

  const mercuryPerYear = (365.25 / ORBITAL_PERIODS_DAYS.Mercury).toFixed(1);
  const neptuneLastYear = new Date().getFullYear() - 165;
  const neptuneContext = getNeptuneContext(neptuneLastYear);
  const totalBirthdays = results.reduce((s, p) => s + Math.floor(p.age), 0) + earthAge;
  const earthPct = totalBirthdays > 0 ? Math.round((earthAge / totalBirthdays) * 100) : 0;
  const firstJupiterDate = new Date(birthDate.getTime() + ORBITAL_PERIODS_DAYS.Jupiter * 86400000);

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
      return `🪐 ${name} Cosmic Age: only ${neptune.age.toFixed(3)} yrs on Neptune — but ${Math.floor(mercury.age)} birthdays on Mercury! Calculate yours: https://bornclock.com/planetary-age #CosmicAge`;
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
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-8 mb-8 text-center">
        {RESULT_STARS.map((s, i) => (
          <div
            key={i}
            className="star-twinkle absolute rounded-full bg-white pointer-events-none"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              animation: 'pa-twinkle 3s ease-in-out infinite',
              animationDelay: s.delay,
            }}
          />
        ))}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-3">Your Cosmic Age Profile</p>
          <div className="text-6xl font-black text-indigo-400 leading-none mb-1 tabular-nums">
            {primaryAgeStr}
          </div>
          <p className="text-2xl text-slate-300 mb-2">{primaryLabel}</p>
          <p className="text-slate-400 text-lg mb-4">
            But you've had{' '}
            <span className="text-amber-400 font-bold">{Math.floor(mercury.age)}</span>
            {' '}birthdays on Mercury
          </p>
          <p className="text-slate-600 text-xs max-w-sm mx-auto">
            {primaryIsNeptune
              ? 'Neptune takes 165 Earth years per orbit. No human has ever celebrated their first Neptune birthday.'
              : 'Jupiter takes 11.9 Earth years per orbit. Most people have only 3–6 Jupiter birthdays in a lifetime.'}
          </p>
        </div>
      </div>

      {/* ── PLANET CARDS — all 8 ─────────────────────────────────────────── */}
      <h2 className="text-xl font-bold text-white mb-2">🪐 Your Age Across All 8 Planets</h2>
      <p className="text-slate-400 text-sm mb-5">Tap any card to reveal a shocking fact.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {/* Earth reference card */}
        <div
          className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white"
          style={{ borderLeft: '4px solid #4fa3e0' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-4xl">🌍</span>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-widest">Earth</div>
              <div className="text-[10px] text-indigo-400 font-medium">reference</div>
            </div>
          </div>
          <div className="text-4xl font-black mb-0.5 leading-none" style={{ color: '#4fa3e0' }}>
            {earthAge}
          </div>
          <div className="text-sm text-slate-400 mb-3">Earth years old</div>
          <hr className="border-slate-700 mb-3" />
          <p className="text-xs text-slate-300 italic leading-relaxed mb-3">
            Earth travels at 107,000 km/h around the Sun — right now, while you sit still.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">1.0× gravity</span>
            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">1 moon</span>
          </div>
        </div>

        {/* All other planets */}
        {results.map(p => (
          <PlanetCard key={p.name} p={p} weightKg={weightKg} />
        ))}
      </div>

      {/* Share button below planet cards */}
      <div className="text-center mt-6 mb-12">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg"
        >
          {shareCopied ? '✓ Link Copied!' : '🚀 Share My Cosmic Ages'}
        </button>
        <p className="text-slate-500 text-xs mt-2">Share your ages across the solar system</p>
      </div>

      {/* ── SHOCKING FACTS CAROUSEL ──────────────────────────────────────── */}
      <div className="mb-12">
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
              style={{
                minWidth: '288px',
                maxWidth: '288px',
                borderLeft: `4px solid ${fact.useAmber ? '#f59e0b' : '#6366f1'}`,
              }}
            >
              <div className="text-3xl mb-3">{fact.icon}</div>
              <h3 className="font-black text-sm mb-2 leading-tight text-white">{fact.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{fact.body}</p>
              <p className="text-[10px] text-slate-600 italic">[{fact.source}]</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PERSONAL COSMIC PROFILE ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-12">
        <h2 className="text-xl font-bold text-white mb-6">🌌 Your Personal Cosmic Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mercury Birthday Streak */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="text-2xl mb-2">☿</div>
            <h3 className="font-semibold text-white mb-1">Mercury Birthday Streak</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              You've celebrated{' '}
              <span className="text-amber-400 font-bold">{Math.floor(mercury.age)}</span>
              {' '}birthdays on Mercury — one every 88 Earth days.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              That's <span className="text-amber-400">{mercuryPerYear}</span> Mercury birthdays for every Earth birthday.
            </p>
          </div>

          {/* Jupiter Milestone */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="text-2xl mb-2">♃</div>
            <h3 className="font-semibold text-white mb-1">Jupiter Milestone</h3>
            {jupiter.age < 1 ? (
              <p className="text-slate-300 text-sm leading-relaxed">
                You haven't reached your first Jupiter birthday yet. You'll celebrate on{' '}
                <span className="text-indigo-300 font-bold">{format(firstJupiterDate, 'MMMM d, yyyy')}</span>.
              </p>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">
                You are{' '}
                <span className="text-indigo-300 font-bold">{jupiter.age.toFixed(2)}</span>
                {' '}years old on Jupiter — a number most humans never reach in a full lifetime.
              </p>
            )}
          </div>

          {/* Neptune Status */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="text-2xl mb-2">♆</div>
            <h3 className="font-semibold text-white mb-1">Neptune Status</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              On Neptune, you are{' '}
              <span className="text-indigo-400 font-bold">{neptune.age.toFixed(3)}</span>
              {' '}years old. The last time Neptune completed a full orbit, it was{' '}
              <span className="text-indigo-400 font-bold">{neptuneLastYear}</span>
              {' '}— {neptuneContext}.
            </p>
          </div>

          {/* Total Birthday Count */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="text-2xl mb-2">🎂</div>
            <h3 className="font-semibold text-white mb-1">Your Cosmic Birthday Count</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Across all 8 planets, you've had approximately{' '}
              <span className="text-amber-400 font-bold">{totalBirthdays.toLocaleString()}</span>
              {' '}birthdays total. Earth accounts for only{' '}
              <span className="text-amber-400 font-bold">{earthPct}%</span>
              {' '}of your cosmic birthday celebrations.
            </p>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE WEIGHT CALCULATOR ────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-12">
        <h2 className="text-xl font-bold text-white mb-1">⚖️ How Heavy Are You on Other Planets?</h2>
        <p className="text-sm text-slate-300 mb-3">
          Your weight changes dramatically across the solar system — because gravity depends on a planet's mass and size, not its distance from the Sun.
        </p>
        <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl px-4 py-3 mb-5 text-sm text-indigo-200">
          <span className="font-bold text-indigo-400">Fun fact:</span> On Jupiter, the most massive planet, you'd weigh 2.5× more than on Earth. On Mars, you'd weigh less than half — and could jump over a two-storey building.
        </div>

        <div className="flex items-center gap-3 mb-6 max-w-xs">
          <input
            type="number"
            min={1}
            max={500}
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
          />
          <div className="flex rounded-xl overflow-hidden border border-slate-600">
            <button
              onClick={() => setWeightUnit('kg')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${weightUnit === 'kg' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              kg
            </button>
            <button
              onClick={() => setWeightUnit('lbs')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${weightUnit === 'lbs' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              lbs
            </button>
          </div>
        </div>

        {weightKg && !isNaN(weightKg) && weightKg > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {GRAVITY_DATA.map(({ name, emoji, ratio }) => {
                const w = weightKg * ratio;
                const isRef = name === 'Earth';
                const isHigh = ratio >= 2;
                const isLow = ratio <= 0.45;
                return (
                  <div
                    key={name}
                    className={`rounded-xl p-3 text-center border ${isRef ? 'border-indigo-500/50 bg-indigo-950/30' : 'border-slate-700 bg-slate-800'}`}
                  >
                    <div className="text-xl mb-1">{emoji}</div>
                    <div className="text-xs text-slate-400 mb-1">{name}</div>
                    <div className={`text-base font-bold ${isHigh ? 'text-red-400' : isLow ? 'text-green-400' : isRef ? 'text-indigo-300' : 'text-white'}`}>
                      {w.toFixed(1)} {weightUnit}
                    </div>
                  </div>
                );
              })}
            </div>

            {weightKg * 2.53 > 200 && (
              <p className="text-sm text-amber-300 bg-amber-950/40 border border-amber-800/40 px-4 py-2 rounded-lg mb-2">
                ⚠️ On Jupiter, you'd weigh {(weightKg * 2.53).toFixed(1)}{weightUnit} — you'd need extraordinary structural support just to stand up.
              </p>
            )}
            <p className="text-sm text-green-300 bg-green-950/40 border border-green-800/40 px-4 py-2 rounded-lg">
              🔴 On Mars, you'd weigh only {(weightKg * 0.38).toFixed(1)}{weightUnit} — you could jump 3× higher than on Earth.
            </p>
          </>
        )}
      </div>

      {/* ── SHAREABLE CARD CTA ───────────────────────────────────────────── */}
      {!cardGenerated && !generating && (
        <div className="mb-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white text-center">
          <div className="text-2xl mb-2">🚀</div>
          <h3 className="text-lg font-semibold text-white mb-1">Create Your Cosmic Age Card</h3>
          <p className="text-slate-400 text-sm mb-4">
            Generate a shareable 1080×1080 card with your ages across the solar system.
          </p>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            maxLength={30}
            className="w-full max-w-xs mx-auto block px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 text-center focus:outline-none focus:border-indigo-500 mb-4"
          />
          <button
            onClick={handleGenerateCard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Generate My Cosmic Card ✨
          </button>
          <p className="text-slate-600 text-xs mt-3">Free · No signup required · Share anywhere</p>
        </div>
      )}

      {generating && (
        <div className="mb-10 text-center py-8 rounded-2xl bg-slate-900 border border-slate-800">
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
              onClick={() => { const l = document.createElement('a'); l.download = `${userName || 'my'}-cosmic-age-bornclock.png`; l.href = cardDataUrl; l.click(); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              ⬇️ Download PNG
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              𝕏 Twitter / X
            </button>
            <button
              onClick={async () => { await navigator.clipboard.writeText(getMostDramaticShareText()); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy Text'}
            </button>
          </div>
          <p className="text-center text-sm text-slate-500 mb-6">
            📸 For Instagram: Download the PNG then share to your Story or Feed
          </p>
          {!user && (
            <div className="border border-indigo-800 rounded-xl p-4 bg-indigo-950/40 text-center max-w-sm mx-auto mb-4">
              <p className="font-semibold text-white mb-1">Save your Cosmic Profile</p>
              <p className="text-sm text-slate-300 mb-3">Sign in to save your planetary ages and get birthday reminders</p>
              <Link to="/auth?redirect=/planetary-age" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                Sign In to Save →
              </Link>
            </div>
          )}
          <div className="text-center">
            <button
              onClick={() => { setCardGenerated(false); setCardDataUrl(''); }}
              className="text-sm text-slate-500 hover:text-slate-300 underline"
            >
              Change name or regenerate
            </button>
          </div>
        </div>
      )}

      {/* Quick share buttons before card is generated */}
      {!cardGenerated && !generating && (
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Button variant="outline" onClick={handleCopy} className="gap-2 border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 bg-transparent">
            <Copy className="w-4 h-4" />
            Copy All Planets
          </Button>
          <Button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
          >
            📱 WhatsApp
          </Button>
          <Button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getMostDramaticShareText())}`, '_blank', 'noopener,noreferrer')}
            className="gap-2 bg-slate-700 hover:bg-slate-600 text-white border-0"
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
        <h2 className="text-xl font-bold text-white mb-2 text-center">☀️ Solar System — Orbital Animation</h2>
        <p className="text-sm text-center text-slate-400 mb-6 max-w-md mx-auto">
          Planets closer to the Sun move faster. Animation speeds are artistic — not proportional to real periods.
        </p>
        <div className="flex justify-center">
          <svg viewBox="0 0 400 400" width="360" height="360" className="rounded-2xl" aria-label="Animated solar system" role="img">
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
          <h2 className="text-2xl font-bold text-white mb-3">
            ⚙️ Kepler's Third Law — The Science Behind Planetary Ages
          </h2>
          <p className="text-slate-300 leading-relaxed">
            The vast differences in planetary year lengths follow directly from Johannes Kepler's Third Law of
            Planetary Motion, published in <em>Harmonices Mundi</em> (1619): the <strong className="text-white">square</strong> of a
            planet's orbital period is proportional to the <strong className="text-white">cube</strong> of its semi-major axis.
            Written as T² ∝ a³, this means a planet twice as far from the Sun takes not twice, but 2^(3/2) ≈ 2.83
            times as long to orbit. Neptune — roughly 30× farther from the Sun than Earth — takes 30^(3/2) ≈
            164 times longer to complete one orbit.
          </p>
          <p className="text-slate-300 leading-relaxed mt-3">
            Newton's law of universal gravitation (<em>Principia Mathematica</em>, 1687) later provided the
            physical explanation: gravitational force weakens with the square of distance, so distant planets
            experience weaker pulls and move more slowly along larger paths — compounding both effects.
            All orbital periods use mean sidereal values from NASA JPL Solar System Dynamics (ssd.jpl.nasa.gov).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-3">How the Calculator Works</h2>
          <p className="text-slate-300 leading-relaxed">
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
