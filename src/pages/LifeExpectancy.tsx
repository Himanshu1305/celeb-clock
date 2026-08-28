import { useState, useRef, Component, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { DobInput, toISODate } from '@/components/DobInput';
import { Footer } from '@/components/Footer';
import { LifeExpectancyCalculator } from '@/components/LifeExpectancyCalculator';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { EnhancedLifeExpectancyReport } from '@/components/EnhancedLifeExpectancyReport';
import { WorldLongevityRecords } from '@/components/WorldLongevityRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight, Heart, TrendingUp, Shield, Activity,
  CalendarIcon, ShieldCheck, AlertTriangle, RefreshCw, Sparkles,
  Download, Copy,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, WebApplicationSchema, FAQSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';
import { useAuth } from '@/hooks/useAuth';
import {
  calculateLongevity, LongevityResult,
  HealthQuizData, Pillar1Data, Pillar2Data,
  calculateLongevityScore,
  EPIGENETIC_HABITS,
  DEFAULT_PILLAR1, DEFAULT_PILLAR2,
} from '@/services/LongevityCalculationService';

import { CulturalHorizonTeaser } from '@/components/CulturalHorizonTeaser';
import { LongevityHeroCard } from '@/components/LongevityHeroCard';
import { LongevityCountdown } from '@/components/LongevityCountdown';
import { LongevityCoachChat } from '@/components/LongevityCoachChat';
import { LongevityScoreCard } from '@/components/LongevityScoreCard';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';
import PageTagline from '@/components/PageTagline';
import { buildActionPlanPhases } from '@/utils/actionPlanBuilder';
import { buildLongevityBlueprintHtml } from './longevityBlueprintHtml';

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
  const [rawDateInput, setRawDateInput] = useState('');
  const [userCount, setUserCount] = useState('2,400+');
  const [sharedResult, setSharedResult] = useState<{ forecast: number; age: number; remaining: number } | null>(null);
  const [summaryCopied, setSummaryCopied] = useState(false);

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
    if ((phase === 'result' || phase === 'report') && !isPremium && longevityResult) {
      // Show paywall modal every time a free user completes the quiz — no suppression
      const timer = setTimeout(() => {
        setShowPaywallModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, isPremium, longevityResult]);

  // Test hook: expose the pure blueprint-HTML builder + calculators so the
  // headless print harness (scripts/verify-longevity-print.mjs) can render the
  // exact PDF markup from a real LongevityResult without driving the quiz/auth.
  // Harmless in prod — pure functions already in the bundle; mirrors the
  // existing window.__LAST_PDF_HTML__ convention.
  useEffect(() => {
    (window as any).__longevityTest = {
      buildLongevityBlueprintHtml,
      calculateLongevity,
      DEFAULT_PILLAR1,
      DEFAULT_PILLAR2,
    };
  }, []);

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

  const handleCopyLongevitySummary = () => {
    if (!longevityResult) return;
    const displayed = optimizedForecast ?? longevityResult.totalForecast;
    const curRem = Math.max(0, Math.round((longevityResult.totalForecast - longevityResult.currentAge) * 10) / 10);
    const optRem = Math.max(0, Math.round((displayed - longevityResult.currentAge) * 10) / 10);
    const gain = Math.round((displayed - longevityResult.totalForecast) * 10) / 10;
    const country = longevityResult.quizSnapshot.country ?? 'Global';
    const lines = [
      'My Longevity Forecast (via BornClock):',
      `- Current Lifestyle: ${longevityResult.totalForecast} years (${curRem} yrs remaining)`,
      `- With Optimized Habits: ${displayed} years (${optRem} yrs remaining)`,
      ...(gain > 0 ? [`- Potential Gain: +${gain} years`] : []),
      `- Current Age: ${longevityResult.currentAge} | Country: ${country}`,
      '- Powered by UN WHO life tables',
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 2000);
    });
  };

  const handleDownloadBlueprint = (personName?: string) => {
    if (!isPremium) {
      navigate('/upgrade');
      return;
    }
    if (!longevityResult) {
      alert('Please complete the quiz first to generate your blueprint.');
      return;
    }

    try {
    const html = buildLongevityBlueprintHtml(longevityResult, {
      personName,
      profileName: profile?.full_name,
      userSelectedHabits,
    });

    (window as any).__LAST_PDF_HTML__ = html;
    const iframe = document.createElement('iframe');
    // Give the print iframe REAL A4 dimensions (not 1px×1px). Desktop Chromium
    // re-lays-out at @page size regardless, but mobile browsers (iOS Safari /
    // Chrome Android) lay the iframe content out at the iframe's own viewport
    // BEFORE printing — a 1px-wide iframe forces every block to wrap to a 1px
    // column, exploding content height into many broken/near-blank pages (the
    // founder's "many blank pages on mobile"). A full-A4 off-screen iframe lays
    // out correctly on every device.
    iframe.style.cssText = 'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;opacity:0;border:none;pointer-events:none;';
    document.body.appendChild(iframe);

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        console.error('BornClock: Could not access iframe document');
        document.body.removeChild(iframe);
        return;
      }
      doc.open('text/html', 'replace');
      doc.write(html);
      doc.close();

      const printAndCleanup = () => {
        try { iframe.contentWindow?.print(); } catch (e) { console.error('Print failed:', e); }
        setTimeout(() => {
          try { if (document.body.contains(iframe)) document.body.removeChild(iframe); } catch {}
        }, 5000);
      };

      // Single trigger only — onload fires reliably once content is written
      // No backup setTimeout to avoid triggering print dialog twice
      iframe.onload = () => {
        // Small delay to ensure fonts and styles are applied before printing
        setTimeout(printAndCleanup, 800);
      };
    } catch (e) {
      console.error('BornClock blueprint error:', e);
      try { document.body.removeChild(iframe); } catch {}
    }
    } catch (err) {
      console.error('Blueprint export failed:', err);
      alert('Export failed — please retry.');
    }
  };


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
    const val = e.target.value;
    // Always update rawDateInput so the browser picker keeps the partial selection visible
    setRawDateInput(val);
    // Only call setBirthDate (which renders the quiz) when we have a complete valid date
    if (!val || val.length < 10 || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return;
    }
    const newDate = new Date(val + 'T12:00:00');
    if (isNaN(newDate.getTime()) || newDate > new Date()) {
      return;
    }
    setBirthDate(newDate);
    resetAll();
  };

  const handleQuizComplete = (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => {
    const result = calculateLongevity(data.quiz, data.pillar1, data.pillar2, birthDate, []);
    setLongevityResult(result);
    setCurrentSimForecast(result.totalForecast);
    try {
      localStorage.setItem('bornclock_result_snapshot', JSON.stringify({
        totalForecast: result.totalForecast,
        currentAge: result.currentAge,
        longevityScore: calculateLongevityScore(result),
        timestamp: Date.now(),
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
    if (!isPremium) {
      navigate('/upgrade');
      return;
    }
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
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Life Expectancy Calculator"
        description="Free life expectancy calculator using WHO and CDC data across 15+ health factors to estimate your lifespan and the years you can gain."
        url="/life-expectancy"
      />
      <FAQSchema items={[
        { question: 'How is life expectancy calculated?', answer: 'A base life expectancy for your age, sex and country (from WHO/GBD actuarial data) is adjusted up or down by lifestyle and health factors — smoking, exercise, diet, sleep, BMI, stress and more — each weighted by published research.' },
        { question: 'Is the life expectancy calculator accurate?', answer: 'It is an evidence-based estimate, not a prediction. It reflects population-level associations from large studies; individual outcomes vary. Use it to see which habits move your estimate most, not as a medical forecast.' },
        { question: 'Is my health data stored?', answer: 'No. All inputs are processed entirely in your browser and are never sent to or stored on a server.' },
        { question: 'Can I really add years to my life?', answer: 'The evidence is strong that not smoking, regular activity, good sleep, a healthy diet and managing stress are associated with longer life. The calculator shows the estimated years linked to each change so you can see the biggest levers.' },
      ]} />
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
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Required</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">Your date of birth is required to calculate your personalised life expectancy forecast.</p>
                    <DobInput label="" onValidChange={d => { setRawDateInput(d ? toISODate(d) : ''); if (d) setBirthDate(d); }} />
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
                    <Button variant="ghost" size="sm" onClick={() => { setBirthDate(null); setRawDateInput(''); resetAll(); }}>Change</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {birthDate ? (
              <LifeExpectancyCalculator
                birthDate={birthDate}
                onComplete={handleQuizComplete}
                onCompleteSkip={isPremium ? handleQuizCompleteAndSkip : undefined}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm font-medium">👆 Enter your date of birth above to begin</p>
              </div>
            )}
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
          <div className="flex items-center gap-3 max-w-sm mx-auto py-4 mb-4 px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-indigo-200"/>
            <p className="text-xs text-indigo-400 font-semibold text-center whitespace-nowrap">
              📊 Your habit score
            </p>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-indigo-200"/>
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
              isPremium={isPremium}
            />
          </section>
        )}

        {/* ── Phase 4: Full Three Pillar Report ── */}
        {phase === 'report' && longevityResult && isPremium && (
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
                onDownloadBlueprint={() => handleDownloadBlueprint()}
              />
            </ReportErrorBoundary>
            <div className="no-print flex flex-col items-center gap-3 pt-6 pb-2">
              {isPremium ? (
                <>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button size="sm" variant="default" className="gap-2" onClick={() => handleDownloadBlueprint()}>
                      <Download className="w-3.5 h-3.5" />
                      Export Longevity Blueprint
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleCopyLongevitySummary}>
                      {summaryCopied ? '✅ Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy Summary</>}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 text-center">
                    💡 In print dialog: set Headers &amp; Footers to OFF for a clean PDF without page URLs
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground/70 text-center">
                  🔒 Export Longevity Blueprint and Copy Summary are premium features.{' '}
                  <a href="/upgrade" className="text-primary underline font-semibold">Upgrade →</a>
                </p>
              )}
            </div>
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

        {/* ── 90-Day Action Plan ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (() => {
          const phases = buildActionPlanPhases(
            longevityResult.quizSnapshot,
            longevityResult.factorBreakdown || []
          );
          const top3GainRaw = [...(longevityResult.factorBreakdown || [])]
            .filter(f => f.potentialGain > 0)
            .sort((a, b) => b.potentialGain - a.potentialGain)
            .slice(0, 3)
            .reduce((sum, f) => sum + f.potentialGain, 0);
          const realisticGain = Math.min(top3GainRaw * 0.5, 8).toFixed(1);
          const top1Factor = [...(longevityResult.factorBreakdown || [])]
            .filter(f => f.potentialGain > 0)
            .sort((a, b) => b.potentialGain - a.potentialGain)[0]?.factor || 'lifestyle improvement';

          return (
            <section className="max-w-4xl mx-auto mb-10" data-testid="action-plan-section">
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Your Personalised 90-Day Plan</h2>
                    <p className="text-sm text-gray-500">Based on your quiz answers — not a generic plan</p>
                  </div>
                  {!isPremium && (
                    <span className="ml-auto bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full border border-amber-200">
                      🔒 Premium
                    </span>
                  )}
                </div>

                {/* Top opportunity teaser — always visible */}
                <div className="bg-white rounded-xl p-4 border border-green-200 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Your <strong>#1 opportunity</strong> is{' '}
                    <strong className="text-indigo-600">{top1Factor}</strong>.
                    {' '}Addressing your top 3 factors could add up to{' '}
                    <strong
                      className="text-green-600"
                      style={!isPremium ? { filter: 'blur(5px)', userSelect: 'none' } : {}}
                    >
                      +{realisticGain} realistic years
                    </strong>{' '}
                    to your forecast.
                    {!isPremium && (
                      <span className="text-xs text-gray-400 ml-1">(unlock to see)</span>
                    )}
                  </p>
                </div>

                {isPremium ? (
                  /* ── PREMIUM: Full plan ── */
                  <>
                    <div className="space-y-4">
                      {phases.map((planPhase, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-green-100 overflow-hidden">
                          <div className={`px-4 py-2.5 ${idx < 2 ? 'bg-indigo-600' : 'bg-green-600'}`}>
                            <h4 className="text-sm font-bold text-white">
                              {planPhase.period} — {planPhase.title}
                            </h4>
                          </div>
                          <div className="p-4 space-y-2">
                            {planPhase.items.map((item, i) => (
                              <div key={i} className="flex gap-2.5 items-start">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                        <p className="text-xs text-gray-400 mb-1">Current Forecast</p>
                        <p className="text-xl font-black text-indigo-600">{longevityResult.totalForecast?.toFixed(1)} yrs</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                        <p className="text-xs text-gray-400 mb-1">Realistic Gain</p>
                        <p className="text-xl font-black text-green-600">+{realisticGain} yrs</p>
                        <p className="text-xs text-gray-400">if top factors improved</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                        <p className="text-xs text-gray-400 mb-1">Retake In</p>
                        <p className="text-xl font-black text-purple-600">90 days</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>⚠️ Important:</strong> This plan is for informational and motivational purposes only. It is not a substitute for personalised medical advice. Consult a qualified healthcare professional before making significant changes to your diet, exercise, or medications.
                      </p>
                    </div>
                  </>
                ) : (
                  /* ── FREE: Phase headers only, content locked ── */
                  <>
                    <div className="space-y-3">
                      {phases.map((planPhase, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-green-100 overflow-hidden">
                          {/* Phase header — always visible */}
                          <div className={`px-4 py-2.5 ${idx < 2 ? 'bg-indigo-600' : 'bg-green-600'}`}>
                            <h4 className="text-sm font-bold text-white">
                              {planPhase.period} — {planPhase.title}
                            </h4>
                          </div>
                          {/* Content — blurred and locked */}
                          <div className="p-4 space-y-2 relative">
                            <div className="space-y-2 blur-sm select-none pointer-events-none">
                              {planPhase.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                                </div>
                              ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-b-xl">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                                <span>🔒</span>
                                <span>{planPhase.items.length} personalised actions — unlock to view</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upgrade CTA */}
                    <div className="mt-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-center text-white">
                      <p className="text-base font-black mb-1">Unlock Your Full 90-Day Plan</p>
                      <p className="text-xs opacity-80 mb-4">
                        Get personalised weekly actions across all 4 phases — specific to your health profile, not a generic plan.
                        Plus: AI Longevity Coach, Leaderboard, and Longevity Blueprint PDF.
                      </p>
                      <a
                        href="/upgrade"
                        className="inline-block bg-white text-indigo-700 font-black text-sm px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        Upgrade to Premium →
                      </a>
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })()}

        {/* ── Scientific Foundation (collapsible) ── */}
        {(phase === 'result' || phase === 'report') && longevityResult && (
          <section className="max-w-4xl mx-auto mb-10">
            <details className="rounded-2xl border border-indigo-200 bg-indigo-50 overflow-hidden">
              <summary className="flex items-center gap-3 p-5 cursor-pointer list-none select-none">
                <span className="text-xl">🔬</span>
                <div className="flex-1">
                  <h2 className="text-base font-black text-gray-900">Scientific Foundation</h2>
                  <p className="text-xs text-gray-500 mt-0.5">The research behind your forecast — click to expand</p>
                </div>
                <span className="text-gray-400 text-sm">▼</span>
              </summary>
              <div className="px-5 pb-5 space-y-4">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Methodology</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your forecast starts from the WHO Global Health Observatory life expectancy baseline for your country and gender. Eight lifestyle and health factors are applied using established risk ratios from peer-reviewed research. Epigenetic bonuses are drawn from Blue Zones and NIH epigenetic ageing studies. Genetic adjustment is calibrated against the Karolinska twin study (2018): genetics accounts for 25–30% of longevity variance; 70–75% is lifestyle-controlled.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">🌍 Blue Zones Power 9® — Principles of Centenarian Populations</h3>
                  <p className="text-xs text-gray-500 mb-3">Dan Buettner's research across five world regions where people routinely live past 100</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { emoji: '🚶', name: 'Move Naturally', desc: 'Daily movement woven into life' },
                      { emoji: '🎯', name: 'Purpose', desc: '"Ikigai" — reason to wake up' },
                      { emoji: '😌', name: 'Down Shift', desc: 'Daily stress-shedding routine' },
                      { emoji: '🌿', name: '80% Rule', desc: 'Stop eating at 80% full' },
                      { emoji: '🥦', name: 'Plant Slant', desc: 'Plants as dietary foundation' },
                      { emoji: '🍷', name: 'Wine @ 5', desc: 'Moderate alcohol with community' },
                      { emoji: '🙏', name: 'Belong', desc: 'Faith-based community (any)' },
                      { emoji: '👨‍👩‍👧', name: 'Loved Ones First', desc: 'Invest in family bonds' },
                      { emoji: '👥', name: 'Right Tribe', desc: 'Social circles that support health' },
                    ] as const).map(({ emoji, name, desc }) => (
                      <div key={name} className="bg-indigo-50 rounded-lg p-2 text-center">
                        <span className="text-lg block mb-1">{emoji}</span>
                        <p className="text-[10px] font-bold text-gray-800">{name}</p>
                        <p className="text-[10px] text-gray-500">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Key Research Citations</h3>
                  <ul className="space-y-1.5">
                    {[
                      'WHO Global Health Observatory (2024) — Country-level life expectancy baselines',
                      'Karolinska Institute twin study (Science, 2018) — Genetics accounts for 25–30% of longevity variance',
                      'Harvard Study of Adult Development (85 yrs) — Social relationships as strongest predictor of healthy ageing',
                      'Horvath S., NIH (2013) — DNA methylation clock: lifestyle factors alter epigenetic ageing rate',
                      'Buettner D., Blue Zones (2023) — Power 9 lifestyle principles from centenarian populations',
                      'Liu Y. et al. (2021) — Short sleep (<6 hrs) associated with 12% higher all-cause mortality',
                      'WHO Physical Activity Guidelines (2022) — 15 min/day moderate activity adds ~3 years',
                    ].map(s => (
                      <li key={s} className="flex gap-2 text-xs text-gray-600">
                        <span className="text-indigo-400 flex-shrink-0">●</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
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


        {/* P8 — flagship content (always visible): answer-first, how it works, what it means */}
        <section className="max-w-2xl mx-auto px-4 py-8 space-y-6" data-testid="le-depth">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How long will I live?</h2>
            <p className="text-gray-700 leading-relaxed">
              No one can know for certain — but a life-expectancy estimate turns population data into a
              personalised figure. This calculator starts from your country and age using WHO life tables and
              UN World Population Prospects 2024 baselines, then adjusts up or down for the lifestyle and health
              factors you enter — sleep, exercise, stress, diet, BMI, smoking and more. It's a science-informed
              projection and a motivator, never a prediction of your actual lifespan.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              A <strong>life table</strong> is the demographer's core tool: for a given population it records the
              probability of surviving each year of age, and from that computes the average remaining years at
              birth — your baseline life expectancy. We take the WHO/UN baseline for your country and sex, then
              apply a <strong>factor model</strong> drawn from peer-reviewed cohort studies: each habit carries an
              evidence-based effect size (e.g. regular exercise, never smoking, good sleep add years; heavy
              smoking, obesity and chronic high stress subtract them). Your answers move the baseline within
              plausible bounds to produce your estimate.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">What your result does — and doesn't — mean</h2>
            <p className="text-gray-700 leading-relaxed">
              Your number is a <strong>statistical average for people like you</strong>, not a countdown. It can't
              see accidents, a specific diagnosis, your genetics beyond what you tell it, or medical care you
              receive — so treat it as a directional signal, most useful for the "what-if": watching how a habit
              you can change shifts the estimate. It is not a diagnosis or medical advice. If you have real health
              concerns, a qualified clinician who knows your history is the right guide.
            </p>
          </div>
        </section>

        <PageFAQ slug="life-expectancy" title="Life Expectancy Calculator FAQs" />
        <RelatedTools currentSlug="life" />
        {/* P1-H internal linking */}
        <section className="max-w-3xl mx-auto mb-12 px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { path: '/biological-age', label: 'Biological Age Test' },
              { path: '/country-comparison', label: 'Country Comparison' },
              { path: '/coach', label: 'Longevity Coach' },
              { path: '/life-expectancy-india', label: 'Life Expectancy in India' },
              { path: '/life-expectancy-usa', label: 'Life Expectancy in USA' },
              { path: '/life-expectancy-japan', label: 'Life Expectancy in Japan' },
              { path: '/how-it-works', label: 'How It Works' },
            ].map((t) => (
              <a key={t.path} href={t.path} className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground transition-colors">{t.label}</a>
            ))}
          </div>
        </section>
        <AuthorBio />
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
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
          }}
        />
      )}
    </div>
  );
};

export default LifeExpectancy;
