import { useNavigate } from 'react-router-dom';
import { AgeCalculator } from '@/components/AgeCalculator';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ReviewForm } from '@/components/ReviewForm';
import { CelebrityMatch } from '@/components/CelebrityMatch';
import { ZodiacAndFacts } from '@/components/ZodiacAndFacts';
import { LifeExpectancyCTA } from '@/components/LifeExpectancyCTA';
import { FeaturePillars } from '@/components/FeaturePillars';
import { useAuth } from '@/hooks/useAuth';
import { useBirthDate } from '@/context/BirthDateContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

const Index = () => {
  const { birthDate, setBirthDate } = useBirthDate();
  const { isPremium, user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO 
        title="Discover Your Exact Age Instantly"
        description="Curious how old you are down to the second? Our smart Age Calculator tells you your exact age in years, months, days, hours, minutes, and seconds — all with one click."
        keywords="age calculator, calculate age, exact age, age in days, age in hours, birthday calculator"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation */}
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
        <section className="text-center space-y-6 pt-8 pb-12 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text-primary leading-tight">
              Discover Your Exact Age Instantly with Our Free Age Calculator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Curious how old you are down to the second? Our smart Age Calculator tells you your exact age in years, months, days, hours, minutes, and seconds — all with one click. Celebrate your time, milestones, and memories effortlessly.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="gap-2 text-lg px-8 py-6 animate-glow"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🎂 Calculate My Age Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Age Calculator Section */}
        <section id="calculator" className="max-w-4xl mx-auto mb-16">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        {/* Celebrity Match Section - shows after birth date is entered */}
        {birthDate && (
          <section className="max-w-6xl mx-auto mb-16 animate-fade-in-up">
            <CelebrityMatch birthDate={birthDate} />
          </section>
        )}

        {/* Zodiac and Facts Section - shows after birth date is entered */}
        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <ZodiacAndFacts birthDate={birthDate} />
          </section>
        )}

        {/* Life Expectancy Premium CTA - shows after birth date */}
        {birthDate && (
          <LifeExpectancyCTA />
        )}

        {/* CTA to search more celebrities */}
        {birthDate && (
          <section className="max-w-2xl mx-auto mb-16 text-center animate-fade-in-up">
            <Card className="glass-card">
              <CardContent className="p-8 space-y-4">
                <Search className="w-10 h-10 mx-auto text-primary" />
                <h3 className="text-2xl font-bold">Want More Celebrity Matches?</h3>
                <p className="text-muted-foreground">
                  Search Wikipedia for even more famous people who share your birthday
                </p>
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={() => navigate('/celebrity-birthday')}
                >
                  Search Celebrity Birthdays
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 3 Feature Pillars + Also Explore */}
        <FeaturePillars />
        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* About Section (single copy) */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-bold gradient-text-primary text-center mb-6">
                Know Yourself Better — Experience Time with Precision
              </h2>
              
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Your age is more than a number — it's your journey through moments, experiences, and milestones. Our Age Calculator helps you discover your precise age, whether you want to know it for documentation, curiosity, or celebration.
                </p>
                
                <p>
                  Simply enter your date of birth, and the calculator instantly shows your exact age across multiple time units — years, months, days, hours, minutes, and even seconds. You'll also see your upcoming birthday, day of birth, and how long until your next big milestone.
                </p>
                
                <p>
                  Built with verified algorithms and tested for accuracy, our Age Calculator follows the principles of EEAT (Experience, Expertise, Authoritativeness, and Trustworthiness). It ensures that every calculation is precise and transparent, giving you results you can rely on.
                </p>
                
                <div className="bg-primary/5 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold mb-4">You can use our Age Calculator for:</h3>
                  <ul className="space-y-2">
                    <li>Checking your exact age anytime, anywhere</li>
                    <li>Finding your next birthday countdown</li>
                    <li>Comparing ages with family or friends</li>
                    <li>Quick online verifications and forms</li>
                  </ul>
                </div>
                
                <p>
                  Whether you're looking for a simple age calculator near me, or want to share your results online, our platform is fast, secure, and designed for a seamless experience.
                </p>
                
                <p className="text-center pt-4 text-muted-foreground">
                  📧 Have feedback or questions? Reach us anytime at <a href="/contact" className="text-primary hover:underline">support@yourdomain.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Write a Review Section */}
        <section className="max-w-xl mx-auto mb-16">
          <ReviewForm />
        </section>

      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
