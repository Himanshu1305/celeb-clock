import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Sparkles, TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LongevityResult, recalcWithOverrides, EPIGENETIC_HABITS, HealthQuizData } from '@/services/LongevityCalculationService';

interface Props {
  result: LongevityResult;
  isPremium: boolean;
  onUpgradeClick?: () => void;
  onGenerateReport: () => void;
}

// Map categorical values to slider index and back
const SMOKE_OPTS: HealthQuizData['smoking'][] = ['never', 'light', 'moderate', 'heavy'];
const DRINK_OPTS: HealthQuizData['drinking'][] = ['none', 'light', 'moderate', 'heavy'];
const DIET_OPTS: HealthQuizData['diet'][] = ['poor', 'average', 'good', 'excellent'];
const EX_OPTS: HealthQuizData['exercise'][] = ['seldom', 'light', 'moderate', 'heavy'];
const SLEEP_OPTS: HealthQuizData['sleepDuration'][] = ['under6', '6to7', '7to9', 'over9'];
const BP_OPTS: HealthQuizData['bloodPressure'][] = ['high2', 'high1', 'elevated', 'normal', 'optimal'];
const SMOKE_LABELS = ['Non-smoker', 'Light', 'Moderate', 'Heavy'];
const DRINK_LABELS = ['None', 'Light', 'Moderate', 'Heavy'];
const DIET_LABELS  = ['Poor', 'Average', 'Good', 'Excellent'];
const EX_LABELS    = ['Seldom', 'Light', 'Moderate', 'Heavy'];
const SLEEP_LABELS = ['<6 hrs', '6–7 hrs', '7–9 hrs', '>9 hrs'];
const BP_LABELS    = ['High Stage 2', 'High Stage 1', 'Elevated', 'Normal', 'Optimal'];

function catIdx<T extends string>(opts: T[], val: T): number {
  const i = opts.indexOf(val);
  return i >= 0 ? i : 0;
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-[10px] text-muted-foreground tabular-nums">0 yr</span>;
  return (
    <Badge variant="outline" className={`text-[10px] font-bold tabular-nums px-1.5 ${delta > 0 ? 'text-green-600 border-green-400' : 'text-red-500 border-red-400'}`}>
      {delta > 0 ? '+' : ''}{delta.toFixed(1)} yr
    </Badge>
  );
}

export const WhatIfSimulator = ({ result, isPremium, onUpgradeClick, onGenerateReport }: Props) => {
  const q = result.quizSnapshot;

  // Slider states (index into option arrays)
  const [iSmoke,    setSmoke]   = useState(() => catIdx(SMOKE_OPTS, q.smoking  || 'never'));
  const [iDrink,    setDrink]   = useState(() => catIdx(DRINK_OPTS, q.drinking || 'none'));
  const [iDiet,     setDiet]    = useState(() => catIdx(DIET_OPTS,  q.diet     || 'average'));
  const [iEx,       setEx]      = useState(() => catIdx(EX_OPTS,    q.exercise || 'moderate'));
  const [iSleep,    setSleep]   = useState(() => catIdx(SLEEP_OPTS, q.sleepDuration || '7to9'));
  const [iBP,       setBP]      = useState(() => catIdx(BP_OPTS,    q.bloodPressure  || 'normal'));
  const [stress,    setStress]  = useState(q.stress);
  const [bmi,       setBmi]     = useState(q.bmi);
  const [habits,    setHabits]  = useState<string[]>(result.selectedHabits);

  const toggleHabit = (id: string) =>
    setHabits(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);

  const simForecast = useMemo(() => recalcWithOverrides(result, {
    smoking:         SMOKE_OPTS[iSmoke],
    drinking:        DRINK_OPTS[iDrink],
    diet:            DIET_OPTS[iDiet],
    exercise:        EX_OPTS[iEx],
    sleepDuration:   SLEEP_OPTS[iSleep],
    bloodPressure:   BP_OPTS[iBP],
    stress, bmi, selectedHabits: habits,
  }), [iSmoke, iDrink, iDiet, iEx, iSleep, iBP, stress, bmi, habits]);

  const delta = Math.round((simForecast - result.totalForecast) * 10) / 10;
  const habitBonus = Math.min(6, habits.reduce((s, id) => s + (EPIGENETIC_HABITS.find(h => h.id === id)?.gain ?? 0), 0));

  const blurCls = isPremium ? '' : 'blur-[8px] select-none pointer-events-none';

  // Max potential is all sliders optimal
  const maxSim = useMemo(() => recalcWithOverrides(result, {
    smoking: 'never', drinking: 'none', diet: 'excellent', exercise: 'heavy',
    sleepDuration: '7to9', bloodPressure: 'optimal', stress: 1, bmi: 22,
    selectedHabits: EPIGENETIC_HABITS.map(h => h.id),
  }), [result]);

  const pctOfMax = Math.min(100, Math.round((simForecast / maxSim) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">What-If Simulator</p>
              <p className="text-sm text-muted-foreground mt-0.5">Adjust sliders to see how lifestyle changes impact your forecast in real time</p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Your Forecast</span>
                <strong className={`text-2xl font-black text-muted-foreground ${blurCls}`}>{result.totalForecast} yrs</strong>
              </div>
              <TrendingUp className="w-5 h-5 text-primary hidden sm:block" />
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-primary block">Simulated</span>
                <div className="relative">
                  <strong className={`text-3xl font-black text-primary ${blurCls}`}>{simForecast} yrs</strong>
                  {!isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Unlock to read
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Section 1: Lifestyle Habits */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">🏃 Lifestyle Habits</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {[
              { label: 'Tobacco Smoking', opts: SMOKE_LABELS, val: iSmoke, set: setSmoke, src: 'WHO, 2023: Smoking is the leading preventable cause of death worldwide' },
              { label: 'Alcohol Consumption', opts: DRINK_LABELS, val: iDrink, set: setDrink, src: 'CDC, 2023: No level of alcohol is safe for cancer risk' },
              { label: 'Diet Quality', opts: DIET_LABELS, val: iDiet, set: setDiet, src: 'Harvard: nutrient-dense diet can add 4+ healthy years' },
              { label: 'Physical Exercise', opts: EX_LABELS, val: iEx, set: setEx, src: 'WHO, 2022: Moderate exercise reduces all-cause mortality by 31%' },
            ].map(({ label, opts, val, set, src }) => {
              const base = recalcWithOverrides(result, {
                smoking: SMOKE_OPTS[val === iSmoke ? val : iSmoke],
                drinking: DRINK_OPTS[val === iDrink ? val : iDrink],
              });
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                      <Label className="text-xs font-bold cursor-help">{label}</Label>
                    </TooltipTrigger><TooltipContent className="max-w-xs text-xs p-2">{src}</TooltipContent></Tooltip></TooltipProvider>
                    <Badge variant="outline" className="text-[10px]">{opts[val]}</Badge>
                  </div>
                  <Slider value={[val]} onValueChange={(v) => set(v[0])} max={opts.length - 1} min={0} step={1} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Section 2: Epigenetic Habits */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">🌱 Epigenetic Habits</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {EPIGENETIC_HABITS.slice(0, 8).map((h) => (
              <div key={h.id} onClick={() => toggleHabit(h.id)} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs hover:border-primary/40 ${habits.includes(h.id) ? 'bg-primary/5 border-primary/30' : 'border-transparent'}`}>
                <Checkbox checked={habits.includes(h.id)} onCheckedChange={() => {}} className="w-3 h-3" />
                <span className="flex-1 font-medium pointer-events-none">{h.emoji} {h.label}</span>
                <TooltipProvider><Tooltip><TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[9px] text-green-600 border-green-400 cursor-help shrink-0">+{h.gain}yr</Badge>
                </TooltipTrigger><TooltipContent className="max-w-xs text-xs p-2">{h.source}</TooltipContent></Tooltip></TooltipProvider>
              </div>
            ))}
            {habitBonus > 0 && (
              <p className="text-xs font-bold text-primary pt-1">Habit bonus: +{habitBonus.toFixed(1)} yrs (cap: +6)</p>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Health Metrics */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">❤️ Health Metrics</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">Sleep Duration</Label>
                <Badge variant="outline" className="text-[10px]">{SLEEP_LABELS[iSleep]}</Badge>
              </div>
              <Slider value={[iSleep]} onValueChange={(v) => setSleep(v[0])} max={3} min={0} step={1} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">Blood Pressure</Label>
                <Badge variant="outline" className="text-[10px]">{BP_LABELS[iBP]}</Badge>
              </div>
              <Slider value={[iBP]} onValueChange={(v) => setBP(v[0])} max={4} min={0} step={1} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">BMI: {bmi.toFixed(1)}</Label>
                <Badge variant="outline" className="text-[10px]">{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}</Badge>
              </div>
              <Slider value={[bmi]} onValueChange={(v) => setBmi(v[0])} max={40} min={15} step={0.5} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">Stress Level: {stress}/10</Label>
              </div>
              <Slider value={[stress]} onValueChange={(v) => setStress(v[0])} max={10} min={1} step={1} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maximum Potential */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Your Maximum Potential Lifespan
            </h4>
            <strong className={`text-xl font-black text-primary ${blurCls}`}>{maxSim} yrs</strong>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Current simulation: {simForecast} yrs</span>
              <span>{pctOfMax}% of maximum potential</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${pctOfMax}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factor Breakdown Table */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Factor Breakdown — Sorted by Potential Gain</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid sm:grid-cols-2 gap-2">
            {result.factorBreakdown.slice(0, 10).map((f, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${f.currentImpact >= 0 ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
                <TooltipProvider><Tooltip><TooltipTrigger asChild>
                  <span className="flex items-center gap-1.5 font-medium cursor-help">
                    <span>{f.emoji}</span><span>{f.factor}</span>
                  </span>
                </TooltipTrigger><TooltipContent className="max-w-xs text-xs p-2">{f.source}</TooltipContent></Tooltip></TooltipProvider>
                <div className="flex items-center gap-2 shrink-0">
                  <DeltaBadge delta={f.currentImpact} />
                  {f.potentialGain > 0 && (
                    <span className={`text-[9px] text-green-600 ${blurCls}`}>+{f.potentialGain}yr possible</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA for free users */}
      {!isPremium && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-5 text-center space-y-3">
            <Crown className="w-6 h-6 text-accent mx-auto" />
            <p className="font-bold text-foreground">
              🔒 You're leaving {Math.max(0, Math.round(maxSim - result.totalForecast))} years on the table.
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Unlock your complete Longevity Blueprint to see your exact scores, download your personalized report, and track your progress over time.
            </p>
            <Link to="/upgrade">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-6">
                Unlock Full Report — $6.99
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Generate Report Button */}
      <div className="text-center pt-2">
        <Button
          size="lg"
          className="px-10 py-6 text-base font-bold gap-2"
          onClick={onGenerateReport}
          disabled={!isPremium}
        >
          <Sparkles className="w-5 h-5" />
          {isPremium ? 'Generate Full Longevity Blueprint' : '🔒 Premium: Generate Full Blueprint'}
        </Button>
        {!isPremium && <p className="text-xs text-muted-foreground mt-2">Upgrade to generate your full personalized Longevity Report</p>}
      </div>
    </div>
  );
};
