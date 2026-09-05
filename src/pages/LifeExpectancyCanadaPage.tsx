import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';

export function LifeExpectancyCanadaPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="canada-le-page"
      country="Canada"
      demonym="Canadian"
      path="/life-expectancy-calculator-canada"
      hreflang="en-CA"
      title="Life Expectancy Calculator Canada — How Long Will You Live? | BornClock"
      description="Canada life expectancy is 82.0 years (StatsCan 2023). Calculate your personal life expectancy with our free 8-factor Canadian longevity calculator in 3 minutes."
      appName="Canada Life Expectancy Calculator"
      avg="82.0"
      men="80.2"
      women="84.0"
      source="StatsCan 2023"
      rank="17th"
      faqs={[
        {
          q: 'What is the average life expectancy in Canada?',
          a: 'The average life expectancy in Canada is 82.0 years at birth, according to Statistics Canada (StatsCan 2023) — 80.2 years for men and 84.0 years for women. Canada ranks about 17th in the world.',
        },
        {
          q: 'Why does Canada have a high life expectancy?',
          a: 'At 82.0 years Canada is among the top performers globally. Contributing factors include universal healthcare, relatively low smoking rates, high living standards, and good access to preventive care.',
        },
        {
          q: 'Why do Canadian women live longer than men?',
          a: 'Canadian women outlive men by about 3.8 years (84.0 vs 80.2). The gap reflects a combination of biological differences and behavioural factors such as higher smoking, risk-taking, and hazardous work among men.',
        },
        {
          q: 'How does Canada compare to other countries?',
          a: "Canada's 82.0-year average is high globally but below the leaders. Japan sits around 84.3 years and Switzerland around 83.9 years, while India is roughly 70.2 years. Canada ranks about 17th worldwide.",
        },
        {
          q: 'Can I improve my own life expectancy in Canada?',
          a: 'Yes. Genetics accounts for only 25–30% of longevity variance — the rest is modifiable lifestyle. Not smoking, regular exercise, good sleep, managing stress, and strong social connections can add years. Our longevity calculator estimates your personal number.',
        },
      ]}
    />
  );
}

export default LifeExpectancyCanadaPage;
