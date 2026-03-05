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
import { Crown, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

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

        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8 pb-16 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text-primary leading-tight">
              Your Birthday, Decoded
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Calculate your exact age, discover celebrity birthday twins, explore your numerology, see your age on other planets, and unlock a personalized life expectancy report.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="gap-2 text-lg px-8 py-6 animate-glow"
                asChild
              >
                <Link to="/age-calculator">
                  🎂 Calculate My Age
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 py-6"
                asChild
              >
                <Link to="/todays-birthdays">
                  🎉 Today's Birthdays
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Sign Up Banner for non-authenticated users */}
        {!user && (
          <section className="max-w-3xl mx-auto mb-12 animate-fade-in-up">
            <Card className="glass-card bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Create a free account</h3>
                  <p className="text-sm text-muted-foreground">Save your results, unlock celebrity matches & get weekly insights</p>
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

        {/* Feature Grid */}
        <FeaturePillars />

        {/* Today's Birthdays Preview */}
        <section className="max-w-4xl mx-auto mb-16">
          <TodaysBirthdays />
          <div className="text-center mt-4">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/todays-birthdays">
                See All Today's Birthdays <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-bold gradient-text-primary text-center mb-6">
                Know Yourself Better
              </h2>
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Your age is more than a number — it's your journey through moments, experiences, and milestones. Our suite of free tools helps you explore your birthday from every angle: precise age calculations, celebrity matches, numerology insights, and even your age on other planets.
                </p>
                <p>
                  Built with verified algorithms and tested for accuracy, our calculators follow the principles of EEAT (Experience, Expertise, Authoritativeness, and Trustworthiness) to ensure every result you see is precise and trustworthy.
                </p>
                <p className="text-center pt-4 text-muted-foreground">
                  📧 Have feedback? Reach us at <a href="/contact" className="text-primary hover:underline">our contact page</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
