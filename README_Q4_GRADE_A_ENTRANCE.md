# DICEBOUND V2 — Quest 4: Grade A Quarry Entrance (playable art patch)

## What to deploy

This ZIP is a **complete, merge-safe V2 repository snapshot** built on the R1 Quarry V2 source; it includes `src`, `public`, `test`, `package.json`, and `wrangler.toml`. It is **not** a standalone drag-and-drop website and **must not** go to the original `sonny-lanning` author Worker. Extract into your *separate* V2 GitHub repository, replacing matching files, and commit/push. Cloudflare should run `npx wrangler deploy` for Worker `dicebound-4-visual-v2`.

Before merging, save a copy of your GitHub repo. Never delete files that only exist in your current repository.

## What changed

- Quest 4 **Quarry Entrance only** uses a single premium painted **1152 × 896** static scene; no player/enemy labels/HUD are baked in.
- The scene includes naturally illuminated rockworks, timber mining machinery, cart, gold deposits and terrain, with a live grid and live creatures layered above.
- **Important gameplay/layout adjustment:** The static wall layout of **Q4 Room 1 only** has been reauthored to correspond to the fuller illustrated stone formations. That changes paths in Quarry Entrance; it **does not** change other room layouts, quest unlocks, enemies, combat, rewards, saves, or the level display. This prioritizes the polished cohesive artwork the user requested rather than trying to crop it into the earlier six-square layout.
- The new scene is only used when the connected live wall map exactly matches the image blueprint; if loading or collision differs, the former layered renderer is used instead, with safe per-cell wall fallback.
- An updated module cache key prevents loading the earlier prototype.

## Quick check

1. GitHub → commit and push this V2 change, then verify Cloudflare deployment status is **Success**.
2. Open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` and hard-refresh once (Ctrl+Shift+R).
3. Start/replay Quest 4 / Quarry Entrance and check the wall/movement match, both routes to the EAST exit, and the D6 fight.
4. The direct scene asset is `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/assets/premium-quarry/quarry-entrance-cinematic-scene-q4-grade-a-r2.jpg`.

## Validation limitations

Automated Node tests pass, including collision-map parity and east-exit reachability. The preview is a local composite: **not a logged-in Cloudflare gameplay screenshot**. This is a visual review candidate, not final sign-off. Quest 4 Rooms 2–5 still use the prior R1 quarry art; only Room 1 is being tested at the higher standard.
