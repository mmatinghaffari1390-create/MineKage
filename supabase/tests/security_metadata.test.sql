-- Run with Supabase CLI / pgTAP in a disposable local test database.
-- These metadata tests do not replace authenticated multi-user integration tests.
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

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

select * from finish();
rollback;
