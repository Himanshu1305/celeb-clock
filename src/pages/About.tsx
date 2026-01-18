import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            About Age & Celeb Life
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your fun, interactive age and health companion
          </p>
        </div>

        <Separator className="mb-12" />

        {/* Mission Section */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">About Our App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Welcome to <strong className="text-foreground">Age & Celeb Life</strong> — your fun, interactive age and health companion.
            </p>
            <p>
              Our mission is simple: We want to combine meaningful, personalized data with a clean and engaging digital experience. Our tool helps you discover your precise age in real time, see which celebrities share your birthday, and estimate your life expectancy based on proven health science.
            </p>
          </CardContent>
        </Card>

        {/* Why We Built This */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Why We Built This</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We believe life is more enjoyable when you understand it better. We created Age & Celeb Life because we believe life is more than just a number—it's a journey, a collection of moments, and an ongoing story. We wanted to create a fun, elegant, and insightful tool that helps you see your own story in a new light.
            </p>
            <p>
              Our age calculator brings your life's timeline to life with real-time precision. Our celebrity matcher connects you to famous birthday twins, from actors to athletes. And our life expectancy calculator offers insightful, data-driven estimates to inspire healthier choices—all backed by trusted sources like WHO and CDC.
            </p>
            <p>
              From the exact seconds you've been alive to the unique historical events that happened on your birthday, our app is designed to bring a sense of perspective and wonder to your personal timeline. Our mission is to provide you with meaningful, personalized data that helps you understand your past, celebrate your present, and look to the future with clarity.
            </p>
          </CardContent>
        </Card>

        {/* What Makes Us Unique */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">What Makes Us Unique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-accent shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">Fun and Interactive</h3>
                <p className="text-muted-foreground">
                  From ticking seconds to celebrity carousels, every feature feels alive.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-accent shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">Personalized Insights</h3>
                <p className="text-muted-foreground">
                  Discover your zodiac, birthstone, and life expectancy with a few clicks. Premium users can create a secure account to save access and receive birthday twin notifications.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-accent shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">One-Time Premium Access</h3>
                <p className="text-muted-foreground">
                  Unlock the full experience for a $9.99 lifetime fee—no subscriptions, just value.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-primary text-primary-foreground text-center">
          <CardContent className="pt-6 space-y-4">
            <p className="text-lg">
              Join thousands of users exploring their time capsule. Try it free or unlock your full Life Report today!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button variant="secondary" size="lg" className="font-heading">
                  Try It Free
                </Button>
              </Link>
              <Link to="/upgrade">
                <Button variant="outline" size="lg" className="font-heading bg-white/10 border-white/20 hover:bg-white/20 text-white">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Questions? <Link to="/contact" className="underline hover:text-white transition-colors">Reach us at Contact Us</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
