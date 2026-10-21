-- Run with Supabase CLI / pgTAP in a disposable local test database.
-- These metadata tests do not replace authenticated multi-user integration tests.
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

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
      and cmd = 'UPDATE' and roles @> array['authenticated']
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

select * from finish();
rollback;
