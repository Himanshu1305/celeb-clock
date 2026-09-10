# Part I — Flags for the person's morning review

Everything below is a judgment call made conservatively on your behalf during the
unattended run (per the "stop and flag in writing, then continue" rule), or a
decision point that is explicitly yours to make. Nothing here blocked the batch.

## Decisions you should confirm

### 1. Chat 3-question free cap (Part 22 — your product decision, no code changed)
The astrologer chat allows **3 free questions/day** (15 for paid). This is a genuine
tradeoff already identified: **tight for a "try it" first impression** (a curious
first-time visitor hits the wall fast and may leave under-impressed), but **right for
monetisation** (it protects Gemini cost and creates a real reason to upgrade). No
change was made — this is your call. Options if you want to soften it: raise the free
cap to 5, or make the *first ever* session unlimited-for-N-minutes, or gate only the
4th+ question behind a soft signup rather than a hard stop.

### 2. Paid gating of the new deep reports (Matching breakdown, Career report)
The spec asked to gate the Career report "the same way Matching's detailed breakdown
is." **Matching is not hard-paywalled today** (all Vedic features are currently free),
so to stay consistent I did **not** add real payment enforcement to either. The Career
page carries a "Premium depth" badge as an affordance only. **Turning on real payment
gating is a monetisation task for you** — it needs the paywall/credits flow wired and
tested, which is higher-risk than an unattended run should attempt.

## Genuine source disagreements (flagged, not silently resolved)

### 3. Gemstone selection method (Part 11) — real variance
The Navaratna planet→gem *mapping* is standard and agreed. The *selection method* is
not: traditions variously prioritise (a) the **Ascendant lord's** lifelong stone, (b) a
**Shadbala-weak-but-favourable** planet's stone, or (c) the **current Mahadasha lord's**
stone; and "functional benefic/malefic" is judged differently across schools. I used
(a)+(b) — the mainstream Parashari approach — and disclosed this on the page and here.
Gemstones are the **lowest-confidence, most-caveated** feature in the product, and there
are real gemstone-selling scams in the industry, so it is informational only, with no
sales flow and heavy non-medical/non-guarantee disclaimers.

### 4. Ashtakoota conventions with cross-software variance (Parts 2-7)
Disclosed in the on-page methodology note and here:
- **Varna** uses the classical directional rule (groom's Varna ≥ bride's = 1 point).
  No gender is collected, so **Person A is treated as the groom-position**. This is a
  real convention choice; flag if you'd prefer a symmetric/gender-neutral rule instead.
- **Vashya** uses a whole-sign group table; the classical half-sign splits (Dhanu,
  Makara) and the full "food/controller" half-point matrix are simplified to
  same/compatible/incompatible. Mainstream convention, lower precision by nature.
- **Yoni** uses same(4)/neutral(2)/deadly-enemy(0) tiers; the finer friend(3)/enemy(1)
  tiers are not split out.
These only affect small point totals; Nadi & Bhakoot (the heavy Kootas) are computed
in full.

## Scope-downs made to fit the unattended run (per Phase 0 "scope down if needed")

### 5. Matching PDF export = browser print (Part 2.6)
The existing PDF infra (`api/_pdf.ts`) is server-side and needs Cloudflare Browser
Rendering credentials — reuse from the client Matching page would need a new server
endpoint. Per the Phase 0 instruction to scope down rather than open-ended-engineer,
the PDF export is a **print-to-PDF button** (`window.print()` on a print-optimised
layout with the chrome hidden). Produces a clean, readable file; a server-rendered PDF
is a future upgrade if you want a branded template.

### 6. Muhurat finder scope (Part 9)
v1 finds auspicious **dates** in the next N days for a purpose (business/travel/general)
by Tithi + Nakshatra + Yoga + weekday, and reports the **Rahu Kalam** window to avoid.
Panchang is evaluated at ~local sunrise and Rahu Kalam assumes a ~06:00–18:00 day (not
true per-location sunrise/sunset). **Deferred to a future expansion:** Chaughadia/Hora
exact-minute windows, true sunrise/sunset, and personal-chart Chandrashtama.

### 7. Sade Sati cycle dates (Part 10)
The engine only stored *current* status; cycle **start/end dates** are new work here,
computed by scanning Saturn's (validated) transit sign — same position engine, no new
astronomy. Phase logic was verified to match the validated engine on 4 charts.

## Cookie-banner Playwright fix (Part 21) — verification note
A clean global fix was applied: a `storageState` baseline that pre-dismisses the
cookie-consent banner for both origins, wired into both Playwright configs — zero
changes to any individual test file. Its effect on the ~190 pre-existing staging
failures is **not** fully re-measured here, because this branch isn't deployed to
staging and the full 190-suite cleanup is explicitly a separate effort. The fix is
low-risk (only pre-sets a consent flag) and is verified locally via the e2e-reading
screenshots (the banner no longer overlaps content).

## Explicitly NOT done (per spec — stay for your dedicated attention)
- **Chat Yoga/Nakshatra citation** — excluded (needs your safety review).
- **Account-level profile sync** — excluded (needs a Supabase migration unsafe to
  apply/verify from this environment).
- **Fixing all ~190 pre-existing Playwright failures** — only the bounded cookie-banner
  fix was attempted (Part 21).
