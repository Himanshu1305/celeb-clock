# Part T — Pre-Launch Forensic Audit: Scope Map & Honest Feasibility Assessment

_Phase 0 deliverable. Produced before any testing, from the actual routing config
(`src/App.tsx`), i18n config (`src/i18n.ts`), and asset references._

## 0.1 Every distinct route (pulled from `src/App.tsx`)

**182 distinct route paths** = **165 static pages** + **17 dynamic templates** (each
template fans out to many real pages).

### Vedic cluster (~15 static)
`/kundali`, `/kundali-match`, `/astrologer`, `/career-report`, `/gemstones`,
`/sade-sati`, `/muhurat`, `/baby-names`, `/moon-sign`, `/rashi-ratna`,
`/vedic-zodiac` (+ `/vedic-zodiac/:rashi`), `/compatibility` (+ `/compatibility/:s1/:s2`),
`/numerology` (+ `/numerology/:number`), `/name-numerology`, `/coach`.

### Birthday / age / longevity tools (~55 static)
`/age-calculator`, `/age-in-days`, `/age-in-seconds`, `/birthday`,
`/birthday-countdown`, `/birthday-report` (+ `/gift`, `/sample`), `/born-on`,
`/born-in`, `/planetary-age`, `/biorhythm`, `/biological-age`,
`/biological-age-calculator`, `/biological-age-vs-chronological-age`,
`/how-long-will-i-live`, `/longevity-calculator`, `/life-expectancy` +
**14 country variants** (`-usa`, `-uk`, `-india`, `-canada`, `-australia`, `-japan`,
`-china`, `-germany`, `-brazil`, `-singapore`, `-india-vs-usa`, and the
`life-expectancy-calculator-*` set), `/country-comparison`, `/weight-on-planets`,
`/generation`, `/chinese-zodiac` (+ `/:animal`), `/tarot-card-by-birthday`,
`/zodiac` (+ `/:sign`), `/birthstone` (+ `/:month`), `/sun-vs-moon-sign`, `/results`,
`/wish`, `/reminders`, `/leaderboard`, `/todays-birthdays`.

### Explore / celebrity / content (~40 static + big dynamic fan-out)
`/celebrity` + 6 category pages (`/bollywood`, `/cricket`, `/music`, `/politics`,
`/sports`, `/business`) + `/celebrity/:slug` (**~2,595 celebrities**),
`/celebrity-birthday`, `/articles` + **~45 article pages**, `/blog` (+ `/:slug`),
`/answers` + **~22 answer pages**, `/born-on/:month/:day` (**366**),
`/birthday/:month/:day`, `/report/:slug`.

### Company / static / misc (~20 static)
`/about`, `/pricing`, `/privacy`, `/terms`, `/faq`, `/contact`, `/how-it-works`,
`/methodology`, `/editorial-policy`, `/for-business`, `/diwali-gift`, `/gift`,
`/embed`, `/widget/age-calculator`, `/family`, `/answers`, `/articles`.

### Auth / account / admin (~5)
`/auth`, `/profile`, `/upgrade`, `/admin`, `/admin/accuracy`.

### Dynamic templates (17)
`/birthday/:date|:month|:month/:day`, `/birthstone/:month`, `/blog/:slug`,
`/born-on/:month/:day(/personality)`, `/born-on/:slug(/india)`, `/celebrity/:slug`,
`/chinese-zodiac/:animal`, `/compatibility/:sign1/:sign2` (144),
`/hi/rashifal/:rashi`, `/numerology/:number`, `/report/:slug`,
`/vedic-zodiac/:rashi` (12), `/zodiac/:sign` (12).

## 0.2 Languages

**Two: English (default) + Hindi.** `src/i18n.ts` → `supportedLngs: ['en','hi']`,
`fallbackLng: 'en'`. Hindi is delivered two ways: (a) a react-i18next UI-string toggle,
and (b) **dedicated Hindi routes** (not per-route `/hi/` mirrors of all 182):
`/hi/life-expectancy-calculator`, `/hi/meri-jeevan-pratyasha`,
`/hi/numerology-by-date-of-birth`, `/hi/rashifal` (+ `/:rashi`),
`/jivan-kal-calculator`, `/meri-umar-kitni-hai`, `/numerology-hindi`,
`/biological-age-hindi`, `/rashifal-by-date-of-birth`. **No Telugu / other languages
exist yet.** So "every page × every language" is NOT 182×2 — it is 165 English pages +
~10 dedicated Hindi pages + i18n-toggle coverage on the pages that use it.

## 0.3 Logo / brand-mark locations
- Header/nav — `src/components/Navigation.tsx` (`bornclock-logo.png`)
- Footer — `src/components/Footer.tsx` (`bornclock-logo.png`)
- Favicon — `index.html`
- Social share (OG) — `src/components/SEO.tsx` (`bornclock-logo.png` / `logo.png`)
- PDF exports (Kundali / Matching / invoice) — `src/lib/invoice-logo.ts` (`bornclock-logo.png`)
- Various answer/content pages embed the logo inline (`src/pages/answers/*`)
- Admin panel — `/admin` (uses the same shared nav)

## 0.4 Honest scope estimate

**Full forensic depth in ONE session is NOT realistic.** Real numbers:

- **Part 2 (page-load)**: 165 static pages + ~10 Hindi + a representative sample of the
  large dynamic sets. At genuine depth (HTTP + console-error capture + visual screenshot)
  ≈ **175+ page checks**. Automatable in a scripted crawl (~1–2 h of run time), but
  human-grade visual review of all is a session on its own.
- **Part 3 (functional, pos/neg/edge/adversarial)**: ~10 interactive flows × 4 test
  dimensions × multiple datasets ≈ **80–150 deep scenarios**, most requiring **real
  `/api/*` calls that only work on staging**. Several hours.
- **Part 1 / Part 4**: logo (7 locations × 2 viewports + favicon + 2 PDFs), broken-link
  crawl of 165+ pages, a11y, mobile, security sweep — another several hours combined.

**Total realistic estimate: ~3 focused sessions** for genuine forensic depth.

### TWO STRUCTURAL CONSTRAINTS (critical, honest)

1. **Staging does not have Parts Q/R/S deployed.** Probed live: `/api/vedic-reading`
   has **no `reflections` field** → staging = the last-deployed (Part P-era) code. My
   Q/R/S work is committed locally but not deployed (no deploy was requested). Real
   `/api/*` end-to-end flows only run on staging. **Therefore this audit can fully
   validate the *deployed* product end-to-end, but the new Q/R/S features must be
   validated by unit + mocked-e2e this session and then re-audited on staging after a
   deploy, before launch.**
2. **Admin-bypass chat testing needs the user's admin session token.** The bypass
   (`api/_adminAuth.ts`) requires a real Supabase JWT for an allowlisted admin email and
   fails closed — it cannot be driven headlessly without the admin login. So exhaustive
   real-Gemini chat testing via the bypass is **blocked on the user**; guardrail/yoga/
   timing correctness is instead covered by the existing deterministic unit suites (no
   API cost), plus a small number of real normal-user chat calls to confirm live wiring.

## Proposed staging plan (per the prompt's "stage by section")

- **Stage 1 (THIS session):** full automated regression (unit + staging Playwright +
  reading e2e); Part 1 logo audit; Part 2 page-load crawl of all static + Hindi pages on
  staging; Part 4 forensic checks (broken links, security sweep, HTTPS, admin-bypass
  adversarial re-verify, mobile spot-check); Part 3 core flows on staging with real APIs
  (Kundali, Matching, one report) + Q/R/S new features via unit/mocked-e2e. Honest
  coverage note per area.
- **Stage 2 (follow-up):** Part 3 exhaustive pos/neg/edge/adversarial on every Vedic
  flow with real APIs; real-Gemini chat testing (needs the user's admin token).
- **Stage 3 (follow-up, after a Q/R/S staging deploy):** re-audit the new features live;
  dynamic-page fan-out sampling (celebrity/born-on/compatibility); full visual pass.

_Executing Stage 1 now; deferrals listed in the final report._
