-- NOTES-remove-seeded-reviews.sql — HONESTY FIX (Rule 8). NOT APPLIED AUTOMATICALLY.
-- Run once in Supabase Studio.
--
-- The migration 20260125035133_...sql seeded 7 FABRICATED testimonials (fake names,
-- sentinel user_ids 00000000-0000-0000-0000-00000000000N, all approved + featured).
-- BornClock must show only real, user-submitted reviews, so these are deleted here.
-- (The homepage TestimonialsSection also filters these sentinel ids out in code, so
-- nothing fabricated renders even before this runs — but the rows should still go.)

DELETE FROM public.user_reviews
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007'
);

-- Real reviews flow: signed-in users insert their own row (RLS already allows
-- auth.uid() = user_id), is_approved/is_featured default false, and an admin promotes
-- genuine ones from the Admin area. No seeded/auto-approved content, ever.
