# DICEBOUND 4.0 V2 — Quest 1 Room 1-2: Training Clearing premium encounter

**Scope:** V2 Worker `dicebound-4-visual-v2` only. The real 1-2 Training Clearing is upgraded in Tactical view. Room 1-1 Woodland Path keeps its approved premium scene. Room 1-3 (Old Watchpost), later quests, V1, author site, and game engine are unchanged.

## Changes

- **Room scenery first:** a distinct illustrated `training-clearing-ground.jpg` derived from the approved premium forest artwork, retaining the same painterly quality while varying its composition. The official server-supplied `ROOM_WALLS.clearing` determines **all 1-2 rocks and tree obstacles**, not any scenery baked into the background.
- Carry across the sunlight, cast shadows, ambient light, foreground foliage, drifting leaves, and existing ON/OFF comparisons.
- **First combat encounter:** use in-world original figure assets rather than framed cards, at a more legible size. The two official enemies are D6s, and a dedicated D6 sprite adaptation replaces the previous D8-face depiction in this room only. The separate renderer draws live D6 labels and HP gauges. Selection/active rings and movement remain grounded in canonical tile coordinates.
- This is still **only an art layer**. It cannot change the game state, blocked tiles, targeting rules, loot, turns, party names or HP values.
- Visible client build label: `QUEST 1-2 TRAINING CLEARING PREMIUM COMBAT`.

## How to deploy

1. In the V2 repository **only**, extract the ZIP with folder structure preserved and overwrite the matching `public`/`test` files. Add both new artwork files in `public/assets/premium-woodland/`.
2. Commit and verify the `dicebound-4-visual-v2` Cloudflare build succeeds.
3. Open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`. Sign in, enter Quest 1 Room 1-2 **Training Clearing** in **Tactical view**.
4. Check `Premium woodland art: ON` / `Training Clearing premium: ON`, `Sunlight: ON`, `Foreground: ON`, `Characters: IN WORLD` near the top of the game. These controls remain reversible.
5. If the old room is shown, confirm that the current visible build text includes `QUEST 1-2 TRAINING CLEARING PREMIUM COMBAT`, then force refresh. You may need a fresh/uncompleted adventure if a completed quest cannot currently be replayed in your session.

## Testing and limitations

- Clean-run `npm test` completed with **329/329 passed**, including 4 new assertions about 1-2's official D6 encounters, authoritative geometry, illustrated art assets and non-mutation of game state.
- Self-contained Chromium Canvas preview completed with no JavaScript errors at 720×550, rendered using the same exported in-game scenery and actor functions, and representative canonical 1-2 walls and encounter positions. It is **not** an authenticated multiplayer test.
- Tablet rendering/performance and live game quality still require the user's real play-test before any wider Quest 1 rollout.
- Existing UI and server code hashes have not been changed apart from `public/app.js`, the renderer module, tests, and the two new artwork assets.
