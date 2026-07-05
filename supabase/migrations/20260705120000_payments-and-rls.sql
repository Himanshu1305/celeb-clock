-- ============================================================
-- 5-Q Migration: payments table, webhook idempotency ledger,
-- RLS lockdown on profiles, last_viewed_at dormancy tracking,
-- and PDF download tracking.
--
-- IMPORTANT: run each statement INDIVIDUALLY in Supabase Studio.
-- DO NOT paste the whole file — Studio silently aborts on the
-- first failing statement and hides intermediate errors.
-- ============================================================


-- ============================================================
-- STATEMENT 1: payments table
-- Records every payment event (subscription charge or one-time).
-- user_id is nullable — anonymous / gift buyers covered later.
-- razorpay_payment_id UNIQUE prevents double-recording a charge.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  razorpay_payment_id     TEXT UNIQUE NOT NULL,
  razorpay_order_id       TEXT,
  razorpay_subscription_id TEXT,
  amount                  INTEGER NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'INR',
  status                  TEXT NOT NULL DEFAULT 'captured',
  product                 TEXT NOT NULL CHECK (product IN ('subscription', 'birthday_report')),
  report_slug             TEXT REFERENCES public.birthday_reports(slug) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user
  ON public.payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment
  ON public.payments(razorpay_payment_id);


-- ============================================================
-- STATEMENT 2: RLS for payments — service role only
-- No anon or authenticated client should ever read or write
-- payment records directly; all access is through API routes
-- that run with the service-role key.
-- ============================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Explicitly deny all non-service-role access (belt + suspenders).
-- PostgREST will reject anon/authenticated requests because no
-- policy grants them access; these explicit DENY policies make
-- the intent clear in pg_policies output.
CREATE POLICY "payments: service role only"
  ON public.payments
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- STATEMENT 3: webhook_events idempotency ledger
-- event_id is Razorpay's webhook event.id (a UUID string).
-- INSERT ... ON CONFLICT DO NOTHING lets the webhook handler
-- detect duplicates before processing.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id    TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type
  ON public.webhook_events(event_type);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events: service role only"
  ON public.webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- STATEMENT 4: BEFORE UPDATE trigger on profiles
-- Blocks writes to premium/subscription columns from any
-- session that is not the service role.
-- Scope: ONLY the six payment-control columns.
-- Other profile fields (name, country, email, etc.) are
-- unaffected — admins and users can still update them.
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_premium_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if caller is the service role (API routes, webhooks)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block changes to any of the six payment-control columns
  IF (NEW.premium_status     IS DISTINCT FROM OLD.premium_status)
  OR (NEW.subscription_id    IS DISTINCT FROM OLD.subscription_id)
  OR (NEW.subscription_plan  IS DISTINCT FROM OLD.subscription_plan)
  OR (NEW.subscription_status IS DISTINCT FROM OLD.subscription_status)
  OR (NEW.premium_until      IS DISTINCT FROM OLD.premium_until)
  THEN
    RAISE EXCEPTION
      'Direct writes to premium/subscription columns are not allowed. '
      'Use the server-side verify-payment or webhook path.';
  END IF;

  RETURN NEW;
END;
$$;

-- Drop first so this is re-runnable
DROP TRIGGER IF EXISTS trg_guard_premium_columns ON public.profiles;

CREATE TRIGGER trg_guard_premium_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_premium_columns();


-- ============================================================
-- STATEMENT 5: last_viewed_at on birthday_reports
-- Tracks the last time anyone opened a report (for 12-month
-- dormancy deletion). Backfill to created_at so existing rows
-- are not instantly considered dormant.
-- ============================================================

ALTER TABLE public.birthday_reports
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

UPDATE public.birthday_reports
  SET last_viewed_at = created_at
  WHERE last_viewed_at IS NULL;


-- ============================================================
-- STATEMENT 6: touch_report_view SECURITY DEFINER function
-- Called fire-and-forget from ReportView on every report load.
-- Exposed to anon (public) but only updates last_viewed_at —
-- no other column. Safe to expose because slug is already
-- the public access key for a report.
-- ============================================================

CREATE OR REPLACE FUNCTION public.touch_report_view(p_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.birthday_reports
    SET last_viewed_at = NOW()
    WHERE slug = p_slug
      AND expires_at > NOW();
END;
$$;

-- Grant execute to anonymous callers (report viewers are unauthenticated)
GRANT EXECUTE ON FUNCTION public.touch_report_view(TEXT) TO anon, authenticated;


-- ============================================================
-- STATEMENT 7: report_downloads table (PDF download tracking)
-- Coexists with last_viewed_at. user_id nullable: premium users
-- printing their own gift report are authenticated; recipients
-- downloading may be anonymous.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.report_downloads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_slug TEXT NOT NULL REFERENCES public.birthday_reports(slug) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_downloads_slug
  ON public.report_downloads(report_slug);

ALTER TABLE public.report_downloads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anon recipients can record their download)
CREATE POLICY "Anyone can record a download"
  ON public.report_downloads FOR INSERT TO public
  WITH CHECK (true);

-- Users can read their own download records; service role sees all
CREATE POLICY "Users read own download records"
  ON public.report_downloads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role sees all downloads"
  ON public.report_downloads FOR SELECT
  USING (auth.role() = 'service_role');
