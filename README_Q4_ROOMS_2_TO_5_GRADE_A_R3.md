# DICEBOUND V2 — Quest 4 Rooms 2–5: premium illustrated battlefields (R3)

This repository snapshot includes **all** files needed for V2 GitHub/Cloudflare Wrangler deployment. It is based on the successful Grade A **Quarry Entrance 4-1** package and does **not** modify or deploy the Sonny Lanning author site. It includes the previous Rooms 1–3 visuals and unchanged combat, equipment, quest definitions, actors, and HUD.

## Updated rooms
- 4-2 Golden Passage — amber-gold passage and sculpted block formations
- 4-3 Crystal Pit — glowing amethyst quarry and a deep central chasm
- 4-4 Abandoned Workings — timber scaffolds, rail track, winding gear and ore carts
- 4-5 King’s Excavation — ceremonial quarry arena with gold crystals and royal banners

Each room now uses one complete 1152×896 high-resolution illustration for **ground, fixed rockwork, cast shadows and lighting**, rendered below the existing LIVE player/enemies/HP/control UI. No characters or UI are baked in. The original layered graphics remain available as fallback if an image fails or a live wall layout does not match.

## IMPORTANT terrain update
The server collision maps for **4-2, 4-3, 4-4 and 4-5** have been reauthored to better reflect the denser illustrated terrain. This changes movement routes, though doors remain connected. They are artistic approximations: some perimeter scenery, upper platforms and rails are decorative. For best results, **restart Quest 4 at the beginning** if an old saved position becomes blocked by the new terrain. Quest 4 encounters (including Large D4, Large Shiny D4 and two-stage D12 boss), combat, loot and character stats are unchanged. The Quest 4-1 map and asset are unchanged.

## How to use
1. Back up your separate V2 GitHub repository first. Unzip into that repo, replacing matching files but do NOT delete files unique to your repo.
2. Commit and push to the branch connected to the independent `dicebound-4-visual-v2` Cloudflare Worker.
3. Wait for Cloudflare deployment Success, then open `https://dicebound-4-visual-v2.m-hills2003.workers.dev/dicebound-v2/` and hard refresh (Ctrl+F5).
4. Check all four scenes **in-game** for visual style, wall collision, large-enemy motion, portal exits and the final boss's second wave.

## Caveat
Automated tests validate mechanics/layout and asset integration, not visual perfection. This is a **playable best-effort visual review build**; no claim is made that it was tested in a signed-in live Cloudflare play session. The paintings were cropped to the actual 9×7 board aspect ratio, and some peripheral scenery has been removed to avoid stretched rocks or squeezed characters. Do not deploy to `sonny-lanning` or `/dicebound/` main Worker.
