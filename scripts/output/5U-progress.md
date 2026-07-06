# 5-U Progress Log — Multi-hour unattended block

Started: 2026-07-06

---

## ⚠️ USER ACTIONS REQUIRED (DDL — cannot run via supabase-js)

Run these statements **one at a time** in Supabase Studio SQL editor before the
preview-lock feature is fully live. Code is built to tolerate their absence
(returns 0 credits / falls through to purchase path gracefully).

### Credits columns on profiles
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS report_credits INT DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits_granted_month TEXT;
```

### guard_premium_columns trigger update
After adding the columns, extend the guard trigger to protect them:
```sql
CREATE OR REPLACE FUNCTION public.guard_premium_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block client writes to payment/credit columns (service role only)
  IF NEW.premium_status IS DISTINCT FROM OLD.premium_status THEN
    RAISE EXCEPTION 'premium_status can only be set by service role';
  END IF;
  IF NEW.subscription_id IS DISTINCT FROM OLD.subscription_id THEN
    RAISE EXCEPTION 'subscription_id can only be set by service role';
  END IF;
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'subscription_status can only be set by service role';
  END IF;
  IF NEW.report_credits IS DISTINCT FROM OLD.report_credits THEN
    RAISE EXCEPTION 'report_credits can only be set by service role';
  END IF;
  IF NEW.credits_granted_month IS DISTINCT FROM OLD.credits_granted_month THEN
    RAISE EXCEPTION 'credits_granted_month can only be set by service role';
  END IF;
  RETURN NEW;
END;
$$;
```

---

## Task Status

| # | Task | Status | Commit |
|---|------|--------|--------|
| 0 | Icon enrichment live run | ✅ DONE | 557f332 |
| 1 | Preview-lock + subscriber credits | ✅ DONE | — |
| 2 | E2E launch-gauntlet suite | ✅ DONE | — |
| 3 | Flow/abruptness audit | ⏳ PENDING | — |
| 4 | Doc + closeout | ⏳ PENDING | — |

---

## Task 0 — Icon enrichment live run

Running: `node --env-file=.env.local scripts/enrich-priority-rows.mjs`

(results appended below after run)
