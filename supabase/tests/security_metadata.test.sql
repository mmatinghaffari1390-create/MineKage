-- Run with Supabase CLI / pgTAP in a disposable local test database.
-- These metadata tests do not replace authenticated multi-user integration tests.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

select ok(
  exists (select 1 from pg_trigger where tgname = 'guard_friendship_update' and not tgisinternal),
  'friendship updates have a state-transition guard'
);

select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  'clients have no direct write policies for user roles'
);

select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'role_permissions'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  'clients have no direct write policies for role permissions'
);

select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'admin_audit_logs'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  'clients cannot write or delete audit logs directly'
);

select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_restrictions'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  ),
  'clients cannot directly create or erase moderation restrictions'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and cmd = 'UPDATE' and roles @> array['authenticated']::name[]
  ),
  'authenticated profile update policy exists'
);

select ok(
  to_regprocedure('public.profile_is_visible(uuid)') is not null,
  'profile visibility is checked through a dedicated RLS-safe function'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'authenticated users read visible profiles'
      and qual like '%profile_is_visible%'
  ),
  'profile read policy delegates visibility lookup to the helper function'
);

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity
  ),
  'all ordinary public tables have row-level security enabled'
);

select ok(
  position('Friendship participants cannot be changed' in pg_get_functiondef('public.guard_friendship_update()'::regprocedure)) > 0,
  'friendship guard function includes participant protection'
);

select ok(
  has_table_privilege('anon', 'public.servers', 'SELECT')
  and has_table_privilege('anon', 'public.mods', 'SELECT')
  and has_table_privilege('anon', 'public.explore_items', 'SELECT')
  and has_table_privilege('anon', 'public.live_streams', 'SELECT'),
  'anonymous users can read public catalogue tables'
);

select ok(
  not has_table_privilege('anon', 'public.profiles', 'SELECT')
  and not has_table_privilege('anon', 'public.user_settings', 'SELECT')
  and not has_table_privilege('anon', 'public.user_roles', 'SELECT'),
  'anonymous users cannot read private community tables'
);


select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'servers'
    and policyname = 'public read published servers' and roles @> array['anon']::name[]
    and qual like '%is_published%'),
  'anonymous server catalogue policy restricts reads to published entries'
);

select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'mods'
    and policyname = 'public read published mods' and roles @> array['anon']::name[]
    and qual like '%is_published%')
  and exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'explore_items'
    and policyname = 'public read published explore items' and roles @> array['anon']::name[]
    and qual like '%is_published%'),
  'anonymous mod and explore catalogues restrict reads to published entries'
);

select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'live_streams'
    and policyname = 'public read verified published streams' and roles @> array['anon']::name[]
    and qual like '%verified_at%'),
  'anonymous live stream catalogue requires verified published entries'
);

select ok(
  not exists (select 1 from pg_policies where schemaname = 'public'
    and tablename in ('profiles', 'user_settings', 'user_roles')
    and roles @> array['anon']::name[]),
  'no anonymous RLS policies expose private community tables'
);


select ok(
  not has_table_privilege('anon', 'public.friendships', 'SELECT')
  and not has_table_privilege('anon', 'public.user_stats', 'SELECT')
  and not has_table_privilege('anon', 'public.user_achievements', 'SELECT')
  and not has_table_privilege('anon', 'public.user_restrictions', 'SELECT')
  and not has_table_privilege('anon', 'public.admin_audit_logs', 'SELECT'),
  'anonymous users cannot read social, moderation, statistics, or audit tables'
);

select ok(
  not has_function_privilege('anon', 'public.profile_is_visible(uuid)', 'EXECUTE')
  and has_function_privilege('authenticated', 'public.profile_is_visible(uuid)', 'EXECUTE'),
  'profile visibility helper is executable only by signed-in users'
);

select ok(
  exists (select 1 from public.role_permissions where role_key = 'admin' and permission_key = 'content.manage' and allowed = false)
  and exists (select 1 from public.role_permissions where role_key = 'admin' and permission_key = 'roles.manage' and allowed = false)
  and exists (select 1 from public.role_permissions where role_key = 'main_admin' and permission_key = 'roles.manage' and allowed = true),
  'default role matrix keeps sensitive privileges limited to the main admin'
);

select ok(
  not has_table_privilege('anon', 'public.role_permissions', 'SELECT')
  and not has_table_privilege('anon', 'public.user_roles', 'SELECT')
  and not has_table_privilege('anon', 'public.user_settings', 'SELECT'),
  'anonymous grants exclude role assignments, permission matrix, and private settings'
);

select * from finish();
rollback;
