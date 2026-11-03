# DICEBOUND V2 — Quest 3 R5: full-asset premium recovery

Why the previous build appeared unchanged: Q3 was configured to fall back to the generic room renderer whenever even one required art image was unavailable. R4b was also an incremental ZIP, not a complete asset set. A successful Cloudflare deployment does not guarantee every art URL loaded in the browser.

R5 contains **the full Quest 3 artwork library**, the corrected module and the updated V2 app and index. It restores the five continuous premium floor illustrations and Q3 illustrated enemies; retains R2 wall art, one whole fallen tree in Hollow Tree, and the **byte-identical R3 approved D12 boss and display scale**. No gameplay/room coordinate/save changes.

DEPLOY: Extract at the root of your EXISTING GitHub V2 repository. MERGE/OVERWRITE matching files under public/ and test/. Do not delete unrelated files, especially Q1/Q2 art, src/ or the Wrangler config. Commit and push. Confirm the successful Cloudflare deployment belongs to the V2 Worker. Hard-refresh Ctrl+Shift+R. No game-state reset is required. If using GitHub's web file upload, preserve nested `public/assets/premium-giantwood/` paths.

VERIFY: (1) In a new tab open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/assets/premium-giantwood/trampled-trail-ground-q3r5.jpg` and check that a painted forest image loads (not a 404, login page or HTML). (2) Open the Q3 Trampled Trail room and refresh. (3) In Settings check that the art control says Quest 3 giant forest premium: ON. (4) Check Hollow Tree and Elder Grove boss. If asset URL works but screen remains procedural, check that Scene Art is ON in Settings; leave save data intact.

The package has offline tests, but the live authenticated deployment is not accessible to this assistant. A failed art URL remains a diagnostic clue, not proof of the root cause. This release is a *recovery candidate pending live playtest*, not visual sign-off for Quest 3.
