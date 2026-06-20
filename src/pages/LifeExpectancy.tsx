import { useState, useRef, Component, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { LifeExpectancyCalculator } from '@/components/LifeExpectancyCalculator';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { EnhancedLifeExpectancyReport } from '@/components/EnhancedLifeExpectancyReport';
import { HealthGuideSection } from '@/components/HealthGuideSection';
import { WorldLongevityRecords } from '@/components/WorldLongevityRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight, Heart, TrendingUp, Shield, Activity,
  CalendarIcon, ShieldCheck, AlertTriangle, RefreshCw, Sparkles,
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
  calculateLongevityScore,
} from '@/services/LongevityCalculationService';
import { useReactToPrint } from 'react-to-print';
import { CulturalHorizonTeaser } from '@/components/CulturalHorizonTeaser';
import { LongevityHeroCard } from '@/components/LongevityHeroCard';
import { LongevityCountdown } from '@/components/LongevityCountdown';
import { LongevityCoachChat } from '@/components/LongevityCoachChat';
import { LongevityScoreCard } from '@/components/LongevityScoreCard';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';
import PageTagline from '@/components/PageTagline';

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

// ── Page component ────────────────────────────────────────────────────────────
const LifeExpectancy = () => {
  const { birthDate, setBirthDate } = useBirthDate();
  const { isPremium, profile, user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('quiz');
  const [longevityResult, setLongevityResult] = useState<LongevityResult | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [userCount, setUserCount] = useState('2,400+');
  const [sharedResult, setSharedResult] = useState<{ forecast: number; age: number; remaining: number } | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count && count > 100) {
          const rounded = Math.floor(count / 100) * 100;
          setUserCount(`${rounded.toLocaleString()}+`);
        }
      });
  }, []);
  useEffect(() => {
    if (phase === 'result' && !isPremium && longevityResult) {
      const seen = localStorage.getItem('bornclock_paywall_seen');
      if (!seen) {
        const timer = setTimeout(() => {
          setShowPaywallModal(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, isPremium, longevityResult]);

  // Parse ?shared=1&forecast=X&age=Y&remaining=Z URL params to show shared result banner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shared') === '1') {
      const forecast = parseFloat(params.get('forecast') || '');
      const age = parseFloat(params.get('age') || '');
      const remaining = parseFloat(params.get('remaining') || '');
      if (!isNaN(forecast) && forecast > 0) {
        setSharedResult({ forecast, age: isNaN(age) ? 0 : age, remaining: isNaN(remaining) ? 0 : remaining });
      }
    }
  }, []);

  // Read URL params synchronously in useState initializers — avoids timing bug where useEffect fires after first render
  const [prefilledFor, setPrefilledFor] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('name') || null;
  });
  const [prefillDob] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('dob') || null;
  });
  const [prefillSex] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('sex') || null;
  });
  console.log('Prefill values on render:', { prefilledFor, prefillDob, prefillSex });

  // Apply DOB prefill to context state — always overwrite when URL param is present so navigating
  // from one family member to another gets the correct DOB (BirthDateContext persists across routes)
  useEffect(() => {
    if (prefillDob) {
      const parsed = new Date(`${prefillDob}T12:00:00`);
      if (!isNaN(parsed.getTime())) setBirthDate(parsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply sex prefill to localStorage quiz slot so LifeExpectancyCalculator picks it up
  useEffect(() => {
    if (!prefillSex) return;
    try {
      const existing = localStorage.getItem('bornclock_quiz_prefill');
      const prefill = existing ? JSON.parse(existing) : {};
      prefill.quiz = { ...(prefill.quiz ?? {}), gender: prefillSex };
      prefill.timestamp = Date.now();
      localStorage.setItem('bornclock_quiz_prefill', JSON.stringify(prefill));
    } catch { /* storage unavailable */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [optimizedForecast, setOptimizedForecast] = useState<number | null>(null);
  const [currentSimForecast, setCurrentSimForecast] = useState<number | null>(null);
  const [userSelectedHabits, setUserSelectedHabits] = useState<string[]>([]);
  const [userHabitFrequencies, setUserHabitFrequencies] = useState<Record<string, string>>({});

  const resultRef    = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const reportRef    = useRef<HTMLDivElement>(null);
  const blueprintRef = useRef<HTMLDivElement>(null);

  const handleDownloadBlueprint = useReactToPrint({
    contentRef: blueprintRef,
    documentTitle: 'Longevity Blueprint — BornClock',
    pageStyle: `
      @page {
        margin: 0;
        size: A4;
      }
      body {
        margin: 1.5cm;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
    `,
  });

  const resetAll = () => {
    setLongevityResult(null);
    setOptimizedForecast(null);
    setCurrentSimForecast(null);
    setPhase('quiz');
  };

  const handleRetakeQuiz = () => {
    if (longevityResult) {
      try {
        localStorage.setItem('bornclock_quiz_prefill', JSON.stringify({
          quiz: longevityResult.quizSnapshot,
          pillar1: longevityResult.pillar1Snapshot,
          pillar2: longevityResult.pillar2Snapshot,
          timestamp: Date.now(),
        }));
      } catch { /* storage unavailable */ }
    }
    resetAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    setBirthDate(newDate);
    resetAll();
  };

  const handleQuizComplete = (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => {
    const result = calculateLongevity(data.quiz, data.pillar1, data.pillar2, birthDate, []);
    setLongevityResult(result);
    setCurrentSimForecast(result.totalForecast);
    try {
      localStorage.setItem('bornclock_result_snapshot', JSON.stringify({
        healthAdjustment: result.healthAdjustment,
        geneticAdjustment: result.geneticAdjustment,
        epigeneticAdjustment: result.epigeneticAdjustment,
        communityBonus: result.communityBonus,
        currentAge: result.currentAge,
        gender: result.quizSnapshot.gender,
        country: result.quizSnapshot.country,
        totalForecast: result.totalForecast,
      }));
    } catch { /* storage unavailable */ }
    setPhase('result');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleQuizCompleteAndSkip = (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => {
    const result = calculateLongevity(data.quiz, data.pillar1, data.pillar2, birthDate, []);
    setLongevityResult(result);
    const simAge = result.totalForecast;
    setOptimizedForecast(simAge);
    setCurrentSimForecast(simAge);
    setPhase('report');
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleGenerateReport = () => {
    const simAge = currentSimForecast ?? longevityResult?.totalForecast ?? 0;
    setOptimizedForecast(simAge);
    setPhase('report');
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const getInputValue = () => birthDate ? birthDate.toISOString().split('T')[0] : '';

  // When launched from Family Dashboard, use the family member's name everywhere a name appears
  const displayName = prefilledFor || longevityResult?.quizSnapshot?.name || profile?.full_name || undefined;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy Calculator — How Long Will I Live? Death Clock & Lifespan Test"
        description="How long will I live? Our free life expectancy calculator uses WHO and CDC actuarial data across 15+ health factors to estimate your lifespan. More accurate than any death clock — see the years you can gain."
        keywords="how long will I live, life expectancy calculator, death clock, when will I die, lifespan calculator, longevity calculator, how many years do I have left, life expectancy test"
        canonicalUrl="/life-expectancy"
      />
      {/* Shared result banner — shown when page opened via shared countdown URL */}
      {sharedResult && (
        <div className="bg-indigo-600 text-white text-center py-3 px-4">
          <p className="text-sm font-semibold">
            Someone shared their BornClock forecast with you!
            {sharedResult.age > 0 && ` They are ${sharedResult.age} years old`}
            {sharedResult.forecast > 0 && ` with a ${sharedResult.forecast}-year life expectancy forecast.`}
            {' '}
            <a href="/life-expectancy" className="underline font-bold ml-1">Calculate yours →</a>
          </p>
        </div>
      )}
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
            <PageTagline />
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
            {/* Pre-filled from family dashboard banner */}
            {prefilledFor && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="text-xl">👨‍👩‍👧</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-indigo-800">
                    Calculating forecast for {prefilledFor}
                  </p>
                  <p className="text-xs text-indigo-500 mt-0.5">
                    Date of birth and sex pre-filled from Family Dashboard. You can edit any field.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPrefilledFor(null);
                    window.history.replaceState({}, '', '/life-expectancy');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-600 underline flex-shrink-0"
                >
                  Clear
                </button>
              </div>
            )}
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
              onComplete={handleQuizComplete}
              onCompleteSkip={handleQuizCompleteAndSkip}
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
                <p className="text-sm text-gray-500 text-center mt-2">
                  Calculated by {userCount} people worldwide
                </p>
                {longevityResult.isConditionalBaseline && (
                  <p className="text-xs text-muted-foreground">
                    ℹ️ Age-adjusted baseline — your survival to age {longevityResult.totalForecast} is factored into this forecast
                  </p>
                )}
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Built from <strong className="text-foreground">{longevityResult.factorBreakdown.length} personal factors</strong>
                  {Object.values(longevityResult.pillar1Snapshot).filter(m => !m.dontKnow && m.age > 0 && m.isLiving !== null).length > 0 && (
                    <> including <strong className="text-foreground">{Object.values(longevityResult.pillar1Snapshot).filter(m => !m.dontKnow && m.age > 0 && m.isLiving !== null).length} family members</strong></>
                  )} — using WHO 2023 baselines and peer-reviewed health research.
                  The simulator below shows you what's possible.
                </p>
              </div>

              <LongevityCountdown
                forecast={longevityResult.totalForecast}
                currentAge={longevityResult.currentAge}
                birthDate={birthDate ?? undefined}
              />

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
                      <span className="text-muted-foreground">🌱 Epigenetic habits bonus</span>
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
                  <p className="text-[10px] text-muted-foreground italic border-t pt-2">
                    📊 Baseline: {longevityResult.baselineSource}
                  </p>
                </CardContent>
              </Card>

              {longevityResult.minimumApplied && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left space-y-3 max-w-2xl mx-auto">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">📋 About Your Forecast</p>
                  <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                    Your health inputs reflect significant challenges. However, actuarial science recognises that having survived to age {longevityResult.currentAge} is itself evidence of biological resilience — what actuaries call the <em>survivor selection effect</em>.
                  </p>
                  <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                    Your forecast has been adjusted to <strong>{longevityResult.totalForecast}</strong> years, applying a <strong>{longevityResult.survivalBuffer}-year</strong> survival credit based on UN life table data for your age group. This is consistent with how the WHO, insurance actuaries, and the Social Security Administration calculate remaining life expectancy.
                  </p>
                  <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                    The What-If Simulator below shows exactly which lifestyle changes would have the highest impact from here.
                  </p>
                  <a href="/blog/conditional-life-expectancy" className="inline-flex items-center text-sm text-amber-700 dark:text-amber-400 font-semibold hover:underline">
                    Learn about survivor selection effect →
                  </a>
                </div>
              )}

              {longevityResult.totalForecast > 100 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-left space-y-3 max-w-2xl mx-auto">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">🌟 Your projection exceeds 100 years</p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    This places you in the company of the world's centenarians — only approximately <strong>0.02%</strong> of the global population reaches this age today. This projection reflects your exceptional genetic heritage and lifestyle inputs. Achieving it would require maintaining these factors consistently throughout your life.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Life is dynamic and unpredictable — environmental factors, diseases, and events outside any model's scope all play a role. This is a mathematical projection based on WHO data and peer-reviewed research, designed to motivate you toward your maximum healthy potential.
                  </p>
                  <a href="#longevity-records" className="inline-flex items-center text-sm text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
                    → Meet people who reached 100+ in our Longevity Records
                  </a>
                </div>
              )}

              {longevityResult.totalForecast < 50 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-left space-y-3 max-w-2xl mx-auto">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">⚠️ Your projection is below average</p>
                  <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                    This may reflect extreme or combined health risk factors in your inputs. Please review your answers to ensure they are accurate.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If accurate, this calculator strongly encourages prioritizing medical consultation. The What-If Simulator below shows exactly which lifestyle changes would have the highest impact on improving your outlook — even small, consistent changes compound significantly over time.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Visual connector ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <div className="flex flex-col items-center py-4">
            <div className="w-0.5 h-8 bg-gradient-to-b from-gray-200 to-indigo-300"/>
            <p className="text-xs text-gray-400 italic text-center mt-2 px-4">
              Based on your {longevityResult.totalForecast}-year forecast, here's how your habits score
            </p>
            <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-300 to-gray-200 mt-2"/>
          </div>
        )}

        {/* ── Longevity Score Card ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <section className="max-w-3xl mx-auto mb-8">
            <LongevityScoreCard
              result={longevityResult}
              userId={user?.id}
              isPremium={isPremium}
              onRetake={handleRetakeQuiz}
            />
          </section>
        )}

        {/* ── Phase 3: What-If Simulator (auto-appears after result) ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <section className="max-w-6xl mx-auto mb-10" ref={simulatorRef} data-sim="true">
            <div className="mb-4 flex items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" /> What-If Simulator
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your forecast:{' '}
                  <strong className="text-primary text-lg">{longevityResult.totalForecast} years</strong>
                  {' · '}{longevityResult.currentAge} yrs old{' · '}
                  {longevityResult.yearsRemaining} years remaining
                </p>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
              <p className="text-sm text-indigo-800 leading-relaxed">
                <strong>See what's possible.</strong> Research shows 70-75% of your longevity outcome is
                controlled by lifestyle — not genetics. Move any slider below to see exactly how specific
                habit changes could add years to your life.
              </p>
              <p className="text-xs text-indigo-500 mt-1">
                Source: Karolinska Institute twin study, Science journal, 2017
              </p>
            </div>
            <ReportErrorBoundary onReset={resetAll}>
              <WhatIfSimulator
                result={longevityResult}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                onSimChange={setCurrentSimForecast}
                onHabitsChange={(habits, freqs) => { setUserSelectedHabits(habits); setUserHabitFrequencies(freqs); }}
              />
            </ReportErrorBoundary>

          </section>
        )}

        {/* ── World Longevity Facts — shown after simulator ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <section id="longevity-records" className="max-w-5xl mx-auto mb-10 px-4">
            <WorldLongevityRecords />
          </section>
        )}

        {/* ── Cultural Horizon Teaser (phase result only) ── */}
        {phase === 'result' && longevityResult && (
          <section className="max-w-6xl mx-auto mb-10">
            <CulturalHorizonTeaser
              currentForecast={longevityResult.totalForecast}
              optimizedForecast={currentSimForecast ?? longevityResult.totalForecast}
              currentAge={longevityResult.currentAge}
              userCountry={profile?.country ?? null}
              onGenerateReport={handleGenerateReport}
            />
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
            <LongevityHeroCard
              result={longevityResult}
              optimizedForecast={optimizedForecast}
              userName={displayName}
              onExportPDF={handleDownloadBlueprint}
            />
            <ReportErrorBoundary onReset={() => setPhase('result')}>
              <EnhancedLifeExpectancyReport
                result={longevityResult}
                userName={displayName}
                birthDate={birthDate}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                optimizedForecast={optimizedForecast ?? undefined}
                userSelectedHabits={userSelectedHabits}
                simulatorHabitFrequencies={userHabitFrequencies}
                onExportPDF={handleDownloadBlueprint}
              />
            </ReportErrorBoundary>
          </section>
        )}

        {/* AI Longevity Coach */}
        {longevityResult && (
          <section className="max-w-3xl mx-auto mb-10 mt-8">
            <LongevityCoachChat
              result={longevityResult}
              userName={displayName}
              isPremium={isPremium}
            />
          </section>
        )}

        {/* Explore More Tools */}
        {longevityResult && (
          <section className="max-w-4xl mx-auto mb-10 px-4">
            <h2 className="text-xl font-bold mb-4">Explore More BornClock Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/country-comparison')}>
                <CardContent className="p-5 space-y-2">
                  <div className="text-2xl">🌍</div>
                  <h3 className="font-bold text-sm">Country Comparison</h3>
                  <p className="text-xs text-muted-foreground">See how your forecast compares across 57 countries</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/biological-age')}>
                <CardContent className="p-5 space-y-2">
                  <div className="text-2xl">🔬</div>
                  <h3 className="font-bold text-sm">Biological Age Test</h3>
                  <p className="text-xs text-muted-foreground">Discover if your body is younger than your years</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/birthday-report')}>
                <CardContent className="p-5 space-y-2">
                  <div className="text-2xl">📄</div>
                  <h3 className="font-bold text-sm">Birthday PDF Report</h3>
                  <p className="text-xs text-muted-foreground">Download your personalised 8-page birthday report</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Health Guide — only shown after quiz complete */}
        {longevityResult && (
          <section className="max-w-5xl mx-auto mb-10 px-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">🧬 Science-Backed Longevity Guide</h2>
              <p className="text-sm text-muted-foreground mt-1">Evidence-based recommendations tailored to your results.</p>
            </div>
            <HealthGuideSection result={longevityResult} />
          </section>
        )}

        <PageFAQ slug="life-expectancy" title="Life Expectancy Calculator FAQs" />
        <RelatedTools currentSlug="life" />
        <AuthorBio />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            ⚠️ This calculator provides statistical projections based on WHO life tables and peer-reviewed research (UN World Population Prospects 2024). Results are for informational and motivational purposes only — not medical advice. Actual lifespan is influenced by many factors beyond any model's scope including disease, accidents, genetics, and environmental conditions. Consult a qualified healthcare professional for personalized medical guidance.
          </p>
        </div>
      </div>

      {/* ── Off-screen blueprint for react-to-print — always in DOM when result exists ── */}
      {longevityResult && (() => {
        const r = longevityResult;
        const bpName = displayName || 'You';
        const bpScore = calculateLongevityScore(r);
        const topOpportunities = [...r.factorBreakdown]
          .filter(f => f.potentialGain > 0)
          .sort((a, b) => b.potentialGain - a.potentialGain)
          .slice(0, 3);

        return (
          <div
            ref={blueprintRef}
            className="blueprint-print-source"
          >
            {/* COVER */}
            <div style={{ textAlign: 'center', paddingBottom: '32px', marginBottom: '32px', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1f2937', marginBottom: '4px' }}>BornClock</div>
              <div style={{ fontSize: '16px', color: '#6366f1', fontStyle: 'italic', marginBottom: '20px' }}>Know your time. Live it well.</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>Personal Longevity Blueprint</div>
              <div style={{ fontSize: '18px', color: '#4f46e5', fontWeight: 600, marginBottom: '8px' }}>Prepared for {bpName}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · bornclock.com
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px', fontStyle: 'italic' }}>
                Statistical estimate for informational purposes only · Not medical advice
              </div>
            </div>

            {/* SECTION 1: FORECAST SUMMARY */}
            <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#374151', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
                1 · Forecast Summary
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                {([
                  { label: 'Life Expectancy', value: `${r.totalForecast} yrs`, color: '#4f46e5' },
                  { label: 'Current Age', value: `${r.currentAge} yrs`, color: '#374151' },
                  { label: 'Years Remaining', value: `${r.yearsRemaining} yrs`, color: '#059669' },
                  { label: 'Longevity Score', value: `${bpScore}/100`, color: '#f59e0b' },
                ] as const).map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center', background: 'white', borderRadius: '6px', padding: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>{label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: HOW WE BUILT YOUR NUMBER */}
            <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#374151', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
                2 · How We Built Your Number
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {([
                    { label: `WHO Baseline (${r.quizSnapshot.gender || 'male'}, ${r.quizSnapshot.country || 'Global'})`, value: r.baselineLifeExpectancy, prefix: false, color: '#374151', bold: false },
                    { label: 'Health & Lifestyle Adjustment', value: r.healthAdjustment, prefix: true, color: r.healthAdjustment >= 0 ? '#059669' : '#dc2626', bold: false },
                    { label: `Genetic Adjustment (${r.geneticVitalityScore})`, value: r.geneticAdjustment, prefix: true, color: r.geneticAdjustment >= 0 ? '#059669' : '#dc2626', bold: false },
                    { label: 'Epigenetic Habits Bonus', value: r.epigeneticAdjustment, prefix: true, color: '#059669', bold: false },
                    { label: 'Community / Social Bonus', value: r.communityBonus, prefix: true, color: '#059669', bold: false },
                    { label: 'Total Forecast', value: r.totalForecast, prefix: false, color: '#4f46e5', bold: true },
                  ] as const).map(({ label, value, prefix, color, bold }, i) => (
                    <tr key={label} style={{ borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none', borderTop: bold ? '2px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '8px 0', fontSize: '13px', color: bold ? '#1f2937' : '#4b5563', fontWeight: bold ? 700 : 400 }}>{label}</td>
                      <td style={{ padding: '8px 0', fontSize: bold ? '16px' : '13px', fontWeight: 700, color, textAlign: 'right' }}>
                        {prefix && value >= 0 ? '+' : ''}{value} yrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECTION 3: TOP IMPROVEMENT OPPORTUNITIES */}
            <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#374151', margin: '0 0 12px 0', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
                3 · Top Improvement Opportunities
              </h2>
              {topOpportunities.map((f) => (
                <div key={f.factor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>{f.emoji} {f.factor}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Currently: {f.currentValueLabel} · Target: {f.optimalValueLabel}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', marginTop: '2px' }}>{f.source}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669', marginLeft: '16px', whiteSpace: 'nowrap' }}>
                    +{f.potentialGain} yrs
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 4: 90-DAY ACTION PLAN */}
            <div style={{ marginBottom: '24px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#374151', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #bbf7d0' }}>
                4 · 90-Day Action Plan
              </h2>
              {([
                { period: 'Week 1–2', action: 'Begin daily 30-minute walks. Research: each additional 15 min/day of moderate exercise adds approximately 3 years of life expectancy (WHO, 2022).' },
                { period: 'Week 3–4', action: 'Set a consistent 7–8 hour sleep schedule. Short sleep (under 6 hrs) is associated with 12% higher all-cause mortality (Liu et al., Sleep Health, 2021).' },
                { period: 'Month 2', action: 'Add 10 minutes daily mindfulness or breathing practice. Stress management directly reduces cortisol-driven epigenetic aging.' },
                { period: 'Month 3', action: 'Schedule a preventive health check: blood pressure, blood glucose, and BMI review. Early detection is the highest-ROI health intervention available.' },
              ] as const).map(({ period, action }) => (
                <div key={period} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#059669', color: 'white', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {period}
                  </div>
                  <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>{action}</div>
                </div>
              ))}
            </div>

            {/* SECTION 5: SCIENTIFIC CONTEXT */}
            <div style={{ marginBottom: '24px', padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#374151', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #bfdbfe' }}>
                5 · Scientific Context
              </h2>
              {([
                { source: 'WHO Life Tables (2023)', text: 'Country- and gender-specific life expectancy baselines used as the foundation of your forecast.' },
                { source: 'Physical Activity (WHO, 2022)', text: '150–300 min/week of moderate exercise reduces all-cause mortality by 31%. Each additional 15 min/day adds ~3 years.' },
                { source: 'Harvard Study of Adult Development (85 yrs)', text: 'Quality social relationships are the strongest single predictor of healthy ageing — stronger than cholesterol, income, or IQ.' },
                { source: 'Genetic Heritability (Karolinska Institute, 2018)', text: 'Family history contributes only 25–30% of longevity variance. 70–75% is determined by lifestyle and environment.' },
                { source: 'Epigenetic Research (NIH, Horvath 2013)', text: 'Lifestyle behaviours directly alter DNA methylation patterns. Diet, exercise, and stress management can reverse biological ageing by 3–5 years.' },
                { source: 'Blue Zones Research (Buettner, 2023)', text: 'The Power 9 lifestyle principles shared by centenarian populations are associated with 10+ additional healthy years versus global average.' },
              ] as const).map(({ source, text }) => (
                <div key={source} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>{source}</div>
                  <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{text}</div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div style={{ textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#1f2937', marginBottom: '4px' }}>BornClock</div>
              <div style={{ fontSize: '13px', color: '#6366f1', fontStyle: 'italic', marginBottom: '8px' }}>Know your time. Live it well.</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>bornclock.com · Evidence-based longevity analysis · WHO, NIH, Harvard Medical School data</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.5 }}>
                This report is a statistical estimate for informational and motivational purposes only. Not a medical diagnosis or substitute for professional medical advice.
                Always consult a qualified healthcare professional. © {new Date().getFullYear()} BornClock
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />

      {showPaywallModal && longevityResult && (
        <PaywallModal
          forecast={longevityResult.totalForecast}
          remainingYears={Math.max(0,
            Math.round((longevityResult.totalForecast - longevityResult.currentAge) * 10) / 10
          )}
          onClose={() => {
            setShowPaywallModal(false);
            localStorage.setItem('bornclock_paywall_seen', 'true');
          }}
        />
      )}
    </div>
  );
};

export default LifeExpectancy;
