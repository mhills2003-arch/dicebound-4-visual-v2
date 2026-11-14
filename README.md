# DICEBOUND V2 · Quest 2 Polish

Start with **[START_HERE_Q2_POLISH.md](START_HERE_Q2_POLISH.md)** for deployment and room test instructions.

This complete release polishes all five Quest 2 mine rooms, with continuous floors, connected natural obstacles and a consistent six-creature art set. It includes the completed Quest 5 release. Existing collision maps, encounters, balance and campaign progress are preserved. A small nearest-enemy targeting bug found during playtesting is also fixed.

Build: `v2-q2-polish-20261113-r2`

- Regression tests: `npm test`
- Quest 2 engine playthrough: `node scripts/verify-quest2-playthrough.mjs`
- Existing Quest 5 playthrough: `node scripts/verify-quest5-playthrough.mjs`
- Deployment configuration: `wrangler.toml`
- Art briefs and validation: `design/quest2/`
