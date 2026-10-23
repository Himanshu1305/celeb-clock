import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';
import { leYears, leGap } from '@/data/lifeExpectancyFacts';

export function LifeExpectancyAustraliaPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="aus-le-page"
      country="Australia"
      demonym="Australian"
      path="/life-expectancy-calculator-australia"
      hreflang="en-AU"
      title="Life Expectancy Calculator Australia — How Long Will You Live? | BornClock"
      description={`Australia life expectancy is ${leYears('Australia')} years (UN WPP 2024). Calculate your personal life expectancy with our free 8-factor Australian longevity calculator in 3 minutes.`}
      appName="Australia Life Expectancy Calculator"
      avg={leYears('Australia')}
      men={leYears('Australia', 'male')}
      women={leYears('Australia', 'female')}
      source="UN WPP 2024, 2023 estimate"
      faqs={[
        {
          q: 'What is the average life expectancy in Australia?',
          a: `The average life expectancy in Australia is ${leYears('Australia')} years at birth, according to the UN World Population Prospects 2024 (estimate for 2023) — ${leYears('Australia', 'male')} years for men and ${leYears('Australia', 'female')} years for women.`,
        },
        {
          q: 'Why does Australia have such a high life expectancy?',
          a: `At ${leYears('Australia')} years, Australia is among the world leaders. Contributing factors include a strong universal healthcare system (Medicare), low smoking rates, high physical activity, and generally good diet and living standards.`,
        },
        {
          q: 'Why do Australian women live longer than men?',
          a: `Australian women outlive men by about ${leGap('Australia')} years (${leYears('Australia', 'female')} vs ${leYears('Australia', 'male')}). This gap reflects a combination of biological differences and behavioural factors such as higher rates of risk-taking, smoking, and hazardous work among men.`,
        },
        {
          q: 'How does Australia compare to other countries?',
          a: `Australia's ${leYears('Australia')}-year average is one of the highest in the world, close to Japan (${leYears('Japan')} years) and Switzerland (${leYears('Switzerland')} years), and well above India (${leYears('India')} years) (UN WPP 2024, 2023 estimates).`,
        },
        {
          q: 'Can I improve my own life expectancy in Australia?',
          a: 'Yes. Genetics accounts for only 25–30% of longevity variance — the rest is modifiable lifestyle. Not smoking, regular exercise, good sleep, managing stress, and strong social connections can add years. Our longevity calculator estimates your personal number.',
        },
      ]}
    />
  );
}

export default LifeExpectancyAustraliaPage;
