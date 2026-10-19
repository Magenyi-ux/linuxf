-- Saved AI explanations. Apply in the Supabase SQL editor.
create table if not exists public.study_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 180),
  subject text not null default 'General' check (char_length(subject) <= 80),
  question text not null check (char_length(question) <= 2000),
  content text not null check (char_length(content) <= 20000),
  created_at timestamptz not null default now()
);

create index if not exists study_notes_user_created_idx
  on public.study_notes (user_id, created_at desc);

alter table public.study_notes enable row level security;

drop policy if exists "study_notes_select_own" on public.study_notes;
create policy "study_notes_select_own" on public.study_notes
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "study_notes_insert_own" on public.study_notes;
create policy "study_notes_insert_own" on public.study_notes
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "study_notes_delete_own" on public.study_notes;
create policy "study_notes_delete_own" on public.study_notes
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, delete on public.study_notes to authenticated;
