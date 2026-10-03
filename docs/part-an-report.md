# Part AN — Finalized Homepage — Report

**Branch:** `part-aj-four-page-redesign` (continued). **Hard Rule honored:** no real `wrangler
deploy`, no promotion — preview is an isolated `wrangler versions upload`, built with `--mode
preview`. **Nothing merged to develop/main, nothing deployed. Homepage body/hero is the only new
page; shared global Navigation not restyled.**

**Final isolated preview:** **https://6df51e9a-bornclock.usdvisionai.workers.dev**
(version `6df51e9a-f15f-41d0-9440-88c7d89fc2dc`).

Everything below is verified against the **real served output on the live preview** (Fifth Rule),
fetched fresh — not inferred from source or a passing build.

## Step 0 — base check
On `part-aj-four-page-redesign` with Part AM commits present (in-body JSON-LD fix, generic-title
fix, WebPage injection). Read the design reference in full and treated it as the spec.

## Step 1 — audit (docs/part-an-homepage-audit.md)
Mapped every current-homepage section/link to its new home. **Primary date flow = `/results`**
(via BirthDateContext), preserved by the new "See your full birthday profile →" button. To keep
every link reachable, the footer "BornClock" column was **extended** with Articles, About,
Editorial Policy, Pricing (the reference listed only How it works/Answers/Privacy/Contact). No
internal link reachable today was dropped.

## Function agreement (Step 2) — no disagreement
The homepage uses the site's OWN functions via `src/utils/homepageDecode.ts` (wrapping
`calculateWesternZodiac`, `calculateLifePathNumber`, `BIRTHSTONE_DATA`). Unit test
`src/__tests__/homepageDecode.test.ts` confirms ALL spec expected values — 1869-10-02→Libra/LP9,
1973-04-24→Taurus/LP3, 1998-01-01→Capricorn/LP11, 1998-03-14→Pisces/LP8, all six boundary dates,
birthstones, Mars age (1.8808) / weight (0.38×). **No site function disagreed with the spec.**

## Step 2 — build (verified on the live preview)
- Header: real `<Navigation/>` + `<AuthNav/>` on the navy bar (global Navigation not restyled).
- Hero (ivory): exact eyebrow, **H1 "Everything your birth date reveals."**, exact subline, labelled
  date input + "Decode my date", 4 category doors (accent per category → category pages).
- Live clock: years/days/hours/minutes/**seconds (ticking)**, total seconds, ~heartbeats (72 bpm),
  next-birthday days, "Year N — X% complete" bar, disclosure line; **birthday-today** message swaps in.
  **Not an ARIA live region** (verified: no tick element inside `[aria-live]`); a single polite
  announcement fires when the visitor's own results first appear.
- Example-labelling: with no date/saved profile, values + clock heading read "EXAMPLE — ALIVE FOR"
  / "Example: 14 March 1998 — enter yours"; after a date is entered they switch to the visitor's own
  (verified live: entering 1869-10-02 → Libra / LP 9, heading → "YOU'VE BEEN ALIVE FOR").
- "Your date, decoded": Western sign, Life Path, birthstone, age on Mars, weight on Mars (26.6 kg
  per 70 kg, labelled), Vedic chart as a free next step. **Vedic link carries the date** —
  verified `generate` → `/kundali?dob=1869-10-02` (carries time+place too when a full saved profile
  is in use). No date in the page URL (Part AD respected).
- Trust strip: the three reference lines (cross-checked; 36-point Ashtakoota per BPHS; WHO/Harvard/
  NIH/UN WPP 2024/NASA 2023) — all sources are genuinely used elsewhere on the site.
- **Born today** (client-side, visitor's real local date): verified live for 3 October → real names
  (Louis Aragon, Gore Vidal, Gwen Stefani) with **3 real photos**, heading "BORN TODAY · 3 OCTOBER",
  real count via a Supabase count query, link to `/todays-birthdays`. Prerendered as a fixed-size
  band, filled after load (not prerendered content).
- Directory: four columns with the exact reference headings; every tool → a **real route** (verified
  by crawl, 0 dead); tags corrected to true values (e.g. "Country Comparison · 57 countries",
  "Planetary Weight · NASA 2023", "Dasha Timing · to Pratyantar").
- Footer sitemap: all four categories + BornClock column, all real routes.
- Colours use the accessible text shades (#806125 / #B5432A / #237A60); bright tokens for borders/fills.

## Step 3 — SEO/AEO
- Title: "Free Birthday, Zodiac & Longevity Calculator | BornClock" (keeps the ranking key terms,
  ≤70 chars; the new positioning leads the H1 + meta description — see the title decision below).
- Meta description leads with the new positioning. OG/Twitter tags + a real OG image present.
- JSON-LD via `JsonLd.tsx` (body-rendered): Organization, WebSite, WebPage (+ global BreadcrumbList).
  **validator.schema.org on the live homepage: 7 objects, 0 errors, 0 warnings.**
- Exactly one `<h1>` (verified in served HTML). Real alt text on Born-today photos.

**Title decision (logged):** the constraints collide — keeping the full ranking phrase "Birthday,
Zodiac & Longevity Calculator" + brand + ≤70 leaves no room to also lead with the 34-char
positioning in the title. Kept the proven ranking title (lowest SEO risk for a ranking homepage);
the positioning is the on-page H1 + meta description. `getTitleForRoute('/')` was already hard-coding
this title; I aligned the Index SEO title to match and removed a dead duplicate entry.

## Step 4 — testing (all against the live preview unless noted)
- **Unit:** homepageDecode (8) + Index (5) pass; edge cases (leap day, invalid month, out-of-range) covered.
- **Routes:** fresh live crawl of homepage links — **40 internal links, 0 dead.**
- **Served output:** correct `<title>`, new meta description, single `<h1>`, JSON-LD present;
  validator **0 errors**.
- **Real browser (preview):** date entry updates every decoded value + the mystic/science teasers;
  clock ticks; Born-today shows real names + real photos for the actual date; Vedic link carries the
  date into `/kundali`; **zero console errors**.
- **Mobile 390px:** no horizontal overflow. **Reduced-motion:** decoded values shown immediately.
- **Example-date labelling:** verified before (example) → after (visitor's own), clock heading included.
- **Primary flow:** "See your full birthday profile →" navigates to **`/results`** (verified URL).
- **Screen-reader clock:** verified the ticking clock is NOT inside an `aria-live` region.
- **Regression:** full suite **153 files / 1869 tests pass** (fresh, 32.7s); the other redesigned
  pages unaffected.
- **Fix-and-retest loop actually used:** three real bugs were caught by the Fifth-Rule checks and
  fixed before reporting — (1) 3 unit tests encoding the old homepage + a 76-char duplicate
  `/name-numerology` title (fixed: updated tests, removed duplicate); (2) homepage title/description
  inconsistency between prerender and SEO (aligned); (3) LCP regression (see Performance).

## Performance — real measurement (Playwright, Pixel-5 + 4× CPU + ~Slow 4G; Lighthouse CLI NO_FCP in this env)
| Metric | Production homepage (before) | New preview homepage (after) |
|---|---|---|
| FCP | 2328 ms | **1904 ms** (better) |
| LCP | 2980 ms | ~4560 ms |
| CLS | 0 | 0.036 (good, <0.1) |
| TBT | 0 | 0 |

**LCP delta — investigated and mitigated, honest conclusion:** the LCP element is the H1, which the
new (approved) design renders in **Fraunces** — a web font the old production homepage did not use.
Under the harsh throttle the Fraunces file loads over Slow 4G and Chrome records the **font-swap
repaint** as the final LCP. Verified the H1 is actually **visible at ~2.2s in the fallback serif**
(`display=swap`, opacity 1 — not FOIT/blank), so real content paints early; the metric reflects the
swap, not invisible content. Mitigation applied: moved the font stylesheet into the static
`index.html` shell (earliest discovery) and added a **`fonts.gstatic.com` preconnect**. I did not
degrade the brand with `display=optional` (that would show the fallback site-wide on first visit).
Residual LCP is the inherent cost of the approved brand heading font; a further reduction (self-hosted
woff2 preload) is noted as a follow-up. CLS and TBT are good; FCP improved.

## LAUNCH-READINESS (homepage)
- Reference built, real functions, example-labelled until the visitor's date/profile: **YES**
- Nothing reachable today made unreachable: **YES** (audit mapping + footer extension; 0 dead links)
- Primary `/results` flow preserved + Vedic/birthday carry-forward: **YES**
- SEO (title/desc/OG/JSON-LD valid/one h1/alt text): **YES** (validator 0 errors)
- Clock not an ARIA live region; reduced-motion respected: **YES**
- Mobile 390 no overflow: **YES**
- Perf: FCP/CLS/TBT good; LCP higher due to the brand font (mitigated, documented): **documented**
- Full suite green; nothing merged or deployed: **YES**

## Real elapsed (git timestamps)
AN commits span **14:08:04 → 14:55:52** (~48 min of commit activity), within which three full
production builds ran at **1163s / 1161s / 1176s** (~19 min each, real start/end epochs) — plus the
first --mode-preview build. Real wall-clock is dominated by those builds.

## Commits
`25f2055` audit+decisions · `ab431ad` homepage build · `7134506` title/desc consistency ·
`3f9fb5e` title decision log · `5539195` perf fix (gstatic preconnect) · this report.
