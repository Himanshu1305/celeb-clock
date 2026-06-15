import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { PromoCodeInput } from '@/components/PromoCodeInput';
import { useToast } from '@/hooks/use-toast';
import { PromoCodeResult } from '@/services/PromoCodeService';
import {
  CheckCircle, FlaskConical, Dna, Star, ArrowLeft,
  ShieldCheck, Sparkles, Quote
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    emoji: '🔬',
    icon: FlaskConical,
    title: 'What-If Simulator',
    description:
      'Move 25+ lifestyle sliders and see your forecast change in real time. Discover which habits add the most years to your life.',
  },
  {
    emoji: '🧬',
    icon: Dna,
    title: 'Full Biological Blueprint',
    description:
      'Your complete 3-tab report: health analysis, genetic baseline, community factors. Downloadable PDF included.',
  },
  {
    emoji: '🌟',
    icon: Star,
    title: 'Cultural Horizon',
    description:
      'See which iconic figures share your longevity path — and who you could join with an optimised lifestyle.',
  },
];

const TESTIMONIALS = [
  { quote: 'Discovered I could add 12 years with simple lifestyle changes. The simulator was eye-opening.' },
  { quote: 'The family genetics section was the most thoughtful health tool I\'ve used.' },
  { quote: 'The What-If Simulator is incredibly motivating. I changed three habits the same week.' },
];

const Upgrade = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePaymentClick = () => {
    toast({
      title: 'Payment coming soon!',
      description: 'Payment integration is live in a few days. Enter a promo code below for free access.',
    });
  };

  const handlePromoSuccess = (_result: PromoCodeResult) => {
    navigate('/life-expectancy');
  };

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8 space-y-4">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">You're already Premium!</h1>
            <p className="text-muted-foreground">All features are unlocked. Enjoy your longevity blueprint.</p>
            <Button asChild className="w-full">
              <Link to="/life-expectancy">Go to Life Expectancy →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Unlock Your Full Longevity Blueprint | BornClock Premium"
        description="Upgrade to BornClock Premium and unlock your complete longevity analysis, What-If Simulator, Biological Blueprint, and Cultural Horizon."
        noindex
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Hero */}
        <section className="text-center mb-14">
          <Badge variant="outline" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" /> Premium Access
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Unlock Your Complete Longevity Blueprint
          </h1>
          <p className="text-gray-500 italic text-center mt-2">
            "Know your time. Live it well."
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
            You have seen your forecast. Now discover exactly why — and what you can do about it.
          </p>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-14">
          {FEATURE_CARDS.map((f) => (
            <Card key={f.title} className="glass-card text-center p-6 space-y-3">
              <span className="text-4xl">{f.emoji}</span>
              <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </section>

        {/* Pricing */}
        <section className="mb-10">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly */}
            <Card className="glass-card border-border p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-black text-foreground">₹499</span>
                  <span className="text-muted-foreground mb-1">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">Cancel anytime</p>
              </div>
              <ul className="space-y-2 text-sm">
                {['What-If Simulator', 'Biological Blueprint PDF', 'Cultural Horizon'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" disabled onClick={handlePaymentClick}>
                Start 7-Day Free Trial
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Payment coming soon — enter promo code below for free access
              </p>
            </Card>

            {/* Annual */}
            <Card className="glass-card border-primary/40 p-6 space-y-4 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Best Value
              </Badge>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-black text-foreground">₹3,999</span>
                  <span className="text-muted-foreground mb-1">/ year</span>
                </div>
                <p className="text-xs text-green-600 font-medium">Save ₹2,000 vs monthly</p>
              </div>
              <ul className="space-y-2 text-sm">
                {['Everything in Monthly', 'Priority support', 'Early access to new features'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" disabled onClick={handlePaymentClick}>
                Start 7-Day Free Trial
              </Button>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">Coming soon</Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* Promo Code */}
        <section className="mb-14">
          <Card className="glass-card p-6">
            <h2 className="font-semibold text-foreground mb-1">Have a promo code?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter it here for free access:
            </p>
            {user ? (
              <PromoCodeInput
                userId={user.id}
                onSuccess={handlePromoSuccess}
              />
            ) : (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You need to be signed in to redeem a promo code.</p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/auth">Sign in / Create account →</Link>
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Social Proof */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Join users who discovered their longevity forecast
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="glass-card p-5">
                <Quote className="h-5 w-5 text-primary/40 mb-3" />
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.quote}"</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Guarantee */}
        <section className="text-center mb-8">
          <Card className="glass-card p-6 max-w-xl mx-auto">
            <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-2">7-day free trial — experience everything before paying.</h3>
            <p className="text-sm text-muted-foreground">No credit card required to start. Cancel or keep — your choice after 7 days.</p>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Upgrade;
