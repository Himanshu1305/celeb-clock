-- Birthday reminders (Task 18). Users store friends' birthdays and opt into
-- reminder emails ahead of the date.
create table if not exists public.birthday_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  friend_name text not null,
  friend_dob date not null,
  relationship text,
  remind_days_before int not null default 3,
  notify_email text,
  created_at timestamptz not null default now()
);

alter table public.birthday_reminders enable row level security;

create policy "own reminders - select" on public.birthday_reminders
  for select using (auth.uid() = user_id);
create policy "own reminders - insert" on public.birthday_reminders
  for insert with check (auth.uid() = user_id);
create policy "own reminders - delete" on public.birthday_reminders
  for delete using (auth.uid() = user_id);

create index if not exists birthday_reminders_user_idx on public.birthday_reminders (user_id);
create index if not exists birthday_reminders_dob_idx on public.birthday_reminders (friend_dob);
