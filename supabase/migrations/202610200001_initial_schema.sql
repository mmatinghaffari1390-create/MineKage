-- MineKage initial database foundation.
-- Apply only to a dedicated Supabase project after review. No privileged secrets belong in the frontend.

create extension if not exists pgcrypto;

create type public.friendship_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
create type public.restriction_type as enum ('warning', 'suspension', 'ban');
create type public.content_kind as enum ('server', 'mod', 'explore_item', 'live_stream');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'fa')),
  profile_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('main_admin', 'admin', 'member')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_key)
);

create table public.role_permissions (
  role_key text not null check (role_key in ('main_admin', 'admin', 'member')),
  permission_key text not null check (permission_key in (
    'users.view', 'users.restrict', 'users.unrestrict',
    'roles.view', 'roles.manage', 'content.view', 'content.manage',
    'audit.view'
  )),
  allowed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (role_key, permission_key)
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  servers_added integer not null default 0 check (servers_added >= 0),
  mods_shared integer not null default 0 check (mods_shared >= 0),
  achievements_count integer not null default 0 check (achievements_count >= 0),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  achievement_key text not null unique,
  title_en text not null,
  title_fa text not null,
  description_en text not null default '',
  description_fa text not null default '',
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_by uuid references auth.users(id) on delete set null,
  primary key (user_id, achievement_id)
);

create table public.servers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 2000),
  edition text not null check (edition in ('java', 'bedrock', 'both')),
  game_modes text[] not null default '{}',
  versions text[] not null default '{}',
  address text,
  source_url text,
  status_provider_url text,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mods (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '' check (char_length(description) <= 3000),
  loader text not null check (loader in ('fabric', 'forge', 'neoforge', 'quilt', 'datapack', 'other')),
  versions text[] not null default '{}',
  source_url text not null,
  license_name text,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.explore_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('map', 'shader', 'resource_pack', 'build')),
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '' check (char_length(description) <= 3000),
  source_url text not null,
  license_name text,
  compatibility text[] not null default '{}',
  creator_credit text,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.live_streams (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  channel_name text not null,
  platform text not null check (platform in ('youtube', 'twitch', 'other')),
  stream_url text not null,
  verified_at timestamptz,
  is_live boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.user_restrictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restriction public.restriction_type not null,
  reason text not null check (char_length(reason) between 5 and 1000),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at),
  check (restriction <> 'suspension' or ends_at is not null)
);

create table public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action_key text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  target_kind text,
  target_id text,
  reason text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index friendships_addressee_status_idx on public.friendships (addressee_id, status);
create index friendships_requester_status_idx on public.friendships (requester_id, status);
create index restrictions_active_idx on public.user_restrictions (user_id, starts_at, ends_at);
create index audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index servers_published_idx on public.servers (is_published, name);
create index mods_published_idx on public.mods (is_published, name);
create index explore_published_idx on public.explore_items (is_published, kind, name);

-- Permission checks are database-side. A hidden button is never a security boundary.
create or replace function public.has_permission(required_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_key = ur.role_key
    where ur.user_id = (select auth.uid())
      and rp.permission_key = required_permission
      and rp.allowed = true
  );
$$;

create or replace function public.is_main_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role_key = 'main_admin'
  );
$$;

-- Create the minimum private account rows on signup; new accounts never receive admin roles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  candidate := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'player_' || substr(new.id::text, 1, 8));
  if candidate !~ '^[A-Za-z0-9_]{3,20}$' then
    candidate := 'player_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (user_id, username, display_name)
  values (new.id, candidate, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), candidate));

  insert into public.user_settings (user_id) values (new.id);
  insert into public.user_stats (user_id) values (new.id);
  insert into public.user_roles (user_id, role_key) values (new.id, 'member');
  return new;
exception
  when unique_violation then
    insert into public.profiles (user_id, username, display_name)
    values (new.id, 'player_' || substr(new.id::text, 1, 8), 'Player');
    insert into public.user_settings (user_id) values (new.id);
    insert into public.user_stats (user_id) values (new.id);
    insert into public.user_roles (user_id, role_key) values (new.id, 'member');
    return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Prevent participants from rewriting the identities or forging friendship transitions.
create or replace function public.guard_friendship_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if new.requester_id is distinct from old.requester_id
     or new.addressee_id is distinct from old.addressee_id then
    raise exception 'Friendship participants cannot be changed';
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  if old.status = 'pending'
     and new.status in ('accepted', 'rejected')
     and actor = old.addressee_id then
    return new;
  end if;

  if old.status = 'pending'
     and new.status = 'cancelled'
     and actor = old.requester_id then
    return new;
  end if;

  if old.status = 'accepted'
     and new.status = 'cancelled'
     and actor = old.requester_id then
    return new;
  end if;

  raise exception 'Invalid friendship status transition';
end;
$$;
create trigger guard_friendship_update
before update on public.friendships
for each row execute procedure public.guard_friendship_update();

-- Keep updated_at consistent on user-editable rows.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings
  for each row execute procedure public.set_updated_at();
create trigger friendships_updated_at before update on public.friendships
  for each row execute procedure public.set_updated_at();
create trigger servers_updated_at before update on public.servers
  for each row execute procedure public.set_updated_at();
create trigger mods_updated_at before update on public.mods
  for each row execute procedure public.set_updated_at();
create trigger explore_items_updated_at before update on public.explore_items
  for each row execute procedure public.set_updated_at();

-- RLS is enabled on every table. Policies below are intentionally restrictive.
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.friendships enable row level security;
alter table public.user_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.servers enable row level security;
alter table public.mods enable row level security;
alter table public.explore_items enable row level security;
alter table public.live_streams enable row level security;
alter table public.user_restrictions enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Signed-in members can discover profiles, but may only edit their own.
create policy "authenticated users read visible profiles"
on public.profiles for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_permission('users.view')
  or exists (select 1 from public.user_settings us where us.user_id = profiles.user_id and us.profile_visible)
);

create policy "users update own profile"
on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users read own settings"
on public.user_settings for select to authenticated
using (user_id = (select auth.uid()) or public.has_permission('users.view'));
create policy "users update own settings"
on public.user_settings for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "users read own role and authorized admins inspect roles"
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or public.has_permission('roles.view'));
-- Intentionally no client INSERT/UPDATE/DELETE policies for roles or role_permissions.

create policy "authorized admins read permission matrix"
on public.role_permissions for select to authenticated
using (public.has_permission('roles.view') or public.is_main_admin());
-- Intentionally no direct client writes to role_permissions.

create policy "participants read friendships"
on public.friendships for select to authenticated
using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
create policy "users send friend requests"
on public.friendships for insert to authenticated
with check (requester_id = (select auth.uid()) and status = 'pending' and requester_id <> addressee_id);
create policy "participants respond to or cancel requests"
on public.friendships for update to authenticated
using (
  (addressee_id = (select auth.uid()) and status = 'pending')
  or (requester_id = (select auth.uid()) and status in ('pending', 'accepted'))
)
with check (
  (addressee_id = (select auth.uid()) and status in ('accepted', 'rejected'))
  or (requester_id = (select auth.uid()) and status = 'cancelled')
);
create policy "participants remove friendship"
on public.friendships for delete to authenticated
using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

create policy "members read stats"
on public.user_stats for select to authenticated using (true);
create policy "members read achievements"
on public.achievements for select to authenticated using (true);
create policy "members read awarded achievements"
on public.user_achievements for select to authenticated using (true);
-- Stats and achievements are system-managed; no client write policies.

create policy "members read published servers"
on public.servers for select to authenticated
using (is_published or public.has_permission('content.view'));
create policy "content managers insert servers"
on public.servers for insert to authenticated
with check (public.has_permission('content.manage'));
create policy "content managers update servers"
on public.servers for update to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));
create policy "content managers delete servers"
on public.servers for delete to authenticated
using (public.has_permission('content.manage'));

create policy "members read published mods"
on public.mods for select to authenticated
using (is_published or public.has_permission('content.view'));
create policy "content managers insert mods"
on public.mods for insert to authenticated
with check (public.has_permission('content.manage'));
create policy "content managers update mods"
on public.mods for update to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));
create policy "content managers delete mods"
on public.mods for delete to authenticated
using (public.has_permission('content.manage'));

create policy "members read published explore items"
on public.explore_items for select to authenticated
using (is_published or public.has_permission('content.view'));
create policy "content managers insert explore items"
on public.explore_items for insert to authenticated
with check (public.has_permission('content.manage'));
create policy "content managers update explore items"
on public.explore_items for update to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));
create policy "content managers delete explore items"
on public.explore_items for delete to authenticated
using (public.has_permission('content.manage'));

create policy "members read verified published streams"
on public.live_streams for select to authenticated
using (is_published and verified_at is not null or public.has_permission('content.view'));
create policy "content managers insert streams"
on public.live_streams for insert to authenticated
with check (public.has_permission('content.manage'));
create policy "content managers update streams"
on public.live_streams for update to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));
create policy "content managers delete streams"
on public.live_streams for delete to authenticated
using (public.has_permission('content.manage'));

create policy "authorized admins read restrictions"
on public.user_restrictions for select to authenticated
using (user_id = (select auth.uid()) or public.has_permission('users.view'));
-- Intentionally no direct client writes to restrictions. Moderation actions need audited RPC/server endpoints.

create policy "authorized admins read audit log"
on public.admin_audit_logs for select to authenticated
using (public.has_permission('audit.view') or public.is_main_admin());
-- Intentionally no client UPDATE/DELETE policies on audit logs. Writes must be server-controlled.


-- Initial role defaults. Main-admin assignments are deliberately NOT seeded to a
-- hard-coded identity; bootstrap the first main admin manually after verifying the account.
insert into public.role_permissions (role_key, permission_key, allowed) values
  ('main_admin', 'users.view', true),
  ('main_admin', 'users.restrict', true),
  ('main_admin', 'users.unrestrict', true),
  ('main_admin', 'roles.view', true),
  ('main_admin', 'roles.manage', true),
  ('main_admin', 'content.view', true),
  ('main_admin', 'content.manage', true),
  ('main_admin', 'audit.view', true),
  ('admin', 'users.view', true),
  ('admin', 'users.restrict', false),
  ('admin', 'users.unrestrict', false),
  ('admin', 'roles.view', false),
  ('admin', 'roles.manage', false),
  ('admin', 'content.view', true),
  ('admin', 'content.manage', false),
  ('admin', 'audit.view', false),
  ('member', 'users.view', false),
  ('member', 'users.restrict', false),
  ('member', 'users.unrestrict', false),
  ('member', 'roles.view', false),
  ('member', 'roles.manage', false),
  ('member', 'content.view', false),
  ('member', 'content.manage', false),
  ('member', 'audit.view', false)
on conflict (role_key, permission_key) do nothing;

-- Public catalogue content can be read without an account; community profiles remain
-- authenticated-only. All write policies still require a database-side permission check.
create policy "public read published servers"
on public.servers for select to anon
using (is_published);
create policy "public read published mods"
on public.mods for select to anon
using (is_published);
create policy "public read published explore items"
on public.explore_items for select to anon
using (is_published);
create policy "public read verified published streams"
on public.live_streams for select to anon
using (is_published and verified_at is not null);

grant select on public.servers, public.mods, public.explore_items, public.live_streams to anon;

-- Explicitly do not grant anon access to community data.
revoke all on public.profiles, public.user_settings, public.user_roles, public.role_permissions,
  public.friendships, public.user_stats, public.achievements, public.user_achievements,
  public.servers, public.mods, public.explore_items, public.live_streams,
  public.user_restrictions, public.admin_audit_logs from anon;

grant select, update on public.profiles to authenticated;
grant select, update on public.user_settings to authenticated;
grant select on public.user_roles, public.role_permissions to authenticated;
grant select, insert, update, delete on public.friendships to authenticated;
grant select on public.user_stats, public.achievements, public.user_achievements to authenticated;
grant select, insert, update, delete on public.servers, public.mods, public.explore_items, public.live_streams to authenticated;
grant select on public.user_restrictions, public.admin_audit_logs to authenticated;
