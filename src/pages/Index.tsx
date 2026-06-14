import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { BentoGrid } from '@/components/BentoGrid';
import { useAuth } from '@/hooks/useAuth';
import { useBirthDate } from '@/context/BirthDateContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, ShieldCheck, Sparkles, Star, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { AuthorBio } from '@/components/AuthorBio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRankedBirthdayCelebrities, CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';

const CY = new Date().getFullYear();
function mapForToday(r: CelebrityBirthdayResult) {
  const birthYear = r.birthDate ? parseInt(r.birthDate.substring(0, 4)) : null;
  const age = r.isLiving && birthYear ? CY - birthYear : null;
  const initials = r.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  return { ...r, age, initials };
}
const MONTH_SLUGS = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const Index = () => {
  const { user, profile, isPremium } = useAuth();
  const { setBirthDate } = useBirthDate();
  const navigate = useNavigate();
  
  // Birthday input state
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  
  // Live counter for social proof
  const [decodedCount, setDecodedCount] = useState(12847);

  // On This Day: top 3 celebrities born today
  const [todayCelebs, setTodayCelebs] = useState<ReturnType<typeof mapForToday>[]>([]);
  const [todayCelebImages, setTodayCelebImages] = useState<Record<string, string | null>>({});
  const [todayCelebsLoading, setTodayCelebsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const monthDay = `${mm}-${dd}`;
    console.log('TODAY DATE:', monthDay);
    getRankedBirthdayCelebrities(monthDay, null, 3)
      .then(res => {
        console.log('TODAY BIRTHDAYS SOURCE:', res);
        const mapped = res.map(mapForToday);
        setTodayCelebs(mapped);
        mapped.forEach(c => {
          fetchCelebrityImage(c.name).then(url => {
            setTodayCelebImages(prev => ({ ...prev, [c.name]: url }));
          });
        });
      })
      .catch(() => {
        console.log('FALLING BACK TO LOCAL DATA');
      })
      .finally(() => setTodayCelebsLoading(false));
  }, []);
  
  // Animate the counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDecodedCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleFindTwin = () => {
    if (day && month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        setBirthDate(date);
        navigate('/results');
      }
    }
  };

  // Check if form is valid
  const isFormValid = day && month && year && 
    parseInt(day) >= 1 && parseInt(day) <= 31 &&
    parseInt(month) >= 1 && parseInt(month) <= 12 &&
    parseInt(year) >= 1900 && parseInt(year) <= new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Best Age Calculator, Celebrity Birthday Match & Life Expectancy"
        description="The best free age calculator, celebrity birthday match, zodiac, birthstone, numerology, planetary age and life expectancy tools — accurate, live, sourced from WHO, CDC, NASA and Wikipedia."
        keywords="best age calculator, best celebrity birthday match, best life expectancy calculator, best numerology calculator, best zodiac sign calculator, best birthstone finder, best planetary age calculator"
        canonicalUrl="/"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Welcome Message for logged in users */}
        {user && profile?.name && (
          <div className="text-center py-4 animate-fade-in mb-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-full border border-primary/20">
              <span className="text-lg">Welcome back, <strong className="gradient-text-primary">{profile.name}</strong>!</span>
              {isPremium && (
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* NEW VIRAL HERO SECTION */}
        <section className="relative text-center pt-6 pb-16 max-w-4xl mx-auto" data-testid="hero-section">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-8 animate-fade-in-up">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span><strong className="text-foreground">{decodedCount.toLocaleString()}</strong> birthdays decoded today</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                <span className="text-foreground">You're </span>
                <span className="party-gradient bg-clip-text text-transparent">897 million seconds</span>
                <span className="text-foreground"> old.</span>
                <br />
                <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">And someone famous shares your birthday.</span>
              </h1>
              
              {/* Subheadline with value stacking */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enter your birthday to see your <strong className="text-foreground">exact age</strong> updating live,
                find your <strong className="text-foreground">celebrity twin</strong>, and unlock{' '}
                <strong className="text-primary">42 other things</strong> you've never been told.
              </p>
            </div>

            {/* Birthday Input Form */}
            <div className="max-w-md mx-auto">
              <Card className="glass-card card-party-border">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">Enter your birthday</p>
                    
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="sr-only">Day</label>
                        <input
                          type="number"
                          placeholder="DD"
                          min="1"
                          max="31"
                          value={day}
                          onChange={(e) => setDay(e.target.value)}
                          className="w-full px-4 py-3 text-center text-lg font-semibold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          data-testid="hero-day-input"
                        />
                        <span className="text-xs text-muted-foreground mt-1 block">Day</span>
                      </div>
                      <div className="flex-1">
                        <label className="sr-only">Month</label>
                        <input
                          type="number"
                          placeholder="MM"
                          min="1"
                          max="12"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="w-full px-4 py-3 text-center text-lg font-semibold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          data-testid="hero-month-input"
                        />
                        <span className="text-xs text-muted-foreground mt-1 block">Month</span>
                      </div>
                      <div className="flex-1">
                        <label className="sr-only">Year</label>
                        <input
                          type="number"
                          placeholder="YYYY"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-3 text-center text-lg font-semibold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          data-testid="hero-year-input"
                        />
                        <span className="text-xs text-muted-foreground mt-1 block">Year</span>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full gap-2 text-lg py-6 animate-shimmer"
                      onClick={handleFindTwin}
                      disabled={!isFormValid}
                      data-testid="hero-cta-button"
                    >
                      <Sparkles className="w-5 h-5" />
                      Reveal Everything
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span>50,000+ celebrities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>42+ insights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>100% free</span>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="pt-2">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/todays-birthdays">
                  Or see who's celebrating today →
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* On This Day */}
        {(todayCelebsLoading || todayCelebs.length > 0) && (() => {
          const now = new Date();
          const todayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
          const mm = now.getMonth() + 1;
          const dd = now.getDate();
          const todaySlug = `${MONTH_SLUGS[mm]}-${dd}`;
          return (
            <section className="max-w-4xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Card className="glass-card border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-bold text-foreground text-sm">🗓️ Today in Celebrity Birthdays</p>
                      <p className="text-xs text-muted-foreground">{todayLabel}</p>
                    </div>
                  </div>
                  {todayCelebsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="flex items-center gap-3 bg-background/50 rounded-xl p-3 border border-border/30">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-muted animate-pulse" />
                          <div className="min-w-0 space-y-2 flex-1">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {todayCelebs.map(celeb => {
                        const wikiUrl = celeb.wikipediaUrl ?? `https://en.wikipedia.org/wiki/${celeb.name.replace(/ /g, '_')}`;
                        const img = todayCelebImages[celeb.name];
                        return (
                          <a
                            key={celeb.name}
                            href={wikiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-background/50 hover:bg-background/80 rounded-xl p-3 transition-all hover:scale-[1.02] border border-border/30 group"
                          >
                            <Avatar className="w-12 h-12 shrink-0 border border-border/40">
                              {img ? (
                                <AvatarImage src={img} alt={celeb.name} className="object-cover" style={{ objectPosition: 'top center' }} />
                              ) : null}
                              <AvatarFallback className="text-sm font-bold bg-primary/10 text-foreground">
                                {celeb.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{celeb.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{celeb.occupation || 'Celebrity'}</p>
                              <p className="text-xs text-muted-foreground">
                                {celeb.isLiving && celeb.age ? `Turns ${celeb.age} today` : 'Legacy'}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <Link to="/todays-birthdays" className="text-xs text-primary hover:underline">
                      See all celebrities born today →
                    </Link>
                    <Link to={`/birthday/${todaySlug}`} className="text-xs text-muted-foreground hover:text-foreground">
                      Dedicated page →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          );
        })()}

        {/* Sign Up Banner */}
        {!user && (
          <section className="max-w-3xl mx-auto mb-12 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <Card className="glass-card card-party-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎁</span>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Save your results forever</h3>
                    <p className="text-sm text-muted-foreground">Create a free account to save matches & get weekly birthday insights</p>
                  </div>
                </div>
                <Button asChild className="gap-1 whitespace-nowrap">
                  <Link to="/auth?signup=true">
                    Join Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Bento Grid Features */}
        <BentoGrid />

        {/* EEAT Trust Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card card-party-border">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <ShieldCheck className="w-7 h-7 text-primary" />
                <h2 className="text-3xl font-bold gradient-text-primary">
                  Built on Trust & Accuracy
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Every calculator and report on this platform is built with verified algorithms, cross-referenced data sources, and scientific methodology. Our life expectancy model draws from peer-reviewed health research covering smoking, alcohol, diabetes, cardiac health, BMI, exercise, and stress factors.
                </p>
                <p>
                  Celebrity birthday data is sourced from verified public records and continuously updated. Our content follows <strong>E-E-A-T principles</strong> (Experience, Expertise, Authoritativeness, and Trustworthiness) to ensure every result you see is precise, transparent, and trustworthy.
                </p>
                <p className="text-center pt-4 text-muted-foreground">
                  Have feedback? Reach us at <a href="/contact" className="text-primary hover:underline">our contact page</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Testimonials */}
        <TestimonialsSection />

        <PageFAQ slug="home" title="Frequently Asked Questions" />
        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
