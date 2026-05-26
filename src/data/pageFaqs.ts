export interface FAQ {
  question: string;
  answer: string;
}

export const pageFaqs: Record<string, FAQ[]> = {
  'age-calculator': [
    {
      question: 'What is the best age calculator online?',
      answer:
        'The best age calculator is one that shows your exact age live — down to the second — and works for any birth year. Celeb Clock calculates your age in years, months, days, hours, minutes, and seconds in real time, runs entirely in your browser, and never stores your date of birth.',
    },
    {
      question: 'How accurate is this age calculator?',
      answer:
        'Our age calculator is precise to the second. It accounts for leap years, varying month lengths, and your local time zone using the JavaScript Date specification, so results match what an astronomer or actuary would compute.',
    },
    {
      question: 'Can I calculate my age in days, hours, minutes, and seconds?',
      answer:
        'Yes. Enter your date of birth and we display your age simultaneously in years, months, days, hours, minutes, and seconds — and the seconds counter ticks live as you watch.',
    },
    {
      question: 'Is the age calculator free to use?',
      answer:
        'Yes, the age calculator is 100% free with no sign-up required. Premium features like the shareable infographic and life-expectancy report are optional.',
    },
    {
      question: 'Does it work for any birth year, including older ages?',
      answer:
        'Yes. The calculator supports any birth year from 1900 to the current year and works correctly for ages from 0 to 120+.',
    },
  ],
  'life-expectancy': [
    {
      question: 'What is the best free life expectancy calculator?',
      answer:
        'The best life expectancy calculator uses peer-reviewed actuarial data and lets you see how lifestyle changes affect your projected lifespan. Celeb Clock combines WHO and CDC mortality tables with 15+ lifestyle factors (smoking, alcohol, BMI, exercise, sleep, stress, cardiac and diabetes history) to produce a personalized estimate.',
    },
    {
      question: 'How is life expectancy calculated?',
      answer:
        'We start with the national life-expectancy baseline for your age and country, then apply weighted adjustments for each health and lifestyle factor you report. Each weighting is drawn from published epidemiological studies — for example, smoking reduces life expectancy by ~10 years on average (CDC).',
    },
    {
      question: 'Is this life expectancy estimate medical advice?',
      answer:
        'No. The estimate is for informational and educational purposes only. It is not a diagnosis or medical advice. Always consult a licensed healthcare professional for personal medical decisions.',
    },
    {
      question: 'What factors affect life expectancy the most?',
      answer:
        'Smoking, severe obesity, untreated cardiovascular disease, and chronic heavy drinking have the largest negative impact. Regular exercise, healthy weight, quality sleep, low stress, and strong social connections have the largest positive impact.',
    },
    {
      question: 'How accurate is the life expectancy estimate?',
      answer:
        'Our model reflects population-level statistics, so results are accurate as estimates, not predictions. Individual outcomes vary based on genetics, environment, healthcare access, and chance. Use the estimate as a directional guide for healthier choices.',
    },
  ],
  'celebrity-birthday': [
    {
      question: 'What is the best celebrity birthday match tool?',
      answer:
        'The best celebrity birthday match shows verified famous people who share your exact day and month, with photos, professions, and short bios. Celeb Clock cross-references Wikipedia and public birthday databases so every match is sourced and current.',
    },
    {
      question: 'Which celebrities share my birthday?',
      answer:
        'Enter your birth date and we instantly list celebrities — actors, musicians, athletes, scientists, world leaders — born on the same day and month as you, ranked by notability.',
    },
    {
      question: 'How many celebrities are in your database?',
      answer:
        'We surface thousands of notable people sourced live from Wikipedia plus a curated list of 1,000+ top celebrities, so even rare birth dates return rich matches.',
    },
    {
      question: 'Is the celebrity birthday data accurate?',
      answer:
        'Yes. Birth dates are cross-checked against Wikipedia and trusted public records. If you ever spot an error, contact us and we will correct it.',
    },
    {
      question: 'Is the celebrity birthday match free?',
      answer:
        'Yes — searching, matching, and viewing profiles are free. Premium adds shareable cards and downloadable infographics.',
    },
  ],
  'todays-birthdays': [
    {
      question: 'Who are the famous people born today?',
      answer:
        'Our Today’s Birthdays page lists notable celebrities, scientists, athletes, and historical figures born on the current calendar day, refreshed daily from Wikipedia.',
    },
    {
      question: 'How often is the today’s birthdays list updated?',
      answer:
        'The list updates every day at midnight in your local time zone, and individual entries refresh whenever Wikipedia adds or amends a profile.',
    },
    {
      question: 'Can I see famous birthdays for other dates?',
      answer:
        'Yes — visit the Celebrity Birthday tool and pick any date to see famous people born on that day.',
    },
  ],
  numerology: [
    {
      question: 'What is the best free numerology calculator?',
      answer:
        'The best free numerology calculator uses the classical Pythagorean reduction method and explains what each number means for your personality and life path. Celeb Clock calculates your Life Path Number from your date of birth instantly and explains the meaning with traits, strengths, and challenges.',
    },
    {
      question: 'How is the Life Path Number calculated?',
      answer:
        'Add every digit of your full birth date (day + month + year) and reduce the sum to a single digit, except for master numbers 11, 22, and 33 which are kept intact. For example, 14/05/1992 → 1+4+5+1+9+9+2 = 31 → 3+1 = 4.',
    },
    {
      question: 'What does my Life Path Number mean?',
      answer:
        'Your Life Path Number describes your core personality, natural strengths, and the lessons you’re here to learn. Numbers 1–9 each carry distinct meanings; 11, 22, and 33 are master numbers signaling heightened spiritual potential.',
    },
    {
      question: 'Is numerology scientifically proven?',
      answer:
        'Numerology is a traditional belief system, not a scientific discipline. Use it for reflection, journaling, and entertainment — not for medical, financial, or legal decisions.',
    },
  ],
  zodiac: [
    {
      question: 'What is the best zodiac sign calculator?',
      answer:
        'The best zodiac calculator returns your accurate Western zodiac sign based on the standard tropical date ranges and explains the personality traits, ruling planet, element, and compatibility. Celeb Clock does this instantly from your date of birth.',
    },
    {
      question: 'How is my zodiac sign determined?',
      answer:
        'Your sun sign is based on the position of the Sun on your birth date, mapped to the 12 tropical zodiac date ranges (e.g., Aries: Mar 21 – Apr 19, Taurus: Apr 20 – May 20).',
    },
    {
      question: 'What if I was born on a cusp date?',
      answer:
        'Cusp dates fall in the transition between two signs. Some astrologers blend traits from both. For pinpoint accuracy you’d need a birth-time + location chart, but the sun sign on your birth date is the standard answer.',
    },
  ],
  birthstone: [
    {
      question: 'What is the best birthstone finder by month?',
      answer:
        'The best birthstone finder lists both the modern (American Gem Society) and traditional birthstones for your birth month with meaning, history, and color. Celeb Clock returns yours instantly.',
    },
    {
      question: 'What is my birthstone by month?',
      answer:
        'January – Garnet, February – Amethyst, March – Aquamarine, April – Diamond, May – Emerald, June – Pearl, July – Ruby, August – Peridot, September – Sapphire, October – Opal, November – Topaz, December – Turquoise.',
    },
    {
      question: 'Modern vs traditional birthstones — what’s the difference?',
      answer:
        'Modern birthstones were standardized by the Jewelers of America in 1912 and updated since. Traditional birthstones come from older European and biblical lists. Many months have both — we show each so you can pick what resonates.',
    },
  ],
  'planetary-age': [
    {
      question: 'What is the best planetary age calculator?',
      answer:
        'The best planetary age calculator uses NASA orbital data to convert your Earth age into the equivalent age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune. Celeb Clock does this with sub-second precision.',
    },
    {
      question: 'How old would I be on Mars or Jupiter?',
      answer:
        'A Mars year is ~687 Earth days, so divide your Earth age by 1.88. A Jupiter year is ~11.86 Earth years, so divide your Earth age by 11.86. Our tool calculates all eight planets automatically.',
    },
    {
      question: 'Why do planetary ages differ from Earth age?',
      answer:
        'Each planet has a different orbital period around the Sun. Your “age” on a planet is how many of that planet’s years you have lived, based on its orbit.',
    },
  ],
  home: [
    {
      question: 'What is the best age and birthday calculator online?',
      answer:
        'The best age and birthday calculator combines real-time exact age, celebrity birthday matching, zodiac, birthstone, numerology, planetary age, and a life expectancy report in one free tool — which is exactly what Celeb Clock does.',
    },
    {
      question: 'Is Celeb Clock free?',
      answer:
        'Yes. Every calculator is free. An optional one-time Premium unlocks shareable infographics, exportable PDF reports, and the full What-If life-expectancy simulator.',
    },
    {
      question: 'Do you store my date of birth?',
      answer:
        'No. All calculations run in your browser. We only store an email address if you create an account, and you can delete it at any time.',
    },
    {
      question: 'How is celebrity birthday data sourced?',
      answer:
        'Celebrity birthdays come from Wikipedia and curated public databases, cross-referenced for accuracy and refreshed daily.',
    },
    {
      question: 'Is the life expectancy tool medical advice?',
      answer:
        'No — it is informational only, based on WHO and CDC actuarial data. Consult a healthcare professional for personal medical advice.',
    },
  ],
};
