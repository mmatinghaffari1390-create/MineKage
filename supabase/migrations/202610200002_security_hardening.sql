-- Security hardening follow-up migration.
-- SECURITY DEFINER is narrowly scoped to read the visibility flag while
-- keeping user_settings protected by RLS from other members.
create or replace function public.profile_is_visible(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select us.profile_visible
     from public.user_settings as us
     where us.user_id = target_user_id),
    false
  );
$$;

revoke all on function public.profile_is_visible(uuid) from public;
revoke all on function public.profile_is_visible(uuid) from anon;
grant execute on function public.profile_is_visible(uuid) to authenticated;

drop policy if exists "authenticated users read visible profiles" on public.profiles;
create policy "authenticated users read visible profiles"
on public.profiles for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_permission('users.view')
  or public.profile_is_visible(user_id)
);

-- Protect friendship identities and permit only expected state transitions.
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
     and actor in (old.requester_id, old.addressee_id) then
    return new;
  end if;

  raise exception 'Invalid friendship status transition';
end;
$$;

drop trigger if exists guard_friendship_update on public.friendships;
create trigger guard_friendship_update
before update on public.friendships
for each row execute procedure public.guard_friendship_update();
