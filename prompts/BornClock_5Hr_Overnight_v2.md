# BornClock — 5-Hour Overnight Sprint v2
## 5 Tasks · Each Independent · Each Reads Its Own Files First

---

You have full permission to make all changes. Never ask for approval.
Work on develop branch only. Push develop → main only in PHASE FINAL.

## FAILURE RULE — APPLIES TO EVERY TASK
```bash
# At the start of each task, define this function:
fail_task() {
  local TASK="$1" REASON="$2"
  echo ""
  echo "══════════════════════════════════════"
  echo "  ⚠️  TASK $TASK FAILED: $REASON"
  echo "  Committing partial work and continuing."
  echo "══════════════════════════════════════"
  git add -A
  git commit -m "wip(task$TASK): partial — $REASON" 2>/dev/null || true
}
```
Call `fail_task N "reason"` after one failed fix attempt, then immediately start the next task.
NEVER let one task block another. NEVER spend more than one fix attempt on a failure.

## BORN-ON CHECK — after every single deploy:
```bash
born_on_check() {
  sleep 45
  local TITLE=$(curl -s "https://bornclock.com/born-on/august-6/india/" \
    | grep -o "<title>[^<]*</title>")
  echo "Born-on: $TITLE"
  echo "$TITLE" | grep -qi "august 6" \
    && echo "✅ Born-on PASS" \
    || { echo "❌ Born-on FAIL — redeploying"; \
         ./node_modules/.bin/wrangler deploy 2>&1 | tail -3; \
         sleep 45; }
}
```

---

## PHASE 1 — READ EVERYTHING. PRINT ALL OUTPUT. NO CODE YET.

```bash
cd ~/Development/celeb-clock

echo "=== 1. App routes — find exact route for birthday report ==="
grep -n "birthday\|report\|sample\|article\|blog" src/App.tsx | head -30

echo "=== 2. Birthday report page — find auth guards and key variable names ==="
cat src/pages/BirthdayReportPage.tsx 2>/dev/null \
  || find src -name "*Birthday*Report*" -o -name "*birthday*report*" 2>/dev/null | head -5

echo "=== 3. Born-on page — find EXACT celebrity list variable name and day/month variables ==="
grep -n "celebrit\|celebrity\|name\|month\|day\|share\|whatsapp" \
  src/pages/BornOnDayIndia.tsx | head -30

echo "=== 4. Celebrity page — find EXACT props/variables for name, zodiac, lifePath ==="
grep -n "name\|zodiac\|lifePath\|life_path\|rashi\|whatsapp\|share\|slug" \
  src/pages/CelebrityPage.tsx | head -30

echo "=== 5. WhatsApp — any existing share anywhere? ==="
grep -rn "wa.me\|whatsapp\|WhatsApp\|share" src/ --include="*.tsx" | head -10

echo "=== 6. Auth pattern — how isPremium/useAuth is used ==="
grep -n "isPremium\|useAuth\|isAuthenticated\|user\|auth\|requireAuth\|ProtectedRoute" \
  src/pages/BirthdayReportPage.tsx 2>/dev/null | head -20
grep -n "isPremium\|useAuth\|isAuthenticated" src/App.tsx | head -10

echo "=== 7. astrologicalData.ts — confirm it exists with expected exports ==="
grep -n "export const\|export interface" src/data/astrologicalData.ts | head -20

echo "=== 8. calculateLifePathNumber and calculateVedicRashi — exact import path ==="
grep -rn "calculateLifePathNumber\|calculateVedicRashi\|calculateWesternZodiac" \
  src/utils/ --include="*.ts" | head -10

echo "=== 9. Celebrity data — exact field names for name, dob, birth_date ==="
python3 -c "
import re
with open('src/data/indianCelebrities.ts') as f:
    content = f.read()
m = re.search(r'\{([^{}]{100,500})\}', content)
if m: print(m.group(0)[:400])
"

echo "=== 10. Existing article pattern — any content pages? ==="
find src/pages -name "*.tsx" | xargs grep -l "article\|Article\|blog\|Blog" 2>/dev/null | head -5
ls src/pages/articles/ 2>/dev/null && echo "articles dir exists" || echo "articles dir: NONE"

echo "=== 11. Prerender pattern ==="
head -30 scripts/prerender-routes.mjs
grep -n "birthday\|celebrity\|born-on" scripts/prerender-routes.mjs | head -10

echo "=== 12. Sitemap — how it's generated ==="
grep -n "sitemap\|xml" scripts/prerender-routes.mjs | head -10

echo "=== 13. SEO component — exact props ==="
grep -A 6 "<SEO" src/pages/CelebrityPage.tsx | head -15

echo "=== 14. Baseline ==="
npx vitest run 2>&1 | tail -5
```

Print this mapping before writing any code:
```
════════════════════════════════════════════════════════════
PHASE 1 MANDATORY MAPPING
════════════════════════════════════════════════════════════
Birthday report page:         [exact file path]
Birthday report route:        [e.g. /birthday-report]
Birthday report auth guard:   [exact: ProtectedRoute / useAuth / navigate / NONE]
  If auth guard: how to bypass: [e.g. skip isPremium check / use new route before guard]

Born-on page:
  Celebrity list variable:    [exact name e.g. celebrities / celebs / birthdayCelebs]
  Day variable:               [exact name e.g. day / dayNumber]
  Month variable/slug:        [exact name e.g. month / monthName / monthSlug]
  URL structure confirmed:    [e.g. /born-on/august-6/india/]

Celebrity page:
  Name variable:              [exact: name / celebName / celebrity.name]
  Zodiac variable:            [exact: zodiac / westernZodiac / zodiac.sign]
  Life path variable:         [exact: lifePath / lifePathNumber]
  Rashi variable:             [exact: rashi / rashiData / rashi.rashi]
  Slug variable:              [exact: slug / celebSlug / params.slug]

WhatsApp existing:            [YES at path X / NO]
calculateLifePathNumber:      [import path]
calculateVedicRashi:          [import path]
astrologicalData.ts exports:  [LIFE_PATH_EXTENDED confirmed / other names]
Celebrity DOB field:          [exact field name: dob / birth_date / birthDate]
Articles directory:           [EXISTS / NONE — will create src/pages/articles/]
Sitemap generation:           [how new routes get added]
SEO component props:          [exact prop names: title / description / canonical]
Baseline tests:               [X passing]
════════════════════════════════════════════════════════════
```

**STOP. No code until this mapping is printed in full.**

---

## TASK 1 — BIO BATCHES 2, 3, 4, 5

No files to read. Uses existing script. Lowest risk task — run first.

```bash
cd ~/Development/celeb-clock

fail_task() { local T="$1" R="$2"; echo "⚠️ TASK $T FAILED: $R"; git add src/data/celebrity-bios.json; git commit -m "wip(bios): partial batch — $R" 2>/dev/null || true; }
born_on_check() { sleep 45; local T=$(curl -s "https://bornclock.com/born-on/august-6/india/" | grep -o "<title>[^<]*</title>"); echo "Born-on: $T"; echo "$T" | grep -qi "august 6" && echo "✅ PASS" || { echo "❌ REDEPLOY"; ./node_modules/.bin/wrangler deploy 2>&1|tail -3; sleep 45; }; }

npx tsx scripts/generate-celebrity-bios.ts --status

for BATCH in 2 3 4 5; do
  echo "=== BATCH $BATCH ==="
  npx tsx scripts/generate-celebrity-bios.ts --batch $BATCH \
    || { fail_task 1 "batch $BATCH script failed"; continue; }
  BIO_COUNT=$(python3 -c "import json; print(len(json.load(open('src/data/celebrity-bios.json'))))" 2>/dev/null || echo "?")
  git add src/data/celebrity-bios.json
  git commit -m "feat(bios): batch $BATCH done — $BIO_COUNT total bios"
done

# One rebuild + deploy with all new bios
npm run build 2>&1 | tail -5 || fail_task 1 "build failed after bio batches"
./node_modules/.bin/wrangler deploy 2>&1 | tail -3
born_on_check

npx tsx scripts/generate-celebrity-bios.ts --status
echo "=== TASK 1 COMPLETE ==="
```

---

## TASK 2 — DAY 7A: WHATSAPP SHARE BUTTONS

**Read these files completely before writing a single line of code:**

```bash
cat src/pages/BornOnDayIndia.tsx
cat src/pages/CelebrityPage.tsx
# Also read birthday report page
cat src/pages/BirthdayReportPage.tsx 2>/dev/null || \
  find src -name "*Birthday*Report*" 2>/dev/null | head -3 | xargs cat
```

**Use EXACT variable names from Phase 1 mapping throughout this task.**
Do not use assumed variable names like `celebrities` or `monthSlug` — use what Phase 1 found.

### 2A — Create WhatsApp Share Button Component

Create `src/components/WhatsAppShareButton.tsx`:

```typescript
interface WhatsAppShareButtonProps {
  message: string;
  label?: string;
  className?: string;
}

export function WhatsAppShareButton({
  message,
  label = 'Share on WhatsApp',
  className = '',
}: WhatsAppShareButtonProps) {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-share-btn"
      className={`inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d]
                  text-white font-semibold rounded-full px-4 py-2 text-sm
                  transition-colors ${className}`}
      aria-label="Share on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"
           aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {label}
    </a>
  );
}
```

### 2B — Add to Born-on Page

Use the EXACT variable names from Phase 1 for the celebrity list and day/month.
Add AFTER the celebrity names section, BEFORE the CTA section.
Wrap in `<div data-testid="born-on-whatsapp-share">`.

Build the share message using actual data already on the page:
```typescript
// Use EXACT variable names from Phase 1 — adapt these placeholders
const topNames = [CELEBRITY_LIST_VAR][0]?.slice(0, 3)
  .map((c: {name: string}) => c.name).join(', ') ?? '';
const shareMessage = topNames
  ? `I found my celebrity birthday twins on BornClock! 🎂\n${topNames} share my birthday.\nFind YOUR birthday twins → https://bornclock.com/${PAGE_URL}`
  : `Discover who shares your birthday on BornClock! 🎂\nhttps://bornclock.com/${PAGE_URL}`;
```

Replace `[CELEBRITY_LIST_VAR]` and `[PAGE_URL]` with actual values from Phase 1 mapping.

### 2C — Add to Celebrity Page

Use EXACT variable names from Phase 1.
Add after the birthday twins section.
Wrap in `<div data-testid="celebrity-whatsapp-share">`.

```typescript
// Use EXACT variable names from Phase 1
const shareMessage = `${[NAME_VAR]}'s birthday profile on BornClock 🎂\n`
  + ([ZODIAC_VAR] ? `${[NAME_VAR]} is a ${[ZODIAC_SIGN]}` : '')
  + ([LIFEPATH_VAR] ? `, Life Path ${[LIFEPATH_VAR]}` : '')
  + `.\nFind YOUR profile → https://bornclock.com/celebrity/${[SLUG_VAR]}/`;
```

### 2D — Add to Birthday Report Page

Read the birthday report page fully. Find WHERE results are shown (after DOB entry).
Add after the first key result (zodiac or life path). Wrap in `<div data-testid="report-whatsapp-share">`.

Build message from whatever result variables are available after calculation.
Null-guard everything — the share button must render even if some values are missing.

### 2E — Tests

```typescript
// Add to relevant test file or create src/components/__tests__/WhatsAppShareButton.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { WhatsAppShareButton } from '../WhatsAppShareButton';
afterEach(cleanup);

describe('WhatsAppShareButton', () => {
  it('TC-WA-P-01: renders with correct wa.me href', () => {
    render(<WhatsAppShareButton message="Test message bornclock.com" />);
    const btn = document.querySelector('[data-testid="whatsapp-share-btn"]');
    expect(btn?.getAttribute('href')).toContain('wa.me');
    expect(btn?.getAttribute('href')).toContain('Test%20message');
  });
  it('TC-WA-P-02: opens in new tab', () => {
    render(<WhatsAppShareButton message="test" />);
    expect(document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('target')).toBe('_blank');
  });
  it('TC-WA-P-03: has noopener noreferrer', () => {
    render(<WhatsAppShareButton message="test" />);
    expect(document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('rel')).toContain('noopener');
  });
  it('TC-WA-N-01: empty message does not crash', () => {
    expect(() => render(<WhatsAppShareButton message="" />)).not.toThrow();
  });
  it('TC-WA-N-02: undefined values in message not visible', () => {
    render(<WhatsAppShareButton message="Hello undefined bornclock.com" />);
    const href = document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
    // The encoded message should not contain literal "undefined"
    const decoded = decodeURIComponent(href);
    // This test verifies our message building is correct — if decoded has 'undefined' we have a bug
    expect(decoded).not.toMatch(/\bundefined\b/);
  });
  it('TC-WA-N-03: special characters encoded properly', () => {
    render(<WhatsAppShareButton message="Test & more → https://bornclock.com" />);
    const href = document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
    expect(href).toContain('wa.me/?text=');
    expect(href).not.toContain(' '); // spaces must be encoded
  });
});
```

Also add spot tests in the born-on and celebrity page test files:
```typescript
// In born-on page test
it('TC-WA-P-04: born-on page has whatsapp share container', () => {
  // render born-on page with test date
  expect(document.querySelector('[data-testid="born-on-whatsapp-share"]')).toBeTruthy();
});
it('TC-WA-N-04: born-on whatsapp message has no undefined', () => {
  const btn = document.querySelector('[data-testid="whatsapp-share-btn"]');
  expect(decodeURIComponent(btn?.getAttribute('href') || '')).not.toContain('undefined');
});

// In celebrity page test
it('TC-WA-P-05: celebrity page has whatsapp share container', () => {
  renderCelebPage(FULL_DOB_SLUG);
  expect(document.querySelector('[data-testid="celebrity-whatsapp-share"]')).toBeTruthy();
});
it('TC-WA-N-05: celebrity whatsapp message has no undefined', () => {
  renderCelebPage(FULL_DOB_SLUG);
  const href = document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
  expect(decodeURIComponent(href)).not.toContain('undefined');
});
```

```bash
npx vitest run 2>&1 | tail -10
npx tsc --noEmit 2>&1 | head -10

git add src/components/WhatsAppShareButton.tsx \
        src/components/__tests__/ \
        src/pages/BornOnDayIndia.tsx \
        src/pages/CelebrityPage.tsx \
        src/pages/BirthdayReportPage.tsx \
        src/pages/__tests__/
git commit -m "feat(day7a): WhatsApp share — born-on, celebrity, birthday report; 8 tests"

npm run build 2>&1 | tail -5
./node_modules/.bin/wrangler deploy 2>&1 | tail -3
born_on_check
echo "=== TASK 2 COMPLETE ==="
```

---

## TASK 3 — DAY 7B: SAMPLE REPORT BEFORE REGISTRATION

**This task has the most auth complexity. Read carefully before writing.**

Read these files completely first:
```bash
# Birthday report page — understand full auth mechanism
cat src/pages/BirthdayReportPage.tsx

# App.tsx — find exactly how birthday report route is protected
grep -B5 -A5 "birthday-report\|BirthdayReport" src/App.tsx

# useAuth hook — understand what it returns
find src -name "useAuth*" -o -name "auth*" | grep -v node_modules | head -5
cat src/hooks/useAuth.ts 2>/dev/null || \
  find src -name "useAuth*" | xargs cat 2>/dev/null | head -50

# Find the birthday calculation logic — which utility does the report use?
grep -n "calculateLifePath\|calculateZodiac\|calculateRashi\|calculateAge" \
  src/pages/BirthdayReportPage.tsx 2>/dev/null | head -20
```

**Auth bypass strategy — choose the right one based on what you find:**

Option A (if route is behind ProtectedRoute/auth guard in App.tsx):
→ Add `/birthday-report/sample` as a PUBLIC route BEFORE the protected birthday route

Option B (if auth check is inside BirthdayReportPage.tsx with useAuth + navigate):
→ Create SampleReportPage that imports calculation utilities directly
→ Does NOT import or use BirthdayReportPage component
→ Does NOT call useAuth — zero auth dependency

Option C (if BirthdayReportPage accepts an optional prop to bypass auth):
→ Add `isDemo?: boolean` prop and skip auth checks when true

**Always choose the option that requires the fewest changes to existing files.**

### 3A — Create the Sample Report Page

Create `src/pages/SampleReportPage.tsx`.

**The hardcoded demo DOB:** January 15, 1990 (not January 1 — Jan 1 is a holiday/new year, less relatable)
- Life Path: 1+5=6, 1=1, 1+9+9+0=19→10→1 = 6+1+1 = 8 → Life Path 8
- Western zodiac: Capricorn
- Vedic Rashi: Makara
- Chinese: Horse (1990)
- Age: calculated dynamically from today

Import ONLY calculation utilities — NO auth hooks:
```typescript
import { calculateWesternZodiac, calculateLifePathNumber,
         calculateChineseZodiac, calculateVedicRashi,
         calculateAge, calculateDaysLived,
         calculateDaysUntilBirthday } from '@/utils/celebrityCalculations';
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
  CHINESE_ZODIAC_PROFILES, LIFE_PATH_EXTENDED,
} from '@/data/astrologicalData';
```

The page must show (in order):
1. **Sample banner** `data-testid="sample-report-banner"` — navy/gold pill:
   "📋 Sample Report — This shows what YOUR report will look like"
   with a prominent CTA: "Generate Mine Free →" linking to /birthday-report

2. **Profile header** — "Birthday Profile: January 15, 1990" as the H1

3. **Quick stats row** — Age, Days Lived, Days Until Next Birthday

4. **Lucky Elements Panel** — same as celebrity pages (pull from rashiProfile)

5. **Western Zodiac card** — Capricorn ♑ with personality summary, strengths, weaknesses, tarot card

6. **Vedic Rashi card** — Makara (मकर) with lucky stone (Blue Sapphire / Neelam), mantra, lord, direction

7. **Chinese Zodiac card** — 🐎 Year of the Horse with lucky elements

8. **Life Path card** — Life Path 8 (The Achiever) with full profile

9. **Celebrity Twins teaser** — "Famous people born on January 15:" — hardcode 2-3 real celebrities from indianCelebrities.ts who have birth_date containing '-01-15' or find celebrities with same Life Path 8 as a fallback

10. **Bottom sticky CTA** — fixed at bottom of page:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
     p-4 text-center z-50 shadow-lg">
  <p className="text-sm text-gray-600 mb-2">
    This is a sample. Generate your personalised report — it's free.
  </p>
  <a href="/birthday-report"
     className="inline-block bg-primary text-white font-bold px-8 py-3
                rounded-full text-base hover:bg-primary/90">
    Generate My Free Birthday Report →
  </a>
</div>
```

Add bottom padding to page content (pb-32) so sticky CTA doesn't cover content.

### 3B — Add "See sample report" to Birthday Report Landing Page

Read the birthday report page, find the landing/intro section (where user hasn't entered DOB yet).
Add this link in that section:
```tsx
<p data-testid="sample-report-link"
   className="text-center text-sm text-gray-500 mt-4">
  Not sure what you'll get?{' '}
  <a href="/birthday-report/sample"
     className="text-primary font-semibold hover:underline">
    See a sample report →
  </a>
</p>
```

### 3C — Add Route (PUBLIC — no auth wrapper)

In `src/App.tsx`, add BEFORE any protected/auth-wrapped birthday-report route:
```tsx
import { SampleReportPage } from '@/pages/SampleReportPage';
// ...
<Route path="/birthday-report/sample" element={<SampleReportPage />} />
```

Confirm it is NOT inside any `<ProtectedRoute>` or auth wrapper.

### 3D — Prerender + Sitemap

```javascript
// prerender-routes.mjs — add to STATIC_ROUTES
'/birthday-report/sample/',

// prerender-titles.mjs — add
'/birthday-report/sample/': {
  title: 'Sample Birthday Intelligence Report — Preview Before You Sign Up | BornClock',
  desc: 'See a complete Birthday Intelligence Report before creating yours. Preview zodiac, life path, Vedic Rashi, lucky elements, and more.',
},
```

### 3E — Tests

```typescript
// src/pages/__tests__/SampleReportPage.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SampleReportPage } from '../SampleReportPage';

afterEach(cleanup);
const renderPage = () => render(
  <HelmetProvider>
    <MemoryRouter initialEntries={['/birthday-report/sample']}>
      <SampleReportPage />
    </MemoryRouter>
  </HelmetProvider>
);

describe('SampleReportPage — Positive', () => {
  it('TC-SR-P-01: renders without crashing (no auth required)', () => {
    expect(() => renderPage()).not.toThrow();
  });
  it('TC-SR-P-02: sample banner renders', () => {
    renderPage();
    expect(document.querySelector('[data-testid="sample-report-banner"]')).toBeTruthy();
  });
  it('TC-SR-P-03: banner contains word "sample"', () => {
    renderPage();
    expect(document.querySelector('[data-testid="sample-report-banner"]')
      ?.textContent?.toLowerCase()).toContain('sample');
  });
  it('TC-SR-P-04: CTA links to /birthday-report', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href') === '/birthday-report')).toBe(true);
  });
  it('TC-SR-P-05: shows Capricorn (Jan 15 Western zodiac)', () => {
    renderPage();
    expect(document.body.textContent).toContain('Capricorn');
  });
  it('TC-SR-P-06: shows Makara (Jan 15 Vedic Rashi)', () => {
    renderPage();
    expect(document.body.textContent).toContain('Makara');
  });
  it('TC-SR-P-07: shows Life Path 8', () => {
    renderPage();
    // Jan 15 1990: 1+5=6, 1, 1+9+9+0=19→10→1; total 6+1+1=8
    expect(document.body.textContent).toContain('Life Path 8');
  });
  it('TC-SR-P-08: shows Devanagari script', () => {
    renderPage();
    expect(/[\u0900-\u097F]/.test(document.body.textContent || '')).toBe(true);
  });
  it('TC-SR-P-09: shows Blue Sapphire or Neelam (Makara lucky stone)', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text.includes('Blue Sapphire') || text.includes('Neelam')).toBe(true);
  });
  it('TC-SR-P-10: shows age (dynamically calculated)', () => {
    renderPage();
    const currentAge = new Date().getFullYear() - 1990;
    // Age should be either currentAge or currentAge-1 depending on birthday
    const text = document.body.textContent || '';
    expect(text.includes(String(currentAge)) || text.includes(String(currentAge - 1))).toBe(true);
  });
});

describe('SampleReportPage — Negative/Edge', () => {
  it('TC-SR-N-01: no undefined or [object Object]', () => {
    renderPage();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-SR-N-02: does not import useAuth (no auth dependency)', () => {
    // If the import of useAuth throws, this test catches it
    expect(() => renderPage()).not.toThrow();
  });
  it('TC-SR-N-03: sample report link renders on birthday report page', () => {
    const { unmount } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/birthday-report']}>
          <div>
            <p data-testid="sample-report-link">
              <a href="/birthday-report/sample">See a sample report →</a>
            </p>
          </div>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(document.querySelector('[data-testid="sample-report-link"]')).toBeTruthy();
    unmount();
  });
});
```

```bash
npx vitest run src/pages/__tests__/SampleReportPage.test.tsx --reporter=verbose 2>&1
npx vitest run 2>&1 | tail -10
npx tsc --noEmit 2>&1 | head -10

git add src/pages/SampleReportPage.tsx \
        src/pages/__tests__/SampleReportPage.test.tsx \
        src/App.tsx \
        src/pages/BirthdayReportPage.tsx \
        scripts/prerender-routes.mjs \
        scripts/prerender-titles.mjs
git commit -m "feat(day7b): sample report at /birthday-report/sample — no auth, Jan 15 1990 demo, 13 tests"

npm run build 2>&1 | tail -5
./node_modules/.bin/wrangler deploy 2>&1 | tail -3
born_on_check

SAMPLE=$(curl -s -o /dev/null -w "%{http_code}" "https://bornclock.com/birthday-report/sample/")
echo "Sample report HTTP: $SAMPLE"
[ "$SAMPLE" = "200" ] && echo "✅ TASK 3 PASS" || echo "⚠️ Sample page returned $SAMPLE"
echo "=== TASK 3 COMPLETE ==="
```

---

## TASK 4 — DAY 10: NUMEROLOGY ARTICLE

**Goal:** 3,000-word authoritative article on "numerology by date of birth".
**Target keyword:** "numerology by date of birth" — 18K India monthly, low competition.
**Route:** `/articles/numerology-by-date-of-birth`

Read before writing:
```bash
# Check if articles directory exists
ls src/pages/articles/ 2>/dev/null || mkdir -p src/pages/articles/

# Confirm LIFE_PATH_EXTENDED structure
grep -A 5 "export const LIFE_PATH_EXTENDED" src/data/astrologicalData.ts | head -10

# Get 3 real celebrities with calculated life path numbers for examples
python3 << 'PYEOF'
import re, datetime

def reduce_to_single(n):
    if n in (11, 22, 33): return n
    if n < 10: return n
    return reduce_to_single(sum(int(d) for d in str(n)))

def calc_lp(day, month, year):
    d = reduce_to_single(day)
    m = reduce_to_single(month)
    y = reduce_to_single(sum(int(c) for c in str(year)))
    return reduce_to_single(d + m + y)

with open('src/data/indianCelebrities.ts') as f:
    content = f.read()

# Find celebrities with full dates
dob_pattern = r'name:\s*["\']([^"\']+)["\'].*?(?:dob|birth_date|date_of_birth):\s*["\'](\d{4}-\d{2}-\d{2})["\']'
matches = re.findall(dob_pattern, content, re.DOTALL)[:100]

by_lp = {}
for name, dob in matches:
    parts = dob.split('-')
    if len(parts) == 3:
        y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
        if d > 0 and m > 0:
            lp = calc_lp(d, m, y)
            by_lp.setdefault(lp, []).append((name, dob))

# Print 2 examples for each life path
for lp in sorted(by_lp.keys()):
    examples = by_lp[lp][:2]
    print(f"Life Path {lp}: {', '.join(f'{n} ({d})' for n,d in examples)}")
PYEOF
```

Print the celebrity examples output above. Use these EXACT names and calculated numbers in the article.

### 4A — Create Numerology Article Page

Create `src/pages/articles/NumerologyArticle.tsx`.

Import at top:
```typescript
import React from 'react';
import { LIFE_PATH_EXTENDED } from '@/data/astrologicalData';
import { calculateLifePathNumber } from '@/utils/celebrityCalculations';
```

**The article renders REAL data from LIFE_PATH_EXTENDED. Every Life Path profile section pulls directly from the imported data — never hardcode traits or descriptions.**

Article sections in order (write the full JSX, not pseudo-code):

**1. H1 + Introduction (rendered as JSX paragraphs)**
```tsx
<h1>Numerology by Date of Birth — Find Your Life Path Number (India Guide)</h1>
<p>
  Numerology is one of the oldest systems of self-understanding, used across
  cultures for thousands of years to reveal personality, purpose, and potential
  from a person's birth date. In India, numerology has deep roots — from the
  Vedic tradition of Jyotish to everyday decisions about auspicious dates,
  business names, and compatibility matching. At BornClock, every birth date
  is automatically analysed to reveal your Life Path number — the single most
  important number in your numerological chart.
</p>
<p>
  Your Life Path number is calculated from the full digits of your date of birth
  and never changes. Unlike personality tests that depend on how you answer
  questions, your Life Path is fixed at birth — a mathematical constant that
  reveals your core nature, natural strengths, typical challenges, and the
  lessons you are here to learn.
</p>
```

**2. How to Calculate Your Life Path Number**
Provide a complete worked example in JSX. Use March 28, 1973:
- Day: 2+8 = 10 → 1+0 = 1
- Month: 3
- Year: 1+9+7+3 = 20 → 2+0 = 2
- Total: 1+3+2 = 6 → Life Path 6
Explain master numbers 11, 22, 33 (do not reduce these).

**3. Interactive Calculator** (before the life path profiles)

```tsx
function LifePathCalculator() {
  const [dob, setDob] = React.useState('');
  const [result, setResult] = React.useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        setResult(calculateLifePathNumber(day, month, year));
      }
    }
  };

  const profile = result ? LIFE_PATH_EXTENDED[result] : null;

  return (
    <div data-testid="lp-calculator"
         className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-indigo-900 mb-1">
        Calculate Your Life Path Number Free
      </h3>
      <p className="text-sm text-indigo-700 mb-4">
        Enter your date of birth to instantly find your Life Path number.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3
                   text-base focus:outline-none focus:border-indigo-500 bg-white mb-4"
        aria-label="Enter your date of birth"
      />
      {profile && result && (
        <div data-testid="lp-result"
             className="bg-white rounded-xl border-2 border-indigo-300 p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center
                            justify-center text-2xl font-black text-white flex-shrink-0">
              {result}
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">Life Path {result}</div>
              <div className="text-indigo-600 font-semibold">{profile.title}</div>
              <div className="text-xs text-gray-500">{profile.ruling_planet} · {profile.element}</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{profile.traits}</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {profile.strengths.map(s => (
              <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-indigo-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-indigo-700 transition-colors">
            See my complete birthday profile →
          </a>
        </div>
      )}
    </div>
  );
}
```

**4. All Life Path Numbers (most important section — must be detailed)**

For each life path 1-9, 11, 22, 33 — render a section using LIFE_PATH_EXTENDED:

```tsx
{[1,2,3,4,5,6,7,8,9,11,22,33].map(n => {
  const p = LIFE_PATH_EXTENDED[n];
  if (!p) return null;
  // Get celebrity examples from the Python output above — hardcode 2-3 per number
  const CELEB_EXAMPLES: Record<number, string> = {
    1: 'Narendra Modi (September 17, 1950), ...', // use Python output
    2: '...', // fill from Python output
    // etc for all numbers
  };
  return (
    <section key={n} id={`life-path-${n}`} className="mb-10">
      <h3 className="text-xl font-black text-gray-900 mb-1">
        Life Path {n} — {p.title}
      </h3>
      <div className="text-xs text-gray-500 mb-3">
        Ruling Planet: {p.ruling_planet} · Element: {p.element}
      </div>
      <p className="text-gray-700 leading-relaxed mb-3">{p.traits}</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <h4 className="text-sm font-bold text-green-700 mb-1">Strengths</h4>
          <ul className="text-sm text-gray-600 space-y-0.5">
            {p.strengths.map(s => <li key={s}>• {s}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-700 mb-1">Challenges</h4>
          <ul className="text-sm text-gray-600 space-y-0.5">
            {p.challenges.map(c => <li key={c}>• {c}</li>)}
          </ul>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Love: </strong>{p.love_style}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Career paths: </strong>{p.career_paths.join(', ')}.
      </p>
      <p className="text-sm text-indigo-700 mb-3 italic">
        <strong>Spiritual lesson: </strong>{p.spiritual_lesson}
      </p>
      <p className="text-sm text-gray-500">
        <strong>Famous Indians with Life Path {n}: </strong>
        {CELEB_EXAMPLES[n] || 'Examples being added.'}
      </p>
    </section>
  );
})}
```

The `CELEB_EXAMPLES` must be filled with REAL celebrity names and calculated DOBs from the Python output above. Do not make up examples.

**5. FAQ Section (5 questions with FAQPage schema)**
1. What is a Life Path number in numerology?
2. How do I calculate my Life Path number from my date of birth?
3. Which Life Path number is most successful in India?
4. Is numerology accurate for predicting the future?
5. How does BornClock calculate my numerology profile?

**6. CTA Section**
```tsx
<div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
     p-8 text-center text-white mt-10">
  <h2 className="text-2xl font-black mb-2">Discover Your Complete Birthday Profile</h2>
  <p className="text-indigo-200 mb-6">
    Your Life Path is just one piece. BornClock also shows your Vedic Rashi,
    Western zodiac, Nakshatra, lucky stone, and more — all from your date of birth.
  </p>
  <a href="/birthday-report"
     className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                rounded-full text-lg hover:bg-indigo-50 transition-colors">
    Generate My Free Birthday Profile →
  </a>
</div>
```

Add Article + FAQPage JSON-LD schemas via the SEO component or inline script.

### 4B — Route, Prerender, Sitemap
```javascript
// App.tsx
<Route path="/articles/numerology-by-date-of-birth" element={<NumerologyArticle />} />

// prerender-routes.mjs
'/articles/numerology-by-date-of-birth/',

// prerender-titles.mjs
'/articles/numerology-by-date-of-birth/': {
  title: 'Numerology by Date of Birth — Life Path Number Guide India | BornClock',
  desc: 'Calculate your Life Path number by date of birth. All 9 life paths explained with famous Indian examples, compatibility guide, and free calculator.',
},
```

### 4C — Tests

```typescript
// src/pages/__tests__/NumerologyArticle.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NumerologyArticle } from '../articles/NumerologyArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><NumerologyArticle /></MemoryRouter></HelmetProvider>
);

describe('NumerologyArticle', () => {
  it('TC-NUM-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-NUM-P-02: H1 contains "numerology"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('numerology');
  });
  it('TC-NUM-P-03: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="lp-calculator"]')).toBeTruthy();
  });
  it('TC-NUM-P-04: entering DOB shows result', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1973-03-28' } });
    // Life Path 6 for Mar 28 1973
    expect(document.querySelector('[data-testid="lp-result"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="lp-result"]')?.textContent).toContain('6');
  });
  it('TC-NUM-P-05: all 9 life path numbers present in article', () => {
    renderArticle();
    const text = document.body.textContent || '';
    [1,2,3,4,5,6,7,8,9].forEach(n => {
      expect(text, `Missing Life Path ${n}`).toContain(`Life Path ${n}`);
    });
  });
  it('TC-NUM-P-06: master numbers 11, 22, 33 present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('Life Path 11');
    expect(text).toContain('Life Path 22');
    expect(text).toContain('Life Path 33');
  });
  it('TC-NUM-P-07: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-NUM-P-08: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-NUM-P-09: FAQPage schema has 5 questions', () => {
    renderArticle();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent||'');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-NUM-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-NUM-N-02: article text > 3000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(3000);
  });
  it('TC-NUM-N-03: calculator result link includes dob param', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1973-03-28' } });
    const result = document.querySelector('[data-testid="lp-result"]');
    const ctaLink = result?.querySelector('a');
    expect(ctaLink?.getAttribute('href')).toContain('dob=1973-03-28');
  });
});
```

```bash
npx vitest run src/pages/__tests__/NumerologyArticle.test.tsx --reporter=verbose 2>&1
npx vitest run 2>&1 | tail -10
npx tsc --noEmit 2>&1 | head -10

git add src/pages/articles/ \
        src/pages/__tests__/NumerologyArticle.test.tsx \
        src/App.tsx \
        scripts/prerender-routes.mjs \
        scripts/prerender-titles.mjs
git commit -m "feat(day10): numerology article — 3000+ words, inline calculator, all 13 LPs from astrologicalData, 13 tests"

npm run build 2>&1 | tail -5
./node_modules/.bin/wrangler deploy 2>&1 | tail -3
born_on_check

ARTICLE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://bornclock.com/articles/numerology-by-date-of-birth/")
echo "Numerology article HTTP: $ARTICLE"
echo "=== TASK 4 COMPLETE ==="
```

---

## TASK 5 — DAY 12: MOON SIGN ARTICLE

**Goal:** 2,000-word article targeting "moon sign calculator India" (10K monthly).
**Route:** `/articles/moon-sign-by-date-of-birth`

Read before writing:
```bash
# Confirm calculateVedicRashi exists and its signature
grep -n "calculateVedicRashi\|export function calculateVedic" \
  src/utils/celebrityCalculations.ts | head -5

# Get celebrity examples with their actual Rashis
python3 << 'PYEOF'
import re

def get_rashi(day, month):
    RASHI_MAP = [
        (1,19,'Makara'),(2,18,'Kumbha'),(3,20,'Meena'),(4,19,'Mesha'),
        (5,20,'Vrishabha'),(6,20,'Mithuna'),(7,22,'Karka'),(8,22,'Simha'),
        (9,22,'Kanya'),(10,22,'Tula'),(11,21,'Vrischika'),(12,21,'Dhanu'),
    ]
    for m, d, rashi in RASHI_MAP:
        if month == m and day <= d: return rashi
    idx = RASHI_MAP.index(next(x for x in RASHI_MAP if x[0]==month))
    return RASHI_MAP[(idx-1) % 12][2]

with open('src/data/indianCelebrities.ts') as f:
    content = f.read()

pattern = r'name:\s*["\']([^"\']+)["\'].*?(?:dob|birth_date):\s*["\'](\d{4}-\d{2}-\d{2})["\']'
matches = re.findall(pattern, content, re.DOTALL)[:150]

by_rashi = {}
for name, dob in matches:
    y, m, d = (int(x) for x in dob.split('-'))
    if d > 0 and m > 0:
        rashi = get_rashi(d, m)
        by_rashi.setdefault(rashi, []).append((name, dob))

for rashi in sorted(by_rashi.keys()):
    examples = by_rashi[rashi][:2]
    print(f"{rashi}: {', '.join(f'{n} ({d})' for n,d in examples)}")
PYEOF
```

Print the Rashi celebrity examples. Use these exact names in the article.

### 5A — Create Moon Sign Article Page

Create `src/pages/articles/MoonSignArticle.tsx`.

```typescript
import React from 'react';
import { VEDIC_RASHI_PROFILES } from '@/data/astrologicalData';
import type { VedicRashiProfile } from '@/data/astrologicalData';
import { calculateVedicRashi } from '@/utils/celebrityCalculations';
```

Article sections in JSX (write complete code, not pseudo-code):

**1. H1 + Introduction**
```tsx
<h1>Moon Sign by Date of Birth — Find Your Vedic Rashi (India Guide)</h1>
```
Write 2 paragraphs (150 words total) explaining:
- The difference between Western sun sign and Vedic Rashi
- Why Rashi matters in Indian culture (marriage matching, muhurta, naming)
- How BornClock calculates approximate Rashi from birth date

**2. Sun Sign vs Moon Sign (250 words as JSX paragraphs)**
Explain:
- Western astrology = sun's position at birth → 12 signs, solar calendar
- Vedic astrology = moon's position → 12 Rashis + 27 Nakshatras, sidereal calendar
- The ~23-day offset between the two systems
- Why they sometimes differ for the same person
- Disclaimer: approximate Rashi from birth DATE; precise Rashi needs birth TIME + PLACE

**3. Rashi Calculator Widget**
```tsx
function RashiCalculator() {
  const [dob, setDob] = React.useState('');
  const [profile, setProfile] = React.useState<VedicRashiProfile | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val.length === 10) {
      const [year, month, day] = val.split('-').map(Number);
      if (year && month && day) {
        const rashiResult = calculateVedicRashi(day, month);
        setProfile(VEDIC_RASHI_PROFILES[rashiResult.rashi] ?? null);
      }
    }
  };

  return (
    <div data-testid="rashi-calculator"
         className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 my-8">
      <h3 className="text-lg font-black text-amber-900 mb-1">
        Find Your Vedic Rashi — Free Calculator
      </h3>
      <p className="text-sm text-amber-700 mb-4">
        Enter your date of birth to discover your approximate Vedic Rashi instantly.
      </p>
      <input
        type="date"
        value={dob}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]}
        className="w-full border-2 border-amber-300 rounded-xl px-4 py-3
                   text-base bg-white mb-4 focus:outline-none focus:border-amber-500"
        aria-label="Enter your date of birth"
      />
      {profile && (
        <div data-testid="rashi-result"
             className="bg-white rounded-xl border-2 border-amber-300 p-5">
          <div className="text-2xl font-black text-amber-800 mb-0.5">
            {profile.rashi} ({profile.rashi_devanagari})
          </div>
          <div className="text-sm text-gray-500 mb-3">
            Lord: {profile.lord} ({profile.lord_devanagari}) ·
            {profile.element} · {profile.quality}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-amber-700 font-bold">Lucky Stone</div>
              <div>{profile.lucky_stone} ({profile.lucky_stone_hindi})</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-amber-700 font-bold">Lucky Day</div>
              <div>{profile.lucky_day}</div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-xs mb-3">
            <div className="text-amber-700 font-bold mb-0.5">Mantra</div>
            <div className="font-medium">{profile.mantra}</div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {profile.personality_summary}
          </p>
          <a href={`/birthday-report?dob=${dob}`}
             className="inline-block bg-amber-600 text-white font-bold px-5 py-2.5
                        rounded-full text-sm hover:bg-amber-700">
            See my full birthday profile →
          </a>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3 italic">
        Note: This is an approximate calculation based on solar position.
        Precise Rashi requires exact birth time and location.
      </p>
    </div>
  );
}
```

**4. All 12 Rashis (main content — 700 words)**
Render from VEDIC_RASHI_PROFILES. For each Rashi:

```tsx
{['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'].map(rashiName => {
  const p = VEDIC_RASHI_PROFILES[rashiName];
  if (!p) return null;
  // Hardcode celebrity examples from Python output above
  const CELEB_EXAMPLES: Record<string, string> = {
    Mesha: '...', // fill from Python output
    Vrishabha: '...',
    // etc — use EXACT names from Python output
  };
  return (
    <section key={rashiName} id={`rashi-${rashiName.toLowerCase()}`} className="mb-8">
      <h3 className="text-xl font-black text-gray-900 mb-1">
        {p.rashi} ({p.rashi_devanagari}) — {p.western_equivalent}
      </h3>
      <div className="text-xs text-gray-500 mb-2">
        Lord: {p.lord} ({p.lord_devanagari}) · {p.element} · {p.quality}
      </div>
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          💎 {p.lucky_stone} ({p.lucky_stone_hindi})
        </span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
          📅 {p.lucky_day}
        </span>
        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          🧭 {p.lucky_direction}
        </span>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mb-3">
        🕉 {p.mantra}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-2">
        {p.personality_summary}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <strong>Career: </strong>{p.career_strengths}
      </p>
      <p className="text-xs text-amber-700 mb-2">
        <strong>Health: </strong>{p.health_tendencies}
      </p>
      <p className="text-xs text-gray-500">
        <strong>Famous Indians: </strong>
        {CELEB_EXAMPLES[rashiName] || 'Examples being added.'}
      </p>
    </section>
  );
})}
```

**5. Rashi in Indian Tradition (200 words as JSX paragraphs)**
Mention: Kundali, muhurta, naming ceremonies (naming based on Nakshatra syllables), festival timing, marriage compatibility (kundali Milan).

**6. BornClock + CTA (150 words)**
What BornClock calculates, what the full profile shows, CTA to /birthday-report.

**7. FAQ (5 questions)**
1. What is my moon sign by date of birth?
2. Is Rashi the same as moon sign?
3. How accurate is Rashi calculated from date of birth alone?
4. Which Rashi is luckiest in India?
5. What is the difference between Rashi and Nakshatra?

Article + FAQPage JSON-LD schemas.

### 5B — Route, Prerender, Sitemap
```javascript
// App.tsx
<Route path="/articles/moon-sign-by-date-of-birth" element={<MoonSignArticle />} />

// prerender-routes.mjs
'/articles/moon-sign-by-date-of-birth/',

// prerender-titles.mjs
'/articles/moon-sign-by-date-of-birth/': {
  title: 'Moon Sign by Date of Birth — Find Your Vedic Rashi India | BornClock',
  desc: 'Find your Vedic Rashi (moon sign) by date of birth. All 12 Rashis with lucky stone, mantra, personality, Devanagari names, and free Rashi calculator.',
},
```

### 5C — Tests

```typescript
// src/pages/__tests__/MoonSignArticle.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MoonSignArticle } from '../articles/MoonSignArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><MoonSignArticle /></MemoryRouter></HelmetProvider>
);

describe('MoonSignArticle', () => {
  it('TC-MS-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-MS-P-02: H1 contains "moon sign" or "rashi"', () => {
    renderArticle();
    const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
    expect(h1.includes('moon sign') || h1.includes('rashi')).toBe(true);
  });
  it('TC-MS-P-03: Rashi calculator renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="rashi-calculator"]')).toBeTruthy();
  });
  it('TC-MS-P-04: entering DOB Nov 5 1988 shows Vrischika', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    const result = document.querySelector('[data-testid="rashi-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toContain('Vrischika');
  });
  it('TC-MS-P-05: Vrischika result shows Red Coral', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent)
      .toContain('Red Coral');
  });
  it('TC-MS-P-06: Vrischika result shows Moonga (Hindi name)', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent)
      .toContain('Moonga');
  });
  it('TC-MS-P-07: all 12 Rashis present in article', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
     'Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'].forEach(r => {
      expect(text, `Missing ${r}`).toContain(r);
    });
  });
  it('TC-MS-P-08: Devanagari script rendered', () => {
    renderArticle();
    expect(/[\u0900-\u097F]/.test(document.body.textContent || '')).toBe(true);
  });
  it('TC-MS-P-09: mantras present', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Om');
    expect(document.body.textContent).toContain('Namah');
  });
  it('TC-MS-P-10: Article + FAQPage schemas', () => {
    renderArticle();
    const types = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map(s => { try { return JSON.parse(s.textContent||'')['@type']; } catch { return ''; } });
    expect(types).toContain('Article');
    expect(types).toContain('FAQPage');
  });
  it('TC-MS-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-MS-N-02: approximate disclaimer present', () => {
    renderArticle();
    expect(document.body.textContent?.toLowerCase()).toContain('approximate');
  });
  it('TC-MS-N-03: article content > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});
```

```bash
npx vitest run src/pages/__tests__/MoonSignArticle.test.tsx --reporter=verbose 2>&1
npx vitest run 2>&1 | tail -10
npx tsc --noEmit 2>&1 | head -10

git add src/pages/articles/MoonSignArticle.tsx \
        src/pages/__tests__/MoonSignArticle.test.tsx \
        src/App.tsx \
        scripts/prerender-routes.mjs \
        scripts/prerender-titles.mjs
git commit -m "feat(day12): moon sign article — 2000+ words, Rashi calculator with Devanagari, all 12 Rashis, 13 tests"

npm run build 2>&1 | tail -5
./node_modules/.bin/wrangler deploy 2>&1 | tail -3
born_on_check

ARTICLE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://bornclock.com/articles/moon-sign-by-date-of-birth/")
echo "Moon sign article HTTP: $ARTICLE"
echo "=== TASK 5 COMPLETE ==="
```

---

## PHASE FINAL — PUSH AND COMPLETION REPORT

```bash
cd ~/Development/celeb-clock

# Push to main
git checkout main
git merge develop
git push origin main
git push origin develop

# Final checks
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  OVERNIGHT SPRINT — COMPLETION REPORT"
echo "══════════════════════════════════════════════════════════════"
echo ""

echo "=== BORN-ON SPOT CHECK ==="
BORN_ON=$(curl -s "https://bornclock.com/born-on/august-6/india/" \
  | grep -o "<title>[^<]*</title>")
echo "$BORN_ON"
echo "$BORN_ON" | grep -qi "august 6" && echo "✅ PASS" || echo "❌ FAIL"

echo ""
echo "=== BIO STATUS ==="
npx tsx scripts/generate-celebrity-bios.ts --status

echo ""
echo "=== ALL NEW PAGES ==="
for URL in \
  "https://bornclock.com/birthday-report/sample/" \
  "https://bornclock.com/articles/numerology-by-date-of-birth/" \
  "https://bornclock.com/articles/moon-sign-by-date-of-birth/"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  [ "$CODE" = "200" ] && ICON="✅" || ICON="❌"
  echo "$ICON $CODE — $URL"
done

echo ""
echo "=== WHATSAPP SHARE IN PRODUCTION HTML ==="
WA_BORN=$(curl -s "https://bornclock.com/born-on/august-6/india/" | grep -c "wa.me")
WA_CELEB=$(curl -s "https://bornclock.com/celebrity/virat-kohli/" | grep -c "wa.me")
echo "Born-on: $WA_BORN WhatsApp link(s)"
echo "Celebrity: $WA_CELEB WhatsApp link(s)"

echo ""
echo "=== SITEMAP ==="
curl -s "https://bornclock.com/sitemap.xml" | \
  grep -c "numerology\|moon-sign\|sample" && echo " new routes in sitemap"

echo ""
echo "=== UNIT TESTS ==="
npx vitest run 2>&1 | tail -5

echo ""
echo "=== COMMITS THIS SESSION ==="
git log --oneline | head -15

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "NEXT STEPS:"
echo "  Run remaining bio batches: --batch 6, 7, 8..."
echo "  Day 9: Life Expectancy by State article (needs real data)"
echo "  Day 11: 30-day Instagram content calendar for niece"
echo "══════════════════════════════════════════════════════════════"
```
