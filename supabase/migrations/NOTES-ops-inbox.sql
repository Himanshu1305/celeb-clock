-- ============================================================================
-- NOTES-ops-inbox.sql  —  Ops monitoring "inbox" table + RPC
-- ----------------------------------------------------------------------------
-- MONITOR-ONLY ops system (Phase 7). This file is a NOTE, NOT a migration to run
-- automatically. DDL cannot run via the service client in this project (proven).
--
-- HOW TO APPLY (Supabase Studio → SQL editor):
--   Run these statements ONE AT A TIME, in order. Do NOT paste the whole file:
--   Studio silently rolls back large multi-statement pastes (see
--   ARCHITECTURE-DECISIONS §2). Confirm the project breadcrumb is the BornClock
--   project (jwrpqiypvystivtqyhro) before running anything (DDL has been run
--   against the wrong project before).
--
-- Admin model (matches the app): admins are rows in public.user_roles with
-- role='admin'; public.has_role(uuid, app_role) is the canonical DB gate the
-- app already uses (useIsAdmin → has_role RPC). SELECT uses has_role; the
-- mark-reviewed RPC additionally hard-gates on the admin email allowlist.
-- ============================================================================


-- 1. Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_reviews (
  id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at           timestamptz  NOT NULL DEFAULT now(),
  reviewed_at          timestamptz,
  reviewed_by          text,
  category             text         NOT NULL,
  severity             text         NOT NULL CHECK (severity IN ('urgent','warning','info')),
  title                text         NOT NULL,
  body                 text,
  action_steps         text,
  auto_resolved        boolean      NOT NULL DEFAULT false,
  auto_resolution_note text,
  extra                jsonb        NOT NULL DEFAULT '{}'::jsonb
);


-- 2. Index (open-item queries: unreviewed, not auto-resolved, by severity) ----
CREATE INDEX IF NOT EXISTS pending_reviews_open_idx
  ON public.pending_reviews (reviewed_at, auto_resolved, severity);


-- 3. Enable RLS --------------------------------------------------------------
ALTER TABLE public.pending_reviews ENABLE ROW LEVEL SECURITY;


-- 4. Lock down writes from client roles --------------------------------------
--    Only the service role (ops handlers) writes; the service role bypasses RLS.
--    anon/authenticated get NO insert/update/delete.
REVOKE INSERT, UPDATE, DELETE ON public.pending_reviews FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.pending_reviews FROM authenticated;


-- 5. Admin-appropriate SELECT (matches how the real admin reads data) ---------
DROP POLICY IF EXISTS "Admins can read pending_reviews" ON public.pending_reviews;
CREATE POLICY "Admins can read pending_reviews"
  ON public.pending_reviews
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- 6. SECURITY DEFINER RPC to mark a review reviewed --------------------------
--    Hard-gated to the admin email allowlist (ADMIN_EMAILS in the app). Runs as
--    definer so it can UPDATE despite the client-role write REVOKE above.
CREATE OR REPLACE FUNCTION public.mark_review_reviewed(p_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
BEGIN
  IF v_email NOT IN ('himanshu1305@gmail.com', 'hello@bornclock.com') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.pending_reviews
     SET reviewed_at = now(),
         reviewed_by = v_email
   WHERE id = p_id
     AND reviewed_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_review_reviewed(bigint) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_review_reviewed(bigint) TO authenticated;


-- 7. (optional) sanity check after apply -------------------------------------
--   SELECT count(*) FROM public.pending_reviews;
--   SELECT proname, prosecdef FROM pg_proc WHERE proname = 'mark_review_reviewed';
