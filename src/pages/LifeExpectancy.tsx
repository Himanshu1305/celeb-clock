import { useState, useRef, Component, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
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
  EPIGENETIC_HABITS,
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
    const quiz = longevityResult.quizSnapshot;
    const name = personName || quiz?.name || profile?.full_name || 'You';
    const forecast = Number(longevityResult.totalForecast || 0).toFixed(1);
    const currentAge = Number(longevityResult.currentAge || 0);
    const remaining = Number(longevityResult.yearsRemaining || 0).toFixed(1);
    const score = calculateLongevityScore(longevityResult);
    const baseline = Number(longevityResult.baselineLifeExpectancy || 71).toFixed(1);
    const healthAdj = Number(longevityResult.healthAdjustment || 0).toFixed(1);
    const geneticAdj = Number(longevityResult.geneticAdjustment || 0).toFixed(1);
    const epiAdj = Number(longevityResult.epigeneticAdjustment || 0).toFixed(1);
    const commBonus = Number(longevityResult.communityBonus || 0).toFixed(1);
    const geneticLabel = longevityResult.geneticVitalityScore || 'Average';
    const geneticDesc = longevityResult.geneticVitalityLabel || '';
    const geneticCeiling = Math.round(Number(longevityResult.familyBaselineAge || 0) + 5);
    const generatedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // Score band
    const scoreBand = score >= 80
      ? { label: 'Excellent', color: '#22c55e', desc: `Your score of ${score}/100 places you in the top 20% for your age and lifestyle. Your daily habits are working powerfully in your favour.` }
      : score >= 65
      ? { label: 'On Track', color: '#3b82f6', desc: `Your score of ${score}/100 is above average. You have real, measurable gains available through targeted lifestyle improvements.` }
      : score >= 50
      ? { label: 'Average', color: '#f59e0b', desc: `Your score of ${score}/100 means several lifestyle factors are limiting your forecast. The good news: 70–75% of longevity is controlled by lifestyle, not genetics.` }
      : { label: 'Needs Attention', color: '#ef4444', desc: `Your score of ${score}/100 indicates multiple lifestyle factors are reducing your forecast significantly. Research shows lifestyle changes at any age produce measurable benefits.` };

    // SVG gauge arc — semicircle, score 0-100 maps to 0-180 degrees
    // SVG viewBox is 0 0 140 90. Background arc: center(70,80) radius 55, from M15,80 to 125,80
    // Score arc must use SAME center(70,80) and radius(55) to sit on the track correctly
    const gaugeAngle = (score / 100) * 180;
    const gaugeRad = (gaugeAngle - 90) * (Math.PI / 180);
    const gaugeX = (70 + 55 * Math.cos(gaugeRad)).toFixed(1);
    const gaugeY = (80 + 55 * Math.sin(gaugeRad)).toFixed(1);

    // Human-readable quiz answer labels
    const smokingMap: Record<string, string> = {
      never: 'Non-smoker ✓', quit_over5: 'Former smoker (quit 5+ yrs ago)', quit_under5: 'Former smoker (quit recently)',
      light: 'Light smoker (1–10/day)', moderate: 'Moderate smoker (10–20/day)', heavy: 'Heavy smoker (20+/day)', '': 'Not specified',
    };
    const exerciseMap: Record<string, string> = {
      seldom: 'Sedentary (rarely exercises)', light: 'Lightly active (1–2×/week)',
      moderate: 'Moderately active (3–4×/week)', heavy: 'Highly active (5+×/week)', '': 'Not specified',
    };
    const dietMap: Record<string, string> = {
      poor: 'Poor — mostly processed foods', average: 'Average — mixed diet',
      good: 'Good — mostly whole foods', excellent: 'Excellent — Mediterranean/plant-rich', '': 'Not specified',
    };
    const sleepMap: Record<string, string> = {
      under6: 'Short sleeper (under 6 hrs) ⚠', '6to7': 'Slightly short (6–7 hrs)',
      '7to9': 'Optimal sleep (7–9 hrs) ✓', over9: 'Oversleeper (9+ hrs)', '': 'Not specified',
    };
    const socialMap: Record<string, string> = {
      strong: 'Strong social connections ✓', moderate: 'Moderate social connections',
      limited: 'Limited social connections', isolated: 'Socially isolated ⚠', '': 'Not specified',
    };
    const bpMap: Record<string, string> = {
      optimal: 'Optimal (<120/80) ✓', normal: 'Normal (120–129/<80)', elevated: 'Elevated (130–139)',
      high1: 'High Stage 1', high2: 'High Stage 2 ⚠', '': 'Not specified',
    };
    const drinkingMap: Record<string, string> = {
      none: 'None ✓', light: 'Light (social)', moderate: 'Moderate', heavy: 'Heavy ⚠', '': 'Not specified',
    };

    // Personalised notes for each factor
    const smokingNote = quiz?.smoking === 'never'
      ? 'Non-smoking eliminates the single largest modifiable risk factor. This is a major longevity advantage.'
      : quiz?.smoking === 'quit_over5'
      ? 'Quitting more than 5 years ago has already restored significant longevity benefit. Risk continues declining.'
      : quiz?.smoking === 'quit_under5'
      ? 'Recent quitting is excellent. It takes 5–10 years to fully recover the longevity benefit, but the trajectory is positive.'
      : (quiz?.smoking === 'light' || quiz?.smoking === 'moderate' || quiz?.smoking === 'heavy')
      ? 'Smoking is the most powerful single modifiable risk factor. Even light smoking reduces life expectancy by 5+ years. Cessation at any age immediately reduces risk.'
      : 'Smoking status not recorded.';

    const bmiNote = !quiz?.bmi ? 'BMI not recorded.' :
      quiz.bmi < 18.5 ? `Your BMI of ${quiz.bmi.toFixed(1)} is below the healthy range. Both underweight and overweight BMI are associated with reduced longevity.`
      : quiz.bmi <= 23 ? `Your BMI of ${quiz.bmi.toFixed(1)} is in the optimal longevity range (21–23). This is a positive contribution to your forecast.`
      : quiz.bmi <= 25 ? `Your BMI of ${quiz.bmi.toFixed(1)} is in the healthy range, though the longevity sweet spot is 21–23. Small reductions yield measurable gains.`
      : quiz.bmi <= 30 ? `Your BMI of ${quiz.bmi.toFixed(1)} is above the optimal range. Each 5-unit increase above 25 reduces life expectancy by ~0.9 years (Lancet, 2016).`
      : `Your BMI of ${quiz.bmi.toFixed(1)} is significantly above the healthy range. Even modest weight reduction produces measurable longevity gains.`;

    const exerciseNote: Record<string, string> = {
      seldom: 'Sedentary lifestyle is associated with significantly increased mortality risk. Even 15 minutes of walking per day adds approximately 3 years of life expectancy (WHO, 2022).',
      light: 'Light activity provides some benefit, but research shows 150+ minutes/week of moderate exercise reduces all-cause mortality by 31%. There is substantial room for gain here.',
      moderate: 'Moderate exercise is excellent. You are getting most of the mortality-reduction benefit. Maintaining and slightly increasing intensity would push your score higher.',
      heavy: 'High activity level is a significant longevity advantage. Physical exercise is the closest thing to a longevity drug — you are benefiting maximally from it.',
      '': 'Exercise level not recorded.',
    };

    const sleepNote: Record<string, string> = {
      under6: 'Short sleep is associated with 12% higher all-cause mortality. This is one of the most impactful and also most reversible factors — improving sleep duration produces rapid benefits.',
      '6to7': 'Slightly below optimal sleep. The longevity sweet spot is 7–8 hours. Gaining just 30–60 minutes more would measurably improve your forecast.',
      '7to9': 'Optimal sleep duration — this is a positive contribution to your longevity. Maintaining sleep quality is as important as duration.',
      over9: 'Consistently long sleep is often associated with underlying health conditions and higher mortality risk. If this is due to fatigue rather than choice, it warrants a health check.',
      '': 'Sleep duration not recorded.',
    };

    const socialNote: Record<string, string> = {
      strong: 'Strong social connections are one of the most powerful — and most underestimated — longevity factors. The Harvard Study of Adult Development found social bonds are more predictive of healthy ageing than cholesterol or income.',
      moderate: 'Moderate social connections provide some benefit. Research consistently shows that deepening relationships — rather than widening them — produces the greatest longevity returns.',
      limited: 'Limited social connections is a significant longevity risk. Loneliness has mortality impact equivalent to smoking 15 cigarettes per day (Holt-Lunstad, 2015). Investing in relationships is a high-ROI longevity action.',
      isolated: 'Social isolation is one of the most serious longevity risk factors in this profile. Addressing this is as important as any physical health intervention.',
      '': 'Social connection level not recorded.',
    };

    const stressNote = !quiz?.stress ? 'Stress level not recorded.' :
      quiz.stress >= 8 ? `Your stress level of ${quiz.stress}/10 is very high. Chronic stress elevates cortisol, accelerating epigenetic ageing. Stress management is one of the most impactful interventions available to you.`
      : quiz.stress >= 5 ? `Your stress level of ${quiz.stress}/10 is moderate to high. Regular mindfulness practice can reverse measurable epigenetic ageing.`
      : quiz.stress >= 3 ? `Your stress level of ${quiz.stress}/10 is moderate. You are managing stress reasonably well — maintaining this protects your epigenetic profile.`
      : `Your low stress level (${quiz.stress}/10) is a significant longevity asset. Sustained low stress is associated with slower epigenetic ageing.`;

    // Conditions
    const conditions: string[] = [];
    if ((quiz as any)?.heartDisease) conditions.push(`Heart disease${(quiz as any).heartDiseaseControlled ? ' (controlled ✓)' : ' (uncontrolled ⚠)'}`);
    if ((quiz as any)?.diabetes) conditions.push(`Diabetes${(quiz as any).diabetesControlled ? ' (controlled ✓)' : ' (uncontrolled ⚠)'}`);
    if ((quiz as any)?.hypertension) conditions.push(`Hypertension${(quiz as any).hypertensionControlled ? ' (controlled ✓)' : ' (uncontrolled ⚠)'}`);
    const conditionsHTML = conditions.length > 0
      ? conditions.map(c => `<span style="display:inline-block;background:#fef3c7;border:1px solid #fde68a;border-radius:4px;padding:2px 8px;font-size:11px;color:#92400e;margin:2px;">${c}</span>`).join(' ')
      : '<span style="font-size:12px;color:#059669;">No chronic conditions reported ✓</span>';

    // Family history
    const familyRisks: string[] = [];
    if ((quiz as any)?.heartDiseaseFamily) familyRisks.push('Heart disease');
    if ((quiz as any)?.diabetesFamily) familyRisks.push('Diabetes');
    const familyHTML = familyRisks.length > 0
      ? familyRisks.map(r => `<span style="display:inline-block;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:2px 8px;font-size:11px;color:#991b1b;margin:2px;">${r} in family history</span>`).join(' ')
      : '<span style="font-size:12px;color:#059669;">No significant family history reported ✓</span>';

    // Factor breakdown
    const allFactors = longevityResult.factorBreakdown || [];

    // Must be declared before topOpportunities (used in dedup filter) and before topOppsHTML (map runs synchronously)
    const isGeneticFactor = (f: any) =>
      f.category === 'genetic' ||
      (f.factor || '').toLowerCase().includes('genetic') ||
      (f.factor || '').toLowerCase().includes('family');

    // Dedupe: keep at most ONE genetic-category entry (the highest-gain one, which sorts first)
    let _seenGenetic = false;
    const topOpportunities = [...allFactors]
      .filter((f: any) => f.potentialGain > 0)
      .sort((a: any, b: any) => b.potentialGain - a.potentialGain)
      .filter((f: any) => {
        if (isGeneticFactor(f)) { if (_seenGenetic) return false; _seenGenetic = true; }
        return true;
      })
      .slice(0, 4);

    const actionableOpps = topOpportunities.filter((f: any) => !isGeneticFactor(f));
    const actionableGainPDF = Math.min(
      actionableOpps.slice(0, 3).reduce((s: number, f: any) => s + Number(f.potentialGain || 0), 0) * 0.5,
      8
    ).toFixed(1);

    const negativeFactors = allFactors.filter((f: any) => f.currentImpact < 0).sort((a: any, b: any) => a.currentImpact - b.currentImpact);
    const positiveFactors = allFactors.filter((f: any) => f.currentImpact >= 0).sort((a: any, b: any) => b.currentImpact - a.currentImpact);
    const p1 = longevityResult.pillar1Snapshot;
    const p2 = longevityResult.pillar2Snapshot;

    // Epigenetic habits
    const activeHabitIds: string[] = longevityResult.userEpigeneticHabits || (longevityResult as any).epigeneticHabitsSelected || [];
    const ALL_HABITS = EPIGENETIC_HABITS;
    const activeHabits = ALL_HABITS.filter((h: any) => activeHabitIds.includes(h.id));
    const missingHabits = ALL_HABITS.filter((h: any) => !activeHabitIds.includes(h.id)).slice(0, 6);

    const activeHabitsHTML = activeHabits.length > 0
      ? activeHabits.map((h: any) => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;margin-bottom:6px;">
            <span style="font-size:16px;">${h.emoji || '✓'}</span>
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:600;color:#1f2937;">${h.label}</div>
              <div style="font-size:10px;color:#6b7280;">${h.source || ''}</div>
            </div>
            <div style="font-size:12px;font-weight:700;color:#059669;white-space:nowrap;">+${h.gain || 0} yrs</div>
          </div>`).join('')
      : '<p style="font-size:12px;color:#6b7280;">No epigenetic habits currently active. Starting even 2–3 habits from the list below can add years to your forecast.</p>';

    const missingHabitsHTML = missingHabits.map((h: any) => `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:6px;">
        <span style="font-size:16px;opacity:0.4;">${h.emoji || '○'}</span>
        <div style="flex:1;">
          <div style="font-size:12px;font-weight:600;color:#374151;">${h.label}</div>
          <div style="font-size:10px;color:#9ca3af;">${h.source || ''}</div>
        </div>
        <div style="font-size:12px;font-weight:700;color:#9ca3af;white-space:nowrap;">+${h.gain || 0} yrs potential</div>
      </div>`).join('');

    // Humanise raw quiz enum strings leaking from the factor engine
    const ENUM_LABEL_MAP: Record<string, string> = {
      '6to7': '6–7 hrs', '7to9': '7–9 hrs', 'under6': '<6 hrs', 'over9': '>9 hrs',
      'quit_under5': 'Quit <5 yrs ago', 'quit_over5': 'Quit >5 yrs ago',
      'seldom': 'Seldom', 'light': 'Light', 'moderate': 'Moderate',
      'heavy': 'Heavy', 'never': 'Never',
      'optimal': 'Optimal', 'normal': 'Normal', 'elevated': 'Elevated',
      'high1': 'High Stage 1', 'high2': 'High Stage 2',
      'strong': 'Strong', 'limited': 'Limited', 'isolated': 'Isolated', 'none': 'None',
    };
    const humanizeLabel = (label: string): string => {
      if (!label || label === '—') return label || '—';
      const mapped = ENUM_LABEL_MAP[label];
      if (mapped) return mapped;
      // Bare numeric string (e.g. raw BMI "40") → normalise to 1 dp
      if (/^\d+(\.\d+)?$/.test(label)) return parseFloat(label).toFixed(1);
      return label;
    };

    const factorsTableHTML = allFactors.map((f: any) => `
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:7px 0;font-size:12px;">${f.emoji || ''} ${f.factor}</td>
        <td style="padding:7px 0;font-size:12px;color:#6b7280;">${humanizeLabel(f.currentValueLabel || '—')}</td>
        <td style="padding:7px 0;font-size:12px;font-weight:600;text-align:right;color:${Number(f.currentImpact) >= 0 ? '#059669' : '#dc2626'};">${Number(f.currentImpact) >= 0 ? '+' : ''}${Number(f.currentImpact || 0).toFixed(1)} yrs</td>
        <td style="padding:7px 0;font-size:12px;font-weight:600;text-align:right;color:var(--pos);">+${Number(f.potentialGain || 0).toFixed(1)} yrs</td>
      </tr>`).join('');

    const topOppsHTML = topOpportunities.map((f: any, i: number) => {
      const isGen = isGeneticFactor(f);
      const gapYrs = Math.max(0, geneticCeiling - Number(forecast)).toFixed(0);
      return `
      <div style="padding:14px;background:white;border-radius:8px;border:1px solid ${isGen ? 'var(--hairline)' : '#e5e7eb'};margin-bottom:12px;page-break-inside:avoid;break-inside:avoid;${isGen ? 'border-left:3px solid var(--slate);' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="background:${isGen ? 'var(--slate)' : 'var(--navy)'};color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${i + 1}</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:#1f2937;">${isGen ? '🧬 Reach Your Genetic Ceiling' : `${f.emoji || ''} ${f.factor}`}</div>
              <div style="font-size:11px;color:#6b7280;">${isGen ? 'Genetic heritage — immutable; lever is lifestyle' : `Category: ${f.category || 'lifestyle'}`}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:18px;font-weight:900;color:${isGen ? 'var(--slate)' : '#059669'};">${isGen ? `~${gapYrs} yr gap` : `+${Number(f.potentialGain || 0).toFixed(1)} yrs`}</div>
            <div style="font-size:10px;color:#9ca3af;">${isGen ? 'ceiling gap' : 'potential gain'}</div>
          </div>
        </div>
        ${isGen ? `
        <div style="padding:10px 12px;background:var(--panel);border-radius:6px;border:1px solid var(--hairline);margin-bottom:8px;font-size:12px;color:var(--ink-soft);line-height:1.6;">
          Your genes allow an estimated ceiling of <strong>~${geneticCeiling} yrs</strong>.
          Your current forecast is <strong>${forecast} yrs</strong> — a gap of <strong>${gapYrs} yrs</strong>.
          You can't change your inheritance, but the habits in this plan determine how much of that potential you actually reach.
        </div>` : `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div style="padding:8px;background:#fef2f2;border-radius:6px;border:1px solid #fecaca;">
            <div style="font-size:10px;color:#991b1b;font-weight:600;margin-bottom:2px;">YOUR CURRENT STATUS</div>
            <div style="font-size:12px;color:#1f2937;">${humanizeLabel(f.currentValueLabel || '—')}</div>
            <div style="font-size:11px;font-weight:600;color:#dc2626;margin-top:2px;">Impact: ${Number(f.currentImpact || 0).toFixed(1)} yrs</div>
          </div>
          <div style="padding:8px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;">
            <div style="font-size:10px;color:#166534;font-weight:600;margin-bottom:2px;">OPTIMAL TARGET</div>
            <div style="font-size:12px;color:#1f2937;">${f.optimalValueLabel || '—'}</div>
            <div style="font-size:11px;font-weight:600;color:#059669;margin-top:2px;">Potential: +${Number(f.potentialGain || 0).toFixed(1)} yrs</div>
          </div>
        </div>`}
        <div style="font-size:11px;color:#6b7280;font-style:italic;">📚 ${f.source || ''}</div>
      </div>`;
  }).join('');

    // Action plan — shared utility (same function as web)
    const actionPlanPhases = buildActionPlanPhases(
      longevityResult.quizSnapshot,
      longevityResult.factorBreakdown || []
    );
    const pdfActionHTML = actionPlanPhases.map((planPhase, idx) => `
  <div style="margin-bottom:14px;border-radius:8px;overflow:hidden;border:1px solid var(--hairline);border-left:3px solid ${idx < 2 ? 'var(--navy)' : 'var(--pos)'};page-break-inside:avoid;break-inside:avoid;">
    <div style="background:${idx < 2 ? 'var(--panel)' : '#f0fdf4'};padding:9px 14px;border-bottom:1px solid var(--hairline);">
      <div style="font-size:12px;font-weight:700;color:${idx < 2 ? 'var(--navy)' : 'var(--pos)'};">${planPhase.period} — ${planPhase.title}</div>
    </div>
    <div style="padding:12px 14px;background:var(--paper);">
      ${planPhase.items.map((item, i) => `
        <div style="display:flex;gap:10px;margin-bottom:${i < planPhase.items.length - 1 ? '8px' : '0'};align-items:flex-start;">
          <div style="background:${idx < 2 ? 'var(--navy)' : 'var(--pos)'};color:white;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;">${i + 1}</div>
          <div style="font-size:12px;color:var(--ink-soft);line-height:1.6;">${item}</div>
        </div>`).join('')}
    </div>
  </div>`).join('');

    const top3GainRawPDF = topOpportunities.slice(0, 3).reduce((sum: number, f: any) => sum + Number(f.potentialGain || 0), 0);
    const realisticGainPDF = Math.min(top3GainRawPDF * 0.5, 8).toFixed(1);

    // Precise countdown from birth date so fractional years don't show "0 DAYS"
    const _dob = quiz?.dob ? new Date(quiz.dob) : null;
    let cdYearsCount = Math.floor(Number(remaining));
    let cdDaysCount = Math.floor((Number(remaining) % 1) * 365.25);
    if (_dob && isFinite(_dob.getTime())) {
      const forecastYears = Number(forecast);
      const deathDate = new Date(_dob);
      deathDate.setFullYear(deathDate.getFullYear() + Math.floor(forecastYears));
      deathDate.setDate(deathDate.getDate() + Math.round((forecastYears % 1) * 365.25));
      const msLeft = deathDate.getTime() - Date.now();
      if (msLeft > 0) {
        const totalDaysLeft = msLeft / (24 * 60 * 60 * 1000);
        cdYearsCount = Math.floor(totalDaysLeft / 365.25);
        cdDaysCount = Math.floor(totalDaysLeft % 365.25);
      }
    }

    // Two-scale bar chart: baseline always 85%, adjustments scaled to max adjustment
    const maxAdjValue = Math.max(
      Math.abs(Number(healthAdj)),
      Math.abs(Number(geneticAdj)),
      Math.abs(Number(epiAdj)),
      Math.abs(Number(commBonus)),
      1
    );
    const calcAdjBarWidth = (val: number) => Math.max(4, Math.min(85, (Math.abs(val) / maxAdjValue) * 85));
    const uniqueSources = [...new Set(allFactors.map((f: any) => f.source).filter(Boolean))];

    // ── Variables for new PDF pages ──────────────────────────────────────────

    // Page 7: Biological Blueprint — family tree + factor impact
    const FAMILY_KEYS_PDF: [string, string][] = [
      ['paternalGrandfather', 'Paternal Grandfather'],
      ['paternalGrandmother', 'Paternal Grandmother'],
      ['father', 'Father'],
      ['paternalUncles', 'Paternal Uncles (avg)'],
      ['paternalAunts', 'Paternal Aunts (avg)'],
      ['maternalGrandfather', 'Maternal Grandfather'],
      ['maternalGrandmother', 'Maternal Grandmother'],
      ['mother', 'Mother'],
      ['maternalUncles', 'Maternal Uncles (avg)'],
      ['maternalAunts', 'Maternal Aunts (avg)'],
    ];
    const familyRowsHTML = FAMILY_KEYS_PDF.reduce((html, [key, label]) => {
      const m = (p1 as any)[key];
      if (!m || m.dontKnow || !m.age || m.age <= 0) return html;
      const bg = m.age > 80 ? '#d1fae5' : m.age >= 70 ? '#fef3c7' : m.age >= 60 ? '#fed7aa' : '#fee2e2';
      const bdr = m.age > 80 ? '#a7f3d0' : m.age >= 70 ? '#fde68a' : m.age >= 60 ? '#fdba74' : '#fecaca';
      const tc = m.age > 80 ? '#065f46' : m.age >= 70 ? '#78350f' : m.age >= 60 ? '#9a3412' : '#991b1b';
      return html + `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 10px;background:${bg};border:1px solid ${bdr};border-radius:6px;margin-bottom:4px;">
        <span style="font-size:11px;font-weight:600;color:${tc};">${label}</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;font-weight:700;color:${tc};">${m.age} yrs</span>
          ${m.isLiving
            ? '<span style="font-size:9px;background:#dcfce7;color:#166534;padding:1px 5px;border-radius:8px;">Living</span>'
            : '<span style="font-size:9px;background:#fee2e2;color:#991b1b;padding:1px 5px;border-radius:8px;">Deceased</span>'}
        </div>
      </div>`;
    }, '');
    const hasFamilyData = familyRowsHTML.length > 0;

    const negFactorsHTML = negativeFactors.slice(0, 7).map((f: any) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #fee2e2;">
        <span style="font-size:11px;">${f.emoji || ''} ${f.factor}</span>
        <span style="font-size:11px;font-weight:700;color:#dc2626;">${Number(f.currentImpact).toFixed(1)} yrs</span>
      </div>`).join('');
    const posFactorsHTML = positiveFactors.slice(0, 7).map((f: any) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #d1fae5;">
        <span style="font-size:11px;">${f.emoji || ''} ${f.factor}</span>
        <span style="font-size:11px;font-weight:700;color:#059669;">+${Number(f.currentImpact).toFixed(1)} yrs</span>
      </div>`).join('');

    // Page 8: Community Anchor — mentor habits + Blue Zones grid
    const mentorHabitIds: string[] = p2?.mentorHabits || [];
    const mentorHabitObjs = EPIGENETIC_HABITS.filter((h: any) => mentorHabitIds.includes(h.id));
    const BLUE_ZONE_IDS_PDF = new Set(['walking', 'community', 'wholefood', 'purpose', 'spiritual', 'gardening', 'fasting', 'laughter', 'meditation']);
    const habitsForBZPDF: string[] = userSelectedHabits?.length ? userSelectedHabits : mentorHabitIds;
    const blueZoneCountPDF = habitsForBZPDF.filter((id: string) => BLUE_ZONE_IDS_PDF.has(id)).length;
    const BLUE_ZONE_DATA_PDF = [
      { id: 'walking',    name: 'Move Naturally',   emoji: '🚶', science: 'Natural movement throughout the day reduces all-cause mortality by 21% vs sedentary lifestyles.' },
      { id: 'purpose',    name: 'Purpose (Ikigai)', emoji: '🎯', science: 'A clear sense of purpose adds up to 7 years of life expectancy and reduces dementia risk 2.4× (Rush University, 2012).' },
      { id: 'meditation', name: 'Downshift',        emoji: '🧘', science: 'Daily stress-relief rituals lower chronic inflammation and cortisol, slowing biological aging.' },
      { id: 'fasting',    name: '80% Rule',         emoji: '⏰', science: 'Stopping at 80% full is linked to 31% lower cardiovascular mortality in Okinawan cohort studies.' },
      { id: 'wholefood',  name: 'Plant Slant',      emoji: '🥗', science: 'Bean-heavy diets reduce all-cause mortality by 7–8% per 20g/day (British Journal of Nutrition).' },
      { id: 'community',  name: 'Right Tribe',      emoji: '👥', science: 'Your closest 5 contacts significantly shape your longevity habits and health behaviors daily.' },
      { id: 'spiritual',  name: 'Faith Community',  emoji: '🙏', science: '4× monthly attendance adds 4–14 years of life expectancy across 5 independent studies (Hummer et al., 1999).' },
      { id: 'volunteer',  name: 'Loved Ones First', emoji: '🤝', science: 'Multigenerational households reduce offspring mortality rates by up to 25% (Framingham Heart Study).' },
      { id: 'gardening',  name: 'Nature & Green',   emoji: '🌿', science: 'Regular nature exposure lowers cortisol by 21% and reduces depression risk by 30% (Univ. of Exeter, 2019).' },
    ];
    const blueZonesHTMLPDF = BLUE_ZONE_DATA_PDF.map(bp => {
      const aligned = habitsForBZPDF.includes(bp.id);
      return `<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;background:${aligned ? '#f0fdf4' : '#f9fafb'};border:1px solid ${aligned ? '#bbf7d0' : '#e5e7eb'};border-radius:5px;margin-bottom:4px;">
        <span style="font-size:15px;flex-shrink:0;">${bp.emoji}</span>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:1px;">
            <span style="font-size:11px;font-weight:700;color:${aligned ? '#166534' : '#374151'};">${bp.name}</span>
            <span style="font-size:10px;">${aligned ? '✅' : '○'}</span>
          </div>
          <p style="font-size:9px;color:#6b7280;line-height:1.35;margin:0;">${bp.science}</p>
        </div>
      </div>`;
    }).join('');
    const mentorHabitsListHTMLPDF = mentorHabitObjs.length > 0
      ? mentorHabitObjs.map((h: any) => `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;margin-bottom:3px;">
          <span style="font-size:14px;">${h.emoji || '✓'}</span>
          <span style="flex:1;font-size:11px;font-weight:600;color:#166534;">${h.label}</span>
          <span style="font-size:10px;font-weight:700;color:#059669;white-space:nowrap;">+${(h.gain * 0.15).toFixed(1)} yr influence</span>
        </div>`).join('')
      : '<p style="font-size:11px;color:#6b7280;">No community anchor habits recorded in Step 8 of the quiz.</p>';

    // Page 9: Health Guide — 6 categories with top 2 recs each
    const HEALTH_GUIDE_PDF: Array<{
      emoji: string; name: string; stat: string; color: string; border: string;
      recs: Array<{ emoji: string; title: string; impact?: number; quickWin: string; source: string }>;
    }> = [
      { emoji: '😴', name: 'Sleep', stat: '7–9 hrs/night linked to +2.5 yrs life expectancy', color: '#6366f1', border: '#a5b4fc',
        recs: [
          { emoji: '⏰', title: 'Consistent Sleep Schedule', impact: 1.5, quickWin: 'Set both a bedtime alarm and wake alarm — keep them on weekends too.', source: 'Sleep Medicine Reviews, 2022' },
          { emoji: '📵', title: 'Screen-Free 90 Min Before Bed', impact: 0.8, quickWin: 'Enable Night Mode on all devices and set a "screens off" reminder.', source: 'Harvard Medical School, 2020' },
        ]},
      { emoji: '🏃', name: 'Exercise', stat: '150 min/week aerobic exercise reduces mortality by 31%', color: '#22c55e', border: '#86efac',
        recs: [
          { emoji: '🚴', title: 'Zone 2 Cardio (150 min/week)', impact: 2.0, quickWin: 'Walk briskly, bike, or swim for 30 min today.', source: 'WHO Guidelines 2020; NEJM 2022' },
          { emoji: '💪', title: 'Strength Training (2–3×/week)', impact: 1.5, quickWin: 'Do one bodyweight circuit: 3 sets of squats, pushups, and lunges.', source: 'British Journal of Sports Medicine, 2022' },
        ]},
      { emoji: '🥗', name: 'Nutrition', stat: 'Mediterranean diet cuts all-cause mortality by 25%', color: '#f97316', border: '#fed7aa',
        recs: [
          { emoji: '🐟', title: 'Mediterranean Diet Pattern', impact: 2.0, quickWin: 'Replace one red meat meal per week with fatty fish (salmon, mackerel, sardines).', source: 'PREDIMED Trial, NEJM 2018' },
          { emoji: '🫘', title: 'Legumes Daily', impact: 1.3, quickWin: "Add a can of chickpeas or lentils to tonight's meal.", source: 'British Journal of Nutrition, 2014' },
        ]},
      { emoji: '🧠', name: 'Mental Health', stat: 'Strong social ties reduce premature mortality by 50%', color: '#8b5cf6', border: '#c4b5fd',
        recs: [
          { emoji: '🎯', title: 'Purpose & Meaning (Ikigai)', impact: 1.0, quickWin: "Write one sentence: 'My purpose today is...' and post it visibly.", source: 'Rush University Medical Center, 2012' },
          { emoji: '🧘', title: 'Daily Stress Management', impact: 0.8, quickWin: 'Try box breathing: 4s inhale → 4s hold → 6s exhale, repeat 5 cycles.', source: 'Lancet Psychiatry, 2021' },
        ]},
      { emoji: '🏥', name: 'Preventive Care', stat: 'Screenings catch disease 5–10 yrs earlier; reduce mortality 16%', color: '#ef4444', border: '#fca5a5',
        recs: [
          { emoji: '🏥', title: 'Annual Health Checkups', impact: 0.8, quickWin: "Book your next annual physical today if you haven't had one this year.", source: 'USPSTF, 2023' },
          { emoji: '📊', title: 'Know Your 4 Biomarkers', quickWin: 'Ask your doctor for: blood pressure, HbA1c, LDL cholesterol, and BMI.', source: 'American Heart Association, 2023' },
        ]},
      { emoji: '👥', name: 'Community', stat: 'Strong community ties add 4–14 years of life expectancy', color: '#14b8a6', border: '#99f6e4',
        recs: [
          { emoji: '🤝', title: 'Build Your Moai (5-person tribe)', impact: 1.5, quickWin: 'Identify your 5 key wellbeing supporters and reach out to one today.', source: 'Holt-Lunstad, 2015; Blue Zones' },
          { emoji: '🙏', title: 'Community or Faith Group (4×/month)', impact: 1.0, quickWin: 'Find one local community class, club, or group to join this month.', source: 'Hummer et al., 1999' },
        ]},
    ];
    const healthGuideHTMLPDF = HEALTH_GUIDE_PDF.map(cat => {
      const recsHTML = cat.recs.map(rec => `
        <div style="display:flex;gap:7px;margin-bottom:5px;padding:6px 8px;background:#f9fafb;border-radius:5px;border:1px solid #f3f4f6;">
          <span style="font-size:14px;flex-shrink:0;">${rec.emoji}</span>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
              <span style="font-size:11px;font-weight:700;color:#1f2937;">${rec.title}</span>
              ${rec.impact !== undefined ? `<span style="font-size:9px;font-weight:700;color:#059669;background:#d1fae5;padding:1px 5px;border-radius:8px;">+${rec.impact} yr</span>` : ''}
            </div>
            <div style="font-size:9px;color:var(--blue);font-weight:600;">⚡ ${rec.quickWin}</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:1px;font-style:italic;">${rec.source}</div>
          </div>
        </div>`).join('');
      return `<div style="margin-bottom:8px;border:1px solid ${cat.border};border-radius:7px;overflow:hidden;page-break-inside:avoid;break-inside:avoid;">
        <div style="padding:7px 10px;background:${cat.color}22;border-bottom:1px solid ${cat.border};display:flex;align-items:center;gap:6px;">
          <span style="font-size:15px;">${cat.emoji}</span>
          <div>
            <span style="font-size:12px;font-weight:700;color:#1f2937;">${cat.name}</span>
            <span style="font-size:9px;color:#6b7280;margin-left:6px;">${cat.stat}</span>
          </div>
        </div>
        <div style="padding:7px 10px;">${recsHTML}</div>
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Longevity Blueprint — BornClock</title>
  <style>
    :root{
      --ink:#0C1A2B; --ink-soft:#3A4A5A; --muted:#6B7A89;
      --hairline:#D7E1EA; --panel:#F1F6FA; --panel-2:#FAFCFE; --paper:#FFFFFF;
      --navy:#103A5C; --blue:#1E6FB8; --blue-tint:#E4EFF8;
      --pos:#1F8A5B; --pos-soft:#BFE3CF; --neg:#C2453D; --neg-soft:#F0CFCB; --slate:#8A9BA8;
    }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
           font-size: 12px; line-height: 1.6; color: var(--ink); background: var(--paper);
           font-feature-settings: "tnum" 1, "lnum" 1; }
    .num { font-feature-settings: "tnum" 1; letter-spacing: -.01em; }
    @page { margin: 0; size: A4; }
    .page { padding: 32px 40px; margin: 1.2cm; }
    .page-break { page-break-after: always; break-after: page; }

    /* Typography */
    h1 { font-size: 22px; font-weight: 800; color: var(--navy); letter-spacing: -0.3px; }
    h2 { font-size: 13px; font-weight: 700; color: var(--ink); margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1.5px solid var(--navy); text-transform: uppercase; letter-spacing: 0.5px; }
    h3 { font-size: 13px; font-weight: 700; color: var(--ink-soft); margin: 0 0 8px 0; }

    /* Section cards */
    .section { margin-bottom: 18px; padding: 16px 20px; border-radius: 8px; page-break-inside: avoid; break-inside: avoid; border: 1px solid var(--hairline); }
    .section-gray  { background: var(--panel); border-left: 4px solid var(--slate); }
    .section-green { background: #f0fdf4; border: 1px solid var(--pos-soft); border-left: 4px solid var(--pos); }
    .section-blue  { background: var(--blue-tint); border: 1px solid #c3d9ef; border-left: 4px solid var(--blue); }
    .section-amber { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; }
    .section-purple{ background: var(--panel); border: 1px solid var(--hairline); border-left: 4px solid var(--navy); }
    .section-indigo{ background: var(--blue-tint); border: 1px solid #c3d9ef; border-left: 4px solid var(--blue); }
    .section-teal  { background: #f0fdfa; border: 1px solid #99f6e4; border-left: 4px solid #0d9488; }
    .section-rose  { background: #fff1f2; border: 1px solid var(--neg-soft); border-left: 4px solid var(--neg); }
    .section h2 { border-bottom-color: var(--hairline); color: var(--ink); }
    .section-green  h2 { color: var(--pos); }
    .section-blue   h2 { color: var(--blue); }
    .section-amber  h2 { color: #92400e; }
    .section-purple h2 { color: var(--navy); }
    .section-indigo h2 { color: var(--blue); }
    .section-teal   h2 { color: #0f766e; }
    .section-rose   h2 { color: var(--neg); }

    /* Grid layouts */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }

    /* Vitals strip cells */
    .stat { text-align: left; background: var(--paper); padding: 16px 18px; }
    .stat-label { font-size: 9.5px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .16em; font-weight: 600; }
    .stat-value { font-size: 23px; font-weight: 700; line-height: 1; color: var(--navy); }
    .stat-unit { font-size: 11px; color: var(--muted); font-weight: 400; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; padding: 9px 8px; background: var(--panel); border-bottom: 1.5px solid var(--navy); text-align: left; font-weight: 700; }
    th:last-child, th:nth-last-child(2) { text-align: right; }
    tr { border-bottom: 1px solid var(--hairline); }
    tr:nth-child(even) td { background: var(--panel-2); }
    td { padding: 8px; font-size: 12px; color: var(--ink-soft); }

    /* Impact chips */
    .chip { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .chip-pos { background: var(--pos-soft); color: var(--pos); }
    .chip-neg { background: var(--neg-soft); color: var(--neg); }
    .chip-zero { background: var(--panel); color: var(--muted); }

    /* Profile rows */
    .profile-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--hairline); font-size: 12px; }
    .profile-row:last-child { border-bottom: none; }

    /* Bar chart */
    .bar-row { margin-bottom: 12px; }
    .bar-label { font-size: 11px; color: var(--ink-soft); margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
    .bar-bg { background: var(--hairline); border-radius: 6px; height: 12px; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .bar-fill { height: 12px; border-radius: 6px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    /* Page header — flat navy band */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--navy);
      padding: 11px 20px; margin: -32px -40px 24px;
    }
    .page-header-name { font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .page-header-right { font-size: 12px; font-weight: 700; color: white; }

    /* Page footer */
    .page-footer {
      margin-top: 20px; padding-top: 10px;
      border-top: 1px solid var(--hairline);
      font-size: 9px; color: var(--muted); text-align: center;
      letter-spacing: 0.3px;
    }

    /* Opportunity cards */
    .opp-card { padding: 14px; background: var(--paper); border-radius: 8px; border: 1px solid var(--hairline); margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    .opp-number { background: var(--navy); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; }
    .opp-gain { font-size: 20px; font-weight: 900; color: var(--pos); line-height: 1; }

    /* 90-Day phase headers — flat, no gradient */
    .phase-foundation { background: var(--navy); }
    .phase-build      { background: var(--blue); }
    .phase-deepen     { background: #0f5986; }
    .phase-consolidate{ background: var(--pos); }

    /* Citation + tags */
    .citation { font-size: 10px; color: var(--muted); font-style: italic; margin-top: 6px; }
    .tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .tag-green  { background: var(--pos-soft); color: var(--pos); }
    .tag-blue   { background: var(--blue-tint); color: var(--blue); }
    .tag-amber  { background: #fef3c7; color: #92400e; }
    .tag-red    { background: var(--neg-soft); color: var(--neg); }
    .tag-purple { background: var(--blue-tint); color: var(--navy); }

    /* Intro stats */
    .intro-stats{background:var(--blue-tint);border-left:4px solid var(--blue);padding:14px 18px;margin:18px 0;border-radius:0 8px 8px 0;font-size:13px;color:var(--ink-soft);line-height:1.8;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
    .intro-stats b{color:var(--navy);}

    /* Life countdown — navy family */
    .countdown{background:linear-gradient(135deg,#0C1A2B,#103A5C 60%,#1E6FB8);color:#fff;padding:26px;border-radius:12px;margin:18px 0;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
    .cd-head{font-size:11px;letter-spacing:2px;text-align:center;color:#93c5fd;margin-bottom:4px;}
    .cd-sub{text-align:center;color:#bfdbfe;font-size:12px;margin-bottom:18px;}
    .cd-grid{display:flex;justify-content:center;gap:14px;margin-bottom:16px;}
    .cd-cell{background:rgba(255,255,255,.12);border-radius:8px;padding:12px 16px;text-align:center;min-width:60px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
    .cd-n{font-size:26px;font-weight:900;color:#fff;line-height:1;}
    .cd-l{font-size:9px;letter-spacing:1.5px;color:#bfdbfe;margin-top:4px;}
    .cd-bar{height:8px;background:rgba(255,255,255,.2);border-radius:4px;margin-bottom:6px;}
    .cd-fill{height:100%;background:linear-gradient(90deg,#60a5fa,#93c5fd);border-radius:4px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
    .cd-row{display:flex;justify-content:space-between;font-size:10px;color:#bfdbfe;margin-bottom:14px;}
    .cd-quote{text-align:center;font-style:italic;color:#dbeafe;font-size:13px;border-top:1px solid rgba(255,255,255,.2);padding-top:14px;}

    /* Genetic ceiling */
    .ceiling{background:#f0fdf4;border:1px solid var(--pos-soft);border-radius:8px;padding:14px 16px;margin:16px 0;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
    .ceiling-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
    .ceiling-top span:first-child{font-size:14px;font-weight:700;color:#14532d;}
    .ceiling-val{font-size:18px;font-weight:900;color:var(--pos);}
    .ceiling-desc{font-size:11px;color:var(--ink-soft);margin:0;}

    /* Baseline source */
    .baseline-src{font-size:11px;color:var(--muted);margin-top:8px;padding:6px 10px;background:var(--panel);border:1px solid var(--hairline);border-radius:4px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
  </style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page">
  <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:2px solid var(--navy);margin-bottom:28px;">
    <div style="display:flex;align-items:center;gap:13px;">
      <img src="/bornclock-logo.png" alt="BornClock" width="52" height="52"
           style="display:block;object-fit:contain;"
           onerror="this.style.display='none'" />
      <div style="line-height:1.2;">
        <div style="font-size:21px;font-weight:800;color:var(--navy);letter-spacing:-.01em;">BornClock</div>
        <div style="font-size:9.5px;color:var(--muted);letter-spacing:.05em;margin-top:3px;">Know your time. Live it well.</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px;color:var(--muted);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;">Personal Longevity Blueprint</div>
      <div style="font-size:10px;color:var(--muted);margin-top:2px;">Generated ${generatedDate} · bornclock.com</div>
    </div>
  </div>

  <div style="margin-bottom:28px;">
    <div style="font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;">Your Statistical Life Expectancy</div>
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:8px;">
      <div class="num" style="font-size:110px;font-weight:800;color:var(--navy);letter-spacing:-.03em;line-height:.92;">${forecast}</div>
      <div style="font-size:28px;font-weight:500;color:var(--ink-soft);">years</div>
    </div>
    <div style="font-size:15px;font-weight:600;color:var(--ink);margin-top:12px;">${name}</div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--hairline);border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <div class="stat" style="border-right:1px solid var(--hairline);">
      <div class="stat-label">Current Age</div>
      <div class="stat-value">${currentAge} <span class="stat-unit">yrs</span></div>
    </div>
    <div class="stat" style="border-right:1px solid var(--hairline);">
      <div class="stat-label">Years Remaining</div>
      <div class="stat-value" style="color:var(--pos);">${remaining} <span class="stat-unit">yrs</span></div>
    </div>
    <div class="stat" style="border-right:1px solid var(--hairline);">
      <div class="stat-label">Days Remaining</div>
      <div class="stat-value" style="font-size:16px;">${Math.round(Number(remaining) * 365).toLocaleString()} <span class="stat-unit">days</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">Genetic Profile</div>
      <div class="stat-value" style="font-size:14px;">${geneticLabel}</div>
    </div>
  </div>

  <div class="intro-stats">
    <p>You are <strong>${currentAge}</strong> today &middot; <strong>${remaining} years</strong> of life ahead</p>
    <p>&#9432; Age-adjusted baseline &mdash; survival to age ${forecast} is factored in</p>
    <p>Built from <strong>14 personal factors</strong> including family history &mdash; WHO 2023 baselines and peer-reviewed research.</p>
  </div>

  <div class="countdown">
    <div class="cd-head">&#9203; YOUR LIFE COUNTDOWN</div>
    <div class="cd-sub">Estimated time remaining until age ${forecast}</div>
    <div class="cd-grid">
      <div class="cd-cell"><div class="cd-n">${cdYearsCount}</div><div class="cd-l">YEARS</div></div>
      <div class="cd-cell"><div class="cd-n">${cdDaysCount}</div><div class="cd-l">DAYS</div></div>
      <div class="cd-cell"><div class="cd-n">00</div><div class="cd-l">HOURS</div></div>
      <div class="cd-cell"><div class="cd-n">00</div><div class="cd-l">MINS</div></div>
    </div>
    <div class="cd-bar" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"><div class="cd-fill" style="width:${Math.min(100,(currentAge/Number(forecast))*100).toFixed(1)}%;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div></div>
    <div class="cd-row"><span>Birth</span><span>${Math.min(100,(currentAge/Number(forecast))*100).toFixed(1)}% of forecast lived</span><span>Age ${Math.round(Number(forecast))}</span></div>
    <div class="cd-quote">&ldquo;The people who live longest don&rsquo;t try to live forever &mdash; they live well.&rdquo;</div>
  </div>

  <div class="section section-gray" style="display:flex;align-items:center;gap:24px;">
    <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;">
      <div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(${scoreBand.color} 0% ${score}%, var(--hairline) ${score}% 100%);display:flex;align-items:center;justify-content:center;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
        <div style="width:74px;height:74px;border-radius:50%;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
          <span class="num" style="font-size:26px;font-weight:800;color:var(--navy);line-height:1;">${score}</span>
          <span style="font-size:9px;color:var(--muted);">/100</span>
        </div>
      </div>
    </div>
    <div style="flex:1;">
      <h3 style="margin-bottom:6px;color:var(--navy);">Longevity Score: ${score}/100 — ${scoreBand.label}</h3>
      <p style="font-size:12px;color:var(--ink-soft);line-height:1.6;margin-bottom:8px;">${scoreBand.desc}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <span style="font-size:10px;background:var(--pos-soft);color:var(--pos);padding:2px 8px;border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">80–100: Excellent</span>
        <span style="font-size:10px;background:var(--blue-tint);color:var(--blue);padding:2px 8px;border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">65–79: On Track</span>
        <span style="font-size:10px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">50–64: Average</span>
        <span style="font-size:10px;background:var(--neg-soft);color:var(--neg);padding:2px 8px;border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">0–49: Needs Attention</span>
      </div>
    </div>
  </div>

  <div style="font-size:10px;color:#9ca3af;text-align:center;font-style:italic;margin-top:16px;">
    Statistical estimate for informational purposes only · Not medical advice · Consult a qualified healthcare professional
  </div>
</div>

<!-- PAGE 2: HEALTH PROFILE -->
<div class="page page-break">
  <div style="margin-bottom:24px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">INTAKE</div>
      <h1 style="margin:0 0 4px;">Your Health Profile</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Based on your quiz responses — this is what we used to calculate your forecast</p>
    </div>
  </div>

  <div class="section section-gray" style="margin-bottom:16px;">
    <h2>Personal Details</h2>
    <div class="grid-3">
      <div style="padding:10px;background:white;border-radius:6px;border:1px solid #e5e7eb;text-align:center;">
        <div style="font-size:10px;color:#9ca3af;margin-bottom:4px;">GENDER</div>
        <div style="font-size:14px;font-weight:700;color:#1f2937;text-transform:capitalize;">${quiz?.gender || 'Not specified'}</div>
      </div>
      <div style="padding:10px;background:white;border-radius:6px;border:1px solid #e5e7eb;text-align:center;">
        <div style="font-size:10px;color:#9ca3af;margin-bottom:4px;">COUNTRY</div>
        <div style="font-size:14px;font-weight:700;color:#1f2937;">${quiz?.country || 'Not specified'}</div>
      </div>
      <div style="padding:10px;background:white;border-radius:6px;border:1px solid #e5e7eb;text-align:center;">
        <div style="font-size:10px;color:#9ca3af;margin-bottom:4px;">BMI</div>
        <div style="font-size:14px;font-weight:700;color:${!quiz?.bmi ? '#9ca3af' : (quiz?.bmi || 0) <= 25 ? '#059669' : (quiz?.bmi || 0) <= 30 ? '#f59e0b' : '#dc2626'};">${quiz?.bmi ? (quiz.bmi as number).toFixed(1) : '—'}</div>
      </div>
    </div>
  </div>

  <div class="section section-gray" style="margin-bottom:16px;">
    <h2>Lifestyle Factors</h2>
    <div class="grid-2">
      <div>
        <div class="profile-row"><span style="color:#6b7280;">🚬 Smoking</span><span style="font-weight:600;">${smokingMap[quiz?.smoking || '']}</span></div>
        <div class="profile-row"><span style="color:#6b7280;">🍷 Alcohol</span><span style="font-weight:600;">${drinkingMap[quiz?.drinking || '']}</span></div>
        <div class="profile-row"><span style="color:#6b7280;">🏃 Exercise</span><span style="font-weight:600;">${exerciseMap[quiz?.exercise || '']}</span></div>
        <div class="profile-row"><span style="color:#6b7280;">🥗 Diet</span><span style="font-weight:600;">${dietMap[quiz?.diet || '']}</span></div>
      </div>
      <div>
        <div class="profile-row"><span style="color:#6b7280;">😴 Sleep</span><span style="font-weight:600;">${sleepMap[quiz?.sleepDuration || '']}</span></div>
        <div class="profile-row"><span style="color:#6b7280;">😤 Stress</span><span style="font-weight:600;color:${(quiz?.stress || 0) >= 7 ? '#dc2626' : (quiz?.stress || 0) >= 4 ? '#f59e0b' : '#059669'};">${quiz?.stress ? quiz.stress + '/10' : 'Not specified'}</span></div>
        <div class="profile-row"><span style="color:#6b7280;">🤝 Social</span><span style="font-weight:600;">${socialMap[quiz?.socialConnections || '']}</span></div>
        <div class="profile-row"><span style="color:#6b7280;">💓 Blood Pressure</span><span style="font-weight:600;">${bpMap[quiz?.bloodPressure || '']}</span></div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="section section-amber">
      <h2>Health Conditions</h2>
      ${conditionsHTML}
    </div>
    <div class="section section-amber">
      <h2>Family History</h2>
      ${familyHTML}
    </div>
  </div>

  <div class="section section-purple">
    <h2>🧬 Genetic Vitality Profile</h2>
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="padding:12px 20px;background:white;border-radius:8px;border:1px solid var(--hairline);text-align:center;flex-shrink:0;">
        <div style="font-size:10px;color:var(--navy);font-weight:600;margin-bottom:2px;">GENETIC SCORE</div>
        <div style="font-size:18px;font-weight:900;color:var(--navy);">${geneticLabel}</div>
        <div style="font-size:13px;font-weight:700;color:${Number(geneticAdj) >= 0 ? '#059669' : '#dc2626'};margin-top:2px;">${Number(geneticAdj) >= 0 ? '+' : ''}${geneticAdj} yrs</div>
      </div>
      <div style="flex:1;">
        <p style="font-size:12px;color:#4b5563;line-height:1.6;margin-bottom:6px;">${geneticDesc || 'Your genetic vitality contributes ' + geneticAdj + ' years to your forecast.'}</p>
        <p style="font-size:11px;color:var(--muted);font-style:italic;">Research (Karolinska Institute, 2018): Genetics account for only 25–30% of longevity variance. 70–75% is determined by lifestyle and environment.</p>
      </div>
    </div>
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 3: HOW YOUR NUMBER WAS BUILT -->
<div class="page page-break">
  <div style="margin-bottom:24px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">METHODOLOGY</div>
      <h1 style="margin:0 0 4px;">How Your Number Was Built</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">From WHO baseline to your personalised forecast — each factor explained</p>
    </div>
  </div>

  <div class="section section-gray" style="margin-bottom:16px;">
    <h2>Forecast Breakdown — Visual</h2>
    <div class="bar-row">
      <div class="bar-label"><span>📊 WHO Baseline (${quiz?.gender || 'male'}, ${quiz?.country || 'India'})</span><span style="font-weight:700;color:var(--navy);">${baseline} yrs</span></div>
      <div class="bar-bg" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"><div class="bar-fill" style="width:85%;background:var(--navy);-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>${Number(healthAdj) >= 0 ? '✅' : '⚠️'} Health &amp; Lifestyle Adjustment</span><span style="font-weight:700;color:${Number(healthAdj) >= 0 ? 'var(--pos)' : 'var(--neg)'};">${Number(healthAdj) >= 0 ? '+' : ''}${healthAdj} yrs</span></div>
      <div class="bar-bg" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"><div class="bar-fill" style="width:${calcAdjBarWidth(Number(healthAdj))}%;background:${Number(healthAdj) >= 0 ? 'var(--pos)' : 'var(--neg)'};-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>🧬 Genetic Adjustment (${geneticLabel})</span><span style="font-weight:700;color:${Number(geneticAdj) >= 0 ? 'var(--pos)' : 'var(--neg)'};">${Number(geneticAdj) >= 0 ? '+' : ''}${geneticAdj} yrs</span></div>
      <div class="bar-bg" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"><div class="bar-fill" style="width:${calcAdjBarWidth(Number(geneticAdj))}%;background:${Number(geneticAdj) >= 0 ? 'var(--pos)' : 'var(--neg)'};-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>🌱 Epigenetic Habits Bonus</span><span style="font-weight:700;color:var(--pos);">+${epiAdj} yrs</span></div>
      <div class="bar-bg" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"><div class="bar-fill" style="width:${calcAdjBarWidth(Number(epiAdj))}%;background:var(--pos);-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div></div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px;">${activeHabits.length} of ${ALL_HABITS.length} epigenetic habits active</div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span>🤝 Community &amp; Social Bonus</span><span style="font-weight:700;color:var(--pos);">+${commBonus} yrs</span></div>
      <div class="bar-bg" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"><div class="bar-fill" style="width:${calcAdjBarWidth(Number(commBonus))}%;background:var(--blue);-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div></div>
    </div>
    <hr style="border:none;border-top:1px solid var(--hairline);margin:16px 0;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:14px;font-weight:700;color:var(--ink);">Your Total Forecast</div>
      <div style="font-size:24px;font-weight:900;color:var(--navy);">${forecast} years</div>
    </div>
  </div>

  <div class="section section-gray">
    <h2>Factor Breakdown Table</h2>
    <table>
      <thead>
        <tr>
          <th>Factor</th><th>Your Current Status</th>
          <th style="text-align:right;">Current Impact</th>
          <th style="text-align:right;">Potential Gain</th>
        </tr>
      </thead>
      <tbody>${factorsTableHTML}</tbody>
    </table>
    <p style="font-size:10px;color:#9ca3af;margin-top:10px;font-style:italic;">Potential gain = years added if this factor was optimised to the target level.</p>
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 4: PERSONALISED ANALYSIS -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">ANALYSIS</div>
      <h1 style="margin:0 0 4px;">Personalised Health Analysis</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">What your quiz answers mean for your longevity — explained specifically for you</p>
    </div>
  </div>

  <div class="section section-gray" style="margin-bottom:12px;">
    <h2>🚬 Smoking &amp; Tobacco</h2>
    <div style="display:flex;gap:10px;">
      <div style="padding:8px 12px;background:white;border-radius:6px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;flex-shrink:0;">${smokingMap[quiz?.smoking || '']}</div>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;">${smokingNote}</p>
    </div>
  </div>
  <div class="section section-gray" style="margin-bottom:12px;">
    <h2>⚖️ Body Weight (BMI)</h2>
    <div style="display:flex;gap:10px;">
      <div style="padding:8px 12px;background:white;border-radius:6px;border:1px solid #e5e7eb;font-size:14px;font-weight:700;color:${!quiz?.bmi ? '#9ca3af' : (quiz?.bmi || 0) <= 25 ? '#059669' : '#dc2626'};flex-shrink:0;">BMI ${quiz?.bmi ? (quiz.bmi as number).toFixed(1) : '—'}</div>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;">${bmiNote}</p>
    </div>
  </div>
  <div class="section section-gray" style="margin-bottom:12px;">
    <h2>🏃 Physical Exercise</h2>
    <div style="display:flex;gap:10px;">
      <div style="padding:8px 12px;background:white;border-radius:6px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;flex-shrink:0;">${exerciseMap[quiz?.exercise || '']}</div>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;">${exerciseNote[quiz?.exercise || ''] || ''}</p>
    </div>
  </div>
  <div class="section section-gray" style="margin-bottom:12px;">
    <h2>😴 Sleep Duration</h2>
    <div style="display:flex;gap:10px;">
      <div style="padding:8px 12px;background:white;border-radius:6px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;flex-shrink:0;">${sleepMap[quiz?.sleepDuration || '']}</div>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;">${sleepNote[quiz?.sleepDuration || ''] || ''}</p>
    </div>
  </div>
  <div class="section section-gray" style="margin-bottom:12px;">
    <h2>😤 Stress Level</h2>
    <div style="display:flex;gap:10px;">
      <div style="padding:8px 12px;background:white;border-radius:6px;border:1px solid #e5e7eb;font-size:14px;font-weight:700;color:${(quiz?.stress || 0) >= 7 ? '#dc2626' : (quiz?.stress || 0) >= 4 ? '#f59e0b' : '#059669'};flex-shrink:0;">${quiz?.stress || '—'}/10</div>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;">${stressNote}</p>
    </div>
  </div>
  <div class="section section-gray">
    <h2>🤝 Social Connections</h2>
    <div style="display:flex;gap:10px;">
      <div style="padding:8px 12px;background:white;border-radius:6px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;flex-shrink:0;">${socialMap[quiz?.socialConnections || '']}</div>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;">${socialNote[quiz?.socialConnections || ''] || ''}</p>
    </div>
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 5: TOP IMPROVEMENT OPPORTUNITIES -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">PRIORITIES</div>
      <h1 style="margin:0 0 4px;">Your Top Improvement Opportunities</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Ranked by potential years gained — specific to your quiz results</p>
    </div>
  </div>
  ${topOppsHTML}
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 6: EPIGENETIC BLUEPRINT -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">EPIGENETICS</div>
      <h1 style="margin:0 0 4px;">Your Epigenetic Blueprint</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Lifestyle habits that directly alter your DNA methylation patterns and biological age</p>
    </div>
  </div>
  <div style="padding:14px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;margin-bottom:20px;">
    <p style="font-size:12px;color:#1e40af;line-height:1.6;">
      <strong>What is epigenetics?</strong> Your genes are fixed, but epigenetics — the control layer above your genes — is highly malleable. Specific lifestyle habits directly alter DNA methylation patterns, effectively turning longevity genes on or off. You currently have <strong>${activeHabits.length}</strong> of ${ALL_HABITS.length} active, contributing <strong>+${epiAdj} years</strong> to your forecast. Activating all habits could add up to <strong>+6 years</strong>.
    </p>
  </div>
  <div class="section section-green" style="margin-bottom:16px;">
    <h2>✅ Your Active Habits (${activeHabits.length})</h2>
    ${activeHabitsHTML}
  </div>
  <div class="section section-gray">
    <h2>○ Habits to Activate — Top Priority</h2>
    <p style="font-size:11px;color:#6b7280;margin-bottom:12px;">Adding even 2–3 of these can meaningfully increase your epigenetic bonus.</p>
    ${missingHabitsHTML}
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 7: BIOLOGICAL BLUEPRINT -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">GENETICS</div>
      <h1 style="margin:0 0 4px;">Biological Blueprint</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Your genetic heritage and how each lifestyle factor currently affects your lifespan</p>
    </div>
  </div>

  <div class="section section-purple" style="margin-bottom:16px;">
    <h2>Genetic Vitality Score</h2>
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="padding:14px 20px;background:white;border-radius:8px;border:1px solid var(--hairline);text-align:center;flex-shrink:0;">
        <div style="font-size:10px;color:var(--navy);font-weight:600;margin-bottom:2px;">GENETIC SCORE</div>
        <div style="font-size:18px;font-weight:900;color:var(--navy);">${geneticLabel}</div>
        <div style="font-size:13px;font-weight:700;color:${Number(geneticAdj) >= 0 ? '#059669' : '#dc2626'};margin-top:4px;">${Number(geneticAdj) >= 0 ? '+' : ''}${geneticAdj} yrs</div>
        <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Family avg: ~${longevityResult.familyBaselineAge} yrs</div>
      </div>
      <div style="flex:1;">
        <p style="font-size:12px;color:#4b5563;line-height:1.6;margin-bottom:8px;">${geneticDesc || 'Your genetic vitality contributes ' + geneticAdj + ' years to your forecast based on family history analysis.'}</p>
        <div class="ceiling">
          <div class="ceiling-top"><span>Your Genetic Ceiling</span><span class="ceiling-val">~${Math.round(longevityResult.familyBaselineAge + 5)} yrs</span></div>
          <p class="ceiling-desc">Estimated from your family average with a +5yr modifier for modern medicine and lifestyle potential.</p>
        </div>
        <p class="baseline-src">&#128202; Baseline: UN World Population Prospects 2024 &middot; ${quiz?.country || 'India'}</p>
        <p style="font-size:10px;color:#9ca3af;font-style:italic;">Karolinska Institute (2018): Genetics accounts for only 25–30% of longevity. The other 70–75% is lifestyle.</p>
      </div>
    </div>
  </div>

  ${hasFamilyData ? `
  <div class="section section-gray" style="margin-bottom:16px;">
    <h2>Your Genetic Family Tree</h2>
    <div class="grid-2">${familyRowsHTML}</div>
    <div style="display:flex;gap:16px;font-size:10px;color:#6b7280;margin-top:8px;flex-wrap:wrap;">
      <span><span style="display:inline-block;width:10px;height:10px;background:#d1fae5;border:1px solid #a7f3d0;border-radius:2px;margin-right:3px;vertical-align:middle;"></span>&gt;80 yrs</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#fef3c7;border:1px solid #fde68a;border-radius:2px;margin-right:3px;vertical-align:middle;"></span>70–80 yrs</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#fed7aa;border:1px solid #fdba74;border-radius:2px;margin-right:3px;vertical-align:middle;"></span>60–70 yrs</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#fee2e2;border:1px solid #fecaca;border-radius:2px;margin-right:3px;vertical-align:middle;"></span>&lt;60 yrs</span>
    </div>
  </div>` : ''}

  <div class="grid-2">
    <div class="section section-gray">
      <h2 style="color:#dc2626;border-bottom-color:#fecaca;">⬇ Factors Reducing Lifespan</h2>
      ${negFactorsHTML || '<p style="font-size:12px;color:#059669;">No significant negative factors — excellent work!</p>'}
    </div>
    <div class="section section-green">
      <h2 style="color:#059669;">⬆ Factors Adding Years</h2>
      ${posFactorsHTML || '<p style="font-size:12px;color:#6b7280;">Adopt positive lifestyle habits to see gains here.</p>'}
    </div>
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 8: COMMUNITY ANCHOR -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">ENVIRONMENT</div>
      <h1 style="margin:0 0 4px;">Community Anchor</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Your social environment's impact on longevity — and how it aligns with Blue Zones science</p>
    </div>
  </div>

  ${p2?.hasMentor && p2?.mentorAge > 0 ? `
  <div class="section section-blue" style="margin-bottom:16px;">
    <h2>🏘️ Your Community Longevity Anchor</h2>
    <p style="font-size:12px;color:#374151;line-height:1.6;margin-bottom:10px;">
      ${p2.mentorName ? '"' + p2.mentorName.replace(/\b\w/g, (c: string) => c.toUpperCase()) + '"' : 'Your longevity mentor'} (${p2.mentorRelationship || 'mentor'}, ${p2.mentorAge} yrs) represents living proof that your environment supports longevity.
      Community bonus applied: <strong style="color:#059669;">+${commBonus} yrs</strong>.
    </p>
    <h3 style="margin-bottom:8px;">Habits attributed to your community anchor:</h3>
    ${mentorHabitsListHTMLPDF}
    <p style="font-size:10px;color:#6b7280;margin-top:8px;font-style:italic;">Each habit contributes 15% of its direct benefit as an environmental influence on your forecast. Adopt these habits directly via the Longevity Simulator for the full benefit.</p>
  </div>` : `
  <div class="section section-gray" style="margin-bottom:16px;">
    <h2>🏘️ Community Anchor</h2>
    <p style="font-size:12px;color:#6b7280;line-height:1.6;">No community anchor data recorded. Complete Step 8 in the BornClock quiz to activate your community bonus. Research shows your social environment can add up to +0.8 years to your forecast independently of your personal habits.</p>
  </div>`}

  <div class="section section-gray" style="padding:12px 16px;">
    <p style="font-size:11px;color:#6b7280;font-style:italic;">See Scientific Foundation (Page 11) for the full Blue Zones Power 9® framework and how your habits align with centenarian populations.</p>
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- PAGE 9: HEALTH GUIDE -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">PROTOCOL</div>
      <h1 style="margin:0 0 4px;">Your Personal Health Guide</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Science-backed recommendations across 6 key longevity categories</p>
    </div>
  </div>
  ${healthGuideHTMLPDF}
  <div style="padding:10px 14px;background:#eff6ff;border-radius:6px;border:1px solid #bfdbfe;margin-top:8px;">
    <p style="font-size:10px;color:#1e40af;line-height:1.5;margin:0;"><strong>Disclaimer:</strong> Recommendations are for informational purposes only and are not a substitute for professional medical advice. Consult your healthcare provider before making significant changes to your health routine. Impact values are averages from population studies and may vary between individuals.</p>
  </div>
  <div class="page-footer">BornClock Personal Longevity Blueprint &nbsp;·&nbsp; ${name} &nbsp;·&nbsp; bornclock.com &nbsp;·&nbsp; Confidential</div>
</div>

<!-- Page 10 — PERSONALISED ACTION PLAN -->
<div class="page page-break">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">PROGRAMME</div>
      <h1 style="margin:0 0 4px;">Your Personalised 90-Day Plan</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">Based on your quiz answers — specific to your health profile, not a generic plan</p>
    </div>
  </div>

  <div style="padding:12px 16px;background:var(--blue-tint);border-radius:8px;border:1px solid #c3d9ef;margin-bottom:16px;">
    <p style="font-size:12px;color:var(--ink-soft);line-height:1.6;margin:0;">
      ${isGeneticFactor(topOpportunities[0])
        ? `Your genes allow a ceiling of <strong style="color:var(--navy);">~${geneticCeiling} yrs</strong> — you're currently <strong>${(Number(geneticCeiling) - Number(forecast)).toFixed(1)} yrs below that ceiling</strong>. The habits in this plan determine how much of your genetic potential you actually reach.`
        : `Your <strong>#1 opportunity</strong> is <strong style="color:var(--navy);">${topOpportunities[0]?.factor || 'lifestyle improvement'} (+${Number(topOpportunities[0]?.potentialGain || 0).toFixed(1)} yrs)</strong>.`}
      Addressing your top actionable opportunities could add up to <strong style="color:var(--pos);">+${actionableGainPDF} realistic years</strong> to your forecast.
    </p>
  </div>

  ${pdfActionHTML}

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-top:14px;">
    <p style="font-size:11px;color:#92400e;line-height:1.6;margin:0;">
      <strong>⚠️ Important:</strong> This plan is for informational and motivational purposes only. It is not a substitute for personalised medical advice. Always consult a qualified healthcare professional before making significant changes to your diet, exercise routine, or medications.
    </p>
  </div>

  <div class="page-footer">
    <span>BornClock Personal Longevity Blueprint · ${name}</span>
    <span>bornclock.com · ${generatedDate}</span>
  </div>
</div>

<!-- PAGE 11: SCIENTIFIC FOUNDATION -->
<div class="page">
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hairline);padding-bottom:9px;margin-bottom:14px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);">
      <span style="display:flex;align-items:center;gap:7px;">
        <img src="/bornclock-logo.png" width="14" height="14" style="object-fit:contain;display:inline-block;vertical-align:middle;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BC',style:'font-weight:800;color:#103A5C;font-size:9px;'}))" />
        BornClock Personal Longevity Blueprint
      </span>
      <span>${name}</span>
    </div>
    <div style="border-left:3px solid var(--navy);padding-left:12px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;">EVIDENCE</div>
      <h1 style="margin:0 0 4px;">Scientific Foundation</h1>
      <p style="font-size:12px;color:var(--ink-soft);margin:0;">The research behind your forecast</p>
    </div>
  </div>
  <div class="section section-blue" style="margin-bottom:16px;">
    <h2>Methodology</h2>
    <p style="font-size:12px;color:#374151;line-height:1.6;margin-bottom:8px;">
      Your forecast begins with the WHO Global Health Observatory life expectancy baseline for your country and gender. This is adjusted for 8 lifestyle and health factors drawn from peer-reviewed research, using established risk ratios and population data.
    </p>
    <p style="font-size:12px;color:#374151;line-height:1.6;">
      Epigenetic bonuses are calculated from Blue Zones research and NIH epigenetic aging studies. Genetic adjustment is based on family history of longevity-affecting conditions, calibrated against the Karolinska twin study's finding that genetics accounts for 25–30% of longevity variance.
    </p>
  </div>
  <div class="section section-green" style="margin-bottom:16px;">
    <h2>🌍 Blue Zones Power 9® Alignment — ${blueZoneCountPDF}/9 principles</h2>
    <p style="font-size:11px;color:#4b5563;line-height:1.6;margin-bottom:12px;">
      Dan Buettner's research identified 9 lifestyle principles found consistently in populations that routinely live past 100.
      Your profile aligns with <strong>${blueZoneCountPDF} of 9</strong> principles.
    </p>
    ${blueZonesHTMLPDF}
    <div style="margin-top:10px;padding:8px 12px;background:${blueZoneCountPDF >= 7 ? '#d1fae5' : blueZoneCountPDF >= 5 ? '#dcfce7' : blueZoneCountPDF >= 3 ? '#fef9c3' : '#ffedd5'};border-radius:6px;border:1px solid ${blueZoneCountPDF >= 7 ? '#a7f3d0' : blueZoneCountPDF >= 5 ? '#bbf7d0' : blueZoneCountPDF >= 3 ? '#fde68a' : '#fed7aa'};">
      <p style="font-size:11px;font-weight:700;color:${blueZoneCountPDF >= 5 ? '#166534' : blueZoneCountPDF >= 3 ? '#78350f' : '#9a3412'};margin:0;">
        ${blueZoneCountPDF >= 7 ? '🏆 Blue Zone Lifestyle — Exceptional alignment' : blueZoneCountPDF >= 5 ? '✅ Strong Alignment — Above Average' : blueZoneCountPDF >= 3 ? '🌱 Developing — Good Foundation' : '🔑 Early Stage — Significant Opportunity Ahead'}
      </p>
    </div>
  </div>

  <div class="section section-gray">
    <h2>Research Citations</h2>
    ${uniqueSources.map((s: any) => `
      <div style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:11px;color:#4b5563;">
        <span style="color:var(--navy);">●</span> ${s}
      </div>`).join('')}
    <div style="padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:11px;color:#4b5563;"><span style="color:var(--navy);">●</span> Ruby et al., Science (2018): Genetic heritability of longevity — 25–30% genetic, 70–75% lifestyle.</div>
    <div style="padding:6px 0;border-bottom:1px solid var(--hairline);font-size:11px;color:var(--ink-soft);"><span style="color:var(--navy);">●</span> Harvard Study of Adult Development (85 years): Social relationships as strongest predictor of healthy ageing.</div>
    <div style="padding:6px 0;border-bottom:1px solid var(--hairline);font-size:11px;color:var(--ink-soft);"><span style="color:var(--navy);">●</span> Horvath S., NIH (2013): DNA methylation age — lifestyle factors alter epigenetic clocks.</div>
    <div style="padding:6px 0;font-size:11px;color:var(--ink-soft);"><span style="color:var(--navy);">●</span> Buettner D., Blue Zones (2023): Power 9 lifestyle principles from centenarian populations.</div>
  </div>

  <div style="text-align:center;padding:24px 0 0;margin-top:20px;border-top:2px solid var(--navy);">
    <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;">
      <img src="/bornclock-logo.png" alt="BornClock" width="36" height="36"
           style="display:block;object-fit:contain;"
           onerror="this.style.display='none'" />
      <div style="font-size:20px;font-weight:800;color:var(--navy);letter-spacing:-.01em;">BornClock</div>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:8px;">Know your time. Live it well.</div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:10px;">bornclock.com · Evidence-based longevity analysis</div>
    <div style="font-size:10px;color:#b0b5bf;line-height:1.6;max-width:600px;margin:0 auto;">
      This report is a statistical estimate for informational and motivational purposes only. It is not a medical diagnosis, prognosis, or substitute for professional medical advice. Always consult a qualified healthcare professional before making changes to your health regimen. © 2026 BornClock · Generated ${generatedDate}
    </div>
  </div>
</div>

</body>
</html>`;

    (window as any).__LAST_PDF_HTML__ = html;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;pointer-events:none;';
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
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Required</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">Your date of birth is required to calculate your personalised life expectancy forecast.</p>
                    <Input
                      id="birthdate-life"
                      type="date"
                      value={rawDateInput}
                      onChange={handleDateChange}
                      className={`text-lg ${!birthDate ? 'ring-2 ring-primary/40' : ''}`}
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
              isPremium={isPremium}
              onDownloadBlueprint={() => handleDownloadBlueprint()}
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


        {(phase === 'result' || phase === 'report') && (
          <PageFAQ slug="life-expectancy" title="Life Expectancy Calculator FAQs" />
        )}
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
          }}
        />
      )}
    </div>
  );
};

export default LifeExpectancy;
