# Launch Batch Fix — Report

**Branch:** develop (local commit only — NOT pushed).
**Deploy:** one `./node_modules/.bin/wrangler deploy` → live at `bornclock.usdvisionai.workers.dev` + `staging.bornclock.com`.
**Frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts` (git-status proof: none present).
**Date:** 2026-07-29.

---

## Files changed

| File | Fix | What |
|---|---|---|
| `src/lib/reportFacts.ts` *(new)* | 4 | Single source: `REPORT_SECTION_COUNT=10`, `PLANET_COUNT=7`, labels |
| `src/lib/zodiacPlurals.ts` *(new)* | 6 | Explicit Western + Chinese plural maps |
| `api/report-entitlement.ts` *(new)* | 1 | One endpoint → `{ trialReportUsed, credits, isTrial, trialDaysRemaining, subscriptionActive }` |
| `functions/_worker.ts` | 1 | Register `/api/report-entitlement` route |
| `src/pages/BirthdayReport.tsx` | 1, 2 | 5-state pricing card; phase-aware section gating + reorder |
| `src/hooks/useAuth.ts` | 3 | Welcome email moved from signup → first confirmed sign-in (guarded) |
| `src/pages/ReportView.tsx` | 4, 5, 6 | planet count via constant; Moon-sign caveat; zodiac plural helpers |
| `src/data/moonSignEssence.ts` | 5 | Softened "exact hour" overclaim → approximation |
| `src/components/BirthdayReportShowcase.tsx` | 4 | "20+ page"/"11 sections" → constants |
| `src/pages/Pricing.tsx` | 4 | "20+ page"/"11 sections" → constants |
| `api/_email.ts` | 4 | Report nudge emails: "8 planets"→`PLANET_COUNT`, "10-section"→`REPORT_SECTION_COUNT` |
| `src/lib/invoice-generator.ts` | 7 | Removed duplicated address from SUPPLIER block |
| `supabase/migrations/NOTES-redeem-credit-atomic.sql` | 8 | Added `not_owner` ownership check to the atomic fn |
| `api/redeem-credit.ts` | 8 | Handle `not_owner` → clean 403; legacy path enforces ownership too |

---

## FIX 1 — Pricing card is a state machine

**New endpoint `api/report-entitlement.ts`** (registered in `functions/_worker.ts`) returns all four inputs in ONE call, computed **server-side** (trial derived from `profiles.created_at`; `trialReportUsed` from counting `birthday_reports.unlock_source='trial'`; credits + subscription from the profile). Money is never gated on a client flag — `save-report.ts` remains the server enforcer; the card is display only. If the `unlock_source` column is unapplied, the count query throws → `trialReportUsed=false` (feature dormant, mirrors save-report).

**`BirthdayReport.tsx`** fetches it on `user.id` change, falls back to `useAuth` trial flags only until it loads, and evaluates five mutually-exclusive states in priority order:

| State (kind) | Condition | Headline rendered | Sub-line rendered | CTA |
|---|---|---|---|---|
| `trial_free` | isTrial && !trialReportUsed | **1 free report** | `Included in your trial · N days remaining` | **Create Now →** |
| `sub_credits` | activeSub && credits>0 | **N report credits available** | `This report uses 1 · N−1 remaining after` | **Create Now →** |
| `trial_used` | isTrial (free used) | **₹199 / $6.99** | `Launch price · your free trial report has been used` | **Create & unlock →** |
| `sub_nocredits` | activeSub && credits==0 | **₹199 / $6.99** | `Launch price · no credits left this month` | **Create & unlock →** |
| `paid` | otherwise | **₹199 / $6.99** | `Launch price` | **Create & unlock →** |

`sub_credits` is checked before `trial_used` so a subscriber whose credits would auto-unlock never sees a price. Money-back guarantee line shows only on price states (`!isFreeState`). Balance is also shown in the report header for subscribers (existing chip from the prior batch, `ReportView.tsx`) and the redemption success toast is retained.

**Live proof:** `GET /api/report-entitlement?userId=<uuid>` → `200 {"trialReportUsed":false,"credits":0,"isTrial":false,"trialDaysRemaining":0,"subscriptionActive":false}`; missing userId → `400 {"error":"Missing userId"}`.

## FIX 2 — Phase-aware rendering

`BirthdayReport.tsx` restructured. Pre-generation order is now **pricing card → form → "A peek inside" → gift strip** (the form was relocated above the marketing sections). Each of the three marketing sections is wrapped in `{phase !== 'success' && ( … )}`, so **after generation only the success block renders** — no sales pitch for the thing just made, and the "🔒 Generate a report to unlock the full view" lock icon is gone. Sections are gated, not deleted (grep proof: "A peek inside" ×1, gift heading ×1, three `phase !== 'success'` gates). Hero + "Why it makes the perfect gift" are intentionally kept (the prompt enumerated only those three to hide).

## FIX 3 — Welcome email timing

`useAuth.signUp` no longer calls `EmailService.sendWelcome` (the cause of "welcomed, then refused at login with Email not confirmed"). It now fires from the `onAuthStateChange` listener on the **first `SIGNED_IN` event where `email_confirmed_at`/`confirmed_at` is set**, guarded by a per-user `localStorage` flag (`bc_welcome_sent:<userId>`) set **synchronously before** the async send so a double-fire can't duplicate. Email confirmation itself is untouched (load-bearing: gates the trial free report + invoice delivery). Known edge: a first login on a brand-new device without the flag could re-send once — acceptable for launch; a cross-device-durable guard needs a `profiles.welcome_email_sent` column (DDL, deferred).

## FIX 4 — Counts single-sourced

**True values derived from the renderer:**
- **`PLANET_COUNT = 7`** — `Object.entries(planetaryAges)` is built from `ORBITAL_PERIODS` in `BirthdayReportService.ts:12` = Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune. Earth is the baseline ("N years old on Earth"), not a card. Matches the `SYMBOLS` map in `ReportView.tsx` (7 keys) and the measured PDF (7 cards).
- **`REPORT_SECTION_COUNT = 10`** — distinct titled `<h2>` sections a reader scrolls: Celebrity Twins, Zodiac Profile, Moon Sign & Nakshatra, Numbers & Life Path, Name Numerology, Birthday Tarot, Cosmic Connections, Solar System Ages, Generation Portrait, Biorhythm.

New `src/lib/reportFacts.ts` exports the numbers + `SECTIONS_LABEL`, `PLANETS_LABEL`, `KEEPSAKE_LABEL`. Referenced from every surface:

| Surface | Before → After |
|---|---|
| Showcase para | "20+ page … across **11 sections**" → "(page claim dropped) … across **{10} sections**" |
| Showcase bullet | "**11 personalised sections**, one birth date" → "**10 personalised sections**, one birth date" (`SECTIONS_LABEL`) |
| Pricing bullet | "**20+ page** personalised PDF" → "**Print-ready** personalised PDF"; "**11 sections**" → "**10 sections**" |
| ReportView locked block | "Your age across all **8** planets" → "all **7** planets" (`PLANET_COUNT`) |
| BirthdayReport checklist | "Age on all **7** planets" → `` `Age on all ${PLANET_COUNT} planets` `` (already 7; now sourced) |
| `_email.ts` report-locked nudge | "full **10-section** Blueprint" → sourced; "Planetary ages across all **8** planets" → **7** |
| `_email.ts` report-created | "Planetary ages across all **8** planets" → **7** |

"20+ page" removed everywhere (a real PDF measured ~19 pages — the claim was false). Section count is exact and preferred.

**Out of scope / flagged:** the standalone Planetary Age tool (`PlanetaryAge.tsx`, `PlanetaryAgePage.tsx`, `_email.ts:313` calculator nudge, `HowOldAmIOnMars.tsx`, blog) still says "all 8 planets" while its own `ORBITAL_PERIODS_DAYS` has 7. That's a separate product surface (not the report); left unchanged to respect scope. **Founder decision needed:** align the standalone tool to 7, or add Earth/Pluto to make 8 true.

## FIX 5 — Moon sign precision

`moonSignEssence.ts` `whatIsIt`: "determined by the position of the Moon at the **exact moment of your birth — not just the date, but the hour**" → "**shaped by the position of the Moon around the time you were born. The Moon moves quickly — it changes sign roughly every two to two-and-a-half days — so a precise reading normally uses the exact birth hour; from a birth date alone, the moon sign here is a close approximation.**" Plus a new caveat line under the moon-sign card in `ReportView.tsx`, matching the existing Nakshatra treatment: *"Moon sign approximated from the Moon's position at date of birth — birth time is not collected."*

## FIX 6 — Zodiac pluralisation

Root cause: `Famous {westernZodiac.name}s` → "Famous **Sagittariuss**". Replaced with `westernZodiacPlural()` (and `chineseZodiacPlural()` for the "Famous {animal}s" line, fixing "Oxs"→"Oxen"). Explicit maps, `${name}s` fallback. **All twelve rendered labels:**

| Sign | Rendered |
|---|---|
| Aries | Famous **Aries** |
| Taurus | Famous **Taureans** |
| Gemini | Famous **Geminis** |
| Cancer | Famous **Cancerians** |
| Leo | Famous **Leos** |
| Virgo | Famous **Virgos** |
| Libra | Famous **Librans** |
| Scorpio | Famous **Scorpios** |
| Sagittarius | Famous **Sagittarians** |
| Capricorn | Famous **Capricorns** |
| Aquarius | Famous **Aquarians** |
| Pisces | Famous **Pisceans** |

## FIX 7 — Invoice address dedupe

`invoice-generator.ts`: removed `SUPPLIER.address` + `SUPPLIER.address2` lines from the **SUPPLIER** block. It now shows: legal name, GSTIN, LLPIN, State (36), "Registered with limited liability". The **footer** "Registered office: …" line is untouched — Rule 46 / LLP Act s.21 satisfied by that single occurrence.

## FIX 8 — `not_owner` result

`redeem_report_credit()` (in `NOTES-redeem-credit-atomic.sql`) now selects `user_id` under the report row-lock and returns `{ ok:false, error:'not_owner' }` when the caller isn't the owner (or the report is anonymous), decrementing nothing. `api/redeem-credit.ts` maps it to a clean `403 {"error":"Not your report","notOwner":true}` on both the RPC and legacy paths (legacy now selects `user_id` and enforces ownership before spending). Client: the auto-redeem effect only fires for `row.user_id === user.id`, and a non-`ok` response falls silently back to the paywall (no console error) — so a shared/public report opened by a non-owner never logs an error.

---

## GATE results

| Check | Result |
|---|---|
| `tsc -p tsconfig.app.json` | **46 = baseline, 0 new** (the flagged 3 — `setDob`, updateProfile `Partial`, `increment_report_view_count` rpc — are all pre-existing baseline) |
| `npm run build` | **1313 ok, 0 failed, 0 skipped** (550s prerender) |
| Launch gauntlet | **Not run this batch** (heavy local vite+wrangler harness) — noted skipped per gate |
| Frozen payment files | **untouched** (`git status` shows none of `_crypto`/`razorpay-webhook`/`verify-payment`) |
| Live smoke — create-order | `POST {report_slug:"zzzzzzzz"}` → **`{"error":"Report not found"}`** ✓ |
| Live smoke — new endpoints | `report-entitlement` → 200 shape; missing userId → 400; `redeem-credit` bogus → `404 {"error":"Report not found"}` |
| Deploy | worker + assets live ✓ (cron-schedule trigger error = pre-existing unrelated CF API failure) |

**GATE 5 shape note (the "changed shape" the prompt flagged):** create-order keys on **`report_slug`** (snake_case). A `reportSlug` (camelCase) body returns `{"error":"Missing report_slug or userId"}`; the correct `report_slug` body returns the expected `{"error":"Report not found"}`.

---

## MANUAL STEPS for the founder

1. **Run `supabase/migrations/NOTES-redeem-credit-atomic.sql` in Studio** (updated this batch to add the `not_owner` ownership check). It references `birthday_reports.unlock_source`, so run **`NOTES-unlock-source.sql` first**. Until applied, `api/redeem-credit.ts` uses the hardened idempotent legacy path (which now also enforces ownership).
2. **Confirm member USD price** ($5.49) — still open from the prior batch.
3. **Decide the standalone Planetary Age tool count** (FIX 4 flag): its copy says "8 planets" but its data has 7. Align copy to 7, or extend the data to a true 8.
4. **Welcome-email durability** (FIX 3): current guard is per-browser `localStorage`. If cross-device duplicate welcomes are a concern, add a `profiles.welcome_email_sent boolean` column and I'll switch the guard to it.

## Re-test list

- **Trial, free unused** → card shows "1 free report / Included in your trial · N days remaining", CTA "Create Now". Generate → report unlocks free.
- **Trial, free used** → card shows "₹199 / $6.99 · your free trial report has been used", CTA "Create & unlock".
- **Active subscriber, credits>0** → card shows "N report credits available / This report uses 1 · N−1 remaining after", CTA "Create Now"; opening the locked report auto-redeems 1 credit (toast), balance chip in header.
- **Active subscriber, 0 credits** → card shows "₹199 / $6.99 · no credits left this month".
- **Free / post-trial** → card shows "₹199 / $6.99 · Launch price".
- **After generating (any state)** → success block ONLY; no pricing card, no "A peek inside", no gift strip.
- **Sign up → confirm email → land on site** → welcome email arrives once, at confirmation (not at signup); logging in again sends no duplicate.
- **Report body** → "Famous Sagittarians" (not Sagittariuss); Moon-sign approximation caveat present; Solar System Ages shows 7 planets.
- **Buy a report → invoice** → registered address appears once (footer only).
- **Open someone else's shared locked report while logged in as a subscriber** → no auto-redeem, no console error, normal paywall.

## Commit
`feat: launch batch — entitlement-aware pricing card, phase rendering, copy accuracy, invoice dedupe` on `develop` (local only, not pushed).
