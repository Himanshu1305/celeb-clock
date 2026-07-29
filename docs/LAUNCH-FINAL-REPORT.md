# Launch Final — Report

**Branch:** develop (local commit only — NOT pushed).
**Deploy:** one `./node_modules/.bin/wrangler deploy` → live at `bornclock.usdvisionai.workers.dev` + `staging.bornclock.com`.
**Frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts`.
**Date:** 2026-07-29.

---

## PART 1 — BLOCKERS

### B1 — Email flood (deliverability) ✅

**The three emails.** All three were the SAME template — `welcomeEmail()` in `api/_email.ts` (`type: 'welcome'`) — which picks a random subject from a 4-element array (`_email.ts:89-95`):
1. "…, your birthday just revealed something" (index 1)
2. "Your clock is ticking, … — in the best way" (index 2)
3. "BornClock is live for you, … ☀️" (index 3)

**What triggered each.** The only caller is `useAuth.ts` (welcome-on-first-confirmed-`SIGNED_IN`, added last batch). **This is scenario (b): three independent triggers keyed to the same event.** Root cause: `useAuth` is a plain hook (not a context), instantiated by 20+ components; each registers its own `supabase.auth.onAuthStateChange` listener. On `SIGNED_IN` they ALL fire, and the per-instance `localStorage` check-then-set could race (several read "not sent" before any writes), so 3+ listeners each sent a welcome — each rolling a different random subject. There is NO separate nurture/drip firing inline (the only inline welcome is this one).

**Fix.** Added a **module-level `Set<string>` (`welcomedThisSession`)** shared across every `useAuth` instance, checked+set synchronously before the send. The first listener adds the id; the rest see it and skip — the multi-listener race is eliminated in-tab. `localStorage` remains the cross-reload backstop, and the send only happens if `localStorage` didn't already record it. Net: **exactly one welcome per user.** No day-2/day-4 sequence exists to schedule, so nothing was deferred to cron. (`src/hooks/useAuth.ts`.)

### B2 — Phase-aware rendering ✅

**Why the previous gate "failed".** The code shipped last batch was actually correct — "A peek inside" and the gift strip were each wrapped in `{phase !== 'success' && (…)}`, and re-inspection confirms those gates are structurally sound. The most likely cause of the founder still seeing them is a **stale/cached build** at test time. Regardless, I made it bulletproof and went further than before: the hero and the "Why it makes the perfect gift" cards are now ALSO gated, so the success phase renders the success block ONLY.

**Sections present in the success phase (verified by reading the gated JSX):**
1. Top nav (logo + auth)
2. Success block: "Report Ready!", the report link, Copy / Open / WhatsApp / Email buttons, "Generate another report →"
3. Footer

Hidden after generation: pricing card, "A peek inside" (+ its 🔒 lock icon), gift strip, hero, why-cards. (`src/pages/BirthdayReport.tsx`.)

### B3 — Stale entitlement after "Generate another" ✅

The entitlement fetch was keyed on `user?.id`, which doesn't change on reset, so the card kept the pre-generation state ("1 free report") after the trial report was consumed. Extracted the fetch into `refreshEntitlement()` (useCallback) and call it inside `handleReset()`, so "Generate another report" re-pulls `/api/report-entitlement` and the card reflects the now-consumed trial (→ ₹199). Never cached across generations. (`src/pages/BirthdayReport.tsx`.)

### B4 — One currency, not both ✅ (see C2b)

The card no longer renders "₹199 / $6.99" together — it shows the single resolved-currency price via `reportPrice(currency)`. Same for ReportView, Showcase, Pricing.

### B5 — Section count is 9 ✅

`REPORT_SECTION_COUNT` was 10; the report emits **9 numbered sections** (the cover is not a section). Enumerated from the section banners in `ReportView.tsx`:
`01 TWINS · 02 ASTROLOGY · 03 NUMBERS · 04 NAME · 05 ARCANA · 06 TALISMAN · 07 COSMOS · 08 ERA · 09 CYCLES`
(Moon Sign & Nakshatra lives inside 02 ASTROLOGY, not its own numbered section — that's where the 10 came from.) Set `REPORT_SECTION_COUNT = 9`. Every surface reads the constant, so showcase, /pricing, the report locked-block, and both nudge emails updated automatically. (`src/lib/reportFacts.ts`.)

### B6 — Planet count 8, Earth added ✅

Added **Earth** as the FIRST card in the Solar System Ages section so it reads as a complete tour from home outward. `PLANET_COUNT = 8`. Earth's orbital period (365.25 d) added to `ORBITAL_PERIODS` (`BirthdayReportService.ts`) → `planetaryAges` now includes Earth; Earth symbol `♁` added to the report's `SYMBOLS` map; subtitle updated. The **standalone Planetary Age tool** was fixed the same way: Earth added to `ORBITAL_PERIODS_DAYS` + `PLANET_UI` (first), and the `totalBirthdays` reduce no longer separately adds `earthAge` (that would double-count now that Earth is a card). Both tools now show 8 including Earth. (Existing pre-generation reports render as-was; new reports show 8.)

---

## PART 2 — PRICING, CURRENCY, NAVIGATION

### C1 — Pricing single source ✅ (with survivors listed)

New **`src/lib/pricing.ts`** is the single source: `SUBSCRIPTION` (monthly INR 299 / USD 4.99; annual INR 2499 / USD 39.99), `REPORT_PRICE` (INR 199 / USD 6.99), `CREDITS` (3/mo, cap 9, carry-forward), `RAZORPAY_PLANS` (reads `VITE_RAZORPAY_PLAN_*`, falls back to the live dashboard IDs), and helpers (`reportPrice`, `subscriptionPrice`, `annualSaving/Label`, `annualPerMonth`, formatting, currency override). Refactored to read from it: `CountryDetectionService.formatPrice` (now delegates), `ReportView` paywall, `BirthdayReport` card + form copy, `BirthdayReportShowcase`, `Pricing`, `CheckoutRegionModal`, `PaywallModal`.

Server note: `api/create-order.ts` keeps the authoritative charge amounts (19900 paise / 699 cents) and is kept in sync by hand with `REPORT_PRICE`. `/upgrade` already showed annual alongside monthly (the founder's "omits annual" was inaccurate — both cards render); it reads subscription prices through the delegated `formatPrice`, so it matches `/pricing`.

**Surviving hardcoded prices (re-grep) — display-only, checkout is currency-correct:**
- `Terms.tsx:98-99` — legal disclosure states BOTH currencies explicitly (correct for terms, left as-is).
- Report-CTA buttons on 5 standalone calc pages (`NameNumerologyPage`, `BiorhythmPage`, `TarotByBirthday`, `MoonSignPage`, `CompatibilityPage`): "Generate My Report → ₹199".
- `FamilyDashboard.tsx:300` "from ₹299/month"; `pageFaqs.ts:187` "one-time ₹199"; `Pricing.tsx` SEO meta + pre-load fallback `₹299`.
- Comments only: CheckoutRegionModal, Showcase, Index, BirthdayReport.
These are India-price mentions on secondary/SEO surfaces; the actual purchase path (ReportView → CheckoutRegionModal → create-order) is fully currency-correct. **Recommend a follow-up sweep** to route the 5 CTA pages + FamilyDashboard + FAQ through `pricing.ts`.

### C2 — Currency ✅

**C2a — Findings (how currency is decided today):**
- `CountryDetectionService.detectCountry()` calls `ipapi.co/json`, derives `currency = countryCode === 'IN' ? 'INR' : 'USD'` (fallback INR), cached 24h in `localStorage['bornclock_country']`.
- Display everywhere gated on `isIndia`/`currency` from that detection.
- `CheckoutRegionModal` separately asks the user's country/state for the GST place-of-supply and emits `taxMode` — but it did NOT set currency.
- **The bug:** `startOrderPayment` passed `currency: isIndia ? 'INR' : 'USD'` (ipapi), while `taxMode` came from the modal's declared country. A USD-detected user who declares India → **USD payment carrying a CGST/SGST Telangana invoice** (broken invoice + wrong tax). Funnel events `checkout_opened`/`purchase_completed` carried neither currency nor tax_mode.

**C2b — One currency.** All priced surfaces now render a single resolved-currency price (`reportPrice(currency)`), never "₹199 / $6.99".

**C2c — Override + admin toggle.** `?currency=USD|INR` is read once on load (`main.tsx` → `applyCurrencyOverrideFromUrl`), persisted in `sessionStorage`, and forces BOTH display and checkout for the session via `resolveCurrency()`. Added an **admin-only** `CurrencyAdminToggle` (fixed bottom-left, Auto/INR/USD) that sets the override and reloads — never rendered for normal users.

**C2d — Region authoritative at checkout.** `CheckoutRegionModal` now emits `currency` in its `RegionSelection` (India → INR, else → USD), and shows the **corrected price** on the Continue button as soon as a region is picked (before Razorpay opens). `ReportView.startOrderPayment` uses `sel.currency` instead of ipapi `isIndia` — so the confirmed region drives currency AND tax together, eliminating the mismatch.

**C2e — Tracking.** `checkout_opened` and `purchase_completed` now carry `currency` and `taxMode`. **Deferred (noted):** the admin Business-Metrics split (revenue/purchases by currency + EXPORT-invoice count). The tracking data is now flowing on the events; wiring the dashboard aggregation is a follow-up.

### C3 — Navigation dedupe ✅

**Explore — before:** Indian Celebrities by Date, Today's Birthdays, Answers, Compatibility, Planetary Age, Biological Age, Life Expectancy, Pricing.
**Explore — after:** Indian Celebrities by Date, Answers, Compatibility.
Removed the 5 items duplicated in the main bar or More (Today's Birthdays, Planetary Age, Biological Age, Life Expectancy, Pricing). Footer Explore left as-is (SEO-useful). Mobile mirrors automatically (same `exploreItems` array).

### C4 — Birthday Report into main nav ✅

**Main bar — before:** Age Calculator · Today's Birthdays · Celebrity Match · Planetary Age.
**Main bar — after:** Age Calculator · Today's Birthdays · Celebrity Match · **Birthday Report**.
Planetary Age moved into **More** (still one click, no duplication; route unchanged so no internal `/planetary-age` links break — footer/More still link it). Mobile mirrors (same `navItems`).

---

## PART 3 — SMALLER ITEMS

### D1 — Free-user credit row upsell ✅
`/profile`: active subscribers still see "Report credits: N of 9 · mechanics"; everyone else now sees an upsell — *"Premium members get 3 report credits every month — unused credits carry forward, up to 9."* with an **Upgrade** CTA (was a confusing 0-of-9 balance). (`src/pages/Profile.tsx`.)

### D2 — Sign-out scope ✅
`supabase.auth.signOut()` → `signOut({ scope: 'local' })` — signs out only the current device. Global sign-out remains available for a future "sign out everywhere" feature. (`src/hooks/useAuth.ts`.)

### D3 — PDF indentation ✅
**Misaligned sections:** Moon Sign and Nakshatra. Their body paragraphs were wrapped in `rounded-2xl p-5` cards (a `--panel-2` card for Moon; a `--gold-tint` card for Nakshatra), so the text sat ~20px in from the left — indented relative to their section headings and to every other section's body. The adjacent Vedic Rashi section (same ASTROLOGY block) renders its essence FLUSH (`space-y-3`, no card). **Fix:** removed the `p-5` card wrappers from the Moon and Nakshatra identity blocks so their essence renders flush like Rashi; kept the Nakshatra gold eyebrow + inner gold-bordered Shakti/gemstone box for emphasis, and the "What is a Moon Sign?" explainer callout (a deliberate note box) unchanged. (`src/pages/ReportView.tsx`.) Note: verified at the markup level against the Rashi pattern; a final visual PDF pass is recommended since the print harness isn't runnable in this environment.

---

## GATE

| Check | Result |
|---|---|
| `tsc -p tsconfig.app.json` | **46 = baseline, 0 new** |
| `npm run build` | **1313 ok, 0 failed, 0 skipped** |
| Launch gauntlet | not run this batch (heavy local harness) — skipped per gate |
| Frozen payment files | **untouched** |
| Live smoke — create-order | `report_slug:"zzzzzzzz"` → **`{"error":"Report not found"}`** (field is `report_slug`, snake_case) |
| Deploy | worker + assets live (cron-trigger error = pre-existing unrelated CF issue) |

---

## Founder re-test checklist

1. **Signup → confirm email → land on site**: exactly ONE welcome email; no flood. Log in again → no duplicate.
2. **/birthday-report**: generate a report → page shows the success block ONLY (no pricing card / peek / gift / hero / lock icon). Click "Generate another report" → trial user now sees ₹199 (not "1 free report").
3. **One currency**: pricing card / paywall / showcase / pricing show a single currency. Append `?currency=USD` → everything (incl. the checkout amount) switches to USD for the session. As admin, use the bottom-left ₹/$ toggle.
4. **Checkout currency = region**: as a USD-detected user, in the region modal pick "India" → the Continue button price flips to ₹199 and the payment is INR with a CGST/SGST invoice (no USD-with-Telangana-tax).
5. **Report body**: 9 sections; Solar System Ages shows 8 planets starting with Earth; Moon Sign & Nakshatra body text is flush (not indented).
6. **/profile**: free user sees the credits UPSELL (Upgrade CTA); active subscriber sees the N-of-9 balance.
7. **Sign out** on one device → other devices stay signed in.
8. **Nav**: "Birthday Report" is in the top bar; "Planetary Age" is under More; Explore has only Indian Celebrities / Answers / Compatibility.

## Commit
`feat: launch final — email throttle, phase gate, pricing single-source, currency, nav` on `develop` (local only, not pushed).
