import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Sparkles, Users, Calendar, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Upgrade = () => {
  const { user, isPremium } = useAuth();

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">You're Already Premium!</CardTitle>
            <CardDescription>
              Enjoy all the cosmic features unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">
                Return to Calculator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Calculator
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Unlock Your Cosmic Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get lifetime access to premium features and discover the universe of possibilities
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto mb-12">
          <Card className="relative border-2 border-primary/20 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Sparkles className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold">Premium Lifetime</CardTitle>
              <div className="text-4xl font-bold text-primary mt-2">
                $29.99
                <span className="text-lg text-muted-foreground font-normal ml-2">one-time</span>
              </div>
              <CardDescription className="text-base mt-2">
                Lifetime access to all premium features
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Premium Celebrity Database</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Advanced Life Expectancy Calculator</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Export Detailed Reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Birthday Twin Notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Priority Support</span>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg" disabled>
                <Star className="w-4 h-4 mr-2" />
                Coming Soon - Stripe Integration
              </Button>

              {!user && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in or create an account
                  </Link> to purchase premium
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Celebrity Database</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access our extensive database of celebrities with detailed profiles, achievements, and fun facts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Life Expectancy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get personalized life expectancy calculations based on lifestyle factors and health data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Export Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Download detailed PDF reports of your age calculations and celebrity matches.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Is this a one-time payment?</h4>
              <p className="text-muted-foreground">Yes! Pay once and get lifetime access to all premium features.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I use this on multiple devices?</h4>
              <p className="text-muted-foreground">Absolutely! Your premium access is tied to your account and works on any device.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-muted-foreground">We offer a 30-day money-back guarantee if you're not satisfied.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upgrade;