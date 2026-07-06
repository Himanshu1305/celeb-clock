# Flow & Abruptness Audit — BornClock Launch Readiness
**Date:** 2026-07-06  
**Scope:** Birthday Report generate→view→unlock→subscribe flows; auth; Upgrade page  
**Method:** Code reading (BirthdayReport.tsx, ReportView.tsx, Upgrade.tsx, Auth.tsx, api/*)

---

## Severity legend

| Label | Meaning |
|-------|---------|
| **LAUNCH-BLOCKER** | Breaks a monetisation or trust path; must fix before going live |
| **POLISH** | Noticeable friction; worth fixing in the same sprint |
| **LATER** | Real issue but tolerable at launch |

---

## Findings

### F-01 — "Sign in to Unlock" loses the report URL after login
**Severity: LAUNCH-BLOCKER**

`ReportView.tsx` renders `<a href="/login">Sign in to Unlock</a>` for unauthenticated users.  
After the user signs in, `Auth.tsx` likely redirects to `/` (home) — the report URL is not preserved.  
The user has to manually navigate back to the report, find the link, and unlock.  
**Impact:** Most conversion happens on the first sign-in touch; losing the URL here causes drop-off.  
**Fix:** Pass `?returnTo=/report/[slug]` when linking to `/login`; read `returnTo` in `Auth.tsx` and redirect back after success.

---

### F-02 — Upgrade page heading and features list are Longevity-centric, no birthday report mention
**Severity: LAUNCH-BLOCKER**

`Upgrade.tsx` line 125: heading is "Unlock Your Complete Longevity Blueprint".  
Features list (line 66): `'Birthday reports (3/month)'` — both the quota number AND the framing are wrong under the new model (1 credit/month, rollover cap 3).  
A user landing on `/upgrade` from the birthday report unlock CTA sees no clear statement that the subscription gives them birthday report credits.  
**Impact:** Conversion wall — user doesn't understand the value exchange.  
**Fix:** Update heading to `"Unlock BornClock Premium"` or similar platform-neutral framing. Change features item to `"Birthday report credits (1/month, up to 3)"`. Add a short "Subscribers get one free birthday report credit every month" sentence near the pricing cards.

---

### F-03 — Unlock CTA shows ₹199 for subscribers who will actually be charged ₹149
**Severity: LAUNCH-BLOCKER**

`ReportView.tsx` unlock CTA: `Unlock — {isIndia ? '₹199' : '$2.99'}` — hardcoded to the non-member price.  
Subscribers who click "Unlock" see ₹199 in the CTA, then a Razorpay checkout showing ₹149 (member price applied server-side in `create-order.ts`).  
**Impact:** Pricing surprise at checkout — trust damage, potential abandons.  
**Fix:** `useAuth` already exposes `profile?.subscription_status`. If `subscription_status === 'active'`, show `₹149`/`$2.49` in the CTA. Requires reading `subscription_status` from the `Profile` interface (currently not typed, but present in `select('*')` result).

---

### F-04 — No pre-generation preview hint on BirthdayReport.tsx
**Severity: POLISH**

The form says "Create Birthday Report 🎂" and the hint text says "Report link is shareable · Unlock the full report with a one-time purchase". But users don't know *before* clicking what they'll get.  
After the loading animation, they land on a locked report — this can feel like being tricked if they expected a complete free report.  
**Fix:** Add a brief note below the button (before submission): "Free to create · First two sections always visible · Unlock the full Blueprint from inside the report." This sets expectations before the click.

---

### F-05 — Success state on BirthdayReport.tsx doesn't communicate locked status
**Severity: POLISH**

After report generation (`phase === 'success'`), the page shows the report URL with a "Copy Link" / "View Report" UI. There's no indication that the report is a locked preview.  
The user copies the link, sends it to their friend, and the friend lands on a locked report. If the gifter doesn't know this, it's an awkward experience.  
**Fix:** Add a "🔒 Preview only — buy the full report in 2 taps" callout in the success state, with a link directly to the report's unlock CTA.

---

### F-06 — Post-payment optimistic UI gap (race window)
**Severity: POLISH**

After Razorpay `onSuccess`, `ReportView.tsx` calls `getReport(slug)` to reload `is_paid`. There is a small window where the verify-payment server call hasn't completed yet, and `getReport` might return `is_paid=false`.  
The current code does the Supabase refetch inside `onSuccess` which fires immediately after the client-side success callback — not after verify-payment finishes.  
**Impact:** Occasional flash of locked state immediately after payment, then brief re-render to unlocked. Rare but jarring.  
**Fix:** In `RazorpayService.initiateOrderPayment`, call `onSuccess` only *after* `verify-payment` returns 200. Currently this is the case (success calls `onSuccess` after the verify call) — but the `setRow(refreshed)` in `handleUnlockWithCredit` also has a timing gap if the `is_paid` write hasn't propagated yet. Add a 500ms delay before the `getReport` call, or poll until `is_paid=true` (max 3 attempts).

---

### F-07 — Placeholder sections generate scroll debt after unlock CTA
**Severity: POLISH**

With 5 locked sections (each ~128px tall), the page has ~640px of placeholder content below the unlock CTA. After paying, the entire page re-renders with real content — which is a delightful "unlock" moment.  
However, before unlocking, the user scrolls past 5 lock placeholders with no payoff. The placeholders feel like dead space.  
**Fix:** Collapse the locked section count. Instead of 5 separate placeholder divs, render a single "Everything below is locked" block listing all 5 section names. This compresses the lock UI from ~640px to ~200px, reducing the "broken scroll" feel.

---

### F-08 — Credits education missing from the unlock CTA
**Severity: LATER**

The CTA shows `Use a subscriber credit (X remaining)` only if `credits > 0`. Users with 0 credits (new subscribers who haven't accrued yet) never see that they *will* get credits. The lazy-accrual pattern means a new subscriber checking on Day 1 of their first month gets 0 credits shown with no explanation.  
**Fix:** If `subscriptionActive && credits === 0`, show "Your first credit arrives next calendar month" below the buy button, so subscribers understand the benefit timeline.

---

### F-09 — view_count increment silently fails (pre-existing)
**Severity: LATER**

`BirthdayReportService.getReport()` attempts to increment `view_count` via `supabase.update()`. No UPDATE policy exists on `birthday_reports` for authenticated clients → RLS default-deny → silent no-op.  
**Fix:** Add an RPC (SECURITY DEFINER) for incrementing view_count, or add a targeted UPDATE policy scoped to `view_count` only. Not urgent since view_count is analytics-only.

---

### F-10 — "Continue to Longevity Calculator" on already-premium screen ignores Birthday Reports
**Severity: LATER**

`Upgrade.tsx` line 116: if `isPaidPremium`, shows "Continue to Longevity Calculator →". A subscriber who just paid and wants to use their birthday report credit has no obvious path shown.  
**Fix:** Add a second CTA: "Create a Birthday Report →" linking to `/birthday-report`.

---

## Summary table

| ID | Flow | Severity | File |
|----|------|----------|------|
| F-01 | Sign in → report URL lost after login | LAUNCH-BLOCKER | Auth.tsx, ReportView.tsx |
| F-02 | Upgrade page wrong heading + credits description | LAUNCH-BLOCKER | Upgrade.tsx |
| F-03 | Subscriber sees ₹199 CTA but pays ₹149 | LAUNCH-BLOCKER | ReportView.tsx |
| F-04 | No pre-generation locked-preview warning | POLISH | BirthdayReport.tsx |
| F-05 | Success state silent about lock | POLISH | BirthdayReport.tsx |
| F-06 | Post-payment optimistic UI race | POLISH | RazorpayService.ts |
| F-07 | 5 placeholder sections = scroll debt | POLISH | ReportView.tsx |
| F-08 | No "credits coming next month" message | LATER | ReportView.tsx |
| F-09 | view_count increment silent failure | LATER | BirthdayReportService.ts |
| F-10 | Already-premium screen ignores Birthday Reports | LATER | Upgrade.tsx |
