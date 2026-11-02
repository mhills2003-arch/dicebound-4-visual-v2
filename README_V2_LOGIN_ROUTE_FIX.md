# DICEBOUND V2 — Post-login “Not found” fix

This patch is for the **separate V2 GitHub repository only** (`dicebound-4-visual-v2`). It must not be applied to V1.

## Symptom
After submitting a valid V2 invitation code, the browser redirects to `/dicebound-v2/` but shows `Not found`. The V2 Art Lab `.html` URL can fail for the same reason.

## Root cause and fix
The V2 Worker maps protected `/dicebound-v2/` requests to its static asset `/index.html`, and the Art Lab to `/v2-art-preview.html`. The default Cloudflare Worker static-assets `html_handling = "auto-trailing-slash"` redirects those asset URLs to `/` or `/v2-art-preview`, outside the `/dicebound-v2/` prefix. The Worker then correctly refuses these foreign paths with `Not found`.

Change just the static-assets setting in `wrangler.toml`:

```toml
[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = true
html_handling = "none"
```

See: https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/

## Apply
1. In the **V2 GitHub repository**, open root-level `wrangler.toml` and replace it with the file in this patch (or add just the `html_handling = "none"` line under `[assets]`).
2. Commit to the branch that your V2 Cloudflare Worker deploys.
3. Wait for a **successful** deployment of the same commit in Cloudflare.
4. Open the V2 URL `/dicebound-v2/`, sign in with your **existing V2** Player 1 code, and then try `/dicebound-v2/v2-art-preview.html`.

Do not re-enter or rotate the V2 secrets, add routes, change the `src/` server code, or touch V1. If Cloudflare has a **different** `wrangler.toml` at the currently deployed commit, merge this one line into that file instead of replacing other custom changes.

## Verification
The complete V2 package with this fix passed 304 automated tests (including the new protected login, game and Art Lab routing test) on a fresh local build. The actual Cloudflare deployment cannot be verified from this package alone.
