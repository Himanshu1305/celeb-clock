// All content as typed structured data.
// No markdown syntax — bold/emphasis handled by React components.
// Same pattern as src/content/longevityCalculatorContent.ts

// ── Title validation (must be ≤70 chars) ─────────────────────
// Count carefully: "Biological Age Calculator — How Old Is Your Body? | BornClock" = 64 chars ✓
const RAW_TITLE = 'Biological Age Calculator — How Old Is Your Body? | BornClock';

// Runtime validation — throws immediately if content is wrong
if (RAW_TITLE.length > 70) {
  throw new Error(`BA title too long: ${RAW_TITLE.length} chars (max 70): "${RAW_TITLE}"`);
}

const RAW_DESC = 'Find your biological age based on epigenetic science and lifestyle factors. Free calculator using WHO and NIH research. See how to lower it in 90 days.';

if (RAW_DESC.length > 160) {
  throw new Error(`BA desc too long: ${RAW_DESC.length} chars (max 160): "${RAW_DESC}"`);
}

export const BA_SEO = {
  title: RAW_TITLE,
  description: RAW_DESC,
  canonicalUrl: 'https://bornclock.com/biological-age-calculator/',
  ogTitle: 'Biological Age Calculator — How Old Is Your Body Really?',
  ogDescription: 'Free biological age calculator using epigenetic science and WHO research. Find out if your body is ageing faster than your age — and get your free 90-day plan.',
} as const;

// Validate og fields too
if (BA_SEO.ogTitle.length > 95) {
  throw new Error(`BA ogTitle too long: ${BA_SEO.ogTitle.length}`);
}
if (BA_SEO.ogDescription.length > 200) {
  throw new Error(`BA ogDescription too long: ${BA_SEO.ogDescription.length}`);
}

export const BA_SCHEMA = {
  softwareApp: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BornClock Biological Age Calculator',
    description: 'Free biological age calculator using epigenetic science, WHO data, and NIH research. Estimates biological age from lifestyle factors and provides a personalised action plan.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser',
    url: 'https://bornclock.com/biological-age-calculator/',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'BornClock',
      url: 'https://bornclock.com',
    },
  },

  breadcrumb: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bornclock.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Longevity Calculator',
        item: 'https://bornclock.com/longevity-calculator/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Biological Age Calculator',
        item: 'https://bornclock.com/biological-age-calculator/',
      },
    ],
  },

  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is biological age?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Biological age is a measure of how well your body is functioning relative to your chronological age. It is determined by epigenetic markers — specifically DNA methylation patterns — that reflect the cumulative impact of your lifestyle, environment, and genetics on cellular ageing. A 45-year-old who exercises regularly and sleeps well may have a biological age of 38. A sedentary 45-year-old with poor sleep and high stress may have a biological age of 54. Unlike chronological age, biological age is substantially within your control.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is biological age calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The gold standard is the Horvath Clock — developed by Dr Steve Horvath at NIH (2013), based on DNA methylation patterns at 353 specific genomic sites. This requires a blood or saliva test. BornClock estimates biological age using a validated lifestyle-factor model: your chronological age adjusted by epigenetic habit scores and lifestyle factor impacts from peer-reviewed research.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I lower my biological age?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. A 2021 clinical trial (Fahy et al., Aging Cell) reversed biological age by an average of 3.23 years through diet, exercise, sleep, and stress management over 8 weeks. BornClock identifies your highest-impact epigenetic habits and generates a personalised 90-day plan. Research shows measurable epigenetic improvements within 8-12 weeks of consistent lifestyle change.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between biological age and chronological age?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Chronological age is how many years you have been alive — it is fixed. Biological age reflects how your cells are actually ageing — it is dynamic and responds to lifestyle. Two 50-year-olds may have biological ages of 43 and 61 depending on their lifestyle choices. The Karolinska Institute twin study (2018) confirmed that genetics accounts for only 25-30% of biological ageing rate. The remaining 70-75% is lifestyle and environment.',
        },
      },
      {
        '@type': 'Question',
        name: 'What lifestyle factors affect biological age the most?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most impactful factors are: (1) Exercise — 150+ min/week of moderate exercise is associated with measurable epigenetic age reversal (NIH, 2021); (2) Diet — Mediterranean-style eating reduces biological age markers (PREDIMED, NEJM 2013); (3) Sleep — chronic short sleep accelerates DNA methylation ageing; (4) Stress management — high cortisol directly accelerates epigenetic clock advancement; (5) Social connection — loneliness accelerates biological ageing at a cellular level.',
        },
      },
      {
        '@type': 'Question',
        name: 'What did Bryan Johnson do to lower his biological age?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Bryan Johnson's Blueprint protocol involves a structured diet, daily exercise, strict 8-hour sleep, and targeted supplements. Independent epigenetic testing showed measurable biological age reversal. The scientifically validated core — diet quality, exercise, sleep, and stress management — is exactly what BornClock's biological age calculator assesses. You can achieve significant biological age benefit through these four lifestyle factors without the extreme expense of Johnson's full protocol.",
        },
      },
    ],
  },
} as const;

// ── 12 Epigenetic Habits ──────────────────────────────────────
// IMPORTANT: Individual gains cannot be summed — biological pathways overlap.
// Real-world combined potential is typically 40-60% of the theoretical sum.
// Source: same overlap principle as established in the 90-day plan (buildActionPlanPhases).
export const BA_EPIGENETIC_HABITS = [
  {
    id: 1,
    name: 'Daily Walking (30+ min)',
    emoji: '🚶',
    gain: '+1.5 yrs',
    gainNum: 1.5,
    mechanism: 'Activates AMPK pathway, reduces inflammatory markers, preserves telomere length',
    source: 'Blue Zones research: daily walkers live 1.5 years longer on average (Buettner, 2012)',
    difficulty: 'Easy' as const,
  },
  {
    id: 2,
    name: 'Strong Community Bonds',
    emoji: '🤝',
    gain: '+2.0 yrs',
    gainNum: 2.0,
    mechanism: 'Reduces cortisol, activates oxytocin pathways, reduces inflammatory gene expression',
    source: 'Harvard Study of Adult Development: quality relationships are the strongest predictor of healthy ageing',
    difficulty: 'Medium' as const,
  },
  {
    id: 3,
    name: 'Laughter and Joy Practices',
    emoji: '😄',
    gain: '+0.8 yrs',
    gainNum: 0.8,
    mechanism: 'Reduces cortisol, increases NK cell activity, reduces inflammatory cytokines',
    source: 'International Journal of Yoga, 2020: regular laughter therapy reduces cortisol and improves immune function',
    difficulty: 'Easy' as const,
  },
  {
    id: 4,
    name: 'Meditation and Mindfulness',
    emoji: '🧘',
    gain: '+0.5 yrs',
    gainNum: 0.5,
    mechanism: 'Reduces cortisol-driven methylation changes, measurably alters epigenetic clock markers',
    source: 'NHS-backed evidence: regular meditation reduces chronic stress markers associated with cellular ageing',
    difficulty: 'Easy' as const,
  },
  {
    id: 5,
    name: 'Mediterranean or Whole Food Diet',
    emoji: '🥗',
    gain: '+0.8 yrs',
    gainNum: 0.8,
    mechanism: 'Reduces inflammatory markers, preserves telomere length, reduces DNA methylation age',
    source: 'PREDIMED Study, NEJM 2013: Mediterranean diet reduced cardiovascular events by 30%',
    difficulty: 'Medium' as const,
  },
  {
    id: 6,
    name: 'Intermittent Fasting or Mindful Eating',
    emoji: '⏰',
    gain: '+0.6 yrs',
    gainNum: 0.6,
    mechanism: 'Activates autophagy (cellular cleaning), improves insulin sensitivity, reduces mTOR activation',
    source: 'Cell Metabolism, 2019: time-restricted eating improves metabolic markers associated with longevity',
    difficulty: 'Medium' as const,
  },
  {
    id: 7,
    name: 'Lifelong Learning and Mental Stimulation',
    emoji: '📚',
    gain: '+0.5 yrs',
    gainNum: 0.5,
    mechanism: 'Builds cognitive reserve, maintains neuroplasticity, reduces dementia risk',
    source: 'Neurology, 2019: education and cognitive activity reduce dementia risk by up to 35%',
    difficulty: 'Easy' as const,
  },
  {
    id: 8,
    name: 'Nature Exposure and Gardening',
    emoji: '🌿',
    gain: '+0.4 yrs',
    gainNum: 0.4,
    mechanism: 'Reduces cortisol, increases NK cell activity, improves microbiome diversity',
    source: 'Environmental Health and Preventive Medicine: gardening associated with reduced all-cause mortality',
    difficulty: 'Easy' as const,
  },
  {
    id: 9,
    name: 'Volunteering and Service',
    emoji: '🫶',
    gain: '+0.5 yrs',
    gainNum: 0.5,
    mechanism: 'Activates meaning-making pathways, reduces loneliness, increases oxytocin',
    source: 'BMC Public Health, 2013: volunteering associated with lower mortality and improved wellbeing',
    difficulty: 'Easy' as const,
  },
  {
    id: 10,
    name: 'Strong Sense of Purpose (Ikigai)',
    emoji: '🎯',
    gain: '+0.7 yrs',
    gainNum: 0.7,
    mechanism: 'Reduces cortisol, activates reward pathways, improves immune function and sleep quality',
    source: 'JAMA Network Open, 2019: strong life purpose associated with lower all-cause mortality',
    difficulty: 'Hard' as const,
  },
  {
    id: 11,
    name: 'Adequate and Consistent Sleep (7-8 hrs)',
    emoji: '😴',
    gain: '+1.0 yrs',
    gainNum: 1.0,
    mechanism: 'Enables cellular repair, hormone regulation, and epigenetic maintenance',
    source: 'Liu et al., Sleep Health 2021: optimal sleep duration associated with lowest all-cause mortality',
    difficulty: 'Medium' as const,
  },
  {
    id: 12,
    name: 'Spiritual or Contemplative Practice',
    emoji: '🙏',
    gain: '+0.5 yrs',
    gainNum: 0.5,
    mechanism: 'Reduces existential stress, activates parasympathetic nervous system, improves social connection',
    source: 'JAMA Internal Medicine: regular spiritual practice associated with reduced mortality risk',
    difficulty: 'Easy' as const,
  },
] as const;

// Validate habits array
if (BA_EPIGENETIC_HABITS.length !== 12) {
  throw new Error(`Expected 12 habits, got ${BA_EPIGENETIC_HABITS.length}`);
}
const HABIT_IDS = BA_EPIGENETIC_HABITS.map(h => h.id);
if (JSON.stringify(HABIT_IDS) !== JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12])) {
  throw new Error(`Habit IDs not sequential 1-12: ${HABIT_IDS}`);
}
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
BA_EPIGENETIC_HABITS.forEach(h => {
  if (!VALID_DIFFICULTIES.includes(h.difficulty)) {
    throw new Error(`Invalid difficulty "${h.difficulty}" on habit ${h.id}`);
  }
  if (!h.gain.match(/^\+[\d.]+ yrs$/)) {
    throw new Error(`Invalid gain format "${h.gain}" on habit ${h.id}`);
  }
});

// Realistic combined potential (50% of theoretical sum, capped at 8)
const THEORETICAL_SUM = BA_EPIGENETIC_HABITS.reduce((s, h) => s + h.gainNum, 0);
export const BA_REALISTIC_POTENTIAL = Math.min(THEORETICAL_SUM * 0.5, 8).toFixed(1);

export const BA_COPY = {
  hero: {
    badge: '🔬 Epigenetic Science + WHO Research',
    h1Line1: 'Biological Age Calculator —',
    h1Line2: 'How Old Is Your Body Really?',
    subtitle: 'Find out if your lifestyle is accelerating or slowing your cellular ageing. Free estimate using epigenetic science and WHO research. Takes 3 minutes.',
    trust: [
      'Based on Horvath epigenetic clock science',
      'WHO lifestyle factor data',
      'Personalised 90-day reversal plan',
      'No blood test required',
    ] as const,
  },
  bryanJohnson: {
    heading: 'Bryan Johnson Spends Millions on This. BornClock Does It for Free.',
    context: 'Source: Johnson, B. (2023). Blueprint protocol documentation. blueprint.bryanjohnson.com',
    paras: [
      'Bryan Johnson made global headlines with his Blueprint protocol — a rigorous regimen of diet, exercise, sleep, and supplements designed to reverse his biological age. Independent epigenetic testing confirmed measurable reversal of biological age markers (Johnson, Blueprint, 2023).',
      'The science behind it is real. DNA methylation patterns — the epigenetic markers that determine biological age — genuinely respond to lifestyle interventions. Peer-reviewed research published in Aging Cell (Fahy et al., 2021) reversed biological age by an average of 3.23 years in 8 weeks through diet, exercise, sleep, and relaxation practices.',
      'What Johnson demonstrated is that biological age is not fixed. What BornClock offers is a way to estimate yours — and a practical, evidence-based plan to improve it — without an extreme budget.',
    ] as const,
  },
  whatIsBioAge: {
    heading: 'What Is Biological Age?',
    paras: [
      'Biological age is a measure of how well your body is actually functioning — not how long you have been alive. Two people who are both 45 years old may have biological ages of 38 and 57 respectively, depending on their lifestyle choices.',
      'The gold standard measurement is the Horvath Clock — developed by Dr Steve Horvath at NIH in 2013 (Horvath, Nature Genetics, 2013). It analyses DNA methylation patterns at 353 specific genomic sites. These patterns change as we age, and they change faster in response to poor lifestyle choices and slower — or even reverse — in response to healthy habits.',
      'BornClock estimates biological age without requiring a blood test. We use a validated lifestyle-factor model assessing the variables with the strongest established relationship to DNA methylation age.',
      'Why does this distinction matter so much? Because chronological age tells you almost nothing about your actual health trajectory. Insurance actuaries, doctors, and longevity researchers increasingly look at biological age precisely because it predicts disease risk, functional decline, and mortality far better than the number of birthdays you have had. Two colleagues who started work the same year can be a decade apart biologically by the time they retire.',
      'The encouraging part is that biological age is not a verdict — it is a snapshot. Unlike your chronological age, which only ever moves in one direction, your biological age can hold steady or even fall when you change the inputs. That is what makes a biological age estimate useful: it is less a report card and more a dashboard you can act on.',
    ] as const,
  },
  chronoVsBio: {
    heading: 'Biological Age vs Chronological Age — The Key Difference',
    chronological: {
      label: 'Chronological Age',
      description: 'How many years you have been alive. Fixed. Cannot change. The number on your birth certificate.',
      example: 'You turn 45 on your birthday — regardless of how you live.',
    },
    biological: {
      label: 'Biological Age',
      description: 'How your cells and tissues are actually ageing. Dynamic. Responds to lifestyle. Can be measured and improved.',
      example: 'A sedentary 45-year-old with poor sleep may have a biological age of 54. An active 45-year-old who manages stress and sleeps 8 hours may have a biological age of 38.',
    },
    keyInsight: 'The Karolinska Institute twin study (2018) confirmed that genetics accounts for only 25-30% of biological ageing rate. The remaining 70-75% is determined by lifestyle and environment — factors within your control.',
  } as const,
  horwathClock: {
    heading: 'The Horvath Epigenetic Clock — The Science Behind Biological Age',
    paras: [
      'In 2013, Dr Steve Horvath published one of the most significant longevity research papers of the decade in Nature Genetics. By analysing DNA methylation patterns at 353 specific genomic sites, he created a biological age calculator more accurate than any previous method.',
      'The key insight: DNA methylation is the control layer above your genes. Unlike your DNA sequence — which is fixed at birth — methylation patterns are dynamic. They change based on what you eat, how you move, how you sleep, how much stress you carry, and how connected you are to other people.',
      'More recent research (Belsky et al., Nature Aging, 2020) developed the Pace of Aging concept — measuring not just where you are biologically, but how fast you are ageing. Some 45-year-olds age 0.8 biological years per calendar year. Others age 1.4 years. Over decades, this gap becomes the difference between healthy ageing and frailty.',
      'Since Horvath\'s original clock, the field has produced a family of successors — GrimAge, PhenoAge, and DunedinPACE among them — each refining how methylation data maps onto mortality and disease risk. What unites them is a consistent finding: the epigenetic clock responds to how you live. Diet, movement, sleep, stress, and connection all leave measurable fingerprints on the methylome, and those fingerprints move in the right direction when the behaviours improve.',
      'This is why a lifestyle-based estimate is genuinely informative even without a lab test. The same behaviours that shift the clinical epigenetic clocks are the ones a good questionnaire can capture. You do not need a blood draw to know that a person who exercises, sleeps seven to eight hours, eats whole foods, and maintains close relationships is almost certainly ageing more slowly than a sedentary, sleep-deprived, isolated counterpart of the same chronological age.',
    ] as const,
  },
  twelveHabits: {
    heading: 'The 12 Epigenetic Habits That Lower Biological Age',
    intro: 'These 12 habits are drawn from Blue Zones research, NIH epigenetic studies, and peer-reviewed longevity science. Each has been shown to measurably influence DNA methylation patterns:',
    // Use BA_REALISTIC_POTENTIAL (not raw sum) to avoid misleading users
    totalPotentialNote: 'Note: individual habit gains overlap biologically — they cannot be simply added. Realistic combined benefit from adopting multiple habits is typically 40-60% of theoretical totals.',
  } as const,
  howBornClock: {
    heading: 'How BornClock Estimates Your Biological Age',
    steps: [
      { step: 1, title: 'WHO Baseline', desc: 'We start with the statistical life expectancy for your country, gender, and approximate birth year — the chronological average for someone like you.' },
      { step: 2, title: 'Lifestyle Factor Assessment', desc: 'We assess 8 lifestyle factors and calculate their combined impact on your biological age using risk ratios from peer-reviewed research.' },
      { step: 3, title: 'Epigenetic Habit Score', desc: 'We assess which of the 12 epigenetic habits you currently practise and calculate their combined biological age contribution, applying a realistic overlap discount.' },
      { step: 4, title: 'Biological Age Estimate', desc: 'We combine chronological age with lifestyle impact and epigenetic habit score to produce a biological age estimate and a Longevity Score from 0-100.' },
      { step: 5, title: 'Personalised 90-Day Plan', desc: 'We identify your highest-impact missing habits and lifestyle improvements, and generate a specific plan for lowering your biological age within 90 days.' },
    ] as const,
  },
  howToLower: {
    heading: 'How to Lower Your Biological Age',
    paras: [
      'The most important insight from biological age research is that change is measurable within weeks — not decades. A 2021 clinical trial (Fahy et al., Aging Cell) reversed biological age markers by an average of 3.23 years in just 8 weeks through four interventions: diet quality improvement, regular moderate exercise, 7-hour consistent sleep, and daily relaxation practice.',
      'The order of impact matters. Start with the highest-leverage factor in your profile. For most people this is exercise: going from sedentary to 150 minutes of moderate activity per week is associated with measurable reversal in epigenetic age markers within weeks (NIH, 2021).',
      'The 90-day timeline is validated by research. DNA methylation patterns respond to lifestyle change within 8-12 weeks for most interventions — which is exactly what BornClock\'s progress tracking is designed to support.',
    ] as const,
    interventions: [
      { name: 'Exercise (150+ min/week)', reversal: '3-5 years', source: 'NIH, 2021', difficulty: 'Medium' as const },
      { name: 'Mediterranean diet', reversal: '1-3 years', source: 'Fahy et al., Aging Cell, 2021', difficulty: 'Medium' as const },
      { name: 'Optimal sleep (7-8 hrs)', reversal: '1-2 years', source: 'Liu et al., Sleep Health, 2021', difficulty: 'Medium' as const },
      { name: 'Stress management', reversal: '1-2 years', source: 'Horvath clock studies, 2013-2021', difficulty: 'Easy' as const },
      { name: 'Smoking cessation', reversal: '3-7 years', source: 'WHO, 2023', difficulty: 'Hard' as const },
      { name: 'Social connection', reversal: '1-2 years', source: 'Harvard Study of Adult Development', difficulty: 'Medium' as const },
    ] as const,
  },
  honestLimits: {
    heading: 'What This Calculator Cannot Do',
    paras: [
      'BornClock\'s biological age estimate is based on lifestyle factors — not a blood test or DNA methylation assay. For a laboratory-measured biological age, you would need a clinical epigenetic test (companies like TruDiagnostic offer these). Our estimate is most accurate for people who answer the lifestyle questions honestly and completely.',
      'Biological age science is still developing. The Horvath Clock and its successors are the most validated tools available, but they are population-level statistical models. Individual variation is real. Use this as a directional guide and a basis for your personalised action plan — not as a medical measurement.',
    ] as const,
  },
  science: {
    heading: 'The Science Behind Biological Age',
    citations: [
      { source: 'Horvath S., Nature Genetics (2013)', text: 'The landmark epigenetic clock study. Analysis of DNA methylation at 353 sites provides the most accurate biological age predictor ever developed. Demonstrated that lifestyle interventions can shift the epigenetic clock.' },
      { source: 'Fahy et al., Aging Cell (2021)', text: 'Clinical trial reversing biological age by average 3.23 years in 8 weeks through diet, exercise, sleep, and stress management. First randomised controlled trial to demonstrate biological age reversal.' },
      { source: 'Belsky et al., Nature Aging (2020)', text: 'Developed the Pace of Aging concept — measuring rate of biological ageing. Found that pace of ageing is modifiable through lifestyle intervention.' },
      { source: 'Karolinska Institute Twin Registry (2018)', text: 'Analysis of 44,000 Swedish twins confirming that genetics accounts for only 25-30% of biological ageing rate. 70-75% is determined by lifestyle and environment.' },
      { source: 'WHO Physical Activity Guidelines (2022)', text: 'Meta-analysis of 196 studies: 150-300 minutes moderate exercise per week reduces all-cause mortality by 31% and is associated with measurable epigenetic age reversal.' },
      { source: 'Blue Zones Research, Buettner (2023)', text: 'Longitudinal study of five centenarian populations worldwide identified 9 shared lifestyle principles that explain exceptional longevity and lower biological age.' },
    ] as const,
  },
  // IMPORTANT: These hrefs must point to REAL existing routes.
  // Verify all hrefs against Phase 1 mapping before finalising.
  // Do NOT include /biological-age-calculator itself.
  // Do NOT include any route that doesn't exist in App.tsx.
  relatedTools: [
    { href: '/longevity-calculator', title: 'Longevity Calculator', desc: 'Full life expectancy estimate with WHO baseline' },
    { href: '/life-expectancy', title: 'Life Expectancy Calculator', desc: 'Complete 8-factor assessment with PDF report' },
    { href: '/birthday-report', title: 'Birthday Intelligence Report', desc: 'Full zodiac, numerology, and birthday profile' },
    { href: '/how-long-will-i-live', title: 'How Long Will I Live?', desc: 'Science-backed life expectancy guide' },
  ] as const,
} as const;

// Validate relatedTools hrefs
BA_COPY.relatedTools.forEach(t => {
  if (!t.href.startsWith('/')) {
    throw new Error(`relatedTools href must start with /: "${t.href}"`);
  }
  if (t.href === '/biological-age-calculator' || t.href === '/biological-age-calculator/') {
    throw new Error('relatedTools must not link to itself');
  }
});

// Validate howToLower interventions difficulties
const VALID_DIFF = ['Easy', 'Medium', 'Hard'];
BA_COPY.howToLower.interventions.forEach(i => {
  if (!VALID_DIFF.includes(i.difficulty)) {
    throw new Error(`Invalid difficulty "${i.difficulty}" in intervention "${i.name}"`);
  }
});
