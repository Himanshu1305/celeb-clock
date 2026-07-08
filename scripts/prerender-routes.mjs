// Prerender routes for BornClock — used by scripts/prerender.mjs and scripts/generate-sitemap.mjs
// All public routes that should be prerendered for SEO.
// Excludes: /report/*, /auth, /admin, /profile, /account

const ZODIAC_SIGNS = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces',
];

const CHINESE_ZODIAC_ANIMALS = [
  'rat','ox','tiger','rabbit','dragon','snake',
  'horse','goat','monkey','rooster','dog','pig',
];

const VEDIC_RASHIS = [
  'mesh','vrishabh','mithun','kark','simha','kanya',
  'tula','vrishchik','dhanu','makar','kumbh','meen',
];

const BIRTHSTONE_MONTHS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
];

const NUMEROLOGY_NUMBERS = [1,2,3,4,5,6,7,8,9,11,22,33];

// Days per month (non-leap for prerender; feb-29 handled by born-on pages)
const MONTH_DAYS = [0,31,28,31,30,31,30,31,31,30,31,30,31];

const BLOG_SLUGS = [
  'calculate-exact-age-seconds-minutes-hours',
  'celebrities-born-on-my-birthday-famous-birthday-twins',
  'zodiac-signs-complete-guide-personality-traits-compatibility',
  'birthstones-by-month-complete-guide-meaning-history',
  'how-to-increase-life-expectancy-science-backed-tips',
  'birthday-traditions-around-the-world-unique-celebrations',
  'why-knowing-exact-age-matters-practical-uses',
  'how-sleep-affects-life-expectancy-complete-guide',
  'best-foods-to-eat-to-live-longer-longevity-diet',
  'how-exercise-affects-life-expectancy-workout-guide',
  'how-stress-affects-health-life-expectancy-management-tips',
  'bmi-weight-life-expectancy-healthy-weight-guide',
  'smoking-life-expectancy-how-to-quit-complete-guide',
  'secrets-of-people-who-live-to-100-centenarian-habits',
  'hidden-cost-chronic-stress-rewires-brain-body',
  'loneliness-deadly-as-smoking-social-connection-longevity',
  '5-minute-morning-routine-add-years-to-life',
  'ultra-processed-foods-shortening-lifespan',
  'walking-vs-running-which-exercise-live-longer',
  'sleep-longevity-science',
  'exercise-longevity-guide',
  'longevity-diet-guide',
  'stress-mental-health-longevity',
  'preventive-health-screening-guide',
  'community-social-longevity',
  'how-long-does-it-take-to-form-a-habit-longevity',
  'life-expectancy-india-complete-guide-2026',
  'zodiac-signs-complete-personality-guide-all-12',
  'what-happens-body-when-you-quit-smoking-timeline',
  'numerology-life-path-numbers-complete-guide',
  'blue-zones-diet-what-centenarians-actually-eat',
  'heart-disease-risk-factors-how-age-affects-heart-health',
  'unique-birthday-gift-ideas-personalised-meaningful-2026',
];

const ANSWER_ROUTES = [
  '/answers/how-long-will-i-live',
  '/answers/what-is-my-biological-age',
  '/answers/who-shares-my-birthday',
  '/answers/how-old-am-i-on-mars',
  '/answers/what-is-my-zodiac-sign',
  '/answers/what-is-my-life-path-number',
  '/answers/how-to-calculate-age',
  '/answers/what-generation-am-i',
  '/answers/how-to-live-longer',
  '/answers/what-is-bmi',
  '/answers/what-is-life-expectancy',
  '/answers/how-does-stress-affect-life-expectancy',
];

const MONTH_NAMES_LOWER = [
  '', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

// Including feb-29 (leap day)
const MONTH_DAYS_BORN_ON = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Generate all valid month/day birthday route combinations
function birthdayDateRoutes() {
  const routes = [];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= MONTH_DAYS[m]; d++) {
      routes.push(`/birthday/${m}/${d}`);
    }
  }
  return routes;
}

// Generate 366 /born-on/:slug routes (jan-1 … dec-31, including feb-29)
function bornOnRoutes() {
  const routes = ['/born-on'];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= MONTH_DAYS_BORN_ON[m]; d++) {
      routes.push(`/born-on/${MONTH_NAMES_LOWER[m]}-${d}`);
    }
  }
  return routes;
}

export const STATIC_ROUTES = [
  '/',
  '/age-calculator',
  '/todays-birthdays',
  '/numerology',
  ...NUMEROLOGY_NUMBERS.map(n => `/numerology/${n}`),
  '/generation',
  '/planetary-age',
  '/upgrade',
  '/zodiac',
  ...ZODIAC_SIGNS.map(s => `/zodiac/${s}`),
  '/birthstone',
  ...BIRTHSTONE_MONTHS.map(m => `/birthstone/${m}`),
  '/life-expectancy',
  '/celebrity-birthday',
  '/birthday',
  ...Array.from({length: 12}, (_, i) => `/birthday/${i + 1}`),
  ...birthdayDateRoutes(),
  '/blog',
  ...BLOG_SLUGS.map(s => `/blog/${s}`),
  '/about',
  '/privacy',
  '/terms',
  '/faq',
  '/contact',
  '/methodology',
  '/editorial-policy',
  '/leaderboard',
  '/biological-age',
  '/country-comparison',
  '/birthday-report',
  '/chinese-zodiac',
  ...CHINESE_ZODIAC_ANIMALS.map(a => `/chinese-zodiac/${a}`),
  '/vedic-zodiac',
  ...VEDIC_RASHIS.map(r => `/vedic-zodiac/${r}`),
  ...ANSWER_ROUTES,
  '/tarot-card-by-birthday',
  '/moon-sign',
  '/name-numerology',
  '/biorhythm',
  '/compatibility',
  '/rashi-ratna',
  ...bornOnRoutes(),
];

// Async function for DB-driven routes (blog posts from Supabase, if any beyond static)
export async function fetchDynamicRoutes() {
  // Blog posts are currently all in static data — no DB query needed
  // If Supabase blog table is used in future, add fetch here
  return [];
}

// Combined route list for prerender and sitemap
export async function getAllRoutes() {
  const dynamic = await fetchDynamicRoutes();
  return [...STATIC_ROUTES, ...dynamic];
}
