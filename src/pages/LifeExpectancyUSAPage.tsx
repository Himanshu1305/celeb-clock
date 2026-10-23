import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';
import { leYears, leGap } from '@/data/lifeExpectancyFacts';

export function LifeExpectancyUSAPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="usa-le-page"
      country="USA"
      demonym="American"
      path="/life-expectancy-calculator-usa"
      hreflang="en-US"
      title="Life Expectancy Calculator USA — How Long Will You Live? | BornClock"
      description={`USA life expectancy is ${leYears('United States')} years (UN WPP 2024). Calculate your personal life expectancy with our free 8-factor American longevity calculator in 3 minutes.`}
      appName="USA Life Expectancy Calculator"
      avg={leYears('United States')}
      men={leYears('United States', 'male')}
      women={leYears('United States', 'female')}
      source="UN WPP 2024, 2023 estimate"
      regional={[
        { label: 'Hawaii', value: '82.3', note: 'the highest life expectancy of any US state (CDC)' },
        { label: 'Mississippi', value: '74.4', note: 'the lowest, reflecting deep health and income disparities (CDC)' },
      ]}
      faqs={[
        {
          q: 'What is the average life expectancy in the USA?',
          a: `The average life expectancy in the USA is ${leYears('United States')} years at birth, according to the UN World Population Prospects 2024 (estimate for 2023) — ${leYears('United States', 'male')} years for men and ${leYears('United States', 'female')} years for women. That is below most other high-income countries despite high healthcare spending.`,
        },
        {
          q: 'Why is US life expectancy lower than other wealthy countries?',
          a: `At ${leYears('United States')} years the US trails peers like Japan (${leYears('Japan')}) and Switzerland (${leYears('Switzerland')}) despite spending more on healthcare. Contributing factors include higher rates of obesity, drug overdoses, gun deaths, and uneven access to care.`,
        },
        {
          q: 'Which US state has the highest life expectancy?',
          a: 'In CDC state figures, Hawaii has the highest life expectancy of any US state at 82.3 years, while Mississippi has the lowest at 74.4 years. The nearly 8-year gap reflects large differences in income, diet, and access to healthcare.',
        },
        {
          q: 'Why do American women live longer than men?',
          a: `US women outlive men by about ${leGap('United States')} years (${leYears('United States', 'female')} vs ${leYears('United States', 'male')}). The gap is driven by a mix of biological factors and behaviour, including higher rates of smoking, overdose, and violent death among men.`,
        },
        {
          q: 'Can I improve my own life expectancy in the USA?',
          a: 'Yes. Genetics accounts for only 25–30% of longevity variance; the rest is modifiable lifestyle. Not smoking, maintaining a healthy weight, exercising 150+ minutes a week, and strong social ties can add years. Our longevity calculator estimates your personal number.',
        },
      ]}
    />
  );
}

export default LifeExpectancyUSAPage;
