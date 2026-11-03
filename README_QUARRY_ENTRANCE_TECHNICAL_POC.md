# DICEBOUND V2 — Quarry Entrance complete-scene rendering proof of concept

**Status: engineering proof only. NOT approved Grade A artwork. Do not deploy as final Quest 4 art.**

This experiment uses one precomposited high-resolution battlefield image instead of separately repainting each fixed obstacle square. It is deliberately scoped to Quest 4 Room 1 (Quarry Entrance).

## Technical result

- Keeps the actual server-owned 9-column × 7-row wall map unchanged. Only two distinct blocked 2×2 clusters are permitted.
- When the map matches exactly and the scene image loaded, the floor and static obstacles are painted from the one image. No second obstacle image is drawn over it.
- If the image is not available, or server wall coordinates do not match, existing layered drawing is used as a fallback.
- Characters, enemies, HP bars, UI, movement and combat continue to draw and function independently.
- Existing Quest 1–3 and the other four Quest 4 rooms remain unchanged.
- 396 of 396 automated regression tests passed locally.
- A standalone canvas test successfully rendered the new battlefield scene using the same exported functions, but live authenticated gameplay was not checked.

## Visual quality result

The architecture proof works; the composited artwork itself is **not** the approved quality. It still relies on relatively flat Quest 4 R1 source textures and older 2×2 rocks/carts. Creating a genuinely Grade A single room will require a clean, bespoke 9×7 illustrated source plate with the exact two blocked formations and no baked characters/UI. No deployment or visual sign-off is recommended.

## Files

- `public/assets/premium-quarry/quarry-entrance-complete-battlefield-q4poc-r2.jpg` — experimental single scene image.
- `public/v2-premium-quarry.mjs` — conditional single-scene rendering.
- `public/app.js` — passes authoritative walls into floor rendering.
- `public/quarry-entrance-poc.html` — isolated canvas preview to use only on a local server.
- `test/v2-quest4-quarry-premium.test.mjs` — updated tests.

For formal release, replace experimental artwork with final high-resolution ground-and-geometry painting, render a full game session, and re-test. Preserve prior production build until visual approval.
