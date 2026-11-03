# DICEBOUND 4.0 V2 — Quest 2 premium enemy-sprite finish

## Scope
A **small visual-only delta** on top of the already prepared and tested `DICEBOUND_V2_QUEST2_CINEMATIC_FIVE_ROOM_ART_PATCH.zip` (the cinematic five-room mine artwork). It replaces the five placeholder mine dice with illustrated stone-and-crystal creature art of matching polish to Quest 1:

* Ordinary D4 — a faceted stone creature with claws, crystal spines and a clear numeral.
* Ordinary D6 — a carved ore guardian with eyes, crystal outcrops and a clear numeral.
* Shiny D4/D6 — bright cyan crystal treatment, sparkles and glow.
* Boss D12 — larger stone-and-amethyst guardian bearing the number 12.

All five remain transparent PNGs, with dynamic enemy labels, health bars, and combat overlays drawn by the game, not baked into the art. Their positioning, sizes, variant assignments, hit points, AI, and collision logic remain authoritative and unmodified. The old cropping logic is removed so the crystal crowns and creature feet remain visible.

## Deployment to existing **isolated V2** GitHub repo

1. Make sure the previous `DICEBOUND_V2_QUEST2_CINEMATIC_FIVE_ROOM_ART_PATCH.zip` has already been committed to the **V2** repository. Do not apply this patch against the older flat-art version, since it intentionally contains only changed files.
2. Back up/record the current working V2 commit. Extract this ZIP at the root of the V2 repository, merging `public/` and `test/` folders. Replace the included files; keep every other file and all `src/`, Cloudflare bindings, accounts and saves unchanged.
3. Commit and push to the existing V2 deployment pipeline. The version marker is `v2-quest2-mine-creatures-20261102-r3`. If Cloudflare reports asset-upload session error 10013, that is a deployment failure; retry rather than assuming the new assets are live.
4. Sign in at `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`, hard-refresh **without deleting game data**, then view Quest 2 rooms 1–5. Check normal D4/D6, Shiny D4/D6, and the D12 boss. Check HP labels and all movement/attack controls. Confirm Quest 1 unchanged.

## Local verification

* 369 / 369 Node tests pass (`npm test`).
* JavaScript syntax check passes on changed JS files.
* All five upgraded sprites are 420 × 420 RGBA PNG assets, with transparent backgrounds and detailed illustrated creatures.
* The preview is a **local composite using actual game scenery and sprite PNGs**, not a logged-in live browser screenshot.

## Rollback
Revert only this sprite-update commit and redeploy the previous V2 commit. No production V1 `/dicebound/` files, author site, or server gameplay code are included.
