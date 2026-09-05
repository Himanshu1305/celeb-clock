import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';

export function LifeExpectancyAustraliaPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="aus-le-page"
      country="Australia"
      demonym="Australian"
      path="/life-expectancy-calculator-australia"
      hreflang="en-AU"
      title="Life Expectancy Calculator Australia — How Long Will You Live? | BornClock"
      description="Australia life expectancy is 83.4 years (ABS 2022). Calculate your personal life expectancy with our free 8-factor Australian longevity calculator in 3 minutes."
      appName="Australia Life Expectancy Calculator"
      avg="83.4"
      men="81.3"
      women="85.4"
      source="ABS 2022"
      rank="6th"
      faqs={[
        {
          q: 'What is the average life expectancy in Australia?',
          a: 'The average life expectancy in Australia is 83.4 years at birth, according to the Australian Bureau of Statistics (ABS 2022) — 81.3 years for men and 85.4 years for women. Australia ranks 6th in the world.',
        },
        {
          q: 'Why does Australia have such a high life expectancy?',
          a: 'At 83.4 years, Australia is among the world leaders. Contributing factors include a strong universal healthcare system (Medicare), low smoking rates, high physical activity, and generally good diet and living standards.',
        },
        {
          q: 'Why do Australian women live longer than men?',
          a: 'Australian women outlive men by about 4.1 years (85.4 vs 81.3). This gap reflects a combination of biological differences and behavioural factors such as higher rates of risk-taking, smoking, and hazardous work among men.',
        },
        {
          q: 'How does Australia compare to other countries?',
          a: "Australia's 83.4-year average is one of the highest in the world, close to Japan (around 84.3 years) and Switzerland (around 83.9 years), and well above India (roughly 70.2 years). Australia ranks about 6th globally.",
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
