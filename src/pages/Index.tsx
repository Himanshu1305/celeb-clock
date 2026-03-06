import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FeaturePillars } from '@/components/FeaturePillars';
import { TodaysBirthdays } from '@/components/TodaysBirthdays';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

const floatingEmojis = [
  { emoji: '🎂', delay: '0s', duration: '4s', left: '5%', size: 'text-3xl' },
  { emoji: '🎉', delay: '0.5s', duration: '3.5s', left: '15%', size: 'text-2xl' },
  { emoji: '✨', delay: '1s', duration: '3s', left: '25%', size: 'text-xl' },
  { emoji: '🥳', delay: '1.5s', duration: '4.5s', left: '40%', size: 'text-3xl' },
  { emoji: '🎊', delay: '0.8s', duration: '3.8s', left: '55%', size: 'text-2xl' },
  { emoji: '🎁', delay: '2s', duration: '4.2s', left: '68%', size: 'text-xl' },
  { emoji: '🌟', delay: '0.3s', duration: '3.2s', left: '78%', size: 'text-2xl' },
  { emoji: '🎈', delay: '1.2s', duration: '3.6s', left: '88%', size: 'text-3xl' },
];

const Index = () => {
  const { user, profile, isPremium } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Your Birthday, Decoded – Age, Celebrities & More"
        description="Discover your exact age, celebrity birthday matches, life path number, planetary age, and more. Free tools to explore your birthday like never before."
        keywords="age calculator, birthday calculator, celebrity birthdays, numerology, planetary age, life expectancy"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Welcome Message */}
        {user && profile?.name && (
          <div className="text-center py-4 animate-fade-in mb-8">
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

        {/* Party Hero Section */}
        <section className="relative text-center pt-8 pb-20 max-w-5xl mx-auto overflow-hidden">
          {/* Floating emojis */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {floatingEmojis.map((item, i) => (
              <span
                key={i}
                className={`absolute top-0 ${item.size} animate-float opacity-60`}
                style={{
                  left: item.left,
                  animationDelay: item.delay,
                  animationDuration: item.duration,
                }}
              >
                {item.emoji}
              </span>
            ))}
          </div>

          <div className="relative z-10 space-y-6 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="text-6xl animate-wiggle inline-block">🎉</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="party-gradient bg-clip-text text-transparent">
                Every Day is Someone's Birthday!
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your one-stop birthday playground — calculate your exact age to the second, discover which celebrities share your birthday, explore your zodiac, and unlock personalized health insights. Let's celebrate!
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 animate-shimmer" asChild>
                <Link to="/age-calculator">
                  🎂 Calculate My Age
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 hover-scale" asChild>
                <Link to="/todays-birthdays">
                  🥳 Today's Birthdays
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
                    <h3 className="font-semibold text-lg text-foreground">Join the Party — It's Free!</h3>
                    <p className="text-sm text-muted-foreground">Save results, unlock celebrity matches & get weekly birthday insights</p>
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

        {/* Feature Content Blocks */}
        <FeaturePillars />

        {/* Today's Birthdays Preview */}
        <section className="max-w-4xl mx-auto mb-16">
          <TodaysBirthdays />
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
                  📧 Have feedback? Reach us at <a href="/contact" className="text-primary hover:underline">our contact page</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Testimonials */}
        <TestimonialsSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
