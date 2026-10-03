# Part AO — Progress log (per finished page/group)

## Step 1 — Global shared restyle ✅
- `src/index.css` design tokens → navy/ivory/hairline/navy-ring; `--gradient-cosmic` flattened to
  ivory (converts ~60 cosmic-bg pages). `.dark` retuned.
- `tailwind.config.ts`: font-sans → Public Sans, font-heading → Fraunces, +devanagari stack.
- `Navigation.tsx` / `Footer.tsx`: indigo → navy/gold; footer link hovers → navy; Instagram button
  de-purpled.
- `index.html` theme-color → navy.
- De-purple codemod: 1837 tokens across 158 files + inline content hexes. **src has zero old-purple.**
- Verified: build green, 1869 tests, sample pages render navy/ivory/no-purple.

## Step 2 — Homepage fixes ✅
- Life-progress bar → born-on weekday + next-1,000-day milestone (UTC maths, celebration on the day);
  5 new unit tests (weekday 1869-10-02/1973-04-24/1998-03-14; leap-year, milestone day, day-before).
- Self-hosted fonts (Fraunces/Public Sans/Noto Devanagari woff2); preload H1 Fraunces; removed
  Google Fonts. Verified 0 Google-font requests, H1 in self-hosted Fraunces 700.

## Step 3 — Page conversions ✅ (new-design language site-wide) / ⚠️ bespoke rebuilds deferred
- Navy header bar on all non-paj pages: 94 headers converted (54 + 40) + celebrity index/hub/profile.
  Every page rendering `<Navigation/>` now has a navy bar or paj site-header; zero stragglers.
- Single-h1 fix (AgeCalculator widget → h2).
- Amethyst gemstone colour → brand amethyst.
- **Deferred (flagged in report):** full bespoke per-category layouts (editorial/atlas/field-guide/
  Workbench) + the Science & Longevity "Workbench" rebuild + the per-page no-wasted-space pass.
  Pages are in the new design *language* but keep their existing section layouts.

## Step 4 — Staging worker ✅
- `[env.staging]` bornclock-staging; dry-run verified (no routes/domains/crons; bindings present).
- Hostname guardrails (noindex + robots + tag-strip) + email suppression + AdUnit off-prod; unit-tested.
- `deploy:staging` / explicit `deploy:production:DANGER` scripts; `docs/staging-setup.md`.

## Step 5 — Payment test ⚠️ (protection landed; live test = needs the person)
- TEST mode now skips real GST invoice numbering (protects the live series). Live test not runnable
  autonomously (staging secrets + Supabase/Google auth are dashboard steps). Manual script in report.

## Step 6 — Verification 🔄
- Local audit: 87 shots, 0 old-purple, 0 cosmic, all 200. Re-run on deployed preview in Step 8.

## Step 8 — Merge + deploys 🔄
- Final build (--mode preview, test key) → isolated preview + staging deploy; tag develop; merge to
  develop only.
