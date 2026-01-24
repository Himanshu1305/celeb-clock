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
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Crown, Heart, Activity, Coffee, Brain, Dumbbell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLifeExpectancyReport } from './EnhancedLifeExpectancyReport';
import { BmiCalculator } from './BmiCalculator';

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
  stress: number; // 1-10
  bmi: number; // calculated or estimated
}

interface Props {
  birthDate?: Date | null;
  celebrities?: any[];
}

export const LifeExpectancyCalculator = ({ birthDate, celebrities = [] }: Props) => {
  console.log('LifeExpectancyCalculator rendered with birthDate:', birthDate);
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
    bmi: 25
  });
  const [lifeExpectancy, setLifeExpectancy] = useState<number | null>(null);
  const [factorBreakdown, setFactorBreakdown] = useState<any>(null);
  const hasTrackedCalculation = useRef(false);

  // Auto-populate name from profile
  useEffect(() => {
    if (profile?.name && !data.name) {
      setData(prev => ({ ...prev, name: profile.name }));
    }
  }, [profile, data.name]);
  
  console.log('Current state:', { birthDate, lifeExpectancy, step, gender: data.gender });

  // Calculate life expectancy based on inputs
  const calculateLifeExpectancy = () => {
    console.log('calculateLifeExpectancy called with:', { birthDate, gender: data.gender });
    
    if (!birthDate || !data.gender) {
      console.log('Returning null because:', { 
        noBirthDate: !birthDate, 
        noGender: !data.gender 
      });
      return null;
    }

    // Base life expectancy by gender (US averages)
    let baseYears = data.gender === 'female' ? 81.1 : 76.1;
    const baseExpectancy = baseYears;
    
    // Current age
    const currentAge = new Date().getFullYear() - birthDate.getFullYear();
    
    // Calculate individual factor impacts
    const factors = {
      smoking: 0,
      drinking: 0,
      exercise: 0,
      diet: 0,
      stress: 0,
      heartDisease: 0,
      diabetes: 0
    };

    // Convert user selections to indices for what-if scenarios
    const userSelections = {
      smoking: data.smoking === 'never' ? 0 : data.smoking === 'light' ? 1 : data.smoking === 'moderate' ? 2 : 3,
      drinking: data.drinking === 'none' ? 0 : data.drinking === 'light' ? 1 : data.drinking === 'moderate' ? 2 : 3,
      exercise: data.exercise === 'seldom' ? 0 : data.exercise === 'light' ? 1 : data.exercise === 'moderate' ? 2 : 3,
      diet: data.diet === 'poor' ? 0 : data.diet === 'average' ? 1 : data.diet === 'good' ? 2 : 3,
      stress: data.stress >= 8 ? 0 : data.stress >= 5 ? 1 : data.stress >= 3 ? 2 : 3 // High, Moderate, Low, Very Low
    };

    // Smoking adjustments (more granular)
    const smokingAdjustments = {
      never: 0,
      light: -3,      // 1-5 cigarettes per day
      moderate: -7,   // 6-10 cigarettes per day
      heavy: -12      // More than 10 cigarettes per day
    };
    factors.smoking = smokingAdjustments[data.smoking] || 0;

    // Drinking adjustments
    const drinkingAdjustments = {
      none: 0,
      light: 1,
      moderate: -1,
      heavy: -6
    };
    factors.drinking = drinkingAdjustments[data.drinking] || 0;

    // Health conditions (personal and family history)
    if (data.heartDisease) factors.heartDisease -= 5;
    if (data.heartDiseaseFamily) factors.heartDisease -= 2;
    if (data.diabetes) factors.diabetes -= 4;
    if (data.diabetesFamily) factors.diabetes -= 1;

    // Diet adjustments
    const dietAdjustments = {
      poor: -3,
      average: 0,
      good: 2,
      excellent: 4
    };
    factors.diet = dietAdjustments[data.diet] || 0;

    // Exercise adjustments
    const exerciseAdjustments = {
      seldom: -2,
      light: 1,
      moderate: 3,
      heavy: 5
    };
    factors.exercise = exerciseAdjustments[data.exercise] || 0;

    // Stress (1-10 scale, 5 is neutral)
    factors.stress = (5 - data.stress) * 0.5;
    
    // Apply all adjustments
    baseYears += Object.values(factors).reduce((sum, val) => sum + val, 0);
    
    // BMI adjustments
    if (data.bmi < 18.5) baseYears -= 2;
    else if (data.bmi > 30) baseYears -= 3;
    else if (data.bmi > 25 && data.bmi <= 30) baseYears -= 1;

    // Remaining years
    const remainingYears = Math.max(0, baseYears - currentAge);
    
    const result = Math.round(remainingYears * 10) / 10;
    console.log('Final calculation result:', result);
    
    setFactorBreakdown({
      baseLifeExpectancy: baseExpectancy,
      factors: factors,
      userSelections: userSelections
    });
    
    return result;
  };

  useEffect(() => {
    console.log('LifeExpectancy useEffect triggered:', { birthDate, data });
    const result = calculateLifeExpectancy();
    console.log('Calculated life expectancy:', result);
    setLifeExpectancy(result);
    
    // Track feature usage when calculation completes
    if (result !== null && !hasTrackedCalculation.current) {
      hasTrackedCalculation.current = true;
      trackFeatureUse('life_expectancy_calculator', {
        action: 'calculate',
        has_result: true,
        step: step
      });
    }
  }, [data, birthDate]);

  if (!isPremium) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border-accent/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-accent" />
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              Premium Feature
            </Badge>
          </div>
          <CardTitle className="text-2xl">Life Expectancy Calculator</CardTitle>
          <CardDescription>
            Get personalized insights into your life expectancy with our advanced calculator
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Health & lifestyle assessment</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Interactive "What-if" scenarios</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" />
              <span>Personalized recommendations</span>
            </div>
          </div>
          <Link to="/upgrade">
            <Button className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const totalSteps = 5;
  const progressValue = (step / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return data.name.trim() !== '' && data.gender !== '';
      case 2:
        return data.smoking !== '' && data.drinking !== '';
      case 3:
        return true; // Health conditions are optional
      case 4:
        return data.diet !== '';
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Life Expectancy Calculator
            </CardTitle>
            <CardDescription>
              Step {step} of {totalSteps} • Answer questions for personalized insights
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
        <Progress value={progressValue} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Name
              </Label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Gender</Label>
              <RadioGroup
                value={data.gender}
                onValueChange={(value) => setData({ ...data, gender: value as 'male' | 'female' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Health Habits</h3>
            
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Smoking Status
              </Label>
              <RadioGroup
                value={data.smoking}
                onValueChange={(value) => setData({ ...data, smoking: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never-smoke" />
                  <Label htmlFor="never-smoke">I do not smoke</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light-smoke" />
                  <Label htmlFor="light-smoke">1–5 cigarettes per day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate-smoke" />
                  <Label htmlFor="moderate-smoke">6–10 cigarettes per day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="heavy" id="heavy-smoke" />
                  <Label htmlFor="heavy-smoke">More than 10 cigarettes per day</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base">
                Alcohol Consumption
                <span className="text-xs text-muted-foreground block">
                  1 drink = 30ml liquor, 150ml wine, or 330ml beer
                </span>
              </Label>
              <RadioGroup
                value={data.drinking}
                onValueChange={(value) => setData({ ...data, drinking: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="no-drink" />
                  <Label htmlFor="no-drink">I do not drink (0 drinks/day)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light-drink" />
                  <Label htmlFor="light-drink">Light drinker (1–2 drinks/day)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate-drink" />
                  <Label htmlFor="moderate-drink">Moderate drinker (3–4 drinks/day)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="heavy" id="heavy-drink" />
                  <Label htmlFor="heavy-drink">Heavy drinker (More than 4 drinks/day)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Health History</h3>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Heart Disease</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Do you have diagnosed heart disease?</Label>
                    <RadioGroup
                      value={data.heartDisease ? "yes" : "no"}
                      onValueChange={(value) => setData({ ...data, heartDisease: value === "yes" })}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="heart-disease-yes" />
                        <Label htmlFor="heart-disease-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="heart-disease-no" />
                        <Label htmlFor="heart-disease-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm">Has anyone in your immediate family had heart disease?</Label>
                    <RadioGroup
                      value={data.heartDiseaseFamily ? "yes" : "no"}
                      onValueChange={(value) => setData({ ...data, heartDiseaseFamily: value === "yes" })}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="heart-disease-family-yes" />
                        <Label htmlFor="heart-disease-family-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="heart-disease-family-no" />
                        <Label htmlFor="heart-disease-family-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Diabetes</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Do you have diagnosed diabetes?</Label>
                    <RadioGroup
                      value={data.diabetes ? "yes" : "no"}
                      onValueChange={(value) => setData({ ...data, diabetes: value === "yes" })}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="diabetes-yes" />
                        <Label htmlFor="diabetes-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="diabetes-no" />
                        <Label htmlFor="diabetes-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm">Has anyone in your immediate family had diabetes?</Label>
                    <RadioGroup
                      value={data.diabetesFamily ? "yes" : "no"}
                      onValueChange={(value) => setData({ ...data, diabetesFamily: value === "yes" })}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="diabetes-family-yes" />
                        <Label htmlFor="diabetes-family-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="diabetes-family-no" />
                        <Label htmlFor="diabetes-family-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Lifestyle Habits</h3>
            
            <div className="space-y-3">
              <Label className="text-base">Diet Quality</Label>
              <RadioGroup
                value={data.diet}
                onValueChange={(value) => setData({ ...data, diet: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor-diet" />
                  <Label htmlFor="poor-diet">Poor (mostly processed foods)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="average" id="average-diet" />
                  <Label htmlFor="average-diet">Average (mixed diet)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good-diet" />
                  <Label htmlFor="good-diet">Good (balanced, some organic)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="excellent-diet" />
                  <Label htmlFor="excellent-diet">Excellent (whole foods, organic)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Interactive Factors</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4" />
                  Stress Level: {data.stress}/10
                </Label>
                <Slider
                  value={[data.stress]}
                  onValueChange={(value) => setData({ ...data, stress: value[0] })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>

              <div>
                <Label className="text-base flex items-center gap-2 mb-3">
                  <Dumbbell className="w-4 h-4" />
                  Exercise Level
                </Label>
                <RadioGroup
                  value={data.exercise}
                  onValueChange={(value) => setData({ ...data, exercise: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seldom" id="seldom-exercise" />
                    <Label htmlFor="seldom-exercise">Seldom (0-1 times/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light-exercise" />
                    <Label htmlFor="light-exercise">Light (1-2 times/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate-exercise" />
                    <Label htmlFor="moderate-exercise">Moderate (3-4 times/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heavy" id="heavy-exercise" />
                    <Label htmlFor="heavy-exercise">Heavy (5+ times/week)</Label>
                  </div>
                </RadioGroup>
              </div>

              <BmiCalculator
                value={data.bmi}
                onChange={(value) => setData({ ...data, bmi: value })}
              />
            </div>

            {!birthDate && (
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="pt-6">
                  <div className="text-center text-sm text-muted-foreground">
                    Please enter your birth date in the Age Calculator above to see your life expectancy results.
                  </div>
                </CardContent>
              </Card>
            )}
            
            {lifeExpectancy && birthDate && factorBreakdown && (
              <EnhancedLifeExpectancyReport
                lifeExpectancy={lifeExpectancy}
                baseLifeExpectancy={factorBreakdown.baseLifeExpectancy}
                factors={factorBreakdown.factors}
                userSelections={factorBreakdown.userSelections}
                name={data.name}
                birthDate={birthDate}
                celebrities={celebrities}
              />
            )}
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={() => {
                console.log('VIEW RESULTS - Results should already be visible above!');
              }}
              disabled={!lifeExpectancy || !birthDate}
            >
              {!birthDate ? 'Enter Birth Date First' : !lifeExpectancy ? 'Complete Form First' : 'Results Above ↑'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};