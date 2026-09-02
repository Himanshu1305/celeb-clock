// All content as structured data — no markdown syntax
// Bold text handled via React rendering, not markdown strings

export const LC_SEO = {
  title: 'Longevity Calculator — How Long Will You Live? | BornClock',
  titleShort: 'Longevity Calculator — How Long Will You Live?',
  description: 'Free longevity calculator using WHO, Harvard and NIH research. 8-factor quiz gives your personalised life expectancy and 90-day action plan. Takes 3 minutes.',
  canonicalUrl: 'https://bornclock.com/longevity-calculator',
  ogTitle: 'Longevity Calculator — How Long Will You Live?',
  ogDescription: 'Science-backed life expectancy based on WHO, Harvard and NIH research. 8 factors. 3 minutes. Free personalised action plan.',
} as const;

// Verify title length
const _titleLengthCheck: '' = LC_SEO.title.length <= 70
  ? '' as ''
  : (() => { throw new Error(`Title too long: ${LC_SEO.title.length} chars`); })();
const _metaLengthCheck: '' = LC_SEO.description.length <= 160
  ? '' as ''
  : (() => { throw new Error(`Meta too long: ${LC_SEO.description.length} chars`); })();
void _titleLengthCheck;
void _metaLengthCheck;

export const LC_SCHEMA = {
  softwareApp: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BornClock Longevity Calculator',
    description: 'Science-backed longevity calculator using WHO data and peer-reviewed research. Calculates personalised life expectancy based on 8 lifestyle and health factors.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser',
    url: 'https://bornclock.com/longevity-calculator',
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
        item: 'https://bornclock.com/longevity-calculator',
      },
    ],
  },

  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How accurate is a longevity calculator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Longevity calculators provide statistical estimates based on population research, not individual predictions. BornClock uses WHO Global Health Observatory data as the baseline and adjusts for 8 lifestyle factors using peer-reviewed research from Harvard, NIH, and the Karolinska Institute. Research shows these 8 factors account for 70-75% of longevity variance. Genetics accounts for the remaining 25-30%.',
        },
      },
      {
        '@type': 'Question',
        name: 'What factors affect life expectancy the most?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most impactful modifiable factors are: smoking (costs up to 10 years), physical exercise (150 min/week reduces all-cause mortality by 31%, WHO 2022), BMI (each 5-unit increase above 25 reduces life expectancy by 0.9 years, Lancet 2016), sleep (under 6 hours linked to 12% higher mortality), and social connections (loneliness has mortality impact equal to smoking 15 cigarettes per day). Genetics accounts for only 25-30% of longevity variance.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I improve my longevity score?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Unlike chronological age, your longevity score reflects modifiable lifestyle factors. Research shows consistent lifestyle changes produce measurable epigenetic improvements within 8-12 weeks. BornClock generates a personalised 90-day action plan based on your top improvement opportunities. The most impactful changes are increasing exercise to 150+ minutes per week, improving sleep to 7-8 hours, and managing chronic conditions.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is BornClock different from other life expectancy calculators?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most life expectancy calculators ask 2-3 questions. BornClock asks 8 questions covering smoking, BMI, chronic conditions, diet, sleep, exercise, stress, social connections, and family history. We use WHO Global Health Observatory baselines specific to your country and gender, adjusted using research from Harvard, NIH, and Karolinska Institute. You also receive a personalised 90-day action plan, biological age estimate, and downloadable 11-page PDF report.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a longevity score?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A longevity score is a composite measure from 0-100 reflecting how your current lifestyle compares to optimal longevity practices. Scores of 80-100 indicate excellent habits. 65-79 means on track. 50-64 is average with meaningful gains available. Below 50 indicates multiple high-impact factors to address. The score tracks improvement over time as you make lifestyle changes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the longevity calculator free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The full longevity calculator quiz and your personalised results are completely free. This includes your life expectancy estimate, longevity score, factor breakdown, biological age estimate, and 90-day action plan. A premium option downloads a detailed 11-page PDF Longevity Blueprint.',
        },
      },
    ],
  },
} as const;

// Each factor is structured data — no markdown, no rendering logic needed
export const LC_FACTORS = [
  {
    id: 1,
    name: 'Tobacco Smoking',
    emoji: '🚬',
    impact: 'Up to 10 years lost',
    impactColor: 'red' as const,
    summary: 'Smoking is the single most powerful modifiable risk factor. Smokers lose an average of 10 years of life expectancy compared to non-smokers.',
    detail: 'Tobacco damages DNA, accelerates cellular ageing, increases cardiovascular risk, and causes 12 types of cancer. Quitting before 40 reduces smoking-related death risk by 90%. Even quitting at 60 adds 3 or more years.',
    source: 'Doll et al., BMJ, 2004; WHO Global Tobacco Report, 2023',
  },
  {
    id: 2,
    name: 'Body Mass Index (BMI)',
    emoji: '⚖️',
    impact: 'Up to 4 years lost above BMI 30',
    impactColor: 'orange' as const,
    summary: 'The optimal longevity BMI range is 21-23. Each 5-unit increase above 25 reduces life expectancy by approximately 0.9 years.',
    detail: 'Analysis of 10.6 million people across 239 studies found BMI operates through inflammation, metabolic disruption, cardiovascular strain, and increased cancer risk. Both underweight and obese ranges increase mortality.',
    source: 'Global BMI Mortality Collaboration, Lancet, 2016',
  },
  {
    id: 3,
    name: 'Chronic Health Conditions',
    emoji: '🩺',
    impact: 'Controlled conditions have far less impact than unmanaged',
    impactColor: 'orange' as const,
    summary: 'Heart disease, diabetes, and hypertension each independently reduce life expectancy. Critically, whether the condition is managed changes the impact dramatically.',
    detail: 'Uncontrolled hypertension increases stroke risk 4-6 times. Well-controlled hypertension reduces this risk by 35-40%. Controlled diabetes has significantly less longevity impact than unmanaged diabetes. The WHO estimates 1.28 billion adults worldwide live with hypertension, and fewer than half have it under control — making management one of the highest-yield longevity interventions available.',
    source: 'GBD 2019 Collaborators, Lancet, 2020; WHO Hypertension Fact Sheet, 2023; ADA Standards of Care, 2023',
  },
  {
    id: 4,
    name: 'Diet Quality',
    emoji: '🥗',
    impact: 'Mediterranean diet reduces cardiovascular events by 30%',
    impactColor: 'green' as const,
    summary: 'Diet quality affects longevity through inflammation, cellular repair, metabolic function, microbiome diversity, and epigenetic expression.',
    detail: 'The PREDIMED study followed 7,447 participants over 5 years and found Mediterranean-style eating reduced major cardiovascular events by 30%. Blue Zones research identifies legume consumption as the most consistent dietary longevity predictor across all centenarian populations globally.',
    source: 'PREDIMED Study, NEJM, 2013; Buettner, Blue Zones, 2023',
  },
  {
    id: 5,
    name: 'Sleep Duration',
    emoji: '😴',
    impact: 'Under 6 hours linked to 12% higher all-cause mortality',
    impactColor: 'orange' as const,
    summary: 'Sleep is when your body executes cellular repair, consolidates immunity, and regulates hormones. Both short and long sleep are associated with increased mortality.',
    detail: 'A meta-analysis of 3 million participants found short sleepers had 12% higher all-cause mortality. The optimal range is 7-8 hours. Sleep quality matters as much as duration — fragmented sleep produces similar mortality risk to short sleep.',
    source: 'Liu et al., Sleep Health, 2021',
  },
  {
    id: 6,
    name: 'Physical Exercise',
    emoji: '🏃',
    impact: '150 min/week reduces all-cause mortality by 31%',
    impactColor: 'green' as const,
    summary: 'Physical activity is the closest thing to a longevity drug. The dose-response curve is non-linear: the steepest benefits come from going from sedentary to lightly active.',
    detail: 'WHO\'s 2022 Physical Activity Guidelines, based on 196 studies, found 150-300 minutes of moderate exercise per week reduces all-cause mortality by 31%. Even 15 minutes per day of walking adds approximately 3 years of life expectancy.',
    source: 'WHO Physical Activity Guidelines, 2022; Wen et al., Lancet, 2011',
  },
  {
    id: 7,
    name: 'Stress Level',
    emoji: '😤',
    impact: 'High stress increases cardiovascular disease risk by 40%',
    impactColor: 'orange' as const,
    summary: 'Chronic high stress elevates cortisol and produces systemic inflammation, directly accelerating epigenetic ageing measurable through DNA methylation markers.',
    detail: 'The AHA found high daily stress increases cardiovascular disease risk by 40%. Even 8 weeks of mindfulness practice produces measurable reductions in cortisol and epigenetic ageing markers, making stress one of the most reversible longevity factors.',
    source: 'Horvath, Nature Genetics, 2013; AHA Scientific Statement, 2021',
  },
  {
    id: 8,
    name: 'Social Connections',
    emoji: '🤝',
    impact: 'Isolation has mortality impact equal to smoking 15 cigarettes per day',
    impactColor: 'green' as const,
    summary: 'Social connection is the most consistently underestimated longevity factor. Strong social relationships increase survival odds by 50%.',
    detail: 'The Harvard Study of Adult Development — spanning 85 years — found that relationship quality at age 50 is a better predictor of healthy ageing at 80 than cholesterol, income, or IQ. Every Blue Zone centenarian population shares strong community bonds as a defining trait.',
    source: 'Holt-Lunstad et al., PLOS Medicine, 2010; Harvard Study of Adult Development',
  },
] as const;

export const LC_COPY = {
  hero: {
    badge: '🔬 WHO + Harvard + NIH Research',
    h1Line1: 'Longevity Calculator —',
    h1Line2: 'How Long Will You Live?',
    subtitle: 'Science-backed life expectancy estimate using 8 factors and WHO country baselines. Takes 3 minutes. Completely free.',
    trust: [
      '8 lifestyle factors assessed',
      'WHO country baselines',
      'Personalised 90-day plan',
      'Biological age estimate',
    ],
  },
  midCTA: {
    heading: 'Ready to find out how long you\'ll live?',
    sub: 'Takes 3 minutes. Based on WHO, Harvard, and NIH research.',
    button: 'Calculate My Life Expectancy →',
  },
  bottomCTA: {
    heading: 'Ready to Calculate Your Life Expectancy?',
    sub: '3 minutes. 8 science-backed factors. Free personalised 90-day action plan.',
    button: 'Start My Free Longevity Calculator →',
    footnote: 'Free · No account required · Results in 3 minutes',
  },
  introParas: [
    'A longevity calculator answers one of the most fundamental questions a person can ask: how long will I live? Not as a morbid exercise, but as a practical tool for making better decisions about health, finances, family, and how you spend your time.',
    'BornClock\'s longevity calculator is built differently from the dozens of simple tools that ask your age and whether you smoke. We use 8 evidence-based factors, WHO Global Health Observatory data specific to your country and gender, and peer-reviewed research from Harvard, NIH, and the Karolinska Institute.',
    'The result is a personalised estimate — not a generic statistic — along with a practical 90-day plan to improve it. The quiz takes 3 minutes. The insights last a lifetime.',
    'The number a longevity calculator produces is not a prophecy. It is a mirror. It reflects the compounding effect of thousands of small daily choices — what you eat, how you move, how you sleep, how you handle stress, and who you spend your life with. Seeing those choices translated into years is often the nudge people need to change one of them.',
    'Because the estimate is built from modifiable factors rather than fixed ones, the same tool that tells you where you stand today can show you where you could stand in a decade. That is the practical value of a good longevity calculator: it turns an abstract worry about mortality into a concrete, prioritised list of things you can actually do something about.',
  ],
  whatIs: {
    heading: 'What Is a Longevity Calculator?',
    paras: [
      'A longevity calculator estimates your personal life expectancy based on your individual lifestyle, health, and genetic factors — rather than simply citing the national average for your age and gender.',
      'The average global life expectancy is approximately 73 years (WHO, 2023). But averages mask enormous variation. A non-smoking, regularly exercising person with strong social connections and optimal sleep may have a statistical life expectancy of 87. A smoker with a BMI above 30, poor sleep, and high stress may have a statistical life expectancy of 61. The difference between these two people is not genetics — it is lifestyle.',
      'Research from the Karolinska Institute\'s landmark twin study (2018) confirmed that genetics accounts for only 25-30% of longevity variance. The remaining 70-75% is determined by lifestyle, environment, and the choices you make every day. A good longevity calculator translates this research into a personalised number — and more importantly, shows you exactly which factors are helping you and which are holding you back.',
      'It helps to distinguish between two numbers that sound similar. Life expectancy is a population statistic: the average age at death for a group of people who share a birth year, country, and sometimes gender. Your personal longevity estimate adjusts that population baseline up or down based on how your individual lifestyle compares to the average. A longevity calculator is the bridge between the two — it starts with the statistical baseline and then applies your specific risk and protective factors.',
      'This distinction matters because national averages are pulled down by circumstances that may not apply to you, and pushed up by advantages you may not share. Two people born the same year in the same city can have estimates that differ by 20 years or more. The calculator exists precisely to move you off the average and toward a figure that reflects your own life.',
    ],
  },
  whyDifferent: {
    heading: 'What Makes BornClock\'s Longevity Calculator Different?',
    paras: [
      'Most online life expectancy calculators ask 2-3 questions: your age, gender, and whether you smoke. They then cite the national average and call it personalised. It is not.',
      'BornClock assesses 8 independent factors that research has established as the primary determinants of longevity. Each factor is adjusted using specific population studies and risk ratios — not rough estimates. The underlying research is transparent. Every factor adjustment cites the specific study that informed it: WHO, Harvard Medical School, NIH, Lancet, Karolinska Institute.',
      'The result is a forecast built specifically for you — including adjustments for your country\'s WHO baseline, your specific health history, and your epigenetic habits. You also receive a Longevity Score from 0-100, a biological age estimate, and a personalised 90-day action plan based on your highest-impact improvement opportunities.',
      'Depth also changes what you can do with the result. A calculator that only knows your age and smoking status can tell you almost nothing actionable. A calculator that assesses diet, sleep, exercise, stress, and social connection can rank your factors from strongest to weakest and tell you which single change would add the most years. That ranking is the difference between a number you glance at once and a plan you return to.',
      'Transparency is the final difference. Many calculators hide their methodology, which makes their numbers impossible to trust or verify. BornClock names the specific study behind every adjustment, so you can read the underlying research yourself. When a tool tells you that 150 minutes of weekly exercise cuts mortality by 31%, you should be able to trace that figure to the WHO guideline and the meta-analysis it came from — and here you can.',
    ],
  },
  longevityScore: {
    heading: 'What Your Longevity Score Means',
    bands: [
      { range: '80-100', label: 'Excellent', desc: 'Your lifestyle habits are working powerfully in your favour. You are in the top 20% for longevity practices. Focus on maintaining these habits and addressing any remaining weak points.' },
      { range: '65-79', label: 'On Track', desc: 'You are above average with real, measurable gains available through targeted improvements. Your biggest opportunities are likely 1-2 specific lifestyle factors.' },
      { range: '50-64', label: 'Average', desc: 'Several lifestyle factors are limiting your forecast. Addressing your top 3 factors could add years to your estimate. 70-75% of longevity is within your control.' },
      { range: 'Below 50', label: 'Needs Attention', desc: 'Multiple high-impact lifestyle factors require attention. Research is clear that lifestyle changes at any age produce measurable improvements.' },
    ],
  },
  howToImprove: {
    heading: 'How to Improve Your Longevity Score',
    paras: [
      'Your longevity score is not fixed. It reflects current lifestyle choices, and research consistently shows that lifestyle changes produce measurable biological improvements within weeks to months.',
      'Start with your highest-impact factor. BornClock identifies your top improvement opportunities ranked by potential years gained. Address the highest-ranked factor first rather than trying to change everything simultaneously. Research shows that focused behaviour change is more sustainable than broad lifestyle overhauls.',
      'The 90-day timeline is real. Epigenetic research demonstrates that DNA methylation patterns — which reflect biological ageing — respond to lifestyle interventions within 8-12 weeks. You are not waiting years to see results.',
      'Retake the quiz every 90 days. BornClock generates a new personalised 90-day plan each time based on your updated inputs. As you improve one factor, the next highest-impact opportunity becomes your new priority. This creates a compound effect over time.',
      'Expect the gains to stack rather than arrive all at once. Adding regular exercise might improve your sleep, which lowers your stress, which in turn makes it easier to maintain the exercise. Longevity factors are interconnected, so a single well-chosen change often pulls several others along with it. This is why starting with your weakest high-impact factor tends to produce outsized results.',
      'Be patient with the biology and impatient with the habit. The measurable epigenetic improvements take 8-12 weeks, but the behaviour that drives them has to start today and repeat. The people who add the most years are rarely those who attempt a dramatic overhaul; they are the ones who change one thing, let it become automatic, and only then reach for the next.',
    ],
  },
  whoShouldUse: {
    heading: 'Who Should Use a Longevity Calculator?',
    paras: [
      'A longevity calculator is useful at almost any age, but for different reasons. In your 20s and 30s, it is a planning tool: the habits you set now compound for decades, and small changes made early return the most years. In your 40s and 50s, it becomes a course-correction tool, surfacing the specific factors most worth addressing before they harden into chronic conditions. In your 60s and beyond, it is a maintenance and motivation tool — research is unambiguous that lifestyle changes add measurable years even when started late.',
      'It is also valuable for people making concrete life decisions. Anyone planning retirement finances, choosing an insurance policy, or thinking through long-term family commitments benefits from a grounded, personalised estimate rather than a vague national average. A realistic sense of your likely lifespan changes how you save, when you plan to stop working, and how you weigh present sacrifices against future years.',
      'Finally, it is for anyone who wants a scoreboard. Abstract advice to "live healthier" rarely changes behaviour, but a number that moves when you improve a habit does. Seeing your estimate rise as you increase your weekly exercise or improve your sleep turns invisible progress into something you can watch, which is one of the most reliable ways to make a new habit stick.',
    ],
  },
  limitations: {
    heading: 'The Honest Limits of Any Longevity Calculator',
    paras: [
      'No calculator can predict an individual life. These tools produce statistical estimates drawn from large populations, and any single person can beat or fall short of their number for reasons no model can see — an unforeseen accident, a rare genetic condition, or simple luck. The right way to read your result is as a probability-weighted average of many possible futures, not a countdown clock.',
      'A calculator is also only as good as its inputs and its research. Self-reported habits are imperfect, genetics beyond family history are not captured, and environmental factors like air quality and healthcare access vary enormously between individuals. BornClock is transparent about these limits on purpose: the estimate is a decision aid and a motivator, not a diagnosis. For any specific medical concern, a qualified clinician who knows your full history remains the right guide.',
    ],
  },
  science: {
    heading: 'The Science Behind the Calculator',
    intro: 'BornClock\'s methodology is transparent and citable. Every factor adjustment is drawn from specific peer-reviewed research:',
    citations: [
      { source: 'WHO Global Health Observatory (2023)', text: 'Country and gender-specific life expectancy baselines. Your forecast begins with the statistical average for someone born in your country and year — not a global generic figure.' },
      { source: 'Harvard Study of Adult Development (85 years)', text: 'Social connection research. The longest-running study of adult life, tracking participants from adolescence through old age across two generations.' },
      { source: 'Karolinska Institute Swedish Twin Registry (2018)', text: 'Genetic vs lifestyle split. Analysis of 44,000 Swedish twins establishing that genetics accounts for 25-30% of longevity variance.' },
      { source: 'WHO Physical Activity Guidelines (2022)', text: 'Exercise mortality impact. Meta-analysis of 196 studies covering 30 million person-years of follow-up.' },
      { source: 'Horvath S., Nature Genetics (2013)', text: 'Epigenetic clock research. Established DNA methylation as the most accurate biological age predictor, and demonstrated lifestyle interventions can shift the epigenetic clock.' },
      { source: 'Global BMI Mortality Collaboration, Lancet (2016)', text: 'BMI impact quantification. Analysis of 10.6 million people across 239 prospective studies in 4 continents.' },
    ],
  },
  relatedTools: [
    { href: '/biological-age-calculator', title: 'Biological Age Calculator', desc: 'Find out if your body is younger or older than your age' },
    { href: '/answers/how-long-will-i-live', title: 'How Long Will I Live?', desc: 'Science-backed life expectancy quiz' },
    { href: '/birthday-report', title: 'Birthday Intelligence Report', desc: 'Full zodiac, numerology, and birthday profile' },
    { href: '/life-expectancy', title: 'Full Life Expectancy Calculator', desc: 'Complete 8-factor assessment with PDF report' },
  ],
} as const;
