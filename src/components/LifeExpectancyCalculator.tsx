import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Heart, Coffee, Brain, Dumbbell, User, ShieldCheck, Info, Activity, Moon, Users, Dna, TreePine, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import {
  HealthQuizData,
  Pillar1Data, FamilyMemberData,
  Pillar2Data,
  DEFAULT_PILLAR1, DEFAULT_PILLAR2,
  EPIGENETIC_HABITS,
  QUIZ_COUNTRIES,
  COUNTRY_FLAG_EMOJI,
  computeGeneticPreview,
  livingContributionLabel,
  calculateLongevity,
  LongevityResult,
} from '@/services/LongevityCalculationService';

interface Props {
  birthDate?: Date | null;
  onComplete?: (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => void;
  onCompleteSkip?: (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => void;
}

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex cursor-help ml-1.5">
          <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed p-3">{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const POWER9_IDS = ['walking', 'purpose', 'meditation', 'fasting', 'wholefood', 'spiritual', 'volunteer', 'community', 'gardening'];

const POWER9_HABITS = [
  { id: 'walking',    emoji: '🚶', name: 'Move Naturally',   region: 'All 5 Zones',       science: 'Blue Zone centenarians walk 5+ miles/day as part of daily life — never as "exercise"' },
  { id: 'purpose',    emoji: '🎯', name: 'Purpose (Ikigai)', region: '🇯🇵 Okinawa',        science: '"Why I wake up" adds up to 7 years of life expectancy — Harvard confirms strong purpose effect' },
  { id: 'meditation', emoji: '🧘', name: 'Downshift',        region: '🇮🇹 Sardinia',       science: 'Routine stress relief lowers chronic inflammation — Adventists use prayer, Okinawans ancestral rituals' },
  { id: 'fasting',    emoji: '🍽️', name: '80% Rule',         region: '🇯🇵 Okinawa',        science: '"Hara hachi bu" — stop eating at 80% full; caloric restriction linked to longer telomeres' },
  { id: 'wholefood',  emoji: '🥗', name: 'Plant Slant',      region: 'All 5 Zones',       science: 'Beans are the cornerstone of every Blue Zone diet — each daily cup adds ~4 years of life expectancy' },
  { id: 'gardening',  emoji: '🍷', name: 'Wine at 5',        region: '🇮🇹 Sardinia · 🇬🇷 Ikaria', science: '1–2 glasses of Cannonau wine daily with friends — social rituals around food matter as much as nutrients' },
  { id: 'spiritual',  emoji: '🙏', name: 'Belong',           region: '🇺🇸 Loma Linda',     science: 'Faith community attendance adds 4–14 years — weekly gathering, accountability, and shared purpose' },
  { id: 'volunteer',  emoji: '❤️', name: 'Loved Ones First', region: '🇨🇷 Nicoya',         science: 'Keeping aging parents nearby adds 4–6 years to children\'s life expectancy too (Costa Rican studies)' },
  { id: 'community',  emoji: '👥', name: 'Right Tribe',      region: 'All 5 Zones',       science: 'Social norms drive 70% of long-term habits — smoking cessation is 3× more likely within non-smoking networks' },
];

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500 border-blue-400' };
  if (bmi < 25)   return { label: 'Normal Weight', color: 'text-green-600 border-green-400' };
  if (bmi < 30)   return { label: 'Overweight', color: 'text-yellow-600 border-yellow-400' };
  return { label: 'Obese', color: 'text-red-500 border-red-400' };
};

function ageDotColor(age: number, entered: boolean): string {
  if (!entered) return 'bg-muted-foreground/30';
  if (age > 80)  return 'bg-green-500';
  if (age >= 70) return 'bg-amber-500';
  if (age >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}

const CompactFamilyRow = ({
  fieldKey, label, member, onChange, optional = false,
}: {
  fieldKey: string; label: string; member: FamilyMemberData;
  onChange: (m: FamilyMemberData) => void; optional?: boolean;
}) => {
  const entered = !member.dontKnow && member.age > 0 && member.isLiving !== null;
  const contribLabel = livingContributionLabel(member);

  return (
    <div className={`space-y-0.5 ${member.dontKnow ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-1.5 py-1 text-xs flex-wrap sm:flex-nowrap">
        <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${ageDotColor(member.age, entered)}`} />
        <span className={`w-28 sm:w-32 shrink-0 font-medium leading-tight ${optional ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
          {optional && <span className="text-[9px] ml-1 opacity-60">(Opt)</span>}
        </span>
        <input
          type="number"
          value={member.age || ''}
          onChange={(e) => onChange({ ...member, age: Math.max(0, Number(e.target.value)) || 0 })}
          placeholder="Age"
          disabled={member.dontKnow}
          className="w-14 h-6 text-xs text-center border rounded px-1 bg-background disabled:bg-muted disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
          min={1} max={120}
        />
        <label className={`flex items-center gap-1 cursor-pointer select-none ${member.dontKnow ? 'pointer-events-none' : ''}`}>
          <input type="radio" name={`family-${fieldKey}`} checked={member.isLiving === true}
            onChange={() => onChange({ ...member, isLiving: true })} disabled={member.dontKnow} className="w-3 h-3 accent-primary" />
          <span className="text-[10px] text-foreground">Still Living</span>
        </label>
        <label className={`flex items-center gap-1 cursor-pointer select-none ${member.dontKnow ? 'pointer-events-none' : ''}`}>
          <input type="radio" name={`family-${fieldKey}`} checked={member.isLiving === false}
            onChange={() => onChange({ ...member, isLiving: false })} disabled={member.dontKnow} className="w-3 h-3 accent-primary" />
          <span className="text-[10px] text-foreground">At time of passing</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none ml-auto">
          <input type="checkbox" checked={member.dontKnow}
            onChange={(e) => onChange({ ...member, dontKnow: e.target.checked, age: e.target.checked ? 0 : member.age, isLiving: e.target.checked ? null : member.isLiving })}
            className="w-3 h-3 accent-primary" />
          <span className="text-[10px] text-muted-foreground">Don't know</span>
        </label>
      </div>
      {contribLabel && !member.dontKnow && (
        <p className="text-[10px] text-green-600 pl-4">{contribLabel}</p>
      )}
    </div>
  );
};

const SCORE_COLORS: Record<string, string> = {
  Exceptional:    'bg-emerald-100 text-emerald-800 border-emerald-300',
  Strong:         'bg-green-100 text-green-800 border-green-300',
  Average:        'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Below Average':'bg-orange-100 text-orange-800 border-orange-300',
};

export const LifeExpectancyCalculator = ({ birthDate, onComplete, onCompleteSkip }: Props) => {
  const { isPremium, profile } = useAuth();
  const { trackFeatureUse } = useAnalytics();
  const [step, setStep] = useState(1);

  const [data, setData] = useState<HealthQuizData>({
    name: '', gender: '', country: '',
    smoking: '', drinking: '',
    heartDisease: false, heartDiseaseFamily: false, heartDiseaseControlled: null,
    diabetes: false, diabetesFamily: false, diabetesControlled: null,
    hypertension: false, hypertensionControlled: null,
    diet: '', exercise: '', stress: 5, bmi: 24.5,
    bloodPressure: '', sleepDuration: '', socialConnections: '',
  });

  const [pillar1, setPillar1] = useState<Pillar1Data>(DEFAULT_PILLAR1);
  const [pillar2, setPillar2] = useState<Pillar2Data>(DEFAULT_PILLAR2);
  const hasTracked = useRef(false);
  const countUpDoneRef = useRef(false);
  const [countUpAge, setCountUpAge] = useState<number | null>(null);
  const [showGeneticScience, setShowGeneticScience] = useState(false);

  // BMI calculator local state
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  // Live preview state
  const [liveResult, setLiveResult] = useState<LongevityResult | null>(null);
  const [flashDir, setFlashDir] = useState<'up' | 'down' | null>(null);
  const [deltaLabel, setDeltaLabel] = useState('');
  const prevForecastRef = useRef<number | null>(null);
  const [hasSelectedExercise, setHasSelectedExercise] = useState(false);

  useEffect(() => {
    if (profile?.name && !data.name) setData(prev => ({ ...prev, name: profile.name }));
    if (profile?.country && !data.country) setData(prev => ({ ...prev, country: profile.country || '' }));
  }, [profile]);

  useEffect(() => {
    if (bmiUnit === 'metric') {
      const h = parseFloat(heightCm) / 100, w = parseFloat(weightKg);
      if (h > 0 && w > 0) { const bmi = Math.round((w / (h * h)) * 10) / 10; if (bmi >= 10 && bmi <= 60) setData(p => ({ ...p, bmi })); }
    } else {
      const ti = parseFloat(heightFt) * 12 + parseFloat(heightIn || '0'), w = parseFloat(weightLbs);
      if (ti > 0 && w > 0) { const bmi = Math.round(((w / (ti * ti)) * 703) * 10) / 10; if (bmi >= 10 && bmi <= 60) setData(p => ({ ...p, bmi })); }
    }
  }, [bmiUnit, heightCm, heightFt, heightIn, weightKg, weightLbs]);

  // Live preview effect — only calculates from step 6 onwards
  useEffect(() => {
    if (step < 6) return;
    const pillar2ForPreview = { ...pillar2, mentorHabits: [] };
    const r = calculateLongevity(data, pillar1, pillar2ForPreview, birthDate ?? undefined, []);
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (prevForecastRef.current !== null && Math.abs(r.totalForecast - prevForecastRef.current) >= 0.1) {
      const diff = Math.round((r.totalForecast - prevForecastRef.current) * 10) / 10;
      setFlashDir(diff > 0 ? 'up' : 'down');
      setDeltaLabel(diff > 0 ? `+${diff} yrs` : `${diff} yrs`);
      timer = setTimeout(() => { setFlashDir(null); setDeltaLabel(''); }, 2000);
    }

    prevForecastRef.current = r.totalForecast;
    setLiveResult(r);

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackFeatureUse('life_expectancy_calculator', { action: 'calculate' });
    }

    return () => { if (timer) clearTimeout(timer); };
  }, [data, pillar1, pillar2, birthDate, step]);

  // Count-up animation when age first reveals on step 6 (after exercise selected)
  useEffect(() => {
    if (step === 6 && liveResult && !countUpDoneRef.current && hasSelectedExercise) {
      countUpDoneRef.current = true;
      const target = liveResult.totalForecast;
      const intervalMs = 25;
      const totalSteps = 60; // 1.5s
      let tick = 0;
      const timer = setInterval(() => {
        tick += 1;
        const progress = tick / totalSteps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCountUpAge(Math.round(target * eased * 10) / 10);
        if (tick >= totalSteps) { clearInterval(timer); setCountUpAge(target); }
      }, intervalMs);
      return () => clearInterval(timer);
    }
  }, [step, liveResult, hasSelectedExercise]);

  const totalSteps = 8;
  const bmiCategory = getBMICategory(data.bmi);
  const bmiUserSet = heightCm !== '' || weightKg !== '' || heightFt !== '' || weightLbs !== '';
  const updateP1Member = (field: keyof Pillar1Data, val: FamilyMemberData) => setPillar1(p => ({ ...p, [field]: val }));

  const toggleMentorHabit = (id: string) => setPillar2(p => ({
    ...p,
    mentorHabits: p.mentorHabits.includes(id) ? p.mentorHabits.filter(h => h !== id) : [...p.mentorHabits, id],
  }));

  const enteredMemberCount = Object.values(pillar1).filter(m => !m.dontKnow && m.age > 0 && m.isLiving !== null).length;
  const { wfa: previewWfa, score: previewScore } = computeGeneticPreview(pillar1);

  const geneticAdj = Math.round(Math.max(-8, Math.min(8, (previewWfa - 78) * 0.25)) * 10) / 10;
  const adjSign = geneticAdj >= 0 ? '+' : '';

  const currentAge = birthDate
    ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" /> Life Expectancy Calculator
            </CardTitle>
            <CardDescription>
              {step === 7 ? `Step ${step} of ${totalSteps} · Pillar 2 — Biological Blueprint`
               : step === 8 ? `Step ${step} of ${totalSteps} · Pillar 3 — Community Anchor`
               : `Step ${step} of ${totalSteps} · Personalized Health Check`}
            </CardDescription>
          </div>
        </div>
        <Progress value={(step / totalSteps) * 100} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6 text-left">

        {/* ── Age card: locked on steps 1-5, gated on step 6 until both inputs set ── */}
        {step < 6 ? (
          <div className="rounded-xl border border-muted bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <p className="text-xs font-bold text-muted-foreground">🔒 Your Longevity Forecast</p>
            </div>
            {currentAge !== null ? (
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-blue-600">{currentAge}</span>
                  <span className="text-sm font-semibold text-muted-foreground">years old</span>
                </div>
                <p className="text-xs text-muted-foreground">Complete each step to reveal your personalized longevity forecast</p>
                <p className="text-[10px] text-muted-foreground/70">Your data is saved as you progress — you will not lose your answers</p>
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Step {step} of {totalSteps}</span>
                  </div>
                  <Progress value={(step / totalSteps) * 100} className="h-1.5" />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Enter your date of birth above to begin</p>
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Step {step} of {totalSteps}</span>
                  </div>
                  <Progress value={(step / totalSteps) * 100} className="h-1.5" />
                </div>
              </div>
            )}
          </div>
        ) : step === 6 && !hasSelectedExercise ? (
          <div className="rounded-xl border border-muted bg-muted/30 p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground/50 shrink-0" />
            <div>
              <p className="text-xs font-bold text-muted-foreground">Select your physical exercise frequency above to unlock your personalized longevity forecast</p>
            </div>
          </div>
        ) : liveResult ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Current Projected Age</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <strong className={`text-4xl font-black transition-colors duration-300 ${
                    flashDir === 'up' ? 'text-green-600' : flashDir === 'down' ? 'text-red-500' : 'text-primary'
                  }`}>
                    {step === 6 && countUpAge !== null ? countUpAge : liveResult.totalForecast}
                  </strong>
                  <span className="text-lg font-bold text-primary">yrs</span>
                  {deltaLabel && step > 6 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full animate-fade-in-up ${
                      deltaLabel.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {deltaLabel}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Updates in real time as you answer each step</p>
              </div>

              {/* Progress bar */}
              {currentAge !== null && step > 6 && (() => {
                const forecast = liveResult.totalForecast;
                const maxPot = liveResult.maximumPotential;
                const rangeStart = Math.max(0, currentAge - 5);
                const rangeEnd = maxPot + 5;
                const range = rangeEnd - rangeStart;
                const projPct = Math.round(((forecast - rangeStart) / range) * 100);
                return (
                  <div className="flex-1 min-w-[160px] space-y-1 pt-1">
                    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/40 to-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, projPct))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span className="font-medium">Age {currentAge}</span>
                      <span className="text-muted-foreground/60">↑ Optimizing...</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}

        {/* ── STEP 1: Personal Info ── */}
        {step === 1 && (
          <div className="space-y-6">
            <Alert className="border-accent/30 bg-accent/5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                🔒 Your health data is used only to calculate your personalized forecast. We do not store your health inputs on our servers.
                <Link to="/privacy" className="text-blue-500 underline ml-1">Privacy Policy →</Link>
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Your Name</Label>
              <Input type="text" placeholder="Enter your name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
            </div>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                Biological Sex
                <InfoTooltip content="Biological sex affects baseline life expectancy due to hormonal, physiological, and statistical differences. Women live approximately 5 years longer than men on average globally (WHO, 2023)." />
              </Label>
              <RadioGroup value={data.gender} onValueChange={(v) => setData({ ...data, gender: v as any })} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                Country of Residence
                <InfoTooltip content="Used to determine your life expectancy baseline from UN World Population Prospects 2024 data. For users aged 40+, an age-adjusted conditional baseline is applied — people who have already survived to their current age have a statistically higher remaining life expectancy." />
              </Label>
              <Select value={data.country} onValueChange={(v) => setData({ ...data, country: v })}>
                <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {QUIZ_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {COUNTRY_FLAG_EMOJI[c] ? `${COUNTRY_FLAG_EMOJI[c]} ${c}` : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profile?.country && data.country === profile.country && (
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  🌍 Pre-filled from your profile — you can change this
                </p>
              )}
              {!data.country && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Country selection personalises your baseline life expectancy
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Lifestyle Habits ── */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Routine Lifestyle Habits</h3>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Coffee className="w-4 h-4 mr-2" /> Tobacco Smoking Habits
                <InfoTooltip content="Smoking is the leading preventable cause of death worldwide. Heavy smokers lose 10–12 years of life expectancy on average. Even light smoking significantly increases cardiovascular disease and cancer risk (WHO, 2023)." />
              </Label>
              <RadioGroup value={data.smoking} onValueChange={(v) => setData({ ...data, smoking: v as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="never" id="never-smoke" /><Label htmlFor="never-smoke">Non-smoker</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="quit_over5" id="quit-over5-smoke" /><Label htmlFor="quit-over5-smoke">Quit smoking (5+ years ago)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="quit_under5" id="quit-under5-smoke" /><Label htmlFor="quit-under5-smoke">Quit smoking (less than 5 years ago)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-smoke" /><Label htmlFor="light-smoke">Light (1–5 cigarettes per day)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-smoke" /><Label htmlFor="moderate-smoke">Moderate (6–10 cigarettes per day)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-smoke" /><Label htmlFor="heavy-smoke">Heavy (More than 10 cigarettes per day)</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                Alcohol Consumption
                <InfoTooltip content="Alcohol affects liver function, cardiovascular health, and cancer risk. Light drinking has a modest positive association with heart health, but heavy drinking significantly shortens lifespan. No level is safe for cancer risk (CDC, 2023)." />
              </Label>
              <RadioGroup value={data.drinking} onValueChange={(v) => setData({ ...data, drinking: v as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="no-drink" /><Label htmlFor="no-drink">No regular consumption</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-drink" /><Label htmlFor="light-drink">Light (1–2 standard drinks daily)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-drink" /><Label htmlFor="moderate-drink">Moderate (3–4 standard drinks daily)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-drink" /><Label htmlFor="heavy-drink">Heavy (More than 4 daily)</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* ── STEP 3: Medical History ── */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Medical & Health History</h3>
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">
                  Personal history of Heart Disease?
                  <InfoTooltip content="Diagnosed cardiovascular conditions reduce life expectancy by 5–8 years on average. Regular cardiology care substantially improves outcomes (AHA, 2023)." />
                </Label>
                <RadioGroup value={data.heartDisease ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, heartDisease: v === 'yes', heartDiseaseControlled: v === 'yes' ? data.heartDiseaseControlled : null })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hd-y" /><Label htmlFor="hd-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hd-n" /><Label htmlFor="hd-n">No</Label></div>
                </RadioGroup>
                {data.heartDisease && (
                  <div className="ml-4 mt-1 p-3 bg-muted/40 rounded-lg border border-muted space-y-2">
                    <Label className="text-sm flex items-center text-muted-foreground">Are you under regular cardiology care? <InfoTooltip content="Regular cardiac monitoring reduces major adverse cardiovascular events by 20–30% (ESC Guidelines 2023)." /></Label>
                    <RadioGroup value={data.heartDiseaseControlled === null ? '' : data.heartDiseaseControlled ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, heartDiseaseControlled: v === 'yes' })} className="flex space-x-4">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hdc-y" /><Label htmlFor="hdc-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hdc-n" /><Label htmlFor="hdc-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">Family history of Heart Disease? <InfoTooltip content="A first-degree family history increases your personal risk by 40–60% (AHA, 2023)." /></Label>
                <RadioGroup value={data.heartDiseaseFamily ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, heartDiseaseFamily: v === 'yes' })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hdf-y" /><Label htmlFor="hdf-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hdf-n" /><Label htmlFor="hdf-n">No</Label></div>
                </RadioGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">Personal history of Diabetes? <InfoTooltip content="Type 2 diabetes reduces life expectancy by 4–8 years and doubles cardiovascular risk (American Diabetes Association, 2023)." /></Label>
                <RadioGroup value={data.diabetes ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, diabetes: v === 'yes', diabetesControlled: v === 'yes' ? data.diabetesControlled : null })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="db-y" /><Label htmlFor="db-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="db-n" /><Label htmlFor="db-n">No</Label></div>
                </RadioGroup>
                {data.diabetes && (
                  <div className="ml-4 mt-1 p-3 bg-muted/40 rounded-lg border border-muted space-y-2">
                    <Label className="text-sm flex items-center text-muted-foreground">Is your blood sugar generally well-controlled? <InfoTooltip content="Well-controlled blood glucose reduces cardiovascular complications by up to 50% (ADA, 2023)." /></Label>
                    <RadioGroup value={data.diabetesControlled === null ? '' : data.diabetesControlled ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, diabetesControlled: v === 'yes' })} className="flex space-x-4">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="dbc-y" /><Label htmlFor="dbc-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="dbc-n" /><Label htmlFor="dbc-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">Family history of Diabetes? <InfoTooltip content="Having a parent or sibling with Type 2 diabetes increases your lifetime risk 2–3 times (CDC, 2023)." /></Label>
                <RadioGroup value={data.diabetesFamily ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, diabetesFamily: v === 'yes' })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="dbf-y" /><Label htmlFor="dbf-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="dbf-n" /><Label htmlFor="dbf-n">No</Label></div>
                </RadioGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">Diagnosed Hypertension / High Blood Pressure? <InfoTooltip content="Untreated hypertension reduces life expectancy by 3–5 years. Effective treatment reduces stroke risk by 35–40% (AHA/ACC 2023)." /></Label>
                <RadioGroup value={data.hypertension ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, hypertension: v === 'yes', hypertensionControlled: v === 'yes' ? data.hypertensionControlled : null })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="ht-y" /><Label htmlFor="ht-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="ht-n" /><Label htmlFor="ht-n">No</Label></div>
                </RadioGroup>
                {data.hypertension && (
                  <div className="ml-4 mt-1 p-3 bg-muted/40 rounded-lg border border-muted space-y-2">
                    <Label className="text-sm flex items-center text-muted-foreground">Is your blood pressure managed? <InfoTooltip content="Treated hypertension reduces stroke risk by 35–40% (AHA/ACC 2023)." /></Label>
                    <RadioGroup value={data.hypertensionControlled === null ? '' : data.hypertensionControlled ? 'yes' : 'no'} onValueChange={(v) => setData({ ...data, hypertensionControlled: v === 'yes' })} className="flex space-x-4">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="htc-y" /><Label htmlFor="htc-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="htc-n" /><Label htmlFor="htc-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Nutrition & BMI ── */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Nutrition & Baseline Metrics</h3>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                Diet Quality Profile
                <InfoTooltip content="Diet quality is one of the most modifiable longevity factors. A nutrient-dense diet can add 4+ years of healthy life (Harvard School of Public Health, 2022)." />
              </Label>
              <RadioGroup value={data.diet} onValueChange={(v) => setData({ ...data, diet: v as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="poor" id="poor-diet" /><Label htmlFor="poor-diet">Poor (High processed foods, low nutrients)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="average" id="average-diet" /><Label htmlFor="average-diet">Average (Balanced mix of home and processed)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="good" id="good-diet" /><Label htmlFor="good-diet">Good (Whole foods, high fiber consistent balance)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="excellent" id="excellent-diet" /><Label htmlFor="excellent-diet">Excellent (Nutrient-dense framework optimized daily)</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-base flex items-center">
                  BMI Calculator
                  <InfoTooltip content="Body Mass Index (BMI) estimates body fat from height and weight. A BMI of 18.5–24.9 is associated with the lowest mortality risk (WHO, 2023)." />
                </Label>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button type="button" variant={bmiUnit === 'metric' ? 'default' : 'ghost'} size="sm" className="h-7 px-3 text-xs" onClick={() => setBmiUnit('metric')}>Metric</Button>
                  <Button type="button" variant={bmiUnit === 'imperial' ? 'default' : 'ghost'} size="sm" className="h-7 px-3 text-xs" onClick={() => setBmiUnit('imperial')}>Imperial</Button>
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl border p-4 space-y-3">
                {bmiUnit === 'metric' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Height (cm)</Label><Input type="number" placeholder="e.g. 175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min={100} max={250} /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Weight (kg)</Label><Input type="number" placeholder="e.g. 70" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min={30} max={300} /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Height (ft)</Label><Input type="number" placeholder="5" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} min={3} max={8} /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Inches (in)</Label><Input type="number" placeholder="9" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} min={0} max={11} /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Weight (lbs)</Label><Input type="number" placeholder="154" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} min={60} max={700} /></div>
                  </div>
                )}
                <div className="flex items-center justify-between bg-background rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Calculated BMI:</span>
                    <span className="text-xl font-black text-foreground">{data.bmi}</span>
                  </div>
                  <Badge variant="outline" className={bmiCategory.color}>{bmiCategory.label}</Badge>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <Label className="text-sm text-muted-foreground">Manual override — drag to adjust BMI: {data.bmi}</Label>
                <Slider value={[data.bmi]} onValueChange={(v) => setData({ ...data, bmi: v[0] })} max={40} min={15} step={0.5} />
                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                  <span>15 (Underweight)</span><span>18.5–24.9 (Normal)</span><span>30+ (Obese)</span>
                </div>
                {!bmiUserSet && data.bmi === 24.5 && (
                  <p className="text-xs text-muted-foreground bg-muted/40 border rounded px-3 py-2">
                    ℹ️ Using default BMI (24.5). Enter your height and weight above for a personalized calculation.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Blood Pressure, Sleep, Social ── */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Wellness & Lifestyle Factors</h3>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Current Blood Pressure Status
                <InfoTooltip content="Optimal BP below 120/80 mmHg significantly reduces stroke and heart attack risk (JNC8/AHA Guidelines, 2023)." />
              </Label>
              <RadioGroup value={data.bloodPressure} onValueChange={(v) => setData({ ...data, bloodPressure: v as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="optimal" id="bp-opt" /><Label htmlFor="bp-opt">Optimal (&lt;120/80 mmHg)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="bp-norm" /><Label htmlFor="bp-norm">Normal (120–129/80 mmHg)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="elevated" id="bp-elev" /><Label htmlFor="bp-elev">Elevated (130–139 / 80–89 mmHg)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="high1" id="bp-h1" /><Label htmlFor="bp-h1">High Stage 1 (140–159 / 90–99)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="high2" id="bp-h2" /><Label htmlFor="bp-h2">High Stage 2 (≥160 / ≥100 mmHg)</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Moon className="w-4 h-4 mr-2" /> Typical Nightly Sleep Duration
                <InfoTooltip content="Adults sleeping fewer than 6 hours per night have a 12% higher all-cause mortality risk (NHS/National Sleep Foundation, 2023)." />
              </Label>
              <RadioGroup value={data.sleepDuration} onValueChange={(v) => setData({ ...data, sleepDuration: v as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="under6" id="sleep-u6" /><Label htmlFor="sleep-u6">Less than 6 hours</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="6to7" id="sleep-67" /><Label htmlFor="sleep-67">6–7 hours</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="7to9" id="sleep-79" /><Label htmlFor="sleep-79">7–9 hours (optimal)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="over9" id="sleep-o9" /><Label htmlFor="sleep-o9">More than 9 hours</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Users className="w-4 h-4 mr-2" /> Quality of Social Connections
                <InfoTooltip content="Strong social relationships are among the strongest predictors of longevity — comparable to quitting smoking (Harvard Study of Adult Development, 80+ years)." />
              </Label>
              <RadioGroup value={data.socialConnections} onValueChange={(v) => setData({ ...data, socialConnections: v as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="strong" id="soc-str" /><Label htmlFor="soc-str">Strong (close relationships, regular meaningful contact)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="soc-mod" /><Label htmlFor="soc-mod">Moderate (some connections, occasional interaction)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="limited" id="soc-lim" /><Label htmlFor="soc-lim">Limited (few meaningful relationships)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="isolated" id="soc-iso" /><Label htmlFor="soc-iso">Isolated (little to no meaningful social contact)</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* ── STEP 6: Activity, Stress & Preview ── */}
        {step === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Activity and Stress Inputs</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-base flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4" /> Mental Stress Load: {data.stress}/10
                  <InfoTooltip content="Chronic psychological stress triggers sustained cortisol release, damaging the cardiovascular system and accelerating cellular aging (AHA, 2021)." />
                </Label>
                <Slider value={[data.stress]} onValueChange={(v) => setData({ ...data, stress: v[0] })} max={10} min={1} step={1} />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5"><span>1 (Very low)</span><span>10 (Extreme stress)</span></div>
              </div>
              <div>
                <Label className="text-base flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4" /> Physical Exercise Patterns
                  <InfoTooltip content="Moderate exercise (150 min/week) reduces all-cause mortality by 31% and can add 3–5 years to lifespan (WHO, 2022)." />
                </Label>
                <RadioGroup value={data.exercise} onValueChange={(v) => { setData({ ...data, exercise: v as any }); setHasSelectedExercise(true); }}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="seldom" id="seldom-ex" /><Label htmlFor="seldom-ex">Seldom (Rare physical activity, sedentary lifestyle)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-ex" /><Label htmlFor="light-ex">Light (1–2 walks/brief workouts weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-ex" /><Label htmlFor="moderate-ex">Moderate (3–4 structured sessions weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-ex" /><Label htmlFor="heavy-ex">Heavy (5+ intense training routines weekly)</Label></div>
                </RadioGroup>
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 7: Pillar 2 — Biological Blueprint (Family Genetics) ── */}
        {step === 7 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2"><Dna className="w-5 h-5 text-primary" /> 🧬 Your Biological Blueprint</h3>
              <p className="text-sm text-muted-foreground mt-1">Pillar 2 of 3 · Enter ages for family members you know. Leave blank or check "Don't know" for unknown.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> &gt;80 yrs</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 70–80</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> 60–70</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;60</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" /> Not entered</span>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <TreePine className="w-3.5 h-3.5 text-blue-500" /> Paternal Side
                </h4>
                <CompactFamilyRow fieldKey="paternalGrandfather" label="Paternal Grandfather" member={pillar1.paternalGrandfather} onChange={(m) => updateP1Member('paternalGrandfather', m)} />
                <CompactFamilyRow fieldKey="paternalGrandmother" label="Paternal Grandmother" member={pillar1.paternalGrandmother} onChange={(m) => updateP1Member('paternalGrandmother', m)} />
                <CompactFamilyRow fieldKey="father" label="Father" member={pillar1.father} onChange={(m) => updateP1Member('father', m)} />
                <CompactFamilyRow fieldKey="paternalUncles" label="Paternal Uncles (avg)" member={pillar1.paternalUncles} onChange={(m) => updateP1Member('paternalUncles', m)} optional />
                <CompactFamilyRow fieldKey="paternalAunts" label="Paternal Aunts (avg)" member={pillar1.paternalAunts} onChange={(m) => updateP1Member('paternalAunts', m)} optional />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <TreePine className="w-3.5 h-3.5 text-emerald-500" /> Maternal Side
                </h4>
                <CompactFamilyRow fieldKey="maternalGrandfather" label="Maternal Grandfather" member={pillar1.maternalGrandfather} onChange={(m) => updateP1Member('maternalGrandfather', m)} />
                <CompactFamilyRow fieldKey="maternalGrandmother" label="Maternal Grandmother" member={pillar1.maternalGrandmother} onChange={(m) => updateP1Member('maternalGrandmother', m)} />
                <CompactFamilyRow fieldKey="mother" label="Mother" member={pillar1.mother} onChange={(m) => updateP1Member('mother', m)} />
                <CompactFamilyRow fieldKey="maternalUncles" label="Maternal Uncles (avg)" member={pillar1.maternalUncles} onChange={(m) => updateP1Member('maternalUncles', m)} optional />
                <CompactFamilyRow fieldKey="maternalAunts" label="Maternal Aunts (avg)" member={pillar1.maternalAunts} onChange={(m) => updateP1Member('maternalAunts', m)} optional />
              </div>
            </div>

            {/* Live Genetic Vitality Score */}
            {enteredMemberCount >= 2 && (
              <div className="bg-muted/30 rounded-xl border p-4 space-y-2 animate-fade-in-up">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-foreground">🧬 Genetic Vitality Score:</span>
                  <Badge className={`border ${SCORE_COLORS[previewScore] || ''}`}>
                    {previewScore} · Family Longevity Baseline: ~{previewWfa} yrs
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Genetics account for approximately 25–30% of your longevity ceiling. <strong className="text-foreground">(Karolinska Institute, 2017)</strong>
                </p>
                {/* Genetic forecast adjustment line */}
                <div className="border-t pt-2 mt-1">
                  <p className="text-[11px] text-foreground font-medium">
                    Your family genetics are adjusting your forecast by{' '}
                    <span className={geneticAdj >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                      {adjSign}{geneticAdj} years
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Family Longevity Baseline: ~{previewWfa} yrs → Genetic adjustment:{' '}
                    <span className={geneticAdj >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                      {adjSign}{geneticAdj} yrs
                    </span>{' '}applied to your forecast
                  </p>
                </div>
              </div>
            )}

            {/* 📚 The Science Behind Your Genetics */}
            <div className="rounded-xl border overflow-hidden">
              <button
                onClick={() => setShowGeneticScience(!showGeneticScience)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-xs font-bold text-foreground">📚 The Science Behind Your Genetics</span>
                {showGeneticScience ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showGeneticScience && (
                <div className="p-4 space-y-5 bg-background border-t">
                  {/* Subsection A: 5 Longevity Genes */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-foreground">A — The 5 Key Longevity Genes</h5>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Research has identified specific genes associated with longer, healthier lives. While you cannot change your DNA, your family history gives you a proxy window into your genetic expression.
                    </p>
                    <div className="space-y-2">
                      {[
                        { gene: 'FOXO3', effect: 'Master regulator of cellular stress response. Carriers live 10% longer on average. Found at higher frequency in Japanese, Ashkenazi Jewish, and Northern Italian centenarian populations.', citation: 'Willcox et al., PNAS, 2008' },
                        { gene: 'APOE ε2', effect: 'Protective variant associated with lower Alzheimer\'s and heart disease risk. Reduces cardiovascular mortality by 20–40% compared to the APOE ε4 risk variant.', citation: 'Liu et al., Neuron, 2019' },
                        { gene: 'CETP', effect: 'Regulates HDL ("good") cholesterol levels. The longevity variant (I405V) raises HDL significantly and is 2× more common in centenarians than the general population.', citation: 'Barzilai et al., JAMA, 2003' },
                        { gene: 'SIRT1/3', effect: 'The "longevity sirtuins" activated by caloric restriction, fasting, and exercise. Control mitochondrial health, DNA repair, and inflammation — all key hallmarks of aging.', citation: 'Guarente, Cell, 2013' },
                        { gene: 'TERT', effect: 'Governs telomere length — the biological clock of your cells. Longer telomeres correlate with up to 7–10 extra healthy years. Influenced by diet, exercise, and chronic stress.', citation: 'Blackburn & Epel, Cell, 2012' },
                      ].map(({ gene, effect, citation }) => (
                        <div key={gene} className="bg-muted/30 rounded-lg p-3 space-y-1 border">
                          <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded inline-block">{gene}</span>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{effect}</p>
                          <p className="text-[10px] text-muted-foreground/60 italic">{citation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subsection B: Calculation Method */}
                  <div className="space-y-3 border-t pt-4">
                    <h5 className="text-xs font-bold text-foreground">B — How We Calculate Your Genetic Adjustment</h5>
                    <div className="space-y-2 text-[11px] text-muted-foreground">
                      <p><strong className="text-foreground">Step 1 — Weighted family average:</strong> Paternal side (50%) + Maternal side (50%). Within each side, grandparents carry 40% weight each and parents 60%.</p>
                      <p><strong className="text-foreground">Step 2 — Living adjustment:</strong> Still-living relatives receive a forward projection to estimate their probable lifespan:</p>
                      <div className="bg-muted/40 rounded-lg p-3 space-y-1 font-mono text-[10px] border">
                        <p className="font-bold text-foreground mb-1.5">Living Adjustment Table</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                          <span>Age 80+ years</span><span className="text-green-600">+7 years added</span>
                          <span>Age 70–79 years</span><span className="text-green-600">+4 years added</span>
                          <span>Age 60–69 years</span><span className="text-green-600">+2 years added</span>
                          <span>Under 60 years</span><span className="text-muted-foreground">No adjustment (too early to draw longevity conclusions)</span>
                        </div>
                      </div>
                      <p><strong className="text-foreground">Step 3 — Genetic bonus formula:</strong></p>
                      <div className="bg-primary/5 rounded-lg p-3 font-mono text-[10px] border border-primary/20">
                        <p>Genetic bonus = (family avg − 78) × 0.25</p>
                        <p className="text-muted-foreground mt-1">Capped at ±8 years · Baseline 78 = WHO global average</p>
                      </div>
                    </div>
                  </div>

                  {/* Subsection C: Stat grid */}
                  <div className="space-y-2 border-t pt-4">
                    <h5 className="text-xs font-bold text-foreground">C — Key Research Numbers</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { stat: '25–30%', desc: 'of longevity determined by genetics', source: 'Karolinska, 2017' },
                        { stat: '2.87M', desc: 'people studied to confirm this finding', source: 'Science, 2017' },
                        { stat: 'FOXO3', desc: 'Most replicated longevity gene across 7 ethnic populations', source: 'PNAS, 2008' },
                        { stat: '7–10 yrs', desc: 'potential lifespan gain from telomere preservation', source: 'Cell, 2012' },
                      ].map(({ stat, desc, source }) => (
                        <div key={stat} className="bg-primary/5 rounded-lg border border-primary/20 p-3 space-y-1 text-center">
                          <div className="text-base font-black text-primary">{stat}</div>
                          <p className="text-[10px] text-foreground font-medium leading-tight">{desc}</p>
                          <p className="text-[9px] text-muted-foreground italic">{source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                <strong className="text-foreground">Calculation method:</strong> Paternal 50% / Maternal 50% weighted average. Still-living family members receive a statistical longevity adjustment (+2 to +7 yrs based on current age). Genetic bonus = (family avg − 78) × 0.25, capped ±8 years.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── STEP 8: Pillar 3 — Community Anchor ── */}
        {step === 8 && (() => {
          const envInfluence = Math.round(Math.min(1.0, pillar2.mentorHabits.reduce((s, id) => {
            const h = EPIGENETIC_HABITS.find(x => x.id === id);
            return s + (h?.gain ?? 0) * 0.15;
          }, 0)) * 100) / 100;
          const mentorAge = pillar2.mentorAge;
          const baseBonus = mentorAge >= 95 ? 0.8 : mentorAge >= 85 ? 0.5 : mentorAge >= 75 ? 0.3 : 0;
          const habitsBonus = envInfluence;
          const totalCommunityBonus = Math.min(1.5, baseBonus + habitsBonus);

          return (
            <div className="space-y-6">
              {/* Genetic summary from Step 7 */}
              {enteredMemberCount >= 2 ? (
                <div className="flex items-start gap-3 bg-primary/5 rounded-xl border border-primary/20 p-4">
                  <span className="text-xl">🧬</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Your Genetic Starting Point</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`border text-xs ${SCORE_COLORS[previewScore] || ''}`}>{previewScore}</Badge>
                      <span className="text-xs text-muted-foreground">Family Baseline: ~{previewWfa} yrs</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Your genetics account for ~25-30% of your longevity ceiling. This step covers the remaining 70-75% — your lifestyle and environment. <strong className="text-foreground">(WHO, 2023)</strong>
                    </p>
                    {/* "Translates to" line */}
                    <p className="text-[11px] font-medium text-foreground pt-0.5">
                      This translates to{' '}
                      <span className={geneticAdj >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                        {adjSign}{geneticAdj} years
                      </span>{' '}on your longevity forecast.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-muted/30 rounded-xl border p-3 text-xs text-muted-foreground">
                  <span>🧬</span>
                  <span>Genetic data not entered — your forecast will use WHO population averages as the genetic baseline.</span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">🏘️ Your Community Anchor</h3>
                <p className="text-sm text-muted-foreground mt-1">Pillar 3 of 3 · Your environment and community are as powerful as your biology.</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Epigenetics proves that your daily habits and community environment can override genetic predispositions.{' '}
                  <span className="font-medium text-foreground">WHO, 2023</span>: "Lifestyle factors account for up to 70% of longevity outcomes."
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="underline decoration-dotted cursor-help ml-1 text-primary">"What is epigenetics?"</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs p-3">
                        Epigenetics refers to changes in gene expression caused by lifestyle and environment — not changes to DNA itself. Your habits literally switch genes on or off. (National Institutes of Health)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
              </div>

              {/* Area A — Roseto Effect */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">🏙️ The Roseto Effect — Why Your Community Shapes Your Longevity</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  In the 1960s, epidemiologist Stewart Wolf noticed something extraordinary: residents of Roseto, Pennsylvania — a tight-knit Italian-American community — had a heart attack rate <strong className="text-foreground">nearly half</strong> the US national average, despite eating a high-fat diet and having no better individual health habits than neighboring towns.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The reason? Community structure. Multigenerational households, civic engagement, a culture of mutual support, and shared meals created an invisible protective shield. When younger generations assimilated into American individualism in the 1970s, the heart attack rate rose to match the national average within one generation.
                </p>
                <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  Your community anchor — a long-lived mentor or neighbor — is your Roseto Effect in action.
                </p>
              </div>

              {/* Section A: Community Longevity Mentor */}
              <div className="bg-muted/30 rounded-xl border p-4 space-y-4">
                <h4 className="text-sm font-bold text-foreground">Section A — Community Longevity Mentor <span className="text-muted-foreground font-normal">(Optional)</span></h4>
                <p className="text-xs text-muted-foreground">Do you know someone in your community who has lived or is living exceptionally long?</p>
                <div className="flex items-center gap-3">
                  <Label className="text-sm">Do you have a longevity mentor?</Label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant={pillar2.hasMentor ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setPillar2(p => ({ ...p, hasMentor: true }))}>Yes</Button>
                    <Button type="button" size="sm" variant={!pillar2.hasMentor ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setPillar2(p => ({ ...p, hasMentor: false }))}>No</Button>
                  </div>
                </div>
                {pillar2.hasMentor && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Their name (optional)</Label>
                        <Input type="text" placeholder="e.g. Uncle Ratan" value={pillar2.mentorName} onChange={(e) => setPillar2(p => ({ ...p, mentorName: e.target.value }))} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">
                            {pillar2.mentorIsLiving !== false ? 'Their current age' : 'Their age at time of passing'}
                          </Label>
                          <div className="flex gap-1">
                            <Button
                              type="button" size="sm"
                              variant={pillar2.mentorIsLiving !== false ? 'default' : 'outline'}
                              className="h-5 px-1.5 text-[9px]"
                              onClick={() => setPillar2(p => ({ ...p, mentorIsLiving: true }))}
                            >Still Living</Button>
                            <Button
                              type="button" size="sm"
                              variant={pillar2.mentorIsLiving === false ? 'default' : 'outline'}
                              className="h-5 px-1.5 text-[9px]"
                              onClick={() => setPillar2(p => ({ ...p, mentorIsLiving: false }))}
                            >Passed Away</Button>
                          </div>
                        </div>
                        <Input type="number" placeholder="e.g. 94" value={pillar2.mentorAge || ''} onChange={(e) => setPillar2(p => ({ ...p, mentorAge: Number(e.target.value) }))} className="h-8 text-xs" min={60} max={130} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Relationship</Label>
                      <Select value={pillar2.mentorRelationship} onValueChange={(v) => setPillar2(p => ({ ...p, mentorRelationship: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Neighbor', 'Community Elder', 'Relative', 'Religious Leader', 'Teacher', 'Yoga/Fitness Instructor', 'Other'].map(r => (
                            <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {pillar2.mentorAge >= 75 && (
                      <p className="text-xs text-green-700 bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200">
                        {pillar2.mentorIsLiving !== false
                          ? `✅ +${baseBonus} yr environmental bonus: ${pillar2.mentorName || 'your mentor'} is living proof that your environment supports longevity`
                          : `✅ +${baseBonus} yr environmental bonus: ${pillar2.mentorName || 'your mentor'}'s remarkable lifespan shows your community environment supported long life`
                        }
                        {pillar2.mentorAge >= 95 ? ' (age 95+: exceptional)' : pillar2.mentorAge >= 85 ? ' (age 85+: strong signal)' : ' (age 75+: healthy)'}
                        {totalCommunityBonus > baseBonus && <span> · +{Math.round((totalCommunityBonus - baseBonus) * 100) / 100} yr from mentor habits = <strong>+{Math.round(totalCommunityBonus * 10) / 10} yr total</strong></span>}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground italic">People in similar environments share air quality, food culture, noise levels, and social norms. A long-lived neighbor is powerful evidence that YOUR environment supports longevity.</p>
                  </div>
                )}
              </div>

              {/* Area B — Mentor Habits Epigenetics Explanation */}
              {pillar2.hasMentor && pillar2.mentorHabits.length > 0 && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">🔬 How Your Mentor's Habits Create an Epigenetic Multiplier</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Epigenetics research shows that living in close proximity to someone who practices longevity-promoting habits creates measurable changes in your own biology — through shared food culture, sleep norms, stress patterns, and social activity levels.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Each habit your mentor practices contributes <strong className="text-foreground">15% of its full scientific value</strong> to your forecast — reflecting the indirect environmental influence rather than your direct practice. This is based on the "social contagion" findings from the Framingham Heart Study (Christakis &amp; Fowler, NEJM 2007), which showed health behaviors spread through social networks across three degrees of separation.
                  </p>
                  <div className="bg-blue-100/60 dark:bg-blue-900/20 rounded-lg p-2.5 text-[10px] font-mono border border-blue-200 dark:border-blue-800">
                    <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Environmental Multiplier Formula</p>
                    <p className="text-muted-foreground">Each mentor habit: habit_gain × 0.15 = environmental bonus</p>
                    <p className="text-muted-foreground">Total bonus = sum of all selected habits × 0.15, capped at +1.0 yr</p>
                  </div>
                </div>
              )}

              {/* Section B: Community Anchor's Longevity Habits */}
              {pillar2.hasMentor ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Section B — Your Community Anchor's Longevity Habits</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      What habits do you believe contribute to{' '}
                      <strong>{pillar2.mentorName || 'your mentor'}</strong>'s long life?
                      Select all that apply.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {EPIGENETIC_HABITS.map((habit) => {
                      const selected = pillar2.mentorHabits.includes(habit.id);
                      return (
                        <div
                          key={habit.id}
                          onClick={() => toggleMentorHabit(habit.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-start space-x-3 bg-background shadow-sm ${
                            selected ? 'ring-2 ring-green-500 border-green-500 bg-green-50/50 dark:bg-green-950/20 scale-[1.02]' : 'hover:border-primary/50'
                          }`}
                        >
                          <Checkbox checked={selected} onCheckedChange={() => {}} className="mt-0.5" />
                          <div className="pointer-events-none flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-xs font-bold cursor-pointer">{habit.emoji} {habit.label}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className={`text-[9px] font-bold flex-shrink-0 cursor-help transition-all ${selected ? 'text-green-700 border-green-500 bg-green-100' : 'text-green-600 border-green-400'}`}>
                                      +{habit.gain}yr
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs text-xs p-2">{habit.source}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {pillar2.mentorHabits.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-primary/5 rounded-lg border border-primary/20 px-4 py-2">
                        <span className="text-xs font-medium text-foreground">
                          {pillar2.mentorHabits.length} habit{pillar2.mentorHabits.length !== 1 ? 's' : ''} attributed to mentor
                        </span>
                        <Badge variant="outline" className="text-xs font-bold text-green-700 border-green-500">
                          Environmental influence: +{envInfluence.toFixed(2)} yr
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
                        Living near someone who practices these habits creates an environmental influence on your own behaviour — through shared food culture, social norms, and motivation. Each habit contributes 15% of its full scientific value as an indirect environmental effect.
                      </p>
                    </div>
                  )}

                  {/* Area C — Blue Zones Power 9 */}
                  <div className="bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900 p-4 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-green-900 dark:text-green-200">🌍 The Power 9® — Habits of the World's Longest-Lived People</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Validated across 5 Blue Zone regions spanning 4 continents — not supplements or healthcare, but daily community habits that make longevity the default.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['🇮🇹 Sardinia', '🇯🇵 Okinawa', '🇺🇸 Loma Linda', '🇨🇷 Nicoya', '🇬🇷 Ikaria'].map(zone => (
                          <span key={zone} className="text-[10px] bg-green-100/80 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700 font-medium">
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {POWER9_HABITS.map(({ id, emoji, name, region, science }) => (
                        <div
                          key={id}
                          className={`rounded-lg border p-2.5 space-y-1 transition-all ${
                            pillar2.mentorHabits.includes(id)
                              ? 'bg-green-100/70 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                              : 'bg-background border-border/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{emoji}</span>
                            {pillar2.mentorHabits.includes(id) && (
                              <span className="text-[8px] text-green-600 font-bold">✓</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-foreground leading-snug">{name}</p>
                          <p className="text-[8px] text-primary/80 font-medium">{region}</p>
                          <p className="text-[9px] text-muted-foreground leading-snug italic">{science}</p>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const count = pillar2.mentorHabits.filter(id => POWER9_IDS.includes(id)).length;
                      return (
                        <div className="bg-green-100/60 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                          <p className="text-[11px] text-green-900 dark:text-green-200 leading-relaxed">
                            Your community anchor practices <strong>{count}</strong> of these 9 principles — providing environmental evidence that these habits are sustainable in YOUR community.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="bg-muted/20 rounded-xl border border-dashed p-5 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Add a community mentor in Section A above to unlock this section —</p>
                  <p className="text-xs text-muted-foreground">their lifestyle habits become your environmental blueprint.</p>
                </div>
              )}

              {/* ── Result Preview Card (replaces final nav button) ── */}
              {liveResult && (
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/30 p-5 space-y-4 animate-fade-in-up">
                  <h3 className="text-sm font-bold text-foreground text-center">
                    🎯 Based on your complete health profile, family genetics, and community environment:
                  </h3>

                  <div className="text-center">
                    <strong className="text-5xl font-black text-primary">{liveResult.totalForecast}</strong>
                    <span className="text-xl font-bold text-primary ml-1">yrs</span>
                  </div>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    This reflects your current trajectory — accounting for your health, the genetic heritage you've inherited, and your environmental context.
                  </p>

                  {/* Science stat cards */}
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                      🔬 Science has given you a starting point. But here's what the research also shows:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-green-50 border border-green-200 rounded-lg p-2 space-y-0.5">
                        <div className="text-base font-black text-green-700">70–75%</div>
                        <div className="text-[9px] text-green-800 font-semibold leading-tight">of longevity is controlled by lifestyle</div>
                        <div className="text-[9px] text-muted-foreground">(WHO, 2023)</div>
                      </div>
                      <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-2 space-y-0.5">
                        <div className="text-base font-black text-blue-700">10–20 yrs</div>
                        <div className="text-[9px] text-blue-800 font-semibold leading-tight">can be added through evidence-based changes</div>
                        <div className="text-[9px] text-muted-foreground">(Blue Zones Research)</div>
                      </div>
                      <div className="text-center bg-purple-50 border border-purple-200 rounded-lg p-2 space-y-0.5">
                        <div className="text-base font-black text-purple-700">25+</div>
                        <div className="text-[9px] text-purple-800 font-semibold leading-tight">factors influence your lifespan — most within your control</div>
                        <div className="text-[9px] text-muted-foreground">(Harvard Health)</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-center font-semibold text-foreground">
                      The question is: how much of those extra years do you want to unlock?
                    </p>
                    <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                      The Longevity Simulator lets you explore what's possible — adjust each factor to see your optimized potential in real time.
                    </p>
                  </div>

                  {/* Breakdown table */}
                  <div className="bg-background/80 rounded-lg border p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starting point (WHO baseline)</span>
                      <strong>{liveResult.baselineLifeExpectancy} yrs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Health & lifestyle</span>
                      <strong className={liveResult.healthAdjustment >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {liveResult.healthAdjustment >= 0 ? '+' : ''}{liveResult.healthAdjustment} yrs
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Family genetics</span>
                      <strong className={liveResult.geneticAdjustment >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {liveResult.geneticAdjustment >= 0 ? '+' : ''}{liveResult.geneticAdjustment} yrs
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Community bonus</span>
                      <strong className="text-green-600">+{liveResult.communityBonus} yrs</strong>
                    </div>
                    <div className="border-t pt-1.5 flex justify-between font-bold">
                      <span>Your forecast</span>
                      <strong className="text-primary">{liveResult.totalForecast} yrs</strong>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground leading-relaxed">
                    Science has given you a number. But this is just your starting point — not your destiny.{' '}
                    <strong className="text-foreground">Research shows lifestyle controls 70–75% of outcomes (WHO, 2023).</strong>
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => onComplete?.({ quiz: data, pillar1, pillar2 })}
                      className="w-full bg-primary text-primary-foreground font-bold py-5 text-sm"
                    >
                      Yes — Show Me My Longevity Potential →
                    </Button>
                    {onCompleteSkip && (
                      <button
                        onClick={() => onCompleteSkip({ quiz: data, pillar1, pillar2 })}
                        className="text-xs text-muted-foreground hover:text-primary underline text-center transition-colors py-1"
                      >
                        Skip to Full Report
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <Separator />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => { if (step > 1) setStep(step - 1); }} disabled={step === 1}>Previous</Button>
          {step < totalSteps && (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !data.gender}>Next Step →</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LifeExpectancyCalculator;
