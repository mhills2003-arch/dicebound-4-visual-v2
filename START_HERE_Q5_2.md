> Historical release notes. For the current build and room-test menu, see [START_HERE_Q5_COMPLETE.md](START_HERE_Q5_COMPLETE.md).

# DICEBOUND V2 · Rushing Dunes

## Deploy and play

1. Extract the ZIP into the root of your existing DICEBOUND V2 repository, alongside `wrangler.toml`. Merge the extracted contents and replace matching files.
2. Commit and push to the branch connected to the Cloudflare Worker `dicebound-4-visual-v2`. Wait for the deployment to finish.
3. For campaign play, clear Caravan Gate and take the east exit into Rushing Dunes.
4. For an immediate playtest, sign in and choose **⚙ → 🏜 Try 5-2 · separate test save**. This starts a dedicated room 5-2 world with a level 6 Knight, Rare equipment and three potions. Use **⚙ → Return to campaign save** to switch back.

The Worker reports the release identifier `v2-q5-rushing-dunes-20261106-r1` at `/dicebound-v2/version`.

## Quest 5 map decisions

- Use the playtested Caravan Gate layout for room 5-1.
- Rushing Dunes uses panel 02 of the approved map sheets. Eight banks occupy 31 of 117 squares. The three Swift D6s start at D5, D9 and F7. The ordinary D8s start at B6 and C12, and the ordinary D6s at F10 and H12.
- The release implements room 5-2. The two original reference sheets in `design/quest5/` carry the approved designs for rooms 5-2 through 5-8 into subsequent builds.
- A trial or campaign encounter already in progress retains its enemies and damage. A fresh encounter in Rushing Dunes uses the seven placements above.

The map uses rows A–I and columns 1–13, as on the design sheets. The server and renderer both read the same layout. Terrain, enemy artwork, selection, labels and health bars are separate layers.
