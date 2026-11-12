# DICEBOUND V2 · Quest 5 Complete R1

Build: `v2-q5-complete-20261112-r1`

This is the full V2 deployment package. It finishes rooms 5-3 through 5-8 using the approved Quest 5 map sheets, including the D16 High Roller boss. Caravan Gate (5-1) and Rushing Dunes (5-2) retain their existing maps, encounters and artwork.

## Deploy

1. Extract this ZIP into the root of your existing DICEBOUND V2 repository, alongside `wrangler.toml`. Merge the contents and replace matching files; do not put the package inside another folder.
2. Commit and push to the branch connected to the Cloudflare Worker **dicebound-4-visual-v2**. Keep the existing Worker bindings, secrets and deployment configuration.
3. Wait for the deployment to finish, then refresh the V2 game. Its `/dicebound-v2/version` endpoint should report the build above and `cinematicAssetsReady: true`.

This package has been checked locally; it has not been published to your live Worker.

## Play

For the normal campaign, continue east through Quest 5. All eight rooms are connected, and the final room leads back to camp after completion.

To jump straight into a room:

1. Sign in to V2 with your existing player code.
2. Open **⚙ → Quest 5 room test** and choose the room.
3. Select **🏜 Open separate test save**.

Each room choice has a separate persistent test world, with a level 6 Knight, Rare equipment and three potions on first entry. Reopening that choice resumes its test character. Use **⚙ → ↩ Return to campaign save** to return to your normal progress.

An encounter already in progress keeps its existing enemies and damage when the build changes. A fresh encounter uses the approved new formation. The six new room tests provide immediate fresh starting points without resetting the campaign.

## Rooms

| Room | Name | Blocked squares | Enemies |
| --- | --- | ---: | ---: |
| 5-3 | Archers’ Ridge | 30 / 117 | 7 |
| 5-4 | Iron Caravan | 32 / 117 | 7 |
| 5-5 | The Broken Crossing | 32 / 117 | 7 |
| 5-6 | The Shieldwall | 32 / 117 | 7 |
| 5-7 | Smuggler’s Station | 32 / 117 | 8 |
| 5-8 | The High Roller’s Toll | 32 / 117 | 7, including the D16 boss |

The original sheets are in `design/quest5/`. They determine obstacles and enemy positions. Collision and rendered obstacle footprints use the same layout data. Scenery has natural silhouettes and shadows, with no extra boxes around occupied squares.

## Validation

- 433 automated tests pass, including collision, map fidelity, four-player entry, old-save reconciliation, authentication and test-world separation.
- Three seeded engine playthroughs cleared rooms 5-3 through 5-8 using ordinary movement, attacks and potions, with camp/shop visits between rooms.
- A further seeded playthrough completed the entire eight-room quest, its final exit and replay.
- All six new rooms were inspected in the actual canvas renderer at full gameplay size. Movement and combat were also exercised through the browser interface.
- Existing artwork files and all 128 other room definitions/collision maps match the 5-2 package.

Run `npm test` for the regression suite. Run `node scripts/verify-quest5-playthrough.mjs` to reproduce the full eight-room engine playthrough. Results and art production notes are in `design/quest5/`.

Earlier `START_HERE_*` and quest-specific notes are retained as historical documentation. This file contains the current deployment and room-test instructions.
