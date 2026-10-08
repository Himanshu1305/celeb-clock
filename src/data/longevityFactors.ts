/**
 * Life-expectancy by factor — Growth P1 (P1-LE-BY-FACTOR + NS-CRED).
 *
 * Indexable explainer pages for the main modifiable longevity factors. Every
 * year-figure here is a published, cited estimate (the same evidence base the
 * BornClock life-expectancy calculator uses) — none is invented. Honesty: these
 * are population averages, not personal predictions, and the baseline they
 * modify is the national life table (US SSA, UK ONS, WHO GHO).
 */
export interface LongevityFactor {
  slug: string;
  name: string;
  category: 'Lifestyle' | 'Health condition' | 'Mind & connection';
  impact: string;         // headline delta, e.g. "−10 years"
  direction: 'add' | 'subtract' | 'mixed';
  summary: string;
  mechanism: string;
  evidence: string;       // the cited figure + source
  actions: string[];      // 3–5 evidence-based things to do
}

export const LONGEVITY_FACTORS: LongevityFactor[] = [
  {
    slug: 'smoking', name: 'Smoking', category: 'Lifestyle',
    impact: '−10 years', direction: 'subtract',
    summary: 'Smoking is the single largest preventable cause of early death. A lifelong smoker loses about a decade of life on average — but quitting recovers much of it, and the earlier the better.',
    mechanism: 'Tobacco smoke damages blood vessels and lung tissue and drives cancer, heart disease and COPD. The harm is dose-dependent and cumulative, but the body begins repairing within weeks of quitting.',
    evidence: 'Heavy smokers lose 10–12 years of life expectancy on average (WHO). Quitting before age 40 removes about 90% of the excess mortality risk (Doll et al., BMJ 2004); even quitting at 60 adds 3+ years.',
    actions: [
      'If you smoke, a quit attempt is the highest-impact longevity action available — set a quit date.',
      'Combine nicotine-replacement or prescribed support with behavioural help; it roughly doubles success.',
      'Quitting before 40 recovers most of the lost years — but it is never too late to gain some back.',
      'Avoid second-hand smoke, which carries real cardiovascular risk.',
    ],
  },
  {
    slug: 'exercise', name: 'Physical activity', category: 'Lifestyle',
    impact: '+3 to +4 years', direction: 'add',
    summary: 'Regular movement is the most evidence-backed longevity intervention there is — no medicine matches its breadth of benefit.',
    mechanism: 'Exercise improves cardiovascular fitness, insulin sensitivity, blood pressure, mood and immune function at once, lowering the risk of the biggest killers simultaneously.',
    evidence: '150 minutes/week of moderate activity is linked to a 31% lower all-cause mortality rate; even 15 minutes a day adds about 3 years of life expectancy (Wen et al., Lancet 2011; WHO guidelines).',
    actions: [
      'Aim for the WHO target: 150 minutes of moderate (or 75 of vigorous) activity a week.',
      'Even 15 minutes of brisk walking daily measurably lowers mortality — start there if you are sedentary.',
      'Add two short strength sessions a week to preserve muscle and bone with age.',
      'Break up long sitting; frequent movement matters alongside formal exercise.',
    ],
  },
  {
    slug: 'diet', name: 'Diet quality', category: 'Lifestyle',
    impact: '+4 years', direction: 'add',
    summary: 'A plant-forward, minimally-processed diet is a cornerstone of every long-lived population.',
    mechanism: 'Vegetables, legumes, whole grains and healthy fats lower inflammation and cardiovascular risk; ultra-processed food and excess red meat raise them.',
    evidence: 'A Mediterranean-style pattern can add 4+ healthy years and cut cardiovascular events by about 30% (PREDIMED, NEJM 2013; Harvard T.H. Chan School). Beans feature daily in all five Blue Zones.',
    actions: [
      'Build most meals around vegetables, legumes and whole grains.',
      'Use olive oil and nuts as primary fats; eat fish rather than red/processed meat.',
      'Cut ultra-processed foods and sugary drinks — the biggest single dietary win for most people.',
      'Adopt the pattern ~70%+ of the time; consistency beats perfection.',
    ],
  },
  {
    slug: 'bmi', name: 'Body weight (BMI)', category: 'Health condition',
    impact: '−1 to −3 years', direction: 'subtract',
    summary: 'A BMI in the healthy range is linked to the lowest mortality; both obesity and being underweight raise risk.',
    mechanism: 'Excess body fat drives insulin resistance, hypertension and inflammation; being underweight can signal frailty or underlying illness.',
    evidence: 'Lowest mortality is seen around BMI 21–25 (WHO). Class II–III obesity is associated with roughly 3+ years of reduced life expectancy, mediated largely through diabetes and heart disease.',
    actions: [
      'Aim for a BMI roughly in the 21–25 range (use waist circumference too — it captures risk BMI misses).',
      'Weight follows diet and activity; change those rather than chasing the scale alone.',
      'Modest, sustained loss (5–10% of body weight) already improves blood pressure and blood sugar.',
      'If underweight, check for an underlying cause with a clinician.',
    ],
  },
  {
    slug: 'sleep', name: 'Sleep', category: 'Lifestyle',
    impact: '±2 years', direction: 'mixed',
    summary: 'Seven to eight hours is the longevity sweet spot; both too little and too much are linked to higher mortality.',
    mechanism: 'Sleep is when the body repairs cells and regulates hormones and blood pressure. Short sleep raises cardiometabolic risk; very long sleep often flags underlying illness.',
    evidence: 'Mortality is lowest at about 7–8 hours; under 6 and over 9 hours both increase risk in large cohort studies.',
    actions: [
      'Protect a consistent 7–8 hour window, including on weekends.',
      'Keep a cool, dark room and a steady wake time to anchor your body clock.',
      'If you sleep enough but wake unrefreshed, get checked for sleep apnoea.',
      'Limit late caffeine, alcohol and screens, which fragment deep sleep.',
    ],
  },
  {
    slug: 'alcohol', name: 'Alcohol', category: 'Lifestyle',
    impact: '0 to −several years', direction: 'subtract',
    summary: 'The current evidence is that less is better; heavy drinking clearly shortens life, and no level is risk-free.',
    mechanism: 'Alcohol raises the risk of several cancers, liver disease, high blood pressure and accidents; earlier "light drinking is protective" findings are now largely attributed to study artefacts.',
    evidence: 'The WHO (2023) states no level of alcohol is safe for health; heavy and binge drinking carry the clearest life-expectancy cost. Any cardiovascular signal for light drinking is small and contested.',
    actions: [
      'If you drink, keep it low — fewer units, more alcohol-free days.',
      'Avoid binge drinking, which carries acute cardiovascular and accident risk.',
      'There is no health reason to start drinking for longevity.',
      'Seek support if cutting down is hard — it is a common and treatable difficulty.',
    ],
  },
  {
    slug: 'hypertension', name: 'High blood pressure', category: 'Health condition',
    impact: '−3 to −5 years (untreated)', direction: 'subtract',
    summary: 'Untreated high blood pressure quietly shortens life; treated, its impact falls dramatically — the control matters more than the diagnosis.',
    mechanism: 'Sustained high pressure damages arteries, the heart, kidneys and brain, driving strokes and heart attacks. Medication and lifestyle bring it back into a safe range.',
    evidence: 'Untreated hypertension reduces life expectancy by about 3–5 years; effective treatment cuts stroke risk by 35–40% (AHA/ACC 2023).',
    actions: [
      'Know your numbers — aim below ~120/80 mmHg with your clinician’s guidance.',
      'If prescribed medication, take it consistently; controlled BP largely removes the penalty.',
      'Reduce salt, excess alcohol and weight; add regular activity.',
      'Monitor at home periodically to catch drift early.',
    ],
  },
  {
    slug: 'diabetes', name: 'Type 2 diabetes', category: 'Health condition',
    impact: '−4 to −8 years', direction: 'subtract',
    summary: 'Type 2 diabetes raises cardiovascular risk, but good control roughly halves the impact.',
    mechanism: 'High blood glucose damages blood vessels and nerves over time; tight control and weight loss can slow or even reverse early disease.',
    evidence: 'Type 2 diabetes is associated with 4–8 fewer years of life expectancy and doubled cardiovascular risk; well-controlled glucose cuts complications by up to 50% (American Diabetes Association, 2023).',
    actions: [
      'Work with your clinician to keep HbA1c in target — control is what protects the years.',
      'Weight loss and activity can dramatically improve, and sometimes remit, early type 2 diabetes.',
      'Manage blood pressure and cholesterol alongside glucose — the risks compound.',
      'Attend eye, foot and kidney checks to prevent complications.',
    ],
  },
  {
    slug: 'social-connection', name: 'Social connection', category: 'Mind & connection',
    impact: '+ several years', direction: 'add',
    summary: 'Strong relationships are one of the most underrated longevity factors — on a par with quitting smoking.',
    mechanism: 'Connection lowers chronic stress, supports healthy behaviour and provides practical help in illness; loneliness does the reverse.',
    evidence: 'A meta-analysis of 148 studies found strong social ties increase survival odds by about 50%; loneliness carries mortality risk comparable to smoking 15 cigarettes a day (Holt-Lunstad et al., PLOS Medicine 2010).',
    actions: [
      'Invest in a few close, regular relationships — depth matters more than numbers.',
      'Build routines that create contact: shared meals, clubs, faith or community groups.',
      'Keep ageing parents and family close where you can — a documented Blue Zones effect.',
      'If you feel isolated, treat it as a health priority and seek a group or support.',
    ],
  },
];

export function factorBySlug(slug: string): LongevityFactor | undefined {
  return LONGEVITY_FACTORS.find(f => f.slug === slug);
}
export const LONGEVITY_FACTOR_SLUGS = LONGEVITY_FACTORS.map(f => f.slug);

/** Shared baseline citation (NS-CRED) used across longevity surfaces. */
export const LONGEVITY_BASELINE_NOTE =
  'These figures are population-average estimates from peer-reviewed research, applied on top of the official life-table baseline for your country, sex and birth cohort — the US Social Security Administration period life tables, the UK Office for National Statistics, and the WHO Global Health Observatory. They describe statistical tendencies, not personal certainties, and are not medical advice.';
