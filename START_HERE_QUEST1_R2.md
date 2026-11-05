# DICEBOUND V2 — Quest 1 woodland polish R2

This is the complete V2 deployment package, with the new artwork integrated into all three playable Quest 1 rooms. It is based on DICEBOUND_V2_QUEST4_ROOMS_2_TO_5_PREMIUM_PLAYABLE_R3.zip.

## Deploy

1. Use your existing, separate DICEBOUND V2 GitHub repository connected to the Cloudflare Worker `dicebound-4-visual-v2`.
2. Extract this ZIP and merge its contents into that repository, replacing matching files. The ZIP contains the project files at its root; do not introduce another enclosing folder. Preserve any repository-specific files and settings.
3. Commit and push the changes. Wait for the connected Cloudflare build/deployment to succeed.
4. Hard-refresh the V2 game and visit Quest 1: Woodland Path, Training Clearing and Old Watchpost. The client build identifier includes `QUEST 1 WOODLAND COHESION R2`; the app URL contains `build=v2-quest1-cohesion-20261105-r2`.

The Worker name, routes, authentication, Durable Object binding and migrations are unchanged. This package belongs in V2, not the author website or the V1 repository. Existing V2 secrets/settings remain in Cloudflare. No game reset is required for the art change.

## What changes in gameplay view

- Three new continuous woodland floor paintings: a winding trail, a warm training clearing, and an overgrown paved watchpost courtyard.
- New mossy boulder and oak-stump scenery, placed from the existing wall coordinates.
- Connected watchpost ruins: three vertical sections and one corner, clipped to the real blocked squares. The open square inside the corner stays open.
- Clean transparent D6 and D8 guardian artwork, with live labels and HP drawn separately.
- Consistent hero scale, lighting and presentation across the three rooms.
- A subtle grid and exact obstruction boundaries for tactical precision.
- Bounded caching of static scenery and light layers. Actors and foreground motion stay live. Older browsers without OffscreenCanvas use the direct drawing fallback.

The original floor and obstacle assets remain available as loading fallbacks. New runtime assets use versioned WebP filenames, with alpha retained for sprites.

## Preserved

All files under `src/` and `wrangler.toml` are byte-identical to the base package. Quest 1's maps, enemy positions/statistics, rewards, movement, combat and save rules are unchanged. The Quest 2–4 renderers and assets are unchanged. This release adds no multiplayer, quest or balance features.

## Validation

- 404 automated checks passed, including the existing 400 checks updated for the new asset/build identities and four additional checks for wall coverage, connected rendering, missing-asset fallback and cache invalidation.
- The new terrain and scenery were inspected in the actual application renderer locally, including the watchpost with its new guardian.
- No live Cloudflare deployment or authenticated multiplayer session was performed from this workspace. Review the deployed gameplay as the final visual acceptance step.

`DICEBOUND_Q1_Room_Review.html` is supplied separately as an optional self-contained visual comparison. It uses the actual Quest 1 renderer and the game's original starting positions. It is a visual review, not the deployment or a multiplayer game.
