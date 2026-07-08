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
import { Crown, ArrowRight, ShieldCheck, Sparkles, Star, Users, Activity, Globe, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEO, WebSiteSchema } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { AuthorBio } from '@/components/AuthorBio';

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
        keywords="age calculator, how old am I, born in 1990 how old, born in 1985 how old, born in 1995 how old, celebrity birthday match, famous birthdays today, life expectancy calculator, how long will I live, death clock, zodiac sign calculator, birthstone finder, planetary age calculator"
        canonicalUrl="/"
      />
      <WebSiteSchema />
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 text-center leading-tight">
                Know your time.{' '}
                <span className="text-indigo-600">Live it well.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mx-auto mt-4">
                Life expectancy, birthday insights, and the science of a longer life — all from your date of birth.
              </p>

              <p className="text-sm text-indigo-600 font-medium text-center mb-3 italic">
                Enter your date of birth to discover your celebrity birthday twin, zodiac signs, longevity forecast, and more →
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

        {/* Planetary Weight Teaser — links to /planetary-age */}
        <section className="max-w-4xl mx-auto mb-12 px-4">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white">
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              ⚖️ How Heavy Are You on Other Planets?
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Your weight isn't fixed — it changes dramatically across the solar system.
              Gravity on Jupiter is 2.5× Earth's. On Mars, you'd weigh less than half.
            </p>

            {/* Sample weight cards — based on 70kg default */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { planet: 'Mars',    emoji: '🔴', multiplier: 0.38, color: 'bg-red-900/40' },
                { planet: 'Jupiter', emoji: '🟠', multiplier: 2.53, color: 'bg-orange-900/40' },
                { planet: 'Moon',    emoji: '🌕', multiplier: 0.17, color: 'bg-slate-700/40' },
                { planet: 'Saturn',  emoji: '🪐', multiplier: 1.07, color: 'bg-yellow-900/40' },
              ].map(({ planet, emoji, multiplier, color }) => (
                <div key={planet} className={`${color} rounded-xl p-3 text-center border border-white/10`}>
                  <div className="text-xl mb-1">{emoji}</div>
                  <p className="text-xs text-slate-400 mb-0.5">{planet}</p>
                  <p className="text-base font-bold text-white">{Math.round(70 * multiplier)} kg</p>
                  <p className="text-xs text-slate-400">{multiplier}× Earth</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 italic mb-3 text-center">
              Sample based on 70 kg. Calculate your exact weight →
            </p>

            <div className="bg-blue-900/30 rounded-xl p-3 border border-blue-500/20 mb-4">
              <p className="text-xs font-semibold text-blue-300 mb-1">🔬 The Science</p>
              <p className="text-xs text-blue-200 leading-relaxed">
                Weight is determined by surface gravitational acceleration (g).
                Jupiter's g = 24.8 m/s² vs Earth's 9.8 m/s², making you 2.53× heavier.
                This is why Mars (g = 3.7 m/s²) is a leading colonisation candidate —
                the human body can adapt to 38% Earth gravity far more easily than to
                Jupiter's crushing 2.5× gravity.
              </p>
              <p className="text-xs text-blue-400 mt-1">Source: NASA Planetary Fact Sheet, 2023</p>
            </div>

            <a
              href="/planetary-age"
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Calculate My Planetary Weight &amp; Age →
            </a>
          </div>
        </section>

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

        {/* More Ways to Know Yourself */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">More Ways to Know Yourself</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link to="/biological-age">
              <Card className="glass-card h-full hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">Biological Age Test</h3>
                  <p className="text-sm text-muted-foreground">Take our 10-question quiz to discover if your body is younger or older than your calendar age.</p>
                  <span className="text-xs text-primary font-medium">Start quiz →</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/country-comparison">
              <Card className="glass-card h-full hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground">Country Longevity Comparison</h3>
                  <p className="text-sm text-muted-foreground">Compare life expectancy across 57 countries with UN WPP 2024 data.</p>
                  <span className="text-xs text-accent font-medium">Explore countries →</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/birthday-report">
              <Card className="glass-card h-full hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <FileText className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">Birthday PDF Report</h3>
                  <p className="text-sm text-muted-foreground">Download a free 8-page personalised report with zodiac, numerology, birthstone, and more.</p>
                  <span className="text-xs text-foreground font-medium">Get your report →</span>
                </CardContent>
              </Card>
            </Link>
          </div>
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
