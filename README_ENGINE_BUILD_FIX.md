# DICEBOUND V2: eight missing engine exports — build repair

Cloudflare's deployment at 2026-11-02 14:41 failed because `src/worker.mjs` and `src/maze-play.mjs` import eight names not exported by the GitHub version of `src/engine.mjs`.

## Install (V2 GitHub repository ONLY)

1. Extract this ZIP.
2. In your `dicebound-4-visual-v2` GitHub repository, **replace** `src/engine.mjs` with this ZIP's `src/engine.mjs`. This is the matching engine source from the earlier complete V2 project (not the V1 game).
3. Optionally copy `test/v2-engine-exports.test.mjs` to the repository's `test` folder to catch future version mismatches.
4. Commit to the V2 branch that Cloudflare deploys. Wait for a **green SUCCESS deployment**. The old failed deployment will not be corrected until a new build succeeds.
5. Revisit `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`.

Do NOT edit invitations, Cloudflare secrets, routes, Durable Object names, or V1's repository.

## Scope and verification

This changes no frontend assets, HUD files, or routing configuration. It restores a matching `src/engine.mjs`.
Local composite of cinematic V2 + earlier routing repair + this engine passed 344/344 Node tests and all 12 src `.mjs` syntax checks. All eight exports were verified by Node module import.
A `wrangler deploy --dry-run` was attempted but could not complete because npm dependency installation stalled in the local environment. Therefore a successful Cloudflare bundle is NOT independently verified. If the new build still fails, use the complete new deployment log to identify the next error, rather than changing Cloudflare settings.
