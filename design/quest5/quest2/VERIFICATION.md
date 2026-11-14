# Quest 2 release verification

Verified 14 November 2026. Build `v2-q2-polish-20261113-r2`.

- All 439 automated checks pass.
- Three complete Quest 2 engine playthroughs pass: movement, combat, camp, shop, healing, all room exits, quest completion and replay.
- The full eight-room Quest 5 engine playthrough also passes after the targeting repair.
- All five new scenes were inspected in the browser using the shipping UI and renderer with the actual game engine. The room selector successfully opened a separate Q2 test world.
- Browser combat confirmed that an untargeted attack damages the adjacent boss; the adventure log recorded 11 damage and 1/12 boss HP remaining.
- No application console errors were observed. Browser-extension messages were excluded.
- All 134 room definitions and collision maps match the previous release. Every previous artwork file is byte-identical.
- Art is clipped to existing blocked cells. No extra obstacle square outlines are drawn. Shared scenery is loaded per room and static obstacle layers use a bounded cache.

The deployment archive excludes local QA transport, copied QA engine files, screenshots and preview-server configuration. It retains the existing Worker identity, bindings, authentication and campaign world key. New room trials use separate whitelisted world keys.

This is a prepared deployment package. A live Cloudflare deployment and its persistent WebSocket session have not been performed from this workspace.
