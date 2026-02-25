import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Heart, 
  Cigarette, 
  Wine, 
  Activity, 
  Apple, 
  Brain, 
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Download,
  FileText,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  lifeExpectancy: number;
  baseLifeExpectancy: number;
  factors: {
    smoking: number;
    drinking: number;
    exercise: number;
    diet: number;
    stress: number;
    heartDisease: number;
    diabetes: number;
  };
  userSelections?: {
    smoking: number;
    drinking: number;
    exercise: number;
    diet: number;
    stress: number;
  };
  name?: string;
  birthDate?: Date | null;
  celebrities?: any[];
  onFactorChange?: (factor: string, value: number) => void;
}

// --- Sub-components ---

const FactorCard = ({ 
  icon: Icon, title, impact, description, detailedInfo, color 
}: { 
  icon: any; title: string; impact: number; description: string; detailedInfo: string; color: string; 
}) => (
  <div className={`glass-card p-5 border-l-4 ${color} space-y-3`}>
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 mt-1 text-muted-foreground" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="flex items-center gap-1">
            {impact > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : impact < 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> : null}
            <span className={`text-sm font-semibold ${impact > 0 ? 'text-green-500' : impact < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {impact > 0 ? '+' : ''}{impact} years
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="pl-8 pr-2">
      <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-md border border-border/50">
        <p className="leading-relaxed">{detailedInfo}</p>
      </div>
    </div>
  </div>
);

const WhatIfSlider = ({ 
  label, icon: Icon, value, onChange, options, currentImpact, userSelection
}: { 
  label: string; icon: any; value: number; onChange: (value: number) => void; options: string[]; currentImpact: number; userSelection?: number;
}) => {
  const isUserCurrent = userSelection !== undefined && value === userSelection;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          {isUserCurrent && <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">Current</Badge>}
        </div>
        <Badge variant={currentImpact >= 0 ? "default" : "destructive"} className="text-xs">
          {currentImpact >= 0 ? '+' : ''}{currentImpact} yrs
        </Badge>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} max={options.length - 1} step={1} className="w-full" />
      <div className="flex justify-between px-1">
        {options.map((l, i) => (
          <div key={i} className={`text-[10px] text-center transition-colors ${value === i ? 'text-primary font-semibold' : 'text-muted-foreground'}`} style={{ width: `${100 / options.length}%` }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Circular Gauge SVG ---
const CircularGauge = ({ projectedAge, baseline, isAbove }: { projectedAge: number; baseline: number; isAbove: boolean }) => {
  const maxAge = 100;
  const percentage = Math.min((projectedAge / maxAge) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const colorClass = isAbove ? 'stroke-emerald-500' : 'stroke-amber-500';

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" opacity="0.3" />
        <circle cx="60" cy="60" r="54" fill="none" className={colorClass} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${isAbove ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {projectedAge.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground font-medium">years</span>
      </div>
    </div>
  );
};

// --- Timeline Bar ---
const LifeTimeline = ({ currentAge, projectedAge, baseline }: { currentAge: number; projectedAge: number; baseline: number }) => {
  const maxDisplay = Math.max(baseline, projectedAge) + 5;
  const nowPct = (currentAge / maxDisplay) * 100;
  const projPct = (projectedAge / maxDisplay) * 100;
  const basePct = (baseline / maxDisplay) * 100;
  const isBelow = projectedAge < baseline;
  const gap = Math.abs(projectedAge - baseline).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="relative h-10 rounded-full bg-muted/50 overflow-hidden">
        {/* Lived portion */}
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-primary/30" style={{ width: `${nowPct}%` }} />
        {/* Projected portion */}
        {isBelow ? (
          <>
            <div className="absolute inset-y-0 bg-amber-400/40" style={{ left: `${nowPct}%`, width: `${projPct - nowPct}%` }} />
            <div className="absolute inset-y-0 bg-red-400/30 border-l-2 border-dashed border-red-400" style={{ left: `${projPct}%`, width: `${basePct - projPct}%` }} />
          </>
        ) : (
          <>
            <div className="absolute inset-y-0 bg-emerald-400/40" style={{ left: `${nowPct}%`, width: `${basePct - nowPct}%` }} />
            <div className="absolute inset-y-0 bg-emerald-500/30 border-l-2 border-dashed border-emerald-500" style={{ left: `${basePct}%`, width: `${projPct - basePct}%` }} />
          </>
        )}
      </div>
      <div className="relative h-6">
        <div className="absolute text-xs font-medium text-primary" style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}>
          Now: {currentAge}
        </div>
        <div className={`absolute text-xs font-bold ${isBelow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} style={{ left: `${projPct}%`, transform: 'translateX(-50%)' }}>
          You: {projectedAge.toFixed(1)}
        </div>
        <div className="absolute text-xs text-muted-foreground" style={{ left: `${basePct}%`, transform: 'translateX(-50%)' }}>
          Avg: {baseline}
        </div>
      </div>
      <p className={`text-center text-sm font-medium ${isBelow ? 'text-red-500' : 'text-emerald-500'}`}>
        {isBelow ? `⚠️ You're potentially losing ${gap} years compared to average` : `🎉 You're gaining ${gap} years above average!`}
      </p>
    </div>
  );
};

// --- Main Component ---
export const EnhancedLifeExpectancyReport = ({ 
  lifeExpectancy, baseLifeExpectancy, factors, userSelections, name = '', birthDate, celebrities = [], onFactorChange 
}: Props) => {
  const getInitialWhatIfFactors = () => userSelections || { smoking: 0, drinking: 0, exercise: 0, diet: 1, stress: 1 };
  const [whatIfFactors, setWhatIfFactors] = useState(getInitialWhatIfFactors);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { if (userSelections) setWhatIfFactors(userSelections); }, [userSelections]);

  const age = birthDate ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  const projectedAge = age + lifeExpectancy;
  const isAboveBaseline = projectedAge >= baseLifeExpectancy;
  const gapFromBaseline = Math.abs(projectedAge - baseLifeExpectancy).toFixed(1);

  const factorConfigs = {
    smoking: { icon: Cigarette, title: "Smoking", options: ["Non-smoker", "1-5/day", "6-10/day", "10+/day"], impacts: [0, -3, -7, -12] },
    drinking: { icon: Wine, title: "Alcohol", options: ["None", "Light", "Moderate", "Heavy"], impacts: [0, 1, -1, -6] },
    exercise: { icon: Activity, title: "Exercise", options: ["Rarely", "1-2/wk", "3-4/wk", "5+/wk"], impacts: [-2, 1, 3, 5] },
    diet: { icon: Apple, title: "Diet", options: ["Poor", "Average", "Good", "Excellent"], impacts: [-3, 0, 2, 4] },
    stress: { icon: Brain, title: "Stress", options: ["High", "Moderate", "Low", "Very Low"], impacts: [-2.5, -0.5, 1, 1.5] }
  };

  const whatIfProjectedAge = useMemo(() => {
    const total = baseLifeExpectancy + Object.entries(whatIfFactors).reduce((sum, [key, value]) => {
      if (key === 'heartDisease' || key === 'diabetes') return sum + (value as number);
      const config = factorConfigs[key as keyof typeof factorConfigs];
      return sum + (config ? config.impacts[value as number] : 0);
    }, 0);
    return Math.max(50, Math.min(120, total));
  }, [whatIfFactors, baseLifeExpectancy]);

  const whatIfImprovement = whatIfProjectedAge - projectedAge + age;
  const hasWhatIfChanges = JSON.stringify(whatIfFactors) !== JSON.stringify(userSelections || getInitialWhatIfFactors());

  // Find biggest single improvement
  const biggestImprovement = useMemo(() => {
    if (!userSelections) return null;
    let best = { factor: '', gain: 0 };
    Object.entries(factorConfigs).forEach(([key, config]) => {
      const currentIdx = userSelections[key as keyof typeof userSelections] as number;
      const bestIdx = config.impacts.indexOf(Math.max(...config.impacts));
      const gain = config.impacts[bestIdx] - config.impacts[currentIdx];
      if (gain > best.gain) best = { factor: config.title, gain };
    });
    return best.gain > 0 ? best : null;
  }, [userSelections]);

  // Chart data
  const factorData = [
    { name: 'Smoking', value: factors.smoking, color: factors.smoking < 0 ? '#ef4444' : '#10b981' },
    { name: 'Drinking', value: factors.drinking, color: factors.drinking < 0 ? '#ef4444' : factors.drinking > 0 ? '#10b981' : '#6b7280' },
    { name: 'Exercise', value: factors.exercise, color: factors.exercise > 0 ? '#10b981' : '#ef4444' },
    { name: 'Diet', value: factors.diet, color: factors.diet > 0 ? '#10b981' : factors.diet < 0 ? '#ef4444' : '#6b7280' },
    { name: 'Stress', value: factors.stress, color: factors.stress >= 0 ? '#10b981' : '#ef4444' },
  ].filter(item => item.value !== 0);

  const healthRiskData = [
    { name: 'Heart Disease', value: Math.abs(factors.heartDisease), fill: '#ef4444' },
    { name: 'Diabetes', value: Math.abs(factors.diabetes), fill: '#f59e0b' },
  ].filter(item => item.value > 0);

  // Personalized recommendations - only relevant ones, max 8
  const recommendations = useMemo(() => {
    const recs: { icon: string; title: string; text: string; years: string; priority: number }[] = [];
    
    if (factors.smoking < 0) recs.push({ icon: '🚭', title: 'Quit Smoking', text: `Quitting could add up to ${Math.abs(factors.smoking)} years. Within 1 year, your heart disease risk drops 50%.`, years: `+${Math.abs(factors.smoking)}`, priority: Math.abs(factors.smoking) });
    if (factors.drinking < 0) recs.push({ icon: '🍷', title: 'Reduce Alcohol', text: `Limiting intake could add ${Math.abs(factors.drinking)} years and improve liver and heart health.`, years: `+${Math.abs(factors.drinking)}`, priority: Math.abs(factors.drinking) });
    if (factors.exercise <= 0) recs.push({ icon: '🏃', title: 'Exercise More', text: 'Regular exercise (150 min/week) could add 3-7 years. Start with walking or swimming.', years: '+3-7', priority: 5 });
    if (factors.diet <= 0) recs.push({ icon: '🥗', title: 'Improve Diet', text: 'A Mediterranean diet rich in vegetables, fruits, and healthy fats could add 2-4 years.', years: '+2-4', priority: 4 });
    if (factors.stress < 0) recs.push({ icon: '🧘', title: 'Manage Stress', text: `Mindfulness and meditation could add ${Math.abs(factors.stress).toFixed(1)} years. Just 10 min daily helps.`, years: `+${Math.abs(factors.stress).toFixed(1)}`, priority: Math.abs(factors.stress) });
    
    // General tips (lower priority)
    recs.push({ icon: '💤', title: 'Quality Sleep', text: '7-9 hours nightly improves cognitive function and immune health.', years: '+2-3', priority: 2 });
    recs.push({ icon: '🤝', title: 'Social Connections', text: 'Strong relationships boost mental health and can add years.', years: '+3-5', priority: 2 });
    recs.push({ icon: '🩺', title: 'Regular Checkups', text: 'Annual exams catch issues early for better outcomes.', years: '+3-5', priority: 2 });
    
    return recs.sort((a, b) => b.priority - a.priority).slice(0, 8);
  }, [factors]);

  const top3 = recommendations.slice(0, 3);
  const otherRecs = recommendations.slice(3);

  const resetWhatIf = () => setWhatIfFactors(userSelections || getInitialWhatIfFactors());

  // PDF export
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`${name ? name.replace(/\s+/g, '-') : 'Life'}-Report-${date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div ref={reportRef} className="space-y-8">
        
        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 1: HERO RESULT                     */}
        {/* ═══════════════════════════════════════════ */}
        <div className={`rounded-2xl p-8 md:p-12 text-center space-y-6 animate-fade-in-up ${
          isAboveBaseline 
            ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800' 
            : 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-red-950/20 border-2 border-amber-200 dark:border-amber-800'
        }`}>
          {name && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {name}'s Life Expectancy Report
            </p>
          )}
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            You're projected to live to age
          </h2>
          
          <CircularGauge projectedAge={projectedAge} baseline={baseLifeExpectancy} isAbove={isAboveBaseline} />
          
          <div className="space-y-2">
            <p className={`text-lg font-semibold ${isAboveBaseline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isAboveBaseline 
                ? `🎉 That's ${gapFromBaseline} years above average!` 
                : `That's ${gapFromBaseline} years below average`}
            </p>
            <p className="text-sm text-muted-foreground">
              Average life expectancy: {baseLifeExpectancy} years • Your current age: {age}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 2: VISUAL TIMELINE                 */}
        {/* ═══════════════════════════════════════════ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              Your Life Timeline
            </CardTitle>
            <CardDescription>See where you stand compared to the average</CardDescription>
          </CardHeader>
          <CardContent>
            <LifeTimeline currentAge={age} projectedAge={projectedAge} baseline={baseLifeExpectancy} />
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 3: WHAT-IF SCENARIOS (moved UP!)   */}
        {/* ═══════════════════════════════════════════ */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 via-background to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-300">
                The Good News: You Can Change This
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Adjust the sliders below and watch your projected age update in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live comparison banner */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-xl bg-background/80 border border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="text-3xl font-bold text-foreground">{projectedAge.toFixed(1)}</div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground hidden sm:block" />
              <div className="text-center">
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">If you change</div>
                <div className={`text-3xl font-bold transition-all duration-300 ${
                  whatIfImprovement > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                }`}>
                  {whatIfProjectedAge.toFixed(1)}
                </div>
              </div>
              {whatIfImprovement > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-base px-3 py-1">
                  +{whatIfImprovement.toFixed(1)} years
                </Badge>
              )}
            </div>

            {biggestImprovement && !hasWhatIfChanges && (
              <p className="text-center text-sm text-muted-foreground italic">
                💡 Tip: Improving your <strong>{biggestImprovement.factor.toLowerCase()}</strong> alone could add <strong>+{biggestImprovement.gain} years</strong>
              </p>
            )}

            {/* Sliders */}
            <div className="space-y-6 max-w-xl mx-auto">
              {Object.entries(factorConfigs).map(([key, config]) => {
                const currentValue = whatIfFactors[key as keyof typeof whatIfFactors] as number;
                const currentImpact = config.impacts[currentValue];
                const userSel = userSelections ? userSelections[key as keyof typeof userSelections] : undefined;
                return (
                  <WhatIfSlider key={key} label={config.title} icon={config.icon} value={currentValue}
                    onChange={(v) => setWhatIfFactors(prev => ({ ...prev, [key]: v }))}
                    options={config.options} currentImpact={currentImpact} userSelection={userSel} />
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={resetWhatIf} size="sm">
                <RotateCcw className="w-4 h-4 mr-2" /> Reset to Current
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              ✨ Every small change counts. You have the power to add years to your life.
            </p>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 4: HEALTH IMPACT CHARTS            */}
        {/* ═══════════════════════════════════════════ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Understanding Your Health Profile</CardTitle>
            <CardDescription>How each factor contributes to your projected lifespan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {factorData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Lifestyle Impact (Years)
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={factorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip formatter={(value) => [`${value} years`, 'Impact']}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {factorData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {healthRiskData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive" /> Health Risk Factors
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={healthRiskData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                          {healthRiskData.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} years impact`, 'Risk']}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 5: DETAILED FACTOR ANALYSIS        */}
        {/* ═══════════════════════════════════════════ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Detailed Factor Analysis</CardTitle>
            <CardDescription>Based on research from WHO, CDC, and peer-reviewed studies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <FactorCard icon={Cigarette} title="Smoking Impact" impact={factors.smoking}
                description={factors.smoking < 0 ? "Reducing lifespan significantly" : "No negative impact from smoking"}
                detailedInfo={factors.smoking < 0 
                  ? "According to WHO data, smoking reduces life expectancy by an average of 10 years for heavy smokers. Each cigarette can reduce your life by approximately 11 minutes. Tobacco use is the leading preventable cause of death globally."
                  : "Not smoking is one of the most impactful decisions for longevity. Non-smokers live an average of 10 years longer than smokers."}
                color={factors.smoking < 0 ? "border-l-red-500" : "border-l-green-500"} />
              <FactorCard icon={Wine} title="Alcohol Impact" impact={factors.drinking}
                description={factors.drinking < 0 ? "Heavy drinking reduces lifespan" : factors.drinking > 0 ? "Light drinking may have benefits" : "No alcohol consumption"}
                detailedInfo={factors.drinking < -3
                  ? "Heavy drinking (4+ drinks/day) can reduce life expectancy by 6+ years. Excessive alcohol increases risks of liver disease and various cancers."
                  : factors.drinking > 0 ? "Light drinking has been associated with slight longevity benefits, possibly from cardiovascular effects. However, WHO emphasizes no amount is completely safe."
                  : "No alcohol consumption eliminates alcohol-related health risks entirely."}
                color={factors.drinking < 0 ? "border-l-red-500" : factors.drinking > 0 ? "border-l-green-500" : "border-l-gray-500"} />
              <FactorCard icon={Activity} title="Exercise Impact" impact={factors.exercise}
                description={factors.exercise > 0 ? "Regular exercise adds years" : "Sedentary lifestyle impact"}
                detailedInfo={factors.exercise >= 5
                  ? "Exercising 5+ times/week can add up to 5 years. WHO recommends 150-300 minutes of moderate activity weekly."
                  : factors.exercise >= 1 ? "Some exercise is better than none. Increasing to 150+ minutes weekly would provide optimal benefits."
                  : "Sedentary lifestyle can reduce life expectancy by ~2 years. Physical inactivity is the 4th leading risk factor for mortality."}
                color={factors.exercise > 0 ? "border-l-green-500" : "border-l-red-500"} />
              <FactorCard icon={Apple} title="Diet Impact" impact={factors.diet}
                description={factors.diet > 0 ? "Healthy diet promotes longevity" : "Diet needs improvement"}
                detailedInfo={factors.diet >= 4
                  ? "An excellent diet can add ~4 years. Mediterranean and plant-based diets are associated with 20-25% lower risk of early death."
                  : factors.diet < 0 ? "Poor diet (mostly processed) can reduce life expectancy by ~3 years. Ultra-processed foods increase mortality risk by 62%."
                  : "An average diet provides basic nutrition but may not optimize longevity. Consider increasing whole foods."}
                color={factors.diet > 0 ? "border-l-green-500" : factors.diet < 0 ? "border-l-red-500" : "border-l-gray-500"} />
              <FactorCard icon={Brain} title="Stress Impact" impact={factors.stress}
                description={factors.stress < 0 ? "High stress reduces lifespan" : "Good stress management"}
                detailedInfo={factors.stress >= 1
                  ? "Excellent stress management can add 1-2 years. Good coping through meditation, exercise, or social support improves heart health."
                  : "High chronic stress can reduce life expectancy by 2-3 years. Prolonged stress increases inflammation and weakens immune response."}
                color={factors.stress >= 0 ? "border-l-green-500" : "border-l-red-500"} />
              {factors.heartDisease < 0 && (
                <FactorCard icon={Heart} title="Heart Disease Risk" impact={factors.heartDisease}
                  description="Family history or personal diagnosis impact"
                  detailedInfo="Heart disease can reduce life expectancy, but proper management, medication, and lifestyle changes significantly improve outcomes. Regular monitoring is key."
                  color="border-l-red-500" />
              )}
              {factors.diabetes < 0 && (
                <FactorCard icon={Heart} title="Diabetes Risk" impact={factors.diabetes}
                  description="Family history or personal diagnosis impact"
                  detailedInfo="Diabetes can reduce life expectancy if poorly managed. Good management through medication, diet, and exercise can minimize complications significantly."
                  color="border-l-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 6: PERSONALIZED RECOMMENDATIONS    */}
        {/* ═══════════════════════════════════════════ */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Heart className="w-6 h-6" />
              Your Personalized Action Plan
            </CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-400">
              Top changes ranked by their impact on <strong>your</strong> life expectancy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top 3 - larger cards */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                🏆 Top 3 Changes For You
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {top3.map((rec, i) => (
                  <div key={i} className="p-5 rounded-xl bg-background/80 border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-shadow space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{rec.icon}</span>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{rec.years} yrs</Badge>
                    </div>
                    <h5 className="font-semibold text-foreground">{rec.title}</h5>
                    <p className="text-sm text-muted-foreground">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Other recs - compact */}
            {otherRecs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Also Recommended
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {otherRecs.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background/60 border border-border flex items-start gap-3">
                      <span className="text-lg">{rec.icon}</span>
                      <div>
                        <h5 className="font-medium text-sm text-foreground">{rec.title}</h5>
                        <p className="text-xs text-muted-foreground">{rec.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 7: DISCLAIMER                      */}
        {/* ═══════════════════════════════════════════ */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Important Disclaimer</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This estimate is based on statistical data and lifestyle factors. Individual results may vary significantly. 
                  This tool is for informational purposes only and does not constitute medical advice. Please consult with 
                  healthcare professionals for personalized medical guidance. Data sources include WHO, CDC, NIH, and 
                  peer-reviewed epidemiological studies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export button */}
      <div className="flex justify-center">
        <Button onClick={exportToPDF} disabled={isExporting} className="gap-2">
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating PDF...' : 'Download Report as PDF'}
        </Button>
      </div>
    </div>
  );
};
