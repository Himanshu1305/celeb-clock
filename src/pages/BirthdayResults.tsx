import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ZodiacAndFacts } from '@/components/ZodiacAndFacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBirthDate } from '@/context/BirthDateContext';
import { useAuth } from '@/hooks/useAuth';
import { searchBirthdayMatches } from '@/services/BirthdaySearchService';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';
import { 
  Calendar, Clock, Users, Star, Share2, Download, 
  ArrowRight, Sparkles, Heart, Crown, Twitter, Facebook, Link as LinkIcon,
  ExternalLink, Trophy, Briefcase, Music, Palette, FlaskConical, Globe, ImageIcon
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import html2canvas from 'html2canvas';

// Age calculation helper
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
    years,
    months,
    days: remainingDays,
    totalDays: days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    totalSeconds: seconds,
    totalMinutes: minutes,
    totalHours: hours,
  };
};

// Get generation based on birth year
const getGeneration = (year: number) => {
  if (year >= 2013) return { name: 'Gen Alpha', emoji: '👶' };
  if (year >= 1997) return { name: 'Gen Z', emoji: '📱' };
  if (year >= 1981) return { name: 'Millennial', emoji: '🎮' };
  if (year >= 1965) return { name: 'Gen X', emoji: '📻' };
  if (year >= 1946) return { name: 'Baby Boomer', emoji: '📺' };
  return { name: 'Silent Gen', emoji: '📰' };
};

// Get zodiac sign
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
    if ((month === sm && day >= sd) || (month === em && day <= ed)) {
      return z;
    }
  }
  return signs[0];
};

// Life Path Number
const calculateLifePath = (date: Date) => {
  const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  let sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
};

// Get birthstone
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

// Calculate planetary ages
const calculatePlanetaryAges = (earthYears: number) => {
  return [
    { name: 'Mercury', years: (earthYears / 0.24).toFixed(1), emoji: '🪨', color: 'text-gray-500' },
    { name: 'Venus', years: (earthYears / 0.62).toFixed(1), emoji: '🟡', color: 'text-yellow-500' },
    { name: 'Earth', years: earthYears.toFixed(1), emoji: '🌍', color: 'text-blue-500' },
    { name: 'Mars', years: (earthYears / 1.88).toFixed(1), emoji: '🔴', color: 'text-red-500' },
    { name: 'Jupiter', years: (earthYears / 11.86).toFixed(1), emoji: '🟠', color: 'text-orange-500' },
    { name: 'Saturn', years: (earthYears / 29.46).toFixed(1), emoji: '🪐', color: 'text-amber-600' },
  ];
};

// Celebrity Card Component with auto image fetching
const CelebrityCard = ({ person, index }: { person: any; index: number }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(person.image || null);
  const [imageLoading, setImageLoading] = useState(!person.image);
  const [imageError, setImageError] = useState(false);

  // Fetch image from Wikipedia if not already available
  useEffect(() => {
    if (person.image) {
      setImageUrl(person.image);
      setImageLoading(false);
      return;
    }

    const fetchImage = async () => {
      setImageLoading(true);
      try {
        const url = await fetchCelebrityImage(person.name, person.image);
        if (url) {
          setImageUrl(url);
        }
      } catch (err) {
        console.error(`Failed to fetch image for ${person.name}:`, err);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();
  }, [person.name, person.image]);

  const getCategoryIcon = () => {
    switch (person.category) {
      case 'actor': return <Star className="w-4 h-4" />;
      case 'dancer': case 'musician': case 'celebrity': return <Music className="w-4 h-4" />;
      case 'artist': return <Palette className="w-4 h-4" />;
      case 'scientist': return <FlaskConical className="w-4 h-4" />;
      case 'entrepreneur': return <Briefcase className="w-4 h-4" />;
      case 'sports': case 'athlete': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = () => {
    switch (person.category) {
      case 'actor': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'dancer': case 'musician': case 'celebrity': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'artist': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'scientist': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'entrepreneur': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'sports': case 'athlete': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getGradientForIndex = (idx: number) => {
    const gradients = [
      'from-amber-400 via-yellow-500 to-amber-600', // Gold - #1
      'from-gray-300 via-gray-400 to-gray-500', // Silver - #2
      'from-amber-600 via-amber-700 to-amber-800', // Bronze - #3
      'from-blue-400 via-blue-500 to-blue-600',
      'from-purple-400 via-purple-500 to-purple-600',
      'from-pink-400 via-pink-500 to-pink-600',
    ];
    return gradients[idx] || gradients[idx % gradients.length];
  };

  const birthYear = new Date(person.birthDate).getFullYear();
  const currentAge = person.deathDate ? null : new Date().getFullYear() - birthYear;

  return (
    <Card 
      className="glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className={`h-2 bg-gradient-to-r ${getGradientForIndex(index)}`} />
        
        <div className="p-4">
          <div className="flex gap-4">
            {/* Avatar with loading state */}
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-lg">
                {imageLoading ? (
                  <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300">
                    <div className="animate-pulse w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-full" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage 
                      src={imageUrl || undefined} 
                      alt={person.name} 
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                      {person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              {/* Rank badge for top 3 */}
              {index < 3 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-gray-400' :
                  'bg-amber-700'
                }`}>
                  {index + 1}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                    {person.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{person.profession}</p>
                </div>
                {index === 0 && (
                  <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 shrink-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Top Match
                  </Badge>
                )}
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${getCategoryColor()}`}>
                  {getCategoryIcon()}
                  <span className="ml-1 capitalize">{person.category || 'Celebrity'}</span>
                </Badge>
                {currentAge && (
                  <span className="text-xs text-muted-foreground">Age {currentAge}</span>
                )}
                <span className="text-xs text-muted-foreground">Born {birthYear}</span>
              </div>
            </div>
          </div>

          {/* Wikipedia link */}
          {person.wikipediaUrl && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <a 
                href={person.wikipediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Wikipedia
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const BirthdayResults = () => {
  const { birthDate } = useBirthDate();
  const { user } = useAuth();
  const [age, setAge] = useState<ReturnType<typeof calculateAge> | null>(null);
  const [celebrities, setCelebrities] = useState<any[]>([]);
  const [loadingCelebs, setLoadingCelebs] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Update age every second
  useEffect(() => {
    if (!birthDate) return;
    const updateAge = () => setAge(calculateAge(birthDate));
    updateAge();
    const interval = setInterval(updateAge, 1000);
    return () => clearInterval(interval);
  }, [birthDate]);

  // Fetch celebrities
  useEffect(() => {
    if (!birthDate) return;
    
    const fetchCelebrities = async () => {
      setLoadingCelebs(true);
      try {
        const result = await searchBirthdayMatches(birthDate);
        setCelebrities(result.people.slice(0, 9)); // Get up to 9 celebrities
      } catch (err) {
        console.error('Failed to fetch celebrities:', err);
      } finally {
        setLoadingCelebs(false);
      }
    };

    fetchCelebrities();
  }, [birthDate]);

  // Handle no birth date
  if (!birthDate) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <Card className="glass-card max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <Calendar className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">No Birthday Selected</h1>
            <p className="text-muted-foreground">Enter your birthday to see your personalized results.</p>
            <Button asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
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

  const handleShare = async (platform: string) => {
    const celebName = celebrities[0]?.name || 'famous people';
    const text = `I'm ${age?.years} years old (${age?.totalDays.toLocaleString()} days)! I share my birthday with ${celebName}. Find your birthday twin at`;
    const url = window.location.origin;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied to clipboard!');
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
              
              {/* Main Age Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { value: age?.years || 0, label: 'Years', color: 'text-primary' },
                  { value: age?.months || 0, label: 'Months', color: 'text-accent' },
                  { value: age?.days || 0, label: 'Days', color: 'text-secondary' },
                  { value: age?.hours || 0, label: 'Hours', color: 'text-primary' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-background/50 rounded-xl">
                    <div className={`text-4xl md:text-5xl font-bold tabular-nums ${item.color}`}>
                      {item.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Seconds Counter */}
              <div className="text-center p-4 bg-primary/5 rounded-xl mb-6">
                <div className="text-sm text-muted-foreground mb-1">Total Seconds Alive</div>
                <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                  {age?.totalSeconds.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">updating every second...</div>
              </div>

              {/* Additional Stats */}
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

        {/* Quick Facts Row - Now with 5 items */}
        <section className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Generation */}
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block">{generation.emoji}</span>
                <h3 className="font-bold text-foreground text-sm">{generation.name}</h3>
                <p className="text-xs text-muted-foreground">Generation</p>
              </CardContent>
            </Card>

            {/* Zodiac */}
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block">{zodiac.symbol}</span>
                <h3 className="font-bold text-foreground text-sm">{zodiac.sign}</h3>
                <p className="text-xs text-muted-foreground">Zodiac</p>
              </CardContent>
            </Card>

            {/* Life Path */}
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block font-bold text-primary">{lifePath}</span>
                <h3 className="font-bold text-foreground text-sm">Life Path {lifePath}</h3>
                <p className="text-xs text-muted-foreground">Numerology</p>
              </CardContent>
            </Card>

            {/* Birthstone */}
            <Card className="glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block">{birthstone.emoji}</span>
                <h3 className="font-bold text-foreground text-sm">{birthstone.name}</h3>
                <p className="text-xs text-muted-foreground">Birthstone</p>
              </CardContent>
            </Card>

            {/* Mars Age */}
            <Card className="glass-card hover:scale-[1.02] transition-transform bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-1 block">🔴</span>
                <h3 className="font-bold text-foreground text-sm">{planetaryAges[3].years} yrs</h3>
                <p className="text-xs text-muted-foreground">Age on Mars</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Celebrity Matches - Enhanced Section */}
        <section className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card card-party-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Your Celebrity Birthday Twins</h2>
                </div>
                <Badge variant="secondary">{celebrities.length} Matches</Badge>
              </div>

              {loadingCelebs ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Finding your celebrity twins...</p>
                </div>
              ) : celebrities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {celebrities.slice(0, 6).map((person, index) => (
                    <CelebrityCard key={person.name} person={person} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No celebrity matches found for this date.</p>
                </div>
              )}

              {celebrities.length > 6 && (
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link to="/celebrity-birthday">
                      View All {celebrities.length} Matches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
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

        {/* Zodiac Details */}
        <section className="max-w-4xl mx-auto mb-12">
          <ZodiacAndFacts birthDate={birthDate} />
        </section>

        {/* Share Card Section - Enhanced with Planetary Ages */}
        <section className="max-w-4xl mx-auto mb-12">
          <Card className="glass-card card-party-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Share Your Results</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowShareCard(!showShareCard)}>
                  {showShareCard ? 'Hide Card' : 'Preview Card'}
                </Button>
              </div>

              {/* Enhanced Shareable Card Preview */}
              {showShareCard && (
                <div className="mb-6 flex justify-center">
                  <div 
                    ref={shareCardRef}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white w-full max-w-sm shadow-2xl"
                  >
                    <div className="text-center space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">🎂</span>
                        <span className="text-sm font-medium tracking-widest opacity-80">BIRTHDAY DECODED</span>
                      </div>
                      
                      {/* Date */}
                      <div className="text-lg opacity-80">
                        {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      {/* Age */}
                      <div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {age?.years} Years
                        </div>
                        <div className="text-lg opacity-70 mt-1">
                          {age?.totalDays.toLocaleString()} Days Old
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/20" />

                      {/* Quick Facts */}
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

                      {/* Divider */}
                      <div className="h-px bg-white/20" />

                      {/* Planetary Ages */}
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

                      {/* Celebrity Twin */}
                      {celebrities.length > 0 && (
                        <>
                          <div className="h-px bg-white/20" />
                          <div>
                            <div className="text-xs opacity-60 mb-1">CELEBRITY BIRTHDAY TWIN</div>
                            <div className="text-lg font-semibold">{celebrities[0]?.name}</div>
                          </div>
                        </>
                      )}

                      {/* Footer */}
                      <div className="text-xs opacity-40 pt-2">celebclock.com</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => handleShare('twitter')} className="gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button variant="outline" onClick={() => handleShare('facebook')} className="gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={() => handleShare('copy')} className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </Button>
                {showShareCard && (
                  <Button onClick={downloadCard} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Card
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="max-w-2xl mx-auto text-center mb-12">
          <Card className="glass-card bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Want to Explore More?</h3>
              <p className="text-muted-foreground mb-4">Discover your life expectancy, detailed numerology, and more insights.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/life-expectancy">Life Expectancy</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/planetary-age">All Planets</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/numerology">Numerology</Link>
                </Button>
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
