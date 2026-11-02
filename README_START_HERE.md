# DICEBOUND V2 — HTTP 404 after login, exact asset-path fix

This update fixes the V2 worker route at `/dicebound-v2/` when `wrangler.toml` uses `[assets] html_handling = "none"`.

**Issue:** The previous patch requested the root static asset `/`, which Cloudflare does not automatically map to `/index.html` with `html_handling = "none"`. After signing in, the browser correctly followed the 303 redirect to `/dicebound-v2/` but the Worker then returned a 404 from the ASSETS binding.

**Fix:** The Worker requests `/index.html` internally for `/dicebound-v2/`. `public/index.html` is unchanged; the browser URL remains `/dicebound-v2/`.

## Instructions

In the GitHub repository **dicebound-4-visual-v2** only, replace these two files, preserving paths:

- `src/worker.mjs`
- `test/v2-login-assets.test.mjs`

Commit to `main` and confirm the latest deployment in the Cloudflare Worker **dicebound-4-visual-v2** succeeds. Then open:

https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/

If already signed in, try reloading once. The Art Lab is at `/dicebound-v2/v2-art-preview.html`.

Keep `wrangler.toml`, `public`, `V2_GAME_ROOM`, Cloudflare secrets and all V1 repositories unchanged. Do not upload the ZIP itself.

## Verification

Local `node --test test/*.test.mjs`: 305 tests passed on the V2 baseline with this patch. The route tests simulate Cloudflare's explicit-file asset mapping. They are **not** an authenticated live Cloudflare deployment test. If the Worker still returns 404, inspect its active deployment ID and its HTTP logs rather than rotating codes again.
