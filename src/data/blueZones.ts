/**
 * Blue Zones "Power 9" — the nine shared habits of the world's longest-lived
 * communities, documented by Dan Buettner / the Blue Zones project
 * (bluezones.com/2016/11/power-9) with National Geographic and the
 * Adventist Health, Okinawa Centenarian and Sardinia studies.
 *
 * Growth P1-BLUEZONES-9 (top content gap). Each factor is a distinct page with:
 * what it is, the mechanism, a CITED claim (no invented figures), how to apply,
 * and an honest caveat where the science is contested (notably alcohol).
 */

export interface PowerNineFactor {
  slug: string;
  title: string;
  short: string;          // card label
  regions: string;        // where it's seen
  whatItIs: string;
  mechanism: string;
  claim: string;          // cited, honest
  source: string;         // attribution
  apply: string[];        // 3–4 practical steps
  caveat?: string;        // where the evidence is contested
}

export const POWER_NINE: PowerNineFactor[] = [
  {
    slug: 'move-naturally',
    title: 'Move naturally',
    short: 'Move naturally',
    regions: 'Sardinia, Ikaria, Okinawa',
    whatItIs: 'The longest-lived people don\'t "work out" — they live in environments that nudge them into constant, low-intensity movement: gardens to tend, hills to walk, bread to knead, few labour-saving machines.',
    mechanism: 'Frequent low-intensity activity ("incidental" or non-exercise movement) keeps the cardiovascular system, muscles and metabolism working all day, without the injury and drop-off rates of occasional hard workouts.',
    claim: 'Blue Zones identifies natural, all-day movement — not gym routines — as the shared physical-activity pattern of every longevity hotspot.',
    source: 'Buettner, Blue Zones Power 9 (bluezones.com); National Geographic.',
    apply: [
      'Make movement the default: walk or cycle short trips, take stairs, stand to work when you can.',
      'Keep a garden, or any hobby that keeps you on your feet and using your hands.',
      'Reduce one labour-saving convenience (e.g. park further away) rather than adding a workout you\'ll skip.',
    ],
  },
  {
    slug: 'purpose',
    title: 'Know your purpose',
    short: 'Purpose (ikigai)',
    regions: 'Okinawa (ikigai), Nicoya (plan de vida)',
    whatItIs: 'A clear reason to get up in the morning — the Okinawans call it ikigai, the Nicoyans plan de vida. It is a felt sense that you are needed and that your days matter.',
    mechanism: 'A strong sense of purpose is linked to lower stress hormones, better sleep and more engaged, active days — all of which compound into healthier ageing.',
    claim: 'Research cited by Blue Zones associates a strong sense of purpose with added years of life expectancy versus those who report none.',
    source: 'Buettner, Blue Zones Power 9; purpose-and-mortality research (e.g. Hill & Turiano, 2014, Psychological Science).',
    apply: [
      'Name, in one sentence, who or what needs you right now.',
      'Build one daily activity around that purpose — a skill you\'re growing, a person you help.',
      'Revisit it at each life stage; purpose shifts as roles change.',
    ],
  },
  {
    slug: 'downshift',
    title: 'Downshift stress',
    short: 'Downshift',
    regions: 'All five Blue Zones',
    whatItIs: 'Centenarians feel stress like anyone else, but their days have built-in rituals that release it: a nap, a prayer, a happy hour, ancestor remembrance.',
    mechanism: 'Chronic stress drives sustained inflammation, which underlies most major age-related diseases. Regular, reliable "downshift" rituals interrupt that cycle.',
    claim: 'Blue Zones highlights daily stress-shedding rituals as a shared trait; chronic inflammation from unmanaged stress is a well-established driver of age-related disease.',
    source: 'Buettner, Blue Zones Power 9; inflammation-and-ageing literature.',
    apply: [
      'Install a fixed daily downshift: 10–20 minutes of nap, prayer, breathing or a walk — same time each day.',
      'Protect it like an appointment; the reliability is what matters.',
      'Keep it screen-free.',
    ],
  },
  {
    slug: '80-percent-rule',
    title: 'The 80% rule (Hara hachi bu)',
    short: '80% rule',
    regions: 'Okinawa',
    whatItIs: 'Okinawans say "Hara hachi bu" before meals — a reminder to stop eating when about 80% full, leaving a margin rather than eating to fullness.',
    mechanism: 'Stopping short of full creates a mild, sustained calorie moderation and steadier blood sugar — a pattern associated with longer, healthier lifespans in many studies.',
    claim: 'Blue Zones records the Okinawan "Hara hachi bu" practice of eating to 80% as a shared dietary brake; the smallest meal is eaten in the late afternoon or evening.',
    source: 'Buettner, Blue Zones Power 9; Okinawa Centenarian Study.',
    apply: [
      'Eat slowly and pause before seconds — fullness signals lag ~20 minutes.',
      'Use smaller plates; serve from the kitchen, not the table.',
      'Eat the lightest meal of the day in the early evening.',
    ],
  },
  {
    slug: 'plant-slant',
    title: 'Plant slant',
    short: 'Plant slant',
    regions: 'All five; strongest in Loma Linda & Okinawa',
    whatItIs: 'Diets are overwhelmingly plant-based — beans, greens, whole grains and nuts at the centre; meat eaten rarely, in small portions.',
    mechanism: 'A fibre-rich, legume-heavy, minimally-processed diet supports the gut, blood lipids and weight, and is consistently linked to lower rates of heart disease and some cancers.',
    claim: 'Blue Zones reports beans (fava, black, soy, lentils) as the cornerstone of every longevity diet, with meat eaten on average about five times a month.',
    source: 'Buettner, Blue Zones Power 9; Adventist Health Study (Loma Linda).',
    apply: [
      'Make a cup of beans or lentils a daily habit.',
      'Fill most of the plate with vegetables and whole grains; treat meat as a garnish.',
      'Snack on a handful of nuts rather than processed food.',
    ],
  },
  {
    slug: 'wine-at-5',
    title: 'Wine at 5',
    short: 'Wine at 5',
    regions: 'Sardinia, Ikaria (not Loma Linda)',
    whatItIs: 'In several (not all) Blue Zones, people drink alcohol moderately and regularly — typically 1–2 glasses of wine with food and friends.',
    mechanism: 'Blue Zones frames the benefit as mostly social and dietary context (with food, with friends) rather than the alcohol itself.',
    claim: 'Blue Zones observes moderate, social wine drinking in some longevity regions — but notably NOT in Loma Linda, whose Adventists abstain and are among the longest-lived.',
    source: 'Buettner, Blue Zones Power 9.',
    apply: [
      'If you don\'t drink, this is not a reason to start.',
      'If you do, keep it moderate, with food and company — never alone or to cope.',
      'Prioritise the social ritual, which the other Power 9 habits deliver without alcohol.',
    ],
    caveat: 'Be careful with this one. Recent reviews — including the WHO (2023) — conclude there is no completely safe level of alcohol, and large studies question earlier "moderate drinking is protective" claims. Loma Linda\'s abstaining Adventists show the longevity benefits are achievable with zero alcohol. Treat "wine at 5" as the weakest, most contested Power 9 habit.',
  },
  {
    slug: 'belong',
    title: 'Belong (faith community)',
    short: 'Belong',
    regions: 'All five Blue Zones',
    whatItIs: 'Nearly all centenarians interviewed belonged to a faith-based community and attended regularly — the denomination mattered less than the belonging.',
    mechanism: 'Regular attendance provides routine, a downshift ritual, social support and a shared sense of meaning — several Power 9 habits bundled together.',
    claim: 'Blue Zones cites research associating regular attendance at faith-based services with a meaningfully longer life expectancy than non-attendance.',
    source: 'Buettner, Blue Zones Power 9; religion-and-longevity research.',
    apply: [
      'Join a community that meets regularly around shared values — faith-based or secular.',
      'Attend consistently; the routine and belonging are the active ingredients.',
      'Let it be a source of service, not just attendance.',
    ],
  },
  {
    slug: 'loved-ones-first',
    title: 'Loved ones first',
    short: 'Loved ones first',
    regions: 'All five Blue Zones',
    whatItIs: 'Successful centenarians put family first: ageing parents and grandparents kept close, a committed life partner, and time invested in children.',
    mechanism: 'Close family lowers disease and mortality risk across the lifespan — through care, purpose, lower stress and healthier shared habits.',
    claim: 'Blue Zones reports that keeping ageing parents nearby, committing to a life partner, and investing in children are shared traits of the longest-lived families.',
    source: 'Buettner, Blue Zones Power 9.',
    apply: [
      'Keep ageing parents and grandparents close and involved.',
      'Invest in a committed partnership and in time with children.',
      'Make family meals and rituals a protected, regular fixture.',
    ],
  },
  {
    slug: 'right-tribe',
    title: 'Right tribe',
    short: 'Right tribe',
    regions: 'Okinawa (moai), all five',
    whatItIs: 'The world\'s longest-lived people chose — or were born into — social circles that support healthy behaviours. Okinawans form "moais": groups of friends committed to each other for life.',
    mechanism: 'Behaviours are contagious: the Framingham studies showed smoking, obesity and even happiness spread through social networks. The right circle makes the healthy choice the default.',
    claim: 'Blue Zones highlights lifelong supportive social circles (the Okinawan moai) as a Power 9 habit; network research shows health behaviours spread socially.',
    source: 'Buettner, Blue Zones Power 9; Christakis & Fowler, Framingham social-network studies.',
    apply: [
      'Audit your closest circle: do they support the habits you want?',
      'Spend more time with a few people who move, eat and live well.',
      'Build or join a small group that meets regularly — your own moai.',
    ],
  },
];

export function powerNineBySlug(slug: string): PowerNineFactor | undefined {
  return POWER_NINE.find(f => f.slug === slug);
}

export const POWER_NINE_SLUGS = POWER_NINE.map(f => f.slug);
