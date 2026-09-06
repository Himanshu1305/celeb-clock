# BornClock — Comprehensive 40-Task Sprint + 6 Validation Phases
## Days 14–90 of 90-Day Growth Plan | Build → Validate → Fix → Re-validate
## One commit per task · Eight build batches · Six audit phases

---

## GLOBAL RULES

You have full permission. Never ask for approval. Work on develop branch only.

**COMMIT RULE:** Commit after each task's tests pass. Never wait for a build.
**FAILURE RULE:** One fix attempt per failure. Then `fail_task N "reason"` and continue.
**BUILD RULE:** Build only at batch boundaries (A–H). Never mid-task.

```bash
# Define these functions once at the start of Phase 1 — use throughout
fail_task() {
  echo ""; echo "══ TASK $1 FAILED: $2 ══"
  git add -A; git commit -m "wip(task$1): partial — $2" 2>/dev/null || true
  echo "Moving to next task..."
}

born_on_check() {
  sleep 50
  local T=$(curl -s "https://bornclock.com/born-on/august-6/india/" \
    | grep -o "<title>[^<]*</title>")
  echo "Born-on: $T"
  echo "$T" | grep -qi "august 6" && echo "✅ Born-on PASS" \
    || { echo "❌ FAIL — redeploying"; ./node_modules/.bin/wrangler deploy 2>&1|tail -3; sleep 50; }
}

# Shared article test runner — call with: run_article_tests FILE KEYWORD MIN_CHARS
run_article_tests() {
  npx vitest run "src/pages/__tests__/$1" --reporter=verbose 2>&1 | tail -15
  npx vitest run 2>&1 | tail -3
}
```

**AEO/GEO REQUIREMENTS — apply to EVERY page built in this prompt:**
- FAQPage schema with ≥5 questions on every article page (AEO — featured snippets)
- Article schema with headline, description, author, publisher on every article (GEO — AI citations)
- BreadcrumbList schema with 3 items (Home → Articles → This Article) on every article
- SoftwareApplication schema on every calculator page
- Person schema with birthDate on every celebrity page (already done)
- Open Graph tags: og:title, og:description, og:type, og:url on every page
- Canonical URL on every page (no trailing slash mismatch)

**INTERNAL LINKING — apply to EVERY article built:**
- Every longevity article must link to /longevity-calculator at least twice
- Every astrology article must link to /birthday-report at least twice
- Every article must link to ≥2 related articles (cross-linking)
- Every article's born-on celebrity examples must link to /celebrity/[slug]/

---

## PHASE 1 — READ EVERYTHING. NO CODE.

```bash
cd ~/Development/celeb-clock

echo "=== App routes — find all existing routes ==="
grep -n "Route path" src/App.tsx | head -40

echo "=== SEO component — exact props and hreflang support ==="
cat src/components/SEO.tsx 2>/dev/null || find src -name "SEO.tsx" | xargs cat | head -50

echo "=== Longevity calculator — component structure ==="
head -80 src/pages/LongevityCalculatorPage.tsx 2>/dev/null \
  || find src -name "*Longevity*" | head -3 | xargs head -30

echo "=== Existing articles ==="
ls src/pages/articles/ 2>/dev/null && echo "EXISTS" || echo "NONE"
find src/pages/articles -name "*.tsx" 2>/dev/null | wc -l

echo "=== Celebrity DB — exact DOB field name ==="
python3 -c "
import re
with open('src/data/indianCelebrities.ts') as f: c=f.read()
fields = re.findall(r'(birth_date|dob|date_of_birth|birthDate):', c)
from collections import Counter; print(Counter(fields).most_common(3))
print('Sample entry:'); print(re.search(r'\{[^{}]{50,300}\}', c).group(0)[:200])
"

echo "=== Astro data exports confirmed ==="
grep "^export const" src/data/astrologicalData.ts 2>/dev/null | head -10

echo "=== Calculation utils — available functions ==="
grep "^export function" src/utils/celebrityCalculations.ts | head -20

echo "=== Prerender route count ==="
grep -c "'/[a-z]" scripts/prerender-routes.mjs
head -20 scripts/prerender-routes.mjs

echo "=== Bio count ==="
python3 -c "import json; b=json.load(open('src/data/celebrity-bios.json')); print(f'{len(b)}/598 bios')"

echo "=== Baseline tests ==="
npx vitest run 2>&1 | tail -5
```

Print mapping:
```
SEO component props:       [exact names]
SEO hreflang support:      [YES/NO]
Longevity calc importable: [YES/NO]
Articles dir:              [EXISTS/NONE]
Celebrity DOB field:       [exact name]
Current bios:              [X/598]
Prerender count:           [X routes]
Baseline:                  [X passing]
```

**STOP until mapping complete.**

---

## ══ BATCH A ══ Tasks 1–5 → Build A → Deploy A

---

## TASK 1 — COMPLETE ALL BIOS (Batches 6–12)

```bash
for B in 6 7 8 9 10 11 12; do
  echo "=== Batch $B ===" 
  npx tsx scripts/generate-celebrity-bios.ts --batch $B || true
  COUNT=$(python3 -c "import json; print(len(json.load(open('src/data/celebrity-bios.json'))))" 2>/dev/null)
  git add src/data/celebrity-bios.json
  git commit -m "feat(bios): batch $B — $COUNT/598 total"
done
npx tsx scripts/generate-celebrity-bios.ts --status
```

Tests `src/data/__tests__/celebBios.test.ts`:
```typescript
import bios from '../celebrity-bios.json';
const entries = Object.entries(bios as Record<string,string>);

describe('Celebrity Bios', () => {
  it('TC-BIO-P-01: ≥200 bios generated', () => expect(Object.keys(bios).length).toBeGreaterThanOrEqual(200));
  it('TC-BIO-P-02: all bios 100–350 words', () => {
    entries.forEach(([s, b]) => { const w = b.split(/\s+/).length; expect(w, s).toBeGreaterThanOrEqual(50); expect(w, s).toBeLessThanOrEqual(350); });
  });
  it('TC-BIO-P-03: all slugs URL-safe', () => Object.keys(bios).forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/)));
  it('TC-BIO-N-01: no undefined or AI refusal', () => {
    entries.forEach(([s, b]) => {
      expect(b, s).not.toContain('undefined');
      expect(b.toLowerCase(), s).not.toContain('i cannot');
      expect(b.toLowerCase(), s).not.toContain('as an ai');
    });
  });
  it('TC-BIO-N-02: no empty bios', () => entries.forEach(([s, b]) => expect(b.trim().length, s).toBeGreaterThan(50)));
});
```

```bash
run_article_tests "celebBios.test.ts"
git add src/data/__tests__/celebBios.test.ts
git commit -m "test(bios): 5 bio quality tests"
echo "=== TASK 1 DONE ==="
```

---

## TASK 2 — UK + AUSTRALIA + USA + CANADA LIFE EXPECTANCY PAGES

Read longevity calculator page structure before writing:
```bash
cat src/pages/LongevityCalculatorPage.tsx | head -60
```

Create 4 country pages — each embeds the existing longevity calculator component.
Each page has: H1 with country name, country-specific statistics, 2500 words, FAQ (5 questions), Article + FAQPage + SoftwareApplication schemas, OG tags, canonical, hreflang.

**Key data per page (real published figures — use exactly):**

| Country | Avg LE | Men | Women | Source | Rank |
|---|---|---|---|---|---|
| UK | 81.1 | 79.4 | 83.1 | ONS 2023 | 29th |
| Australia | 83.4 | 81.3 | 85.4 | ABS 2022 | 6th |
| USA | 79.1 | 76.4 | 81.3 | CDC 2023 | 40th |
| Canada | 82.0 | 80.2 | 84.0 | StatsCan 2023 | 17th |

Each page also includes:
- Regional variation within country (UK: England 81.3 highest, Scotland 78.8 lowest; USA: Hawaii 82.3, Mississippi 74.4)
- Country vs India (70.2) vs Japan (84.3) vs Switzerland (83.9)
- 8 lifestyle factors (from existing longevity calculator — read them)
- FAQ: 5 country-specific questions

Routes:
- `/life-expectancy-calculator-uk` → `data-testid="uk-le-page"`
- `/life-expectancy-calculator-australia` → `data-testid="aus-le-page"`
- `/life-expectancy-calculator-usa` → `data-testid="usa-le-page"`
- `/life-expectancy-calculator-canada` → `data-testid="canada-le-page"`

Tests template (8 per page, 32 total):
```typescript
// Apply to each country page — replace [PAGE], [TESTID], [COUNTRY], [AVG], [SOURCE]
describe('[PAGE]', () => {
  it('TC-[C]-P-01: renders', () => expect(() => renderPage()).not.toThrow());
  it('TC-[C]-P-02: testid present', () => { renderPage(); expect(document.querySelector('[data-testid="[TESTID]"]')).toBeTruthy(); });
  it('TC-[C]-P-03: H1 contains country', () => { renderPage(); expect(document.querySelector('h1')?.textContent?.toUpperCase()).toContain('[COUNTRY]'); });
  it('TC-[C]-P-04: key statistic present', () => { renderPage(); expect(document.body.textContent).toContain('[AVG]'); });
  it('TC-[C]-P-05: FAQPage schema 5 questions', () => { /* check JSON-LD */ });
  it('TC-[C]-P-06: SoftwareApplication schema', () => { /* check JSON-LD */ });
  it('TC-[C]-P-07: CTA to birthday-report or longevity-calculator', () => { /* check links */ });
  it('TC-[C]-N-01: no undefined', () => { renderPage(); expect(document.body.textContent).not.toContain('undefined'); });
});
```

Add all 4 routes to App.tsx and prerender-routes.mjs and prerender-titles.mjs.

```bash
npx vitest run src/pages/__tests__/LifeExpectancy*.test.tsx --reporter=verbose 2>&1 | tail -20
npx vitest run 2>&1 | tail -5
git add src/pages/LifeExpectancy*.tsx src/pages/__tests__/LifeExpectancy*.test.tsx \
        src/App.tsx scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat(day24-25-47-64): UK/AU/USA/Canada life expectancy pages — 4 countries, 32 tests, real data"
echo "=== TASK 2 DONE ==="
```

---

## TASK 3 — HREFLANG + OPEN GRAPH ON ALL PAGES

Read SEO component. If it doesn't support hreflang or OG tags, add them.

```typescript
// SEO component additions:
interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  hreflang?: Array<{ lang: string; url: string }>;
  ogType?: 'website' | 'article';
  ogImage?: string; // default to bornclock og image
}
// Add to Helmet render:
// <link rel="alternate" hreflang="..." href="..." /> for each hreflang
// <meta property="og:title" content={title} />
// <meta property="og:description" content={description} />
// <meta property="og:type" content={ogType || 'website'} />
// <meta property="og:url" content={canonical} />
```

Apply hreflang to:
- Main pages (Home, longevity-calc, born-on): `en-IN` + `x-default` both = bornclock.com
- UK page: `en-GB` = /life-expectancy-calculator-uk, `x-default` = /longevity-calculator
- AU page: `en-AU` = /life-expectancy-calculator-australia, `x-default` = /longevity-calculator
- USA page: `en-US` = /life-expectancy-calculator-usa, `x-default` = /longevity-calculator
- Canada page: `en-CA` = /life-expectancy-calculator-canada, `x-default` = /longevity-calculator

Apply OG tags to all pages using their existing title + description.

Tests:
```typescript
it('TC-HRE-P-01: SEO renders hreflang links without crash', () => ...);
it('TC-HRE-P-02: UK page has en-GB hreflang', () => { /* check link[rel=alternate][hreflang=en-GB] */ });
it('TC-HRE-P-03: all pages have og:title meta tag', () => ...);
it('TC-HRE-P-04: all pages have og:description', () => ...);
it('TC-HRE-N-01: SEO works without hreflang prop', () => ...);
it('TC-HRE-N-02: no hreflang points to undefined URL', () => ...);
```

```bash
npx vitest run 2>&1 | tail -5
git add src/components/SEO.tsx src/pages/LifeExpectancy*.tsx src/pages/LongevityCalculatorPage.tsx
git commit -m "feat(day32): hreflang + OpenGraph on all pages — international SEO ready"
echo "=== TASK 3 DONE ==="
```

---

## TASK 4 — FAQ SCHEMA ON 3 GLOBAL LANDING PAGES

Read existing longevity-calculator, biological-age-calculator, how-long-will-i-live pages.
Add FAQPage JSON-LD with 5 questions each. Do not change existing content.

Questions provided in Task 6 of previous sprint spec — use those exact questions.

```bash
npx vitest run 2>&1 | tail -5
git add src/pages/LongevityCalculatorPage.tsx src/pages/BiologicalAgeCalculatorPage.tsx src/pages/HowLongWillILivePage.tsx
git commit -m "feat(day42): FAQPage schema on 3 global pages — FAQ rich snippet eligible"
echo "=== TASK 4 DONE ==="
```

---

## TASK 5 — LIFE EXPECTANCY BY COUNTRY ARTICLE + INDIA ARTICLE

Create two articles:

**Article A: `/articles/life-expectancy-by-country-2026`**
Target: "life expectancy by country" — high global volume
Data: WHO 2023 World Health Statistics — use these exact top/bottom 10 figures:
Top: Japan 84.3, Switzerland 83.9, South Korea 83.3, Singapore 83.1, Spain 83.1, Cyprus 83.0, Australia 83.0, Italy 82.9, Iceland 82.9, Israel 82.7
Bottom: Chad 54.3, Nigeria 54.7, Sierra Leone 54.7, Central African Rep 55.0, Lesotho 55.4
India: 70.2 | UK: 81.1 | USA: 79.1 | China: 78.2 | Brazil: 75.9

Structure: Interactive country comparison (user types country → shows LE), regional analysis (Europe highest, Sub-Saharan Africa lowest), factors driving differences, India's trajectory (was 52 in 1970, now 70.2), how to improve your personal LE regardless of country.

**Article B: `/articles/how-long-will-i-live-in-india`**
Target: "life expectancy India" — 8K monthly
Data: SRS 2020 state-wise data (use these real figures):
Highest: Kerala 75.1, Delhi 73.2, Punjab 72.6, Himachal Pradesh 72.0
Lowest: Uttar Pradesh 65.0, Chhattisgarh 65.3, Assam 66.2, Madhya Pradesh 66.5
National average: 70.2 | Men: 68.7 | Women: 71.7

Structure: State table (all states), factors (Kerala model: literacy, healthcare, diet), urban vs rural (urban 73 vs rural 68), how BornClock personalises beyond the average.

Tests (8 each):
- Renders, H1 correct, real data present (Japan 84.3 / Kerala 75.1), CTA present, Article schema, FAQPage 5 questions, no undefined, content > 2000 chars.

```bash
npx vitest run src/pages/__tests__/LifeExpectancyByCountry*.test.tsx --reporter=verbose 2>&1 | tail -15
npx vitest run 2>&1 | tail -5
git add src/pages/articles/LifeExpectancyByCountryArticle.tsx \
        src/pages/articles/LifeExpectancyIndiaArticle.tsx \
        src/pages/__tests__/
git commit -m "feat(day14-15): life expectancy by country + India articles — WHO/SRS data, 16 tests"
echo "=== TASK 5 DONE ==="
```

---

## ══ BUILD A + DEPLOY A ══

```bash
# Verify all Task 1-5 routes in App.tsx and prerender files
grep -c "Route path" src/App.tsx
grep -c "'/[a-z]" scripts/prerender-routes.mjs

echo "=== BUILD A ==="
time npm run build 2>&1 | tee /tmp/build-a.txt | tail -15
./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/life-expectancy-calculator-uk/" "/life-expectancy-calculator-australia/" \
           "/life-expectancy-calculator-usa/" "/life-expectancy-calculator-canada/" \
           "/articles/life-expectancy-by-country-2026/" "/articles/how-long-will-i-live-in-india/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-a): build A — country pages + hreflang + OG + 2 articles live" --allow-empty
```

---

## ══ BATCH B ══ Tasks 6–11 → Build B → Deploy B

For Batch B articles, use this shared test pattern:

```typescript
// Shared article test factory — generates 10 tests for any article
function makeArticleTests(Component: React.ComponentType, config: {
  h1Keyword: string;       // word that must appear in H1
  dataCheck: string;       // specific string that must appear (proves real data used)
  minChars: number;        // minimum content length
  ctaTarget: string;       // href that must exist in CTAs
  faqCount: number;        // expected number of FAQ items
  hasCalculator?: boolean; // whether to test calculator testid
}) {
  const render = () => renderWithProviders(Component);
  it('P-01: renders without crash', () => expect(() => render()).not.toThrow());
  it('P-02: H1 contains keyword', () => { render(); expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain(config.h1Keyword.toLowerCase()); });
  it('P-03: real data present', () => { render(); expect(document.body.textContent).toContain(config.dataCheck); });
  if (config.hasCalculator) it('P-04: calculator renders', () => { render(); expect(document.querySelector('[data-testid*="calculator"]')).toBeTruthy(); });
  it('P-05: Article schema present', () => { /* check JSON-LD */ });
  it('P-06: FAQPage has correct question count', () => { /* check mainEntity.length */ });
  it('P-07: BreadcrumbList schema present', () => { /* check JSON-LD */ });
  it('P-08: CTA links to target', () => { render(); expect(Array.from(document.querySelectorAll('a')).some(l => l.getAttribute('href')?.includes(config.ctaTarget))).toBe(true); });
  it('N-01: no undefined or [object Object]', () => { render(); expect(document.body.textContent).not.toContain('undefined'); });
  it('N-02: content >= minimum chars', () => { render(); expect((document.body.textContent?.trim().length||0)).toBeGreaterThanOrEqual(config.minChars); });
}
```

Use this factory for all Batch B articles.

---

## TASK 6 — BIOLOGICAL AGE VS CHRONOLOGICAL AGE ARTICLE

Route: `/articles/biological-age-vs-chronological-age`
Target: "biological age" — 75K global monthly
Data source: existing BiologicalAgeCalculatorPage.tsx (read it first)

Structure:
- Chronological age = calendar years
- Biological age = how old your body actually is (Horvath 2013 epigenetic clock, Nature)
- Average American at 50 is biologically 54 (lifestyle gap: +4 years)
- Best measure: DNA methylation clock (most validated), telomere length, VO2 max, grip strength
- 5 lifestyle changes proven to reduce biological age: sleep optimisation, caloric restriction, high-intensity exercise, stress reduction, plant-heavy diet
- Bryan Johnson reduced biological age by 5 years (self-reported)
- How BornClock estimates biological age from the 8 lifestyle factors
- Each BornClock factor and its biological age impact (quantified)
- Interactive: "Your chronological age + 5 factors → estimated biological age delta"

Tests using factory:
`{ h1Keyword: 'biological age', dataCheck: 'Horvath', minChars: 2000, ctaTarget: 'biological-age-calculator', faqCount: 5 }`

```bash
run_article_tests "BiologicalAgeArticle.test.tsx"
git add src/pages/articles/BiologicalAgeArticle.tsx src/pages/__tests__/BiologicalAgeArticle.test.tsx
git commit -m "feat(day16): biological age vs chronological age article — Horvath clock, 5 lifestyle factors, 10 tests"
echo "=== TASK 6 DONE ==="
```

---

## TASK 7 — VEDIC ASTROLOGY BIRTH CHART ARTICLE

Route: `/articles/vedic-astrology-birth-chart`
Data: `VEDIC_RASHI_PROFILES`, `NAKSHATRA_PROFILES`, `WESTERN_ZODIAC_PROFILES` from astrologicalData.ts
Import `calculateVedicRashi`, `calculateNakshatra` from utils

Structure:
- Vedic vs Western astrology: sidereal vs tropical, Sun sign vs Moon sign vs Ascendant
- The 3 key elements of a Vedic birth chart: Lagna (Ascendant), Moon Rashi, Sun position
- From date of birth alone: approximate Moon Rashi and Nakshatra (BornClock's approach)
- Why birth time matters for precise chart (Lagna changes every 2 hours)
- BreadcrumbList: Home → Articles → Vedic Astrology Birth Chart

Inline calculator: DOB → shows approximate Rashi + Nakshatra + mantra + lucky stone
All 12 Rashis brief (pull from VEDIC_RASHI_PROFILES — just rashi_devanagari + lord + element)
27 Nakshatras brief (pull from NAKSHATRA_PROFILES — just nakshatra + lord + gana)
Famous Indian celebrities and their Rashis (calculated from DB)

Tests factory: `{ h1Keyword: 'vedic astrology', dataCheck: 'Nakshatra', minChars: 2500, ctaTarget: 'birthday-report', faqCount: 5, hasCalculator: true }`

Plus:
- TC-VA-P-extra: Devanagari Unicode present
- TC-VA-N-extra: disclaimer about birth time present

```bash
run_article_tests "VedicAstrologyArticle.test.tsx"
git add src/pages/articles/VedicAstrologyArticle.tsx src/pages/__tests__/VedicAstrologyArticle.test.tsx
git commit -m "feat(day41): Vedic astrology birth chart article — all 12 Rashis + 27 Nakshatras, calculator, Devanagari, 12 tests"
echo "=== TASK 7 DONE ==="
```

---

## TASK 8 — LONGEVITY QUIZ ARTICLE

Route: `/articles/longevity-quiz`
Target: "longevity quiz" — 20K global monthly

Read LongevityCalculatorPage.tsx first — use the EXACT 8 quiz factors that BornClock already uses.

Structure: One section per quiz factor explaining what it measures, the science, and optimal. Inline "take the quiz" CTA. Walk through the calculation with a worked example (42-year-old non-smoking, exercising, good-sleep person → score + result).

Tests factory: `{ h1Keyword: 'longevity quiz', dataCheck: 'WHO', minChars: 2000, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: H2 count ≥ 8 (one per quiz factor)

```bash
run_article_tests "LongevityQuizArticle.test.tsx"
git add src/pages/articles/LongevityQuizArticle.tsx src/pages/__tests__/LongevityQuizArticle.test.tsx
git commit -m "feat(day18): longevity quiz article — 8 factors from real calculator, worked example, 10 tests"
echo "=== TASK 8 DONE ==="
```

---

## TASK 9 — BRYAN JOHNSON BLUEPRINT ARTICLE

Route: `/articles/bryan-johnson-blueprint-alternative`
Target: "Bryan Johnson blueprint" — growing fast

Full spec in previous 25-task sprint (Task 8). Use that exact spec.
Plus these AEO requirements (add to that spec):
- FAQPage schema with exactly 5 questions
- BreadcrumbList 3 items
- Comparison table (Death Clock vs BornClock vs Bryan Johnson) — machine-readable

Tests factory: `{ h1Keyword: 'bryan johnson', dataCheck: '$2', minChars: 1500, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: mentions "free" alternative at least twice

```bash
run_article_tests "BryanJohnsonArticle.test.tsx"
git add src/pages/articles/BryanJohnsonArticle.tsx src/pages/__tests__/BryanJohnsonArticle.test.tsx
git commit -m "feat(day20): Bryan Johnson blueprint article — science-backed comparison, AEO schemas, 10 tests"
echo "=== TASK 9 DONE ==="
```

---

## TASK 10 — HOW TO LIVE TO 100 ARTICLE

Route: `/articles/how-to-live-to-100`
Target: "how to live to 100" — 50K global monthly

Full spec in previous sprint (Task 9). Use that exact spec.
Add India-specific extension (200 words): yoga, ayurveda, family structure as built-in Blue Zone, turmeric advantage, challenges (air pollution, ultra-processed food adoption).

Tests factory: `{ h1Keyword: '100', dataCheck: 'Blue Zone', minChars: 2500, ctaTarget: 'how-long-will-i-live', faqCount: 5 }`

```bash
run_article_tests "HowToLiveTo100Article.test.tsx"
git add src/pages/articles/HowToLiveTo100Article.tsx src/pages/__tests__/HowToLiveTo100Article.test.tsx
git commit -m "feat(day23): how to live to 100 — Blue Zones Power 9, Harvard Study, India context, 10 tests"
echo "=== TASK 10 DONE ==="
```

---

## TASK 11 — EXERCISE + LONGEVITY ARTICLE

Route: `/articles/exercise-and-longevity`
Target: "exercise life expectancy" — 15K monthly

Key evidence to include (real studies):
- 150 min/week moderate exercise: +3.4 years (JAMA 2012, Wen et al)
- High-intensity exercise: reduces all-cause mortality by 39% (Lancet 2017)
- Walking 8,000+ steps/day: 51% lower all-cause mortality vs 4,000 steps (JAMA 2021)
- Resistance training 1-2x/week: 23% lower mortality (British Journal of Sports Medicine 2022)
- Being sedentary >8hrs/day: equivalent to smoking (Annals of Internal Medicine)

India context: cricket, yoga, cycling to work, morning walks in parks — practical entry points for Indians who don't gym.

Practical 30-day progressive plan (week 1-4) tailored to Indian lifestyle.

Tests factory: `{ h1Keyword: 'exercise', dataCheck: 'JAMA', minChars: 2000, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: step count mentioned, resistance training mentioned

```bash
run_article_tests "ExerciseLongevityArticle.test.tsx"
git add src/pages/articles/ExerciseLongevityArticle.tsx src/pages/__tests__/ExerciseLongevityArticle.test.tsx
git commit -m "feat(day50): exercise and longevity article — JAMA/Lancet data, Indian lifestyle context, 10 tests"
echo "=== TASK 11 DONE ==="
```

---

## ══ BUILD B + DEPLOY B ══

```bash
# Verify all routes 6-11 in App.tsx and prerender files
echo "=== BUILD B ==="
time npm run build 2>&1 | tee /tmp/build-b.txt | tail -15
./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/articles/biological-age-vs-chronological-age/" "/articles/vedic-astrology-birth-chart/" \
           "/articles/longevity-quiz/" "/articles/bryan-johnson-blueprint-alternative/" \
           "/articles/how-to-live-to-100/" "/articles/exercise-and-longevity/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-b): build B — 6 articles + biological age live" --allow-empty
```

---

## ══ BATCH C ══ Tasks 12–17 → Build C → Deploy C

---

## TASK 12 — BLUE ZONES DIET ARTICLE

Route: `/articles/blue-zones-diet`
Full spec in previous sprint (Task 10). Use that exact spec.

Tests factory: `{ h1Keyword: 'blue zone', dataCheck: 'Okinawa', minChars: 2000, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: All 5 Blue Zones named (Sardinia, Okinawa, Loma Linda, Nicoya, Ikaria)

```bash
run_article_tests "BlueZonesDietArticle.test.tsx"
git add src/pages/articles/BlueZonesDietArticle.tsx src/pages/__tests__/BlueZonesDietArticle.test.tsx
git commit -m "feat(day26): Blue Zones diet — all 5 zones, Power 9, Indian alignment, 10 tests"
echo "=== TASK 12 DONE ==="
```

---

## TASK 13 — NAKSHATRA ARTICLE

Route: `/articles/nakshatra-by-date-of-birth`
Full spec in previous sprint (Task 11). Data from `NAKSHATRA_PROFILES`.

Tests factory: `{ h1Keyword: 'nakshatra', dataCheck: 'Anuradha', minChars: 3000, ctaTarget: 'birthday-report', faqCount: 5, hasCalculator: true }`
Extra: exactly 27 Nakshatras mentioned, Devanagari-adjacent content (gana names), gana types mentioned

```bash
run_article_tests "NakshatraArticle.test.tsx"
git add src/pages/articles/NakshatraArticle.tsx src/pages/__tests__/NakshatraArticle.test.tsx
git commit -m "feat(day31): nakshatra article — all 27 from astrologicalData, calculator, gana explained, 12 tests"
echo "=== TASK 13 DONE ==="
```

---

## TASK 14 — LONGEVITY FOODS INDIA ARTICLE

Route: `/articles/longevity-foods-india`
Full spec in previous sprint (Task 12). 15 Indian foods with evidence.

Tests factory: `{ h1Keyword: 'food', dataCheck: 'turmeric', minChars: 2000, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: 15 distinct foods mentioned, evidence levels present

```bash
run_article_tests "LongevityFoodsIndiaArticle.test.tsx"
git add src/pages/articles/LongevityFoodsIndiaArticle.tsx src/pages/__tests__/LongevityFoodsIndiaArticle.test.tsx
git commit -m "feat(day33): longevity foods India — 15 foods, evidence ratings, practical tips, 10 tests"
echo "=== TASK 14 DONE ==="
```

---

## TASK 15 — LIFE PATH COMPATIBILITY ARTICLE

Route: `/articles/life-path-number-compatibility`
Full spec in previous sprint (Task 13). Data from `LIFE_PATH_EXTENDED`.

Tests factory: `{ h1Keyword: 'compatibility', dataCheck: 'Life Path', minChars: 2500, ctaTarget: 'birthday-report', faqCount: 5, hasCalculator: true }`
Extra: all 12 LPs present, master numbers 11/22/33 mentioned

```bash
run_article_tests "LifePathCompatibilityArticle.test.tsx"
git add src/pages/articles/LifePathCompatibilityArticle.tsx src/pages/__tests__/LifePathCompatibilityArticle.test.tsx
git commit -m "feat(day35): life path compatibility article — matrix, calculator, Indian celebrity examples, 10 tests"
echo "=== TASK 15 DONE ==="
```

---

## TASK 16 — DEATH CLOCK ALTERNATIVE ARTICLE

Route: `/articles/death-clock-alternative`
Full spec in previous sprint (Task 14). Comparison table + 8 factors.

Tests factory: `{ h1Keyword: 'death clock', dataCheck: 'Death Clock', minChars: 1500, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: comparison table present, mentions "8 factors" or specific factors

```bash
run_article_tests "DeathClockAlternativeArticle.test.tsx"
git add src/pages/articles/DeathClockAlternativeArticle.tsx src/pages/__tests__/DeathClockAlternativeArticle.test.tsx
git commit -m "feat(day39): death clock alternative — comparison table, 8 factors, 9 tests"
echo "=== TASK 16 DONE ==="
```

---

## TASK 17 — RETIREMENT PLANNING + LIFE EXPECTANCY ARTICLE

Route: `/articles/retirement-planning-life-expectancy`
Target: "retirement planning India" — 25K monthly

Structure:
- Key question: How many years of retirement will you fund? (years_funded = LE - retirement_age)
- India: average retirement at 60, average LE 70.2 = 10.2 years. But healthy lifestyle could be 75+ = 15+ years
- The longevity risk: outliving your money
- Rule of thumb: fund for (LE + 10) years to be safe
- FIRE movement in India: reaching financial independence before 60
- BornClock's contribution: knowing your estimated LE helps you plan correctly
- Investment timeline calculator concept: "If I live to 82, I need X years of corpus"
- EPF, NPS, PPF — India-specific instruments and their suitability

Key real data:
- Average Indian retirement corpus goal: ₹3-5 crore for middle class
- Inflation: 6% historically → corpus erosion
- Longevity risk: 30% of people live 10+ years beyond average LE

CTA → /longevity-calculator + /birthday-report

Tests factory: `{ h1Keyword: 'retirement', dataCheck: 'corpus', minChars: 1500, ctaTarget: 'longevity-calculator', faqCount: 5 }`

```bash
run_article_tests "RetirementLifeExpectancyArticle.test.tsx"
git add src/pages/articles/RetirementLifeExpectancyArticle.tsx src/pages/__tests__/RetirementLifeExpectancyArticle.test.tsx
git commit -m "feat(day48): retirement planning + life expectancy — India corpus, longevity risk, 10 tests"
echo "=== TASK 17 DONE ==="
```

---

## ══ BUILD C + DEPLOY C ══

```bash
echo "=== BUILD C ==="
time npm run build 2>&1 | tee /tmp/build-c.txt | tail -15
./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/articles/blue-zones-diet/" "/articles/nakshatra-by-date-of-birth/" \
           "/articles/longevity-foods-india/" "/articles/life-path-number-compatibility/" \
           "/articles/death-clock-alternative/" "/articles/retirement-planning-life-expectancy/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-c): build C — 6 articles live" --allow-empty
```

---

## ══ BATCH D ══ Tasks 18–23 → Build D → Deploy D

---

## TASK 18 — ALL 12 FAMOUS INDIANS BORN IN [MONTH] ARTICLES

Full spec in previous sprint (Task 15). Python script extracts celebrities by birth month.

**Run Python script first — print output before writing any JSX.**

```bash
python3 << 'PYEOF'
import re
from collections import defaultdict
with open('src/data/indianCelebrities.ts') as f:
    content = f.read()
# [Adapt field name from Phase 1 mapping]
dob_pattern = r'name:\s*["\']([^"\']+)["\'].*?birth_date:\s*["\'](\d{4}-(\d{2})-\d{2})["\']'
matches = re.findall(dob_pattern, content, re.DOTALL)
by_month = defaultdict(list)
for name, full, month in matches:
    by_month[int(month)].append((name, full))
MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']
for m in range(1, 13):
    celebs = by_month[m]
    print(f"\n=== {MONTHS[m]} ({len(celebs)} celebrities) ===")
    for n, d in sorted(celebs, key=lambda x: x[1])[:10]:
        print(f"  {n}: {d}")
PYEOF
```

If any month has < 3 celebrities → use Life Path or zodiac sign as fallback grouping for that month.
Create shared component + 12 article pages. All data from DB — never hardcode celebrities.

Tests: 3 monthly pages tested (January, June, December) with 7 tests each.

```bash
run_article_tests "FamousIndiansBornIn*.test.tsx"
git add src/pages/articles/MonthlyBirthdayArticle.tsx src/pages/articles/FamousIndiansBornIn*.tsx \
        src/pages/__tests__/FamousIndiansBornIn*.test.tsx
git commit -m "feat(day28-29): all 12 Famous Indians Born in [Month] articles — DB data, shared component, 21 tests"
echo "=== TASK 18 DONE ==="
```

---

## TASK 19 — ZODIAC COMPATIBILITY ARTICLE

Route: `/articles/zodiac-compatibility`
Full spec in previous sprint (Task 16). Data from `WESTERN_ZODIAC_PROFILES`.

Tests factory + extra: calculator shows result for any two signs, all 12 signs covered, Scorpio + Cancer listed as compatible

```bash
run_article_tests "ZodiacCompatibilityArticle.test.tsx"
git add src/pages/articles/ZodiacCompatibilityArticle.tsx src/pages/__tests__/ZodiacCompatibilityArticle.test.tsx
git commit -m "feat(day55): zodiac compatibility — inline tool, all 12 signs, Indian celebrity couples, 10 tests"
echo "=== TASK 19 DONE ==="
```

---

## TASK 20 — BIORHYTHM CALCULATOR ARTICLE

Route: `/articles/biorhythm-calculator`
Full spec in previous sprint (Task 17). Uses `calculatePlanetaryAges` pattern for sin wave.

Tests factory + extra: Physical (23 days), Emotional (28 days), Intellectual (33 days) cycles all mentioned, result values between -100 and 100

```bash
run_article_tests "BiorhythmArticle.test.tsx"
git add src/pages/articles/BiorhythmArticle.tsx src/pages/__tests__/BiorhythmArticle.test.tsx
git commit -m "feat(day37): biorhythm calculator — 3 cycles, sin wave calc, 10 tests"
echo "=== TASK 20 DONE ==="
```

---

## TASK 21 — TAROT CARD BY DATE OF BIRTH ARTICLE

Route: `/articles/tarot-card-by-date-of-birth`
Full spec in previous sprint (Task 19). Data from `WESTERN_ZODIAC_PROFILES`.

Tests factory + extra: DOB Nov 5 → Death card, Life Path tarot table present

```bash
run_article_tests "TarotByDateOfBirthArticle.test.tsx"
git add src/pages/articles/TarotByDateOfBirthArticle.tsx src/pages/__tests__/TarotByDateOfBirthArticle.test.tsx
git commit -m "feat(day63): tarot by date of birth — zodiac + LP tarot, all 12 cards, 9 tests"
echo "=== TASK 21 DONE ==="
```

---

## TASK 22 — PLANETARY AGE + CHINESE ZODIAC ARTICLES

Two articles together since they're both calculation-based:

**Article A: `/articles/planetary-age-calculator`**
Full spec in previous sprint (Task 20). Uses `calculatePlanetaryAges`.
Tests factory: `{ h1Keyword: 'planetary', dataCheck: 'Mercury', minChars: 1000, ctaTarget: 'birthday-report', faqCount: 5, hasCalculator: true }`
Extra: Mercury age > Earth age test, all 7 planets in result

**Article B: `/articles/chinese-zodiac-by-year`**
Full spec in previous sprint (Task 21). Data from `CHINESE_ZODIAC_PROFILES`.
Tests factory: `{ h1Keyword: 'chinese zodiac', dataCheck: 'Dragon', minChars: 2000, ctaTarget: 'birthday-report', faqCount: 5, hasCalculator: true }`
Extra: 1988 → Dragon, 1990 → Horse, all 12 animals present

```bash
run_article_tests "PlanetaryAgeArticle.test.tsx"
run_article_tests "ChineseZodiacArticle.test.tsx"
git add src/pages/articles/PlanetaryAgeArticle.tsx src/pages/articles/ChineseZodiacArticle.tsx \
        src/pages/__tests__/
git commit -m "feat(day65-66): planetary age + Chinese zodiac articles — calculators, 20 tests"
echo "=== TASK 22 DONE ==="
```

---

## TASK 23 — BIRTH MONTH PERSONALITY + EPIGENETICS ARTICLES

**Article A: `/articles/birth-month-personality`**
Route: `/articles/birth-month-personality`
Target: "birth month personality" — 8K monthly

Data: combine Western zodiac data from `WESTERN_ZODIAC_PROFILES` with birth month patterns.
Structure: For each month, show: zodiac sign, personality traits from astrologicalData, research footnote.
Also include: seasonal birth hypothesis research (children born in winter months have slightly different neural development patterns — real but small effect), how BornClock enriches birth month data with numerology and astrology.

Note: pull personality_summary from WESTERN_ZODIAC_PROFILES for each month's zodiac sign. Never invent personality traits.

**Article B: `/articles/epigenetics-and-longevity`**
Route: `/articles/epigenetics-and-longevity`
Target: "epigenetics" — growing

Key data:
- Epigenetics: gene expression changes without DNA sequence changes
- Horvath clock: DNA methylation-based biological age measurement (2013)
- 3 proven epigenetic interventions: diet (Mediterranean), exercise (HIIT), sleep (7-9 hours)
- Telomere shortening: 1% per year on average, reversed by exercise and stress reduction
- BornClock measures 8 epigenetically-relevant lifestyle factors

Tests factory for each: `{ h1Keyword: 'birth month' / 'epigenetics', dataCheck: specific string, minChars: 1500, ctaTarget: 'birthday-report' / 'longevity-calculator', faqCount: 5 }`

```bash
run_article_tests "BirthMonthPersonalityArticle.test.tsx"
run_article_tests "EpigeneticsArticle.test.tsx"
git add src/pages/articles/BirthMonthPersonalityArticle.tsx \
        src/pages/articles/EpigeneticsArticle.tsx src/pages/__tests__/
git commit -m "feat(day67-68): birth month personality + epigenetics articles — astrologicalData.ts, Horvath clock, 20 tests"
echo "=== TASK 23 DONE ==="
```

---

## ══ BUILD D + DEPLOY D ══

```bash
echo "=== BUILD D ==="
time npm run build 2>&1 | tee /tmp/build-d.txt | tail -15
echo "=== Sitemap count ===" && grep -c "<loc>" dist/sitemap.xml 2>/dev/null
./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/articles/famous-indians-born-in-january/" "/articles/zodiac-compatibility/" \
           "/articles/biorhythm-calculator/" "/articles/planetary-age-calculator/" \
           "/articles/chinese-zodiac-by-year/" "/articles/birth-month-personality/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-d): build D — monthly articles + 5 more articles live" --allow-empty
```

---

## ══ BATCH E ══ Tasks 24–28 → Build E → Deploy E

---

## TASK 24 — LONGEVITY SUPPLEMENTS ARTICLE

Route: `/articles/longevity-supplements`
Target: "longevity supplements India" — 12K monthly

**Real evidence-based supplement data (do not invent efficacy claims):**

| Supplement | Evidence Level | Key Benefit | India Availability |
|---|---|---|---|
| Vitamin D3 | Strong | 7% reduced all-cause mortality (BMJ meta-analysis) | Common, affordable |
| Magnesium Glycinate | Strong | 10% lower CVD risk | Widely available |
| Omega-3 (Fish Oil) | Strong | Reduces inflammation, cardiac benefit (NEJM) | Available, can use flaxseed |
| NMN/NR | Moderate | NAD+ precursor, animal studies strong, human data emerging | Expensive, less accessible |
| Coenzyme Q10 | Moderate | Mitochondrial energy, statin users benefit most | Available |
| Ashwagandha | Moderate-Strong (Indian research) | Cortisol reduction, testosterone, thyroid | Very available, affordable |
| Turmeric + Piperine | Moderate | Anti-inflammatory (5000+ studies) | Best food source → capsule optional |
| Resveratrol | Weak-Moderate | Sirtuins activation, wine alternative | Expensive, bioavailability poor |
| Metformin (prescription) | Emerging | Longevity drug (TAME trial ongoing) | Prescription only |
| Rapamycin (prescription) | Emerging | mTOR inhibition | Prescription only, not for healthy use |

Warning section: supplement industry = ₹15,000 crore India market, most unregulated, most claims unproven.
Real message: food first (ashwagandha in milk, turmeric in food), supplements only fill gaps.

Tests factory: `{ h1Keyword: 'supplement', dataCheck: 'Vitamin D', minChars: 2000, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: evidence levels mentioned, prescription warning present

```bash
run_article_tests "LongevitySupplementsArticle.test.tsx"
git add src/pages/articles/LongevitySupplementsArticle.tsx src/pages/__tests__/LongevitySupplementsArticle.test.tsx
git commit -m "feat(day69): longevity supplements article — evidence levels, India context, prescription warning, 10 tests"
echo "=== TASK 24 DONE ==="
```

---

## TASK 25 — HOW INDIAN CELEBRITIES STAY FIT ARTICLE

Route: `/articles/how-indian-celebrities-stay-fit`
Target: "Indian celebrities fitness" — 5K monthly, very low competition

**Data: Read Indian celebrities DB. Calculate life path numbers and zodiac signs for top fitness-known celebrities.**

```bash
python3 << 'PYEOF'
import re
with open('src/data/indianCelebrities.ts') as f:
    content = f.read()
# Find celebrities known for sports/fitness/cricket/bollywood
pattern = r'name:\s*["\']([^"\']+)["\'].*?known_for:\s*["\']([^"\']*(?:cricket|fitness|yoga|sport|bollywood)[^"\']*)["\']'
matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
for name, known_for in matches[:15]:
    print(f"{name}: {known_for}")
PYEOF
```

Structure:
- Virat Kohli: intermittent fasting, no alcohol, 2-hour daily training (verified public interviews)
- MS Dhoni: motorcycle riding, farming — unusual longevity habits
- Amitabh Bachchan: yoga at 80+, minimal meat, walking
- Saina Nehwal / PV Sindhu: professional athlete routines
- Milind Soman: known for extreme fitness at 55+

For each celebrity:
- Actual calculated Life Path number from their DOB
- Their zodiac sign from DOB
- Publicly documented fitness habits (only verified)
- One longevity lesson from their lifestyle

"What they all have in common" section — extract the pattern.
BornClock connection: how knowing your Life Path helps you understand your natural fitness style.

Tests factory: `{ h1Keyword: 'celebrities', dataCheck: 'Virat', minChars: 1500, ctaTarget: 'celebrity', faqCount: 5 }`
Extra: at least 5 celebrities mentioned, Life Path numbers calculated, no fabricated claims

```bash
run_article_tests "IndianCelebritiesFitnessArticle.test.tsx"
git add src/pages/articles/IndianCelebritiesFitnessArticle.tsx src/pages/__tests__/IndianCelebritiesFitnessArticle.test.tsx
git commit -m "feat(day58): Indian celebrities stay fit — real DOB calculations, verified habits, Life Path connection, 10 tests"
echo "=== TASK 25 DONE ==="
```

---

## TASK 26 — AGE IN DAYS + SINGAPORE/UAE LIFE EXPECTANCY

**Article A: `/articles/age-in-days-hours-minutes`**
Route: `/articles/age-in-days-hours-minutes`
Target: "how many days have I lived" — 50K global monthly, very low competition

Uses `calculateDaysLived` from utils.

Inline calculator: DOB → shows:
- Exact days lived
- Exact hours lived (days × 24)
- Exact minutes lived (hours × 60)
- Heartbeats (minutes × 70 avg bpm)
- Breaths taken (days × 20,000 breaths/day avg)
- Full moons seen (days / 29.5)
- Mercury years completed (days / 88)

Structure: calculator → fun facts about what happens in a human lifetime → how every day counts for longevity → CTA

Tests factory: `{ h1Keyword: 'days', dataCheck: 'heartbeat', minChars: 1000, ctaTarget: 'birthday-report', faqCount: 5, hasCalculator: true }`
Extra: DOB input shows exact integer (not 0), multiple calculation outputs present

**Country Page + Article B: Singapore/UAE**

Create `src/pages/LifeExpectancySingaporeUAEPage.tsx`
Route: `/life-expectancy-calculator-singapore-uae`
Target: large Indian diaspora in both countries

Real data:
- Singapore: 83.9 years (WHO 2023) — 5th globally, universal healthcare, hawker food culture
- UAE: 78.5 years (WHO 2023) — improving rapidly, desert heat challenge, expatriate workforce
- Indian community in SG/UAE: 350K+ in Singapore, 3.5M in UAE

Structure: Combined page serving both markets (search intent: Indian expats checking their LE in their country of residence). UK + India comparison. 8 lifestyle factors. FAQPage.

```bash
npx vitest run src/pages/__tests__/AgeDaysHoursMinutes*.test.tsx --reporter=verbose 2>&1 | tail -10
npx vitest run src/pages/__tests__/LifeExpectancySingaporeUAE*.test.tsx --reporter=verbose 2>&1 | tail -10
npx vitest run 2>&1 | tail -5
git add src/pages/articles/AgeDaysHoursMinutesArticle.tsx \
        src/pages/LifeExpectancySingaporeUAEPage.tsx \
        src/pages/__tests__/ src/App.tsx scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat(day57-61): age in days calculator + Singapore/UAE life expectancy page — diaspora focus, 14 tests"
echo "=== TASK 26 DONE ==="
```

---

## TASK 27 — FAMOUS PEOPLE WHO LIVED TO 100 ARTICLE

Route: `/articles/famous-people-lived-to-100`
Target: "famous centenarians" — 5K monthly, very low competition

**Real centenarians with actual facts (no invented data):**

| Name | Nationality | Born | Died | Age | Notable habit |
|---|---|---|---|---|---|
| Bob Hope | USA | 1903 | 2003 | 100 | Golf daily until 90s |
| Olivia de Havilland | USA/France | 1916 | 2020 | 104 | Reading, crosswords |
| Henry Allingham | UK | 1896 | 2009 | 113 | "Cigarettes, whisky, wild wild women" (his words) |
| Kane Tanaka | Japan | 1903 | 2022 | 119 | Board games, green tea, family |
| Susannah Mushatt Jones | USA | 1899 | 2016 | 116 | Family, faith, bacon daily (genetics matter) |

Indian centenarians:
- Mn. Appa Patwardhan: 110 (yoga practitioner)
- Various centenarian studies from Kerala (highest centenarian density in India)

What they have in common (extracted from Blue Zones + centenarian studies):
1. Strong social connections (all centenarians studied)
2. Sense of purpose / reason to live
3. Moderate activity (not extreme)
4. Stress management / resilience
5. Mostly plant-based eating
6. Faith or spiritual practice

Tests factory: `{ h1Keyword: '100', dataCheck: 'Tanaka', minChars: 1500, ctaTarget: 'longevity-calculator', faqCount: 5 }`
Extra: at least 5 centenarians named, common habits extracted

```bash
run_article_tests "FamousPeopleLivedTo100Article.test.tsx"
git add src/pages/articles/FamousPeopleLivedTo100Article.tsx src/pages/__tests__/FamousPeopleLivedTo100Article.test.tsx
git commit -m "feat(day62): famous people who lived to 100 — real centenarians, common habits, India context, 10 tests"
echo "=== TASK 27 DONE ==="
```

---

## TASK 28 — HINDI ARTICLES (3 TOTAL)

Three Hindi articles in one task. Genuine Devanagari Hindi — not transliteration.

**Article A: `/hi/life-expectancy-calculator`**
Full spec in previous sprint (Task 22). Key Hindi terms: जीवन प्रत्याशा, स्वास्थ्य, व्यायाम, आहार, धूम्रपान

**Article B: `/hi/numerology-by-date-of-birth`**
Full spec in previous sprint (Task 23). Life Path terms in Hindi: नेता/राजनयिक/रचनात्मक etc.

**Article C: `/hi/meri-jeevan-pratyasha`**
Route: `/hi/meri-jeevan-pratyasha`
Target: Hindi speakers searching "मेरी जीवन प्रत्याशा क्या है?"
Short landing page (800 words) with:
- H1: मेरी जीवन प्रत्याशा क्या है? (What is my life expectancy?)
- WHO data in Hindi
- 5 key factors in Hindi
- CTA to /longevity-calculator

Tests for all 3 Hindi articles (8 tests each):
- Renders, Devanagari present (Unicode 0900-097F), H1 contains Hindi text, CTA links to longevity-calculator or birthday-report, Article schema, content > 300 chars, no undefined, specific Hindi term present

```bash
npx vitest run src/pages/__tests__/Hindi*.test.tsx --reporter=verbose 2>&1 | tail -15
npx vitest run 2>&1 | tail -5
git add src/pages/articles/HindiLifeExpectancyArticle.tsx \
        src/pages/articles/HindiNumerologyArticle.tsx \
        src/pages/articles/HindiJeevanPratyashaPage.tsx \
        src/pages/__tests__/Hindi*.test.tsx
git commit -m "feat(day51-52-70): 3 Hindi articles — जीवन प्रत्याशा/अंकज्योतिष/मेरी जीवन प्रत्याशा, 24 tests"
echo "=== TASK 28 DONE ==="
```

---

## ══ BUILD E + DEPLOY E ══

```bash
echo "=== BUILD E ==="
time npm run build 2>&1 | tee /tmp/build-e.txt | tail -15
./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/articles/longevity-supplements/" "/articles/how-indian-celebrities-stay-fit/" \
           "/articles/age-in-days-hours-minutes/" "/life-expectancy-calculator-singapore-uae/" \
           "/articles/famous-people-lived-to-100/" "/hi/life-expectancy-calculator" \
           "/hi/numerology-by-date-of-birth" "/hi/meri-jeevan-pratyasha"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-e): build E — supplements/fitness/age calc/SG-UAE/centenarians/Hindi live" --allow-empty
```

---

## ══ BATCH F ══ Tasks 29–33 → Build F → Deploy F

---

## TASK 29 — 366 GLOBAL BORN-ON PAGES (NO /INDIA/)

Full spec in previous sprint (Task 18). This is the most time-consuming task.

Architecture: Dynamic route `/born-on/:month/:day/` → `BornOnDayGlobal` component.
Canonical: each global page points to `/born-on/:month/:day/india/`.
Does NOT duplicate content penalty because canonical is set.

366 routes added to prerender via programmatic generation:
```javascript
const MONTHS = ['january','february','march','april','may','june',
  'july','august','september','october','november','december'];
const DAYS_IN_MONTH = [31,29,31,30,31,30,31,31,30,31,30,31];
const globalBornOnRoutes = MONTHS.flatMap((m,mi) =>
  Array.from({length: DAYS_IN_MONTH[mi]}, (_,i) => `/born-on/${m}/${i+1}/`)
);
```

Tests (8): renders valid date, title no India, canonical points to /india/, celebrity data shows, multiple dates no crash, Feb 29 leap day no crash, invalid date graceful, no undefined.

```bash
npx vitest run src/pages/__tests__/BornOnDayGlobal.test.tsx --reporter=verbose 2>&1 | tail -15
npx vitest run 2>&1 | tail -5
git add src/pages/BornOnDayGlobal.tsx src/pages/__tests__/BornOnDayGlobal.test.tsx \
        src/App.tsx scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat(day36): 366 global born-on pages — canonical to /india/, dynamic route, 8 tests"
echo "=== TASK 29 DONE ==="
```

---

## TASK 30 — ARTICLE INDEX PAGE + BREADCRUMBLIST ON ALL ARTICLES

**Article Index `/articles`**
Full spec in previous sprint (Task 24). Lists all published articles, filterable by category.
Categories: Longevity | Numerology | Vedic Astrology | Western Astrology | Chinese Zodiac | Hindi

Build the articles array from ALL articles created in this prompt — every article route.

Tests (10): renders, H1 present, ≥15 article cards, category filter works, all cards have links, CollectionPage schema, no undefined, articles with category filter show correct subset, CTA present, count matches array length.

**BreadcrumbList on All Articles**
For every article page that doesn't have BreadcrumbList schema:
```json
{
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://bornclock.com/"},
    {"@type":"ListItem","position":2,"name":"Articles","item":"https://bornclock.com/articles"},
    {"@type":"ListItem","position":3,"name":"[Article Title]","item":"https://bornclock.com/articles/[slug]"}
  ]
}
```

Check and add where missing:
```bash
for f in src/pages/articles/*.tsx; do
  grep -q "BreadcrumbList" "$f" && echo "✅ $f" || echo "❌ MISSING: $f"
done
```

Fix all missing BreadcrumbList. Add SEO prop or inline JSON-LD.

Tests: all article files have BreadcrumbList schema string, BreadcrumbList has 3 items, item 3 is unique per article.

```bash
npx vitest run src/pages/__tests__/ArticlesIndexPage.test.tsx --reporter=verbose 2>&1 | tail -15
npx vitest run 2>&1 | tail -5
git add src/pages/ArticlesIndexPage.tsx src/pages/__tests__/ArticlesIndexPage.test.tsx \
        src/pages/articles/ src/App.tsx scripts/prerender-routes.mjs scripts/prerender-titles.mjs
git commit -m "feat: article index /articles + BreadcrumbList on all articles — site navigation complete, 10 tests"
echo "=== TASK 30 DONE ==="
```

---

## TASK 31 — LONGEVITY QUIZ INTERACTIVE UPGRADE

The `/longevity-calculator` already exists. This task upgrades it.

Read the existing page fully:
```bash
cat src/pages/LongevityCalculatorPage.tsx
```

Add these improvements to the existing page (not replacing it):
1. **Share result on WhatsApp** — after getting result, share button:
   "My BornClock longevity score is [X] years! Take the quiz yourself: bornclock.com/longevity-calculator"
2. **Download PDF hook** — after result: "Get your personalised 90-day longevity plan → Download Free PDF" → /birthday-report
3. **Comparison teaser** — "How do you compare to the average [country]?" — shows user's score vs national average using country detected or selected
4. **AEO improvement** — Add speakable schema to the results section (Google Assistant can read it):
```json
{"@type":"SpeakableSpecification","xpath":["/html/body//div[@data-testid='result-summary']"]}
```

Tests:
- WhatsApp button renders after result
- WhatsApp message contains score
- PDF CTA links to birthday-report
- Speakable schema present in JSON-LD
- No regressions to existing functionality

```bash
npx vitest run 2>&1 | tail -5
git add src/pages/LongevityCalculatorPage.tsx
git commit -m "feat: longevity calculator upgrade — WhatsApp share result, PDF hook, speakable schema (AEO)"
echo "=== TASK 31 DONE ==="
```

---

## TASK 32 — INTERNAL LINKING SYSTEMATIC SWEEP

This task does a systematic audit and fix — not spot fixes.

**Step 1 — Map what should link to what:**

```
/longevity-calculator         ← should be linked from: all longevity articles (≥2 links each)
/birthday-report              ← should be linked from: all astrology articles (≥2 links each)
/celebrity/                   ← should be linked from: monthly articles, celebrity fitness article
/born-on/[month]/[day]/india/ ← should be linked from: monthly articles
/articles/                    ← should be linked from: homepage, footer, navbar
/articles/numerology-*        ← should link to: /articles/life-path-compatibility (cross-link)
/articles/moon-sign-*         ← should link to: /articles/nakshatra-* (cross-link)
/articles/blue-zones-*        ← should link to: /articles/longevity-foods-india (cross-link)
```

**Step 2 — Check actual links in each file:**
```bash
for f in src/pages/articles/*.tsx; do
  echo "=== $f ==="
  grep -c "birthday-report\|longevity-calculator\|articles/" "$f" || echo "0"
done
```

**Step 3 — Fix any page with < 2 links to its primary CTA:**
For each longevity article: ensure /longevity-calculator appears at least twice.
For each astrology article: ensure /birthday-report appears at least twice.
Add "Related articles" section at bottom of each article with 2-3 cross-links.

**Step 4 — Add /articles/ to main navigation:**
Read existing nav component. Add "Articles" link to desktop nav and Explore dropdown (if not already there from previous work).

**Step 5 — Add internal links to existing pages:**
- Homepage: add "Latest Articles" section with 4-6 recent articles
- Celebrity pages: add "Learn more about [zodiac sign]" linking to relevant zodiac/Rashi articles
- Born-on pages: add "Read: Famous Indians Born in [Month]" linking to monthly articles

Tests:
- /articles/ link appears in nav
- Each longevity article file has ≥2 instances of "longevity-calculator"
- Each astrology article file has ≥2 instances of "birthday-report"
- Homepage has at least 1 link to /articles/

```bash
npx vitest run 2>&1 | tail -5
git add src/ -A
git commit -m "feat: systematic internal linking sweep — all articles properly linked, nav updated, homepage articles section"
echo "=== TASK 32 DONE ==="
```

---

## TASK 33 — OPEN GRAPH IMAGES + TWITTER CARDS

The site currently has OG tags (added in Task 3) but may not have OG images. This matters for WhatsApp share previews.

**Create a single OG image template or use a default:**

Option A (if no image generation available): Use a static default OG image at /og-default.png — this is the bornclock logo/banner. Ensure it's in /public/ and referenced in SEO component.

Option B (if the site already has a public/og*.png): verify it exists and is referenced.

```bash
ls public/ | grep -i "og\|share\|social\|banner"
# If exists → use it
# If not → create a placeholder and note it needs a real image
```

Update SEO component to always include:
```html
<meta property="og:image" content="https://bornclock.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://bornclock.com/og-image.png" />
```

For article pages: add og:type="article" and for celebrity pages add og:type="profile".

Tests:
- SEO component renders og:image meta tag
- og:image URL is absolute (starts with https://)
- twitter:card meta tag present
- og:type is "article" on article pages
- og:type is "website" on homepage/calculator pages

```bash
npx vitest run 2>&1 | tail -5
git add src/components/SEO.tsx public/
git commit -m "feat: OG images + Twitter cards on all pages — WhatsApp share previews, social sharing complete"
echo "=== TASK 33 DONE ==="
```

---

## ══ BUILD F + DEPLOY F ══

```bash
echo "=== BUILD F ==="
BUILD_START=$(date +%s)
time npm run build 2>&1 | tee /tmp/build-f.txt | tail -20
BUILD_ELAPSED=$(($(date +%s) - BUILD_START))
echo "Build time: ${BUILD_ELAPSED}s"
echo "Sitemap URLs: $(grep -c '<loc>' dist/sitemap.xml 2>/dev/null)"

./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/born-on/august/6/" "/articles/" "/articles/famous-people-lived-to-100/" \
           "/articles/age-in-days-hours-minutes/" "/life-expectancy-calculator-singapore-uae/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-f): build F — 366 global pages + article index + all internal links live" --allow-empty
```

---

## ══ BATCH G ══ Tasks 34–38 → Build G → Deploy G

---

## TASK 34 — UK + US + AU LONGEVITY ARTICLES

Three article versions of the country pages (different from the pages — these are editorial articles).

**Article A: `/articles/life-expectancy-calculator-uk-guide`** (Day 43)
**Article B: `/articles/life-expectancy-usa-guide`** (Day 46)
**Article C: `/articles/how-indian-celebrities-stay-fit`** (if not done in Task 25)

Actually better use these slots for:

**Article A: `/articles/life-expectancy-how-it-is-calculated`**
Target: "how is life expectancy calculated" — 8K monthly, educational

Structure: WHO methodology, period vs cohort life tables, 5 key data sources (census, birth registrations, death registrations, health surveys, hospital data), why India's 70.2 might be underestimated (registration completeness), how BornClock adapts for individual variation.

**Article B: `/articles/retirement-age-india-life-expectancy`**
Extension of retirement article — more India-specific: EPFO pension, NPS calculator integration concept, when does it make financial sense to retire early given your BornClock LE score.

**Article C: `/articles/longevity-habits-of-indian-billionaires`**
Mukesh Ambani, Ratan Tata, Azim Premji — documented public information about their health habits. Calculate their Life Path numbers from DOB. Longevity lessons from the ultra-wealthy Indian context.

Tests factory for each (8 tests each, 24 total).

```bash
npx vitest run src/pages/__tests__/LifeExpectancyHowCalculated*.test.tsx --reporter=verbose 2>&1 | tail -10
npx vitest run 2>&1 | tail -5
git add src/pages/articles/*Article.tsx src/pages/__tests__/*.test.tsx
git commit -m "feat: 3 more articles — LE calculation methodology, retirement India, billionaire longevity habits, 24 tests"
echo "=== TASK 34 DONE ==="
```

---

## TASK 35 — SPEAKABLE SCHEMA + AEO ENHANCEMENTS

**Goal:** Make BornClock answers indexable by AI assistants (Alexa, Google Assistant, Siri, Perplexity, ChatGPT).

**Speakable schema** on key pages — marks content that voice assistants should read:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xpath": ["/html/body//h1", "/html/body//div[@data-testid='result-summary']"]
  }
}
```

Add to:
- /longevity-calculator (result summary)
- /birthday-report (key result sections)
- /born-on pages (celebrity twins section)
- Top 10 FAQ articles (the answer to FAQ Q1 is speakable)

**HowTo schema** on longevity quiz article:
```json
{
  "@type": "HowTo",
  "name": "How to Calculate Your Life Expectancy",
  "step": [
    {"@type":"HowToStep","name":"Enter your date of birth","text":"..."},
    {"@type":"HowToStep","name":"Answer 8 lifestyle questions","text":"..."},
    {"@type":"HowToStep","name":"Get your personalised score","text":"..."}
  ]
}
```

**QAPage schema** for born-on pages:
```json
{
  "@type": "QAPage",
  "mainEntity": {
    "@type": "Question",
    "name": "Which celebrities share my birthday on [date]?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "[Celebrity names] were born on [date]."
    }
  }
}
```

Tests:
- Speakable schema present on longevity calculator
- HowTo schema present on longevity quiz article
- QAPage schema present on born-on pages
- All schemas are valid JSON
- No schema conflicts on same page

```bash
npx vitest run 2>&1 | tail -5
git add src/pages/ src/pages/articles/
git commit -m "feat: AEO enhancements — speakable/HowTo/QAPage schemas for AI assistant indexing"
echo "=== TASK 35 DONE ==="
```

---

## TASK 36 — PERFORMANCE + CORE WEB VITALS AUDIT

This is a technical quality task, not content.

```bash
# Check for common performance issues in the built site

echo "=== 1. Bundle size check ==="
du -sh dist/assets/*.js 2>/dev/null | sort -rh | head -10

echo "=== 2. Image optimization check ==="
find dist -name "*.png" -o -name "*.jpg" | while read f; do
  SIZE=$(du -k "$f" | cut -f1)
  [ $SIZE -gt 100 ] && echo "LARGE: ${SIZE}KB — $f"
done

echo "=== 3. Check for render-blocking resources ==="
grep -r "script src\|link href.*stylesheet" dist/index.html 2>/dev/null | head -10

echo "=== 4. Check preconnect hints ==="
grep "preconnect\|dns-prefetch" dist/index.html 2>/dev/null | head -5

echo "=== 5. Check for lazy loading on images ==="
grep -r 'loading="lazy"' src/ --include="*.tsx" | wc -l
```

Fixes to implement:
1. Add `loading="lazy"` to all `<img>` tags that are below-the-fold
2. Add `<link rel="preconnect" href="https://fonts.googleapis.com">` if using Google Fonts
3. Add `fetchPriority="high"` to above-the-fold critical images
4. Verify Cloudflare Workers automatically handles compression (it does — just confirm)

Check for any render-blocking scripts and make them `defer` or `async`.

```bash
npx tsc --noEmit 2>&1 | head -5
npx vitest run 2>&1 | tail -5
git add src/ -A
git commit -m "perf: lazy loading, preconnect hints, fetchPriority — Core Web Vitals improvements"
echo "=== TASK 36 DONE ==="
```

---

## TASK 37 — CELEBRITY PAGE SCHEMA COMPLETENESS AUDIT

**Goal:** Verify all 604 celebrity pages have complete Person + FAQPage + BreadcrumbList schemas.

```bash
# Sample check — test 20 built celebrity pages
python3 << 'PYEOF'
import re, json
from pathlib import Path

celeb_dir = Path('dist/celebrity')
if not celeb_dir.exists():
    print("dist/celebrity not found — build first")
    exit()

pages = list(celeb_dir.rglob('index.html'))
print(f"Total celebrity pages: {len(pages)}")

issues = []
checked = 0

for html_file in pages[:50]:  # Sample 50
    with open(html_file) as f:
        content = f.read()
    
    url = str(html_file.parent).replace(str(Path('dist')), '')
    schemas = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', content, re.DOTALL)
    
    types = []
    for s in schemas:
        try:
            d = json.loads(s.strip())
            types.append(d.get('@type',''))
        except: pass
    
    checked += 1
    if 'Person' not in types:
        issues.append(f"MISSING Person schema: {url}")
    if 'FAQPage' not in types:
        issues.append(f"MISSING FAQPage schema: {url}")
    if 'BreadcrumbList' not in types:
        issues.append(f"MISSING BreadcrumbList schema: {url}")

print(f"Checked: {checked} pages")
print(f"Issues: {len(issues)}")
for i in issues[:20]: print(f"  ❌ {i}")
if not issues: print("✅ All 50 sampled celebrity pages pass schema audit")
PYEOF
```

If issues found: read CelebrityPage.tsx, find the schema section, add missing schemas.

Fix Person schema — must have at minimum:
```json
{"@type":"Person","name":"[name]","birthDate":"[YYYY-MM-DD]","url":"https://bornclock.com/celebrity/[slug]/","nationality":"Indian"}
```

Fix FAQPage — 5 questions specific to that celebrity.
Fix BreadcrumbList — Home → Celebrity Profiles → [Name].

After fixing CelebrityPage.tsx: rebuild and re-run the check.

Tests:
- CelebrityPage renders with Person schema
- Person schema has name, birthDate, url, nationality
- FAQPage schema has 5 questions
- BreadcrumbList has 3 items
- No schema is invalid JSON

```bash
npx vitest run src/pages/__tests__/CelebrityPage.test.tsx --reporter=verbose 2>&1 | tail -15
npx vitest run 2>&1 | tail -5
git add src/pages/CelebrityPage.tsx
git commit -m "fix: celebrity page schema completeness — Person/FAQPage/BreadcrumbList on all 604 celebrity pages"
echo "=== TASK 37 DONE ==="
```

---

## TASK 38 — ROBOTS.TXT + XML SITEMAP + CANONICAL AUDIT

```bash
# Check robots.txt
cat public/robots.txt 2>/dev/null || echo "MISSING"

# Check sitemap is referenced in robots.txt
grep "Sitemap:" public/robots.txt 2>/dev/null || echo "Sitemap reference missing"
```

**robots.txt should contain:**
```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://bornclock.com/sitemap.xml
```

Create/update `public/robots.txt` with the above.

**Canonical audit:**
```bash
python3 << 'PYEOF'
import re
from pathlib import Path

dist_dir = Path('dist')
issues = []

for html_file in list(dist_dir.rglob('index.html'))[:100]:
    with open(html_file) as f:
        content = f.read()
    
    url_path = '/' + str(html_file.parent.relative_to(dist_dir)) + '/'
    
    canonical_match = re.search(r'<link[^>]*rel="canonical"[^>]*href="([^"]*)"', content)
    
    if not canonical_match:
        issues.append(f"NO CANONICAL: {url_path}")
        continue
    
    canonical = canonical_match.group(1)
    
    # Canonical should match the page URL
    if url_path not in canonical and url_path.rstrip('/') not in canonical:
        # Exception: global born-on pages canonicalize to /india/ — that's intentional
        if '/born-on/' in url_path and '/india/' in canonical:
            continue  # This is correct
        issues.append(f"CANONICAL MISMATCH: {url_path} → {canonical}")

print(f"Issues: {len(issues)}")
for i in issues[:20]: print(f"  ❌ {i}")
if not issues: print("✅ All canonical tags correct")
PYEOF
```

Fix any canonical mismatches found.

Tests:
- robots.txt exists and contains Allow and Disallow and Sitemap
- Sitemap URL in robots.txt matches actual sitemap URL
- Sampled pages all have canonical tags

```bash
npx vitest run 2>&1 | tail -5
git add public/robots.txt src/components/SEO.tsx
git commit -m "fix: robots.txt complete + canonical audit passed — all pages correctly canonicalized"
echo "=== TASK 38 DONE ==="
```

---

## ══ BUILD G + DEPLOY G ══

```bash
echo "=== BUILD G ==="
time npm run build 2>&1 | tee /tmp/build-g.txt | tail -20
echo "Sitemap URLs: $(grep -c '<loc>' dist/sitemap.xml 2>/dev/null)"
./node_modules/.bin/wrangler deploy 2>&1 | tail -5
born_on_check

for URL in "/articles/longevity-habits-of-indian-billionaires/" \
           "/articles/life-expectancy-how-it-is-calculated/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://bornclock.com$URL") — $URL"
done

git commit -m "chore(batch-g): build G — all 38 tasks deployed" --allow-empty
```

---

## ══ VALIDATION PHASES ══
## Run after all builds. These audit the actual built site. Fix everything found.

---

## VALIDATION PHASE V1 — SEO AUDIT

**Run against built dist/ directory. Fix all failures. Re-run until clean.**

```bash
echo "=== V1: SEO AUDIT ==="

python3 << 'PYEOF'
import re
from pathlib import Path

dist_dir = Path('dist')
issues = []
checked = 0
title_lengths = []
meta_lengths = []

for html_file in dist_dir.rglob('index.html'):
    with open(html_file, errors='ignore') as f:
        content = f.read()
    
    url = '/' + str(html_file.parent.relative_to(dist_dir)) + '/'
    checked += 1
    
    title = re.search(r'<title>([^<]*)</title>', content)
    title_text = title.group(1) if title else ''
    title_len = len(title_text)
    
    meta = re.search(r'<meta[^>]*name="description"[^>]*content="([^"]*)"', content)
    meta_text = meta.group(1) if meta else ''
    meta_len = len(meta_text)
    
    canonical = re.search(r'<link[^>]*rel="canonical"', content)
    og_title = re.search(r'property="og:title"', content)
    og_desc = re.search(r'property="og:description"', content)
    
    if not title_text:
        issues.append(f"MISSING TITLE: {url}")
    elif title_len > 70:
        issues.append(f"TITLE {title_len}c (>70): {url} | '{title_text[:50]}'")
    else:
        title_lengths.append(title_len)
    
    if not meta_text:
        issues.append(f"MISSING META: {url}")
    elif meta_len > 160:
        issues.append(f"META {meta_len}c (>160): {url}")
    else:
        meta_lengths.append(meta_len)
    
    if not canonical:
        issues.append(f"MISSING CANONICAL: {url}")
    if not og_title:
        issues.append(f"MISSING og:title: {url}")
    if not og_desc:
        issues.append(f"MISSING og:description: {url}")

print(f"Pages checked: {checked}")
print(f"Avg title length: {sum(title_lengths)/len(title_lengths):.0f}c" if title_lengths else "No valid titles")
print(f"Avg meta length: {sum(meta_lengths)/len(meta_lengths):.0f}c" if meta_lengths else "No valid metas")
print(f"Total issues: {len(issues)}")
for i in issues[:30]:
    print(f"  ❌ {i}")
if not issues:
    print("✅ V1 PASS: All pages pass SEO audit")
else:
    print(f"\n⚠️  Fix these {len(issues)} issues in prerender-titles.mjs or SEO component, then rebuild")
PYEOF
```

**If issues found — FIX THEM:**
- Title too long → shorten in prerender-titles.mjs
- Missing meta → add to prerender-titles.mjs
- Missing canonical → fix SEO component
- Missing OG tags → fix SEO component

After fixes, rebuild and re-run audit until zero issues.

```bash
# If fixes required:
npm run build 2>&1 | tail -5
./node_modules/.bin/wrangler deploy 2>&1 | tail -3
born_on_check

git add -A
git commit -m "fix(v1-seo): all title/meta/canonical/OG issues resolved — SEO audit clean"
echo "=== V1 SEO AUDIT COMPLETE ==="
```

---

## VALIDATION PHASE V2 — JSON-LD STRUCTURED DATA AUDIT

```bash
echo "=== V2: JSON-LD AUDIT ==="

python3 << 'PYEOF'
import re, json
from pathlib import Path
from collections import Counter

dist_dir = Path('dist')
issues = []
schema_counts = Counter()
invalid_json = []
checked = 0

REQUIRED_FIELDS = {
    'Article': ['headline', 'description', 'author', 'publisher'],
    'FAQPage': ['mainEntity'],
    'Person': ['name', 'birthDate'],
    'BreadcrumbList': ['itemListElement'],
    'SoftwareApplication': ['name', 'applicationCategory'],
    'HowTo': ['name', 'step'],
}

for html_file in dist_dir.rglob('index.html'):
    with open(html_file, errors='ignore') as f:
        content = f.read()
    url = '/' + str(html_file.parent.relative_to(dist_dir)) + '/'
    checked += 1
    
    schema_strs = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', content, re.DOTALL)
    
    for s in schema_strs:
        try:
            d = json.loads(s.strip())
            t = d.get('@type', 'Unknown')
            schema_counts[t] += 1
            
            # Required fields check
            if t in REQUIRED_FIELDS:
                for field in REQUIRED_FIELDS[t]:
                    if field not in d:
                        issues.append(f"MISSING '{field}' in {t}: {url}")
            
            # FAQPage: check it has questions
            if t == 'FAQPage':
                q = d.get('mainEntity', [])
                if not q or len(q) < 1:
                    issues.append(f"EMPTY FAQPage: {url}")
                elif len(q) < 5 and 'article' in url.lower():
                    issues.append(f"FAQPage only {len(q)} questions (need 5): {url}")
            
            # BreadcrumbList: check has 3 items
            if t == 'BreadcrumbList':
                items = d.get('itemListElement', [])
                if len(items) < 3 and 'article' in url.lower():
                    issues.append(f"BreadcrumbList only {len(items)} items: {url}")
            
            # Person: check birthDate format
            if t == 'Person' and 'birthDate' in d:
                bd = d['birthDate']
                if not re.match(r'\d{4}-\d{2}-\d{2}', str(bd)):
                    issues.append(f"Invalid Person birthDate format '{bd}': {url}")
                    
        except json.JSONDecodeError as e:
            invalid_json.append(f"INVALID JSON: {url} — {str(e)[:60]}")

print(f"Pages checked: {checked}")
print(f"Schema type counts: {dict(schema_counts.most_common(10))}")
print(f"Invalid JSON-LD: {len(invalid_json)}")
for i in invalid_json[:5]: print(f"  ❌ {i}")
print(f"Field/structure issues: {len(issues)}")
for i in issues[:20]: print(f"  ❌ {i}")
if not issues and not invalid_json:
    print("✅ V2 PASS: All JSON-LD schemas valid and complete")
PYEOF
```

**If issues found — FIX THEM:**
- Missing Article field → add to article page template
- FAQPage < 5 questions → add more questions
- Invalid JSON → fix schema syntax
- Missing BreadcrumbList items → check BreadcrumbList template

After fixes, rebuild and re-run.

```bash
git add -A
git commit -m "fix(v2-jsonld): all JSON-LD schema issues resolved — structured data audit clean"
echo "=== V2 JSON-LD AUDIT COMPLETE ==="
```

---

## VALIDATION PHASE V3 — SITEMAP INTEGRITY

```bash
echo "=== V3: SITEMAP INTEGRITY ==="

python3 << 'PYEOF'
import re
from pathlib import Path

# Load sitemap
try:
    with open('dist/sitemap.xml') as f:
        sitemap = f.read()
except:
    print("❌ dist/sitemap.xml not found — build first")
    exit()

sitemap_urls = re.findall(r'<loc>([^<]+)</loc>', sitemap)
sitemap_set = set(sitemap_urls)
print(f"Sitemap URLs: {len(sitemap_urls)}")

# Duplicate check
if len(sitemap_urls) != len(sitemap_set):
    dupes = [u for u in sitemap_urls if sitemap_urls.count(u) > 1]
    print(f"❌ DUPLICATE URLs: {len(set(dupes))} unique duplicates")
    for d in set(dupes)[:10]: print(f"  {d}")
else:
    print("✅ No duplicate URLs")

# Load prerender routes
with open('scripts/prerender-routes.mjs') as f:
    routes_content = f.read()
routes = [r for r in re.findall(r"'(/[^']*)'", routes_content) if r.startswith('/')]
print(f"Prerender routes: {len(routes)}")

# Check routes are in sitemap
missing = []
for route in routes[:200]:  # Check first 200 to avoid timeout
    url = f"https://bornclock.com{route}"
    url_slash = url if url.endswith('/') else url + '/'
    if url not in sitemap_set and url_slash not in sitemap_set:
        missing.append(route)

print(f"Routes missing from sitemap (sample of first 200): {len(missing)}")
for m in missing[:15]: print(f"  ❌ {m}")

# Size check
import os
size_mb = os.path.getsize('dist/sitemap.xml') / (1024 * 1024)
url_count = len(sitemap_urls)
print(f"\nSitemap size: {size_mb:.3f}MB {'✅' if size_mb < 50 else '❌ >50MB LIMIT'}")
print(f"URL count: {url_count} {'✅' if url_count < 50000 else '❌ >50K LIMIT'}")

# Check trailing slash consistency
no_slash = [u for u in sitemap_urls if not u.endswith('/') and '.' not in u.split('/')[-1]]
if no_slash:
    print(f"⚠️  {len(no_slash)} URLs without trailing slash")
    for u in no_slash[:5]: print(f"  {u}")
else:
    print("✅ All URLs have consistent trailing slashes")

if not missing and size_mb < 50 and url_count < 50000:
    print("\n✅ V3 PASS: Sitemap integrity verified")
PYEOF
```

**If missing routes found:** Check why those routes aren't in sitemap. Fix in prerender-routes.mjs and rebuild.

```bash
git add scripts/prerender-routes.mjs
git commit -m "fix(v3-sitemap): all prerender routes present in sitemap — sitemap integrity verified" 2>/dev/null || echo "No sitemap fixes needed"
echo "=== V3 SITEMAP AUDIT COMPLETE ==="
```

---

## VALIDATION PHASE V4 — INTERNAL LINK GRAPH + ORPHAN DETECTION

```bash
echo "=== V4: INTERNAL LINK GRAPH ==="

python3 << 'PYEOF'
import re
from pathlib import Path
from collections import defaultdict

dist_dir = Path('dist')
link_graph = defaultdict(set)
all_pages = set()

for html_file in dist_dir.rglob('index.html'):
    url = '/' + str(html_file.parent.relative_to(dist_dir)) + '/'
    all_pages.add(url)
    with open(html_file, errors='ignore') as f:
        content = f.read()
    for link in re.findall(r'href="(/[^"#?]*)"', content):
        if not any(link.endswith(ext) for ext in ['.js','.css','.png','.jpg','.svg','.ico','.xml','.json','.txt']):
            link_graph[url].add(link if link.endswith('/') else link+'/')

inbound = defaultdict(set)
for page, links in link_graph.items():
    for link in links:
        inbound[link].add(page)

# Find orphans (no inbound internal links)
orphans = sorted([p for p in all_pages if p != '/' and not inbound.get(p)])
print(f"Total pages: {len(all_pages)}")
print(f"Orphan pages (no inbound links): {len(orphans)}")
for o in orphans[:20]:
    print(f"  ⚠️  {o}")

# Key page inbound counts
KEY_PAGES = [
    ('/birthday-report/',          'Birthday Report',          5),
    ('/longevity-calculator/',     'Longevity Calculator',     5),
    ('/celebrity/',                'Celebrity Index',          3),
    ('/articles/',                 'Articles Index',           3),
    ('/born-on/august-6/india/',   'Born-on (sample)',         2),
]
print("\nKey page inbound link counts:")
for path, name, minimum in KEY_PAGES:
    count = len(inbound.get(path, set()))
    icon = '✅' if count >= minimum else '⚠️ '
    print(f"  {icon} {name}: {count} inbound (need ≥{minimum})")

# Article cross-linking
article_pages = [p for p in all_pages if '/articles/' in p and p != '/articles/']
lone_articles = [p for p in article_pages if len(inbound.get(p, set())) < 2]
print(f"\nArticles with < 2 inbound links: {len(lone_articles)}")
for a in lone_articles[:10]: print(f"  ⚠️  {a}")

if len(orphans) == 0 and len(lone_articles) == 0:
    print("\n✅ V4 PASS: No orphan pages, all articles have ≥2 inbound links")
PYEOF
```

**Fix all orphan pages and articles with < 2 inbound links:**
- Add links to orphan pages from the article index, related articles, or homepage
- The most common fix: ensure article index page links to every article
- Ensure Task 32 (internal linking sweep) ran correctly

```bash
git add src/ -A 2>/dev/null
git commit -m "fix(v4-links): orphan pages linked, all articles ≥2 inbound links — link graph clean" 2>/dev/null || echo "No orphan fixes needed"
echo "=== V4 LINK GRAPH COMPLETE ==="
```

---

## VALIDATION PHASE V5 — AEO + GEO VALIDATION

```bash
echo "=== V5: AEO/GEO VALIDATION ==="

python3 << 'PYEOF'
import re, json
from pathlib import Path

dist_dir = Path('dist')
issues = []

# AEO: FAQPage on all article pages
article_pages = list((dist_dir / 'articles').rglob('index.html'))
faq_count = 0
for html_file in article_pages:
    with open(html_file, errors='ignore') as f: content = f.read()
    if 'FAQPage' in content:
        faq_count += 1
    else:
        issues.append(f"AEO — MISSING FAQPage: /articles/{html_file.parent.name}/")

# AEO: Speakable on calculator pages
calc_pages = ['longevity-calculator', 'biological-age-calculator', 'how-long-will-i-live']
for page in calc_pages:
    html_file = dist_dir / page / 'index.html'
    if html_file.exists():
        content = html_file.read_text(errors='ignore')
        if 'speakable' not in content.lower():
            issues.append(f"AEO — MISSING speakable schema: /{page}/")
    else:
        issues.append(f"PAGE NOT FOUND: /{page}/")

# GEO: Person schema on celebrity pages
celeb_pages = list((dist_dir / 'celebrity').rglob('index.html'))
person_count = 0
for html_file in celeb_pages[:100]:
    with open(html_file, errors='ignore') as f: content = f.read()
    if '"Person"' in content or "'Person'" in content:
        person_count += 1
    else:
        issues.append(f"GEO — MISSING Person schema: /celebrity/{html_file.parent.name}/")

# GEO: Article schema on articles
article_schema_count = 0
for html_file in article_pages[:30]:
    with open(html_file, errors='ignore') as f: content = f.read()
    schemas = re.findall(r'application/ld\+json[^>]*>(.*?)</script>', content, re.DOTALL)
    has_article = any('"Article"' in s for s in schemas)
    if has_article:
        article_schema_count += 1
    else:
        issues.append(f"GEO — MISSING Article schema: /articles/{html_file.parent.name}/")

# SoftwareApplication on calculators
for page in ['longevity-calculator', 'biological-age-calculator', 'how-long-will-i-live',
             'life-expectancy-calculator-uk', 'life-expectancy-calculator-australia',
             'life-expectancy-calculator-usa', 'life-expectancy-calculator-canada']:
    html_file = dist_dir / page / 'index.html'
    if html_file.exists():
        content = html_file.read_text(errors='ignore')
        if 'SoftwareApplication' not in content:
            issues.append(f"GEO — MISSING SoftwareApplication: /{page}/")

print(f"Article pages with FAQPage (AEO): {faq_count}/{len(article_pages)}")
print(f"Celebrity pages with Person schema (GEO): {person_count}/100 sampled")
print(f"Article pages with Article schema (GEO): {article_schema_count}/30 sampled")
print(f"\nTotal AEO/GEO issues: {len(issues)}")
for i in issues[:20]: print(f"  ❌ {i}")
if not issues:
    print("✅ V5 PASS: All AEO/GEO schema requirements met")
PYEOF
```

Fix all issues found. Rebuild if needed.

```bash
git add -A
git commit -m "fix(v5-aeogeo): FAQPage/Person/Article/SoftwareApplication/speakable — AEO/GEO ready" 2>/dev/null || echo "No AEO/GEO fixes needed"
echo "=== V5 AEO/GEO COMPLETE ==="
```

---

## VALIDATION PHASE V6 — PRODUCTION SMOKE TEST

**This runs against the live production site — not the local build.**

```bash
echo "=== V6: PRODUCTION SMOKE TEST ==="

# Deploy final version first if any fixes were made in V1-V5
CHANGES=$(git status --porcelain | wc -l)
if [ $CHANGES -gt 0 ]; then
  echo "Uncommitted changes found — building and deploying final fixes"
  npm run build 2>&1 | tail -5
  ./node_modules/.bin/wrangler deploy 2>&1 | tail -3
  born_on_check
fi

python3 << 'PYEOF'
import urllib.request, re, json, time, sys

BASE = "https://bornclock.com"

SMOKE_TESTS = [
    # Core pages
    ("Homepage",                     "/",                                          ["BornClock", "longevity"]),
    ("Birthday Report",              "/birthday-report",                           ["birthday", "report"]),
    ("Sample Report",                "/birthday-report/sample",                    ["sample", "Capricorn"]),
    ("Longevity Calc",               "/longevity-calculator",                      ["longevity", "calculator"]),
    ("Biological Age",               "/biological-age-calculator",                 ["biological", "age"]),
    ("How Long",                     "/how-long-will-i-live",                      ["live", "calculator"]),
    # Country pages
    ("UK Page",                      "/life-expectancy-calculator-uk/",            ["UK", "81"]),
    ("Australia Page",               "/life-expectancy-calculator-australia/",     ["Australia", "83"]),
    ("USA Page",                     "/life-expectancy-calculator-usa/",           ["USA", "79"]),
    ("Canada Page",                  "/life-expectancy-calculator-canada/",        ["Canada", "82"]),
    # Celebrity pages
    ("Celebrity Index",              "/celebrity/",                                ["celebrity", "birthday"]),
    ("Virat Kohli",                  "/celebrity/virat-kohli/",                   ["Virat", "Scorpio"]),
    # Born-on pages
    ("Born-on India",                "/born-on/august-6/india/",                  ["August", "celebrity"]),
    ("Born-on Global",               "/born-on/august/6/",                        ["August"]),
    # Articles
    ("Article Index",                "/articles/",                                 ["articles"]),
    ("Numerology Article",           "/articles/numerology-by-date-of-birth/",    ["Life Path", "calculator"]),
    ("Moon Sign Article",            "/articles/moon-sign-by-date-of-birth/",     ["Rashi", "calculator"]),
    ("Longevity Quiz",               "/articles/longevity-quiz/",                 ["longevity", "quiz"]),
    ("Blue Zones Diet",              "/articles/blue-zones-diet/",                ["Okinawa", "Blue Zone"]),
    ("Nakshatra",                    "/articles/nakshatra-by-date-of-birth/",     ["Nakshatra", "Anuradha"]),
    ("Death Clock Alt",              "/articles/death-clock-alternative/",        ["Death Clock"]),
    ("Bryan Johnson",                "/articles/bryan-johnson-blueprint-alternative/", ["Bryan Johnson"]),
    ("Monthly (January)",            "/articles/famous-indians-born-in-january/", ["January"]),
    ("Zodiac Compat",                "/articles/zodiac-compatibility/",           ["zodiac", "compatible"]),
    ("Biorhythm",                    "/articles/biorhythm-calculator/",           ["biorhythm", "cycle"]),
    ("Life Path Compat",             "/articles/life-path-number-compatibility/", ["Life Path"]),
    ("Tarot Article",                "/articles/tarot-card-by-date-of-birth/",   ["Tarot", "zodiac"]),
    ("Planetary Age",                "/articles/planetary-age-calculator/",       ["Mercury", "planet"]),
    ("Chinese Zodiac",               "/articles/chinese-zodiac-by-year/",         ["Dragon", "1988"]),
    ("Epigenetics",                  "/articles/epigenetics-and-longevity/",      ["epigenetics", "Horvath"]),
    ("Longevity Supplements",        "/articles/longevity-supplements/",          ["Vitamin D", "supplement"]),
    ("Longevity Foods India",        "/articles/longevity-foods-india/",          ["turmeric", "India"]),
    ("Age in Days",                  "/articles/age-in-days-hours-minutes/",      ["days", "heartbeat"]),
    ("Famous People 100",            "/articles/famous-people-lived-to-100/",     ["centenarian", "Blue Zone"]),
    ("Birth Month",                  "/articles/birth-month-personality/",        ["birth month", "zodiac"]),
    ("Hindi Life Exp",               "/hi/life-expectancy-calculator",            ["जीवन"]),
]

PASS = 0; FAIL = 0; results = []

for name, path, keywords in SMOKE_TESTS:
    try:
        req = urllib.request.Request(f"{BASE}{path}", headers={'User-Agent':'BornClock-Smoke/1.0'})
        with urllib.request.urlopen(req, timeout=12) as r:
            status = r.status
            html = r.read().decode('utf-8', errors='ignore')
        
        title_m = re.search(r'<title>([^<]*)</title>', html)
        title = title_m.group(1) if title_m else ''
        title_len = len(title)
        
        schema_count = len(re.findall(r'application/ld\+json', html))
        has_canonical = bool(re.search(r'rel="canonical"', html))
        has_og = bool(re.search(r'property="og:title"', html))
        has_undefined = 'undefined' in html[:10000]
        missing_kw = [kw for kw in keywords if kw.lower() not in html.lower()]
        
        problems = []
        if status != 200: problems.append(f"HTTP {status}")
        if not title: problems.append("No title")
        elif title_len > 70: problems.append(f"Title {title_len}c>70")
        if schema_count == 0: problems.append("No schema")
        if not has_canonical: problems.append("No canonical")
        if not has_og: problems.append("No OG")
        if has_undefined: problems.append("'undefined' in HTML")
        if missing_kw: problems.append(f"Missing keywords: {missing_kw}")
        
        if problems:
            results.append(f"  ❌ {name}: {', '.join(problems)}")
            FAIL += 1
        else:
            results.append(f"  ✅ {name}: {status} | {title_len}c | {schema_count} schemas")
            PASS += 1
        
        time.sleep(0.3)
    except Exception as e:
        results.append(f"  ❌ {name}: {str(e)[:60]}")
        FAIL += 1

print("\n".join(results))
print(f"\n══════════════════════════════════")
print(f"Smoke test: {PASS} PASS, {FAIL} FAIL")
if FAIL == 0:
    print("✅ V6 PASS: All production pages healthy")
else:
    print(f"⚠️  {FAIL} pages need attention — fix and redeploy")
    sys.exit(1 if FAIL > 3 else 0)  # Exit 1 if more than 3 failures
PYEOF
```

For any smoke test failures: investigate, fix, redeploy, re-run V6.

```bash
git add -A
git commit -m "fix(v6-smoke): production smoke test fixes — all pages verified live" 2>/dev/null || echo "Smoke test clean, no fixes needed"
echo "=== V6 PRODUCTION SMOKE TEST COMPLETE ==="
```

---

## PHASE FINAL — PUSH AND COMPLETION REPORT

```bash
cd ~/Development/celeb-clock

# Final test run
echo "=== FINAL UNIT TEST RUN ==="
npx vitest run 2>&1 | tail -8

# Final rebuild with all fixes
npm run build 2>&1 | tail -10

# Push
git checkout main
git merge develop
git push origin main
git push origin develop

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  38-TASK + 6-PHASE VALIDATION SPRINT — COMPLETION REPORT"
echo "══════════════════════════════════════════════════════════════"

echo ""
echo "=== BORN-ON MANIFEST (final) ==="
TITLE=$(curl -s "https://bornclock.com/born-on/august-6/india/" | grep -o "<title>[^<]*</title>")
echo "$TITLE" | grep -qi "august 6" && echo "✅ PASS: $TITLE" || echo "❌ FAIL: $TITLE"

echo ""
echo "=== BIO STATUS ==="
npx tsx scripts/generate-celebrity-bios.ts --status

echo ""
echo "=== ALL NEW PAGES ==="
declare -a CHECK_URLS=(
  "/life-expectancy-calculator-uk/" "/life-expectancy-calculator-australia/"
  "/life-expectancy-calculator-usa/" "/life-expectancy-calculator-canada/"
  "/life-expectancy-calculator-singapore-uae/"
  "/articles/longevity-quiz/" "/articles/bryan-johnson-blueprint-alternative/"
  "/articles/how-to-live-to-100/" "/articles/blue-zones-diet/"
  "/articles/nakshatra-by-date-of-birth/" "/articles/longevity-foods-india/"
  "/articles/life-path-number-compatibility/" "/articles/death-clock-alternative/"
  "/articles/zodiac-compatibility/" "/articles/biorhythm-calculator/"
  "/articles/tarot-card-by-date-of-birth/" "/articles/planetary-age-calculator/"
  "/articles/chinese-zodiac-by-year/" "/articles/famous-indians-born-in-january/"
  "/articles/famous-indians-born-in-august/" "/articles/biological-age-vs-chronological-age/"
  "/articles/vedic-astrology-birth-chart/" "/articles/exercise-and-longevity/"
  "/articles/retirement-planning-life-expectancy/" "/articles/longevity-supplements/"
  "/articles/how-indian-celebrities-stay-fit/" "/articles/age-in-days-hours-minutes/"
  "/articles/famous-people-lived-to-100/" "/articles/birth-month-personality/"
  "/articles/epigenetics-and-longevity/" "/articles/life-expectancy-by-country-2026/"
  "/articles/how-long-will-i-live-in-india/" "/articles/"
  "/hi/life-expectancy-calculator" "/hi/numerology-by-date-of-birth"
  "/born-on/august/6/"
)
PASS_COUNT=0; FAIL_COUNT=0
for URL in "${CHECK_URLS[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://bornclock.com$URL")
  [ "$CODE" = "200" ] && { echo "✅ $CODE $URL"; PASS_COUNT=$((PASS_COUNT+1)); } \
                      || { echo "❌ $CODE $URL"; FAIL_COUNT=$((FAIL_COUNT+1)); }
done
echo "Pages: $PASS_COUNT pass, $FAIL_COUNT fail"

echo ""
echo "=== SITEMAP ==="
curl -s "https://bornclock.com/sitemap.xml" | grep -c "<loc>" && echo " total URLs in sitemap"

echo ""
echo "=== UNIT TESTS ==="
npx vitest run 2>&1 | tail -5

echo ""
echo "=== GIT COMMITS THIS SESSION ==="
git log --oneline | head -45

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "TASKS COMPLETED:"
echo "  1.  All 598 celebrity bios"
echo "  2.  UK/AU/USA/Canada life expectancy pages"
echo "  3.  hreflang + Open Graph on all pages"
echo "  4.  FAQ schema on 3 global landing pages"
echo "  5.  Life Expectancy by Country + India articles"
echo "  6.  Biological Age vs Chronological Age article"
echo "  7.  Vedic Astrology Birth Chart article"
echo "  8.  Longevity Quiz article"
echo "  9.  Bryan Johnson Blueprint article"
echo "  10. How to Live to 100 article"
echo "  11. Exercise and Longevity article"
echo "  12. Blue Zones Diet article"
echo "  13. Nakshatra by Date of Birth article"
echo "  14. Longevity Foods India article"
echo "  15. Life Path Compatibility article"
echo "  16. Death Clock Alternative article"
echo "  17. Retirement Planning + Life Expectancy article"
echo "  18. All 12 Famous Indians Born in [Month] articles"
echo "  19. Zodiac Compatibility article"
echo "  20. Biorhythm Calculator article"
echo "  21. Tarot Card by Date of Birth article"
echo "  22. Planetary Age + Chinese Zodiac articles"
echo "  23. Birth Month Personality + Epigenetics articles"
echo "  24. Longevity Supplements article"
echo "  25. How Indian Celebrities Stay Fit article"
echo "  26. Age in Days/Hours/Minutes + Singapore/UAE page"
echo "  27. Famous People Who Lived to 100 article"
echo "  28. 3 Hindi articles (जीवन प्रत्याशा/अंकज्योतिष/मेरी)"
echo "  29. 366 global born-on pages (canonical to /india/)"
echo "  30. Article Index + BreadcrumbList on all articles"
echo "  31. Longevity Calculator WhatsApp share + speakable"
echo "  32. Systematic internal linking sweep"
echo "  33. Open Graph images + Twitter Cards"
echo "  34. 3 additional longevity articles"
echo "  35. AEO speakable + HowTo + QAPage schemas"
echo "  36. Performance audit (lazy loading, preconnect)"
echo "  37. Celebrity page schema completeness audit"
echo "  38. robots.txt + canonical audit"
echo ""
echo "VALIDATION PHASES COMPLETED:"
echo "  V1. SEO Audit — title/meta/canonical/OG all pages ✅"
echo "  V2. JSON-LD Audit — all schemas valid and complete ✅"
echo "  V3. Sitemap Integrity — all routes in sitemap ✅"
echo "  V4. Internal Link Graph — no orphan pages ✅"
echo "  V5. AEO/GEO Validation — FAQPage/Person/speakable ✅"
echo "  V6. Production Smoke Test — 37 pages verified live ✅"
echo ""
echo "WHAT REMAINS (manual tasks only):"
echo "  Day 11: Instagram content calendar (ask Claude separately)"
echo "  Day 13/27: Quora answers (manual posting)"
echo "  Day 17/19: Reddit posts (manual posting)"
echo "  Day 22: Product Hunt launch (manual, requires prep)"
echo "  Day 34: HARO setup (manual)"
echo "  Day 40: Guest post outreach (manual)"
echo "══════════════════════════════════════════════════════════════"
```

---

## EXECUTE COMMAND

```
Read prompts/BornClock_38Task_Validation_Sprint.md carefully and execute it completely, PHASE 1 through PHASE FINAL including all 38 tasks, all 7 build batches, and all 6 validation phases. Execute all tasks sequentially. If any task fails after one fix attempt, commit partial work and move immediately to the next task. Validation phases must fix all issues found before marking pass. Do not stop. Do not ask for approval.
```
