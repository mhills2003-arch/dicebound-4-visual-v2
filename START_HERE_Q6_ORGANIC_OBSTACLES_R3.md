# DICEBOUND V2 | Quest 6 organic obstacles R3

This patch updates Quest 6 Art R1 or Walls R2. Coffins, broken fonts,
fallen arch fragments and rubble banks now occupy the blocked squares
directly on the room floor. Each coffin covers two cells and each font
covers one. Larger collapsed grave piles cover four cells.

Extract into the existing V2 repository root and replace matching files.
Upload the extracted public, src, test and design folders together and
commit them in one commit so Cloudflare receives the whole update.

After the successful build, refresh the game. Open
**Cog > Room art test > Quest 6 > 6-8 The Drowned Mausoleum** to compare
with the earlier version. All eight room test saves are available.

The version endpoint should report `v2-q6-obstacles-20261120-r3`
and `cinematicAssetsReady: true` with 41 asset checks returning 200.

455 checks passed. Exact coverage of all 252 blocked cells was verified,
and all eight rooms were visually reviewed in the game preview.
The artwork prompts and asset details are in
`design/quest6/organic-obstacles-r3.json`.
