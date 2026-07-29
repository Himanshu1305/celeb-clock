# Delete Account + Auth Fixes — Claude Code Prompt
# Save as docs/DELETE-AUTH-PROMPT.md, then: "Read docs/DELETE-AUTH-PROMPT.md and execute"

DO NOT ask for approval. Auto-accept. Local commits only — DO NOT PUSH.
Produce docs/DELETE-AUTH-REPORT.md at the end.

Context: delete-account edge function exists but has 5 bugs found in a read-only audit.
Two additional auth bugs found in founder testing. All fixed in this single prompt.

HARD RULES: never modify api/_crypto.ts, api/razorpay-webhook.ts, api/verify-payment.ts.
Read before write on every file. Edge function deployed with supabase CLI, not wrangler.

---

## PART 1 — DELETE ACCOUNT EDGE FUNCTION (5 bugs)

Read supabase/functions/delete-account/index.ts in full.
Also read src/hooks/useAuth.ts (deleteAccount) and src/pages/Profile.tsx (delete modal).

### BUG 1 — Wrong column on profile reads
The function queries profiles with .eq('id', userId) where userId is the auth UUID.
profiles.id is a separate PK; profiles.user_id is the auth link.
Fix every profiles read/update to use .eq('user_id', userId).
Affects: subscription_id lookup AND the explicit profiles delete.

### BUG 2 — FK failures block auth.admin.deleteUser
longevity_scores.user_id is NOT NULL with no ON DELETE — any user who used the
life-expectancy feature will cause a FK violation at auth.admin.deleteUser.
Same for celebrity_boosts and promo_codes if rows exist.

Read the schema for each table first, then:
- delete from longevity_scores where user_id = userId (before deleteUser)
- delete from celebrity_boosts where user_id = userId (before deleteUser)
- For promo_codes: read whether user_id is nullable or the row is user-owned vs
  admin-created, then null out or delete appropriately

Reorder the full deletion sequence to be safe:
  1. Cancel Razorpay subscription (non-fatal — log and continue if it fails)
  2. Delete FK-blocking child rows (longevity_scores, celebrity_boosts, promo_codes)
  3. De-identify payments (set user_id null)
  4. Delete user-owned rows (birthday_reports, analytics_events, user_reviews,
     user_roles, family_members, leaderboard_entries, pdf_reports_log)
  5. auth.admin.deleteUser ← point of no return, only reached if steps 1-4 clean
  6. Purge email_subscribers (Bug 4)
  7. Send confirmation emails (Bug 5)

### BUG 3 — Subscription never cancelled
Fixed automatically once Bug 1 is fixed (wrong column meant subscriptionId was always
undefined). Make this non-fatal: if Razorpay cancel fails, log and continue.

### BUG 4 — email_subscribers never purged
After auth.admin.deleteUser succeeds, delete from email_subscribers where
lower(email) = lower(userEmail). Fulfils the UI's promise.

### BUG 5 — Confirmation email goes to internal inbox instead of user
Fix the data_deletion_request email routing in api/_email.ts or wherever sendTo is set:
- One email TO THE USER confirming deletion
- One email TO hello@bornclock.com as internal record
Both from hello@bornclock.com.

### DDL for belt-and-suspenders
Write ALTER statements to supabase/migrations/NOTES-delete-account-fks.sql:
  alter table public.longevity_scores
    drop constraint <existing_fk_name>,
    add constraint longevity_scores_user_id_fk
      foreign key (user_id) references auth.users(id) on delete cascade;

  alter table public.celebrity_boosts
    drop constraint <existing_fk_name>,
    add constraint celebrity_boosts_user_id_fk
      foreign key (user_id) references auth.users(id) on delete cascade;

Read the actual constraint names first (grep or information_schema query in a comment).
These are for the founder to apply in Studio — not executed here.

---

## PART 2 — DELETE ACCOUNT UX (founder decision)

KEEP only the automated "Delete My Account" path (the edge-function flow).
REMOVE the separate "Request Data Deletion" manual stub button entirely.

Update the delete confirmation modal to state clearly:
  "Your account and all personal data will be permanently deleted. This cannot be undone.
   Active subscriptions will be cancelled immediately.
   GST invoice records are retained as required by law (8-year statutory requirement)."

---

## PART 3 — DOUBLE CONFIRMATION EMAIL

A new signup receives TWO "Your BornClock account is one tap away" emails simultaneously.

grep -rn "signUp\|resend\|confirmationEmail\|auth.signUp\|emailRedirectTo" src/ api/ --include="*.tsx" --include="*.ts"
Read every file found. Identify what triggers the confirmation email twice.

Likely causes:
  (a) Signup called twice — React strict mode double-invoke or double form submission
  (b) A manual resend call alongside Supabase's automatic send
  (c) Two auth state change listeners reacting to the same event

Fix so exactly ONE confirmation email is sent per signup attempt.
Add a ref guard or debounce on the signup form to prevent double-fire.
Do NOT suppress Supabase's built-in confirmation email — suppress any manual duplicate.

---

## PART 4 — POST-CONFIRMATION REDIRECT BROKEN

After clicking the confirmation link, user lands on homepage but cannot log in
("email not verified"). Only the second confirmation email's link works.

1. grep -rn "auth/callback\|confirmationUrl\|redirectTo\|emailRedirectTo\|getSessionFromUrl\|REDIRECT" src/ api/ --include="*.tsx" --include="*.ts"
   Read the auth callback handler if one exists.

2. Check what redirectTo URL is passed in the signUp call — it must point to a URL
   the app actually handles as an auth callback.

3. The fix: ensure the redirect URL processes the Supabase session correctly and logs
   the user in automatically. If no callback handler exists, the redirect should go to
   the homepage WITH the session hash, and useAuth must call
   supabase.auth.getSessionFromUrl() (or equivalent) on mount to pick it up.

4. After confirmation, the user must be logged in automatically — not shown a login form
   and not told "email not verified".

NOTE: The Supabase dashboard → Authentication → URL Configuration → Redirect URLs must
also include the staging and production domains. This is a dashboard setting the code
cannot change. State in the report exactly what the redirectTo value should be set to in
the dashboard, so the founder can verify and update it.

---

## PART 5 — DEPLOY THE EDGE FUNCTION

Deploy with Supabase CLI (NOT wrangler):
  supabase functions deploy delete-account --project-ref jwrpqiypvystivtqyhro

Confirm deployment by checking the output. If the CLI is not available or authenticated,
note this in the report as a manual step for the founder.

The Worker frozen files (_crypto.ts, razorpay-webhook.ts, verify-payment.ts) are
untouched by this work — confirm in the report.

---

## GATE

1. tsc -p tsconfig.app.json --noEmit → 46 baseline, 0 new
2. npm run build → 1313+ ok, 0 failed (Worker build)
3. Deno type check on the edge function if available
4. Frozen payment files untouched
5. Deploy Worker once if any Worker files changed:
   ./node_modules/.bin/wrangler deploy

## REPORT

docs/DELETE-AUTH-REPORT.md must include:
- The ordered deletion sequence as actually implemented
- The exact redirectTo value the Supabase dashboard must be set to
- What caused the double confirmation email and the exact fix
- NOTES-delete-account-fks.sql contents for Studio
- Manual test guide: what to verify after deleting a test account
  (check DB rows, check Razorpay subscription, check email arrives to user)

Commit: "fix: delete-account bugs, auth confirmation redirect, double signup email"
Local only, do not push.
