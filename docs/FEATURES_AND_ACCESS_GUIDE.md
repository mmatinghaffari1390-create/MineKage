# MineKage — Feature and Access Guide

This document describes what the public website does today, how to use it, and what still requires setup. It deliberately distinguishes working frontend features from planned backend features.

## Open the website

- Public website: https://mmatinghaffari1390-create.github.io/MineKage/
- Source code and releases: https://github.com/mmatinghaffari1390-create/MineKage
- Build/deploy status: https://github.com/mmatinghaffari1390-create/MineKage/actions

## Current public features

### Bilingual interface
- English and Persian language switch.
- Persian uses right-to-left layout.
- Responsive layout for desktop, tablet, and mobile.
- Keyboard focus indicators and reduced-motion styling.

### Discovery catalogue
- Search by project name, description, or category.
- Categories: mods, shaders, resource packs, modpacks, data packs, maps/worlds, and server plugins.
- Featured projects link to their official project pages.
- Live results are requested from the public Modrinth API.
- Results can be filtered by Minecraft Java release version. The version selector attempts to load the complete release list from Modrinth; a short fallback list is used if that endpoint is unavailable.
- When the **Mods** category is selected, an additional loader filter is available for Fabric, Forge, NeoForge, and Quilt. This filter uses Modrinth category metadata, so always confirm the exact supported loader on the creator's project page.
- Results display project title, author, description, icon when provided, project type, and download count returned by the API.
- A loading state, empty state, and API error state are shown. If live results fail, use the official catalogue link.

### Servers
- The site explains server play styles such as survival, creative, and minigames.
- These cards are examples, not a verified directory. Server addresses, player counts, and live online status are not invented.
- A trusted status provider and reviewed server submissions are required before real listings can be advertised.

### Community, streams, and leaderboard
- The public layout previews community profiles and leaderboard features; these still require a verified backend data source.
- The Live / Creators panel now links to YouTube's live browsing page so visitors can discover Minecraft broadcasts without the site pretending to host or verify them.
- This is a general YouTube discovery link, not a curated or verified MineKage stream feed. An official channel or trusted stream source must be configured before the site can show verified creator listings.
- No fake creator streams, player profiles, achievements, scores, or online counts are displayed.
- Actual accounts, profiles, friendships, moderation, and leaderboard data require the backend setup described below.

## How to use the mod catalogue safely

1. Open the website and scroll to **Explore**.
2. Choose a category, search term, and Java version.
3. Open the project’s official page.
4. Confirm the exact Minecraft version and mod loader listed by the creator.
5. Read dependencies, required libraries, installation notes, changelog, and license.
6. Download only from the official project page or the author’s explicitly linked source.
7. Back up worlds before adding or updating mods; test large mod changes in a separate instance first.

### Compatibility basics
- **Fabric / Quilt:** use builds explicitly marked for that loader; many Fabric mods require Fabric API.
- **Forge:** download the Forge build, not a Fabric or NeoForge build.
- **NeoForge:** use a NeoForge-specific file when the author distinguishes it from Forge.
- **Shaders:** require a compatible shader loader and graphics hardware. The shader pack itself is not usually installed like a normal mod.
- **Resource packs:** check pack format, game version, resolution, and whether extra entity/model mods are required.
- **Data packs:** usually belong in a world's `datapacks` folder and may require a compatible game version.
- **Server plugins:** are server-side and must match the server software/version; they are not client mods.
- **Modpacks:** follow the pack author's installation method and do not mix unrelated loaders or mod versions.

A version filter only finds projects that declare that version in their Modrinth metadata. It is not a guarantee that every dependency, shader, resource pack, or combination will work on every computer.

## Backend and administrator access

The repository contains initial Supabase migration files, but they have **not** been applied to a live Supabase project. Consequently:
- Sign-up, sign-in, email verification, password recovery, profile editing, friendships, and account deletion are not active.
- Admin roles, moderation actions, audit logs, verified server submissions, and editable catalogue administration are not active in production.
- Permission-checked admin RPC migrations and a first-admin bootstrap guide now exist in the repository, but they are still un-applied and unverified against a live project. The latest local-database CI run must finish successfully before treating the migrations as validated.
- A static GitHub Pages frontend cannot safely store privileged database credentials or perform privileged moderation by itself.

To activate these features:
1. Create a dedicated Supabase project.
2. Review all migrations and run them first in a disposable test project.
3. Test row-level security with anonymous users, regular members, admins, and the main administrator.
4. Review and test the included permission-checked admin RPC migrations in a disposable project; do not expose privileged operations directly to the browser.
5. Configure email verification and account recovery, privacy/legal text, and account deletion.
6. Store privileged secrets only in the provider's secret settings; never commit them to GitHub or expose them in `VITE_*` frontend variables.
7. Configure a controlled first-admin bootstrap process, then test every role and audit path before public launch.

Do not grant admin rights based on a username submitted by a user. The browser must not be able to assign its own roles or forge audit events.

## Content and licensing policy
- Prefer official creator pages and APIs.
- Preserve creator attribution and license information.
- Do not re-host project files unless the project's license explicitly permits it.
- Do not claim compatibility, download counts, reviews, server status, or popularity unless a trustworthy source provides that information.
- Keep an obvious fallback when an external service is unavailable.

## Release checklist
- [ ] Check the latest GitHub Actions build and deployment.
- [ ] Open the live site on a phone and desktop.
- [ ] Test category, search, version filter, empty results, and external links.
- [ ] Confirm API errors are handled without breaking the page.
- [ ] Review accessibility, privacy, terms, licensing, and creator attribution.
- [ ] Complete backend security tests before activating account/admin features.
