// Per-month content for the 12 "Born in {Month}" hub pages
// (/born-in-january … /born-in-december). Self-contained static data —
// no external imports. Content is factual: birth flowers, zodiac spans,
// birthstones and seasonal notes. No astrology predictions or health claims.

export interface MonthHubData {
  month: string;
  slug: string;
  monthNumber: number;
  birthFlowers: { name: string; meaning: string }[];
  flowerLore: string;
  zodiacSpans: { sign: string; slug: string; dates: string }[];
  answerParagraph: string;
  faqs: { question: string; answer: string }[];
  seasonalNote: string;
}

export const MONTH_HUB_DATA: MonthHubData[] = [
  {
    month: 'January',
    slug: 'january',
    monthNumber: 1,
    birthFlowers: [
      { name: 'Carnation', meaning: 'admiration, devotion and enduring love' },
      { name: 'Snowdrop', meaning: 'hope and the promise of renewal' },
    ],
    flowerLore:
      'The word "carnation" likely derives from "coronation," a nod to the flower\'s use in Greek ceremonial garlands, while in Victorian floriography different carnation colours carried distinct messages. Snowdrops, among the first blooms to pierce late-winter frost, became a folk emblem of hope precisely because they flower while snow still lies on the ground.',
    zodiacSpans: [
      { sign: 'Capricorn', slug: 'capricorn', dates: 'December 22 – January 19' },
      { sign: 'Aquarius', slug: 'aquarius', dates: 'January 20 – February 18' },
    ],
    answerParagraph:
      'Being born in January means your birthday falls under either Capricorn (through January 19) or Aquarius (from January 20). The traditional January birthstone is the garnet, historically valued as a deep-red gem carried by travellers. In the Northern Hemisphere, January opens the calendar year in the depth of winter, a season long tied to fresh starts and resolutions.',
    faqs: [
      {
        question: 'What zodiac sign is January?',
        answer:
          'January covers two signs: Capricorn until January 19, and Aquarius from January 20 through the end of the month.',
      },
      {
        question: 'What is the January birthstone?',
        answer:
          'The January birthstone is garnet, most often seen as a deep red gem, though garnets naturally occur in several colours.',
      },
      {
        question: 'What flower represents January?',
        answer:
          'The carnation and the snowdrop are the traditional birth flowers for January.',
      },
      {
        question: 'Who are famous people born in January?',
        answer:
          'Notable January births include Martin Luther King Jr., Isaac Newton (Gregorian date), Betty White and Elvis Presley.',
      },
    ],
    seasonalNote:
      'January is the first month of the year and falls in mid-winter in the Northern Hemisphere and midsummer in the Southern Hemisphere.',
  },
  {
    month: 'February',
    slug: 'february',
    monthNumber: 2,
    birthFlowers: [
      { name: 'Violet', meaning: 'faithfulness, modesty and quiet loyalty' },
      { name: 'Primrose', meaning: 'young love and "I can\'t live without you"' },
    ],
    flowerLore:
      'Violets were prized in ancient Athens as a civic symbol and were later a favourite of Napoleon, who adopted them as a personal emblem. The primrose takes its name from the Latin "prima rosa" ("first rose") because it is one of the earliest flowers of spring, and in Victorian flower language it signalled the giddiness of young love.',
    zodiacSpans: [
      { sign: 'Aquarius', slug: 'aquarius', dates: 'January 20 – February 18' },
      { sign: 'Pisces', slug: 'pisces', dates: 'February 19 – March 20' },
    ],
    answerParagraph:
      'Being born in February means your sign is Aquarius (through February 18) or Pisces (from February 19). The February birthstone is amethyst, a purple quartz once believed by the Greeks to guard against drunkenness. February is the shortest month, gaining a 29th day only in leap years, and in the Northern Hemisphere it carries the year toward the end of winter.',
    faqs: [
      {
        question: 'What zodiac sign is February?',
        answer:
          'February spans Aquarius until February 18 and Pisces from February 19 onward.',
      },
      {
        question: 'What is the February birthstone?',
        answer:
          'The February birthstone is amethyst, a violet-to-purple variety of quartz.',
      },
      {
        question: 'What flower represents February?',
        answer:
          'The violet and the primrose are the traditional February birth flowers.',
      },
      {
        question: 'Why is February the shortest month?',
        answer:
          'February has 28 days (29 in a leap year) as a result of the Roman calendar reforms that gave it the fewest days when the modern month lengths were fixed.',
      },
    ],
    seasonalNote:
      'February is the shortest month of the year, ending late winter in the Northern Hemisphere and late summer in the Southern Hemisphere.',
  },
  {
    month: 'March',
    slug: 'march',
    monthNumber: 3,
    birthFlowers: [
      { name: 'Daffodil', meaning: 'rebirth, new beginnings and unequalled regard' },
    ],
    flowerLore:
      'The daffodil, a member of the Narcissus genus, blooms as winter breaks and has long symbolised renewal; in Wales it is worn on St David\'s Day, which falls on March 1. Victorian floriography held that giving a single daffodil could portend misfortune while a bunch conveyed joy.',
    zodiacSpans: [
      { sign: 'Pisces', slug: 'pisces', dates: 'February 19 – March 20' },
      { sign: 'Aries', slug: 'aries', dates: 'March 21 – April 19' },
    ],
    answerParagraph:
      'Being born in March means your zodiac sign is Pisces (through March 20) or Aries (from March 21). The March birthstone is aquamarine, a blue-green beryl whose name comes from the Latin for "sea water." In the Northern Hemisphere the spring equinox usually falls around March 20, making March the month when the season turns from winter to spring.',
    faqs: [
      {
        question: 'What zodiac sign is March?',
        answer:
          'March covers Pisces until March 20 and Aries from March 21 through the end of the month.',
      },
      {
        question: 'What is the March birthstone?',
        answer:
          'The March birthstone is aquamarine, a pale blue-green beryl; bloodstone is sometimes listed as a traditional alternative.',
      },
      {
        question: 'What flower represents March?',
        answer:
          'The daffodil is the traditional birth flower for March.',
      },
      {
        question: 'Who are famous people born in March?',
        answer:
          'Notable March births include Albert Einstein, Vincent van Gogh, and Aretha Franklin.',
      },
    ],
    seasonalNote:
      'March contains the spring equinox in the Northern Hemisphere (and the autumn equinox in the Southern Hemisphere), marking a turning point in the year.',
  },
  {
    month: 'April',
    slug: 'april',
    monthNumber: 4,
    birthFlowers: [
      { name: 'Daisy', meaning: 'innocence, purity and loyal love' },
      { name: 'Sweet Pea', meaning: 'blissful pleasure and gratitude' },
    ],
    flowerLore:
      'The name "daisy" derives from the Old English "dæges eage," meaning "day\'s eye," because the flower opens at dawn and closes at dusk. The sweet pea was popularised in the 17th century after a Sicilian monk sent its seeds abroad, and it became a hallmark of Edwardian gardens for its fragrance.',
    zodiacSpans: [
      { sign: 'Aries', slug: 'aries', dates: 'March 21 – April 19' },
      { sign: 'Taurus', slug: 'taurus', dates: 'April 20 – May 20' },
    ],
    answerParagraph:
      'Being born in April means your sign is Aries (through April 19) or Taurus (from April 20). The April birthstone is the diamond, the hardest known natural material and a long-standing symbol of durability. In the Northern Hemisphere April is a core spring month associated with rainfall and new growth, captured in the old saying that April showers bring May flowers.',
    faqs: [
      {
        question: 'What zodiac sign is April?',
        answer:
          'April spans Aries until April 19 and Taurus from April 20 onward.',
      },
      {
        question: 'What is the April birthstone?',
        answer:
          'The April birthstone is the diamond, a clear crystalline form of carbon and the hardest natural mineral.',
      },
      {
        question: 'What flower represents April?',
        answer:
          'The daisy and the sweet pea are the traditional April birth flowers.',
      },
      {
        question: 'Who are famous people born in April?',
        answer:
          'Notable April births include Leonardo da Vinci, William Shakespeare (by tradition) and Charlie Chaplin.',
      },
    ],
    seasonalNote:
      'April is a mid-spring month in the Northern Hemisphere and a mid-autumn month in the Southern Hemisphere.',
  },
  {
    month: 'May',
    slug: 'may',
    monthNumber: 5,
    birthFlowers: [
      { name: 'Lily of the Valley', meaning: 'sweetness, humility and a return to happiness' },
      { name: 'Hawthorn', meaning: 'hope and protection' },
    ],
    flowerLore:
      'In France, sprigs of lily of the valley ("muguet") are traditionally exchanged on May 1 as tokens of good luck, a custom dating back centuries. Hawthorn, sometimes called the "May tree," blooms around the start of the month and features in old British folklore surrounding May Day celebrations.',
    zodiacSpans: [
      { sign: 'Taurus', slug: 'taurus', dates: 'April 20 – May 20' },
      { sign: 'Gemini', slug: 'gemini', dates: 'May 21 – June 20' },
    ],
    answerParagraph:
      'Being born in May means your zodiac sign is Taurus (through May 20) or Gemini (from May 21). The May birthstone is the emerald, a green variety of beryl famously associated with ancient Egypt and Cleopatra. In the Northern Hemisphere May is late spring, a peak flowering month, while in the Southern Hemisphere it falls in late autumn.',
    faqs: [
      {
        question: 'What zodiac sign is May?',
        answer:
          'May covers Taurus until May 20 and Gemini from May 21 through the end of the month.',
      },
      {
        question: 'What is the May birthstone?',
        answer:
          'The May birthstone is the emerald, a rich green form of the mineral beryl.',
      },
      {
        question: 'What flower represents May?',
        answer:
          'Lily of the valley and hawthorn are the traditional May birth flowers.',
      },
      {
        question: 'Who are famous people born in May?',
        answer:
          'Notable May births include Queen Victoria, John F. Kennedy and Audrey Hepburn.',
      },
    ],
    seasonalNote:
      'May is a late-spring month in the Northern Hemisphere and a late-autumn month in the Southern Hemisphere.',
  },
  {
    month: 'June',
    slug: 'june',
    monthNumber: 6,
    birthFlowers: [
      { name: 'Rose', meaning: 'love, beauty and honour' },
      { name: 'Honeysuckle', meaning: 'devoted affection and lasting bonds' },
    ],
    flowerLore:
      'The rose has carried symbolic weight for millennia, from Roman festivals to the red and white roses that gave England\'s Wars of the Roses their name. Honeysuckle\'s twining growth made it a Victorian emblem of the bonds of love, and its nectar has long been enjoyed by children who taste it from the flower.',
    zodiacSpans: [
      { sign: 'Gemini', slug: 'gemini', dates: 'May 21 – June 20' },
      { sign: 'Cancer', slug: 'cancer', dates: 'June 21 – July 22' },
    ],
    answerParagraph:
      'Being born in June means your sign is Gemini (through June 20) or Cancer (from June 21). June has several birthstones — pearl, alexandrite and moonstone — with the pearl being the most traditional. In the Northern Hemisphere June holds the summer solstice, the longest day of the year, while in the Southern Hemisphere it brings the shortest.',
    faqs: [
      {
        question: 'What zodiac sign is June?',
        answer:
          'June spans Gemini until June 20 and Cancer from June 21 onward.',
      },
      {
        question: 'What is the June birthstone?',
        answer:
          'June has three birthstones: pearl, alexandrite and moonstone, with the pearl being the most traditional.',
      },
      {
        question: 'What flower represents June?',
        answer:
          'The rose and honeysuckle are the traditional June birth flowers.',
      },
      {
        question: 'Who are famous people born in June?',
        answer:
          'Notable June births include Anne Frank, Marilyn Monroe and Paul McCartney.',
      },
    ],
    seasonalNote:
      'June contains the summer solstice in the Northern Hemisphere (the longest day) and the winter solstice in the Southern Hemisphere.',
  },
  {
    month: 'July',
    slug: 'july',
    monthNumber: 7,
    birthFlowers: [
      { name: 'Larkspur', meaning: 'an open heart and strong attachment' },
      { name: 'Water Lily', meaning: 'purity of heart and serenity' },
    ],
    flowerLore:
      'Larkspur, a form of delphinium, takes its common name from the spur-shaped nectary that resembles a lark\'s claw, and different colours carried varied meanings in Victorian floriography. The water lily has held sacred significance across cultures, notably in ancient Egyptian art where the lotus-like blooms symbolised rebirth and the sun.',
    zodiacSpans: [
      { sign: 'Cancer', slug: 'cancer', dates: 'June 21 – July 22' },
      { sign: 'Leo', slug: 'leo', dates: 'July 23 – August 22' },
    ],
    answerParagraph:
      'Being born in July means your zodiac sign is Cancer (through July 22) or Leo (from July 23). The July birthstone is the ruby, a red variety of corundum historically ranked among the most prized of gems. In the Northern Hemisphere July is typically the height of summer, while in the Southern Hemisphere it sits in the depth of winter.',
    faqs: [
      {
        question: 'What zodiac sign is July?',
        answer:
          'July covers Cancer until July 22 and Leo from July 23 through the end of the month.',
      },
      {
        question: 'What is the July birthstone?',
        answer:
          'The July birthstone is the ruby, a red gem variety of the mineral corundum.',
      },
      {
        question: 'What flower represents July?',
        answer:
          'The larkspur and the water lily are the traditional July birth flowers.',
      },
      {
        question: 'Who are famous people born in July?',
        answer:
          'Notable July births include Nelson Mandela, Frida Kahlo and Ernest Hemingway.',
      },
    ],
    seasonalNote:
      'July falls in high summer in the Northern Hemisphere and mid-winter in the Southern Hemisphere.',
  },
  {
    month: 'August',
    slug: 'august',
    monthNumber: 8,
    birthFlowers: [
      { name: 'Gladiolus', meaning: 'strength of character and sincerity' },
      { name: 'Poppy', meaning: 'remembrance and restful sleep' },
    ],
    flowerLore:
      'The gladiolus takes its name from the Latin "gladius" ("sword"), a reference to its blade-like leaves, and Roman writers linked it to gladiators. The red poppy became an enduring symbol of remembrance after the First World War, inspired by the poem "In Flanders Fields."',
    zodiacSpans: [
      { sign: 'Leo', slug: 'leo', dates: 'July 23 – August 22' },
      { sign: 'Virgo', slug: 'virgo', dates: 'August 23 – September 22' },
    ],
    answerParagraph:
      'Being born in August means your sign is Leo (through August 22) or Virgo (from August 23). The August birthstone is peridot, a yellow-green gem sometimes historically confused with emerald, with spinel added as a modern alternative. In the Northern Hemisphere August is the closing stretch of summer, while in the Southern Hemisphere it marks late winter.',
    faqs: [
      {
        question: 'What zodiac sign is August?',
        answer:
          'August spans Leo until August 22 and Virgo from August 23 onward.',
      },
      {
        question: 'What is the August birthstone?',
        answer:
          'The August birthstone is peridot, a yellow-green gem, with spinel recognised as a modern alternative.',
      },
      {
        question: 'What flower represents August?',
        answer:
          'The gladiolus and the poppy are the traditional August birth flowers.',
      },
      {
        question: 'Who are famous people born in August?',
        answer:
          'Notable August births include Barack Obama, Mother Teresa and Usain Bolt.',
      },
    ],
    seasonalNote:
      'August is a late-summer month in the Northern Hemisphere and a late-winter month in the Southern Hemisphere.',
  },
  {
    month: 'September',
    slug: 'september',
    monthNumber: 9,
    birthFlowers: [
      { name: 'Aster', meaning: 'wisdom, patience and enduring love' },
      { name: 'Morning Glory', meaning: 'affection and the fleeting nature of a single day' },
    ],
    flowerLore:
      'The aster\'s name comes from the Greek word for "star," describing its radiating petals, and the ancient Greeks burned aster leaves believing the smoke drove away trouble. Morning glory blooms open at dawn and fade by afternoon, which made the flower a poetic emblem of a love that is brief but intense.',
    zodiacSpans: [
      { sign: 'Virgo', slug: 'virgo', dates: 'August 23 – September 22' },
      { sign: 'Libra', slug: 'libra', dates: 'September 23 – October 22' },
    ],
    answerParagraph:
      'Being born in September means your zodiac sign is Virgo (through September 22) or Libra (from September 23). The September birthstone is the sapphire, a corundum gem most familiar in deep blue but occurring in many colours. In the Northern Hemisphere September contains the autumn equinox and the start of harvest season, while in the Southern Hemisphere it opens spring.',
    faqs: [
      {
        question: 'What zodiac sign is September?',
        answer:
          'September covers Virgo until September 22 and Libra from September 23 through the end of the month.',
      },
      {
        question: 'What is the September birthstone?',
        answer:
          'The September birthstone is the sapphire, a gem variety of corundum most often prized in blue.',
      },
      {
        question: 'What flower represents September?',
        answer:
          'The aster and the morning glory are the traditional September birth flowers.',
      },
      {
        question: 'Who are famous people born in September?',
        answer:
          'Notable September births include Beyoncé, Freddie Mercury and Agatha Christie.',
      },
    ],
    seasonalNote:
      'September contains the autumn equinox in the Northern Hemisphere (and the spring equinox in the Southern Hemisphere).',
  },
  {
    month: 'October',
    slug: 'october',
    monthNumber: 10,
    birthFlowers: [
      { name: 'Marigold', meaning: 'warmth, creativity and devotion' },
      { name: 'Cosmos', meaning: 'order, harmony and tranquillity' },
    ],
    flowerLore:
      'Marigolds are central to Mexico\'s Día de los Muertos, where their bright petals are believed to guide the spirits of the dead, and the flower\'s English name derives from "Mary\'s gold." The cosmos was named by Spanish priests after the Greek "kosmos," meaning order, for the neat symmetry of its evenly spaced petals.',
    zodiacSpans: [
      { sign: 'Libra', slug: 'libra', dates: 'September 23 – October 22' },
      { sign: 'Scorpio', slug: 'scorpio', dates: 'October 23 – November 21' },
    ],
    answerParagraph:
      'Being born in October means your sign is Libra (through October 22) or Scorpio (from October 23). October has two birthstones — opal, known for its shifting play of colour, and tourmaline, which appears in a wide range of hues. In the Northern Hemisphere October is mid-autumn, associated with falling leaves and Halloween, while in the Southern Hemisphere it is mid-spring.',
    faqs: [
      {
        question: 'What zodiac sign is October?',
        answer:
          'October spans Libra until October 22 and Scorpio from October 23 onward.',
      },
      {
        question: 'What is the October birthstone?',
        answer:
          'October has two birthstones: opal, famed for its colourful play of light, and tourmaline.',
      },
      {
        question: 'What flower represents October?',
        answer:
          'The marigold and the cosmos are the traditional October birth flowers.',
      },
      {
        question: 'Who are famous people born in October?',
        answer:
          'Notable October births include Mahatma Gandhi, John Lennon and Serena Williams.',
      },
    ],
    seasonalNote:
      'October is a mid-autumn month in the Northern Hemisphere and a mid-spring month in the Southern Hemisphere.',
  },
  {
    month: 'November',
    slug: 'november',
    monthNumber: 11,
    birthFlowers: [
      { name: 'Chrysanthemum', meaning: 'friendship, joy and long life' },
    ],
    flowerLore:
      'The chrysanthemum has been cultivated in China for over two thousand years and is so esteemed in Japan that it lends its name to the Imperial Chrysanthemum Throne. In several European traditions, however, the flower is associated with remembrance and is placed on graves, showing how its meaning varies sharply by culture.',
    zodiacSpans: [
      { sign: 'Scorpio', slug: 'scorpio', dates: 'October 23 – November 21' },
      { sign: 'Sagittarius', slug: 'sagittarius', dates: 'November 22 – December 21' },
    ],
    answerParagraph:
      'Being born in November means your zodiac sign is Scorpio (through November 21) or Sagittarius (from November 22). The November birthstone is topaz, often golden in colour, with citrine recognised as a warm second option. In the Northern Hemisphere November is late autumn heading into winter, while in the Southern Hemisphere it is late spring approaching summer.',
    faqs: [
      {
        question: 'What zodiac sign is November?',
        answer:
          'November covers Scorpio until November 21 and Sagittarius from November 22 through the end of the month.',
      },
      {
        question: 'What is the November birthstone?',
        answer:
          'The November birthstones are topaz and citrine, both often seen in warm golden and orange tones.',
      },
      {
        question: 'What flower represents November?',
        answer:
          'The chrysanthemum is the traditional birth flower for November.',
      },
      {
        question: 'Who are famous people born in November?',
        answer:
          'Notable November births include Marie Curie, Winston Churchill and Mark Twain.',
      },
    ],
    seasonalNote:
      'November is a late-autumn month in the Northern Hemisphere and a late-spring month in the Southern Hemisphere.',
  },
  {
    month: 'December',
    slug: 'december',
    monthNumber: 12,
    birthFlowers: [
      { name: 'Narcissus (Paperwhite)', meaning: 'good wishes, faithfulness and respect' },
      { name: 'Holly', meaning: 'protection, defence and domestic happiness' },
    ],
    flowerLore:
      'The paperwhite narcissus flowers indoors in midwinter, making it a popular festive bloom, and the genus name traces to the Greek myth of Narcissus. Holly, with its evergreen leaves and red berries, was used in Roman Saturnalia and later folded into Christmas decoration as a symbol of enduring life through the cold season.',
    zodiacSpans: [
      { sign: 'Sagittarius', slug: 'sagittarius', dates: 'November 22 – December 21' },
      { sign: 'Capricorn', slug: 'capricorn', dates: 'December 22 – January 19' },
    ],
    answerParagraph:
      'Being born in December means your sign is Sagittarius (through December 21) or Capricorn (from December 22). December\'s birthstones include turquoise, tanzanite and zircon, several of them prized blue gems. In the Northern Hemisphere December holds the winter solstice, the shortest day of the year, and the month is marked worldwide by major seasonal holidays.',
    faqs: [
      {
        question: 'What zodiac sign is December?',
        answer:
          'December spans Sagittarius until December 21 and Capricorn from December 22 onward.',
      },
      {
        question: 'What is the December birthstone?',
        answer:
          'December has several birthstones, including turquoise, tanzanite and zircon.',
      },
      {
        question: 'What flower represents December?',
        answer:
          'The narcissus (paperwhite) and holly are the traditional December birth flowers.',
      },
      {
        question: 'Who are famous people born in December?',
        answer:
          'Notable December births include Isaac Newton (Julian date), Walt Disney and Taylor Swift.',
      },
    ],
    seasonalNote:
      'December contains the winter solstice in the Northern Hemisphere (the shortest day) and the summer solstice in the Southern Hemisphere.',
  },
];

export function getMonthHub(slug: string): MonthHubData | undefined {
  const target = slug.toLowerCase();
  return MONTH_HUB_DATA.find((m) => m.slug.toLowerCase() === target);
}
