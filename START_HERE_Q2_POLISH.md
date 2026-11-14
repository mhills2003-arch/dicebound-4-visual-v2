# DICEBOUND V2 · Quest 2 polish

Build: `v2-q2-polish-20261113-r2`

This is a complete deployment source package, based on the completed Quest 5 release. Copy its contents into the existing `dicebound-4-visual-v2` repository and use the existing Cloudflare deployment process. Do not create a new Worker or replace its invitation secrets.

## What changed

- All five Quest 2 rooms have individually illustrated, continuous floors: dusty entrance slate, blue calcite hollow, amber mineral gallery, old stone vault and amethyst heart.
- Connected rockfalls, timber braces, ore carts and crystal banks replace the old stretched obstacle overlays. Their physical art is clipped to the existing blocked cells; soft cast shadows extend naturally. There are no extra square outlines around obstacles.
- Crisp mine framing replaces the blurred double-exposure side panels, with restrained room-specific light.
- Six consistent transparent creature sprites cover normal D4/D6/D8, shiny D4/D6 and the pentagonal-faced D12 boss. Live labels and health bars remain authoritative.
- Mine assets load when their room is entered; shared images load once. Static obstacle layers are cached, with a three-layer limit. Reduced bloom and particles improve clarity.
- An existing auto-targeting error is fixed: an attack or special with no selected enemy now correctly chooses a reachable foe. Explicit targeting and healing targets are preserved.
- The settings menu offers all five Quest 2 test rooms alongside all eight Quest 5 rooms. The menu scrolls on shorter screens and respects hidden actions.

## Test any room

After deploying, enter the V2 game with your existing invitation code. Open **⚙ → Room art test**, choose **2-1** through **2-5**, then choose **Open separate test save**.

Each room starts a separate, persistent review world with a level-three Knight, Common level-three sword and armour, and three potions. Rejoining resumes that test character. **Return to campaign save** reconnects to the existing campaign. This does not reset or advance your campaign save.

The existing Quest 5 trial links still use their previous saved worlds. Quest 2 uses new whitelisted `mine-q2-r1` through `mine-q2-r5` trial values. Authentication still applies to the game, assets and WebSocket routes.

## Deploy and verify

Use the existing GitHub/Cloudflare setup. The Worker name in `wrangler.toml` remains `dicebound-4-visual-v2`, with its original bindings and migration history.

After the deployment, `/dicebound-v2/version` must report build `v2-q2-polish-20261113-r2` and `cinematicAssetsReady: true`. Its checks cover the five new floors, new D8 and boss, plus the previous Quest 5 assets.

Local checks:

```sh
npm test
node scripts/verify-quest2-playthrough.mjs
```

The second command plays all five rooms using legal engine actions, including movement, combat, camp/shop/potion use, east exits, completion and replay. It does not force kills or bypass the combat rules.

## Preserved design

The 9×7 Quest 2 boards retain their original obstacle counts (9, 5, 7, 9, 8) and enemy counts (2, 1, 2, 2, 2). Every floor cell remains reachable. Existing room definitions, collision coordinates, encounters, rewards, progression and combat balance are unchanged. The only combat logic repair preserves the intended nearest-enemy targeting when no foe is selected. Quest 5's source artwork is preserved byte for byte.

Art briefs, content hashes and verification evidence are in `design/quest2/`. Earlier Quest 5 documentation remains as historical reference; this file describes the current deployment.
