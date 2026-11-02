# DICEBOUND 4.0 V2 — Woodland Path art pilot

## Purpose
The first visual test is now **Quest 1, Room 1: Woodland Path**. It is playable from a new V2 account, without unlocking Quest 5 or visiting the separate Art Lab. This fixes the earlier practical testing issue without changing game mechanics.

## Installation — V2 repository ONLY
Extract this ZIP and upload its matching paths to the existing **dicebound-4-visual-v2** GitHub repository:

- `public/v2-room-art.mjs` — forest floor, real-wall moss/trees/rocks, atmospheric lighting, original Smuggler's Station art retained.
- `public/app.js` — activate forest art only in `woodland`; leave every original room movement/turn/combat rule intact.
- `public/index.html` — clearly identify the visual test in the header.
- `test/v2-room-art.test.mjs` — art regression tests.

Do not replace your Wrangler configuration, `src/` files, secret values, or Durable Object bindings. Do not upload to the original V1 repository. The changes are purely client-side drawings and test assertions.

## Testing
1. Wait until everyone has left the V2 game, then commit the four updated files.
2. Confirm the new V2 Cloudflare build succeeds.
3. Open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` and sign in.
4. Enter **Quest 1 — A Roll in the Woods**, Room 1 **Woodland Path** (already available).
5. Use **🌿 Forest art: ON / OFF** to compare directly in the actual game board. Try both Tactical and Illustrated views, with and without a second player.
6. Do not rely on the older Art Lab: it was prepared for Quest 5 and is not needed for this trial.

## Safety and limitations
- Grid remains **9×7**. All wall coordinates, exits, movement/targeting, enemies, loot, progression and server code are unchanged.
- Decoration is deterministic and anchored to the server's true wall cells. No added trees/rocks are interactable; they don't create or conceal obstacles.
- The visual renderer is experimental and intentionally limited to Woodland Path (and the existing Quest 5 Smuggler's Station pilot). Other rooms retain their original rendering.
- Local tests do **not** replace on-device visual judgement and live multiplayer testing. This is a first forest-theme prototype, not a promised final cinematic style.

## Verification
Verified against the latest local V2 source containing the previous HTTP-404 route fix. **306/306 automated tests pass**, including the original multiplayer suite and new Woodland renderer tests. A headless browser successfully drew the real V2 floor/dressing/light code without JavaScript errors. Server files remain byte-for-byte unchanged.
