# DICEBOUND V2 — Login/route 404 repair (2026-11-02)

**V2 only. Do not upload this to V1 or the author site.**

## Symptom
`https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` displays `Not found` without showing a login form. A previously retained session cookie can skip the login screen and expose the broken static asset route.

## Finding
The prior checked-in V2 source had regressed to `name = "sonny-dicebound-visual-v2"` even though the V2 Worker used in Cloudflare is `dicebound-4-visual-v2`, omitted `html_handling = "none"`, and routed an authenticated `/dicebound-v2/` visit to `/index.html`. Cloudflare may canonicalize that static asset path to `/`, which is outside the V2 Worker prefix. These were already corrected in an earlier successful V2 fix.

## Installation (do NOT change secrets)
1. In the **V2 GitHub repository** only, merge these 4 files in their exact paths: `wrangler.toml`, `src/worker.mjs`, `test/v2-isolation.test.mjs`, `test/v2-login-assets.test.mjs`. Commit them.
2. Check the Cloudflare V2 deployment's **latest successful commit** is the commit you just pushed, and the Worker name is exactly `dicebound-4-visual-v2`. This package does not affect the separate V1 Worker.
3. In an incognito window visit `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` — it must show the invitation-code login form. Log in using your existing code; the game must load at the same URL.
4. In your normal browser, if you still get `Not found`, clear only cookies/site data for the V2 worker domain (or log out once access resumes), not your other accounts.

The most recent cinematic HUD files in `public/` are **not** included or changed by this repair.

## Testing
Routing integration tests simulate first unauthenticated request (with/without `utm_source`), valid login redirect and authenticated static files, including avoiding canonical redirects. Run `npm test` at the V2 repository root. Live Cloudflare deployment remains to be verified after upload.
