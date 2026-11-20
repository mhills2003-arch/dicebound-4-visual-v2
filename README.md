# DICEBOUND V2 · Quest 6 Art

Start with **[START_HERE_Q6_ART.md](START_HERE_Q6_ART.md)** for deployment and room-test instructions.

This complete release integrates the approved Quest 6 grids, continuous crypt walls, tomb obstacles and all enemy artwork into the game. It includes the previous Quest 1–5 improvements. Quest 6 is also available through the existing separate room-test saves. Existing enemy rosters, combat and progression rules are preserved.

Build: `v2-q6-art-20261115-r1` · package verified 20 November 2026.

- Regression tests: `npm test`
- Quest 6 engine playthrough: `node scripts/verify-quest6-playthrough.mjs`
- Quest 6 geometry validation: `python3 scripts/verify-quest6-layouts.py`
- Quest 2 engine playthrough: `node scripts/verify-quest2-playthrough.mjs`
- Existing Quest 5 playthrough: `node scripts/verify-quest5-playthrough.mjs`
- Deployment configuration: `wrangler.toml`
- Quest 3 wall artwork, prompts and validation: `design/quest3/`
- Previous Quest 2 art briefs and validation: `design/quest2/`
