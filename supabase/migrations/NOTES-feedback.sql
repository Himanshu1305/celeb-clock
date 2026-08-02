-- NOTES-feedback.sql — feedback & rating system for reports + blog articles (BATCH-8 P4).
-- NOT APPLIED. Run in Supabase Studio (BornClock project "Lifespan" / jwrpqiypvystivtqyhro).
-- The app TOLERATES this table being absent (UI hides until applied); applying it turns
-- the feedback prompt + public "Reader comments" on.
--
-- TWO-KEY PUBLICATION: a row is shown publicly ONLY when consent = true AND approved = true.
-- approved defaults false; the founder toggles it in the admin Feedback section.
-- One row per (user, content_type, slug) — idempotent upsert. user_id CASCADE so
-- feedback never blocks account deletion.

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  content_type  text not null check (content_type in ('report','blog','tool')),
  slug          text not null,
  rating        integer not null default 0 check (rating >= 0 and rating <= 5),
  comment       text,
  consent       boolean not null default false,
  approved      boolean not null default false,
  dismissed     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, content_type, slug)
);

create index if not exists feedback_content_idx on public.feedback (content_type, slug);
create index if not exists feedback_approved_idx on public.feedback (approved) where approved = true;

alter table public.feedback enable row level security;

-- Users manage their OWN row (insert/update/select).
create policy feedback_user_insert on public.feedback
  for insert with check (auth.uid() = user_id);
create policy feedback_user_update on public.feedback
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy feedback_user_select_own on public.feedback
  for select using (auth.uid() = user_id);

-- PUBLIC can read only the two-key survivors (approved AND consented, real rating).
create policy feedback_public_select on public.feedback
  for select using (approved = true and consent = true and rating > 0);

-- Admins can read/update/delete everything (approval queue).
create policy feedback_admin_select on public.feedback
  for select using (public.has_role(auth.uid(), 'admin'::app_role));
create policy feedback_admin_update on public.feedback
  for update using (public.has_role(auth.uid(), 'admin'::app_role));
create policy feedback_admin_delete on public.feedback
  for delete using (public.has_role(auth.uid(), 'admin'::app_role));

-- keep updated_at fresh
create trigger update_feedback_updated_at before update on public.feedback
  for each row execute function public.update_updated_at_column();

-- Verify:
--   select content_type, slug, rating, consent, approved, dismissed from public.feedback order by created_at desc limit 20;
