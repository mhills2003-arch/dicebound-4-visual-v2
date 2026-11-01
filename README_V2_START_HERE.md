# DICEBOUND 4.0 V2 — ISOLATED VISUAL-DEV FORK

**Status: SOURCE PACKAGE PREPARED. NOT DEPLOYED. NO ART OVERHAUL YET.**

This is a self-contained copy of the **latest source ZIP available in this conversation**:
`DICEBOUND4_FOUR_CLASS_BENEFITS_MULTIPLAYER_GITHUB_UPDATE.zip`.
It contains all current quest, maze, class-perk, combat and test files from that ZIP, plus the original official bundled image assets that the patch ZIP omitted.

**IMPORTANT:** We have not checked the live Cloudflare Worker commit or its live account/database. Do not claim this is an exact bit-for-bit copy of your live beta until that is verified. If the deployed V1 differs, sync its approved source INTO THIS V2 REPO ONLY before visual edits.

## What is isolated

- Worker: `sonny-dicebound-visual-v2` (new, not `sonny-dicebound-lab`).
- URL path: `/dicebound-v2/` on the NEW Worker's `workers.dev` subdomain, no custom domain routes.
- Cookie: `db4_v2_session`, scoped to `/dicebound-v2`.
- Durable Object binding: `V2_GAME_ROOM`, new SQLite namespace on first deploy. It cannot see V1 account/adventure state.
- Invite tokens and cookie secret: NOT INCLUDED. Set new secrets for V2 separately.
- Asset gating: `run_worker_first = true` enforces authentication before serving the V2 HTML, scripts and images.

## Browser-only deployment (requires user access)

1. **Do NOT upload this ZIP to your existing `dicebound-4` repository.** Create a NEW private GitHub repository: `dicebound-4-visual-v2`.
2. Unzip this package. Upload all extracted root files/folders (`wrangler.toml`, `src/`, `public/`, `test/`, `package.json`, etc.) to the NEW repo. Do not upload the ZIP itself.
3. In Cloudflare go to **Workers & Pages → Create application → GitHub**, choose the NEW repo and branch `main`.
   Set Worker name exactly `sonny-dicebound-visual-v2` (NEVER `sonny-dicebound-lab`, `sonny-dicebound`, or `sonny-lanning`).
   Set root directory to repository root (`/` or blank), **Build command = empty** (optional: `npm run build` after using this corrected package), **Deploy command = `npx wrangler deploy`**, and preview command to its default.
   Do NOT choose a Cloudflare Pages / static site template. This project needs a Worker with a Durable Object.
4. Confirm the Worker has **no custom domain route** and Workers.dev is enabled. This package intentionally does NOT have a route for `sonnylanning.com`. The `wrangler.toml` file at repo root creates an independent SQLite-backed `GameRoom` Durable Object namespace; do not manually attach the original beta's binding.
5. Add **three NEW Cloudflare Secrets** to the V2 Worker: `INVITE_TOKEN_1`, `INVITE_TOKEN_2`, `COOKIE_SECRET`; use strong new random values, not V1’s tokens. Do not put them in GitHub or in this ZIP.
6. Confirm a successful build, then open the NEW Worker's workers.dev link with `/dicebound-v2/` appended, and sign in with V2 credentials.
7. Play one simple room on two test browsers; verify V1 and V2 characters/adventures are distinct and that V1 is still working.

## Before a new visual slice

- Capture/record the current successful V1 commit SHA and deployment ID (Cloudflare > Deployments).
- Check whether that commit matches the supplied 4-class source ZIP; if not, reconcile from V1 to V2, without overwriting V1.
- Select Smuggler's Station (`q5r7`) as the FIRST rendering-only art test room.
- Do not edit `src/engine.mjs`, `src/maze-play.mjs`, combat outcomes, movement or loot for aesthetic work.
- Treat props as visual decorations only unless they correspond to existing authoritative obstacles.
- Visual testing on desktop and tablet; confirm grid, walls, paths, target buttons, unit markers and danger tiles match server state.

## Reversion

V2 is a separate Worker and repository. You can simply stop using or delete it; V1 remains untouched. For later V2 changes, GitHub revert or Cloudflare rollback can restore V2 code, but not necessarily persisted V2 data. No rollback should ever be required on V1 for a V2 visual experiment.

## Diagnosing failed Cloudflare builds

Go to **Workers & Pages → sonny-dicebound-visual-v2 → Settings → Build** and check:

- Connected repository: `dicebound-4-visual-v2` and branch `main`.
- Root directory: `/` or blank, with `wrangler.toml` and `package.json` visible at GitHub repo root.
- Worker name: `sonny-dicebound-visual-v2` (must exactly match `wrangler.toml`).
- Build command: **leave empty**. If your interface insists on one, use `npm run build` with this corrected package.
- Deploy command: `npx wrangler deploy` (not `npm run build`, and not the `wrangler pages` command).

If Cloudflare says `Missing script: build`, you are using the earlier package and should update `package.json` from this corrected ZIP, or clear the optional Build command.
If Cloudflare says worker name mismatch, rename the NEW Worker or update only V2 settings to match `sonny-dicebound-visual-v2`.
If it says no `wrangler.toml` or `package.json`, ensure these files are at the repository root, not inside a nested folder.
If it says that a Durable Object namespace/class is missing, replace V2's `wrangler.toml` from this package; do not reuse any existing V1 binding.
If the build succeeds but the websocket fails, make sure `src/worker.mjs` is the corrected one: it uses `env.V2_GAME_ROOM` for both `get` and `idFromName`.

Secrets are *runtime* secrets, added under the new Worker's Settings → Variables and Secrets, not under Build variables, and not in GitHub. Use independent random values of at least 24 characters for `INVITE_TOKEN_1` and `INVITE_TOKEN_2`, and 32 characters for `COOKIE_SECRET`. Revisit the login after saving them.
