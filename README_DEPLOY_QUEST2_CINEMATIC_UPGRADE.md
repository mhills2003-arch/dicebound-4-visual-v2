# DICEBOUND — Quest 2 cinematic mine-art upgrade (all five rooms)

This is a **visual-only patch** to the existing isolated **V2 visual beta**. It does not deploy automatically. It is *not* intended for your original `/dicebound/` live solo game, the Sonny Lanning author site, or any Cloudflare Worker other than the separately deployed V2 visual test build.

## Contents

- `public/v2-premium-mine.mjs`: illustrated mine floor, painted wall objects and per-room side scenery connected to the server's existing room layouts. Full 9 × 7 movement/attack grid remains live and readable.
- `public/assets/premium-mine/`: detailed floor images, wall/crystal/timber props, per-room left/right environmental frames and existing dice sprite assets.
- `public/app.js`: changes limited to the mine art import version, the visible V2 art build label, and selecting the correct per-room side scenery.
- `public/index.html`: refreshes the V2 application script cache stamp.
- `test/v2-quest2-mine-premium.test.mjs`: checks the original Quest 2 encounter specification, all art assets and room frames, rendering integration and absence of state-changing operations.

## Room treatments

1. **Abandoned Mine:** lantern-lit broken stone, old wooden mine supports, ore, pale crystals.
2. **Crystal Hollow:** cold blue-green mine floor and crystalline cave walls.
3. **Glittering Gallery:** gold-rich stone, amber lighting and mineral deposits.
4. **Miners' Vault:** old mining apparatus, structural timbers and weathered rock.
5. **Crystal Heart:** violet light, amethyst formations and darker enchanted stone.

Everything stays attached to existing server-authored room and wall coordinates. The patch does not change XP, combat, AI, movement, equipment, room connections, rewards or party networking. Visual-only actor sprites and dynamic HP/name labels are preserved from the earlier mine version.

## Installation — existing V2 GitHub repository ONLY

1. Back up the latest *known-working* V2 commit. Leave the separately hosted live original DICEBOUND `/dicebound/` and your author website untouched.
2. Extract this ZIP **at the root of the V2 repository**, merging its `public/` and `test/` directories with the existing directories. It replaces the previous simple Quest 2 art assets, the existing mine renderer, `public/app.js`, and `public/index.html`.
3. Do **not** delete unrelated repository files. Do **not** replace `src/`, `wrangler.toml`, Cloudflare bindings, secrets or server code.
4. Commit and push using your existing V2 deployment pipeline. Check that Cloudflare deploys the commit successfully to the **visual V2** Worker and route.
5. Reload the separate V2 visual site (`https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` if unchanged), sign in and play every Quest 2 room in Tactical view. Enable room art. The V2 build subtitle should include `QUEST 2 MINE CINEMATIC ART`.
6. Verify existing room walls/foes, movement and HP bars, portal arrows, search and bottom HUD. Confirm Quest 1 remains unchanged. If you see old art, hard-refresh or clear the tab's cache, not game data.

## Validation

- **367 / 367 Node tests pass** locally (`npm test`).
- `node --check` passed for `public/app.js` and `public/v2-premium-mine.mjs`.
- The supplied preview collage is an **illustrative composite built from the actual art assets and known wall data**. It does not include live combat actors and is not a real authenticated browser screenshot.
- **Deployment/live-game testing not performed**. You should check all five rooms before treating their visual finish as approved.

## Rollback

Revert this commit in the V2 repository and redeploy its previous working commit. Production V1 and the author website were not altered by this package.
