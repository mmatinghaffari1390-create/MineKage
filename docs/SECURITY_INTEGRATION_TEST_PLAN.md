# MineKage backend security integration test plan

This plan supplements `security_metadata.test.sql`. Metadata checks prove that grants, policies, and helper functions exist; they do **not** prove that real users can or cannot access specific rows. Run these scenarios against a disposable Supabase project before production setup. Never use production user data for tests.

## Test identities

Create separate test identities for:
- Anonymous request (no access token).
- Member A and Member B (two distinct authenticated users).
- Moderator/admin with only the explicitly granted moderation permissions.
- Main admin with the intended role-management permission.

Record the expected role/permission matrix for the tested commit. Do not grant privileges by username, email address, or client-controlled profile fields.

## Required access matrix

| Area | Anonymous | Member A | Member B | Moderator/admin | Main admin |
|---|---|---|---|---|---|
| Public catalogues | Read published rows only | Read published rows | Read published rows | Read published rows | Read published rows |
| Profiles | No direct table access | Read self and profiles explicitly visible to members | Cannot bypass visibility setting | Only with the explicit users.view permission | Only with explicit permission |
| User settings | No access | Read/update own allowed settings only | Cannot read or update A's settings | No implicit access from role name alone | No implicit access from role name alone |
| Friendships | No access | Create requests as self; only permitted status transitions | Cannot impersonate A or change participants | No implicit access unless policy explicitly allows it | No implicit access unless policy explicitly allows it |
| Role assignments / permissions | No access | Cannot grant roles or edit permissions | Cannot grant roles or edit permissions | Cannot escalate to main admin or change protected permissions | Can manage roles only through the intended privileged path |
| Restrictions / audit logs | No access | Cannot create, alter, or delete moderation records | Cannot create, alter, or delete moderation records | Can perform only authorized moderation actions; actions are audited | Authorized actions are audited |

Treat this matrix as the target behavior to verify against the actual policies and documented product decisions; if the implementation intentionally differs, update the matrix and justify the difference before release.

## Scenarios to execute

1. **Anonymous isolation:** attempt reads and writes against profiles, settings, role assignments, friendships, stats, achievements, restrictions, and audit logs. Confirm private access is denied and published catalogue rows are the only publicly readable content.
2. **Owner boundaries:** as Member A, attempt to select, insert, update, and delete Member B's profile/settings/achievements. Verify that any allowed profile update cannot change another user's identity or privileged fields.
3. **Profile visibility:** set Member A's profile to private. Verify Member B cannot read it through the client API, while A can still read their own profile.
4. **Friendship integrity:** verify A can request friendship with B; B can accept/reject a pending request; A can cancel their own pending request; neither can change requester/addressee IDs or perform transitions not allowed by the trigger.
5. **Role escalation:** as a member and ordinary admin, try to assign `main_admin`, grant `roles.manage`, modify the permission matrix, and call privileged functions directly. All unauthorized attempts must fail.
6. **Moderation boundaries:** verify only authorized moderators can warn/suspend/ban/unrestrict; members cannot alter restrictions or audit logs. Confirm every successful privileged action creates an audit record.
7. **Content publishing:** verify ordinary members cannot publish or edit curated catalogue entries unless an explicit permission and policy allow it. Anonymous users must never see unpublished entries.
8. **Account lifecycle:** test email verification, password recovery, redirect allow-list, account deletion/cascade behavior, and access-token revocation in the configured Auth project.
9. **Negative paths:** test duplicate friendship requests, self-friendship, invalid status changes, expired suspensions, malformed IDs, and unauthorized direct RPC/function calls.
10. **Regression:** rerun all frontend checks, migrations, pgTAP tests, and these integration scenarios on the exact release commit.

## Evidence and release gate

For each scenario, record the test identity, request/action, expected result, actual result, and commit SHA. A denial test passes only when the server rejects the operation or returns no protected data—not merely when the UI hides a button.

Do not mark the backend production-ready until the integration scenarios have been executed against a configured Supabase environment. The repository's current metadata tests are useful guardrails but are not a substitute for this exercise.
