# DICEBOUND V2 — Woodland Path foreground depth + forest life (visual phase 3)

**Only** Quest 1, room **Woodland Path**, **Tactical view**, in the isolated V2 Worker.
V1, V2 backend, Cloudflare config, secrets, other quest rooms, collision geometry, movement, combat and save data are unchanged.

## Deploy — incremental patch to the V2 GitHub repository

1. This patch REQUIRES the previous **premium Woodland Path** asset package and the **woodland lighting** update already deployed.
2. Extract the ZIP and copy the matching `public/` and `test/` files into the existing **V2** GitHub repository, preserving all subdirectories. Both `canopy-a.png` and `canopy-b.png` are new assets and must be included.
3. Commit/push to the V2 repo and confirm Cloudflare successfully deploys. **Do not** replace `src/`, change Worker routes, V1, secrets, or `wrangler.toml`.
4. Open https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/ and navigate to Woodland Path in Tactical view.

## How to compare

- Keep **Premium woodland art: ON** and **Sunlight: ON** (the approved 7.5/10 baseline).
- Switch **Foreground: ON/OFF** to compare the next phase directly against that approved version.
- On: transparent woodland canopy pieces near the edge, smaller tufts near real blocking obstacles, gentle swaying foliage and drifting leaves.
- Off: removes this complete phase so the premium forest and sunlight remain exactly as before.
- If your operating system asks for **reduced motion**, foreground still appears but there is no animation.

The foreground fades automatically near actor positions to keep labels/HP/target selection visible. The server remains solely responsible for walls and player/enemy positions. Effects use a stable frame time and deterministic seeds, not gameplay randomness.

## Verification

- Clean full V2 source with patch over the previous lighting pass: 320 automated tests passed (315 prior + 5 new foreground-depth tests).
- Browser-rendered 720 × 550 Canvas before/after check: zero JavaScript errors, token stand-ins, not a live authenticated game session.
- No edits to any `src/` or Cloudflare configuration files.
- This has not been tested on the physical tablet, and the user's assessment of the actual game remains the quality gate.

**Scope restriction:** does not upgrade Training Clearing, Old Watchpost, or later quests. Those are intentionally held until Quest 1's visual art direction is approved.
