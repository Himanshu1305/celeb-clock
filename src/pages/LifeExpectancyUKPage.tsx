import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';
import { leYears, leGap } from '@/data/lifeExpectancyFacts';

export function LifeExpectancyUKPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="uk-le-page"
      country="UK"
      demonym="British"
      path="/life-expectancy-calculator-uk"
      hreflang="en-GB"
      title="Life Expectancy Calculator UK — How Long Will You Live? | BornClock"
      description={`UK life expectancy is ${leYears('United Kingdom')} years (UN WPP 2024). Calculate your personal life expectancy with our free 8-factor UK longevity calculator in 3 minutes.`}
      appName="UK Life Expectancy Calculator"
      avg={leYears('United Kingdom')}
      men={leYears('United Kingdom', 'male')}
      women={leYears('United Kingdom', 'female')}
      source="UN WPP 2024, 2023 estimate"
      regional={[
        { label: 'England', value: '81.3', note: 'the highest life expectancy of the UK nations (ONS 2023)' },
        { label: 'Scotland', value: '78.8', note: 'the lowest, reflecting income and health inequalities (ONS 2023)' },
      ]}
      faqs={[
        {
          q: 'What is the average life expectancy in the UK?',
          a: `The average life expectancy in the UK is ${leYears('United Kingdom')} years at birth, according to the UN World Population Prospects 2024 (estimate for 2023) — ${leYears('United Kingdom', 'male')} years for men and ${leYears('United Kingdom', 'female')} years for women.`,
        },
        {
          q: 'Why do women live longer than men in the UK?',
          a: `UK women outlive men by about ${leGap('United Kingdom')} years (${leYears('United Kingdom', 'female')} vs ${leYears('United Kingdom', 'male')}). The gap is driven by a mix of biological factors and behaviour, including historically higher smoking and alcohol rates and more hazardous occupations among men.`,
        },
        {
          q: 'Which UK region has the highest life expectancy?',
          a: 'In ONS figures, England has the highest life expectancy of the UK nations at 81.3 years, while Scotland has the lowest at 78.8 years. The gap largely reflects differences in income, deprivation, and access to healthcare.',
        },
        {
          q: 'How does UK life expectancy compare to other countries?',
          a: `The UK average of ${leYears('United Kingdom')} years is high globally but below the leaders. Japan sits at ${leYears('Japan')} years and Switzerland at ${leYears('Switzerland')} years, while India is ${leYears('India')} years (UN WPP 2024, 2023 estimates).`,
        },
        {
          q: 'Can I improve my own life expectancy in the UK?',
          a: 'Yes. Research shows genetics accounts for only 25–30% of longevity variance; the rest is modifiable lifestyle. Not smoking, exercising 150+ minutes a week, good sleep, and strong social connections can add many years. Our longevity calculator estimates your personal number.',
        },
      ]}
    />
  );
}

export default LifeExpectancyUKPage;
