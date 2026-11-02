# DICEBOUND 4.0 Visual V2 — Quest 2: All That Glitters

**SAFE PATCH — existing V2 visual build only.** This adds *artwork and visual rendering* to all five existing Quest 2 rooms. The confirmed Quest 1 forest/clearing/Old Watchpost is left untouched. Do **not** deploy to DICEBOUND V1, your live `/dicebound/` game, or your author website. No changes to `src/`, `wrangler.toml`, Durable Objects, secrets or gameplay data.

## What's included

- New `public/v2-premium-mine.mjs` — V2-only renderer, lit mine floors, wall-attached timber/stone/crystals, dynamic Shiny D4/Shiny D6 and Boss D12 sprites, live name/HP overlays, side cave artwork.
- 17 new image assets under `public/assets/premium-mine/`: five different floor textures, five obstacle-prop types, five ordinary/Shiny/boss dice sprites and two cave-side frames.
- Updated `public/app.js` — integrates Quest 2 with existing cinematic HUD and player-controlled art/lighting/character switches, and preserves Quest 1.
- Updated `public/index.html` — cache-busted app.js version so a prior browser tab cannot keep the previous script.
- Four new-or-updated visual regression test files under `test/`.

Quest 2 rooms: **1 Abandoned Mine** (dim lanterns and timber); **2 Crystal Hollow** (cyan crystalline stone, Shiny D4); **3 Glittering Gallery** (gold/amber glints, Shiny D6); **4 Miners’ Vault** (heavier supports and mixed rock); **5 Crystal Heart** (purple crystals, Boss D12 and Shiny D6 guard). All wall geometry and encounters are read from the existing V2 server.

## Deployment — only to your existing V2 GitHub repository

1. Confirm that your last **working** V2 GitHub commit/deployment is backed up and is on Worker `dicebound-4-visual-v2`. The public V1 `/dicebound/` is a **different** project and must be left intact.
2. Extract this ZIP at the root of the V2 repo so that `public/app.js`, `public/index.html`, `public/v2-premium-mine.mjs`, `public/assets/premium-mine/` and `test/` match the ZIP paths. **Merge** into existing folders; do not delete other files or overwrite `src/`.
3. Commit and push through the **existing V2 deployment pipeline**. Check Cloudflare's successful deployment for this commit. This ZIP does not itself deploy or alter your Cloudflare account.
4. Open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`; sign in. Enter Quest 2 and use **Tactical** view, with scene art enabled. The setting should read `💎 Quest 2 mine premium: ON` once images load. The small V2 subtitle should include `QUEST 2 MINE ART`.
5. Visit every Quest 2 room. The mine should change progressively: amber timber → blue crystal → golden vein → vault support → violet Crystal Heart. Compare the Shiny D4, Shiny D6 and D12 boss to the actual server battle labels/HP, confirm walls are still correctly blocked and that actions remain usable.
6. Return to Quest 1 and confirm Old Watchpost mossy stone art and Boss D8 remain exactly as before. Also verify the HUD controls, login and tablet/touch layout.

## Technical QA

- **366/366 Node regression tests passed** after assembly (including V2 game tests, Quest 1 and Quest 2 renderer tests).
- `node --check` passes on both modified frontend modules.
- The preview sheet is a **composite concept rendering**, not a captured authenticated game screen; local Chromium network/file navigation was blocked in the execution environment, so an authenticated live-browser test and actual Cloudflare deployment have **not** been performed.
- The separate V1 difficulty-tier unlocking change remains in backlog; this package does not touch quest unlocking.
