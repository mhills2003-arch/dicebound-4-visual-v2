# DICEBOUND 4.0 V2 — Quest 1 Premium Woodland Prototype

**Scope:** The FIRST room of Quest 1 (Woodland Path), default tactical view only.
**Status:** Visual quality-gate candidate. Do not treat as an approved rollout or a finished 7–8/10 graphical treatment.
**V1:** Untouched. **V2 backend:** Untouched. **Character saves:** Untouched.

## Where to upload

This is an **incremental V2-only** GitHub patch. It contains no `src/`, no `wrangler.toml`, no secrets and no game-engine rules. Preserve the directory structure and replace/add:

- `public/app.js` — paints premium artwork in Woodland Path when Art is ON; loads existing fallback if artwork not ready
- `public/v2-premium-woodland.mjs` — new asset-only canvas renderer
- `public/assets/premium-woodland/` — five independently loadable forest floor and wall-prop images
- `test/v2-premium-woodland.test.mjs` — new visual isolation tests
- `test/v2-room-art.test.mjs`, `test/v2-complete-art.test.mjs` — update version-marker expectations; other existing test requirements intact

Upload only to the `dicebound-4-visual-v2` GitHub repository. Allow Cloudflare's build to complete and verify its successful deployment. There is no need to change V2 Secrets, Worker name, Routes or `wrangler.toml`. Do not upload the ZIP directly to GitHub; extract it first.

## How to view in the game

1. Open the **existing V2 Worker address**, sign in with existing V2 code.
2. Stay on **Quest 1 → Woodland Path** (already unlocked).
3. Select the **Tactical** view (this first prototype does not upgrade the separate isometric view).
4. Use `🌲 Premium woodland art: ON/OFF` to compare with the previous art in the same live room.
5. Play normally: move, target, attack and inspect wall blocking. They are all server-authoritative as before.

## What it changes (and does not change)

The forest floor is a large illustrated environment-only JPG. The two boulders and two tree/shrub forms are transparent PNG assets placed **only** on existing, actual blocked squares. The character/enemy markers and target/turn indicators remain from the real game. The tactical grid is thin and readable. No enemy, obstruction, interactable, weapon, coin or UI button is baked into the floor art.

Room coordinates, HP, XP, gold, battles, AI, loot, class perks, multiplayer, chat, inventory, boss rules and save files are unaffected.

This package deliberately does **not** update Quest 1 Rooms 2–3, other campaign quests, the Maze, or the entire art system.

## Verification

- `npm test`: 310 tests passing from a merged full V2 source checkout, including three additional tests for the premium renderer and prior 307 regression tests.
- JavaScript module syntax checked with Node.
- Local headless Chromium rendered the actual art module, using the authoritative Woodland Path wall coordinates and QA-only neutral tokens, with zero script errors. The QA preview is **not a screenshot of the logged-in game** and isn't a replacement for real device testing.
- Image sources and crops created for this prototype from generated illustrative artwork. No external licensed asset packs used.

**Quality gate:** Evaluate the real Woodland Path on your devices. If it still looks amateurish or too far below your target, reject the visual direction rather than spreading it through the other 132 rooms.
