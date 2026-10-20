# MineKage

**MineKage — Cinematic Minecraft Community Website**

A bilingual, responsive React + TypeScript + Vite frontend for discovering Minecraft servers, mods, worlds, creators, and community members.

## Current status

The `build/minekage-foundation` branch contains the first frontend foundation:
- Cinematic dark violet / cyan visual system with an original CSS crystal/portal illustration.
- English and Persian language toggle, including RTL layout.
- Responsive navigation and mobile menu.
- Search and category filtering for discovery cards.
- Server-category cards with honest “status provider not connected” messaging.
- Explicit placeholders for account, live stream, and leaderboard features that need trusted services or data.
- Reduced-motion support and keyboard focus styles.

**Not yet implemented:** real authentication, database, server status integration, real content catalogue, friendships, moderation backend, admin operations, and deployment. Placeholder cards are not verified recommendations or live information.

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Check types and production build:

```bash
npm run typecheck
npm run build
npm run preview
```

## Environment and security

1. Copy `.env.example` to a local `.env` file only when needed.
2. Browser environment variables must never contain service-role keys, database passwords, OAuth client secrets, or other privileged secrets.
3. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public browser configuration values only; configure strict Supabase Row Level Security (RLS) before exposing user data.
4. Admin and moderation privileges must be enforced on the server/database, not only by hiding UI controls.
5. Never put secrets in commits, issue descriptions, screenshots, or client-side code.
6. OAuth, email delivery, privacy policy, and account deletion flows require explicit configuration and testing before launch.

## Suggested next implementation stages

1. Install dependencies and run typecheck/build.
2. Review this UI and accessibility on mobile and desktop.
3. Add Supabase schema and RLS policies, reviewed separately before applying to any live project.
4. Implement authentication and account lifecycle.
5. Implement friendships, curated content management, and reliable server status provider.
6. Add permission-checked moderation and append-only audit trail.
7. Add tests, privacy/legal content, and deployment workflow.
8. Deploy only after explicit release approval and successful checks.

## License and affiliation

MineKage is an independent fan/community project and is not affiliated with Mojang or Microsoft. Minecraft names and trademarks belong to their respective owners. Verify licensing and attribution for every third-party mod, map, shader, and resource pack before listing it.
