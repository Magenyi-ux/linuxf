-- Examply server-enforced feature controls, premium entitlements, and distinct-question accounting.
-- Apply this migration in the Supabase SQL editor before deploying the matching API/UI changes.

create table if not exists public.app_control_settings (
  singleton boolean primary key default true check (singleton),
  emergency_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.app_control_settings(singleton) values (true) on conflict (singleton) do nothing;

create table if not exists public.feature_controls (
  feature_key text primary key check (feature_key ~ '^[a-z0-9_-]{1,60}$'),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.feature_controls(feature_key, enabled) values
  ('chatbot', true),
  ('deep-dive', true)
on conflict (feature_key) do nothing;

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  premium_enabled boolean not null default false,
  expires_at timestamptz,
  note text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.lifetime_question_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null check (char_length(question_id) between 1 and 200),
  first_seen_at timestamptz not null default now(),
  primary key (user_id, question_id)
);
create index if not exists lifetime_question_usage_user_idx
  on public.lifetime_question_usage(user_id);

alter table public.app_control_settings enable row level security;
alter table public.feature_controls enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.lifetime_question_usage enable row level security;

-- Only admins can inspect or change operational controls and entitlement records.
drop policy if exists "app_controls_admin_all" on public.app_control_settings;
create policy "app_controls_admin_all" on public.app_control_settings
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and upper(p.role) = 'ADMIN'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and upper(p.role) = 'ADMIN'));

drop policy if exists "feature_controls_admin_all" on public.feature_controls;
create policy "feature_controls_admin_all" on public.feature_controls
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and upper(p.role) = 'ADMIN'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and upper(p.role) = 'ADMIN'));

drop policy if exists "entitlements_admin_all" on public.user_entitlements;
create policy "entitlements_admin_all" on public.user_entitlements
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and upper(p.role) = 'ADMIN'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and upper(p.role) = 'ADMIN'));

drop policy if exists "question_usage_select_own" on public.lifetime_question_usage;
create policy "question_usage_select_own" on public.lifetime_question_usage
  for select to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.app_control_settings, public.feature_controls, public.user_entitlements to authenticated;
grant select on public.lifetime_question_usage to authenticated;

create or replace function public.check_feature_access(p_feature text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enabled boolean;
  v_role text;
  v_premium boolean;
begin
  if auth.uid() is null then return false; end if;
  select coalesce(emergency_enabled, false) into v_enabled
    from public.app_control_settings where singleton = true;
  -- The emergency stop is global, including administrator requests.
  if coalesce(v_enabled, false) = false then return false; end if;
  select enabled into v_enabled from public.feature_controls where feature_key = p_feature;
  if coalesce(v_enabled, false) = false then return false; end if;
  select upper(role) into v_role from public.profiles where id = auth.uid();
  if v_role = 'ADMIN' then return true; end if;
  select (premium_enabled and (expires_at is null or expires_at > now()))
    into v_premium from public.user_entitlements where user_id = auth.uid();
  return coalesce(v_premium, false);
end;
$$;
revoke all on function public.check_feature_access(text) from public;
grant execute on function public.check_feature_access(text) to authenticated;

create or replace function public.record_distinct_question(p_question_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_added integer := 0;
  v_premium boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_question_id is null or char_length(p_question_id) < 1 or char_length(p_question_id) > 200 then
    raise exception 'Invalid question identifier' using errcode = '22023';
  end if;

  -- Serialize updates per user so two simultaneous requests cannot exceed the cap.
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select (upper(p.role) = 'ADMIN') or coalesce(e.premium_enabled and (e.expires_at is null or e.expires_at > now()), false)
    into v_premium
    from public.profiles p
    left join public.user_entitlements e on e.user_id = p.id
    where p.id = auth.uid();
  if coalesce(v_premium, false) then
    return jsonb_build_object('allowed', true, 'distinct_count', null, 'limit', 200, 'new_question', false, 'premium', true);
  end if;

  if exists (select 1 from public.lifetime_question_usage where user_id = auth.uid() and question_id = p_question_id) then
    select count(*) into v_count from public.lifetime_question_usage where user_id = auth.uid();
    return jsonb_build_object('allowed', true, 'distinct_count', v_count, 'limit', 200, 'new_question', false);
  end if;

  select count(*) into v_count from public.lifetime_question_usage where user_id = auth.uid();
  if v_count >= 200 then
    return jsonb_build_object('allowed', false, 'distinct_count', v_count, 'limit', 200, 'new_question', false);
  end if;

  insert into public.lifetime_question_usage(user_id, question_id)
  values (auth.uid(), p_question_id)
  on conflict (user_id, question_id) do nothing;
  get diagnostics v_added = row_count;
  select count(*) into v_count from public.lifetime_question_usage where user_id = auth.uid();
  return jsonb_build_object('allowed', true, 'distinct_count', v_count, 'limit', 200, 'new_question', (v_added = 1));
end;
$$;
revoke all on function public.record_distinct_question(text) from public;
grant execute on function public.record_distinct_question(text) to authenticated;
