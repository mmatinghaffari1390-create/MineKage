# MineKage release readiness checklist

Use this checklist before calling the site production-ready. A checked item must be verified in the target environment; code existing in the repository alone is not proof of deployment.

## Automated checks
- [ ] Frontend CI passes on the exact release commit.
- [ ] Supabase migration and pgTAP/security tests pass on the exact release commit.
- [ ] Review failed, cancelled, and superseded workflow runs; do not treat `pending` or `in_progress` as success.
- [ ] Build the production frontend and verify the generated asset paths work under the configured GitHub Pages base path.

## Catalogue
- [ ] Search, pagination, empty results, API errors, and loading states work.
- [ ] Type and Minecraft version filters are passed to the catalogue API correctly.
- [ ] Loader filters are only shown where meaningful; do not imply all content supports every loader or game version.
- [ ] Every download action points to the original project/provider page and displays the provider's compatibility metadata.
- [ ] Verify mobile layout and keyboard focus.

## Backend and account security
- [ ] Apply migrations to the intended Supabase project only after reviewing the target project and backup/recovery plan.
- [ ] Run RLS tests for anonymous, authenticated, owner, moderator, and administrator access.
- [ ] Verify role assignment cannot be performed by ordinary users and privileged actions are audited.
- [ ] Configure email verification, password recovery, allowed redirect URLs, and provider settings in Supabase Auth.
- [ ] Keep service-role keys and other secrets out of source control and all `VITE_*` client variables.
- [ ] Test account deletion, friendship request acceptance/rejection, blocking, suspension expiry, and admin permission boundaries.

## Real data and integrations
- [ ] Replace sample server cards with owner-submitted or independently verified server entries; label unverified entries clearly.
- [ ] Connect a trustworthy server-status source before displaying online player counts or live status.
- [ ] Use explicitly configured YouTube channels/streams for any MineKage-curated live feed; a generic YouTube page is not a verified stream list.
- [ ] Connect leaderboard data to a defined, auditable source or label the section as a preview.

## Accessibility and release
- [ ] Test Persian RTL and English LTR on mobile and desktop.
- [ ] Check reduced-motion preference, contrast, focus visibility, and meaningful link labels.
- [ ] Verify external links and provide clear API/backend error messages.
- [ ] Confirm GitHub Pages build/deployment succeeds from the intended branch.
- [ ] Review the pull request diff and CI results before merging; keep `main` unchanged until checks pass.

## Current status
This checklist is a release gate, not a claim that the items above have already passed. Supabase project configuration, production email delivery, verified server data, and verified live/leaderboard feeds require actual environment setup and validation.
