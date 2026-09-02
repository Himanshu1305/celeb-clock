// Same pattern as biologicalAgeContent.ts
// Runtime validation at module load — errors appear immediately if content is wrong

const RAW_TITLE = 'How Long Will I Live? Life Expectancy Quiz | BornClock';
const RAW_DESC  = 'Answer 8 questions to get your personalised life expectancy based on WHO, Harvard and NIH research. Free instant result with a 90-day action plan.';

if (RAW_TITLE.length > 70) {
  throw new Error(`HLWIL title ${RAW_TITLE.length} chars (max 70): "${RAW_TITLE}"`);
}
if (RAW_DESC.length > 160) {
  throw new Error(`HLWIL desc ${RAW_DESC.length} chars (max 160): "${RAW_DESC}"`);
}

export const HLWIL_SEO = {
  title: RAW_TITLE,
  description: RAW_DESC,
  canonicalUrl: 'https://bornclock.com/how-long-will-i-live/',
  ogTitle: 'How Long Will I Live? — Find Out in 3 Minutes',
  ogDescription: 'Free life expectancy quiz based on WHO, Harvard and NIH research. 8 questions. Personalised result and 90-day action plan.',
} as const;

if (HLWIL_SEO.ogTitle.length > 95)  throw new Error(`ogTitle too long: ${HLWIL_SEO.ogTitle.length}`);
if (HLWIL_SEO.ogDescription.length > 200) throw new Error(`ogDesc too long: ${HLWIL_SEO.ogDescription.length}`);

export const HLWIL_SCHEMA = {
  softwareApp: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BornClock Life Expectancy Quiz',
    description: 'Free life expectancy quiz using WHO data, Harvard and NIH research. 8-factor assessment gives a personalised forecast and 90-day action plan.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser',
    url: 'https://bornclock.com/how-long-will-i-live/',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'BornClock', url: 'https://bornclock.com' },
  },

  breadcrumb: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',
        item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Longevity Calculator',
        item: 'https://bornclock.com/longevity-calculator/' },
      { '@type': 'ListItem', position: 3, name: 'How Long Will I Live?',
        item: 'https://bornclock.com/how-long-will-i-live/' },
    ],
  },

  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long will I live?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'The global average life expectancy is approximately 73 years (WHO, 2023), but this varies dramatically based on country, gender, and individual lifestyle. A non-smoking, regularly exercising person with strong social connections and good sleep may have a statistical life expectancy above 85. Someone with multiple lifestyle risk factors may be well below the national average. BornClock\'s 8-factor quiz gives you a personalised estimate using WHO baseline data adjusted for your specific lifestyle choices.',
        },
      },
      {
        '@type': 'Question',
        name: 'What determines how long you live?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'Research from the Karolinska Institute (2018) confirmed that genetics accounts for only 25-30% of longevity. The remaining 70-75% is determined by lifestyle. The most impactful factors are: smoking (up to 10 years difference), physical exercise (31% reduction in all-cause mortality with 150+ min/week, WHO 2022), BMI (each 5-unit increase above 25 reduces life expectancy by 0.9 years, Lancet 2016), sleep (under 6 hours linked to 12% higher mortality), and social connections (isolation has mortality impact comparable to smoking 15 cigarettes per day).',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I increase how long I live?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'Yes. Because 70-75% of longevity is determined by lifestyle rather than genetics, meaningful change is possible at any age. Research shows that quitting smoking before 40 reduces smoking-related death risk by 90%. Adding 15 minutes of daily moderate exercise adds approximately 3 years of life expectancy. Improving sleep from 5 to 7 hours consistently can add up to 2 years. BornClock\'s personalised 90-day action plan identifies your highest-impact opportunities and provides specific steps to improve your forecast.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which country has the highest life expectancy?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'According to WHO 2023 data, Japan has the highest life expectancy at approximately 84.3 years, followed by Switzerland (83.4), South Korea (83.3), Singapore (83.2), and Australia (83.2). India\'s average is approximately 70.2 years. The United States averages 76.4 years, lower than many high-income countries due to lifestyle factors including obesity rates, limited healthcare access for some populations, and higher rates of accidents. BornClock uses country-specific WHO baselines so your estimate is calibrated for your actual national context.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate is a life expectancy calculator?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'Life expectancy calculators provide statistical estimates based on population research — they cannot predict individual outcomes. BornClock uses WHO Global Health Observatory baselines specific to your country and gender, then applies adjustments from 8 peer-reviewed factors. Research shows these 8 factors account for 70-75% of longevity variance, making them the most reliable basis for personalised estimation without a clinical examination. Accuracy depends on answering honestly and completely.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the average life expectancy in India?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'India\'s average life expectancy is approximately 70.2 years (WHO, 2023) — 68.3 for males and 71.5 for females. This varies significantly by state: Kerala has the highest at approximately 77 years, while several northern states are lower. Key factors driving India\'s life expectancy below the global average include cardiovascular disease rates, diabetes prevalence, air pollution exposure, and variable healthcare access by region. Individual lifestyle choices can substantially raise or lower this baseline.',
        },
      },
    ],
  },
} as const;

// Validate schema
if (HLWIL_SCHEMA.faq.mainEntity.length < 6) {
  throw new Error(`FAQ needs ≥6 questions, has ${HLWIL_SCHEMA.faq.mainEntity.length}`);
}

// ── Country Table — WHO 2023 data ─────────────────────────────
// female must be > male for ALL rows (biological fact — validated below)
export const HLWIL_COUNTRY_TABLE = [
  { rank: 1,  country: 'Japan',          expectancy: 84.3, male: 81.1, female: 87.1, region: 'Asia Pacific' },
  { rank: 2,  country: 'Switzerland',    expectancy: 83.4, male: 81.8, female: 85.1, region: 'Europe' },
  { rank: 3,  country: 'South Korea',    expectancy: 83.3, male: 80.5, female: 86.0, region: 'Asia Pacific' },
  { rank: 4,  country: 'Singapore',      expectancy: 83.2, male: 81.3, female: 85.2, region: 'Asia Pacific' },
  { rank: 5,  country: 'Australia',      expectancy: 83.2, male: 81.3, female: 85.2, region: 'Asia Pacific' },
  { rank: 6,  country: 'Spain',          expectancy: 83.2, male: 80.7, female: 85.7, region: 'Europe' },
  { rank: 7,  country: 'Italy',          expectancy: 83.0, male: 81.0, female: 85.0, region: 'Europe' },
  { rank: 8,  country: 'France',         expectancy: 82.3, male: 79.8, female: 85.1, region: 'Europe' },
  { rank: 9,  country: 'Canada',         expectancy: 82.3, male: 80.4, female: 84.4, region: 'Americas' },
  { rank: 10, country: 'United Kingdom', expectancy: 81.4, male: 79.6, female: 83.2, region: 'Europe' },
  { rank: 11, country: 'Germany',        expectancy: 81.1, male: 78.7, female: 83.4, region: 'Europe' },
  { rank: 12, country: 'New Zealand',    expectancy: 81.1, male: 79.4, female: 82.9, region: 'Asia Pacific' },
  { rank: 13, country: 'United States',  expectancy: 76.4, male: 73.5, female: 79.3, region: 'Americas' },
  { rank: 14, country: 'China',          expectancy: 77.4, male: 74.7, female: 80.5, region: 'Asia' },
  { rank: 15, country: 'Brazil',         expectancy: 75.3, male: 71.6, female: 79.2, region: 'Americas' },
  { rank: 16, country: 'Russia',         expectancy: 72.1, male: 66.5, female: 77.3, region: 'Europe/Asia' },
  { rank: 17, country: 'Indonesia',      expectancy: 67.6, male: 65.4, female: 69.8, region: 'Asia Pacific' },
  { rank: 18, country: 'India',          expectancy: 70.2, male: 68.3, female: 71.5, region: 'South Asia' },
  { rank: 19, country: 'Pakistan',       expectancy: 66.7, male: 65.5, female: 68.1, region: 'South Asia' },
  { rank: 20, country: 'Nigeria',        expectancy: 53.7, male: 52.4, female: 54.9, region: 'Africa' },
] as const;

// Runtime validation
if (HLWIL_COUNTRY_TABLE.length < 15) {
  throw new Error(`Country table needs ≥15 rows, has ${HLWIL_COUNTRY_TABLE.length}`);
}
HLWIL_COUNTRY_TABLE.forEach(row => {
  if (row.female <= row.male) {
    throw new Error(`Female ≤ male for ${row.country}: female=${row.female}, male=${row.male}`);
  }
  if (row.expectancy <= 40 || row.expectancy >= 95) {
    throw new Error(`Expectancy out of range for ${row.country}: ${row.expectancy}`);
  }
  if (row.expectancy < row.male || row.expectancy > row.female) {
    throw new Error(`Overall not between male/female for ${row.country}`);
  }
});

// ── 8 Factors ─────────────────────────────────────────────────
export const HLWIL_FACTORS = [
  {
    id: 1,
    icon: '🚬',
    name: 'Tobacco Smoking',
    impact: 'Up to 10 years lost',
    direction: 'negative' as const,
    detail: 'The single most impactful modifiable factor. Non-smokers outlive heavy smokers by up to 10 years. Quitting before 40 reduces smoking-related death risk by 90% (WHO, 2023).',
    source: 'WHO Global Tobacco Report, 2023',
  },
  {
    id: 2,
    icon: '⚖️',
    name: 'BMI / Body Weight',
    impact: '0.9 yrs per 5-unit increase above BMI 25',
    direction: 'negative' as const,
    detail: 'Optimal longevity BMI is 21-23. Analysis of 10.6 million people found each 5-unit BMI increase above 25 reduces life expectancy by 0.9 years.',
    source: 'Global BMI Mortality Collaboration, Lancet, 2016',
  },
  {
    id: 3,
    icon: '🏃',
    name: 'Physical Exercise',
    impact: '31% lower all-cause mortality',
    direction: 'positive' as const,
    detail: '150-300 minutes of moderate exercise per week reduces all-cause mortality by 31%. Even 15 minutes per day adds approximately 3 years of life expectancy (Wen et al., Lancet, 2011).',
    source: 'WHO Physical Activity Guidelines, 2022',
  },
  {
    id: 4,
    icon: '🥗',
    name: 'Diet Quality',
    impact: '30% lower cardiovascular events',
    direction: 'positive' as const,
    detail: 'Mediterranean-style eating reduces cardiovascular events by 30%. Legume consumption is the most consistent longevity food across all Blue Zone populations globally.',
    source: 'PREDIMED Study, NEJM, 2013',
  },
  {
    id: 5,
    icon: '😴',
    name: 'Sleep Duration',
    impact: '12% higher mortality under 6 hours',
    direction: 'negative' as const,
    detail: 'Optimal sleep is 7-8 hours per night. Short sleep (under 6 hours) is associated with 12% higher all-cause mortality. Long sleep (over 9 hours) also increases risk.',
    source: 'Liu et al., Sleep Health, 2021',
  },
  {
    id: 6,
    icon: '😤',
    name: 'Stress Level',
    impact: '40% higher cardiovascular disease risk',
    direction: 'negative' as const,
    detail: 'Chronic high stress elevates cortisol and accelerates epigenetic ageing. High daily stress increases cardiovascular disease risk by 40% (AHA, 2021).',
    source: 'AHA Scientific Statement, 2021',
  },
  {
    id: 7,
    icon: '🤝',
    name: 'Social Connections',
    impact: '50% higher survival odds',
    direction: 'positive' as const,
    detail: 'Strong social relationships increase survival odds by 50%. Social isolation has mortality impact comparable to smoking 15 cigarettes per day (Holt-Lunstad et al., 2010).',
    source: 'Holt-Lunstad et al., PLOS Medicine, 2010',
  },
  {
    id: 8,
    icon: '🧬',
    name: 'Genetics and Family History',
    impact: '25-30% of longevity variance',
    direction: 'mixed' as const,
    detail: 'Genetics accounts for only 25-30% of longevity variance (Karolinska twin study, 2018). Family history of heart disease and diabetes increases risk but lifestyle compensates for the remaining 70-75%.',
    source: 'Ruby et al., Science, 2018',
  },
] as const;

// Validate factors
if (HLWIL_FACTORS.length !== 8) throw new Error(`Expected 8 factors, got ${HLWIL_FACTORS.length}`);
if (JSON.stringify(HLWIL_FACTORS.map(f => f.id)) !== JSON.stringify([1,2,3,4,5,6,7,8])) {
  throw new Error('Factor IDs must be 1-8 sequential');
}
HLWIL_FACTORS.forEach(f => {
  if (!['negative','positive','mixed'].includes(f.direction)) {
    throw new Error(`Invalid direction "${f.direction}" on factor ${f.id}`);
  }
  if (!f.name || !f.detail || !f.source) {
    throw new Error(`Factor ${f.id} missing required fields`);
  }
});
const negCount = HLWIL_FACTORS.filter(f => f.direction === 'negative').length;
const posCount = HLWIL_FACTORS.filter(f => f.direction === 'positive').length;
if (negCount < 3) throw new Error(`Need ≥3 negative factors, have ${negCount}`);
if (posCount < 2) throw new Error(`Need ≥2 positive factors, have ${posCount}`);

export const HLWIL_COPY = {
  hero: {
    badge: '🔬 WHO + Harvard + NIH Research',
    h1: 'How Long Will I Live?',
    subtitle: 'Answer 8 questions to get your personalised life expectancy based on WHO country data, Harvard research, and NIH studies. Free. Takes 3 minutes.',
    trust: [
      'WHO country-specific baselines',
      '8 peer-reviewed lifestyle factors',
      'Personalised 90-day action plan',
      'Biological age estimate included',
    ] as const,
    ctaButton: 'Find Out How Long I\'ll Live →',
  },
  directAnswer: {
    heading: 'The Direct Answer: It Depends on You',
    stats: [
      { label: 'Global average', value: '73 years',   note: 'WHO 2023', color: 'text-gray-700' as const },
      { label: 'Highest (Japan)', value: '84.3 years', note: 'WHO 2023', color: 'text-emerald-600' as const },
      { label: 'India average',   value: '70.2 years', note: 'WHO 2023', color: 'text-indigo-600' as const },
      { label: 'United States',   value: '76.4 years', note: 'WHO 2023', color: 'text-blue-600' as const },
    ] as const,
    insight: 'Averages are for everyone. Your actual life expectancy could be 10-15 years above or below your national average depending on your lifestyle. Genetics accounts for only 25-30% of longevity. The remaining 70-75% is in your hands.',
    karolinskaSource: 'Karolinska Institute twin study, 2018',
  },
  whyAveragesMislead: {
    heading: 'Why National Averages Don\'t Tell You How Long YOU\'ll Live',
    paras: [
      'The global average life expectancy of 73 years includes everyone — sedentary people and marathon runners, smokers and non-smokers, socially isolated people and those with tight community bonds. Citing the national average for your life expectancy is roughly as meaningful as citing the average income when trying to know what you personally will earn.',
      'Two people born on the same day in the same country, with the same family medical history, can have statistical life expectancies that differ by 15-20 years based solely on lifestyle choices made across their adult lives. The Harvard Study of Adult Development — spanning over 85 years — found that the quality of your relationships at age 50 is a stronger predictor of healthy ageing at 80 than cholesterol levels, income, or IQ.',
      'What you need is not the national average. What you need is a personalised estimate that accounts for your specific lifestyle, health history, and habits. That is exactly what BornClock\'s 8-factor quiz provides.',
      'Consider a concrete example. Take two 40-year-old women in the same city. One walks 8,000 steps a day, sleeps seven to eight hours, eats mostly whole foods, has a close circle of friends, and does not smoke. The other is sedentary, sleeps five hours, eats a heavily processed diet, is socially isolated, and smokes a pack a day. The national average predicts an identical future for both. Decades of research predicts a gap of well over a decade in healthy years lived. The average is not wrong — it is simply not about either of them specifically.',
      'This is why a good life expectancy tool starts from your country\'s baseline and then adjusts, factor by factor, for how you actually live. The baseline sets the starting point; your choices move the number up or down from there. The result is not a fortune-teller\'s prophecy but a grounded projection you can influence — and, crucially, a map of which specific habits are moving your number the most.',
    ] as const,
  },
  eightFactors: {
    heading: 'The 8 Factors That Determine How Long YOU\'ll Live',
    intro: 'BornClock assesses these 8 factors — the variables with the strongest peer-reviewed evidence for determining individual life expectancy:',
  },
  countryTable: {
    heading: 'Life Expectancy by Country — 2023 Rankings',
    intro: 'WHO Global Health Observatory 2023 data. BornClock uses your specific country\'s baseline as the starting point for your personalised estimate.',
    source: 'Source: WHO Global Health Observatory, 2023. All figures in years, approximate.',
    indiaNote: 'India\'s life expectancy varies significantly by state — from approximately 65 years in some northern states to 77 years in Kerala. BornClock uses the national baseline and adjusts for your individual lifestyle factors.',
  },
  gapAnalysis: {
    heading: 'Why Does the US Have a Lower Life Expectancy Than Europe?',
    paras: [
      'The United States spends more per capita on healthcare than any other country yet has a lower life expectancy (76.4 years) than Japan (84.3), most of Europe, and Australia. This apparent paradox is explained by lifestyle and social factors, not healthcare quality.',
      'US life expectancy is pulled down by higher obesity rates (42% of adults vs 20-25% in Europe), higher opioid addiction prevalence, higher rates of violent death and accidents, lower social cohesion in many communities, and significant health disparities by income and race.',
      'The lesson is direct: even in a wealthy country with excellent healthcare access, lifestyle choices determine longevity more than the healthcare system. The same principle applies in India, where a person in Kerala with a healthy lifestyle significantly outlives the national average.',
      'Europe\'s advantage is not a single policy but an accumulation of everyday defaults. Walkable cities and reliable public transport build incidental movement into daily life. Food cultures lean on fresh ingredients and shared, unhurried meals rather than large portions eaten alone. Universal healthcare removes the financial hesitation that delays treatment. None of these are medical breakthroughs — they are environmental nudges that make the healthy choice the easy choice, day after day, for an entire population.',
      'The encouraging implication for individuals is that you can engineer these same defaults into your own life regardless of where you live. You can make movement incidental by walking meetings and taking stairs, build shared meals around whole foods, protect your sleep window, and invest deliberately in relationships. You do not need to move to Japan or Switzerland to capture most of the benefit — you need to copy the daily behaviours that make those populations live longer.',
    ] as const,
  },
  howToImprove: {
    heading: 'How to Live Longer — What the Evidence Actually Says',
    paras: [
      'The most important finding from longevity research is counterintuitive: the biggest gains come from the most basic changes — not from expensive supplements or advanced medical interventions, but from exercise, sleep, food, stress management, and human connection.',
      'The evidence is consistent across decades. The Harvard Study of Adult Development tracked 724 men from 1938 to the present. The conclusion was not cholesterol or income or intelligence. It was the quality of relationships.',
      'Blue Zones research — the study of five populations where people routinely live past 100 in good health — found the same nine principles across Sardinia, Okinawa, Loma Linda, Nicoya, and Ikaria. Every population moves naturally, eats a predominantly plant-based diet, has a strong sense of purpose, and belongs to a tight-knit community.',
    ] as const,
    steps: [
      { step: 1, action: 'Take the BornClock quiz', detail: 'Get your personalised life expectancy estimate and see exactly which factors are helping and hurting your forecast.' },
      { step: 2, action: 'Identify your top opportunity', detail: 'BornClock ranks your improvement opportunities by potential years gained. Focus on your single highest-impact factor first.' },
      { step: 3, action: 'Follow your 90-day plan', detail: 'Your personalised action plan gives specific weekly steps based on your quiz answers — not generic advice.' },
      { step: 4, action: 'Retake in 90 days', detail: 'Research shows measurable epigenetic improvements within 8-12 weeks of consistent lifestyle change. Track your progress.' },
    ] as const,
  },
  honestLimits: {
    heading: 'What a Life Expectancy Calculator Cannot Tell You',
    paras: [
      'A life expectancy calculator gives you a statistical estimate based on population research — not a prediction of when you will die. Individual outcomes vary significantly. People with excellent health profiles die young from accidents. People with multiple risk factors live to 95.',
      'BornClock\'s value is not the specific number. It is knowing which factors are working for you and which are working against you — and having a specific, evidence-based plan to improve the ones within your control.',
    ] as const,
  },
  science: {
    heading: 'The Research Behind BornClock',
    citations: [
      { source: 'WHO Global Health Observatory (2023)', text: 'Country and gender-specific life expectancy baselines used as the foundation of every BornClock forecast.' },
      { source: 'Harvard Study of Adult Development (85+ years)', text: 'The world\'s longest-running study of adult life. Key finding: relationship quality at 50 predicts healthy ageing at 80 more reliably than cholesterol, income, or IQ.' },
      { source: 'Karolinska Institute Twin Registry (2018)', text: 'Analysis of 44,000 Swedish twins establishing that genetics accounts for only 25-30% of longevity variance. 70-75% is determined by lifestyle.' },
      { source: 'WHO Physical Activity Guidelines (2022)', text: 'Meta-analysis of 196 studies: 150-300 minutes moderate exercise per week reduces all-cause mortality by 31%.' },
      { source: 'Horvath S., Nature Genetics (2013)', text: 'Epigenetic clock research establishing that lifestyle behaviours directly alter DNA methylation patterns and biological age.' },
      { source: 'Blue Zones Research, Buettner (2023)', text: 'Longitudinal study of five centenarian populations identifying nine shared lifestyle principles that explain exceptional longevity.' },
    ] as const,
  },
  // All hrefs verified against Phase 1 real routes before use
  relatedTools: [
    { href: '/longevity-calculator',        title: 'Longevity Calculator',        desc: 'Full life expectancy with WHO baseline and 90-day plan' },
    { href: '/biological-age-calculator',   title: 'Biological Age Calculator',   desc: 'Find out if your body is younger or older than your age' },
    { href: '/life-expectancy',             title: 'Life Expectancy Calculator',  desc: 'Complete 8-factor assessment with downloadable PDF report' },
    { href: '/birthday-report',             title: 'Birthday Intelligence Report', desc: 'Full zodiac, numerology, and birthday profile' },
  ] as const,
} as const;

// Validate relatedTools
HLWIL_COPY.relatedTools.forEach(t => {
  if (!t.href.startsWith('/')) throw new Error(`href must start with /: "${t.href}"`);
  if (t.href.includes('how-long-will-i-live')) throw new Error('relatedTools must not link to itself');
});
