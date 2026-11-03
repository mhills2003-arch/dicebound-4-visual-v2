# DICEBOUND V2 — Quest 3 R4b: Safe floor recovery & Hollow Tree repair

This is an incremental overlay for the **separate V2 repository**, not the original solo game.

**Purpose:** Remove the R2/R3 checkerboard floor regression using the five original, continuous Quest 3 floor illustrations from R1 (published under new, cache-safe names); restore R2's proven normal-obstacle rendering; show ONE uncropped, transparent whole-fallen-tree illustration over the actual Hollow Tree wall run; keep the exact approved R3 D12 boss art and its 1x1 mechanics and display scale.

**Steps:**
1. Back up the V2 repository and any game save before changing code.
2. Extract the ZIP **at the V2 repository root**, merging `public/` and `test/` directories. Do not upload the ZIP directly to Cloudflare Pages or to the author-site repository.
3. Commit and push. Verify Cloudflare's latest deployment says **Success**; an upload failure leaves old art live.
4. Open the V2 game, use Ctrl+Shift+R, and test Q3 Trampled Trail, Hollow Tree, Elder Grove. Do not reset your character for this visual patch.
5. Check the **real** Hollow Tree tree footprint and D12 boss, not only the preview sheet.

**What remains untouched:** Engine, quest routing, wall coordinate masks, door positions, hitboxes, enemies, loot, player progression, Q1, Q2 and main production Worker.

**Scope/quality:** This patch is a *conservative fix*, not an implementation of the more elaborate Image 2 concept montage. That montage is visual direction only. Large D8 uses the existing sprite rather than a newly generated untested one. No claim of live browser QA is made.

**Files added:** Five new cache-safe `*-ground-q3r4.jpg` assets, and `whole-fallen-tree-q3r4.png`. R3 boss PNG is included byte-for-byte. Includes the tested current `public/app.js`, `public/index.html`, `public/v2-premium-giantwood.mjs`, and the focused Q3 test.
