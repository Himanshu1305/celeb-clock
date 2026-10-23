import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';
import { leYears, leGap } from '@/data/lifeExpectancyFacts';

export function LifeExpectancyCanadaPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="canada-le-page"
      country="Canada"
      demonym="Canadian"
      path="/life-expectancy-calculator-canada"
      hreflang="en-CA"
      title="Life Expectancy Calculator Canada — How Long Will You Live? | BornClock"
      description={`Canada life expectancy is ${leYears('Canada')} years (UN WPP 2024). Calculate your personal life expectancy with our free 8-factor Canadian longevity calculator in 3 minutes.`}
      appName="Canada Life Expectancy Calculator"
      avg={leYears('Canada')}
      men={leYears('Canada', 'male')}
      women={leYears('Canada', 'female')}
      source="UN WPP 2024, 2023 estimate"
      faqs={[
        {
          q: 'What is the average life expectancy in Canada?',
          a: `The average life expectancy in Canada is ${leYears('Canada')} years at birth, according to the UN World Population Prospects 2024 (estimate for 2023) — ${leYears('Canada', 'male')} years for men and ${leYears('Canada', 'female')} years for women.`,
        },
        {
          q: 'Why does Canada have a high life expectancy?',
          a: `At ${leYears('Canada')} years Canada is among the top performers globally. Contributing factors include universal healthcare, relatively low smoking rates, high living standards, and good access to preventive care.`,
        },
        {
          q: 'Why do Canadian women live longer than men?',
          a: `Canadian women outlive men by about ${leGap('Canada')} years (${leYears('Canada', 'female')} vs ${leYears('Canada', 'male')}). The gap reflects a combination of biological differences and behavioural factors such as higher smoking, risk-taking, and hazardous work among men.`,
        },
        {
          q: 'How does Canada compare to other countries?',
          a: `Canada's ${leYears('Canada')}-year average is high globally but below the leaders. Japan sits at ${leYears('Japan')} years and Switzerland at ${leYears('Switzerland')} years, while India is ${leYears('India')} years (UN WPP 2024, 2023 estimates).`,
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
