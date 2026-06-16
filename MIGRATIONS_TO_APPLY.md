# Migrations to Apply

Run these in Supabase SQL Editor in order:

1. supabase/migrations/20260614120000_promo_codes.sql
   (from Wave 1 — may already be applied)

2. supabase/migrations/20260614130000_celebrity_boosts.sql
   (from Wave 1 — may already be applied)

3. supabase/migrations/20260614140000_longevity_scores.sql
   NEW — Longevity score tracking table

4. supabase/migrations/20260614150000_leaderboard.sql
   NEW — Longevity leaderboard table

5. supabase/migrations/20260614160000_family_members.sql
   NEW — Family longevity dashboard table

6. supabase/migrations/20260614170000_pdf_reports_log.sql
   NEW (Wave 3) — Birthday PDF generation quota tracking table

7. 20260615180000_subscription_fields.sql

8. 20260616120000_birthday_reports.sql — NEW · Birthday report storage with expiry (RLS)

To apply: go to supabase.com → your project → SQL Editor → paste content of each file → Run

---

# Environment Variables Needed

Add these to Vercel project settings (Settings → Environment Variables):

```
ANTHROPIC_API_KEY=your_key_here
```

Required for AI Longevity Coach feature (`/api/longevity-coach`).

Get your key from: console.anthropic.com

---

## Email System (Resend) — Added June 2026

Add these to Vercel project settings:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Required for all transactional emails via `/api/send-email`:
- Welcome email on signup
- Trial day 6 expiry warning
- Payment confirmation after Razorpay success
- Subscription cancellation confirmation
- Weekly re-engagement nudges (free + premium)

Get your key from: resend.com/api-keys
Sender domain: bornclock.com (already verified)
From address: hello@bornclock.com

**VERCEL_URL note:** The Razorpay webhook (`/api/razorpay-webhook`) calls
`/api/send-email` internally to send cancellation emails. Vercel automatically
sets `VERCEL_URL` (preview) and `VERCEL_PROJECT_PRODUCTION_URL` (production) —
no manual configuration required. If emails are not sending from the webhook,
verify both env vars are present in your Vercel project settings.
