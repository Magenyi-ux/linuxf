-- Persist Study Chat image attachments in a private, user-scoped bucket.
alter table public.study_chat_messages
  add column if not exists image_paths text[] not null default '{}'::text[];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-chat-images',
  'study-chat-images',
  false,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 6291456,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[];

drop policy if exists "Students upload own Study Chat images" on storage.objects;
create policy "Students upload own Study Chat images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'study-chat-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Students read own Study Chat images" on storage.objects;
create policy "Students read own Study Chat images"
on storage.objects for select to authenticated
using (
  bucket_id = 'study-chat-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Students delete own Study Chat images" on storage.objects;
create policy "Students delete own Study Chat images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'study-chat-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
