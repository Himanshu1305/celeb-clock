# BATCH-7 — Execution Report

Delivered **P1 (redirect — verified resolved), P2 (admin root-cause + fix), P6 (months
hub), P9(b) (blog spacing)**. Deferred **P3, P4, P5, P7, P8, P9(a), P10** per the triage
rule (finish or skip cleanly). Local commits only, one deploy.

## 1. FINDINGS — root causes (plainly stated)

### P1 — /rising-sign-calculator 404 → already resolved (301)
The Worker `REDIRECTS` map (added batch 5) DOES contain `/rising-sign-calculator` and
`/rising-sign-calculator/` → `/moon-sign`, and it fires before asset handling. **Live now
returns `301 → /moon-sign` for BOTH forms** (verified pre- and post-deploy). The founder's
404 predates the batch-6 deploy — the most likely cause is a Cloudflare edge-cache of the
404 that occurred during the asset-removal transition (the prerendered
`/rising-sign-calculator/index.html` was deleted in batch 5; until the edge cache expired /
the next deploy propagated, some requests saw a cached 404). No code change was needed; a
LIVE post-deploy assertion (both forms) is in the gate.

### P2 — admin shows no user details + no GST card → admin-mechanism mismatch
Root cause (both issues, one cause): `/admin` access is gated by the **email allowlist**
(`src/lib/adminEmails.ts` → `himanshu1305@gmail.com`, `hello@bornclock.com`), but the
admin-read RLS policies on `profiles` and `invoices` use **`has_role(auth.uid(),'admin')`**,
which reads `public.user_roles`. Only `himanshu1305@gmail.com` has that DB role. So
`hello@bornclock.com` can OPEN /admin (allowlist says yes) but every detailed read is
RLS-DENIED → the Users list shows rows with blank email/name ("6 users, no details") and the
GST card can't read `invoices` so it never renders. Ruled out the other suspects: the client
attaches the user JWT (`persistSession: true`), and the queries key correctly. **Fix:
`NOTES-admin-roles.sql`** grants the DB `admin` role to every allowlist admin, realigning the
two mechanisms — no code change. The **security boundary is unchanged and correct**: the
`has_role` RLS is exactly what denies a non-admin; the fix only adds the missing role to the
*already-authorised* email admins.

## 2. Build-count reconciliation
| Source | Δ routes | Landed? |
|---|---|---|
| Baseline (batch 6) | 1339 | — |
| P6 months hub `/born-in` | +1 | ✅ |
| P3 78 compatibility pair pages | +78 | ❌ deferred |
| P10 weight-on-planets | +1 | ❌ deferred |
| **Expected if all shipped** | **1419** | |
| **Achieved** | **1340** | 1339 + 1 (P6) |

Difference = 79 (P3's 78 + P10's 1), both explicitly deferred (§ below). No page is claimed
that was not prerendered — the achieved count is exactly baseline + the single P6 page.

## 3. P3 — 78 compatibility pair pages — DEFERRED
Not built. It is a large, WebSearch-gated content build (78 hyphenated `/compatibility/
{a}-{b}` pages from a data module + 66 reverse-order 301s + per-pair composed prose to the
quality bar). Note: the **existing** two-segment pages (`/compatibility/aries/leo`) DO exist
and are prerendered (78 of them, from an earlier batch) — the gap the prompt describes is the
*hyphenated* URL scheme, which is a migration, not a from-scratch build. Deferred to keep the
batch finishable; flagged for a dedicated batch.

## 4. P4 / P5 — /gift and /coach full redos — DEFERRED
Not done. Both are WebSearch-gated, 600+-word emotional/landing rewrites the founder must
sign off on. Deferred rather than ship another thin version (the exact failure the prompt
warns against). The current pages remain live.

## 5. P7 — renewal reminders — DEFERRED
Not built. Full spec remains in `docs/BATCH-6-REPORT.md` §4 (Razorpay `GET /subscriptions/
{id}` → `current_end`; 7d/2d IST windows; `reminder_sends` send-once →
`NOTES-renewal-reminders.sql`; daily cron pre-filter; mocked Razorpay tests).

## 6. P8 — feedback system — DEFERRED
Not built. Full spec in `docs/BATCH-6-REPORT.md` §5 (extend `user_reviews` →
`NOTES-feedback.sql`; engagement-gated prompt; server-persisted dismissal; admin
consented-only view).

## 7. Delivered this batch
- **P6 — `/born-in` months hub** (`MonthsHubPage.tsx`): answer-first intro (honest hedge),
  all 12 months (birthstone + zodiac span + link), 6-entry FAQPage, share bar, mesh. Slug
  **`/born-in`** chosen as the natural parent of the existing `/born-in-{month}` pages
  (parallels `/born-on` for dates). **Discoverability fixed:** the Explore nav item and the
  footer "Born in Each Month" link previously pointed at `/born-in-january` (a single month) —
  both now point at the hub; each month page's breadcrumb links back to `/born-in`.
- **P9(b) — blog spacing:** the article header `mb-8`→`mb-5`, the share-bar→content
  `Separator my-8`→`my-4`, dropped the share bar's extra `mb-2` — tightening the gap between
  the share bar and the article start.

## 8. NOTES-*.sql for the Studio session
- **`supabase/migrations/NOTES-admin-roles.sql`** (P2) — grant the DB `admin` role to every
  email-allowlist admin so the existing `has_role` RLS policies serve them. Idempotent;
  verify query included. **This is the only DDL/data action this batch.**

## TEST MATRIX (T3)
| Phase | Positive | Negative / edge | Status |
|---|---|---|---|
| P1 redirect | `/rising-sign-calculator` → 301 /moon-sign | trailing-slash form also 301s | ✅ both (batch-7 spec, worker) + live |
| P2 admin | (root-cause + NOTES fix) | security: non-admin denied by `has_role` RLS | ⚠️ fix is data (NOTES); RLS is the tested boundary — see note |
| P6 months hub | title/canonical/FAQ/answer + 12 months; footer + Explore reachable; hub↔month backlink | — | ✅ batch-7 spec |
| P9(b) blog spacing | tightened header/separator margins | — | ✅ code (visual) |
| P3 compat pages | — | same-sign / reverse-301 / invalid-slug | ⏭ SKIPPED (phase deferred) |
| P7 reminders | — | today-window / drifted / API-500 / cancel-race / IST | ⏭ SKIPPED (phase deferred) |
| P8 feedback | — | delete-cascade / dismissal / XSS / consent-filter | ⏭ SKIPPED (phase deferred) |
| P10 weight | — | 0/neg/absurd / kg↔lb / gravity ratio | ⏭ SKIPPED (phase deferred) |

**P2 security note:** the "non-admin must not see other users' details / GST data" property
is enforced by the `has_role` RLS itself (a non-role user is denied — that is the very
mechanism causing the bug for `hello@bornclock.com`). The fix adds the role to *authorised*
admins only; it does not widen access to non-admins. A live end-to-end assertion needs an
admin login (founder), listed below.

## GATE
- **tsc:** app 0 errors (baseline 45 / 0 new). Worker bundles clean.
- **build:** **1340 ok / 0 failed / 0 skipped** (achieved = 1339 + 1 P6; see §2).
- **test:prelaunch:** launch-gauntlet **135** · prelaunch **132** passed, 0 failed.
  - **Fix-loop note (2 test bugs):** `growth-pages.spec` and `navigation.spec` hardcoded the
    OLD Explore target `/born-in-january`. P6 intentionally repointed the "Born in Each Month"
    nav + footer entry to the new `/born-in` hub (that is the discoverability fix), so those
    assertions asserted stale behaviour. Updated both to `/born-in` (documented spec update,
    not weakened) — re-ran green.
- **frozen:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts` — empty diff
  (untouched this batch).
- **invoice_counters unchanged:** BC/26-27=1002, BN/26-27=1001, BX/26-27=1001.
- **deploy:** one `wrangler deploy` (trailing `schedules` error = the known non-fatal cron
  issue). Live: `/born-in` 200; `/rising-sign-calculator` → **301 → /moon-sign**; sentinel
  `{"error":"Report not found"}`. **IndexNow** pinged `/born-in/` (200/202).

## Founder task list
1. **Apply `NOTES-admin-roles.sql`** in Studio, then sign in as `hello@bornclock.com` and
   reload /admin — confirm user details + the GST card (1 purchase / ₹199 / INR) appear.
   (If you were already using `himanshu1305@gmail.com` and still saw no details, tell me —
   that would point to a code bug rather than the role gap.)
2. Spot-check `/born-in` (Explore menu + footer) and a month → hub backlink.
3. Confirm `/rising-sign-calculator` 301s to /moon-sign (both forms).
4. Schedule the deferred phases — P3 (compat hyphenated pages), P4/P5 (the /gift + /coach
   rewrites needing your editorial sign-off), P7 (renewal reminders), P8 (feedback), P9(a)
   (energy-forecast depth), P10 (weight-on-planets).
