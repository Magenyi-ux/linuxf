-- Persistent Study Chat history, scoped to each authenticated Supabase user.
create table if not exists public.study_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  subject text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.study_chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now(),
  constraint study_chat_messages_owner_match
    foreign key (conversation_id, user_id)
    references public.study_chat_conversations(id, user_id)
    on delete cascade
);

create index if not exists study_chat_conversations_user_updated_idx
  on public.study_chat_conversations(user_id, updated_at desc);
create index if not exists study_chat_messages_conversation_created_idx
  on public.study_chat_messages(conversation_id, created_at);

alter table public.study_chat_conversations enable row level security;
alter table public.study_chat_messages enable row level security;

drop policy if exists "Users can read their own study chats" on public.study_chat_conversations;
create policy "Users can read their own study chats"
  on public.study_chat_conversations for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own study chats" on public.study_chat_conversations;
create policy "Users can create their own study chats"
  on public.study_chat_conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own study chats" on public.study_chat_conversations;
create policy "Users can update their own study chats"
  on public.study_chat_conversations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own study chats" on public.study_chat_conversations;
create policy "Users can delete their own study chats"
  on public.study_chat_conversations for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own study messages" on public.study_chat_messages;
create policy "Users can read their own study messages"
  on public.study_chat_messages for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own study messages" on public.study_chat_messages;
create policy "Users can create their own study messages"
  on public.study_chat_messages for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.study_chat_conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );
drop policy if exists "Users can delete their own study messages" on public.study_chat_messages;
create policy "Users can delete their own study messages"
  on public.study_chat_messages for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.study_chat_conversations to authenticated;
grant select, insert, delete on public.study_chat_messages to authenticated;
