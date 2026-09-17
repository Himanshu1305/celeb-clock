# Part U — Flags (genuine surprises / decisions / out-of-scope items)

## Decisions logged
- **Biorhythm placement (Part 1 judgment call):** the current copy frames Biorhythm as
  "Biorhythm science predicts your physical, emotional, and mental peaks" and there's a
  "Longevity Coach" + "Energy Forecast". Per the spec's guidance, tools framed as genuine
  circadian/energy science → Science & Longevity; casual → Birthday Fun. Decision: the
  homepage/Explore "Biorhythm Calculator" (`/biorhythm`) and "Energy Forecast"
  (`/energy-forecast`) read as circadian/energy science → **Science & Longevity**. The
  "Biorhythm Workout" (`/biorhythm-workout-calculator`) is fitness-framed → also Science
  & Longevity (energy/fitness). Noted so it's an explicit, reviewable call.

## Celebrity-count accuracy (Phase 0.3)
- **Fixed on the homepage:** "50,000+ celebrities" → "3,000+ celebrities" in
  `Index.tsx` (hero) and `BentoGrid.tsx` (both render on the homepage). Real source:
  `celebrities.json` = 3,107. The "598 Indian celebrities" references are accurate
  (`indianCelebrities.length` = 598) and left as-is.
- **OUT OF SCOPE (flagged, not fixed):** the same unsupported "50,000+ celebrities"
  claim also appears in `src/pages/CelebrityBirthday.tsx:90` and
  `src/data/blogPosts.ts:5421`. These are off the homepage (Part U scope = homepage +
  nav). → USER: consider correcting these too for site-wide honesty.

## Hard-rule verification
- Link-preservation diff produced in the final report (before/after). No route renamed,
  moved, or redirected; no homepage link removed.

## Choose-Your-Path card landing (Part 4 finding)
- The "Birthday Fun & Celebrity Twins" card initially pointed at `/celebrity-birthday`,
  which is an INTENTIONAL pre-existing redirect (`App.tsx`: `<Navigate to="/celebrity/"
  replace />`). Working, but a redirect hop. Changed the card to link directly to
  `/todays-birthdays` (lively, non-redirecting birthday-fun flagship, already a homepage
  link). Not a bug — `/celebrity-birthday` still exists and still redirects as before;
  the "Celebrity Match" nav item is unchanged.

## Nav test update (Part 4 — expected vs regression)
- **Expected update (intentional redesign):** `e2e/prelaunch/navigation.spec.ts` fully
  rewritten from the OLD structure (visible-bar / Explore / Astrology / More) to verify
  the NEW four-category (+More) structure, per-category grouping, Compatibility dedup,
  and no cross-category duplicates. 10/10 pass on the new code (local preview).
- **Expected update (test was nav-coupled):** `CompatibilityPage.test.tsx` TC-COMPAT-P-09
  now calculates first to assert the page's OWN post-results birthday-report CTA; it was
  previously passing only because the old nav rendered a `/birthday-report` link in the
  always-visible bar. Not a product regression — the page CTA is intact and the nav still
  reaches `/birthday-report` via the Birthday Fun dropdown.
- **`e2e/navigation.spec.ts`:** needed NO change (it tests route loading + generic nav
  visibility, not dropdown structure).
- **No genuine/unexpected regressions found** outside these deliberately-updated tests.

## Staging deploy (Part U)
- First `wrangler deploy` FAILED on a transient Cloudflare asset-upload timeout
  ("Upload took too long on bucket 4/6" — 3,819 assets). Wrangler saved progress; the
  RETRY resumed and succeeded (uploaded in 64s). NOT a code issue.
- Final deploy log shows the KNOWN cron/schedules trigger failure
  ("Some triggers failed to deploy … /schedules") — this is the already-diagnosed
  Cloudflare scheduled-trigger issue (docs/part-p-flags.md), harmless to this nav/
  homepage change. Worker + assets deployed fine.
- Verified LIVE on staging: new tagline present, all five nav-cat triggers present,
  staging JS bundle == local build (index-Cue19vXu.js). Nav spec 10/10 green vs live
  staging. Production untouched.
