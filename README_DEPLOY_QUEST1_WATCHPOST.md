# DICEBOUND 4.0 V2 — Quest 1 Old Watchpost Premium Finale

**Scope:** V2 only. Quest 1, Room 1-3 (Old Watchpost). Based on the currently approved cinematic/search-and-hotkeys V2.

What changed:
- Painted Old Watchpost forest ruin, distinct from Woodland Path and Training Clearing.
- Mossy broken masonry obstacles exactly on existing server blocked squares.
- Larger in-world Boss D8 guardian; HP, names, targeting still drawn live.
- Same premium sunlight, foreground vegetation and animated environment treatment.
- Cache-busting frontend version strings to prevent old browser modules being reused.
- Room-specific regression tests. **No modifications to `src/`, `wrangler.toml`, secrets, Durable Objects, game rules, or other quests.**

Deployment:
1. **Commit or tag the currently working V2 version first.** Do not change V1.
2. Extract this ZIP into the matching V2 GitHub repository root, retaining the `public/` and `test/` folder structure. Commit.
3. Check Cloudflare reports a successful build; if the deploy was skipped or failed, do not assume this patch is live.
4. Visit `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/`, enter Quest 1 → Old Watchpost (Room 1-3), switch to Tactical view with premium art enabled.
5. Check the small V2 version subtitle for **QUEST 1 COMPLETE**. Don't confuse with the previous MEDIUM MAZES lab.

Verification: 360/360 Node tests passed; actual Canvas drawing functions rendered in Chromium at 1676x946, 1024x768 and 430x850 without JavaScript errors. These are **representative local renderer tests**, not authenticated multiplayer sessions.

V1 difficulty-tier unlocks are a **separate backlog item** and are not included.
