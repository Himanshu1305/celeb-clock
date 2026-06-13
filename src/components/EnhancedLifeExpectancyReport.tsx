import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Copy, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LongevityResult, EPIGENETIC_HABITS } from '@/services/LongevityCalculationService';
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

// ─── Health Guide data ─────────────────────────────────────────────────────────

interface CategoryRec {
  emoji: string;
  title: string;
  impact?: number;
  detail: string;
  quickWin: string;
  source: string;
}

interface HealthCategory {
  id: 'sleep' | 'exercise' | 'nutrition' | 'mental' | 'preventive' | 'community';
  name: string;
  emoji: string;
  stat: string;
  border: string;
  headerBg: string;
  recs: CategoryRec[];
  blogPath: string;
}

const HEALTH_CATEGORIES: HealthCategory[] = [
  {
    id: 'sleep', name: 'Sleep', emoji: '😴',
    stat: '7–9 hrs/night linked to +2.5 yrs life expectancy',
    border: 'border-l-indigo-500',
    headerBg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    blogPath: '/blog/sleep-longevity',
    recs: [
      { emoji: '⏰', title: 'Consistent Sleep Schedule', impact: 1.5, detail: 'Going to bed and waking at the same time daily synchronizes your circadian rhythm, reducing mortality risk by 24%. Irregular sleep is independently linked to metabolic and cardiovascular disease.', quickWin: 'Set both a bedtime alarm and wake alarm tonight — keep them on weekends too.', source: 'Sleep Medicine Reviews, 2022' },
      { emoji: '🌡️', title: 'Cool Bedroom (65–68°F / 18–20°C)', impact: 0.7, detail: 'Core body temperature must drop ~2°F to initiate sleep onset. Cooler rooms improve deep NREM sleep by up to 30%, boosting cellular repair and memory consolidation.', quickWin: 'Lower your thermostat or run a small fan in your bedroom tonight.', source: 'National Sleep Foundation, 2023' },
      { emoji: '📵', title: 'Screen-Free 90 Min Before Bed', impact: 0.8, detail: 'Blue light suppresses melatonin production for up to 3 hours after exposure, delaying sleep onset and reducing sleep quality by 35%.', quickWin: 'Enable Night Mode on all devices and set a "screens off" phone reminder for 90 min before bed.', source: 'Harvard Medical School, 2020' },
      { emoji: '😴', title: 'Strategic Napping (20 min max)', detail: '10–20 min power naps reduce cortisol, improve cognitive performance by 34%, and support cardiovascular health — without causing the sleep inertia of longer naps.', quickWin: 'Schedule a 15-min post-lunch rest; the 1–3pm window is biologically optimal.', source: 'NASA Sleep Study, 1995; ESC 2018' },
    ],
  },
  {
    id: 'exercise', name: 'Exercise', emoji: '🏃',
    stat: '150 min/week aerobic exercise reduces mortality by 31%',
    border: 'border-l-green-500',
    headerBg: 'bg-green-50/70 dark:bg-green-950/30',
    blogPath: '/blog/exercise-longevity',
    recs: [
      { emoji: '🚴', title: 'Zone 2 Cardio (150 min/week)', impact: 2.0, detail: 'Moderate aerobic exercise at 60–70% max heart rate reduces all-cause mortality by 31% and extends healthspan by 7 years. It also improves mitochondrial density — a key marker of biological youth.', quickWin: 'Walk briskly, bike, or swim for 30 min today.', source: 'WHO Guidelines 2020; NEJM 2022' },
      { emoji: '💪', title: 'Strength Training (2–3×/week)', impact: 1.5, detail: 'Muscle mass is a longevity biomarker. Resistance training reduces all-cause mortality by 23% and protects insulin sensitivity, bone density, and metabolic health into old age.', quickWin: 'Do one bodyweight circuit today: 3 sets of squats, pushups, and lunges.', source: 'British Journal of Sports Medicine, 2022' },
      { emoji: '🚶', title: 'NEAT Movement (7,000+ daily steps)', impact: 1.0, detail: 'Non-exercise activity thermogenesis — incidental daily movement — reduces cardiovascular risk by 21% vs sedentary lifestyle, independent of formal workouts.', quickWin: 'Take the stairs, park further away, and walk while on phone calls today.', source: 'JAMA Internal Medicine, 2021' },
      { emoji: '🧘', title: 'Flexibility & Mobility Work', impact: 0.8, detail: 'Regular mobility work reduces injury risk, lowers inflammation, and improves balance — directly preventing potentially fatal falls, the leading cause of injury death in adults over 65.', quickWin: 'Do a 10-min stretching routine tomorrow morning.', source: 'International Journal of Yoga, 2021' },
    ],
  },
  {
    id: 'nutrition', name: 'Nutrition', emoji: '🥗',
    stat: 'Mediterranean diet cuts all-cause mortality by 25%',
    border: 'border-l-orange-500',
    headerBg: 'bg-orange-50/70 dark:bg-orange-950/30',
    blogPath: '/blog/nutrition-longevity',
    recs: [
      { emoji: '🫘', title: 'Legumes Daily', impact: 1.3, detail: 'For every 20g/day of legumes, all-cause mortality drops 7–8%. Blue Zone populations eat legumes as a dietary cornerstone — providing protein, prebiotic fiber, and anti-inflammatory polyphenols.', quickWin: "Add a can of chickpeas or lentils to tonight's meal.", source: 'British Journal of Nutrition, 2014' },
      { emoji: '🥬', title: 'Leafy Greens (1–2 cups daily)', impact: 1.2, detail: 'Nitrate-rich greens reduce blood pressure and improve arterial elasticity. Harvard research links daily greens to a cognitive age 11 years younger in older adults.', quickWin: 'Add a handful of spinach to your next meal or morning smoothie.', source: 'PREDIMED Study; NEJM 2013' },
      { emoji: '🐟', title: 'Mediterranean Diet Pattern', impact: 2.0, detail: 'Adherence to a Mediterranean diet — rich in fish, olive oil, legumes, vegetables, and whole grains — reduces all-cause mortality by 25% and cardiovascular mortality by 33%.', quickWin: 'Replace one red meat meal per week with fatty fish (salmon, mackerel, or sardines).', source: 'PREDIMED Trial, NEJM 2018' },
      { emoji: '🚫', title: 'Reduce Ultra-Processed Foods', impact: 0.8, detail: 'Each 10% increase in ultra-processed food intake is linked to 14% higher all-cause mortality. These foods drive systemic inflammation, gut dysbiosis, and accelerated metabolic aging.', quickWin: 'Cook one meal this week that replaces a packaged or fast-food option.', source: 'BMJ, 2019' },
    ],
  },
  {
    id: 'mental', name: 'Mental Health', emoji: '🧠',
    stat: 'Strong social ties reduce premature mortality by 50%',
    border: 'border-l-purple-500',
    headerBg: 'bg-purple-50/70 dark:bg-purple-950/30',
    blogPath: '/blog/mental-health-longevity',
    recs: [
      { emoji: '🧘', title: 'Daily Stress Management', impact: 0.8, detail: 'Chronic high cortisol accelerates cellular aging via telomere shortening. Daily downshift rituals — even 5 minutes of deep breathing — measurably lower cortisol and slow biological aging.', quickWin: 'Try box breathing right now: 4s inhale → 4s hold → 6s exhale, for 5 cycles.', source: 'Lancet Psychiatry, 2021' },
      { emoji: '🎯', title: 'Purpose & Meaning (Ikigai)', impact: 1.0, detail: 'Having a clear sense of life purpose reduces dementia risk by 2.4× and adds up to 7 years of life expectancy across multiple independent studies.', quickWin: "Write one sentence: \"My purpose today is...\" and post it where you'll see it.", source: 'Rush University Medical Center, 2012' },
      { emoji: '🗣️', title: 'Therapy & Active Mental Health Care', impact: 0.5, detail: 'Proactive mental health management — therapy, support groups, or structured self-help — reduces all-cause mortality by 18% and significantly extends healthy years.', quickWin: 'Schedule one mental health check-in or try a guided meditation app this week.', source: 'Lancet Psychiatry, 2021' },
      { emoji: '😊', title: 'Positive Affect & Optimism', detail: 'Optimism is associated with 11–15% longer lifespan and significantly higher odds of exceptional longevity. It predicts lower cardiovascular events and stronger immune function.', quickWin: "Write down 3 things you're grateful for tonight — a validated daily practice.", source: 'PNAS 2019; Harvard T.H. Chan School of Public Health' },
    ],
  },
  {
    id: 'preventive', name: 'Preventive Care', emoji: '🏥',
    stat: 'Screenings catch disease 5–10 yrs earlier; reduce mortality 16%',
    border: 'border-l-red-500',
    headerBg: 'bg-red-50/70 dark:bg-red-950/30',
    blogPath: '/blog/preventive-care-longevity',
    recs: [
      { emoji: '🏥', title: 'Annual Health Checkups', impact: 0.8, detail: 'Regular preventive screenings catch disease 5–10 years earlier. Annual checkups reduce premature mortality by 16% in adults over 40, primarily through early detection and intervention.', quickWin: "Book your next annual physical today if you haven't had one in the past year.", source: 'USPSTF, 2023; Preventive Medicine 2022' },
      { emoji: '🔬', title: 'Cancer Screenings (Age-Appropriate)', impact: 0.5, detail: 'Colorectal cancer screening alone reduces cancer mortality by 60–70%. Breast, prostate, and cervical screenings further reduce total disease burden dramatically with early treatment.', quickWin: 'Check whether your age-appropriate cancer screenings are current this week.', source: 'USPSTF Cancer Screening Guidelines, 2023' },
      { emoji: '🦷', title: 'Dental & Oral Health', impact: 0.4, detail: 'Periodontal disease bacteria are directly linked to 30% higher heart disease risk and increased stroke risk. Regular dental care reduces systemic inflammation throughout the body.', quickWin: 'Floss tonight and schedule a dental cleaning if overdue.', source: 'Journal of Periodontology, 2021' },
      { emoji: '📊', title: 'Know Your 4 Biomarkers', detail: 'Blood pressure, HbA1c, LDL cholesterol, and BMI are the four most predictive biomarkers of long-term health. Knowing them enables early, low-cost intervention before disease develops.', quickWin: "Ask your doctor for a full metabolic panel at your next visit.", source: 'American Heart Association, 2023' },
    ],
  },
  {
    id: 'community', name: 'Community', emoji: '👥',
    stat: 'Strong community ties add 4–14 years of life expectancy',
    border: 'border-l-teal-500',
    headerBg: 'bg-teal-50/70 dark:bg-teal-950/30',
    blogPath: '/blog/social-connection-longevity',
    recs: [
      { emoji: '🤝', title: 'Build Your Moai (5-person tribe)', impact: 1.5, detail: 'Okinawan "moai" — committed social support circles of 5 people — are linked to 50% lower premature mortality. Social contagion means your 5 closest contacts shape your health behaviors daily.', quickWin: 'Identify your 5 key wellbeing supporters and reach out to one today.', source: 'Holt-Lunstad, 2015; Blue Zones Research' },
      { emoji: '🙏', title: 'Community or Faith Group (4×/month)', impact: 1.0, detail: 'Attending a community or faith-based group at least 4 times per month adds 4–14 years of life expectancy across 5 independent epidemiological studies.', quickWin: 'Find one local community class, club, or group to join this month.', source: 'Hummer et al., 1999; American Journal of Public Health' },
      { emoji: '🎯', title: 'Clear Life Purpose (Ikigai)', impact: 0.8, detail: 'A defined sense of purpose reduces dementia risk by 2.4× and adds up to 7 years of life expectancy. It also predicts lower cortisol, better sleep, and higher physical activity levels.', quickWin: 'Write your personal mission in one sentence and review it each morning.', source: 'Rush University Medical Center, 2012' },
      { emoji: '💬', title: 'Proactively Combat Loneliness', detail: 'Chronic loneliness is as harmful as smoking 15 cigarettes per day. Proactively scheduling in-person social time is the highest-leverage mental health and longevity intervention available.', quickWin: 'Make one in-person social plan this week — a walk, meal, or activity with someone you care about.', source: 'Cigna Loneliness Index, 2020; Holt-Lunstad, 2015' },
    ],
  },
];

const FACTOR_TO_CATEGORY: Record<string, HealthCategory['id']> = {
  'Physical Exercise':   'exercise',
  'Exercise':            'exercise',
  'Sedentary Time':      'exercise',
  'Diet Quality':        'nutrition',
  'Nutrition':           'nutrition',
  'BMI':                 'nutrition',
  'Body Weight':         'nutrition',
  'Alcohol':             'nutrition',
  'Alcohol Consumption': 'nutrition',
  'Smoking':             'preventive',
  'Smoking Status':      'preventive',
  'Blood Pressure':      'preventive',
  'Heart Health':        'preventive',
  'Diabetes':            'preventive',
  'Diabetes Status':     'preventive',
  'Sleep Duration':      'sleep',
  'Sleep Quality':       'sleep',
  'Sleep':               'sleep',
  'Stress Level':        'mental',
  'Stress':              'mental',
  'Mental Health':       'mental',
  'Social Connections':  'community',
  'Community':           'community',
};

const FACTOR_CONNECTION: Record<string, string> = {
  'Physical Exercise':   'Adding movement is the single most evidence-backed lever for both lifespan and healthspan.',
  'Exercise':            'Adding movement is the single most evidence-backed lever for both lifespan and healthspan.',
  'Sedentary Time':      'Reducing sitting time by even 1–2 hrs/day measurably lowers cardiovascular and metabolic risk.',
  'Diet Quality':        'What you eat reshapes your gut microbiome, inflammation markers, and cellular aging speed daily.',
  'BMI':                 'Maintaining a healthy weight directly reduces risk across all major chronic disease categories.',
  'Alcohol':             'Moderating alcohol consumption reduces cancer, liver, and cardiovascular risk significantly.',
  'Alcohol Consumption': 'Moderating alcohol consumption reduces cancer, liver, and cardiovascular risk significantly.',
  'Smoking':             'Quitting smoking is the single largest modifiable longevity gain available to smokers.',
  'Smoking Status':      'Quitting smoking is the single largest modifiable longevity gain available to smokers.',
  'Blood Pressure':      'Keeping blood pressure in range is your #1 cardiovascular investment with measurable return.',
  'Sleep Duration':      "Consistent sleep is when your brain and body perform cellular repair — it's non-negotiable.",
  'Sleep Quality':       'Deep sleep drives growth hormone release, memory consolidation, and immune reset nightly.',
  'Stress Level':        'Chronic stress accelerates telomere shortening — the primary molecular clock of biological aging.',
  'Stress':              'Chronic stress accelerates telomere shortening — the primary molecular clock of biological aging.',
  'Social Connections':  'The science is unambiguous: social isolation is as lethal as smoking 15 cigarettes a day.',
  'Mental Health':       'Active mental health care reduces all-cause mortality by 18% — it is physical health too.',
};

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
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [funFactsOpen, setFunFactsOpen] = useState(false);

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
    <div id="longevity-blueprint-print" className="space-y-6">
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
          </div>
          {displayedOptimized !== result.totalForecast && (
            <>
              <div className="text-2xl font-black text-primary">→</div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-primary block">With Optimized Lifestyle</span>
                <strong className="text-4xl font-black text-primary">{displayedOptimized} yrs</strong>
                {yearsGained > 0 && (
                  <span className="text-xs font-bold text-green-600 block mt-0.5">+{yearsGained} years gained</span>
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
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" className="gap-2 print-show" onClick={() => window.print()}>
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={copyShare}>
              {copied ? '✅ Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy share text</>}
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="genetics" className="w-full">
        <TabsList className="grid grid-cols-3 w-full border-b rounded-none bg-transparent h-auto p-0">
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
        <TabsContent value="health" className="print-page-break pt-5 space-y-6">

          {/* Personalized Health Priorities */}
          {(() => {
            const topFactors = [...result.factorBreakdown]
              .filter(f => f.potentialGain > 0)
              .sort((a, b) => b.potentialGain - a.potentialGain)
              .slice(0, 3);
            if (topFactors.length === 0) return null;
            return (
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">📊 Your Personal Health Priorities</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your top {topFactors.length} factors with the most potential gain — based on your quiz answers.
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
                  {topFactors.map(f => {
                    const catId = FACTOR_TO_CATEGORY[f.factor];
                    const cat = catId ? HEALTH_CATEGORIES.find(c => c.id === catId) : undefined;
                    const connection = FACTOR_CONNECTION[f.factor] ?? 'Addressing this factor is one of the highest-impact longevity changes you can make.';
                    return (
                      <div
                        key={f.factor}
                        className={`shrink-0 w-64 lg:w-auto bg-white dark:bg-card rounded-xl border border-l-4 ${cat?.border ?? 'border-l-primary'} p-4 space-y-1.5`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{f.emoji}</span>
                          <span className="text-sm font-bold text-foreground">{f.factor}</span>
                        </div>
                        <p className="text-sm font-black text-green-600">+{f.potentialGain} years potential gain</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{connection}</p>
                        {cat && (
                          <button
                            className="text-[11px] text-primary font-semibold hover:underline mt-0.5"
                            onClick={() => setExpandedCats(prev => { const next = new Set(prev); next.add(cat.id); return next; })}
                          >
                            See {cat.name} guide ↓
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 3-Tier Category Cards */}
          <div>
            <h3 className="text-base font-bold text-foreground">💊 Your Personalized Health Guide</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Science-backed recommendations across 6 key longevity categories. Tap any card to expand.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {HEALTH_CATEGORIES.map(cat => {
              const isOpen = expandedCats.has(cat.id);
              return (
                <div key={cat.id} className={`rounded-xl border border-l-4 ${cat.border} overflow-hidden`}>
                  {/* Tier 1: Always-visible header */}
                  <button
                    className={`w-full text-left p-4 ${cat.headerBg} flex items-center justify-between gap-3`}
                    onClick={() => setExpandedCats(prev => {
                      const next = new Set(prev);
                      if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id);
                      return next;
                    })}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{cat.name}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{cat.stat}</p>
                      </div>
                    </div>
                    <span className={`text-muted-foreground text-lg select-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {/* Tier 2: Expandable recommendations */}
                  {isOpen && (
                    <div className="p-4 space-y-3 bg-background">
                      {cat.recs.map(rec => (
                        <div key={rec.title} className="flex gap-3 bg-muted/30 border rounded-lg p-3">
                          <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{rec.emoji}</span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-foreground">{rec.title}</p>
                              {rec.impact !== undefined && (
                                <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-300 px-1.5 py-0.5 rounded-full">
                                  +{rec.impact} yrs
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-snug">{rec.detail}</p>
                            <div className="bg-primary/5 border border-primary/20 rounded px-2 py-1">
                              <p className="text-[10px] font-semibold text-primary">⚡ Quick Win: {rec.quickWin}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 italic">{rec.source}</p>
                          </div>
                        </div>
                      ))}

                      {/* Tier 3: Blog SEO link */}
                      <Link
                        to={cat.blogPath}
                        className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline pt-1"
                      >
                        📖 Deep dive: {cat.name} & Longevity →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 🏆 World Longevity Records — collapsible Fun Facts */}
          <div className="rounded-xl border overflow-hidden">
            <button
              className="w-full text-left p-4 bg-amber-50/70 dark:bg-amber-950/30 flex items-center justify-between gap-3"
              onClick={() => setFunFactsOpen(v => !v)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-sm font-bold text-foreground">World Longevity Records</p>
                  <p className="text-[11px] text-muted-foreground">Real stories from history's longest-lived individuals and populations</p>
                </div>
              </div>
              <span className={`text-muted-foreground text-lg select-none transition-transform duration-200 ${funFactsOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {funFactsOpen && (
              <div className="p-4 space-y-2 bg-background">
                <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                  Verified records from the world's longest-lived individuals and populations — and what their lives reveal about the science of longevity.
                </p>
                {[
                  {
                    emoji: '👩‍🦳', name: 'Jeanne Calment', stat: '122 years, 164 days',
                    location: 'Arles, France', years: '1875–1997',
                    detail: 'The longest verified human lifespan ever recorded. Calment walked and cycled regularly until her 100s, ate a Mediterranean diet rich in olive oil, drank port wine, and credited her stress-free temperament. She took up fencing at 85 and continued to live independently until age 110.',
                    learn: 'Moderate activity, Mediterranean diet, low stress, and an optimistic temperament are associated with exceptional longevity.',
                  },
                  {
                    emoji: '👴', name: 'Jiroemon Kimura', stat: '116 years, 54 days',
                    location: 'Kyotango, Japan', years: '1897–2013',
                    detail: 'The longest verified male lifespan. Kimura worked as a postal worker until 90, ate small portions (practising the Okinawan "hara hachi bu" 80% rule), read newspapers daily for mental engagement, and maintained a purposeful daily routine throughout his life.',
                    learn: 'Caloric moderation, continued mental engagement, purposeful routine, and natural daily activity are key male longevity drivers.',
                  },
                  {
                    emoji: '🇯🇵', name: 'Japan: 90,000+ Centenarians', stat: 'World-leading centenarian density',
                    location: 'Japan (national)', years: '2023 census',
                    detail: "Japan has the world's highest concentration of centenarians — over 90,000 people aged 100+, led by Okinawa. This is attributed to a national culture of plant-heavy diet (miso, seaweed, tofu), strong social structures, universal healthcare access, and a deep sense of ikigai (life purpose).",
                    learn: "National diet culture, universal healthcare, and community purpose-structures create population-level longevity effects that transcend individual willpower.",
                  },
                  {
                    emoji: '🏃', name: 'Fauja Singh', stat: 'Completed marathon at age 100',
                    location: 'Toronto, Canada', years: 'Born 1911',
                    detail: 'Singh began marathon running at age 89 after the death of his wife, completing the Toronto Waterfront Marathon at 100 years old. A lifelong vegetarian and tea drinker, he credits his longevity to simple food, regular walking, mental positivity, and his Sikh faith community.',
                    learn: 'It is never too late to start exercising. Plant-based diet, faith community, and mental resilience can sustain extraordinary physical performance into the 10th decade.',
                  },
                  {
                    emoji: '👵', name: 'Maria Branyas Morera', stat: "117 years (world's oldest living person as of 2024)",
                    location: 'Catalonia, Spain', years: '1907–2024',
                    detail: 'The world\'s oldest verified living person until her passing in 2024. Branyas attributed her longevity to "order, tranquility, and good connection with family and friends." She avoided toxic people, maintained a positive outlook, and spent decades in a care home with close family ties.',
                    learn: 'Emotional environment and the intentional avoidance of chronic stress and negative relationships may be as important as physical health habits.',
                  },
                  {
                    emoji: '🏝️', name: 'Sardinia Blue Zone', stat: 'Highest male centenarian rate globally',
                    location: 'Nuoro Province, Sardinia', years: 'Ongoing',
                    detail: "Sardinia's mountainous Nuoro province has the world's highest known concentration of male centenarians. The terrain requires daily steep walking, the diet is heavy in goat's milk, flat bread, and local vegetables, and multigenerational family households are the norm — with grandparents playing active roles into their 90s.",
                    learn: 'Incidental physical activity built into geography, whole-food local diet, and intergenerational family bonds form a powerful longevity triangle.',
                  },
                  {
                    emoji: '🎿', name: 'Oscar Swahn', stat: 'Oldest Olympic medalist — gold at age 60, silver at 72',
                    location: 'Stockholm, Sweden', years: '1847–1927',
                    detail: 'Swedish sport shooter Oscar Swahn remains the oldest Olympic gold medalist (1908, age 60) and oldest Olympic medalist overall (1920, age 72). He continued competitive athletic participation into his 70s and lived to age 80 — nearly double the male life expectancy of his era.',
                    learn: 'Continued purposeful competition, physical engagement, and active community participation can dramatically extend healthy function well beyond typical population norms.',
                  },
                ].map(({ emoji, name, stat, location, years, detail, learn }) => (
                  <div key={name} className="flex gap-3 bg-muted/30 border rounded-lg p-3">
                    <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="text-xs font-bold text-foreground">{name}</p>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{stat}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/70">{location} · {years}</p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{detail}</p>
                      <p className="text-[10px] font-semibold text-foreground leading-snug">What we can learn: {learn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
            <p className="text-xs font-bold text-primary">📖 Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The recommendations above are for informational purposes only and are not a substitute for professional medical advice. Consult your healthcare provider before making significant changes to your diet, exercise, or health routine. Impact values are averages from population studies and may vary significantly between individuals.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
