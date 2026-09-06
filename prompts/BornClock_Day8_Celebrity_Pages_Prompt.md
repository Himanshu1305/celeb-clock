# BornClock Day 8 — 598 Celebrity Pages + Hubs
## Claude Code Prompt — Copy entire contents below this line into Claude Code

---

You have full permission to make all changes. Never ask for approval. Fix all TypeScript errors automatically. Work on develop branch only. Execute all phases sequentially without stopping. Each phase commits separately after its tests pass. Do not proceed to the next phase until the current phase tests are green. If a phase fails, fix all errors and retest before committing and moving on.

**Goal:** Create 598 individual Indian celebrity pages + 6 category hub pages + 1 celebrity index page. Add discovery via Explore dropdown, homepage featured section, born-on bidirectional links, and footer. Full SEO/AEO/GEO with Person + FAQPage + BreadcrumbList schema. Zero hallucination — every fact from database or calculated from DOB. Year-only DOB celebrities must NEVER show January 1 as a fake birthday.

**Auto-commit rule:** After every phase completes with green tests, run `git add -A && git commit -m "[phase message]"` before starting the next phase. Never commit broken code.

---

## PHASE 1 — READ EVERYTHING. PRINT ALL OUTPUT. NO CODE YET.

```bash
cd ~/Development/celeb-clock

# 1. Read complete celebrity data — understand exact shape
cat src/data/indianCelebrities.ts | head -80

# 2. Count total celebrities
grep -c "name:" src/data/indianCelebrities.ts

# 3. Find exact interface/type definition
grep -n "interface\|type.*Celeb\|export.*type\|export.*interface" \
  src/data/indianCelebrities.ts \
  src/services/IndianCelebrityService.ts 2>/dev/null | head -20

# 4. Print one complete celebrity entry
python3 -c "
import re
with open('src/data/indianCelebrities.ts') as f:
    content = f.read()
objects = re.findall(r'\{[^{}]+\}', content)[:3]
for o in objects:
    print(o)
    print('---')
"

# 5. Find DOB field names — critical for year-only vs full date
echo '=== DOB field names ==='
grep -E "birth_year|birthYear|dob|date_of_birth|birth_date|born_on" \
  src/data/indianCelebrities.ts | head -10

echo '=== Count with full date ==='
grep -c "dob\|date_of_birth\|birth_date" src/data/indianCelebrities.ts

echo '=== Count with year only ==='
grep -c "birth_year\|birthYear" src/data/indianCelebrities.ts

# 6. Find available categories with counts
grep -oE '"category":\s*"[^"]*"' src/data/indianCelebrities.ts | \
  sort | uniq -c | sort -rn | head -20

# 7. Check birth_place availability
grep -c "birth_place\|birthPlace\|place_of_birth" src/data/indianCelebrities.ts

# 8. Confirm routing pattern from Days 3-5
grep -n "biological-age-calculator\|longevity-calculator" src/App.tsx | head -5

# 9. Confirm STATIC_ROUTES
grep -n "STATIC_ROUTES\|biological-age-calculator" \
  scripts/prerender-routes.mjs | head -5

# 10. Confirm getTitleForRoute shape
grep -n "biological-age-calculator" scripts/prerender-titles.mjs | head -5

# 11. Find Explore nav component
grep -rn "Explore\|NavItem\|Dropdown" \
  src/components/ --include="*.tsx" | grep -i "explore\|nav\|menu" | head -10
find src/components -name "*Nav*" -o -name "*Header*" -o -name "*Menu*" 2>/dev/null

# 12. Find homepage tool card section
grep -n "longevity-calculator\|biological-age-calculator\|tool.*card" \
  src/pages/Index.tsx 2>/dev/null | head -20

# 13. Find footer component
find src -name "*Footer*" -o -name "*footer*" 2>/dev/null | grep -v node_modules | head -5

# 14. Find born-on page celebrity rendering
grep -n "name\|celebrity\|celeb\|Link\|to=" \
  src/pages/BornOnDayIndia.tsx | head -20

# 15. Confirm SEO component props
grep -A 8 "<SEO" src/pages/BiologicalAgeCalculatorPage.tsx | head -12

# 16. List existing utilities
ls src/utils/

# 17. Baseline tests — must pass before starting
npx vitest run 2>&1 | tail -5
npx playwright test --reporter=list 2>&1 | tail -5
```

Print this complete mapping before writing any code:

```
════════════════════════════════════════════════════════════
PHASE 1 MANDATORY MAPPING
════════════════════════════════════════════════════════════
Total celebrity count:               [exact number]
Data fields (all):                   [list every field with type]
DOB situation:
  Has full date (day+month+year):    [X] celebrities
  Has year only:                     [X] celebrities
  Field name for full date:          [e.g. dob / date_of_birth]
  Field name for year:               [e.g. birth_year / birthYear]
  Field name for birth_place:        [exact / NOT PRESENT]
Sample celebrity object:             [paste one complete entry]
Categories found:                    [list all with counts]
Router pattern:                      [exact from App.tsx]
STATIC_ROUTES location:              [file:line]
getTitleForRoute shape:              [{title,desc} confirmed]
SEO component props:                 [exact — paste <SEO block]
Explore nav file:                    [exact path]
Explore nav current items:           [list]
Homepage tool card section:          [line number]
Footer file:                         [exact path]
Born-on celebrity render:            [how names display now]
Baseline unit tests:                 [X PASSING]
Baseline E2E tests:                  [Y PASSING]
════════════════════════════════════════════════════════════
```

**STOP. No code until baseline is PASSING and mapping is complete.**

---

## PHASE 2 — CREATE UTILITY FUNCTIONS

Create `src/utils/celebrityUtils.ts`:

```typescript
// IMPORTANT: Adapt ALL field names to match Phase 1 mapping exactly

export interface CelebrityDOB {
  day: number;
  month: number;
  year: number;
  isFullDate: boolean; // true = day+month+year known; false = year only
}

/**
 * Parses DOB from a celebrity record.
 * CRITICAL: Returns isFullDate=false for year-only entries.
 * NEVER uses January 1 as a placeholder birthday.
 */
export function parseCelebrityDOB(celeb: Record<string, unknown>): CelebrityDOB | null {
  // Try full date first — adapt field names from Phase 1 mapping
  const fullDateField = celeb.dob || celeb.date_of_birth || celeb.birth_date;
  if (fullDateField && typeof fullDateField === 'string') {
    const parts = fullDateField.split('-').map(Number);
    if (parts.length === 3 && parts[0] > 1000 && parts[1] >= 1 && parts[2] >= 1) {
      return { year: parts[0], month: parts[1], day: parts[2], isFullDate: true };
    }
  }
  // Try year only — adapt field name from Phase 1 mapping
  const yearOnly = celeb.birth_year || celeb.birthYear;
  if (yearOnly) {
    return { year: Number(yearOnly), month: 0, day: 0, isFullDate: false };
  }
  return null;
}

/**
 * Formats DOB for display.
 * NEVER shows January 1 for year-only entries.
 */
export function formatDOBDisplay(dob: CelebrityDOB | null): string {
  if (!dob) return 'Information not available';
  if (!dob.isFullDate) return `${dob.year} (exact date not available)`;
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  return `${months[dob.month - 1]} ${dob.day}, ${dob.year}`;
}

/**
 * Generates URL-safe slug from celebrity name.
 * Handles: apostrophes, dots, special characters, collisions.
 */
export function generateCelebritySlug(
  name: string,
  birthYear?: number,
  existingSlugs?: Set<string>
): string {
  const base = name
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!base) return `celebrity-${birthYear || 'unknown'}`;
  if (!existingSlugs || !existingSlugs.has(base)) return base;

  const withYear = birthYear ? `${base}-${birthYear}` : `${base}-2`;
  if (!existingSlugs.has(withYear)) return withYear;

  let counter = 2;
  while (existingSlugs.has(`${base}-${counter}`)) counter++;
  return `${base}-${counter}`;
}

/**
 * Generates slug map for ALL celebrities with collision detection.
 */
export function generateAllSlugs(
  celebrities: Record<string, unknown>[]
): Map<string, Record<string, unknown>> {
  const slugMap = new Map<string, Record<string, unknown>>();
  const usedSlugs = new Set<string>();
  celebrities.forEach(celeb => {
    const name = String(celeb.name || '');
    const birthYear = Number(celeb.birth_year || celeb.birthYear || 0) || undefined;
    const slug = generateCelebritySlug(name, birthYear, usedSlugs);
    slugMap.set(slug, celeb);
    usedSlugs.add(slug);
  });
  return slugMap;
}

/**
 * Maps actual category values from Phase 1 to hub config.
 * UPDATE KEYS to match exact category strings from Phase 1 grep output.
 */
export const CATEGORY_CONFIG: Record<string, {
  hubSlug: string; label: string; h1: string; desc: string;
}> = {
  'Actor':      { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Profiles', desc: 'Birthday profiles for Bollywood actors.' },
  'Actress':    { hubSlug: 'bollywood', label: 'Bollywood', h1: 'Bollywood Celebrity Profiles', desc: 'Birthday profiles for Bollywood actresses.' },
  'Cricket':    { hubSlug: 'cricket',   label: 'Cricket',   h1: 'Indian Cricket Celebrity Profiles', desc: 'Birthday profiles for Indian cricketers.' },
  'Cricketer':  { hubSlug: 'cricket',   label: 'Cricket',   h1: 'Indian Cricket Celebrity Profiles', desc: 'Birthday profiles for Indian cricketers.' },
  'Politician': { hubSlug: 'politics',  label: 'Politics',  h1: 'Indian Political Celebrity Profiles', desc: 'Birthday profiles for Indian politicians.' },
  'Business':   { hubSlug: 'business',  label: 'Business',  h1: 'Indian Business Leader Profiles', desc: 'Birthday profiles for Indian business leaders.' },
  'Music':      { hubSlug: 'music',     label: 'Music',     h1: 'Indian Music Celebrity Profiles', desc: 'Birthday profiles for Indian musicians.' },
  'Singer':     { hubSlug: 'music',     label: 'Music',     h1: 'Indian Music Celebrity Profiles', desc: 'Birthday profiles for Indian musicians.' },
  'Sports':     { hubSlug: 'sports',    label: 'Sports',    h1: 'Indian Sports Celebrity Profiles', desc: 'Birthday profiles for Indian sports personalities.' },
  'Athlete':    { hubSlug: 'sports',    label: 'Sports',    h1: 'Indian Sports Celebrity Profiles', desc: 'Birthday profiles for Indian sports personalities.' },
  // ADD remaining categories from Phase 1 here before proceeding
};

export const HUB_SLUGS = ['bollywood', 'cricket', 'politics', 'business', 'music', 'sports'];

export function getCategoryHubSlug(category: string): string {
  return CATEGORY_CONFIG[category]?.hubSlug || category.toLowerCase().replace(/\s+/g, '-');
}

export function getHubConfig(hubSlug: string) {
  const entry = Object.values(CATEGORY_CONFIG).find(c => c.hubSlug === hubSlug);
  return entry || { hubSlug, label: hubSlug, h1: `${hubSlug} Celebrities`, desc: '' };
}

export function generateCelebrityTitle(name: string): string {
  const options = [
    `${name} — Birthday, Age, Zodiac & Life Profile | BornClock`,
    `${name} Birthday, Age & Zodiac | BornClock`,
    `${name} | BornClock`,
  ];
  return options.find(t => t.length <= 70) || options[2].slice(0, 70);
}

export function generateCelebrityMeta(
  name: string,
  dob: CelebrityDOB | null,
  zodiacSign: string,
  rashi: string,
  lifePath: number | null
): string {
  if (!dob) {
    const fallback = `${name} — birthday profile, zodiac sign, and life path number on BornClock.`;
    return fallback.length <= 160 ? fallback : fallback.slice(0, 157) + '...';
  }
  const ageStr = dob.isFullDate
    ? `${new Date().getFullYear() - dob.year} years old`
    : `born in ${dob.year}`;
  const full = `${name} is ${ageStr}. ${zodiacSign} zodiac${lifePath ? `, Life Path ${lifePath}` : ''}${rashi ? `, ${rashi} Rashi` : ''}. Birthday profile on BornClock.`;
  if (full.length <= 160) return full;
  const short = `${name} (${ageStr}): ${zodiacSign}${lifePath ? `, Life Path ${lifePath}` : ''}. BornClock.`;
  return short.length <= 160 ? short : short.slice(0, 157) + '...';
}
```

Create `src/utils/celebrityCalculations.ts`:

```typescript
import { CelebrityDOB } from './celebrityUtils';

export function calculateAge(day: number, month: number, year: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  return Math.max(0, age);
}

export function calculateDaysLived(day: number, month: number, year: number): number {
  return Math.floor((Date.now() - new Date(year, month - 1, day).getTime()) / 86400000);
}

export function calculateDaysUntilBirthday(day: number, month: number): number {
  const today = new Date();
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next <= today) next = new Date(today.getFullYear() + 1, month - 1, day);
  return Math.ceil((next.getTime() - today.getTime()) / 86400000);
}

function reduceToSingle(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduceToSingle(String(n).split('').reduce((a, d) => a + Number(d), 0));
}

export function calculateLifePathNumber(day: number, month: number, year: number): number {
  const d = reduceToSingle(day);
  const m = reduceToSingle(month);
  const y = reduceToSingle(String(year).split('').reduce((a, c) => a + Number(c), 0));
  return reduceToSingle(d + m + y);
}

export const LIFE_PATH_TRAITS: Record<number, { title: string; traits: string }> = {
  1:  { title: 'The Leader',               traits: 'Independent, ambitious, pioneering, and self-reliant. Natural leaders who forge their own path.' },
  2:  { title: 'The Diplomat',             traits: 'Cooperative, sensitive, peaceful, and empathetic. Excellent mediators who thrive through collaboration.' },
  3:  { title: 'The Creative',             traits: 'Expressive, optimistic, social, and artistic. Natural communicators with a gift for inspiring.' },
  4:  { title: 'The Builder',              traits: 'Practical, disciplined, hardworking, and reliable. Methodical achievers who build lasting foundations.' },
  5:  { title: 'The Adventurer',           traits: 'Free-spirited, versatile, curious, and adaptable. Seekers who embrace change and freedom.' },
  6:  { title: 'The Nurturer',             traits: 'Responsible, caring, family-oriented, and harmonious. Natural caregivers devoted to community.' },
  7:  { title: 'The Seeker',               traits: 'Analytical, introspective, spiritual, and perceptive. Deep thinkers who pursue wisdom.' },
  8:  { title: 'The Achiever',             traits: 'Powerful, authoritative, business-minded, and goal-oriented. Natural executives who manifest success.' },
  9:  { title: 'The Humanitarian',         traits: 'Compassionate, idealistic, generous, and wise. Visionaries dedicated to the greater good.' },
  11: { title: 'The Visionary (Master 11)', traits: 'Highly intuitive, inspirational, and spiritually aware. Master number with heightened sensitivity.' },
  22: { title: 'The Master Builder (22)',  traits: 'Exceptionally capable and visionary. Potential for large-scale achievement.' },
  33: { title: 'The Master Teacher (33)',  traits: 'Deeply compassionate and uplifting. The rarest master number, dedicated to selfless service.' },
};

export interface ZodiacInfo {
  sign: string; symbol: string; element: string;
  ruling_planet: string; traits: string; date_range: string;
  endMonth: number; endDay: number;
}

const ZODIAC_DATA: ZodiacInfo[] = [
  { sign: 'Capricorn',   symbol: '♑', element: 'Earth', ruling_planet: 'Saturn',  traits: 'Ambitious, disciplined, practical, and patient.',        date_range: 'Dec 22 – Jan 19', endMonth: 1,  endDay: 19 },
  { sign: 'Aquarius',    symbol: '♒', element: 'Air',   ruling_planet: 'Uranus',  traits: 'Innovative, humanitarian, independent, intellectual.',    date_range: 'Jan 20 – Feb 18', endMonth: 2,  endDay: 18 },
  { sign: 'Pisces',      symbol: '♓', element: 'Water', ruling_planet: 'Neptune', traits: 'Empathetic, artistic, intuitive, and compassionate.',     date_range: 'Feb 19 – Mar 20', endMonth: 3,  endDay: 20 },
  { sign: 'Aries',       symbol: '♈', element: 'Fire',  ruling_planet: 'Mars',    traits: 'Courageous, energetic, enthusiastic, and confident.',     date_range: 'Mar 21 – Apr 19', endMonth: 4,  endDay: 19 },
  { sign: 'Taurus',      symbol: '♉', element: 'Earth', ruling_planet: 'Venus',   traits: 'Reliable, patient, practical, and devoted.',             date_range: 'Apr 20 – May 20', endMonth: 5,  endDay: 20 },
  { sign: 'Gemini',      symbol: '♊', element: 'Air',   ruling_planet: 'Mercury', traits: 'Versatile, curious, witty, and communicative.',          date_range: 'May 21 – Jun 20', endMonth: 6,  endDay: 20 },
  { sign: 'Cancer',      symbol: '♋', element: 'Water', ruling_planet: 'Moon',    traits: 'Nurturing, intuitive, protective, and loyal.',           date_range: 'Jun 21 – Jul 22', endMonth: 7,  endDay: 22 },
  { sign: 'Leo',         symbol: '♌', element: 'Fire',  ruling_planet: 'Sun',     traits: 'Generous, creative, confident, and dramatic.',           date_range: 'Jul 23 – Aug 22', endMonth: 8,  endDay: 22 },
  { sign: 'Virgo',       symbol: '♍', element: 'Earth', ruling_planet: 'Mercury', traits: 'Analytical, meticulous, helpful, and reliable.',         date_range: 'Aug 23 – Sep 22', endMonth: 9,  endDay: 22 },
  { sign: 'Libra',       symbol: '♎', element: 'Air',   ruling_planet: 'Venus',   traits: 'Diplomatic, fair, social, and idealistic.',             date_range: 'Sep 23 – Oct 22', endMonth: 10, endDay: 22 },
  { sign: 'Scorpio',     symbol: '♏', element: 'Water', ruling_planet: 'Pluto',   traits: 'Intense, passionate, determined, and perceptive.',       date_range: 'Oct 23 – Nov 21', endMonth: 11, endDay: 21 },
  { sign: 'Sagittarius', symbol: '♐', element: 'Fire',  ruling_planet: 'Jupiter', traits: 'Adventurous, optimistic, philosophical, and free.',      date_range: 'Nov 22 – Dec 21', endMonth: 12, endDay: 21 },
];

export function calculateWesternZodiac(day: number, month: number): ZodiacInfo {
  for (let i = 0; i < ZODIAC_DATA.length; i++) {
    const z = ZODIAC_DATA[i];
    if (month === z.endMonth && day <= z.endDay) return z;
    if (month < z.endMonth) return ZODIAC_DATA[i === 0 ? 11 : i - 1];
  }
  return ZODIAC_DATA[0]; // Dec 22-31 → Capricorn
}

export interface ChineseZodiacInfo {
  animal: string; emoji: string; element: string; traits: string;
}

export function calculateChineseZodiac(year: number): ChineseZodiacInfo {
  const ANIMALS = [
    { animal: 'Rat',     emoji: '🐀', traits: 'Intelligent, adaptable, quick-witted.' },
    { animal: 'Ox',      emoji: '🐂', traits: 'Diligent, dependable, strong, determined.' },
    { animal: 'Tiger',   emoji: '🐅', traits: 'Brave, confident, competitive.' },
    { animal: 'Rabbit',  emoji: '🐇', traits: 'Quiet, elegant, kind, responsible.' },
    { animal: 'Dragon',  emoji: '🐉', traits: 'Confident, intelligent, charismatic.' },
    { animal: 'Snake',   emoji: '🐍', traits: 'Enigmatic, intuitive, refined.' },
    { animal: 'Horse',   emoji: '🐎', traits: 'Animated, active, energetic.' },
    { animal: 'Goat',    emoji: '🐐', traits: 'Mild-mannered, kind, creative.' },
    { animal: 'Monkey',  emoji: '🐒', traits: 'Sharp, smart, curious, mischievous.' },
    { animal: 'Rooster', emoji: '🐓', traits: 'Observant, hardworking, courageous.' },
    { animal: 'Dog',     emoji: '🐕', traits: 'Loyal, honest, amiable, kind.' },
    { animal: 'Pig',     emoji: '🐖', traits: 'Compassionate, generous, diligent.' },
  ];
  const ELEMENTS = ['Metal','Metal','Water','Water','Wood','Wood','Fire','Fire','Earth','Earth'];
  const animalIdx = ((year - 1900) % 12 + 12) % 12;
  const elementIdx = ((year - 1900) % 10 + 10) % 10;
  return { ...ANIMALS[animalIdx], element: ELEMENTS[elementIdx] };
}

export interface RashiInfo {
  rashi: string; lord: string; element: string;
  traits: string; western_equivalent: string;
}

export function calculateVedicRashi(day: number, month: number): RashiInfo {
  const RASHIS: RashiInfo[] = [
    { rashi: 'Makara',    lord: 'Shani',  element: 'Earth', traits: 'Disciplined, ambitious, practical.', western_equivalent: 'Capricorn' },
    { rashi: 'Kumbha',    lord: 'Shani',  element: 'Air',   traits: 'Innovative, humanitarian, independent.', western_equivalent: 'Aquarius' },
    { rashi: 'Meena',     lord: 'Guru',   element: 'Water', traits: 'Compassionate, intuitive, spiritual.', western_equivalent: 'Pisces' },
    { rashi: 'Mesha',     lord: 'Mangal', element: 'Fire',  traits: 'Courageous, energetic, pioneering.', western_equivalent: 'Aries' },
    { rashi: 'Vrishabha', lord: 'Shukra', element: 'Earth', traits: 'Reliable, patient, sensual.', western_equivalent: 'Taurus' },
    { rashi: 'Mithuna',   lord: 'Budha',  element: 'Air',   traits: 'Versatile, curious, communicative.', western_equivalent: 'Gemini' },
    { rashi: 'Karka',     lord: 'Chandra',element: 'Water', traits: 'Nurturing, intuitive, protective.', western_equivalent: 'Cancer' },
    { rashi: 'Simha',     lord: 'Surya',  element: 'Fire',  traits: 'Generous, creative, charismatic.', western_equivalent: 'Leo' },
    { rashi: 'Kanya',     lord: 'Budha',  element: 'Earth', traits: 'Analytical, meticulous, practical.', western_equivalent: 'Virgo' },
    { rashi: 'Tula',      lord: 'Shukra', element: 'Air',   traits: 'Diplomatic, fair, idealistic.', western_equivalent: 'Libra' },
    { rashi: 'Vrischika', lord: 'Mangal', element: 'Water', traits: 'Intense, passionate, perceptive.', western_equivalent: 'Scorpio' },
    { rashi: 'Dhanu',     lord: 'Guru',   element: 'Fire',  traits: 'Adventurous, optimistic, philosophical.', western_equivalent: 'Sagittarius' },
  ];
  const zodiac = calculateWesternZodiac(day, month);
  const map: Record<string, number> = {
    Capricorn:0, Aquarius:1, Pisces:2, Aries:3, Taurus:4, Gemini:5,
    Cancer:6, Leo:7, Virgo:8, Libra:9, Scorpio:10, Sagittarius:11,
  };
  return RASHIS[map[zodiac.sign] ?? 0];
}

export interface NakshatraInfo {
  nakshatra: string; number: number; lord: string; symbol: string; quality: string;
}

export function calculateNakshatra(day: number, month: number): NakshatraInfo {
  const NAKSHATRAS: NakshatraInfo[] = [
    { nakshatra: 'Ashwini',           number: 1,  lord: 'Ketu',   symbol: 'Horse head',     quality: 'Swift, healing, pioneering' },
    { nakshatra: 'Bharani',           number: 2,  lord: 'Shukra', symbol: 'Yoni',            quality: 'Creative, transformative' },
    { nakshatra: 'Krittika',          number: 3,  lord: 'Surya',  symbol: 'Razor',           quality: 'Purifying, sharp, determined' },
    { nakshatra: 'Rohini',            number: 4,  lord: 'Chandra',symbol: 'Chariot',         quality: 'Fertile, nurturing, growth' },
    { nakshatra: 'Mrigashira',        number: 5,  lord: 'Mangal', symbol: 'Deer head',       quality: 'Gentle, searching, curious' },
    { nakshatra: 'Ardra',             number: 6,  lord: 'Rahu',   symbol: 'Teardrop',        quality: 'Stormy, transformative' },
    { nakshatra: 'Punarvasu',         number: 7,  lord: 'Guru',   symbol: 'Quiver',          quality: 'Restoring, optimistic' },
    { nakshatra: 'Pushya',            number: 8,  lord: 'Shani',  symbol: 'Flower',          quality: 'Nourishing, protective' },
    { nakshatra: 'Ashlesha',          number: 9,  lord: 'Budha',  symbol: 'Serpent',         quality: 'Mystical, sharp, perceptive' },
    { nakshatra: 'Magha',             number: 10, lord: 'Ketu',   symbol: 'Royal throne',    quality: 'Regal, ancestral, powerful' },
    { nakshatra: 'Purva Phalguni',    number: 11, lord: 'Shukra', symbol: 'Hammock',         quality: 'Creative, joyful' },
    { nakshatra: 'Uttara Phalguni',   number: 12, lord: 'Surya',  symbol: 'Bed',             quality: 'Service-oriented, committed' },
    { nakshatra: 'Hasta',             number: 13, lord: 'Chandra',symbol: 'Hand',            quality: 'Skilled, resourceful, witty' },
    { nakshatra: 'Chitra',            number: 14, lord: 'Mangal', symbol: 'Pearl',           quality: 'Artistic, beautiful' },
    { nakshatra: 'Swati',             number: 15, lord: 'Rahu',   symbol: 'Sword',           quality: 'Independent, flexible' },
    { nakshatra: 'Vishakha',          number: 16, lord: 'Guru',   symbol: 'Triumphal arch',  quality: 'Purposeful, ambitious' },
    { nakshatra: 'Anuradha',          number: 17, lord: 'Shani',  symbol: 'Lotus',           quality: 'Devoted, friendly' },
    { nakshatra: 'Jyeshtha',          number: 18, lord: 'Budha',  symbol: 'Umbrella',        quality: 'Protective, responsible' },
    { nakshatra: 'Mula',              number: 19, lord: 'Ketu',   symbol: 'Tied roots',      quality: 'Investigative, transformative' },
    { nakshatra: 'Purva Ashadha',     number: 20, lord: 'Shukra', symbol: 'Fan',             quality: 'Invincible, purifying' },
    { nakshatra: 'Uttara Ashadha',    number: 21, lord: 'Surya',  symbol: 'Elephant tusk',   quality: 'Victorious, ethical' },
    { nakshatra: 'Shravana',          number: 22, lord: 'Chandra',symbol: 'Three footprints', quality: 'Listening, connecting' },
    { nakshatra: 'Dhanishtha',        number: 23, lord: 'Mangal', symbol: 'Drum',            quality: 'Wealthy, musical, social' },
    { nakshatra: 'Shatabhisha',       number: 24, lord: 'Rahu',   symbol: '100 stars',       quality: 'Healing, independent' },
    { nakshatra: 'Purva Bhadrapada',  number: 25, lord: 'Guru',   symbol: 'Sword',           quality: 'Fiery, transformative' },
    { nakshatra: 'Uttara Bhadrapada', number: 26, lord: 'Shani',  symbol: 'Twins',           quality: 'Deep, wise, restrained' },
    { nakshatra: 'Revati',            number: 27, lord: 'Budha',  symbol: 'Fish',            quality: 'Nourishing, wealthy, completion' },
  ];
  const dayOfYear = Math.floor(
    (new Date(2000, month - 1, day).getTime() - new Date(2000, 0, 1).getTime()) / 86400000
  );
  return NAKSHATRAS[Math.floor((dayOfYear / 365) * 27) % 27];
}

export interface PlanetaryAge {
  planet: string; emoji: string; age: number; orbit_years: number;
}

export function calculatePlanetaryAges(dob: CelebrityDOB): PlanetaryAge[] {
  if (!dob.isFullDate) return []; // Never calculate for year-only DOB
  const daysLived = calculateDaysLived(dob.day, dob.month, dob.year);
  return [
    { planet: 'Mercury', emoji: '☿', age: Math.floor(daysLived / 88),    orbit_years: 0.2 },
    { planet: 'Venus',   emoji: '♀', age: Math.floor(daysLived / 225),   orbit_years: 0.6 },
    { planet: 'Mars',    emoji: '♂', age: Math.floor(daysLived / 687),   orbit_years: 1.9 },
    { planet: 'Jupiter', emoji: '♃', age: Math.floor(daysLived / 4333),  orbit_years: 11.9 },
    { planet: 'Saturn',  emoji: '♄', age: Math.floor(daysLived / 10759), orbit_years: 29.5 },
    { planet: 'Uranus',  emoji: '♅', age: Math.floor(daysLived / 30687), orbit_years: 84.0 },
    { planet: 'Neptune', emoji: '♆', age: Math.floor(daysLived / 60190), orbit_years: 164.8 },
  ];
}
```

After creating both files and updating CATEGORY_CONFIG keys to match actual Phase 1 data:

```bash
npx tsc --noEmit 2>&1 | head -20
git add src/utils/celebrityUtils.ts src/utils/celebrityCalculations.ts
git commit -m "feat(day8/phase2): celebrity utility functions — slug generation, DOB parsing, calculations"
```

---

## PHASE 3 — WRITE AND RUN UTILITY TESTS

Create `src/utils/__tests__/celebrityUtils.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateCelebritySlug, generateAllSlugs,
  parseCelebrityDOB, formatDOBDisplay,
  generateCelebrityTitle, generateCelebrityMeta,
} from '../celebrityUtils';
import {
  calculateLifePathNumber, calculateWesternZodiac,
  calculateChineseZodiac, calculateVedicRashi,
  calculatePlanetaryAges, calculateAge,
  LIFE_PATH_TRAITS,
} from '../celebrityCalculations';
import { indianCelebrities } from '@/data/indianCelebrities';

// ── SLUG GENERATION ───────────────────────────────────────────
describe('generateCelebritySlug — Positive', () => {
  it('TC-SLUG-P-01: two-word name', () => expect(generateCelebritySlug('Virat Kohli')).toBe('virat-kohli'));
  it('TC-SLUG-P-02: three-word name', () => expect(generateCelebritySlug('Shah Rukh Khan')).toBe('shah-rukh-khan'));
  it('TC-SLUG-P-03: dots removed (A.R. Rahman)', () => expect(generateCelebritySlug('A.R. Rahman')).toBe('ar-rahman'));
  it('TC-SLUG-P-04: output is URL-safe', () => {
    ['Virat Kohli','A.R. Rahman',"O'Brien",'Björk'].forEach(n => {
      expect(generateCelebritySlug(n)).toMatch(/^[a-z0-9-]*$/);
    });
  });
  it('TC-SLUG-P-05: no leading/trailing hyphens', () => {
    ['Virat Kohli','A.R. Rahman','.Leading','Trailing.'].forEach(n => {
      expect(generateCelebritySlug(n)).not.toMatch(/^-|-$/);
    });
  });
  it('TC-SLUG-P-06: no consecutive hyphens', () => {
    expect(generateCelebritySlug('A.R. Rahman')).not.toContain('--');
  });
});

describe('generateCelebritySlug — Negative/Edge', () => {
  it('TC-SLUG-N-01: apostrophe removed', () => expect(generateCelebritySlug("O'Brien")).not.toContain("'"));
  it('TC-SLUG-N-02: collision adds birth year', () => {
    const used = new Set(['virat-kohli']);
    expect(generateCelebritySlug('Virat Kohli', 1988, used)).toBe('virat-kohli-1988');
  });
  it('TC-SLUG-N-03: double collision adds counter', () => {
    const used = new Set(['virat-kohli','virat-kohli-1988']);
    const slug = generateCelebritySlug('Virat Kohli', 1988, used);
    expect(slug).not.toMatch(/^virat-kohli$|^virat-kohli-1988$/);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-N-04: empty string returns non-empty fallback', () => {
    expect(generateCelebritySlug('', 1990).length).toBeGreaterThan(0);
  });
  it('TC-SLUG-N-05: special chars only returns fallback', () => {
    const slug = generateCelebritySlug('!!!', 1990);
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('TC-SLUG-N-06: very long name does not crash', () => {
    expect(() => generateCelebritySlug('Krishnamachari Srikkanth Venkataraman Narayanaswamy')).not.toThrow();
  });
});

describe('generateAllSlugs — Data Integrity', () => {
  let slugMap: Map<string, Record<string, unknown>>;
  beforeAll(() => {
    slugMap = generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]);
  });
  it('TC-SLUG-D-01: one slug per celebrity', () => expect(slugMap.size).toBe(indianCelebrities.length));
  it('TC-SLUG-D-02: no duplicate slugs', () => {
    const slugs = Array.from(slugMap.keys());
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('TC-SLUG-D-03: all slugs URL-safe', () => {
    Array.from(slugMap.keys()).forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/));
  });
  it('TC-SLUG-D-04: no empty slugs', () => {
    Array.from(slugMap.keys()).forEach(s => expect(s.length).toBeGreaterThan(0));
  });
  it('TC-SLUG-D-05: no slug starts or ends with hyphen', () => {
    Array.from(slugMap.keys()).forEach(s => expect(s).not.toMatch(/^-|-$/));
  });
});

// ── DOB PARSING ───────────────────────────────────────────────
describe('parseCelebrityDOB — Positive', () => {
  it('TC-DOB-P-01: full date YYYY-MM-DD → isFullDate=true', () => {
    const r = parseCelebrityDOB({ dob: '1988-11-05' });
    expect(r?.isFullDate).toBe(true);
    expect(r?.year).toBe(1988);
    expect(r?.month).toBe(11);
    expect(r?.day).toBe(5);
  });
  it('TC-DOB-P-02: year-only birth_year → isFullDate=false', () => {
    const r = parseCelebrityDOB({ birth_year: 1942 });
    expect(r?.isFullDate).toBe(false);
    expect(r?.year).toBe(1942);
  });
  it('TC-DOB-P-03: year-only birthYear field', () => {
    expect(parseCelebrityDOB({ birthYear: 1970 })?.isFullDate).toBe(false);
  });
  it('TC-DOB-P-04: no date info → null', () => {
    expect(parseCelebrityDOB({ name: 'No Date' })).toBeNull();
  });
});

describe('parseCelebrityDOB — Negative/Edge', () => {
  it('TC-DOB-N-01: year-only NEVER isFullDate=true', () => {
    expect(parseCelebrityDOB({ birth_year: 1956 })?.isFullDate).toBe(false);
  });
  it('TC-DOB-N-02: malformed date with year fallback does not crash', () => {
    expect(() => parseCelebrityDOB({ dob: 'not-a-date', birth_year: 1970 })).not.toThrow();
  });
  it('TC-DOB-N-03: null values → null', () => {
    expect(parseCelebrityDOB({ dob: null, birth_year: null } as Record<string, unknown>)).toBeNull();
  });
});

// ── DOB DISPLAY — CRITICAL: NO FAKE DATES ────────────────────
describe('formatDOBDisplay — Never Mislead', () => {
  it('TC-DISP-01: full date displays correctly', () => {
    expect(formatDOBDisplay({ year: 1988, month: 11, day: 5, isFullDate: true })).toBe('November 5, 1988');
  });
  it('TC-DISP-02: year-only NEVER shows January 1', () => {
    const r = formatDOBDisplay({ year: 1956, month: 0, day: 0, isFullDate: false });
    expect(r).not.toContain('January 1');
    expect(r).not.toContain('January');
    expect(r).toContain('1956');
  });
  it('TC-DISP-03: year-only shows "not available"', () => {
    expect(formatDOBDisplay({ year: 1956, month: 0, day: 0, isFullDate: false }).toLowerCase())
      .toContain('not available');
  });
  it('TC-DISP-04: null → "Information not available"', () => {
    expect(formatDOBDisplay(null)).toBe('Information not available');
  });
});

// ── LIFE PATH ─────────────────────────────────────────────────
describe('calculateLifePathNumber', () => {
  it('TC-LP-P-01: result always valid LP value', () => {
    [[1,1,1990],[15,6,1985],[28,12,1970],[7,3,2000]].forEach(([d,m,y]) => {
      expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(calculateLifePathNumber(d,m,y));
    });
  });
  it('TC-LP-EDGE-01: master numbers not reduced', () => {
    [1,2,3,4,5,6,7,8,9,11,22,33].forEach(n => {
      expect(LIFE_PATH_TRAITS[n]).toBeTruthy();
    });
  });
  it('TC-LP-EDGE-02: LIFE_PATH_TRAITS has all entries', () => {
    [1,2,3,4,5,6,7,8,9,11,22,33].forEach(n => {
      expect(LIFE_PATH_TRAITS[n].title.length).toBeGreaterThan(0);
      expect(LIFE_PATH_TRAITS[n].traits.length).toBeGreaterThan(10);
    });
  });
});

// ── ZODIAC — INCLUDES BOUNDARY EDGE CASES ────────────────────
describe('calculateWesternZodiac', () => {
  it('TC-ZOD-P-01: Nov 5 → Scorpio', () => expect(calculateWesternZodiac(5, 11).sign).toBe('Scorpio'));
  it('TC-ZOD-P-02: Aug 15 → Leo', () => expect(calculateWesternZodiac(15, 8).sign).toBe('Leo'));
  it('TC-ZOD-P-03: Jan 1 → Capricorn', () => expect(calculateWesternZodiac(1, 1).sign).toBe('Capricorn'));
  it('TC-ZOD-P-04: Dec 31 → Capricorn', () => expect(calculateWesternZodiac(31, 12).sign).toBe('Capricorn'));
  it('TC-ZOD-EDGE-01: Mar 20 → Pisces (last day)', () => expect(calculateWesternZodiac(20, 3).sign).toBe('Pisces'));
  it('TC-ZOD-EDGE-02: Mar 21 → Aries (first day)', () => expect(calculateWesternZodiac(21, 3).sign).toBe('Aries'));
  it('TC-ZOD-EDGE-03: Jan 19 → Capricorn (last day)', () => expect(calculateWesternZodiac(19, 1).sign).toBe('Capricorn'));
  it('TC-ZOD-EDGE-04: Jan 20 → Aquarius (first day)', () => expect(calculateWesternZodiac(20, 1).sign).toBe('Aquarius'));
  it('TC-ZOD-EDGE-05: all 12 months produce valid sign', () => {
    for (let m = 1; m <= 12; m++) {
      const z = calculateWesternZodiac(15, m);
      expect(z.sign.length).toBeGreaterThan(0);
      expect(z.sign).not.toBe('undefined');
    }
  });
  it('TC-ZOD-EDGE-06: no result ever undefined', () => {
    for (let m = 1; m <= 12; m++) {
      [1, 15, 28].forEach(d => {
        const z = calculateWesternZodiac(d, m);
        expect(z).not.toBeUndefined();
        expect(z.sign).not.toBe('undefined');
      });
    }
  });
});

// ── CHINESE ZODIAC ────────────────────────────────────────────
describe('calculateChineseZodiac', () => {
  it('TC-CZ-P-01: 1988 → Dragon', () => expect(calculateChineseZodiac(1988).animal).toBe('Dragon'));
  it('TC-CZ-P-02: 1990 → Horse', () => expect(calculateChineseZodiac(1990).animal).toBe('Horse'));
  it('TC-CZ-EDGE-01: various years all produce valid results', () => {
    [1940,1960,1980,2000,2020].forEach(y => {
      const z = calculateChineseZodiac(y);
      expect(z.animal.length).toBeGreaterThan(0);
      expect(z.element.length).toBeGreaterThan(0);
    });
  });
});

// ── PLANETARY AGES ────────────────────────────────────────────
describe('calculatePlanetaryAges', () => {
  it('TC-PLAN-P-01: 7 planets for full DOB', () => {
    expect(calculatePlanetaryAges({ year: 1988, month: 11, day: 5, isFullDate: true }).length).toBe(7);
  });
  it('TC-PLAN-P-02: Mercury age > Jupiter age', () => {
    const ages = calculatePlanetaryAges({ year: 1988, month: 11, day: 5, isFullDate: true });
    expect(ages.find(p => p.planet === 'Mercury')!.age).toBeGreaterThan(ages.find(p => p.planet === 'Jupiter')!.age);
  });
  it('TC-PLAN-P-03: all ages non-negative integers', () => {
    calculatePlanetaryAges({ year: 1990, month: 1, day: 1, isFullDate: true }).forEach(p => {
      expect(p.age).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(p.age)).toBe(true);
    });
  });
  it('TC-PLAN-EDGE-01: year-only DOB returns EMPTY array (no fake ages)', () => {
    expect(calculatePlanetaryAges({ year: 1956, month: 0, day: 0, isFullDate: false }).length).toBe(0);
  });
});

// ── META GENERATION ───────────────────────────────────────────
describe('generateCelebrityTitle', () => {
  it('TC-META-P-01: standard name ≤70 chars', () => expect(generateCelebrityTitle('Virat Kohli').length).toBeLessThanOrEqual(70));
  it('TC-META-P-02: long name ≤70 chars', () => expect(generateCelebrityTitle('Krishnamachari Srikkanth Venkataraman Narayanaswamy').length).toBeLessThanOrEqual(70));
  it('TC-META-P-03: contains BornClock', () => expect(generateCelebrityTitle('Amitabh Bachchan')).toContain('BornClock'));
  it('TC-META-P-04: contains celebrity name', () => expect(generateCelebrityTitle('Sachin Tendulkar')).toContain('Sachin Tendulkar'));
  it('TC-META-N-01: empty name does not crash', () => expect(() => generateCelebrityTitle('')).not.toThrow());
});

describe('generateCelebrityMeta', () => {
  const fullDOB = { year: 1988, month: 11, day: 5, isFullDate: true };
  const yearDOB  = { year: 1956, month: 0,  day: 0, isFullDate: false };

  it('TC-META-P-05: full DOB meta ≤160 chars', () => {
    expect(generateCelebrityMeta('Virat Kohli', fullDOB, 'Scorpio', 'Vrischika', 6).length).toBeLessThanOrEqual(160);
  });
  it('TC-META-P-06: year-only meta ≤160 chars', () => {
    expect(generateCelebrityMeta('Amitabh Bachchan', yearDOB, 'Libra', 'Tula', 3).length).toBeLessThanOrEqual(160);
  });
  it('TC-META-N-01: year-only NEVER says "years old" or January', () => {
    const meta = generateCelebrityMeta('Test', yearDOB, 'Leo', 'Simha', 1);
    expect(meta).not.toContain('January');
    expect(meta).toContain('1956');
  });
  it('TC-META-N-02: null DOB → fallback no undefined', () => {
    const meta = generateCelebrityMeta('Test', null, 'Leo', 'Simha', 1);
    expect(meta).not.toContain('undefined');
    expect(meta.length).toBeGreaterThan(20);
  });
  it('TC-META-N-03: long name still ≤160 chars', () => {
    expect(generateCelebrityMeta('Krishnamachari Srikkanth Venkataraman', fullDOB, 'Libra', 'Tula', 3).length).toBeLessThanOrEqual(160);
  });
  it('TC-META-N-04: no undefined or [object Object] in any combination', () => {
    [
      [fullDOB, 'Scorpio', 'Vrischika', 6],
      [yearDOB, 'Leo', 'Simha', 1],
      [null, 'Aries', 'Mesha', null],
    ].forEach(([dob, z, r, lp]) => {
      const meta = generateCelebrityMeta('Test', dob as typeof fullDOB, String(z), String(r), lp as number);
      expect(meta).not.toContain('undefined');
      expect(meta).not.toContain('[object Object]');
    });
  });
});

// ── FULL DATA INTEGRITY ───────────────────────────────────────
describe('indianCelebrities data integrity', () => {
  it('TC-DATA-01: at least 500 celebrities', () => expect(indianCelebrities.length).toBeGreaterThanOrEqual(500));
  it('TC-DATA-02: every celebrity has name', () => {
    indianCelebrities.forEach((c, i) => {
      expect((c as Record<string,unknown>).name, `Index ${i}`).toBeTruthy();
    });
  });
  it('TC-DATA-03: no name is "undefined" or "null"', () => {
    indianCelebrities.forEach(c => {
      const name = String((c as Record<string,unknown>).name);
      expect(name).not.toBe('undefined');
      expect(name).not.toBe('null');
    });
  });
  it('TC-DATA-04: ≥90% have date info', () => {
    const withDate = indianCelebrities.filter(c => {
      const r = c as Record<string,unknown>;
      return r.birth_year || r.birthYear || r.dob || r.date_of_birth;
    });
    expect(withDate.length / indianCelebrities.length).toBeGreaterThan(0.9);
  });
  it('TC-DATA-05: no duplicate slugs', () => {
    const m = generateAllSlugs(indianCelebrities as unknown as Record<string,unknown>[]);
    expect(m.size).toBe(indianCelebrities.length);
  });
  it('TC-DATA-06: year-only celebrities NEVER get fake January 1', () => {
    indianCelebrities.forEach(c => {
      const dob = parseCelebrityDOB(c as Record<string,unknown>);
      if (dob && !dob.isFullDate) {
        const display = formatDOBDisplay(dob);
        expect(display).not.toMatch(/January\s+1[^0-9]/);
      }
    });
  });
  it('TC-DATA-07: all zodiac calculations valid for sample', () => {
    indianCelebrities.slice(0, 50).forEach(c => {
      const dob = parseCelebrityDOB(c as Record<string,unknown>);
      if (dob?.isFullDate) {
        const z = calculateWesternZodiac(dob.day, dob.month);
        expect(z.sign.length).toBeGreaterThan(0);
        expect(z.sign).not.toBe('undefined');
      }
    });
  });
});
```

Run tests:
```bash
npx vitest run src/utils/__tests__/celebrityUtils.test.ts --reporter=verbose 2>&1
```

Fix ALL failures. Then:

```bash
git add src/utils/__tests__/celebrityUtils.test.ts
git commit -m "test(day8/phase3): utility tests — 50+ tests, zero hallucination validation, boundary checks"
```

---

## PHASE 4 — CREATE CELEBRITY PAGE COMPONENT

Create `src/pages/CelebrityPage.tsx`.

Before writing any JSX, read Phase 1 mapping for:
1. EXACT SEO component import path and props
2. EXACT field names from celebrity data
3. EXACT existing utility imports

The component must:
- Import and use `parseCelebrityDOB`, `formatDOBDisplay` from `@/utils/celebrityUtils`
- Show `formatDOBDisplay(dob)` in the DOB table row — NEVER raw date construction
- Only show planetary ages when `dob.isFullDate === true`
- Show `data-testid="twins-no-full-dob"` when `!dob.isFullDate`
- Show `data-testid="twins-none-found"` when no twins found for full-DOB celebrity
- Never pre-fill DOB param in CTA for year-only celebrities
- Use `gradient-text-primary` for H1 and `bg-primary` for CTA (same as other pages)
- Use `data-testid="celebrity-page"` on main element
- Use `data-testid="facts-table"` on facts table
- Use `data-testid="fact-dob"` on DOB table row
- Use `data-testid="fact-age"` on age row
- Use `data-testid="faq-question"` on each FAQ h3
- Use `data-testid="cta-birthday-report"` on CTA link
- Use `data-testid="birthday-twin-link"` on each twin card
- Use `data-testid="twins-no-full-dob"` paragraph for year-only
- Use `data-testid="twins-none-found"` paragraph when no twins
- Use `data-testid="planetary-table-wrapper"` on planetary table outer div
- Use `data-testid="breadcrumb-item"` on each breadcrumb li
- Redirect to `/celebrity/` for invalid slugs using `<Navigate replace />`
- Include Person + FAQPage + BreadcrumbList JSON-LD schemas
- 5 FAQ questions per celebrity (personalized with their name and data)

After creating:
```bash
npx tsc --noEmit 2>&1 | head -20
git add src/pages/CelebrityPage.tsx
git commit -m "feat(day8/phase4): CelebrityPage component — 598 individual celebrity pages"
```

---

## PHASE 5 — CREATE INDEX AND HUB PAGES

Create `src/pages/CelebrityIndexPage.tsx`:
- `data-testid="celebrity-index-page"` on main element
- `data-testid="celebrity-index-link"` on each celebrity link (all celebrities A-Z)
- `data-testid="category-hub-link"` on each category card
- 8 featured celebrities hardcoded (pick from actual database — use names that actually exist)
- BreadcrumbList schema
- H1 must contain "Celebrity"
- `gradient-text-primary` for H1

Create `src/pages/CelebrityHubPage.tsx`:
- `data-testid="celebrity-hub-page"` on main element
- `data-testid="hub-celebrity-link"` on each celebrity card
- Uses `useParams` to get category slug, maps to hub config
- Redirects to `/celebrity/` for invalid category slugs
- BreadcrumbList schema (3 levels: Home > Celebrity Profiles > [Category])
- H1 from CATEGORY_CONFIG entry

After creating both:
```bash
npx tsc --noEmit 2>&1 | head -20
git add src/pages/CelebrityIndexPage.tsx src/pages/CelebrityHubPage.tsx
git commit -m "feat(day8/phase5): CelebrityIndexPage and CelebrityHubPage components"
```

---

## PHASE 6 — ADD ROUTES TO APP.TSX

In `src/App.tsx`, using EXACT pattern from Phase 1:

```tsx
import { CelebrityPage } from '@/pages/CelebrityPage';
import { CelebrityIndexPage } from '@/pages/CelebrityIndexPage';
import { CelebrityHubPage } from '@/pages/CelebrityHubPage';

// Add in this order (index first, explicit hubs, individual last):
<Route path="/celebrity/" element={<CelebrityIndexPage />} />
<Route path="/celebrity/bollywood/" element={<CelebrityHubPage />} />
<Route path="/celebrity/cricket/" element={<CelebrityHubPage />} />
<Route path="/celebrity/politics/" element={<CelebrityHubPage />} />
<Route path="/celebrity/business/" element={<CelebrityHubPage />} />
<Route path="/celebrity/music/" element={<CelebrityHubPage />} />
<Route path="/celebrity/sports/" element={<CelebrityHubPage />} />
<Route path="/celebrity/:slug/" element={<CelebrityPage />} />
```

```bash
npx tsc --noEmit 2>&1 | head -10
git add src/App.tsx
git commit -m "feat(day8/phase6): celebrity routes added to App.tsx"
```

---

## PHASE 7 — UPDATE PRERENDER AND SITEMAP

First check how the prerender script handles imports:
```bash
head -10 scripts/prerender-routes.mjs
```

**If it can import TypeScript directly:**
```javascript
import { indianCelebrities } from '../src/data/indianCelebrities.ts';
import { generateAllSlugs, HUB_SLUGS } from '../src/utils/celebrityUtils.ts';

const slugMap = generateAllSlugs(indianCelebrities);
// Add to STATIC_ROUTES:
'/celebrity/',
...HUB_SLUGS.map(s => `/celebrity/${s}/`),
...Array.from(slugMap.keys()).map(s => `/celebrity/${s}/`),
```

**If it CANNOT import TypeScript — generate a JSON slug list first:**
```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('./src/data/indianCelebrities.ts', 'utf8');
const names = [...content.matchAll(/name:\s*['\"](.*?)['\"] /g)].map(m => m[1]);
const slugs = names.map(n =>
  n.toLowerCase()
   .replace(/['']/g,'').replace(/\./g,'')
   .replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,'-')
   .replace(/-+/g,'-').replace(/^-|-$/g,'')
   .trim() || 'celebrity'
);
// Deduplicate
const seen = new Set();
const unique = slugs.map((s, i) => {
  if (!seen.has(s)) { seen.add(s); return s; }
  const withYear = s + '-' + (new Date().getFullYear() - 30 + i % 60);
  seen.add(withYear); return withYear;
});
fs.writeFileSync('./scripts/celebrity-slugs.json', JSON.stringify(unique));
console.log('Generated', unique.length, 'slugs');
"
```

Then in prerender script:
```javascript
import { readFileSync } from 'fs';
const celebritySlugs = JSON.parse(readFileSync('./scripts/celebrity-slugs.json', 'utf8'));
// Add to STATIC_ROUTES:
'/celebrity/',
'/celebrity/bollywood/', '/celebrity/cricket/', '/celebrity/politics/',
'/celebrity/business/', '/celebrity/music/', '/celebrity/sports/',
...celebritySlugs.map(s => `/celebrity/${s}/`),
```

In `scripts/prerender-titles.mjs` add static hub titles:
```javascript
'/celebrity/': { title: 'Indian Celebrity Birthday Profiles — 598 Celebrities | BornClock', desc: 'Birthday profiles, zodiac, and numerology for 598 Indian celebrities.' },
'/celebrity/bollywood/': { title: 'Bollywood Celebrity Birthday Profiles | BornClock', desc: 'Birthday profiles for Bollywood actors and film personalities.' },
'/celebrity/cricket/': { title: 'Indian Cricket Celebrity Birthday Profiles | BornClock', desc: 'Birthday profiles for Indian cricketers.' },
'/celebrity/politics/': { title: 'Indian Political Celebrity Profiles | BornClock', desc: 'Birthday profiles for Indian political leaders.' },
'/celebrity/business/': { title: 'Indian Business Leader Birthday Profiles | BornClock', desc: 'Birthday profiles for Indian business leaders.' },
'/celebrity/music/': { title: 'Indian Music Celebrity Profiles | BornClock', desc: 'Birthday profiles for Indian musicians and singers.' },
'/celebrity/sports/': { title: 'Indian Sports Celebrity Profiles | BornClock', desc: 'Birthday profiles for Indian sports personalities.' },
```

```bash
git add scripts/ -A
git commit -m "feat(day8/phase7): celebrity pages added to prerender routes and sitemap"
```

---

## PHASE 8 — UPDATE NAVIGATION, HOMEPAGE, BORN-ON, FOOTER

### 8A — Explore dropdown
In the Explore nav component (from Phase 1 mapping):
- Add link to `/celebrity/` with text "Celebrity Birthday Profiles"
- Use EXACT same className as existing dropdown items
- Add count badge "598" if other items have badges

### 8B — Homepage
In `src/pages/Index.tsx`:
- Add celebrity tool card in existing tool grid (same style as longevity-calculator card)
- Add featured celebrities section with 8 celebrities (hardcode slugs from actual database)
- Find 8 most recognisable names that actually exist in the data:

```bash
python3 -c "
import re
with open('src/data/indianCelebrities.ts') as f:
    content = f.read()
names = re.findall(r\"name:\s*['\\\"](.*?)['\\\"]\", content)[:30]
for n in names: print(n)
"
```

Pick 8, hardcode their name and slug in the featured section.

### 8C — Born-on page bidirectional links
In `src/pages/BornOnDayIndia.tsx`:
- Import `generateAllSlugs` from `@/utils/celebrityUtils`
- Build NAME_TO_SLUG map
- Wrap each celebrity name in a Link to `/celebrity/[slug]/`
- Keep plain text as fallback if slug not found

### 8D — Footer
In footer component (from Phase 1 mapping):
- Add "Celebrity Profiles" section with links to /celebrity/ and all 6 hubs
- Use same styling as existing footer link sections

```bash
npx tsc --noEmit 2>&1 | head -20
git add -A
git commit -m "feat(day8/phase8): celebrity discovery — Explore nav, homepage, born-on links, footer"
```

---

## PHASE 9 — WRITE COMPONENT TESTS

Create `src/pages/__tests__/CelebrityPage.test.tsx`:

```typescript
// @vitest-environment jsdom
import { afterEach, beforeAll, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CelebrityPage } from '../CelebrityPage';
import { CelebrityIndexPage } from '../CelebrityIndexPage';
import { CelebrityHubPage } from '../CelebrityHubPage';
import { generateAllSlugs, parseCelebrityDOB, formatDOBDisplay } from '@/utils/celebrityUtils';
import { indianCelebrities } from '@/data/indianCelebrities';

afterEach(cleanup);

const SLUG_MAP = generateAllSlugs(indianCelebrities as unknown as Record<string,unknown>[]);
const ALL_SLUGS = Array.from(SLUG_MAP.keys());

// Find full-DOB slug for positive tests
const FULL_DOB_SLUG = ALL_SLUGS.find(slug => {
  const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
  return dob?.isFullDate;
}) || ALL_SLUGS[0];

// Find year-only slug for negative tests
const YEAR_ONLY_SLUG = ALL_SLUGS.find(slug => {
  const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
  return dob && !dob.isFullDate;
}) || null;

const renderCelebPage = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${slug}/`]}>
        <Routes>
          <Route path="/celebrity/:slug/" element={<CelebrityPage />} />
          <Route path="/celebrity/" element={<div>Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const renderIndexPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/celebrity/']}>
        <CelebrityIndexPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const renderHubPage = (category: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${category}/`]}>
        <Routes>
          <Route path="/celebrity/:category/" element={<CelebrityHubPage />} />
          <Route path="/celebrity/" element={<div>Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ── POSITIVE TESTS ────────────────────────────────────────────
describe('CelebrityPage — Positive', () => {
  it('TC-CP-P-01: renders without crashing', () => {
    expect(() => renderCelebPage(FULL_DOB_SLUG)).not.toThrow();
  });
  it('TC-CP-P-02: has celebrity-page testid', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="celebrity-page"]')).toBeTruthy();
  });
  it('TC-CP-P-03: exactly one H1', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('h1').length).toBe(1);
  });
  it('TC-CP-P-04: H1 contains celebrity name', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const name = String((SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>).name);
    expect(document.querySelector('h1')?.textContent).toContain(name);
  });
  it('TC-CP-P-05: facts table renders', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="facts-table"]')).toBeTruthy();
  });
  it('TC-CP-P-06: exactly 5 FAQ questions', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('[data-testid="faq-question"]').length).toBe(5);
  });
  it('TC-CP-P-07: CTA birthday report present', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="cta-birthday-report"]')).toBeTruthy();
  });
  it('TC-CP-P-08: CTA href contains /birthday-report', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="cta-birthday-report"]')?.getAttribute('href'))
      .toContain('/birthday-report');
  });
  it('TC-CP-P-09: ≥3 breadcrumb items', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('[data-testid="breadcrumb-item"]').length).toBeGreaterThanOrEqual(3);
  });
  it('TC-CP-P-10: ≥2 JSON-LD scripts', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBeGreaterThanOrEqual(2);
  });
  it('TC-CP-P-11: Person schema present', () => {
    renderCelebPage(FULL_DOB_SLUG);
    let found = false;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try { if (JSON.parse(s.textContent || '')['@type'] === 'Person') found = true; } catch {}
    });
    expect(found).toBe(true);
  });
  it('TC-CP-P-12: FAQPage schema has 5 questions', () => {
    renderCelebPage(FULL_DOB_SLUG);
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-CP-P-13: all schemas are valid JSON', () => {
    renderCelebPage(FULL_DOB_SLUG);
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      expect(() => JSON.parse(s.textContent || '')).not.toThrow();
    });
  });
  it('TC-CP-P-14: renders correctly for 5 different celebrities', () => {
    ALL_SLUGS.slice(0, 5).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      expect(document.querySelector('[data-testid="celebrity-page"]')).toBeTruthy();
      expect(document.body.textContent).not.toContain('[object Object]');
      unmount();
    });
  });
});

// ── NEGATIVE TESTS — YEAR-ONLY DOB (MOST CRITICAL) ───────────
describe('CelebrityPage — Year-Only DOB', () => {
  it('TC-CP-N-01: year-only renders without crashing', () => {
    if (!YEAR_ONLY_SLUG) return;
    expect(() => renderCelebPage(YEAR_ONLY_SLUG)).not.toThrow();
  });
  it('TC-CP-N-02: year-only NEVER shows "January 1" in DOB cell', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const dob = document.querySelector('[data-testid="fact-dob"]');
    expect(dob?.textContent).not.toContain('January 1');
    expect(dob?.textContent).not.toContain('January 01');
  });
  it('TC-CP-N-03: year-only DOB cell shows "not available"', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    expect(document.querySelector('[data-testid="fact-dob"]')?.textContent?.toLowerCase())
      .toContain('not available');
  });
  it('TC-CP-N-04: year-only has NO planetary ages table', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    expect(document.querySelector('[data-testid="planetary-table-wrapper"]')).toBeNull();
  });
  it('TC-CP-N-05: year-only CTA does not pre-fill January 1 date', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const href = document.querySelector('[data-testid="cta-birthday-report"]')?.getAttribute('href') || '';
    expect(href).not.toContain('01-01');
    expect(href).not.toContain('January');
  });
  it('TC-CP-N-06: year-only shows twins-no-full-dob message', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    expect(document.querySelector('[data-testid="twins-no-full-dob"]')).toBeTruthy();
  });
});

// ── EDGE CASES ────────────────────────────────────────────────
describe('CelebrityPage — Edge Cases', () => {
  it('TC-CP-E-01: invalid slug redirects without crashing', () => {
    expect(() =>
      render(
        <HelmetProvider>
          <MemoryRouter initialEntries={['/celebrity/this-does-not-exist-xyz/']}>
            <Routes>
              <Route path="/celebrity/:slug/" element={<CelebrityPage />} />
              <Route path="/celebrity/" element={<div data-testid="index">Index</div>} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      )
    ).not.toThrow();
  });
  it('TC-CP-E-02: no undefined or [object Object] for 20 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_, i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const text = document.body.textContent || '';
      expect(text, `${slug} has undefined`).not.toContain('undefined');
      expect(text, `${slug} has [object Object]`).not.toContain('[object Object]');
      unmount();
    });
  });
  it('TC-CP-E-03: facts table cells never blank or raw undefined', () => {
    renderCelebPage(FULL_DOB_SLUG);
    document.querySelectorAll('[data-testid="facts-table"] td').forEach(cell => {
      const text = cell.textContent?.trim() || '';
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toBe('undefined');
    });
  });
  it('TC-CP-E-04: ALL year-only celebrities never show fake January 1', () => {
    ALL_SLUGS.forEach(slug => {
      const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
      if (dob && !dob.isFullDate) {
        const display = formatDOBDisplay(dob);
        expect(display, `${slug} shows fake date`).not.toMatch(/January\s*1[^0-9]/);
      }
    });
  });
  it('TC-CP-E-05: celebrity with no twins shows twins-none-found message', () => {
    const slugWithNoTwins = ALL_SLUGS.find(slug => {
      const celeb = SLUG_MAP.get(slug) as Record<string,unknown>;
      const dob = parseCelebrityDOB(celeb);
      if (!dob?.isFullDate) return false;
      const twins = (indianCelebrities as unknown as Record<string,unknown>[]).filter(c => {
        if (String(c.name) === String(celeb.name)) return false;
        const cDob = parseCelebrityDOB(c);
        return cDob?.isFullDate && cDob.day === dob.day && cDob.month === dob.month;
      });
      return twins.length === 0;
    });
    if (slugWithNoTwins) {
      renderCelebPage(slugWithNoTwins);
      expect(document.querySelector('[data-testid="twins-none-found"]')).toBeTruthy();
    }
    expect(true).toBe(true); // Pass even if all have twins
  });
});

// ── INDEX PAGE TESTS ──────────────────────────────────────────
describe('CelebrityIndexPage', () => {
  it('TC-IDX-01: renders without crashing', () => expect(() => renderIndexPage()).not.toThrow());
  it('TC-IDX-02: has celebrity-index-page testid', () => {
    renderIndexPage();
    expect(document.querySelector('[data-testid="celebrity-index-page"]')).toBeTruthy();
  });
  it('TC-IDX-03: H1 contains "Celebrity"', () => {
    renderIndexPage();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('celebrity');
  });
  it('TC-IDX-04: shows link for every celebrity', () => {
    renderIndexPage();
    expect(document.querySelectorAll('[data-testid="celebrity-index-link"]').length)
      .toBe(indianCelebrities.length);
  });
  it('TC-IDX-05: shows ≥3 category hub links', () => {
    renderIndexPage();
    expect(document.querySelectorAll('[data-testid="category-hub-link"]').length).toBeGreaterThanOrEqual(3);
  });
  it('TC-IDX-06: no undefined or [object Object]', () => {
    renderIndexPage();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
});

// ── HUB PAGE TESTS ────────────────────────────────────────────
describe('CelebrityHubPage', () => {
  it('TC-HUB-01: Bollywood hub renders', () => expect(() => renderHubPage('bollywood')).not.toThrow());
  it('TC-HUB-02: Cricket hub renders', () => expect(() => renderHubPage('cricket')).not.toThrow());
  it('TC-HUB-03: has celebrity-hub-page testid', () => {
    renderHubPage('bollywood');
    expect(document.querySelector('[data-testid="celebrity-hub-page"]')).toBeTruthy();
  });
  it('TC-HUB-04: hub H1 is category-specific', () => {
    renderHubPage('bollywood');
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toMatch(/bollywood|celebrity/i);
  });
  it('TC-HUB-05: hub shows celebrities', () => {
    renderHubPage('bollywood');
    expect(document.querySelectorAll('[data-testid="hub-celebrity-link"]').length).toBeGreaterThan(0);
  });
  it('TC-HUB-06: invalid hub redirects without crashing', () => {
    expect(() => renderHubPage('invalid-xyz')).not.toThrow();
  });
  it('TC-HUB-07: no undefined in hub output', () => {
    renderHubPage('cricket');
    expect(document.body.textContent).not.toContain('undefined');
  });
});
```

Run:
```bash
npx vitest run src/pages/__tests__/CelebrityPage.test.tsx --reporter=verbose 2>&1
```

Fix ALL failures:
- `TC-CP-N-02` → `formatDOBDisplay` showing January 1 — fix `parseCelebrityDOB` isFullDate logic
- `TC-CP-N-04` → planetary table showing for year-only — add `dob.isFullDate` guard
- `TC-CP-N-06` → twins-no-full-dob element missing — add testid to component
- `TC-CP-E-03` → blank cells in facts table — add fallbacks for every row
- `TC-IDX-04` → count wrong — check import and rendering logic

After all pass:
```bash
git add src/pages/__tests__/CelebrityPage.test.tsx
git commit -m "test(day8/phase9): celebrity component tests — positive, negative, edge cases all green"
```

---

## PHASE 10 — FULL UNIT SUITE (NO REGRESSIONS)

```bash
npx vitest run 2>&1 | tail -15
```

Fix any regressions. Then:

```bash
git add -A
git commit -m "fix(day8/phase10): all unit test regressions resolved — full suite green"
```

---

## PHASE 11 — BUILD

```bash
time npm run build 2>&1 | tee /tmp/day8-build.txt | tail -30

echo "=== Build exit code: $? ==="
echo "=== Celebrity pages prerendered ==="
find dist -path "*/celebrity/*/index.html" | wc -l

echo "=== Born-on pages intact ==="
cat dist/born-on/august-6/india/index.html | grep -o "<title>[^<]*</title>"

echo "=== Failed pages ==="
grep -i "failed\|timeout\|error" /tmp/day8-build.txt | grep -v "DevTools\|warning" | head -10
```

**If >10 pages timeout:** Check prerender concurrency. Add to prerender script if needed:
```javascript
const CONCURRENCY = 5; // limit parallel prerender
```

**If born-on title is generic:** Redeploy immediately after this phase completes.

```bash
git add -A
git commit -m "chore(day8/phase11): build clean — $(find dist -path '*/celebrity/*' | wc -l) celebrity assets"
```

---

## PHASE 12 — PLAYWRIGHT E2E TESTS

Create `e2e/celebrity-pages.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.bornclock.com';

const SAMPLE_SLUGS = [
  'virat-kohli', 'sachin-tendulkar', 'shah-rukh-khan',
  'amitabh-bachchan', 'ar-rahman',
];

async function loadFirstWorking(page: any) {
  for (const slug of SAMPLE_SLUGS) {
    const res = await page.goto(`${BASE}/celebrity/${slug}/`);
    if (res?.status() === 200) {
      const count = await page.locator('[data-testid="celebrity-page"]').count();
      if (count > 0) return { slug, loaded: true };
    }
  }
  return { slug: null, loaded: false };
}

test.describe('Celebrity Pages — E2E', () => {

  // INDEX
  test('TC-E2E-01: celebrity index loads HTTP 200', async ({ page }) => {
    expect((await page.goto(`${BASE}/celebrity/`))?.status()).toBe(200);
  });
  test('TC-E2E-02: index H1 contains "Celebrity"', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    expect((await page.locator('h1').first().textContent())?.toLowerCase()).toContain('celebrity');
  });
  test('TC-E2E-03: index shows 500+ celebrity links', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    expect(await page.locator('[data-testid="celebrity-index-link"]').count()).toBeGreaterThanOrEqual(500);
  });
  test('TC-E2E-04: index shows category hubs', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    expect(await page.locator('[data-testid="category-hub-link"]').count()).toBeGreaterThanOrEqual(3);
  });
  test('TC-E2E-05: clicking celebrity link navigates correctly', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    await page.locator('[data-testid="celebrity-index-link"]').first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/celebrity/');
    expect((await page.title()).toLowerCase()).not.toContain('404');
  });

  // HUB PAGES
  for (const hub of ['bollywood', 'cricket', 'politics']) {
    test(`TC-E2E-06-${hub}: hub loads HTTP 200`, async ({ page }) => {
      expect((await page.goto(`${BASE}/celebrity/${hub}/`))?.status()).toBe(200);
    });
  }
  test('TC-E2E-07: Bollywood hub shows celebrities', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/bollywood/`);
    expect(await page.locator('[data-testid="hub-celebrity-link"]').count()).toBeGreaterThan(0);
  });

  // INDIVIDUAL PAGES
  test('TC-E2E-08: at least one sample slug loads correctly', async ({ page }) => {
    const { loaded } = await loadFirstWorking(page);
    expect(loaded).toBe(true);
  });
  test('TC-E2E-09: celebrity page has correct structure', async ({ page }) => {
    await loadFirstWorking(page);
    await expect(page.locator('[data-testid="celebrity-page"]')).toBeVisible();
    expect(await page.locator('h1').count()).toBe(1);
    await expect(page.locator('[data-testid="facts-table"]')).toBeVisible();
    expect(await page.locator('[data-testid="faq-question"]').count()).toBe(5);
  });
  test('TC-E2E-10: Person schema present', async ({ page }) => {
    await loadFirstWorking(page);
    await page.waitForLoadState('networkidle');
    let found = false;
    for (const s of await page.locator('script[type="application/ld+json"]').all()) {
      try { if (JSON.parse(await s.textContent() || '')['@type'] === 'Person') found = true; } catch {}
    }
    expect(found).toBe(true);
  });
  test('TC-E2E-11: FAQPage schema has 5 questions', async ({ page }) => {
    await loadFirstWorking(page);
    await page.waitForLoadState('networkidle');
    let count = 0;
    for (const s of await page.locator('script[type="application/ld+json"]').all()) {
      try {
        const d = JSON.parse(await s.textContent() || '');
        if (d['@type'] === 'FAQPage') count = Math.max(count, d.mainEntity?.length || 0);
      } catch {}
    }
    expect(count).toBe(5);
  });
  test('TC-E2E-12: CTA links to birthday report', async ({ page }) => {
    await loadFirstWorking(page);
    const cta = page.locator('[data-testid="cta-birthday-report"]');
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain('/birthday-report');
  });
  test('TC-E2E-13: no undefined or [object Object]', async ({ page }) => {
    await loadFirstWorking(page);
    const text = await page.evaluate(() => document.body.textContent);
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });

  // CRITICAL: YEAR-ONLY DOB NEVER SHOWS JANUARY 1
  test('TC-E2E-14: year-only celebrity pages never show January 1 as birthday', async ({ page }) => {
    await page.goto(`${BASE}/celebrity/`);
    const links = await page.locator('[data-testid="celebrity-index-link"]').all();
    let checked = 0;
    for (const link of links.slice(0, 30)) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      const res = await page.goto(`${BASE}${href}`);
      if (res?.status() !== 200) continue;
      const dobCell = page.locator('[data-testid="fact-dob"]');
      if (await dobCell.count() === 0) continue;
      const dobText = await dobCell.textContent();
      if (!dobText?.toLowerCase().includes('not available')) {
        expect(dobText, `${href} shows January 1 as fake birthday`).not.toMatch(/January\s+1[^0-9]/);
      }
      checked++;
      if (checked >= 10) break;
    }
  });

  // SITEMAP AND INTERNAL LINKING
  test('TC-E2E-15: celebrity pages in sitemap', async ({ page }) => {
    const xml = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
    expect(xml).toContain('/celebrity/');
    expect((xml.match(/\/celebrity\/[a-z0-9-]+\//g) || []).length).toBeGreaterThan(100);
  });
  test('TC-E2E-16: homepage links to /celebrity/', async ({ page }) => {
    await page.goto(BASE);
    expect(await page.locator('a[href*="/celebrity/"]').count()).toBeGreaterThanOrEqual(1);
  });
  test('TC-E2E-17: born-on page links to celebrity profiles', async ({ page }) => {
    await page.goto(`${BASE}/born-on/august-6/india/`);
    expect(await page.locator('a[href*="/celebrity/"]').count()).toBeGreaterThanOrEqual(1);
  });
  test('TC-E2E-18: Explore nav has celebrity link', async ({ page }) => {
    await page.goto(BASE);
    expect(await page.locator('a[href*="/celebrity/"]').count()).toBeGreaterThanOrEqual(1);
  });

  // MOBILE
  test('TC-E2E-19: celebrity page no h-scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loadFirstWorking(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
  });
  test('TC-E2E-20: celebrity index mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/celebrity/`);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
  });

  // PERFORMANCE
  test('TC-E2E-21: celebrity index under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/celebrity/`);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });
  test('TC-E2E-22: celebrity page under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await loadFirstWorking(page);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  // ACCESSIBILITY
  test('TC-E2E-23: celebrity page has main landmark', async ({ page }) => {
    await loadFirstWorking(page);
    await expect(page.locator('main')).toBeVisible();
  });
  test('TC-E2E-24: facts table has no empty or undefined cells', async ({ page }) => {
    await loadFirstWorking(page);
    for (const cell of await page.locator('[data-testid="facts-table"] td').all()) {
      const text = await cell.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
      expect(text?.trim()).not.toBe('undefined');
    }
  });

  // BORN-ON INTEGRITY
  test('TC-E2E-25: born-on manifest intact after Day 8 deploy', async ({ page }) => {
    const res = await page.goto(`${BASE}/born-on/august-6/india/`);
    expect(res?.status()).toBe(200);
    const title = await page.title();
    expect(title.toLowerCase()).toContain('august 6');
    expect(title.toLowerCase()).not.toBe('bornclock');
  });

});
```

Run:
```bash
npx playwright test e2e/celebrity-pages.spec.ts --reporter=list 2>&1
```

Fix all failures. Then:
```bash
git add e2e/celebrity-pages.spec.ts
git commit -m "test(day8/phase12): celebrity E2E tests — 25 tests including year-only DOB and mobile"
```

---

## PHASE 13 — FULL E2E SUITE (NO REGRESSIONS)

```bash
npx playwright test --reporter=list 2>&1 | tail -20
```

Fix any regressions. Then:
```bash
git add -A
git commit -m "fix(day8/phase13): all E2E regressions resolved — full suite green"
```

---

## PHASE 14 — DEPLOY TO STAGING AND VERIFY

```bash
git push origin develop
./node_modules/.bin/wrangler deploy
```

Wait 60 seconds. Then verify:

```bash
echo "=== BORN-ON SPOT CHECK (mandatory) ==="
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  "https://bornclock.com/born-on/august-6/india/" && \
curl -s "https://bornclock.com/born-on/august-6/india/" | \
  grep -o "<title>[^<]*</title>"

echo "=== Celebrity index ==="
curl -s -o /dev/null -w "%{http_code}\n" "https://staging.bornclock.com/celebrity/"

echo "=== Hub pages ==="
for cat in bollywood cricket politics music sports; do
  echo -n "$cat: "
  curl -s -o /dev/null -w "%{http_code}\n" "https://staging.bornclock.com/celebrity/$cat/"
done

echo "=== Sample celebrity pages ==="
for slug in virat-kohli sachin-tendulkar shah-rukh-khan amitabh-bachchan ar-rahman; do
  echo -n "$slug: "
  curl -s -o /dev/null -w "%{http_code}\n" "https://staging.bornclock.com/celebrity/$slug/"
done

echo "=== Sitemap celebrity count ==="
curl -s "https://staging.bornclock.com/sitemap.xml" | grep -c "/celebrity/"

echo "=== Born-on page has celebrity links ==="
curl -s "https://staging.bornclock.com/born-on/august-6/india/" | grep -c "/celebrity/"

echo "=== Year-only DOB check — must NOT show January 1 ==="
FIRST_SLUG=$(curl -s "https://staging.bornclock.com/celebrity/" | \
  grep -o 'href="/celebrity/[^"]*"' | head -1 | cut -d'"' -f2)
if [ -n "$FIRST_SLUG" ]; then
  DOB=$(curl -s "https://staging.bornclock.com$FIRST_SLUG" | \
    grep -A2 'fact-dob' | grep -v 'data-testid' | head -1)
  echo "DOB display: $DOB"
  echo "$DOB" | grep -qi "january 1" && echo "FAIL: January 1 shown" || echo "PASS: No January 1"
fi
```

If born-on spot check fails: redeploy immediately before proceeding.

```bash
git commit -m "chore(day8/phase14): staging verification passed"
```

---

## PHASE 15 — DEPLOY TO PRODUCTION

```bash
git checkout main
git merge develop
git push origin main
./node_modules/.bin/wrangler deploy
```

Wait 60 seconds. Final production checks:

```bash
echo "=== PRODUCTION BORN-ON SPOT CHECK ==="
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  "https://bornclock.com/born-on/august-6/india/" && \
curl -s "https://bornclock.com/born-on/august-6/india/" | \
  grep -o "<title>[^<]*</title>"

echo "=== Celebrity index LIVE ==="
curl -s -o /dev/null -w "%{http_code}\n" "https://bornclock.com/celebrity/"

echo "=== Sample celebrity pages LIVE ==="
for slug in virat-kohli sachin-tendulkar shah-rukh-khan; do
  echo -n "$slug: "
  curl -s -o /dev/null -w "%{http_code}\n" "https://bornclock.com/celebrity/$slug/"
done

echo "=== Sitemap celebrity count LIVE ==="
curl -s "https://bornclock.com/sitemap.xml" | grep -c "/celebrity/"
```

```bash
git tag -a "day8-complete" -m "Day 8: 598 celebrity pages live on production"
git push origin --tags
```

---

## PHASE 16 — PRINT COMPLETION REPORT

```
DAY 8 COMPLETE — CELEBRITY PAGES
══════════════════════════════════════════════════════════════
PAGES CREATED
  Individual celebrity pages:    [X] at /celebrity/[slug]/
  Category hub pages:            [X]
  Celebrity index:               1 at /celebrity/
  Total new pages:               [X]
  Sitemap URLs (before Day 8):   1371
  Sitemap URLs (after Day 8):    [X]

DATA INTEGRITY
  All facts from database/DOB calculation:   ✓
  No bios, awards, stats fabricated:         ✓
  Slug collisions:                           0 ✓
  Year-only celebrities show fake Jan 1:     NEVER ✓
  Celebrities with full DOB:                 [X]/[total] ✓
  Celebrities with year only:                [X]/[total] ✓

SEO / AEO / GEO
  Title ≤70 chars:       All pages ✓
  Meta ≤160 chars:       All pages ✓
  Person schema:         All celebrity pages ✓
  FAQPage (5 Qs each):   All celebrity pages ✓
  BreadcrumbList:        All pages ✓
  Canonical URLs:        All pages ✓

INTERNAL LINKING
  Homepage tool card:            ✓
  Homepage featured (8 celebs):  ✓
  Explore dropdown:              ✓
  Footer (6 categories):         ✓
  Born-on → celebrity:           Bidirectional ✓
  Celebrity → born-on:           Bidirectional ✓
  CTA → birthday report (DOB):   Pre-filled for full DOB ✓

NAVIGATION
  Primary nav:   NO (conversion path preserved) ✓
  Explore:       YES ✓
  Homepage:      YES ✓
  Footer:        YES ✓

COMMITS (15 separate commits)
  phase2: utility functions
  phase3: utility tests (50+ tests)
  phase4: CelebrityPage component
  phase5: Index + Hub pages
  phase6: routes
  phase7: prerender + sitemap
  phase8: navigation updates
  phase9: component tests
  phase10: unit regression fixes
  phase11: build verification
  phase12: E2E tests (25 tests)
  phase13: E2E regression fixes
  phase14: staging verification
  phase15: production deployment
  tag: day8-complete

TESTS
  Utility tests:   50+/50+ ✓
  Component tests: [X]/[X] ✓
  Unit suite:      [X]/[X] ✓ (0 regressions)
  E2E celebrity:   25/25 ✓
  E2E full suite:  [X]/[X] ✓ (0 regressions)
  Build:           CLEAN ✓

Born-on:    200 + celebrity title (manifest intact) ✓
Production: LIVE on bornclock.com ✓

Expected impact:
  ~598 new pages targeting celebrity name searches
  "[Name] birthday" / "[Name] age" / "[Name] zodiac sign"
  AEO: FAQPage answers AI assistant queries
  GEO: Person schema for generative AI crawlers
  Estimated additional impressions: ~120K monthly

git tag: day8-complete
══════════════════════════════════════════════════════════════
```

---

## After completion — 3 manual steps

**Step 1 — Google Search Console (5 min):**
Request indexing for:
- `https://bornclock.com/celebrity/`
- `https://bornclock.com/celebrity/bollywood/`
- `https://bornclock.com/celebrity/cricket/`
- `https://bornclock.com/celebrity/virat-kohli/`
- `https://bornclock.com/celebrity/sachin-tendulkar/`
- `https://bornclock.com/celebrity/shah-rukh-khan/`

Google finds the remaining 592 via sitemap within 1-2 weeks.

**Step 2 — Visual check (3 min):**
Open `bornclock.com/celebrity/virat-kohli/` and confirm:
- H1 in navy gradient
- Facts table shows DOB, age, zodiac, rashi, life path
- 3 zodiac cards (Western, Chinese, Vedic)
- Planetary ages table
- Birthday twins section
- 5 FAQ questions
- CTA links to birthday report

**Step 3 — Explore dropdown (1 min):**
Open `bornclock.com`, click Explore → confirm "Celebrity Birthday Profiles" appears.

---

*End of Day 8 prompt. Paste this entire file into Claude Code and it will execute all 16 phases automatically.*
