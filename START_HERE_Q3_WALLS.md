# DICEBOUND V2 — Quest 3 walls R1

Build: `v2-q3-walls-20261114-r1`

This is a complete deployment package based on `DICEBOUND_V2_Q2_POLISH_R2_DEPLOY.zip`. It includes the previous Quest 2 and Quest 5 work.

## What changes

The five Quest 3 rooms use continuous moss-covered stone formations for straight sections, corners and the stepped wall. Each joined formation is drawn once, without the old overlapping tile caps and bridge sprites. Hollow Tree has a connected root-and-rock bank under its existing fallen tree.

Six new transparent WebP sprites add approximately 0.91 MB before ZIP compression. Original artwork is retained, including the accepted fallen tree and boss. Individual missing wall assets fall back independently.

## What stays the same

Wall coordinates and counts, tactical routes, large-enemy clearance, room layouts, floors, side scenery, lighting, enemies, combat, rewards and saves are unchanged. The engine and original artwork files are byte-identical to the previous release. No new save is needed.

| Room | Blocked squares | Wall review |
| --- | ---: | --- |
| 3-1 Trampled Trail | 8 | Joined L corner and continuous horizontal wall |
| 3-2 Giant’s Clearing | 10 | Continuous stepped wall, vertical wall and horizontal runs |
| 3-3 Root Maze | 10 | Joined upper corner, vertical wall and longer horizontal run |
| 3-4 Hollow Tree | 13 | Root-and-rock bank, existing whole fallen tree and horizontal wall |
| 3-5 Elder Grove | 11 | Joined upper corner, vertical walls and horizontal runs |

## Deploy

Use the same `dicebound-4-visual-v2` repository and Cloudflare Worker as the previous release. Extract the complete package into the repository and commit/push using the existing deployment workflow, or run the existing `npm run deploy` command from an authenticated Cloudflare development environment. Keep the current Worker bindings and invitation secrets. `wrangler.toml` is unchanged.

After deployment, `/dicebound-v2/version` should show `v2-q3-walls-20261114-r1`, `cinematicAssetsReady: true`, and 26 successful asset checks. The existing game URL and player codes remain applicable. Refresh the game to load the new version.

This package has been checked locally; it has not been published to the live Worker by this task.

## Validation and artwork

Run `npm test`. The full suite checks navigation, large-creature routes, formation coverage, missing-asset fallback and deployment fingerprints. The five rooms were also reviewed in the actual game renderer with a local adapter using the unchanged engine; a wall collision and an adjacent open route were tested through normal controls.

See `design/quest3/wall-validation.json` for the preservation audit and `design/quest3/wall-art-prompts.json` for the six artwork briefs. The built-in image generator produced the sprites; original alpha was preserved during cropping, downsampling and WebP encoding. The review adapter is excluded from this deployment ZIP.
