# DICEBOUND V2 — Fix authenticated `/dicebound-v2/` 404

**Only for the isolated `dicebound-4-visual-v2` GitHub repository. Never upload this to the V1 Worker or Sonny Lanning website.**

## Cause in V2 source

With `[assets] html_handling = "none"`, Cloudflare does not automatically map the asset request `/` to `/index.html`. A prior V2 routing fix incorrectly changed the authenticated `/dicebound-v2/` request from `/index.html` to `/`, and its test mock incorrectly assumed `/` would work. A previously valid login cookie means you can encounter this 404 without seeing the login form again.

## Included files

- `src/worker.mjs`: one-line correction back to explicit `/index.html`, plus a harmless public `GET /dicebound-v2/health` check. The rest of the Worker is otherwise identical to the last cinematic build + engine/build routing patches.
- `test/v2-login-assets.test.mjs`: makes the test mock behave like Cloudflare in HTML-none mode. Requires `/index.html` and checks the health endpoint.

## Installation

1. Confirm the **V2** GitHub repository currently contains the cinematic HUD release, previous routing fix, and the corrected `src/engine.mjs` (the 8-missing-exports repair). This patch does *not* include those files.
2. Extract and place the two included files at their exact paths in the **V2 repo only**. Commit.
3. Verify Cloudflare's **V2 Worker** deployment for that new commit is **successful** and targets `dicebound-4-visual-v2`.
4. Open the diagnostic URL: `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/health`.
   - If it displays `DICEBOUND V2 router OK`, the deployed V2 Worker is receiving requests.
   - If it is 404, investigate the deployed Worker URL/name/status (and check that the commit succeeded), **not** the gameplay code. The updated Worker is not reachable at that URL.
5. Open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` in a private/incognito window. You should see a parent-invitation login screen. Then try the normal window and log in as usual.
   - If `/health` works but the game is 404 after valid login, check that `public/index.html` was included in the V2 repository and the correct assets directory is configured. Capture the current deployment and status.

No secrets, cookie names, Durable Object bindings, game logic, HUD, or graphics are altered.

## Verification

`npm test` on the complete local V2 tree: 347/347 passed. These are unit/integration tests using a Cloudflare-like mock, **not a live Cloudflare deployment**. The live Worker could not be reached independently from the assistant's runtime. A fresh successful Cloudflare deployment and `/health` response are the acceptance check.
