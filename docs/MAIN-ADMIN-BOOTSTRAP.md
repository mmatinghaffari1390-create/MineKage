# One-time main administrator bootstrap

This procedure is intentionally manual. Never assign the first privileged role from the public client, signup metadata, or a frontend environment variable.

## Before running

1. Open the intended Supabase project dashboard and verify you are in the correct project.
2. Confirm the owner has completed account signup and email verification.
3. Find that account's UUID in **Authentication → Users**. Verify the account identity in the dashboard; do not rely on a username supplied by a client.
4. Open the SQL editor using an owner-level administrative session. Do not put the `service_role` key in the frontend or commit it to this repository.
5. Replace the placeholder UUID below with the verified account UUID. The script deliberately fails if the placeholder is left unchanged, the account does not exist, or a main administrator is already assigned.

## SQL

Run this once in the intended project's SQL editor:

```sql
begin;

do $bootstrap$
declare
  target_user_id uuid := 'REPLACE-WITH-VERIFIED-AUTH-USER-UUID'::uuid;
begin
  if target_user_id::text = 'replace-with-verified-auth-user-uuid' then
    raise exception 'Replace the placeholder with the verified auth.users UUID';
  end if;

  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'Verified auth.users account was not found';
  end if;

  if exists (select 1 from public.user_roles where role_key = 'main_admin') then
    raise exception 'A main_admin role already exists; stop and review manually';
  end if;

  if not exists (
    select 1 from public.role_permissions
    where role_key = 'main_admin'
      and permission_key = 'roles.manage'
      and allowed = true
  ) then
    raise exception 'Expected main_admin permissions are missing; review migrations first';
  end if;

  insert into public.user_roles (user_id, role_key, assigned_by)
  values (target_user_id, 'main_admin', target_user_id);
end;
$bootstrap$;

commit;
```

## Verify

After the transaction succeeds, verify the intended account and role in the SQL editor:

```sql
select ur.user_id, u.email, ur.role_key, ur.assigned_at
from public.user_roles ur
join auth.users u on u.id = ur.user_id
where ur.role_key = 'main_admin';
```

There should be exactly one row for the intended owner account. If the script fails, do not remove safeguards or grant extra permissions to make it pass; inspect the migration state and investigate first.

This bootstrap grants the role only. The permission matrix must already be populated by the reviewed migrations. Keep the initial setup SQL private if your operational policy treats account identifiers as sensitive, and never commit real user UUIDs or credentials to the repository.
