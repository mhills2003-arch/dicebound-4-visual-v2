> Historical release notes. For the current build and room-test menu, see [START_HERE_Q5_COMPLETE.md](START_HERE_Q5_COMPLETE.md).

# DICEBOUND V2 · Caravan Gate

## Deploy and play

1. Extract this ZIP into your existing DICEBOUND V2 repository. Merge the contents at the repository root, alongside `wrangler.toml`, and replace matching files.
2. Commit and push to the branch connected to the Cloudflare Worker `dicebound-4-visual-v2`. Wait for its deployment to finish.
3. Open the V2 game and sign in with your usual player code. In the top-right settings menu (⚙), select **🏜 Try 5-1 · separate test save**.
4. Look for **Separate test · Quest 5** and **Caravan Gate** above the board. The trial gives each player a level 6 Knight with a Rare sword, Rare armour and three healing potions. **⚙ → Return to campaign save** takes you back.

If the menu still shows the previous build, hard-refresh the V2 game. The V2 Worker endpoint `/dicebound-v2/version` reports the release identifier `v2-quest1-soft-edges-q5-caravan-r1`.

## Room 5-1

The sandstone gate piers split the western approach. The shortest crossing bends around the central well, which also blocks a shot straight across the centre. The stall and laden camel narrow the approaches on the far side. The upper and lower routes let players approach the guards from a different angle.

The board measures 13 × 9. Seven scenery pieces occupy 32 of 117 squares (27.4%). All 85 open squares connect. A fresh encounter has seven foes, including two Swift dice. The scenery and collision map share the same coordinates. The gear and world supplied by the separate trial let you enter immediately with campaign progress held in its own save.

## Quest 1

All three woodland rooms now draw rocks, stumps and ruins without the extra outline around blocked squares. The faint board grid remains available for counting moves.
