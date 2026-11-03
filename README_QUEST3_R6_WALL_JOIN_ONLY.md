# DICEBOUND V2 — Q3 R6: wall joins only

**Scope:** One small, visual-only improvement to Quest 3 connected walls. The module now uses correct horizontal/vertical stone courses at adjoining cells, draws underlaid masonry bridges only between existing blocked neighbors, and no longer scatters log sprites into stone chains. It does not alter the Q3 map or any gameplay state.

**UNCHANGED:** Floor images and their paths (R5), the accepted R3 D12 boss image and its sizing, ordinary/Large enemy images, Q1/Q2, HUD and level display, collision and tactical layout, XP/gold/rewards, save data. The existing full fallen-tree illustration in Hollow Tree is retained.

## Deploy
Extract ZIP at the root of the **existing** V2 GitHub repository. Overwrite the three included public files only. Do NOT delete any other files or folders. Commit/push; confirm the newest Cloudflare deployment succeeded. Refresh with Ctrl+Shift+R. No game save reset needed.

This patch assumes the last **R5 premium recovery package** is already installed and successfully displaying illustrated Quest 3 rooms. It does not contain the R5 artwork, which remains unchanged in your repository. If R5 is not installed, apply R5 first.

## Verify
In Trampled Trail, check that both sides of each L-shaped or longer masonry wall connect. In Root Maze and Hollow Tree, check the stone chains; in Elder Grove, verify the boss remains exactly as before. Even with the joins, the walls will retain some repeating masonry texture; this is a one-pass connectivity tidy-up rather than an environment redesign.
