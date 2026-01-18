import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
  BarChart3
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
  RadialBarChart,
  RadialBar,
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

const FactorCard = ({ 
  icon: Icon, 
  title, 
  impact, 
  description,
  detailedInfo,
  color 
}: { 
  icon: any; 
  title: string; 
  impact: number; 
  description: string;
  detailedInfo: string;
  color: string; 
}) => (
  <div className={`glass-card p-5 border-l-4 ${color} space-y-3`}>
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 mt-1 text-muted-foreground" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="flex items-center gap-1">
            {impact > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : impact < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
            <span className={`text-sm font-semibold ${
              impact > 0 ? 'text-green-500' : impact < 0 ? 'text-red-500' : 'text-muted-foreground'
            }`}>
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
  label, 
  icon: Icon, 
  value, 
  onChange, 
  options,
  currentImpact,
  userSelection
}: { 
  label: string; 
  icon: any; 
  value: number; 
  onChange: (value: number) => void; 
  options: string[];
  currentImpact: number;
  userSelection?: number;
}) => {
  const isUserCurrent = userSelection !== undefined && value === userSelection;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          {isUserCurrent && (
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">Your Current</Badge>
          )}
        </div>
        <Badge variant={currentImpact >= 0 ? "default" : "destructive"} className="text-xs">
          {currentImpact >= 0 ? '+' : ''}{currentImpact} years
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="relative">
          <Slider
            value={[value]}
            onValueChange={([newValue]) => onChange(newValue)}
            max={options.length - 1}
            step={1}
            className="w-full"
          />
          {/* Visual markers on slider */}
          <div className="flex justify-between px-1 mt-1">
            {options.map((label, index) => {
              const isActive = value === index;
              const isPositive = index >= 2; // Assuming higher indices are better
              return (
                <div 
                  key={index} 
                  className={`text-[10px] text-center transition-colors ${
                    isActive 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground'
                  }`}
                  style={{ width: `${100 / options.length}%` }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnhancedLifeExpectancyReport = ({ 
  lifeExpectancy, 
  baseLifeExpectancy, 
  factors,
  userSelections,
  name = '',
  birthDate,
  celebrities = [],
  onFactorChange 
}: Props) => {
  // Initialize what-if with user's actual selections (indices)
  // Use useMemo to ensure userSelections are properly initialized only once
  const initialWhatIfFactors = userSelections || {
    smoking: 0,
    drinking: 0,
    exercise: 0,
    diet: 1,
    stress: 1
  };
  
  const [whatIfFactors, setWhatIfFactors] = useState(initialWhatIfFactors);
  const [showWhatIf, setShowWhatIf] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Calculate zodiac and birthstone
  const getZodiacSign = (month: number, day: number): string => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒';
    return 'Pisces ♓';
  };

  const birthstones: Record<number, string> = {
    1: 'Garnet', 2: 'Amethyst', 3: 'Aquamarine', 4: 'Diamond',
    5: 'Emerald', 6: 'Pearl', 7: 'Ruby', 8: 'Peridot',
    9: 'Sapphire', 10: 'Opal', 11: 'Topaz', 12: 'Turquoise'
  };

  const zodiacSign = birthDate ? getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate()) : '';
  const birthstone = birthDate ? birthstones[birthDate.getMonth() + 1] : '';
  const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : 0;

  const factorConfigs = {
    smoking: {
      icon: Cigarette,
      title: "Smoking Habits",
      options: ["Non-smoker", "1-5/day", "6-10/day", "10+/day"],
      impacts: [0, -3, -7, -12]
    },
    drinking: {
      icon: Wine,
      title: "Alcohol Consumption",
      options: ["None", "Light", "Moderate", "Heavy"],
      impacts: [0, 1, -1, -6]
    },
    exercise: {
      icon: Activity,
      title: "Exercise Frequency",
      options: ["Rarely", "1-2/week", "3-4/week", "5+/week"],
      impacts: [-2, 1, 3, 5]
    },
    diet: {
      icon: Apple,
      title: "Diet Quality",
      options: ["Poor", "Average", "Good", "Excellent"],
      impacts: [-3, 0, 2, 4]
    },
    stress: {
      icon: Brain,
      title: "Stress Levels",
      options: ["High", "Moderate", "Low", "Very Low"],
      impacts: [-2.5, -0.5, 1, 1.5]
    }
  };

  const calculateWhatIfLifeExpectancy = () => {
    const total = baseLifeExpectancy + 
      Object.entries(whatIfFactors).reduce((sum, [key, value]) => {
        if (key === 'heartDisease' || key === 'diabetes') {
          return sum + value; // These are already impact values
        }
        const config = factorConfigs[key as keyof typeof factorConfigs];
        return sum + (config ? config.impacts[value] : 0);
      }, 0);
    return Math.max(50, Math.min(120, total)); // Reasonable bounds
  };

  const whatIfLifeExpectancy = calculateWhatIfLifeExpectancy();
  const difference = whatIfLifeExpectancy - lifeExpectancy;

  const resetWhatIf = () => {
    setWhatIfFactors(initialWhatIfFactors);
  };

  const lifeExpectancyPercentage = Math.min(100, (lifeExpectancy / 100) * 100);

  // Chart data preparation
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

  const lifeExpectancyGaugeData = [
    { name: 'Remaining Years', value: lifeExpectancy, fill: '#8b5cf6' },
    { name: 'Base Expectancy', value: baseLifeExpectancy - lifeExpectancy, fill: '#e5e7eb' }
  ];

  // Enhanced PDF Export function with better design
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Capture with higher quality
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      // Add remaining pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `${name ? name.replace(/\s+/g, '-') : 'Life'}-Report-${date}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div ref={reportRef} className="space-y-6 bg-gradient-to-br from-background via-primary/5 to-accent/5 p-8 rounded-xl shadow-xl border border-primary/20">
        {/* Enhanced Header with Brand and Personal Info */}
        <div className="text-center mb-6 pb-6 border-b-2 border-gradient-to-r from-primary via-accent to-secondary">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-accent">Age & Celeb Life</h2>
          </div>
          <p className="text-sm text-muted-foreground">Your Personalized Life Report</p>
        </div>

        {/* Header with Name and Personal Info */}
        {(name || birthDate) && (
          <Card className="backdrop-blur-sm bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/30 shadow-2xl mb-6">
            <CardHeader className="text-center pb-6">
              {name && birthDate && (
                <>
                  <div className="mb-4">
                    <div className="inline-block px-6 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-4">
                      <span className="text-sm font-medium text-accent">Personal Life Capsule Report</span>
                    </div>
                  </div>
                  <CardTitle className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4 leading-tight">
                    {name}'s Life Journey
                  </CardTitle>
                  <CardDescription className="text-xl mb-2 font-medium text-foreground">
                    Born on {birthDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    Report Generated: {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </>
              )}
              
              {/* Age Breakdown Stats */}
              {birthDate && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{age}</div>
                    <div className="text-xs text-muted-foreground">Years</div>
                  </div>
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-accent/20">
                    <div className="text-2xl font-bold text-accent">
                      {Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))}
                    </div>
                    <div className="text-xs text-muted-foreground">Months</div>
                  </div>
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-secondary/20">
                    <div className="text-2xl font-bold text-secondary">
                      {Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60))}
                    </div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {zodiacSign && (
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-accent/20">
                    <div className="text-2xl font-bold text-accent">{zodiacSign}</div>
                    <div className="text-xs text-muted-foreground">Zodiac Sign</div>
                  </div>
                )}
                {birthstone && (
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-secondary/20">
                    <div className="text-lg font-bold text-secondary">💎</div>
                    <div className="text-sm font-semibold text-secondary">{birthstone}</div>
                    <div className="text-xs text-muted-foreground">Birthstone</div>
                  </div>
                )}
                {celebrities && celebrities.length > 0 && (
                  <div className="text-center p-3 bg-background/60 rounded-lg border border-accent/20">
                    <div className="text-lg font-bold">🎂</div>
                    <div className="text-sm font-semibold">{celebrities[0].name}</div>
                    <div className="text-xs text-muted-foreground">Birthday Twin</div>
                  </div>
                )}
              </div>

              {/* All Birthday Matches */}
              {celebrities && celebrities.length > 1 && (
                <div className="mt-6 p-4 bg-background/40 rounded-lg border border-accent/20">
                  <h4 className="text-sm font-semibold text-accent mb-3">All Birthday Matches</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {celebrities.slice(0, 9).map((celeb, idx) => (
                      <div key={idx} className="text-muted-foreground truncate">
                        • {celeb.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>
        )}

        {/* Main Results */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {name ? `${name}'s ` : ''}Life Expectancy Report
              </CardTitle>
            </div>
            <CardDescription className="text-lg">Based on your health profile and lifestyle factors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Primary Result with Gauge Chart */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
                    {lifeExpectancy}
                  </div>
                  <div className="text-xl font-medium text-muted-foreground mt-2">More Years to Live</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Life Progress</span>
                    <span className="font-medium">{lifeExpectancyPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={lifeExpectancyPercentage} className="h-4 bg-gradient-to-r from-background to-accent/20" />
                  <p className="text-sm text-muted-foreground">
                    Expected remaining years based on your lifestyle
                  </p>
                </div>
              </div>
              
              {/* Life Expectancy Gauge */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={lifeExpectancyGaugeData}>
                    <RadialBar 
                      dataKey="value" 
                      cornerRadius={10} 
                      fill="#8b5cf6"
                      background={{ fill: '#e5e7eb' }}
                    />
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="fill-foreground text-2xl font-bold"
                    >
                      {lifeExpectancy} years
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interactive Charts Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Health Impact Analysis
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Lifestyle Factors Bar Chart */}
                {factorData.length > 0 && (
                  <Card className="p-6 bg-gradient-to-br from-background/80 to-primary/5 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Lifestyle Impact (Years)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        How your daily choices affect your lifespan. Green bars add years, red bars reduce them.
                      </CardDescription>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={factorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} years`, 'Impact']}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {factorData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}

                {/* Health Risks Pie Chart */}
                {healthRiskData.length > 0 && (
                  <Card className="p-6 bg-gradient-to-br from-background/80 to-destructive/5 border-destructive/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 text-destructive" />
                        Health Risk Factors
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Genetic and health conditions that may impact longevity. Shows years potentially reduced by each risk factor.
                      </CardDescription>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={healthRiskData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {healthRiskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} years impact`, 'Risk']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Factor Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Detailed Factor Analysis</h3>
              <p className="text-sm text-center text-muted-foreground mb-6">Based on research from WHO, CDC, and peer-reviewed health studies</p>
              <div className="grid md:grid-cols-2 gap-4">
                <FactorCard
                  icon={Cigarette}
                  title="Smoking Impact"
                  impact={factors.smoking}
                  description={factors.smoking < 0 ? "Reducing lifespan significantly" : "No negative impact from smoking"}
                  detailedInfo={factors.smoking < 0 
                    ? "According to WHO data, smoking reduces life expectancy by an average of 10 years for heavy smokers. Each cigarette can reduce your life by approximately 11 minutes. Smoking 1-5 cigarettes daily reduces life expectancy by ~3 years, 6-10 daily by ~7 years, and 10+ daily by ~12 years. Tobacco use is the leading preventable cause of death globally (WHO, 2021)."
                    : "Great choice! Not smoking is one of the most impactful decisions for longevity. According to the CDC, non-smokers live an average of 10 years longer than smokers, with significantly lower risks of cancer, heart disease, and respiratory conditions."}
                  color={factors.smoking < 0 ? "border-l-red-500" : "border-l-green-500"}
                />
                <FactorCard
                  icon={Wine}
                  title="Alcohol Impact"
                  impact={factors.drinking}
                  description={factors.drinking < 0 ? "Heavy drinking reduces lifespan" : factors.drinking > 0 ? "Light drinking may have benefits" : "No alcohol consumption"}
                  detailedInfo={factors.drinking < -3
                    ? "Heavy drinking (4+ drinks/day) can reduce life expectancy by 6+ years according to WHO studies. Excessive alcohol increases risks of liver disease, cardiovascular problems, and various cancers. The CDC reports that excessive drinking is responsible for 1 in 10 deaths among working-age adults."
                    : factors.drinking < 0
                    ? "Moderate drinking (3-4 drinks/day) can reduce life expectancy by ~1 year. While small amounts may not significantly harm health, consistent moderate drinking increases cancer risk and can lead to dependency (NIH, 2022)."
                    : factors.drinking > 0
                    ? "Light drinking (1-2 drinks/day) has been associated with a slight increase in longevity in some studies, possibly due to cardiovascular benefits. However, the WHO emphasizes that no amount of alcohol is completely safe, and benefits vary by individual (WHO, 2023)."
                    : "No alcohol consumption eliminates alcohol-related health risks. The CDC confirms that avoiding alcohol reduces risks of liver disease, certain cancers, and cardiovascular problems, contributing to overall longevity."}
                  color={factors.drinking < 0 ? "border-l-red-500" : factors.drinking > 0 ? "border-l-green-500" : "border-l-gray-500"}
                />
                <FactorCard
                  icon={Activity}
                  title="Exercise Impact"
                  impact={factors.exercise}
                  description={factors.exercise > 0 ? "Regular exercise adds years" : "Sedentary lifestyle impact"}
                  detailedInfo={factors.exercise >= 5
                    ? "Excellent! Exercising 5+ times per week can add up to 5 years to your life. The WHO recommends 150-300 minutes of moderate activity weekly. Regular exercise reduces heart disease risk by 35%, stroke by 20%, and type 2 diabetes by 50%. It also improves mental health and cognitive function (WHO Physical Activity Guidelines, 2020)."
                    : factors.exercise >= 3
                    ? "Good job! Exercising 3-4 times weekly adds ~3 years to life expectancy. This meets WHO's minimum recommendations and significantly reduces chronic disease risk. Studies show this level of activity improves cardiovascular health, strengthens bones, and enhances mood (CDC, 2023)."
                    : factors.exercise >= 1
                    ? "Light exercise (1-2 times/week) provides some benefits, adding ~1 year to life expectancy. However, the CDC recommends increasing to at least 150 minutes of moderate activity weekly for optimal health benefits."
                    : "Sedentary lifestyle can reduce life expectancy by ~2 years. Physical inactivity is the 4th leading risk factor for global mortality, according to WHO. Lack of exercise increases risks of heart disease, diabetes, obesity, and depression. Even small amounts of activity can make a difference."}
                  color={factors.exercise > 0 ? "border-l-green-500" : "border-l-red-500"}
                />
                <FactorCard
                  icon={Apple}
                  title="Diet Impact"
                  impact={factors.diet}
                  description={factors.diet > 0 ? "Healthy diet promotes longevity" : "Diet needs improvement"}
                  detailedInfo={factors.diet >= 4
                    ? "Outstanding! An excellent diet (whole foods, organic) can add ~4 years to life expectancy. The Mediterranean diet and plant-based diets are associated with 20-25% lower risk of early death. Nutrient-rich foods reduce inflammation, support immune function, and prevent chronic diseases (Harvard T.H. Chan School, 2023)."
                    : factors.diet >= 2
                    ? "Good diet quality adds ~2 years to life. A balanced diet with fruits, vegetables, whole grains, and lean proteins significantly reduces risks of heart disease, cancer, and diabetes. The WHO recommends at least 400g of fruits and vegetables daily for optimal health."
                    : factors.diet === 0
                    ? "An average mixed diet provides basic nutrition but may not optimize longevity. Consider increasing whole foods and reducing processed items. Studies show that diet quality is linked to chronic disease risk and overall life expectancy (CDC Nutrition Guidelines)."
                    : "Poor diet (mostly processed foods) can reduce life expectancy by ~3 years. High consumption of ultra-processed foods increases mortality risk by 62%, according to recent studies. Poor nutrition contributes to obesity, diabetes, heart disease, and cancer (WHO, 2022)."}
                  color={factors.diet > 0 ? "border-l-green-500" : factors.diet < 0 ? "border-l-red-500" : "border-l-gray-500"}
                />
                <FactorCard
                  icon={Brain}
                  title="Stress Impact"
                  impact={factors.stress}
                  description={factors.stress < 0 ? "High stress reduces lifespan" : "Good stress management"}
                  detailedInfo={factors.stress >= 1
                    ? "Excellent stress management! Low stress levels can add ~1-2 years to life expectancy. Chronic stress increases cortisol, which accelerates aging and raises disease risk. Good stress management through meditation, exercise, or social support improves heart health and immune function (American Psychological Association, 2022)."
                    : factors.stress >= -1
                    ? "Moderate stress has minimal impact on longevity when managed properly. The key is developing healthy coping mechanisms. Regular exercise, adequate sleep, and social connections help mitigate stress effects (CDC Mental Health Resources)."
                    : "High chronic stress can reduce life expectancy by ~2.5-3 years. Prolonged stress increases inflammation, weakens immune response, and raises risks of heart disease, depression, and cognitive decline. Studies show chronic stress accelerates cellular aging at the DNA level (NIH Stress Research, 2021)."}
                  color={factors.stress >= 0 ? "border-l-green-500" : "border-l-red-500"}
                />
                {(factors.heartDisease < 0 || factors.diabetes < 0) && (
                  <>
                    {factors.heartDisease < 0 && (
                      <FactorCard
                        icon={Heart}
                        title="Heart Disease Risk"
                        impact={factors.heartDisease}
                        description="Family history or personal diagnosis impact"
                        detailedInfo={factors.heartDisease <= -5
                          ? "Personal diagnosis of heart disease can reduce life expectancy by ~5 years. However, with proper management, medication, and lifestyle changes, many people with heart disease live long, fulfilling lives. The American Heart Association emphasizes that early intervention and treatment significantly improve outcomes."
                          : "Family history of heart disease adds moderate risk, reducing life expectancy by ~2 years if unmanaged. This genetic predisposition can be significantly mitigated through healthy lifestyle choices: regular exercise, heart-healthy diet, not smoking, and monitoring cholesterol and blood pressure (CDC Heart Disease Prevention, 2023)."}
                        color="border-l-red-500"
                      />
                    )}
                    {factors.diabetes < 0 && (
                      <FactorCard
                        icon={Heart}
                        title="Diabetes Risk"
                        impact={factors.diabetes}
                        description="Family history or personal diagnosis impact"
                        detailedInfo={factors.diabetes <= -4
                          ? "Type 2 diabetes can reduce life expectancy by ~4 years if poorly managed. However, good diabetes management through medication, diet, and exercise can minimize complications. The CDC reports that well-controlled diabetes has minimal impact on longevity, emphasizing the importance of regular monitoring and lifestyle modification."
                          : "Family history of diabetes increases your risk but doesn't determine your destiny. Maintaining healthy weight, exercising regularly, and eating a balanced diet can reduce your type 2 diabetes risk by up to 58%, according to the Diabetes Prevention Program study (NIH, 2022)."}
                        color="border-l-red-500"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What-If Scenario */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-accent" />
                What-If Scenarios
              </CardTitle>
              <CardDescription>
                Adjust your lifestyle and see the potential impact
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWhatIf(!showWhatIf)}
            >
              {showWhatIf ? 'Hide' : 'Show'} What-If
            </Button>
          </div>
        </CardHeader>
        
        {showWhatIf && (
          <CardContent className="space-y-6">
            {/* What-If Result */}
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-3xl font-bold gradient-text-accent mb-2">
                {whatIfLifeExpectancy} Years
              </div>
              <div className="flex items-center justify-center gap-2">
                {difference !== 0 && (
                  <>
                    {difference > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      difference > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {difference > 0 ? '+' : ''}{difference} years vs current
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-6">
              {Object.entries(factorConfigs).map(([key, config]) => {
                const currentValue = whatIfFactors[key as keyof typeof whatIfFactors] as number;
                const currentImpact = config.impacts[currentValue];
                const userCurrentSelection = userSelections ? userSelections[key as keyof typeof userSelections] : undefined;
                
                return (
                  <WhatIfSlider
                    key={key}
                    label={config.title}
                    icon={config.icon}
                    value={currentValue}
                    onChange={(value) => setWhatIfFactors(prev => ({ ...prev, [key]: value }))}
                    options={config.options}
                    currentImpact={currentImpact}
                    userSelection={userCurrentSelection}
                  />
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={resetWhatIf}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Current
              </Button>
            </div>
          </CardContent>
          )}
        </Card>

        {/* Health Recommendations */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-green-700 dark:text-green-300">
              <Heart className="w-6 h-6" />
              Health Recommendations for Longer Life
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              Evidence-based lifestyle changes to improve your longevity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factors.smoking < 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                    <Cigarette className="w-4 h-4" />
                    Quit Smoking
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Quitting smoking could add up to {Math.abs(factors.smoking)} years to your life. Within 1 year of quitting, your risk of heart disease drops by 50%.
                  </p>
                </div>
              )}
              
              {factors.exercise <= 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Increase Physical Activity
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Regular exercise (150 minutes/week) could add 3-7 years. Try walking, swimming, or cycling to strengthen your heart and muscles.
                  </p>
                </div>
              )}
              
              {factors.diet <= 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <Apple className="w-4 h-4" />
                    Improve Nutrition
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    A Mediterranean diet rich in vegetables, fruits, whole grains, and healthy fats could add 2-4 years and reduce disease risk.
                  </p>
                </div>
              )}
              
              {factors.stress < 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Practice Stress Management
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Mindfulness, meditation, and yoga could add {Math.abs(factors.stress)} years. Just 10 minutes daily can significantly reduce stress hormones.
                  </p>
                </div>
              )}

              {factors.drinking < 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <Wine className="w-4 h-4" />
                    Reduce Alcohol Intake
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Limiting alcohol to moderate levels or quitting could add {Math.abs(factors.drinking)} years and improve liver and heart health.
                  </p>
                </div>
              )}

              {/* Fruit & Vegetable Recommendations */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🥬 Eat Leafy Greens</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Spinach, Kale & Broccoli:</strong> Rich in vitamins K, C, and folate. Reduces heart disease risk by 15% and supports bone health.
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">🥕 Consume Beta-Carotene</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Carrots & Sweet Potatoes:</strong> Packed with vitamin A for eye health. Reduces cancer risk and boosts immune function significantly.
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">🍓 Add Berries Daily</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Blueberries & Strawberries:</strong> Antioxidant-rich, improve brain health, reduce inflammation, and may add 1-2 years to lifespan.
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">🍇 Eat Dark Fruits</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Grapes & Pomegranates:</strong> High in resveratrol and polyphenols. Supports heart health and reduces age-related diseases.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">🍌 Include Bananas</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Bananas:</strong> Rich in potassium for heart health. Regulates blood pressure and provides quick, sustained energy throughout the day.
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">🍅 Eat Tomatoes</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Tomatoes:</strong> High in lycopene for prostate health. Reduces heart disease risk by 26% and supports skin health.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🥑 Add Avocados</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Avocados:</strong> Healthy fats support brain function. Lowers cholesterol by 22% and improves nutrient absorption.
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">🍊 Boost with Citrus</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Oranges & Lemons:</strong> Vitamin C powerhouses. Strengthens immunity, promotes healthy skin, and aids iron absorption.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">🥒 Stay Hydrated</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  <strong>Cucumbers & Celery:</strong> 95% water content. Keeps you hydrated, aids digestion, and promotes clear, glowing skin.
                </p>
              </div>

              {/* General recommendations always shown */}
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-2">💤 Prioritize Sleep</h4>
                <p className="text-sm text-cyan-700 dark:text-cyan-300">
                  Getting 7-9 hours of quality sleep nightly can add 2-3 years and improve cognitive function and immune system.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">🤝 Build Social Connections</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Strong social relationships can add up to 3-5 years. Regular interaction with friends and family boosts mental health.
                </p>
              </div>

              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-2">💧 Drink Water</h4>
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  Drinking 8 glasses of water daily supports organ function, mental clarity, and can improve longevity by 1-2 years.
                </p>
              </div>

              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-pink-800 dark:text-pink-200 mb-2">🩺 Regular Health Checkups</h4>
                <p className="text-sm text-pink-700 dark:text-pink-300">
                  Annual physical exams and preventive screenings can catch issues early, potentially adding 3-5 years through early intervention.
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">🌞 Get Sunlight</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  15-20 minutes of daily sunlight boosts vitamin D, improves mood, and supports bone health for 1-2 additional years.
                </p>
              </div>

              <div className="p-4 bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-lime-800 dark:text-lime-200 mb-2">🧠 Keep Learning</h4>
                <p className="text-sm text-lime-700 dark:text-lime-300">
                  Continuous learning and mental stimulation can reduce dementia risk and add 2-3 years by keeping your brain healthy.
                </p>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-rose-800 dark:text-rose-200 mb-2">🎯 Find Purpose</h4>
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  Having a sense of purpose and engaging in meaningful activities can add 4-7 years and improve overall wellbeing.
                </p>
              </div>

              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-violet-800 dark:text-violet-200 mb-2">🚶 Daily Movement</h4>
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  Take 10,000 steps daily or engage in light activity. Reduces chronic disease risk and adds 3-4 years to your life.
                </p>
              </div>

              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-medium text-sky-800 dark:text-sky-200 mb-2">🧘 Practice Mindfulness</h4>
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  Daily meditation or yoga reduces stress hormones by 30% and improves cardiovascular health, adding 2-3 years.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground mt-1" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Important Disclaimer</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This estimate is based on statistical data and lifestyle factors. Individual results may vary significantly. 
                  This tool is for informational purposes only and does not constitute medical advice. Please consult with 
                  qualified healthcare professionals for personalized health assessments and recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Controls - Positioned at the end */}
      <div className="flex justify-center gap-2 pt-6">
        <Button 
          onClick={exportToPDF} 
          disabled={isExporting}
          size="lg"
          className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-primary-foreground shadow-lg"
        >
          {isExporting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2" />
              Generating Your Report...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Download Your Life Report (PDF)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};