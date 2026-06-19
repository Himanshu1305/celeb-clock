import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Copy, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LongevityResult, EPIGENETIC_HABITS } from '@/services/LongevityCalculationService';
import { HealthGuideSection } from '@/components/HealthGuideSection';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  result: LongevityResult;
  userName: string;
  birthDate: Date | null | undefined;
  isPremium: boolean;
  // Navigation handled inline via <Link>, this prop is retained for future payment flow integration
  onUpgradeClick?: () => void;
  optimizedForecast?: number;
  userSelectedHabits?: string[];
  simulatorHabitFrequencies?: Record<string, string>;
}


const BLUE_ZONE_PRINCIPLES = [
  { id: 'walking',    name: 'Move Naturally',   emoji: '🚶', origin: 'Okinawa, Sardinia',      science: 'Natural movement throughout the day — walking, gardening, manual tasks — reduces all-cause mortality by 21% vs sedentary lifestyles.' },
  { id: 'purpose',    name: 'Purpose (Ikigai)', emoji: '🎯', origin: 'Okinawa',                science: 'Having a clear sense of purpose adds up to 7 years of life expectancy and reduces dementia risk by 2.4× (Rush University, 2012).' },
  { id: 'meditation', name: 'Downshift',        emoji: '🧘', origin: 'All 5 Blue Zones',       science: 'Daily stress-relief rituals — prayer, naps, ancestor remembrance — lower chronic inflammation and cortisol, slowing biological aging.' },
  { id: 'fasting',    name: '80% Rule',         emoji: '⏰', origin: 'Okinawa',                science: 'Stopping eating at 80% full reduces caloric intake by 20%. Linked to a 31% lower cardiovascular mortality in Okinawan cohort studies.' },
  { id: 'wholefood',  name: 'Plant Slant',      emoji: '🥗', origin: 'All 5 Blue Zones',       science: 'Bean-heavy, plant-forward diets reduce all-cause mortality by 7–8% per 20g/day of legume consumption (British Journal of Nutrition).' },
  { id: 'community',  name: 'Right Tribe',      emoji: '👥', origin: 'Okinawa (Moai)',         science: 'Social contagion is real: health behaviors spread through social networks. Your closest 5 contacts shape your longevity habits significantly.' },
  { id: 'spiritual',  name: 'Faith Community',  emoji: '🙏', origin: 'Loma Linda, Nicoya',     science: 'Attending a faith community 4× per month adds 4–14 years of life expectancy across 5 independent studies (Hummer et al., 1999).' },
  { id: 'volunteer',  name: 'Loved Ones First', emoji: '🤝', origin: 'All 5 Blue Zones',       science: 'Multigenerational households and keeping aging parents nearby reduces mortality rates in offspring by up to 25% (Framingham Heart Study).' },
  { id: 'gardening',  name: 'Nature & Green',   emoji: '🌿', origin: 'Okinawa, Sardinia',      science: 'Regular exposure to nature and green spaces lowers cortisol by 21% and reduces risk of depression by 30% (University of Exeter, 2019).' },
];

const BlurredNumber = ({ value, isPremium, suffix = '' }: { value: number | string; isPremium: boolean; suffix?: string }) => (
  <span style={!isPremium ? { filter: 'blur(8px)', userSelect: 'none', cursor: 'default' } : {}}>
    {value}{suffix}
  </span>
);

const VITALITY_COLORS: Record<string, string> = {
  Exceptional:     'bg-emerald-100 text-emerald-800 border-emerald-300',
  Strong:          'bg-green-100 text-green-800 border-green-300',
  Average:         'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Below Average': 'bg-orange-100 text-orange-800 border-orange-300',
};

function ageColor(age: number): string {
  if (age > 80)  return 'bg-emerald-100 border-emerald-300 text-emerald-800';
  if (age >= 70) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  if (age >= 60) return 'bg-orange-100 border-orange-300 text-orange-800';
  return 'bg-red-100 border-red-300 text-red-800';
}



const PremiumBlur = ({ children, tab }: { children: React.ReactNode; tab: string }) => (
  <div className="relative">
    <div className="blur-sm select-none pointer-events-none">{children}</div>
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl z-10 p-4 text-center space-y-3">
      <Crown className="w-6 h-6 text-accent" />
      <p className="font-bold text-sm text-foreground">Unlock full {tab} analysis</p>
      <Link to="/upgrade"><Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Upgrade to Premium</Button></Link>
    </div>
  </div>
);

// ── Main Report ──────────────────────────────────────────────────────────────
export const EnhancedLifeExpectancyReport = ({
  result, userName, birthDate, isPremium, onUpgradeClick,
  optimizedForecast,
  userSelectedHabits, simulatorHabitFrequencies,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    const element = document.getElementById('longevity-blueprint-card');
    if (!element) { setExporting(false); return; }

    // Temporarily show all hidden tab panels so html2canvas captures all content
    const hiddenPanels = element.querySelectorAll<HTMLElement>('[role="tabpanel"][data-state="inactive"]');
    hiddenPanels.forEach(p => {
      p.style.display = 'block';
      p.style.visibility = 'visible';
    });

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('longevity-blueprint.pdf');
    } finally {
      // Restore hidden panels
      hiddenPanels.forEach(p => {
        p.style.display = '';
        p.style.visibility = '';
      });
      setExporting(false);
    }
  };

  const p1 = result.pillar1Snapshot;
  const p2 = result.pillar2Snapshot;
  const displayName = userName?.trim() || 'You';

  const FAMILY_MEMBERS = [
    { key: 'paternalGrandfather' as const, label: 'Paternal Grandfather', side: 'paternal' },
    { key: 'paternalGrandmother' as const, label: 'Paternal Grandmother', side: 'paternal' },
    { key: 'father'              as const, label: 'Father',               side: 'paternal' },
    { key: 'paternalUncles'      as const, label: 'Paternal Uncles (avg)',side: 'paternal' },
    { key: 'paternalAunts'       as const, label: 'Paternal Aunts (avg)', side: 'paternal' },
    { key: 'maternalGrandfather' as const, label: 'Maternal Grandfather', side: 'maternal' },
    { key: 'maternalGrandmother' as const, label: 'Maternal Grandmother', side: 'maternal' },
    { key: 'mother'              as const, label: 'Mother',               side: 'maternal' },
    { key: 'maternalUncles'      as const, label: 'Maternal Uncles (avg)',side: 'maternal' },
    { key: 'maternalAunts'       as const, label: 'Maternal Aunts (avg)', side: 'maternal' },
  ];

  const knownMembers = FAMILY_MEMBERS.filter(fm => !p1[fm.key].dontKnow && p1[fm.key].age > 0);

  const mentorHabitData   = EPIGENETIC_HABITS.filter(h => p2.mentorHabits.includes(h.id));
  const unmentorHabitData = EPIGENETIC_HABITS.filter(h => !p2.mentorHabits.includes(h.id));
  const communityHabitsBonus = Math.round(Math.min(1.0, mentorHabitData.reduce((s, h) => s + h.gain * 0.15, 0)) * 10) / 10;

  const BLUE_ZONE_HABITS = new Set(['walking', 'community', 'wholefood', 'purpose', 'spiritual', 'gardening', 'fasting', 'laughter', 'meditation']);

  const epigeneticBonus = userSelectedHabits && userSelectedHabits.length > 0
    ? Math.round(Math.min(6, userSelectedHabits.reduce((sum, id) => {
        const habit = EPIGENETIC_HABITS.find(h => h.id === id);
        const freq = simulatorHabitFrequencies?.[id] ?? 'daily';
        const mult: Record<string, number> = { never: 0, occasionally: 0.3, regularly: 0.65, daily: 1.0 };
        return sum + (habit?.gain ?? 0) * (mult[freq] ?? 1.0);
      }, 0)) * 10) / 10
    : result.epigeneticAdjustment;

  const habitsForBlueZone = userSelectedHabits?.length ? userSelectedHabits : p2.mentorHabits;
  const blueZoneCount = habitsForBlueZone.filter(id => BLUE_ZONE_HABITS.has(id)).length;

  const currentAge = birthDate instanceof Date
    ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000))
    : result.currentAge;

  const shareText = `My longevity forecast is ${result.totalForecast} years! Calculate yours at ${window.location.origin}/life-expectancy #LongevityBlueprint`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const blurNum = (n: number | string, suffix = '') => (
    <BlurredNumber value={n} isPremium={isPremium} suffix={suffix} />
  );

  const displayedOptimized = optimizedForecast ?? result.totalForecast;
  const optimizedRemaining = Math.max(0,
    Math.round((result.controllablePotential - result.currentAge) * 10) / 10
  );

  // Chart 1: waterfall data showing how the longevity score is built
  const waterfallData = [
    { name: 'WHO Baseline',     value: result.baselineLifeExpectancy,                                    fill: '#94a3b8' },
    { name: 'Health & Lifestyle', value: result.healthAdjustment,                                        fill: result.healthAdjustment >= 0 ? '#22c55e' : '#ef4444' },
    { name: 'Family Genetics',  value: result.geneticAdjustment,                                         fill: result.geneticAdjustment >= 0 ? '#22c55e' : '#ef4444' },
    { name: 'Epigenetic Habits', value: epigeneticBonus,                                                 fill: epigeneticBonus > 0 ? '#22c55e' : '#94a3b8' },
    { name: 'Community Bonus',  value: result.communityBonus,                                            fill: '#22c55e' },
    { name: 'Your Forecast',    value: result.totalForecast,                                             fill: '#f97316' },
  ];

  // Chart 2: factor impact data (top 10 by absolute impact)
  const factorImpactData = [...result.factorBreakdown]
    .filter(f => f.currentImpact !== 0)
    .sort((a, b) => Math.abs(b.currentImpact) - Math.abs(a.currentImpact))
    .slice(0, 10)
    .map(f => ({ name: `${f.emoji} ${f.factor}`, impact: f.currentImpact }));

  // "What This Means" paragraph
  const top3factors = result.factorBreakdown.slice(0, 3);
  const yearsGained = Math.round((displayedOptimized - result.totalForecast) * 10) / 10;

  return (
    <div id="longevity-blueprint-card" className="space-y-6">
      {/* Print-only header */}
      <div className="hidden print:block border-b pb-4 mb-4">
        <h1 className="text-lg font-bold">Longevity Blueprint — {displayName}</h1>
        <p className="text-xs text-gray-500">
          Generated: {new Date().toLocaleDateString()} · Sources: WHO, CDC, NIH, Harvard Medical School, Karolinska Institute
        </p>
        <p className="text-[10px] text-gray-400 italic mt-1">
          For informational purposes only. This is not medical advice. Consult a qualified healthcare professional.
        </p>
      </div>

      {/* ── Report Header ── */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 text-center space-y-4">
        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Full Longevity Blueprint</p>
        <p className="text-lg font-semibold text-foreground">Prepared for {displayName}</p>

        {/* Row 1: Current → Optimized */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Lifestyle</span>
            <strong className="text-4xl font-black text-muted-foreground">{result.totalForecast} yrs</strong>
            <span className="text-xs text-muted-foreground block mt-0.5">
              ({Math.max(0, Math.round((result.totalForecast - result.currentAge) * 10) / 10)} yrs remaining)
            </span>
          </div>
          {displayedOptimized !== result.totalForecast && (
            <>
              <div className="text-2xl font-black text-primary">→</div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-primary block">With Optimized Lifestyle</span>
                <strong className="text-4xl font-black text-primary">{displayedOptimized} yrs</strong>
                <span className="text-xs text-primary block mt-0.5">
                  ({optimizedRemaining} yrs remaining)
                </span>
                {yearsGained > 0 && (
                  <span className="text-xs font-bold text-green-600 block mt-0.5">+{yearsGained} years you could gain</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Row 2: Current Age / Max Potential / Years Remaining */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Age</span>
            <strong className="text-2xl font-bold text-foreground">{currentAge} yrs</strong>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Years Remaining</span>
            <strong className="text-2xl font-bold text-foreground">{result.yearsRemaining} yrs</strong>
          </div>
        </div>

        {/* Row 3: Three pillar badges */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge className={`border ${VITALITY_COLORS[result.geneticVitalityScore]}`}>
            🧬 Genetic Score: {result.geneticVitalityScore}
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-400">
            🌱 +{epigeneticBonus}yr epigenetic bonus
          </Badge>
          {result.communityBonus > 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-400">
              🏘️ +{result.communityBonus}yr community bonus
            </Badge>
          )}
        </div>

        {/* Chart 1: Waterfall — How Your Longevity Score Is Built */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-foreground text-center">📊 How Your Longevity Score Is Built</p>
          <p className="text-[10px] text-muted-foreground text-center">From WHO baseline to your personal forecast — each factor's contribution</p>
        </div>
        <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={waterfallData}
              margin={{ top: 10, right: 10, left: -10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip
                formatter={(value: number, name: string, props: { payload?: { name: string } }) => {
                  const label = props?.payload?.name ?? '';
                  const isAdjustment = label === 'Health & Lifestyle' || label === 'Family Genetics' || label === 'Epigenetic Habits' || label === 'Community Bonus';
                  return [`${isAdjustment && value > 0 ? '+' : ''}${value} years`, label];
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* "What This Means" interpretive paragraph */}
        {top3factors.length > 0 && (
          <div className="bg-background/50 rounded-xl border p-4 text-left">
            <p className="text-xs font-bold text-foreground mb-1">💡 What This Means For You</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              With your current lifestyle, you have approximately{' '}
              <strong className="text-foreground">{result.yearsRemaining} years</strong> ahead.
              {yearsGained > 0 && (
                <> By optimizing your habits, you could gain{' '}
                <strong className="text-foreground">{yearsGained} extra years</strong>.</>
              )}
              {' '}Your top 3 opportunities:{' '}
              <strong className="text-foreground">
                {top3factors.map(f => `${f.emoji} ${f.factor} (+${f.potentialGain}yr)`).join(', ')}
              </strong>.
            </p>
          </div>
        )}

        {isPremium && (
          <div className="screen-only flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" className="gap-2" onClick={handleExportPDF} disabled={exporting}>
              <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting…' : 'Export PDF'}
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={copyShare}>
              {copied ? '✅ Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy share text</>}
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="genetics" className="w-full">
        <TabsList className="screen-only grid grid-cols-3 w-full border-b rounded-none bg-transparent h-auto p-0">
          <TabsTrigger value="genetics"  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">🧬 Biological Blueprint</TabsTrigger>
          <TabsTrigger value="community" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">🏘️ Community Anchor</TabsTrigger>
          <TabsTrigger value="health"    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">💊 Health Guide</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Biological Blueprint ── */}
        <TabsContent value="genetics" className="print-page-break pt-5 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`border text-sm px-3 py-1 cursor-help ${VITALITY_COLORS[result.geneticVitalityScore]}`}>
                    🧬 Genetic Vitality Score: {result.geneticVitalityScore}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs p-3">
                  Research shows genetics account for 25–30% of longevity. Your family average of ~{result.familyBaselineAge} years{' '}
                  {result.geneticVitalityScore === 'Exceptional' ? 'shows exceptional hereditary longevity.' :
                   result.geneticVitalityScore === 'Strong'      ? 'indicates solid genetic inheritance.' :
                   result.geneticVitalityScore === 'Average'     ? 'is close to global population norms.' :
                   'suggests focusing on lifestyle habits is especially important.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm text-muted-foreground">
              Family weighted average: ~{result.familyBaselineAge} yrs → Genetic adjustment: {result.geneticAdjustment >= 0 ? '+' : ''}{result.geneticAdjustment} yrs
            </span>
          </div>
          {result.geneticVitalityLabel && (
            <p className="text-xs text-muted-foreground leading-relaxed">{result.geneticVitalityLabel}</p>
          )}

          {knownMembers.length === 0 ? (
            <div className="bg-muted/30 rounded-xl border p-6 text-center text-muted-foreground text-sm">
              No family data entered. Complete Step 7 in the calculator to see your genetic family tree.
            </div>
          ) : isPremium ? (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Your Genetic Family Tree</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {knownMembers.map(({ key, label }) => {
                  const m = p1[key];
                  return (
                    <div key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${ageColor(m.age)}`}>
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] font-bold ${ageColor(m.age)}`}>{m.age} yrs</Badge>
                        {m.isLiving && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 rounded-full">Living</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 flex-wrap text-[10px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /> &gt;80 yrs</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-300 inline-block" /> 70–80 yrs</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-100 border border-orange-300 inline-block" /> 60–70 yrs</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" /> &lt;60 yrs</span>
              </div>
            </div>
          ) : (
            <PremiumBlur tab="Biological">
              <div className="grid sm:grid-cols-2 gap-2">
                {knownMembers.slice(0, 4).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between px-3 py-2 rounded-lg border text-xs bg-muted/50">
                    <span className="font-medium">{label}</span>
                    <Badge variant="outline" className="text-[10px]">?? yrs</Badge>
                  </div>
                ))}
              </div>
            </PremiumBlur>
          )}

          <div className="bg-muted/30 rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Your Genetic Ceiling</h4>
              <strong className="text-lg font-black text-primary">~{Math.round(result.familyBaselineAge + 5)} yrs</strong>
            </div>
            <p className="text-xs text-muted-foreground">Estimated from your family average with a +5yr optimistic modifier based on modern medicine and lifestyle potential.</p>
          </div>

          {/* Chart 2: Factor Impact Analysis */}
          {factorImpactData.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">Factor Impact Analysis</h4>
              <p className="text-xs text-muted-foreground">How each factor currently affects your forecast — green = positive, red = negative.</p>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={factorImpactData}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[-8, 8]} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                    <RechartsTooltip
                      formatter={(value: number) => [
                        `${value > 0 ? '+' : ''}${value} years`,
                        'Current Impact',
                      ]}
                    />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                      {factorImpactData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.impact > 0 ? '#22c55e' : entry.impact < 0 ? '#ef4444' : '#94a3b8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
            <p className="text-xs font-bold text-primary">📖 Scientific Context</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Research published in <strong className="text-foreground">Science (Karolinska Institute, 2017)</strong> studied 2.87 million Swedish twins and found that genetics account for approximately 25–30% of the variation in human lifespan. This means your habits, environment, and choices control the remaining <strong className="text-foreground">70–75%</strong> of your longevity outcome.
            </p>
          </div>
        </TabsContent>

        {/* ── TAB 2: Community Anchor ── */}
        <TabsContent value="community" className="print-page-break pt-5 space-y-5">
          {mentorHabitData.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Your Community Anchor's Longevity Habits</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Habits attributed to {p2.mentorName ? `"${p2.mentorName}"` : 'your mentor'} — your environmental blueprint
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  +{communityHabitsBonus.toFixed(1)}yr community habits bonus
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {mentorHabitData.map(h => (
                  <div key={h.id} className="flex items-center gap-2 bg-green-50/50 border border-green-200 dark:bg-green-950/20 dark:border-green-900 rounded-lg px-3 py-2">
                    <span className="text-base">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{h.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{h.source.split(':')[0]}</p>
                    </div>
                    {isPremium ? (
                      <Badge variant="outline" className="text-green-600 border-green-400 text-[10px] shrink-0">+{(h.gain * 0.15).toFixed(1)}yr influence</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0"><Lock className="w-2.5 h-2.5 inline mr-0.5" />?yr</Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                Each habit contributes 15% of its direct benefit as an environmental influence on your forecast. The full benefit comes when YOU adopt these habits directly — explore them in your Longevity Simulator.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No community anchor habits recorded in Step 8. Add a mentor's habits to see their influence on your blueprint.
            </p>
          )}

          {p2.hasMentor && p2.mentorAge > 0 && (
            <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 p-4 space-y-2">
              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">🏘️ Your Community Longevity Anchor</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {p2.mentorName ? `"${p2.mentorName}"` : 'Your longevity mentor'} ({p2.mentorRelationship}, {p2.mentorAge} yrs) represents living proof that your environment supports longevity. People in similar environments share air quality, food culture, noise levels, and social norms.
              </p>
              {p2.mentorAge >= 75 && (() => {
                const reportBaseBonus = p2.mentorAge >= 95 ? 0.8 : p2.mentorAge >= 85 ? 0.5 : 0.3;
                return <p className="text-xs font-bold text-green-700">✅ Community bonus: +{reportBaseBonus} yr environmental bonus applied</p>;
              })()}
            </div>
          )}

          {/* Blue Zones Alignment — detailed grid */}
          <div className="bg-muted/30 rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-bold text-foreground">🌍 Blue Zones Power 9® Alignment</h4>
              <Badge variant="outline" className="text-sm font-bold">{blueZoneCount}/9 principles</Badge>
            </div>

            {/* Intro paragraph */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              In 2004, explorer <strong className="text-foreground">Dan Buettner</strong> partnered with demographers <strong className="text-foreground">Dr. Gianni Pes</strong> and <strong className="text-foreground">Dr. Michel Poulain</strong> to systematically study geographic pockets where people routinely lived past 100. They discovered the same 9 lifestyle patterns — the Power 9® — appeared independently across five cultures. The consistency across radically different diets, religions, and climates suggests these are not cultural accidents but universal biological truths about human longevity.{' '}
              {userSelectedHabits?.length
                ? <><strong className="text-foreground">Your simulator habits</strong> align with </>
                : <><strong className="text-foreground">Your mentor's profile</strong> aligns with </>}
              <strong className="text-foreground">{blueZoneCount} of 9</strong> principles.
            </p>

            {/* Detailed 9-habit grid */}
            <div className="space-y-2">
              {BLUE_ZONE_PRINCIPLES.map(principle => {
                const aligned = habitsForBlueZone.includes(principle.id);
                return (
                  <div
                    key={principle.id}
                    className={`rounded-lg border p-3 flex items-start gap-3 ${
                      aligned
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
                        : 'bg-muted/30 border-muted/60'
                    }`}
                  >
                    <div className="text-xl shrink-0 mt-0.5">{principle.emoji}</div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${aligned ? 'text-green-800 dark:text-green-300' : 'text-foreground'}`}>{principle.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">{principle.origin}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">{principle.science}</p>
                    </div>
                    <div className="text-base shrink-0">{aligned ? '✅' : '○'}</div>
                  </div>
                );
              })}
            </div>

            {/* Score interpretation */}
            <div className={`rounded-lg border p-3 space-y-1 ${
              blueZoneCount >= 7 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900' :
              blueZoneCount >= 5 ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' :
              blueZoneCount >= 3 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900' :
              'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900'
            }`}>
              <p className={`text-xs font-bold ${
                blueZoneCount >= 7 ? 'text-emerald-800 dark:text-emerald-200' :
                blueZoneCount >= 5 ? 'text-green-800 dark:text-green-200' :
                blueZoneCount >= 3 ? 'text-yellow-800 dark:text-yellow-200' :
                'text-orange-800 dark:text-orange-200'
              }`}>
                {blueZoneCount >= 7 ? '🏆 Blue Zone Lifestyle — Exceptional' :
                 blueZoneCount >= 5 ? '✅ Strong Alignment — Above Average' :
                 blueZoneCount >= 3 ? '🌱 Developing — Good Foundation' :
                 '🔑 Early Stage — Significant Opportunity Ahead'}
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug">
                {blueZoneCount >= 7
                  ? 'You or your mentor embody the same patterns seen in centenarian populations. Research suggests this alignment is associated with 10+ additional healthy years vs the average lifestyle.'
                  : blueZoneCount >= 5
                  ? 'Solid Blue Zones alignment. Adding 2–3 more principles — especially social/community habits — could add significant healthy years.'
                  : blueZoneCount >= 3
                  ? 'A meaningful start. Focus next on adding a community or purpose-based habit — these have the highest impact per principle adopted.'
                  : 'The greatest longevity leverage is ahead of you. Begin with Move Naturally and Plant Slant — the two most accessible, highest-impact Power 9® principles.'}
              </p>
            </div>
          </div>

          {unmentorHabitData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Untapped Longevity Opportunities</h4>
              <p className="text-xs text-muted-foreground">Habits not yet attributed to your mentor — or consider adopting them yourself via the simulator:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {unmentorHabitData.map(h => (
                  <div key={h.id} className="flex items-center gap-2 bg-muted/40 border border-muted rounded-lg px-3 py-2">
                    <span>{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground truncate">{h.label}</p>
                    </div>
                    {isPremium ? (
                      <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-400 shrink-0">+{h.gain}yr direct gain</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0"><Lock className="w-2.5 h-2.5 inline mr-0.5" /> locked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── TAB 3: Health Guide ── */}
        <TabsContent value="health" className="print-page-break pt-5">
          <HealthGuideSection result={result} />
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════════════════
          PRINT-ONLY: 7-Section Longevity Blueprint (hidden on screen)
          Shown via @media print in index.css
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden print:block space-y-6 mt-8 font-sans text-gray-900">

        {/* Section 1 — Cover */}
        <div className="text-center border-b-4 border-indigo-600 pb-6">
          <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-2">BornClock · Longevity Science Platform</p>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">Longevity Blueprint</h1>
          <p className="text-2xl font-semibold text-indigo-700 mt-1">{displayName}</p>
          <div className="flex justify-center gap-8 mt-4 text-sm text-gray-500">
            <span>Generated: {new Date().toLocaleDateString()}</span>
            <span>Forecast: {result.totalForecast} years</span>
            <span>Age: {currentAge} years old</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">
            For informational purposes only. This is not medical advice. Consult a qualified healthcare professional.
          </p>
        </div>

        {/* Section 2 — Forecast Summary */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">1</span>
            Forecast Summary
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Current Forecast</p>
              <p className="text-2xl font-black text-gray-900">{result.totalForecast}</p>
              <p className="text-[10px] text-gray-400">years</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Current Age</p>
              <p className="text-2xl font-black text-gray-900">{currentAge}</p>
              <p className="text-[10px] text-gray-400">years old</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Years Remaining</p>
              <p className="text-2xl font-black text-gray-900">{result.yearsRemaining}</p>
              <p className="text-[10px] text-gray-400">projected</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-[10px] text-indigo-600 uppercase font-bold">Optimized Potential</p>
              <p className="text-2xl font-black text-indigo-700">{result.controllablePotential}</p>
              <p className="text-[10px] text-indigo-400">years (max)</p>
            </div>
          </div>
        </div>

        {/* Section 3 — How We Built Your Number */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">2</span>
            How We Built Your Number
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 text-gray-500 font-normal text-xs">Factor</th>
                <th className="text-right py-1 text-gray-500 font-normal text-xs">Adjustment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-1.5 text-gray-700">WHO Baseline ({result.quizSnapshot.gender || 'male'}, {result.quizSnapshot.country || 'Global'})</td>
                <td className="text-right font-bold text-gray-900">{result.baselineLifeExpectancy} yrs</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-1.5 text-gray-700">Health &amp; Lifestyle Adjustment</td>
                <td className={`text-right font-bold ${result.healthAdjustment >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {result.healthAdjustment >= 0 ? '+' : ''}{result.healthAdjustment} yrs
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-1.5 text-gray-700">Genetic Adjustment <span className="text-gray-400 text-xs">({result.geneticVitalityScore})</span></td>
                <td className={`text-right font-bold ${result.geneticAdjustment >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {result.geneticAdjustment >= 0 ? '+' : ''}{result.geneticAdjustment} yrs
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-1.5 text-gray-700">Epigenetic Habits Bonus</td>
                <td className="text-right font-bold text-green-700">+{epigeneticBonus} yrs</td>
              </tr>
              {result.communityBonus > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-700">Community / Mentor Bonus</td>
                  <td className="text-right font-bold text-green-700">+{result.communityBonus} yrs</td>
                </tr>
              )}
              <tr className="bg-indigo-50">
                <td className="py-2 font-bold text-gray-900 pl-2 rounded-l">Total Forecast</td>
                <td className="text-right font-black text-indigo-700 text-lg pr-2 rounded-r">{result.totalForecast} yrs</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4 — Top 3 Improvement Opportunities */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">3</span>
            Top 3 Improvement Opportunities
          </h2>
          <div className="space-y-3">
            {result.factorBreakdown
              .filter(f => f.potentialGain > 0)
              .sort((a, b) => b.potentialGain - a.potentialGain)
              .slice(0, 3)
              .map((factor, i) => (
                <div key={factor.factor} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="text-lg">{factor.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{factor.factor}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Currently: {factor.currentValue} · Target: {factor.targetValue}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 italic">{factor.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-amber-700">+{factor.potentialGain} yrs</p>
                    <p className="text-[10px] text-amber-500">potential gain</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section 5 — 90-Day Action Plan */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">4</span>
            90-Day Action Plan
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-bold text-green-800 mb-2">Month 1 — Foundation</p>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Walk 30 min daily (builds habit base)</li>
                <li>• Add 1 serving of vegetables per meal</li>
                <li>• Set a consistent sleep schedule</li>
                <li>• Identify one close social connection to nurture</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-800 mb-2">Month 2 — Momentum</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Extend walks to 45 min, add strength training</li>
                <li>• Try 16:8 intermittent fasting 3× per week</li>
                <li>• Practice 10 min daily meditation</li>
                <li>• Schedule weekly social activity</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs font-bold text-purple-800 mb-2">Month 3 — Mastery</p>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Join a community group or class</li>
                <li>• Adopt a purpose practice (volunteering, mentoring)</li>
                <li>• Review and adjust all habits</li>
                <li>• Retake BornClock quiz to measure progress</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 6 — Scientific Context */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">5</span>
            Scientific Context
          </h2>
          <div className="space-y-2 text-xs text-gray-600">
            <p><strong className="text-gray-800">WHO Life Tables (2023):</strong> Country- and gender-specific baselines from World Health Organization Global Health Observatory data.</p>
            <p><strong className="text-gray-800">Physical Activity (WHO, 2022):</strong> 150–300 min/week of moderate exercise reduces all-cause mortality by 31%. Each additional 15 min/day adds 3 years of life expectancy.</p>
            <p><strong className="text-gray-800">Harvard Study of Adult Development (85 yrs):</strong> Quality social relationships are the strongest single predictor of healthy aging — stronger than cholesterol, income, or IQ.</p>
            <p><strong className="text-gray-800">Blue Zones Research (Buettner, 2008–2023):</strong> The Power 9 lifestyle principles shared by centenarian populations globally, associated with 10+ additional healthy years versus average.</p>
            <p><strong className="text-gray-800">Epigenetic Research (NIH, Horvath 2013):</strong> Lifestyle behaviors directly alter DNA methylation patterns. Diet, exercise, and stress management can reverse epigenetic aging by 3–5 years.</p>
            <p><strong className="text-gray-800">Genetic Heritability (Karolinska Institute, 2018):</strong> Family history contributes approximately 25–30% of longevity variance. Environmental and lifestyle factors account for the remaining 70–75%.</p>
          </div>
        </div>

        {/* Section 7 — Footer */}
        <div className="border-t-2 border-gray-200 pt-4 text-center">
          <p className="text-sm font-bold text-indigo-700">BornClock · Longevity Science Platform</p>
          <p className="text-xs text-gray-500 mt-1">bornclock.com · Evidence-based longevity analysis powered by WHO, NIH, Harvard Medical School data</p>
          <p className="text-[10px] text-gray-400 mt-2 italic max-w-2xl mx-auto">
            This report is generated for informational and motivational purposes only. It is not a medical diagnosis, prognosis, or substitute for professional medical advice.
            Life expectancy projections are statistical estimates based on population data and individual inputs — actual outcomes vary significantly based on genetics, environment, and unforeseen health events.
            Always consult a qualified healthcare professional for medical advice.
          </p>
          <p className="text-[10px] text-gray-300 mt-2">© {new Date().getFullYear()} BornClock · Generated {new Date().toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
};
