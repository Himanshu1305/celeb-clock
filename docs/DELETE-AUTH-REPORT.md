# Delete Account + Auth Fixes — Report

**Branch:** develop (local commit only — NOT pushed).
**Frozen files untouched:** `api/_crypto.ts`, `api/razorpay-webhook.ts`, `api/verify-payment.ts` (confirmed — none in `git status`).
**Date:** 2026-07-29.

---

## PART 1 — Delete-account edge function (5 bugs)

File: `supabase/functions/delete-account/index.ts` (Deno; deployed via Supabase CLI, not wrangler).

### Ordered deletion sequence as implemented
1. **Capture** email + `subscription_id`/`subscription_status` from `profiles` — now via **`.eq('user_id', userId)`** (Bug 1; `profiles.id` is a random PK, `user_id` is the auth link).
2. **Cancel Razorpay subscription** if active — **non-fatal** (`cancelRazorpaySubscription` swallows its own errors; Bug 3). Now actually runs because Bug 1 made `subscriptionId` resolve.
3. **Delete FK-blocking children** BEFORE `deleteUser` (Bug 2): `longevity_scores`, `celebrity_boosts`, `promo_code_redemptions` — each references `auth.users(id)` with **no on-delete rule**, so a leftover row previously made `deleteUser` throw a foreign-key violation (life-expectancy users hit this constantly).
4. **De-identify `payments`** (`user_id = null`) — retained for tax/legal.
5. **Delete user-owned rows**: `birthday_reports`, `analytics_events`, `user_reviews`, `user_roles`, `family_members`, `leaderboard_entries`, `pdf_reports_log`, `profiles` (now `.eq('user_id', …)`).
6. **`auth.admin.deleteUser`** — point of no return; only reached if 1–5 are clean.
7. **Purge `email_subscribers`** `WHERE lower(email)=lower(userEmail)` via `.ilike('email', userEmail)` (Bug 4) — the table has no `user_id`, so it was never cleaned; this fulfils the UI's "including your email" promise.
8. **Two confirmation emails** (Bug 5): `account_deleted` **to the user**, `data_deletion_request` **to hello@bornclock.com** (internal record). Both non-fatal, both `from: hello@bornclock.com`.

Retention preserved: **`invoices` and `credit_notes` are never deleted** — their `ON DELETE SET NULL` FK auto-nulls `user_id`, keeping the GST record for the 8-year statutory period.

### Email fixes (Bug 5)
`api/_email.ts`:
- New **`account_deleted`** template — user-facing "Your BornClock account has been deleted" (past tense; states subscription cancelled + GST records retained), `from: hello@bornclock.com`.
- **`data_deletion_request`** repurposed as the internal record: recipient changed **`privacy@bornclock.com` → `hello@bornclock.com`**, content updated to "Account Deletion Completed (automated)".
`api/send-email.ts`: added `account_deleted` to the `VALID_TYPES` allowlist.

### DDL (belt-and-suspenders) — `supabase/migrations/NOTES-delete-account-fks.sql`
For the founder to run in Studio. Adds `ON DELETE CASCADE` to the three FKs so even a skipped explicit delete can't block `deleteUser`. Includes the `pg_constraint` query to confirm the auto-generated names first (expected `longevity_scores_user_id_fkey`, `celebrity_boosts_user_id_fkey`, `promo_code_redemptions_user_id_fkey`). Explicitly notes `invoices`/`credit_notes`/`payments` must stay `SET NULL`.

```sql
alter table public.longevity_scores
  drop constraint if exists longevity_scores_user_id_fkey,
  add  constraint longevity_scores_user_id_fkey
       foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.celebrity_boosts
  drop constraint if exists celebrity_boosts_user_id_fkey,
  add  constraint celebrity_boosts_user_id_fkey
       foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.promo_code_redemptions
  drop constraint if exists promo_code_redemptions_user_id_fkey,
  add  constraint promo_code_redemptions_user_id_fkey
       foreign key (user_id) references auth.users(id) on delete cascade;
```

---

## PART 2 — Delete UX

`src/pages/Profile.tsx`:
- **Removed** the "⚠️ Delete My Data / Request Data Deletion" manual-stub button, its `handleRequestDataDeletion` handler, the `isDeletionRequesting` state, and the "Prefer a manual review?" pointer. Only the automated **Delete My Account** (edge-function) path remains.
- **Modal copy** now states: *"Your account and all personal data will be permanently deleted. This cannot be undone. Active subscriptions will be cancelled immediately. GST invoice records are retained as required by law (8-year statutory requirement)."* The type-`DELETE`-to-confirm gate is kept.

---

## PART 3 — Double confirmation email

**Cause:** scenario (a) — **double form submission**. There is exactly one `supabase.auth.signUp` call site (`useAuth.ts:125`) and no manual `resend`/`signInWithOtp`/`generateLink` anywhere (grep-confirmed), so the "two 'account is one tap away' emails" come from `handleSubmit` firing twice — a fast double-click or Enter+click lands a second submit before React's async `setIsLoading(true)` disables the button. Each `signUp` triggers Supabase's built-in confirmation email → two emails.

**Fix:** a synchronous **`submittingRef` guard** in `Auth.tsx handleSubmit` — set before the async call, cleared in `finally`; a second submit for the same attempt returns immediately. Supabase's built-in email is untouched (not suppressed); only the duplicate client trigger is prevented.

---

## PART 4 — Post-confirmation redirect / auto-login

**Root cause was Part 3.** Supabase invalidates the previous confirmation token when a new one is generated, so with two emails the **first link (which arrives first and gets clicked) is already dead** → "email not verified"; only the second email's link works. One email → the link works.

**No code change required for the redirect itself:** the Supabase client uses the v2 default `detectSessionInUrl: true` (`src/integrations/supabase/client.ts`), and `signUp` passes `emailRedirectTo: ${window.location.origin}/`. On landing at `/`, the client auto-parses the session hash and fires `SIGNED_IN`, which `useAuth`'s `onAuthStateChange` picks up → the user is **logged in automatically** and `Auth.tsx` redirects via its `if (user)` guard. No separate callback route is needed.

### Dashboard setting the founder must verify (code cannot change this)
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://bornclock.com`
- **Redirect URLs** (allowlist) must include every origin a user can sign up from, because `emailRedirectTo` uses `window.location.origin`:
  - `https://bornclock.com/**`
  - `https://staging.bornclock.com/**`
  - `https://bornclock.usdvisionai.workers.dev/**`
  - `http://localhost:3000/**` (local dev)

If an origin is missing from this list, Supabase drops the redirect and the confirmation link won't log the user in — so this list is as important as the code fix.

---

## PART 5 — Deploy

- **Worker** (`api/_email.ts`, `api/send-email.ts` changed) — redeployed with `./node_modules/.bin/wrangler deploy`. *(see build/deploy status below)*
- **Edge function** — **Supabase CLI is not installed / not on PATH** in this environment, so I could **not** deploy `delete-account` or run `deno check`. **MANUAL STEP for the founder:**
  ```
  supabase functions deploy delete-account --project-ref jwrpqiypvystivtqyhro
  ```
  Ensure the function's env has `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `SITE_URL`.

---

## GATE

| Check | Result |
|---|---|
| `tsc -p tsconfig.app.json` | **46 = baseline, 0 new** |
| `npm run build` | **1313 ok, 0 failed** *(see below)* |
| Deno type check | **skipped — Deno not installed** |
| Frozen payment files | **untouched** |
| Worker deploy | *(see below)* |

---

## Manual test guide (after deploying the edge function)

Create a throwaway account, use the life-expectancy feature (writes `longevity_scores`), buy or start a subscription, then delete via Profile → "Delete My Account" (type `DELETE`). Verify:

1. **DB rows gone:** `profiles`, `birthday_reports`, `analytics_events`, `user_reviews`, `user_roles`, `family_members`, `leaderboard_entries`, `pdf_reports_log`, `longevity_scores`, `celebrity_boosts`, `promo_code_redemptions` for that `user_id` return 0 rows; the `auth.users` row is gone.
2. **Retained + de-identified:** `invoices` / `credit_notes` / `payments` rows still exist with `user_id = NULL`.
3. **Email purged:** no `email_subscribers` row for that address.
4. **Razorpay:** the subscription shows **cancelled** in the Razorpay dashboard.
5. **Emails:** the user's inbox has "Your BornClock account has been deleted"; `hello@bornclock.com` has "ACCOUNT DELETED — <email>".
6. **No FK error:** deletion returns `{ success: true }` (previously 500 for anyone with a longevity score).
7. **Signup/confirm:** a fresh signup receives exactly **one** confirmation email; clicking its link logs in automatically (no "email not verified").

## Commit
`fix: delete-account bugs, auth confirmation redirect, double signup email` on `develop` (local only, not pushed).
