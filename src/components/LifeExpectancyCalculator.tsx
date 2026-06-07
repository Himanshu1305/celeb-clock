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
import { Crown, Heart, Coffee, Brain, Dumbbell, User, ShieldCheck, Info, Activity, Moon, Users, Dna, TreePine } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { countries } from '@/data/countries';
import {
  HealthQuizData,
  Pillar1Data, FamilyMemberData,
  Pillar2Data,
  DEFAULT_PILLAR1, DEFAULT_PILLAR2,
  EPIGENETIC_HABITS,
} from '@/services/LongevityCalculationService';

interface Props {
  birthDate?: Date | null;
  celebrities?: any[];
  onComplete?: (data: { quiz: HealthQuizData; pillar1: Pillar1Data; pillar2: Pillar2Data }) => void;
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

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500 border-blue-400' };
  if (bmi < 25) return { label: 'Normal Weight', color: 'text-green-600 border-green-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600 border-yellow-400' };
  return { label: 'Obese', color: 'text-red-500 border-red-400' };
};

// Compute genetic score from current Pillar1 state (inline duplicate of service logic for live preview)
function computeGeneticScore(p1: Pillar1Data): { wfa: number; score: string } {
  const pat = [p1.paternalGrandfather, p1.paternalGrandmother, p1.father, p1.paternalUncles, p1.paternalAunts]
    .filter(m => !m.unknown && m.age > 0);
  const mat = [p1.maternalGrandfather, p1.maternalGrandmother, p1.mother, p1.maternalUncles, p1.maternalAunts]
    .filter(m => !m.unknown && m.age > 0);
  if (pat.length === 0 && mat.length === 0) return { wfa: 78, score: 'Average' };
  const pa = pat.length > 0 ? pat.reduce((s, m) => s + m.age, 0) / pat.length : 78;
  const ma = mat.length > 0 ? mat.reduce((s, m) => s + m.age, 0) / mat.length : 78;
  const wfa = pat.length > 0 && mat.length > 0 ? pa * 0.5 + ma * 0.5 : pat.length > 0 ? pa : ma;
  const score = wfa > 85 ? 'Exceptional' : wfa >= 80 ? 'Strong' : wfa >= 75 ? 'Average' : 'Below Average';
  return { wfa: Math.round(wfa * 10) / 10, score };
}

// Reusable row for a single family member in the genetics step
const FamilyMemberRow = ({
  label,
  member,
  onChange,
  optional = false,
}: {
  label: string;
  member: FamilyMemberData;
  onChange: (m: FamilyMemberData) => void;
  optional?: boolean;
}) => (
  <div className="p-3 bg-background rounded-lg border shadow-sm space-y-2">
    <div className="flex items-center justify-between gap-2">
      <div>
        <Label className="text-xs font-bold text-foreground">{label}</Label>
        {optional && <span className="text-[10px] text-muted-foreground ml-2">Optional</span>}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          type="button" size="sm"
          variant={member.unknown ? 'default' : 'outline'}
          className="h-6 text-[10px] px-2"
          onClick={() => onChange({ ...member, unknown: true })}
        >Unknown</Button>
        <Button
          type="button" size="sm"
          variant={!member.unknown ? 'default' : 'outline'}
          className="h-6 text-[10px] px-2"
          onClick={() => onChange({ ...member, unknown: false })}
        >Known</Button>
      </div>
    </div>
    {!member.unknown && (
      <div className="flex items-end gap-4 ml-1 pt-1">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Age (years)</Label>
          <Input
            type="number"
            value={member.age || ''}
            onChange={(e) => onChange({ ...member, age: Number(e.target.value) })}
            placeholder="e.g. 78"
            className="w-20 h-7 text-xs text-center font-bold"
            min={1} max={120}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Status</Label>
          <div className="flex gap-1">
            <Button
              type="button" size="sm"
              variant={member.isLiving ? 'default' : 'outline'}
              className="h-7 text-[10px] px-2"
              onClick={() => onChange({ ...member, isLiving: true })}
            >Still Living</Button>
            <Button
              type="button" size="sm"
              variant={!member.isLiving ? 'default' : 'outline'}
              className="h-7 text-[10px] px-2"
              onClick={() => onChange({ ...member, isLiving: false })}
            >Passed Away</Button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export const LifeExpectancyCalculator = ({ birthDate, celebrities = [], onComplete }: Props) => {
  const { isPremium, profile } = useAuth();
  const { trackFeatureUse } = useAnalytics();
  const [step, setStep] = useState(1);

  const [data, setData] = useState<HealthQuizData>({
    name: '',
    gender: '',
    country: '',
    smoking: '',
    drinking: '',
    heartDisease: false, heartDiseaseFamily: false, heartDiseaseControlled: null,
    diabetes: false, diabetesFamily: false, diabetesControlled: null,
    hypertension: false, hypertensionControlled: null,
    diet: '', exercise: '', stress: 5, bmi: 24.5,
    bloodPressure: '', sleepDuration: '', socialConnections: '',
  });

  const [pillar1, setPillar1] = useState<Pillar1Data>(DEFAULT_PILLAR1);
  const [pillar2, setPillar2] = useState<Pillar2Data>(DEFAULT_PILLAR2);

  const [lifeExpectancy, setLifeExpectancy] = useState<number | null>(null);
  const hasTracked = useRef(false);

  // BMI calculator local state
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

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

  // Preview calculation (steps 1-6 only, shown at step 6)
  const calculatePreview = () => {
    const effectiveBirth = birthDate || new Date(1990, 0, 1);
    let base = data.gender === 'female' ? 81.1 : 76.1;
    const curAge = new Date().getFullYear() - effectiveBirth.getFullYear();
    if (data.smoking === 'light') base -= 3; else if (data.smoking === 'moderate') base -= 7; else if (data.smoking === 'heavy') base -= 12;
    if (data.drinking === 'light') base += 1; else if (data.drinking === 'moderate') base -= 1; else if (data.drinking === 'heavy') base -= 6;
    if (data.heartDisease) { base -= 5; if (data.heartDiseaseControlled) base += 1.25; }
    if (data.heartDiseaseFamily) base -= 2;
    if (data.diabetes) { base -= 4; if (data.diabetesControlled) base += 1.6; }
    if (data.diabetesFamily) base -= 1;
    if (data.hypertension) { base -= 3; if (data.hypertensionControlled) base += 1.05; }
    if (data.diet === 'poor') base -= 3; else if (data.diet === 'good') base += 2; else if (data.diet === 'excellent') base += 4;
    if (data.exercise === 'seldom') base -= 2; else if (data.exercise === 'light') base += 1; else if (data.exercise === 'moderate') base += 3; else if (data.exercise === 'heavy') base += 5;
    if (data.stress >= 8) base -= 2.5; else if (data.stress >= 5) base -= 0.5; else if (data.stress >= 3) base += 1; else base += 1.5;
    if (data.bmi < 18.5) base -= 2; else if (data.bmi > 30) base -= 3; else if (data.bmi > 25) base -= 1;
    if (data.bloodPressure === 'optimal') base += 1.5; else if (data.bloodPressure === 'elevated') base -= 1; else if (data.bloodPressure === 'high1') base -= 2.5; else if (data.bloodPressure === 'high2') base -= 5;
    if (data.sleepDuration === 'under6') base -= 2; else if (data.sleepDuration === '6to7') base -= 0.5; else if (data.sleepDuration === 'over9') base -= 1;
    if (data.socialConnections === 'strong') base += 2; else if (data.socialConnections === 'limited') base -= 1.5; else if (data.socialConnections === 'isolated') base -= 3;
    return Math.round((curAge + Math.max(0, base - curAge)) * 10) / 10;
  };

  useEffect(() => {
    if (step === 6) {
      const r = calculatePreview();
      setLifeExpectancy(r);
      if (!hasTracked.current) { hasTracked.current = true; trackFeatureUse('life_expectancy_calculator', { action: 'calculate' }); }
    }
  }, [step, data, birthDate]);

  const totalSteps = 8;
  const bmiCategory = getBMICategory(data.bmi);
  const { wfa, score: geneticScore } = computeGeneticScore(pillar1);
  const scoreColor = { Exceptional: 'bg-emerald-100 text-emerald-800 border-emerald-300', Strong: 'bg-green-100 text-green-800 border-green-300', Average: 'bg-yellow-100 text-yellow-800 border-yellow-300', 'Below Average': 'bg-orange-100 text-orange-800 border-orange-300' }[geneticScore] || '';
  const scoreTooltip = { Exceptional: 'Your family history shows exceptional longevity above 85 years average — strong genetic tailwinds.', Strong: 'Your family\'s average longevity of 80-85 years reflects solid genetic inheritance.', Average: 'Your family\'s average longevity of 75-80 years is close to global population norms.', 'Below Average': 'Your family\'s average longevity below 75 years suggests heightened focus on lifestyle factors is especially important.' }[geneticScore] || '';

  const updateP1Member = (field: keyof Pillar1Data, val: FamilyMemberData) => setPillar1(p => ({ ...p, [field]: val }));
  const toggleHabit = (id: string) => setPillar2(p => ({ ...p, selectedHabits: p.selectedHabits.includes(id) ? p.selectedHabits.filter(h => h !== id) : [...p.selectedHabits, id] }));

  const habitBonus = Math.min(6, pillar2.selectedHabits.reduce((s, id) => s + (EPIGENETIC_HABITS.find(h => h.id === id)?.gain ?? 0), 0));

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" /> Life Expectancy Calculator
            </CardTitle>
            <CardDescription>
            {step === 7
              ? `Step ${step} of ${totalSteps} · Step 2 of our 3-Pillar Analysis`
              : step === 8
              ? `Step ${step} of ${totalSteps} · Step 3 of our 3-Pillar Analysis`
              : `Step ${step} of ${totalSteps} · Personalized Health Check`}
          </CardDescription>
          </div>
        </div>
        <Progress value={(step / totalSteps) * 100} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6 text-left">

        {/* ── STEP 1: Personal Info ── */}
        {step === 1 && (
          <div className="space-y-6">
            <Alert className="border-accent/30 bg-accent/5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                All health data is processed locally inside your browser and stays completely private.
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
            {profile?.country ? (
              <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 px-3 py-2.5">
                <span className="text-base">🌍</span>
                <p className="text-xs text-muted-foreground">
                  Using your profile location: <strong className="text-foreground">{profile.country}</strong>
                  <span className="ml-1 text-[10px] opacity-70">(for WHO baseline calculation)</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-base flex items-center">
                  Country of Residence
                  <InfoTooltip content="Life expectancy baselines vary significantly by country due to healthcare quality, diet culture, and environmental factors. We use WHO 2023 country-specific data." />
                </Label>
                <Select value={data.country} onValueChange={(v) => setData({ ...data, country: v })}>
                  <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              {/* Heart Disease */}
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
              {/* Diabetes */}
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
              {/* Hypertension */}
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
                <RadioGroup value={data.exercise} onValueChange={(v) => setData({ ...data, exercise: v as any })}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="seldom" id="seldom-ex" /><Label htmlFor="seldom-ex">Seldom (Rare physical activity, sedentary lifestyle)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-ex" /><Label htmlFor="light-ex">Light (1–2 walks/brief workouts weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-ex" /><Label htmlFor="moderate-ex">Moderate (3–4 structured sessions weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-ex" /><Label htmlFor="heavy-ex">Heavy (5+ intense training routines weekly)</Label></div>
                </RadioGroup>
              </div>
            </div>

            {lifeExpectancy !== null && (
              <div className="relative mt-6 border p-6 rounded-xl bg-muted/20">
                <div className={!isPremium ? 'blur-sm pointer-events-none select-none' : ''}>
                  <div className="text-center py-4">
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Estimated Baseline (Steps 1–6 only)</span>
                    <h2 className="text-5xl font-black text-primary mt-1">{lifeExpectancy} Years</h2>
                    <p className="text-xs text-muted-foreground mt-2">Complete steps 7–8 to include genetics & epigenetics for your full forecast.</p>
                  </div>
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-4 z-10 rounded-xl">
                    <div className="max-w-sm bg-background p-6 rounded-xl border shadow-xl space-y-3 text-center">
                      <Crown className="w-6 h-6 text-accent mx-auto animate-pulse" />
                      <h4 className="text-lg font-bold">Unlock Full Longevity Report</h4>
                      <p className="text-xs text-muted-foreground">Unlock simulation sliders, genetics analysis, and your complete Longevity Blueprint.</p>
                      <Link to="/upgrade" className="block pt-1">
                        <Button size="sm" className="w-full bg-accent text-accent-foreground font-semibold hover:bg-accent/90">Upgrade to Premium</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 7: Pillar 1 — Biological Blueprint (Family Genetics) ── */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2"><Dna className="w-5 h-5 text-primary" /> 🧬 Your Biological Blueprint</h3>
              <p className="text-sm text-muted-foreground mt-1">Step 2 of our 3-Pillar Analysis</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Your family's longevity history is the single strongest predictor of your <strong>Family Longevity Baseline</strong>.{' '}
                <strong>Karolinska Institute, 2017</strong> — heritability of longevity estimated at 25–30%.
                Toggle <em>Known</em> for any relative whose age you know, then set their status.
              </p>
            </div>

            {/* Genetic Score badge (live — shown when ≥2 entries known) */}
            {Object.values(pillar1).filter(m => !m.unknown && m.age > 0).length >= 2 && (
              <div className="flex items-center gap-2 animate-fade-in-up">
                <span className="text-xs text-muted-foreground">Genetic Vitality Score:</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={`border ${scoreColor}`}>{geneticScore} · Family avg ~{wfa} yrs</Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs p-3">{scoreTooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><TreePine className="w-4 h-4 text-blue-500" /> Paternal Side</h4>
              <div className="space-y-2">
                <FamilyMemberRow label="Paternal Grandfather" member={pillar1.paternalGrandfather} onChange={(m) => updateP1Member('paternalGrandfather', m)} />
                <FamilyMemberRow label="Paternal Grandmother" member={pillar1.paternalGrandmother} onChange={(m) => updateP1Member('paternalGrandmother', m)} />
                <FamilyMemberRow label="Father" member={pillar1.father} onChange={(m) => updateP1Member('father', m)} />
                <FamilyMemberRow label="Paternal Uncles (avg age)" member={pillar1.paternalUncles} onChange={(m) => updateP1Member('paternalUncles', m)} optional />
                <FamilyMemberRow label="Paternal Aunts (avg age)" member={pillar1.paternalAunts} onChange={(m) => updateP1Member('paternalAunts', m)} optional />
              </div>

              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 pt-2"><TreePine className="w-4 h-4 text-emerald-500" /> Maternal Side</h4>
              <div className="space-y-2">
                <FamilyMemberRow label="Maternal Grandfather" member={pillar1.maternalGrandfather} onChange={(m) => updateP1Member('maternalGrandfather', m)} />
                <FamilyMemberRow label="Maternal Grandmother" member={pillar1.maternalGrandmother} onChange={(m) => updateP1Member('maternalGrandmother', m)} />
                <FamilyMemberRow label="Mother" member={pillar1.mother} onChange={(m) => updateP1Member('mother', m)} />
                <FamilyMemberRow label="Maternal Uncles (avg age)" member={pillar1.maternalUncles} onChange={(m) => updateP1Member('maternalUncles', m)} optional />
                <FamilyMemberRow label="Maternal Aunts (avg age)" member={pillar1.maternalAunts} onChange={(m) => updateP1Member('maternalAunts', m)} optional />
              </div>
            </div>

            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                <strong className="text-foreground">Calculation method:</strong> Weighted average of paternal (50%) and maternal (50%) sides. Genetic bonus = (family avg − 78) × 0.25, capped at ±8 years. Research shows genetics account for 25–30% of longevity — your habits control the remaining 70–75%.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── STEP 8: Pillar 2 — Community & Epigenetic Anchor ── */}
        {step === 8 && (() => {
          const BLUE_ZONES_IDS = new Set(['walking', 'purpose', 'meditation', 'fasting', 'wholefood', 'spiritual', 'community', 'volunteer']);
          const blueZonesCount = pillar2.selectedHabits.filter(id => BLUE_ZONES_IDS.has(id)).length;
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">🏘️ Your Community Anchor</h3>
                <p className="text-sm text-muted-foreground mt-1">Step 3 of our 3-Pillar Analysis</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Epigenetics proves that your daily habits and community environment can override genetic predispositions.{' '}
                  <span className="font-medium text-foreground">WHO, 2023</span>: "Lifestyle factors account for up to 70% of longevity outcomes."
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="underline decoration-dotted cursor-help ml-1 text-primary">"What is Epigenetic?"</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs p-3">
                        Epigenetics refers to changes in gene expression caused by lifestyle and environment — not changes to DNA itself. Your habits literally switch genes on or off. (National Institutes of Health)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
              </div>

              {/* Section A: Community Longevity Mentor (Optional) */}
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
                        <Label className="text-xs">Their age / age at passing</Label>
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
                    {pillar2.mentorAge > 85 && (
                      <p className="text-xs text-green-700 bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200">
                        ✅ +0.5 yr community bonus: Your community environment supports exceptional longevity.
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground italic">People in similar environments share air quality, food culture, noise levels, and social norms. A long-lived neighbor is powerful evidence that YOUR environment supports longevity.</p>
                  </div>
                )}
              </div>

              {/* Section B: Epigenetic Habits */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Section B — Your Epigenetic Habits</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Select all positive everyday habits you consistently follow. Each adds real years to your forecast.</p>
                  </div>
                  {blueZonesCount > 0 && (
                    <Badge variant="outline" className="shrink-0 text-[10px] border-blue-400 text-blue-600">
                      🌍 {blueZonesCount}/8 Blue Zones
                    </Badge>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {EPIGENETIC_HABITS.map((habit) => {
                    const selected = pillar2.selectedHabits.includes(habit.id);
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-start space-x-3 bg-background shadow-sm ${
                          selected
                            ? 'ring-2 ring-green-500 border-green-500 bg-green-50/50 dark:bg-green-950/20 scale-[1.02]'
                            : 'hover:border-primary/50'
                        }`}
                      >
                        <Checkbox checked={selected} onCheckedChange={() => {}} className="mt-0.5" />
                        <div className="pointer-events-none flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-xs font-bold cursor-pointer">{habit.emoji} {habit.label}</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] font-bold flex-shrink-0 cursor-help transition-all ${
                                      selected
                                        ? 'text-green-700 border-green-500 bg-green-100'
                                        : 'text-green-600 border-green-400'
                                    }`}
                                  >+{habit.gain}yr</Badge>
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
                {pillar2.selectedHabits.length > 0 && (
                  <div className="flex items-center justify-between bg-primary/5 rounded-lg border border-primary/20 px-4 py-2">
                    <span className="text-xs font-medium text-foreground">
                      {pillar2.selectedHabits.length} habit{pillar2.selectedHabits.length !== 1 ? 's' : ''} selected
                      {blueZonesCount > 0 && <span className="text-blue-600 ml-2">· {blueZonesCount}/8 Blue Zones principles</span>}
                    </span>
                    <Badge className="text-xs font-bold bg-primary text-primary-foreground">+{habitBonus.toFixed(1)} yrs (cap: +6)</Badge>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <Separator />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => { if (step > 1) setStep(step - 1); }} disabled={step === 1}>Previous</Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !data.gender}>Next Step</Button>
          ) : (
            <Button
              onClick={() => onComplete?.({ quiz: data, pillar1, pillar2 })}
              className="bg-primary text-primary-foreground font-bold px-6"
            >
              Generate Full Longevity Blueprint →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LifeExpectancyCalculator;
