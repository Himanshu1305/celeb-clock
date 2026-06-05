import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Star, Sparkles, TrendingUp, Info } from 'lucide-react';

interface ReportProps {
  lifeExpectancy: number;
  baseLifeExpectancy: number;
  factors: any;
  userSelections: {
    smoking: 'never' | 'light' | 'moderate' | 'heavy' | '';
    drinking: 'none' | 'light' | 'moderate' | 'heavy' | '';
    exercise: 'seldom' | 'light' | 'moderate' | 'heavy' | '';
    diet: 'poor' | 'average' | 'good' | 'excellent' | '';
    stress: number; // 1–10 scale
  };
  name: string;
  birthDate: Date | null | undefined;
  celebrities?: any[];
}

// Convert string categoricals from LifeExpectancyCalculator to 0-3 slider indices
const smokingToIndex = (v: string): number =>
  ({ '': 0, never: 0, light: 1, moderate: 2, heavy: 3 }[v] ?? 0);
const drinkingToIndex = (v: string): number =>
  ({ '': 0, none: 0, light: 1, moderate: 2, heavy: 3 }[v] ?? 0);
const exerciseToIndex = (v: string): number =>
  ({ '': 0, seldom: 0, light: 1, moderate: 2, heavy: 3 }[v] ?? 0);
const dietToIndex = (v: string): number =>
  ({ '': 0, poor: 0, average: 1, good: 2, excellent: 3 }[v] ?? 0);
const stressToIndex = (v: number): number =>
  v >= 8 ? 0 : v >= 5 ? 1 : v >= 3 ? 2 : 3;

export const EnhancedLifeExpectancyReport = ({
  lifeExpectancy: initialExpectancy,
  baseLifeExpectancy = 76.1,
  factors,
  userSelections,
  name,
  birthDate,
  celebrities = []
}: ReportProps) => {

  const [sliderSmoking, setSliderSmoking] = useState(() => smokingToIndex(userSelections?.smoking ?? ''));
  const [sliderDrinking, setSliderDrinking] = useState(() => drinkingToIndex(userSelections?.drinking ?? ''));
  const [sliderExercise, setSliderExercise] = useState(() => exerciseToIndex(userSelections?.exercise ?? ''));
  const [sliderDiet, setSliderDiet] = useState(() => dietToIndex(userSelections?.diet ?? ''));
  const [sliderStress, setSliderStress] = useState(() => stressToIndex(userSelections?.stress ?? 5));

  // Sync slider positions if the parent re-submits new selections
  useEffect(() => {
    if (userSelections) {
      setSliderSmoking(smokingToIndex(userSelections.smoking ?? ''));
      setSliderDrinking(drinkingToIndex(userSelections.drinking ?? ''));
      setSliderExercise(exerciseToIndex(userSelections.exercise ?? ''));
      setSliderDiet(dietToIndex(userSelections.diet ?? ''));
      setSliderStress(stressToIndex(userSelections.stress ?? 5));
    }
  }, [userSelections]);

  // Heritage Tree interactive form states
  const [ancestors, setAncestors] = useState([
    { relation: 'Paternal Grandfather', age: 76, active: true },
    { relation: 'Paternal Grandmother', age: 82, active: true },
    { relation: 'Maternal Grandfather', age: 72, active: true },
    { relation: 'Maternal Grandmother', age: 88, active: true },
  ]);

  // Local Longevity Multi-Select states (start empty so habits are clearly additive)
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  const toggleHabit = (id: string) => {
    if (selectedHabits.includes(id)) {
      setSelectedHabits(selectedHabits.filter(h => h !== id));
    } else {
      setSelectedHabits([...selectedHabits, id]);
    }
  };

  const defaultCelebrities = [
    { name: "Amitabh Bachchan", role: "Bollywood Legend", age: "83 yrs", status: "Living", desc: "Maintains intense work ethic, zero smoking or drinking, strict daily routine deep into his 80s." },
    { name: "Lata Mangeshkar", role: "Legendary Vocalist", age: "92 yrs", status: "Deceased", desc: "Maintains deep lifelong mental focus, active singing discipline, and structured daily vocal engagement." },
    { name: "Milind Soman", role: "Fitness Icon", age: "60 yrs", status: "Living", desc: "Advocate for barefoot running, minimal processed foods, outdoor exercise, and core muscle training." },
    { name: "Ratan Tata", role: "Industrialist & Philanthropist", age: "86 yrs", status: "Deceased", desc: "Demonstrated how strong human purpose, regular philanthropy, and community action keep minds active." }
  ];

  const targetCelebrities = celebrities && celebrities.length > 0 ? celebrities : defaultCelebrities;

  // SAFE DATE GUARD: Prevent calling .getFullYear() on a null/undefined date object
  const safeBirthYear = birthDate instanceof Date ? birthDate.getFullYear() : 2000;
  const currentAge = new Date().getFullYear() - safeBirthYear;
  
  const smokeImpacts = [0, -3, -7, -12];
  const drinkImpacts = [0, 1, -1, -6];
  const exerciseImpacts = [-2, 1, 3, 5];
  const dietImpacts = [-3, 0, 2, 4];
  const stressImpacts = [-2.5, -0.5, 1, 1.5];
  const HABIT_IMPACTS: Record<string, number> = { diet: 0.8, exercise: 1.2, sleep: 0.5, mind: 0.3 };

  // Safeguard slider values to [0, 3]
  const sSmoke = Math.min(Math.max(sliderSmoking, 0), 3);
  const sDrink = Math.min(Math.max(sliderDrinking, 0), 3);
  const sExercise = Math.min(Math.max(sliderExercise, 0), 3);
  const sDiet = Math.min(Math.max(sliderDiet, 0), 3);
  const sStress = Math.min(Math.max(sliderStress, 0), 3);

  // User's actual calculator selections (starting point for delta calculation)
  const iSmoke = Math.min(Math.max(smokingToIndex(userSelections?.smoking ?? ''), 0), 3);
  const iDrink = Math.min(Math.max(drinkingToIndex(userSelections?.drinking ?? ''), 0), 3);
  const iExercise = Math.min(Math.max(exerciseToIndex(userSelections?.exercise ?? ''), 0), 3);
  const iDiet = Math.min(Math.max(dietToIndex(userSelections?.diet ?? ''), 0), 3);
  const iStress = Math.min(Math.max(stressToIndex(userSelections?.stress ?? 5), 0), 3);

  const initialImpactSum =
    smokeImpacts[iSmoke] + drinkImpacts[iDrink] + exerciseImpacts[iExercise] +
    dietImpacts[iDiet] + stressImpacts[iStress];

  const currentImpactSum =
    smokeImpacts[sSmoke] + drinkImpacts[sDrink] + exerciseImpacts[sExercise] +
    dietImpacts[sDiet] + stressImpacts[sStress];

  const sliderDelta = currentImpactSum - initialImpactSum;
  const currentHabitBonus = selectedHabits.reduce((s, id) => s + (HABIT_IMPACTS[id] ?? 0), 0);

  const averageAncestorAge = ancestors.filter(a => a.active).reduce((sum, a) => sum + a.age, 0) / ancestors.filter(a => a.active).length || 75;
  const lineageBonus = (averageAncestorAge - 75) * 0.15;

  // Start from the actual calculated result, apply what-if deltas
  const dynamicProjectedAge = Math.round((initialExpectancy + sliderDelta + currentHabitBonus + lineageBonus) * 10) / 10;
  const varianceGained = Math.round((dynamicProjectedAge - initialExpectancy) * 10) / 10;

  // Maximum potential: all 5 slider factors optimal + all habits
  const optimalImpactSum = smokeImpacts[0] + drinkImpacts[0] + exerciseImpacts[3] + dietImpacts[3] + stressImpacts[3];
  const maxHabitBonus = Object.values(HABIT_IMPACTS).reduce((s, v) => s + v, 0);
  const maximumPotential = Math.round((initialExpectancy + (optimalImpactSum - initialImpactSum) + maxHabitBonus + lineageBonus) * 10) / 10;
  const gapToMaximum = Math.max(0, Math.round((maximumPotential - dynamicProjectedAge) * 10) / 10);

  // Itemized factor breakdown sorted by impact (highest first)
  const f = factors as any;
  const factorBreakdown: { label: string; years: number; icon: string }[] = [];
  const addFactor = (label: string, years: number, icon: string) => {
    if (years !== 0) factorBreakdown.push({ label, years, icon });
  };
  addFactor('Tobacco Smoking', smokeImpacts[iSmoke], '🚬');
  addFactor('Alcohol Consumption', drinkImpacts[iDrink], '🍷');
  addFactor('Physical Exercise', exerciseImpacts[iExercise], '🏋️');
  addFactor('Diet Quality', dietImpacts[iDiet], '🥗');
  addFactor('Stress Level', stressImpacts[iStress], '🧠');
  if (f) {
    const bmi = f.bmi ?? 24.5;
    addFactor('BMI / Body Weight', bmi < 18.5 ? -2 : bmi > 30 ? -3 : bmi > 25 ? -1 : 0, '⚖️');
    const bpMap: Record<string, number> = { optimal: 1.5, normal: 0, elevated: -1, high1: -2.5, high2: -5 };
    addFactor('Blood Pressure', bpMap[f.bloodPressure ?? ''] ?? 0, '❤️');
    const sleepMap: Record<string, number> = { under6: -2, '6to7': -0.5, '7to9': 0, over9: -1 };
    addFactor('Sleep Duration', sleepMap[f.sleepDuration ?? ''] ?? 0, '😴');
    const socialMap: Record<string, number> = { strong: 2, moderate: 0, limited: -1.5, isolated: -3 };
    addFactor('Social Connections', socialMap[f.socialConnections ?? ''] ?? 0, '👥');
    if (f.heartDisease) addFactor('Heart Disease', Math.round((-5 + (f.heartDiseaseControlled ? 1.25 : 0)) * 10) / 10, '🫀');
    if (f.heartDiseaseFamily) addFactor('Family Heart Disease', -2, '🧬');
    if (f.diabetes) addFactor('Diabetes', Math.round((-4 + (f.diabetesControlled ? 1.6 : 0)) * 10) / 10, '💉');
    if (f.diabetesFamily) addFactor('Family Diabetes History', -1, '🧬');
    if (f.hypertension) addFactor('Hypertension', Math.round((-3 + (f.hypertensionControlled ? 1.05 : 0)) * 10) / 10, '🩺');
  }
  factorBreakdown.sort((a, b) => b.years - a.years);

  return (
    <div className="space-y-6 mt-4 text-left">
      {/* Header: actual result vs current simulation */}
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Longevity Projection</span>
          <div className="text-xl font-bold flex items-center gap-2 mt-0.5">
            <span>Your Result: <strong className="text-primary">{initialExpectancy} Yrs</strong></span>
            <span className="text-muted-foreground text-sm">→</span>
            <span>Simulated: <strong className="text-success">{dynamicProjectedAge} Yrs</strong></span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Age now: {currentAge} yrs · Max potential: {maximumPotential} yrs</p>
        </div>
        <Badge variant={varianceGained >= 0 ? "success" : "destructive"} className="text-sm px-3 py-1 font-bold">
          {varianceGained >= 0 ? `🎉 +${varianceGained} Yrs Simulation Gain` : `⚠️ ${varianceGained} Yrs vs Your Result`}
        </Badge>
      </div>

      {/* Factor Breakdown */}
      {factorBreakdown.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> What's Impacting Your Lifespan
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {factorBreakdown.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                  item.years > 0
                    ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold tabular-nums ${
                    item.years > 0 ? 'text-green-600 border-green-400' : 'text-red-500 border-red-400'
                  }`}
                >
                  {item.years > 0 ? '+' : ''}{item.years}yr
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> The Three Pillars of Your Longevity Blueprint
        </h2>
        <p className="text-xs text-muted-foreground">Explore how genetics, localized environmental habits, and real-world lifestyle adjustments directly combine to determine your total active years.</p>
      </div>

      <Tabs defaultValue="heritage" className="w-full">
        <TabsList className="grid grid-cols-3 w-full border-b rounded-none bg-transparent h-auto p-0">
          <TabsTrigger value="heritage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">1. Family Lineage</TabsTrigger>
          <TabsTrigger value="anchor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">2. Local Habits</TabsTrigger>
          <TabsTrigger value="celebrity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">3. Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="heritage" className="pt-4 space-y-4">
          <div className="bg-muted/40 p-4 rounded-xl border">
            <h4 className="font-bold text-sm text-foreground mb-1">🧬 Lineage Calculation Form</h4>
            <p className="text-xs text-muted-foreground mb-3">If an ancestor has passed away, input their exact <strong>age at death</strong>. If they are living, provide their current age. This establishes your genetic baseline calculation.</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {ancestors.map((ancestor, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-foreground">{ancestor.relation}</Label>
                    <p className="text-[10px] text-muted-foreground">Adjust age to shift curves</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={ancestor.age} 
                      onChange={(e) => {
                        const newAns = [...ancestors];
                        newAns[i].age = Number(e.target.value);
                        setAncestors(newAns);
                      }}
                      className="w-16 h-8 text-xs text-center font-bold" 
                    />
                    <span className="text-xs text-muted-foreground font-medium">yrs</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-primary/80 mt-3 italic bg-primary/5 p-2 rounded border border-primary/10">ℹ️ <strong>Current Dynamic Calculation:</strong> Your family's average ancestral lifespan of <strong>{averageAncestorAge} yrs</strong> contributes a modifier of <strong>{lineageBonus.toFixed(1)} years</strong> to your baseline timeline.</p>
          </div>
        </TabsContent>

        <TabsContent value="anchor" className="pt-4 space-y-4">
          <div className="bg-muted/40 p-4 rounded-xl border space-y-4">
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                🌱 Primary Epigenetic Habits Tracker <Badge className="text-[10px]">Multi-Select Enabled</Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">Select all positive everyday habits you consistently follow. A combination of items multiplies systemic benefits:</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              {[
                { id: "diet", label: "Mediterranean / Clean Diet", desc: "Reduces processing strain on vital organs", gain: "+0.8yr" },
                { id: "exercise", label: "Consistent Cardio/Strength Activity", desc: "Boosts heart efficiency and blood flow", gain: "+1.2yr" },
                { id: "sleep", label: "Regulated Circadian Sleep (7–9 hrs)", desc: "Allows critical cellular restoration", gain: "+0.5yr" },
                { id: "mind", label: "Active Stress Reduction / Meditation", desc: "Decreases chronic inflammatory markers", gain: "+0.3yr" }
              ].map((habit) => (
                <div 
                  key={habit.id} 
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 bg-background hover:border-primary/50 shadow-sm ${selectedHabits.includes(habit.id) ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}`}
                >
                  <Checkbox checked={selectedHabits.includes(habit.id)} onCheckedChange={() => {}} className="mt-0.5" />
                  <div className="space-y-0.5 pointer-events-none flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs font-bold text-foreground cursor-pointer">{habit.label}</Label>
                      <Badge variant="outline" className="text-[9px] font-bold text-green-600 border-green-400 flex-shrink-0">{habit.gain}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{habit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-background p-3 rounded-lg border border-primary/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Info className="w-3.5 h-3.5" /> 
                <span>Medical Definition: What is an Epigenetic Habit?</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                According to the <strong>World Health Organization (WHO)</strong> and the <strong>Centers for Disease Control and Prevention (CDC)</strong>, <strong>Epigenetics</strong> is the scientific study of how your daily behaviors and environmental surroundings (like nutrition, exercise patterns, and sleep metrics) cause changes that affect the way your genes work. Unlike basic genetic mutations, epigenetic changes are completely <strong>reversible</strong>. They do not alter your fundamental DNA structure sequence, but instead act like an biological "on/off switch" to improve how your body handles disease risks.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="celebrity" className="pt-4">
          <div className="bg-muted/40 p-4 rounded-xl border space-y-3">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5"><Star className="w-4 h-4" /> Purpose of Benchmark Profiles</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                <strong>Why am I looking at this?</strong> These real-world longevity examples serve as concrete biological evidence. They demonstrate that individuals carrying standard genetic profiles can routinely push past national average lifespans (76-81 years) by combining structured daily routines, consistent discipline, and purposeful living.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              {targetCelebrities.map((item, index) => (
                <Card key={index} className="bg-background shadow-sm border border-muted">
                  <CardHeader className="p-3 pb-1 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{item.name}</CardTitle>
                      <CardDescription className="text-[11px]">{item.role}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-primary">{item.age}</div>
                      <Badge className={`text-[9px] px-1 py-0 ${item.status === 'Living' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-[11px] text-muted-foreground leading-normal bg-muted/30 p-2 rounded">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-success/30 bg-success/5 shadow-sm mt-6">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xl font-black text-success flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> The Good News: You Control Your Timeline
          </CardTitle>
          <CardDescription className="text-xs text-foreground">
            Genetics provide your starting point, but daily actions shape your final outcome. Adjust the real-time simulation sliders below to observe how small adjustments to your routine instantly expand your projected lifespan.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-5">
          <div className="bg-background p-4 rounded-xl border border-success/20 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-inner">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Your Calculated Result</span>
              <strong className="text-2xl font-black text-muted-foreground">{initialExpectancy} Yrs</strong>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-success block">If You Modify Habits</span>
              <strong className="text-4xl font-black text-success">{dynamicProjectedAge} Yrs</strong>
            </div>
            <div className={`font-black px-3 py-1.5 rounded-lg text-sm border ${varianceGained >= 0 ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              {varianceGained >= 0 ? '⚡' : '⚠️'} Net: {varianceGained >= 0 ? '+' : ''}{varianceGained} Yrs
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-foreground">1. Tobacco Smoking Habits</Label>
                <Badge variant="outline" className="text-[10px]">{["Non-smoker", "Light", "Moderate", "Heavy"][sSmoke]}</Badge>
              </div>
              <Slider value={[sSmoke]} onValueChange={(v) => setSliderSmoking(v[0])} max={3} min={0} step={1} />
              <p className="text-[10px] text-muted-foreground">Stopping or avoiding tobacco use eliminates carcinogens, instantly optimizing arterial oxygen transfer and lung capacity.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-foreground">2. Alcohol Consumption Intake</Label>
                <Badge variant="outline" className="text-[10px]">{["None", "Light", "Moderate", "Heavy"][sDrink]}</Badge>
              </div>
              <Slider value={[sDrink]} onValueChange={(v) => setSliderDrinking(v[0])} max={3} min={0} step={1} />
              <p className="text-[10px] text-muted-foreground">Keeping drinks minimal protects liver processing function and avoids high chronic blood pressure stresses.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-foreground">3. Weekly Physical Exercise Workouts</Label>
                <Badge variant="outline" className="text-[10px]">{["Rarely Active", "Light Workouts", "Moderate Exercise", "Highly Active Routine"][sExercise]}</Badge>
              </div>
              <Slider value={[sExercise]} onValueChange={(v) => setSliderExercise(v[0])} max={3} min={0} step={1} />
              <p className="text-[10px] text-muted-foreground">Structured cardiorespiratory and weight workouts keep resting heart rate lower and sustain bone density as you age.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-foreground">4. Daily Nutrition & Diet Quality</Label>
                <Badge variant="outline" className="text-[10px]">{["Poor / Processed", "Average / Mixed", "Good Balanced Foods", "Excellent Whole Foods"][sDiet]}</Badge>
              </div>
              <Slider value={[sDiet]} onValueChange={(v) => setSliderDiet(v[0])} max={3} min={0} step={1} />
              <p className="text-[10px] text-muted-foreground">Prioritizing fiber-rich vegetables and lean nutrients lowers metabolic plaque buildup inside major blood vessels.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-foreground">5. Stress & Tension Management</Label>
                <Badge variant="outline" className="text-[10px]">{["High Daily Stress", "Moderate Tension", "Low Stress Baseline", "Optimal Calm Protocol"][sStress]}</Badge>
              </div>
              <Slider value={[sStress]} onValueChange={(v) => setSliderStress(v[0])} max={3} min={0} step={1} />
              <p className="text-[10px] text-muted-foreground">Managing high daily mental stress lowers prolonged cortisol release, shielding your immune system from early wear-and-tear.</p>
            </div>
          </div>

          {/* Maximum Potential */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Your Maximum Potential Lifespan
              </h4>
              <strong className="text-xl font-black text-primary">{maximumPotential} Yrs</strong>
            </div>
            <p className="text-[11px] text-muted-foreground">
              If you optimized all 5 lifestyle sliders (no smoking, no drinking, heavy exercise, excellent diet, lowest stress) plus all 4 epigenetic habits.
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Current simulation</span>
                <span className="font-bold">{dynamicProjectedAge} yrs · {gapToMaximum > 0 ? `${gapToMaximum} yrs still available` : 'At maximum'}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((dynamicProjectedAge / maximumPotential) * 100))}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">
                {Math.min(100, Math.round((dynamicProjectedAge / maximumPotential) * 100))}% of maximum potential
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};