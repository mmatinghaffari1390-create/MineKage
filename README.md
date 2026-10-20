# MineKage

**MineKage — Cinematic Minecraft Community Website**

A bilingual, responsive React + TypeScript + Vite frontend for Minecraft community discovery. The public site is deployed on GitHub Pages.

## Live site and current state

- Live site: https://mmatinghaffari1390-create.github.io/MineKage/
- Frontend checks and deployment run automatically on pushes to `main`.
- English/Persian language switch with RTL layout.
- Responsive navigation, keyboard focus styling, reduced-motion support, discovery search, category filters, and `Ctrl/⌘ + K` search shortcut.
- Discovery cards link directly to official Modrinth project pages for Sodium, Lithium, and FerriteCore, plus the Modrinth catalogue. Check the project page for exact game version, loader, and compatibility before installing.
- Server categories are examples of play styles, not verified server listings. No live server status is claimed.
- Leaderboard and live creator sections intentionally do not invent users, scores, or live stream data.
- Account, profile, friendship, and moderation features are not active until a real backend is configured.

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Validate before committing:

```bash
npm run check:security
npm run typecheck
npm run build
npm run preview
```

## Deployment

GitHub Actions builds and deploys the `main` branch to GitHub Pages. See the workflow status at:
https://github.com/mmatinghaffari1390-create/MineKage/actions

## Database foundation (not applied)

SQL migrations are in `supabase/migrations/`. They define initial tables and Row Level Security (RLS) policies for profiles, settings, roles, friendships, catalogue content, user stats, restrictions, and audit logs.

**These migrations have not been applied to a Supabase project and are not production-certified.** Before applying them:
- Use a disposable test project and independently review every policy with anonymous and authenticated accounts.
- Run database tests for privilege escalation, profile privacy, friendship state transitions, and audit immutability.
- Implement secure server-side/RPC operations for role changes and moderation. The browser must never be allowed to assign its own roles or write audit records.
- Bootstrap the first main administrator only after verifying the exact account identity through a controlled procedure; no administrator identity is hard-coded.
- Configure authentication providers, email delivery, account recovery, privacy policy, and account deletion, then test each flow.
- Never place service-role keys, database passwords, or OAuth client secrets in frontend code or public repository files.

## Environment and security

Copy `.env.example` to a local `.env` only when needed. Browser variables such as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public configuration, not secrets. Exposing them is safe only when database permissions and RLS are configured correctly.

The static security check and TypeScript/build checks are useful safeguards, but they do not replace a professional security review or real database integration tests.

## Roadmap

1. Review the responsive site on mobile and desktop.
2. Configure a dedicated Supabase project and review/apply migrations only after tests.
3. Implement and test authentication, profile privacy, and account lifecycle.
4. Implement friendship state changes, verified content management, and a trustworthy server-status source.
5. Add permission-checked moderation, append-only audit records, and admin workflows.
6. Populate the catalogue only with reviewed sources, version compatibility, license details, and creator attribution.
7. Complete accessibility, privacy/legal review, and production checks before calling the site fully launched.

## License and affiliation

MineKage is an independent fan/community project and is not affiliated with Mojang or Microsoft. Minecraft names and trademarks belong to their respective owners. Verify licensing and attribution for every third-party project before listing or redistributing it.
