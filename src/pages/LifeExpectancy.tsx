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
} from '@/services/LongevityCalculationService';
import { CulturalHorizonTeaser } from '@/components/CulturalHorizonTeaser';
import { LongevityHeroCard } from '@/components/LongevityHeroCard';
import { LongevityCountdown } from '@/components/LongevityCountdown';
import { LongevityCoachChat } from '@/components/LongevityCoachChat';
import { LongevityScoreCard } from '@/components/LongevityScoreCard';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';

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

  const [optimizedForecast, setOptimizedForecast] = useState<number | null>(null);
  const [currentSimForecast, setCurrentSimForecast] = useState<number | null>(null);
  const [userSelectedHabits, setUserSelectedHabits] = useState<string[]>([]);
  const [userHabitFrequencies, setUserHabitFrequencies] = useState<Record<string, string>>({});

  const resultRef    = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const reportRef    = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Expectancy Calculator — How Long Will I Live? Death Clock & Lifespan Test"
        description="How long will I live? Our free life expectancy calculator uses WHO and CDC actuarial data across 15+ health factors to estimate your lifespan. More accurate than any death clock — see the years you can gain."
        keywords="how long will I live, life expectancy calculator, death clock, when will I die, lifespan calculator, longevity calculator, how many years do I have left, life expectancy test"
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
            <div className="mb-6 flex items-center gap-4 flex-wrap">
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
              userName={longevityResult.quizSnapshot.name}
            />
            <ReportErrorBoundary onReset={() => setPhase('result')}>
              <EnhancedLifeExpectancyReport
                result={longevityResult}
                userName={longevityResult.quizSnapshot.name}
                birthDate={birthDate}
                isPremium={isPremium}
                onUpgradeClick={() => navigate('/upgrade')}
                optimizedForecast={optimizedForecast ?? undefined}
                userSelectedHabits={userSelectedHabits}
                simulatorHabitFrequencies={userHabitFrequencies}
              />
            </ReportErrorBoundary>
          </section>
        )}

        {/* AI Longevity Coach */}
        {longevityResult && (
          <section className="max-w-3xl mx-auto mb-10 mt-8">
            <LongevityCoachChat
              result={longevityResult}
              userName={profile?.full_name}
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

        {/* Health Guide & World Records — only shown after quiz complete */}
        {longevityResult && (
          <>
            <section className="max-w-5xl mx-auto mb-10 px-4">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-foreground">🧬 Science-Backed Longevity Guide</h2>
                <p className="text-sm text-muted-foreground mt-1">Evidence-based recommendations tailored to your results.</p>
              </div>
              <HealthGuideSection result={longevityResult} />
            </section>
            <section id="longevity-records" className="max-w-5xl mx-auto mb-10 px-4">
              <WorldLongevityRecords />
            </section>
          </>
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
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            ⚠️ This calculator provides statistical projections based on WHO life tables and peer-reviewed research (UN World Population Prospects 2024). Results are for informational and motivational purposes only — not medical advice. Actual lifespan is influenced by many factors beyond any model's scope including disease, accidents, genetics, and environmental conditions. Consult a qualified healthcare professional for personalized medical guidance.
          </p>
        </div>
      </div>
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
