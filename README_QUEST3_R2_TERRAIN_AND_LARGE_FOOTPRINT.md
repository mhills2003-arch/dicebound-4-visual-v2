# DICEBOUND V2 — Quest 3 R2 (floor, real-wall scenery, and Large footprint)

**Install on top of the already working Quest 3 R1 V2 repository.** This is an incremental visual patch, not the whole game.

## What changed

- Quest 3's five illustrated 9x7 forest-floor images have denser painted leaf/soil textures. Decorative details do not introduce collision.
- All five room palettes retain the original room-dependent lighting and side illustrations.
- Connected real wall squares now paint linked moss-covered masonry and fallen timber; isolated real walls use a painted boulder or bush. These decorations follow the authoritative `state.roomWalls` array; no fake blocked cells are drawn.
- The Large D4 and Large D6 sprite cutouts are also cleaned to remove rectangular atlas-background edges.
- Premium Large enemy artwork no longer has four separate highlighted squares underneath. Its 2x2 collision, movement, HP, attacks, targeting and selection remain unchanged. The creature/contact shadow conveys its scale.
- Cached imports are bumped to Quest 3 R2 to prevent old asset/module reuse.
- Existing Quest 1/2 layouts, creatures, the HUD level display, quests, rewards and multiplayer rules are preserved.

## Deploy via the existing V2 GitHub / Cloudflare setup

1. Back up the existing repository and game state first, particularly because this V2 app stores player progress.
2. Unzip into the **root** of the existing V2 GitHub repository, merging only the `public` and `test` folders. Retain the directory paths.
3. Commit and push the updated files. Verify Cloudflare shows **Success** for the new deployment (a failed asset upload is not a successful deployment).
4. Open the separate V2 game and hard-refresh (Ctrl+Shift+R on desktop). Check Quest 3 rooms 1-5 and a Large enemy, especially that the 2x2 gold/red footprint highlights are gone.
5. The game is not automatically deployed from this patch. Do not overwrite the separate live author site or original solo DICEBOUND route.

## Local test status

377/377 automated tests passed including Quest 3 navigation, Large collision checks, asset loading references, and level display. This verifies source-level contracts; a real signed-in browser gameplay check remains necessary before visual sign-off.
