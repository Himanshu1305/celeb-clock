## Plan: SEO Keyword Targeting + EEAT + FAQ Schema

Goal: Rank for high-intent "best …" keywords, strengthen EEAT signals (Experience, Expertise, Authoritativeness, Trust), and add FAQ schema to every major tool page for rich-result eligibility.

---

### 1. Keyword targeting (titles, H1s, meta, intro copy)

Update SEO + headings on these pages to target "best" modifiers and long-tail intent:

| Page | Primary keyword | Secondary |
|---|---|---|
| `src/pages/Index.tsx` | best age & birthday calculator | free, online, accurate |
| `src/pages/AgeCalculatorPage.tsx` | best age calculator online | exact age, age in days/hours/seconds |
| `src/pages/LifeExpectancy.tsx` | best life expectancy calculator | how long will I live, lifespan calculator |
| `src/pages/CelebrityBirthday.tsx` + `TodaysBirthdaysPage.tsx` | best celebrity birthday match | celebrities born on my birthday, birthday twin |
| `src/pages/NumerologyPage.tsx` | best free numerology calculator | life path number |
| `src/pages/Zodiac.tsx` | best zodiac sign calculator | accurate zodiac by birth date |
| `src/pages/Birthstone.tsx` | best birthstone finder by month | birthstone meaning |
| `src/pages/PlanetaryAgePage.tsx` | best planetary age calculator | your age on Mars/Jupiter |

For each: rewrite `<SEO title/description/keywords>`, the single H1, and the intro paragraph to naturally include the primary keyword once + 2–3 related terms. Keep titles <60 chars, descriptions <160 chars.

### 2. EEAT signals (sitewide + per-page)

Create `src/components/EEATBadges.tsx` — a compact strip used under each tool's H1 showing:
- "Last updated: <date>" (auto from build date)
- "Reviewed for accuracy" 
- "Used by 50k+ people" (only if true — otherwise drop)
- "Sources: WHO, CDC, NASA, Wikipedia" with links

Create `src/components/AuthorBio.tsx` — small card at the bottom of each tool/article page with author name, credentials, and link to `/about`. Already have `About.tsx` — extend it with team bios, methodology, editorial policy, and contact.

Add sitewide trust:
- `src/components/Footer.tsx` — add "Editorial policy", "Methodology", "Medical disclaimer" links
- New page `src/pages/Methodology.tsx` — explains data sources (actuarial tables, Wikipedia, NASA, etc.), update cadence, limitations
- New page `src/pages/EditorialPolicy.tsx` — review process, correction policy
- JSON-LD `Organization` schema in `index.html` (logo, sameAs social links, contactPoint)
- Per-tool JSON-LD: add `author` (Person/Organization) and `dateModified` to existing WebPage schema in `SEO.tsx`

### 3. FAQ schema on every tool page

Create `src/components/PageFAQ.tsx` — renders a visible accordion AND emits `FAQPage` JSON-LD via the existing `FAQSchema` helper in `src/components/SEO.tsx`. Visible + structured = rich result eligibility.

Create `src/data/pageFaqs.ts` — 5–7 Q&As per tool, each Q including the target keyword naturally:

- **Age calculator**: "What is the best age calculator?", "How accurate is this age calculator?", "Can I calculate age in days/hours/seconds?", "Is it free?", "Does it work for any birth year?"
- **Life expectancy**: "What is the best life expectancy calculator?", "How is life expectancy calculated?", "Is this medical advice?", "What factors affect lifespan?", "How accurate is the estimate?"
- **Celebrity birthday**: "Who is the best celebrity birthday match tool?", "Which celebrities share my birthday?", "How many celebrities are in the database?", "Is the celebrity data accurate?"
- **Numerology**: "What is the best free numerology calculator?", "How is life path number calculated?", "What does my life path number mean?"
- **Zodiac**: "What is the best zodiac sign calculator?", "How is my zodiac sign determined?", "What about cusp dates?"
- **Birthstone**: "What is the best birthstone finder?", "What is my birthstone by month?", "Modern vs traditional birthstones?"
- **Planetary age**: "What is the best planetary age calculator?", "How old would I be on Mars/Jupiter?"

Mount `<PageFAQ slug="age-calculator" />` near the bottom of each tool page.

### 4. Existing FAQ page upgrade

`src/pages/FAQ.tsx` already exists but lacks `FAQPage` JSON-LD — wire it through `FAQSchema` from `SEO.tsx`.

### 5. Internal linking for keyword strength

- Add a "Related tools" strip component under each tool's FAQ that links to 3–4 sibling tools with anchor text containing the target keyword (e.g., "Best life expectancy calculator →").
- Update `Footer.tsx` tool list anchor text to include "Best …" where natural.

### 6. Sitemap + robots refresh

- `public/sitemap.xml` — confirm all updated routes present with current `<lastmod>`.
- `public/robots.txt` — verify Sitemap directive points to `https://celeb-clock.lovable.app/sitemap.xml`.

---

### Files Changed

| File | Action |
|---|---|
| `src/components/SEO.tsx` | Extend — add author + dateModified to default WebPage schema |
| `src/components/EEATBadges.tsx` | Create |
| `src/components/AuthorBio.tsx` | Create |
| `src/components/PageFAQ.tsx` | Create (visible accordion + FAQPage JSON-LD) |
| `src/components/RelatedTools.tsx` | Create |
| `src/data/pageFaqs.ts` | Create — keyworded Q&As per tool |
| `src/pages/Index.tsx` | Update — title/H1/meta + EEAT strip + FAQ + RelatedTools |
| `src/pages/AgeCalculatorPage.tsx` | Same |
| `src/pages/LifeExpectancy.tsx` | Same |
| `src/pages/CelebrityBirthday.tsx` | Same |
| `src/pages/TodaysBirthdaysPage.tsx` | Same |
| `src/pages/NumerologyPage.tsx` | Same |
| `src/pages/Zodiac.tsx` | Same |
| `src/pages/Birthstone.tsx` | Same |
| `src/pages/PlanetaryAgePage.tsx` | Same |
| `src/pages/FAQ.tsx` | Add FAQPage JSON-LD |
| `src/pages/About.tsx` | Expand — team, methodology, editorial policy, credentials |
| `src/pages/Methodology.tsx` | Create |
| `src/pages/EditorialPolicy.tsx` | Create |
| `src/components/Footer.tsx` | Add EEAT links + keyworded anchor text |
| `src/App.tsx` | Register new routes |
| `index.html` | Add Organization JSON-LD |
| `public/sitemap.xml` | Add new routes, refresh lastmod |

Quick clarifier before I build:

1. **Author/team name** for EEAT bylines — should I use "Celeb Clock Editorial Team" as a generic byline, or do you have a real person's name + credentials to attribute (preferred for true EEAT)?
2. **"Used by Nk+ people" badge** — skip unless you have a real number?
3. **Social profiles** for `Organization.sameAs` JSON-LD (Twitter/X, Instagram, LinkedIn URLs)?
