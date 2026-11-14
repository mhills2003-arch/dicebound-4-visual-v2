# DICEBOUND V2 · Quest 3 Walls

Start with **[START_HERE_Q3_WALLS.md](START_HERE_Q3_WALLS.md)** for deployment and review instructions.

This complete release improves the walls across all five Quest 3 rooms. Connected mossy ruins replace overlapping wall segments; Hollow Tree gains a connected root-and-rock bank beneath its existing fallen tree. The Quest 2 Polish R2 and Quest 5 Complete releases are included. Floors, scenery, enemies, collision maps, gameplay and saved progress are unchanged from the Quest 2 release.

Build: `v2-q3-walls-20261114-r1`

- Regression tests: `npm test`
- Quest 2 engine playthrough: `node scripts/verify-quest2-playthrough.mjs`
- Existing Quest 5 playthrough: `node scripts/verify-quest5-playthrough.mjs`
- Deployment configuration: `wrangler.toml`
- Quest 3 wall artwork, prompts and validation: `design/quest3/`
- Previous Quest 2 art briefs and validation: `design/quest2/`
