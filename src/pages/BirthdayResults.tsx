import { useState, useEffect, useRef } from 'react';
import { getGenerationBasic } from '@/services/GenerationService';
import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBirthDate } from '@/context/BirthDateContext';
import { useAuth } from '@/hooks/useAuth';
import {
  getRankedBirthdayCelebrities,
  CelebrityBirthdayResult,
} from '@/services/BirthdaySearchService';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import {
  Calendar, Clock, Users, Star, Share2, Download,
  Sparkles, Twitter, Facebook, Link as LinkIcon,
  Globe
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import html2canvas from 'html2canvas';
import { getChineseZodiac } from '@/services/ChineseZodiacService';
import { getVedicRashi } from '@/services/VedicZodiacService';
import { RASHI_NAME_TO_SLUG } from '@/services/VedicZodiacExtended';

const CURRENT_YEAR = new Date().getFullYear();
const MONTH_SLUGS = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];


function mapSupabase(r: CelebrityBirthdayResult): DisplayCelebrity {
  const birthYear = r.birthDate ? parseInt(r.birthDate.substring(0, 4)) : null;
  const deathYear = r.deathDate ? parseInt(r.deathDate.substring(0, 4)) : null;
  const age = r.isLiving
    ? (birthYear ? CURRENT_YEAR - birthYear : null)
    : (birthYear && deathYear ? deathYear - birthYear : null);
  return {
    name: r.name,
    birthYear,
    deathYear,
    age,
    isLiving: r.isLiving,
    occupation: r.occupation || 'Celebrity',
    knownFor: r.knownFor ?? null,
    imageUrl: null,
    wikipediaUrl: r.wikipediaUrl,
    sitelinks: r.sitelinks,
  };
}

const calculateAge = (birthDate: Date) => {
  const now = new Date();
  const diff = now.getTime() - birthDate.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365.25);
  const months = Math.floor((days % 365.25) / 30.44);
  const remainingDays = Math.floor((days % 365.25) % 30.44);
  return {
    years, months, days: remainingDays, totalDays: days,
    hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60,
    totalSeconds: seconds, totalMinutes: minutes, totalHours: hours,
  };
};

const getGeneration = (year: number) => getGenerationBasic(year) ?? { name: 'Silent Generation', emoji: '📻', range: '1928–1945' };

const getZodiacSign = (month: number, day: number) => {
  const signs = [
    { sign: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', symbol: '♋', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', symbol: '♎', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', symbol: '♏', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21] },
  ];
  for (const z of signs) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
  }
  return signs[0];
};

const calculateLifePath = (date: Date) => {
  const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  let sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
};

const getBirthstone = (month: number) => {
  const birthstones = [
    { name: 'Garnet', emoji: '🔴', color: 'text-red-500' },
    { name: 'Amethyst', emoji: '💜', color: 'text-purple-500' },
    { name: 'Aquamarine', emoji: '💎', color: 'text-cyan-500' },
    { name: 'Diamond', emoji: '💍', color: 'text-gray-100' },
    { name: 'Emerald', emoji: '💚', color: 'text-emerald-500' },
    { name: 'Pearl', emoji: '🤍', color: 'text-gray-200' },
    { name: 'Ruby', emoji: '❤️', color: 'text-red-600' },
    { name: 'Peridot', emoji: '💚', color: 'text-lime-500' },
    { name: 'Sapphire', emoji: '💙', color: 'text-blue-600' },
    { name: 'Opal', emoji: '🌈', color: 'text-pink-400' },
    { name: 'Topaz', emoji: '🧡', color: 'text-amber-500' },
    { name: 'Turquoise', emoji: '💠', color: 'text-teal-500' },
  ];
  return birthstones[month - 1] || birthstones[0];
};

const calculatePlanetaryAges = (earthYears: number) => [
  { name: 'Mercury', years: (earthYears / 0.24).toFixed(1), emoji: '🪨', color: 'text-gray-500' },
  { name: 'Venus', years: (earthYears / 0.62).toFixed(1), emoji: '🟡', color: 'text-yellow-500' },
  { name: 'Earth', years: earthYears.toFixed(1), emoji: '🌍', color: 'text-blue-500' },
  { name: 'Mars', years: (earthYears / 1.88).toFixed(1), emoji: '🔴', color: 'text-red-500' },
  { name: 'Jupiter', years: (earthYears / 11.86).toFixed(1), emoji: '🟠', color: 'text-orange-500' },
  { name: 'Saturn', years: (earthYears / 29.46).toFixed(1), emoji: '🪐', color: 'text-amber-600' },
];

const WESTERN_SIGN_INFO: Record<string, { element: string; planet: string; dateRange: string }> = {
  Aries:       { element: 'Fire',  planet: 'Mars',    dateRange: 'Mar 21 – Apr 19' },
  Taurus:      { element: 'Earth', planet: 'Venus',   dateRange: 'Apr 20 – May 20' },
  Gemini:      { element: 'Air',   planet: 'Mercury', dateRange: 'May 21 – Jun 20' },
  Cancer:      { element: 'Water', planet: 'Moon',    dateRange: 'Jun 21 – Jul 22' },
  Leo:         { element: 'Fire',  planet: 'Sun',     dateRange: 'Jul 23 – Aug 22' },
  Virgo:       { element: 'Earth', planet: 'Mercury', dateRange: 'Aug 23 – Sep 22' },
  Libra:       { element: 'Air',   planet: 'Venus',   dateRange: 'Sep 23 – Oct 22' },
  Scorpio:     { element: 'Water', planet: 'Pluto',   dateRange: 'Oct 23 – Nov 21' },
  Sagittarius: { element: 'Fire',  planet: 'Jupiter', dateRange: 'Nov 22 – Dec 21' },
  Capricorn:   { element: 'Earth', planet: 'Saturn',  dateRange: 'Dec 22 – Jan 19' },
  Aquarius:    { element: 'Air',   planet: 'Uranus',  dateRange: 'Jan 20 – Feb 18' },
  Pisces:      { element: 'Water', planet: 'Neptune', dateRange: 'Feb 19 – Mar 20' },
};

const BirthdayResults = () => {
  const { birthDate } = useBirthDate();
  const { profile } = useAuth();
  const [age, setAge] = useState<ReturnType<typeof calculateAge> | null>(null);
  const [celebrities, setCelebrities] = useState<DisplayCelebrity[]>([]);
  const [loadingCelebs, setLoadingCelebs] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!birthDate) return;
    const updateAge = () => setAge(calculateAge(birthDate));
    updateAge();
    const interval = setInterval(updateAge, 1000);
    return () => clearInterval(interval);
  }, [birthDate]);

  useEffect(() => {
    if (!birthDate) return;
    const fetchCelebrities = async () => {
      setLoadingCelebs(true);
      try {
        const month = String(birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(birthDate.getDate()).padStart(2, '0');
        const monthDay = `${month}-${day}`;
        const userCountry = profile?.country ?? null;
        const supabaseResults = await getRankedBirthdayCelebrities(monthDay, userCountry, 6);
        setCelebrities(supabaseResults.map(mapSupabase));
      } catch (err) {
        console.error('Failed to fetch celebrities:', err);
      } finally {
        setLoadingCelebs(false);
      }
    };
    fetchCelebrities();
  }, [birthDate, profile?.country]);

  if (!birthDate) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <Card className="glass-card max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <Calendar className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">No Birthday Selected</h1>
            <p className="text-muted-foreground">Enter your birthday to see your personalized results.</p>
            <Button asChild><Link to="/">Go to Homepage</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generation = getGeneration(birthDate.getFullYear());
  const zodiac = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
  const lifePath = calculateLifePath(birthDate);
  const birthstone = getBirthstone(birthDate.getMonth() + 1);
  const planetaryAges = calculatePlanetaryAges(age?.years || 0);
  const chineseZodiac = getChineseZodiac(birthDate);
  const vedicRashi = getVedicRashi(birthDate);
  const monthDayLabel = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const birthdaySlug = `${MONTH_SLUGS[birthDate.getMonth() + 1]}-${birthDate.getDate()}`;

  const topCelebName = celebrities[0]?.name || 'famous people';
  const shareUrl = window.location.origin;

  const handleShare = async (platform: string) => {
    const text = `I just discovered I share my birthday with ${topCelebName}! Find your celebrity birthday twin at ${shareUrl} #BirthdayTwin #BornClock`;
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const downloadCard = async () => {
    if (!shareCardRef.current) return;
    try {
      const canvas = await html2canvas(shareCardRef.current, { scale: 2, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `birthday-${birthDate.toLocaleDateString().replace(/\//g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={`Your Birthday Decoded - ${age?.years} Years Old`}
        description={`Discover your exact age, celebrity birthday twins, zodiac sign, and more personalized birthday insights.`}
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Results Hero */}
        <section className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-600 mb-6">
            <Sparkles className="w-4 h-4" />
            Birthday Decoded Successfully!
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Born on {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h1>
          <p className="text-muted-foreground">Here's everything we discovered about your birthday</p>
        </section>

        {/* Live Age Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <Card className="glass-card card-party-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-1" />
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Your Exact Age (Live)</h2>
                <Badge variant="secondary" className="animate-pulse">LIVE</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { value: age?.years || 0, label: 'Years', color: 'text-primary' },
                  { value: age?.months || 0, label: 'Months', color: 'text-accent' },
                  { value: age?.days || 0, label: 'Days', color: 'text-secondary' },
                  { value: age?.hours || 0, label: 'Hours', color: 'text-primary' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-background/50 rounded-xl">
                    <div className={`text-4xl md:text-5xl font-bold tabular-nums ${item.color}`}>{item.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-xl mb-6">
                <div className="text-sm text-muted-foreground mb-1">Total Seconds Alive</div>
                <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                  {age?.totalSeconds.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">updating every second...</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Total Days', value: age?.totalDays.toLocaleString() || '0' },
                  { label: 'Total Hours', value: age?.totalHours.toLocaleString() || '0' },
                  { label: 'Total Minutes', value: age?.totalMinutes.toLocaleString() || '0' },
                  { label: 'Heartbeats', value: ((age?.totalMinutes || 0) * 72).toLocaleString() },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 bg-muted/30 rounded-lg">
                    <div className="font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Celebrity Matches — 3×2 grid, capped at 6 */}
        <section className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card card-party-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Your Celebrity Birthday Twins</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">6 Celebrity Matches</Badge>
                  <Link to={`/birthday/${birthdaySlug}`} className="text-xs text-primary hover:underline hidden sm:inline">
                    See all celebrities born on {monthDayLabel} →
                  </Link>
                </div>
              </div>

              {loadingCelebs ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Finding your celebrity twins...</p>
                </div>
              ) : celebrities.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {celebrities.map((celeb, index) => (
                    <CelebrityCard key={celeb.name} celebrity={celeb} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No celebrity matches found for this date.</p>
                </div>
              )}

            </CardContent>
          </Card>
        </section>

        {/* Planetary Ages Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Your Age Across the Solar System</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {planetaryAges.map((planet, index) => (
                  <div
                    key={planet.name}
                    className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
                      planet.name === 'Earth' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-muted/30'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-3xl block mb-2">{planet.emoji}</span>
                    <div className={`text-2xl font-bold ${planet.color}`}>{planet.years}</div>
                    <div className="text-sm text-muted-foreground">{planet.name} years</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Birthday Signs — 3-card grid */}
        <section className="max-w-5xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Birthday Signs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block">👥</span>
                <h3 className="font-bold text-foreground text-sm">{generation.name}</h3>
                <p className="text-xs text-muted-foreground">Generation</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{generation.range}</p>
                <Link to={`/generation?name=${encodeURIComponent(generation.name)}`}
                  className="mt-2 text-xs text-blue-500 hover:underline inline-flex items-center justify-center gap-0.5">
                  Explore Generation →
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block font-bold text-primary">{lifePath}</span>
                <h3 className="font-bold text-foreground text-sm">Life Path {lifePath}</h3>
                <p className="text-xs text-muted-foreground">Numerology</p>
                <Link to={`/numerology?path=${lifePath}`}
                  className="mt-2 text-xs text-blue-500 hover:underline inline-flex items-center justify-center gap-0.5">
                  Explore Numerology →
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block">{birthstone.emoji}</span>
                <h3 className="font-bold text-foreground text-sm">{birthstone.name}</h3>
                <p className="text-xs text-muted-foreground">Birthstone</p>
                <Link to={`/birthstone?stone=${encodeURIComponent(birthstone.name)}`}
                  className="mt-2 text-xs text-blue-500 hover:underline inline-flex items-center justify-center gap-0.5">
                  Explore your Birthstone →
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Your Complete Zodiac Profile — 3-column unified section */}
        <section className="max-w-5xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-foreground mb-2">Your Complete Zodiac Profile</h2>
          <p className="text-sm text-muted-foreground mb-4">Three different astrological traditions. One birth date. Your cosmic fingerprint.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Western Zodiac */}
            <Card className="glass-card border-blue-200/60 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 hover:scale-[1.02] transition-transform">
              <CardContent className="p-5">
                <div className="text-center mb-3">
                  <span className="text-4xl block mb-1">{zodiac.symbol}</span>
                  <h3 className="font-bold text-foreground text-base">{zodiac.sign}</h3>
                  <p className="text-xs text-blue-600 font-medium">Western Zodiac (Tropical)</p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Element</span>
                    <span className="font-medium text-foreground">{WESTERN_SIGN_INFO[zodiac.sign]?.element ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ruling Planet</span>
                    <span className="font-medium text-foreground">{WESTERN_SIGN_INFO[zodiac.sign]?.planet ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dates</span>
                    <span className="font-medium text-foreground">{WESTERN_SIGN_INFO[zodiac.sign]?.dateRange ?? '—'}</span>
                  </div>
                </div>
                <Link to={`/zodiac/${zodiac.sign.toLowerCase()}`}
                  className="mt-3 text-xs text-blue-600 hover:underline flex items-center justify-center gap-0.5 font-medium">
                  Full {zodiac.sign} Guide →
                </Link>
              </CardContent>
            </Card>

            {/* Chinese Zodiac */}
            <Card className="glass-card border-red-200/60 bg-gradient-to-br from-red-50/30 to-orange-50/30 hover:scale-[1.02] transition-transform">
              <CardContent className="p-5">
                <div className="text-center mb-3">
                  <span className="text-4xl block mb-1">{chineseZodiac.emoji}</span>
                  <h3 className="font-bold text-foreground text-base">Year of the {chineseZodiac.animal}</h3>
                  <p className="text-xs text-red-600 font-medium">Chinese Zodiac (Lunar)</p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground mb-2">
                  <div className="flex justify-between">
                    <span>Chinese Year</span>
                    <span className="font-medium text-foreground">{chineseZodiac.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Element</span>
                    <span className="font-medium text-foreground">{chineseZodiac.element} · {chineseZodiac.yin_yang}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {chineseZodiac.traits.slice(0, 3).map((t: string) => (
                    <span key={t} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">{t}</span>
                  ))}
                </div>
                <Link to={`/chinese-zodiac/${chineseZodiac.animal.toLowerCase()}`}
                  className="mt-1 text-xs text-red-600 hover:underline flex items-center justify-center gap-0.5 font-medium">
                  Full {chineseZodiac.animal} Guide →
                </Link>
              </CardContent>
            </Card>

            {/* Indian (Vedic) Zodiac */}
            <Card className="glass-card border-orange-200/60 bg-gradient-to-br from-orange-50/30 to-amber-50/30 hover:scale-[1.02] transition-transform">
              <CardContent className="p-5">
                <div className="text-center mb-3">
                  <span className="text-4xl block mb-1">{vedicRashi.emoji}</span>
                  <h3 className="font-bold text-foreground text-base">{vedicRashi.name} Rashi</h3>
                  <p className="text-xs text-orange-600 font-medium">Indian Zodiac (Vedic/Jyotish)</p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Western equivalent</span>
                    <span className="font-medium text-foreground">{vedicRashi.english}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ruling Planet</span>
                    <span className="font-medium text-foreground">{vedicRashi.ruling_planet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Element</span>
                    <span className="font-medium text-foreground">{vedicRashi.element}</span>
                  </div>
                </div>
                <Link to={`/vedic-zodiac/${RASHI_NAME_TO_SLUG[vedicRashi.name] ?? vedicRashi.name.toLowerCase()}`}
                  className="mt-3 text-xs text-orange-600 hover:underline flex items-center justify-center gap-0.5 font-medium">
                  Full {vedicRashi.name} Rashi Guide →
                </Link>
              </CardContent>
            </Card>
          </div>
          {zodiac.sign === vedicRashi.english ? (
            <p className="text-xs text-center text-green-600 mt-3 font-medium">
              ✅ Your Western and Vedic signs are the same — {zodiac.sign}. You were born in the sweet spot of the zodiac calendar.
            </p>
          ) : (
            <p className="text-xs text-center text-muted-foreground mt-3">
              🔄 Your Western sign ({zodiac.sign}) and Vedic rashi ({vedicRashi.name}/{vedicRashi.english}) differ due to the ~24° ayanamsa precession offset in Jyotish.
            </p>
          )}
        </section>

        {/* Discover More — 3 feature cards */}
        <section className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">✨ Discover More About Your Birthday</h2>
            <p className="text-muted-foreground mt-1">Your birth date holds more secrets than you think</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 — Life Expectancy */}
            <Card className="glass-card border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:scale-105 transition-all duration-300 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <span className="text-4xl mb-3 block">🔬</span>
                <h3 className="text-lg font-bold text-foreground mb-2">How Long Will You Live?</h3>
                <p className="text-sm text-muted-foreground mb-2 flex-1">
                  Science predicts your lifespan from 25+ factors — genetics, lifestyle, and more
                </p>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  Most people discover they differ from the national average by ±8 years
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/life-expectancy">Calculate My Longevity →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 2 — Planetary Ages */}
            <Card className="glass-card border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:scale-105 transition-all duration-300 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <span className="text-4xl mb-3 block">🪐</span>
                <h3 className="text-lg font-bold text-foreground mb-2">Your Age Across the Universe</h3>
                <p className="text-sm text-muted-foreground mb-2 flex-1">
                  You're only {((age?.years || 0) / 11.86).toFixed(1)} Jupiter years old — discover your cosmic age on every planet
                </p>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-4">
                  On Mercury you'd be celebrating your {Math.round((age?.years || 0) / 0.24)}th birthday
                </p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Link to="/planetary-age">Explore Cosmic Ages →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 3 — Celebrity Birthday Search */}
            <Card className="glass-card border-amber-200/50 dark:border-amber-900/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10 hover:scale-105 transition-all duration-300 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <span className="text-4xl mb-3 block">⭐</span>
                <h3 className="text-lg font-bold text-foreground mb-2">Explore All Birthday Celebrities</h3>
                <p className="text-sm text-muted-foreground mb-2 flex-1">
                  Browse 25,000+ ranked celebrities born on any date in history
                </p>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
                  Celebrities ranked by global fame — see who tops your birthday list
                </p>
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  <Link to="/todays-birthdays">Browse All Birthdays →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Share Your Birthday Discovery — last section */}
        <section className="max-w-4xl mx-auto mb-12">
          <Card className="glass-card card-party-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Share Your Birthday Discovery 🎂</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowShareCard(!showShareCard)}>
                  {showShareCard ? 'Hide Card' : 'Preview Card'}
                </Button>
              </div>

              {showShareCard && (
                <div className="mb-6 flex justify-center">
                  <div
                    ref={shareCardRef}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white w-full max-w-sm shadow-2xl"
                  >
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">🎂</span>
                        <span className="text-sm font-medium tracking-widest opacity-80">BIRTHDAY DECODED</span>
                      </div>
                      <div className="text-lg opacity-80">
                        {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {age?.years} Years
                        </div>
                        <div className="text-lg opacity-70 mt-1">{age?.totalDays.toLocaleString()} Days Old</div>
                      </div>
                      <div className="h-px bg-white/20" />
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-2xl">{zodiac.symbol}</div>
                          <div className="text-xs opacity-70">{zodiac.sign}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">{generation.emoji}</div>
                          <div className="text-xs opacity-70">{generation.name}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-violet-400">{lifePath}</div>
                          <div className="text-xs opacity-70">Life Path</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl">{birthstone.emoji}</div>
                          <div className="text-xs opacity-70">{birthstone.name}</div>
                        </div>
                      </div>
                      <div className="h-px bg-white/20" />
                      <div>
                        <div className="text-xs opacity-60 mb-2">AGE ON OTHER PLANETS</div>
                        <div className="flex justify-center gap-4">
                          <div className="text-center">
                            <span className="text-lg">🌍</span>
                            <div className="text-sm font-bold">{age?.years}</div>
                            <div className="text-xs opacity-60">Earth</div>
                          </div>
                          <div className="text-center">
                            <span className="text-lg">🔴</span>
                            <div className="text-sm font-bold">{planetaryAges[3].years}</div>
                            <div className="text-xs opacity-60">Mars</div>
                          </div>
                          <div className="text-center">
                            <span className="text-lg">🟠</span>
                            <div className="text-sm font-bold">{planetaryAges[4].years}</div>
                            <div className="text-xs opacity-60">Jupiter</div>
                          </div>
                        </div>
                      </div>
                      {celebrities.length > 0 && (
                        <>
                          <div className="h-px bg-white/20" />
                          <div>
                            <div className="text-xs opacity-60 mb-1">CELEBRITY BIRTHDAY TWIN</div>
                            <div className="text-lg font-semibold">{celebrities[0]?.name}</div>
                          </div>
                        </>
                      )}
                      <div className="text-xs opacity-40 pt-2">bornclock.com</div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center mb-4">
                Pre-written: "I just discovered I share my birthday with {topCelebName}! Find your celebrity birthday twin at {shareUrl} #BirthdayTwin #BornClock"
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => handleShare('twitter')} className="gap-2">
                  <Twitter className="w-4 h-4" /> Twitter
                </Button>
                <Button variant="outline" onClick={() => handleShare('facebook')} className="gap-2">
                  <Facebook className="w-4 h-4" /> Facebook
                </Button>
                <Button variant="outline" onClick={() => handleShare('copy')} className="gap-2">
                  <LinkIcon className="w-4 h-4" /> Copy Link
                </Button>
                {showShareCard && (
                  <Button onClick={downloadCard} className="gap-2">
                    <Download className="w-4 h-4" /> Download Card
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default BirthdayResults;
