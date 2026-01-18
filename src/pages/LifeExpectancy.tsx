import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { LifeExpectancyCalculator } from '@/components/LifeExpectancyCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Heart, TrendingUp, Shield, Activity, CalendarIcon } from 'lucide-react';
import { useBirthDate } from '@/context/BirthDateContext';

const LifeExpectancy = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDate = value ? new Date(value) : null;
    setBirthDate(newDate);
  };

  // Format date for input field
  const getInputValue = () => {
    if (!birthDate) return '';
    return birthDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8 pb-12 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text-primary leading-tight">
              Discover How Long You're Likely to Live with Our Free Life Expectancy Calculator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Wondering how your daily habits and health choices impact your future? Our data-driven Life Expectancy Calculator estimates your lifespan using verified public-health data — giving you personalized insights to help you live longer, healthier, and happier.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="gap-2 text-lg px-8 py-6 animate-glow"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🧬 Calculate My Life Expectancy
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Life Expectancy Calculator Section */}
        <section id="calculator" className="max-w-6xl mx-auto mb-16">
          <LifeExpectancyCalculator birthDate={birthDate} celebrities={[]} />
        </section>

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-bold gradient-text-primary text-center mb-6">
                Understand Your Future — Backed by Science, Designed with Care
              </h2>
              
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Your future isn't just fate — it's shaped by your lifestyle, health, and choices. Our Life Expectancy Calculator empowers you to understand how your everyday habits may affect your longevity, using scientifically supported data and proven models.
                </p>
                
                <p>
                  When you use our Life Expectancy Calculator, you simply enter your age, gender, lifestyle factors (like smoking, drinking, or exercise), and medical history (e.g., heart disease, diabetes). The tool then generates an estimate of your expected lifespan — instantly and securely.
                </p>
                
                <p>
                  This estimate is calculated using simplified actuarial tables and formulas derived from trusted public health organizations, such as the CDC, World Health Organization (WHO), and the U.S. Social Security Administration (SSA). These sources provide data-backed life expectancy baselines, which we adjust according to your personal inputs.
                </p>
                
                <div className="bg-primary/5 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold mb-4">For example:</h3>
                  <ul className="space-y-3 list-none">
                    <li className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <span><strong>Heavy smoking</strong> = –7 years</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <span><strong>Family history of diabetes</strong> = –2 years</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Regular exercise</strong> = +3 years</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Healthy diet</strong> = +2 years</span>
                    </li>
                  </ul>
                </div>
                
                <p>
                  The baseline is typically set at 80 years for males and 84 years for females (based on developed country averages). Each of your inputs slightly adjusts this number to estimate your personalized life expectancy.
                </p>
                
                <p>
                  Our form is designed to be reassuring, transparent, and privacy-safe, clearly explaining why certain data points are needed — to give you a science-backed, responsible estimate rather than random guesses.
                </p>
                
                <p>
                  Following the EEAT principles (Experience, Expertise, Authoritativeness, and Trustworthiness), our methodology combines credible health data, simplified actuarial modeling, and a user-first approach to make complex insights easy to understand.
                </p>
                
                <p>
                  Whether you're searching for a life expectancy calculator near me, planning your wellness goals, or just curious about the impact of your habits — this tool gives you clarity and motivation to live your best life.
                </p>
                
                <p className="text-center pt-4 text-muted-foreground">
                  📧 Have questions or feedback? Reach out anytime at <a href="/contact" className="text-primary hover:underline">support@yourdomain.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LifeExpectancy;
