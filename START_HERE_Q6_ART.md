# DICEBOUND V2 — Quest 6 art R1

Complete deployment package, verified 20 November 2026. Build: `v2-q6-art-20261115-r1`.

All eight rooms of **Ghost of a Chance** now use the approved Q6 layouts in the actual game: damp limestone walls, flooded crypt floors, mossy graveyards and carved tombs. Walls form continuous structures without outlines around individual obstacle squares. Ghost, zombie, teleporter, ordinary die and D20 boss artwork is integrated with targeting, movement, health bars and combat. Defeated zombies show a faint **RISING** remnant during their existing revival delay.

## Deploy

Extract this complete ZIP into the same V2 repository used for the previous Q3 Walls release, then use its existing GitHub/Cloudflare deployment workflow. Alternatively, run `npm run deploy` from your authenticated Cloudflare development environment. The Worker is still **dicebound-4-visual-v2**. Keep the existing bindings, migrations and invitation secrets; `wrangler.toml` is byte-identical to the previous release.

After deployment, refresh the game. `/dicebound-v2/version` should report `v2-q6-art-20261115-r1`, `cinematicAssetsReady: true`, and 38 successful checks. This task prepared and tested the package locally; it did not publish to the live Worker.

## Try Q6 immediately

In the game, open **More controls (cog) → Room art test → Quest 6**, choose a room, then **Open separate test save**. Start with **6-3 Whispering Crypt**, followed by **6-8 The Drowned Mausoleum**. All eight rooms are available.

Each room test has its own persistent world, with the existing four player identities and login codes. The test character starts as a level-8 Knight with uncommon equipment and three potions. Rejoining resumes that test; Player One can use the existing test reset to restart it. **Return to campaign save** takes you back to your usual progress. No new campaign save is required.

## Layouts and encounters

| Room | Blocked squares | Enemies | Shortest door route |
| --- | ---: | ---: | ---: |
| 6-1 Misty Causeway | 30 | 6 | 14 steps |
| 6-2 Graves That Stir | 32 | 6 | 14 steps |
| 6-3 Whispering Crypt | 32 | 6 | 20 steps |
| 6-4 The Flickering Moor | 31 | 6 | 16 steps |
| 6-5 Sunken Graves | 34 | 7 | 14 steps |
| 6-6 The Haunted Crossing | 32 | 7 | 16 steps |
| 6-7 Crypts of the Lost | 30 | 7 | 24 steps |
| 6-8 The Drowned Mausoleum | 31 | 8 | 14 steps |

Every board is 13×9. All floor cells are connected, two independent door routes remain available, and a 2×2 footprint can traverse each room. Walls break direct approaches and provide detours while ghosts and teleporters use their established movement rules. The D20 boss keeps its existing 1×1 collision footprint.

The existing 53 enemy definitions and all combat, reward and progression rules are preserved. The engine changes only Q6 wall coordinates and starting positions. Existing reconnect reconciliation moves a character or ordinary enemy out of a newly blocked square; ghosts may still occupy walls. All 126 other room definitions and wall maps, and all 234 previous artwork files, are unchanged.

## Validation

- `npm test`: 453 passing checks, including four-player entry, reconnect preservation, isolated trial routing, missing-asset fallback and deployment identity.
- `node scripts/verify-quest6-playthrough.mjs`: three complete seeded solo Knight runs, through all eight rooms, boss completion, camp return and replay. These use the test loadout and legal camp/shop/potion commands between rooms; they are progression checks, not an exhaustive balance assessment.
- `python3 scripts/verify-quest6-layouts.py`: obstacle density, full floor connectivity, alternate routes and 2×2 clearance.
- `node scripts/audit-quest6-release.mjs /path/to/previous-release`: compares the package with Q3 Walls R1.

The eight rooms were visually reviewed in the game renderer. The local browser transport used for that review is excluded from this ZIP. Reports and artwork provenance are in `design/quest6/`. Nine new WebP assets add approximately 4.45 MB; transparent sprites retain their alpha channels. Wall drawing is cached, and the existing reduced-motion and artwork controls remain available.
