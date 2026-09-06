# Shared Article-Builder Spec (BornClock)

Repo: /Users/hidixit/Development/celeb-clock (develop branch). Vite + React 18 + TS + Tailwind SPA, prerendered.

## STUDY FIRST (read completely before writing)
- `src/pages/articles/NumerologyArticle.tsx` — the canonical exemplar. Copy its structure, the local `JsonLd` helper, SEO usage, inline calculator pattern, Tailwind classes, CTA and FAQ rendering.
- `src/pages/articles/MoonSignArticle.tsx` — second exemplar (calculator + all-items map).

## HARD CONVENTIONS (match exactly)
1. `import { SEO } from '@/components/SEO';` then render
   `<SEO title={TITLE} description={DESC} canonicalUrl="/articles/SLUG" ogType="article" />`
   (SEO auto-emits an Article JSON-LD + a BreadcrumbList JSON-LD from canonicalUrl — do not remove.)
2. ALSO add, via a local `JsonLd` helper (copy from NumerologyArticle):
   - an explicit **Article** schema: `{ '@context':'https://schema.org','@type':'Article', headline, description, author:{'@type':'Organization',name:'BornClock'}, publisher:{'@type':'Organization',name:'BornClock'}, mainEntityOfPage:'https://bornclock.com/articles/SLUG/' }`
   - a **FAQPage** schema with EXACTLY 5 questions (mainEntity: Question → acceptedAnswer → Answer).
   - Calculator pages ALSO add a **SoftwareApplication** schema `{'@type':'SoftwareApplication', name, applicationCategory:'LifestyleApplication', operatingSystem:'Web', offers:{'@type':'Offer',price:'0',priceCurrency:'INR'} }`.
3. Real data ONLY. Import from `@/data/astrologicalData` (WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES, CHINESE_ZODIAC_PROFILES, NAKSHATRA_PROFILES, LIFE_PATH_EXTENDED) and `@/utils/celebrityCalculations` (calculateWesternZodiac, calculateVedicRashi, calculateNakshatra, calculateChineseZodiac, calculateLifePathNumber, calculateAge, calculateDaysLived, calculateDaysUntilBirthday, calculatePlanetaryAges). Never invent zodiac traits, study results, or celebrity facts beyond what the task provides.
4. Layout: `<main data-testid="TESTID" className="min-h-screen bg-white"><article className="max-w-3xl mx-auto px-4 py-10"> ... </article></main>`. Exactly ONE `<h1>`; it must contain the required keyword. Use `gradient-text-primary` on the h1 like the exemplar.
5. Internal links: at least TWO `<a href="CTA_TARGET">` (the task's primary CTA) AND a "Related Articles" section near the bottom with 2–3 `<a href="/articles/...">` cross-links.
6. Component: `export function NAME() { ... }` and `export default NAME;`.
7. Content length: meet the task's minChars (rendered text). Write genuine, substantive prose.

## FILES YOU CREATE (only these two per article)
- `src/pages/articles/NAME.tsx`
- `src/pages/__tests__/NAME.test.tsx` — copy the header from `src/pages/__tests__/NumerologyArticle.test.tsx`:
  `// @vitest-environment jsdom` + render via `<HelmetProvider><MemoryRouter><NAME/></MemoryRouter></HelmetProvider>` + `afterEach(cleanup)`.

## DO NOT
- Do NOT edit `src/App.tsx`, `scripts/prerender-routes.mjs`, `scripts/prerender-titles.mjs` (the orchestrator wires these).
- Do NOT run `git add` or `git commit` (the orchestrator commits — avoids index races).
- Do NOT run `npm run build`.

## SELF-CHECK (run before returning)
- `npx tsc --noEmit 2>&1 | grep -iE "NAME|error TS" | head` — fix any error in YOUR file (one attempt).
- `npx vitest run src/pages/__tests__/NAME.test.tsx 2>&1 | tail -6` — all your tests must pass.

## RETURN (concise)
route | component name | default-export: yes | SEO title (≤70 chars, includes "| BornClock") | meta description (≤160 chars) | testid | tests passing count. If you had to give up on something, say so in one line.
