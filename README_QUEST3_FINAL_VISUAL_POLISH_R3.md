# DICEBOUND V2 — Quest 3 Final Visual Polish R3

**Incremental patch for the existing, working V2 Quest 3 R2 repository.** Do not upload this archive directly as a standalone Cloudflare website. Merge the packaged `public/` and `test/` paths into the root of your existing V2 GitHub project and commit the changes.

## Changes

1. **Hollow Tree and other multi-tile barriers**: contiguous server-approved wall squares are grouped into one coherent scenic object. Larger formations use a single mossy outcrop and/or a whole fallen tree, rather than stamping the same little masonry graphic ten times. Artwork is bounded to the real blocked cells with slight decorative overhang. **No server map, route, spawn, quest or collision coordinates are changed.**
2. **Elder Grove Boss D12**: replaced the shallow cropped banner sprite with a fuller transparent-background antlered/root-bodied guardian, larger visually but **still a 1×1 gameplay entity**. It retains the existing live HP bar, selection and nameplate rendering.
3. **Large D4 / D6 / D8**: preserve previously approved premium creatures and keep the intrusive 2×2 square highlights hidden when premium art is active. Their real 2×2 collision rules are unchanged.
4. **Versioning**: a new R3 script import, HTML cache token and new asset filenames help prevent stale old assets from being reused.
5. **Quest 1 and Quest 2 remain untouched**, as do the current-level display, inventory, economy, class rules, multiplayer state and rewards.

**Future larger-grid design rule:** Large enemies should face meaningful alternative routes and have player-only refuge spaces. This is deliberately *not* a layout rewrite: Quest 3 is still on its restricted 9×7 grid, and changing walls mid-adventure would invalidate a player's existing position or saves. The lesson is recorded for Quest 4 onwards as grids grow.

## Apply

1. Back up your current V2 GitHub repository. Existing character/adventure saves should not need resetting because no gameplay state or collision geometry changes.
2. Extract the ZIP to the V2 repository root, merging `public/` and `test/`, including the new `public/assets/premium-giantwood/*-q3r3.png` files.
3. Commit and push. In the Cloudflare deployment dashboard confirm the new deployment says **Success** (if the previous `assets-upload-session` error reoccurs, a failed build does not publish the patch).
4. Open the separate V2 game at `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`. Hard refresh (`Ctrl+Shift+R`) and enter Quest 3. In Hollow Tree check the larger coherent obstruction; in Elder Grove check that the D12 boss is a complete, imposing creature. Confirm all character levels, HP bars and Large enemy mechanics remain correct.
5. No changes are made to `sonnylanning.com`, its original author Worker, or the original single-player `/dicebound/` route.

## QA scope

`node --test test/*.test.mjs` — **379 automated tests passed locally**. The new tests validate connected-group partitioning against all five actual `ROOM_WALLS` sets, original enemy spawns, quest routes, unchanged 2×2 Large rules, 1×1 Boss D12 rules, the current-level HUD, and asset references. This does not replace visual verification in a real signed-in browser after a successful Cloudflare deployment.

The separate local contact sheet `DICEBOUND_Q3_R3_FIVE_ROOM_VISUAL_REVIEW.jpg` is a composited art preview, not a game screenshot.
