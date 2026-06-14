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

To apply: go to supabase.com → your project → SQL Editor → paste content of each file → Run

---

# Environment Variables Needed

Add these to Vercel project settings (Settings → Environment Variables):

```
ANTHROPIC_API_KEY=your_key_here
```

Required for AI Longevity Coach feature (`/api/longevity-coach`).

Get your key from: console.anthropic.com
