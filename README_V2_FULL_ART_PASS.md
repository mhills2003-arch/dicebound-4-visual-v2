# DICEBOUND 4.0 V2 — Campaign environment art pass (2026-11-02)

This is a **V2-only visual package**, not a redesign of gameplay.

## What changed
- Theme-specific Canvas floor textures, decorative wall objects, ambient lighting, and colour treatments across all 133 campaign rooms in all 15 quests.
- Woodland Path retains its separate forest pilot; Smuggler’s Station retains its earlier artwork.
- Camp gets a warm visual palette.
- A purely CSS environment uplift to the existing Endgame Maze 7×7 tactical board.
- `Scene art: ON/OFF` compares the original and new renderer in any campaign room.
- Deterministic room-specific decoration choices prevent rooms in the same quest looking completely identical.

## Install
1. Back up the current V2 GitHub repository.
2. Extract this ZIP. Upload matching `public/`, `test/`, documentation and any included root files **to V2 only**; leave V1 alone.
3. Do not change Cloudflare routes, Secrets, `wrangler.toml`, `src/` or storage bindings to install this visual upgrade.
4. Check the build's tests and Cloudflare deployment before opening V2.
5. Test with the `Scene art: ON/OFF` toggle in the playable rooms, including both tactical and illustrated board views.

## Important limitations
- Procedural illustrated Canvas treatment, **not** hand-painted 3D art. Further polishing may be required for a 7–8/10 presentation.
- All gameplay coordinates, collision walls, mechanics, saves and server logic are unchanged.
- The standard campaign is painted via Canvas. Endgame Maze still has a DOM-based tactical board, so it receives a CSS-only enhancement rather than bespoke 3D scenery.
- Art Lab remains a separate experimental page and is not needed for normal gameplay testing.
- Current image files and server code are retained unmodified.
