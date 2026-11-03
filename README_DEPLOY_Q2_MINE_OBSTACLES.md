# DICEBOUND V2 — Quest 2 Mine-Specific Obstacle Artwork (R1)

This **incremental, visual-only** patch requires the working Quest 2 premium mine and the newer Q3 build already deployed. Extract at the ROOT of the existing V2 GitHub repository and merge/replace the included public/ and test/ files. Do not delete other repository files. Commit/push; verify Cloudflare Success. Hard-refresh the game (Ctrl+Shift+R). No character reset required.

## Changes
Connected Q2 obstacles now display as one illustrated transparent rock/crystal formation, with pairs of loaded mine carts in selected two-cell horizontal spaces and rich ore/crystal buttresses elsewhere. A different mineral palette is used for each of Q2's five chambers. Only original blocked squares are represented. The renderer checks the exact live server-provided wall coordinates against the expected map before drawing a room's illustration; otherwise it falls back safely to original per-square obstacle art.

## Untouched
All Q2 floor/background and margin artwork, enemies (including Shiny variants and boss), HUD, room definitions, collision, monster movement and attacks, gold/XP/loot, Q1, Q3, localStorage saves and Cloudflare deployment settings.

## Test first
Inspect the visual style in Abandoned Mine then Crystal Hollow, and check the Crystal Heart boss. These are local image asset composites; final game visuals require a signed-in live test.
