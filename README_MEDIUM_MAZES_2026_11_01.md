# DICEBOUND 4.0 — Larger, Tougher, Maze-Like Medium Rooms

**Build:** MEDIUM MAZE ROOMS · 13×9 · 5–8 TOUGHER FOES · 1 NOV 2026

This is a **complete GitHub source update** for the existing PRIVATE DICEBOUND 4.0 co-operative testing Worker. It builds on the previous Quest 5–7 source package (enemy roles, chat emojis and single-use potions). It is not a live Cloudflare deployment and not a production/child-ready release.

## What changed

- All 24 rooms in Quests **5, 6 and 7** now use **13 columns × 9 rows** instead of the original 9 × 7. Quest 1–4 geometry remains unchanged.
- Every Medium room has two offset **internal wall partitions** and side alcoves. To reach the opposite door you must go around real walls; the shortest door-to-door walk is 20 tiles instead of the unobstructed 12. Walls are server-side obstacles, block player movement and ranged attacks, and are drawn in both tactical and illustrated views.
- **Ghosts ignore solid walls when moving** and can temporarily occupy wall tiles; ordinary enemies use the corridors. Persisted ghosts mid-phase remain valid after reconnection.
- The **2×2 footprint** remains able to traverse the winding passages, and every ordinary floor tile and both doorways remain accessible. Short cover pieces are rejected during room construction if they disconnect a floor or block 2×2 traversal.
- Quests 5–7 include **5–8 actual enemies per room** with stronger attack and defence dice, while preserving the original roles, boss sequences and named rooms.
- Player inventory, gold, XP, quest unlocks, room bookmarks, team turns and snapshots remain unchanged. A reconnect repositions characters who happen to be on newly blocked tiles, instead of wiping their progress.
- Browser build label, help text and enemy target cards reflect the new maps and visible dice stats.

## Tests

- **158 automated Node test cases passed** on the attached package, including the new maze-route, connectivity, ghost wall-phasing and 2×2 footprint tests.
- The browser client was checked using a mocked saved co-op state on desktop (1380×850), tablet (820×1120) and mobile (390×844), with no page-script errors. This is not a substitute for testing on Cloudflare.
- Important: specialist behaviours and difficulty are still **trial balance**. Enemy density and defence may be challenging, especially without upgraded gear. Test with adult players first. The full game has 15 quests, but only Quests 1–7 have playable multiplayer encounters so far. Parental controls for child access are incomplete.

## Update existing GitHub beta (do NOT change live solo DICEBOUND)

Repository: `mhills2003-arch/dicebound-4`.

1. Unzip this package on your computer. At the **repository root**, replace the provided files inside the existing `public/`, `src/`, and `test/` directories. Upload individual files into their matching GitHub directory, **not** an extra nested `public/public`, `src/src` or `test/test` folder.
2. You can skip uploading the README to GitHub. The ZIP does **not** contain private invitation codes, secrets, `wrangler.toml`, or Cloudflare routes. **Do not replace or change those settings**.
3. Wait for the already-configured private beta Worker GitHub deployment to finish. Check that the displayed build badge says `MEDIUM MAZE ROOMS · 13×9 · 5–8 TOUGHER FOES · 1 NOV 2026` (hard-refresh if needed).
4. Use the **existing private test addresses**, not the main `https://sonnylanning.com/dicebound/` solo game. Prior beta test routes were `https://sonny-dicebound-lab.m-hills2003.workers.dev/dicebound-beta/` and `https://sonny-dicebound-lab.m-hills2003.workers.dev/dicebound-beta/?trial=balance-v9`. Availability of the live Worker was **not checked** during this build.
5. Prefer a fresh beta trial for balance comparison. In an older saved adventure, if a character stood where a new interior wall is now located, its position is safely relocated on reconnection. Quest progress and equipment stay intact.

## Suggested live checks

- Quest 5: advance to the opposite door by **detouring around internal walls**. Ranged enemies should be unable to shoot through cover; normal and Swift opponents should navigate the gaps.
- Quest 6: watch a Ghost move through a stone partition while a Zombie or ordinary foe has to walk around it. A Teleporter should blink no more than four tiles.
- Quest 7: check Cloner/Healer/Ninja behaviours with eight enemies in a winding map, while both co-op players move and act in global turn order.
- Check both tactical and illustrated views on a tablet; test movement buttons and tapping a foe. Refresh/reconnect and verify quest progress persists.

**Existing Sonny Lanning author website and DICEBOUND solo `/dicebound/` are outside the scope of this package.**
