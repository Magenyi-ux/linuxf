-- SphereLearn referral attribution and in-app collaborator reporting.
-- Apply after schema.sql in the Supabase SQL Editor.
-- Referral keys are stored as SHA-256 hashes; the raw key is never persisted.

create extension if not exists pgcrypto;

create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  referral_key_hash text not null unique,
  referral_key_hint text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'ENDED')),
  term_start date,
  term_end date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.referral_attributions (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.collaborators(id) on delete restrict,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  source_app text not null default 'unknown' check (source_app in ('pwa', 'android', 'unknown')),
  referral_code_hint text not null,
  attributed_at timestamptz not null default timezone('utc', now()),
  signup_at timestamptz not null default timezone('utc', now()),
  status text not null default 'ATTRIBUTED' check (status in ('ATTRIBUTED', 'DISPUTED', 'VOID')),
  created_event_id uuid not null unique default gen_random_uuid()
);

create index if not exists collaborators_user_id_idx on public.collaborators(user_id);
create index if not exists collaborators_status_idx on public.collaborators(status);
create index if not exists referral_attributions_collaborator_idx on public.referral_attributions(collaborator_id);
create index if not exists referral_attributions_attributed_at_idx on public.referral_attributions(attributed_at);

create or replace function public.referral_key_hash(p_referral_key text)
returns text
language sql
immutable
strict
set search_path = public
as $referral$
  select encode(extensions.digest(lower(trim(p_referral_key)), 'sha256'), 'hex');
$referral$;

-- Server/operator helper. Store only the hash, never the raw key.
-- Execute this from a trusted SQL/admin context when issuing a collaborator key:
-- insert into public.collaborators (user_id, display_name, referral_key_hash, referral_key_hint)
-- values ('COLLABORATOR_AUTH_UUID', 'Sis School Tips', public.referral_key_hash('RAW_KEY'), '...last-4');

create or replace function public.attribute_referral(
  p_referral_key text,
  p_source_app text default 'unknown'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $referral$
declare
  v_user_id uuid := auth.uid();
  v_collaborator public.collaborators%rowtype;
  v_source_app text := case when p_source_app in ('pwa', 'android') then p_source_app else 'unknown' end;
  v_inserted integer := 0;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_referral_key is null or length(trim(p_referral_key)) < 6 then
    raise exception 'invalid referral key';
  end if;

  select * into v_collaborator
  from public.collaborators
  where referral_key_hash = public.referral_key_hash(p_referral_key)
    and status = 'ACTIVE'
    and (term_start is null or current_date >= term_start)
    and (term_end is null or current_date <= term_end)
  limit 1;

  if not found then
    raise exception 'invalid or inactive referral key';
  end if;

  insert into public.referral_attributions (
    collaborator_id, user_id, source_app, referral_code_hint
  ) values (
    v_collaborator.id, v_user_id, v_source_app, v_collaborator.referral_key_hint
  ) on conflict (user_id) do nothing;

  get diagnostics v_inserted = row_count;

  return jsonb_build_object(
    'attributed', v_inserted > 0,
    'collaborator_id', v_collaborator.id,
    'referral_key_hint', v_collaborator.referral_key_hint
  );
end;
$referral$;

grant execute on function public.attribute_referral(text, text) to authenticated;

create or replace function public.get_my_referral_summary()
returns jsonb
language plpgsql
security definer
set search_path = public
as $referral$
declare
  v_user_id uuid := auth.uid();
  v_collaborator public.collaborators%rowtype;
  v_total integer := 0;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_collaborator from public.collaborators where user_id = v_user_id limit 1;

  if not found then
    return jsonb_build_object(
      'is_collaborator', false,
      'total_signups', 0,
      'qualifying_referrals', 0
    );
  end if;

  select count(*)::integer into v_total
  from public.referral_attributions
  where collaborator_id = v_collaborator.id
    and status = 'ATTRIBUTED';

  return jsonb_build_object(
    'is_collaborator', true,
    'collaborator_id', v_collaborator.id,
    'display_name', v_collaborator.display_name,
    'referral_key_hint', v_collaborator.referral_key_hint,
    'status', v_collaborator.status,
    'total_signups', v_total,
    'qualifying_referrals', 0
  );
end;
$referral$;

grant execute on function public.get_my_referral_summary() to authenticated;

create or replace function public.get_admin_referral_report()
returns table (
  collaborator_id uuid,
  display_name text,
  referral_key_hint text,
  status text,
  total_signups bigint,
  overall_signups bigint
)
language plpgsql
security definer
set search_path = public
as $referral$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_overall bigint;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select upper(coalesce(role, 'USER')) = 'ADMIN' into v_is_admin
  from public.profiles where id = v_user_id;

  if coalesce(v_is_admin, false) is not true then
    raise exception 'admin access required';
  end if;

  select count(*)::bigint into v_overall
  from public.referral_attributions
  where status = 'ATTRIBUTED';

  return query
  select
    c.id,
    c.display_name,
    c.referral_key_hint,
    c.status,
    count(ra.id)::bigint as total_signups,
    v_overall
  from public.collaborators c
  left join public.referral_attributions ra
    on ra.collaborator_id = c.id and ra.status = 'ATTRIBUTED'
  group by c.id, c.display_name, c.referral_key_hint, c.status
  order by total_signups desc, c.display_name asc;
end;
$referral$;

grant execute on function public.get_admin_referral_report() to authenticated;

create or replace function public.create_collaborator(
  p_collaborator_email text,
  p_display_name text,
  p_term_start date default current_date,
  p_term_end date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $referral$
declare
  v_admin_id uuid := auth.uid();
  v_is_admin boolean;
  v_user_id uuid;
  v_referral_key text;
  v_collaborator public.collaborators%rowtype;
begin
  if v_admin_id is null then
    raise exception 'not authenticated';
  end if;

  select upper(coalesce(role, 'USER')) = 'ADMIN' into v_is_admin
  from public.profiles where id = v_admin_id;
  if coalesce(v_is_admin, false) is not true then
    raise exception 'admin access required';
  end if;

  if p_collaborator_email is null or position('@' in trim(p_collaborator_email)) < 2 then
    raise exception 'a registered collaborator email is required';
  end if;
  if p_display_name is null or length(trim(p_display_name)) < 2 then
    raise exception 'collaborator display name is required';
  end if;
  if p_term_end is not null and p_term_end < coalesce(p_term_start, current_date) then
    raise exception 'term end cannot be before term start';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_collaborator_email))
  limit 1;
  if v_user_id is null then
    raise exception 'the collaborator must register an account first';
  end if;

  if exists (select 1 from public.collaborators where user_id = v_user_id) then
    raise exception 'this account already has a collaborator key';
  end if;

  v_referral_key := 'SL-' || upper(replace(gen_random_uuid()::text, '-', ''));

  insert into public.collaborators (
    user_id, display_name, referral_key_hash, referral_key_hint, term_start, term_end
  ) values (
    v_user_id,
    trim(p_display_name),
    public.referral_key_hash(v_referral_key),
    right(v_referral_key, 4),
    coalesce(p_term_start, current_date),
    p_term_end
  ) returning * into v_collaborator;

  return jsonb_build_object(
    'collaborator_id', v_collaborator.id,
    'display_name', v_collaborator.display_name,
    'collaborator_email', lower(trim(p_collaborator_email)),
    'referral_key', v_referral_key,
    'referral_key_hint', v_collaborator.referral_key_hint,
    'status', v_collaborator.status,
    'term_start', v_collaborator.term_start,
    'term_end', v_collaborator.term_end
  );
end;
$referral$;
grant execute on function public.create_collaborator(text, text, date, date) to authenticated;

create or replace function public.set_collaborator_status(
  p_collaborator_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $referral$
declare
  v_admin_id uuid := auth.uid();
  v_is_admin boolean;
  v_status text := upper(trim(coalesce(p_status, '')));
  v_updated public.collaborators%rowtype;
begin
  if v_admin_id is null then
    raise exception 'not authenticated';
  end if;

  select upper(coalesce(role, 'USER')) = 'ADMIN' into v_is_admin
  from public.profiles where id = v_admin_id;
  if coalesce(v_is_admin, false) is not true then
    raise exception 'admin access required';
  end if;
  if v_status not in ('ACTIVE', 'PAUSED', 'ENDED') then
    raise exception 'invalid collaborator status';
  end if;

  update public.collaborators
  set status = v_status, updated_at = timezone('utc', now())
  where id = p_collaborator_id
  returning * into v_updated;
  if not found then
    raise exception 'collaborator not found';
  end if;

  return jsonb_build_object(
    'collaborator_id', v_updated.id,
    'status', v_updated.status,
    'updated_at', v_updated.updated_at
  );
end;
$referral$;
grant execute on function public.set_collaborator_status(uuid, text) to authenticated;

alter table public.collaborators enable row level security;
alter table public.referral_attributions enable row level security;

-- No direct table policies are granted to collaborators. They use the summary RPC.
-- This also keeps student identity and attribution rows out of the client.

drop policy if exists "collaborators_select_own" on public.collaborators;
create policy "collaborators_select_own" on public.collaborators
for select to authenticated using (auth.uid() = user_id);

-- Attribution rows are intentionally inaccessible through direct client queries.
-- Admin and collaborator summaries are returned only by security-definer functions.

revoke all on table public.collaborators from anon, authenticated;
revoke all on table public.referral_attributions from anon, authenticated;

-- The RPCs above remain callable by authenticated users while table rows remain hidden.
