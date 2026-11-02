# DICEBOUND 4.0 V2 — Board Focus HUD pilot (2026-11-02)

This is a **V2 visual/UI-only patch**, built on the Quest 1-2 Training Clearing premium scenery/actors build. It leaves the V1 multiplayer Worker, original solo `/dicebound/`, author website, and all V2 server/engine files unchanged.

## Install

Extract the ZIP and copy the three files under `public/` to the **existing V2 GitHub repository** retaining their paths. The `test/` file is a regression test for projects running the Node test suite. Do **not** upload the ZIP directly to Cloudflare or upload these files to V1. Wait for the V2 Cloudflare build to succeed.

Open: https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/

## New interface

- **Board Focus: ON** is the default. The tactical room is full-width with a compact status bar and action row, rather than a 3-column dashboard. The same canvas and server-driven map data remain in place.
- **Board Focus: OFF** restores the previous full three-column HUD. Preference is stored on this device only, under `db4_v2_board_focus`.
- **Log** opens and closes the existing adventure log as a right-hand drawer. The supervised **Chat** retains its existing floating collapsed/expanded drawer, unchanged.
- **Panels** provides optional drawers for Party/Map, Encounter/Loot/Supplies, Inventory, Camp Merchant (only while at camp), and quest Victory Rewards (when available).
- The **Camp / Shop** button opens the merchant as an overlay once the player is already at camp. If not at camp, it retains the normal server-controlled return-to-camp action (which cannot be used during active encounters).
- **Visuals** groups existing premium-art and lighting comparisons into a compact popover.
- Core Roll, Attack, Defend, Heal, Special and **End Turn** buttons remain outside drawers. Movement arrows remain accessible below the board; on smaller screens scrolling may still be necessary.

## Verification performed

- Node test suite: **332 / 332** passing (includes three new HUD tests).
- Chromium 1440×900 desktop, 1024×768 tablet and 430×850 narrow-screen layout previews produced no JavaScript page errors. On desktop the room canvas is 1416 px wide in Focus mode. The layout previews substitute a local illustration for authenticated gameplay; they are **not live session screenshots**.
- Real popup control logic taken from `public/app.js` verified in Chromium: Log, Shop, Inventory open and close; backdrop closes them; classic HUD is restored by toggle.
- No Cloudflare deployment, cross-device session, multiplayer action, or real hardware tablet test has been performed.

## Known constraint

This is a reversible layout **pilot**. It has not been validated for all 15 quests and every advanced action (notably Endgame Maze) in an authenticated session. Test in V2 first, before considering any rollout to V1.
