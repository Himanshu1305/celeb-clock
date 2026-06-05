import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Crown, Heart, Coffee, Brain, Dumbbell, User, ShieldCheck, Info, Activity, Moon, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface LifeExpectancyData {
  name: string;
  gender: 'male' | 'female' | '';
  smoking: 'never' | 'light' | 'moderate' | 'heavy' | '';
  drinking: 'none' | 'light' | 'moderate' | 'heavy' | '';
  heartDisease: boolean;
  heartDiseaseFamily: boolean;
  heartDiseaseControlled: boolean | null;
  diabetes: boolean;
  diabetesFamily: boolean;
  diabetesControlled: boolean | null;
  hypertension: boolean;
  hypertensionControlled: boolean | null;
  diet: 'poor' | 'average' | 'good' | 'excellent' | '';
  exercise: 'seldom' | 'light' | 'moderate' | 'heavy' | '';
  stress: number;
  bmi: number;
  bloodPressure: 'optimal' | 'normal' | 'elevated' | 'high1' | 'high2' | '';
  sleepDuration: 'under6' | '6to7' | '7to9' | 'over9' | '';
  socialConnections: 'strong' | 'moderate' | 'limited' | 'isolated' | '';
}

interface Props {
  birthDate?: Date | null;
  celebrities?: any[];
  onComplete?: (result: { lifeExpectancy: number; userSelections: LifeExpectancyData }) => void;
}

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex cursor-help ml-1.5">
          <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed p-3">
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500 border-blue-400' };
  if (bmi < 25) return { label: 'Normal Weight', color: 'text-green-600 border-green-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600 border-yellow-400' };
  return { label: 'Obese', color: 'text-red-500 border-red-400' };
};

export const LifeExpectancyCalculator = ({ birthDate, celebrities = [], onComplete }: Props) => {
  const { isPremium, profile } = useAuth();
  const { trackFeatureUse } = useAnalytics();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LifeExpectancyData>({
    name: '',
    gender: '',
    smoking: '',
    drinking: '',
    heartDisease: false,
    heartDiseaseFamily: false,
    heartDiseaseControlled: null,
    diabetes: false,
    diabetesFamily: false,
    diabetesControlled: null,
    hypertension: false,
    hypertensionControlled: null,
    diet: '',
    exercise: '',
    stress: 5,
    bmi: 24.5,
    bloodPressure: '',
    sleepDuration: '',
    socialConnections: '',
  });
  const [lifeExpectancy, setLifeExpectancy] = useState<number | null>(null);
  const hasTrackedCalculation = useRef(false);

  // BMI calculator local state
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  useEffect(() => {
    if (profile?.name && !data.name) {
      setData(prev => ({ ...prev, name: profile.name }));
    }
  }, [profile, data.name]);

  // Auto-calculate BMI whenever height/weight inputs change
  useEffect(() => {
    if (bmiUnit === 'metric') {
      const h = parseFloat(heightCm) / 100;
      const w = parseFloat(weightKg);
      if (h > 0 && w > 0) {
        const bmi = Math.round((w / (h * h)) * 10) / 10;
        if (bmi >= 10 && bmi <= 60) setData(prev => ({ ...prev, bmi }));
      }
    } else {
      const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn || '0');
      const w = parseFloat(weightLbs);
      if (totalInches > 0 && w > 0) {
        const bmi = Math.round(((w / (totalInches * totalInches)) * 703) * 10) / 10;
        if (bmi >= 10 && bmi <= 60) setData(prev => ({ ...prev, bmi }));
      }
    }
  }, [bmiUnit, heightCm, heightFt, heightIn, weightKg, weightLbs]);

  const calculateLifeExpectancy = () => {
    const effectiveBirthDate = birthDate || new Date(1990, 0, 1);
    let baseYears = data.gender === 'female' ? 81.1 : 76.1;
    const currentAge = new Date().getFullYear() - effectiveBirthDate.getFullYear();

    // Smoking
    if (data.smoking === 'light') baseYears -= 3;
    else if (data.smoking === 'moderate') baseYears -= 7;
    else if (data.smoking === 'heavy') baseYears -= 12;

    // Drinking
    if (data.drinking === 'light') baseYears += 1;
    else if (data.drinking === 'moderate') baseYears -= 1;
    else if (data.drinking === 'heavy') baseYears -= 6;

    // Medical Conditions with conditional follow-ups
    if (data.heartDisease) {
      baseYears -= 5;
      if (data.heartDiseaseControlled) baseYears += 5 * 0.25; // ESC Guidelines: 20-30% reduction in adverse events
    }
    if (data.heartDiseaseFamily) baseYears -= 2;
    if (data.diabetes) {
      baseYears -= 4;
      if (data.diabetesControlled) baseYears += 4 * 0.40; // ADA 2023: 50% reduction in CV complications
    }
    if (data.diabetesFamily) baseYears -= 1;
    if (data.hypertension) {
      baseYears -= 3;
      if (data.hypertensionControlled) baseYears += 3 * 0.35; // AHA/ACC 2023: 35-40% stroke risk reduction
    }

    // Diet & Exercise
    if (data.diet === 'poor') baseYears -= 3;
    else if (data.diet === 'good') baseYears += 2;
    else if (data.diet === 'excellent') baseYears += 4;

    if (data.exercise === 'seldom') baseYears -= 2;
    else if (data.exercise === 'light') baseYears += 1;
    else if (data.exercise === 'moderate') baseYears += 3;
    else if (data.exercise === 'heavy') baseYears += 5;

    // Stress
    if (data.stress >= 8) baseYears -= 2.5;
    else if (data.stress >= 5) baseYears -= 0.5;
    else if (data.stress >= 3) baseYears += 1;
    else baseYears += 1.5;

    // BMI
    if (data.bmi < 18.5) baseYears -= 2;
    else if (data.bmi > 30) baseYears -= 3;
    else if (data.bmi > 25 && data.bmi <= 30) baseYears -= 1;

    // Blood Pressure (JNC8/AHA guidelines)
    if (data.bloodPressure === 'optimal') baseYears += 1.5;
    else if (data.bloodPressure === 'elevated') baseYears -= 1;
    else if (data.bloodPressure === 'high1') baseYears -= 2.5;
    else if (data.bloodPressure === 'high2') baseYears -= 5;

    // Sleep Duration (NHS/Sleep Foundation)
    if (data.sleepDuration === 'under6') baseYears -= 2;
    else if (data.sleepDuration === '6to7') baseYears -= 0.5;
    else if (data.sleepDuration === 'over9') baseYears -= 1;

    // Social Connections (Harvard Study of Adult Development)
    if (data.socialConnections === 'strong') baseYears += 2;
    else if (data.socialConnections === 'limited') baseYears -= 1.5;
    else if (data.socialConnections === 'isolated') baseYears -= 3;

    const remainingYears = Math.max(0, baseYears - currentAge);
    return Math.round((currentAge + remainingYears) * 10) / 10;
  };

  useEffect(() => {
    if (step === 6) {
      const result = calculateLifeExpectancy();
      setLifeExpectancy(result);
      if (!hasTrackedCalculation.current) {
        hasTrackedCalculation.current = true;
        trackFeatureUse('life_expectancy_calculator', { action: 'calculate' });
      }
    }
  }, [step, data, birthDate]);

  const totalSteps = 6;
  const progressValue = (step / totalSteps) * 100;
  const bmiCategory = getBMICategory(data.bmi);

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Life Expectancy Calculator
            </CardTitle>
            <CardDescription>Step {step} of {totalSteps} • Personalized Health Check</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Standard Mode
          </Badge>
        </div>
        <Progress value={progressValue} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6 text-left">

        {/* ─── STEP 1: Personal Info ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <Alert className="border-accent/30 bg-accent/5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                All health data is processed locally inside your browser and stays completely private.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Your Name
              </Label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                Biological Sex
                <InfoTooltip content="Biological sex affects baseline life expectancy due to hormonal, physiological, and statistical differences. Women live approximately 5 years longer than men on average globally (WHO, 2023)." />
              </Label>
              <RadioGroup
                value={data.gender}
                onValueChange={(value) => setData({ ...data, gender: value as any })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Lifestyle Habits ─── */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Routine Lifestyle Habits</h3>
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Coffee className="w-4 h-4 mr-2" /> Tobacco Smoking Habits
                <InfoTooltip content="Smoking is the leading preventable cause of death worldwide. Heavy smokers lose 10–12 years of life expectancy on average. Even light smoking significantly increases cardiovascular disease and cancer risk (WHO, 2023)." />
              </Label>
              <RadioGroup value={data.smoking} onValueChange={(value) => setData({ ...data, smoking: value as any })}>
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
              <RadioGroup value={data.drinking} onValueChange={(value) => setData({ ...data, drinking: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="no-drink" /><Label htmlFor="no-drink">No regular consumption</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-drink" /><Label htmlFor="light-drink">Light intake (1–2 standard drinks daily)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-drink" /><Label htmlFor="moderate-drink">Moderate intake (3–4 standard drinks daily)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-drink" /><Label htmlFor="heavy-drink">Heavy consumption (More than 4 daily)</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Medical History ─── */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Medical & Health History</h3>
            <div className="space-y-5">

              {/* Heart Disease */}
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">
                  Personal history of Heart Disease?
                  <InfoTooltip content="Diagnosed cardiovascular conditions (coronary artery disease, heart attack, heart failure) reduce life expectancy by 5–8 years on average. Regular cardiology care substantially improves outcomes (AHA, 2023)." />
                </Label>
                <RadioGroup
                  value={data.heartDisease ? "yes" : "no"}
                  onValueChange={(v) => setData({ ...data, heartDisease: v === "yes", heartDiseaseControlled: v === "yes" ? data.heartDiseaseControlled : null })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hd-y" /><Label htmlFor="hd-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hd-n" /><Label htmlFor="hd-n">No</Label></div>
                </RadioGroup>
                {data.heartDisease && (
                  <div className="ml-4 mt-1 p-3 bg-muted/40 rounded-lg border border-muted space-y-2">
                    <Label className="text-sm flex items-center text-muted-foreground">
                      Are you under regular cardiology care?
                      <InfoTooltip content="Regular cardiac monitoring reduces major adverse cardiovascular events by 20–30%. Managed patients have significantly better survival rates than unmonitored patients (ESC Guidelines 2023)." />
                    </Label>
                    <RadioGroup
                      value={data.heartDiseaseControlled === null ? "" : data.heartDiseaseControlled ? "yes" : "no"}
                      onValueChange={(v) => setData({ ...data, heartDiseaseControlled: v === "yes" })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hdc-y" /><Label htmlFor="hdc-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hdc-n" /><Label htmlFor="hdc-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Heart Disease Family */}
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">
                  Family history of Heart Disease?
                  <InfoTooltip content="A first-degree family history of heart disease (parent or sibling before age 55 for men, 65 for women) increases your personal risk by 40–60%. Genetic screening can identify inherited risk factors (AHA, 2023)." />
                </Label>
                <RadioGroup
                  value={data.heartDiseaseFamily ? "yes" : "no"}
                  onValueChange={(v) => setData({ ...data, heartDiseaseFamily: v === "yes" })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hdf-y" /><Label htmlFor="hdf-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hdf-n" /><Label htmlFor="hdf-n">No</Label></div>
                </RadioGroup>
              </div>

              {/* Diabetes */}
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">
                  Personal history of Diabetes?
                  <InfoTooltip content="Type 2 diabetes reduces life expectancy by 4–8 years and doubles cardiovascular risk. Well-controlled blood sugar significantly reduces complications, including a 50% reduction in cardiovascular events (American Diabetes Association, 2023)." />
                </Label>
                <RadioGroup
                  value={data.diabetes ? "yes" : "no"}
                  onValueChange={(v) => setData({ ...data, diabetes: v === "yes", diabetesControlled: v === "yes" ? data.diabetesControlled : null })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="db-y" /><Label htmlFor="db-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="db-n" /><Label htmlFor="db-n">No</Label></div>
                </RadioGroup>
                {data.diabetes && (
                  <div className="ml-4 mt-1 p-3 bg-muted/40 rounded-lg border border-muted space-y-2">
                    <Label className="text-sm flex items-center text-muted-foreground">
                      Is your blood sugar generally well-controlled?
                      <InfoTooltip content="Well-controlled blood glucose (HbA1c below 7%) reduces cardiovascular complications by up to 50% and substantially slows disease progression (American Diabetes Association, 2023)." />
                    </Label>
                    <RadioGroup
                      value={data.diabetesControlled === null ? "" : data.diabetesControlled ? "yes" : "no"}
                      onValueChange={(v) => setData({ ...data, diabetesControlled: v === "yes" })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="dbc-y" /><Label htmlFor="dbc-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="dbc-n" /><Label htmlFor="dbc-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Diabetes Family */}
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">
                  Family history of Diabetes?
                  <InfoTooltip content="Having a parent or sibling with Type 2 diabetes increases your lifetime risk 2–3 times. Genetic predisposition combined with lifestyle factors determines most Type 2 diabetes cases (CDC, 2023)." />
                </Label>
                <RadioGroup
                  value={data.diabetesFamily ? "yes" : "no"}
                  onValueChange={(v) => setData({ ...data, diabetesFamily: v === "yes" })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="dbf-y" /><Label htmlFor="dbf-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="dbf-n" /><Label htmlFor="dbf-n">No</Label></div>
                </RadioGroup>
              </div>

              {/* Hypertension */}
              <div className="flex flex-col gap-2">
                <Label className="text-base flex items-center">
                  Diagnosed Hypertension / High Blood Pressure?
                  <InfoTooltip content="Chronic hypertension is a leading risk factor for stroke, heart attack, and kidney disease. Untreated, it reduces life expectancy by 3–5 years. Effective treatment reduces stroke risk by 35–40% (AHA/ACC 2023 Guidelines)." />
                </Label>
                <RadioGroup
                  value={data.hypertension ? "yes" : "no"}
                  onValueChange={(v) => setData({ ...data, hypertension: v === "yes", hypertensionControlled: v === "yes" ? data.hypertensionControlled : null })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="ht-y" /><Label htmlFor="ht-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="ht-n" /><Label htmlFor="ht-n">No</Label></div>
                </RadioGroup>
                {data.hypertension && (
                  <div className="ml-4 mt-1 p-3 bg-muted/40 rounded-lg border border-muted space-y-2">
                    <Label className="text-sm flex items-center text-muted-foreground">
                      Is your blood pressure managed with medication or lifestyle?
                      <InfoTooltip content="Treated hypertension reduces stroke risk by 35–40% and significantly lowers the risk of heart attack and kidney failure. Consistent management is key to reducing long-term organ damage (AHA/ACC 2023 Guidelines)." />
                    </Label>
                    <RadioGroup
                      value={data.hypertensionControlled === null ? "" : data.hypertensionControlled ? "yes" : "no"}
                      onValueChange={(v) => setData({ ...data, hypertensionControlled: v === "yes" })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="htc-y" /><Label htmlFor="htc-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="htc-n" /><Label htmlFor="htc-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ─── STEP 4: Nutrition & BMI ─── */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Nutrition & Baseline Metrics</h3>

            <div className="space-y-3">
              <Label className="text-base flex items-center">
                Diet Quality Profile
                <InfoTooltip content="Diet quality is one of the most modifiable longevity factors. A nutrient-dense diet can add 4+ years of healthy life compared to a poor diet. Ultra-processed food consumption is linked to 10–14% higher all-cause mortality (Harvard School of Public Health, 2022)." />
              </Label>
              <RadioGroup value={data.diet} onValueChange={(value) => setData({ ...data, diet: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="poor" id="poor-diet" /><Label htmlFor="poor-diet">Poor (High processed foods, low nutrients)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="average" id="average-diet" /><Label htmlFor="average-diet">Average (Balanced mix of home and processed options)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="good" id="good-diet" /><Label htmlFor="good-diet">Good (Whole foods, high fiber consistent balance)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="excellent" id="excellent-diet" /><Label htmlFor="excellent-diet">Excellent (Nutrient-dense framework optimized daily)</Label></div>
              </RadioGroup>
            </div>

            {/* BMI Calculator */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-base flex items-center">
                  BMI Calculator
                  <InfoTooltip content="Body Mass Index (BMI) estimates body fat from height and weight. A BMI of 18.5–24.9 is associated with the lowest mortality risk. Overweight and obese individuals face progressively higher risks of cardiovascular disease, diabetes, and cancer (WHO, 2023)." />
                </Label>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    type="button"
                    variant={bmiUnit === 'metric' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setBmiUnit('metric')}
                  >
                    Metric
                  </Button>
                  <Button
                    type="button"
                    variant={bmiUnit === 'imperial' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setBmiUnit('imperial')}
                  >
                    Imperial
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl border p-4 space-y-3">
                {bmiUnit === 'metric' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Height (cm)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 175"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        min={100} max={250}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Weight (kg)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 70"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        min={30} max={300}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Height (ft)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                        min={3} max={8}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Inches (in)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 9"
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                        min={0} max={11}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Weight (lbs)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 154"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(e.target.value)}
                        min={60} max={700}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between bg-background rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Calculated BMI:</span>
                    <span className="text-xl font-black text-foreground">{data.bmi}</span>
                  </div>
                  <Badge variant="outline" className={bmiCategory.color}>
                    {bmiCategory.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-sm text-muted-foreground">Manual override — drag to adjust BMI: {data.bmi}</Label>
                <Slider
                  value={[data.bmi]}
                  onValueChange={(v) => setData({ ...data, bmi: v[0] })}
                  max={40} min={15} step={0.5}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                  <span>15 (Underweight)</span>
                  <span>18.5–24.9 (Normal)</span>
                  <span>30+ (Obese)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 5: Blood Pressure, Sleep, Social ─── */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Wellness & Lifestyle Factors</h3>

            {/* Blood Pressure */}
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Current Blood Pressure Status
                <InfoTooltip content="Blood pressure is a major determinant of cardiovascular health. Optimal BP below 120/80 mmHg significantly reduces stroke and heart attack risk. Each stage of hypertension progressively increases all-cause mortality (JNC8/AHA Guidelines, 2023)." />
              </Label>
              <RadioGroup value={data.bloodPressure} onValueChange={(value) => setData({ ...data, bloodPressure: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="optimal" id="bp-opt" /><Label htmlFor="bp-opt">Optimal (&lt;120/80 mmHg) · +1.5 yrs</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="bp-norm" /><Label htmlFor="bp-norm">Normal (120–129/80 mmHg) · no change</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="elevated" id="bp-elev" /><Label htmlFor="bp-elev">Elevated (130–139 / 80–89 mmHg) · −1 yr</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="high1" id="bp-h1" /><Label htmlFor="bp-h1">High Stage 1 (140–159 / 90–99 mmHg) · −2.5 yrs</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="high2" id="bp-h2" /><Label htmlFor="bp-h2">High Stage 2 (≥160 / ≥100 mmHg) · −5 yrs</Label></div>
              </RadioGroup>
            </div>

            {/* Sleep Duration */}
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Moon className="w-4 h-4 mr-2" /> Typical Nightly Sleep Duration
                <InfoTooltip content="Sleep is critical for cellular repair, immune function, and metabolic health. Adults sleeping fewer than 6 hours per night have a 12% higher all-cause mortality risk. Both too little and too much sleep are associated with reduced lifespan (NHS/National Sleep Foundation, 2023)." />
              </Label>
              <RadioGroup value={data.sleepDuration} onValueChange={(value) => setData({ ...data, sleepDuration: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="under6" id="sleep-u6" /><Label htmlFor="sleep-u6">Less than 6 hours (sleep deprived) · −2 yrs</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="6to7" id="sleep-67" /><Label htmlFor="sleep-67">6–7 hours (slightly below optimal) · −0.5 yr</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="7to9" id="sleep-79" /><Label htmlFor="sleep-79">7–9 hours (optimal range) · no change</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="over9" id="sleep-o9" /><Label htmlFor="sleep-o9">More than 9 hours (may indicate health issues) · −1 yr</Label></div>
              </RadioGroup>
            </div>

            {/* Social Connections */}
            <div className="space-y-3">
              <Label className="text-base flex items-center">
                <Users className="w-4 h-4 mr-2" /> Quality of Social Connections
                <InfoTooltip content="Strong social relationships are among the strongest predictors of longevity — comparable to quitting smoking. Isolated individuals have a 29% higher risk of coronary heart disease and 32% higher stroke risk (Harvard Study of Adult Development, 80+ years of research)." />
              </Label>
              <RadioGroup value={data.socialConnections} onValueChange={(value) => setData({ ...data, socialConnections: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="strong" id="soc-str" /><Label htmlFor="soc-str">Strong (close relationships, regular meaningful contact) · +2 yrs</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="soc-mod" /><Label htmlFor="soc-mod">Moderate (some connections, occasional interaction) · no change</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="limited" id="soc-lim" /><Label htmlFor="soc-lim">Limited (few meaningful relationships, infrequent contact) · −1.5 yrs</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="isolated" id="soc-iso" /><Label htmlFor="soc-iso">Isolated (little to no meaningful social contact) · −3 yrs</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* ─── STEP 6: Activity, Stress & Results ─── */}
        {step === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Activity and Stress Inputs</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-base flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4" /> Mental Stress Load: {data.stress}/10
                  <InfoTooltip content="Chronic psychological stress triggers sustained cortisol release, which damages the cardiovascular system, suppresses immunity, and accelerates cellular aging. High daily stress is associated with a 40% increased risk of cardiovascular disease (AHA, 2021)." />
                </Label>
                <Slider
                  value={[data.stress]}
                  onValueChange={(v) => setData({ ...data, stress: v[0] })}
                  max={10} min={1} step={1}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
                  <span>1 (Very low)</span>
                  <span>10 (Extreme stress)</span>
                </div>
              </div>

              <div>
                <Label className="text-base flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4" /> Physical Exercise Patterns
                  <InfoTooltip content="Regular physical activity is one of the most powerful longevity interventions. Moderate exercise (150 min/week) reduces all-cause mortality by 31% and can add 3–5 years to lifespan. Even light activity meaningfully extends healthy years (WHO, 2022)." />
                </Label>
                <RadioGroup value={data.exercise} onValueChange={(value) => setData({ ...data, exercise: value as any })}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="seldom" id="seldom-ex" /><Label htmlFor="seldom-ex">Seldom (Rare physical activity, sedentary lifestyle)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-ex" /><Label htmlFor="light-ex">Light (1–2 walks/brief workouts weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-ex" /><Label htmlFor="moderate-ex">Moderate (3–4 structured sessions weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-ex" /><Label htmlFor="heavy-ex">Heavy (5+ intense active training routines weekly)</Label></div>
                </RadioGroup>
              </div>
            </div>

            {lifeExpectancy !== null && (
              <div className="relative mt-6 border p-6 rounded-xl bg-muted/20">
                <div className={!isPremium ? "blur-sm pointer-events-none select-none" : ""}>
                  <div className="text-center py-4">
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Your Estimated Lifespan Baseline</span>
                    <h2 className="text-5xl font-black text-primary mt-1">{lifeExpectancy} Years</h2>
                    <p className="text-xs text-muted-foreground mt-2">Calculated successfully using standard statistical health parameters.</p>
                  </div>
                </div>

                {!isPremium && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-4 z-10 rounded-xl">
                    <div className="max-w-sm bg-background p-6 rounded-xl border shadow-xl space-y-3 text-center">
                      <Crown className="w-6 h-6 text-accent mx-auto animate-pulse" />
                      <h4 className="text-lg font-bold">Unlock Advanced Longevity Report</h4>
                      <p className="text-xs text-muted-foreground">Unlock active simulation sliders, dynamic ancestral modifier arrays, and comparative benchmark data.</p>
                      <Link to="/upgrade" className="block pt-1">
                        <Button size="sm" className="w-full bg-accent text-accent-foreground font-semibold hover:bg-accent/90">
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Separator />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => { if (step > 1) setStep(step - 1); }} disabled={step === 1}>
            Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !data.gender}>
              Next Step
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (onComplete && lifeExpectancy !== null) {
                  onComplete({ lifeExpectancy, userSelections: data });
                }
              }}
              disabled={!data.exercise || lifeExpectancy === null}
            >
              View Full Longevity Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LifeExpectancyCalculator;
