# DICEBOUND V2 — actual Worker name and asset routing correction

**V2 only. Do not upload to the V1 repository.**

Problem 1: Cloudflare dashboard shows Worker `dicebound-4-visual-v2`, while the prior `wrangler.toml` used `sonny-dicebound-visual-v2`. Cloudflare Git builds require the Worker name to match the Wrangler configuration.

Problem 2: An authenticated GET `/dicebound-v2/` was internally remapped to `/index.html`. On some Cloudflare HTML handling settings this canonicalizes/redirects to `/` outside the authenticated V2 path. Remap it to the asset root `/` instead. Keep `html_handling = "none"` for literal Art Lab .html paths.

## Apply
1. In **dicebound-4-visual-v2** GitHub repo (NOT V1), replace exactly the four files in this ZIP, preserving paths:
   - `wrangler.toml`
   - `src/worker.mjs`
   - `test/v2-isolation.test.mjs`
   - `test/v2-login-assets.test.mjs`
2. Commit all four files together to `main`.
3. In Cloudflare **Workers & Pages > dicebound-4-visual-v2 > Deployments**, confirm the *newest* build succeeded and that its GitHub commit matches the commit you just made. Do not use an old deployment.
4. Test `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` in a private/incognito window; sign in with your existing V2 code. Then test `/dicebound-v2/v2-art-preview.html`.
5. If not found still appears, provide the exact URL in the browser address bar **after login** and the response text/screenshot. This will distinguish an unwanted redirect from a missing asset or stale deployment.

No secrets are included. V1 unaffected. Testing locally: 304 automated tests passed; live Cloudflare end-to-end routing must be verified after deploy.
