import { useState, useMemo, useEffect, CSSProperties } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Sparkles, TrendingUp, Crown, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LongevityResult, recalcWithOverrides, EPIGENETIC_HABITS, HABIT_DETAILS, HealthQuizData,
} from '@/services/LongevityCalculationService';

interface Props {
  result: LongevityResult;
  isPremium: boolean;
  onUpgradeClick?: () => void;
  onSimChange?: (simulatedAge: number) => void;
  userHabits?: string[];
}

// ─── Option arrays ────────────────────────────────────────────────────────────
const SMOKE_OPTS: HealthQuizData['smoking'][] = ['never', 'quit_over5', 'quit_under5', 'light', 'moderate', 'heavy'];
const SMOKE_LABELS = ['Non-smoker', 'Quit >5 yrs ago', 'Quit <5 yrs ago', 'Light', 'Moderate', 'Heavy'];

const DRINK_OPTS: HealthQuizData['drinking'][] = ['none', 'light', 'moderate', 'heavy'];
const DRINK_LABELS = ['None', 'Light', 'Moderate', 'Heavy'];

const DIET_OPTS: HealthQuizData['diet'][] = ['poor', 'average', 'good', 'excellent'];
const DIET_LABELS = ['Poor', 'Average', 'Good', 'Excellent'];

const EX_OPTS: HealthQuizData['exercise'][] = ['seldom', 'light', 'moderate', 'heavy'];
const EX_LABELS = ['Seldom', 'Light', 'Moderate', 'Heavy'];

const SLEEP_OPTS: HealthQuizData['sleepDuration'][] = ['under6', '6to7', '7to9', 'over9'];
const SLEEP_LABELS = ['<6 hrs', '6–7 hrs', '7–9 hrs', '>9 hrs'];

const BP_OPTS: HealthQuizData['bloodPressure'][] = ['high2', 'high1', 'elevated', 'normal', 'optimal'];
const BP_LABELS = ['High Stage 2', 'High Stage 1', 'Elevated', 'Normal', 'Optimal'];

// Panel 1 extras
type HydVal = 'high' | 'moderate' | 'low' | 'poor';
const HYD_OPTS: HydVal[] = ['high', 'moderate', 'low', 'poor'];
const HYD_LABELS = ['8+ glasses/day', '5–7 glasses', '3–4 glasses', '<3 glasses'];
const HYD_IMPACT: Record<HydVal, number> = { high: 0.5, moderate: 0, low: -0.3, poor: -0.8 };

type ScrVal = 'low' | 'moderate' | 'high' | 'very_high';
const SCR_OPTS: ScrVal[] = ['low', 'moderate', 'high', 'very_high'];
const SCR_LABELS = ['<2 hrs/day', '2–4 hrs', '4–6 hrs', '6+ hrs'];
const SCR_IMPACT: Record<ScrVal, number> = { low: 0, moderate: -0.3, high: -0.7, very_high: -1.2 };

type WLBVal = 'excellent' | 'good' | 'fair' | 'poor';
const WLB_OPTS: WLBVal[] = ['excellent', 'good', 'fair', 'poor'];
const WLB_LABELS = ['Excellent', 'Good', 'Fair', 'Poor'];
const WLB_IMPACT: Record<WLBVal, number> = { excellent: 0.8, good: 0.3, fair: 0, poor: -1.0 };

// Panel 3 extras
type DiabVal = 'none' | 'controlled' | 'uncontrolled';
const DIAB_OPTS: DiabVal[] = ['none', 'controlled', 'uncontrolled'];
const DIAB_LABELS = ['No diabetes', 'Well-controlled', 'Poorly controlled'];
const DIAB_IMPACT: Record<DiabVal, number> = { none: 0, controlled: -1.5, uncontrolled: -4.0 };

type HCVal = 'annual' | 'occasional' | 'rarely' | 'never';
const HC_OPTS: HCVal[] = ['annual', 'occasional', 'rarely', 'never'];
const HC_LABELS = ['Annual', 'Every 2–3 years', 'Rarely', 'Never'];
const HC_IMPACT: Record<HCVal, number> = { annual: 0.8, occasional: 0.3, rarely: -0.5, never: -1.2 };

type DCVal = 'regular' | 'occasional' | 'rarely';
const DC_OPTS: DCVal[] = ['regular', 'occasional', 'rarely'];
const DC_LABELS = ['Regular (2×/year)', 'Occasional', 'Rarely'];
const DC_IMPACT: Record<DCVal, number> = { regular: 0.4, occasional: 0, rarely: -0.6 };

type MHVal = 'active' | 'managing' | 'struggling';
const MH_OPTS: MHVal[] = ['active', 'managing', 'struggling'];
const MH_LABELS = ['Active support / therapy', 'Managing independently', 'Struggling without support'];
const MH_IMPACT: Record<MHVal, number> = { active: 0.5, managing: 0, struggling: -1.5 };

// Panel 4
type RelVal = 'married' | 'stable' | 'single' | 'divorced';
const REL_OPTS: RelVal[] = ['married', 'stable', 'single', 'divorced'];
const REL_LABELS = ['Married / long-term partner', 'Stable relationship', 'Single', 'Divorced / widowed'];
const REL_IMPACT: Record<RelVal, number> = { married: 1.5, stable: 0.5, single: 0, divorced: -0.8 };

type PetVal = 'yes' | 'no';
const PET_OPTS: PetVal[] = ['yes', 'no'];
const PET_LABELS = ['Yes', 'No'];
const PET_IMPACT: Record<PetVal, number> = { yes: 0.4, no: 0 };

type MentVal = 'active' | 'occasional' | 'none';
const MENT_OPTS: MentVal[] = ['active', 'occasional', 'none'];
const MENT_LABELS = ['Actively mentor others', 'Occasionally', 'Not applicable'];
const MENT_IMPACT: Record<MentVal, number> = { active: 0.6, occasional: 0.2, none: 0 };

type CSVal = 'up_to_date' | 'partial' | 'never';
const CS_OPTS: CSVal[] = ['up_to_date', 'partial', 'never'];
const CS_LABELS = ['Up to date', 'Partially up to date', 'Never screened'];
const CS_IMPACT: Record<CSVal, number> = { up_to_date: 0.5, partial: 0, never: -0.8 };

type AQVal = 'clean' | 'moderate' | 'polluted';
const AQ_OPTS: AQVal[] = ['clean', 'moderate', 'polluted'];
const AQ_LABELS = ['Clean air / rural', 'Moderate pollution', 'High pollution / urban'];
const AQ_IMPACT: Record<AQVal, number> = { clean: 0.3, moderate: 0, polluted: -1.5 };

type ComVal = 'none' | 'low' | 'moderate' | 'high';
const COM_OPTS: ComVal[] = ['none', 'low', 'moderate', 'high'];
const COM_LABELS = ['No commute / WFH', 'Low stress commute', 'Moderate stress', 'High stress daily'];
const COM_IMPACT: Record<ComVal, number> = { none: 0.2, low: 0, moderate: -0.3, high: -0.8 };

const BLUE_ZONE_IDS = new Set(['walking', 'community', 'wholefood', 'purpose', 'spiritual', 'gardening', 'fasting', 'laughter', 'meditation']);

// ─── Habit frequency types ────────────────────────────────────────────────────
type FreqLevel = 'never' | 'occasionally' | 'regularly' | 'daily';
const FREQ_MULT: Record<FreqLevel, number> = { never: 0, occasionally: 0.30, regularly: 0.65, daily: 1.0 };
const FREQ_LABELS_DISPLAY: Record<FreqLevel, string> = {
  never: 'Never', occasionally: 'Occasionally', regularly: 'Regularly', daily: 'Daily',
};

const HABIT_GROUPS = [
  { label: '🏃 Physical Habits', ids: ['walking', 'gardening', 'cold'] },
  { label: '🧠 Mental & Social Habits', ids: ['community', 'laughter', 'meditation', 'purpose', 'volunteer', 'spiritual'] },
  { label: '🥗 Nutritional Habits', ids: ['wholefood', 'fasting', 'learning'] },
];

const HALE_TABLE: Record<string, number> = {
  India: 58.5, 'United States': 66.1, 'United Kingdom': 68.9, Australia: 70.9, Canada: 69.4,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function catIdx<T extends string>(opts: T[], val: T): number {
  const i = opts.indexOf(val);
  return i >= 0 ? i : 0;
}

function gainAnchor(yearGain: number): string {
  if (yearGain >= 1.5) return '3 more FIFA World Cups to watch';
  if (yearGain >= 1.0) return 'watching one more Olympic Games';
  if (yearGain >= 0.5) return '730 more weekends with family';
  if (yearGain > 0)   return 'seeing your family reach their next milestone';
  return '';
}

function ImpactBadge({ impact }: { impact: number }) {
  if (impact === 0) return <span className="text-[10px] text-muted-foreground tabular-nums">0 yr</span>;
  return (
    <Badge variant="outline" className={`text-[10px] font-bold tabular-nums px-1.5 ${impact > 0 ? 'text-green-600 border-green-400' : 'text-red-500 border-red-400'}`}>
      {impact > 0 ? '+' : ''}{impact.toFixed(1)} yr
    </Badge>
  );
}

function SliderRow({
  label, opts, labels, val, set, impact, tooltip, optimalIdx,
}: {
  label: string; opts: string[]; labels: string[]; val: number;
  set: (v: number) => void; impact: number; tooltip?: string; optimalIdx?: number;
}) {
  const isOptimal = optimalIdx !== undefined && val === optimalIdx;
  const inner = (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center gap-1">
        <Label className={`text-xs font-bold ${tooltip ? 'cursor-help underline decoration-dotted' : ''}`}>{label}</Label>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-[10px]">{labels[val]}</Badge>
          {isOptimal
            ? <span className="text-[10px] text-green-600 font-bold">✅ Optimal!</span>
            : <ImpactBadge impact={impact} />
          }
        </div>
      </div>
      <Slider value={[val]} onValueChange={(v) => set(v[0])} max={opts.length - 1} min={0} step={1} />
    </div>
  );
  if (!tooltip) return inner;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><div>{inner}</div></TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs p-2">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export const WhatIfSimulator = ({ result, isPremium, onSimChange }: Props) => {
  const q = result.quizSnapshot;

  // Panel 1 — pre-loaded from quiz; extras default to population averages
  const [iSmoke, setSmoke] = useState(() => catIdx(SMOKE_OPTS, q.smoking || 'never'));
  const [iDrink, setDrink] = useState(() => catIdx(DRINK_OPTS, q.drinking || 'none'));
  const [iDiet,  setDiet]  = useState(() => catIdx(DIET_OPTS,  q.diet    || 'average'));
  const [iEx,    setEx]    = useState(() => catIdx(EX_OPTS,    q.exercise || 'moderate'));
  const [iHyd,   setHyd]   = useState(1);  // moderate (population average)
  const [iScr,   setScr]   = useState(1);  // moderate (population average)
  const [iWlb,   setWlb]   = useState(2);  // fair (population average)

  // Panel 2 — habit frequencies
  const [habitFreqs, setHabitFreqs] = useState<Record<string, FreqLevel>>(() =>
    Object.fromEntries(EPIGENETIC_HABITS.map(h => [h.id, 'never' as FreqLevel]))
  );
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  // Panel 3 — pre-loaded from quiz; extras default to population averages
  const [iSleep,  setSleep]  = useState(() => catIdx(SLEEP_OPTS, q.sleepDuration || '7to9'));
  const [iBP,     setBP]     = useState(() => catIdx(BP_OPTS,    q.bloodPressure || 'normal'));
  const [stress,  setStress] = useState(q.stress);
  const [bmi,     setBmi]    = useState(q.bmi);
  const [iDiab,   setDiab]   = useState(() => {
    if (q.diabetes) return q.diabetesControlled ? 1 : 2;
    return 0; // none
  });
  const [iHC, setHC] = useState(1);   // occasional (population average)
  const [iDC, setDC] = useState(1);   // occasional (population average)
  const [iMH, setMH] = useState(1);   // managing (population average)

  // Panel 4 — all population averages (not best-case defaults)
  const [iRel,  setRel]  = useState(2);  // single (neutral)
  const [iPet,  setPet]  = useState(1);  // no (default)
  const [iMent, setMent] = useState(2);  // none (default)
  const [iCS,   setCS]   = useState(1);  // partial (population average)
  const [iAQ,   setAQ]   = useState(1);  // moderate (population average)
  const [iCom,  setCom]  = useState(2);  // moderate (population average)

  const simForecast = useMemo(() => {
    const epigenBonus = Math.min(6, EPIGENETIC_HABITS.reduce((s, h) => {
      const freq = habitFreqs[h.id] ?? 'never';
      return s + h.gain * FREQ_MULT[freq];
    }, 0));
    return recalcWithOverrides(result, {
      smoking:            SMOKE_OPTS[iSmoke],
      drinking:           DRINK_OPTS[iDrink],
      diet:               DIET_OPTS[iDiet],
      exercise:           EX_OPTS[iEx],
      sleepDuration:      SLEEP_OPTS[iSleep],
      bloodPressure:      BP_OPTS[iBP],
      stress, bmi,
      selectedHabits:     [],
      epigeneticBonusOverride: epigenBonus,
      hydration:          HYD_OPTS[iHyd],
      screenTime:         SCR_OPTS[iScr],
      workLifeBalance:    WLB_OPTS[iWlb],
      diabetesManagement: DIAB_OPTS[iDiab],
      healthCheckups:     HC_OPTS[iHC],
      dentalCare:         DC_OPTS[iDC],
      mentalHealth:       MH_OPTS[iMH],
      relationship:       REL_OPTS[iRel],
      petOwnership:       PET_OPTS[iPet],
      mentoring:          MENT_OPTS[iMent],
      cancerScreening:    CS_OPTS[iCS],
      airQuality:         AQ_OPTS[iAQ],
      commuteStress:      COM_OPTS[iCom],
    });
  }, [iSmoke, iDrink, iDiet, iEx, iSleep, iBP, stress, bmi, habitFreqs,
      iHyd, iScr, iWlb, iDiab, iHC, iDC, iMH, iRel, iPet, iMent, iCS, iAQ, iCom]);

  const delta = Math.round((simForecast - result.totalForecast) * 10) / 10;

  const habitBonusTotal = Math.round(Math.min(6, EPIGENETIC_HABITS.reduce((s, h) => {
    const freq = habitFreqs[h.id] ?? 'never';
    return s + h.gain * FREQ_MULT[freq];
  }, 0)) * 10) / 10;

  const habitsActive = EPIGENETIC_HABITS.filter(h => (habitFreqs[h.id] ?? 'never') !== 'never').length;
  const habitsRegularPlus = EPIGENETIC_HABITS.filter(h => {
    const f = habitFreqs[h.id] ?? 'never';
    return f === 'regularly' || f === 'daily';
  }).length;
  const allDaily = EPIGENETIC_HABITS.every(h => (habitFreqs[h.id] ?? 'never') === 'daily');

  const celebrationMsg = allDaily
    ? "🏆 Blue Zone status achieved! You've matched the habits of centenarian populations"
    : habitsRegularPlus >= 5
    ? "🌟 You're in the top 20% of longevity optimizers"
    : habitsRegularPlus >= 3
    ? "💪 You're now above average for your age group"
    : habitsActive >= 1
    ? "🔥 You just unlocked your first longevity habit!"
    : null;

  const blueZoneCount = [...BLUE_ZONE_IDS].filter(id => {
    const f = habitFreqs[id] ?? 'never';
    return f === 'regularly' || f === 'daily';
  }).length;

  const hasFamilyData = Object.values(result.pillar1Snapshot).some(
    m => !m.dontKnow && m.age > 0 && m.isLiving !== null
  );

  const hale = HALE_TABLE[q.country] ?? 63.0;

  useEffect(() => { onSimChange?.(simForecast); }, [simForecast]);

  const blurStyle: CSSProperties = !isPremium
    ? { filter: 'blur(8px)', userSelect: 'none', cursor: 'default' }
    : {};

  const setHabitFreq = (id: string, freq: FreqLevel) =>
    setHabitFreqs(prev => ({ ...prev, [id]: freq }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">🔬 Your Longevity Laboratory</p>
              <p className="text-sm text-muted-foreground mt-0.5">Your quiz results are pre-loaded. Explore what happens when you change any factor — see the impact on your projected lifespan in real time.</p>
            </div>
            <div className="flex items-center gap-6 shrink-0 flex-wrap justify-end">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Lifestyle</span>
                <strong className="text-2xl font-black text-muted-foreground">{result.totalForecast} yrs</strong>
              </div>
              <TrendingUp className="w-5 h-5 text-primary hidden sm:block" />
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-primary block">Optimized Lifestyle</span>
                <div className="relative">
                  <strong className="text-3xl font-black text-primary" style={blurStyle}>{simForecast} yrs</strong>
                  {!isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Unlock
                    </div>
                  )}
                </div>
              </div>
              {delta !== 0 && (
                <div className={`font-black px-3 py-1.5 rounded-lg text-sm border ${delta >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {delta >= 0 ? '⚡' : '⚠️'} {delta >= 0 ? '+' : ''}{delta} yrs
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4 Panels ── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Panel 1 — Lifestyle Habits */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">🏃 Lifestyle Habits</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <p className="text-[10px] text-muted-foreground italic border-l-2 border-primary/30 pl-2 -mt-1">
              ✓ Pre-loaded from your quiz answers. Move any slider to explore 'what if I changed this?'
            </p>
            <SliderRow label="Tobacco Smoking" opts={SMOKE_OPTS} labels={SMOKE_LABELS} val={iSmoke} set={setSmoke}
              impact={iSmoke === 0 ? 0 : iSmoke === 1 ? -1 : iSmoke === 2 ? -2 : iSmoke === 3 ? -3 : iSmoke === 4 ? -7 : -12}
              optimalIdx={0}
              tooltip="WHO, 2023: Smoking is the leading preventable cause of death worldwide. Heavy smokers lose 10–12 years on average."
            />
            <SliderRow label="Alcohol Consumption" opts={DRINK_OPTS} labels={DRINK_LABELS} val={iDrink} set={setDrink}
              impact={[0, 1, -1, -6][iDrink] ?? 0}
              optimalIdx={0}
              tooltip="CDC, 2023: No level of alcohol is safe for cancer risk."
            />
            <SliderRow label="Diet Quality" opts={DIET_OPTS} labels={DIET_LABELS} val={iDiet} set={setDiet}
              impact={[-3, 0, 2, 4][iDiet] ?? 0}
              optimalIdx={3}
              tooltip="Harvard: nutrient-dense diet can add 4+ healthy years."
            />
            <SliderRow label="Physical Exercise" opts={EX_OPTS} labels={EX_LABELS} val={iEx} set={setEx}
              impact={[-2, 1, 3, 5][iEx] ?? 0}
              optimalIdx={3}
              tooltip="WHO, 2022: Moderate exercise reduces all-cause mortality by 31%."
            />
            <SliderRow label="Hydration" opts={HYD_OPTS} labels={HYD_LABELS} val={iHyd} set={setHyd}
              impact={HYD_IMPACT[HYD_OPTS[iHyd]]}
              optimalIdx={0}
              tooltip="EFSA 2010: Adequate hydration is linked to better cardiovascular and kidney function."
            />
            <SliderRow label="Screen Time (non-work)" opts={SCR_OPTS} labels={SCR_LABELS} val={iScr} set={setScr}
              impact={SCR_IMPACT[SCR_OPTS[iScr]]}
              optimalIdx={0}
              tooltip="BMJ Open 2019: Excessive recreational screen time increases sedentary behaviour and cardiovascular risk."
            />
            <SliderRow label="Work-Life Balance" opts={WLB_OPTS} labels={WLB_LABELS} val={iWlb} set={setWlb}
              impact={WLB_IMPACT[WLB_OPTS[iWlb]]}
              optimalIdx={0}
              tooltip="Lancet 2015: Working 55+ hours/week increases stroke risk by 33% and coronary heart disease by 13%."
            />
          </CardContent>
        </Card>

        {/* Panel 2 — Epigenetic Habits (frequency-based) */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">🌿 Habits You Could Adopt</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Evidence-based practices — select how consistently you practice each one
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {HABIT_GROUPS.map(group => (
              <div key={group.label} className="space-y-2">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b pb-1">{group.label}</h5>
                {group.ids.map(id => {
                  const habit = EPIGENETIC_HABITS.find(h => h.id === id);
                  if (!habit) return null;
                  const freq = habitFreqs[id] ?? 'never';
                  const gainAmt = Math.round(habit.gain * FREQ_MULT[freq] * 10) / 10;
                  const anchor = gainAnchor(gainAmt);
                  const isExpanded = expandedHabit === id;
                  const freqLevels: FreqLevel[] = ['never', 'occasionally', 'regularly', 'daily'];

                  return (
                    <div key={id} className="border rounded-lg p-2.5 space-y-2 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{habit.emoji} {habit.label}</span>
                        <button
                          onClick={() => setExpandedHabit(isExpanded ? null : id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <Info className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>

                      {/* Frequency buttons */}
                      <div className="grid grid-cols-4 gap-1">
                        {freqLevels.map(f => (
                          <button
                            key={f}
                            onClick={() => setHabitFreq(id, f)}
                            className={`text-[9px] py-1 rounded border font-semibold transition-colors ${
                              freq === f
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-muted hover:border-primary/40 hover:text-foreground'
                            }`}
                          >
                            {FREQ_LABELS_DISPLAY[f]}
                          </button>
                        ))}
                      </div>

                      {/* Impact + anchor */}
                      <div className="flex items-center justify-between text-[10px]">
                        {gainAmt > 0 ? (
                          <>
                            <span className="text-green-600 font-bold">Impact: +{gainAmt} years</span>
                            {anchor && <span className="text-muted-foreground italic">{anchor}</span>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Select a frequency to see impact</span>
                        )}
                      </div>

                      {/* Expandable detail */}
                      {isExpanded && (
                        <div className="bg-muted/40 rounded p-2 space-y-1.5 border-t text-[10px]">
                          <p className="text-muted-foreground leading-relaxed">{HABIT_DETAILS[id] ?? habit.source}</p>
                          <div className="flex gap-3 text-muted-foreground pt-0.5">
                            <span>Most people your age: <strong className="text-foreground">Occasionally</strong></span>
                            <span>Blue Zone centenarians: <strong className="text-foreground">Daily</strong></span>
                          </div>
                          {freq !== 'daily' && (
                            <p className="text-primary font-semibold">
                              → Upgrade to Daily: unlock +{Math.round((habit.gain * FREQ_MULT.daily - gainAmt) * 10) / 10} more years
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Running totals */}
            <div className="pt-2 space-y-1.5 border-t">
              <p className="text-xs font-bold text-primary">
                Your habit changes are adding +{habitBonusTotal} years to your forecast (cap: +6 years)
              </p>
              <p className="text-[10px] text-muted-foreground">
                You have aligned with <strong className="text-foreground">{blueZoneCount} of 9</strong> Blue Zone Power 9® principles
                {blueZoneCount >= 7 && <span className="text-blue-600 font-semibold"> 🌍 Outstanding!</span>}
              </p>
              {celebrationMsg && (
                <p className="text-[10px] font-bold text-green-700 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded px-2 py-1">
                  {celebrationMsg}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel 3 — Health Metrics */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">❤️ Health Metrics</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <p className="text-[10px] text-muted-foreground italic border-l-2 border-primary/30 pl-2 -mt-1">
              ✓ Pre-loaded from your quiz answers. Move any slider to explore 'what if I changed this?'
            </p>
            <SliderRow label="Sleep Duration" opts={SLEEP_OPTS} labels={SLEEP_LABELS} val={iSleep} set={setSleep}
              impact={[-2, -0.5, 0, -1][iSleep] ?? 0} optimalIdx={2}
              tooltip="NHS/National Sleep Foundation, 2023: <6 hrs/night carries a 12% higher all-cause mortality risk."
            />
            <SliderRow label="Blood Pressure" opts={BP_OPTS} labels={BP_LABELS} val={iBP} set={setBP}
              impact={[-5, -2.5, -1, 0, 1.5][iBP] ?? 0} optimalIdx={4}
              tooltip="JNC8/AHA Guidelines, 2023: Optimal BP reduces stroke and heart attack risk significantly."
            />
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">BMI: {bmi.toFixed(1)}</Label>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}</Badge>
                  {bmi >= 18.5 && bmi < 25
                    ? <span className="text-[10px] text-green-600 font-bold">✅ Optimal!</span>
                    : <ImpactBadge impact={bmi < 18.5 ? -2 : bmi > 30 ? -3 : bmi > 25 ? -1 : 0} />
                  }
                </div>
              </div>
              <Slider value={[bmi]} onValueChange={(v) => setBmi(v[0])} max={40} min={15} step={0.5} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">Stress Level: {stress}/10</Label>
                {stress <= 2
                  ? <span className="text-[10px] text-green-600 font-bold">✅ Optimal!</span>
                  : <ImpactBadge impact={stress >= 8 ? -2.5 : stress >= 5 ? -0.5 : stress >= 3 ? 1 : 1.5} />
                }
              </div>
              <Slider value={[stress]} onValueChange={(v) => setStress(v[0])} max={10} min={1} step={1} />
            </div>
            <SliderRow label="Diabetes Management" opts={DIAB_OPTS} labels={DIAB_LABELS} val={iDiab} set={setDiab}
              impact={DIAB_IMPACT[DIAB_OPTS[iDiab]]} optimalIdx={0}
              tooltip="ADA 2023: Well-controlled blood sugar reduces cardiovascular complications by up to 50%."
            />
            <SliderRow label="Regular Health Checkups" opts={HC_OPTS} labels={HC_LABELS} val={iHC} set={setHC}
              impact={HC_IMPACT[HC_OPTS[iHC]]} optimalIdx={0}
              tooltip="CDC prevention statistics: early detection through regular checkups saves significant healthy life years."
            />
            <SliderRow label="Dental Care" opts={DC_OPTS} labels={DC_LABELS} val={iDC} set={setDC}
              impact={DC_IMPACT[DC_OPTS[iDC]]} optimalIdx={0}
              tooltip="ADA/AHA joint statement: gum disease increases heart disease risk by up to 300%."
            />
            <SliderRow label="Mental Health Support" opts={MH_OPTS} labels={MH_LABELS} val={iMH} set={setMH}
              impact={MH_IMPACT[MH_OPTS[iMH]]} optimalIdx={0}
              tooltip="Lancet Psychiatry 2019: untreated mental health conditions reduce life expectancy by 10–20 years."
            />
          </CardContent>
        </Card>

        {/* Panel 4 — Social & Preventive Factors */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">👥 Social &amp; Preventive Factors</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <SliderRow label="Relationship Status" opts={REL_OPTS} labels={REL_LABELS} val={iRel} set={setRel}
              impact={REL_IMPACT[REL_OPTS[iRel]]} optimalIdx={0}
              tooltip="Harvard Study of Adult Development: long-term partnership adds 1.5 years on average (80-year study)."
            />
            <SliderRow label="Pet Ownership" opts={PET_OPTS} labels={PET_LABELS} val={iPet} set={setPet}
              impact={PET_IMPACT[PET_OPTS[iPet]]} optimalIdx={0}
              tooltip="AHA 2022: pet ownership reduces cardiovascular risk by 31% and lowers blood pressure."
            />
            <SliderRow label="Mentoring / Grandparenting" opts={MENT_OPTS} labels={MENT_LABELS} val={iMent} set={setMent}
              impact={MENT_IMPACT[MENT_OPTS[iMent]]} optimalIdx={0}
              tooltip="Journal of Aging: active mentoring and grandparenting reduces mortality risk by 37%."
            />
            <SliderRow label="Cancer Screening" opts={CS_OPTS} labels={CS_LABELS} val={iCS} set={setCS}
              impact={CS_IMPACT[CS_OPTS[iCS]]} optimalIdx={0}
              tooltip="CDC: regular cancer screening reduces cancer mortality by 20–30% through early detection."
            />
            <SliderRow label="Air Quality / Pollution" opts={AQ_OPTS} labels={AQ_LABELS} val={iAQ} set={setAQ}
              impact={AQ_IMPACT[AQ_OPTS[iAQ]]} optimalIdx={0}
              tooltip="WHO 2022: air pollution reduces life expectancy by up to 2 years in high-pollution areas."
            />
            <SliderRow label="Commute Stress" opts={COM_OPTS} labels={COM_LABELS} val={iCom} set={setCom}
              impact={COM_IMPACT[COM_OPTS[iCom]]} optimalIdx={0}
              tooltip="British Medical Journal: high-stress commuting increases cardiovascular risk equivalent to −0.8 years."
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Summary & Motivating Comparisons ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 space-y-5">
          {/* Simplified 3-number display */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Current Lifestyle</p>
              <strong className="text-3xl font-black text-muted-foreground">{result.totalForecast} yrs</strong>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Optimized Lifestyle</p>
              <strong className="text-3xl font-black text-primary" style={blurStyle}>{simForecast} yrs</strong>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-green-600 tracking-widest">Potential Gain</p>
              <strong className={`text-3xl font-black ${delta > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {delta > 0 ? '+' : ''}{delta} yrs
              </strong>
            </div>
          </div>

          {/* Gain celebration */}
          <div className={`rounded-lg px-4 py-2.5 text-xs font-medium ${
            delta > 15 ? 'bg-green-100 text-green-800 border border-green-200' :
            delta > 10 ? 'bg-green-50 text-green-700 border border-green-100' :
            delta > 5  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
            delta > 0  ? 'bg-muted/60 text-muted-foreground border border-muted' :
                         'bg-muted/40 text-muted-foreground'
          }`}>
            {delta > 15
              ? "🎉 Outstanding! You've unlocked 15+ additional years — that's an entire extra chapter of life waiting for you."
              : delta > 10
              ? "🎊 Impressive! A decade of extra healthy life is within reach through these evidence-based changes."
              : delta > 5
              ? "👏 Great potential! Every year counts — these changes could give you 5–10 more healthy years."
              : delta > 0
              ? "✅ You're already doing well! These changes would add meaningful quality years to your life."
              : "Fine-tune your settings above to discover your full longevity potential."}
          </div>

          {/* 📊 Comparisons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              📊 How Your Optimized Forecast Compares:
            </h4>
            <div className="space-y-2">
              {/* WHO baseline */}
              <div className="flex items-center justify-between text-xs bg-background rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">
                  WHO baseline ({q.gender || 'global'}, {q.country || 'average'})
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <strong className="font-bold">{result.baselineLifeExpectancy} yrs</strong>
                  {simForecast > result.baselineLifeExpectancy
                    ? <span className="text-[10px] text-green-600 font-bold">+{Math.round((simForecast - result.baselineLifeExpectancy) * 10) / 10} yrs above 🟢</span>
                    : <span className="text-[10px] text-red-500">↓ below baseline</span>
                  }
                </div>
              </div>

              {/* Family genetic baseline */}
              {hasFamilyData && (
                <div className="flex items-center justify-between text-xs bg-background rounded-lg border px-3 py-2">
                  <span className="text-muted-foreground">Your family's genetic baseline</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <strong className="font-bold">~{Math.round(result.familyBaselineAge)} yrs</strong>
                    <span className="text-[10px] text-muted-foreground">
                      {simForecast >= result.familyBaselineAge
                        ? '✅ Matching / exceeding heritage'
                        : `→ ${Math.round(result.familyBaselineAge - simForecast)} yrs to reach heritage`}
                    </span>
                  </div>
                </div>
              )}

              {/* HALE */}
              <div className="flex items-center justify-between text-xs bg-background rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">
                  Healthy Life Expectancy (HALE, {q.country || 'global'})
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <strong className="font-bold">{hale} yrs</strong>
                  {simForecast > hale
                    ? <span className="text-[10px] text-green-600 font-bold">+{Math.round((simForecast - hale) * 10) / 10} yrs above 🟢</span>
                    : <span className="text-[10px] text-orange-500">Improving toward healthy average</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Motivating tier */}
          {isPremium && (() => {
            const diff = simForecast - result.baselineLifeExpectancy;
            const [tierClass, tierText] =
              diff > 10 ? ['bg-emerald-50 text-emerald-800 border-emerald-200',
                "🌟 Exceptional — You are on track to significantly outlive the average person in your country. Your lifestyle choices are extraordinary."] :
              diff > 5  ? ['bg-green-50 text-green-700 border-green-100',
                "✨ Above Average — With these changes, you would live meaningfully longer than most people in your country."] :
              diff >= 0 ? ['bg-blue-50 text-blue-700 border-blue-100',
                "💪 On Track — You're matching or slightly exceeding national averages. The simulator shows you have real potential to go further."] :
                          ['bg-orange-50 text-orange-700 border-orange-100',
                "🔑 Opportunity Ahead — These changes can get you back above national averages. Remember: lifestyle controls 70–75% of outcomes."];
            return (
              <div className={`rounded-lg px-4 py-2.5 text-xs border ${tierClass}`}>
                {tierText}
              </div>
            );
          })()}

          {/* Family comparison */}
          {isPremium && hasFamilyData && (
            <p className="text-xs text-muted-foreground">
              {simForecast > result.familyBaselineAge
                ? `🧬 Your optimized lifestyle would allow you to EXCEED your family's genetic heritage — proof that your habits can override your genes.`
                : `🧬 Your family lived to ~${Math.round(result.familyBaselineAge)} years on average. These changes put you within reach of your genetic potential.`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Factor Breakdown ── */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Factor Breakdown — Sorted by Potential Gain
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid sm:grid-cols-2 gap-2">
            {result.factorBreakdown.slice(0, 10).map((f, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${f.currentImpact >= 0 ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1.5 font-medium cursor-help">
                        <span>{f.emoji}</span><span>{f.factor}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs p-2">{f.source}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-2 shrink-0">
                  <span style={blurStyle}><ImpactBadge impact={f.currentImpact} /></span>
                  {f.potentialGain > 0 && (
                    <span className="text-[9px] text-green-600" style={blurStyle}>+{f.potentialGain}yr possible</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Upgrade CTA ── */}
      {!isPremium && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-5 text-center space-y-3">
            <Crown className="w-6 h-6 text-accent mx-auto" />
            <p className="font-bold text-foreground">
              🔒 Unlock the full comparison breakdown and personalized report.
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              See exact scores, your comparison against WHO and HALE baselines, and download your complete Longevity Blueprint.
            </p>
            <Link to="/upgrade">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-6">
                Unlock Full Report — ₹499 · $6.99
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
