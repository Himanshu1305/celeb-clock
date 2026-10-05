# BornClock — Run 1 of 6: Central Design System + Vedic Pages
## Branch `redesign-central`. No stopping, no questions. Scope is deliberately limited to what one session can finish and verify completely.

---

## SCOPE OF THIS RUN (and nothing more)

1. Build the central design system in code: the five themes and seven
   layouts defined in `docs/part-ap-design-system.md`.
2. Move **every route that document assigns to the Vedic theme** onto it.
3. Test, fix and retest those pages fully, deploy to the staging worker,
   push to GitHub.

Other categories stay exactly as they are; they move in runs 2–5. Until
run 5, the old `.paj` styles may coexist with the new system for
not-yet-moved pages — that is expected, not a failure. Every page,
however, must be fully in one system or the other, never mixed.

---

## RULES

1. **Production is never touched:** no production deploy or promotion,
   no route or domain changes, no push or merge to `main` or `develop`,
   no Cloudflare token added to GitHub.
2. **Staging deploy safety:** deploy only with `wrangler deploy --env
   staging`; dry-run first and confirm the worker is exactly
   `bornclock-staging`; never run `wrangler` from an older checkout; any
   `wrangler secret` command must include `--env staging`.
3. **Preserve every feature:** visual and layout work only. Calculations,
   content, prices, paywall gating, payment and entitlement logic stay
   exactly as they are.
4. **Verify real output (Fifth Rule):** every "verified" claim is checked
   on the live staging or preview URL, fetched fresh.
5. **Test, fix, retest before moving on;** log every bug in
   `docs/run1-bugs.md` (what broke, cause, fix, retest result).
6. **Never edit `public/robots.txt` or add `noindex` to page HTML.**
7. **Structured data only via `JsonLd.tsx`.** Keep every page's title,
   meta and structured data.
8. **Commit** per component and per page; **push `redesign-central`**
   after Step 1, after Step 2, and at the end.

---

## STEP 1 — BUILD THE CENTRAL SYSTEM

- **Themes:** one set of variables per theme (Vedic, Birthday, Mystic,
  Science, Neutral), selected by a single page attribute, using the
  finalized tokens in the design-system doc (accessible text shades
  included: bronze `#806125`, `#B5432A`, `#237A60`).
- **Layouts:** the seven layout components (Tool, Report, Hub,
  Collection, Article, Money, Utility). Each owns the header block
  (breadcrumb, eyebrow, H1, lead, trust line), content grid, spacing and
  responsive behaviour.
- **Build the Vedic theme by lifting it from the current redesigned Vedic
  pages** — they are the approved look. The Vedic hub
  (`/vedic-astrology`) and Kundli are the visual standard.
- **Layout acceptance rules built in:** no empty side columns or blank
  bands wider than ~160px; main action or content visible on the first
  screen; long reading text kept at a readable width (about 65–75
  characters), with side space used for useful content (contents, key
  facts, related tools) rather than left blank.
- Unit-test the theme selection and each layout's header block.

---

## STEP 2 — MOVE EVERY VEDIC PAGE ONTO IT

Use the route list in `docs/part-ap-design-system.md` (it includes the
hub, Kundli, Kundali matching, Sade Sati, Muhurat, gemstones, Rashi
Ratna, career report, sun-vs-moon sign, moon sign, AI astrologer,
nakshatra, and any other Vedic-assigned routes, including Hindi ones).
Cross-check that list against the real routes in `App.tsx` so no Vedic
page is missed. For each page:

1. **Before:** screenshot at desktop 1440 and phone 390, and record its
   outputs for fixed inputs (the reference charts used throughout the
   project) plus what is locked/unlocked.
2. **Move it** onto its layout and the Vedic theme. Keep its content,
   calculations, birth-detail carry-forward, glossary terms and paid
   flows exactly as they are.
3. **Fix known layout problems while moving:** for example, Kundli's
   empty "Birth details" label column — use the full width or put useful
   content beside the form.
4. **After:** screenshot again and compare. Pages that were already
   redesigned must look the same or better, never worse. Outputs and
   gating must be identical.
5. **Speed must not regress:** the page's H1 and lead text must be present
   and visible in the prerendered HTML, without waiting for JavaScript.

---

## STEP 3 — TEST THE VEDIC GROUP (fix and retest until clean)

- **Inputs — positive, negative, edge:** valid details give correct,
  complete results; empty fields, impossible dates (31 Feb), future
  dates and unknown cities show clear messages, never a crash; leap-day
  birth, unknown birth time, midnight birth, very old dates (1900), Hindi
  pages all work.
- **Journeys:** Vedic hub → Kundli with birth details carried (no
  re-entry) → full chart → matching → Sade Sati → Muhurat; paid Kundli
  report flow up to the checkout window opening (on staging); AI
  astrologer answers a normal question and its guardrails still respond.
- **Interactive pieces:** tabs, modals (checkout, region), tooltips and
  glossary terms, date/time pickers — by mouse, touch and keyboard.
- **Browsers:** Chromium desktop, WebKit (iPhone Safari) and Android
  Chrome emulation. Install WebKit for Playwright if missing.
- **Layout audit:** every Vedic page at 1440 and 390 passes the
  acceptance rules; screenshots with an `index.html` contact sheet in
  `docs/run1-screens/` (don't commit images over ~50 MB).
- **Accessibility:** automated scan (axe) on each Vedic layout type —
  zero serious or critical issues.
- **Served output:** correct title, single `<h1>`, valid JSON-LD
  (validator.schema.org, 0 errors) on each Vedic layout type.
- **No regressions elsewhere:** before Step 1, screenshot the homepage and
  two pages from each other category (Birthday, Mystic, Science) plus a
  general page at 1440 and 390; after this run they must look identical —
  the central system must not change any page that hasn't moved yet. Full
  automated test suite passes.
- Zero console errors.

---

## STEP 4 — DEPLOY TO STAGING AND PUSH

Build, dry-run, confirm `bornclock-staging`, deploy to staging, and
re-check the Vedic pages there. Push `redesign-central`. Do not merge.

---

## REPORT

Write `docs/run1-report.md` and include it in full in your last message.
**First line: "RUN 1 COMPLETE: YES" or "RUN 1 COMPLETE: NO — reasons".**
Then: what the central system contains; every Vedic route moved, with a
before/after note; test results (inputs, journeys per browser,
accessibility, served output); the bug log summary; the staging URL to
look at; and the exact list of what's ready for run 2 (Birthday &
Celebrity) to reuse.
