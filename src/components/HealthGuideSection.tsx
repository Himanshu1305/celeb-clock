import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LongevityResult } from '@/services/LongevityCalculationService';

// ─── Health Guide data ──────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────────

interface HealthGuideSectionProps {
  result?: LongevityResult | null;
}

export const HealthGuideSection = ({ result }: HealthGuideSectionProps) => {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-6">

      {/* Personalized Health Priorities — only when quiz result is available */}
      {result && (() => {
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
        <p className="text-xs text-muted-foreground">
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

      <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
        <p className="text-xs font-bold text-primary">📖 Disclaimer</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The recommendations above are for informational purposes only and are not a substitute for professional medical advice. Consult your healthcare provider before making significant changes to your diet, exercise, or health routine. Impact values are averages from population studies and may vary significantly between individuals.
        </p>
      </div>
    </div>
  );
};
