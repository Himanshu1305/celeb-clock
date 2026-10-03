# Part AO — Decisions log (autonomous, no approval gates)

## Global restyle (Step 1)
- **Master lever = design tokens.** Every shadcn/ui primitive, Navigation and Footer read the CSS
  variables in `src/index.css`, so retuning the token palette (navy `#0E2238` primary, ivory
  `#FAF7F0` background, hairline borders, warm-neutral `--accent` hover surface, navy focus ring)
  restyled the whole component layer at once. `--gradient-cosmic` was flattened to solid ivory, which
  instantly converted all ~60 pages that used `bg-gradient-cosmic` as their page background.
- **Fonts via Tailwind:** `font-sans` → Public Sans, `font-heading` → Fraunces, so every page's
  existing `font-heading`/default text picked up the brand fonts without per-page edits.
- **"Old purple" definition.** The legacy brand colour was the indigo/violet family
  (`#8B5CF6`, `#6366f1`, Tailwind `purple/indigo/violet/fuchsia-*`), NOT the new refined amethyst
  `#6E5AA6` (an allowed Mystic accent). The de-purple codemod (`scripts/ao-depurple.mjs`) is
  **shade-aware**: light shades/tints/translucent → amethyst tint; solid/interactive → navy;
  text/gradient stops → amethyst. Inline content hexes (numerology/zodiac number colours, the
  Kundali chart strokes, Razorpay checkout theme, share-card gradients, admin chart, the Amethyst
  birthstone swatch) were mapped by hand to amethyst/navy/gold.
- **Instagram share button** gradient was `from-purple-500 to-pink-500` (Instagram's own brand) —
  changed to solid navy to satisfy the strict "no old purple anywhere" rule.

## Header treatment (Step 3)
- **Two-tier → one tier (navy).** The paj landing/tool pages already used a navy `.site-header`.
  Other pages rendered `<Navigation/>` inside a white header. Per Step 1's "navy bar" instruction,
  a codemod (`scripts/ao-navy-headers.mjs`) converted the dominant page-header wrappers
  (full-width sticky white + the bare container `<header>`) to a navy, white-text bar. Navigation's
  ghost buttons + AuthNav already render on navy (proven by the homepage/paj pages).
- **Narrow-container pages** (e.g. `/diwali-gift`, `max-w-2xl`): the navy bar spans the content
  width, not the full viewport (a true full-bleed break-out is fragile across varied containers).
  Accepted as a minor cosmetic point — still unmistakably new-design.
- **Celebrity index/hub/profile templates** rendered no site nav at all — added the navy header +
  Navigation/AuthNav (improves both design consistency and navigation).
- **404 + /auth** keep a minimal, header-less centered layout (already restyled to ivory/navy via
  tokens) — standard for those page types; not treated as an "old-design" page.

## Single-h1
- `AgeCalculator` widget rendered an `<h1>`; every page embedding it also has a page `<h1>` → two
  h1s. Demoted the widget to `<h2>` (fixes numerology, age-calculator, age-in-days, age-in-seconds,
  birthday-countdown at once).

## Fonts self-hosting (Step 2)
- Self-hosted Fraunces (500/600/700), Public Sans (400/500/600/700) latin, and Noto Sans Devanagari
  (400/600/700, devanagari+latin) as woff2 in `public/fonts`. Noto sits in the font fallback chain
  with its `unicode-range` so it is fetched **only** when Devanagari glyphs render (Hindi pages) —
  English pages pay nothing. No CSP change needed (the site sets no Content-Security-Policy header).

## Staging worker (Step 4)
- Separate `[env.staging]` worker `bornclock-staging`, `workers_dev=true`, explicit `routes=[]`,
  `triggers.crons=[]`, re-declared assets+vars. Production `bornclock` worker untouched.
- **Guardrails by hostname, in the worker** (`functions/host.ts`): only `bornclock.com`/`www` are
  production; every other host gets `noindex` + disallow-all robots.txt + stripped analytics/ad
  tags. Never edited `public/robots.txt` or page HTML.
- **Did NOT auto-set staging secrets or deploy with them.** Live-vs-test secret confusion is risky
  to automate; Supabase Auth redirect URLs + Google OAuth origins (needed for staging sign-in)
  are dashboard-only. Documented under "needs the person" in `docs/staging-setup.md`.

## Payment test (Step 5)
- `issue_invoice()` runs for every payment and draws from the single live GST sequence shared with
  production → a test purchase would burn a real invoice number. **Fix:** `verify-payment.ts` skips
  real invoice numbering when the key is `rzp_test_` (staging), via the existing non-fatal `skip`
  sentinel; entitlement grant is untouched so the paywall is still exercised. Production unchanged.
- The live test itself was **not run** this session: the staging worker is not yet deployed with
  secrets, and Supabase/Google sign-in do not allow the staging address (both are the person's
  dashboard steps). The test must never run on the isolated preview (prod secrets). A manual script
  is in the final report.

## Science & Longevity full rebuild (Step 3.4) — deferred, logged
- The bespoke "Workbench" rebuild of `/life-expectancy` et al. (white bg, blue/green, honesty-forward
  structure) was NOT done. The Science pages were restyled to the new language (navy header,
  Fraunces, tokens, no purple/cosmic) but keep their existing layout. Rebuilding the paywalled
  calculator UI unsupervised risked the "preserve every feature / don't touch pricing/entitlement"
  rule more than honest deferral. Flagged in the report.
