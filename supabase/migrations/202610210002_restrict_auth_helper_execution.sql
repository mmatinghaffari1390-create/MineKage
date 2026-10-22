-- Restrict helper RPC execution to signed-in users; policies still invoke them as the caller.
-- Keep a fixed empty search_path on SECURITY DEFINER functions.

revoke all on function public.has_permission(text) from public, anon;
revoke all on function public.is_main_admin() from public, anon;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.is_main_admin() to authenticated;

-- These functions return only the current caller's authorization state. They do not mutate data.
