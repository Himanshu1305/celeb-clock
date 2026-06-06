import { useState, useRef, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { LifeExpectancyCalculator } from '@/components/LifeExpectancyCalculator';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { EnhancedLifeExpectancyReport } from '@/components/EnhancedLifeExpectancyReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight, Heart, TrendingUp, Shield, Activity,
  CalendarIcon, ShieldCheck, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';
import { useAuth } from '@/hooks/useAuth';
import {
  calculateLongevity, LongevityResult,
  HealthQuizData, Pillar1Data, Pillar2Data,
} from '@/services/LongevityCalculationService';
import {
  findInitialMatches, enhanceCelebrityMatches, CelebrityLongevityProfile,
} from '@/services/CelebrityLongevityService';

// ── ErrorBoundary ────────────────────────────────────────────────────────────
class ReportErrorBoundary extends Component<
  { children: React.ReactNode; onReset: () => void },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[LongevityReport] render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
          <p className="font-semibold text-destructive">Report failed to render.</p>
          <p className="text-xs text-muted-foreground font-mono">{(this.state.error as Error).message}</p>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => { this.setState({ error: null }); this.props.onReset(); }}>
            <RefreshCw className="w-3 h-3" /> Reset & Try Again
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

// ── Page component ────────────────────────────────────────────────────────────
const LifeExpectancy = () => {
  const { birthDate, setBirthDate } = useBirthDate();
  const { isPremium, profile } = useAuth();
  const navigate = useNavigate();

  const [longevityResult, setLongevityResult] = useState<LongevityResult | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [celebrityMatches, setCelebrityMatches] = useState<CelebrityLongevityProfile[]>([]);
  const [isLoadingCelebrities, setIsLoadingCelebrities] = useState(false);

  const simulatorRef = useRef<HTMLDivElement>(null);
  const reportRef    = useRef<HTMLDivElement>(null);

  const resetAll = () => {
    setLongevityResult(null);
    setShowSimulator(false);
    setShowReport(false);
    setCelebrityMatches([]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    setBirthDate(newDate);
    resetAll();
  };

  const handleQuizComplete = (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => {
    console.log('[LifeExpectancy] quiz complete:', data);
    const result = calculateLongevity(data.quiz, data.pillar1, data.pillar2);
    setLongevityResult(result);
    setShowSimulator(true);
    setShowReport(false);

    // Start celebrity fetch async without blocking UI
    setIsLoadingCelebrities(true);
    const initial = findInitialMatches(result.totalForecast);
    setCelebrityMatches(initial);
    enhanceCelebrityMatches(initial, result.totalForecast)
      .then(enhanced => setCelebrityMatches(enhanced))
      .finally(() => setIsLoadingCelebrities(false));

    setTimeout(() => {
      simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleGenerateReport = () => {
    setShowReport(true);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const getInputValue = () => birthDate ? birthDate.toISOString().split('T')[0] : '';

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Best Life Expectancy Calculator — How Long Will I Live? (Free)"
        description="The best free life expectancy calculator. Estimate your lifespan based on 15+ health and lifestyle factors using WHO and CDC actuarial data. See what years you can gain."
        keywords="best life expectancy calculator, how long will I live, lifespan calculator, life expectancy, longevity calculator"
        canonicalUrl="/life-expectancy"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <section className="text-center space-y-6 pt-8 pb-12 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text-primary leading-tight">
              Best Life Expectancy Calculator — How Long Will You Live?
            </h1>
            <EEATBadges sources={['WHO', 'CDC', 'NIH', 'The Lancet']} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Wondering how your daily habits and health choices impact your future? Our data-driven calculator estimates your lifespan across all three pillars: health, genetics, and epigenetics.
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
            <div className="max-w-2xl mx-auto space-y-3 pt-4">
              <Alert className="border-accent/30 bg-accent/5 text-left">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <AlertDescription className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Your privacy matters.</strong> All health data is processed in your browser only — we never store or transmit any personal or sensitive health information.
                </AlertDescription>
              </Alert>
              <Alert className="border-muted bg-muted/30 text-left">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <AlertDescription className="text-xs text-muted-foreground">
                  This calculator is for <strong>informational and entertainment purposes only</strong>. Results are not medical advice. Always consult a qualified healthcare professional.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* ── Phase 1: Health Quiz ── */}
        <section id="calculator" className="max-w-4xl mx-auto mb-16">
          {/* Birth date input/display */}
          {!birthDate ? (
            <Card className="glass-card mb-8 max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="birthdate-life" className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Enter Your Birth Date
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">Required to calculate your life expectancy</p>
                  <Input
                    id="birthdate-life"
                    type="date"
                    value={getInputValue()}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card mb-8 max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm">Birth Date: <strong>{birthDate.toLocaleDateString()}</strong></span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setBirthDate(null); resetAll(); }}>Change</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <LifeExpectancyCalculator
            birthDate={birthDate}
            celebrities={[]}
            onComplete={handleQuizComplete}
          />
        </section>

        {/* ── Phase 3: What-If Simulator ── */}
        {showSimulator && longevityResult && (
          <section className="max-w-6xl mx-auto mb-16" ref={simulatorRef}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" /> What-If Simulator
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your forecast: <strong className="text-primary text-lg">{longevityResult.totalForecast} years</strong> · Adjust sliders to simulate lifestyle changes
              </p>
            </div>
            <ReportErrorBoundary onReset={resetAll}>
              <WhatIfSimulator
                result={longevityResult}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                onGenerateReport={handleGenerateReport}
              />
            </ReportErrorBoundary>
          </section>
        )}

        {/* ── Phase 4: Full Three Pillar Report ── */}
        {showReport && longevityResult && (
          <section id="life-expectancy-report" className="max-w-6xl mx-auto mb-16" ref={reportRef}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                ✨ Your Full Longevity Blueprint
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete analysis across all three pillars of longevity
              </p>
            </div>
            <ReportErrorBoundary onReset={() => setShowReport(false)}>
              <EnhancedLifeExpectancyReport
                result={longevityResult}
                userName={longevityResult.quizSnapshot.name}
                birthDate={birthDate}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                celebrityMatches={celebrityMatches}
                isLoadingCelebrities={isLoadingCelebrities}
              />
            </ReportErrorBoundary>
          </section>
        )}

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-bold gradient-text-primary text-center mb-6">
                Understand Your Future — Backed by Science, Designed with Care
              </h2>
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Your future isn't just fate — it's shaped by your lifestyle, health, and choices. Our Life Expectancy Calculator empowers you to understand how your everyday habits may affect your longevity, using scientifically supported data across three evidence-based pillars.
                </p>
                <div className="bg-primary/5 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold mb-4">Three Pillars of Longevity:</h3>
                  <ul className="space-y-3 list-none">
                    <li className="flex items-start gap-3">
                      <span className="text-xl">🧬</span>
                      <span><strong>Biological Blueprint</strong> — Family genetics and hereditary factors (25–30% of lifespan)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">🏘️</span>
                      <span><strong>Community Anchor</strong> — Epigenetic habits and environmental factors (accounts for up to 70%)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">🌟</span>
                      <span><strong>Cultural Horizon</strong> — Real-world longevity benchmarks from inspiring figures</span>
                    </li>
                  </ul>
                </div>
                <p>
                  Following the EEAT principles (Experience, Expertise, Authoritativeness, and Trustworthiness), our methodology combines credible health data from WHO, CDC, NIH, and The Lancet with simplified actuarial modeling.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <PageFAQ slug="life-expectancy" title="Life Expectancy Calculator FAQs" />
        <RelatedTools currentSlug="life" />
        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default LifeExpectancy;
