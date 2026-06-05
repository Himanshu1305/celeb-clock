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
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Crown, Heart, Coffee, Brain, Dumbbell, User, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface LifeExpectancyData {
  name: string;
  gender: 'male' | 'female' | '';
  smoking: 'never' | 'light' | 'moderate' | 'heavy' | '';
  drinking: 'none' | 'light' | 'moderate' | 'heavy' | '';
  heartDisease: boolean;
  heartDiseaseFamily: boolean;
  diabetes: boolean;
  diabetesFamily: boolean;
  diet: 'poor' | 'average' | 'good' | 'excellent' | '';
  exercise: 'seldom' | 'light' | 'moderate' | 'heavy' | '';
  stress: number;
  bmi: number;
}

interface Props {
  birthDate?: Date | null;
  celebrities?: any[];
}

export const LifeExpectancyCalculator = ({ birthDate, celebrities = [] }: Props) => {
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
    diabetes: false,
    diabetesFamily: false,
    diet: '',
    exercise: '',
    stress: 5,
    bmi: 24.5
  });
  const [lifeExpectancy, setLifeExpectancy] = useState<number | null>(null);
  const hasTrackedCalculation = useRef(false);

  useEffect(() => {
    if (profile?.name && !data.name) {
      setData(prev => ({ ...prev, name: profile.name }));
    }
  }, [profile, data.name]);

  const calculateLifeExpectancy = () => {
    const effectiveBirthDate = birthDate || new Date(1990, 0, 1);
    let baseYears = data.gender === 'female' ? 81.1 : 76.1;
    const currentAge = new Date().getFullYear() - effectiveBirthDate.getFullYear();

    // Smoking Modifiers
    if (data.smoking === 'light') baseYears -= 3;
    else if (data.smoking === 'moderate') baseYears -= 7;
    else if (data.smoking === 'heavy') baseYears -= 12;

    // Drinking Modifiers
    if (data.drinking === 'light') baseYears += 1;
    else if (data.drinking === 'moderate') baseYears -= 1;
    else if (data.drinking === 'heavy') baseYears -= 6;

    // Medical Conditions
    if (data.heartDisease) baseYears -= 5;
    if (data.heartDiseaseFamily) baseYears -= 2;
    if (data.diabetes) baseYears -= 4;
    if (data.diabetesFamily) baseYears -= 1;

    // Diet & Exercise
    if (data.diet === 'poor') baseYears -= 3;
    else if (data.diet === 'good') baseYears += 2;
    else if (data.diet === 'excellent') baseYears += 4;

    if (data.exercise === 'seldom') baseYears -= 2;
    else if (data.exercise === 'light') baseYears += 1;
    else if (data.exercise === 'moderate') baseYears += 3;
    else if (data.exercise === 'heavy') baseYears += 5;

    // Stress Modifier
    if (data.stress >= 8) baseYears -= 2.5;
    else if (data.stress >= 5) baseYears -= 0.5;
    else if (data.stress >= 3) baseYears += 1;
    else baseYears += 1.5;

    // BMI Modifier
    if (data.bmi < 18.5) baseYears -= 2;
    else if (data.bmi > 30) baseYears -= 3;
    else if (data.bmi > 25 && data.bmi <= 30) baseYears -= 1;

    const remainingYears = Math.max(0, baseYears - currentAge);
    return Math.round((currentAge + remainingYears) * 10) / 10;
  };

  useEffect(() => {
    if (step === 5) {
      const result = calculateLifeExpectancy();
      setLifeExpectancy(result);
      if (!hasTrackedCalculation.current) {
        hasTrackedCalculation.current = true;
        trackFeatureUse('life_expectancy_calculator', { action: 'calculate' });
      }
    }
  }, [step, data, birthDate]);

  const totalSteps = 5;
  const progressValue = (step / totalSteps) * 100;

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
              <Label className="text-base">Biological Sex</Label>
              <RadioGroup value={data.gender} onValueChange={(value) => setData({ ...data, gender: value as any })} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Routine Lifestyle Habits</h3>
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2"><Coffee className="w-4 h-4" /> Tobacco Smoking Habits</Label>
              <RadioGroup value={data.smoking} onValueChange={(value) => setData({ ...data, smoking: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="never" id="never-smoke" /><Label htmlFor="never-smoke">Non-smoker</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-smoke" /><Label htmlFor="light-smoke">Light (1–5 cigarettes per day)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-smoke" /><Label htmlFor="moderate-smoke">Moderate (6–10 cigarettes per day)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-smoke" /><Label htmlFor="heavy-smoke">Heavy (More than 10 cigarettes per day)</Label></div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Alcohol Consumption</Label>
              <RadioGroup value={data.drinking} onValueChange={(value) => setData({ ...data, drinking: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="no-drink" /><Label htmlFor="no-drink">No regular consumption</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-drink" /><Label htmlFor="light-drink">Light intake (1–2 standard drinks daily)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-drink" /><Label htmlFor="moderate-drink">Moderate intake (3–4 standard drinks daily)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="heavy-drink" /><Label htmlFor="heavy-drink">Heavy consumption (More than 4 daily)</Label></div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Medical & Health History</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-base">Do you have a personal history of Heart Disease?</Label>
                <RadioGroup value={data.heartDisease ? "yes" : "no"} onValueChange={(v) => setData({ ...data, heartDisease: v === "yes" })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hd-y" /><Label htmlFor="hd-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hd-n" /><Label htmlFor="hd-n">No</Label></div>
                </RadioGroup>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Label className="text-base">Does your family have a history of Heart Disease?</Label>
                <RadioGroup value={data.heartDiseaseFamily ? "yes" : "no"} onValueChange={(v) => setData({ ...data, heartDiseaseFamily: v === "yes" })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="hdf-y" /><Label htmlFor="hdf-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="hdf-n" /><Label htmlFor="hdf-n">No</Label></div>
                </RadioGroup>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Label className="text-base">Do you have a personal history of Diabetes?</Label>
                <RadioGroup value={data.diabetes ? "yes" : "no"} onValueChange={(v) => setData({ ...data, diabetes: v === "yes" })} className="flex space-x-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="yes" id="db-y" /><Label htmlFor="db-y">Yes</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="no" id="db-n" /><Label htmlFor="db-n">No</Label></div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Nutrition & Baseline Metrics</h3>
            <div className="space-y-3">
              <Label className="text-base">Diet Quality Profile</Label>
              <RadioGroup value={data.diet} onValueChange={(value) => setData({ ...data, diet: value as any })}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="poor" id="poor-diet" /><Label htmlFor="poor-diet">Poor (High processed foods, low nutrients)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="average" id="average-diet" /><Label htmlFor="average-diet">Average (Balanced mix of home and processed options)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="good" id="good-diet" /><Label htmlFor="good-diet">Good (Whole foods, high fiber consistent balance)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="excellent" id="excellent-diet" /><Label htmlFor="excellent-diet">Excellent (Nutrient-dense framework optimized daily)</Label></div>
              </RadioGroup>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-base">Approximate BMI Value: {data.bmi}</Label>
              <Slider value={[data.bmi]} onValueChange={(v) => setData({ ...data, bmi: v[0] })} max={40} min={15} step={0.5} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Activity and Stress Inputs</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-base flex items-center gap-2 mb-2"><Brain className="w-4 h-4" /> Mental Stress Load Tracker: {data.stress}/10</Label>
                <Slider value={[data.stress]} onValueChange={(v) => setData({ ...data, stress: v[0] })} max={10} min={1} step={1} />
              </div>

              <div>
                <Label className="text-base flex items-center gap-2 mb-2"><Dumbbell className="w-4 h-4" /> Physical Exercise Patterns</Label>
                <RadioGroup value={data.exercise} onValueChange={(value) => setData({ ...data, exercise: value as any })}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="seldom" id="seldom-ex" /><Label htmlFor="seldom-ex">Seldom (Rare physical activity, sedentary lifestyle)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="light" id="light-ex" /><Label htmlFor="light-ex">Light (1-2 walks/brief workouts weekly)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="moderate" id="moderate-ex" /><Label htmlFor="moderate-ex">Moderate (3-4 structured sessions weekly)</Label></div>
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
          <Button variant="outline" onClick={() => { if(step > 1) setStep(step - 1) }} disabled={step === 1}>Previous</Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !data.gender}>Next Step</Button>
          ) : (
            <Button variant="secondary" disabled>Calculation Complete</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LifeExpectancyCalculator;