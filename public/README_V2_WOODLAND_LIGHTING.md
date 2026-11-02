# DICEBOUND 4.0 V2 — Woodland Path Lighting Pass

**Status:** Playable visual prototype; lighting still subject to real-device approval.
**Scope:** Woodland Path (Quest 1, Room 1), **tactical view only**. No changes to Quest 1 rooms 2–3 or any other quest.
**V1:** Unchanged. **V2 server game engine and Wrangler configuration:** Unchanged.

## Install to the existing V2 GitHub repo ONLY

This is an **incremental patch**, not a replacement game. Your V2 repository must already contain the previous Quest 1 **premium asset renderer** and `public/assets/premium-woodland/` images.

Extract the ZIP and upload/replace the six files it contains, preserving paths:

- `public/app.js` — adds separately toggleable sunlit rendering and character shadows, shown only on Woodland Path.
- `public/v2-premium-woodland.mjs` — ambient, canopy and directional lighting functions.
- `test/v2-premium-woodland.test.mjs` — adjusted renderer tests.
- `test/v2-woodland-lighting.test.mjs` — new visual and state-isolation tests.
- `test/v2-room-art.test.mjs` — updated V2 release label assertion.
- `test/v2-complete-art.test.mjs` — updated V2 release label assertion.

Do not upload the README unless you want the documentation in GitHub. Do not edit `src/`, `wrangler.toml`, secrets, routes or any V1 file. The previously deployed premium forest art assets stay in place.

## Evaluate the upgrade

1. After Cloudflare shows a **successful** V2 deployment, open the usual V2 link and sign in.
2. Enter **Quest 1 → Woodland Path** in Tactical view.
3. Keep `Premium woodland art: ON`.
4. Press the new **Sunlight: ON/OFF** button to compare the lighting layer to the exact previously approved premium-art look. The choice is stored only in this browser.
5. Inspect character clarity, shadows, tile visibility and performance on both desktop and tablet.

## What the lighting layer does

- Wide, feathered forest canopy shadow and warm ground-light patches, with deterministic dappled sunlight.
- Long, softly projected shadows calculated from the exact blocked squares already supplied by the game.
- Very subtle atmospheric shafts and a controlled perimeter vignette behind the units.
- Contact shadows under the existing player/enemy tokens, including large variants.

All transforms are drawn in canvas using the current game board projection, **not** images with a baked grid, fake obstacles or characters. No new collision or input geometry. No effects are drawn over the final combat HUD/labels.

## Verification

- Full merged V2 source: **315 tests passed**, including prior baseline tests and five lighting-specific tests.
- Chromium QA Canvas: the two lighting states rendered at 720×550 without JavaScript errors. This uses QA token stand-ins, not a claim of a live multiplayer browser session.
- A visual renderer-only patch: none of the `src/` files, persistent character data, Cloudflare secrets, or gameplay mechanics changed.

This is a visual iteration of the approved **7/10** Woodland Path foundation. It is **not** a claim that the scene has reached 8–9/10. Judge on your actual devices before extending the lighting approach to the other Quest 1 rooms.
