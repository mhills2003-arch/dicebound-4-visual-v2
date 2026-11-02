# DICEBOUND 4.0 V2 — Smuggler’s Station: working visual renderer slice

**Release 2026-11-02. Deployment target: `sonny-dicebound-visual-v2` only.**

## What changed

1. `public/v2-room-art.mjs` adds deterministic stone floor variation, scuffed mortar, masonry lighting, wall-anchored banners/braziers/crates, a worn floor seal and subtle atmosphere. No generated poster is used as the board.
2. `public/app.js` applies the art layer **only to room `q5r7`**, in both the current tactical and illustrated views, and adds a client-only ON/OFF comparison preference.
3. `public/v2-art-preview.html` and `public/v2-art-preview.mjs` provide a read-only visual comparison before your test character reaches Quest 5.
4. `public/index.html` and `public/styles.css` add the Art Lab link and compare button.
5. `test/v2-room-art.test.mjs` adds rendering isolation and invariants checks.

## What did not change

- All `src/` modules are identical to the last V2 starter (no combat, inventory, classes, quests, Maze, save or economy changes).
- Walls, pathfinding, enemy locations, D6 movement, turn order, targeting, room IDs and checkpoints are still server-authored.
- No art-only object blocks a tile, offers fake loot, changes the game state or overrides hazards.
- V1 game and author website are unchanged by this package.

## Deployment

Upload the *extracted root contents* of this ZIP to your existing private `dicebound-4-visual-v2` GitHub repository, never to `dicebound-4`. Keep the exact `wrangler.toml`, secrets, and Worker name. Use the existing build command (optional `npm run build`), deploy command `npx wrangler deploy`, and the separate V2 Worker. Leave V1 untouched.

After the V2 Worker deploys, sign in to `/dicebound-v2/`. Select **Art Lab** in the game header. The gallery shows the same custom-art functions being used by the V2 playable room, with a static room-grid example. When you reach Quest 5 Room 7, use **V2 art: ON/OFF** to compare the *real playable* rendering without losing turns or changing any gameplay variables.

## Verification

- `npm run build`: 302 / 302 tests pass locally, including all prior 296.
- `node --check public/app.js`, `node --check public/v2-room-art.mjs`, and `node --check public/v2-art-preview.mjs` succeed.
- New visual-only tests check that only `q5r7` receives scenery, wall maps are not mutated, non-preview rooms do not invoke the artwork, and Art Lab has no game API calls.
- A real Cloudflare V2 deployment and multi-device interactive visual validation have **not** been carried out by the assistant. Test legibility and performance on a real tablet before any rollout beyond the first room.

Rollback: revert this commit within the **V2 repository only**. Do not change the V1 Worker or its game data.
