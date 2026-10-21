import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const initial = await readFile('supabase/migrations/202610200001_initial_schema.sql', 'utf8')
const hardening = await readFile('supabase/migrations/202610200002_security_hardening.sql', 'utf8')
const tests = await readFile('supabase/tests/security_metadata.test.sql', 'utf8')

const friendshipStart = initial.indexOf('create or replace function public.guard_friendship_update()')
const friendshipEnd = initial.indexOf('create trigger guard_friendship_update', friendshipStart)
const friendshipBody = initial.slice(friendshipStart, friendshipEnd)
const tableNames = [...initial.matchAll(/create table public\\.([a-z_]+)/gi)].map(match => match[1])

const checks = [
  ['initial friendship trigger uses valid dollar quoting', friendshipStart >= 0 && friendshipEnd > friendshipStart && /set search_path = ''\\s+as \\$\\$[\\s\\S]*?end;\\s+\\$\\$;/i.test(friendshipBody)],
  ['all declared public tables enable RLS', tableNames.length > 0 && tableNames.every(name => new RegExp('alter table public\\\\.' + name + ' enable row level security;', 'i').test(initial))],
  ['RLS enabled on profiles', /alter table public\.profiles enable row level security;/i.test(initial)],
  ['RLS enabled on roles', /alter table public\.user_roles enable row level security;/i.test(initial)],
  ['no client role write policy', /no client INSERT\/UPDATE\/DELETE policies for roles/i.test(initial)],
  ['server-side permission helper is defined', /create or replace function public\.has_permission/i.test(initial)],
  ['new accounts are not granted admin by signup trigger', /insert into public\.user_roles\s*\(user_id, role_key\)\s*values\s*\(new\.id, 'member'\)/i.test(initial)],
  ['profile visibility helper avoids settings RLS subquery in policy', /create or replace function public\.profile_is_visible\(target_user_id uuid\)[\s\S]*?security definer[\s\S]*?set search_path = ''/i.test(hardening)],
  ['profile policy uses visibility helper', /or public\.profile_is_visible\(user_id\)/i.test(hardening)],
  ['friendship trigger prevents participant identity changes', /new\.requester_id is distinct from old\.requester_id[\s\S]*?new\.addressee_id is distinct from old\.addressee_id/i.test(hardening)],
  ['friendship trigger rejects invalid transitions', /raise exception 'Invalid friendship status transition'/i.test(hardening)],
  ['metadata tests cover audit log restrictions', /clients cannot write or delete audit logs directly/i.test(tests)],
  ['metadata tests cover visibility policy', /profile read policy delegates visibility lookup to the helper function/i.test(tests)],
]

for (const [label, passed] of checks) {
  assert.ok(passed, `Security static check failed: ${label}`)
  console.log(`PASS ${label}`)
}
console.log(`Passed ${checks.length} static security checks. These are not a substitute for PostgreSQL/Supabase integration tests.`)
