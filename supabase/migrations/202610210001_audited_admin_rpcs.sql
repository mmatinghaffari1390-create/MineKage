-- MineKage audited admin RPCs. Apply only after review in a disposable Supabase project.
-- These functions are deliberately narrow; they do not grant client-side table writes.

create or replace function public.admin_set_user_role(target_user uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null or not public.is_main_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if target_user is null or new_role not in ('admin', 'member') then
    raise exception 'Invalid role assignment' using errcode = '22023';
  end if;
  if target_user = actor then
    raise exception 'Self role changes are not allowed' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users u where u.id = target_user) then
    raise exception 'Target user not found' using errcode = '22023';
  end if;

  delete from public.user_roles
  where user_id = target_user and role_key in ('admin', 'member');
  insert into public.user_roles (user_id, role_key, assigned_by)
  values (target_user, new_role, actor);
  insert into public.admin_audit_logs (actor_id, action_key, target_user_id, reason, details)
  values (actor, 'user.role_changed', target_user, 'Role changed by main admin',
          jsonb_build_object('new_role', new_role));
end;
$$;

create or replace function public.admin_set_role_permission(target_role text, target_permission text, is_allowed boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null or not public.is_main_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if target_role not in ('admin', 'member') or target_permission not in (
    'users.view', 'users.restrict', 'users.unrestrict', 'roles.view',
    'roles.manage', 'content.view', 'content.manage', 'audit.view'
  ) or is_allowed is null then
    raise exception 'Invalid permission assignment' using errcode = '22023';
  end if;

  insert into public.role_permissions (role_key, permission_key, allowed, updated_at)
  values (target_role, target_permission, is_allowed, now())
  on conflict (role_key, permission_key) do update
    set allowed = excluded.allowed, updated_at = now();
  insert into public.admin_audit_logs (actor_id, action_key, target_kind, target_id, reason, details)
  values (actor, 'role.permission_changed', 'role', target_role, 'Permission changed by main admin',
          jsonb_build_object('permission', target_permission, 'allowed', is_allowed));
end;
$$;

create or replace function public.admin_create_restriction(
  target_user uuid, restriction_kind public.restriction_type, reason_text text,
  restriction_ends_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  new_id uuid;
begin
  if actor is null or not public.has_permission('users.restrict') then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if target_user is null or restriction_kind is null or reason_text is null
     or char_length(trim(reason_text)) < 5 or char_length(reason_text) > 1000 then
    raise exception 'Invalid restriction details' using errcode = '22023';
  end if;
  if restriction_kind = 'suspension' and restriction_ends_at is null then
    raise exception 'Suspensions require an end time' using errcode = '22023';
  end if;
  if restriction_ends_at is not null and restriction_ends_at <= now() then
    raise exception 'End time must be in the future' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users u where u.id = target_user) then
    raise exception 'Target user not found' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = target_user and ur.role_key = 'main_admin'
  ) then
    raise exception 'The main admin account cannot be restricted' using errcode = '42501';
  end if;

  insert into public.user_restrictions (user_id, restriction, reason, ends_at, created_by)
  values (target_user, restriction_kind, trim(reason_text), restriction_ends_at, actor)
  returning id into new_id;
  insert into public.admin_audit_logs (actor_id, action_key, target_user_id, target_kind, target_id, reason, details)
  values (actor, 'user.restriction_created', target_user, 'restriction', new_id::text, trim(reason_text),
          jsonb_build_object('restriction', restriction_kind, 'ends_at', restriction_ends_at));
  return new_id;
end;
$$;

create or replace function public.admin_revoke_restriction(target_restriction uuid, reason_text text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target_user uuid;
begin
  if actor is null or not public.has_permission('users.unrestrict') then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if target_restriction is null or reason_text is null
     or char_length(trim(reason_text)) < 5 or char_length(reason_text) > 1000 then
    raise exception 'Invalid revocation details' using errcode = '22023';
  end if;

  update public.user_restrictions
  set revoked_at = now(), revoked_by = actor
  where id = target_restriction and revoked_at is null
  returning user_id into target_user;
  if target_user is null then
    raise exception 'Active restriction not found' using errcode = '22023';
  end if;
  insert into public.admin_audit_logs (actor_id, action_key, target_user_id, target_kind, target_id, reason)
  values (actor, 'user.restriction_revoked', target_user, 'restriction', target_restriction::text, trim(reason_text));
end;
$$;

-- Functions are not callable by anonymous clients. Each function independently checks caller permissions.
revoke all on function public.admin_set_user_role(uuid, text) from public, anon;
revoke all on function public.admin_set_role_permission(text, text, boolean) from public, anon;
revoke all on function public.admin_create_restriction(uuid, public.restriction_type, text, timestamptz) from public, anon;
revoke all on function public.admin_revoke_restriction(uuid, text) from public, anon;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_set_role_permission(text, text, boolean) to authenticated;
grant execute on function public.admin_create_restriction(uuid, public.restriction_type, text, timestamptz) to authenticated;
grant execute on function public.admin_revoke_restriction(uuid, text) to authenticated;
