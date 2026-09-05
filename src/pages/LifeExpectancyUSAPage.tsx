import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';

export function LifeExpectancyUSAPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="usa-le-page"
      country="USA"
      demonym="American"
      path="/life-expectancy-calculator-usa"
      hreflang="en-US"
      title="Life Expectancy Calculator USA — How Long Will You Live? | BornClock"
      description="USA life expectancy is 79.1 years (CDC 2023). Calculate your personal life expectancy with our free 8-factor American longevity calculator in 3 minutes."
      appName="USA Life Expectancy Calculator"
      avg="79.1"
      men="76.4"
      women="81.3"
      source="CDC 2023"
      rank="40th"
      regional={[
        { label: 'Hawaii', value: '82.3', note: 'the highest life expectancy of any US state' },
        { label: 'Mississippi', value: '74.4', note: 'the lowest, reflecting deep health and income disparities' },
      ]}
      faqs={[
        {
          q: 'What is the average life expectancy in the USA?',
          a: 'The average life expectancy in the USA is 79.1 years at birth, according to the CDC (2023) — 76.4 years for men and 81.3 years for women. The US ranks about 40th in the world despite high healthcare spending.',
        },
        {
          q: 'Why is US life expectancy lower than other wealthy countries?',
          a: 'At 79.1 years the US trails peers like Japan (84.3) and Switzerland (83.9) despite spending more on healthcare. Contributing factors include higher rates of obesity, drug overdoses, gun deaths, and uneven access to care.',
        },
        {
          q: 'Which US state has the highest life expectancy?',
          a: 'Hawaii has the highest life expectancy of any US state at 82.3 years, while Mississippi has the lowest at 74.4 years. The nearly 8-year gap reflects large differences in income, diet, and access to healthcare.',
        },
        {
          q: 'Why do American women live longer than men?',
          a: 'US women outlive men by about 4.9 years (81.3 vs 76.4). The gap is driven by a mix of biological factors and behaviour, including higher rates of smoking, overdose, and violent death among men.',
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
