# MineKage security integration test matrix

Status: **test plan only; these cases are not evidence of passing tests**.

Run against a disposable local Supabase instance with synthetic accounts. Never run destructive cases against production. Do not use real user data or commit credentials.

## Test identities

Create separate accounts for:
- Anonymous client (no session)
- Member A
- Member B
- Moderator/admin with only explicitly granted permissions
- Main admin

Verify the actual role rows and permission matrix in the test database before executing the cases. A UI-hidden control does not count as an authorization test.

## Required RLS and authorization cases

| Area | Action | Expected result |
| --- | --- | --- |
| Profiles | Anonymous client reads a profile row | Denied / no rows |
| Profiles | Member A reads own profile | Allowed |
| Profiles | Member A reads Member B when visible | Allowed only while B's visibility setting permits it |
| Profiles | Member A reads Member B when hidden | Denied / no rows unless an explicit authorized permission allows it |
| Profiles | Member A updates Member B's profile | Denied |
| Roles | Member A attempts to insert, update, or delete any role | Denied |
| Roles | Admin without roles.manage attempts role change | Denied |
| Roles | Main-admin role change through approved server-side/RPC path | Allowed only after permission checks and audit logging |
| Permissions | Any client attempts to write role_permissions directly | Denied |
| Friendships | Member A creates a pending request to Member B | Allowed |
| Friendships | Member A creates a request as Member B | Denied |
| Friendships | Member A creates a request to self | Denied |
| Friendships | Member B accepts/rejects a pending request | Allowed |
| Friendships | Member A accepts/rejects their own outgoing request | Denied |
| Friendships | A participant changes requester/addressee IDs | Denied |
| Friendships | Unrelated member reads or changes the request | Denied |
| Catalogue | Anonymous reads published server/mod/explore records | Allowed, read-only |
| Catalogue | Anonymous reads unpublished records or writes any record | Denied |
| Catalogue | Member without content permission writes a record | Denied |
| Catalogue | Content manager with content.manage writes a record | Allowed |
| Streams | Anonymous reads unverified stream records | Denied |
| Moderation | Member attempts to create/revoke a restriction | Denied |
| Moderation | Authorized moderation endpoint creates a restriction | Allowed only with permission, validated reason/duration, and audit entry |
| Audit | Member attempts to read audit logs | Denied |
| Audit | Client attempts to insert/update/delete audit rows | Denied |
| Audit | Authorized server action records an audit entry | Allowed; existing entries remain immutable |
| Signup | New account is created with forged admin metadata | Account receives member role only |
| Signup | Duplicate/invalid username is supplied | Safe fallback or validation error; no partial account rows |

## Acceptance criteria

1. Every denial is asserted at the database/API boundary, not inferred from the UI.
2. Tests use distinct JWT/session identities; never simulate all roles using a service-role key.
3. Each role/permission mutation and moderation action is checked for an audit record with actor, target, action, timestamp, and reason where applicable.
4. The main-admin bootstrap procedure is documented and tested in a disposable database; no hard-coded identity or client-side privilege escalation is permitted.
5. Role-management and moderation RPC/server functions validate caller permissions internally, use a fixed safe search path, validate inputs, and write audit records atomically.
6. The test suite passes after a clean database reset. Record the command, commit SHA, and result in the PR before release.
7. Production migration, external auth configuration, and deployment remain separate manual release gates.

## Current blockers

- The schema intentionally has no client write policies for roles, permissions, restrictions, or audit logs. The privileged server-side/RPC path must be implemented and reviewed before those admin controls are functional.
- Real Supabase Auth/email delivery and external server-status, stream, and leaderboard providers must be configured and verified separately.
- This matrix does not claim that any case has been executed or passed.
