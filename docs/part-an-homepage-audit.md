# Part AN — Step 1: Current Homepage Audit + old→new Mapping

Source: `src/pages/Index.tsx` (636 lines) + children (`BentoGrid`, `BirthdayReportShowcase`,
`TestimonialsSection`, `PageFAQ`, `AuthorBio`). Rule: **nothing reachable today may become
unreachable** on the new homepage.

## Current SEO / head
- `<title>`: **"Free Birthday, Zodiac & Longevity Calculator | BornClock"** → keep these key terms in the new title.
- `<h1>` (line 121): a viral hero headline → replaced by the exact new H1 "Everything your birth date reveals."
- Structured data: `WebSiteSchema` (Helmet) → replaced by in-body `JsonLd` (Organization + WebSite + WebPage).

## Current date-of-birth entry
- `DobInput` → on valid d/m/y, `setBirthDate(date)` (BirthDateContext) + **`navigate('/results')`**.
- **Primary destination = `/results`** (the full birthday results experience). Preserved via the new
  "See your full birthday profile →" link, which sets BirthDateContext with the entered date and
  navigates to `/results` — exactly today's flow. Inline decoding is added, not a replacement.

## old element → new home (mapping table)
| Current homepage element | Internal link(s) | New-homepage home |
|---|---|---|
| Hero DOB entry → /results | /results | Hero input + "Decode my date"; "See your full birthday profile →" → /results (date carried via context) |
| Hero primary CTA — Birthday Report | /birthday-report | Birthday directory column ("Birthday Blueprint") + carry `?dob=` |
| "Save your results" / sign-up | /auth?signup=true | (auth is in the shared AuthNav header — kept) |
| Choose-your-path: Vedic/Birthday/Mystic/Science cards | /vedic-astrology, /celebrity-birthday(doors), /mystic-corner, /life-expectancy | Four hero **category doors** (accent per category) → matching directory columns + Explore links |
| Vedic block tools | /kundali,/kundali-match,/sade-sati,/muhurat,/gemstones,/rashi-ratna,/career-report,/astrologer | **Vedic directory column** (10 tools, real routes) |
| Birthday block + showcase | /birthday-report, /todays-birthdays, /age-calculator, /celebrity/, /birthstone, /born-on/india, /pricing | **Birthday directory column** + Born-today band + footer |
| Mystic / Explore tools | /numerology,/name-numerology,/zodiac,/chinese-zodiac,/tarot-card-by-birthday,/compatibility,/biorhythm | **Mystic directory column** (6 tools) |
| Science tools | /life-expectancy,/biological-age,/country-comparison,/planetary-age,/weight-on-planets | **Science directory column** (5 tools, real routes) |
| Featured Indian celebrity profiles | /celebrity/{slug}, /celebrity/ | **Born-today band** (real daily celebs, client-side) + Birthday column "Celebrity Twins" → /celebrity-birthday; "see all" → /celebrity/ |
| Zodiac grid (12 signs) | /zodiac/{sign} | Mystic column "Western Zodiac" → /zodiac (index lists all signs) |
| Explore BornClock grid | /answers, /born-on/india, /planetary-age, etc. | Distributed into the four directory columns (all real routes) |
| Articles row | /articles | **Footer "BornClock" column** → Articles (added, so not dropped) |
| Answers (4 specific) | /answers/* + /answers | Footer "Answers" → /answers (index lists them); specific ones added to a compact answers line |
| AuthorBio | /about, /editorial-policy, /how-it-works | Footer "BornClock" column (How it works, About, Editorial Policy) |
| Pricing (showcase) | /pricing | Footer "BornClock" column → Pricing |
| PageFAQ (home) | — | Omitted as a visual section (reference has no FAQ block); **no FAQPage schema** added (no genuine Q&A section on the new page, per Step 3) |

## Additions to keep everything reachable (per the "never silently remove" rule)
The reference footer "BornClock" column lists only *How it works · Answers · Privacy · Contact*. To
avoid dropping real links, that column is **extended** to also include **Articles, About, Editorial
Policy, Pricing**, and the four category directory columns carry every tool link. No internal link
from today's homepage is dropped.

## Function-agreement check (Step 2 requirement) — PASS, no disagreement
Ran `src/__tests__/homepageDecode.test.ts` against the site's own `calculateWesternZodiac` /
`calculateLifePathNumber` / `BIRTHSTONE_DATA`: all spec expected values pass
(1869-10-02→Libra/LP9; 1973-04-24→Taurus/LP3; 1998-01-01→Capricorn/LP11; 1998-03-14→Pisces/LP8;
all six boundary dates; birthstones; Mars age 1.8808 / weight 0.38×). **No site function disagrees
with the spec**, so nothing to reconcile.
