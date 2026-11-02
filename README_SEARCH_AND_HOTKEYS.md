# V2 Cinematic HUD — Search and Hotkeys

**Baseline:** the restored and user-approved `DICEBOUND_V2_COMPLETE_CINEMATIC_RESTORE_20261102` package. **Do not apply previous combat-log work:** the current combat/adventure log stays in the Settings menu exactly as approved.

## What's changed
- Search moves the existing four treasure-claim buttons into a compact collapsible panel on the **left woodland margin**; no change to their server validation, already-searched rules, reward calculations, or claimed flags. The original panel returns when Classic HUD is selected. Search is hidden at camp; the panel explains why searching is disabled when enemies remain.
- The log and chat remain untouched on their existing UI paths.
- Hotkeys use the *actual existing UI buttons*: **R** Roll, **E** End Turn, **A** Attack, **I** Inventory, **F** Fortify (existing defend action), **C** Camp, **P** Items/potions menu, **S** Special, **L** Adventure Log, **Q** Quests.
- The gear/settings menu provides a **Keyboard shortcuts** help panel.
- Keyboard shortcuts are ignored while composing Chat, using any text field, holding Ctrl/Alt/Meta, or when a modal/inventory panel is open. Holding a key never queues repeat combat actions. Disabled buttons stay disabled.
- Arrow keys continue movement; W/D can still move north/east. A/S are now Attack/Special, R is no longer Revive, and L is no longer lantern. Revive and lantern actions are still available under **Items**.

## Install safely
Upload only `public/index.html`, `public/app.js`, and `public/styles.css` to the **currently working V2 GitHub repository**, preserving paths. You may also add the regression test file. Do not upload `src/`, `wrangler.toml`, or old repair archives. Confirm a green Cloudflare deployment for the specific commit before testing.

## Acceptance checks
1. Verify the cinematic full-screen board remains the same size.
2. In Quest 1 1-2, open the left Search panel. While enemies are active, the original four buttons should be disabled; after the room is cleared, each can be used only once. Close Search and make sure Chat remains usable on the right.
3. Test R, E, A, I, F, C, P, S, L, Q; mouse/button restrictions must still apply. Click the Settings gear and open Keyboard shortcuts to see the cheat sheet.
4. Type `r e a s c l f` or any keyboard shortcut letters into the chat input and verify they are typed only as text, triggering no game actions. (The test phrase is arbitrary.)
5. Switch to Classic HUD and confirm the loot search buttons reappear in the original right panel.
