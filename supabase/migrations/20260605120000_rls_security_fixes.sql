-- RLS Security Fixes (2026-06-05)
-- Addresses gaps identified in security audit:
--   1. analytics_events INSERT allows user_id spoofing
--   2. Admins cannot UPDATE profiles (e.g. toggle premium_status)
--   3. Users have no path to delete their own reviews (GDPR right to erasure)


-- ============================================================
-- 1. Fix analytics_events INSERT policy
--    Old: WITH CHECK (true)  -- any value for user_id was accepted
--    New: user_id must be NULL (anonymous) or match the caller
-- ============================================================

DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics_events;

CREATE POLICY "Anyone can insert analytics"
ON public.analytics_events
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);


-- ============================================================
-- 2. Add admin UPDATE policy on profiles
--    Admins could already SELECT all profiles but had no UPDATE
--    policy, so toggling premium_status from the admin panel
--    would silently fail for rows not owned by the admin.
-- ============================================================

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- 3. Add user self-delete policy on user_reviews
--    Users can submit reviews but previously had no way to
--    retract them without admin intervention (GDPR concern).
-- ============================================================

CREATE POLICY "Users can delete their own reviews"
ON public.user_reviews
FOR DELETE
USING (auth.uid() = user_id);
