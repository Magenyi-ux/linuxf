-- Examply PWA Supabase schema
-- Run this file in the Supabase SQL Editor before enabling cloud sync.
-- The browser uses only the anon/publishable key; RLS is the security boundary.

create extension if not exists pgcrypto;

-- The project already provides public.profiles with id, display_name, and role.
-- This migration leaves its existing columns and role values unchanged.

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  exam_type text not null,
  exam_year integer not null default 0,
  questions_attempted integer not null default 0 check (questions_attempted >= 0),
  questions_correct integer not null default 0 check (questions_correct >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  last_updated timestamptz not null default timezone('utc', now()),
  unique (user_id, subject, exam_type, exam_year)
);

create table if not exists public.progress_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  exam_type text not null,
  exam_year integer,
  questions_attempted integer not null check (questions_attempted > 0),
  questions_correct integer not null check (questions_correct >= 0 and questions_correct <= questions_attempted),
  xp_earned integer not null check (xp_earned >= 0),
  completed_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default timezone('utc', now()),
  synced_at timestamptz not null default timezone('utc', now()),
  unique (user_id, achievement_key)
);

create index if not exists user_progress_user_id_idx on public.user_progress(user_id);
create index if not exists progress_events_user_id_idx on public.progress_events(user_id);
create index if not exists achievements_user_id_idx on public.achievements(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $examply$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$examply$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.record_progress_event(
  p_event_id uuid,
  p_subject text,
  p_exam_type text,
  p_exam_year integer,
  p_questions_attempted integer,
  p_questions_correct integer,
  p_xp_earned integer
)
returns void
language plpgsql
security definer set search_path = public
as $examply$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_questions_attempted <= 0
     or p_questions_correct < 0
     or p_questions_correct > p_questions_attempted
     or p_xp_earned < 0 then
    raise exception 'invalid progress event';
  end if;

  insert into public.progress_events (
    id, user_id, subject, exam_type, exam_year,
    questions_attempted, questions_correct, xp_earned
  ) values (
    p_event_id, auth.uid(), p_subject, p_exam_type, p_exam_year,
    p_questions_attempted, p_questions_correct, p_xp_earned
  ) on conflict (id) do nothing;

  if found then
    insert into public.user_progress (
      user_id, subject, exam_type, exam_year,
      questions_attempted, questions_correct, xp_earned, last_updated
    ) values (
      auth.uid(), p_subject, p_exam_type, coalesce(p_exam_year, 0),
      p_questions_attempted, p_questions_correct, p_xp_earned,
      timezone('utc', now())
    ) on conflict (user_id, subject, exam_type, exam_year)
    do update set
      questions_attempted = public.user_progress.questions_attempted + excluded.questions_attempted,
      questions_correct = public.user_progress.questions_correct + excluded.questions_correct,
      xp_earned = public.user_progress.xp_earned + excluded.xp_earned,
      last_updated = timezone('utc', now());
  end if;
end;
$examply$;

grant execute on function public.record_progress_event(uuid, text, text, integer, integer, integer, integer) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.progress_events enable row level security;
alter table public.achievements enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (auth.uid() = id);

-- Profile updates are intentionally omitted from the browser client. This prevents a
-- user from changing protected fields such as role through a table UPDATE policy.

drop policy if exists "progress_select_own" on public.user_progress;
create policy "progress_select_own" on public.user_progress
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "progress_events_select_own" on public.progress_events;
create policy "progress_events_select_own" on public.progress_events
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "achievements_update_own" on public.achievements;
create policy "achievements_update_own" on public.achievements
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "achievements_delete_own" on public.achievements;
create policy "achievements_delete_own" on public.achievements
for delete to authenticated using (auth.uid() = user_id);
