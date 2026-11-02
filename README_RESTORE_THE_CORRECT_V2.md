# DICEBOUND V2 — Complete cinematic restoration (2026-11-02)

**Use ONLY in the existing `dicebound-4-visual-v2` GitHub repository / Cloudflare Worker.**
This is a complete coherent source snapshot, NOT another differential patch.

## Why
The live screenshot showed the previous `MEDIUM MAZES 13×9` lab build from 1 Nov,
which is absent from this package's HTML. Partial repairs mixed incompatible code and
may also have targeted the wrong repo/Worker.

## Contents
Full `public/` including premium woodland art, cinematic HUD, JS/CSS; full matching
`src/` engine and Worker with the explicit `/index.html` route; test suite;
`wrangler.toml` explicitly naming only `dicebound-4-visual-v2`; package.json.
No `.dev.vars` or live secrets. No changes to game storage/saves.

## Safety-critical deployment instructions
1. In Cloudflare, open Worker `dicebound-4-visual-v2`, go to deployments and confirm
   its **connected GitHub repo and branch**. If that repo is V1 or you're unsure, STOP.
   Do NOT upload this package to V1 or to the author website.
2. In that exact V2 GitHub repo, replace the WHOLE matching `public/`, `src/`,
   `test/`, `wrangler.toml` and `package.json` tree with the contents of this zip.
   Keep the same folder paths. Do not merge a V1 zip over these files.
3. Confirm the repo `wrangler.toml` says `name = "dicebound-4-visual-v2"`
   and `directory = "./public"`. The Cloudflare deploy command remains
   `npx wrangler deploy`. No need to change any secrets.
4. Verify a **green successful Cloudflare deployment for the commit**. Failed builds
   do not deploy.
5. Open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/version`
   before logging in. It must show build `v2-cinematic-restoration-20261102-r1`
   and `cinematicAssetsReady: true`. This actually probes the deployed HTML, JS,
   CSS and premium image under the same assets binding.
6. Only then open `/dicebound-v2/` in a private window and sign in normally.

If `/version` is 404 or shows a different build, the right Worker isn't receiving
this deploy, regardless of the tests. Check Worker name, connected repo/branch,
and the Cloudflare deployment, not invitation secrets or browser caching.
If `/version` has `cinematicAssetsReady: false`, note the `checks` status codes:
Cloudflare has an old/mismatched `public/` directory. Fix the GitHub asset tree.

## Verification limits
Local Node test suite and source import checks are run with this archive.
A successful Cloudflare Wrangler bundle and authenticated live play still require
a green deployment on the user's Cloudflare account.
