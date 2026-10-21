import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const initial = await readFile('supabase/migrations/202610200001_initial_schema.sql', 'utf8')
const hardening = await readFile('supabase/migrations/202610200002_security_hardening.sql', 'utf8')
const tests = await readFile('supabase/tests/security_metadata.test.sql', 'utf8')

const friendshipStart = initial.indexOf('create or replace function public.guard_friendship_update()')
const friendshipEnd = initial.indexOf('create trigger guard_friendship_update', friendshipStart)
const friendshipBody = initial.slice(friendshipStart, friendshipEnd)
const tableNames = [...initial.matchAll(/create table public\.([a-z_]+)/gi)].map(match => match[1])

const checks = [
  ['initial friendship trigger uses valid dollar quoting', friendshipStart >= 0 && friendshipEnd > friendshipStart && /set search_path = ''\s+as \$\$[\s\S]*?end;\s+\$\$;/i.test(friendshipBody)],
  ['all declared public tables enable RLS', tableNames.length > 0 && tableNames.every(name => new RegExp('alter table public\\.' + name + ' enable row level security;', 'i').test(initial))],
  ['RLS enabled on profiles', /alter table public\.profiles enable row level security;/i.test(initial)],
  ['RLS enabled on roles', /alter table public\.user_roles enable row level security;/i.test(initial)],
  ['no client role write policy', /no client INSERT\/UPDATE\/DELETE policies for roles/i.test(initial)],
  ['server-side permission helper is defined', /create or replace function public\.has_permission/i.test(initial)],
  ['new accounts are not granted admin by signup trigger', /insert into public\.user_roles\s*\(user_id, role_key\)\s*values\s*\(new\.id, 'member'\)/i.test(initial)],
  ['profile visibility helper uses a locked-down search path', /create or replace function public\.profile_is_visible\(target_user_id uuid\)[\s\S]*?security definer[\s\S]*?set search_path = ''/i.test(hardening)],
  ['profile policy uses visibility helper', /or public\.profile_is_visible\(user_id\)/i.test(hardening)],
  ['friendship trigger prevents participant identity changes', /new\.requester_id is distinct from old\.requester_id[\s\S]*?new\.addressee_id is distinct from old\.addressee_id/i.test(hardening)],
  ['friendship trigger rejects invalid transitions', /raise exception 'Invalid friendship status transition'/i.test(hardening)],
  ['metadata tests cover audit log restrictions', /clients cannot write or delete audit logs directly/i.test(tests)],
  ['metadata tests cover visibility policy', /profile read policy delegates visibility lookup to the helper function/i.test(tests)],
  ['metadata tests check RLS across public tables', /all ordinary public tables have row-level security enabled/i.test(tests)],
  ['metadata tests inspect the friendship guard definition', /friendship guard function includes participant protection/i.test(tests)],
  ['anonymous catalogue grants occur after broad anonymous revoke', /revoke all on public\.profiles[\s\S]*?from anon;[\s\S]*?grant select on public\.servers, public\.mods, public\.explore_items, public\.live_streams to anon;/i.test(initial)],
  ['metadata tests cover anonymous catalogue access and private community tables', /anonymous users can read public catalogue tables/i.test(tests) && /anonymous users cannot read private community tables/i.test(tests)],
]


const adminRpcs = await readFile('supabase/migrations/202610210001_audited_admin_rpcs.sql', 'utf8')
const helperGrants = await readFile('supabase/migrations/202610210002_restrict_auth_helper_execution.sql', 'utf8')
checks.push(
  ['admin RPCs use SECURITY DEFINER with an empty search_path', (adminRpcs.match(/security definer\s+set search_path = ''/gi) || []).length === 4],
  ['admin RPCs reject anonymous/public execution', /revoke all on function public\.admin_set_user_role\(uuid, text\) from public, anon;/i.test(adminRpcs) && /revoke all on function public\.admin_revoke_restriction\(uuid, text\) from public, anon;/i.test(adminRpcs)],
  ['admin RPCs grant execution only to authenticated role', (adminRpcs.match(/grant execute on function public\.admin_/gi) || []).length === 4 && !/grant execute on function public\.admin_[^;]+ to (?:anon|public)\s*;/i.test(adminRpcs)],
  ['role assignment is restricted to main admin and blocks self-change', /not public\.is_main_admin\(\)/i.test(adminRpcs) && /target_user = actor[\s\S]*?Self role changes are not allowed/i.test(adminRpcs)],
  ['moderation RPCs check permissions and validate reason text', /public\.has_permission\('users\.restrict'\)/i.test(adminRpcs) && /public\.has_permission\('users\.unrestrict'\)/i.test(adminRpcs) && /char_length\(trim\(reason_text\)\) < 5/i.test(adminRpcs)],
  ['authorization helpers are not executable by anonymous/public roles', /revoke all on function public\.has_permission\(text\) from public, anon;/i.test(helperGrants) && /revoke all on function public\.is_main_admin\(\) from public, anon;/i.test(helperGrants)],
)

for (const [label, passed] of checks) {
  assert.ok(passed, 'Security static check failed: ' + label)
  console.log('PASS ' + label)
}
console.log('Passed ' + checks.length + ' static security checks. These are not a substitute for PostgreSQL/Supabase integration tests.')
