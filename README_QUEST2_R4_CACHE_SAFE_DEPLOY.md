# DICEBOUND V2 — Quest 2 enemy art: cache-proof release R4

This package contains the **same approved illustrated enemy artwork**, now under **new asset filenames** so browsers and Cloudflare cannot mistakenly reuse the older plain dice icons. No gameplay, map layout, quest content or Cloudflare settings are changed.

## Install in the existing isolated V2 GitHub repository

1. **Confirm the 5-room Quest 2 cinematic art is already deployed** (you can see the beautifully illustrated mine floor and crystals). This patch assumes those scenery assets already exist.
2. Unzip the package and copy its `public/` contents into the **root of the V2 repository**, retaining the `public/assets/premium-mine/` structure. Merge folders; replace `public/app.js`, `public/index.html`, and `public/v2-premium-mine.mjs`. The five `*-q2r4.png` images are added alongside the old images. You do not need to delete any existing files.
3. Commit and push the changes to the branch connected to Cloudflare. **An upload to GitHub is not a deployment**: go to Cloudflare Workers & Pages → `dicebound-4-visual-v2` → Deployments and check the **latest deployment says Success**. If it says Failed (e.g. Cloudflare asset upload session error 10013), the previous version remains live; retry deployment rather than changing gameplay.
4. After a successful deployment, reopen `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`, then hard-refresh (Ctrl+Shift+R) **without deleting browser data or local saves**.
5. Verify the new asset directly, while logged in if needed: `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/assets/premium-mine/normal-d4-q2r4.png`. It must show a textured stone monster with crystal spikes, not a plain grey D4 die and not a 404/HTML page.
6. To verify that the **new JavaScript renderer** deployed as well, open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/app.js?diag=q2r4` in a new browser tab and search (Ctrl+F) for `v2-quest2-mine-creatures-20261103-r4`. If not found, Cloudflare is still serving the older release even if the direct PNG loads.

A successful asset URL **alone** does not prove live gameplay has switched: the app.js and v2-premium-mine.mjs need to be updated and fetched too. If all three are current but old sprites still render, investigate game settings/renderer state and browser devtools image requests.

This update is for `/dicebound-v2/` ONLY; do not upload to the main `/dicebound/` production Worker.

The illustration preview supplied earlier is a reference; this ZIP contains actual usable transparent PNGs and the game renderer changes. Four older tests that asserted the pre-Quest-2 source shape are updated to reflect both premium renderers, without skipping or deleting tests. In a locally reconstructed V2 repository, all 370 automated tests passed. This does not confirm a Cloudflare deployment.
