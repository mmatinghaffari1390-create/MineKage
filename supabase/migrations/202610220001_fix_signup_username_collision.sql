-- Make signup profile creation resilient to username collisions without swallowing
-- unrelated unique violations from settings, stats, or role creation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
  fallback_username text;
  candidate_display_name text;
begin
  candidate := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'player_' || substr(new.id::text, 1, 8));
  if candidate !~ '^[A-Za-z0-9_]{3,20}$' then
    candidate := 'player_' || substr(new.id::text, 1, 8);
  end if;

  fallback_username := 'player_' || substr(new.id::text, 1, 12);
  candidate_display_name := left(
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), candidate),
    40
  );
  if candidate_display_name = '' then
    candidate_display_name := 'Player';
  end if;

  -- Scope the collision handler to the profile insert only.
  begin
    insert into public.profiles (user_id, username, display_name)
    values (new.id, candidate, candidate_display_name);
  exception
    when unique_violation then
      insert into public.profiles (user_id, username, display_name)
      values (new.id, fallback_username, fallback_username);
  end;

  -- Fail loudly if these required rows cannot be created; do not mislabel
  -- unrelated failures as username collisions.
  insert into public.user_settings (user_id) values (new.id);
  insert into public.user_stats (user_id) values (new.id);
  insert into public.user_roles (user_id, role_key) values (new.id, 'member');
  return new;
end;
$$;
