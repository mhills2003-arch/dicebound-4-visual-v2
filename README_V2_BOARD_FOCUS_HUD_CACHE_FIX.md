# DICEBOUND V2 Board Focus — Cache and layout fix (2026-11-02)

## Symptom
Board Focus displayed ON, but both sidebars and the large class-selection panel were still visible. The HTML/JS controls had updated without the effective Board Focus layout CSS. This ZIP forces browser refresh of the stylesheet and script, and embeds minimal critical layout CSS in index.html as a fallback.

## Installation
Extract and copy `public/index.html`, `public/styles.css`, `public/app.js` and `test/v2-board-focus-hud.test.mjs` to the corresponding paths in the **V2 GitHub repository only**. Do not touch V1 or the author site. Wait for a successful Cloudflare build, then reload V2. No secret, route or Worker settings need changing.

## Confirm
- The V2 build description now ends with `BOARD FOCUS HUD FIX B`.
- Board Focus ON means sidebars hidden and room expands to full-width. OFF restores the classic dashboard.
- `Panels` opens drawers; `Choose class` is available there to players without a chosen class rather than dominating the in-room view.
- If still seeing both sidebars, open DevTools > Network and look for 200 responses from `styles.css?build=v2-boardfocus-20261102b` and `app.js?build=v2-boardfocus-20261102b`.

No changes to server, room geometry, WebSocket or combat mechanics.
