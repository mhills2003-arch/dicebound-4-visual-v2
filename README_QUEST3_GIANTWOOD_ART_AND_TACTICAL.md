# DICEBOUND V2 — Quest 3: A Big Deal
## Five premium giantwood rooms, authentic 2×2 creatures, tactical walls, and visible current level

**Source baseline:** V2 Quest 2 cache-safe R4, as packaged 3 November 2026.  
**Scope:** Quest 3 visual and layout update for the separate V2 GitHub/Cloudflare development game only.  
**Not a production deployment.** This ZIP is a repository overlay that must be committed and successfully deployed before the new art appears.

### Files in this overlay
- `public/assets/premium-giantwood/*`: 27 artwork files including five grounds, ten side frames, four obstacle textures, and eight creature images (D4, Shiny D4, D6, Shiny D6, Large D4, Large D6, Large D8, Boss D12). All creatures have transparent backgrounds. Asset URLs are unique to Q3 to bypass old asset caches.
- `public/v2-premium-giantwood.mjs`: separate, visual-only renderer for Q3 floors, lighting, walls, layered units, HP bars, per-room borders and atmosphere.
- `public/app.js`: integrate Quest 3 art without changing Quest 1 or Quest 2 render modules.
- `public/index.html`, `public/styles.css`: prominent `LEVEL N` beside XP and HP, updating from live player state and responsive at tablet widths.
- `src/level-designs.mjs`: denser, unique 9×7 obstacle layouts for Q3; actual server-owned wall coordinates, not cosmetic fake walls. Both one-tile player paths and two-tile Large-enemy routes were checked.
- `test/*`: new Q3 tests plus updated existing renderer tests to account for the third premium renderer.

### Correct existing quest names and encounters
Existing game catalogue names and enemy rules are **preserved**:
1. Trampled Trail — normal D4.
2. Giant’s Clearing — Large D4, real 2×2 footprint.
3. Root Maze — Large D6, real 2×2 footprint.
4. Hollow Tree — Large D8 plus normal D4.
5. Elder Grove — Boss D12 plus Large D6.

The preliminary art concepts were titled differently. This build keeps the actual source-of-truth game names, enemies and rewards. Their scenic identities mirror the approved visual themes.

### Deployment steps
1. **Back up the current V2 repository and its existing Cloudflare deployment.** Do not modify the original `/dicebound/` solo Worker or the author website.
2. Open your existing **V2 GitHub repository** (the one powering `/dicebound-v2/`). Extract this ZIP at its root, allowing the included `public`, `src` and `test` paths to merge, replacing their matching files.
3. Commit/push. Let the existing Cloudflare workflow run `npx wrangler deploy`.
4. In Cloudflare, check that the latest deployment shows **Success**. A previously failed deployment may leave old graphics live.
5. Log into the V2 game, enter Quest 3, check each room (including Large enemies and the Elder Grove boss), and check `LEVEL N` next to XP. Use Ctrl+Shift+R if the browser is reusing old HTML/JS.
6. Do not reset or erase game saves just to force updated graphics.

### Important saved-game caveat
Quest 3's **actual server wall map** has changed, rather than just its appearance. A character already parked in one of the newly blocked squares in an existing Q3 adventure could need to move, return to camp, or be migrated. Back up the V2 game state and test existing character resumes before widespread use. This patch does **not** implement a saved-session migration.

### Tests and review
- `node --test test/*.test.mjs`: 376/376 passed in the local reconstructed source baseline.
- Tested canonical Q3 encounter types, static asset existence, 9×7 bounds, player path reachability, Large-enemy reachability and spawning, and level display binding.
- The separate rendered **preview composite** is a local artwork/layout approximation using these assets; it is **not** a signed-in gameplay screenshot.
- Live browser behaviour and Cloudflare deployment still require your inspection.

### Deferred gameplay work (NOT part of this patch)
- Stale connected Player 2 / inactive presence.
- Mandatory all-player consent for solo quest replay, switching or leaving co-op.
These remain post-Q3 corrections, and are intentionally excluded to avoid changing multiplayer rules during visual development.
