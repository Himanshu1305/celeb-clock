import { LifeExpectancyCountryTemplate } from './LifeExpectancyCountryTemplate';

export function LifeExpectancyUKPage() {
  return (
    <LifeExpectancyCountryTemplate
      testId="uk-le-page"
      country="UK"
      demonym="British"
      path="/life-expectancy-calculator-uk"
      hreflang="en-GB"
      title="Life Expectancy Calculator UK — How Long Will You Live? | BornClock"
      description="UK life expectancy is 81.1 years (ONS 2023). Calculate your personal life expectancy with our free 8-factor UK longevity calculator in 3 minutes."
      appName="UK Life Expectancy Calculator"
      avg="81.1"
      men="79.4"
      women="83.1"
      source="ONS 2023"
      rank="29th"
      regional={[
        { label: 'England', value: '81.3', note: 'the highest life expectancy of the UK nations' },
        { label: 'Scotland', value: '78.8', note: 'the lowest, reflecting income and health inequalities' },
      ]}
      faqs={[
        {
          q: 'What is the average life expectancy in the UK?',
          a: 'The average life expectancy in the UK is 81.1 years at birth, according to the Office for National Statistics (ONS 2023) — 79.4 years for men and 83.1 years for women. This places the UK 29th in the world.',
        },
        {
          q: 'Why do women live longer than men in the UK?',
          a: 'UK women outlive men by about 3.7 years (83.1 vs 79.4). The gap is driven by a mix of biological factors and behaviour, including historically higher smoking and alcohol rates and more hazardous occupations among men.',
        },
        {
          q: 'Which UK region has the highest life expectancy?',
          a: 'England has the highest life expectancy of the UK nations at 81.3 years, while Scotland has the lowest at 78.8 years. The gap largely reflects differences in income, deprivation, and access to healthcare.',
        },
        {
          q: 'How does UK life expectancy compare to other countries?',
          a: 'The UK average of 81.1 years is high globally but below the leaders. Japan sits around 84.3 years and Switzerland around 83.9 years, while India is roughly 70.2 years. The UK ranks about 29th worldwide.',
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
