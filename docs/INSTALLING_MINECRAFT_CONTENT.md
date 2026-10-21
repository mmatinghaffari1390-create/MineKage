# MineKage — Minecraft content installation guide

This guide covers safe installation basics for the Java Edition. Individual projects may support only specific Minecraft versions, loaders, or platforms; always follow the project's official instructions.

## Before downloading
1. Select the exact Minecraft Java version you intend to play.
2. Read the project's supported versions, loader, dependencies, and release notes on its official project page.
3. Prefer the project's official page or a trusted platform such as Modrinth. Avoid re-upload sites, suspicious installers, and files that ask you to disable security protections.
4. Back up important worlds before changing mods or data packs.
5. Do not assume a file for one Minecraft version works on every version. Loader compatibility is not interchangeable.

## Mods
- Install a mod loader required by the mod (commonly Fabric, Forge, NeoForge, or Quilt).
- Install required libraries listed by the mod, such as Fabric API when the project requires it.
- Put the mod's `.jar` file and its required dependencies in the `mods` folder for the matching game profile.
- Launch that same loader profile. If the game crashes, remove the most recently added mod and check version/dependency requirements before trying again.
- Some mods are client-only; others must also be installed on the server. Follow the project notes.

## Shaders
- Install a shader-compatible setup supported by the Minecraft version and loader (for example, Iris on compatible Fabric setups, or another supported shader solution).
- Put the shader pack archive in the shaderpacks folder, usually without extracting it unless the project's instructions say otherwise.
- Enable it from the game's Video Settings / Shader Packs menu. Shader performance depends on the GPU, settings, and pack; start with moderate settings.

## Resource packs
- Keep the resource pack in its original ZIP format unless the project says otherwise.
- Open Options → Resource Packs → Open Pack Folder, place the ZIP there, then enable it in the game.
- Check the pack's target Minecraft version and resolution. Some packs require OptiFine, Continuity, Entity Model Features, or other specific support; do not assume those dependencies are universal.

## Modpacks
- Use the pack's official launcher/import instructions. Modpacks may pin exact game, loader, and mod versions.
- Avoid adding extra mods until the pack launches successfully; conflicting dependencies can prevent startup.
- Back up saves before updating a pack.

## Data packs
- Check the target game version and whether the pack is intended for a new or existing world.
- For an existing world, back it up first. Follow the author's install steps; many data packs go in the world's `datapacks` folder.
- Use `/reload` only when appropriate and check the pack's documentation for required world settings or commands.

## Maps and worlds
- Download from the author's official project page and scan files with your device's security tools.
- For Java single-player worlds, extract the world folder if needed and place it in the `saves` folder. The folder should contain the world's level data (commonly `level.dat`).
- Do not overwrite an existing save; rename or back it up first.

## Server plugins
- Plugins are server-side and are not ordinary client mods. Confirm the server software and Minecraft version (for example, Paper compatibility) before installing.
- Only server administrators should install plugins. Back up the server and review permissions, dependencies, and the plugin's source before use.
- Never upload unknown plugin JARs to a server you do not control.

## Launchers and mobile
- Launcher workflows differ. On Android Java launchers such as PojavLauncher, support depends on the specific Minecraft version, renderer, loader, device, and mod. Check the launcher's documentation and the project's compatibility notes; a Java mod is not automatically compatible with Bedrock or every Android setup.

## Troubleshooting checklist
- Confirm Minecraft version, loader version, and mod version match.
- Install all required dependencies and remove duplicate/conflicting versions.
- Read the crash report before changing multiple things at once.
- Test with one new mod at a time and keep backups of worlds.
- If an item is not listed for your exact version, do not treat it as compatible merely because it appears in MineKage's catalogue.

## Catalogue accuracy
MineKage links to original project pages and may display provider metadata. That metadata can change. The official project's release page remains the source of truth for current compatibility, dependencies, permissions, and installation steps.
