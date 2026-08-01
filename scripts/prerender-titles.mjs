/**
 * Route → { title, description } map for HTML injection at prerender time.
 * Mirrors the SEO component logic but runs in plain Node, bypassing react-helmet-async timing.
 *
 * All data copied from the TypeScript source files; keep in sync with:
 *   src/data/zodiacData.ts, src/data/numerologyData.ts, src/data/birthstoneData.ts,
 *   src/data/blogPosts.ts, src/services/VedicZodiacExtended.ts, src/pages/*
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Indian born-on facet data (slug → {top3, count}) for /born-on/:slug/india titles.
const INDIA_BORNON_MAP = new Map(
  JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/indiaBornOnDates.json'), 'utf-8'))
    .map(d => [d.slug, d])
);

// ── Zodiac ───────────────────────────────────────────────────────────────────
const ZODIAC = {
  aries:       { title: 'Aries Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Everything about Aries (March 21–April 19) — personality traits, strengths, love life, career, mythology, famous Aries celebrities, and compatibility. Humanized and fully sourced.' },
  taurus:      { title: 'Taurus Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Taurus (April 20–May 20) — personality traits, love life, career, mythology, famous Taurus celebrities, and compatibility. Fully sourced.' },
  gemini:      { title: 'Gemini Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Gemini (May 21–June 20) — personality traits, love life, career, mythology, famous Gemini celebrities, and compatibility. Fully sourced.' },
  cancer:      { title: 'Cancer Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Cancer (June 21–July 22) — personality traits, love life, career, mythology, famous Cancer celebrities, and compatibility. Fully sourced.' },
  leo:         { title: 'Leo Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Leo (July 23–August 22) — personality traits, love life, career, mythology, famous Leo celebrities, and compatibility. Fully sourced.' },
  virgo:       { title: 'Virgo Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Virgo (August 23–September 22) — personality traits, love life, career, mythology, famous Virgo celebrities, and compatibility. Fully sourced.' },
  libra:       { title: 'Libra Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Libra (September 23–October 22) — personality traits, love life, career, mythology, famous Libra celebrities, and compatibility. Fully sourced.' },
  scorpio:     { title: 'Scorpio Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Scorpio (October 23–November 21) — personality traits, love life, career, mythology, famous Scorpio celebrities, and compatibility. Fully sourced.' },
  sagittarius: { title: 'Sagittarius Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Sagittarius (November 22–December 21) — personality traits, love life, career, mythology, famous Sagittarius celebrities, and compatibility. Fully sourced.' },
  capricorn:   { title: 'Capricorn Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Capricorn (December 22–January 19) — personality traits, love life, career, mythology, famous Capricorn celebrities, and compatibility. Fully sourced.' },
  aquarius:    { title: 'Aquarius Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Aquarius (January 20–February 18) — personality traits, love life, career, mythology, famous Aquarius celebrities, and compatibility. Fully sourced.' },
  pisces:      { title: 'Pisces Zodiac Sign — Dates, Traits, Compatibility & History | BornClock', desc: 'Complete guide to Pisces (February 19–March 20) — personality traits, love life, career, mythology, famous Pisces celebrities, and compatibility. Fully sourced.' },
};

// ── Numerology ────────────────────────────────────────────────────────────────
const NUMEROLOGY = {
  1:  { title: 'Life Path Number 1 — The Leader: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 1 — The Leader. Personality, love, career, strengths, challenges, and famous people with verified calculations.' },
  2:  { title: 'Life Path Number 2 — The Peacemaker: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 2 — The Peacemaker. Personality, love, career, and famous people with verified Life Path calculations.' },
  3:  { title: 'Life Path Number 3 — The Creator: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 3 — The Creator. Personality, love, career, and famous people with verified Life Path calculations.' },
  4:  { title: 'Life Path Number 4 — The Builder: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 4 — The Builder. Personality, love, career, and famous people with verified Life Path calculations.' },
  5:  { title: 'Life Path Number 5 — The Freedom Seeker: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 5 — The Freedom Seeker. Personality, love, career, and famous people with verified Life Path calculations.' },
  6:  { title: 'Life Path Number 6 — The Nurturer: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 6 — The Nurturer. Personality, love, career, and famous people with verified Life Path calculations.' },
  7:  { title: 'Life Path Number 7 — The Seeker: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 7 — The Seeker and Philosopher. Personality, love, career, and famous people with verified Life Path calculations.' },
  8:  { title: 'Life Path Number 8 — The Powerhouse: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 8 — The Powerhouse. Personality, love, career, and famous people with verified Life Path calculations.' },
  9:  { title: 'Life Path Number 9 — The Humanitarian: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Numerology Life Path 9 — The Humanitarian. Personality, love, career, and famous people with verified Life Path calculations.' },
  11: { title: 'Master Number 11 — The Illuminator: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Master Number 11 — The Illuminator. Spiritual gifts, challenges, personality, and famous people with verified Life Path 11 calculations.' },
  22: { title: 'Master Number 22 — The Master Builder: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Master Number 22 — The Master Builder. Vision at scale, manifestation, challenges, and famous people with verified Life Path calculations.' },
  33: { title: 'Master Number 33 — The Master Teacher: Meaning, Traits & Famous People | BornClock', desc: 'Complete guide to Master Number 33 — the rarest life path, the Master Teacher. Compassionate service, healing, challenges, and famous people including Einstein.' },
};

// ── Birthstone ────────────────────────────────────────────────────────────────
const BIRTHSTONE = {
  january:   { title: 'January Birthstone — Garnet: History, Meaning & Geology | BornClock', desc: "The complete guide to Garnet, January's birthstone — history spanning 5,000 years, geology, mythology, famous garnets, and care tips. Sourced from GIA and Kunz (1913)." },
  february:  { title: 'February Birthstone — Amethyst: History, Meaning & Geology | BornClock', desc: "Complete guide to Amethyst, February's birthstone — Greek mythology, medieval history, geology, famous amethysts, and care instructions. Sourced from GIA and Kunz (1913)." },
  march:     { title: 'March Birthstone — Aquamarine: History, Meaning & Geology | BornClock', desc: "Complete guide to Aquamarine, March's birthstone — sailor mythology, geology, the Dom Pedro aquamarine, and care tips. Sourced from GIA and Kunz (1913)." },
  april:     { title: 'April Birthstone — Diamond: History, Meaning & Geology | BornClock', desc: "Complete guide to Diamond, April's birthstone — from Golconda mines to the Hope Diamond, geology, mythology, and the 4 Cs. Sourced from GIA." },
  may:       { title: 'May Birthstone — Emerald: History, Meaning & Geology | BornClock', desc: "Complete guide to Emerald, May's birthstone — from Cleopatra's mines to Colombian gems, mythology, geology, and care. Sourced from GIA and Kunz (1913)." },
  june:      { title: "June Birthstone — Pearl, Alexandrite & Moonstone: History & Meaning | BornClock", desc: "Complete guide to June's birthstones — Pearl, Alexandrite, and Moonstone. History, mythology, geology, and care. Sourced from GIA and American Gem Society." },
  july:      { title: 'July Birthstone — Ruby: History, Meaning & Geology | BornClock', desc: "Complete guide to Ruby, July's birthstone — from Mogok's pigeon blood rubies to the Sunrise Ruby, mythology, geology, and care. Sourced from GIA and Kunz (1913)." },
  august:    { title: 'August Birthstone — Peridot, Spinel & Sardonyx: History & Meaning | BornClock', desc: 'Complete guide to August birthstones — Peridot, Spinel, and Sardonyx. Volcanic origins, meteorite connections, mythology, and care. Sourced from GIA.' },
  september: { title: 'September Birthstone — Sapphire: History, Meaning & Geology | BornClock', desc: "Complete guide to Sapphire, September's birthstone — from Kashmir to Princess Diana's ring, mythology, geology, and care. Sourced from GIA and Kunz (1913)." },
  october:   { title: 'October Birthstone — Opal & Tourmaline: History, Meaning & Geology | BornClock', desc: "Complete guide to October's birthstones — Opal and Tourmaline. Aboriginal mythology, Roman legend, geology, and care. Sourced from GIA." },
  november:  { title: 'November Birthstone — Topaz & Citrine: History, Meaning & Geology | BornClock', desc: "Complete guide to November's birthstones — Topaz and Citrine. Imperial Topaz history, Citrine geology, mythology, and care. Sourced from GIA and Kunz (1913)." },
  december:  { title: 'December Birthstone — Tanzanite, Turquoise & Zircon: History & Meaning | BornClock', desc: "Complete guide to December's birthstones — Tanzanite, Turquoise, and Zircon. Maasai legend, Native American history, geology, and care. Sourced from GIA." },
};

// ── Vedic zodiac: slug → { name, english } ───────────────────────────────────
const VEDIC = {
  mesh:      { name: 'Mesha',     english: 'Aries' },
  vrishabh:  { name: 'Vrishabha', english: 'Taurus' },
  mithun:    { name: 'Mithuna',   english: 'Gemini' },
  kark:      { name: 'Karka',     english: 'Cancer' },
  simha:     { name: 'Simha',     english: 'Leo' },
  kanya:     { name: 'Kanya',     english: 'Virgo' },
  tula:      { name: 'Tula',      english: 'Libra' },
  vrishchik: { name: 'Vrishchika',english: 'Scorpio' },
  dhanu:     { name: 'Dhanu',     english: 'Sagittarius' },
  makar:     { name: 'Makara',    english: 'Capricorn' },
  kumbh:     { name: 'Kumbha',    english: 'Aquarius' },
  meen:      { name: 'Meena',     english: 'Pisces' },
};

// ── Blog posts: slug → metaTitle ─────────────────────────────────────────────
const BLOG = {
  'calculate-exact-age-seconds-minutes-hours':                 'Calculate Your Exact Age in Seconds | Free Age Calculator 2025',
  'celebrities-born-on-my-birthday-famous-birthday-twins':     'Celebrities Born on My Birthday | Find Famous Birthday Twins',
  'zodiac-signs-complete-guide-personality-traits-compatibility': 'Zodiac Signs Guide 2025 | Personality Traits & Compatibility',
  'birthstones-by-month-complete-guide-meaning-history':       'Birthstones by Month 2025 | Meanings, Colors & Healing Properties',
  'how-to-increase-life-expectancy-science-backed-tips':       'Increase Life Expectancy | 10 Science-Backed Tips 2025',
  'birthday-traditions-around-the-world-unique-celebrations':  'Birthday Traditions Around the World: What Every Culture Celebrates',
  'why-knowing-exact-age-matters-practical-uses':              'Why Know Your Exact Age? 7 Practical Uses You Never Knew',
  'how-sleep-affects-life-expectancy-complete-guide':          'Sleep & Life Expectancy | How Rest Affects How Long You Live',
  'best-foods-to-eat-to-live-longer-longevity-diet':           'Best Foods to Eat to Live Longer: The Science-Backed Longevity Diet Guide (2026)',
  'how-exercise-affects-life-expectancy-workout-guide':        'Exercise & Life Expectancy | Best Workouts to Live Longer',
  'how-stress-affects-health-life-expectancy-management-tips': 'Stress & Life Expectancy | How Stress Shortens Your Life',
  'bmi-weight-life-expectancy-healthy-weight-guide':           'BMI & Life Expectancy | How Weight Affects How Long You Live',
  'smoking-life-expectancy-how-to-quit-complete-guide':        'Smoking & Life Expectancy | How Smoking Shortens Your Life',
  'secrets-of-people-who-live-to-100-centenarian-habits':      'How to Live to 100 | 10 Centenarian Secrets Revealed',
  'hidden-cost-chronic-stress-rewires-brain-body':             'Chronic Stress Effects on Brain & Body | Science-Backed Guide',
  'loneliness-deadly-as-smoking-social-connection-longevity':  'Loneliness & Mortality Risk | Social Connection Science',
  '5-minute-morning-routine-add-years-to-life':                '5-Minute Morning Routine for Longevity | Science-Backed',
  'ultra-processed-foods-shortening-lifespan':                 'Ultra-Processed Foods & Lifespan | NIH Research Explained',
  'walking-vs-running-which-exercise-live-longer':             'Walking vs Running for Longevity | Research Compared',
  'sleep-longevity-science':                                   'Sleep and Longevity — The Science of How Sleep Adds Years to Your Life | BornClock',
  'exercise-longevity-guide':                                  'Exercise and Longevity — How Movement Adds Years to Your Life | BornClock',
  'longevity-diet-guide':                                      'Longevity Diet Guide — What to Eat to Live Longer | BornClock',
  'stress-mental-health-longevity':                            'Stress, Mental Health and Longevity — How Chronic Stress Accelerates Aging | BornClock',
  'preventive-health-screening-guide':                         'Preventive Health Screenings — The Tests That Could Save Your Life | BornClock',
  'community-social-longevity':                                'Community, Social Bonds and Longevity — Why Relationships Are Your Greatest Health Asset | BornClock',
  'how-long-does-it-take-to-form-a-habit-longevity':           'How Long Does It Take to Form a Habit? Science Says 66 Days',
  'life-expectancy-india-complete-guide-2026':                 'Life Expectancy India 2026: State Data, Gender Gap & How to Beat the Average',
  'zodiac-signs-complete-personality-guide-all-12':            'All 12 Zodiac Signs: Personality, Strengths & Compatibility Guide',
  'what-happens-body-when-you-quit-smoking-timeline':          'What Happens When You Quit Smoking: 20-Minute to 15-Year Timeline',
  'numerology-life-path-numbers-complete-guide':               'Numerology Life Path Numbers 1–9: Meaning, Career & Love Guide',
  'blue-zones-diet-what-centenarians-actually-eat':            'The Blue Zones Diet: What Centenarians Actually Eat Every Day',
  'heart-disease-risk-factors-how-age-affects-heart-health':   'Heart Disease Risk Factors: How Age, Habits and Genetics Determine Your Risk',
  'unique-birthday-gift-ideas-personalised-meaningful-2026':   '30 Unique Birthday Gift Ideas 2026: Personalised & Meaningful',
  // SEO-MAGNET-2 Phase C
  'best-month-to-be-born-what-data-says':                      'Best Month to Be Born? The Data | BornClock',
  'biorhythm-workouts-honest-guide-training-by-cycles':        'Biorhythm Workouts: An Honest Guide | BornClock',
  'born-on-a-national-holiday-birthday-history':               'Born on a National Holiday | BornClock',
  'cycle-syncing-for-men-gender-neutral-version':              'Cycle Syncing for Men | BornClock',
  'how-we-rank-celebrity-birthdays-sitelinks':                 'How We Rank Celebrity Birthdays | BornClock',
  '7-day-energy-forecast-rhythm-awareness':                    'The 7-Day Energy Forecast Explained | BornClock',
};

// ── Answers pages ─────────────────────────────────────────────────────────────
const ANSWERS = {
  'how-long-will-i-live':                  'How Long Will I Live? A Science-Based Answer | BornClock',
  'what-is-my-biological-age':             'What Is Biological Age? How It Differs From Chronological Age | BornClock',
  'who-shares-my-birthday':                'Which Famous People Share My Birthday? | BornClock',
  'how-old-am-i-on-mars':                  'How Old Am I on Mars and Other Planets? | BornClock',
  'what-is-my-zodiac-sign':                'What Is My Zodiac Sign? Western, Vedic and Chinese Explained | BornClock',
  'what-is-my-life-path-number':           'What Is My Life Path Number and What Does It Mean? | BornClock',
  'how-to-calculate-age':                  'How to Calculate Your Exact Age in Years, Months, Days and Seconds | BornClock',
  'what-generation-am-i':                  'What Generation Am I? Gen Z, Millennial, Gen X, Boomer Explained | BornClock',
  'how-to-live-longer':                    'How to Live Longer: What Science Actually Says | BornClock',
  'what-is-bmi':                           'What Is BMI and What Does Your Number Actually Mean? | BornClock',
  'what-is-life-expectancy':               'What Is Life Expectancy and How Is It Calculated? | BornClock',
  'how-does-stress-affect-life-expectancy':'How Does Stress Affect Life Expectancy? The Science Explained | BornClock',
  'how-many-days-until-my-birthday':        'How Many Days Until My Birthday? Count the Exact Days | BornClock',
};

// ── Static pages ──────────────────────────────────────────────────────────────
const STATIC = {
  '/age-calculator':        { title: 'Best Age Calculator Online — Exact Age in Seconds (Free)', desc: 'Free age calculator — find your exact age in years, months, days, hours and seconds. Plus celebrity birthday match, zodiac sign, and life expectancy. Instant, accurate, free.' },
  '/todays-birthdays':      { title: 'Famous Birthdays Today | BornClock', desc: "See which celebrities share today's birthday. Ranked by global recognition — athletes, actors, politicians, musicians. Updated daily at BornClock." },
  '/numerology':            { title: 'Numerology Calculator — Your Life Path Number & Meaning | BornClock', desc: 'Calculate your Numerology Life Path number from your date of birth. Full guides for Life Path 1–9, Master Numbers 11, 22, 33. Meaning, traits, famous people.' },
  '/generation':            { title: 'Which Generation Are You? — Complete Generational Guide | BornClock', desc: 'Find your generation — Baby Boomer, Gen X, Millennial, Gen Z, or Gen Alpha — from your birth year. Characteristics, defining events, and cultural context.' },
  '/planetary-age':         { title: 'Planetary Age Calculator — How Old Are You on Mars, Jupiter & Every Planet? | BornClock', desc: 'Calculate your age on all 8 planets plus the Moon. See how planetary orbital periods compare to life on Earth. Free, instant, accurate.' },
  '/upgrade':               { title: 'Upgrade to BornClock Premium | BornClock', desc: 'Unlock your Birthday Blueprint — personalised 11-section report covering celebrity twins, zodiac, numerology, life path, tarot, and more. Monthly or annual subscription.' },
  '/pricing':               { title: 'Pricing — Free Forever, Premium When You Want More | BornClock', desc: 'BornClock pricing: a free birthday & age toolkit forever, optional Premium for the full longevity suite, and a one-time ₹199 Birthday Blueprint. Premium members get 3 birthday report credits a month with carry-forward.' },
  '/answers':               { title: 'Answers — Science-Backed Answers to Birthday, Age & Longevity Questions | BornClock', desc: 'Straight, sourced answers to the questions people ask about age, birthdays, zodiac, life path, biological age and life expectancy — each with a free tool to try yourself.' },
  '/born-on/india':         { title: 'Indian Celebrities by Birth Date — Born On Any Day | BornClock', desc: 'Browse notable Indians by the day they were born. Pick any date to see the Indian actors, leaders, scientists and legends who share it — 350+ dates covered.' },
  '/zodiac':                { title: 'Zodiac Signs — Dates, Traits, Science & History | BornClock', desc: 'Complete guide to all 12 Western zodiac signs — Aries through Pisces. Dates, personality traits, compatible signs, ruling planets, mythology and more. Fully sourced.' },
  '/birthstone':            { title: 'Birthstone by Month — History, Meaning & Geology | BornClock', desc: 'Find your birthstone by birth month — January (Garnet) through December (Tanzanite). Full history, mythology, geology, and care tips. Sourced from GIA.' },
  '/life-expectancy':       { title: 'Life Expectancy Calculator — How Long Will I Live? Death Clock & Lifespan Test', desc: 'Science-based life expectancy calculator using WHO, CDC, and Harvard longevity research. Get your personalised lifespan estimate and longevity score.' },
  '/celebrity-birthday':    { title: 'Best Celebrity Birthday Match — Who Shares Your Birthday? | BornClock', desc: 'Find which famous people share your birthday. Search 25,000+ celebrities ranked by global recognition — actors, athletes, musicians, world leaders.' },
  '/birthday':              { title: 'Birthday Personality by Date — All 365 Days | BornClock', desc: 'Explore birthday personality profiles for every day of the year. Zodiac sign, life path number, famous people, and personality traits for your exact birthday.' },
  '/blog':                  { title: 'Health & Longevity Blog — Science-Backed Articles | BornClock', desc: 'Science-backed articles on longevity, life expectancy, birthday science, zodiac, and healthy ageing. Written by BornClock editorial team with sourced references.' },
  '/about':                 { title: 'About BornClock — Built in India, Designed for the World | BornClock', desc: 'BornClock is a science-first birthday and longevity platform. Learn about our data sources, methodology, editorial standards, and the team behind the product.' },
  '/privacy':               { title: 'Privacy Policy | BornClock', desc: 'BornClock privacy policy — how we collect, use, and protect your data. GDPR compliant. Updated regularly.' },
  '/terms':                 { title: 'Terms of Service | BornClock', desc: 'BornClock terms of service — your rights and responsibilities when using our platform.' },
  '/faq':                   { title: 'Frequently Asked Questions | BornClock', desc: 'Answers to common questions about BornClock — calculators, birthday reports, subscriptions, data sources, and more.' },
  '/contact':               { title: 'Contact BornClock — Get in Touch', desc: 'Contact the BornClock team — support, editorial corrections, partnership enquiries, or general feedback.' },
  '/how-it-works':          { title: 'How BornClock Works — Tools, Data & Source-Cited Methodology | BornClock', desc: 'How BornClock works: the Birthday Blueprint report, life expectancy calculator, celebrity birthday matching, the Indian celebrities facet and the Answers library — each with its data sources, formulas and citations.' },
  '/editorial-policy':      { title: 'Editorial Policy — Accuracy, Sources & Corrections | BornClock', desc: 'BornClock editorial policy — how we write, source, fact-check, and correct our content. Committed to accuracy and transparency.' },
  '/leaderboard':           { title: 'Longevity Leaderboard — Top Forecasts Worldwide | BornClock', desc: 'See the top life expectancy forecasts on BornClock. Anonymous leaderboard of the highest longevity scores globally.' },
  '/biological-age':        { title: 'Biological Age Calculator — Free Test, 12 WHO Biomarkers | BornClock', desc: 'Free biological age test — no sign-up. Estimate your true (epigenetic) age from 12 science-backed biomarkers: BMI, sleep, exercise, diet, smoking, stress and more. Validated against WHO research.' },
  '/country-comparison':    { title: 'Country Life Expectancy Comparison — How Your Country Affects How Long You Live | BornClock', desc: 'Compare life expectancy across 195 countries. See where your country ranks globally and what factors drive national longevity differences.' },
  '/birthday-report':       { title: 'Birthday Blueprint — The Ultimate Personalised Birthday Gift | BornClock', desc: 'Generate a personalised 11-section Birthday Blueprint — celebrity twins, Western & Vedic zodiac, numerology, tarot, Chinese zodiac, planetary age and more. The perfect birthday gift.' },
  '/chinese-zodiac':        { title: 'Chinese Zodiac Calculator — Find Your Chinese Zodiac Sign | BornClock', desc: 'Find your Chinese Zodiac animal from your birth year — Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, or Pig. Full personality guides.' },
  '/vedic-zodiac':          { title: 'Indian Zodiac (Vedic Rashi) Calculator — Find Your Jyotish Sign | BornClock', desc: 'Calculate your Vedic Rashi (Moon sign) from date of birth. Full guides for all 12 Rashis — Mesha through Meena. Jyotish astrology explained.' },
  '/born-on':               { title: 'Celebrities Born On — Browse by Birthday | BornClock', desc: 'Browse celebrities by birthday month and day. Discover famous people born on every date of the year, ranked by global recognition.' },
  '/born-in':               { title: 'Born in Each Month — Birthstones, Zodiac Signs & Famous Birthdays | BornClock', desc: 'Browse all 12 birth months: the zodiac signs, birthstone and birth flowers of each, plus the famous people born in it. Cultural tradition and celebration — never a prediction.' },
  '/tarot-card-by-birthday':{ title: 'Tarot Card by Birthday — Draw Your Card & Find Your Major Arcana | BornClock', desc: 'Find your personal Major Arcana tarot card from your date of birth. Full card meaning, symbolism, and how it relates to your life path.' },
  '/moon-sign':             { title: 'Moon Sign Calculator — Find Your Vedic & Western Moon Sign | BornClock', desc: 'Calculate your Moon sign from date of birth. Understand how your Moon sign shapes emotions, instincts, and inner life in both Western and Vedic astrology.' },
  '/gift':                  { title: 'Gift a Birthday Blueprint — The Gift That Proves You Know Them | BornClock', desc: 'Anyone can send a gift card. The Birthday Blueprint is a personalised 9-section keepsake built from their birth date — celebrity twins, zodiac, numerology, birthstone and more. Instant delivery.' },
  '/coach':                 { title: 'AI Longevity Coach — Understand Your Life-Expectancy Forecast | BornClock', desc: 'A personal AI longevity coach that explains your life-expectancy forecast and health factors in plain language, with evidence-based next steps. It explains your data — it never diagnoses.' },
  '/name-numerology':       { title: 'Name Numerology Calculator — Expression, Soul Urge & Personality Numbers | BornClock', desc: 'Calculate your Expression Number, Soul Urge, and Personality Number from your full birth name. Complete Pythagorean name numerology guide.' },
  '/biorhythm':             { title: 'Biorhythm Calculator — Your Physical, Emotional & Intellectual Cycles | BornClock', desc: 'Calculate your biorhythm cycles — 23-day physical, 28-day emotional, and 33-day intellectual. See your cycle status for any date.' },
  '/compatibility':         { title: 'Zodiac Compatibility Calculator — How Compatible Are You? | BornClock', desc: 'Calculate zodiac compatibility between any two signs. Western, Vedic, and Chinese compatibility scores with detailed analysis.' },
  '/rashi-ratna':           { title: 'Rashi Ratna — Gemstone by Zodiac Sign (Indian Vedic Birthstones) | BornClock', desc: 'Find your Vedic gemstone (Rashi Ratna) by zodiac sign. Full guides for all 12 Rashis — mythology, benefits, wearing instructions, and care.' },
};

// ── Born-on helpers ───────────────────────────────────────────────────────────
const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_DAYS_BORN_ON = [0,31,29,31,30,31,30,31,31,30,31,30,31];

function getZodiacSign(month, day) {
  const d = month * 100 + day;
  if (d >= 321 && d <= 419) return 'Aries';
  if (d >= 420 && d <= 520) return 'Taurus';
  if (d >= 521 && d <= 620) return 'Gemini';
  if (d >= 621 && d <= 722) return 'Cancer';
  if (d >= 723 && d <= 822) return 'Leo';
  if (d >= 823 && d <= 922) return 'Virgo';
  if (d >= 923 && d <= 1022) return 'Libra';
  if (d >= 1023 && d <= 1121) return 'Scorpio';
  if (d >= 1122 && d <= 1221) return 'Sagittarius';
  if ((d >= 1222) || (d <= 119)) return 'Capricorn';
  if (d >= 120 && d <= 218) return 'Aquarius';
  return 'Pisces';
}

function parseBornOnSlug(slug) {
  // e.g. "july-9" → { month: 7, day: 9, monthName: 'July' }
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  const dayStr = parts[parts.length - 1];
  const monthStr = parts.slice(0, -1).join('-');
  const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
  if (monthIdx < 1) return null;
  const day = parseInt(dayStr, 10);
  if (isNaN(day) || day < 1 || day > MONTH_DAYS_BORN_ON[monthIdx]) return null;
  return { month: monthIdx, day, monthName: MONTH_NAMES[monthIdx] };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Returns { title, description } for a route, or null for '/' (keep default).
 * The description may be a template — born-on pages get celeb names injected
 * by the caller after querying the live DOM.
 */
// Fitness & rhythm pages (Phase B) — exact-match titles (mirror src/data/fitnessPages.ts).
const FITNESS = {
  '/biorhythm-workout-calculator': { title: 'Biorhythm Workout Calculator — A Daily Training Check-In | BornClock', description: 'A free biorhythm workout check-in: enter your birth date to see today’s physical, emotional and mental rhythm plus a 7-day outline. A reflection prompt, not a training prescription.' },
  '/best-day-to-start-a-habit':    { title: 'Best Day to Start a Habit — Timing vs. Consistency | BornClock', description: 'When is the best day to start a new habit? The honest answer is “the next day you’ll actually do it.” See your next rhythm upswing as a gentle nudge, and the real science of habit formation.' },
  '/cycle-syncing-for-men':        { title: 'Cycle Syncing for Men — Rhythm Awareness for Everyone | BornClock', description: 'Cycle syncing isn’t only about the menstrual cycle. Everyone has daily and longer rhythms worth noticing. A plain, honest look at rhythm awareness for men — with a birth-date rhythm check-in.' },
  '/why-am-i-tired-some-days':     { title: 'Why Am I Tired Some Days and Not Others? | BornClock', description: 'Why do some days feel low-energy for no clear reason? An honest look at sleep, circadian rhythm and natural day-to-day variation — plus a birth-date rhythm check-in to notice your own pattern.' },
  '/best-time-to-work-out':        { title: 'Best Time to Work Out — What the Science Actually Says | BornClock', description: 'Morning or evening workouts? The honest answer: the best time is the one you’ll do consistently. A clear look at chronotype, consistency and sleep — with a rhythm check-in alongside.' },
  '/energy-forecast':              { title: 'Energy Forecast — Your 7-Day Rhythm Check-In | BornClock', description: 'When will you have energy this week? A birth-date rhythm check-in that outlines your next 7 days as a gentle awareness prompt — plus the real drivers of weekly energy. Not a prediction.' },
};

export function getTitleForRoute(route) {
  if (route === '/') return null;
  if (FITNESS[route]) return FITNESS[route];

  // /zodiac/:sign
  if (route.startsWith('/zodiac/')) {
    const sign = route.slice(8);
    const z = ZODIAC[sign];
    return z ? { title: z.title, description: z.desc } : null;
  }

  // /numerology/:n
  if (route.startsWith('/numerology/')) {
    const n = parseInt(route.slice(12), 10);
    const z = NUMEROLOGY[n];
    return z ? { title: z.title, description: z.desc } : null;
  }

  // /birthstone/:month
  if (route.startsWith('/birthstone/') && route !== '/birthstone') {
    const month = route.slice(12);
    const z = BIRTHSTONE[month];
    return z ? { title: z.title, description: z.desc } : null;
  }

  // /born-in-:month  (month hub pages)
  if (route.startsWith('/born-in-')) {
    const slug = route.slice(9);
    const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === slug);
    if (idx < 1) return null;
    const monthName = MONTH_NAMES[idx];
    return {
      title: `Born in ${monthName} — Zodiac, Birthstone & Famous Birthdays | BornClock`,
      description: `What does being born in ${monthName} mean? Your ${monthName} zodiac signs, birthstone, birth flowers, famous people born in ${monthName}, and every date in the month.`,
    };
  }

  // /chinese-zodiac/:animal
  if (route.startsWith('/chinese-zodiac/') && route !== '/chinese-zodiac') {
    const slug = route.slice(16);
    const capitalised = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      title: `Year of the ${capitalised} — Chinese Zodiac Sign Guide | BornClock`,
      description: `Complete guide to the ${capitalised} in Chinese Zodiac — personality traits, compatible animals, famous ${capitalised} people, lucky numbers and colours. Full Jyotish guide.`,
    };
  }

  // /vedic-zodiac/:rashi
  if (route.startsWith('/vedic-zodiac/') && route !== '/vedic-zodiac') {
    const slug = route.slice(14);
    const v = VEDIC[slug];
    if (!v) return null;
    return {
      title: `${v.name} Rashi (${v.english}) — Vedic Astrology Guide | BornClock`,
      description: `${v.name} Rashi in Jyotish: personality, compatible signs, lucky gemstone, and Ayurveda connection. Complete Vedic astrology guide for ${v.english} (${v.name}).`,
    };
  }

  // /compatibility/:a/:b  (zodiac pair — real % renders in-body; title stays unique+keyworded)
  {
    const m = route.match(/^\/compatibility\/([a-z]+)\/([a-z]+)$/);
    if (m) {
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
      const a = cap(m[1]), b = cap(m[2]);
      return {
        title: `${a} & ${b} Compatibility — Love, Friendship & Work Match | BornClock`,
        description: `How compatible are ${a} and ${b}? Full zodiac compatibility for love, friendship and work — with match scores, strengths, challenges and relationship advice.`,
      };
    }
  }

  // /born-on/:slug/india  (Indian celebrity facet — must match before the generic born-on handler)
  {
    const m = route.match(/^\/born-on\/([a-z]+-\d+)\/india$/);
    if (m) {
      const entry = INDIA_BORNON_MAP.get(m[1]);
      const parsed = parseBornOnSlug(m[1]);
      if (!entry || !parsed) return null;
      const { monthName, day } = parsed;
      const top = entry.top3 || [];
      const top2 = top.slice(0, 2).join(', ');
      const top3 = top.slice(0, 3).join(', ');
      return {
        title: `Indian Celebrities Born on ${monthName} ${day}${top2 ? ` — ${top2}` : ''} | BornClock`,
        description: top3
          ? `Indian celebrities born on ${monthName} ${day} include ${top3}. ${entry.count} notable Indians — actors, cricketers, leaders, musicians — share this birthday, ranked by global recognition.`
          : `Famous Indian personalities born on ${monthName} ${day}, ranked by global recognition, with ages, professions and birthday facts.`,
      };
    }
  }

  // /born-on/:slug  (NOT the index, NOT the India hub — that has a STATIC entry)
  if (route.startsWith('/born-on/') && route !== '/born-on' && route !== '/born-on/india') {
    const slug = route.slice(9);
    const parsed = parseBornOnSlug(slug);
    if (!parsed) return null;
    const { month, day, monthName } = parsed;
    const zodiac = getZodiacSign(month, day);
    return {
      title: `Born on ${monthName} ${day} — Famous Birthdays | BornClock`,
      // description is a template; caller injects celeb names if available
      description: `Discover celebrities born on ${monthName} ${day} — ${zodiac} sign, birthstone, day-of-year facts, and birthday insights. Ranked by global recognition.`,
      // carry these for the caller to build a richer description
      _month: monthName,
      _day: day,
      _zodiac: zodiac,
    };
  }

  // /blog/:slug
  if (route.startsWith('/blog/') && route !== '/blog') {
    const slug = route.slice(6);
    const t = BLOG[slug];
    return t ? { title: t, description: `Read ${t} on the BornClock Health & Longevity Blog. Science-backed, sourced, updated regularly.` } : null;
  }

  // /birthday/:month (index page for a month)
  if (/^\/birthday\/\d+$/.test(route)) {
    const m = parseInt(route.slice(10), 10); // "/birthday/" is 10 chars; slice(9) left a leading "/" → NaN → empty month
    const monthName = MONTH_NAMES[m] || '';
    return {
      title: `${monthName} Birthdays — Personality, Zodiac & Famous People | BornClock`,
      description: `Birthday personality profiles for every day in ${monthName} — zodiac signs, life path numbers, famous birthdays, and more.`,
    };
  }

  // /birthday/:month/:day
  if (/^\/birthday\/\d+\/\d+$/.test(route)) {
    const parts = route.slice(1).split('/');
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const monthName = MONTH_NAMES[m] || '';
    return {
      title: `${monthName} ${d} Birthday — Personality, Zodiac & Famous People | BornClock`,
      description: `Birthday personality profile for ${monthName} ${d} — zodiac sign, life path number, birthstone, famous people, and compatibility.`,
    };
  }

  // /answers/:slug
  if (route.startsWith('/answers/')) {
    const slug = route.slice(9);
    const t = ANSWERS[slug];
    return t ? { title: t, description: `${t} — answered with science-backed sources at BornClock.` } : null;
  }

  // Static lookup
  const s = STATIC[route];
  return s ? { title: s.title, description: s.desc } : null;
}
