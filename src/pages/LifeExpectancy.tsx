import { useState, useRef, Component } from 'react';
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
  CalendarIcon, ShieldCheck, AlertTriangle, RefreshCw, Sparkles, FileText,
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

type Phase = 'quiz' | 'result' | 'report';

interface CelebrityState {
  current: CelebrityLongevityProfile[];
  potential: CelebrityLongevityProfile[];
}

// ── Page component ────────────────────────────────────────────────────────────
const LifeExpectancy = () => {
  const { birthDate, setBirthDate } = useBirthDate();
  const { isPremium, profile } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('quiz');
  const [longevityResult, setLongevityResult] = useState<LongevityResult | null>(null);
  const [optimizedForecast, setOptimizedForecast] = useState<number | null>(null);
  const [currentSimForecast, setCurrentSimForecast] = useState<number | null>(null);

  const [celebrities, setCelebrities] = useState<CelebrityState>({ current: [], potential: [] });
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [isLoadingPotential, setIsLoadingPotential] = useState(false);

  const resultRef    = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const reportRef    = useRef<HTMLDivElement>(null);

  const resetAll = () => {
    setLongevityResult(null);
    setOptimizedForecast(null);
    setCurrentSimForecast(null);
    setPhase('quiz');
    setCelebrities({ current: [], potential: [] });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    setBirthDate(newDate);
    resetAll();
  };

  const handleQuizComplete = (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => {
    const result = calculateLongevity(data.quiz, data.pillar1, data.pillar2, birthDate);
    setLongevityResult(result);
    setCurrentSimForecast(result.totalForecast);
    setPhase('result');

    // Async celebrity fetch for current trajectory
    setIsLoadingCurrent(true);
    const initialCurrent = findInitialMatches(result.totalForecast);
    setCelebrities(prev => ({ ...prev, current: initialCurrent }));
    enhanceCelebrityMatches(initialCurrent, result.totalForecast)
      .then(enhanced => setCelebrities(prev => ({ ...prev, current: enhanced })))
      .finally(() => setIsLoadingCurrent(false));

    // Async celebrity fetch for maximum potential
    setIsLoadingPotential(true);
    const initialPotential = findInitialMatches(result.maximumPotential);
    setCelebrities(prev => ({ ...prev, potential: initialPotential }));
    enhanceCelebrityMatches(initialPotential, result.maximumPotential)
      .then(enhanced => setCelebrities(prev => ({ ...prev, potential: enhanced })))
      .finally(() => setIsLoadingPotential(false));

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleGenerateReport = () => {
    setOptimizedForecast(currentSimForecast);
    setPhase('report');
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
            {phase === 'quiz' && (
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
            )}
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
        {phase === 'quiz' && (
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
        )}

        {/* ── Phase 2: Result Reveal + Simulator (auto-shows below) ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <section className="max-w-4xl mx-auto mb-10" ref={resultRef}>
            <div className="text-center space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">🎯 Your Forecasted Age — Current Lifestyle</p>
                <div className="text-9xl font-black text-primary leading-none">{longevityResult.totalForecast}</div>
                <p className="text-2xl font-semibold text-muted-foreground">years</p>
                <p className="text-sm text-muted-foreground">
                  You are {longevityResult.currentAge} today · {longevityResult.yearsRemaining} years of life ahead
                </p>
              </div>

              {/* How we built your number */}
              <Card className="glass-card text-left max-w-2xl mx-auto">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-base text-foreground">How we built your number</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        WHO baseline ({longevityResult.quizSnapshot.gender || 'male'},{' '}
                        {longevityResult.quizSnapshot.country || 'Global average'})
                      </span>
                      <strong className="text-foreground tabular-nums">{longevityResult.baselineLifeExpectancy} yrs</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Health &amp; lifestyle adjustment</span>
                      <strong className={`tabular-nums ${longevityResult.healthAdjustment >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {longevityResult.healthAdjustment >= 0 ? '+' : ''}{longevityResult.healthAdjustment} yrs
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">🧬 Genetic adjustment <span className="text-[10px] opacity-60">({longevityResult.geneticVitalityScore})</span></span>
                      <strong className={`tabular-nums ${longevityResult.geneticAdjustment >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {longevityResult.geneticAdjustment >= 0 ? '+' : ''}{longevityResult.geneticAdjustment} yrs
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">🌱 Epigenetic habits bonus <span className="text-[10px] opacity-60">({longevityResult.blueZonesCount}/8 Blue Zones)</span></span>
                      <strong className="text-green-600 tabular-nums">+{longevityResult.epigeneticAdjustment} yrs</strong>
                    </div>
                    {longevityResult.communityBonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">🏘️ Community bonus</span>
                        <strong className="text-green-600 tabular-nums">+{longevityResult.communityBonus} yr</strong>
                      </div>
                    )}
                    <div className="border-t pt-2.5 flex justify-between items-center font-bold">
                      <span className="text-foreground">Total Forecast</span>
                      <strong className="text-primary text-lg tabular-nums">{longevityResult.totalForecast} yrs</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground border-t pt-2">
                    Baseline source: {longevityResult.baselineCitation}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ── Phase 3: What-If Simulator (auto-appears after result) ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <section className="max-w-6xl mx-auto mb-10" ref={simulatorRef}>
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" /> What-If Simulator
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your forecast: <strong className="text-primary text-lg">{longevityResult.totalForecast} years</strong>
                  {' · '}Maximum potential: <strong className="text-accent">{longevityResult.maximumPotential} years</strong>
                  {' · '}Gap to close: <strong className="text-foreground">{longevityResult.yearsGapToClose} years</strong>
                </p>
              </div>
            </div>
            <ReportErrorBoundary onReset={resetAll}>
              <WhatIfSimulator
                result={longevityResult}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                onSimChange={setCurrentSimForecast}
              />
            </ReportErrorBoundary>

            {/* Generate Full Longevity Blueprint button — lives here, not inside WhatIfSimulator */}
            {phase === 'result' && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Card className="w-full max-w-2xl border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left space-y-1">
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Your Longevity Summary</p>
                        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                          <div>
                            <span className="text-xs text-muted-foreground block">Current lifestyle</span>
                            <strong className="text-2xl font-black text-muted-foreground">{longevityResult.totalForecast} yrs</strong>
                          </div>
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <div>
                            <span className="text-xs text-primary font-semibold block">With optimized lifestyle</span>
                            <strong className="text-3xl font-black text-primary">{currentSimForecast ?? longevityResult.totalForecast} yrs</strong>
                          </div>
                        </div>
                        {currentSimForecast !== null && currentSimForecast > longevityResult.totalForecast && (
                          <p className="text-sm font-medium text-green-600">
                            ⚡ You could gain <span className="font-black">{Math.round((currentSimForecast - longevityResult.totalForecast) * 10) / 10} years</span> with these changes
                          </p>
                        )}
                      </div>
                      <Button
                        size="lg"
                        className="px-8 py-5 text-base font-bold gap-2 shrink-0 animate-glow"
                        onClick={handleGenerateReport}
                      >
                        <FileText className="w-5 h-5" />
                        Generate Full Longevity Blueprint ✨
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}

        {/* ── Phase 4: Full Three Pillar Report ── */}
        {phase === 'report' && longevityResult && (
          <section id="life-expectancy-report" className="max-w-6xl mx-auto mb-16" ref={reportRef}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" /> Your Full Longevity Blueprint
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete analysis across all three pillars of longevity
              </p>
            </div>
            <ReportErrorBoundary onReset={() => setPhase('result')}>
              <EnhancedLifeExpectancyReport
                result={longevityResult}
                userName={longevityResult.quizSnapshot.name}
                birthDate={birthDate}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                optimizedForecast={optimizedForecast ?? undefined}
                celebrityMatches={celebrities.current}
                isLoadingCelebrities={isLoadingCurrent}
                potentialCelebrityMatches={celebrities.potential}
                isLoadingPotentialCelebrities={isLoadingPotential}
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
